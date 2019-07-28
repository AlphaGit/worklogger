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

        it('returns a JSON representation of the file contents', async () => {
            var contents = JSON.stringify({ a: 1, b: 2 });
            const fakeReadFileFn = (filePath, encoding, callback) => callback(null, contents);
            var stub = sinon.stub(fs, 'readFile').callsFake(fakeReadFileFn);
            const credentials = await CredentialStorage.retrieveAppCredentials();
            assert.equal(1, credentials.a);
            assert.equal(2, credentials.b);
            stub.restore();
        });

        it('throws if the file cannot be read', async () => {
            const fakeReadFileFn = (filePath, encoding, callback) => callback('FileError', null);
            var stub = sinon.stub(fs, 'readFile').callsFake(fakeReadFileFn);
            assert.rejects(async () => await CredentialStorage.retrieveAppCredentials(), /FileError/);
            stub.restore();
        });
    });
});
