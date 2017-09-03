var assert = require('assert');
var GoogleCalendarInputConfiguration = require('inputs/GoogleCalendarInput/GoogleCalendarInputConfiguration');

require('tests/harness/log4js').setLevel('off');

const validConfigJson = {
    name: 'input name',
    calendars: [{
        id: 1,
        client: 1,
        project: 1
    }]
};

describe('GoogleCalendarInputConfiguration', () => {
    describe('#constructor', () => {
        it('requires a configuration JSON parameter', () => {
            assert.throws(() => new GoogleCalendarInputConfiguration(), /required/);
        });

        it('saves the values passed in the configuration JSON parameter', () => {
            var inputConfiguration = new GoogleCalendarInputConfiguration(validConfigJson);

            assert.equal(validConfigJson.name, inputConfiguration.name);
            assert.equal(validConfigJson.calendars, inputConfiguration.calendars);
        });
    });

    describe('#calendars', () => {
        it('requires an array', () => {
            var inputConfiguration = new GoogleCalendarInputConfiguration(validConfigJson);

            assert.throws(() => inputConfiguration.calendars = 'a', /array is required/);
            assert.throws(() => inputConfiguration.calendars = 1, /array is required/);
            assert.throws(() => inputConfiguration.calendars = {}, /array is required/);
            assert.throws(() => inputConfiguration.calendars = null, /array is required/);
            assert.throws(() => inputConfiguration.calendars = undefined, /array is required/);
        });

        it('requires a non-empty array', () => {
            var inputConfiguration = new GoogleCalendarInputConfiguration(validConfigJson);

            assert.throws(() => inputConfiguration.calendars = [], /at least one calendar/);
        });

        it('requires an id on each element', () => {
            var inputConfiguration = new GoogleCalendarInputConfiguration(validConfigJson);

            assert.throws(() => inputConfiguration.calendars = [{ project: 1, client: 1 }], /id/);
            assert.throws(() => inputConfiguration.calendars = [{ project: 1, client: 1, id: 1 }, { project: 1, client: 1 }], /id/);
        });

        it('requires a client on each element', () => {
            var inputConfiguration = new GoogleCalendarInputConfiguration(validConfigJson);

            assert.throws(() => inputConfiguration.calendars = [{ id: 1, project: 1 }], /client/);
            assert.throws(() => inputConfiguration.calendars = [{ id: 1, project: 1, client: 1 }, { id: 1, project: 1 }], /client/);
        });

        it('requires a project on each element', () => {
            var inputConfiguration = new GoogleCalendarInputConfiguration(validConfigJson);

            assert.throws(() => inputConfiguration.calendars = [{ id: 1, client: 1 }], /project/);
            assert.throws(() => inputConfiguration.calendars = [{ id: 1, client: 1, project: 1 }, { id: 1, client: 1 }], /project/);
        });
    });
});
