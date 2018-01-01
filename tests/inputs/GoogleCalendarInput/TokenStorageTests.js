const assert = require('assert');
const sinon = require('sinon');

var TokenStorage = require('app/inputs/GoogleCalendar/TokenStorage');

var validCredentials = {
    installed: {
        client_secret: '123secret',
        client_id: '123',
        redirect_uris: [
            'http://localhost/test'
        ]
    }
};

describe('[Google Calendar] TokenStorage', () => {
    describe('#authorize', () => {
        it('returns a Promise', () => {
            const TokenStorage = getTestSubject();
            const result =  TokenStorage.authorize(validCredentials).catch(() => {});
            assert.ok(result instanceof Promise);
            result.catch(() => {}).then();
        });

        it('requires existing credentials', () => {
            const TokenStorage = getTestSubject();
            assert.throws(() => TokenStorage.authorize(undefined));
            assert.throws(() => TokenStorage.authorize(null));
            assert.throws(() => TokenStorage.authorize({}));
        });

        it('returns the parsed token if token file is found', (done) => {
            const fsMock = {
                readFile: function(tokenPath, cb) { cb(null, '{ "username": "username", "password": "password" }' ); }
            };
            const TokenStorage = getTestSubject({ fsMock });

            TokenStorage.authorize(validCredentials).then(client => {
                assert.equal('username', client.credentials.username);
                assert.equal('password', client.credentials.password);
                done();
            }).catch(done);
        });
    });
});

// Stubs for the instantiation of the test subject

const defaultReadlineMock = {
    question: sinon.stub().callsArg(0),
    close: function() { }
};

const defaultFsMock = {
    readFile: function() { },
    mkdirSync: function() { },
    writeFile: function() { }
};

const defaultGoogleAuthMock = function() {
    return {
        OAuth2: function() {
            return {
                generateAuthUrl: function() { },
                getToken: function() { }
            };
        }
    };
};

function getTestSubject({
    fsMock = defaultFsMock,
    readlineMock = defaultReadlineMock,
    googleAuthMock = defaultGoogleAuthMock
} = {}) {
    return new TokenStorage(fsMock, readlineMock, googleAuthMock);
}
