import assert = require('assert');
import { AddTagAction } from '../../../app/actions/addTags/AddTagAction';
import { Worklog } from '../../../app/models/Worklog';

describe('AddTagAction', () => {
    describe('#constructor', () => {
        it('requires tagsToAdd configuration', () => {
            assertConfigurationIsRequired();
            assertConfigurationIsRequired({});
            assertConfigurationIsRequired({ tagsToAdd: 1 });
        });

        function assertConfigurationIsRequired(configuration?) {
            assert.throws(() => new AddTagAction(configuration), /Required configuration: tagsToAdd\./);
        }

        it('requires a non-empty tagsToAdd configuration', () => {
            assert.throws(() => new AddTagAction({ tagsToAdd: [] }), /Configuration cannot be empty: tagsToAdd\./);
        });

        function assertInvalidTagObjectThrows(tagObject) {
            const instantiationAction = () => new AddTagAction({ tagsToAdd: [ tagObject ] });
            assert.throws(instantiationAction, /Tags need to be valid tag-configuration objects./);
        }

        it('validates that tags are objects', () => {
            assertInvalidTagObjectThrows('tag1');
            assertInvalidTagObjectThrows('tag1:value1');
            assertInvalidTagObjectThrows('');
            assertInvalidTagObjectThrows(0);
            assertInvalidTagObjectThrows([]);
            assertInvalidTagObjectThrows({});
            assertInvalidTagObjectThrows({ something: 1, somethingElse: 2 });
            assertInvalidTagObjectThrows({ name: 1 });
        });

        it('can be instantiated', () => {
            assert.doesNotThrow(() => new AddTagAction({ tagsToAdd: [{ name: 'tag1', value: 'value1' }] }));
            assert.doesNotThrow(() => new AddTagAction({ tagsToAdd: [{ name: 'tag1', extractCaptureFromSummary: '(\\w+)' }] }));
        });
    });

    describe('#apply', () => {
        function assertWorklogIsRequired(action, worklog) {
            assert.throws(() => action.apply(worklog), /Apply: a Worklog is required\./);
        }

        it('requires a Worklog as a parameter', () => {
            const tagsToAdd = [{ name: 'tag1', value: 'value1' }];
            const addTagsAction = new AddTagAction({ tagsToAdd });
            assertWorklogIsRequired(addTagsAction, 1);
            assertWorklogIsRequired(addTagsAction, {});

            assert.doesNotThrow(() => addTagsAction.apply(new Worklog('name', new Date(), new Date())));
        });

        describe('fixed values', () => {
            it('adds the specified tags to the worklog (fixed values)', () => {
                const tagsToAdd = [{ name: 'tag1', value: 'value1' }, { name: 'tag2', value: 'value2' }];
                const addTagsAction = new AddTagAction({ tagsToAdd });
                const worklog = new Worklog('name', new Date(), new Date());

                addTagsAction.apply(worklog);

                assert.equal(worklog.getTagValue('tag1'), 'value1');
                assert.equal(worklog.getTagValue('tag2'), 'value2');
            });
        });

        describe('extractCaptureFromSummary', () => {
            it('adds the specified tags to the worklog', () => {
                const tagsToAdd = [{ name: 'tag1', extractCaptureFromSummary: '(\\w+)' }];
                const addTagsAction = new AddTagAction({ tagsToAdd });
                const worklog = new Worklog('   worklog summary   ', new Date(), new Date());

                addTagsAction.apply(worklog);

                assert.equal(worklog.getTagValue('tag1'), 'worklog');
            });

            it('does not set the tag if it could not match the regex', () => {
                const tagsToAdd = [{ name: 'tag1', extractCaptureFromSummary: '(abc)' }];
                const addTagsAction = new AddTagAction({ tagsToAdd });
                const worklog = new Worklog('   worklog summary   ', new Date(), new Date());

                addTagsAction.apply(worklog);

                assert.equal(worklog.getTagValue('tag1'), undefined);
            });

            it('does not set the tag if the regex cannot be compiled', () => {
                const tagsToAdd = [{ name: 'tag1', extractCaptureFromSummary: '(invalid regex' }];
                const addTagsAction = new AddTagAction({ tagsToAdd });
                const worklog = new Worklog('   worklog summary   ', new Date(), new Date());

                addTagsAction.apply(worklog);

                assert.equal(worklog.getTagValue('tag1'), undefined);
            });
        });
    });
});