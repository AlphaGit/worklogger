import { AppConfigurations, ServiceRegistrations } from "../../tests/entities";
import { loadInputs } from "./inputLoader";

describe('loadInputs', () => {
    const serviceRegistations = ServiceRegistrations.mock();
    const appConfiguration = AppConfigurations.normal();

    test('loads specified inputs and their configurations', async () => {
        const config = {
            ...appConfiguration,
            inputs: [{
                type: 'input1',
                name: 'input1',
                storageRelativePath: '.',
                extraSetting1: '1'
            }, {
                type: 'input2',
                name: 'input2',
                storageRelativePath: '.',
                extraSetting1: '2'
            }]
        };

        const input1ClassMock = jest.fn(() => ({ input: 'input1' }));
        const input2ClassMock = jest.fn(() => ({ input: 'input2' }));
        const input1ModuleMock = jest.fn(() => input1ClassMock);
        const input2ModuleMock = jest.fn(() => input2ClassMock);
        jest.doMock('../inputs/input1/Input', input1ModuleMock, { virtual: true });
        jest.doMock('../inputs/input2/Input', input2ModuleMock, { virtual: true });

        const results = await loadInputs(serviceRegistations, config);

        expect(input1ModuleMock).toBeCalled();
        expect(input2ModuleMock).toBeCalled();
        expect(input1ClassMock).toBeCalledWith(serviceRegistations, config, config.inputs[0]);
        expect(input2ClassMock).toBeCalledWith(serviceRegistations, config, config.inputs[1]);

        expect(results.length).toBe(2);
        expect(results[0]).toStrictEqual({ input: 'input1' });
        expect(results[1]).toStrictEqual({ input: 'input2' });
    });
});