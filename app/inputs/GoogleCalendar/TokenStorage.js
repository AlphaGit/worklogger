// from https://developers.google.com/google-apps/calendar/quickstart/nodejs
const fsRequired = require('fs');
const readlineRequired = require('readline');
const googleApisRequired = require('googleapis').google;
const logger = require('app/services/loggerFactory').getLogger('GoogleCalendarInput/TokenStorage');

const util = require('util');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'worklogger_home/worklogger.json';

module.exports = class TokenStorage {
    constructor(fs = fsRequired,
        readline = readlineRequired,
        googleApis = googleApisRequired) {
        this.readline = readline;
        this.googleApis = googleApis;

        this.fs = fs;
        this.readFile = (fileName, encoding) => util.promisify(this.fs.readFile)(fileName, encoding);
        this.writeFile = (fileName, content) => util.promisify(this.fs.writeFile)(fileName, content);
    }

    async authorize(credentials) {
        const clientSecret = credentials.installed.client_secret;
        const clientId = credentials.installed.client_id;
        const redirectUrl = credentials.installed.redirect_uris[0];

        const oauth2Client = new this.googleApis.auth.OAuth2(clientId, clientSecret, redirectUrl);

        logger.debug(`Reading token from ${require('path').resolve(TOKEN_PATH)}`);

        try {
            const token = await this.readFile(TOKEN_PATH, 'utf8');
            logger.trace('Google App token read:', token);
            oauth2Client.credentials = JSON.parse(token);
            return oauth2Client;
        } catch (err) {
            logger.warn('Token could not be read:', err);
            return await this._getNewtoken(oauth2Client);
        }
    }

    async _storeToken(token) {
        await this.writeFile(TOKEN_PATH, JSON.stringify(token));
        logger.debug(`Token stored to ${TOKEN_PATH}`);
        return token;
    }

    async _getNewtoken(oauth2Client) {
        var authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        logger.info(`Authorize this app by visiting this url: ${authUrl}`);

        const { askQuestion, closeInterface } = this.getQuestionInterface();
        const code = await askQuestion('Enter the code from that page here: ');
        closeInterface();

        try {
            const getToken = util.promisify(oauth2Client.getToken);
            const token = await getToken(code);

            await this._storeToken(token);
            oauth2Client.credentials = token;
            return oauth2Client;
        } catch (err) {
            throw new Error(`Error while trying to retrieve access token: ${err}`);
        }
    }

    getQuestionInterface() {
        // Inspired from: https://gist.github.com/tinovyatkin/4316e302d8419186fe3c6af3f26badff
        var rl = this.readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Prepare readline.question for promisification
        rl.question[util.promisify.custom] = (question) => {
            return new Promise((resolve) => {
                rl.question(question, resolve);
            });
        }
        askQuestion = util.promisify(rl.question);
        return {
            askQuestion,
            closeInterface: rl.close
        }
    }
};
