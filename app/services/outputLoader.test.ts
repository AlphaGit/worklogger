import { describe, test, expect } from "@jest/globals";

import { AppConfigurations } from "../../tests/entities";
import { loadOutputs } from './outputLoader';

import { TrueCondition } from '../conditions/True';
import { HasTagCondition } from "../conditions/HasTag";
import { SummaryMatchesCondition } from "../conditions/SummaryMatches";

import { SummaryTextFormatter } from "../formatters/SummaryText";
import { NoFormatFormatter } from "../formatters/NoFormat";

import { LoggerOutput } from "../outputs/Logger";
import { JiraWorklogOutput } from "../outputs/JiraWorklog";

describe('loadOutputs', () => {
    const appConfiguration = AppConfigurations.normal();

    test('loads specified outputs, conditions and formatters', async () => {
        const outputConfigs = [{
            type: 'Logger',
            name: 'output1',
            excludeFromNonProcessedWarning: false,
            condition: {
                type: ''
            },
            formatter: {
                type: ''
            }
        }, {
            type: 'JiraWorklog',
            name: 'output2',
            excludeFromNonProcessedWarning: false,
            condition: {
                type: 'HasTag'
            },
            formatter: {
                type: 'SummaryText'
            },
            JiraUrl: 'https://example.com',
            JiraUsername: 'username',
            JiraPassword: 'password'
        }, {
            type: 'JiraWorklog',
            name: 'output3',
            excludeFromNonProcessedWarning: false,
            condition: {
                type: 'SummaryMatches'
            },
            JiraUrl: 'https://example.com',
            JiraUsername: 'username',
            JiraPassword: 'password'
        }];

        const outputs = await loadOutputs(outputConfigs, appConfiguration);

        expect(outputs.length).toBe(3);
        const [output1, output2, output3] = outputs;

        expect(output1.condition).toBeInstanceOf(TrueCondition);
        expect(output1.excludeFromNonProcessedWarning).toBe(false);
        expect(output1.output).toBeInstanceOf(LoggerOutput);
        expect(output1.output.formatter).toBeInstanceOf(NoFormatFormatter);

        expect(output2.condition).toBeInstanceOf(HasTagCondition);
        expect(output2.excludeFromNonProcessedWarning).toBe(false);
        expect(output2.output).toBeInstanceOf(JiraWorklogOutput);
        expect(output2.output.formatter).toBeInstanceOf(SummaryTextFormatter);

        expect(output3.condition).toBeInstanceOf(SummaryMatchesCondition);
        expect(output3.excludeFromNonProcessedWarning).toBe(false);
        expect(output3.output).toBeInstanceOf(JiraWorklogOutput);
        expect(output3.output.formatter).toBeInstanceOf(NoFormatFormatter);
    });
});