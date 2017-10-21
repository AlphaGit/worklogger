const assert = require('assert');
const sinon = require('sinon');
const Input = require('inputs/GoogleCalendar/Input');
const InputConfiguration = require('inputs/GoogleCalendar/InputConfiguration');

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
        it('requests app credentials from the credential storage', (done) => {
            const credentialStorage = { retrieveAppCredentials: sinon.stub() };
            credentialStorage.retrieveAppCredentials.returns(Promise.resolve());

            const input = getTestSubject({ credentialStorage: credentialStorage });
            input.getWorkLogs(new Date(), new Date()).then(() => {
                assert(credentialStorage.retrieveAppCredentials.called);
                done();
            }).catch(done);
        });

        it('returns a failed promise if the credential storage fails', (done) => {
            const credentialStorage = { retrieveAppCredentials: sinon.stub() };
            credentialStorage.retrieveAppCredentials.returns(Promise.reject());

            const input = getTestSubject({ credentialStorage: credentialStorage });
            input.getWorkLogs(new Date(), new Date()).then(() => {
                assert.fail('Promise was not rejected on error.');
                done();
            }).catch(() => done());
        });

        it('authorizes through the google token storage', (done) => {
            const authorizeStub = sinon.stub();
            const tokenStorage = function() { return { authorize: authorizeStub }; };

            const input = getTestSubject({ tokenStorage: tokenStorage });
            input.getWorkLogs(new Date(), new Date()).then(() => {
                assert(authorizeStub.called);
                done();
            }).catch(done);
        });

        it('returns a failed promise if the token storage fails', (done) => {
            const authorizeStub = sinon.stub().returns(Promise.reject());
            const tokenStorage = function() { return { authorize: authorizeStub }; };

            const input = getTestSubject({ tokenStorage: tokenStorage });
            input.getWorkLogs(new Date(), new Date()).then(() => {
                assert.fail('Promise was not rejected on error');
                done();
            }).catch(() => done());
        });

        it('calls google events API with the authorization values retrieved', (done) => {
            const authenticationCredentials = { my: 'test credentials' };
            const authorizeStub = sinon.stub().returns(Promise.resolve(authenticationCredentials));
            const tokenStorage = function() { return { authorize: authorizeStub }; };
            const eventListStub = sinon.stub().callsArgWith(1, null, { items: [] });
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
            input.getWorkLogs(new Date(), new Date()).then(() => {
                assert.ok(eventListStub.calledOnce);
                assert.equal(authenticationCredentials, eventListStub.firstCall.args[0].auth);
                done();
            }).catch(done);
        });

        it('calls google API for every calendar in the configuration', (done) => {
            const configuration =  {
                name: 'test',
                calendars: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
                readFromXHoursAgo: 10
            };
            const eventListStub = sinon.stub().callsArgWith(1, null, { items: [] });
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

            input.getWorkLogs(startDateTime, endDateTime).then(() => {
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

                done();
            }).catch(done);
        });

        it('returns a failed response if the google API fails', (done) => {
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
            input.getWorkLogs(new Date(), new Date()).then(() => {
                assert.fail('Promise was not rejected on error');
                done();
            }).catch(() => done());
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
                list: sinon.stub().callsArgWith(1, null, { items: [] })
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
