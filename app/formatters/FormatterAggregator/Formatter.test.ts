import { beforeEach, describe, test, expect } from "@jest/globals";

import { FormatterAggregatorFormatter, FormatterAggregatorFormatterConfiguration } from '.';
import { AppConfigurations, WorklogSets } from '../../../tests/entities';
import { SummaryTextFormatterConfiguration } from '../SummaryText';
import { TableListFormatterConfiguration } from '../TableList';
import { IAppConfiguration } from '../../models';

describe('format', () => {
    let formatter: FormatterAggregatorFormatter;
    let appConfiguration: IAppConfiguration;

    beforeEach(() => {
        appConfiguration = AppConfigurations.normal();
        const summaryConfiguration = new SummaryTextFormatterConfiguration([['client']]);
        const tableListConfiguration = new TableListFormatterConfiguration();
        const configuration = new FormatterAggregatorFormatterConfiguration([summaryConfiguration, tableListConfiguration]);
        formatter = new FormatterAggregatorFormatter(configuration, appConfiguration);
    });

    test('rejects invalid worklogSets', async () => {
        await expect(async () => await formatter.format(null)).rejects.toThrow('Missing WorklogSet.');
        await expect(async () => await formatter.format(undefined)).rejects.toThrow('Missing WorklogSet.');
    });

    test('includes output from both formatters', async () => {
        const worklogSet = WorklogSets.single();

        const formatted = await formatter.format(worklogSet);
        expect(formatted).toMatch('Date | Start Time | End Time | Duration | Title');
        expect(formatted).toMatch('Total time: 1hs 0m');
    });
});