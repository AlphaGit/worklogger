const OutputBase = require('../OutputBase');
const JiraClientRequired = require('./JiraClient');
const logger = require('app/services/loggerFactory').getLogger('outputs/JiraWorklog');
const moment = require('moment-timezone');

module.exports = class JiraWorklogOutput extends OutputBase {
    constructor(formatter, outputConfiguration, appConfiguration, { JiraClient = JiraClientRequired } = {}) {
        super(formatter, outputConfiguration, appConfiguration);

        const baseUrl = outputConfiguration.JiraUrl;
        const userName = outputConfiguration.JiraUsername;
        const password = outputConfiguration.JiraPassword;
        this._jiraClient = new JiraClient(baseUrl, userName, password);
    }

    outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        var filteredWorklogs = this._getWorklogsWithJiraTicket(worklogSet.worklogs);

        const sendingToJiraPromises = filteredWorklogs.map(w => {
            return this._jiraClient.saveWorklog(w.jiraTicket, w.jiraWorklog);
        });

        return Promise.all(sendingToJiraPromises).then(p => {
            logger.info(`Sent ${p.length} worklogs to JIRA.`);
        });
    }

    _getWorklogsWithJiraTicket(worklogs) {
        let filteredWorklogs = [];
        (worklogs || []).forEach(w => {
            let jiraTicketTagValue = w.getTagValue('JiraTicket');
            if (!jiraTicketTagValue) {
                logger.warn(`Not sent to JIRA, missing JiraTicket: ${w.toOneLinerString()}`);
            } else {
                filteredWorklogs.push({ jiraTicket: jiraTicketTagValue, jiraWorklog: this._mapToJiraWorklog(w) });
            }
        });
        return filteredWorklogs;
    }

    _mapToJiraWorklog(worklog) {
        const timeZone = this._appConfiguration.timeZone;

        return {
            comment: worklog.name,
            started: moment.tz(worklog.startDateTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
            timeSpent: worklog.duration + 'm'
        };
    }
};