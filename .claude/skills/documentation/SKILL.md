---
name: documentation
description: Use when creating, updating, restructuring, or maintaining project documentation, PRDs, requirements, user stories, functional requirements, acceptance criteria, implementation plans, data models, open questions, decision logs, or AI-agent documentation workflows. Use for any request involving docs, PRD, requirements, roadmap, epics, tasks, specs, product documentation, technical documentation structure, or keeping documentation synchronized with code/product changes.
---

# Documentation Skill

## Overview

Use this skill to create and maintain structured documentation for any project.

This skill is optimized for documentation that AI agents can reliably use to implement software with fewer clarifying questions.

The core output is usually a documentation package like:

```text
docs/<project-slug>/
  README.md
  product-overview.md
  requirements.md
  data-model.md
  implementation-plan.md
  agent-guidelines.md
  open-questions.md
```

## When To Use This Skill

Use this skill when the user asks to:

- create project documentation;
- create a PRD;
- improve an existing PRD;
- split a large document into maintainable files;
- write user stories;
- write functional requirements;
- write acceptance criteria;
- write edge cases;
- create or update a data model;
- create an implementation plan;
- create epics and tasks;
- maintain a decision log;
- update docs after product/code changes;
- make documentation easier for AI agents to consume.

## Core Principles

- Documentation must be structured, traceable, and actionable.
- Prefer stable IDs over vague references.
- Do not remove requirements unless the user explicitly asks.
- Do not silently change product scope.
- If something is unclear, add an Open Question instead of guessing.
- If a feature is intentionally excluded, add it to Out of Scope.
- If a requirement changes implementation work, update the task backlog.
- If a requirement changes domain entities, update the data model.
- If a product decision is made, record it in the Decision Log.
- Documentation should tell an AI agent what to build, what not to build, and how to verify completion.

## Standard Documentation Package

Create this structure for product/project PRDs unless the user asks for a different format:

```text
docs/<project-slug>/
  README.md
  product-overview.md
  requirements.md
  data-model.md
  implementation-plan.md
  agent-guidelines.md
  open-questions.md
```

### File Responsibilities

| File | Responsibility |
| --- | --- |
| `README.md` | Entry point, reading order, how to use docs with AI agents |
| `product-overview.md` | Product goal, audience, modules, MVP scope, roadmap |
| `requirements.md` | Business rules, user stories, FR, AC, edge cases |
| `data-model.md` | Conceptual models, fields, relations, enums, rules |
| `implementation-plan.md` | Epics, tasks, priorities, dependencies, validation |
| `agent-guidelines.md` | DoD, out of scope, API expectations, UI states, agent rules |
| `open-questions.md` | Open questions, risks, decision log |

## Reading Order For Agents

When working with an existing documentation package, read in this order:

1. `README.md`
2. `product-overview.md`
3. `requirements.md`
4. `data-model.md`
5. `implementation-plan.md`
6. `agent-guidelines.md`
7. `open-questions.md`

For small updates, read only relevant files, but always check:

- `README.md` for project documentation rules;
- `agent-guidelines.md` for agent behaviour and out-of-scope rules.

## ID Conventions

Use stable IDs so documents can reference each other.

| Entity | Format | Example |
| --- | --- | --- |
| User Story | `US-<group>-<number>` | `US-1-001` |
| Functional Requirement | `FR-<group>-<number>.<subnumber>` | `FR-1-001.1` |
| Acceptance Criteria | `AC-<group>-<number>.<subnumber>` | `AC-1-001.1` |
| Business Rule | `BR-<domain>-<number>` | `BR-AUTH-001` |
| Task | `TASK-<epic>-<number>` | `TASK-AUTH-001` |
| Open Question | `OQ-<number>` | `OQ-001` |
| Risk | `RISK-<number>` | `RISK-001` |
| Non-functional Requirement | `NFR-<number>` | `NFR-001` |

Rules:

- Do not reuse deleted IDs.
- Do not renumber existing IDs without explicit user permission.
- If a requirement is obsolete, mark it as deprecated instead of deleting it.
- Tasks must reference relevant `US`, `FR`, `AC`, and `BR` IDs.

## Creation Workflow

When creating documentation for a new project:

1. Infer or ask for a project slug.
2. Create `docs/<project-slug>/README.md`.
3. Create `product-overview.md`.
4. Create `requirements.md` with representative detailed user stories.
5. Create `data-model.md` with conceptual domain models.
6. Create `implementation-plan.md` with MVP order, epics, tasks, dependencies, validation.
7. Create `agent-guidelines.md` with DoD, out of scope, API expectations, UI states.
8. Create `open-questions.md` with unresolved questions, risks, and decision log.
9. Ensure README links all files and explains reading order.
10. If the user gave incomplete input, make reasonable structure and put unknowns into Open Questions.

## Update Workflow

When updating documentation:

1. Identify which file owns the change.
2. Update that file first.
3. Check related files:
   - New/changed requirement → update `requirements.md`.
   - New/changed entity → update `data-model.md`.
   - New/changed implementation work → update `implementation-plan.md`.
   - New/changed agent rule → update `agent-guidelines.md`.
   - Unclear product point → update `open-questions.md`.
   - Product scope/roadmap change → update `product-overview.md`.
4. Preserve stable IDs.
5. Add a decision log entry if a product decision was made.
6. Add open questions instead of guessing unresolved details.

## Cross-Document Relationships

### Requirements → Implementation Plan

Every implementation task should reference requirements:

```md
References: US-1-001, FR-1-001.1–FR-1-001.13, AC-1-001.1–AC-1-001.7
```

If a new `US` or major `FR` is added, check whether a new `TASK` is needed.

### Requirements → Data Model

If a requirement introduces a new concept, check whether it needs a model.

Examples:

- SMS confirmation → `VerificationCode`
- User roles → `UserRole`, `RoleApprovalRequest`
- Product catalog → `Product`, `ProductCategory`
- Statistics charts → `StatisticDataset`, `StatisticRecord`
- Payments → `Payment`, `Transaction`, `PayoutRequest`

### Requirements → Agent Guidelines

If a requirement creates a global implementation rule, add it to `agent-guidelines.md`.

Examples:

- all async screens need loading/error/empty states;
- destructive actions require confirmation;
- admin actions require backend role checks.

### Implementation Plan → Open Questions

If a task cannot be fully specified, add an open question:

```md
- `OQ-011`: Which SMS provider should be used for phone verification?
```

### Decisions → All Files

If an open question is resolved:

1. Update `open-questions.md`.
2. Add a decision log entry.
3. Update affected files.
4. Keep the old question with status or move it to resolved decisions.

## Writing Style

Use clear, direct language.

Prefer:

- “System must ...” for backend behaviour.
- “User can ...” for user actions.
- “If ..., then ...” for conditional logic.
- “Must not ...” for constraints.
- “Done when ...” or ACs for completion checks.

Avoid:

- vague words like “nice”, “simple”, “fast” without measurable context;
- implementation guesses when product intent is unclear;
- giant unstructured paragraphs;
- mixing strategic overview and low-level tasks in the same section.

## Required Sections By File

### README.md

Must include:

- project documentation title;
- reading order;
- how to give tasks to AI agents;
- maintenance rules.

### product-overview.md

Must include:

- general info;
- project description;
- goals;
- target audience;
- modules;
- MVP scope;
- roadmap.

### requirements.md

Must include:

- business rules;
- user stories;
- functional requirements;
- acceptance criteria;
- edge cases.

Recommended structure:

```md
### US-X-XXX: Title

**User Story**

As a [role], I want [action], so that [value].

**Priority:** Must Have / Should Have / Could Have / Later

#### Functional Requirements

- `FR-X-XXX.1`: System must ...
- `FR-X-XXX.2`: User can ...
- `FR-X-XXX.3`: If ..., then system must ...

#### Acceptance Criteria

- `AC-X-XXX.1`: User sees ...
- `AC-X-XXX.2`: When ..., system ...
- `AC-X-XXX.3`: Error is shown if ...

#### Edge Cases

- ...
```

### data-model.md

Must include:

- modeling principles;
- domain models;
- fields;
- enums/statuses;
- relations;
- rules;
- relationship overview.

Recommended model structure:

````md
### ModelName

**Purpose**

...

**Fields**

| Field | Type | Required | Notes |
| --- | --- | --- | --- |

**Enums**

```text
Status = draft | active | archived
```

**Relations**

- ...

**Rules**

- ...
````

### implementation-plan.md

Must include:

- task rules;
- priority definitions;
- recommended implementation order;
- epics;
- tasks;
- dependencies;
- references;
- scope;
- out of scope;
- validation.

Recommended task structure:

```md
#### TASK-EPIC-001: Task Name

| Field | Value |
| --- | --- |
| Priority | P0 |
| Depends on | none |
| References | US-..., FR-..., AC-... |

**Scope**

- ...

**Out of Scope**

- ...

**Validation**

- ...
```

### agent-guidelines.md

Must include:

- general rules for AI agents;
- definition of done;
- global out of scope;
- data model reference;
- API expectations;
- UI state requirements;
- destructive action rules;
- task prompt template.

### open-questions.md

Must include:

- open questions;
- risks;
- decision log.

Recommended structure:

```md
## Open Questions

- `OQ-001`: ...

## Risks

| ID | Risk | Impact | Mitigation |
| --- | --- | --- | --- |

## Decision Log

| Date | Decision | Reason |
| --- | --- | --- |
```

## Agent Behaviour Rules

When using this skill, the agent must:

- keep documentation changes focused;
- preserve IDs;
- update related documents when needed;
- ask or record open questions when requirements are unclear;
- avoid inventing product decisions silently;
- not remove scope without permission;
- maintain consistent terminology;
- prefer tables for structured lists;
- prefer bullet points for rules and criteria;
- keep implementation tasks actionable and verifiable;
- create examples when useful, but mark them as examples;
- avoid overfitting documentation to one framework unless the project already chose it.

## When To Ask The User

Ask the user only if:

- a product decision changes scope;
- a requirement contradicts another requirement;
- a task requires choosing between multiple business behaviours;
- the documentation cannot be updated safely without knowing intent.

Do not ask the user for trivial formatting or wording decisions. Use the existing style.

## Quality Checklist

Before finishing documentation work, verify:

- README links all documentation files.
- New requirements have stable IDs.
- Tasks reference requirements.
- New models are reflected in `data-model.md`.
- Out-of-scope items are explicit.
- Open questions are recorded.
- Decisions are logged.
- No large unrelated rewrites were made.
- The documentation can be used by another AI agent without extra explanation.

## Templates

This skill includes reusable templates in:

```text
templates/prd/
```

When creating a new documentation package, copy or adapt these templates rather than starting from a blank file.
