import { promises as fs } from 'fs';
import { OutputBase } from '../OutputBase';
import { FormatterBase } from '../../formatters/FormatterBase';
import { IAppConfiguration } from '../../models/AppConfiguration';
import { WorklogSet } from '../../models/WorklogSet';
import { ITextFileOutputConfiguration } from './ITextFileOutputConfiguration';
import { getLogger, LoggerCategory } from '../../services/Logger';

const logger = getLogger(LoggerCategory.Outputs);

export class TextFileOutput extends OutputBase {
    private _configuration: ITextFileOutputConfiguration;

    constructor(formatter: FormatterBase, outputConfiguration: ITextFileOutputConfiguration, appConfiguration: IAppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);
        this._configuration = outputConfiguration;
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = await this._formatter.format(worklogSet);

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

export default TextFileOutput;