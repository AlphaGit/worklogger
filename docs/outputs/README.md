# Outputs

Outputs are components that send formatted worklog data to various destinations. They handle the delivery of processed worklog information to external systems, files, or notification services.

## Available Outputs

- [AWS SES](./aws-ses.md): Sends formatted worklogs via email using Amazon SES
- [Jira](./jira.md): Creates or updates worklogs in Jira
- [Logger](./logger-output.md): Outputs formatted worklogs to the application logs
- [Text File](./text-file.md): Writes formatted worklogs to a text file

## Common Concepts

Outputs typically:

- Accept formatted worklog data from a formatter
- Handle authentication with external services
- Provide error handling and retry mechanisms
- Support different output formats
- Can be configured with templates or custom formats

## Adding New Outputs

To create a new output destination:

1. Implement the output interface
2. Create a configuration class for the output
3. Add authentication handling if required
4. Implement error handling and retries
5. Add documentation in this directory
