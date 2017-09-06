const Worklog = require('model/Worklog');
const logger = require('services/logger');

module.exports = class ModelMapper {
    constructor(appConfiguration) {
        this.minimumLoggableTimeSlotInMinutes = appConfiguration.minimumLoggableTimeSlotInMinutes;
    }

    map(apiResponses) {
        return apiResponses
            .map(item => this._mapToWorklogs(item))
            .reduce((a, b) => a.concat(b), []); // flatten
    }

    _mapToWorklogs(calendarEvents) {
        var calendarConfig = calendarEvents.calendarConfig;
        var minimumTimeSlotMinutes = this.minimumLoggableTimeSlotInMinutes;
        var events = calendarEvents.events || [];
        logger.trace('Events retrieved:', events);
        return events
            .filter(e => !!e.start.dateTime && !!e.end.dateTime)
            .map(e => {
                var startTime = Date.parse(e.start.dateTime);
                var endTime = Date.parse(e.end.dateTime);
                var duration = (endTime - startTime) / 1000 / 60;
                if (duration % minimumTimeSlotMinutes != 0) {
                    duration = minimumTimeSlotMinutes * Math.ceil(duration / minimumTimeSlotMinutes);
                }
                return new Worklog(e.summary, startTime, endTime, duration);
            });
    }
};
