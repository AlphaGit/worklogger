## Configuring Harvest integration

Currently, Harvest can be configured both as an input and as an output, meaning that worklogs can be read from it or can be sent to it.

### Getting a Harvest personal token

For authentication, Harvest requires a personal token which is used instead of your password.

(More information here: http://help.getharvest.com/api-v2/authentication-api/authentication/authentication/)

- Go to https://www.getharvest.com/
- Click on sign-in enter your login information
- Before selecting your harvest account, click the "Developers" link at the top right
- Click on "Create New Personal Access Token"
- Enter a name for the token (e.g. `Worklogger-bot`)
- Click on "Create Personal Access Token"
- Select the account to use in the output
- Copy the Token and the Account ID to the configuration.json file, in the output configuration for the Harvest type

### Configuring the input

The input can be configured as such in the [configuration file](configuration.md):

```json
{
    "type": "HarvestApp",
    "name": "Integration with Company1 Harvest",

    "accountId": "<accountId from Harvest>",
    "token": "<personal token from Harvest>",
    "contactInformation": "<your contact info>",
}
```

The `type` property needs to be `HarvestApp` for this integration to be used.

The `name` property can be any value that you want to use to identify this integration in the logs. It's purely informational and for you.

The `accountId` property needs to match your account ID in Harvest. You can read how to retrieve it above.

Similarly, the `token` property needs to match the personal access token you retrieved in the steps outlined above.

The `contactInformation` needs to be your email -- not necessarily the email associated to Harvest. Any email Harvest could use to reach out to you in case of issues is fine. I've been using `Worklogger Bot <myemail@mydomain.com>`.

### Configuring the output

```json
{
    "type": "HarvestApp",
    "name": "Integration with Company2 Harvest",

    "accountId": "<accountId from Harvest>",
    "token": "<personal token from Harvest>",
    "contactInformation": "<your contact info>",

    "selectProjectFromTag": "HarvestProject",
    "selectTaskFromTag": "HarvestTask",
}
```

The Harvest App uses its own API so any formatter specification will be ignored. However, it will be loaded in memory, so if the configuration for the formatter is wrong, it will stop the processing.

The `type`,  `name`, `token`, `accountId` and `contactInformation` have all the same logic as the input configuration for the Harvest Input. Notice that they are not shared so that you can link multiple instances of Harvest which might not share the same accounts.

`selectProjectFromTag` indicates a tag that will be read from the worklogs being processed. If this tag has a value that matches the project names available for this account, then this project will be used to submit the worklogs. E.g. if a worklog has a tag named `ProjectName` with value `Finance Integration Project`, and this setting specifies the `"selectProjectFromTag": "ProjectName"`, then this worklog will be submitted if the Harvest instance has a `Finance Integration Project` project.

`selectTaskFromTag` has the exact same logic, but for Tasks associated with the worklog.