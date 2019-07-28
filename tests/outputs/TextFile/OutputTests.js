const assert = require('assert');
const sinon = require('sinon');

const TextFileOutput = require('app/outputs/TextFile/Output');
const FormatterBase = require('app/formatters/FormatterBase');
const WorklogSet = require('app/models/WorklogSet');

describe('TextFileOutput', () => {
    describe('#outputWorklogSet', () => {
        it('it obtains the formatted representation of the worklogs', () => {
            const formatter = new FormatterBase({});
            const formatFakeFn = () => '';
            const formatStub = sinon.stub(formatter, 'format').callsFake(formatFakeFn);
            const output = getTestSubject({ formatter });

            output.outputWorklogSet(getExampleWorklogSet());

            assert(formatStub.calledOnce);

            formatStub.restore();
        });

        it('returns a rejected promise when writing to a file fails', (done) => {
            const formatter = new FormatterBase({});
            const formatFakeFn = () => '';
            sinon.stub(formatter, 'format').callsFake(formatFakeFn);

            const fakeFs = {
                writeFile: (filePath, contents, cb) => cb('Some error occurred.')
            };
            const output = getTestSubject({ formatter, fs: fakeFs });

            output.outputWorklogSet(getExampleWorklogSet())
                .then(() => done('Promise was not rejected.'))
                .catch((err) => {
                    assert.equal(err, 'Some error occurred.');
                    done();
                });
        });

        it('returns a resolved promise when everything is fine', () => {
            const formatter = new FormatterBase({});
            const formatFakeFn = () => '';
            sinon.stub(formatter, 'format').callsFake(formatFakeFn);

            const fakeFs = {
                writeFile: (filePath, contents, cb) => cb()
            };
            const output = getTestSubject({ formatter, fs: fakeFs });

            return output.outputWorklogSet(getExampleWorklogSet());
        });

        it('writes to the output file indicated in the configuration', () => {
            const formatter = new FormatterBase({});
            const formatFakeFn = () => '';
            sinon.stub(formatter, 'format').callsFake(formatFakeFn);

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

            return output.outputWorklogSet(getExampleWorklogSet())
                .then(() => {
                    assert.equal(usedFilePath, outputConfiguration.filePath);
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
    outputConfiguration = {},
    fs = getFakeFs()
} = {}) {
    return new TextFileOutput(formatter, outputConfiguration, { fs });
}

function getExampleWorklogSet() {
    return new WorklogSet(new Date(), new Date(), []);
}