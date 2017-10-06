const requiredFs = require('fs');
const logger = require('services/logger');
const FormatterBase = require('formatters/FormatterBase');

module.exports = class TextFileOutput {
    constructor(formatter, outputConfiguration, { fs } = {}) {
        if (!(formatter instanceof FormatterBase))
            throw new Error('Formatter is required.');

        this._formatter = formatter;
        this._configuration = outputConfiguration;
        this._fs = fs || requiredFs;
    }

    outputWorklogSet(worklogSet) {
        const formattedOutput = this._formatter.format(worklogSet);
        
        return new Promise((resolve, reject) => {
            const filename = this._configuration.filePath;
            logger.info('Writing output to', filename);
            this._fs.writeFile(filename, formattedOutput, (err) => {
                if(err) {
                    logger.error('Error while writing output', err);
                    return reject(err); 
                }

                resolve();
            });
        });
    }
};
