import { loadActionsAndConditions } from './actionLoader';

const conditionLoaderMock = jest.fn().mockResolvedValue('condition');

jest.mock('./conditionLoader', () => ({
    loadCondition: (...args) => {
        return conditionLoaderMock(...args);
    }
}));

describe('loadActionsAndConditions', () => {
    test('loads specified actions', async () => {
        const actionsMock = jest.fn(() => { action: 'action' });
        const moduleMock = jest.fn().mockResolvedValue({ default: actionsMock });
        jest.doMock('app/actions/action1', moduleMock, { virtual: true });
        jest.doMock('app/actions/action2', moduleMock, { virtual: true });
        const actionsToLoad = [{
            action: {
                type: 'action1'
            },
            condition: {
                type: 'condition1'
            }
        }, {
            action: {
                type: 'action2'
            },
            condition: {
                type: 'condition2'
            }
        }];
        const result = await loadActionsAndConditions(actionsToLoad);

        expect(result).toStrictEqual([{
            action: expect.anything(),
            condition: 'condition'
        }, {
            action: expect.anything(),
            condition: 'condition'
        }]);

        expect(moduleMock).toBeCalledTimes(2);
        expect(actionsMock).toBeCalledTimes(2);
        expect(actionsMock).toBeCalledWith(actionsToLoad[0].action);
        expect(actionsMock).toBeCalledWith(actionsToLoad[1].action);

        expect(conditionLoaderMock).toBeCalledTimes(2);
        expect(conditionLoaderMock).toBeCalledWith(actionsToLoad[0].condition);
        expect(conditionLoaderMock).toBeCalledWith(actionsToLoad[1].condition);
    });
});