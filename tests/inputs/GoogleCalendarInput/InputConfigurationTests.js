var assert = require('assert');
var InputConfiguration = require('inputs/GoogleCalendar/InputConfiguration');

const validConfigJson = {
    name: 'input name',
    calendars: [
        1
    ],
    readFromXHoursAgo: 24
};

describe('[Google Calendar] InputConfiguration', () => {
    describe('#constructor', () => {
        it('requires a configuration JSON parameter', () => {
            assert.throws(() => new InputConfiguration(), /required/);
        });

        it('saves the values passed in the configuration JSON parameter', () => {
            var inputConfiguration = new InputConfiguration(validConfigJson);

            assert.equal(validConfigJson.name, inputConfiguration.name);
            assert.equal(validConfigJson.calendars, inputConfiguration.calendars);
            assert.equal(validConfigJson.readFromXHoursAgo, inputConfiguration.readFromXHoursAgo);
        });
    });

    describe('#calendars', () => {
        it('requires an array', () => {
            var inputConfiguration = new InputConfiguration(validConfigJson);

            assert.throws(() => inputConfiguration.calendars = 'a', /array is required/);
            assert.throws(() => inputConfiguration.calendars = 1, /array is required/);
            assert.throws(() => inputConfiguration.calendars = {}, /array is required/);
            assert.throws(() => inputConfiguration.calendars = null, /array is required/);
            assert.throws(() => inputConfiguration.calendars = undefined, /array is required/);
        });

        it('requires a non-empty array', () => {
            var inputConfiguration = new InputConfiguration(validConfigJson);

            assert.throws(() => inputConfiguration.calendars = [], /at least one calendar/);
        });

        it('requires an id on each element', () => {
            var inputConfiguration = new InputConfiguration(validConfigJson);

            assert.throws(() => inputConfiguration.calendars = [ 1, null ], /id/);
        });
    });
});
