# Actions

Actions are components that modify worklogs by performing specific operations on them. Each action is configured through the application's configuration file and can be conditionally applied to worklogs based on defined criteria.

## Available Actions

- [Add Tag](./add-tag.md): Adds one or more tags to worklogs based on configured rules
- [Remove Tag](./remove-tag.md): Removes specific tags from worklogs based on configured criteria

## Common Concepts

Actions typically:

- Have a configuration object that defines their behavior
- Can be conditionally applied using conditions
- Operate on individual worklogs
- Are processed in sequence as defined in the configuration
