import { AppConfigurations, Formatters, WorklogSets } from '../../../tests/entities';
import { ITextFileOutputConfiguration } from './ITextFileOutputConfiguration';
import { TextFileOutput } from "./Output";
import mockfs from 'mock-fs';
import { readFileSync } from 'fs';

const exampleFormatterConfiguration: ITextFileOutputConfiguration = {
    filePath: './output.txt',
    condition: null,
    excludeFromNonProcessedWarning: false,
    formatter: null,
    type: 'TextFile'
};

function getTextFileOutput(formatter = Formatters.fake()): TextFileOutput {
    return new TextFileOutput(formatter, exampleFormatterConfiguration, AppConfigurations.normal());
}

describe('constructor', () => {
    test('validates parameters', () => {
        expect(() => new TextFileOutput(null, null, null)).toThrow('Formatter is required.');
        expect(() => new TextFileOutput(undefined, null, null)).toThrow('Formatter is required.');

        expect(() => getTextFileOutput()).not.toThrow();
    });
});

describe('outputWorklogSet', () => {
    test('validates parameters', async () => {
        const output = getTextFileOutput();
        await expect(async () => output.outputWorklogSet(null)).rejects.toThrow('Required parameter: worklogSet.');
        await expect(async () => output.outputWorklogSet(undefined)).rejects.toThrow('Required parameter: worklogSet.');
    });

    test('uses the formatter to format the workglogSet', async () => {
        mockfs();
        const formatter = Formatters.fake();
        formatter.formatFunction = jest.fn().mockReturnValue('Example formatted string');
        const output = getTextFileOutput(formatter);
        const worklogSet = WorklogSets.single();

        await output.outputWorklogSet(worklogSet);

        expect(formatter.formatFunction).toBeCalledWith(worklogSet);
        expect(readFileSync('./output.txt', {  encoding: 'utf8' })).toBe('Example formatted string');
        mockfs.restore();
    });
});