import { Worklogs } from "../../../tests/entities";
import { AddTagAction } from "./AddTagAction";
import { AddTagConfiguration } from "./AddTagConfiguration";
import { AddTagDefinition } from "./AddTagDefinition";

let addTagDefinition: AddTagDefinition;
let addTagConfiguration: AddTagConfiguration;
let addTagAction: AddTagAction;

beforeEach(() => {
    addTagDefinition = new AddTagDefinition('tagName', 'tagValue');
    addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
    addTagAction = new AddTagAction(addTagConfiguration);
});

describe('constructor', () => {
    test('rejects empty tagsToAdd configuration', () => {
        addTagConfiguration = new AddTagConfiguration([]);
        expect(() => new AddTagAction(addTagConfiguration)).toThrow('Configuration cannot be empty: tagsToAdd.');
    });
    
    test('rejects null tagsToAdd configuration', () => {
        addTagConfiguration = new AddTagConfiguration([null]);
        expect(() => new AddTagAction(addTagConfiguration)).toThrow('Tags need to be valid tag-configuration objects.');
    });
    
    test('can be instantiated', () => {
        expect(() => new AddTagAction(addTagConfiguration)).not.toThrow();
    });
});

describe('apply', () => {
    describe('adds a tag', () => {
        test('string', () => {
            const worklog = Worklogs.normal();
            addTagAction.apply(worklog);
            const { name, value } = addTagDefinition;
            expect(worklog.getTagValue(name)).toBe(value);
        });

        test('regex', () => {
            const addTagDefinition = new AddTagDefinition('tagName', null, 'value: (\\w+)');
            const addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
            const addTagAction = new AddTagAction(addTagConfiguration);

            const worklog = Worklogs.normal();
            worklog.name = 'worklog with value: abc';
            addTagAction.apply(worklog);

            expect(worklog.getTagValue('tagName')).toBe('abc');
        });

        test('regex (no match)', () => {
            const addTagDefinition = new AddTagDefinition('tagName', '', 'value: (\\w+)');
            const addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
            const addTagAction = new AddTagAction(addTagConfiguration);

            const worklog = Worklogs.normal();
            worklog.name = 'worklog without match';
            addTagAction.apply(worklog);

            expect(worklog.getTagValue('tagName')).toBe('');
        });

        test('regex (invalid)', () => {
            const addTagDefinition = new AddTagDefinition('tagName', '', 'value: (');
            const addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
            const addTagAction = new AddTagAction(addTagConfiguration);

            const worklog = Worklogs.normal();
            worklog.name = 'worklog with value: abc';
            addTagAction.apply(worklog);

            expect(worklog.getTagValue('tagName')).toBe('');
        });
    });

    test('reject invalid worklogs', () => {
        expect(() => addTagAction.apply(null)).toThrow('Apply: a Worklog is required.');
        expect(() => addTagAction.apply(undefined)).toThrow('Apply: a Worklog is required.');
    });
});

describe('toString', () => {
    describe('provides an action description', () => {
        test('string', () => {
            const addTagDefinition = new AddTagDefinition('tagName', 'tagValue');
            const addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
            const addTagAction = new AddTagAction(addTagConfiguration);
            expect(addTagAction.toString()).toBe('AddTags: [tagName: tagValue]')
        });

        test('regex', () => {
            const addTagDefinition = new AddTagDefinition('tagName', null, 'value: (\\w+)');
            const addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
            const addTagAction = new AddTagAction(addTagConfiguration);
            expect(addTagAction.toString()).toBe('AddTags: [tagName: Regex(value: (\\w+))]')
        });
    });
});