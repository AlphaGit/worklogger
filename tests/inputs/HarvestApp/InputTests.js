const assert = require('assert');
const Input = require('app/inputs/HarvestApp/Input');
const InputConfiguration = require('app/inputs/HarvestApp/InputConfiguration');

describe('[HarvestApp] Input', () => {
    describe('#constructor', () => {
        it('requires an input configuration parameter', () => {
            assert.throws(() => getTestSubject({ inputConfiguration: null }), /required/);
            assert.doesNotThrow(() => getTestSubject());
        });

        it('requires an app configuration parameter', () => {
            assert.throws(() => getTestSubject({ appConfiguration: null }), /required/);
            assert.doesNotThrow(() => getTestSubject());
        });
    });

    describe('#getWorkLogs', () => {
    }); // #getWorkLogs
});

// Stubs for the instantiation of the test subject

const defaultAppConfiguration = {
    options: {
        minimumLoggableTimeSlotInMinutes: 15
    }
};

const defaultInputConfiguration = {
    type: 'HarvestApp',
    name: 'Harvest Test',
    accountId: '12345',
    token: 'abc123',
    contactInformation: 'test@example.com'
};

const defaultServiceRegistrations = {};

function getTestSubject({
    serviceRegistrations = defaultServiceRegistrations,
    appConfiguration = defaultAppConfiguration,
    inputConfiguration = defaultInputConfiguration } = {}) {

    const inputConfigurationInstance = inputConfiguration
        ? new InputConfiguration(inputConfiguration)
        : undefined;

    return new Input(serviceRegistrations, appConfiguration, inputConfigurationInstance);
}
