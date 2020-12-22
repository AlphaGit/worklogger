import { Worklog } from 'app/models/Worklog';
import { LoggerFactory } from 'app/services/loggerFactory';

const logger = LoggerFactory.getLogger('GoogleCalendarInput/ModelMapper');

import { calculateDurationInMinutes } from 'app/services/durationCalculator';

module.exports = class ModelMapper {
    private minimumLoggableTimeSlotInMinutes: Number;

    constructor(minimumLoggableTimeSlotInMinutes) {
        this.minimumLoggableTimeSlotInMinutes = minimumLoggableTimeSlotInMinutes;
    }

    public map(apiResponses) {
        return apiResponses
            .map(item => this._mapEventArrayToWorklogs(item))
            .reduce((a, b) => a.concat(b), []); // flatten
    }

    private _mapEventArrayToWorklogs(calendarEvents) {
        const calendarConfig = calendarEvents.calendarConfig;
        const minimumTimeSlotMinutes = this.minimumLoggableTimeSlotInMinutes;
        const events = calendarEvents.events || [];
        logger.trace('Events retrieved:', events);

        const mapIndividualWorklog = this._mapIndividualEventToWorklog.bind(
            this,
            calendarConfig,
            minimumTimeSlotMinutes,
        );
        return events
            .filter(e => !!e.start.dateTime && !!e.end.dateTime)
            .map(mapIndividualWorklog);
    }

    private _mapIndividualEventToWorklog(calendarConfig, minimumTimeSlotMinutes, event) {
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const duration = calculateDurationInMinutes(endTime, startTime, minimumTimeSlotMinutes);

        const worklog = new Worklog(event.summary, startTime, endTime, duration);

        for (let tag of calendarConfig.includeTags || []) {
            const { tagName, tagValue } = this._parseTag(tag);
            worklog.addTag(tagName, tagValue);
        }

        return worklog;
    }

    private _parseTag(tagString) {
        let colonPosition = tagString.indexOf(':');
        let tagName = tagString.substring(0, colonPosition);
        let tagValue = tagString.substring(colonPosition + 1, tagString.length);
        return { tagName, tagValue };
    }
};
