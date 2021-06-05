import { getLogger } from 'log4js';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

import { AppConfiguration, ServiceRegistrations, Worklog } from '../../models';
import { IFileLoader } from '../../services/FileLoader/IFileLoader';

import { IGoogleCredentials, IApiResponse, ModelMapper, GoogleCalendarConfiguration, GoogleCalendarCalendarConfiguration } from '.';

export class Input {
    private logger = getLogger();
    private modelMapper: ModelMapper = new ModelMapper();
    private fileLoader: IFileLoader;
    private inputConfiguration: GoogleCalendarConfiguration;

    constructor(
        serviceRegistrations: ServiceRegistrations,
        appConfiguration: AppConfiguration,
        inputConfiguration: GoogleCalendarConfiguration
    ) {
        if (!serviceRegistrations)
            throw new Error('ServiceRegistrations for GoogleCalendarInput is required');

        if (!inputConfiguration)
            throw new Error('Configuration for GoogleCalendarInput is required');

        this.inputConfiguration = inputConfiguration;

        this.fileLoader = serviceRegistrations.FileLoader;
    }

    private getPath(filename: string): string {
        const storagePath = this.inputConfiguration.storageRelativePath;
        return (storagePath ? `${storagePath}/` : '') + filename;
    }

    async getWorkLogs(startDateTime: Date, endDateTime: Date): Promise<Worklog[]> {
        this.logger.info('Retrieving worklogs from Google Calendar between', startDateTime, 'and', endDateTime);

        const oauth2Client = await this.getAuthenticatedClient();

        const apiResponses = await this._getEventsFromApi(oauth2Client, startDateTime, endDateTime);

        return this.modelMapper.map(apiResponses);
    }

    private async getAuthenticatedClient() {
        try {
            const clientSecretPath = this.getPath('google_client_secret.json');
            const credentials = await this.fileLoader.loadJson(clientSecretPath) as IGoogleCredentials;

            const {
                client_secret: clientSecret,
                client_id: clientId,
                redirect_uris: redirectUrls
            } = credentials.installed;
            const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrls[0]);

            const googleTokenPath = this.getPath('google_token.json');
            const tokenInfo = await this.fileLoader.loadJson(googleTokenPath);
            this.logger.trace('Google App token read:', tokenInfo);
            oauth2Client.credentials = tokenInfo;

            return oauth2Client;
        } catch (err) {
            this.logger.warn('Token could not be read -- maybe application is not authorized yet?', err);
            throw err;
        }
    }

    async _getEventsFromApi(auth: OAuth2Client, startDateTime: Date, endDateTime: Date): Promise<IApiResponse[]> {
        const calendarReturnPromises = this.inputConfiguration.calendars
            .map(calendarInfo => this._getEventsFromApiSingleCalendar(auth, calendarInfo, startDateTime, endDateTime));
        return await Promise.all(calendarReturnPromises);
    }

    async _getEventsFromApiSingleCalendar(auth: OAuth2Client, calendar: GoogleCalendarCalendarConfiguration, startDateTime: Date, endDateTime: Date): Promise<IApiResponse> {
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
                orderBy: 'startTime'
            });

            const calendarEvents = calendarResponse.data.items
                .filter(e => new Date(e.start.dateTime) >= startDateTime);

            const apiResponse: IApiResponse = {
                calendarConfig: calendar,
                events: calendarEvents
            };

            return apiResponse;
        } catch (err) {
            throw new Error(`The API returned an error: ${err}`);
        }
    }
}
