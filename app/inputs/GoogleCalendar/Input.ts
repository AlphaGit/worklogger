import { LoggerFactory } from 'app/services/loggerFactory';

const logger = LoggerFactory.getLogger('GoogleCalendarInput');

import { googleApis } from 'googleapis';
const googleApisRequired = googleApis.google;

import { ModelMapperRequired } from './ModelMapper';

import { util } from 'util';

export class Input {
    private inputConfiguration: any;
    private ModelMapper: any;
    private fileLoader: any;
    private getCalendarEvents: (query: any) => any;
    private OAuth2: any;
    private appConfiguration: any;

    constructor(
        serviceRegistrations,
        appConfiguration,
        inputConfiguration,
        googleApi = googleApisRequired,
        ModelMapper = ModelMapperRequired,
    ) {
        if (!serviceRegistrations)
            throw new Error('ServiceRegistrations for GoogleCalendarInput is required');

        this.appConfiguration = appConfiguration;
        this.inputConfiguration = inputConfiguration;

        this.ModelMapper = ModelMapper;
        this.fileLoader = serviceRegistrations.FileLoader;

        const events = googleApi.calendar('v3').events;
        const listEvents = events.list.bind(events);
        this.getCalendarEvents = (query) => util.promisify(listEvents)(query);

        this.OAuth2 = googleApi.auth.OAuth2;
    }

    public name() {
        return this.inputConfiguration.name;
    }

    public async getWorkLogs(startDateTime, endDateTime) {
        logger.info('Retrieving worklogs from Google Calendar between', startDateTime, 'and', endDateTime);

        const storageRelativePath = this.inputConfiguration.storageRelativePath;

        const clientSecretPath = (storageRelativePath ? `${storageRelativePath}/` : '') + 'google_client_secret.json';
        const credentials = await this.fileLoader.loadJson(clientSecretPath);
        const clientSecret = credentials.installed.client_secret;
        const clientId = credentials.installed.client_id;
        const redirectUrl = credentials.installed.redirect_uris[0];
        const oauth2Client = new this.OAuth2(clientId, clientSecret, redirectUrl);

        try {
            const googleTokenPath = (storageRelativePath ? `${storageRelativePath}/` : '') + 'google_token.json';
            const tokenInfo = await this.fileLoader.loadJson(googleTokenPath);
            logger.trace('Google App token read:', tokenInfo);
            oauth2Client.credentials = tokenInfo;
        } catch (err) {
            logger.warn('Token could not be read -- maybe application is not authorized yet?', err);
            throw err;
        }

        const apiResponses = await this._getEventsFromApi(oauth2Client, startDateTime, endDateTime);

        return this._mapToDomainModel(apiResponses);
    }

    private async _getEventsFromApi(auth, startDateTime, endDateTime) {
        const calendarReturnPromises = this.inputConfiguration.calendars
            .map(calendarId => this._getEventsFromApiSingleCalendar(auth, calendarId, startDateTime, endDateTime));
        return await Promise.all(calendarReturnPromises);
    }

    private async _getEventsFromApiSingleCalendar(auth, calendar, startDateTime, endDateTime) {
        logger.debug('Filtering calendar events from', startDateTime, 'to', endDateTime);

        logger.debug('Retrieving entries from calendar', calendar.id);

        try {
            const calendarResponse = await this.getCalendarEvents({
                auth,
                calendarId: calendar.id,
                maxResults: 2500,
                orderBy: 'startTime',
                singleEvents: true,
                timeMax: endDateTime.toISOString(),
                timeMin: startDateTime.toISOString(),
            });

            const calendarEvents = calendarResponse.data.items
                .filter(e => new Date(e.start.dateTime) >= startDateTime);

            return {
                calendarConfig: calendar,
                events: calendarEvents,
            };
        } catch (err) {
            throw new Error(`The API returned an error: ${err}`);
        }
    }

    private _mapToDomainModel(apiResponses) {
        const minimumLoggableTimeSlotInMinutes = this.appConfiguration.options.minimumLoggableTimeSlotInMinutes;
        const mapper = new this.ModelMapper(minimumLoggableTimeSlotInMinutes);
        return mapper.map(apiResponses);
    }
};
