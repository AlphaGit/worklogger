import { IConditionConfig } from "../conditions/IConditionConfig";
import { loadCondition } from "./conditionLoader";
import { TrueCondition } from '../conditions/True';
import { HasTagCondition } from "../conditions/HasTag";

describe('loadCondition', () => {
    test('loads requested condition module', async () => {
        const conditionConfig = { type: 'HasTag' } as IConditionConfig;
        const result = await loadCondition(conditionConfig);

        expect(result).toBeInstanceOf(HasTagCondition);
    });

    test('loads default true condition if no condition is specified', async () => {
        const result = await loadCondition({ type: '' });

        expect(result).toBeInstanceOf(TrueCondition);
    });
});