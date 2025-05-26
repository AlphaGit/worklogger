import { SummaryTextFormatterConfiguration } from "../SummaryText";
import { Worklog } from "../../models/Worklog";

export type FilterFunction = (worklog: Worklog) => boolean;
export type TagGroupFilter = {
  tagNames: string[];
  filter: FilterFunction;
};

export class SummaryHtmlFormatterConfiguration extends SummaryTextFormatterConfiguration {
  public type = "SummaryHtml";

  constructor(
    aggregateByTags: string[][],
    public filters: TagGroupFilter[] = [],
  ) {
    super(aggregateByTags);
  }
}
