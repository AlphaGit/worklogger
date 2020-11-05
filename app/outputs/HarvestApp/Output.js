const OutputBase = require('app/outputs/OutputBase');
const RequiredHarvestClient = require('app/services/HarvestClient');
const logger = require('app/services/loggerFactory').getLogger('HarvestApp/Output');
const moment = require('moment-timezone');

module.exports = class HarvestAppOutput extends OutputBase {
    constructor(formatter, outputConfiguration, appConfiguration, { HarvestClient = RequiredHarvestClient } = {}) {
        super(formatter, outputConfiguration, appConfiguration);

        this._harvestClient = new HarvestClient(outputConfiguration);
    }

    async outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        const projects = await this._harvestClient.getProjectsAndTasks();
        return await this._saveWorklogs(worklogSet.worklogs, projects);
    }

    async _saveWorklogs(worklogs, projects) {
        const timeEntries = this._mapWorklogsToTimeEntries(worklogs, projects);

        const saveNewTimeEntryFn = this._harvestClient.saveNewTimeEntry.bind(this._harvestClient);
        const savingPromises = timeEntries.map(saveNewTimeEntryFn);

        return await Promise.all(savingPromises).then(p => {
            const lengthText = `${p.length}` + (timeEntries.length != worklogs.length ? ` (out of ${worklogs.length})` : '');
            logger.info(`Sent ${lengthText} time entries to Harvest.`);
        });
    }

    _mapWorklogsToTimeEntries(worklogs, projects) {
        return worklogs.map(w => {
            const project = this._getProjectForWorklog(w, projects);
            if (!project) return null;

            const task = this._getTaskForWorklog(w, project);
            if (!task) return null;

            return this._getTimeEntryFromWorklogTaskAndProject(w, project, task);
        }).filter(w => !!w);
    }

    _getTimeEntryFromWorklogTaskAndProject(worklog, project, task) {
        const timeZone = this._appConfiguration.options.timeZone;

        return {
            project_id: project.projectId,
            task_id: task.taskId,
            spent_date: moment(worklog.startDateTime, timeZone).format('YYYY-MM-DD'),
            started_time: moment(worklog.startDateTime, timeZone).format('hh:mma'),
            ended_time: moment(worklog.endDateTime, timeZone).format('hh:mma'),
            hours: worklog.duration / 60,
            notes: worklog.name,
            is_running: false
        };
    }

    _getProjectForWorklog(worklog, projects) {
        const projectTag = this._configuration.selectProjectFromTag || 'HarvestProject';
        const projectTagValue = worklog.getTagValue(projectTag);
        const project = projects.find(p => p.projectName == projectTagValue);

        if (!project)
            logger.warn(`Harvest project "${projectTagValue}" not found (processing worklog ${worklog.toOneLinerString()}.`);

        return project;
    }

    _getTaskForWorklog(worklog, project) {
        const taskTag = this._configuration.selectTaskFromTag || 'HarvestTask';
        const taskTagValue = worklog.getTagValue(taskTag);
        const task = project.tasks.find(t => t.taskName == taskTagValue);

        if (!task)
            logger.warn(`Harvest task "${taskTagValue}" not found.`);

        return task;
    }
};
