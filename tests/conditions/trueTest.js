const assert = require('assert');
const TrueCondition = require('conditions/true');
const Worklog = require('models/Worklog');

describe('True condition', () => {
    describe('constructor', () => {
        it('can be instantiated', () => {
            assert.doesNotThrow(() => new TrueCondition());
        });
    });

    describe('isSatisfiedBy', () => {
        it('returns true', () => {
            const worklog = new Worklog('name', new Date(), new Date());
            const trueCondition = new TrueCondition();

            assert(trueCondition.isSatisfiedBy(worklog));
        });
    });
});