# {{PROJECT_NAME}} Agent Guidelines

## AI Agent Rules

- Implement only the current task scope.
- Do not implement Out of Scope items without permission.
- Preserve existing architecture and terminology.
- Validate input on backend.
- Enforce permissions on backend.
- Show clear errors on frontend.
- Update related docs when requirements change.

## Definition of Done

- Functional requirements are implemented.
- Acceptance criteria are met.
- Edge cases are handled.
- Typecheck/lint/tests pass where available.

## Global Out of Scope

- ...

## Data Model Reference

Use `data-model.md` as the source for domain entities, fields, relations, and statuses.

## API Expectations

- Protected actions require auth.
- Admin actions require admin role.
- Mutations validate payloads.
- Lists support pagination when data can grow.

## UI State Requirements

Async screens should support:

- loading;
- empty;
- error;
- success.

Forms should support:

- disabled submitting state;
- validation errors;
- backend errors;
- success feedback.
