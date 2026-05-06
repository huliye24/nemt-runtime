# NEMT Product Simplification Execution Plan

## Product Direction

NEMT should become a large-scale strategy research, compute backtesting, AI iteration, and runtime deployment platform. The product boundary grows, but the visible workflow becomes smaller.

The new top-level flow is:

```text
Strategy Lab -> Backtest Compute -> Runtime Desk
```

The platform keeps its existing runtime registry, adapter binding, execution orchestrator, container model, and desktop bridge as infrastructure. Users should not need to think in those internal concepts during normal work.

## Strategy Lab

Purpose: create, improve, compare, publish, and version strategies.

Visible capabilities:

- My strategies
- Discoverable strategy market
- AI rewrite and mutation entry points
- Version lineage and publish flow
- Send selected strategy to large-scale backtest

Internal systems used:

- Strategy definitions
- Strategy runtime metadata
- Strategy market data
- Future AI strategy evolution service

## Backtest Compute

Purpose: turn strategy ideas into statistically meaningful evidence.

Visible capabilities:

- Select strategy
- Select data universe
- Choose local or remote compute
- Run batch backtests and parameter search
- Rank results by stability, risk, drawdown, and return

Internal systems used:

- Backtest engine
- Data market
- Future compute provider registry
- Future distributed task queue

## Runtime Desk

Purpose: operate validated strategies safely.

Visible capabilities:

- Paper execution
- Live adapter connection
- Portfolio and capital allocation
- Risk and health monitoring
- Container/runtime status

Internal systems used:

- Execution orchestrator
- Adapter registry
- Adapter binding store
- Runtime registry
- Container runtime model
- Monitor panel

## Product Reduction Rules

1. The sidebar exposes only the three workbenches.
2. Old modules are not deleted; they become capability panels inside workbenches.
3. Runtime internals remain visible only where they help operators debug.
4. AI-generated strategy changes must become frozen versions before backtest or runtime.
5. Backtest compute becomes the center of research truth, not an optional page.

## Implementation Phases

### Phase 1: Navigation Compression

- Replace old top-level navigation with three workbench entries.
- Keep old view ids as compatibility routes during migration.
- Make default entry `Strategy Lab`.
- Move user-facing titles and descriptions to the three-workbench language.

### Phase 2: Workbench Composition

- `StrategyLab` wraps current strategy market and later AI versioning surfaces.
- `BacktestCompute` wraps current backtest engine and data market.
- `RuntimeDesk` wraps current execution, portfolio, monitor, and container views.

### Phase 3: Compute Boundary Expansion

- Add compute provider contracts.
- Add local compute provider first.
- Add remote compute provider shape for CPU/GPU clusters.
- Add batch run manifests and result ranking contracts.

### Phase 4: AI Strategy Evolution

- Add strategy version lineage.
- Add mutation proposal records.
- Add AI-generated patch review state.
- Add freeze-and-backtest pipeline.

### Phase 5: Runtime Hardening

- Promote adapter provider descriptors.
- Add adapter health probes.
- Add full order lifecycle records.
- Link runtime metrics to execution fills and positions.

## Success Criteria

- A new user sees three clear choices instead of many isolated tools.
- A strategy can move from lab to compute to runtime without context loss.
- Large backtests and AI iteration are first-class concepts.
- Runtime infrastructure remains powerful without becoming the user's main mental model.
