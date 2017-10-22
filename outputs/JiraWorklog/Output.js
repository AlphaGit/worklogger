const OutputBase = require('../OutputBase');
const JiraClientRequired = require('./JiraClient');

module.exports = class JiraWorklogOutput extends OutputBase {
    constructor(formatter, outputConfiguration, { JiraClient = JiraClientRequired } = {}) {
        super(formatter, outputConfiguration);

        const baseUrl = outputConfiguration.JiraUrl;
        const userName = outputConfiguration.JiraUsername;
        const password = outputConfiguration.JiraPassword;
        this._jiraClient = new JiraClient(baseUrl, userName, password);
    }

    outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        const sendingToJiraPromises = worklogSet.worklogs.map(w => {
            const ticketId = w.getTagValue('JiraTicket');
            const jiraWorklog = {
                comment: w.name,
                started: this._getDateTimeString(w.startDateTime),
                timeSpent: w.duration + 'm'
            };
            this._jiraClient.saveWorklog(ticketId, jiraWorklog);
        });

        return Promise.all(sendingToJiraPromises);
    }

    // JIRA does not like Zulu time, so we cannot just use date.ToISOString()
    // This will return a ISO8601 string in the local time zone
    // Adapted from https://gist.github.com/peterbraden/752376#gistcomment-962193
    _getDateTimeString(date) {
        const pad = function (n) { return n < 10 ? '0' + n : n; }
        const tz = date.getTimezoneOffset(); // mins
        let zzzz = (tz > 0 ? "-" : "+") + pad(parseInt(Math.abs(tz / 60)));

        if (zzzz % 60 != 0)
            zzzz += pad(Math.abs(tz % 60));

        const yyyy = date.getFullYear();
        const MM = pad(date.getMonth() + 1);
        const dd = pad(date.getDate());
        const HH = pad(date.getHours());
        const mm = pad(date.getMinutes());
        const ss = pad(date.getSeconds());
        const fff = '000';

        return `${yyyy}-${MM}-${dd}T${HH}:${mm}:${ss}.${fff}${zzzz}`;
    }
};