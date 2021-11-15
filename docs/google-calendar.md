## Google Calendar input

### Allowing Google Calendar APIs

The worklogger system must authenticate with your account. For this, it uses OAuth2, so you need to register it as an application and then allow access for it.

(Steps adapted from here: https://developers.google.com/google-apps/calendar/quickstart/nodejs)

### Registering worklogger as an application

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
- Download, save as `worklogger.json` in the `worklogger_home` folder.
- Credentials
- Create credentials
- Other (name: Worklogger)
- Ok (no need to copy)
- Download json
- `client_secret.json`
- Save it in the `worklogger_home` folder

With this, you should have two files in the worklogger home folder:

- `worklogger.json` with the path to stored Google credentials, or make it a read-write volume
- `client_secret.json` with the path to the application client configuration for Google (see [Allowing Google Calendar APIs](#allowing-google-calendar-apis))

### Getting your calendar IDs

**Option 1: (recommended)** Using the Google Calendar settings

In the Google Calendar web app, visit the settings page and select the calendar from the list below.

Scroll down until you find a section called "Integrate calendar", on which you will find a "Calendar ID" field. This is the calendar ID you need.

**Option 2:** Using the Google developers console

You can use the Google Developers console, by authorizing it and using it to query the APIs and retrieve the information for your calendars.

Visit: https://developers.google.com/google-apps/calendar/v3/reference/calendarList/list?#try-it

Authorize the developer console to access your account if it's needed.

Hit "execute" with the default values (or feel free to adapt the parameters).

Look at the JSON result for the calendars accesible by your account, and retrieve the `items[].id` property from the response. This is the calendar ID you need.

