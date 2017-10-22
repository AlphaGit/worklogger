const assert = require('assert');
const HasTagCondition = require('conditions/hasTag');
const Worklog = require('models/Worklog');

describe('HasTagCondition', () => {
    describe('constructor', () => {
        it('can be intantiated', () => {
            assert.doesNotThrow(() => getTestSubject());
        });
    });

    it('filters tags that have tagName as indicated in the configuration', () => {
        const hasTag = getTestSubject({ tagName: 'tag1', tagValue: null });

        const worklog = new Worklog('test', new Date(), new Date());

        assert(!hasTag.isSatisfiedBy(worklog))

        worklog.addTag('tag1', 'tag1 value');

        assert(hasTag.isSatisfiedBy(worklog))
    });

    it('filters tags that have tagName and tagValue as indicated in the configuration', () => {
        const hasTag = getTestSubject({ tagName: 'tag1', tagValue: 'tagValue1' });

        const worklog = new Worklog('test', new Date(), new Date());

        assert(!hasTag.isSatisfiedBy(worklog))

        worklog.addTag('tag1', 'tagValue1');

        assert(hasTag.isSatisfiedBy(worklog))

        worklog.addTag('tag1', 'tagValue2');

        assert(!hasTag.isSatisfiedBy(worklog))
    });
});

function getTestSubject({
    tagName = 'test',
    tagValue = 'test'
} = {}) {
    return new HasTagCondition({ tagName, tagValue });
}