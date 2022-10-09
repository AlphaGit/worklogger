import { LoggerOutput } from '.';
import { AppConfigurations, Formatters, WorklogSets } from '../../../tests/entities';
import { IOutputConfiguration } from '../IOutputConfiguration';

const loggerMock = {
    info: jest.fn()
};
jest.mock('log4js', () => ({
    getLogger: () => loggerMock
}));

describe('outputWorklogSet', () => {
    const outputConfiguration: IOutputConfiguration = {
        type: 'logger',
        excludeFromNonProcessedWarning: false,
        condition: null,
        formatter: null
    };
    const fakeFormatter = Formatters.fake();
    const output = new LoggerOutput(fakeFormatter, outputConfiguration, AppConfigurations.normal());

    test('validates worklogSet', async () => {
        const worklogSet = WorklogSets.single();
        await output.outputWorklogSet(worklogSet);

        const expectedOutput = await fakeFormatter.format(worklogSet);
        expect(loggerMock.info).toHaveBeenCalledWith(expectedOutput);
    });
});