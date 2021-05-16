import { WorklogSets } from "../../../tests/entities";
import { AppConfiguration } from "../../models/AppConfiguration";
import { FormatterConfigurationBase } from "../FormatterConfigurationBase";
import { NoFormatFormatter } from "./NoFormatFormatter";

describe('format', () => {
    test('returns the string representation of the worklog', () => {
        const worklogSet = WorklogSets.mixed();
        const formatter = new NoFormatFormatter(new FormatterConfigurationBase(), new AppConfiguration());
        
        expect(formatter.format(worklogSet)).toBe(worklogSet.toString());
    });
});