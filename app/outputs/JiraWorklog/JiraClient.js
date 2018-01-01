const fetchRequired = require('node-fetch');
const logger = require('app/services/loggerFactory').getLogger('outputs/JiraWorklog/JiraClient');

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
        logger.trace('Sending to', url, ':', worklog);
        return this._fetch(url, {
            method: 'POST',
            body: JSON.stringify(worklog),
            headers: this._getHeaders()
        }).then(res => res.json())
            .then(logger.trace.bind(logger));
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