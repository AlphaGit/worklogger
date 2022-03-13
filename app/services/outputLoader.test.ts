import { AppConfigurations } from "../../tests/entities";
import { IOutputConfiguration } from "../outputs/IOutputConfiguration";
import { loadOutputs } from './outputLoader';
import { TrueCondition } from '../conditions/True';

describe('loadOutputs', () => {
    const appConfiguration = AppConfigurations.normal();

    test('loads specified outputs, conditions and formatters', async () => {
        const outputConfigs: IOutputConfiguration[] = [{
            type: 'output1',
            excludeFromNonProcessedWarning: false,
            condition: {
                type: ''
            },
            formatter: {
                type: ''
            }
        }, {
            type: 'output2',
            excludeFromNonProcessedWarning: false,
            condition: {
                type: 'condition2'
            },
            formatter: {
                type: 'formatter2'
            }
        }, {
            type: 'output2',
            excludeFromNonProcessedWarning: false,
            condition: {
                type: 'condition2'
            }
        }];

        const output1ClassMock = jest.fn((formatter, outputConfig, appConfig) => ({ output: 'output1', formatter, outputConfig, appConfig }));
        const output1ModuleMock = jest.fn(() => output1ClassMock);
        jest.doMock('../outputs/output1/Output', output1ModuleMock, { virtual: true });

        const output2ClassMock = jest.fn((formatter, outputConfig, appConfig) => ({ output: 'output2', formatter, outputConfig, appConfig }));
        const output2ModuleMock = jest.fn(() => output2ClassMock);
        jest.doMock('../outputs/output2/Output', output2ModuleMock, { virtual: true });

        const condition2ClassMock = jest.fn(() => ({ condition: 'condition2' }));
        const condition2ModuleMock = jest.fn(() => condition2ClassMock);
        jest.doMock('../conditions/condition2', condition2ModuleMock, { virtual: true });

        const noFormatFormatterClassMock = jest.fn(() => ({ formatter: 'NoFormat' }));
        const noFormatFormatterModuleMock = jest.fn(() => noFormatFormatterClassMock);
        jest.doMock('../formatters/NoFormat/Formatter', noFormatFormatterModuleMock, { virtual: true });

        const formatter2ClassMock = jest.fn(() => ({ formatter: 'formatter2' }));
        const formatter2ModuleMock = jest.fn(() => formatter2ClassMock);
        jest.doMock('../formatters/formatter2/Formatter', formatter2ModuleMock, { virtual: true });

        const outputs = await loadOutputs(outputConfigs, appConfiguration);

        expect(outputs.length).toBe(3);
        const [output1, output2, output3] = outputs;

        expect(output1.condition).toBeInstanceOf(TrueCondition);
        expect(output1.excludeFromNonProcessedWarning).toBe(false);
        expect(output1.output).toStrictEqual({
            output: 'output1',
            appConfig: appConfiguration,
            outputConfig: outputConfigs[0],
            formatter: {
                formatter: 'NoFormat'
            }
        });

        expect(output2.condition).toStrictEqual({ condition: 'condition2' });
        expect(output2.excludeFromNonProcessedWarning).toBe(false);
        expect(output2.output).toStrictEqual({
            output: 'output2',
            appConfig: appConfiguration,
            outputConfig: outputConfigs[1],
            formatter: {
                formatter: 'formatter2'
            }
        });

        expect(output3.condition).toStrictEqual({ condition: 'condition2' });
        expect(output3.excludeFromNonProcessedWarning).toBe(false);
        expect(output3.output).toStrictEqual({
            output: 'output2',
            appConfig: appConfiguration,
            outputConfig: outputConfigs[2],
            formatter: {
                formatter: 'NoFormat'
            }
        });
    });
});