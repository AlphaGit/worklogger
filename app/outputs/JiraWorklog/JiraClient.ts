import fetch from 'node-fetch';

import LoggerFactory from '../../services/LoggerFactory';
import { JiraWorklog } from './JiraWorklog';
const logger = LoggerFactory.getLogger('outputs/JiraWorklog/JiraClient');

export class JiraClient {
    private _fetch: typeof fetch;
    private _baseUrl: string;
    private _username: string;
    private _password: string;

    constructor(jiraBaseUrl: string, jiraUsername: string, jiraPassword: string) {
        if (!jiraBaseUrl) throw new Error('Required parameter: jiraBaseUrl.');
        if (!jiraUsername) throw new Error('Required parameter: jiraUsername.');
        if (!jiraPassword) throw new Error('Required parameter: jiraPassword.');

        this._fetch = fetch;
        this._baseUrl = jiraBaseUrl;
        this._username = jiraUsername;
        this._password = jiraPassword;
    }

    async saveWorklog(ticketId: string, worklog: JiraWorklog): Promise<void> {
        this._validateTicketId(ticketId);
        this._validateWorklog(worklog);

        const url = `${this._baseUrl}/rest/api/2/issue/${ticketId}/worklog`;
        logger.debug('Sending to JIRA ', url, ':', worklog);

        try {
            const res = await this._fetch(url, {
                method: 'POST',
                body: JSON.stringify(worklog),
                headers: this._getHeaders()
            });

            logger.trace(res);

            if (res.status != 201)
                throw new Error(`${ticketId} could not be sent to JIRA, JIRA responded with ${res.status}: ${res.statusText}`);

            return await res.json();
        } catch (e) {
            logger.error(e.name, e.message);
        }
    }

    _getHeaders(): Record<string, string> {
        return {
            'Authorization': this._getAuthorizationValue(),
            'Content-Type': 'application/json'
        };
    }

    _validateTicketId(ticketId: string): void {
        if (!ticketId) throw new Error('Required parameter: ticketId.');
    }

    _validateWorklog(worklog: JiraWorklog): void {
        if (!worklog) throw new Error('Required parameter: worklog.');
        if (!worklog.comment) throw new Error('Worklog requires comment field.');
        if (!worklog.started) throw new Error('Worklog requires started field.');
        if (!worklog.timeSpent) throw new Error('Worklog requires timeSpent field.');
    }

    _getAuthorizationValue(): string {
        const encodedCredentials = Buffer.from(`${this._username}:${this._password}`).toString('base64');
        return `Basic ${encodedCredentials}`;
    }
}