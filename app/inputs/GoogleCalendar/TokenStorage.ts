// from https://developers.google.com/google-apps/calendar/quickstart/nodejs
import { fs as fsRequired } from 'fs';
import { googleApis } from 'googleapis';
import { readline as readlineRequired } from 'readline';
const googleApisRequired = googleApis.google;

import { LoggerFactory } from 'app/services/loggerFactory';
const logger = LoggerFactory.getLogger('GoogleCalendarInput/TokenStorage');

import { util } from 'util';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'worklogger_home/worklogger.json';

module.exports = class TokenStorage {
    private readline: any;
    private googleApis: any;
    private fs: any;
    private writeFile: (fileName: any, content: any) => any;

    constructor(fs = fsRequired,
                readline = readlineRequired,
                googleApis = googleApisRequired) {
        this.readline = readline;
        this.googleApis = googleApis;

        this.fs = fs;
        this.writeFile = (fileName, content) => util.promisify(this.fs.writeFile)(fileName, content);
    }

    public getQuestionInterface() {
        // Inspired from: https://gist.github.com/tinovyatkin/4316e302d8419186fe3c6af3f26badff
        const rl = this.readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // Prepare readline.question for promisification
        rl.question[util.promisify.custom] = (question) => {
            return new Promise((resolve) => {
                rl.question(question, resolve);
            });
        };
        const askQuestion = util.promisify(rl.question);
        return {
            askQuestion,
            closeInterface: rl.close,
        };
    }

    private async _storeToken(token) {
        await this.writeFile(TOKEN_PATH, JSON.stringify(token));
        logger.debug(`Token stored to ${TOKEN_PATH}`);
        return token;
    }

    private async _getNewtoken(oauth2Client) {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        logger.info(`Authorize this app by visiting this url: ${authUrl}`);

        const { askQuestion, closeInterface } = this.getQuestionInterface();
        const code = await askQuestion('Enter the code from that page here: ');
        closeInterface();

        try {
            const getToken = util.promisify(oauth2Client.getToken);
            const token = await getToken(code);

            await this._storeToken(token);
            oauth2Client.credentials = token; // eslint-disable-line require-atomic-updates
            return oauth2Client;
        } catch (err) {
            throw new Error(`Error while trying to retrieve access token: ${err}`);
        }
    }
};
