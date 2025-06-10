# AGENTS.md - Worklogger

*Last updated 2025-06-09*

> **Purpose** – This file is the onboarding manual for AI assistants and humans working on this repository. It outlines the coding standards, testing workflow and project layout so contributions remain consistent.

---

## 0. Project overview

Worklogger is a Node.js/TypeScript application that consolidates worklogs from multiple sources and sends them to different outputs. It can be run locally via `yarn start` or deployed as AWS Lambda functions through the Serverless Framework. The codebase follows a modular architecture with inputs, actions, formatters and outputs.

---

## 1. Non‑negotiable rules

| #  | AI **may** do                                            | AI **must NOT** do |
|----|----------------------------------------------------------|--------------------|
| G‑0| Ask for clarification when unsure.                       | Guess at project requirements. |
| G‑1| Modify files only inside the repository directories.     | Touch `node_modules/` or unrelated system files. |
| G‑2| Keep commit messages clear using Conventional Commits (`feat:`, `fix:`, `chore:`…). | Create large, unfocused commits. |
| G‑3| Follow the lint and style configuration.                 | Reformat code with a different style. |
| G‑4| Run all tests (`yarn test:all`) before committing.        | Skip programmatic checks. |
| G‑5| Check for nested `AGENTS.md` files before editing code.  | Ignore existing agent instructions. |

---

## 2. Build & test commands

Use Yarn (v3) for all tasks.

```bash
# Install dependencies
yarn install

# Lint, type‑check and test with coverage
yarn test:all

# Run only linting
yarn lint

# Execute locally
yarn start -c configuration.json
```

The default tests use Jest and TypeScript. Ensure they pass before committing.

---

## 3. Coding conventions

* **Language**: TypeScript with `esModuleInterop` enabled.
* **Indentation**: 4 spaces, semicolons required.
* **Strings**: single quotes unless escaping is easier with double quotes.
* **Logging categories**: use one of `app`, `actions`, `conditions`, `formatters`, `inputs`, `outputs`, or `services` as defined in `docs/design-decisions.md`. These should match the general categories of different elements (components) available in the application.
* **File structure**: keep components under the existing directories (`app/actions`, `app/conditions`, `app/formatters`, `app/inputs`, `app/outputs`, `app/services`).

Document public classes and methods with brief comments when adding new functionality. Do not overcrowd the code with extra comments. Use them sparingly.

---

## 4. Repository layout

| Path            | Description                                   |
|-----------------|-----------------------------------------------|
| `app/`          | Source code for actions, inputs, outputs and services. |
| `tests/`        | Shared test helpers and additional unit tests. |
| `docs/`         | Project documentation and design notes.        |
| `configuration.json` | Example configuration for running the app. |
| `serverless.yml`| Serverless deployment configuration.           |

Refer to `docs/README.md` for an overview of the documentation structure.

---

## 5. Contributing workflow

1. Create granular commits following Conventional Commit messages.
2. Run `yarn test:all` and ensure all checks succeed.
3. Include relevant documentation updates when adding or modifying features.
4. After changes, leave the working tree clean (`git status` shows no modifications).
5. For any change that includes a new configuration option, add an example of it in `docs/configuration.md`. This file is not meant to be valid JSON, but rather a readable example with the different configuration options and their possible values.

---
