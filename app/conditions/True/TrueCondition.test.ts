import { TrueCondition } from ".";
import { Worklogs } from "../../../tests/entities";

describe('isSatisfiedBy', () => {
    test('returns true', () => {
        const condition = new TrueCondition();

        expect(condition.isSatisfiedBy(Worklogs.normal())).toBe(true);
        expect(condition.isSatisfiedBy(Worklogs.noTags())).toBe(true);
        expect(condition.isSatisfiedBy(Worklogs.noDuration())).toBe(true);
    });
});