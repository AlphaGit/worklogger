```json
{
    "options": {
        // general application configuration
        "minimumLoggableTimeSlotInMinutes": 30,
        "fromHowManyHoursAgo": 72
    },
    "inputs": [{
        "type": "string",
        "name": "string",
        // other properties specific to the input type
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
            "tag": "string" // for addTag action
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
            "aggregateByTags": [
                ["tag1"],
                ["tag1", "tag2"],
            ]
        }
        // other properties specific to the output type
    }]
}
```
