const mockedEventsList = jest.fn().mockResolvedValue({ data: { items: [] } });
jest.mock('googleapis', () => ({
    google: {
        calendar: () => ({
            events: {
                list: mockedEventsList
            }
        }),
        auth: {
            OAuth2: jest.fn()
        }
    }
}));

import { Input, GoogleCalendarConfiguration, ModelMapper } from '.'
import { AppConfigurations, Dates, ServiceRegistrations } from '../../../tests/entities';
import { GoogleCalendarCalendarConfiguration } from './GoogleCalendarConfiguration';

describe('constructor', () => {
    test('requires serverRegistrations to be present', () => {
        expect(() => new Input(null, AppConfigurations.normal(), new GoogleCalendarConfiguration(), new ModelMapper())).toThrow('ServiceRegistrations for GoogleCalendarInput is required');
        expect(() => new Input(undefined, AppConfigurations.normal(), new GoogleCalendarConfiguration(), new ModelMapper())).toThrow('ServiceRegistrations for GoogleCalendarInput is required');
    });

    test('requires input configuration to be present', () => {
        expect(() => new Input(ServiceRegistrations.mock(), AppConfigurations.normal(), null, new ModelMapper())).toThrow('Configuration for GoogleCalendarInput is required');
        expect(() => new Input(ServiceRegistrations.mock(), AppConfigurations.normal(), undefined, new ModelMapper())).toThrow('Configuration for GoogleCalendarInput is required');
    });
});

describe('getWorklogs', () => {
    test('retrieves credentials from a configured storage', async () => {
        const serviceRegistrations = ServiceRegistrations.mock();
        serviceRegistrations.FileLoader.loadJson = jest.fn().mockResolvedValue({
            installed: {
                client_id: 'someClientId',
                client_secret: 'someClientSecret',
                redirect_uris: ['https://example.com']
            }
        });

        const configuration = new GoogleCalendarConfiguration();
        configuration.storageRelativePath = 'localPath/subPath';
        configuration.calendars = [new GoogleCalendarCalendarConfiguration()];

        const input = new Input(serviceRegistrations, AppConfigurations.normal(), configuration, new ModelMapper());

        await input.getWorkLogs(Dates.pastTwoHours(), Dates.now());

        expect(serviceRegistrations.FileLoader.loadJson).toHaveBeenCalledWith('localPath/subPath/google_client_secret.json');
    });

    test('throws if credentials cannot be read', () => {
        const serviceRegistrations = ServiceRegistrations.mock();
        serviceRegistrations.FileLoader.loadJson = jest.fn().mockImplementation(() => {
            throw new Error('Simulated credential error.');
        });

        const configuration = new GoogleCalendarConfiguration();
        configuration.storageRelativePath = 'localPath/subPath';
        configuration.calendars = [new GoogleCalendarCalendarConfiguration()];

        const input = new Input(serviceRegistrations, AppConfigurations.normal(), configuration, new ModelMapper());

        expect(async () => await input.getWorkLogs(Dates.pastTwoHours(), Dates.now())).rejects.toThrow('Simulated credential error.');
    });

    test('filters results from events that started after our start time', async () => {
        const serviceRegistrations = ServiceRegistrations.mock();
        serviceRegistrations.FileLoader.loadJson = jest.fn().mockResolvedValue({
            installed: {
                client_id: 'someClientId',
                client_secret: 'someClientSecret',
                redirect_uris: ['https://example.com']
            }
        });

        const configuration = new GoogleCalendarConfiguration();
        configuration.storageRelativePath = 'localPath/subPath';
        configuration.calendars = [new GoogleCalendarCalendarConfiguration()];

        mockedEventsList.mockResolvedValue({
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

        const input = new Input(serviceRegistrations, AppConfigurations.normal(), configuration, new ModelMapper());

        const worklogs = await input.getWorkLogs(Dates.pastOneHour(), Dates.now());

        expect(worklogs.length).toBe(1);
    });

    test('returns mapped worklogs from the event data', async () => {
        const serviceRegistrations = ServiceRegistrations.mock();
        serviceRegistrations.FileLoader.loadJson = jest.fn().mockResolvedValue({
            installed: {
                client_id: 'someClientId',
                client_secret: 'someClientSecret',
                redirect_uris: ['https://example.com']
            }
        });

        const configuration = new GoogleCalendarConfiguration();
        configuration.storageRelativePath = 'localPath/subPath';
        configuration.calendars = [new GoogleCalendarCalendarConfiguration()];

        mockedEventsList.mockResolvedValue({
            data: {
                items: [{
                    summary: 'Refinement meeting',
                    start: { dateTime: Dates.now() },
                    end: { dateTime: Dates.now() }
                }] 
            }
        });

        const input = new Input(serviceRegistrations, AppConfigurations.normal(), configuration, new ModelMapper());

        const [worklog] = await input.getWorkLogs(Dates.pastOneHour(), Dates.now());

        expect(worklog.name).toBe('Refinement meeting');
    });
});