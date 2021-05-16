import * as moment from "moment-timezone";
import { AppConfigurations, Dates, WorklogSets } from "../../../tests/entities";
import { AppConfiguration } from "../../models/AppConfiguration";
import { SummaryTextFormatter } from "./SummaryTextFormatter";
import { SummaryTextFormatterConfiguration } from "./SummaryTextFormatterConfiguration";

describe('format', () => {
    let formatter: SummaryTextFormatter;
    let appConfiguration: AppConfiguration;

    beforeEach(() => {
        appConfiguration = AppConfigurations.normal();
        const configuration = new SummaryTextFormatterConfiguration([['client', 'project']]);
        formatter = new SummaryTextFormatter(configuration, appConfiguration);
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
});