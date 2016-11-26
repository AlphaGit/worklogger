// from https://developers.google.com/google-apps/calendar/quickstart/nodejs
var fs = require('fs');
let readline = require('readline');
let googleAuth = require('google-auth-library');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_DIR = '.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'worklogger.json';

module.exports = {
    authorize: authorize
};

function storeToken(token) {
    return new Promise((resolve) => {
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

function authorize(credentials) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new googleAuth();

    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    console.log(`Reading token from ${require('path').resolve(TOKEN_PATH)}`);
    return new Promise((resolve) => {
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) {
                resolve(getNewtoken(oauth2Client));
            } else {
                oauth2Client.credentials = JSON.parse(token);
                resolve(oauth2Client);
            }
        });
    });
}

function getNewtoken(oauth2Client) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log(`Authorize this app by visiting this url: ${authUrl}`);
    var rl = readline.createInterface({
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

                storeToken(token).then(() => {
                    oauth2Client.credentials = token;
                    resolve(oauth2Client);
                });
            });
        });
    });
}
