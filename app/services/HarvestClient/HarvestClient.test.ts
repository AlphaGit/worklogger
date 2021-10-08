import { HarvestClient, IHarvestConfiguration } from ".";
import { HarvestClient as HarvestclientModel, HarvestProject, HarvestTask, HarvestTimeEntry } from "../../inputs/HarvestApp/Models";
import { Dates } from '../../../tests/entities';

import { mocked } from 'ts-jest/utils';
const { Response } = jest.requireActual('node-fetch');

import fetch from 'node-fetch';
jest.mock('node-fetch');

const harvestClientConfig = {
    accountId: 'accountId',
    contactInformation: 'email@example.com',
    token: 'exampleToken'
} as IHarvestConfiguration;

describe('constructor', () => {
    test('validates configuration', () => {
        expect(() => new HarvestClient(undefined)).toThrow('Missing parameter: configuration.');

        const withoutAccountId = { ...harvestClientConfig, accountId: undefined };
        expect(() => new HarvestClient(withoutAccountId)).toThrow('Required configuration: accountId.');

        const withoutToken = { ...harvestClientConfig, token: undefined };
        expect(() => new HarvestClient(withoutToken)).toThrow('Required configuration: token.');

        const withoutContactInfo = { ...harvestClientConfig, contactInformation: undefined };
        expect(() => new HarvestClient(withoutContactInfo)).toThrow('Required configuration: contactInformation.')
    });
});

describe('getTimeEntries', () => {
    test('makes request with the right parameters', async () => {
        const fetchMock = mocked(fetch);
        fetchMock.mockClear().mockResolvedValue(new Response(`{
            "time_entries": [{
                "spent_date": "2020-02-02",
                "started_time": "8:00",
                "ended_time": "9:00",
                "hours": 1,
                "notes": "Some notes",
                "client": {
                    "name": "ClientName"
                },
                "project": {
                    "name": "ProjectName"
                },
                "task": {
                    "name": "TaskName"
                },
                "project_id": 1,
                "task_id": 2
            }]
        }`, { status: 200 }));

        const harvestClient = new HarvestClient(harvestClientConfig);
        const times = { from: Dates.pastTwoHours(), to: Dates.now() };
        const response = await harvestClient.getTimeEntries(times);

        const url = new URL(`${HarvestClient.HarvestBaseUrl}/time_entries`);
        url.searchParams.set('from', times.from.toISOString());
        url.searchParams.set('to', times.to.toISOString());
        expect(fetchMock).toBeCalledWith(url.toString(), {
            headers: {
                Authorization: `Bearer ${harvestClientConfig.token}`,
                'Content-Type': 'application/json',
                'Harvest-Account-Id': harvestClientConfig.accountId,
                'User-Agent': `Worklogger (${harvestClientConfig.contactInformation})`
            }
        });

        expect(response).toStrictEqual([{
            spent_date: '2020-02-02',
            started_time: '8:00',
            ended_time: '9:00',
            hours: 1,
            notes: 'Some notes',
            client: {
                name: 'ClientName'
            },
            project: {
                name: 'ProjectName'
            },
            task: {
                name: 'TaskName'
            },
            project_id: 1,
            task_id: 2
        }]);
    });
});

describe('getProjectsAndTasks', () => {
    test('makes request with the right parameters', async () => {
        const fetchMock = mocked(fetch);
        fetchMock.mockClear().mockResolvedValue(new Response(`{
            "project_assignments": [{
                "project": {
                    "id": 1,
                    "name": "Project 1"
                },
                "task_assignments": [{
                    "task": {
                        "id": 2,
                        "name": "Task 2"
                    }
                }]
            }]
        }`, { status: 200 }));

        const harvestClient = new HarvestClient(harvestClientConfig);
        const response = await harvestClient.getProjectsAndTasks();

        const url = `${HarvestClient.HarvestBaseUrl}/users/me/project_assignments.json`;
        expect(fetchMock).toBeCalledWith(url, {
            headers: {
                Authorization: `Bearer ${harvestClientConfig.token}`,
                'Content-Type': 'application/json',
                'Harvest-Account-Id': harvestClientConfig.accountId,
                'User-Agent': `Worklogger (${harvestClientConfig.contactInformation})`
            }
        });

        expect(response).toStrictEqual([{
            projectId: 1,
            projectName: 'Project 1',
            tasks: [{
                taskId: 2,
                taskName: 'Task 2'
            }]
        }])
    });
});

describe('saveNewTimeEntry', () => {
    const timeEntry = new HarvestTimeEntry();
    timeEntry.client = new HarvestclientModel();
    timeEntry.client.name = 'Client 1';
    timeEntry.ended_time = '9 AM';
    timeEntry.hours = 1;
    timeEntry.notes = 'Notes';
    timeEntry.project = new HarvestProject();
    timeEntry.project.name = 'Project 1';
    timeEntry.project_id = 1;
    timeEntry.spent_date = '2020-02-02';
    timeEntry.started_time = '8 AM';
    timeEntry.task = new HarvestTask();
    timeEntry.task.name = 'Task 2';
    timeEntry.task_id = 2;

    test('makes request with the right parameters', async () => {
        const fetchMock = mocked(fetch);
        fetchMock.mockClear().mockResolvedValue(new Response('{}', { status: 201 }));

        const harvestClient = new HarvestClient(harvestClientConfig);
        await harvestClient.saveNewTimeEntry(timeEntry);

        const url = `${HarvestClient.HarvestBaseUrl}/time_entries`;
        expect(fetchMock).toBeCalledWith(url, {
            headers: {
                Authorization: `Bearer ${harvestClientConfig.token}`,
                'Content-Type': 'application/json',
                'Harvest-Account-Id': harvestClientConfig.accountId,
                'User-Agent': `Worklogger (${harvestClientConfig.contactInformation})`
            },
            method: 'POST',
            body: JSON.stringify(timeEntry)
        });
    });

    test('validates completeness of the time entry', async () => {
        const fetchMock = mocked(fetch);
        fetchMock.mockClear().mockResolvedValue(new Response('{}', { status: 201 }));

        const harvestClient = new HarvestClient(harvestClientConfig);

        await expect(async () => harvestClient.saveNewTimeEntry(undefined)).rejects.toThrow('Required parameter: timeEntry.');

        const withoutProjectId = { ...timeEntry, project_id: null };
        await expect(async () => harvestClient.saveNewTimeEntry(withoutProjectId)).rejects.toThrow('Time entry needs to have project_id.');

        const withoutTaskId = { ...timeEntry, task_id: null };
        await expect(async () => harvestClient.saveNewTimeEntry(withoutTaskId)).rejects.toThrow('Time entry needs to have task_id.');

        const withoutSpentDate = { ...timeEntry, spent_date: null };
        await expect(async () => harvestClient.saveNewTimeEntry(withoutSpentDate)).rejects.toThrow('Time entry needs to have spent_date.');

        const withoutHours = { ...timeEntry, hours: null };
        await expect(async () => harvestClient.saveNewTimeEntry(withoutHours)).rejects.toThrow('Time entry needs to have hours.');

        const withoutStartedTime = { ...timeEntry, started_time: null };
        await expect(async () => harvestClient.saveNewTimeEntry(withoutStartedTime)).rejects.toThrow('Time entry needs to have started_time.');

        const withoutEndedTime = { ...timeEntry, ended_time: null };
        await expect(async () => harvestClient.saveNewTimeEntry(withoutEndedTime)).rejects.toThrow('Time entry needs to have ended_time.');
    });
});