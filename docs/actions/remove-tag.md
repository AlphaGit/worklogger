## Transformation: Remove Tag

The remove tag transformation allows you to remove a specific tag from a worklog. This can be useful for cleaning up tags that are no longer needed or were added in error.

To use this transformation, add the following configuration to your transformations array in your `configuration.json` file:

```json5
{
    "type": "removeTag",
    "tagName": "<name of the tag to remove>"
}
```

The `type` property needs to be `removeTag` for this action to be used.

The `tagName` property specifies the name of the tag that you want to remove from the worklog.

Example: If you want to remove a tag named `temporary`, the configuration would look like this:

```json5
{
    "type": "removeTag",
    "tagName": "temporary"
}
```

This transformation will iterate over each worklog and remove the `temporary` tag if it exists.
