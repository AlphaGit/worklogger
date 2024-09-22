import { describe, test, expect } from "@jest/globals";

import { AppConfigurations, WorklogSets } from "../../../tests/entities";
import { FormatterConfigurationBase } from "../FormatterConfigurationBase";
import { NoFormatFormatter } from "./Formatter";

describe('format', () => {
    test('returns the string representation of the worklog', async () => {
        const worklogSet = WorklogSets.mixed();
        const formatter = new NoFormatFormatter(new FormatterConfigurationBase(), AppConfigurations.normal());

        expect(await formatter.format(worklogSet)).toBe(worklogSet.toString());
    });
});