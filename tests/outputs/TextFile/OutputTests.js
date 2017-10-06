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
    fs = getFakeFs()
} = {}) {
    return new TextFileOutput(formatter, {}, { fs });
}

