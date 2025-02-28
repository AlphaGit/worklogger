# Services

Services provide utility functions and shared functionality used across the application. They handle common operations like configuration processing, file loading, and logging.

## Core Services

- [Configuration Processor](./configuration-processor.md): Handles parsing and validation of application configuration
- [File Loader](./file-loader.md): Provides abstract file access for local and S3 storage
- [Logger](./logger.md): Centralized logging service with configurable outputs
- [Auth Handler](./auth-handler.md): Manages authentication for various external services
- [Harvest Client](./harvest-client.md): API client for Harvest time tracking service
- [Input Loader](./input-loader.md): Loads and initializes input components
- [Output Loader](./output-loader.md): Loads and initializes output components
- [Action Loader](./action-loader.md): Loads and initializes action components
- [Condition Loader](./condition-loader.md): Loads and initializes condition components

## Common Concepts

Services typically:

- Are singleton instances
- Provide application-wide functionality
- Handle cross-cutting concerns
- Implement interfaces for testability
- Support dependency injection

## Example Usage

```typescript
// Configuration processing
const config = await configurationProcessor.process('config.json');

// File loading
const fileLoader = new S3FileLoader(config);
const content = await fileLoader.load('path/to/file');

// Logging
logger.info('Processing complete', { details: result });
```

## Adding New Services

When adding a new service:

1. Define the service interface
2. Implement the concrete service class
3. Add appropriate unit tests
4. Register the service in the dependency container if needed
5. Document the service in this directory
