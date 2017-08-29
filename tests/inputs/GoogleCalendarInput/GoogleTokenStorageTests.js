var assert = require('assert');
var sinon = require('sinon');

var GoogleTokenStorage = require('inputs/GoogleCalendarInput/GoogleTokenStorage');

var validCredentials = {
    installed: {
        client_secret: '123secret',
        client_id: '123',
        redirect_uris: [
            'http://localhost/test'
        ]
    }
};

describe('GoogleTokenStorage', () => {
    describe('#authorize', () => {
        it('returns a Promise', () => {
            const googleTokenStorage = getTestSubject();
            const result =  googleTokenStorage.authorize(validCredentials).catch(() => {});
            assert.ok(result instanceof Promise);
            result.catch(() => {}).then();
        });

        it('requires existing credentials', () => {
            const googleTokenStorage = getTestSubject();
            assert.throws(() => googleTokenStorage.authorize(undefined));
            assert.throws(() => googleTokenStorage.authorize(null));
            assert.throws(() => googleTokenStorage.authorize({}));
        });

        it('returns the parsed token if token file is found', (done) => {
            const fsMock = {
                readFile: function(tokenPath, cb) { cb(null, '{ "username": "username", "password": "password" }' ); }
            };
            const googleTokenStorage = getTestSubject({ fsMock });

            googleTokenStorage.authorize(validCredentials).then(client => {
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
    return new GoogleTokenStorage(fsMock, readlineMock, googleAuthMock);
}
