import LoggerFactory from '../../services/LoggerFactory';

const logger = LoggerFactory.getLogger('GoogleCalendarInput');

import googleApis from 'googleapis';
const googleApisRequired = googleApis.google;

import { ModelMapper } from './ModelMapper';
import { promisify } from 'util';
import { InputConfiguration } from './InputConfiguration'
import { AppConfiguration } from '../../models/AppConfiguration';

import { IGoogleCredentials } from './IGoogleCredentials';
import { GoogleCalendarCalendarConfiguration } from './GoogleCalendarCalendarConfiguration';
import { IApiResponse } from './IApiResponse';
import { IFileLoader } from '../../models/IFileLoader';
import { ServiceRegistrations } from '../../models/ServiceRegistrations';
import { Worklog } from '../../models/Worklog';

module.exports = class Input {
    private ModelMapper: ModelMapper;
    private fileLoader: IFileLoader;
    private getCalendarEvents: (query: googleApis.calendar_v3.Params$Resource$Events$List) => googleApis.Common.GaxiosPromise<googleApis.calendar_v3.Schema$Events>;
    private OAuth2: typeof googleApis.Common.OAuth2Client;
    private _inputConfiguration: InputConfiguration;
    private _appConfiguration: AppConfiguration;

    constructor(
        serviceRegistrations: ServiceRegistrations,
        appConfiguration,
        inputConfiguration,
        googleApi = googleApisRequired,
        modelMapperParam: ModelMapper
    ) {
        if (!serviceRegistrations)
            throw new Error('ServiceRegistrations for GoogleCalendarInput is required');

        this.appConfiguration = appConfiguration;
        this.inputConfiguration = inputConfiguration;

        const minimumLoggableTimeSlotInMinutes = appConfiguration.options.minimumLoggableTimeSlotInMinutes;
        this.ModelMapper = modelMapperParam || new ModelMapper(minimumLoggableTimeSlotInMinutes);

        this.fileLoader = serviceRegistrations.FileLoader;

        const events = googleApi.calendar('v3').events;
        const listEvents = events.list.bind(events);
        this.getCalendarEvents = (query) => promisify(listEvents)(query);
        
        this.OAuth2 = googleApi.auth.OAuth2;

    }

    set inputConfiguration(value) {
        if (!value)
            throw new Error('Configuration for GoogleCalendarInput is required');

        this._inputConfiguration = value;
    }

    get name() {
        return this._inputConfiguration.name;
    }

    set appConfiguration(value) {
        if (!value)
            throw new Error('Application configuration is required');

        this._appConfiguration = value;
    }

    async getWorkLogs(startDateTime: Date, endDateTime: Date): Promise<Worklog[]> {
        logger.info('Retrieving worklogs from Google Calendar between', startDateTime, 'and', endDateTime);

        const storageRelativePath = this._inputConfiguration.storageRelativePath;

        const clientSecretPath = (storageRelativePath ? `${storageRelativePath}/` : '') + 'google_client_secret.json';
        const credentials = await this.fileLoader.loadJson(clientSecretPath) as IGoogleCredentials;
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

    async _getEventsFromApi(auth: googleApis.Common.OAuth2Client, startDateTime: Date, endDateTime: Date): Promise<IApiResponse[]> {
        const calendarReturnPromises = this._inputConfiguration.calendars
            .map(calendarInfo => this._getEventsFromApiSingleCalendar(auth, calendarInfo, startDateTime, endDateTime));
        return await Promise.all(calendarReturnPromises);
    }

    async _getEventsFromApiSingleCalendar(auth: googleApis.Common.OAuth2Client, calendar: GoogleCalendarCalendarConfiguration, startDateTime: Date, endDateTime: Date): Promise<IApiResponse> {
        logger.debug('Filtering calendar events from', startDateTime, 'to', endDateTime);

        logger.debug('Retrieving entries from calendar', calendar.id);

        try {
            const calendarResponse = await this.getCalendarEvents({
                auth: auth,
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

    _mapToDomainModel(apiResponses: IApiResponse[]) {
        return this.ModelMapper.map(apiResponses);
    }
};
