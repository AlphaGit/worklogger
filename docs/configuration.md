```json
{
    "options": {
        // general application configuration
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
            "regex": "string"
        },
        "action": {
            "type": "string",
            // other properties specific to the action type
            "tagToAdd": "string"
        }
    }],
    "outputs": [{
        "type": "string",
        "name": "string"
        // other properties specific to the output type
    }]
}
```
