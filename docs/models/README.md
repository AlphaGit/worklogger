# Models

Models represent the core data structures used throughout the application. They define the shape and behavior of worklogs, tags, and other fundamental entities.

## Core Models

- `Worklog`: Represents a single time entry with start time, end time, and tags
- `WorklogSet`: A collection of worklogs within a specific time period
- `Tag`: Key-value pairs used to categorize and organize worklogs
- `RelativeTime`: Handles time period calculations and conversions

## Common Concepts

The models system:
- Provides type-safe data structures
- Implements validation logic
- Supports serialization/deserialization
- Includes helper methods for common operations
- Maintains consistency across the application

## Example Usage

```typescript
const worklog = new Worklog({
  startDateTime: new Date(),
  endDateTime: new Date(),
  summary: "Development work"
});

worklog.addTag(new Tag("project", "feature-x"));
worklog.addTag(new Tag("type", "development"));

const worklogSet = new WorklogSet([worklog]);
```

## Extending Models

When extending the model system:

1. Ensure new models implement required interfaces
2. Add appropriate validation
3. Update serialization handling
4. Add unit tests
5. Document the new model in this directory
