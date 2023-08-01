import { OutputBase } from '../OutputBase';
import { FormatterBase } from '../../formatters/FormatterBase';
import { IAppConfiguration } from '../../models/AppConfiguration';
import { WorklogSet } from '../../models/WorklogSet';
import { IOutputConfiguration } from '../IOutputConfiguration';

import { getLogger, LoggerCategory } from '../../services/Logger';

export class LoggerOutput extends OutputBase {
    private _logger = getLogger(LoggerCategory.Outputs, this._outputConfiguration.name);

    constructor(formatter: FormatterBase, outputConfiguration: IOutputConfiguration, appConfiguration: IAppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);
    }

    async outputWorklogSet(worklogSet: WorklogSet): Promise<void> {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = await this._formatter.format(worklogSet);

        this._logger.info(formattedOutput);
    }
}

export default LoggerOutput;