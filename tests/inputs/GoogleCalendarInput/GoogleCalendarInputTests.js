const assert = require('assert');
const sinon = require('sinon');
const GoogleCalendarInput = require('inputs/GoogleCalendarInput/GoogleCalendarInput');
const GoogleCalendarInputConfiguration = require('inputs/GoogleCalendarInput/GoogleCalendarInputConfiguration');

require('tests/harness/log4js').setLevel('off');

describe('GoogleCalendarInput', () => {
    describe('#constructor', () => {
        it('requires a configuration parameter', () => {
            assert.throws(() => getTestSubject({ configuration: null }), /required/);
            assert.doesNotThrow(() => getTestSubject());
        });
    });

    describe('#getWorkLogs', () => {
        it('requests app credentials from the credential storage', (done) => {
            const credentialStorage = { retrieveAppCredentials: sinon.stub() };
            credentialStorage.retrieveAppCredentials.returns(Promise.resolve());

            const googleCalendarInput = getTestSubject({ credentialStorage: credentialStorage });
            googleCalendarInput.getWorkLogs().then(() => {
                assert(credentialStorage.retrieveAppCredentials.called);
                done();
            }).catch(done);
        });

        it('returns a failed promise if the credential storage fails', (done) => {
            const credentialStorage = { retrieveAppCredentials: sinon.stub() };
            credentialStorage.retrieveAppCredentials.returns(Promise.reject());

            const googleCalendarInput = getTestSubject({ credentialStorage: credentialStorage });
            googleCalendarInput.getWorkLogs().then(() => {
                assert.fail('Promise was not rejected on error.');
                done();
            }).catch(() => done());
        });

        it('authorizes through the google token storage', (done) => {
            const authorizeStub = sinon.stub();
            const tokenStorage = function() { return { authorize: authorizeStub }; };

            const googleCalendarInput = getTestSubject({ tokenStorage: tokenStorage });
            googleCalendarInput.getWorkLogs().then(() => {
                assert(authorizeStub.called);
                done();
            }).catch(done);
        });

        it('returns a failed promise if the token storage fails', (done) => {
            const authorizeStub = sinon.stub().returns(Promise.reject());
            const tokenStorage = function() { return { authorize: authorizeStub }; };

            const googleCalendarInput = getTestSubject({ tokenStorage: tokenStorage });
            googleCalendarInput.getWorkLogs().then(() => {
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

            const googleCalendarInput = getTestSubject({ tokenStorage: tokenStorage, googleApis: googleApis });
            googleCalendarInput.getWorkLogs().then(() => {
                assert.ok(eventListStub.calledOnce);
                assert.equal(authenticationCredentials, eventListStub.firstCall.args[0].auth);
                done();
            }).catch(done);
        });

        it('calls google API for every calendar in the configuration', (done) => {
            const configuration =  {
                name: 'test',
                calendars: [{
                    id: 'a',
                    client: 'My client',
                    project: 'My project'
                }, {
                    id: 'b',
                    client: 'My client 2',
                    project: 'My project 2'
                }, {
                    id: 'c',
                    client: 'My client 3',
                    project: 'My project 3'
                }],
                minimumLoggableTimeSlotInMinutes: 15
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

            const googleCalendarInput = getTestSubject({ configuration: configuration, googleApis: googleApis });
            googleCalendarInput.getWorkLogs().then(() => {
                assert.ok(eventListStub.calledThrice);
                const calendarIdArguments = eventListStub.getCalls().map(call => call.args[0].calendarId);
                for (const calendarId of calendarIdArguments) {
                    assert.ok(configuration.calendars.some(c => c.id === calendarId));
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

            const googleCalendarInput = getTestSubject({ googleApis: googleApis });
            googleCalendarInput.getWorkLogs().then(() => {
                assert.fail('Promise was not rejected on error');
                done();
            }).catch(() => done());
        });
    }); // #getWorkLogs
});

// Stubs for the instantiation of the test subject

const defaultConfiguration = {
    name: 'test',
    calendars: [{
        id: 'a',
        client: 'My client',
        project: 'My project'
    }],
    minimumLoggableTimeSlotInMinutes: 15
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
    configuration = defaultConfiguration,
    credentialStorage = defaultCredentialStorage,
    tokenStorage = defaultTokenStorage,
    googleApis = defaultGoogleApis,
    mapper = defaultMapper } = {}) {
    const googleCalendarConfiguration = configuration
        ? new GoogleCalendarInputConfiguration(configuration)
        : undefined;

    return new GoogleCalendarInput(googleCalendarConfiguration, credentialStorage, tokenStorage, googleApis, mapper);
}
