var assert = require('assert');
var CredentialStorage = require('app/inputs/GoogleCalendar/CredentialStorage');
var fs = require('fs');
var sinon = require('sinon');

describe('[Google Calendar] CredentialStorage', () => {
    describe('#retrieveAppCredentials', () => {
        it('returns a Promise', () => {
            var result = CredentialStorage.retrieveAppCredentials().catch(() => {});
            assert.ok(result instanceof Promise);
        });

        it('reads from a local file', () => {
            sinon.spy(fs, 'readFile');
            CredentialStorage.retrieveAppCredentials().catch(() => {});
            assert.ok(fs.readFile.calledOnce);
            fs.readFile.restore();
        });

        it('returns a JSON representation of the file contents', done => {
            var contents = { a: 1, b: 2 };
            const fakeReadFileFn = (filePath, callback) => callback(null, contents);
            var stub = sinon.stub(fs, 'readFile').callsFake(fakeReadFileFn);
            CredentialStorage.retrieveAppCredentials()
                .then(credentials => {
                    assert.equal(1, credentials.a);
                    assert.equal(2, credentials.b);
                })
                .catch(() => {})
                .then(() => {
                    stub.restore();
                    done();
                });
        });

        it('rejects the promise if the file cannot be read', done => {
            const fakeReadFileFn = (filePath, callback) => callback('FileError', null);
            var stub = sinon.stub(fs, 'readFile').callsFake(fakeReadFileFn);
            CredentialStorage.retrieveAppCredentials()
                .then(contents => assert.fail(`Did not reject promise, returned content: ${contents}`))
                .catch(e => {
                    assert.ok(e.indexOf('FileError') >= 0);
                })
                .then(() => {
                    stub.restore();
                    done();
                });
        });
    });
});
