// from https://developers.google.com/google-apps/calendar/quickstart/nodejs
const fsRequired = require('fs');
const readlineRequired = require('readline');
const googleAuthRequired = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = '.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'worklogger.json';

module.exports = class GoogleTokenStorage {
    constructor(fs = fsRequired, readline = readlineRequired, googleAuth = googleAuthRequired) {
        this.fs = fs;
        this.readline = readline;
        this.googleAuth = googleAuth;
    }

    authorize(credentials) {
        const clientSecret = credentials.installed.client_secret;
        const clientId = credentials.installed.client_id;
        const redirectUrl = credentials.installed.redirect_uris[0];
        const auth = new this.googleAuth();

        const oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

        //TODO configuration for logging
        //console.log(`Reading token from ${require('path').resolve(TOKEN_PATH)}`);
        return new Promise((resolve) => {
            this.fs.readFile(TOKEN_PATH, (err, token) => {
                if (err) {
                    resolve(this._getNewtoken(oauth2Client));
                } else {
                    oauth2Client.credentials = JSON.parse(token);
                    resolve(oauth2Client);
                }
            });
        });
    }

    _storeToken(token) {
        return new Promise((resolve) => {
            try {
                this.fs.mkdirSync(TOKEN_DIR);
            } catch (err) {
                if (err.code != 'EEXIST')
                    throw err;
            }
            this.fs.writeFile(TOKEN_PATH, JSON.stringify(token));
            console.log(`Token stored to ${TOKEN_PATH}`);
            resolve(token);
        });
    }

    _getNewtoken(oauth2Client) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log(`Authorize this app by visiting this url: ${authUrl}`);
        var rl = this.readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve, reject) => {
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oauth2Client.getToken(code, (err, token) => {
                    if (err) {
                        reject(`Error while trying to retrieve access token: ${err}`);
                        return;
                    }

                    this._storeToken(token).then(() => {
                        oauth2Client.credentials = token;
                        resolve(oauth2Client);
                    });
                });
            });
        });
    }
};
