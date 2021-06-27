import { JiraWorklog } from './JiraWorklog';

import fetch from 'node-fetch';
import { getLogger } from 'log4js';

export class JiraClient {
    private logger = getLogger('outputs/JiraWorklog/JiraClient');

    constructor(private baseUrl: string, private username: string, private password: string) {
        if (!baseUrl) throw new Error('Required parameter: baseUrl.');
        if (!username) throw new Error('Required parameter: username.');
        if (!password) throw new Error('Required parameter: password.');
    }

    async saveWorklog(ticketId: string, worklog: JiraWorklog): Promise<void> {
        this.validateTicketId(ticketId);
        this.validateWorklog(worklog);

        const url = `${this.baseUrl}/rest/api/2/issue/${ticketId}/worklog`;
        this.logger.debug('Sending to JIRA ', url, ':', worklog);

        try {
            const res = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(worklog),
                headers: this.getHeaders()
            });

            this.logger.trace(res);

            if (res.status != 201)
                throw new Error(`${ticketId} could not be sent to JIRA, JIRA responded with ${res.status}: ${res.statusText}`);

            return await res.json();
        } catch (e) {
            this.logger.error(e.name, e.message);
            throw e;
        }
    }

    private getHeaders(): Record<string, string> {
        return {
            'Authorization': this.getAuthorizationValue(),
            'Content-Type': 'application/json'
        };
    }

    private validateTicketId(ticketId: string): void {
        if (!ticketId) throw new Error('Required parameter: ticketId.');
    }

    private validateWorklog(worklog: JiraWorklog): void {
        if (!worklog) throw new Error('Required parameter: worklog.');
    }

    private getAuthorizationValue(): string {
        const encodedCredentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        return `Basic ${encodedCredentials}`;
    }
}
