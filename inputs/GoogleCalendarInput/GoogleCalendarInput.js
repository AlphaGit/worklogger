const googleApisRequired = require('googleapis');
const appCredentialStorageRequired = require('./GoogleAppCredentialStorage');
const googleTokenStorageRequired = require('./GoogleTokenStorage');

const GoogleCalendarToModelMapperRequired = require('./GoogleCalendarToModelMapper');

class GoogleCalendarInput {
    constructor(configuration,
        appCredentialStorage = appCredentialStorageRequired,
        googleTokenStorage = googleTokenStorageRequired,
        google = googleApisRequired,
        GoogleCalendarToModelMapper = GoogleCalendarToModelMapperRequired) {
        this.configuration = configuration;
        this.appCredentialStorage = appCredentialStorage;
        this.googleTokenStorage = googleTokenStorage;
        this.google = google;
        this.GoogleCalendarToModelMapper = GoogleCalendarToModelMapper;
    }

    set configuration(value) {
        if (!value)
            throw new Error('Configuration for GoogleCalendarInput is required');

        this._configuration = value;
    }

    getWorkLogs() {
        // arrow functions needed to preserve 'this' context
        return this.appCredentialStorage.retrieveAppCredentials()
            .then(credentials => this.googleTokenStorage.authorize(credentials))
            .then(auth => this._getEventsFromApi(auth))
            .then(apiResponses => this._mapToDomainModel(apiResponses));
    }

    _getEventsFromApi(auth) {
        var calendarReturnPromises = this._configuration.calendars
            .map(calendar => this._getEventsFromApiSingleCalendar(auth, calendar));
        return Promise.all(calendarReturnPromises);
    }

    _getEventsFromApiSingleCalendar(auth, calendar) {
        return new Promise((resolve, reject) => {
            this.google.calendar('v3').events.list({
                auth: auth,
                calendarId: calendar.id,
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
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
        let mapper = new this.GoogleCalendarToModelMapper(this._configuration);
        return mapper.map(apiResponses);
    }
}

module.exports = GoogleCalendarInput;
