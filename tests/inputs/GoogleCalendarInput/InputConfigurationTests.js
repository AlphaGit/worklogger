var assert = require('assert');
var InputConfiguration = require('app/inputs/GoogleCalendar/InputConfiguration');

const validConfigJson = {
    name: 'input name',
    calendars: [
        1
    ]
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
        });
    });

    describe('#calendars', () => {
        function assertRequiresArray(inputConfiguration, value) {
            assert.throws(() => inputConfiguration.calendars = value, /array is required/);
        }

        it('requires an array', () => {
            var inputConfiguration = new InputConfiguration(validConfigJson);

            assertRequiresArray(inputConfiguration, 'a');
            assertRequiresArray(inputConfiguration, 1);
            assertRequiresArray(inputConfiguration, {});
            assertRequiresArray(inputConfiguration, null);
            assertRequiresArray(inputConfiguration, undefined);
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
