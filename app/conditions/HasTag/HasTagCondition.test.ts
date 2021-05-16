import { HasTagCondition, HasTagConditionConfiguration } from ".";
import { Worklogs } from "../../../tests/entities";

describe('isSatisfiedBy', () => {
    test('checks for presence of tag', () => {
        const configuration = new HasTagConditionConfiguration();
        configuration.tagName = 'client';
        const condition = new HasTagCondition(configuration);

        const worklog = Worklogs.normal();

        expect(condition.isSatisfiedBy(worklog)).toBe(true);
    });

    test('checks for presence of tag (non-existent)', () => {
        const configuration = new HasTagConditionConfiguration();
        configuration.tagName = 'non-existent tag';
        const condition = new HasTagCondition(configuration);

        const worklog = Worklogs.normal();

        expect(condition.isSatisfiedBy(worklog)).toBe(false);
    });

    test('checks for presence of tag and value', () => {
        const worklog = Worklogs.normal();

        const configuration = new HasTagConditionConfiguration();
        configuration.tagName = 'client';
        configuration.tagValue = worklog.getTagValue('client');
        const condition = new HasTagCondition(configuration);

        expect(condition.isSatisfiedBy(worklog)).toBe(true);
    });

    test('checks for presence of tag and value (non-matching value)', () => {
        const worklog = Worklogs.normal();

        const configuration = new HasTagConditionConfiguration();
        configuration.tagName = 'client';
        configuration.tagValue = 'non-matching value';
        const condition = new HasTagCondition(configuration);

        expect(condition.isSatisfiedBy(worklog)).toBe(false);
    });
});

describe('toString', () => {
    test('displays a representation of the condition', () => {
        const configuration = new HasTagConditionConfiguration();
        configuration.tagName = 'tagName';
        const condition = new HasTagCondition(configuration);

        expect(condition.toString()).toBe('HasTag(tagName)');
    });

    test('displays a representation of the condition (tag value included)', () => {
        const configuration = new HasTagConditionConfiguration();
        configuration.tagName = 'tagName';
        configuration.tagValue = 'tagValue';
        const condition = new HasTagCondition(configuration);

        expect(condition.toString()).toBe('HasTag(tagName: tagValue)');
    });
});