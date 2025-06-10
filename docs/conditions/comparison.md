# Comparison Condition

Evaluates a worklog set by comparing two operands, such as the total duration of all worklogs and a constant value.

## Configuration

```
{
    "operator": "gt",
    "operand1": { "type": "field", "field": "totalDuration" },
    "operand2": { "type": "constant", "value": 2400 }
}
```

Supported operators:

- `eq`
- `gt`
- `lt`
- `gte`
- `lte`

Operands of type `field` currently support only `totalDuration`.
