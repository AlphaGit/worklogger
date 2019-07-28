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
            const result = TokenStorage.authorize(validCredentials);
            assert.ok(result instanceof Promise);
        });

        it('requires existing credentials', async () => {
            const TokenStorage = getTestSubject();
            assert.rejects(async () => await TokenStorage.authorize(undefined));
            assert.rejects(async () => await TokenStorage.authorize(null));
            assert.rejects(async () => await TokenStorage.authorize({}));
        });

        it('returns the parsed token if token file is found', async () => {
            const fsMock = {
                readFile: function(tokenPath, encoding, cb) { cb(null, '{ "username": "username", "password": "password" }' ); }
            };
            const TokenStorage = getTestSubject({ fsMock });

            const client = await TokenStorage.authorize(validCredentials);
            assert.equal('username', client.credentials.username);
            assert.equal('password', client.credentials.password);
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

const defaultGoogleApisMock = {
    auth: {
        OAuth2: function() {
            return {
                generateAuthUrl: function() { },
                getToken: function() { }
            };
        }
    }
};

function getTestSubject({
    fsMock = defaultFsMock,
    readlineMock = defaultReadlineMock,
    googleApisMock = defaultGoogleApisMock
} = {}) {
    return new TokenStorage(fsMock, readlineMock, googleApisMock);
}
