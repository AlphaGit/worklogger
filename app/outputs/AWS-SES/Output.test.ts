import { AwsSesOutput } from ".";
import { AppConfigurations, Formatters, WorklogSets } from "../../../tests/entities";
import { IAwsSesOutputConfiguration } from "./IAwsSesOutputConfiguration";

const exampleSesConfiguration: IAwsSesOutputConfiguration = {
    subjectTemplate: 'subject {{}}',
    bodyTemplate: 'body {{}}',
    fromAddress: 'from@example.com',
    toAddresses: ['to1@example.com', 'to2@example.com'],
    type: 'AWS-SES',
    excludeFromNonProcessedWarning: true,
    condition: null,
    formatter: null
}

describe('outputWorklogSet', () => {
    test('requires a worklogSet', async () => {
        const output = new AwsSesOutput(Formatters.fake(), exampleSesConfiguration, AppConfigurations.normal());

        await expect(async () => output.outputWorklogSet(null)).rejects.toThrow('Required parameter: worklogSet.');
        await expect(async () => output.outputWorklogSet(undefined)).rejects.toThrow('Required parameter: worklogSet.');
    });

    test('formats the worklogSet', async () => {
        const formatter = Formatters.fake();
        formatter.formatFunction = jest.fn().mockReturnValue('');
        const worklogSet = WorklogSets.single();

        const output = new AwsSesOutput(Formatters.fake(), exampleSesConfiguration, AppConfigurations.normal());
        await output.outputWorklogSet(worklogSet);

        expect(formatter.formatFunction).toHaveBeenCalledWith(worklogSet)
    });
});