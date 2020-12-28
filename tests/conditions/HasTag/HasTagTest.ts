import assert = require('assert');
import { HasTagCondition } from '../../../app/conditions/HasTag';
import { Worklog } from '../../../app/models/Worklog';

describe('HasTagCondition', () => {
    describe('#constructor', () => {
        it('can be instantiated', () => {
            assert.doesNotThrow(() => getTestSubject());
        });
    });

    describe('#isSatisfiedBy', () => {
        it('filters tags that have tagName as indicated in the configuration', () => {
            const hasTag = getTestSubject({ tagName: 'tag1', tagValue: null });
    
            const worklog = new Worklog('test', new Date(), new Date());
    
            assert(!hasTag.isSatisfiedBy(worklog));
    
            worklog.addTag('tag1', 'tag1 value');
    
            assert(hasTag.isSatisfiedBy(worklog));
        });
    
        it('filters tags that have tagName and tagValue as indicated in the configuration', () => {
            const hasTag = getTestSubject({ tagName: 'tag1', tagValue: 'tagValue1' });
    
            const worklog = new Worklog('test', new Date(), new Date());
    
            assert(!hasTag.isSatisfiedBy(worklog));
    
            worklog.addTag('tag1', 'tagValue1');
    
            assert(hasTag.isSatisfiedBy(worklog));
    
            worklog.addTag('tag1', 'tagValue2');
    
            assert(!hasTag.isSatisfiedBy(worklog));
        });
    });

    describe('#toString', () => {
        it('shows the class name', () => {
            const hasTag = getTestSubject();
            assert.ok(hasTag.toString().indexOf('HasTag') > -1);
        });

        it('shows the tag name', () => {
            const hasTag = getTestSubject({ tagName: 'name' });
            assert.ok(hasTag.toString().indexOf('name') > -1);
        });

        it('shows the tag value', () => {
            const hasTag = getTestSubject({ tagValue: 'value' });
            assert.ok(hasTag.toString().indexOf('value') > -1);
        });
    });
});

function getTestSubject({
    tagName = 'test',
    tagValue = 'test'
} = {}) {
    return new HasTagCondition({ tagName, tagValue });
}