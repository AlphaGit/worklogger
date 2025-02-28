# Conditions

Conditions are components that determine whether certain actions should be applied to worklogs. They provide flexible filtering and matching capabilities for worklog processing.

## Available Conditions

- [Has Tag](./has-tag.md): Checks if a worklog has a specific tag
- [Summary Matches](./summary-matches.md): Matches worklog summaries against regular expressions
- [True](./true.md): Always returns true, useful as a default condition

## Common Concepts

Conditions typically:

- Return a boolean result
- Can be combined using logical operators
- Are used to filter worklogs for actions
- Support pattern matching and tag-based filtering
- Can access worklog properties and metadata

## Creating New Conditions

To create a new condition:

1. Implement the condition interface
2. Create a configuration class for the condition
3. Add unit tests for the condition logic
4. Add documentation in this directory
