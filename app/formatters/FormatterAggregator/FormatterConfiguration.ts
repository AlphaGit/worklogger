import { FormatterConfigurationBase } from "../FormatterConfigurationBase";

export class FormatterAggregatorFormatterConfiguration extends FormatterConfigurationBase
{
    public type = "FormatterAggregator";

    constructor(public formatters: FormatterConfigurationBase[]) {
        super();

        if (!formatters || !formatters.length)
            throw new Error("Missing formatters.");
    }
}
