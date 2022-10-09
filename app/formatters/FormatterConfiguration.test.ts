import { Formatters } from "../../tests/entities";
import { FormatterAggregatorFormatterConfiguration } from "./FormatterAggregator";

describe('constructor', () => {
    test('should throw an error if formatter is not provided', () => {
        expect(() => new FormatterAggregatorFormatterConfiguration(undefined)).toThrowError('Missing formatters.');
    });

    test('should throw an error if formatter is not an array', () => {
        expect(() => new FormatterAggregatorFormatterConfiguration(Formatters.fake())).toThrowError('Missing formatters.');
    });

    test('should throw an error if formatter is an empty array', () => {
        expect(() => new FormatterAggregatorFormatterConfiguration([])).toThrowError('Missing formatters.');
    });
});