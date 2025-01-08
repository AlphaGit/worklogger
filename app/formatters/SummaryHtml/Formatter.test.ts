import { beforeEach, describe, test, expect } from "@jest/globals";
import * as moment from "moment-timezone";
import { AppConfigurations, Dates, Tags, WorklogSets } from "../../../tests/entities";
import { Tag } from "../../models";
import { IAppConfiguration } from "../../models/AppConfiguration";
import { SummaryHtmlFormatter, SummaryHtmlFormatterConfiguration } from ".";

describe('format with filters', () => {
    let formatter: SummaryHtmlFormatter;
    let appConfiguration: IAppConfiguration;

    beforeEach(() => {
        appConfiguration = AppConfigurations.normal();
    });

    test('filters worklog entries by tag value', async () => {
        const configuration = new SummaryHtmlFormatterConfiguration(
            [['client', 'project']], 
            [{
                tagNames: ['client', 'project'],
                filter: (worklog) => worklog.getTagValue('project') === 'Project1'
            }]
        );
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const worklogSet = WorklogSets.double();
        worklogSet.worklogs[0].addTag(Tags.client.ProCorp());
        worklogSet.worklogs[0].addTag(new Tag('project', 'Project1'));
        worklogSet.worklogs[1].addTag(Tags.client.ProCorp());
        worklogSet.worklogs[1].addTag(new Tag('project', 'Project2'));

        const formatted = await formatter.format(worklogSet);
        
        expect(formatted).toMatch('Project1');
        expect(formatted).not.toMatch('Project2');
    });

    test('applies multiple filters to grouped entries', async () => {
        const configuration = new SummaryHtmlFormatterConfiguration(
            [['client', 'project']], 
            [{
                tagNames: ['client', 'project'],
                filter: (worklog) => worklog.getTagValue('project') === 'Project1'
            }, {
                tagNames: ['client', 'project'],
                filter: (worklog) => worklog.getDurationInMinutes() > 60
            }]
        );
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const worklogSet = WorklogSets.double();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();
        worklogSet.worklogs[0].addTag(Tags.client.ProCorp());
        worklogSet.worklogs[0].addTag(new Tag('project', 'Project1'));

        worklogSet.worklogs[1].startDateTime = Dates.pastHalfHour();
        worklogSet.worklogs[1].endDateTime = Dates.now();
        worklogSet.worklogs[1].addTag(Tags.client.ProCorp());
        worklogSet.worklogs[1].addTag(new Tag('project', 'Project1'));

        const formatted = await formatter.format(worklogSet);
        
        expect(formatted).toMatch('2hs 0m');
        expect(formatted).not.toMatch('0hs 30m');
    });

    test('handles empty filters gracefully', async () => {
        const configuration = new SummaryHtmlFormatterConfiguration(
            [['client', 'project']], 
            []
        );
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const worklogSet = WorklogSets.double();
        const formatted = await formatter.format(worklogSet);
        
        expect(formatted).toMatch('Total time:');
    });

    test('maintains HTML structure with filtered groups', async () => {
        const configuration = new SummaryHtmlFormatterConfiguration(
            [['client', 'project']], 
            [{
                tagNames: ['client', 'project'],
                filter: () => false // Filter out everything
            }]
        );
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const worklogSet = WorklogSets.double();
        const formatted = await formatter.format(worklogSet);
        
        expect(formatted).toMatch(/<[^>]+>/); // Contains HTML tags
        expect(formatted).toMatch(/<p>.*<\/p>/); // Has proper HTML structure
    });
});foreEach, describe, test, expect } from "@jest/globals";

import * as moment from "moment-timezone";
import { AppConfigurations, Dates, Tags, WorklogSets } from "../../../tests/entities";
import { Tag } from "../../models";
import { IAppConfiguration } from "../../models/AppConfiguration";
import { SummaryHtmlFormatter, SummaryHtmlFormatterConfiguration } from ".";

describe('format', () => {
    let formatter: SummaryHtmlFormatter;
    let appConfiguration: IAppConfiguration;

    beforeEach(() => {
        appConfiguration = AppConfigurations.normal();
        const configuration = new SummaryHtmlFormatterConfiguration([['client', 'project']]);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);
    });

    test('rejects invalid worklogSets', async () => {
        await expect(async () => await formatter.format(null)).rejects.toThrow('Missing WorklogSet.');
        await expect(async () => await formatter.format(undefined)).rejects.toThrow('Missing WorklogSet.');
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

    test('does not show tags if there are no aggregations (empty array)', async () => {
        const worklogSet = WorklogSets.singleNoTags();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();

        const configuration = new SummaryHtmlFormatterConfiguration([]);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const formatted = await formatter.format(worklogSet);

        expect(formatted).not.toMatch('client');
        expect(formatted).not.toMatch('project');
    });

    test('does not show tags if there are no aggregations (null)', async () => {
        const worklogSet = WorklogSets.singleNoTags();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();

        const configuration = new SummaryHtmlFormatterConfiguration(null);
        formatter = new SummaryHtmlFormatter(configuration, appConfiguration);

        const formatted = await formatter.format(worklogSet);

        expect(formatted).not.toMatch('client');
        expect(formatted).not.toMatch('project');
    });

    test('does not show tags if there are no aggregations (undefined)', async () => {
        const worklogSet = WorklogSets.singleNoTags();
        worklogSet.worklogs[0].startDateTime = Dates.pastTwoHours();
        worklogSet.worklogs[0].endDateTime = Dates.now();

        const configuration = new SummaryHtmlFormatterConfiguration(undefined);
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

        expect(formatted).toMatch('<p>Total time by client:</p>');
        expect(formatted).toMatch('<li>[client] ProCorp: 2hs 0m</li>');

        expect(formatted).toMatch('<p>Total time by project:</p>');
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

        expect(formatted).toMatch('<p>Total time by client / project:</p>');
        expect(formatted).toMatch('<li>[client] ProCorp: 3hs 0m');
        expect(formatted).toMatch('<li>[project] Project1: 2hs 0m</li>');
        expect(formatted).toMatch('<li>[project] Project2: 1hs 0m</li>');
        expect(formatted).toMatch(/<ul>.+<ul>/is); // nested lists
    });
});