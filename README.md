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

## File naming conventions

- `/docs`: Miscellaneous documentation about the project.
- `/tests`: Mirror of the design with test classes.
- `/app/models`: Model classes.
- `/app/services`: Service classes.

### Specific to the application flow:

- `/inputs`: Input classes.
    - `/input/{InputType}/Input.js`: Main entry class for the input. `inputType` uses PascalCase naming.
- `/conditions`: Evaluators for conditions on operations.
    - `/conditions/{conditionType}.js`: Main entry class for the condition. `conditionType` uses camelCase naming.
- `/actions`: Transformation operations on each worklog.
    - `/actions/{actionType}.js`: Main entry class for the action. `actionType` uses camelCase naming.
- `/formatters`: Formatter classes.
    - `/formatters/{OutputType}/{formatterType}.js`: Main entry class for the formatter. Notice that different formatters will be grouped for a single output. `OutputType` uses PascalCase naming. `formatterType` uses camelCase naming.
- `/outputs`: Output classes.
    - `/outputs/{OutputType}/Output.js`: Main entry class for the output. `OutputType` uses PascalCase naming.

#### Naming

This is the logic behind the naming conventions:

- Inputs and Outputs will usually refer to third-party products. Examples are Google Calendar, Harvest. As such, the convention is to have them PascalCased, even for cases where this does not happen (like TextFile or Email).
- All the other namings are not proper nouns (conditions, formatters and actions), so they use camelCase naming schemes.

## How to set this up

(More documentation coming later on on how to install worklogger and configure integrations.)

### Allowing Google Calendar APIs

(Steps from here: https://developers.google.com/google-apps/calendar/quickstart/nodejs)

- Go to https://console.developers.google.com/flows/enableapi?apiid=calendar
- Select / create a project.
- Go to credentials. Cancel.
- Go to OAuth consent screen.
- Select an email address.
- Enter a product name.
- Save.
- Credentials, create credentials, service account key.
- Create a new service account.
- `worklogger-bot`
- New private key.
- Key type: Json.
- Download.
- Credentials
- Create credentials
- Other (name: Worklogger)
- Ok (no need to copy)
- Download json
- `client_secret.json`
- Save it in the `worklogger_home` folder

### Getting your calendar IDs

https://developers.google.com/google-apps/calendar/v3/reference/calendarList/list?#try-it

Alternatively, from the calendar settings in Google Calendar.

### Getting a Harvest personal token

(More information here: http://help.getharvest.com/api-v2/authentication-api/authentication/authentication/)

- Go to https://www.getharvest.com/
- Click on sign-in enter your login information
- Before selecting your harvest account, click the "Developers" link at the top right
- Click on "Create New Personal Access Token"
- Enter a name for the token (e.g. `Worklogger-bot`)
- Click on "Create Personal Access Token"
- Select the account to use in the output
- Copy the Token and the Account ID to the configuration.json file, in the output configuration for the Harvest type

### Getting a JIRA password/token

You can also use JIRA API tokens instead of passwords. In order to do this, follow these steps: https://confluence.atlassian.com/cloud/api-tokens-938839638.html

- Go to https://id.atlassian.net/ logged in with your Atlassian account
- Click on API Tokens, then Create Token
- Copy it and use it as the value of `JiraPassword` in the JIRA Output

## Using the docker images

- Ensure you you have docker installed and running.

- Select the image that you want to use from https://hub.docker.com/r/alphadock/worklogger/. We will just assume `latest` in the next steps.

      docker create \
          -v /path/to/your/application/folder:/app/worklogger_home \
          -e TZ=America/Toronto \
          --name worklogger \
          alphadock/worklogger

- Feel free to replace:

    - `/path/to/your/application/folder` to a folder that contains:
        - `configuration.json` with the [application configuration](docs/configuration.md)
        - `worklogger.json` with the path to stored Google credentials, or make it a read-write volume
        - `client_secret.json` with the path to the application client configuration for Google (see [Allowing Google Calendar APIs](#allowing-google-calendar-apis))

        Note that any output files will also be written to this folder.

    - `America/Toronto` with your timezone of preference, with any of the [valid timezones from the tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

- Setup your cron job to this command:

        docker start -a worklogger