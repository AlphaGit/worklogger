import { mocked } from 'ts-jest/utils';
const { Response } = jest.requireActual('node-fetch');

import fetch from 'node-fetch';
jest.mock('node-fetch');

import { JiraClient, JiraWorklog } from '.';

describe('constructor', () => {
    test('requires a jiraBaseUrl', () => {
        expect(() => new JiraClient(null, 'userName', 'password')).toThrow('Required parameter: baseUrl.');
        expect(() => new JiraClient(undefined, 'userName', 'password')).toThrow('Required parameter: baseUrl.');
        expect(() => new JiraClient('', 'userName', 'password')).toThrow('Required parameter: baseUrl.');
    });

    test('requires a jiraUsername', () => {
        expect(() => new JiraClient('https://jira.example.com', null, 'password')).toThrow('Required parameter: username.');
        expect(() => new JiraClient('https://jira.example.com', undefined, 'password')).toThrow('Required parameter: username.');
        expect(() => new JiraClient('https://jira.example.com', '', 'password')).toThrow('Required parameter: username.');
    });

    test('requires a jiraPassword', () => {
        expect(() => new JiraClient('https://jira.example.com', 'username', null)).toThrow('Required parameter: password.');
        expect(() => new JiraClient('https://jira.example.com', 'username', undefined)).toThrow('Required parameter: password.');
        expect(() => new JiraClient('https://jira.example.com', 'username', '')).toThrow('Required parameter: password.');
    });
});

describe('saveWorklog', () => {
    let jiraClient: JiraClient;
    let jiraWorklog: JiraWorklog;
    const fetchMock = mocked(fetch);

    beforeEach(() => {
        jiraClient = new JiraClient('https://jira.example.com', 'username', 'password');
        jiraWorklog = new JiraWorklog('worklogComment', '2021-01-03T08:00:00-0500', '2h');
        fetchMock.mockClear().mockResolvedValue(new Response('{}', { status: 201 }));
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

        expect(actualOptions.method).toBe('POST');
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