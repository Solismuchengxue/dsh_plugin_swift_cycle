---
name: swift-cycle
description: Manual-invocation workflow for lightweight governance of personal and small software projects. Use only when the user explicitly invokes swift-cycle to initialize or review README, DESIGN, AGENTS, local TODO and DEVLOG, shared docs, governance baselines, commit boundaries, source/runtime transitions, candidate evaluations, lifecycle states, documentation drift, or project closeout. Keep small local changes fast and avoid heavyweight process.
license: MIT
---

# Swift Cycle

## Goal

Maintain design consistency, execution continuity, and traceability with the smallest useful documentation set. Adjust the framework incrementally from repository evidence. Never describe a candidate, test, tool, or decision as verified when evidence is missing.

Swift Cycle owns the engineering loop inside one project: choose a scenario, select a proportional document profile, shape a finite work package, implement, verify, and promote reusable learning. It may emit a project work package, Review Packet, or Closeout Packet for an external coordinator, but it does not own portfolio routing, capacity, cross-project authorization, model selection, approval queues, registries, or an organizational lifecycle. Do not create a second status machine inside the project.

## Use the project's language

Resolve conversation language and file language separately.

1. For conversation, explanations, and the final report, use this precedence: the user's explicit language request, then the language of the current Skill invocation.
2. When modifying an existing file, use: the user's explicit file-language request, the file's established primary language, the project's primary language, then the invocation language.
3. When creating a file, use: the user's explicit file-language request, the project's primary language, then the invocation language.
4. A mid-conversation language switch changes communication, not the language of existing documents. Do not bulk-translate files unless the user requests it.
5. Create bilingual README or document counterparts only when the project already maintains them or the user explicitly requests them.
6. Do not translate filenames, commands, APIs, code identifiers, or standard status values. Avoid accidental mixed-language prose inside one file.
7. Preserve terminology and filename conventions already established in the repository. Keep standard filenames such as `README.md`, `DESIGN.md`, `AGENTS.md`, `TODO.md`, and `DEVLOG.md` unless the project already uses an equivalent.
8. Treat templates as structural examples. Adapt their headings and prose to the resolved file language instead of copying an example language mechanically.
9. For Simplified Chinese terminology and document wording, read `references/zh-CN.md`.

## Inspect the real state first

1. Read repository instructions, `README.md`, `DESIGN.md`, relevant `docs/`, `.gitignore`, and existing maintenance records.
2. Inspect the Git branch, status, and relevant diff. Separate pre-existing user changes from the current task.
3. Distinguish confirmed facts, assumptions, and inferences. Do not invent repository structure, tests, tools, decisions, or validation results.
4. Preserve existing user work. Do not remove data, discard changes, or perform unrelated cleanup.

## Establish a governance baseline when needed

Establish a baseline before non-trivial governance work that spans authority
boundaries, changes a source/runtime relationship, migrates or reorganizes
state, replaces or removes assets, or requires a reliable before/after
comparison. Do not create one for a simple, local, explicit change.

1. Capture only the comparison facts the task needs: scope, current authority,
   relevant identities, preserved items, known unknowns, and the evidence source
   and time.
2. Keep the observed current state separate from the intended target state. Do
   not rewrite the baseline to match the outcome.
3. Use an existing task record, report, or evidence location; do not require a
   new file or fixed schema. Keep short-lived baselines in the current execution
   context, and promote them only when later sessions, irreversible work, or
   acceptance depends on them.
4. Refresh the baseline or mark it stale when its scope, identity, or authority
   changes.

## Reuse before building

Before implementation:

1. Check the current repository for reusable code, scripts, dependencies, tools, documentation, and implementation patterns.
2. Then evaluate official solutions and already installed Skills, plugins, MCP integrations, or development tools.
3. If those are insufficient, evaluate maintained third-party tools and mature open-source projects.
4. Summarize fit, limits, integration cost, major risks, and availability.
5. Obtain user confirmation before installing, enabling, downloading, connecting, or configuring a new external solution.

Do not perform unbounded research for a simple, local change with an obvious implementation.

When a tool affects development or review, state its scope before adoption:

- **Project-local configuration:** smallest blast radius; prefer it when the tool is project-specific.
- **Shared infrastructure:** record affected projects, compatibility, rollback, and ownership.
- **User or system configuration:** treat as external deployment state and require explicit authorization.
- **Generated files:** decide whether they are source, cache, evidence, or runtime data; define ignore, refresh, and retirement behavior before relying on them.

## Match governance to task size

Choose the scenario before choosing documents. Read `references/document-profiles.md` when bootstrap, adoption, runtime integration, documentation restructuring, or closeout needs more than the minimal profile.

| Scenario | Default profile | Minimum document action | Verification and stop condition |
| --- | --- | --- | --- |
| Bootstrap or adopt | `minimal`, upgrade to `standard` only when boundaries need durable detail | Reconcile README, DESIGN, AGENTS, local TODO/DEVLOG, and existing docs; preserve an adopted repository's current work | Verify identity, ownership, links, and ignore rules; stop before overwrite, deletion, installation, or external activation |
| Small local change | `minimal` | Update only the responsible source or user document; keep TODO as a short execution view | Run the nearest check; stop when evidence is sufficient or scope expands |
| Feature or behavior change | `minimal` or `standard` | Record changed behavior, design boundary, durable plan, and user-visible effect only where each belongs | Test the changed behavior and affected contracts; stop before unrelated refactoring |
| Bug fix | `minimal` | Capture the reproduction and current action locally; promote the durable assertion after confirmation | Reproduce, fix the cause, and run regression checks; stop if the cause is still unknown |
| Research or candidate evaluation | `standard` only when the evaluation must be shared | Separate facts, observations, candidates, limits, assumptions, and unknowns; use the candidate lifecycle | Stop at accepted, rejected, deferred, or insufficient evidence; a trial is not adoption |
| Runtime project or cross-project integration | `runtime_integration` | Record contracts, identity layers, operations, security, storage, and consumer boundaries that actually exist | Verify each claimed layer independently; stop before deployment or consumer switching without authorization |
| Milestone closeout | Existing profile | Reconcile shared truth, current TODO, evidence, decisions, and stale packets; prepare a concise Closeout Packet | Stop when claims match fresh evidence and remaining work is explicit |
| Documentation retirement | Existing profile | Identify authority, inbound links, replacement, history value, and rollback before archive or deletion | Stop if the replacement is not authoritative or consumers remain unknown |

Profiles are starting configurations, not mandatory trees. Never burden a simple change with `standard` or `runtime_integration` artifacts merely because templates exist.

## Establish the core framework

At project start, establish these responsibilities. Reuse equivalent existing files instead of maintaining duplicates.

### `README.md`

- Keep a user-only perspective.
- Include the project introduction, installation or startup, usage, and user-visible limitations.
- Commit it to Git.
- Exclude internal decisions, maintenance evidence, agent notes, and short-term tasks.

### `DESIGN.md`

- Use it as the concise design entry point.
- Record goals, principles, system shape, key boundaries, adopted architecture, and links to detailed documents.
- Mark candidates clearly and keep them separate from adopted architecture.
- Commit it to Git and avoid copying long details from `docs/`.

### `AGENTS.md`

- Record project rules, safety boundaries, documentation sync triggers, and verification requirements.
- Keep different agents and sessions aligned.
- Commit it to Git.

### `DEVLOG.md`

- Record failures, rejected approaches, internal judgments, maintenance evidence, and evolution history.
- Keep it local at the repository root and ignore it in Git.

### `TODO.md`

- Record current actions, priorities, blockers, and next steps.
- Keep entries short, executable, and current.
- Keep it local at the repository root and ignore it in Git.
- Do not use it as the only store for cross-machine or long-term commitments.
- Keep a normal checklist for simple work. Use milestone and PR structure only
  when the task explicitly requires multiple PRs or the user requests
  milestone-based execution.

### `docs/`

- Store long-lived shared requirements, architecture, runbooks, roadmaps, evaluations, and ADRs.
- Commit it to Git and index detailed documents from `DESIGN.md`.
- If no detailed document exists yet, create a meaningful status-bearing entry so the directory is not an empty placeholder.

## Apply the selected document profile

- **`minimal`:** use the existing README, concise DESIGN or equivalent design entry, AGENTS, local TODO/DEVLOG, and only the shared docs the project already needs.
- **`standard`:** add durable architecture, roadmap, evaluation, ADR, or other responsibility-specific documents only when the project has corresponding long-lived facts.
- **`runtime_integration`:** extend `standard` with operations, contracts, security, storage/artifact, integration, and source/artifact/runtime/consumer evidence only for layers that exist.

Use templates as optional starting points, not required files. Prefer repository-equivalent documents over duplicates. Record why a profile was selected and which optional documents were intentionally omitted.

## Keep documents readable and fresh

1. Give each Markdown document one level-one heading. Use level-two headings for stable sections and level-three headings for detail; avoid deeper trees unless an external format requires them.
2. For internal design and operations documents, begin with status, current conclusion, scope or responsibility, and update trigger when those facts are useful. Keep internal status out of a user-only README.
3. State the conclusion before a Mermaid diagram. Give each diagram one primary relationship, and explain its boundary after the diagram. Keep Mermaid source native and reviewable.
4. Keep one concept authoritative in one location. Use links or concise summaries elsewhere instead of copying the same fact.
5. End durable internal documents with unresolved items, update triggers, and a short revision record when their lifecycle benefits from them.
6. Check freshness whenever a milestone, architecture, contract, runtime identity, consumer identity, or accepted decision changes. Search for stale status labels, obsolete pending work, resolved unknowns, heading drift, and contradictory counts or identities.
7. Mark stale documents explicitly or update them. Do not leave a draft architecture, old plan, or early evaluation presenting itself as current truth after implementation has moved on.

## Promote local knowledge

Treat ignored local maintenance records as capture surfaces, not durable shared authority.

1. Do not promote short-term actions, one-off failures, or current-session information.
2. Promote a record when it becomes a cross-session or cross-machine commitment, a durable decision or constraint, or evidence that later work must review or verify.
3. Choose the shared asset by responsibility: plans and commitments go to a roadmap, issue, milestone, or shared plan; architecture and trade-offs go to `DESIGN.md`, an ADR, or a decision document; verified facts go to evidence documentation; migration outcomes go to migration documentation; user-visible facts go to `README.md` or user documentation.
4. After promotion, treat the shared asset as authoritative. Keep only a short status or link in the local record instead of copying the complete fact.

## Separate composite states

Treat a status as composite when one label answers more than one independent lifecycle question.

1. Identify the independent concerns represented by the label, such as implementation, experiment, quality, or release concerns.
2. Split only the concerns the project actually tracks. Give each concern its own meaning, transitions, and closure evidence.
3. Keep concerns independent unless repository evidence defines a real dependency. Closing one concern must not silently close another.
4. Treat any overall status as a derived summary, not the authority for its component concerns.
5. Do not prescribe fixed fields, field names, or a status schema.

## Separate source and runtime claims

Apply this boundary only when the project has more than one relevant delivery
layer.

1. Identify only the layers that exist, such as source, a built or published
   artifact, deployed runtime, and an active consumer.
2. Treat each layer as an independent fact with its own authority and closure
   evidence. Closing one layer must not silently close another.
3. A source change does not authorize building, publishing, deploying, or
   switching a consumer. Authorization does not transfer across layers.
4. Source verification does not prove artifact or runtime behavior. Deployment
   does not prove that an active consumer uses the new state.
5. Use fresh evidence from the claimed layer and record the exact identity being
   verified. Keep uninspected layers explicitly unverified.
6. Do not prescribe mandatory layers, fixed state fields, or a status schema.

For a transition, build only the identity matrix and precondition assertions the task needs. Typical identities include source revision, artifact digest or package version, runtime path or process identity, and active consumer evidence. Do not compare Git file mode such as `100644` directly with installed execution permissions such as `0755`; they describe different layers.

Derive wrapper fields and schema mappings from the canonical contract, not from a sample payload or remembered shape. Avoid tests and manifests that both read the same derived value: a shared wrong source can make them agree while both are wrong. For copied digests, identities, or summaries, prefer structured generation or an independently recomputed value.

## Initialize honest drafts

Except for the user-facing `README.md`, an initial document may be marked `planned` or `draft`, but it must not be blank. Record:

- purpose;
- status;
- current conclusion;
- open questions;
- update trigger.

Keep internal draft state out of `README.md`. Put it in `DESIGN.md`, `TODO.md`, or relevant shared documentation.

Treat `METHODOLOGY.md` as an explicit exception: create it only near project closeout from evidence of real work, and keep it local and ignored unless the user chooses otherwise.

## Manage plans and candidates

### Long-term plans

- Store cross-machine, cross-session commitments in a committable feasibility
  report, `docs/roadmap.md`, or the project's shared issue tracker.
- A roadmap may begin as a status-marked draft, but do not describe planned work as completed.
- Treat that shared artifact as the durable plan. Keep local `TODO.md` focused
  on the current execution slice, actions, and blockers.

### Commit boundaries

Plan commit boundaries before staging when a task will create multiple commits,
contains mixed-purpose hunks, depends on ordered commits, or requires an
individually reviewable history.

1. Assign each proposed commit one intent, its exact paths or hunks, its
   dependencies, its verification, and its expected intermediate state.
2. Keep pre-existing user changes and ignored local execution records outside
   the planned boundary unless the user explicitly includes them.
3. Make each intermediate commit coherent, reviewable, and safely reversible.
   If no meaningful intermediate state exists, use one atomic commit instead of
   forcing an artificial split.
4. Review the staged diff for each boundary and verify the completed sequence as
   a whole.

For a simple single-commit change, verify only the staged scope; do not create a
separate commit plan.

### Milestones and PR queues

When a task explicitly requires multiple PRs or the user requests milestone-based execution:

1. Structure local `TODO.md` with a current milestone and a dependency-ordered PR queue.
2. Give every PR item these fields: ID, milestone, deliverable, scope,
   dependencies, verification, status, and PR link. Use an honest placeholder
   such as `pending` until a PR exists; do not invent a link.
3. Make every PR an independently reviewable, verifiable, and reversible
   increment. Execute the queue in dependency order.
4. When a milestone or PR status changes, update both local `TODO.md` and the
   corresponding durable shared plan.

For simple work, continue using the normal TODO checklist; do not introduce a PR queue.

### Candidate lifecycle

Follow this order:

1. Mark the idea as a candidate in `DESIGN.md` and define its boundary.
2. Schedule a controlled trial in local `TODO.md`.
3. Create a status-marked evaluation document when the planned evaluation needs durable shared context.
4. When the trial starts, mark it in progress and collect evidence.
5. After validation, record acceptance or rejection in an ADR when the decision is long-lived and significant.
6. Update the adopted design only after the decision is supported.

An evaluation should cover:

- purpose and status;
- goals and non-goals;
- evidence classes: confirmed facts, direct observations, candidate claims, limitations, assumptions, and unknowns;
- risks;
- acceptance and rejection criteria;
- current evidence;
- rollback path;
- open questions and update trigger.

Do not list a candidate tool as an adopted dependency before validation. Preserve important rejected or replaced decisions instead of deleting their rationale.

## Synchronize on real triggers

- Baseline scope, identity, or authority changes: refresh it or mark it stale.
- Architecture, tool responsibility, or data boundary changes: update `DESIGN.md` and affected shared docs.
- Source, artifact, runtime, or consumer transitions: update only the affected
  layer and attach evidence from that layer.
- Experiment, blocker, or next-action changes: update local `TODO.md`.
- Milestone or PR status changes: update local `TODO.md` and the corresponding
  durable shared plan.
- Failure, rejected attempt, maintenance evidence, or important internal judgment: update local `DEVLOG.md`.
- Long-lived and significant formal decision: complete an ADR after validation.
- User-visible behavior, installation, or usage changes: update `README.md`.
- Milestone, implementation, or accepted-decision changes: run a freshness check across DESIGN, architecture, roadmap, evaluation, operations, and active packets; close resolved unknowns and retire obsolete pending work.

## Shape a finite work package

Before changing a non-trivial project, state:

- selected scenario and profile, with the reason;
- goal and observable exit condition;
- exact scope and preserved items;
- authority and actions still requiring separate approval;
- dependencies, risks, and known unknowns;
- smallest relevant verification and rollback point;
- expected document synchronization.

Keep the work package project-local and finite. It is an execution contract, not an organizational queue or a new status schema.

## Run the short loop

Repeat:

1. Scan the relevant state and risk.
2. Make the smallest change that advances the current goal.
3. Run the smallest relevant verification immediately.
4. Continue when evidence supports the change; otherwise diagnose and correct or revert the current step.
5. Do not expand scope merely because governance work exposed unrelated opportunities.

Within one approved milestone, continue through normal steps without repeatedly interrupting the user when every step is already listed, remains under the same authority, is reversible, and stays inside the approved scope. Pause when authority changes, a new external side effect appears, evidence contradicts the plan, rollback is no longer safe, or the stop condition is reached.

Keep Review evidence concise. Report boundaries and decisive evidence instead of repeating internal state after every ordinary step.

## Promote failures into reusable learning

Keep transient failure detail in local `DEVLOG.md`. When a failure establishes a reusable guard, record it as:

1. **Failure mode:** the observable incorrect outcome.
2. **Cause:** the confirmed mechanism, or `UNKNOWN` when not established.
3. **Corrective assertion:** the condition that would have prevented or detected it.
4. **Reusable gate:** where future work must check that assertion.

Promote only the durable decision, contract correction, runbook step, test, or evidence rule to shared documentation. A single unconfirmed failure remains local.

## Freeze and retire packets

- Use a Review Packet only when another reviewer needs a bounded snapshot. Include scope, identity, claims, decisive evidence, unknowns, and requested review.
- Date or milestone the packet and freeze it after handoff. Do not keep an early packet as a mutable current-truth document.
- When later work supersedes a packet, mark it superseded or archive it, update inbound links, and point to the current authority. Preserve history when its evidence still matters.
- Use a Closeout Packet to summarize delivered scope, verification, remaining risks, local-only records, shared authorities, and next separately authorized action.
- Packets are outputs for an external coordination loop. They do not create project acceptance, activation, release, or organizational state.

## Verify before completion

Scale verification to the risk. Do not default to whole-repository hashes, multiple manifests, reverse-derived digests, or duplicate proofs when a narrower direct check establishes the claim. At minimum:

1. Review the final diff and confirm every changed file belongs to the request.
2. Run `git diff --check`.
3. Check Markdown links when entry points or paths change.
4. Run `git check-ignore` when local-file rules change.
5. Confirm local maintenance files are neither tracked nor staged.
6. When multiple commits are planned, inspect the staged scope and relevant
   intermediate state at every boundary.
7. For source or runtime claims, verify the claimed layer directly and report
   every uninspected layer as unverified.
8. Check document freshness and packet lifecycle when milestones, architecture, contracts, or current identities changed.
9. For generated identities or copied summaries, use an independent recomputation when false agreement would be material.
10. Report any check not run, why it was skipped, and what remains unverified.

Claim completion only after verification.

## Report concisely

Report:

- what changed;
- selected scenario and profile, and why that layering was chosen;
- checks actually run and their results;
- shared files still uncommitted;
- files kept local;
- unresolved candidates, risks, or open questions.

When an external coordinator requested a packet, emit only the bounded project facts it needs and preserve the distinction between reported engineering evidence and decisions owned outside Swift Cycle.
