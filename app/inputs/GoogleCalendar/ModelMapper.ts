import { Worklog } from '../../models/Worklog';
import { LoggerFactory } from '../../services/LoggerFactory';
import { IApiResponse } from './IApiResponse';
import { GoogleCalendarCalendarConfiguration } from './GoogleCalendarConfiguration';
import { calendar_v3 } from 'googleapis';
import { Tag } from './Tag';

const logger = LoggerFactory.getLogger('GoogleCalendarInput/ModelMapper');

export class ModelMapper {
    map(apiResponses: IApiResponse[]): Worklog[] {
        return apiResponses
            .map(item => this._mapEventArrayToWorklogs(item))
            .reduce((a, b) => a.concat(b), []); // flatten
    }

    _mapEventArrayToWorklogs(calendarEvents: IApiResponse): Worklog[] {
        const calendarConfig = calendarEvents.calendarConfig;
        const events = calendarEvents.events || [];
        logger.trace('Events retrieved:', events);

        const mapIndividualWorklog = this._mapIndividualEventToWorklog.bind(this, calendarConfig);
        return events
            .filter(e => !!e.start.dateTime && !!e.end.dateTime)
            .map(mapIndividualWorklog);
    }

    _mapIndividualEventToWorklog(calendarConfig: GoogleCalendarCalendarConfiguration, event: calendar_v3.Schema$Event): Worklog {
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);

        const worklog = new Worklog(event.summary, startTime, endTime);

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
