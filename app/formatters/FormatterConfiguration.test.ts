import { describe, test, expect } from "@jest/globals";

import { Formatters } from "../../tests/entities";
import { FormatterAggregatorFormatterConfiguration } from "./FormatterAggregator";

describe('constructor', () => {
    test('should throw an error if formatter is not provided', () => {
        expect(() => new FormatterAggregatorFormatterConfiguration(undefined)).toThrow('Missing formatters.');
    });

    test('should throw an error if formatter is not an array', () => {
        expect(() => new FormatterAggregatorFormatterConfiguration(Formatters.fake())).toThrow('Missing formatters.');
    });

    test('should throw an error if formatter is an empty array', () => {
        expect(() => new FormatterAggregatorFormatterConfiguration([])).toThrow('Missing formatters.');
    });
});