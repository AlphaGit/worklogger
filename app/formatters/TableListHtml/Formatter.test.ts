import * as moment from "moment-timezone";
import { AppConfigurations, WorklogSets } from "../../../tests/entities";
import { IAppConfiguration } from "../../models/AppConfiguration";
import { TableListHtmlFormatter, TableListHtmlFormatterConfiguration } from ".";

describe('format', () => {
    let formatter: TableListHtmlFormatter;
    let appConfiguration: IAppConfiguration;

    beforeEach(() => {
        appConfiguration = AppConfigurations.normal();
        const configuration = new TableListHtmlFormatterConfiguration();
        formatter = new TableListHtmlFormatter(configuration, appConfiguration);
    });

    test('rejects invalid worklogSets', () => {
        expect(() => formatter.format(null)).toThrow('Missing WorklogSet.');
        expect(() => formatter.format(undefined)).toThrow('Missing WorklogSet.');
    });

    test('includes a header with set columns', () => {
        const worklogSet = WorklogSets.single();

        const formatted = formatter.format(worklogSet);
        expect(formatted).toMatch('<th>Date</th>')
        expect(formatted).toMatch('<th>Start Time</th>')
        expect(formatted).toMatch('<th>End Time</th>')
        expect(formatted).toMatch('<th>Duration</th>')
        expect(formatted).toMatch('<th>Title</th>')
    });

    test('includes a header with tag columns', () => {
        const worklogSet = WorklogSets.single();

        const formatted = formatter.format(worklogSet);
        expect(formatted).toMatch('<th>Tag: client</th>')
        expect(formatted).toMatch('<th>Tag: project</th>')
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

        expect(formatted).toMatch(`<td>${startDate}</td>`);
        expect(formatted).toMatch(`<td>${startTime}</td>`);
        expect(formatted).toMatch(`<td>${endTime}</td>`);
        expect(formatted).toMatch(`<td>${duration}</td>`);
        expect(formatted).toMatch(`<td>${title}</td>`);
        expect(formatted).toMatch(`<td>${client}</td>`);
        expect(formatted).toMatch(`<td>${project}</td>`);
    });

    test('includes a timezone note', () => {
        const worklogSet = WorklogSets.single();

        const formatted = formatter.format(worklogSet);
        expect(formatted).toMatch('<p>All times are in PDT time.</p>');
    });
});