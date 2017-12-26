```json
{
    // logger configuration fed directly into log4js: https://github.com/nomiddlename/log4js-node
    "log4js": {
        "appenders": {
            "outAppender": {
                "type": "stdout",
                "layout": {
                    "type": "pattern",
                    "pattern": "%[[%d{ABSOLUTE}] [%-5p]%] %m"
                }
            }
        },
        "categories": {
            "default": {
                "appenders": ["outAppender"],
                "level": "trace"
            }
        }
    },
    "options": {
        // general application configuration
        "minimumLoggableTimeSlotInMinutes": 30,
        "timePeriod": {
            "begin": {
                "fromNow": "string", // "this", "last"
                "unit": "string" // "hour", "day", "week", "month"
            },
            "end": {
                "fromNow": "string", // "this", "last"
                "unit": "string" // "hour", "day", "week", "month"
            }
        }
    },
    "inputs": [{
        "type": "string",
        "name": "string",

        // other properties specific to the input type
        // Type: GoogleCalendarInput
        "calendars": [{
            "id": "string",
            "includeTags": [
                "tag1:value1",
                "tag2:value2"
            ]
        }]
    }],
    "worklogSetOperations": [{
        "condition": {
            "type": "string"
        },
        "type": "string",
        // other properties specific to this worklog set operation
    }],
    "transformations": [{
        "condition": {
            "type": "string",
            // other properties specific to the condition type

            // type: hasTag
            "tagName": "string",
            "tagValue": "string"
        },
        "action": {
            "type": "string",
            // other properties specific to the action type

            // Type: addTags
            "tagsToAdd": [
                { "name": "tag1", "value": "value1" },
                { "name": "tag2", "value": "value2" }
                { "name": "tag3", "extractCaptureFromSummary": "\\[([^\\[\\]]+)\\]" } // example regex: extract expression between square brackets
            ]
        }
    }],
    "outputs": [{
        "type": "string",
        "name": "string",
        "condition": {
            // (see above)
        },
        "formatter": {
            "type": "string",
            // other properties specific to the output type

            // Type: SummaryTextFileFormatter
            "aggregateByTags": [
                ["tag1"],
                ["tag1", "tag2"],
            ]
        },
        // other properties specific to the output type

        // Type: TextFile
        "filePath": "string",

        // Type: HarvestApp
        "token": "string",
        "accountId": "string",
        "contactInformation": "string",
        "selectProjectFromTag": "HarvestProject",
        "selectTaskFromTag": "HarvestTask",

        // Type: JiraWorklog
        "JiraUrl": "https://myserver.atlassian.net",
        "JiraUsername": "myUsername",
        "JiraPassword": "myJiraPassword"

        // Type: Logger
        // (no configurations)
    }]
}
```
