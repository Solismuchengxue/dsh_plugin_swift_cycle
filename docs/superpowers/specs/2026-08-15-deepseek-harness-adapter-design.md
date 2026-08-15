# Swift Cycle DeepSeek Harness Adapter Design

## Status

- Design status: approved for documentation.
- Implementation status: not started.
- Distribution target: GitHub source installation pinned to an exact commit.
- Registry target: none for the first release.
- Remote repository, push, Release, Topic publication, and runtime installation remain separately authorized actions.

## Goal

Package Swift Cycle v1.2.0 as a genuine DeepSeek Harness bundle without changing the canonical Swift Cycle repository or making the adapter a second source of governance behavior.

The first adapter release must:

- install through `dsh plugin --profile <name> add github:...#<commit>`;
- register exactly one `swift-cycle` skill;
- enforce user-only explicit invocation in DeepSeek Harness;
- preserve access to the Simplified Chinese reference;
- work without install-time builds, runtime network access, credentials, or an npm publication;
- record enough upstream identity and hash evidence to reproduce the packaged payload.

## Non-goals

The first release will not:

- publish to npm or another registry;
- modify Swift Cycle v1.2.0 or its existing GitHub Release;
- add DeepSeek-specific workflow rules to the canonical Skill;
- fetch Skill content from GitHub at runtime;
- install itself into a user profile during development;
- create tools, model providers, credentials, network integrations, or project state schemas;
- promise compatibility with untested future DeepSeek Harness versions.

## Repository and package identity

| Concern | Identity |
| --- | --- |
| Local repository | `F:\70_Infrastructure_and_Operations\prompt_engineering\dsh_plugin_swift_cycle` |
| Proposed GitHub repository | `Solismuchengxue/dsh_plugin_swift_cycle` |
| Package name | `dsh-plugin-swift-cycle` |
| Adapter version | `0.1.0` |
| Upstream version | `v1.2.0` |
| Upstream commit | `af3c5ddafba516c304613ea69081118fc234add7` |
| Skill name | `swift-cycle` |

The adapter and upstream versions are independent. Adapter-only fixes increment the adapter version without pretending that Swift Cycle changed. An upstream upgrade requires a new locked snapshot and fresh compatibility evidence.

## Repository layout

```text
dsh_plugin_swift_cycle/
├── AGENTS.md
├── README.md
├── LICENSE
├── package.json
├── cordis.patch.yml
├── index.js
├── upstream.lock.json
├── vendor/
│   └── swift-cycle/
│       ├── SKILL.md
│       ├── agents/
│       │   └── openai.yaml
│       └── references/
│           └── zh-CN.md
├── scripts/
│   └── verify-upstream.mjs
├── tests/
│   └── plugin.test.mjs
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-08-15-deepseek-harness-adapter-design.md
```

The vendored directory is a release artifact copied from the locked upstream tag. Its files are not edited locally. Adapter policy and loading behavior live outside the vendored payload.

## Alternatives considered

### 1. Runtime registration with a locked snapshot — selected

The plugin loads the checked-in upstream Skill body and registers it through `ctx.skills.register()`.

Advantages:

- explicit invocation policy is enforced by the Harness registry;
- no modification to canonical Skill frontmatter;
- no runtime network dependency;
- no custom provider or filesystem watcher;
- a plain JavaScript entrypoint avoids install-time compilation.

Trade-off:

- the adapter carries a versioned copy of the upstream Skill payload and therefore needs a strict promotion and hash-verification procedure.

### 2. Dedicated filesystem provider

The bundle could mount a provider over a packaged Skill directory.

This was rejected for the first release because it adds provider lifecycle, ranking, watcher, and path-resolution concerns without improving the single static Skill use case. It would also require host-specific invocation metadata in the copied Skill or a provider-side policy override.

### 3. Remote provider backed by GitHub

The bundle could retrieve the tagged Skill from GitHub during discovery or loading.

This was rejected because it introduces runtime network availability, remote failure semantics, cache invalidation, supply-chain verification, and potentially mutable resolution into a governance tool that should remain available offline.

## Bundle composition

`package.json` will declare a DeepSeek Harness bundle:

```json
{
  "name": "dsh-plugin-swift-cycle",
  "version": "0.1.0",
  "type": "module",
  "main": "index.js",
  "files": [
    "index.js",
    "cordis.patch.yml",
    "vendor",
    "upstream.lock.json",
    "LICENSE"
  ],
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    }
  }
}
```

The package will contain checked-in JavaScript and static resources. It will not define `prepare`, `postinstall`, or another install-time script.

`cordis.patch.yml` will insert one plugin row:

```yaml
- insert:
    - id: swift-cycle
      name: dsh-plugin-swift-cycle
```

The patch contributes no model, credential, permission, filesystem, or network configuration.

## Runtime registration

The entrypoint will declare `inject = ['skills']` and register one runtime Skill. The registration contract is:

| Field | Value |
| --- | --- |
| `name` | `swift-cycle` |
| `description` | generated from the locked upstream frontmatter |
| `source` | `bundled` |
| `provider` | `dsh-plugin-swift-cycle` |
| `invocation.modelInvocable` | `false` |
| `invocation.userInvocable` | `true` |
| `resourceBase.kind` | `directory` |
| `resourceBase.path` | absolute packaged `vendor/swift-cycle` directory |
| `content` | upstream `SKILL.md` body after its YAML frontmatter |

The plugin will fail during activation if the packaged manifest, Skill delimiters, expected identity, or recorded hash is invalid. It will not silently register a partial or unknown payload.

The adapter intentionally uses the runtime registration rank. Project-local Skills with the same name may override it according to Harness precedence. A user-level same-name filesystem Skill may be shadowed by the plugin registration. Documentation and tests must make this behavior explicit; the plugin must never delete or rewrite another installation.

## Invocation policy

Swift Cycle remains deliberate and manually invoked.

The adapter enforces this at the Harness registration boundary:

```text
modelInvocable = false
userInvocable = true
```

The intended user gesture is `/swift-cycle`. The canonical `agents/openai.yaml` remains part of the upstream snapshot for provenance but is not treated as Harness policy.

## Upstream snapshot and evidence

`upstream.lock.json` will record:

- upstream repository URL;
- upstream tag and commit;
- adapter version;
- relative packaged file paths;
- SHA-256 for every packaged upstream file;
- a deterministic aggregate payload hash;
- the generated registration metadata hash.

`scripts/verify-upstream.mjs` will operate in two modes:

1. Offline verification checks the vendored files against `upstream.lock.json`.
2. Maintainer synchronization compares a separately obtained exact upstream checkout or archive against the proposed snapshot before an upgrade.

The ordinary plugin runtime and user installation path perform no network requests. Updating the snapshot is a maintainer action and does not happen automatically.

After promotion, adapter documentation links to upstream facts instead of independently restating the complete Swift Cycle rules. The vendored payload exists only as a pinned distribution artifact.

## Error handling

Activation fails closed when:

- the upstream lock is missing or malformed;
- the Skill file is absent;
- the Skill name is not `swift-cycle`;
- frontmatter boundaries cannot be identified;
- the payload hash differs from the lock;
- the expected reference is missing;
- the Harness `skills` service is unavailable.

No fallback downloads, automatic repairs, silent partial registration, or mutation of user directories are allowed.

## Verification strategy

### Static and unit checks

- validate `package.json` and `dsh.bundle.patch`;
- verify the patch inserts only the adapter plugin row;
- run the offline upstream hash verifier;
- exercise the entrypoint with a fake `ctx.skills.register()` and capture the registration;
- assert one registration, exact name, provider, resource base, and invocation policy;
- assert the content contains the five v1.2.0 capabilities;
- assert the Chinese reference exists and is reachable from the resource base;
- test malformed and stale snapshots fail closed;
- run `git diff --check` and Markdown link checks.

### Packaging checks

- run `npm pack --dry-run` or the available equivalent;
- inspect the packed file list;
- reject source maps, caches, credentials, local paths, test fixtures, and unrelated repository files;
- unpack to a temporary directory and rerun the offline integrity check.

### Harness compatibility checks

Using an isolated temporary profile and a pinned DeepSeek Harness version or commit:

- install the local checkout or packed artifact;
- inspect `dsh --profile <name> --dump-config`;
- confirm `/swift-cycle` is available;
- confirm the model-facing catalog does not expose Swift Cycle for implicit invocation;
- load the Skill and its Chinese reference;
- uninstall and confirm the registration disappears;
- reinstall and confirm deterministic behavior;
- verify an existing same-name user Skill is preserved even when shadowed;
- perform no real project mutation, credential access, or external model request.

Harness installation, dependency acquisition, and runtime testing require their own authorization because they change the local profile or environment.

## Release and discovery

The first release sequence is intentionally separated:

1. Create and validate the local adapter repository.
2. Commit reviewable implementation increments.
3. Obtain authorization to create `Solismuchengxue/dsh_plugin_swift_cycle`.
4. Push the audited commit without force.
5. Obtain authorization to create adapter tag and GitHub Release `v0.1.0`.
6. Obtain authorization to add GitHub topics, including `dsh-plugin`.
7. Verify appearance on the GitHub Topic page.
8. Obtain separate authorization before installing into any real Harness profile.

Adding a GitHub Topic provides discoverability only. It does not prove package installation, runtime loading, Skill invocation, or compatibility.

## User installation contract

The documented GitHub installation form will pin an immutable adapter commit:

```powershell
dsh plugin --profile web add "github:Solismuchengxue/dsh_plugin_swift_cycle#<adapter-commit>"
```

Users verify the composed profile before starting it:

```powershell
dsh --profile web --dump-config
```

The first release will not advertise an unpinned branch install as the recommended path.

## Documentation ownership

- The canonical Swift Cycle repository owns governance behavior, host-neutral Skill content, and upstream releases.
- The adapter repository owns DeepSeek Harness packaging, explicit invocation enforcement, compatibility evidence, and installation instructions.
- DeepSeek Harness documentation owns bundle, profile, service, and plugin lifecycle semantics.
- The GitHub Topic page is a discovery index, not an authority for compatibility or release identity.

## Acceptance criteria

Implementation is ready for a local release audit only when:

- all static, unit, integrity, packaging, and isolated Harness checks pass;
- the adapter contains no independent governance-rule edits;
- the upstream identity is exact and reproducible;
- installation requires no build script, runtime network request, or credential;
- manual-only invocation is enforced by the registered policy;
- the working tree is clean and commit boundaries are reviewable;
- README statements do not exceed available evidence;
- remote creation, push, Release, Topic, and real installation remain unperformed until individually authorized.
