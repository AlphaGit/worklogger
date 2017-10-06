const assert = require('assert');
const TextFileOutput = require('outputs/TextFile/Output');
const FormatterBase = require('formatters/FormatterBase');
const sinon = require('sinon');

describe('TextFileOutput', () => {
    describe('#constructor', () => {
        it('requires a formatter', () => {
            const assertFormatterRequired = (fn) => {
                assert.throws(fn, /Formatter is required\./);
            }

            assertFormatterRequired(() => new TextFileOutput());
            assertFormatterRequired(() => new TextFileOutput(1));
            assertFormatterRequired(() => new TextFileOutput({}));
        });
    });

    describe('#outputWorklogSet', () => {
        it('is defined', () => {
            const output = getTestSubject();

            assert(typeof output.outputWorklogSet === 'function');
        });

        it('it obtains the formatted representation of the worklogs', () => {
            const formatter = new FormatterBase({});
            const formatStub = sinon.stub(formatter, 'format', () => '');
            const output = getTestSubject({ formatter });

            output.outputWorklogSet();

            assert(formatStub.calledOnce);

            formatStub.restore();
        });

        it('returns a rejected promise when writing to a file fails', (done) => {
            const formatter = new FormatterBase({});
            const formatStub = sinon.stub(formatter, 'format', () => '');

            const fakeFs = {
                writeFile: (filePath, contents, cb) => cb('Some error occurred.')
            };
            const output = getTestSubject({ formatter, fs: fakeFs });
            
            output.outputWorklogSet()
                .then(() => done('Promise was not rejected.'))
                .catch((err) => {
                    assert.equal(err, 'Some error occurred.');
                    done();
                });
        });

        it('returns a resolved promise when everything is fine', (done) => {
            const formatter = new FormatterBase({});
            const formatStub = sinon.stub(formatter, 'format', () => '');

            const fakeFs = {
                writeFile: (filePath, contents, cb) => cb()
            };
            const output = getTestSubject({ formatter, fs: fakeFs });
            
            output.outputWorklogSet()
                .then(() => done())
                .catch(done);
        });

        it('writes to the output file indicated in the configuration', (done) => {
            const formatter = new FormatterBase({});
            const formatStub = sinon.stub(formatter, 'format', () => '');

            const outputConfiguration = {
                filePath: 'myOutputFile.txt'
            };
            let usedFilePath = null;
            const fakeFs = {
                writeFile: (filePath, contents, cb) => {
                    usedFilePath = filePath;
                    cb();
                }
            };
            const output = getTestSubject({ formatter, outputConfiguration, fs: fakeFs });
            
            output.outputWorklogSet()
                .then(() => {
                    assert.equal(usedFilePath, outputConfiguration.filePath);
                    done();
                })
                .catch(done);
        });
    });
});

function getFakeFs() {
    return {
        writeFile: (filePath, contents, cb) => cb()
    };
}

function getTestSubject({
    formatterConfiguration = {},
    formatter = new FormatterBase(formatterConfiguration),
    outputConfiguration = {},
    fs = getFakeFs()
} = {}) {
    return new TextFileOutput(formatter, outputConfiguration, { fs });
}

