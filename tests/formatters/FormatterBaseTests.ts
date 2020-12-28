import assert = require('assert');
import { FormatterBase } from '../../app/formatters/FormatterBase';
import { WorklogSet } from '../../app/models/WorklogSet';

describe('FormatterBase', () => {
    it('can be instantiated', () => {
        assert.doesNotThrow(() => getTestSubject());
    });

    describe('#format', () => {
        it('is defined', () => {
            const formatter = getTestSubject();
            assert((typeof formatter.format) === 'function');
        });

        it('has no implementation', () => {
            const formatter = getTestSubject();
            const worklogSet = new WorklogSet(new Date(), new Date(), []);
            assert.throws(() => formatter.format(worklogSet), /format\(\) needs to be implemented in derived class/);
        });
    });
});

function getTestSubject() {
    return new FormatterBase({}, {});
}
