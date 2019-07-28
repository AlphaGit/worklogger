const logger = require('app/services/loggerFactory').getLogger('GoogleCalendarInput');

const googleApisRequired = require('googleapis').google;

const CredentialStorageRequired = require('./CredentialStorage');
const TokenStorageRequired = require('./TokenStorage');
const ModelMapperRequired = require('./ModelMapper');

const util = require('util');

module.exports = class Input {
    constructor(appConfiguration,
        inputConfiguration,
        credentialStorage = CredentialStorageRequired,
        TokenStorage = TokenStorageRequired,
        googleApi = googleApisRequired,
        ModelMapper = ModelMapperRequired) {
        this.appConfiguration = appConfiguration;
        this.inputConfiguration = inputConfiguration;
        this.credentialStorage = credentialStorage;
        this.tokenStorage = new TokenStorage();
        this.ModelMapper = ModelMapper;

        const events = googleApi.calendar('v3').events;
        const listEvents = events.list.bind(events);
        this.getCalendarEvents = (query) => util.promisify(listEvents)(query);
    }

    set inputConfiguration(value) {
        if (!value)
            throw new Error('Configuration for GoogleCalendarInput is required');

        this._inputConfiguration = value;
    }

    set appConfiguration(value) {
        if (!value)
            throw new Error('Application configuration is required');

        this._appConfiguration = value;
    }

    async getWorkLogs(startDateTime, endDateTime) {
        logger.info('Retrieving worklogs from Google Calendar');

        const credentials = await this.credentialStorage.retrieveAppCredentials();
        const auth = await this.tokenStorage.authorize(credentials);
        const apiResponses = await this._getEventsFromApi(auth, startDateTime, endDateTime);

        return this._mapToDomainModel(apiResponses);
    }

    async _getEventsFromApi(auth, startDateTime, endDateTime) {
        var calendarReturnPromises = this._inputConfiguration.calendars
            .map(calendarId => this._getEventsFromApiSingleCalendar(auth, calendarId, startDateTime, endDateTime));
        return await Promise.all(calendarReturnPromises);
    }

    async _getEventsFromApiSingleCalendar(auth, calendar, startDateTime, endDateTime) {
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

            return {
                calendarConfig: calendar,
                events: calendarResponse.data.items
            }
        } catch (err) {
            throw new Error(`The API returned an error: ${err}`);
        }
    }

    _mapToDomainModel(apiResponses) {
        const minimumLoggableTimeSlotInMinutes = this._appConfiguration.options.minimumLoggableTimeSlotInMinutes;
        const mapper = new this.ModelMapper(minimumLoggableTimeSlotInMinutes);
        return mapper.map(apiResponses);
    }
};
