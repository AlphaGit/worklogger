import { FormatterBase } from '../formatters/FormatterBase';
import { WorklogSet } from '../models/WorklogSet';
import { IOutputConfiguration } from '../outputs/IOutputConfiguration';
import { IAppConfiguration } from '../models/AppConfiguration';

export abstract class OutputBase {
    protected _formatter: FormatterBase;
    protected _appConfiguration: IAppConfiguration;

    constructor(formatter: FormatterBase, outputConfiguration: IOutputConfiguration, appConfiguration: IAppConfiguration) {
        if (!(formatter instanceof FormatterBase)) throw new Error('Formatter is required.');

        this._formatter = formatter;
        this._appConfiguration = appConfiguration;
    }

    abstract outputWorklogSet(worklogSet: WorklogSet): Promise<void>;

    protected _outputWorklogSetValidation(worklogSet: WorklogSet): void {
        if (!worklogSet) throw new Error('Required parameter: worklogSet.');
    }
}