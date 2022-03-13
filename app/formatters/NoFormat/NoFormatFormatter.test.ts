import { AppConfigurations, WorklogSets } from "../../../tests/entities";
import { FormatterConfigurationBase } from "../FormatterConfigurationBase";
import { NoFormatFormatter } from "./Formatter";

describe('format', () => {
    test('returns the string representation of the worklog', () => {
        const worklogSet = WorklogSets.mixed();
        const formatter = new NoFormatFormatter(new FormatterConfigurationBase(), AppConfigurations.normal());

        expect(formatter.format(worklogSet)).toBe(worklogSet.toString());
    });
});