const defaultFs = require('fs');

const logger = require('services/logger');

module.exports = class ApplicationConfiguration {
    static getConfiguration(configurationFile, fs = defaultFs) {
        if (typeof(configurationFile) !== 'string')
            throw new Error('Configuration file required.');

        return ApplicationConfiguration._readFile(configurationFile, fs)
            .then(ApplicationConfiguration._parseFileContents);
    }

    static _readFile(configurationFile, fs) {
        return new Promise((resolve, reject) => {
            fs.readFile(configurationFile, { flag: 'r' }, (err, fileContents) => {
                if (err) reject('Configuration file does not exist or is not readable.');

                resolve(fileContents);
            });
        });
    }

    static _parseFileContents(fileContents) {
        return new Promise((resolve, reject) => {
            try {
                let parsedFile = JSON.parse(fileContents);

                resolve(new ApplicationConfiguration({
                    minimumLoggableTimeSlotInMinutes: parsedFile.minimumLoggableTimeSlotInMinutes
                }));
            } catch (e) {
                logger.error(e);
                reject('Configuration file is not valid.');
            }
        });
    }

    constructor({ minimumLoggableTimeSlotInMinutes = 30 } = { }) {
        this.minimumLoggableTimeSlotInMinutes = minimumLoggableTimeSlotInMinutes;
    }
};
