const assert = require('assert');
const ApplicationConfiguration = require('model/ApplicationConfiguration');

describe('ApplicationConfiguration', () => {
    describe('#getConfiguration', () => {
        it('requires a string as configuration file', (done) => {
            assertThrowsConfigurationFileMissing = (argumentToPass) =>
                assert.throws(() => ApplicationConfiguration.getConfiguration(argumentToPass), 'Configuration file required.');

            assertThrowsConfigurationFileMissing();
            assertThrowsConfigurationFileMissing(null);
            assertThrowsConfigurationFileMissing(undefined);
            assertThrowsConfigurationFileMissing([]);
            assertThrowsConfigurationFileMissing({});

            ApplicationConfiguration.getConfiguration('someFile.json').then(done).catch(e => done());
        });

        it('requires the configuration file to exist and to be readable', (done) => {
            const fsMock = getFsMock({ shouldFailAccess: true });

            ApplicationConfiguration.getConfiguration('unreachableFile.json', fsMock)
                .then(() => done('Expected error but received none'))
                .catch(e => {
                    if (e === 'Configuration file does not exist or is not readable.')
                        done();
                    else
                        done(e);
                });
        });

        it('returns an error if the configuration file is not an empty file', (done) => {
            const fsMock = getFsMock({ fileContents: '' });

            ApplicationConfiguration.getConfiguration('nonJsonConfigurationFile', fsMock)
                .then(() => done('Expected error but received none'))
                .catch(e => {
                    if (e === 'Configuration file is not valid.')
                        done();
                    else
                        done(e);
                });
        });

        if('return an error if the configuration file is not a json file', (done) => {
            const fsMock = getFsMock({ fileContents: 'Some non-JSON contents.'});

            ApplicationConfiguration.getConfiguration('nonJsonConfigurationFile', fsMock)
                .then(() => done('Expected error but received none'))
                .catch(e => {
                    if (e === 'Configuration file is not valid.')
                        done();
                    else
                        done(e);
                });
        });

        it('returns the configuration file in a ApplicationConfiguration object', (done) => {
            const fsMock = getFsMock({ fileContents: '{ "Test": "Test" }' });

            ApplicationConfiguration.getConfiguration('configurationFile.json', fsMock)
                .then(configuration => {
                    assert(configuration instanceof ApplicationConfiguration);
                    done();
                })
                .catch(done);
        });

        it('correctly parses the value of minimumLoggableTimeSlotInMinutes', (done) => {
            const assertMinimumLoggableTimeSlotInMinutes = (minutes) => {
                const fsMock = getFsMock({ fileContents: `{ "minimumLoggableTimeSlotInMinutes": ${minutes} }`});

                return ApplicationConfiguration.getConfiguration('configurationFile.json', fsMock)
                    .then(configuration => {
                        assert.equal(minutes, configuration.minimumLoggableTimeSlotInMinutes);
                    });
            };

            assertMinimumLoggableTimeSlotInMinutes(30)
                .then(() => assertMinimumLoggableTimeSlotInMinutes(15))
                .then(() => assertMinimumLoggableTimeSlotInMinutes(0))
                .then(done)
                .catch(done);
        });
    });
});

function getFsMock({
    shouldFailAccess = false,
    fileContents = ''
} = {}) {
    return {
        constants: {
            R_OK: 1
        },
        readFile: function(file, mode, cb) {
            if (shouldFailAccess)
                cb(new Error(), undefined)
            else
                cb(null, fileContents);
        }
    };
}
