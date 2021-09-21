import { promises as fs } from 'fs';
import { LoggerFactory } from '../../services/LoggerFactory';
import { OutputBase } from '../OutputBase';
import { FormatterBase } from '../../formatters/FormatterBase';
import { AppConfiguration } from '../../models/AppConfiguration';
import { WorklogSet } from '../../models/WorklogSet';
import { ITextFileOutputConfiguration } from './ITextFileOutputConfiguration';

const logger = LoggerFactory.getLogger('TextFile/Output');

export class TextFileOutput extends OutputBase {
    private _configuration: ITextFileOutputConfiguration;

    constructor(formatter: FormatterBase, outputConfiguration: ITextFileOutputConfiguration, appConfiguration: AppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);
        this._configuration = outputConfiguration;
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = this._formatter.format(worklogSet);

        try {
            const filename = this._configuration.filePath;
            logger.info('Writing output to', filename);
            await fs.writeFile(filename, formattedOutput);
        } catch (err) {
            logger.error('Error while writing output', err);
            throw err;
        }
    }
}
