import { describe, test, expect } from "@jest/globals";

import { Tag } from "./";

describe('constructor', () => {
    test('requires a name', () => {
        expect(() => new Tag(null, 'value')).toThrow('Tag names cannot be empty');
        expect(() => new Tag(undefined, 'value')).toThrow('Tag names cannot be empty');
        expect(() => new Tag('', 'value')).toThrow('Tag names cannot be empty');
    });
});