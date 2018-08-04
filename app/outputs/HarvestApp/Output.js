const OutputBase = require('app/outputs/OutputBase');
const RequiredHarvestClient = require('./HarvestClient');
const logger = require('app/services/loggerFactory').getLogger('HarvestApp/Output');
const moment = require('moment');

module.exports = class HarvestAppOutput extends OutputBase {
    constructor(formatter, outputConfiguration, { HarvestClient = RequiredHarvestClient } = {}) {
        super(formatter, outputConfiguration);

        this._harvestClient = new HarvestClient(outputConfiguration);
    }

    outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        return this._harvestClient.getProjectsAndTasks()
            .then(projects => this._saveWorklogs(worklogSet.worklogs, projects));
    }

    _saveWorklogs(worklogs, projects) {
        const timeEntries = this._mapWorklogsToTimeEntries(worklogs, projects);

        const saveNewTimeEntryFn = this._harvestClient.saveNewTimeEntry.bind(this._harvestClient);
        const savingPromises = timeEntries.map(saveNewTimeEntryFn);

        return Promise.all(savingPromises).then(p => {
            logger.info(`Sent ${p.length} time entries to Harvest.`);
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
        return {
            project_id: project.projectId,
            task_id: task.taskId,
            spent_date: moment(worklog.startDateTime).format('YYYY-MM-DD'),
            timer_started_at: moment(worklog.startDateTime).format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
            hours: worklog.duration / 60,
            notes: worklog.name
        };
    }

    _getProjectForWorklog(worklog, projects) {
        const projectTag = this._configuration.selectProjectFromTag || 'HarvestProject';
        const projectTagValue = worklog.getTagValue(projectTag);
        return projects.find(p => p.projectName == projectTagValue);
    }

    _getTaskForWorklog(worklog, project) {
        const taskTag = this._configuration.selectTaskFromTag || 'HarvestTask';
        const taskTagValue = worklog.getTagValue(taskTag);
        return project.tasks.find(t => t.taskName == taskTagValue);
    }
};
