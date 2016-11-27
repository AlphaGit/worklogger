var assert = require('assert');
var sinon = require('sinon');
var readline = require('readline');
var googleAuth = require('google-auth-library');
var fs = require('fs');

var GoogleTokenStorage = require('inputs/GoogleCalendarInput/GoogleTokenStorage');

var validCredentials = {
    installed: {
        client_secret: "123secret",
        client_id: "123",
        redirect_uris: [
            "http://localhost/test"
        ]
    }
};

describe('GoogleTokenStorage', () => {
    describe('#authorize', () => {
        beforeEach(() => {
            this.readlineQuestionStub = sinon.stub().callsArg(0);
            this.readLineStub = sinon.stub(readline, 'createInterface', () => ({
                question: this.readlineQuestionStub,
                close: function() {} // do nothing
            }));
        });

        afterEach(() => {
            readline.createInterface.restore();
        });

        it('returns a Promise', (done) => {
            var result = GoogleTokenStorage.authorize(validCredentials).catch(e => {});
            assert.ok(result instanceof Promise);
            result.then(done);
        });

        it('requires existing credentials', () => {
            assert.throws(() => GoogleTokenStorage.authorize(undefined));
            assert.throws(() => GoogleTokenStorage.authorize(null));
            assert.throws(() => GoogleTokenStorage.authorize({}));
        });
    });
});
