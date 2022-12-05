import * as moment from "moment-timezone";
import { TableListFormatter, TableListFormatterConfiguration } from '.';
import { AppConfigurations, WorklogSets } from '../../../tests/entities';
import { IAppConfiguration } from '../../models';

describe('format', () => {
    let formatter: TableListFormatter;
    let appConfiguration: IAppConfiguration;

    beforeEach(() => {
        appConfiguration = AppConfigurations.normal();
        const configuration = new TableListFormatterConfiguration();
        formatter = new TableListFormatter(configuration, appConfiguration);
    });

    test('rejects invalid worklogSets', async () => {
        await expect(async () => await formatter.format(null)).rejects.toThrow('Missing WorklogSet.');
        await expect(async () => await formatter.format(undefined)).rejects.toThrow('Missing WorklogSet.');
    });

    test('includes a header with set columns', async () => {
        const worklogSet = WorklogSets.single();

        const formatted = await formatter.format(worklogSet);
        expect(formatted).toMatch('Date | Start Time | End Time | Duration | Title');
    });

    test('includes a header with tag columns', async () => {
        const worklogSet = WorklogSets.single();

        const formatted = await formatter.format(worklogSet);
        expect(formatted).toMatch('| Tag: client | Tag: project');
    });

    test('includes a separator line', async () => {
        const worklogSet = WorklogSets.single();

        const formatted = await formatter.format(worklogSet);
        expect(formatted).toMatch('--- | --- | --- | --- | --- | --- | ---');
    });

    test('includes worklog lines', async () => {
        const worklogSet = WorklogSets.single();

        const formatted = await formatter.format(worklogSet);

        const worklog = worklogSet.worklogs[0];
        const timeZone = appConfiguration.options.timeZone;
        const startDate = moment.tz(worklog.startDateTime, timeZone).format('YYYY-MM-DD');
        const startTime = moment.tz(worklog.startDateTime, timeZone).format('HH:mm');
        const endTime = moment.tz(worklog.endDateTime, timeZone).format('HH:mm');
        const duration = worklog.getShortDuration();
        const title = worklog.name;
        const client = worklog.getTagValue('client');
        const project = worklog.getTagValue('project');

        expect(formatted).toMatch(`${startDate} | ${startTime} | ${endTime} | ${duration} | ${title} | ${client} | ${project}`);
    });

    test('includes a timezone note', async () => {
        const worklogSet = WorklogSets.single();

        const formatted = await formatter.format(worklogSet);
        expect(formatted).toMatch(/All times are in P[DS]T time\./);
    });
});