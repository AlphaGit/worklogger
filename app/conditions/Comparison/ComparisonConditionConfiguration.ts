export type Operand =
    | { type: 'field', field: 'totalDuration' }
    | { type: 'constant', value: number };

export type Operator = 'eq' | 'gt' | 'lt' | 'gte' | 'lte';

export type ComparisonConditionConfiguration = {
    operator: Operator;
    operand1: Operand;
    operand2: Operand;
};
