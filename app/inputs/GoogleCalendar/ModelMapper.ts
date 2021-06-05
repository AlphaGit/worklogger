import { Worklog } from '../../models';
import { GoogleCalendarCalendarConfiguration, Tag, IApiResponse } from '.';
import { calendar_v3 } from 'googleapis';
import { getLogger } from 'log4js';

export class ModelMapper {
    private logger = getLogger('GoogleCalendarInput/ModelMapper');

    map(apiResponses: IApiResponse[]): Worklog[] {
        return apiResponses
            .map(item => this.mapEventArrayToWorklogs(item))
            .reduce((a, b) => a.concat(b), []); // flatten
    }

    private mapEventArrayToWorklogs(calendarEvents: IApiResponse): Worklog[] {
        const calendarConfig = calendarEvents.calendarConfig;
        const events = calendarEvents.events || [];
        this.logger.trace('Events retrieved:', events);

        const mapIndividualWorklog = this.mapIndividualEventToWorklog.bind(this, calendarConfig);
        return events
            .filter(e => !!e.start.dateTime && !!e.end.dateTime)
            .map(mapIndividualWorklog);
    }

    private mapIndividualEventToWorklog(calendarConfig: GoogleCalendarCalendarConfiguration, event: calendar_v3.Schema$Event): Worklog {
        const startTime = new Date(event.start.dateTime);
        const endTime = new Date(event.end.dateTime);

        const worklog = new Worklog(event.summary, startTime, endTime);

        for (const tag of calendarConfig.includeTags || []) {
            const { tagName, tagValue } = this.parseTag(tag);
            worklog.addTag(tagName, tagValue);
        }

        return worklog;
    }

    private parseTag(tagString: string): Tag {
        const colonPosition = tagString.indexOf(':');
        const tagName = tagString.substring(0, colonPosition);
        const tagValue = tagString.substring(colonPosition + 1, tagString.length);
        return { tagName, tagValue };
    }
}
