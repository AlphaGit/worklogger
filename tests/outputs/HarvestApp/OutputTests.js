const assert = require('assert');
const HarvestAppOutput = require('outputs/HarvestApp/Output');
const FormatterBase = require('formatters/FormatterBase');
const sinon = require('sinon');

describe('HarvestApp output', () => {
    describe('#outputWorklogSet', () => {
        // TODO
    });
});

function getTestSubject() {
    const formatterConfiguration = {};
    const formatter = new FormatterBase(formatterConfiguration);
    const outputConfiguration = {};
    return new HarvestAppOutput(formatter, outputConfiguration);
}