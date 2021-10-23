import { HarvestClient } from '../../services/HarvestClient/HarvestClient';
import { IAppConfiguration, Worklog, IServiceRegistrations, Tag } from '../../models';
import { HarvestInputConfiguration, HarvestTimeEntry } from '.';

import { tz } from 'moment-timezone';
import { getLogger } from 'log4js';

export class Input {
    private logger = getLogger('inputs/HarvestApp/Input');
    private harvestClient: HarvestClient;

    constructor(
        private serviceRegistrations: IServiceRegistrations,
        private appConfiguration: IAppConfiguration,
        private inputConfiguration: HarvestInputConfiguration
    ) {
        if (!appConfiguration)
            throw new Error('App configuration for Harvest App input is required.');

        if (!inputConfiguration)
            throw new Error('Input configuration for Harvest App input is required.');
        
        this.harvestClient = new HarvestClient(inputConfiguration);
    }

    get name(): string {
        return this.inputConfiguration.name;
    }

    async getWorkLogs(startDateTime: Date, endDateTime: Date): Promise<Worklog[]> {
        this.logger.info('Retrieving worklogs from Harvest between', startDateTime, 'and', endDateTime);

        const parameters = { from: startDateTime, to: endDateTime };
        const timeEntries = await this.harvestClient.getTimeEntries(parameters);

        return this.mapToDomainModel(timeEntries);
    }

    private mapToDomainModel(timeEntries: HarvestTimeEntry[]): Worklog[] {
        const mappedWorklogs = timeEntries.map(te => {
            const timeZone = this.appConfiguration.options.timeZone;

            let startTime, endTime;

            // Harvest has two types of company configuration:
            // 1. Timers enabled, in which case, time entries have a spent_date, a start and an end time
            // 2. Timers disabled, in which case, time entries have a spent_date and a duration (hours)
            if (te.spent_date && te.started_time && te.ended_time) {
                startTime = tz(`${te.spent_date} ${te.started_time}`, 'YYYY-MM-DD hh:mma', timeZone).toDate();
                endTime = tz(`${te.spent_date} ${te.ended_time}`, 'YYYY-MM-DD hh:mma', timeZone).toDate();
            } else if (te.spent_date && te.hours) {
                startTime = tz(te.spent_date, timeZone).toDate();
                endTime = tz(te.spent_date, timeZone).add(te.hours, 'hours').toDate();
            } else {
                this.logger.warn('Cannot detect worklog duration from time_entry', te);
                return null;
            }

            const worklog = new Worklog(te.notes, startTime, endTime);
            worklog.addTag(new Tag('HarvestClient', te.client.name));
            worklog.addTag(new Tag('HarvestProject', te.project.name));
            worklog.addTag(new Tag('HarvestTask', te.task.name));
            
            return worklog;
        })
            .filter(worklog => !!worklog);

        if (mappedWorklogs.length === timeEntries.length)
            this.logger.info(`Retrieved ${mappedWorklogs.length} worklogs from Harvest time entries.`);
        else 
            this.logger.warn(`Retrieved ${mappedWorklogs.length} worklogs from ${timeEntries.length} Harvest time entries.`);

        return mappedWorklogs;
    }
}