import { OutputBase } from '../OutputBase';
import { FormatterBase } from '../../formatters/FormatterBase';
import { AppConfiguration } from '../../models/AppConfiguration';
import { WorklogSet } from '../../models/WorklogSet';
import { IOutputConfiguration } from '../IOutputConfiguration';

import { getLogger, Logger } from 'log4js';

export class LoggerOutput extends OutputBase {
    _logger: Logger;

    constructor(formatter: FormatterBase, outputConfiguration: IOutputConfiguration, appConfiguration: AppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);

        this._logger = getLogger();
    }

    outputWorklogSet(worklogSet: WorklogSet): void {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = this._formatter.format(worklogSet);

        this._logger.info(formattedOutput);
    }
}