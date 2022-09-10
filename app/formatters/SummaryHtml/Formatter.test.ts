import * as moment from "moment-timezone";
import { AppConfigurations, Dates, Tags, WorklogSets } from "../../../tests/entities";
import { Tag } from "../../models";
import { IAppConfiguration } from "../../models/AppConfiguration";
import { SummaryHtmlFormatter, SummaryHtmlFormatterConfiguration } from ".";
import { isExpressionWithTypeArguments } from "typescript";

describe('format', () => {
    let formatter: SummaryHtmlFormatter;
    let appConfiguration: IAppConfiguration;

    beforeEach(() => {
        appConfiguration = AppConfigurations.normal();
        const configuration = new SummaryHtmlFormatterConfiguration([['client', 'project']]);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);
    });

    test('rejects invalid worklogSets', () => {
        expect(() => formatter.format(null)).toThrow('Missing WorklogSet.');
        expect(() => formatter.format(undefined)).toThrow('Missing WorklogSet.');
    });

    test('includes a header with dates', () => {
        const worklogSet = WorklogSets.mixed();
        const timeZone = appConfiguration.options.timeZone;
        const start = moment.tz(worklogSet.startDateTime, timeZone).format();
        const end = moment.tz(worklogSet.endDateTime, timeZone).format();

        const formatted = formatter.format(worklogSet);
        expect(formatted).toMatch(`from ${start}`);
        expect(formatted).toMatch(`to ${end}`);
    });

    test('includes a total with the durations recorded', () => {
        const worklogSet = WorklogSets.double();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();

        worklogSet.worklogs[1].startDateTime = Dates.pastOneHour();
        worklogSet.worklogs[1].endDateTime = Dates.now();

        expect(formatter.format(worklogSet)).toMatch('3hs');
    });

    test('does not show tags if there are no aggregations (empty array)', () => {
        const worklogSet = WorklogSets.singleNoTags();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();

        const configuration = new SummaryHtmlFormatterConfiguration([]);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const formatted = formatter.format(worklogSet);

        expect(formatted).not.toMatch('client');
        expect(formatted).not.toMatch('project');
    });

    test('does not show tags if there are no aggregations (null)', () => {
        const worklogSet = WorklogSets.singleNoTags();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();

        const configuration = new SummaryHtmlFormatterConfiguration(null);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const formatted = formatter.format(worklogSet);

        expect(formatted).not.toMatch('client');
        expect(formatted).not.toMatch('project');
    });

    test('does not show tags if there are no aggregations (undefined)', () => {
        const worklogSet = WorklogSets.singleNoTags();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();

        const configuration = new SummaryHtmlFormatterConfiguration(undefined);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const formatted = formatter.format(worklogSet);

        expect(formatted).not.toMatch('client');
        expect(formatted).not.toMatch('project');
    });


    test('shows total by tag selection', () => {
        const worklogSet = WorklogSets.singleNoTags();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();
        worklogSet.worklogs[0].addTag(Tags.client.ProCorp());
        worklogSet.worklogs[0].addTag(new Tag('project', 'Project1'));

        const configuration = new SummaryHtmlFormatterConfiguration([['client'], ['project']]);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const formatted = formatter.format(worklogSet);

        expect(formatted).toMatch('<p>Total time by client:</p>');
        expect(formatted).toMatch('<li>[client] ProCorp: 2hs 0m</li>');

        expect(formatted).toMatch('<p>Total time by project:</p>');
        expect(formatted).toMatch('<li>[project] Project1: 2hs 0m</li>');
    });

    test('aggregates on multiple criteria', () => {
        const worklogSet = WorklogSets.double();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();
        worklogSet.worklogs[0].addTag(Tags.client.ProCorp());
        worklogSet.worklogs[0].addTag(new Tag('project', 'Project1'));
        worklogSet.worklogs[1].startDateTime = Dates.pastOneHour();
        worklogSet.worklogs[1].endDateTime = Dates.now();
        worklogSet.worklogs[1].addTag(Tags.client.ProCorp());
        worklogSet.worklogs[1].addTag(new Tag('project', 'Project2'));

        const configuration = new SummaryHtmlFormatterConfiguration([['client', 'project']]);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const formatted = formatter.format(worklogSet);

        expect(formatted).toMatch('<p>Total time by client / project:</p>');
        expect(formatted).toMatch('<li>[client] ProCorp: 3hs 0m');
        expect(formatted).toMatch('<li>[project] Project1: 2hs 0m</li>');
        expect(formatted).toMatch('<li>[project] Project2: 1hs 0m</li>');
        expect(formatted).toMatch(/<ul>.+<ul>/is); // nested lists
    });
});