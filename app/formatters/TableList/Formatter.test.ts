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

    test('rejects invalid worklogSets', () => {
        expect(() => formatter.format(null)).toThrow('Missing WorklogSet.');
        expect(() => formatter.format(undefined)).toThrow('Missing WorklogSet.');
    });

    test('includes a header with set columns', () => {
        const worklogSet = WorklogSets.single();

        const formatted = formatter.format(worklogSet);
        expect(formatted).toMatch('Date | Start Time | End Time | Duration | Title');
    });

    test('includes a header with tag columns', () => {
        const worklogSet = WorklogSets.single();

        const formatted = formatter.format(worklogSet);
        expect(formatted).toMatch('| Tag: client | Tag: project');
    });

    test('includes a separator line', () => {
        const worklogSet = WorklogSets.single();

        const formatted = formatter.format(worklogSet);
        expect(formatted).toMatch('--- | --- | --- | --- | --- | --- | ---');
    });

    test('includes worklog lines', () => {
        const worklogSet = WorklogSets.single();

        const formatted = formatter.format(worklogSet);

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

    test('includes a timezone note', () => {
        const worklogSet = WorklogSets.single();

        const formatted = formatter.format(worklogSet);
        expect(formatted).toMatch('All times are in PDT time.');
    });
});