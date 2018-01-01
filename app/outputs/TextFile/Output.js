const requiredFs = require('fs');
const logger = require('app/services/loggerFactory').getLogger('TextFile/Output');
const OutputBase = require('app/outputs/OutputBase');

module.exports = class TextFileOutput extends OutputBase {
    constructor(formatter, outputConfiguration, { fs } = {}) {
        super(formatter, outputConfiguration);

        this._fs = fs || requiredFs;
    }

    outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

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
