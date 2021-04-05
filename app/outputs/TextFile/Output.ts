import { writeFile } from 'fs';
import LoggerFactory from '../../services/LoggerFactory';
const logger = LoggerFactory.getLogger('TextFile/Output');

import { OutputBase } from '../OutputBase';

import { promisify } from 'util';
import { FormatterBase } from '../../formatters/FormatterBase';
import { AppConfiguration } from '../../models/AppConfiguration';
import { WorklogSet } from '../../models/WorklogSet';
import { ITextFileOutputConfiguration } from './ITextFileOutputConfiguration';

export class TextFileOutput extends OutputBase {
    private _writeFile: (fileName: string, content: string) => Promise<void>;
    private _configuration: ITextFileOutputConfiguration;

    constructor(formatter: FormatterBase, outputConfiguration: ITextFileOutputConfiguration, appConfiguration: AppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);
        this._configuration = outputConfiguration;
        this._writeFile = (fileName, content) => promisify(writeFile)(fileName, content);
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = this._formatter.format(worklogSet);

        try {
            const filename = this._configuration.filePath;
            logger.info('Writing output to', filename);
            await this._writeFile(filename, formattedOutput);
        } catch (err) {
            logger.error('Error while writing output', err);
            throw err;
        }
    }
}
