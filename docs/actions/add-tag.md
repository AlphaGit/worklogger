## Transformation: Add Tags

The add tags transformation can be added like so:

```json5
{
    "type": "addTags",

    "tagsToAdd": [
        { "name": "tag1", "value": "value1" },
        // example regex: extract expression between square brackets
        { "name": "tag3", "extractCaptureFromSummary": "\\[([^\\[\\]]+)\\]" }
    ]
}
```

The `type` property needs to be `addTags` for this action to be used.

The `tagsToAdd` property will allow you to specify multiple tags at the same time. Each element of the array has a `name` property that specifies the name of the tag to be added.

When used in combination with the `value` property, it will add the name and the value tags verbatim.

When used in combination with the `extractCaptureFromSummary`, it will use the specified regex to obtain the first group match (use parenthesis `()`) from the summary of the worklog and use that as the value for that tag.

Keep in mind that this has to be specified in a JSON value, so be mindful about the escaping.

Example: we want to match `[TICKET-123]`-like summaries, then the regex for the internal part will be `[^\[\]]+`. Adding the group match, the expression becomes `([^\[\]]+)`. Adding `\[` to the front and `\]` to the back, the expresion is now `\[([^\[\]]+)\]`. Finally, for this string to be used in a JSON string, we have to transform every `\` into `\\`, so the final expression, as shown in the example, is `\\[([^\\[\\]]+)\\]`.