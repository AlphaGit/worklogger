import { beforeEach, describe, test, expect } from "@jest/globals";

import * as moment from "moment-timezone";
import { AppConfigurations, Dates, Tags, WorklogSets } from "../../../tests/entities";
import { Tag } from "../../models";
import { IAppConfiguration } from "../../models/AppConfiguration";
import { SummaryHtmlFormatter, SummaryHtmlFormatterConfiguration } from ".";
import { WorklogSet } from "../../models/WorklogSet";

describe('format', () => {
    let formatter: SummaryHtmlFormatter;
    let appConfiguration: IAppConfiguration;

    beforeEach(() => {
        appConfiguration = AppConfigurations.normal();
        const configuration = new SummaryHtmlFormatterConfiguration([['client', 'project']]);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);
    });

    test('rejects invalid worklogSets', async () => {
        await expect(async () => await formatter.format(null as unknown as WorklogSet)).rejects.toThrow('Missing WorklogSet.');
        await expect(async () => await formatter.format(undefined as unknown as WorklogSet)).rejects.toThrow('Missing WorklogSet.');
    });

    test('includes a header with dates', async () => {
        const worklogSet = WorklogSets.mixed();
        const timeZone = appConfiguration.options.timeZone;
        const start = moment.tz(worklogSet.startDateTime, timeZone).format();
        const end = moment.tz(worklogSet.endDateTime, timeZone).format();

        const formatted = await formatter.format(worklogSet);
        expect(formatted).toMatch(`from ${start}`);
        expect(formatted).toMatch(`to ${end}`);
    });

    test('includes a total with the durations recorded', async () => {
        const worklogSet = WorklogSets.double();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();

        worklogSet.worklogs[1].startDateTime = Dates.pastOneHour();
        worklogSet.worklogs[1].endDateTime = Dates.now();

        expect(await formatter.format(worklogSet)).toMatch('3hs');
    });

    test('does not show tags when no aggregations are configured', async () => {
        const worklogSet = WorklogSets.singleNoTags();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();

        const configuration = new SummaryHtmlFormatterConfiguration([]);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const formatted = await formatter.format(worklogSet);

        expect(formatted).not.toMatch('client');
        expect(formatted).not.toMatch('project');
    });

    test('shows total by tag selection', async () => {
        const worklogSet = WorklogSets.singleNoTags();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();
        worklogSet.worklogs[0].addTag(Tags.client.ProCorp());
        worklogSet.worklogs[0].addTag(new Tag('project', 'Project1'));

        const configuration = new SummaryHtmlFormatterConfiguration([['client'], ['project']]);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const formatted = await formatter.format(worklogSet);

        expect(formatted).toMatch('<p>Total time by client: (excluding non-tagged: 0hs 0m)</p>');
        expect(formatted).toMatch('<li>[client] ProCorp: 2hs 0m</li>');

        expect(formatted).toMatch('<p>Total time by project: (excluding non-tagged: 0hs 0m)</p>');
        expect(formatted).toMatch('<li>[project] Project1: 2hs 0m</li>');
    });

    test('aggregates on multiple criteria', async () => {
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

        const formatted = await formatter.format(worklogSet);

        expect(formatted).toMatch('<p>Total time by client / project: (excluding non-tagged: 0hs 0m)</p>');
        expect(formatted).toMatch('<li>[client] ProCorp: 3hs 0m');
        expect(formatted).toMatch('<li>[project] Project1: 2hs 0m</li>');
        expect(formatted).toMatch('<li>[project] Project2: 1hs 0m</li>');
        expect(formatted).toMatch(/<ul>.+<ul>/is); // nested lists
    });
});