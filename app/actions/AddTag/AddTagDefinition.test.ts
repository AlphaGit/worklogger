import { AddTagDefinition } from "./AddTagDefinition";

describe('constructor', () => {
    test('rejects invalid values', () => {
        expect(() => new AddTagDefinition(null, 'value', 'extract')).toThrow('name is required.');
        expect(() => new AddTagDefinition(undefined, 'value', 'extract')).toThrow('name is required.');

        expect(() => new AddTagDefinition('name')).toThrow('Either value or extractCaptureFromSummary are required.');
        expect(() => new AddTagDefinition('name', null)).toThrow('Either value or extractCaptureFromSummary are required.');
        expect(() => new AddTagDefinition('name', undefined, null)).toThrow('Either value or extractCaptureFromSummary are required.');

        expect(() => new AddTagDefinition('name', 'value', 'extract')).toThrow('Only one of value or extractCaptureFromSummary need to be provided.');

        expect(() => new AddTagDefinition('name', 'value')).not.toThrow();
    });
});