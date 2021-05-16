import { AppConfiguration } from "../models/AppConfiguration";
import { WorklogSet } from "../models/WorklogSet";
import { FormatterConfigurationBase } from "./FormatterConfigurationBase";

export abstract class FormatterBase {
    protected _configuration: FormatterConfigurationBase;
    protected _appConfiguration: AppConfiguration;

    constructor(formatterConfiguration: FormatterConfigurationBase, appConfiguration: AppConfiguration) {
        if (!formatterConfiguration) throw new Error('Formatter configuration object is required.');
        this._configuration = formatterConfiguration;
        this._appConfiguration = appConfiguration;
    }

    abstract format(worklogSet: WorklogSet): string;
}
