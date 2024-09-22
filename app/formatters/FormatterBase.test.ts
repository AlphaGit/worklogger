import { describe, test, expect } from "@jest/globals";

import { AppConfigurations } from "../../tests/entities";
import { WorklogSet } from "../models/WorklogSet";
import { FormatterBase } from "./FormatterBase";

class TestFormatter extends FormatterBase {
    format(worklogSet: WorklogSet): Promise<string> {
        return Promise.resolve(worklogSet.toString());
    }
}

describe('constructor', () => {
    test('rejects missing formatter configuration', () => {
        const appConfiguration = AppConfigurations.normal();
        expect(() => new TestFormatter(null, appConfiguration)).toThrow('Formatter configuration object is required.');
        expect(() => new TestFormatter(undefined, appConfiguration)).toThrow('Formatter configuration object is required.');
    });
});
