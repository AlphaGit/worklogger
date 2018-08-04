const nodeFetch = require('node-fetch');
const fetchRequired = require('fetch-event/node')(nodeFetch).fetch;
const logger = require('app/services/loggerFactory').getLogger('outputs/JiraWorklog/JiraClient');

fetchRequired.on('fetch', event => {
    logger.trace(event.request);
});

module.exports = class JiraClient {
    constructor(jiraBaseUrl, jiraUsername, jiraPassword, { fetch = fetchRequired } = {}) {
        if (!jiraBaseUrl) throw new Error('Required parameter: jiraBaseUrl.');
        if (!jiraUsername) throw new Error('Required parameter: jiraUsername.');
        if (!jiraPassword) throw new Error('Required parameter: jiraPassword.');

        this._fetch = fetch;
        this._baseUrl = jiraBaseUrl;
        this._username = jiraUsername;
        this._password = jiraPassword;
    }

    saveWorklog(ticketId, worklog) {
        this._validateTicketId(ticketId);
        this._validateWorklog(worklog);

        const url = `${this._baseUrl}/rest/api/2/issue/${ticketId}/worklog`;
        logger.debug('Sending to JIRA ', url, ':', worklog);
        return this._fetch(url, {
            method: 'POST',
            body: JSON.stringify(worklog),
            headers: this._getHeaders()
        }).then(res => {
            logger.trace(res);

            if (res.status != 201)
                throw new Error(`${ticketId} could not be sent to JIRA, JIRA responded with ${res.status}: ${res.statusText}`);

            return res;
        }).then(res => res.json())
        .catch(e => {
            logger.error(e.name, e.message);
        });
    }

    _getHeaders() {
        return {
            'Authorization': this._getAuthorizationValue(),
            'Content-Type': 'application/json'
        };
    }

    _validateTicketId(ticketId) {
        if (!ticketId) throw new Error('Required parameter: ticketId.');
    }

    _validateWorklog(worklog) {
        if (!worklog) throw new Error('Required parameter: worklog.');
        if (!worklog.comment) throw new Error('Worklog requires comment field.');
        if (!worklog.started) throw new Error('Worklog requires started field.');
        if (!worklog.timeSpent) throw new Error('Worklog requires timeSpent field.');
    }

    _getAuthorizationValue() {
        const encodedCredentials = new Buffer(`${this._username}:${this._password}`).toString('base64');
        return `Basic ${encodedCredentials}`;
    }
};