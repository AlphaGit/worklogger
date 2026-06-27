import { jest, describe, test, expect } from "@jest/globals";

import { AppConfigurations, Dates, ServiceRegistrations } from '../../../tests/entities';
import { Input, HarvestTask, HarvestTimeEntry, HarvestProject, HarvestClient } from '.';

const getTimeEntriesMock = jest.fn().mockResolvedValue([]);
jest.mock('../../services/HarvestClient/HarvestClient', () => ({
    HarvestClient: jest.fn().mockImplementation(() => ({
        getTimeEntries: getTimeEntriesMock
    }))
}));


const harvestInputConfiguration = {
    name: 'Company1 Harvest',
    accountId: 'id1234',
    token: 'token123',
    contactInformation: 'test@example.com',
};

describe('constructor', () => {
    test('requires an appConfiguration', () => {
        expect(() => new Input(ServiceRegistrations.mock(), null, harvestInputConfiguration)).toThrow('App configuration for Harvest App input is required.');
        expect(() => new Input(ServiceRegistrations.mock(), undefined, harvestInputConfiguration)).toThrow('App configuration for Harvest App input is required.');
    });
});

describe('name', () => {
    test('returns the name given through configuration', () => {
        const input = new Input(ServiceRegistrations.mock(), AppConfigurations.normal(), harvestInputConfiguration);

        expect(input.name).toBe(harvestInputConfiguration.name);
    });
});

describe('getWorkLogs', () => {
    test('calls the HarvestClient', async () => {
        const input = new Input(ServiceRegistrations.mock(), AppConfigurations.normal(), harvestInputConfiguration);
        const from = Dates.pastOneHour();
        const to = Dates.now();

        await input.getWorkLogs(from, to);

        expect(getTimeEntriesMock).toHaveBeenCalledWith({ from, to });
    });

    test('parses timeEntries into worklogs', async () => {
        const input = new Input(ServiceRegistrations.mock(), AppConfigurations.normal(), harvestInputConfiguration);
        const from = Dates.pastOneHour();
        const to = Dates.now();

        // Start and end date and time
        const timeEntry1 = new HarvestTimeEntry();
        timeEntry1.client = new HarvestClient();
        timeEntry1.client.name = 'ProCorp';
        timeEntry1.ended_time = '10:00 AM';
        timeEntry1.started_time = '9:00 AM';
        timeEntry1.notes = 'Sync meeting';
        timeEntry1.project = new HarvestProject();
        timeEntry1.project.name = 'Test Platform';
        timeEntry1.project_id = 123;
        timeEntry1.spent_date = '2021-01-03';
        timeEntry1.task = new HarvestTask();
        timeEntry1.task.name = 'Research';
        timeEntry1.task_id = 234;

        // Only date and hour duration
        const timeEntry2 = new HarvestTimeEntry();
        timeEntry2.client = new HarvestClient();
        timeEntry2.client.name = 'ProCorp';
        timeEntry2.notes = 'Reviewing options';
        timeEntry2.project = new HarvestProject();
        timeEntry2.project.name = 'Test Platform';
        timeEntry2.project_id = 123;
        timeEntry2.spent_date = '2021-01-03';
        timeEntry2.hours = 2;
        timeEntry2.task = new HarvestTask();
        timeEntry2.task.name = 'Research';
        timeEntry2.task_id = 234;

        // Incomplete: no start/end indications
        const timeEntry3 = new HarvestTimeEntry();
        timeEntry3.client = new HarvestClient();
        timeEntry3.client.name = 'ProCorp';
        timeEntry3.notes = 'Reviewing options';
        timeEntry3.project = new HarvestProject();
        timeEntry3.project.name = 'Test Platform';
        timeEntry3.project_id = 123;
        timeEntry3.task = new HarvestTask();
        timeEntry3.task.name = 'Research';
        timeEntry3.task_id = 234;

        getTimeEntriesMock.mockResolvedValue([timeEntry1, timeEntry2, timeEntry3]);

        const worklogs = await input.getWorkLogs(from, to);

        expect(worklogs.length).toBe(2);
        const [worklog1, worklog2] = worklogs;

        expect(worklog1.startDateTime).toEqual(new Date('2021-01-03T09:00:00-0800'));
        expect(worklog1.endDateTime).toEqual(new Date('2021-01-03T10:00:00-0800'));
        expect(worklog1.name).toBe('Sync meeting');
        expect(worklog1.getTagValue('HarvestClient')).toBe('ProCorp');
        expect(worklog1.getTagValue('HarvestTask')).toBe('Research');
        expect(worklog1.getTagValue('HarvestProject')).toBe('Test Platform');

        expect(worklog2.startDateTime).toEqual(new Date('2021-01-03T00:00:00-0800'));
        expect(worklog2.endDateTime).toEqual(new Date('2021-01-03T02:00:00-0800'));
        expect(worklog2.name).toBe('Reviewing options');
        expect(worklog2.getTagValue('HarvestClient')).toBe('ProCorp');
        expect(worklog2.getTagValue('HarvestTask')).toBe('Research');
        expect(worklog2.getTagValue('HarvestProject')).toBe('Test Platform');
    });
});