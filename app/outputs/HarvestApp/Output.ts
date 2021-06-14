import { OutputBase } from '../../outputs/OutputBase';
import { HarvestClient } from '../../services/HarvestClient/HarvestClient';
import { FormatterBase } from '../../formatters/FormatterBase';
import { AppConfiguration, WorklogSet, Worklog } from '../../models';
import { HarvestProjectAndTasks, HarvestTask } from '../../services/HarvestClient';
import { IHarvestAppOutputConfiguration } from './IHarvestAppOutputConfiguration';
import { HarvestTimeEntry } from '.';

import tz from 'moment-timezone';
import { getLogger } from 'log4js';

export class HarvestAppOutput extends OutputBase {
    private logger = getLogger('HarvestApp/Output');
    private _harvestClient: HarvestClient;
    private _configuration: IHarvestAppOutputConfiguration;

    constructor(formatter: FormatterBase, outputConfiguration: IHarvestAppOutputConfiguration, appConfiguration: AppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);

        this._harvestClient = new HarvestClient(outputConfiguration);
        this._configuration = outputConfiguration;
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const projects = await this._harvestClient.getProjectsAndTasks();
        return await this._saveWorklogs(worklogSet.worklogs, projects);
    }

    async _saveWorklogs(worklogs: Worklog[], projects: HarvestProjectAndTasks[]): Promise<void> {
        const timeEntries = this._mapWorklogsToTimeEntries(worklogs, projects);

        const saveNewTimeEntryFn = this._harvestClient.saveNewTimeEntry.bind(this._harvestClient);
        const savingPromises = timeEntries.map(saveNewTimeEntryFn);

        return await Promise.all(savingPromises).then(p => {
            const lengthText = `${p.length}` + (timeEntries.length != worklogs.length ? ` (out of ${worklogs.length})` : '');
            this.logger.info(`Sent ${lengthText} time entries to Harvest.`);
        });
    }

    _mapWorklogsToTimeEntries(worklogs: Worklog[], projects: HarvestProjectAndTasks[]): HarvestTimeEntry[] {
        return worklogs.map(w => {
            const project = this._getProjectForWorklog(w, projects);
            if (!project) return null;

            const task = this._getTaskForWorklog(w, project);
            if (!task) return null;

            return this._getTimeEntryFromWorklogTaskAndProject(w, project, task);
        }).filter(w => !!w);
    }

    _getTimeEntryFromWorklogTaskAndProject(worklog: Worklog, project: HarvestProjectAndTasks, task: HarvestTask): HarvestTimeEntry {
        const timeZone = this._appConfiguration.options.timeZone;

        const timeEntry: HarvestTimeEntry = {
            project_id: project.projectId,
            task_id: task.taskId,
            spent_date: tz(worklog.startDateTime, timeZone).format('YYYY-MM-DD'),
            started_time: tz(worklog.startDateTime, timeZone).format('hh:mma'),
            ended_time: tz(worklog.endDateTime, timeZone).format('hh:mma'),
            hours: worklog.getDurationInMinutes() / 60,
            notes: worklog.name,
            is_running: false
        };

        return timeEntry;
    }

    _getProjectForWorklog(worklog: Worklog, projects: HarvestProjectAndTasks[]): HarvestProjectAndTasks {
        const projectTag = this._configuration.selectProjectFromTag || 'HarvestProject';
        const projectTagValue = worklog.getTagValue(projectTag);
        const project = projects.find(p => p.projectName == projectTagValue);

        if (!project)
            this.logger.warn(`Harvest project "${projectTagValue}" not found (processing worklog ${worklog.toOneLinerString()}.`);

        return project;
    }

    _getTaskForWorklog(worklog: Worklog, project: HarvestProjectAndTasks): HarvestTask {
        const taskTag = this._configuration.selectTaskFromTag || 'HarvestTask';
        const taskTagValue = worklog.getTagValue(taskTag);
        const task = project.tasks.find(t => t.taskName == taskTagValue);

        if (!task)
            this.logger.warn(`Harvest task "${taskTagValue}" not found.`);

        return task;
    }
}
