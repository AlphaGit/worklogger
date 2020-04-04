const Worklog = require('app/models/Worklog');
const logger = require('app/services/loggerFactory').getLogger('GoogleCalendarInput/ModelMapper');

const { calculateDurationInMinutes } = require('app/services/durationCalculator');

module.exports = class ModelMapper {
    constructor(minimumLoggableTimeSlotInMinutes) {
        this.minimumLoggableTimeSlotInMinutes = minimumLoggableTimeSlotInMinutes;
    }

    map(apiResponses) {
        return apiResponses
            .map(item => this._mapEventArrayToWorklogs(item))
            .reduce((a, b) => a.concat(b), []); // flatten
    }

    _mapEventArrayToWorklogs(calendarEvents) {
        var calendarConfig = calendarEvents.calendarConfig;
        var minimumTimeSlotMinutes = this.minimumLoggableTimeSlotInMinutes;
        var events = calendarEvents.events || [];
        logger.trace('Events retrieved:', events);

        const mapIndividualWorklog = this._mapIndividualEventToWorklog.bind(this, calendarConfig, minimumTimeSlotMinutes);
        return events
            .filter(e => !!e.start.dateTime && !!e.end.dateTime)
            .map(mapIndividualWorklog);
    }

    _mapIndividualEventToWorklog(calendarConfig, minimumTimeSlotMinutes, event) {
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

    _parseTag(tagString) {
        let colonPosition = tagString.indexOf(':');
        let tagName = tagString.substring(0, colonPosition);
        let tagValue = tagString.substring(colonPosition + 1, tagString.length);
        return { tagName, tagValue };
    }
};
