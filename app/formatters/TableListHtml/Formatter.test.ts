import { beforeEach, describe, test, expect } from "@jest/globals";

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

    test('rejects invalid worklogSets', async () => {
        await expect(async () => await formatter.format(null)).rejects.toThrow('Missing WorklogSet.');
        await expect(async () => await formatter.format(undefined)).rejects.toThrow('Missing WorklogSet.');
    });

    test('includes a header with set columns', async () => {
        const worklogSet = WorklogSets.single();

        const formatted = await formatter.format(worklogSet);
        expect(formatted).toMatch('<th>Date</th>')
        expect(formatted).toMatch('<th>Start Time</th>')
        expect(formatted).toMatch('<th>End Time</th>')
        expect(formatted).toMatch('<th>Duration</th>')
        expect(formatted).toMatch('<th>Title</th>')
    });

    test('includes a header with tag columns', async () => {
        const worklogSet = WorklogSets.single();

        const formatted = await formatter.format(worklogSet);
        expect(formatted).toMatch('<th>Tag: client</th>')
        expect(formatted).toMatch('<th>Tag: project</th>')
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

        expect(formatted).toMatch(`<td>${startDate}</td>`);
        expect(formatted).toMatch(`<td>${startTime}</td>`);
        expect(formatted).toMatch(`<td>${endTime}</td>`);
        expect(formatted).toMatch(`<td>${duration}</td>`);
        expect(formatted).toMatch(`<td>${title}</td>`);
        expect(formatted).toMatch(`<td>${client}</td>`);
        expect(formatted).toMatch(`<td>${project}</td>`);
    });

    test('includes a timezone note', async () => {
        const worklogSet = WorklogSets.single();

        const formatted = await formatter.format(worklogSet);
        expect(formatted).toMatch(/<p>All times are in P[SD]T time\.<\/p>/);
    });
});