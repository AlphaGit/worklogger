// from https://developers.google.com/google-apps/calendar/quickstart/nodejs
import { writeFile } from 'fs';
import { createInterface } from 'readline';

import googleApis, { GoogleApis } from 'googleapis';
const googleApisRequired = googleApis.google;

import LoggerFactory from '../../services/LoggerFactory';
const logger = LoggerFactory.getLogger('GoogleCalendarInput/TokenStorage');

import { promisify }  from 'util';

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = 'worklogger_home/worklogger.json';

export class TokenStorage {
    private createInterface: any;
    private googleApis: GoogleApis;
    private writeFile: (fileName: any, content: any) => any;

    constructor(fs,
        ci = createInterface,
        googleApis = googleApisRequired) {
        this.createInterface = ci;
        this.googleApis = googleApis;

        const wf = fs.writeFile || writeFile;
        this.writeFile = (fileName, content) => promisify(wf)(fileName, content);
    }

    async _storeToken(token) {
        await this.writeFile(TOKEN_PATH, JSON.stringify(token));
        logger.debug(`Token stored to ${TOKEN_PATH}`);
        return token;
    }

    // TODO Move this into a class specific to console token retrieval
    async _getNewtoken(oauth2Client) {
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        logger.info(`Authorize this app by visiting this url: ${authUrl}`);

        const { askQuestion, closeInterface } = this.getQuestionInterface();
        const code = await askQuestion('Enter the code from that page here: ');
        closeInterface();

        try {
            const getToken = promisify(oauth2Client.getToken);
            const token = await getToken(code);

            await this._storeToken(token);
            oauth2Client.credentials = token; // eslint-disable-line require-atomic-updates
            return oauth2Client;
        } catch (err) {
            throw new Error(`Error while trying to retrieve access token: ${err}`);
        }
    }

    getQuestionInterface() {
        // Inspired from: https://gist.github.com/tinovyatkin/4316e302d8419186fe3c6af3f26badff
        const rl = this.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        // Prepare readline.question for promisification
        rl.question[promisify.custom] = (question) => {
            return new Promise((resolve) => {
                rl.question(question, resolve);
            });
        }
        const askQuestion = promisify(rl.question);
        return {
            askQuestion,
            closeInterface: rl.close
        }
    }
};
