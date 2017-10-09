```json
{
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

            "regex": "string", // for descriptionMatches condition
            "tag": "string" // for hasTag condition
        },
        "action": {
            "type": "string",
            // other properties specific to the action type

            // Type: addTags
            "tagsToAdd": [
                "tag1:value1",
                "tag2:value2"
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
        "selectProjectFromTag": "HarvestProject",
        "selectTaskFromTag": "HarvestTask"
    }]
}
```
