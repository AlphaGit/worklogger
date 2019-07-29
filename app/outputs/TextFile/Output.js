const requiredFs = require('fs');
const logger = require('app/services/loggerFactory').getLogger('TextFile/Output');
const OutputBase = require('app/outputs/OutputBase');

const util = require('util');

module.exports = class TextFileOutput extends OutputBase {
    constructor(formatter, outputConfiguration, { fs } = {}) {
        super(formatter, outputConfiguration);

        const _fs = fs || requiredFs;
        this.writeFile = (fileName, content) => util.promisify(_fs.writeFile)(fileName, content);
    }

    async outputWorklogSet(worklogSet) {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = this._formatter.format(worklogSet);

        try {
            const filename = this._configuration.filePath;
            logger.info('Writing output to', filename);
            await this.writeFile(filename, formattedOutput);
        } catch (err) {
            logger.error('Error while writing output', err);
            throw err;
        }
    }
};
