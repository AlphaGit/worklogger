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
            var result =  googleTokenStorage.authorize(validCredentials).catch(() => {});
            assert.ok(result instanceof Promise);
            result.catch(() => {}).then();
        });

        it('requires existing credentials', () => {
            const googleTokenStorage = getTestSubject();
            assert.throws(() => googleTokenStorage.authorize(undefined));
            assert.throws(() => googleTokenStorage.authorize(null));
            assert.throws(() => googleTokenStorage.authorize({}));
        });
    });
});

// Stubs for the instantiation of the test subject

const readlineMock = {
    question: sinon.stub().callsArg(0),
    close: function() { }
};

const fsMock = {
    readFile: function() { },
    mkdirSync: function() { },
    writeFile: function() { }
};

const googleAuthMock = function() {
    return {
        OAuth2: function() {
            return {
                generateAuthUrl: function() { },
                getToken: function() { }
            };
        }
    };
};

function getTestSubject() {
    return new GoogleTokenStorage(fsMock, readlineMock, googleAuthMock);
}
