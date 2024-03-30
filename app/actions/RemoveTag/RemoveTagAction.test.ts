import { Worklog } from '../../models/Worklog';
import { RemoveTagAction } from './RemoveTagAction';
import { RemoveTagConfiguration } from './RemoveTagConfiguration';
import { Tag } from '../../models/Tag';

describe('RemoveTagAction', () => {
    let worklog: Worklog;
    let removeTagAction: RemoveTagAction;
    let tagName: string;

    beforeEach(() => {
        worklog = new Worklog('Test Worklog', new Date(), new Date());
        tagName = 'urgent';
        worklog.addTag(new Tag(tagName, 'true'));
        const removeTagConfiguration = new RemoveTagConfiguration(tagName);
        removeTagAction = new RemoveTagAction(removeTagConfiguration);
    });

    test('removes an existing tag from the worklog', () => {
        expect(worklog.getTagValue(tagName)).toBe('true');
        removeTagAction.apply(worklog);
        expect(worklog.getTagValue(tagName)).toBeUndefined();
    });

    test('does nothing if the tag does not exist', () => {
        const nonExistentTagName = 'non-existent';
        const removeTagConfiguration = new RemoveTagConfiguration(nonExistentTagName);
        const action = new RemoveTagAction(removeTagConfiguration);
        action.apply(worklog);
        // Expect no error to be thrown and the worklog's state to be unchanged
        expect(worklog.getTagKeys()).toContain(tagName);
    });

    test('toString returns a descriptive string', () => {
        expect(removeTagAction.toString()).toBe(`RemoveTag: ${tagName}`);
    });
});
