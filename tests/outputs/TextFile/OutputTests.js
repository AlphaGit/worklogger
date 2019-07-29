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

        it('returns a rejected promise when writing to a file fails', async () => {
            const formatter = new FormatterBase({});
            const formatFakeFn = () => '';
            sinon.stub(formatter, 'format').callsFake(formatFakeFn);

            const fakeFs = {
                writeFile: (filePath, contents, cb) => cb('Some error occurred.')
            };
            const output = getTestSubject({ formatter, fs: fakeFs });

            await assert.rejects(async () => output.outputWorklogSet(getExampleWorklogSet()), /Some error occurred\./);
        });

        it('returns a resolved promise when everything is fine', async () => {
            const formatter = new FormatterBase({});
            const formatFakeFn = () => '';
            sinon.stub(formatter, 'format').callsFake(formatFakeFn);

            const fakeFs = {
                writeFile: (filePath, contents, cb) => cb()
            };
            const output = getTestSubject({ formatter, fs: fakeFs });

            await output.outputWorklogSet(getExampleWorklogSet());
        });

        it('writes to the output file indicated in the configuration', async () => {
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

            await output.outputWorklogSet(getExampleWorklogSet());
            assert.equal(usedFilePath, outputConfiguration.filePath);
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