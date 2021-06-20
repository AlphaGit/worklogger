import { FormatterBase } from '../formatters/FormatterBase';
import { WorklogSet } from '../models/WorklogSet';
import { IOutputConfiguration } from '../outputs/IOutputConfiguration';
import { AppConfiguration } from '../models/AppConfiguration';

export abstract class OutputBase {
    protected _formatter: FormatterBase;
    protected _appConfiguration: AppConfiguration;
    
    constructor(formatter: FormatterBase, outputConfiguration: IOutputConfiguration, appConfiguration: AppConfiguration) {
        if (!(formatter instanceof FormatterBase)) throw new Error('Formatter is required.');

        this._formatter = formatter;
        this._appConfiguration = appConfiguration;
    }

    abstract outputWorklogSet(worklogSet: WorklogSet): void;

    protected _outputWorklogSetValidation(worklogSet: WorklogSet): void {
        if (!worklogSet) throw new Error('Required parameter: worklogSet.');
    }
}