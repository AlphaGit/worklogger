import { Worklog, Tag } from '../../models';
import { GoogleCalendarCalendarConfiguration, IApiResponse } from '.';
import { calendar_v3 } from 'googleapis';
import { getLogger, LoggerCategory } from '../../services/Logger';

export class ModelMapper {
    private logger = getLogger(LoggerCategory.Inputs);

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
            .filter(e => !!e.start?.dateTime && !!e.end?.dateTime)
            .map(mapIndividualWorklog);
    }

    private mapIndividualEventToWorklog(calendarConfig: GoogleCalendarCalendarConfiguration, event: calendar_v3.Schema$Event): Worklog {
        const startTime = new Date(event.start?.dateTime ?? 0);
        const endTime = new Date(event.end?.dateTime ?? 0);

        const worklog = new Worklog(event.summary ?? '(No description)', startTime, endTime);

        for (const tagToInclude of calendarConfig.includeTags || []) {
            const { name, value } = this.parseTag(tagToInclude);
            const tag = new Tag(name, value);
            worklog.addTag(tag);
        }

        return worklog;
    }

    private parseTag(tagString: string): Tag {
        const colonPosition = tagString.indexOf(':');
        const name = tagString.substring(0, colonPosition);
        const value = tagString.substring(colonPosition + 1, tagString.length);
        return new Tag(name, value);
    }
}
