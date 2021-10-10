import { IConditionConfig } from "../conditions/IConditionConfig";
import { loadCondition } from "./conditionLoader";
import { TrueCondition } from '../conditions/True';

describe('loadCondition', () => {
    test('loads requested condition module', async () => {
        const conditionClassMock = jest.fn(() => ({ condition: 'condition1' }));
        const moduleMock = jest.fn(() => ({ default: conditionClassMock }));
        jest.doMock('../conditions/condition1', moduleMock, { virtual: true });

        const conditionConfig = { type: 'condition1' } as IConditionConfig;
        const result = await loadCondition(conditionConfig);

        expect(moduleMock).toBeCalled();
        expect(conditionClassMock).toBeCalledWith(conditionConfig);
        expect(result).toStrictEqual({ condition: 'condition1' });
    });

    test('loads default true condition if no condition is specified', async () => {
        const result = await loadCondition({ type: '' });

        expect(result).toBeInstanceOf(TrueCondition);
    });
});