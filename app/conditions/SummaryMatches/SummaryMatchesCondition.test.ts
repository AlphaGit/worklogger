import { SummaryMatchesCondition } from "./SummaryMatchesCondition";
import { Worklogs } from "../../../tests/entities";

const getCondition = (regex: string) => new SummaryMatchesCondition({ regex });

describe('constructor', () => {
    test('fails if not a valid regex', () => {
        expect(() => getCondition('[')).toThrow('Invalid regular expression');
        expect(() => getCondition('(abc')).toThrow('Invalid regular expression');

        expect(() => getCondition('\\n')).not.toThrow();
        expect(() => getCondition('example')).not.toThrow();
        expect(() => getCondition('a|b')).not.toThrow();
        expect(() => getCondition('[A-Z]+')).not.toThrow();
        expect(() => getCondition('([A-Z]\\d)+')).not.toThrow();
    });
});

describe('isSatisfiedBy', () => {
    test('checks against summary of worklog', () => {
        const worklog = Worklogs.normal();
        worklog.name = 'ABC123';

        expect(getCondition('ABC123').isSatisfiedBy(worklog)).toBe(true);
        expect(getCondition('\\w\\d').isSatisfiedBy(worklog)).toBe(true);
        expect(getCondition('\\w{3}\\d{3}').isSatisfiedBy(worklog)).toBe(true);
        expect(getCondition('[A-Z0-9]+').isSatisfiedBy(worklog)).toBe(true);

        expect(getCondition('[A-Z0-9]{7}').isSatisfiedBy(worklog)).toBe(false);
        expect(getCondition('Some regex').isSatisfiedBy(worklog)).toBe(false);
        expect(getCondition('^A$').isSatisfiedBy(worklog)).toBe(false);
    });
});

describe('toString', () => {
    test('shows a visual representation of the regex', () => {
        expect(getCondition('\\w{3}\\d{3}').toString()).toBe('SummaryMatches(/\\w{3}\\d{3}/)');
    });
});