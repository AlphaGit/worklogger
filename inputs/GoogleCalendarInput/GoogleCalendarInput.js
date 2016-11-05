// from https://developers.google.com/google-apps/calendar/quickstart/nodejs
let fs = require('fs');
let readline = require('readline');
let google = require('googleapis');
let googleAuth = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = '.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'worklogger.json';

const Worklog = require('../../model/Worklog');

class GoogleCalendarInput {
    set configuration(value) {
        this._configuration = value;
    }

    getWorkLogs() {
        return this._readCredentials()
            .then(this._authorize)
            .then(auth => this._getEventsFromApi(auth)) // arrow function needed to preserve 'this' context
            .then(apiResponses => this._mapToDomainModel(apiResponses, this._configuration));
    }

    _readCredentials() {
        var self = this;
        return new Promise((resolve, reject) => {
            fs.readFile('_private/client_secret.json', (err, content) => {
                if (err) {
                    reject(`Error loading client secret file: ${err}`);
                    return;
                }

                resolve(JSON.parse(content));
            });
        });
    }

    _getEventsFromApi(auth) {
        var calendarReturnPromises = this._configuration.calendars
            .map(calendar => this._getEventsFromApiSingleCalendar(auth, calendar));
        return Promise.all(calendarReturnPromises);
    }

    _getEventsFromApiSingleCalendar(auth, calendar) {
        return new Promise((resolve, reject) => {
            google.calendar('v3').events.list({
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

    _storeToken(token) {
        return new Promise((resolve, reject) => {
            try {
                fs.mkdirSync(TOKEN_DIR);
            } catch (err) {
                if (err.code != 'EEXIST')
                    throw err;
            }
            fs.writeFile(TOKEN_PATH, JSON.stringify(token));
            console.log(`Token stored to ${TOKEN_PATH}`);
            resolve(token);
        });
    }

    _authorize(credentials) {
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var auth = new googleAuth();

        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        console.log(`Reading token from ${require('path').resolve(TOKEN_PATH)}`);
        return new Promise((resolve) => {
            fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) {
                    resolve(self._getNewtoken(oauth2Client));
                } else {
                    oauth2Client.credentials = JSON.parse(token);
                    resolve(oauth2Client);
                }
            })
        });
    };

    _getNewtoken(oauth2Client, callback) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log(`Authorize this app by visiting this url: ${authUrl}`);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        var self = this;
        return new Promise((resolve, reject) => {
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oauth2Client.getToken(code, (err, token) => {
                    if (err) {
                        reject(`Error while trying to retrieve access token: ${err}`);
                        return;
                    }

                    self._storeToken(token).then(() => {
                        oauth2Client.credentials = token;
                        resolve(oauth2Client)
                    });
                });
            });
        });
    }

    _mapToDomainModel(apiResponses, configuration) {
        return apiResponses
            .map(item => this._mapToWorklogs(item, configuration))
            .reduce((a, b) => a.concat(b), []); // flatten
    }

    _mapToWorklogs(calendarEvents, configuration) {
        var calendarConfig = calendarEvents.calendarConfig;
        var minimumTimeSlotMinutes = configuration.minimumLoggableTimeSlotInMinutes;
        return calendarEvents.events
            .filter(e => !!e.start.dateTime && !!e.end.dateTime)
            .map(e => {
                var startTime = Date.parse(e.start.dateTime);
                var endTime = Date.parse(e.end.dateTime);
                var duration = (endTime - startTime) / 1000 / 60;
                if (duration % minimumTimeSlotMinutes != 0) {
                    duration = minimumTimeSlotMinutes * Math.ceil(duration / minimumTimeSlotMinutes);
                }
                return new Worklog(e.summary, startTime, endTime, duration, calendarConfig.client, calendarConfig.project)
            });

    }
}

module.exports = GoogleCalendarInput;
