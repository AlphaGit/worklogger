import { Worklog } from '../../models/Worklog';
import { LoggerFactory } from '../../services/LoggerFactory';
import { calculateDurationInMinutes } from '../../services/durationCalculator';
import { IApiResponse } from './IApiResponse';
import { GoogleCalendarCalendarConfiguration } from './GoogleCalendarCalendarConfiguration';
import { calendar_v3 } from 'googleapis';
import { Tag } from './Tag';

const logger = LoggerFactory.getLogger('GoogleCalendarInput/ModelMapper');

export class ModelMapper {
    private minimumLoggableTimeSlotInMinutes: number;

    constructor(minimumLoggableTimeSlotInMinutes: number) {
        this.minimumLoggableTimeSlotInMinutes = minimumLoggableTimeSlotInMinutes;
    }

    map(apiResponses: IApiResponse[]): Worklog[] {
        return apiResponses
            .map(item => this._mapEventArrayToWorklogs(item))
            .reduce((a, b) => a.concat(b), []); // flatten
    }

    _mapEventArrayToWorklogs(calendarEvents: IApiResponse): Worklog[] {
        const calendarConfig = calendarEvents.calendarConfig;
        const minimumTimeSlotMinutes = this.minimumLoggableTimeSlotInMinutes;
        const events = calendarEvents.events || [];
        logger.trace('Events retrieved:', events);

        const mapIndividualWorklog = this._mapIndividualEventToWorklog.bind(this, calendarConfig, minimumTimeSlotMinutes);
        return events
            .filter(e => !!e.start.dateTime && !!e.end.dateTime)
            .map(mapIndividualWorklog);
    }

    _mapIndividualEventToWorklog(calendarConfig: GoogleCalendarCalendarConfiguration, minimumTimeSlotMinutes: number, event: calendar_v3.Schema$Event): Worklog {
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);
        const duration = calculateDurationInMinutes(endTime, startTime, minimumTimeSlotMinutes);

        const worklog = new Worklog(event.summary, startTime, endTime, duration);

        for (const tag of calendarConfig.includeTags || []) {
            const { tagName, tagValue } = this._parseTag(tag);
            worklog.addTag(tagName, tagValue);
        }

        return worklog;
    }

    _parseTag(tagString: string): Tag {
        const colonPosition = tagString.indexOf(':');
        const tagName = tagString.substring(0, colonPosition);
        const tagValue = tagString.substring(colonPosition + 1, tagString.length);
        return { tagName, tagValue };
    }
}
