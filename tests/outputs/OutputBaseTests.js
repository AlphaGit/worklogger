const assert = require('assert');
const OutputBase = require('outputs/OutputBase');
const FormatterBase = require('formatters/FormatterBase');
const WorklogSet = require('models/WorklogSet');

describe('OutputBase', () => {
    describe('#constructor', () => {
        it('requires a formatter', () => {
            const assertFormatterRequired = (fn) => {
                assert.throws(fn, /Formatter is required\./);
            };

            assertFormatterRequired(() => new OutputBase());
            assertFormatterRequired(() => new OutputBase(1));
            assertFormatterRequired(() => new OutputBase({}));
        });
    });

    describe('#outputWorklogSet', () => {
        it('is defined', () => {
            const output = getTestSubject();
            assert(typeof output.outputWorklogSet === 'function');
        });

        it('requires a worklogSet as a parameter', () => {
            const output = getTestSubject();
            const assetRequiredWorklogSet = (action) => assert.throws(action, /Required parameter: worklogSet\./);
            assetRequiredWorklogSet(() => output.outputWorklogSet());
            assetRequiredWorklogSet(() => output.outputWorklogSet(null));

            const assetRequiredWorklogSetType = (action) => assert.throws(action, /worklogSet needs to be of type WorklogSet\./);
            assetRequiredWorklogSetType(() => output.outputWorklogSet({}));
            assetRequiredWorklogSetType(() => output.outputWorklogSet(1));
            assetRequiredWorklogSetType(() => output.outputWorklogSet([]));
        });

        it('throws in the base class (abstract class)', () => {
            const outputBase = getTestSubject();
            const worklogSet = getWorklogSet();
            assert.throws(() => outputBase.outputWorklogSet(worklogSet), /outputWorklogSet\(\) needs to be defined in derived classes\./);
        });
    });
});

function getTestSubject() {
    const formatterConfiguration = {};
    const formatter = new FormatterBase(formatterConfiguration);
    const outputConfiguration = {};
    return new OutputBase(formatter, outputConfiguration);
}

function getWorklogSet() {
    return new WorklogSet(new Date(), new Date(), []);
}