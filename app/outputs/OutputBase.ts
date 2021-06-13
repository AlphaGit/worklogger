import { FormatterBase } from '../formatters/FormatterBase';
import { WorklogSet } from '../models/WorklogSet';
import { IOutputConfiguration } from '../outputs/IOutputConfiguration';
import { AppConfiguration } from '../models/AppConfiguration';

export class OutputBase {
    protected _formatter: FormatterBase;
    protected _appConfiguration: AppConfiguration;
    
    constructor(formatter: FormatterBase, outputConfiguration: IOutputConfiguration, appConfiguration: AppConfiguration) {
        if (!(formatter instanceof FormatterBase)) throw new Error('Formatter is required.');

        this._formatter = formatter;
        this._appConfiguration = appConfiguration;
    }

    outputWorklogSet(worklogSet: WorklogSet): void {
        this._outputWorklogSetValidation(worklogSet);
        throw new Error('outputWorklogSet() needs to be defined in derived classes.');
    }

    protected _outputWorklogSetValidation(worklogSet: WorklogSet): void {
        if (!worklogSet) throw new Error('Required parameter: worklogSet.');
        if (!(worklogSet instanceof WorklogSet)) throw new Error('worklogSet needs to be of type WorklogSet.');
    }
}