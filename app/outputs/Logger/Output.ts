import { OutputBase } from '../OutputBase';
import { FormatterBase } from '../../formatters/FormatterBase';
import { AppConfiguration } from '../../models/AppConfiguration';
import { WorklogSet } from '../../models/WorklogSet';
import { IOutputConfiguration } from '../IOutputConfiguration';

import { getLogger } from 'log4js';

export class LoggerOutput extends OutputBase {
    private _logger = getLogger();

    constructor(formatter: FormatterBase, outputConfiguration: IOutputConfiguration, appConfiguration: AppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);
    }

    outputWorklogSet(worklogSet: WorklogSet): void {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = this._formatter.format(worklogSet);

        this._logger.info(formattedOutput);
    }
}