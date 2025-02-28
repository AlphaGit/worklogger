# Inputs

Inputs are components that retrieve worklog data from various sources. They handle authentication, data fetching, and conversion of external data formats into the application's internal worklog model.

## Available Inputs

- [Google Calendar](./google-calendar.md): Imports events from Google Calendar as worklogs
- [Harvest](./harvest-app.md): Imports time entries from Harvest time tracking

## Common Concepts

Inputs typically:

- Handle authentication with external services
- Convert external data formats to WorklogSet objects
- Support filtering of imported data
- Handle pagination and rate limiting
- Provide error handling and retry mechanisms

## Adding New Inputs

To create a new input source:

1. Implement the input interface
2. Create a configuration class for the input
3. Implement data conversion to WorklogSet format
4. Add authentication handling if required
5. Add documentation in this directory
