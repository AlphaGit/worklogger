import { Worklog } from "../../models/Worklog";
import { AddTagAction } from "./AddTagAction";
import { AddTagConfiguration } from "./AddTagConfiguration";
import { AddTagDefinition } from "./AddTagDefinition";
import * as moment from 'moment-timezone';

let addTagDefinition: AddTagDefinition;
let addTagConfiguration: AddTagConfiguration;
let addTagAction: AddTagAction;
let worklog: Worklog;

beforeEach(() => {
    addTagDefinition = new AddTagDefinition('tagName', 'tagValue');
    addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
    addTagAction = new AddTagAction(addTagConfiguration);
    worklog = new Worklog('worklogName', moment().subtract(1, 'hour').toDate(), moment().toDate(), 60);
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
            addTagAction.apply(worklog);
            const { name, value } = addTagDefinition;
            expect(worklog.getTagValue(name)).toBe(value);
        });

        test('regex', () => {
            const addTagDefinition = new AddTagDefinition('tagName', null, 'value: (\\w+)');
            const addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
            const addTagAction = new AddTagAction(addTagConfiguration);

            worklog = new Worklog('worklog with value: abc', moment().subtract(1, 'hour').toDate(), moment().toDate(), 60);
            addTagAction.apply(worklog);

            expect(worklog.getTagValue('tagName')).toBe('abc');
        });

        test('regex (no match)', () => {
            const addTagDefinition = new AddTagDefinition('tagName', null, 'value: (\\w+)');
            const addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
            const addTagAction = new AddTagAction(addTagConfiguration);

            worklog = new Worklog('worklog without match', moment().subtract(1, 'hour').toDate(), moment().toDate(), 60);
            addTagAction.apply(worklog);

            expect(worklog.getTagValue('tagName')).toBeUndefined();
        });

        test('regex (invalid)', () => {
            const addTagDefinition = new AddTagDefinition('tagName', null, 'value: (');
            const addTagConfiguration = new AddTagConfiguration([addTagDefinition]);
            const addTagAction = new AddTagAction(addTagConfiguration);

            worklog = new Worklog('worklog with value: abc', moment().subtract(1, 'hour').toDate(), moment().toDate(), 60);
            addTagAction.apply(worklog);

            expect(worklog.getTagValue('tagName')).toBeUndefined();
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