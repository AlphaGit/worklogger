const assert = require('assert');
const OutputBase = require('outputs/OutputBase');
const FormatterBase = require('formatters/FormatterBase');

describe('OutputBase', () => {
    describe('#constructor', () => {
        it('requires a formatter', () => {
            const assertFormatterRequired = (fn) => {
                assert.throws(fn, /Formatter is required\./);
            }

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

        it('throws in the base class (abstract class)', () => {
            const outputBase = getTestSubject();
            assert.throws(() => outputBase.outputWorklogSet(), /outputWorklogSet\(\) needs to be defined in derived classes\./);
        });
    });
});

function getTestSubject() {
    const formatterConfiguration = {};
    const formatter = new FormatterBase(formatterConfiguration);
    const outputConfiguration = {};
    return new OutputBase(formatter, outputConfiguration);
}