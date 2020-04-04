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
        this.inputConfiguration = inputConfiguration;

        this._harvestClient = new HarvestClient(inputConfiguration);
    }

    set inputConfiguration(value) {
        if (!value)
            throw new Error('Configuration for GoogleCalendarInput is required');

        this._inputConfiguration = value;
    }

    async getWorkLogs(startDateTime, endDateTime) {
        logger.info('Retrieving worklogs from Harvest');

        const parameters = { from: startDateTime, to: endDateTime };
        const timeEntries = await this._harvestClient.getTimeEntries(parameters);

        return this._mapToDomainModel(timeEntries);
    }

    _mapToDomainModel(timeEntries) {
        const minimumLoggableTimeSlotInMinutes = this._appConfiguration.options.minimumLoggableTimeSlotInMinutes;

        return timeEntries.map(te => {
            const startTime = new Date(`${te.spent_date} ${te.started_time}`);
            const endTime = new Date(`${te.spent_date} ${te.ended_time}`);
            const duration = calculateDurationInMinutes(endTime, startTime, minimumLoggableTimeSlotInMinutes);

            const worklog = new Worklog(te.notes, startTime, endTime, duration);
            worklog.addTag('HarvestClient', te.client.name);
            worklog.addTag('HarvestProject', te.project.name);
            worklog.addTag('HarvestTask', te.task.name);
            
            return worklog;
        });
    }
};
