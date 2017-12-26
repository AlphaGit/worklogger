const assert = require('assert');
const OutputBase = require('outputs/OutputBase');
const FormatterBase = require('formatters/FormatterBase');
const WorklogSet = require('models/WorklogSet');

describe('OutputBase', () => {
    describe('#constructor', () => {
        function assertFormatterRequired(formatterArgument) {
            assert.throws(() => new OutputBase(formatterArgument), /Formatter is required\./);
        }

        it('requires a formatter', () => {
            assertFormatterRequired();
            assertFormatterRequired(1);
            assertFormatterRequired({});
        });
    });

    describe('#outputWorklogSet', () => {
        it('is defined', () => {
            const output = getTestSubject();
            assert(typeof output.outputWorklogSet === 'function');
        });

        function assertOutputWorklogSetError(worklogSet, expectedError) {
            const output = getTestSubject();
            assert.throws(() => output.outputWorklogSet(worklogSet), expectedError);
        }

        function assertWorklogSetRequired(worklogSet) {
            assertOutputWorklogSetError(worklogSet, /Required parameter: worklogSet\./);
        }

        function assertWorklogSetIsRightType(worklogSet) {
            assertOutputWorklogSetError(worklogSet, /worklogSet needs to be of type WorklogSet\./);
        }

        it('requires a worklogSet as a parameter', () => {
            assertWorklogSetRequired();
            assertWorklogSetRequired(null);

            assertWorklogSetIsRightType({});
            assertWorklogSetIsRightType(1);
            assertWorklogSetIsRightType([]);
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