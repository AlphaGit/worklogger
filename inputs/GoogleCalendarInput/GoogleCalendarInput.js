class GoogleCalendarInput {
    set configuration(value) {
        this.inputConfiguration = value;
    }

    getWorkLogs() {
        this.getGoogleCalendarEvents();
        return [];
    }

    getGoogleCalendarEvents() {
        // from https://developers.google.com/google-apps/calendar/quickstart/nodejs
        var fs = require('fs');
        var readline = require('readline');
        var google = require('googleapis');
        var googleAuth = require('google-auth-library');

        var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
        var TOKEN_DIR = '.credentials/';
        var TOKEN_PATH = TOKEN_DIR + 'worklogger.json';

        var listEvents = function(auth) {
            var calendar = google.calendar('v3');
            calendar.events.list({
                auth: auth,
                calendarId: 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            }, function(err, response) {
                if (err) {
                    console.log(`The API returned an error: ${err}`);
                    return;
                }
                for (let item of response.items) {
                    console.log(`Received API item: ${item.start.dateTime || item.start.date} - ${item.summary}`);
                }
            })
        }

        var storeToken = function(token) {
            try {
                fs.mkdirSync(TOKEN_DIR);
            } catch (err) {
                if (err.code != 'EEXIST')
                    throw err;
            }
            fs.writeFile(TOKEN_PATH, JSON.stringify(token));

            console.log(`Token stored to ${TOKEN_PATH}`);
        }

        var getNewtoken = function(oauth2Client, callback) {
            var authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES
            });
            console.log(`Authorize this app by visiting this url: ${authUrl}`);
            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question('Enter the code from that page here: ', function(code) {
                rl.close();
                oauth2Client.getToken(code, function(err, token) {
                    if (err) {
                        console.log(`Error while trying to retrieve access token: ${err}`);
                        return;
                    }
                    oauth2Client.credentials = token;
                    storeToken(token);
                    callback(oauth2Client);
                });
            });
        };

        var authorize = function(credentials, callback) {
            var clientSecret = credentials.installed.client_secret;
            var clientId = credentials.installed.client_id;
            var redirectUrl = credentials.installed.redirect_uris[0];
            var auth = new googleAuth();


            var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

            console.log(`Reading token from ${require('path').resolve(TOKEN_PATH)}`);
            fs.readFile(TOKEN_PATH, function(err, token) {
                if (err) {
                    getNewtoken(oauth2Client, callback);
                } else {
                    oauth2Client.credentials = JSON.parse(token);
                    callback(oauth2Client);
                }
            })
        };


        fs.readFile('_private/client_secret.json', function processClientSecrets(err, content) {
            if (err) {
                console.log(`Error loading client secret file: ${err}`);
                return;
            }

            authorize(JSON.parse(content), listEvents);
        });
    }
}

module.exports = GoogleCalendarInput;
