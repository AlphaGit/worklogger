import { OutputBase } from '../OutputBase';
import { LoggerFactory } from '../../services/LoggerFactory';
import { FormatterBase } from '../../formatters/FormatterBase';
import { AppConfiguration } from '../../models/AppConfiguration';
import { WorklogSet } from '../../models/WorklogSet';
import { IOutputConfiguration } from '../IOutputConfiguration';

export class LoggerOutput extends OutputBase {
    _logger: any;

    constructor(formatter: FormatterBase, outputConfiguration: IOutputConfiguration, appConfiguration: AppConfiguration) {
        super(formatter, outputConfiguration, appConfiguration);

        this._logger = LoggerFactory.getLogger('Logger/Output');
    }

    outputWorklogSet(worklogSet: WorklogSet): void {
        super._outputWorklogSetValidation(worklogSet);

        const formattedOutput = this._formatter.format(worklogSet);

        this._logger.info(formattedOutput);
    }
}