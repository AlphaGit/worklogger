# Formatters

Formatters are responsible for converting worklog data into specific output formats. They determine how the worklog information is presented to the user or downstream systems.

## Available Formatters

- [Summary Text](./summary-text.md): Generates a text-based summary of worklogs with aggregations by tags
- [Summary HTML](./summary-html.md): Generates an HTML-formatted summary with aggregations by tags
- [Table List](./table-list.md): Outputs worklogs in a tabular text format
- [Table List HTML](./table-list-html.md): Outputs worklogs in a tabular HTML format
- [No Format](./no-format.md): Passes through worklog data without any formatting, useful for raw data processing
- [Formatter Aggregator](./formatter-aggregator.md): Combines multiple formatters into a single output

## Common Concepts

Formatters typically:

- Take a WorklogSet as input
- Have configurable aggregation options
- Support customizable output templates
- Can handle different time formats and timezones
- Provide options for grouping and summarizing data

## Extending Formatters

To create a new formatter:

1. Implement the formatter interface
2. Create a configuration class for the formatter
3. Register the formatter in the formatter registry
4. Add documentation in this directory
