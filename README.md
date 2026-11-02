# Wujie DSH Runtime

Public, out-of-tree runtime bridge between Wujie and the public
[DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It exposes
a versioned JSONL protocol over stdio and composes over
`@deepseek-ai/dsh-base`. It does not require changes to DeepSeek Harness.

> Lineage: adapted from `multica-ai/dsh-multica-runtime` (upstream commit
> `571d7c0`, 0.2.0-private.1). This fork rebrands the package to
> `@wujie-agent/dsh-runtime`, renames the task-token/session-root env keys to
> `WUJIE_TOKEN` / `WUJIE_DSH_SESSION_ROOT`, and sets the persona to Wujie.
> Upstream issue references (`MUL-*`) in the git history and source comments
> point at the original Multica tracker.

## Privacy

- This repository contains only the Wujie integration layer. It does not
  vendor or redistribute DeepSeek Harness source code.
- Never commit API keys, MCP secrets, session logs, or generated profiles.
- DSH telemetry is disabled by the bundle patch.
- stdout is protocol-only; diagnostics go to stderr.

## Install

The recommended path is the Wujie Runtimes page: a dsh whose Wujie runtime
profile is missing shows a one-click install entry that installs this bridge
(prebuilt release below) into `$DSH_HOME/profiles/wujie` and registers the
runtime automatically.

Manual install (operator override or CI):

```bash
dsh plugin --profile wujie add https://github.com/wj-harness/dsh-wujie-runtime/releases/download/v0.2.0-wujie.1/wujie-agent-dsh-runtime-0.2.0-private.1.tgz
```

Other sources also work:

```bash
# prebuilt release tarball (no build scripts needed)
dsh plugin --profile wujie add <release-asset-url>

# local checkout (runs `prepare` → tsc build; allow the build once via
# onlyBuiltDependencies in the profile's pnpm-workspace.yaml)
dsh plugin --profile wujie add git+https://github.com/wj-harness/dsh-wujie-runtime.git#wujie-adaptation
```

The plugin supports:

```bash
dsh --profile wujie --probe
dsh --profile wujie --list-models
dsh --profile wujie --stdio
```

Wujie discovers the profile only after `--probe` returns protocol version 1.
For a non-standard DSH installation, point the daemon at its launcher:

```bash
export WUJIE_DSH_PATH=/absolute/path/to/dsh
```

The runtime contract includes:

- model and thinking-level discovery from DSH itself;
- committed text, reasoning, tool, result, and token-usage events;
- cooperative cancellation and durable session resume;
- canonical Wujie MCP configuration translated to DSH stdio or
  streamable-HTTP clients;
- per-runtime/agent session roots supplied by the Wujie daemon
  (`WUJIE_DSH_SESSION_ROOT`);
- headless one-shot approvals, with no interactive question surface.
- narrowly forwards only Wujie's server-minted `mat_` task token into DSH's
  otherwise credential-scrubbed shell, so in-task `wujie` commands retain
  task attribution without exposing model-provider credentials.

The local `.local/` tree is ignored. It may hold an isolated DSH home and a
development launcher, but neither belongs in source control.

`DEEPSEEK_API_KEY` is read by DSH's credential provider at process runtime
(point it at an OpenAI-compatible gateway with `DEEPSEEK_BASE_URL` when
needed). It must not be stored in this repository.

## Development

```bash
pnpm install
pnpm check
pnpm build
```

Releasing a prebuilt tarball: `pnpm build && pnpm pack`, then attach the
tarball to a GitHub Release and update the pinned default source in the
daemon (`dshDefaultBundleSpec` in `server/internal/daemon/dsh_profile.go`).
