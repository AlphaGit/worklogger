const logger = require('services/logger');
const googleApisRequired = require('googleapis');
const appCredentialStorageRequired = require('./GoogleAppCredentialStorage');
const googleTokenStorageRequired = require('./GoogleTokenStorage');

const GoogleCalendarToModelMapperRequired = require('./GoogleCalendarToModelMapper');

class GoogleCalendarInput {
    constructor(appConfiguration,
        inputConfiguration,
        appCredentialStorage = appCredentialStorageRequired,
        googleTokenStorage = googleTokenStorageRequired,
        google = googleApisRequired,
        GoogleCalendarToModelMapper = GoogleCalendarToModelMapperRequired) {
        this.appConfiguration = appConfiguration;
        this.inputConfiguration = inputConfiguration;
        this.appCredentialStorage = appCredentialStorage;
        this.googleTokenStorage = new googleTokenStorage();
        this.google = google;
        this.GoogleCalendarToModelMapper = GoogleCalendarToModelMapper;
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

    getWorkLogs() {
        logger.info('Retrieving worklogs from Google Calendar');
        // arrow functions needed to preserve 'this' context
        return this.appCredentialStorage.retrieveAppCredentials()
            .then(credentials => this.googleTokenStorage.authorize(credentials))
            .then(auth => this._getEventsFromApi(auth))
            .then(apiResponses => this._mapToDomainModel(apiResponses));
    }

    _getEventsFromApi(auth) {
        var calendarReturnPromises = this._inputConfiguration.calendars
            .map(calendar => this._getEventsFromApiSingleCalendar(auth, calendar));
        return Promise.all(calendarReturnPromises);
    }

    _getEventsFromApiSingleCalendar(auth, calendar) {
        const maximumTimeFilter = new Date();
        const timeOffset = this._inputConfiguration.readFromXHoursAgo * 60 * 60 * 1000;
        const minimumTimeFilter = new Date(maximumTimeFilter - timeOffset);

        logger.debug('Filtering calendar events from', minimumTimeFilter, 'to', maximumTimeFilter);

        return new Promise((resolve, reject) => {
            logger.debug('Retrieving entries from calendar', calendar.id);
            this.google.calendar('v3').events.list({
                auth: auth,
                calendarId: calendar.id,
                timeMin: minimumTimeFilter.toISOString(),
                timeMax: maximumTimeFilter.toISOString(),
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
        let mapper = new this.GoogleCalendarToModelMapper(this._appConfiguration);
        return mapper.map(apiResponses);
    }
}

module.exports = GoogleCalendarInput;
