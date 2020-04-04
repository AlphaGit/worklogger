const assert = require('assert');
const sinon = require('sinon');
const Input = require('app/inputs/GoogleCalendar/Input');
const InputConfiguration = require('app/inputs/GoogleCalendar/InputConfiguration');

describe('[Google Calendar] Input', () => {
    describe('#constructor', () => {
        it('requires the serviceRegistrations parameter', () => {
            assert.throws(() => getTestSubject({ serviceRegistrations: null }), /required/);
            assert.doesNotThrow(() => getTestSubject());
        });

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
        it('loads app credentials', async () => {
            const serviceRegistrations = {
                FileLoader: {
                    loadJson: sinon.stub().returns(defaultCredentials)
                }
            };
            const input = getTestSubject({ serviceRegistrations });
            await input.getWorkLogs(new Date(), new Date());
            assert(serviceRegistrations.FileLoader.loadJson.called);
        });

        it('returns a failed promise if loading credentials fails', async () => {
            const serviceRegistrations = {
                FileLoader: {
                    loadJson: sinon.stub().throws()
                }
            };
            const input = getTestSubject({ serviceRegistrations });
            await assert.rejects(async() => await input.getWorkLogs(new Date(), new Date()));
        });

        it('returns a failed promise if loading the app token fails', async () => {
            const serviceRegistrations = {
                FileLoader: {
                    loadJson: sinon.stub()
                        .onCall(0).returns(defaultCredentials)
                        .onCall(1).throws()
                }
            }

            const input = getTestSubject({ serviceRegistrations });
            await assert.rejects(async() => await input.getWorkLogs(new Date(), new Date()));
        });

        it('calls google events API with the authorization values retrieved', async () => {
            const eventListStub = sinon.stub().callsArgWith(1, null, { data: { items: [] } });
            const googleApis = {
                calendar: function() {
                    return {
                        events: {
                            list: eventListStub
                        }
                    };
                },
                auth: defaultGoogleApis.auth
            };

            const input = getTestSubject({ googleApis });
            await input.getWorkLogs(new Date(), new Date());
            assert.ok(eventListStub.calledOnce);
            assert.equal(defaultCredentials.client_id, eventListStub.firstCall.args[0].auth.client_id);
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
                },
                auth: defaultGoogleApis.auth
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
                },
                auth: defaultGoogleApis.auth
            };

            const input = getTestSubject({ googleApis });
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

const defaultGoogleApis = {
    calendar: function() {
        return {
            events: {
                list: sinon.stub().callsArgWith(1, null, { data: { items: [] } })
            },
        };
    },
    auth: {
        OAuth2: function() {}
    }
};

const defaultMapper = function() {
    return {
        map: sinon.stub()
    };
};

const defaultCredentials = {
    installed: {
        client_secret: 'client_secreet_123',
        client_id: 'client_id_123',
        redirect_uris: [
            'http://localhost/redirect_uri'
        ]
    }
};

const defaultFileLoader = {
    loadJson: function() {
        return defaultCredentials;
    }
};

const defaultServiceRegistrations = {
    FileLoader: defaultFileLoader
};

function getTestSubject({
    serviceRegistrations = defaultServiceRegistrations,
    appConfiguration = defaultAppConfiguration,
    inputConfiguration = defaultInputConfiguration,
    googleApis = defaultGoogleApis,
    mapper = defaultMapper } = {}) {

    const inputConfigurationInstance = inputConfiguration
        ? new InputConfiguration(inputConfiguration)
        : undefined;

    return new Input(serviceRegistrations, appConfiguration, inputConfigurationInstance, googleApis, mapper);
}
