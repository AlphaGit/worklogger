var assert = require('assert');
var GoogleAppCredentialStorage = require('inputs/GoogleCalendarInput/GoogleAppCredentialStorage');
var fs = require('fs');
var sinon = require('sinon');

require('tests/harness/log4js').setLevel('off');

describe('GoogleAppCredentialStorage', () => {
    describe('#retrieveAppCredentials', () => {
        it('returns a Promise', () => {
            var result = GoogleAppCredentialStorage.retrieveAppCredentials().catch(() => {});
            assert.ok(result instanceof Promise);
        });

        it('reads from a local file', () => {
            sinon.spy(fs, 'readFile');
            GoogleAppCredentialStorage.retrieveAppCredentials().catch(() => {});
            assert.ok(fs.readFile.calledOnce);
            fs.readFile.restore();
        });

        it('returns a JSON representation of the file contents', done => {
            var contents = { a: 1, b: 2 };
            var stub = sinon.stub(fs, 'readFile', (filePath, callback) => callback(null, contents));
            GoogleAppCredentialStorage.retrieveAppCredentials()
                .then(credentials => {
                    assert.equal(1, credentials.a);
                    assert.equal(2, credentials.b);
                }).catch(() => {})
                .then(() => {
                    stub.restore();
                    done();
                });
        });

        it('rejects the promise if the file cannot be read', done => {
            var stub = sinon.stub(fs, 'readFile', (filePath, callback) => callback('FileError', null));
            GoogleAppCredentialStorage.retrieveAppCredentials()
                .then(contents => assert.fail(`Did not reject promise, returned content: ${contents}`))
                .catch(e => {
                    assert.ok(e.indexOf('FileError') >= 0);
                }).then(() => {
                    stub.restore();
                    done();
                });
        });
    });
});
