import { FormatterConfigurationBase } from "./FormatterConfigurationBase";

export class SummaryTextFormatterConfiguration extends FormatterConfigurationBase
{
    constructor(public aggregateByTags: string[][]) {
        super();    
    }
}
