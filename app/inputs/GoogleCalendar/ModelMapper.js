const Worklog = require('models/Worklog');
const logger = require('services/loggerFactory').getLogger('GoogleCalendarInput/ModelMapper');

module.exports = class ModelMapper {
    constructor(minimumLoggableTimeSlotInMinutes) {
        this.minimumLoggableTimeSlotInMinutes = minimumLoggableTimeSlotInMinutes;
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
                const startTime = new Date(e.start.dateTime);
                const endTime = new Date(e.end.dateTime);
                let duration = (endTime - startTime) / 1000 / 60;
                if (duration % minimumTimeSlotMinutes != 0) {
                    duration = minimumTimeSlotMinutes * Math.ceil(duration / minimumTimeSlotMinutes);
                }
                const worklog = new Worklog(e.summary, startTime, endTime, duration);
                for (let tag of calendarConfig.includeTags || []) {
                    let colonPosition = tag.indexOf(':');
                    let tagName = tag.substring(0, colonPosition);
                    let tagValue = tag.substring(colonPosition + 1, tag.length);
                    worklog.addTag(tagName, tagValue);
                }
                return worklog;
            });
    }
};
