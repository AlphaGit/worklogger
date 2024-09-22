import { beforeEach, describe, test, expect } from "@jest/globals";

import { JiraClient, JiraWorklog, IJiraWorklogOutputConfiguration } from '.';
import fetchMock from 'jest-fetch-mock';

const jiraClientConfiguration: IJiraWorklogOutputConfiguration = {
    JiraUrl: 'https://jira.example.com',
    JiraUsername: 'username',
    JiraPassword: 'password',
    type: 'Jira',
    condition: null,
    excludeFromNonProcessedWarning: false,
    formatter: null
};

describe('constructor', () => {
    test('requires a jiraBaseUrl', () => {
        expect(() => new JiraClient({ ...jiraClientConfiguration, JiraUrl: null })).toThrow('Required parameter: baseUrl.');
        expect(() => new JiraClient({ ...jiraClientConfiguration, JiraUrl: undefined })).toThrow('Required parameter: baseUrl.');
        expect(() => new JiraClient({ ...jiraClientConfiguration, JiraUrl: '' })).toThrow('Required parameter: baseUrl.');
    });

    test('requires a jiraUsername', () => {
        expect(() => new JiraClient({ ...jiraClientConfiguration, JiraUsername: null })).toThrow('Required parameter: username.');
        expect(() => new JiraClient({ ...jiraClientConfiguration, JiraUsername: undefined })).toThrow('Required parameter: username.');
        expect(() => new JiraClient({ ...jiraClientConfiguration, JiraUsername: '' })).toThrow('Required parameter: username.');
    });

    test('requires a jiraPassword', () => {
        expect(() => new JiraClient({ ...jiraClientConfiguration, JiraPassword: null })).toThrow('Required parameter: password.');
        expect(() => new JiraClient({ ...jiraClientConfiguration, JiraPassword: undefined })).toThrow('Required parameter: password.');
        expect(() => new JiraClient({ ...jiraClientConfiguration, JiraPassword: '' })).toThrow('Required parameter: password.');
    });
});

describe('saveWorklog', () => {
    let jiraClient: JiraClient;
    let jiraWorklog: JiraWorklog;

    beforeEach(() => {
        jiraClient = new JiraClient(jiraClientConfiguration);
        jiraWorklog = new JiraWorklog('worklogComment', '2021-01-03T08:00:00-0500', '2h');

        fetchMock.resetMocks()
        fetchMock.mockResponse('{}', { status: 201 });
    });

    test('requires a ticketId', async () => {
        await expect(async () => jiraClient.saveWorklog(null, jiraWorklog)).rejects.toThrow('Required parameter: ticketId.');
        await expect(async () => jiraClient.saveWorklog(undefined, jiraWorklog)).rejects.toThrow('Required parameter: ticketId.');
        await expect(async () => jiraClient.saveWorklog('', jiraWorklog)).rejects.toThrow('Required parameter: ticketId.');
    });

    test('requires a worklog', async () => {
        await expect(async () => jiraClient.saveWorklog('TKT-123', null)).rejects.toThrow('Required parameter: worklog.');
        await expect(async () => jiraClient.saveWorklog('TKT-123', undefined)).rejects.toThrow('Required parameter: worklog.');
    });

    test('it sends worklogs to Jira', async () => {
        const ticketNumber = 'TKT-123';
        await jiraClient.saveWorklog(ticketNumber, jiraWorklog);

        expect(fetchMock).toHaveBeenCalledTimes(1);

        const [actualUrl, actualOptions] = fetchMock.mock.calls[0];

        const expectedUrl = `https://jira.example.com/rest/api/2/issue/${ticketNumber}/worklog`;
        expect(actualUrl).toBe(expectedUrl);

        expect(actualOptions).toBeTruthy();
        expect(actualOptions?.method).toBe('POST');
        expect(actualOptions.headers['Authorization']).toBe(`Basic ${Buffer.from('username:password').toString('base64')}`);
        expect(actualOptions.headers['Content-Type']).toBe('application/json');

        const actualBody = JSON.parse(actualOptions.body.toString()) as JiraWorklog;
        expect(actualBody).toEqual(jiraWorklog);
    });

    test('it reports errors', async () => {
        fetchMock.mockClear().mockRejectedValue(new Error('someError'));
        const ticketNumber = 'TKT-123';

        await expect(async () => await jiraClient.saveWorklog(ticketNumber, jiraWorklog)).rejects.toThrow('someError');
    });

    test('it reports errors when answer is not HTTP 201', async () => {
        fetchMock.mockClear().mockResolvedValue(new Response('{}', { status: 302 }));
        const ticketNumber = 'TKT-123';

        await expect(async () => await jiraClient.saveWorklog(ticketNumber, jiraWorklog)).rejects.toThrow('TKT-123 could not be sent to JIRA, JIRA responded with 302: Found');
    });
});