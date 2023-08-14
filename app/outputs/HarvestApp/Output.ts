import { OutputBase } from '../../outputs/OutputBase';
import { HarvestClient } from '../../services/HarvestClient/HarvestClient';
import { OutputBase } from '../../outputs/OutputBase';
import { HarvestClient } from '../../services/HarvestClient/HarvestClient';
import { FormatterBase } from '../../formatters/FormatterBase';
import { IAppConfiguration, WorklogSet, Worklog } from '../../models';
import { HarvestProjectAndTasks, HarvestTask } from '../../services/HarvestClient';
import { IHarvestAppOutputConfiguration } from './IHarvestAppOutputConfiguration';
import { HarvestTimeEntry } from '.';

import * as moment from 'moment-timezone';
import { getLogger, LoggerCategory } from '../../services/Logger';

export class HarvestAppOutput extends OutputBase {
    private logger = getLogger(LoggerCategory.Outputs);
    private harvestClient: HarvestClient;
    private configuration: IHarvestAppOutputConfiguration;
    private name: string;

    constructor(formatter: FormatterBase, outputConfiguration: IHarvestAppOutputConfiguration, appConfiguration: IAppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);

        this.harvestClient = new HarvestClient(outputConfiguration);
        this.configuration = outputConfiguration;
        this.name = outputConfiguration.name;
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const projects = await this.harvestClient.getProjectsAndTasks();
        return await this.saveWorklogs(worklogSet.worklogs, projects);
    }

    private async saveWorklogs(worklogs: Worklog[], projects: HarvestProjectAndTasks[]): Promise<void> {
        const timeEntries = this.mapWorklogsToTimeEntries(worklogs, projects);

        const savingPromises = timeEntries.map(timeEntry => {
            return this.harvestClient.saveNewTimeEntry(timeEntry);
        });

        return await Promise.all(savingPromises).then(p => {
            const countText = `${p.length}` + (timeEntries.length != worklogs.length ? ` (out of ${worklogs.length})` : '');
            this.logger.info(`Sent ${countText} time entries to Harvest.`);
        });
    }

    private mapWorklogsToTimeEntries(worklogs: Worklog[], projects: HarvestProjectAndTasks[]): HarvestTimeEntry[] {
        return worklogs.map(w => {
            const project = this.getProjectForWorklog(w, projects);
            if (!project) return null;

            const task = this.getTaskForWorklog(w, project);
            if (!task) return null;

            return this.getTimeEntryFromWorklogTaskAndProject(w, project, task);
        }).filter(w => !!w);
    }

    private getTimeEntryFromWorklogTaskAndProject(worklog: Worklog, project: HarvestProjectAndTasks, task: HarvestTask): HarvestTimeEntry {
        const timeZone = this._appConfiguration.options.timeZone;

        const timeEntry: HarvestTimeEntry = {
            project_id: project.projectId,
            task_id: task.taskId,
            spent_date: moment.tz(worklog.startDateTime, timeZone).format('YYYY-MM-DD'),
            started_time: moment.tz(worklog.startDateTime, timeZone).format('hh:mma'),
            ended_time: moment.tz(worklog.endDateTime, timeZone).format('hh:mma'),
            hours: worklog.getDurationInMinutes() / 60,
            notes: worklog.name,
            is_running: false,
            client: null,
            project: null,
            task: null
        };

        return timeEntry;
    }

    private getProjectForWorklog(worklog: Worklog, projects: HarvestProjectAndTasks[]): HarvestProjectAndTasks {
        const projectTag = this.configuration.selectProjectFromTag || 'HarvestProject';
        const projectTagValue = worklog.getTagValue(projectTag);
        const project = projects.find(p => p.projectName == projectTagValue);

        if (!project)
            this.logger.warn(`Harvest project "${projectTagValue}" not found (processing worklog ${worklog.toOneLinerString()}.`);

        return project;
    }

    private getTaskForWorklog(worklog: Worklog, project: HarvestProjectAndTasks): HarvestTask {
        const taskTag = this.configuration.selectTaskFromTag || 'HarvestTask';
        const taskTagValue = worklog.getTagValue(taskTag);
        const task = project.tasks.find(t => t.taskName == taskTagValue);

        if (!task)
            this.logger.warn(`Harvest task "${taskTagValue}" not found.`);

        return task;
    }
}

export default HarvestAppOutput;