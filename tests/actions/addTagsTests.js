const assert = require('assert');
const AddTagsAction = require('actions/addTags');
const Worklog = require('models/Worklog');

describe('addTags', () => {
    describe('#constructor', () => {
        it('requires tagsToAdd parameter', () => {
            assert.throws(() => new AddTagsAction(), /Required parameter: tagsToAdd\./);
            assert.throws(() => new AddTagsAction(1), /Required parameter: tagsToAdd\./);
    
            assert.throws(() => new AddTagsAction([]), /Parameter cannot be empty: tagsToAdd\./);
        });

        it('validates that tags have name and value', () => {
            assert.throws(() => new AddTagsAction(['tag1']), /Tags need to have a name:value format\./);
            assert.throws(() => new AddTagsAction([':value1']), /Tags need to have a name:value format\./);
        });
    
        it('can be instantiated', () => {
            assert.doesNotThrow(() => new AddTagsAction(['tag1:value1']));
            assert.doesNotThrow(() => new AddTagsAction(['tag1:value1:withColons']));
        });
    });

    describe('#apply', () => {
        it('requires a Worklog as a parameter', () => {
            const addTagsAction = new AddTagsAction(['tag1:value1']);
            assert.throws(() => addTagsAction.apply(), /Apply: a Worklog is required\./);
            assert.throws(() => addTagsAction.apply(1), /Apply: a Worklog is required\./);
            assert.throws(() => addTagsAction.apply({}), /Apply: a Worklog is required\./);
            assert.doesNotThrow(() => addTagsAction.apply(new Worklog('name', new Date(), new Date())));
        });

        it('adds the specified tags to the worklog', () => {
            const addTagsAction = new AddTagsAction(['tag1:value1', 'tag2:value2']);
            const worklog = new Worklog('name', new Date(), new Date());

            addTagsAction.apply(worklog);

            assert.equal(worklog.getTagValue('tag1'), 'value1');
            assert.equal(worklog.getTagValue('tag2'), 'value2');
        });
    });
});