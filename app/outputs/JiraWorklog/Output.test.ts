import { IJiraClient, JiraWorklogOutput } from '.';
import { AppConfigurations, Formatters, WorklogSets } from '../../../tests/entities';
import { Tag } from '../../models';
import { IJiraWorklogOutputConfiguration } from './IJiraWorklogOutputConfiguration';

import * as moment from "moment-timezone";

const jiraClientMock: IJiraClient = {
    saveWorklog: jest.fn()
};
const jiraClientConstructorMock = jest.fn().mockReturnValue(jiraClientMock);

jest.mock('./JiraClient', () => ({
    JiraClient: (...args) => jiraClientConstructorMock(...args)
}));

const outputConfiguration = {
    JiraUrl: 'https://jira.example.com/',
    JiraPassword: 'Qwerty123',
    JiraUsername: 'Username123'
} as IJiraWorklogOutputConfiguration;

describe('constructor', () => {
    test('instantiates a JiraClient with the configured options', () => {
        new JiraWorklogOutput(Formatters.fake(), outputConfiguration, AppConfigurations.normal());

        expect(jiraClientConstructorMock).toHaveBeenCalledWith(outputConfiguration);
    });
});

describe('outputWorklogSet', () => {
    const output = new JiraWorklogOutput(Formatters.fake(), outputConfiguration, AppConfigurations.normal());

    test('performs worklogSet validation', async () => {
        expect(async () => await output.outputWorklogSet(null)).rejects.toThrow('Required parameter: worklogSet.');
        expect(async () => await output.outputWorklogSet(undefined)).rejects.toThrow('Required parameter: worklogSet.');
    });

    test('passes filtered worklogs to jiraClient', async () => {
        const worklogSet = WorklogSets.mixed();
        const passingWorklog = worklogSet.worklogs[0];
        passingWorklog.addTag(new Tag('JiraTicket', 'TEST-123'));

        await output.outputWorklogSet(worklogSet);

        expect(worklogSet.worklogs.length).toBe(3);
        expect(jiraClientMock.saveWorklog).toHaveBeenCalledTimes(1);
        expect(jiraClientMock.saveWorklog).toHaveBeenCalledWith('TEST-123', {
            comment: passingWorklog.name,
            timeSpent: `${passingWorklog.getDurationInMinutes()}m`,
            started: moment(passingWorklog.startDateTime).format('YYYY-MM-DDTHH:mm:ss.SSSZZ')
        });
    });

    test('works with empty worklogSets', async () => {
        const worklogSet = WorklogSets.empty();
        worklogSet.worklogs = undefined;
        await output.outputWorklogSet(worklogSet);
        expect(jiraClientMock.saveWorklog).not.toHaveBeenCalled();
    });
});