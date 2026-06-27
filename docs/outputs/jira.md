## Output: Jira

Worklogger can also send worklogs as Jira or Jira tempo logs.

In order to configure it, you will need your account credentials (username and password), or a username/token combination (recommended).

### Getting a JIRA password/token

To use JIRA API tokens instead of passwords, follow these steps: https://confluence.atlassian.com/cloud/api-tokens-938839638.html

- Go to https://id.atlassian.net/ logged in with your Atlassian account
- Click on API Tokens, then Create Token
- Copy it and use it as the value of `JiraPassword` in the JIRA Output

### Configuring the output

The Jira output can be configured like so:

```json
{
    "type": "JiraWorklog",
    "name": "<internal name for output>",

    "JiraUrl": "https://myserver.atlassian.net",
    "JiraUsername": "myUsername",
    "JiraPassword": "myJiraPassword",
}
```

In here, the `type` property needs to be `JiraWorklog`.

The `name` property can be any value that you use internally to identify this integration.

Because Jira uses its own API, the `formatters` option will be ignored. It will still stop the processing if the configuration is wrong.

The property `JiraUrl` needs to have the URL to the Jira instance you'll be using. This supports both publicly hosted and Atlassian-hosted versions, as long as their API is enabled.

The property `JiraUsername` should be your account login.

The property `JiraPassword` should be either your password, or a token that you created to use instead of it. (Yes, this is insecure and can be improved. PRs are welcome.)

The key of ticket on which the time will be logged has to be stored in a tag named `JiraTicket`. Consider using an [addTag](add-tag.md) action to add it programatically.