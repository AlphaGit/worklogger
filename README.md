# Worklogger

Detecting logs from different sources and applying them to different outputs.

The particular objective of this system is to allow me to automate my timesheet work, while my clients keep changing the way that they want it logged.

## Application data flow

1. **Inputs** read worklogs from different data sources. Each worklog represents a particular instance of work to be outputed somewhere. After reading the input from all the sources, they all get added into a WorklogSet instance.
1. **WorklogSetOperations** allow to transform that end-result of worklog set. For example, operations like adding new worklogs or merging different worklogs together would work here. The worklog set gets modified to leave a new set of worklogs.
1. Transformation **actions** operate on each particular worklog, by reading and modifying data on it. Most of the modifications will be done over a tagging system: every worklog has tags that will determine if it goes through any particular flow. These transformations will create more tags to them.
    1. **Conditions** will filter worklogs from reaching a particular action.
1. **Outputs** will write on an output channel the resulting worklog set.
    1. **Conditions** will filter worklogs from reaching a particular output.
    1. **Formatters** will transform the WorklogSet into a data format that this particular output can use. Note that a formatter is tied to a particular Output.

## Application flow (graphical)

[![](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NvbmZpZ3VyZWQgaW5wdXRdIC0tPiBCW0xvYWQgd29ya2xvZ3M8YnIvPmZvciB0aW1lIHJhbmdlXVxuICAgIEIgLS0-IEN7U2F0aXNmaWVzPGJyLz5jb25kaXRpb24_fVxuICAgIHN1YmdyYXBoIEZvciBldmVyeSBhY3Rpb25cbiAgICAgICAgQyAtLVllcy0tPiBEW0V4ZWN1dGUgYWN0aW9uPGJyLz5vbiB3b3JrbG9nXVxuICAgIGVuZFxuICAgIHN1YmdyYXBoIEZvciBldmVyeSBvdXRwdXRcbiAgICAgICAgRCAtLT4gRXtTYXRpc2ZpZXM8YnIvPmNvbmRpdGlvbj99XG4gICAgICAgIEMgLS1Oby0tPiBFXG4gICAgICAgIEUgLS1ZZXMtLT4gRltGb3JtYXQgZm9yIG91dHB1dF1cbiAgICAgICAgRiAtLT4gR1tTZW5kIHRvIG91dHB1dF1cbiAgICAgICAgRSAtLU5vLS0-IEh7Q29uZmlndXJlZCB0bzxici8-cmFpc2Ugd2FybmluZz99XG4gICAgICAgIEggLS1ZZXMtLT4gSVtMb2cgd2FybmluZyBhYm91dDxiciAvPm5vdC1vdXRwdXQgd29ya2xvZ11cbiAgICBlbmRcbiIsIm1lcm1haWQiOnsidGhlbWUiOiJkYXJrIn0sInVwZGF0ZUVkaXRvciI6ZmFsc2UsImF1dG9TeW5jIjp0cnVlLCJ1cGRhdGVEaWFncmFtIjpmYWxzZX0)](https://mermaid-js.github.io/mermaid-live-editor/edit#eyJjb2RlIjoiZ3JhcGggVERcbiAgICBBW0NvbmZpZ3VyZWQgaW5wdXRdIC0tPiBCW0xvYWQgd29ya2xvZ3M8YnIvPmZvciB0aW1lIHJhbmdlXVxuICAgIEIgLS0-IEN7U2F0aXNmaWVzPGJyLz5jb25kaXRpb24_fVxuICAgIHN1YmdyYXBoIEZvciBldmVyeSBhY3Rpb25cbiAgICAgICAgQyAtLVllcy0tPiBEW0V4ZWN1dGUgYWN0aW9uPGJyLz5vbiB3b3JrbG9nXVxuICAgIGVuZFxuICAgIHN1YmdyYXBoIEZvciBldmVyeSBvdXRwdXRcbiAgICAgICAgRCAtLT4gRXtTYXRpc2ZpZXM8YnIvPmNvbmRpdGlvbj99XG4gICAgICAgIEMgLS1Oby0tPiBFXG4gICAgICAgIEUgLS1ZZXMtLT4gRltGb3JtYXQgZm9yIG91dHB1dF1cbiAgICAgICAgRiAtLT4gR1tTZW5kIHRvIG91dHB1dF1cbiAgICAgICAgRSAtLU5vLS0-IEh7Q29uZmlndXJlZCB0bzxici8-cmFpc2Ugd2FybmluZz99XG4gICAgICAgIEggLS1ZZXMtLT4gSVtMb2cgd2FybmluZyBhYm91dDxiciAvPm5vdC1vdXRwdXQgd29ya2xvZ11cbiAgICBlbmRcbiIsIm1lcm1haWQiOiJ7XG4gIFwidGhlbWVcIjogXCJkYXJrXCJcbn0iLCJ1cGRhdGVFZGl0b3IiOmZhbHNlLCJhdXRvU3luYyI6dHJ1ZSwidXBkYXRlRGlhZ3JhbSI6ZmFsc2V9)

## Installation

There are three big ways to set up worklogger.

1. [Docker containers](docs/docker-containers.md) (recommended)
2. [Serverless framework](docs/serverless-framework.md)
3. [Local installation](docs/local-installation.md)

## Configuration

Also, here is information on how to setup the different input/output integrations.

1. [General configuration](docs/configuration.md)
2. Inputs
    1. [Google Calendar Input](docs/google-calendar.md)
    2. [Harvest App](docs/harvest-app.md)
3. Conditions
    1. [HasTag](docs/has-tag.md)
    2. [SummaryMatches](docs/summary-matches.md)
    3. [True](docs/true.md)
4. Transformations
    1. [AddTag](docs/add-tag.md)
5. Formatters
    1. [SummaryText](docs/summary-text.md)
    2. [NoFormat](docs/no-format.md)
6. Outputs
    1. [Jira](docs/jira.md)
    2. [Harvest App](docs/harvest-app.md)
    3. [TextFile](docs/text-file.md)
    4. [AWS SES](docs/aws-ses.md)
    5. [Logger](docs/logger-output.md)
