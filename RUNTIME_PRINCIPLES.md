# NEMT Runtime Principles

## Core Idea

NEMT Runtime is not the strategy, not the capital logic, and not the AI itself.
It is the runtime container that allows data, capital, models, agents, and execution
capabilities to flow in, interact, and remain observable.

The container should stay as empty as possible.
Its value comes from being stable, extensible, and legible under change.

The long-term rule is simple:

> Distance comes from the track, not the engine.

This project should therefore optimize for track quality:

- clear boundaries
- large but coherent domain maps
- consistent internal contracts
- low-friction extension points
- minimal assumptions baked into the shell

## Product Position

NEMT Runtime is a host system.

It is responsible for:

- admitting inputs
- managing runtime state
- orchestrating execution
- isolating components
- exposing observability
- preserving operator control

It is not responsible for:

- declaring one "correct" trading logic
- hardcoding one strategy architecture
- embedding one data provider as the truth
- coupling the UI to one execution path
- forcing AI, backtest, and capital logic into one fixed workflow

## Empty Container Rule

When in doubt, keep the shell empty.

Empty does not mean weak.
Empty means the runtime does not claim ownership over logic that should live in:

- strategy modules
- data connectors
- capital allocators
- risk engines
- execution adapters
- AI agents

The shell should provide structure, not ideology.

## Design Goals

Every meaningful change should improve at least one of these:

1. Composability
   New data, strategy, capital, AI, and execution units can be added without rewriting the shell.

2. Observability
   The operator can inspect what entered the system, what is running, what changed, and why.

3. Isolation
   A failure in one unit should not collapse unrelated parts of the runtime.

4. Replaceability
   Connectors and runtime units should be swappable through contracts, not hardcoded dependencies.

5. Gradual Growth
   The runtime should support richer flows over time without invalidating earlier architecture.

## Development Doctrine

### 1. Build the map before the city

Do not rush to fill screens with behavior.
First define the domain objects, boundaries, and flow directions.

The runtime should grow from a coherent map:

- what enters
- what is configured
- what runs
- what emits signals
- what allocates capital
- what executes orders
- what raises risk
- what gets observed

If the map is vague, features will become local hacks.

### 2. Prefer tracks over patches

A good change creates a reusable path for future work.
A weak change solves only the local symptom.

Prefer:

- shared types over duplicated component-local shapes
- store contracts over scattered local state
- clear entrypoints over ad hoc imports
- runtime interfaces over one-off data transformations

### 3. Protect the shell from business gravity

The top-level app shell must stay light.
Avoid letting `App.tsx` or a small set of container components absorb every new behavior.

The shell should mostly do:

- layout
- routing of views
- high-level orchestration
- modal mounting
- global theme/runtime wiring

The shell should not become the place where domain logic accumulates.

### 4. Keep configuration and runtime separate

Every major domain should distinguish between:

- definition/configuration
- live runtime state
- history/results

Examples:

- strategy definition vs strategy execution runtime
- backtest config vs backtest result
- portfolio rules vs active allocation state
- data source config vs stream health

Mixing these states makes the platform harder to reason about.

### 5. Contracts before adapters

Before integrating a new capability, define the contract it must satisfy.

Typical order:

1. define the type
2. define the store/runtime contract
3. define the UI surface
4. integrate the adapter

Do not let a provider-specific API become the domain model.

## Domain Backbone

The runtime should gradually converge on a stable set of core objects.

These are the preferred backbone entities:

- `ViewId`
- `User`
- `DataSource`
- `Strategy`
- `StrategyRuntime`
- `BacktestConfig`
- `BacktestResult`
- `PortfolioData`
- `AllocationResult`
- `Container`
- `Signal`
- `Order`
- `RiskRule`
- `RiskWarning`
- `Notification`
- `Subscription`

New work should extend this backbone before introducing parallel models.

## State Principles

### Local state is for local UI

Use component state for:

- open/close flags
- temporary form input
- hover/selection state local to one surface

### Shared state is for runtime truth

Use stores for:

- runtime entities
- cross-view state
- selected active objects
- persisted user/runtime preferences
- live operational state

### One truth per concept

Do not maintain multiple competing sources for the same runtime concept.

If `activeView`, `strategies`, or `publishedStrategies` exist in more than one place,
the system will drift.

## Type System Principles

Types are not decoration in this project.
They are the rails.

Rules:

- core domain types live in `src/types`
- component-local types are only for genuinely local view concerns
- avoid redefining the same entity under different names
- do not let provider payloads leak directly into app-wide types
- prefer curated exports over wildcard exports when the type surface grows

When a type starts being shared by multiple modules, it belongs in the domain layer.

## UI Principles

The UI is an operator console, not a marketing site.

It should feel:

- quiet
- intentional
- inspectable
- operational
- modular

The UI should reveal flows, not decorate them.

Prefer views that answer:

- what is connected
- what is configured
- what is running
- what is blocked
- what changed
- what requires intervention

## Extension Principles

Every new feature should answer these questions:

1. What is the unit being introduced?
2. What contract does it satisfy?
3. What enters the runtime through it?
4. What state does it own?
5. What outputs does it emit?
6. How is it observed?
7. How is it replaced later?

If these answers are unclear, the feature is entering too early.

## What To Avoid

Avoid these failure modes:

- giant entry components with mixed concerns
- duplicated domain types across components and stores
- provider-specific logic hardcoded into shared UI
- feature development that starts from screens instead of runtime objects
- mixing mock structures and domain structures without a boundary
- stores that become arbitrary bags of unrelated state
- hidden runtime assumptions encoded only in component logic

## Preferred Near-Term Track

The next stable path for this repository is:

1. Stabilize compile, imports, and type contracts
2. Unify navigation and app shell boundaries
3. Move shared runtime entities into coherent stores
4. Separate config models from runtime models
5. Reduce `App.tsx` to orchestration only
6. Establish runtime entry surfaces:
   data, strategy, capital, container, risk, execution, monitor
7. Introduce adapters behind contracts, not inside views

## Decision Test

Before merging a change, ask:

- Does this make the container heavier or clearer?
- Does this hardcode behavior that should remain pluggable?
- Does this create a reusable path for later work?
- Does this improve the map, or only add content to the map?
- If future AI agents continue from here, will they have better rails?

If the answer to the last question is no, the track is not good enough yet.
