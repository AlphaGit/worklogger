import { describe, test, expect } from "@jest/globals";

import { HasTagCondition } from ".";
import { Worklogs } from "../../../tests/entities";

describe('isSatisfiedBy', () => {
    test('checks for presence of tag', () => {
        const configuration = {
            tagName: 'client'
        };
        const condition = new HasTagCondition(configuration);

        const worklog = Worklogs.normal();

        expect(condition.isSatisfiedBy(worklog)).toBe(true);
    });

    test('checks for presence of tag (non-existent)', () => {
        const configuration = {
            tagName: 'non-existent tag'
        };
        const condition = new HasTagCondition(configuration);

        const worklog = Worklogs.normal();

        expect(condition.isSatisfiedBy(worklog)).toBe(false);
    });

    test('checks for presence of tag and value', () => {
        const worklog = Worklogs.normal();

        const configuration = {
            tagName: 'client',
            tagValue: worklog.getTagValue('client')
        };
        const condition = new HasTagCondition(configuration);

        expect(condition.isSatisfiedBy(worklog)).toBe(true);
    });

    test('checks for presence of tag and value (non-matching value)', () => {
        const worklog = Worklogs.normal();

        const configuration = {
            tagName: 'client',
            tagValue: 'non-matching value'
        };
        const condition = new HasTagCondition(configuration);

        expect(condition.isSatisfiedBy(worklog)).toBe(false);
    });
});

describe('toString', () => {
    test('displays a representation of the condition', () => {
        const configuration = {
            tagName: 'tagName'
        };
        const condition = new HasTagCondition(configuration);

        expect(condition.toString()).toBe('HasTag(tagName)');
    });

    test('displays a representation of the condition (tag value included)', () => {
        const configuration = {
            tagName: 'tagName',
            tagValue: 'tagValue'
        };
        const condition = new HasTagCondition(configuration);

        expect(condition.toString()).toBe('HasTag(tagName: tagValue)');
    });
});