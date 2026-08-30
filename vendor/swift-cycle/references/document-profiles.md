# Document Profiles

Use this reference after selecting a Swift Cycle scenario. Profiles are starting configurations, not mandatory directory trees. Reuse equivalent repository documents and omit every file whose responsibility does not exist.

Templates define structure, not a mandatory prose language. Resolve the target file language using the canonical Skill, then adapt headings, explanations, and examples consistently. Preserve filenames, commands, APIs, code identifiers, and standard status values.

## Selection

| Profile | Use when | Do not use when |
| --- | --- | --- |
| `minimal` | A small project or bounded change needs clear user, design, agent, action, and maintenance responsibilities | The task has no durable documentation change beyond an existing file |
| `standard` | Architecture, roadmap, candidate evaluation, or durable decisions need separate authorities | Extra files would only repeat README or DESIGN |
| `runtime_integration` | The project has deployable runtime, operations, storage, security, contracts, or active consumers | Only source code exists or runtime claims are outside the task |

State the chosen profile and reason in the work package. A project may start minimal and add one standard or runtime document without adopting the rest.

## Minimal profile

| Asset | Responsibility |
| --- | --- |
| `README.md` | User-facing purpose, setup, use, and limitations |
| `DESIGN.md` or equivalent | Concise design entry, adopted shape, boundaries, and links |
| `AGENTS.md` | Repository collaboration, safety, synchronization, and verification rules |
| Local `TODO.md` | Current milestone or action slice, blockers, and next action |
| Local `DEVLOG.md` | Failures, rejected approaches, maintenance evidence, and reusable-gate candidates |
| Existing `docs/` | Only durable details that already need a separate authority |

Do not create empty placeholders. Keep TODO and DEVLOG ignored when that is the project's established policy.

## Standard profile

Add only the assets justified by long-lived facts:

| Asset | Enable when | Authority |
| --- | --- | --- |
| `docs/architecture.md` | System shape, state, sequence, or data flow needs more detail than DESIGN | Detailed adopted architecture and diagrams |
| `docs/roadmap.md` | Cross-session or cross-machine commitments exist | Durable milestones, dependencies, and exit conditions |
| `docs/evaluation/*.md` | A candidate comparison or controlled trial needs shared context | Facts, observations, candidates, limitations, assumptions, unknowns, and decision criteria |
| `docs/adr/` | A long-lived significant decision has been made | Decision, alternatives, consequences, and evidence |
| Dated or milestone Review Packet | A separate reviewer needs a bounded snapshot | Frozen review scope and evidence, never current project truth |

## Runtime integration profile

Extend the standard profile only with relevant layers:

| Asset | Responsibility |
| --- | --- |
| `docs/operations.md` | Install, start, stop, verify, rollback, and troubleshoot |
| Contract documentation | Canonical fields, compatibility, errors, ownership, and change triggers |
| Security boundary | Exposure, trust, credentials, data handling, and residual risk |
| Storage and artifact boundary | Source, cache, artifact, runtime data, retention, and cleanup |
| Integration boundary | Producer/consumer responsibilities, inputs, outputs, versioning, and failure behavior |
| Identity matrix or evidence | Source revision, artifact identity, runtime identity, and active-consumer evidence |

Keep layer claims independent. Source evidence does not prove an artifact, runtime, or consumer.

## Shared document shape

Use one level-one heading per file. Prefer these stable level-two sections when they fit:

1. Status
2. Current conclusion
3. Scope or responsibility
4. Goals and non-goals
5. Architecture, contract, procedure, or decision detail
6. Boundaries and evidence
7. Unresolved items
8. Update triggers
9. Revision record

Do not force every section into every document. README remains user-facing and normally omits internal status metadata.

Use level-three headings for details. Avoid level-four and deeper headings unless an external format requires them. Keep Chinese paragraphs short, tables compact, and examples executable.

## Mermaid

- Put the conclusion before the diagram.
- Give one diagram one primary relationship.
- Use native Mermaid source; do not replace it with a generated image when text remains adequate.
- Explain scope and non-claims after the diagram.
- Prefer a flowchart for relationships, a sequence diagram for interactions, a state diagram for lifecycle, and a simple graph for topology.

## Freshness review

Run a focused freshness pass when a milestone, accepted decision, contract, runtime identity, or consumer identity changes:

- compare status and current conclusion with fresh repository or runtime evidence;
- find resolved unknowns, obsolete pending work, stale counts, and superseded candidates;
- confirm DESIGN still indexes current detailed authorities;
- confirm roadmap and TODO do not disagree about the active slice;
- verify early review packets are frozen, dated or milestone-bound, and no longer linked as current truth;
- check headings, local links, Mermaid fences, and revision records;
- update, mark stale, supersede, archive, or retire; never silently preserve a contradiction.

## Packet lifecycle

### Review Packet

Use a dated or milestone-qualified filename, for example:

`docs/reviews/2026-08-30-milestone-name.md`

Include scope, exact identity, claims, decisive evidence, unknowns, and requested review. Freeze it after handoff. Later corrections belong in a new packet or in the authoritative design/evidence document.

### Closeout Packet

Summarize delivered scope, verification, remaining risks, shared authorities, local-only records, and the next separately authorized action. It is a handoff artifact, not an acceptance or release decision.

## Retirement

Before archiving or deleting a document:

1. Identify its current authority and inbound links.
2. Name the replacement or explain why no replacement is needed.
3. Preserve historically material decisions or evidence.
4. Update indexes and links.
5. Verify no known consumer still depends on it.
6. Keep deletion or irreversible cleanup behind its own authorization.
