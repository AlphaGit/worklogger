import { jest, describe, test, expect } from "@jest/globals";

import { JiraWorklogOutput } from '.';
import { AppConfigurations, Formatters, WorklogSets } from '../../../tests/entities';
import { Tag } from '../../models';
import { IJiraWorklogOutputConfiguration } from './IJiraWorklogOutputConfiguration';

import moment from "moment-timezone";

const saveWorklogMock = jest.fn().mockResolvedValue({})

jest.mock('./JiraClient', () => ({
    JiraClient: jest.fn().mockImplementation(() => ({
        saveWorklog: saveWorklogMock
    }))
}));

const outputConfiguration = {
    JiraUrl: 'https://jira.example.com/',
    JiraPassword: 'Qwerty123',
    JiraUsername: 'Username123'
} as IJiraWorklogOutputConfiguration;

describe('constructor', () => {
    test('instantiates a JiraClient with the configured options', () => {
        new JiraWorklogOutput(Formatters.fake(), outputConfiguration, AppConfigurations.normal());

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const classMock = require('./JiraClient').JiraClient;
        expect(classMock).toHaveBeenCalledTimes(1);
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
        expect(saveWorklogMock).toHaveBeenCalledTimes(1);
        expect(saveWorklogMock).toHaveBeenCalledWith('TEST-123', {
            comment: passingWorklog.name,
            timeSpent: `${passingWorklog.getDurationInMinutes()}m`,
            started: moment(passingWorklog.startDateTime).format('YYYY-MM-DDTHH:mm:ss.SSSZZ')
        });
    });

    test('works with empty worklogSets', async () => {
        const worklogSet = WorklogSets.empty();
        worklogSet.worklogs = undefined;
        await output.outputWorklogSet(worklogSet);
        expect(saveWorklogMock).not.toHaveBeenCalled();
    });
});