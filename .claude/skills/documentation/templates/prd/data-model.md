# {{PROJECT_NAME}} Conceptual Data Model

## Modeling Principles

- Every entity should have a unique `id`.
- Mutable entities should have `createdAt` and `updatedAt`.
- Sensitive fields must not be returned in API responses.
- Status fields should use enums.

## Models

### ModelName

**Purpose**

...

**Fields**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| id | UUID/string | yes | Unique identifier |

**Enums**

```text
Status = draft | active | archived
```

**Relations**

- ...

**Rules**

- ...

## Relationship Overview

```text
ModelA
  └─ ModelB[]
```
