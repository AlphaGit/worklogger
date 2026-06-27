## Google Calendar input

### Allowing Google Calendar APIs

The worklogger system must authenticate with your account. For this, it uses OAuth2, so you need to register it as an application and then allow access for it.

(Steps adapted from here: https://developers.google.com/google-apps/calendar/quickstart/nodejs)

### Registering worklogger as an application (Deprecated)

(Note: this section needs to be reviewed, as part of it sets up Out Of Band OAuth authentication, which Google does not support anymore.)

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

### Setting up Auth endpoint

In order to obtain credentials for the application, a custom domain with certificates need to be setup so that the OAuth flows from services can be completed.

(Instructions from here: https://www.serverless.com/framework/docs/providers/aws/events/http-api)

The following instructions are specific for AWS, but you can set them up with a any other provider, as long as you can work with domains and set it up for API Gateway.

(These steps need to be executed after the initial deployment.)

1. Create an HTTPS certificate in AWS ACM

    - Open AWS ACM (AWS Certificate Manager)
    - Switch to the region of your application
    - Click "Request a certificate"
    - Select "Request a public certificate" and continue
    - Add your domain and continue
    - Choose the domain validation of your choice:
        - Email validation will require you to click a link you will receive in an email sent to admin@your-domain.com
        - Domain validation will require you to add CNAME entries to your DNS configuration
    - Validate the domain via the method chosen above

2. (Not needed) Set up the custom domain in API Gateway

3. Configure the DNS of the domain:

    - Open the Hosted Zone in the Route53 console
    - Click "Create record"
    - Select "Record type" of type "A"
    - "Route traffic to": select "Alias", and then select your API Gateway
    - Finish the record creation

### Registering worklogger as an application

In your Google Developer console credentials:

- Credentials -> Create Credentials -> OAuth client ID
- Application type: Web application
- Name: Worklogger
- Authorized Redirect URIs: https://<your custom domain from the previous auth endpoint>/token
- Save the JSON as `gooogle-application-credentials.json` in the `worklogger` folder in S3.

### Getting your OAuth token stored

- Visit https://<your custom domain from the previous auth endpoint>/login
- Google may say that your application has not been reviewed yet. If this the case, look for the option to still continue towards your application and click on it.
- You'll be redirected to a Google Authentication screen. Authorize the application with the account you wish to use to query calendars. (At the moment, only one account is supported.)
- You'll be redirected to a page that says "Token stored. You can close this window."

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

