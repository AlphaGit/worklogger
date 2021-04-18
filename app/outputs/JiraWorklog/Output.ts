import { OutputBase } from '../OutputBase';
import { JiraClient } from './JiraClient';
import { LoggerFactory } from '../../services/LoggerFactory';
import { FormatterBase } from '../../formatters/FormatterBase';
import { AppConfiguration } from '../../models/AppConfiguration';
import { WorklogSet } from '../../models/WorklogSet';
import { Worklog } from '../../models/Worklog';
import { JiraWorklog } from './JiraWorklog';
import { IJiraWorklogOutputConfiguration } from './IJiraWorklogOutputConfiguration';

import moment from 'moment-timezone';

const logger = LoggerFactory.getLogger('outputs/JiraWorklog/Output');

interface IJiraTicketWithWorklog {
    jiraTicket: string;
    jiraWorklog: JiraWorklog;
}

export class JiraWorklogOutput extends OutputBase {
    _jiraClient: JiraClient;
    constructor(formatter: FormatterBase, outputConfiguration: IJiraWorklogOutputConfiguration, appConfiguration: AppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);

        const baseUrl = outputConfiguration.JiraUrl;
        const userName = outputConfiguration.JiraUsername;
        const password = outputConfiguration.JiraPassword;
        this._jiraClient = new JiraClient(baseUrl, userName, password);
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const filteredWorklogs = this._getWorklogsWithJiraTicket(worklogSet.worklogs);

        const sendingToJiraPromises = filteredWorklogs.map(w => {
            return this._jiraClient.saveWorklog(w.jiraTicket, w.jiraWorklog);
        });

        return await Promise.all(sendingToJiraPromises).then(p => {
            logger.info(`Sent ${p.length} worklogs to JIRA.`);
        });
    }

    _getWorklogsWithJiraTicket(worklogs: Worklog[]): IJiraTicketWithWorklog[] {
        const filteredWorklogs: IJiraTicketWithWorklog[] = [];
        (worklogs || []).forEach(w => {
            const jiraTicketTagValue = w.getTagValue('JiraTicket');
            if (!jiraTicketTagValue) {
                logger.warn(`Not sent to JIRA, missing JiraTicket: ${w.toOneLinerString()}`);
            } else {
                filteredWorklogs.push({ jiraTicket: jiraTicketTagValue, jiraWorklog: this._mapToJiraWorklog(w) });
            }
        });
        return filteredWorklogs;
    }

    _mapToJiraWorklog(worklog: Worklog): JiraWorklog {
        const timeZone = this._appConfiguration.timeZone;

        return {
            comment: worklog.name,
            started: moment.tz(worklog.startDateTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
            timeSpent: worklog.duration + 'm'
        };
    }
}