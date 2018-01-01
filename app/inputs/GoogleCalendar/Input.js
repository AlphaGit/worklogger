const logger = require('app/services/loggerFactory').getLogger('GoogleCalendarInput');

const googleApisRequired = require('googleapis');

const CredentialStorageRequired = require('./CredentialStorage');
const TokenStorageRequired = require('./TokenStorage');
const ModelMapperRequired = require('./ModelMapper');

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
        this.googleApi = googleApi;
        this.ModelMapper = ModelMapper;
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

    getWorkLogs(startDateTime, endDateTime) {
        logger.info('Retrieving worklogs from Google Calendar');
        // arrow functions needed to preserve 'this' context
        return this.credentialStorage.retrieveAppCredentials()
            .then(credentials => this.tokenStorage.authorize(credentials))
            .then(auth => this._getEventsFromApi(auth, startDateTime, endDateTime))
            .then(apiResponses => this._mapToDomainModel(apiResponses));
    }

    _getEventsFromApi(auth, startDateTime, endDateTime) {
        var calendarReturnPromises = this._inputConfiguration.calendars
            .map(calendarId => this._getEventsFromApiSingleCalendar(auth, calendarId, startDateTime, endDateTime));
        return Promise.all(calendarReturnPromises);
    }

    _getEventsFromApiSingleCalendar(auth, calendar, startDateTime, endDateTime) {
        logger.debug('Filtering calendar events from', startDateTime, 'to', endDateTime);

        return new Promise((resolve, reject) => {
            logger.debug('Retrieving entries from calendar', calendar.id);
            this.googleApi.calendar('v3').events.list({
                auth: auth,
                calendarId: calendar.id,
                timeMin: startDateTime.toISOString(),
                timeMax: endDateTime.toISOString(),
                maxResults: 100,
                singleEvents: true,
                orderBy: 'startTime'
            }, (err, response) => {
                if (err) {
                    reject(`The API returned an error: ${err}`);
                    return;
                }

                resolve({
                    calendarConfig: calendar,
                    events: response.items
                });
            });
        });
    }

    _mapToDomainModel(apiResponses) {
        const minimumLoggableTimeSlotInMinutes = this._appConfiguration.options.minimumLoggableTimeSlotInMinutes;
        const mapper = new this.ModelMapper(minimumLoggableTimeSlotInMinutes);
        return mapper.map(apiResponses);
    }
};
