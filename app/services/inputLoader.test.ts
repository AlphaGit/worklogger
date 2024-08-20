import { AppConfigurations, ServiceRegistrations } from "../../tests/entities";
import { loadInputs } from "./inputLoader";
import { Input as GoogleCalendarInput } from "../inputs/GoogleCalendar";
import { Input as HarvestAppInput } from "../inputs/HarvestApp";

describe('loadInputs', () => {
    const serviceRegistations = ServiceRegistrations.mock();
    const appConfiguration = AppConfigurations.normal();

    test('loads specified inputs and their configurations', async () => {
        const config = {
            ...appConfiguration,
            inputs: [{
                type: 'GoogleCalendar',
                name: 'input1',
                storageRelativePath: '.',
                enabled: true,
            }, {
                type: 'HarvestApp',
                name: 'input2',
                storageRelativePath: '.',
                accountId: '1234',
                token: '1234',
                contactInformation: "abc <abc@example.com>",
                enabled: true
            }]
        };

        const results = await loadInputs(serviceRegistations, config);

        expect(results.length).toBe(2);
        expect(results[0].name).toBe('input1');
        expect(results[0]).toBeInstanceOf(GoogleCalendarInput);

        expect(results[1].name).toBe('input2');
        expect(results[1]).toBeInstanceOf(HarvestAppInput);
test('only loads inputs with enabled: true', async () => {
    const config = {
        ...appConfiguration,
        inputs: [{
            type: 'GoogleCalendar',
            name: 'input1',
            storageRelativePath: '.',
            enabled: true,
        }, {
            type: 'HarvestApp',
            name: 'input2',
            storageRelativePath: '.',
            accountId: '1234',
            token: '1234',
            contactInformation: "abc <abc@example.com>",
            enabled: false
        }]
    };

    const results = await loadInputs(serviceRegistations, config);

    expect(results.length).toBe(1);
    expect(results[0].name).toBe('input1');
    expect(results[0]).toBeInstanceOf(GoogleCalendarInput);
test('returns an empty array when all inputs have enabled: false', async () => {
    const config = {
        ...appConfiguration,
        inputs: [{
            type: 'GoogleCalendar',
            name: 'input1',
            storageRelativePath: '.',
            enabled: false,
        }, {
            type: 'HarvestApp',
            name: 'input2',
            storageRelativePath: '.',
            accountId: '1234',
            token: '1234',
            contactInformation: "abc <abc@example.com>",
            enabled: false
        }]
    };

    const results = await loadInputs(serviceRegistations, config);

    expect(results.length).toBe(0);
});
});