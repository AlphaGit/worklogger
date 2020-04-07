const logger = require('app/services/loggerFactory').getLogger('inputs/HarvestApp/Input');
const { calculateDurationInMinutes } = require('app/services/durationCalculator');

const RequiredHarvestClient = require('app/services/HarvestClient');

const Worklog = require('app/models/Worklog');

module.exports = class Input {
    constructor(
        serviceRegistrations,
        appConfiguration,
        inputConfiguration,
        { HarvestClient = RequiredHarvestClient } = {}
    ) {
        if (!appConfiguration)
            throw new Error('App configuration for Harvest App input is required.');

            this._appConfiguration = appConfiguration;

        if (!inputConfiguration)
            throw new Error('Input configuration for Harvest App input is required.');
        this._harvestClient = new HarvestClient(inputConfiguration);
    }

    async getWorkLogs(startDateTime, endDateTime) {
        logger.info('Retrieving worklogs from Harvest');

        const parameters = { from: startDateTime, to: endDateTime };
        const timeEntries = await this._harvestClient.getTimeEntries(parameters);

        return this._mapToDomainModel(timeEntries);
    }

    _mapToDomainModel(timeEntries) {
        const minimumLoggableTimeSlotInMinutes = this._appConfiguration.options.minimumLoggableTimeSlotInMinutes;

        const mappedWorklogs = timeEntries.map(te => {
            const canGetTimeFromStartAndEnd = te.spent_date && te.started_time && te.ended_time;
            const canGetTimeFromHours = !!te.hours;

            if (!canGetTimeFromStartAndEnd && !canGetTimeFromHours) {
                logger.warn('Cannot detect worklog duration from time_entry', te);
                return null;
            }

            const startTime = canGetTimeFromStartAndEnd
                ? new Date(`${te.spent_date} ${te.started_time}`)
                : new Date(te.spent_date);

            const endTime = canGetTimeFromStartAndEnd
                ? new Date(`${te.spent_date} ${te.ended_time}`)
                : new Date(te.spent_date);

            const duration = canGetTimeFromStartAndEnd
                ? calculateDurationInMinutes(endTime, startTime, minimumLoggableTimeSlotInMinutes)
                : te.hours * 60;

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
};
