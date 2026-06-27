import { FormatterConfigurationBase } from "../FormatterConfigurationBase";

export class SummaryTextFormatterConfiguration extends FormatterConfigurationBase
{
    public type = 'SummaryText';
    constructor(public aggregateByTags: string[][]) {
        super();
    }
}
