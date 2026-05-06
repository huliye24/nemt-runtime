# NEMT Runtime Architecture

## Purpose

This document turns the runtime principles into an executable architecture map.

NEMT Runtime is a host system for quantitative trading capabilities.
It should remain a light shell that admits inputs, manages runtime state,
coordinates execution, and exposes observation surfaces.

The architecture must support growth without forcing all future work through
one feature path or one provider model.

## Layer Model

The runtime is organized into six layers.

### 1. Ingress

Ingress is where capabilities enter the runtime.

Examples:

- data providers
- strategy code
- capital sources
- AI agents
- execution adapters
- risk policies

Ingress objects should describe how the runtime receives capability, not how
the capability internally works.

### 2. Definition

Definition models describe what something is.
They are persistent, editable, and portable.

Examples:

- `StrategyDefinition`
- `PortfolioDefinition`
- `ContainerSpec`
- `RiskPolicy`
- `DataSourceConfig`

Definition models should not contain live runtime state.

### 3. Runtime

Runtime models describe what is happening now.

Examples:

- `StrategyRuntime`
- `ContainerRuntime`
- `CapitalRuntime`
- `DataStreamRuntime`
- `AgentRuntime`

Runtime objects are operational truth and should be the main source for live UI.

### 4. Flow

Flow is how the runtime moves information.

Examples:

- signals
- order intents
- risk triggers
- allocation changes
- runtime lifecycle events

This layer should gradually converge into a timeline-oriented event model.

### 5. Execution

Execution is where runtime intent becomes external action.

Examples:

- broker adapters
- exchange adapters
- order routers
- position synchronizers

The runtime should speak to execution through contracts, not provider-shaped UI code.

### 6. Observation

Observation is how operators understand the system.

Examples:

- logs
- metrics
- alerts
- audit history
- runtime surfaces in the UI

Observation must be able to explain both current state and how that state was reached.

## Cross-Cutting Layer: Governance

Governance constrains and protects every other layer.

Examples:

- permissions
- quotas
- isolation
- versioning
- recovery
- rollback

Governance should not be treated as a late-stage add-on.

## Current Repository Mapping

Today the repository mostly covers these areas:

- UI surfaces: present
- definition models: present but uneven
- runtime state: partial
- flow/event model: weak
- execution adapters: minimal
- observation system: partial
- governance: mostly absent

That means the next meaningful work should deepen the center of the map,
not just add more screens.

## Near-Term Structural Priorities

### Priority 1: Split definition from runtime

The following concepts should become explicitly two-part:

- strategy
- portfolio
- container
- data source

Target pattern:

- `XDefinition` or `XSpec`
- `XRuntime`

### Priority 2: Introduce a runtime registry

The runtime needs a single place to answer:

- what definitions exist
- what runtime instances exist
- how they are linked
- what state each instance is in

This does not need a heavy framework.
It does need a stable domain contract.

### Priority 3: Introduce a timeline model

The system should eventually explain itself through ordered events:

- created
- started
- connected
- emitted signal
- submitted order
- triggered risk
- stopped
- failed

This timeline becomes the backbone for monitor, audit, AI analysis, and recovery.

### Priority 4: Reduce shell gravity

`App.tsx` should not remain the place where all domain flows meet directly.

The shell should be split into:

- shell/layout
- view routing
- modal mounting
- runtime wiring

This keeps the host light and prevents feature accumulation at the root.

## UI Surface Model

Views should gradually align to runtime surfaces instead of feature islands.

Preferred surfaces:

- Strategies: definition management
- Runtime: live strategy and agent activity
- Data: ingress and stream health
- Capital: allocation and portfolio control
- Containers: runtime hosts
- Risk: policy and warning surfaces
- Monitor: global observation
- Settings: runtime and connector configuration

## Contract Rules

Before integrating a new capability:

1. define its type
2. define its definition/runtime boundary
3. define how it enters the runtime
4. define its runtime outputs
5. define how it is observed

If a feature cannot answer those questions, it is entering too early.

## Repository Direction

The next stable code path for this repository is:

1. keep compile and type contracts clean
2. continue reducing app-shell coupling
3. establish definition/runtime pairs
4. create a runtime registry
5. introduce a timeline/event model
6. migrate pages to runtime surfaces
7. attach adapters through contracts

This is the track that increases future distance.
