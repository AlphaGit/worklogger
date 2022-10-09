import { SummaryTextFormatterConfiguration } from "../SummaryText";

export class SummaryHtmlFormatterConfiguration extends SummaryTextFormatterConfiguration
{
    public type = 'SummaryHtml';
    constructor(aggregateByTags: string[][]) {
        super(aggregateByTags);
    }
}
