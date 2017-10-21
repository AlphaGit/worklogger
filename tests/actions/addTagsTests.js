const assert = require('assert');
const AddTagsAction = require('actions/addTags');
const Worklog = require('models/Worklog');

describe('addTags', () => {
    describe('#constructor', () => {
        it('requires tagsToAdd configuration', () => {
            assert.throws(() => new AddTagsAction(), /Required configuration: tagsToAdd\./);
            assert.throws(() => new AddTagsAction({}), /Required configuration: tagsToAdd\./);
            assert.throws(() => new AddTagsAction({ tagsToAdd: 1 }), /Required configuration: tagsToAdd\./);
    
            assert.throws(() => new AddTagsAction({ tagsToAdd: [] }), /Configuration cannot be empty: tagsToAdd\./);
        });

        it('validates that tags are objects', () => {
            const assertInvalidTagObjectThrows = tagObject => {
                const instantiationAction = () => new AddTagsAction({ tagsToAdd: [ tagObject ] });
                assert.throws(instantiationAction, /Tags need to be valid tag-configuration objects./);
            };
            assertInvalidTagObjectThrows('tag1');
            assertInvalidTagObjectThrows('tag1:value1');
            assertInvalidTagObjectThrows([]);
            assertInvalidTagObjectThrows({});
            assertInvalidTagObjectThrows({ something: 1, somethingElse: 2 });
            assertInvalidTagObjectThrows({ name: 1 });
        });

        it('can be instantiated', () => {
            assert.doesNotThrow(() => new AddTagsAction({ tagsToAdd: [{ name: 'tag1', value: 'value1' }] }));
        });
    });

    describe('#apply', () => {
        it('requires a Worklog as a parameter', () => {
            const tagsToAdd = [{ name: 'tag1', value: 'value1' }];
            const addTagsAction = new AddTagsAction({ tagsToAdd });
            assert.throws(() => addTagsAction.apply(), /Apply: a Worklog is required\./);
            assert.throws(() => addTagsAction.apply(1), /Apply: a Worklog is required\./);
            assert.throws(() => addTagsAction.apply({}), /Apply: a Worklog is required\./);
            assert.doesNotThrow(() => addTagsAction.apply(new Worklog('name', new Date(), new Date())));
        });

        it('adds the specified tags to the worklog', () => {
            const tagsToAdd = [{ name: 'tag1', value: 'value1' }, { name: 'tag2', value: 'value2' }];
            const addTagsAction = new AddTagsAction({ tagsToAdd });
            const worklog = new Worklog('name', new Date(), new Date());

            addTagsAction.apply(worklog);

            assert.equal(worklog.getTagValue('tag1'), 'value1');
            assert.equal(worklog.getTagValue('tag2'), 'value2');
        });
    });
});