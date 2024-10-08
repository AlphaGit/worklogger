import { describe, test, expect } from "@jest/globals";

import { SendEmailCommandInput } from "@aws-sdk/client-sesv2";
import { AwsSesOutput } from ".";
import { AppConfigurations, Formatters, WorklogSets } from "../../../tests/entities";
import { IAwsSesOutputConfiguration } from "./IAwsSesOutputConfiguration";

const sendEmailMock = jest.fn().mockResolvedValue({});
jest.mock('@aws-sdk/client-sesv2', () => {
    const actual = jest.requireActual('@aws-sdk/client-sesv2');
    return ({
        ...actual,
        SESv2Client: jest.fn().mockImplementation(() => ({
            send: sendEmailMock
        }))
    });
});


const exampleSesConfiguration: IAwsSesOutputConfiguration = {
    aws: {
        region: 'us-east-1'
    },
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

        const output = new AwsSesOutput(formatter, exampleSesConfiguration, AppConfigurations.normal());
        await output.outputWorklogSet(worklogSet);

        expect(formatter.formatFunction).toHaveBeenCalledWith(worklogSet);
    });

    test('renders the configured values for the email', async () => {
        const formatter = Formatters.fake();
        formatter.formatFunction = jest.fn().mockReturnValue('<worklogSet contents>');
        const worklogSet = WorklogSets.single();
        worklogSet.startDateTime = new Date('2021-06-13T00:00:00-0700');
        worklogSet.endDateTime = new Date('2021-06-14T00:00:00-0700');

        exampleSesConfiguration.subjectTemplate = 'Worklogs until {{endDateTime}}';
        exampleSesConfiguration.bodyTemplate = 'From {{startDateTime}}: {{worklogs.0.name}} {{{contents}}}';

        const output = new AwsSesOutput(formatter, exampleSesConfiguration, AppConfigurations.normal());
        await output.outputWorklogSet(worklogSet);

        expect(sendEmailMock).toHaveBeenCalled();

        const sendEmailCommand = sendEmailMock.mock.calls[0][0];
        const input = sendEmailCommand.input as SendEmailCommandInput;

        expect(input.FromEmailAddress).toBe('from@example.com');
        expect(input.Destination).not.toBeNull();
        expect(input.Destination?.ToAddresses).toBe(exampleSesConfiguration.toAddresses);

        expect(input.Content?.Simple?.Subject).not.toBeNull();
        expect(input.Content?.Simple?.Subject?.Charset).toBe('UTF-8');
        expect(input.Content?.Simple?.Subject?.Data).toBe(`Worklogs until ${worklogSet.endDateTime}`);

        expect(input.Content?.Simple?.Body?.Html).not.toBeNull();
        expect(input.Content?.Simple?.Body?.Html?.Charset).toBe('UTF-8');
        expect(input.Content?.Simple?.Body?.Html?.Data).toBe(`<html><body>From ${worklogSet.startDateTime}: Planning meeting <worklogSet contents></body></html>`);
    });
});