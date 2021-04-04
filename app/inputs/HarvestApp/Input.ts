import LoggerFactory from '../../services/LoggerFactory';

const logger = LoggerFactory.getLogger('inputs/HarvestApp/Input');

import { calculateDurationInMinutes } from '../../services/durationCalculator';

import moment from 'moment-timezone';

import HarvestClient from '../../services/HarvestClient';

import { Worklog } from '../../models/Worklog';
import { AppConfiguration } from '../../models/AppConfiguration';
import { InputConfiguration } from '../../models/InputConfiguration';
import { ServiceRegistrations } from '../../models/ServiceRegistrations';
import { HarvestTimeEntry } from './TimeEntry';

export class Input {
    private _appConfiguration: AppConfiguration;
    private _inputConfiguration: InputConfiguration;
    private _harvestClient: HarvestClient;

    constructor(
        serviceRegistrations: ServiceRegistrations,
        appConfiguration: AppConfiguration,
        inputConfiguration: InputConfiguration,
        harvestClient: HarvestClient
    ) {
        if (!appConfiguration)
            throw new Error('App configuration for Harvest App input is required.');

        this._appConfiguration = appConfiguration;

        if (!inputConfiguration)
            throw new Error('Input configuration for Harvest App input is required.');
        this._inputConfiguration = inputConfiguration;
        
        this._harvestClient = harvestClient || new HarvestClient(inputConfiguration);
    }

    get name(): string {
        return this._inputConfiguration.name;
    }

    async getWorkLogs(startDateTime: Date, endDateTime: Date): Promise<Worklog[]> {
        logger.info('Retrieving worklogs from Harvest between', startDateTime, 'and', endDateTime);

        const parameters = { from: startDateTime, to: endDateTime };
        const timeEntries = await this._harvestClient.getTimeEntries(parameters);

        return this._mapToDomainModel(timeEntries);
    }

    _mapToDomainModel(timeEntries: HarvestTimeEntry[]): Worklog[] {
        const minimumLoggableTimeSlotInMinutes = this._appConfiguration.options.minimumLoggableTimeSlotInMinutes;

        const mappedWorklogs = timeEntries.map(te => {
            const canGetTimeFromStartAndEnd = te.spent_date && te.started_time && te.ended_time;
            const canGetTimeFromHours = !!te.hours;

            if (!canGetTimeFromStartAndEnd && !canGetTimeFromHours) {
                logger.warn('Cannot detect worklog duration from time_entry', te);
                return null;
            }

            const timeZone = this._appConfiguration.options.timeZone;

            let startTime, endTime, duration;

            // Harvest has two types of company configuration:
            // 1. Timers enabled, in which case, time entries have a spent_date, a start and an end time
            // 2. Timers disabled, in which case, time entries have a spent_date and a duration (hours)
            if (canGetTimeFromStartAndEnd) {
                startTime = moment.tz(`${te.spent_date} ${te.started_time}`, 'YYYY-MM-DD hh:mma', timeZone).toDate();
                endTime = moment.tz(`${te.spent_date} ${te.ended_time}`, 'YYYY-MM-DD hh:mma', timeZone).toDate();
                duration = calculateDurationInMinutes(endTime, startTime, minimumLoggableTimeSlotInMinutes);
            } else {
                startTime = moment.tz(te.spent_date, timeZone).toDate();
                endTime = moment.tz(te.spent_date, timeZone).add(te.hours, 'hours').toDate();
                duration = te.hours * 60;
            }

            const worklog = new Worklog(te.notes, startTime, endTime, duration);
            worklog.addTag('HarvestClient', te.client.name);
            worklog.addTag('HarvestProject', te.project.name);
            worklog.addTag('HarvestTask', te.task.name);
            
            return worklog;
        })
            .filter(worklog => !!worklog);

        if (mappedWorklogs.length === timeEntries.length)
            logger.info(`Retrieved ${mappedWorklogs.length} worklogs from Harvest time entries.`);
        else 
            logger.warn(`Retrieved ${mappedWorklogs.length} worklogs from ${timeEntries.length} Harvest time entries.`);

        return mappedWorklogs;
    }
}