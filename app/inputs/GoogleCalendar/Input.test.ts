import { jest, beforeEach, describe, test, expect } from "@jest/globals";

const mockedGetUserAuthenticatedOAuthClient = jest.fn();
jest.mock('../../services/authHandler', () => ({
    getUserAuthenticatedOAuthClient: mockedGetUserAuthenticatedOAuthClient
}));

import { Input, GoogleCalendarConfiguration } from '.'
import { AppConfigurations, Dates, ServiceRegistrations } from '../../../tests/entities';

const mockedGetEventsList = jest.fn();
jest.mock('googleapis', () => ({
    google: {
        calendar: () => ({
            events: {
                list: mockedGetEventsList
            }
        }),
        auth: {
            OAuth2Client: jest.fn()
        }
    }
}));

const defaultConfiguration: GoogleCalendarConfiguration = {
    calendars: [{
        id: '1@google.com',
        includeTags: []
    }],
    storageRelativePath: 'localPath/subPath',
    name: 'Google Calendar',
    type: 'GoogleCalendar'
};

describe('getWorklogs', () => {
    beforeEach(() => {
        mockedGetEventsList.mockResolvedValue({ data: { items: [] } });
        mockedGetUserAuthenticatedOAuthClient.mockResolvedValue({});
    });

    test('throws if credentials cannot be read', async () => {
        const serviceRegistrations = ServiceRegistrations.mock();
        mockedGetUserAuthenticatedOAuthClient.mockRejectedValue(new Error('Simulated credential error.'));

        const input = new Input(serviceRegistrations, AppConfigurations.normal(), defaultConfiguration);
        await expect(async () => await input.getWorkLogs(Dates.pastTwoHours(), Dates.now())).rejects.toThrow('Simulated credential error.');
    });

    test('filters results from events that started after our start time', async () => {
        mockedGetEventsList.mockResolvedValue({
            data: {
                items: [{
                    start: { dateTime: Dates.now() },
                    end: { dateTime: Dates.now() }
                }, {
                    start: { dateTime: Dates.pastTwoHours() },
                    end: { dateTime: Dates.now() }
                }] 
            }
        });

        const serviceRegistrations = ServiceRegistrations.mock();
        const input = new Input(serviceRegistrations, AppConfigurations.normal(), defaultConfiguration);

        const worklogs = await input.getWorkLogs(Dates.pastOneHour(), Dates.now());

        expect(worklogs.length).toBe(1);
    });

    test('throws if the calendar API fails', async () => {
        const errorMessage = 'Simulated calendar API error.';
        mockedGetEventsList.mockImplementation(() => {
            throw new Error(errorMessage);
        });

        const serviceRegistrations = ServiceRegistrations.mock();
        const input = new Input(serviceRegistrations, AppConfigurations.normal(), defaultConfiguration);

        await expect(async () => await input.getWorkLogs(Dates.pastTwoHours(), Dates.now())).rejects.toThrow(errorMessage);
    });
});