const assert = require('assert');
const sinon = require('sinon');
const Input = require('app/inputs/GoogleCalendar/Input');
const InputConfiguration = require('app/inputs/GoogleCalendar/InputConfiguration');

describe('[Google Calendar] Input', () => {
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
        it('requests app credentials from the credential storage', async () => {
            const credentialStorage = { retrieveAppCredentials: sinon.stub() };
            credentialStorage.retrieveAppCredentials.returns(Promise.resolve());

            const input = getTestSubject({ credentialStorage: credentialStorage });
            await input.getWorkLogs(new Date(), new Date());
            assert(credentialStorage.retrieveAppCredentials.called);
        });

        it('returns a failed promise if the credential storage fails', async () => {
            const credentialStorage = { retrieveAppCredentials: sinon.stub() };
            credentialStorage.retrieveAppCredentials.returns(Promise.reject());

            const input = getTestSubject({ credentialStorage: credentialStorage });
            await assert.rejects(async() => await input.getWorkLogs(new Date(), new Date()));
        });

        it('authorizes through the google token storage', async () => {
            const authorizeStub = sinon.stub();
            const tokenStorage = function() { return { authorize: authorizeStub }; };

            const input = getTestSubject({ tokenStorage: tokenStorage });
            await input.getWorkLogs(new Date(), new Date());
        });

        it('returns a failed promise if the token storage fails', async () => {
            const authorizeStub = sinon.stub().returns(Promise.reject());
            const tokenStorage = function() { return { authorize: authorizeStub }; };

            const input = getTestSubject({ tokenStorage: tokenStorage });
            assert.rejects(async () => input.getWorkLogs(new Date(), new Date()));
        });

        it('calls google events API with the authorization values retrieved', async () => {
            const authenticationCredentials = { my: 'test credentials' };
            const authorizeStub = sinon.stub().returns(await authenticationCredentials);
            const tokenStorage = function() { return { authorize: authorizeStub }; };
            const eventListStub = sinon.stub().callsArgWith(1, null, { data: { items: [] } });
            const googleApis = {
                calendar: function() {
                    return {
                        events: {
                            list: eventListStub
                        }
                    };
                }
            };

            const input = getTestSubject({ tokenStorage: tokenStorage, googleApis: googleApis });
            await input.getWorkLogs(new Date(), new Date());
            assert.ok(eventListStub.calledOnce);
            assert.equal(authenticationCredentials, eventListStub.firstCall.args[0].auth);
        });

        it('calls google API for every calendar in the configuration', async () => {
            const configuration =  {
                name: 'test',
                calendars: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
                readFromXHoursAgo: 10
            };
            const eventListStub = sinon.stub().callsArgWith(1, null, { data: { items: [] } });
            const googleApis = {
                calendar: function() {
                    return {
                        events: {
                            list: eventListStub
                        }
                    };
                }
            };

            const input = getTestSubject({ inputConfiguration: configuration, googleApis: googleApis });
            const startDateTime = new Date(Date.now() - 1 * 60 * 60 * 1000);
            const endDateTime = new Date();

            await input.getWorkLogs(startDateTime, endDateTime);
            assert.ok(eventListStub.calledThrice);

            const eventListCallArguments = eventListStub.getCalls().map(call => call.args[0]);

            const calendarIdArguments = eventListCallArguments.map(a => a.calendarId);
            for (const calendarId of calendarIdArguments) {
                assert.ok(configuration.calendars.some(c => c.id === calendarId));
            }

            const timeMinimumArguments = eventListCallArguments.map(a => a.timeMin);
            for (const timeMinArg of timeMinimumArguments) {
                assert.equal(timeMinArg, startDateTime.toISOString());
            }

            const timeMaximumArguments = eventListCallArguments.map(a => a.timeMax);
            for (const timeMaxArg of timeMaximumArguments) {
                assert.equal(timeMaxArg, endDateTime.toISOString());
            }

            const maxResultArguments = eventListCallArguments.map(a => a.maxResults);
            for (const maxResultArg of maxResultArguments) {
                assert.strictEqual(maxResultArg, 2500);
            }
        });

        it('returns a failed response if the google API fails', async () => {
            let googleApis = {
                calendar: function() {
                    return {
                        events: {
                            list: (args, callback) => callback('Some API error')
                        }
                    };
                }
            };

            const input = getTestSubject({ googleApis: googleApis });
            await assert.rejects(async() => input.getWorkLogs(new Date(), new Date()));
        });
    }); // #getWorkLogs
});

// Stubs for the instantiation of the test subject

const defaultAppConfiguration = {
    options: {
        minimumLoggableTimeSlotInMinutes: 15
    }
};

const defaultInputConfiguration = {
    name: 'test',
    calendars: [{
        id: 'a'
    }],
    readFromXHoursAgo: 5
};

const defaultCredentialStorage = {
    retrieveAppCredentials: sinon.stub().returns(Promise.resolve())
};

const defaultTokenStorage = class {
    authorize() { }
};

const defaultGoogleApis = {
    calendar: function() {
        return {
            events: {
                list: sinon.stub().callsArgWith(1, null, { data: { items: [] } })
            }
        };
    }
};

const defaultMapper = function() {
    return {
        map: sinon.stub()
    };
};

function getTestSubject({
    appConfiguration = defaultAppConfiguration,
    inputConfiguration = defaultInputConfiguration,
    credentialStorage = defaultCredentialStorage,
    tokenStorage = defaultTokenStorage,
    googleApis = defaultGoogleApis,
    mapper = defaultMapper } = {}) {

    const inputConfigurationInstance = inputConfiguration
        ? new InputConfiguration(inputConfiguration)
        : undefined;

    return new Input(appConfiguration, inputConfigurationInstance, credentialStorage, tokenStorage, googleApis, mapper);
}
