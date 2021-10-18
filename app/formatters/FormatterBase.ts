import { IAppConfiguration } from "../models/AppConfiguration";
import { WorklogSet } from "../models/WorklogSet";
import { FormatterConfigurationBase } from "./FormatterConfigurationBase";

export abstract class FormatterBase {
    protected _configuration: FormatterConfigurationBase;
    protected _appConfiguration: IAppConfiguration;

    constructor(formatterConfiguration: FormatterConfigurationBase, appConfiguration: IAppConfiguration) {
        if (!formatterConfiguration) throw new Error('Formatter configuration object is required.');
        this._configuration = formatterConfiguration;
        this._appConfiguration = appConfiguration;
    }

    abstract format(worklogSet: WorklogSet): string;
}
