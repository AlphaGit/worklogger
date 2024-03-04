import { getLogger, LoggerCategory } from '../../services/Logger';
import { google, Auth } from 'googleapis';

import { IAppConfiguration, IServiceRegistrations, Worklog } from '../../models';
import { getUserAuthenticatedOAuthClient } from '../../services/authHandler';

import { IApiResponse, ModelMapper, GoogleCalendarConfiguration, GoogleCalendarCalendarConfiguration } from '.';
import { IInput } from '../IInput';

export class Input implements IInput {
    private logger = getLogger(LoggerCategory.Inputs);
    private modelMapper: ModelMapper = new ModelMapper();
    private inputConfiguration: GoogleCalendarConfiguration;

    constructor(
        serviceRegistrations: IServiceRegistrations,
        appConfiguration: IAppConfiguration,
        inputConfiguration: GoogleCalendarConfiguration
    ) {
        if (!serviceRegistrations)
            throw new Error('ServiceRegistrations for GoogleCalendarInput is required');

        if (!inputConfiguration)
            throw new Error('Configuration for GoogleCalendarInput is required');

        this.inputConfiguration = inputConfiguration;
        this.name = inputConfiguration.name;
    }

    name: string;

    async getWorkLogs(startDateTime: Date, endDateTime: Date): Promise<Worklog[]> {
        this.logger.info(`Retrieving worklogs from Google Calendar between ${startDateTime} and ${endDateTime}`);
        const oauth2Client = await getUserAuthenticatedOAuthClient();
        const apiResponses = await this._getEventsFromApi(oauth2Client, startDateTime, endDateTime);
        return this.modelMapper.map(apiResponses);
    }

    async _getEventsFromApi(auth: Auth.OAuth2Client, startDateTime: Date, endDateTime: Date): Promise<IApiResponse[]> {
        const calendarReturnPromises = this.inputConfiguration.calendars
            .map(calendarInfo => this._getEventsFromApiSingleCalendar(auth, calendarInfo, startDateTime, endDateTime));
        return await Promise.all(calendarReturnPromises);
    }

    async _getEventsFromApiSingleCalendar(auth: Auth.OAuth2Client, calendar: GoogleCalendarCalendarConfiguration, startDateTime: Date, endDateTime: Date): Promise<IApiResponse> {
        this.logger.debug('Filtering calendar events from', startDateTime, 'to', endDateTime);

        this.logger.debug('Retrieving entries from calendar', calendar.id);

        try {
            const calendarResponse = await google.calendar("v3").events.list({
                auth,
                calendarId: calendar.id,
                timeMin: startDateTime.toISOString(),
                timeMax: endDateTime.toISOString(),
                maxResults: 2500,
                singleEvents: true,
                orderBy: 'startTime',
                eventTypes: ["default"]
            });
            this.logger.trace('Calendar response', { calendarResponse });

            const calendarEvents = (calendarResponse.data.items || [])
                .filter(e => new Date(e.start?.dateTime ?? 0) >= startDateTime);

            const apiResponse: IApiResponse = {
                calendarConfig: calendar,
                events: calendarEvents
            };

            return apiResponse;
        } catch (err) {
            this.logger.error('Error retrieving calendar events', err);
            throw err;
        }
    }
}

export default Input;