import { describe, test, expect } from "@jest/globals";

import { ComparisonCondition } from ".";
import { Operator } from "./ComparisonConditionConfiguration";
import { WorklogSets } from "../../../tests/entities";

const config = (operator: Operator, value: number) => ({
    operator,
    operand1: { type: 'field', field: 'totalDuration' } as const,
    operand2: { type: 'constant', value }
});

describe('isSatisfiedBy', () => {
    test('greater than', () => {
        const condition = new ComparisonCondition(config('gt', 100));
        expect(condition.isSatisfiedBy(WorklogSets.double())).toBe(true);
    });

    test('less than', () => {
        const condition = new ComparisonCondition(config('lt', 200));
        expect(condition.isSatisfiedBy(WorklogSets.single())).toBe(true);
    });

    test('equal', () => {
        const condition = new ComparisonCondition(config('eq', 120));
        expect(condition.isSatisfiedBy(WorklogSets.double())).toBe(true);
    });
});
