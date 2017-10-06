const assert = require('assert');
const FormatterBase = require('formatters/FormatterBase');

describe('FormatterBase', () => {
    it('can be instantiated', () => {
        assert.doesNotThrow(() => getTestSubject());
    });

    it('requires a configuration object', () => {
        assert.throws(() => new FormatterBase(), /Formatter configuration object is required/);
    });

    describe('#format', () => {
        it('is defined', () => {
            const formatter = getTestSubject();
            assert((typeof formatter.format) === 'function');
        });

        it('has no implementation', () => {
            const formatter = getTestSubject();
            assert.throws(() => formatter.format(), /format\(\) needs to be implemented in derived class/);
        });
    });
});

function getTestSubject() {
    return new FormatterBase({});
}
