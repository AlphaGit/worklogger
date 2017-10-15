const OutputBase = require('outputs/OutputBase');
const RequiredHarvestClient = require('./HarvestClient');

module.exports = class HarvestAppOutput extends OutputBase {
    constructor(formatter, outputConfiguration, { HarvestClient = RequiredHarvestClient }) {
        super(formatter, outputConfiguration);

        this._harvestClient = new HarvestClient(outputConfiguration);
    }

    outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        return this._harvestClient.getProjectsAndTasks()
            .then(projects => this._saveWorklogs(worklogSet.worklogs, projects));
    }

    _saveWorklogs(worklogs, projects) {
        const projectTag = this._configuration.selectProjectFromTag || 'HarvestProject';
        const taskTag = this._configuration.selectTaskFromTag || 'HarvestTask';

        const timeEntries = worklogs.map(w => {
            const projectTagValue = w.getTagValue(projectTag);
            const project = projects.find(p => p.projectName == projectTagValue);
            if (!project) return null;

            const taskTagValue = w.getTagValue(taskTag);
            const task = project.tasks.find(t => t.taskName == taskTagValue);
            if (!task) return null;

            return {
                project_id: project.projectId,
                task_id: task.taskId,
                spent_date: w.startDateTime.toISOString().substring(0, 10),
                timer_started_at: w.startDateTime.toISOString(),
                hours: w.duration / 60
            };
        }).filter(w => !!w);

        const savingPromises = timeEntries.map(this._harvestClient.saveNewTimeEntry);

        return Promise.all(savingPromises);
    }
};