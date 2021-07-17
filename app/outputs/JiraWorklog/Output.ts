import { OutputBase } from '../OutputBase';
import { JiraClient } from './JiraClient';
import { FormatterBase } from '../../formatters/FormatterBase';
import { AppConfiguration } from '../../models/AppConfiguration';
import { WorklogSet } from '../../models/WorklogSet';
import { Worklog } from '../../models/Worklog';
import { JiraWorklog } from './JiraWorklog';
import { IJiraWorklogOutputConfiguration } from './IJiraWorklogOutputConfiguration';

import * as moment from 'moment-timezone';
import { getLogger } from 'log4js';

interface IJiraTicketWithWorklog {
    jiraTicket: string;
    jiraWorklog: JiraWorklog;
}

export class JiraWorklogOutput extends OutputBase {
    private logger = getLogger('outputs/JiraWorklog/Output');
    private _jiraClient: JiraClient;

    constructor(formatter: FormatterBase, outputConfiguration: IJiraWorklogOutputConfiguration, appConfiguration: AppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);

        this._jiraClient = new JiraClient(outputConfiguration);
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const filteredWorklogs = this.getWorklogsWithJiraTicket(worklogSet.worklogs);

        const sendingToJiraPromises = filteredWorklogs.map(w => {
            return this._jiraClient.saveWorklog(w.jiraTicket, w.jiraWorklog);
        });

        return await Promise.all(sendingToJiraPromises).then(p => {
            this.logger.info(`Sent ${p.length} worklogs to JIRA.`);
        });
    }

    private getWorklogsWithJiraTicket(worklogs: Worklog[]): IJiraTicketWithWorklog[] {
        const filteredWorklogs: IJiraTicketWithWorklog[] = [];
        (worklogs || []).forEach(w => {
            const jiraTicketTagValue = w.getTagValue('JiraTicket');
            if (!jiraTicketTagValue) {
                this.logger.warn(`Not sent to JIRA, missing JiraTicket: ${w.toOneLinerString()}`);
            } else {
                filteredWorklogs.push({ jiraTicket: jiraTicketTagValue, jiraWorklog: this.mapToJiraWorklog(w) });
            }
        });
        return filteredWorklogs;
    }

    private mapToJiraWorklog(worklog: Worklog): JiraWorklog {
        const timeZone = this._appConfiguration.options.timeZone;

        return {
            comment: worklog.name,
            started: moment.tz(worklog.startDateTime, timeZone).format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
            timeSpent: worklog.getDurationInMinutes() + 'm'
        };
    }
}