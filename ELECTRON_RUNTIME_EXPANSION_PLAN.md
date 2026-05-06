# NEMT Runtime Electron Expansion Execution Plan

## 0. Document Purpose

This document is the execution plan for expanding NEMT Runtime from a React-first quantitative trading console into a richer Electron desktop runtime platform.

The current product already has strong domain direction around strategy definitions, strategy runtimes, container runtimes, runtime registry, orchestrators, and store-backed UI state. The next expansion should not add random UI features. The next expansion should give the software a larger boundary: a desktop host process, a secure preload layer, typed IPC contracts, local runtime process management, diagnostics, logs, configuration, and a path toward real Python/Go strategy execution.

The goal is to make Electron the local operating layer of NEMT Runtime. React remains the command center. Zustand remains the renderer-side state cache. The new Electron layer becomes the bridge between UI intent and local machine capability.

This document is intentionally long and specific. It is written so the next implementation pass can follow it section by section without rediscovering the architecture.

## 1. Current State Assessment

### 1.1 What Exists Today

The current repository has:

- React 18 and TypeScript renderer code under `src/`.
- Vite frontend build.
- Zustand stores for strategy, container, runtime registry, UI, portfolios, and backtests.
- A first layer of runtime domain modeling:
  - `src/types/container/`
  - `src/types/strategy/`
  - `src/runtime/registry/`
  - `src/stores/runtime/`
  - `src/bootstrap/runtimeBootstrap.ts`
  - `src/orchestrators/containerOrchestrator.ts`
- Electron-related package metadata:
  - `package.json` has `"main": "dist/desktop/main/index.js"`.
  - `package.json` has scripts for `dev:desktop`, `build:desktop`, and packaging.
  - `electron-builder.yml` exists.
  - `tsconfig.electron.json` exists but points to an older `electron/main.ts` and `electron/preload.ts` structure.
- A renderer hook:
  - `src/hooks/useElectron.ts`
  - It assumes `window.electron` exists and exposes gateway, window, app, menu, and system APIs.

### 1.2 What Is Missing

The current repo does not yet have a complete Electron runtime structure:

- No stable `src/desktop/main/index.ts` entrypoint has been confirmed in the current working structure.
- No `src/desktop/preload/index.ts` was found by WebStorm index search.
- No typed IPC channel registry exists.
- No Electron main-process service layer exists.
- No runtime process manager exists.
- No contract package separates renderer intent from desktop implementation.
- No runtime bridge abstracts browser mock mode from Electron mode.
- No local Python/Go runtime-core is wired into Electron.
- No diagnostics center exists for local runtime health.

### 1.3 Existing Architectural Momentum

Recent work has already moved the product in the correct direction:

- Container runtime state is no longer a flat UI object.
- Strategy runtime state has separated definition from runtime.
- Runtime registry exists as an index layer.
- Root `App.tsx` has started to shrink.
- Bootstrap and container orchestration are now separate modules.

The Electron expansion must continue this same pattern:

- Separate contracts from implementation.
- Separate renderer state from runtime execution.
- Keep compatibility where useful.
- Avoid large root components.
- Make orchestration explicit.
- Make local process capability observable.

## 2. Target Product Boundary

### 2.1 From Frontend Console To Desktop Runtime

The target product should be understood as:

```text
NEMT Runtime Desktop
  Renderer command center
  Electron desktop host
  Local runtime process manager
  Python strategy runtime
  Go market data collector
  Typed event and registry bus
  Diagnostics and recovery layer
```

The frontend remains important, but it is no longer the whole software. Electron becomes the process boundary that owns local machine effects.

### 2.2 Responsibility Split

The target split should be:

```text
renderer/src
  Views, components, UI state, local orchestration calls

src/contracts
  Shared type contracts for IPC, runtime events, commands, diagnostics

src/services/runtimeBridge
  Renderer-side bridge interface
  Browser mock implementation
  Electron implementation through preload API

src/desktop/main
  Electron app lifecycle
  BrowserWindow creation
  Security defaults
  Menu and tray hooks

src/desktop/preload
  Safe contextBridge API
  No raw ipcRenderer exposure

src/desktop/ipc
  Channel names
  IPC handler registration
  Request/response validation
  Event subscription bridge

src/desktop/services
  App config
  Logs
  File system access
  Runtime process management
  Diagnostics

runtime-core
  Python and Go runtime programs
  Strategy execution
  Market data collection
  Event generation
```

### 2.3 Guiding Principle

Renderer code may request things. Electron code may do things.

This sentence should guide all future architecture decisions. A React component should not know how to spawn a Python process. A Zustand store should not know where logs are stored. A renderer service should not receive `ipcRenderer` directly. Electron main should not import React stores.

## 3. New Directory Structure

### 3.1 Proposed Top-Level Additions

```text
src/
  contracts/
  desktop/
  services/
    runtimeBridge/
runtime-core/
  python/
  go/
  schemas/
docs/
  architecture/
  execution/
```

The current repository has no root `docs/` directory. Creating one is optional. Since several historical branch folders already contain documents, the current root should gain a clean documentation lane for active architecture. This current document can remain at root for discoverability or later move into `docs/execution/`.

### 3.2 Electron Directory

```text
src/desktop/
  main/
    index.ts
    createMainWindow.ts
    appLifecycle.ts
    menu.ts
    security.ts
    protocol.ts
  preload/
    index.ts
    exposeElectronApi.ts
  ipc/
    channels.ts
    registerIpcHandlers.ts
    appHandlers.ts
    windowHandlers.ts
    runtimeHandlers.ts
    diagnosticsHandlers.ts
    fileHandlers.ts
  services/
    appConfigService.ts
    diagnosticsService.ts
    fileSystemService.ts
    logService.ts
    processService.ts
    runtimeProcessService.ts
    runtimeEventService.ts
  types/
    desktopContext.ts
    processTypes.ts
```

### 3.3 Contracts Directory

```text
src/contracts/
  electron/
    appContract.ts
    windowContract.ts
    menuContract.ts
    systemContract.ts
    diagnosticsContract.ts
    runtimeContract.ts
    containerContract.ts
    strategyContract.ts
    index.ts
  runtime/
    runtimeCommand.ts
    runtimeEvent.ts
    runtimeHealth.ts
    runtimeRegistrySnapshot.ts
    index.ts
  index.ts
```

Contracts must be importable by renderer and desktop code. They should contain types, constants, channel names, request shapes, response shapes, and event payload shapes. They should not import Electron, React, Zustand, or Node-only modules.

### 3.4 Runtime Bridge Directory

```text
src/services/runtimeBridge/
  runtimeBridgeTypes.ts
  runtimeBridgeClient.ts
  electronRuntimeBridge.ts
  browserRuntimeBridge.ts
  index.ts
```

This lets renderer code call one stable bridge while implementation differs by environment.

### 3.5 Runtime Core Directory

```text
runtime-core/
  python/
    pyproject.toml
    nemt_runtime/
      __init__.py
      cli.py
      contracts.py
      event_bus.py
      strategy_loader.py
      strategy_process.py
      risk_guard.py
      backtest_runner.py
      health.py
  go/
    collector/
      go.mod
      main.go
      marketdata/
      events/
      health/
  schemas/
    container-runtime.schema.json
    strategy-runtime.schema.json
    runtime-command.schema.json
    runtime-event.schema.json
```

Runtime core should start small. The first version only needs health, process lifecycle, command input, and event output.

## 4. Build Configuration Plan

### 4.1 Package Scripts

Current scripts:

```json
{
  "dev": "concurrently \"npm run dev:web\" \"npm run dev:desktop\"",
  "dev:web": "vite",
  "dev:desktop": "npm run build:desktop && electron .",
  "build": "npm run build:web && npm run build:desktop",
  "build:web": "tsc && vite build",
  "build:desktop": "tsc -p src/desktop/tsconfig.json",
  "package": "npm run build && electron-builder"
}
```

The intended direction is mostly right. The plan is to standardize `src/desktop/tsconfig.json` and stop relying on the root `tsconfig.electron.json` unless it is updated or removed.

### 4.2 Required Build Outputs

Build output should be:

```text
dist/
  index.html
  assets/
  desktop/
    main/
      index.js
    preload/
      index.js
```

Electron `main` should point to:

```text
dist/desktop/main/index.js
```

The BrowserWindow preload should point to:

```text
dist/desktop/preload/index.js
```

### 4.3 Desktop TypeScript Config

Create or normalize:

```text
src/desktop/tsconfig.json
```

It should:

- Use `CommonJS` if Electron main is currently loaded by `electron .`.
- Use `ES2020` or newer target.
- Include `main`, `preload`, `ipc`, `services`, and `types`.
- Output to `dist/desktop`.
- Resolve `@/contracts` if aliases are used.

First implementation should prefer relative imports in desktop code unless alias configuration is already reliable for both TypeScript and runtime output.

### 4.4 Electron Builder

`electron-builder.yml` currently contains a copyright mojibake:

```text
copyright: Copyright 漏 2026 NEMT Lab
```

This should become:

```text
copyright: Copyright © 2026 NEMT Lab
```

Since the file already uses non-ASCII through this copyright symbol intention, using `©` is acceptable.

Extra resources should evolve:

```yaml
extraResources:
  - from: runtime-core
    to: runtime-core
    filter:
      - "**/*"
```

If `src/nemt-os` remains required, keep it. Do not remove existing extra resources until verified.

## 5. Electron Main Process Plan

### 5.1 `main/index.ts`

Responsibilities:

- Enforce single instance lock.
- Initialize logging.
- Initialize app config.
- Register IPC handlers.
- Create the main window when ready.
- Handle macOS activate behavior.
- Shutdown runtime processes before quit.

Pseudo shape:

```ts
import { app } from 'electron';
import { createMainWindow } from './createMainWindow';
import { registerIpcHandlers } from '../ipc/registerIpcHandlers';
import { createDesktopContext } from './desktopContext';

const context = createDesktopContext();

const hasLock = app.requestSingleInstanceLock();
if (!hasLock) {
  app.quit();
}

app.whenReady().then(async () => {
  registerIpcHandlers(context);
  await createMainWindow(context);
});

app.on('before-quit', async () => {
  await context.runtimeProcessService.stopAll();
});
```

### 5.2 `createMainWindow.ts`

Responsibilities:

- Create BrowserWindow.
- Set secure `webPreferences`.
- Load Vite dev URL in development.
- Load `dist/index.html` in production.
- Open devtools only in development.
- Wire second-instance focus behavior.

Security defaults:

```ts
webPreferences: {
  preload,
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: false,
}
```

`sandbox: false` may be necessary if preload needs Node APIs. The renderer itself must still not receive Node access.

### 5.3 `security.ts`

Responsibilities:

- Deny unexpected window opens.
- Validate external URLs before opening.
- Prevent navigation to untrusted origins.
- Set permission request handler.

Electron security should be treated as part of product architecture, not as a later polish step.

### 5.4 `menu.ts`

Responsibilities:

- Build application menu.
- Emit menu commands through IPC events:
  - New simulation
  - Save
  - Run simulation
  - Stop simulation
  - Settings
  - Export
  - Open docs

Menu events should match contracts used by `useElectron.ts`, but the old hook should eventually consume the new contract types.

## 6. Preload Plan

### 6.1 Why Preload Matters

The preload layer is the security membrane between renderer and main process. It should expose a typed, narrow API through `contextBridge`. It should not leak `ipcRenderer`.

Current renderer hook expects:

```ts
window.electron.gateway
window.electron.window
window.electron.app
window.electron.menu
window.electron.system
```

We can preserve that shape initially for compatibility while changing the implementation behind it.

### 6.2 `preload/index.ts`

Responsibilities:

- Import `contextBridge`.
- Import safe API builder.
- Expose `window.electron`.

Pseudo shape:

```ts
import { contextBridge } from 'electron';
import { createElectronApi } from './exposeElectronApi';

contextBridge.exposeInMainWorld('electron', createElectronApi());
```

### 6.3 `exposeElectronApi.ts`

Responsibilities:

- Build typed methods using `ipcRenderer.invoke`.
- Register menu event listeners safely.
- Return unsubscribe functions.
- Validate inputs before sending where reasonable.

The initial API should include:

- `app.getVersion`
- `app.getPlatform`
- `window.minimize`
- `window.maximize`
- `window.close`
- `window.isMaximized`
- `runtime.health`
- `runtime.list`
- `runtime.startStrategy`
- `runtime.stopStrategy`
- `runtime.getRegistrySnapshot`
- `runtime.onEvent`
- `system.openExternal`

The legacy `gateway` API can remain as a compatibility alias during migration.

## 7. IPC Contract Plan

### 7.1 Channel Naming

Use explicit channel names:

```ts
export const IpcChannels = {
  AppGetVersion: 'app:get-version',
  AppGetPlatform: 'app:get-platform',
  WindowMinimize: 'window:minimize',
  WindowMaximize: 'window:maximize',
  WindowClose: 'window:close',
  WindowIsMaximized: 'window:is-maximized',
  RuntimeHealth: 'runtime:health',
  RuntimeList: 'runtime:list',
  RuntimeStartStrategy: 'runtime:start-strategy',
  RuntimeStopStrategy: 'runtime:stop-strategy',
  RuntimeGetRegistrySnapshot: 'runtime:get-registry-snapshot',
  RuntimeEvent: 'runtime:event',
  DiagnosticsGetSystemStatus: 'diagnostics:get-system-status',
} as const;
```

### 7.2 Request/Response Shape

All IPC invoke responses should use a consistent envelope:

```ts
export interface IpcSuccess<T> {
  ok: true;
  data: T;
}

export interface IpcFailure {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type IpcResult<T> = IpcSuccess<T> | IpcFailure;
```

This makes renderer error handling predictable.

### 7.3 Runtime Commands

Define:

```ts
export interface StartStrategyRuntimeRequest {
  strategyDefinitionId: string;
  strategyName: string;
  code: string;
  symbols: string[];
  containerRuntimeId?: string;
}

export interface StartStrategyRuntimeResponse {
  runtimeId: string;
  processId?: number;
  status: 'starting' | 'running';
  startedAt: number;
}
```

Define:

```ts
export interface StopStrategyRuntimeRequest {
  runtimeId: string;
  reason?: string;
}
```

### 7.4 Runtime Events

Define:

```ts
export type RuntimeEventType =
  | 'runtime.started'
  | 'runtime.heartbeat'
  | 'runtime.output'
  | 'runtime.error'
  | 'runtime.stopped'
  | 'registry.updated';

export interface RuntimeEvent {
  id: string;
  type: RuntimeEventType;
  runtimeId: string;
  occurredAt: number;
  payload: unknown;
}
```

Later, payload can be narrowed per event type. First version can use `unknown` in the shared contract while services validate known shapes internally.

## 8. Renderer Runtime Bridge Plan

### 8.1 Motivation

Renderer code should not call `window.electron` from many places. That creates coupling and makes browser development harder. A runtime bridge centralizes environment choice.

### 8.2 Bridge Interface

Create:

```text
src/services/runtimeBridge/runtimeBridgeTypes.ts
```

It should define:

```ts
export interface RuntimeBridge {
  health: () => Promise<RuntimeHealth>;
  startStrategyRuntime: (request: StartStrategyRuntimeRequest) => Promise<StartStrategyRuntimeResponse>;
  stopStrategyRuntime: (request: StopStrategyRuntimeRequest) => Promise<void>;
  getRegistrySnapshot: () => Promise<RuntimeRegistrySnapshot>;
  subscribeRuntimeEvents: (handler: RuntimeEventHandler) => () => void;
}
```

### 8.3 Browser Implementation

`browserRuntimeBridge.ts` should:

- Return healthy mock status.
- Simulate start/stop responses.
- Emit no real process events.
- Support current Vite browser development.

### 8.4 Electron Implementation

`electronRuntimeBridge.ts` should:

- Use `window.electron.runtime`.
- Convert IPC result envelopes into typed success or thrown `Error`.
- Subscribe to runtime events from preload.

### 8.5 Bridge Client

`runtimeBridgeClient.ts` should choose implementation:

```ts
export function getRuntimeBridge(): RuntimeBridge {
  if (typeof window !== 'undefined' && window.electron?.runtime) {
    return electronRuntimeBridge;
  }

  return browserRuntimeBridge;
}
```

## 9. Strategy Orchestrator Plan

### 9.1 Current Problem

`App.tsx` still contains strategy execution startup logic. It creates or updates `StrategyRuntime`, writes registry entries, updates strategy definition metadata, updates local UI strategy status, and changes active view.

This is better than before, but still too much responsibility for the root component.

### 9.2 Target File

Create:

```text
src/orchestrators/strategyOrchestrator.ts
```

### 9.3 Responsibilities

The strategy orchestrator should:

- Accept a strategy and local strategies update callback where needed.
- Ensure a `StrategyDefinition` exists or is updated.
- Call `runtimeBridge.startStrategyRuntime`.
- Upsert renderer `StrategyRuntime`.
- Upsert runtime registry entry.
- Return a result that the UI can use to navigate.

### 9.4 First Version API

```ts
export interface StartStrategyExecutionParams {
  strategy: StrategyData;
  setStrategies: React.Dispatch<React.SetStateAction<StrategyData[]>>;
}

export interface StartStrategyExecutionResult {
  runtimeId: string;
  status: 'running' | 'starting';
}

export async function startStrategyExecution(
  params: StartStrategyExecutionParams,
): Promise<StartStrategyExecutionResult>
```

Using React dispatch in an orchestrator is not ideal long term, but acceptable for a compatibility migration. Later, strategy list should also move into a store.

### 9.5 Integration

`App.tsx` should shrink to:

```ts
const handleStartExecution = async (strategy: StrategyData) => {
  await startStrategyExecution({ strategy, setStrategies });
  setActiveView('execution');
};
```

This continues the root component reduction already started.

## 10. Desktop Services Plan

### 10.1 `appConfigService.ts`

Responsibilities:

- Store user settings through `electron-store`.
- Track workspace path.
- Track runtime-core path.
- Track Python executable path.
- Track Go collector path.
- Track logging level.

Initial config:

```ts
export interface AppConfig {
  workspacePath: string;
  runtimeCorePath: string;
  pythonExecutablePath?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  autoStartRuntimeServices: boolean;
}
```

### 10.2 `logService.ts`

Responsibilities:

- Wrap `electron-log`.
- Provide category logs:
  - app
  - ipc
  - runtime
  - strategy
  - diagnostics
- Expose log file path through diagnostics.

### 10.3 `processService.ts`

Responsibilities:

- Spawn child processes safely.
- Capture stdout.
- Capture stderr.
- Track process exit.
- Kill process by id.
- Kill all owned processes during shutdown.

Use Node `child_process.spawn`, not shell strings, for runtime processes.

### 10.4 `runtimeProcessService.ts`

Responsibilities:

- Start Python strategy runtime.
- Stop runtime.
- Maintain runtimeId to process mapping.
- Convert process output into runtime events.
- Report health.

Initial internal state:

```ts
interface ManagedRuntimeProcess {
  runtimeId: string;
  strategyDefinitionId?: string;
  processId?: number;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'failed';
  startedAt: number;
  lastHeartbeatAt?: number;
}
```

### 10.5 `runtimeEventService.ts`

Responsibilities:

- Create runtime events.
- Keep short in-memory event history.
- Broadcast events to renderer windows.
- Provide registry snapshots.

The event service is the first step toward a local event bus.

### 10.6 `diagnosticsService.ts`

Responsibilities:

- Report Electron version.
- Report Node version.
- Report platform.
- Report app path.
- Report userData path.
- Report runtime-core path existence.
- Report Python availability.
- Report active runtime processes.
- Report recent runtime errors.

## 11. Runtime Core Python Plan

### 11.1 Purpose

Python is the natural first runtime for strategy code because current strategy examples are Python. The first Python runtime should not attempt full trading execution. It should provide a small, controlled process that Electron can start, monitor, and stop.

### 11.2 First Python CLI

Create:

```text
runtime-core/python/nemt_runtime/cli.py
```

Commands:

```text
python -m nemt_runtime.cli health
python -m nemt_runtime.cli run-strategy --runtime-id ... --strategy-file ...
```

### 11.3 Event Protocol

Python should write newline-delimited JSON to stdout:

```json
{"type":"runtime.started","runtimeId":"...","occurredAt":1710000000000,"payload":{}}
{"type":"runtime.heartbeat","runtimeId":"...","occurredAt":1710000001000,"payload":{"uptimeSeconds":1}}
```

Electron parses stdout line by line and emits events to renderer.

### 11.4 Strategy Loading

First version:

- Write strategy code to a temp file under app user data.
- Start Python runtime with that file path.
- Import or execute in a restricted wrapper.
- Do not provide real broker access.
- Do not provide file system access beyond controlled temp paths.

This should be treated as a simulation sandbox, not production-grade security. True sandboxing requires a later container or isolated process model.

### 11.5 Risk Guard

First version risk guard can be simple:

- Max runtime memory cannot be directly enforced by pure Python process manager on all platforms.
- Max process lifetime can be enforced by Electron.
- Event frequency can be throttled.
- Strategy output can be size-limited.

The plan should not overpromise hard sandbox isolation in phase one.

## 12. Runtime Core Go Plan

### 12.1 Purpose

Go is useful for market data collection, streaming, and high-throughput event services. It should not be first in the critical path unless Python runtime startup is already stable.

### 12.2 First Go Collector

Create:

```text
runtime-core/go/collector/
```

Commands:

```text
collector.exe health
collector.exe stream --symbols BTC/USDT,ETH/USDT
```

### 12.3 Event Output

Go collector should also use newline-delimited JSON events. This keeps Electron process parsing unified.

### 12.4 Integration Stage

Do not wire Go collector into UI first. Wire it into diagnostics and process manager first:

- Can Electron find collector binary?
- Can Electron start it?
- Can Electron read heartbeat?
- Can Electron stop it?

After that, connect it to data market or monitor UI.

## 13. Runtime Registry Integration

### 13.1 Current Registry Role

The current runtime registry is a renderer-side index. It can register container runtimes and strategy runtimes. That should remain.

### 13.2 Future Registry Role

The registry should become a merged view:

```text
Renderer optimistic state
Electron process state
Runtime-core events
```

The registry should not become a database. It should remain an index and observation layer.

### 13.3 Event Flow

Target flow:

```text
User clicks Start Strategy
  -> strategyOrchestrator
    -> runtimeBridge.startStrategyRuntime
      -> preload
        -> IPC runtime:start-strategy
          -> runtimeProcessService
            -> Python process starts
              -> stdout event
                -> runtimeEventService
                  -> BrowserWindow sends runtime:event
                    -> renderer store updates
                    -> registry store updates
```

### 13.4 Store Sync

Renderer should add a runtime event subscriber:

```text
src/bootstrap/runtimeEventBootstrap.ts
```

Responsibilities:

- Subscribe to runtimeBridge events.
- Update strategy runtime store.
- Update container observation store.
- Update runtime registry store.
- Append event IDs.

This keeps event ingestion out of React components.

## 14. Diagnostics UI Plan

### 14.1 Why Diagnostics Matters

Desktop runtime software needs observability. Without diagnostics, users cannot tell whether a strategy failed because of UI state, Electron IPC, Python runtime, missing executable, permissions, or malformed strategy code.

### 14.2 New View

Add or enrich an existing monitor/settings page:

```text
System Diagnostics
Runtime Health
Process Table
Recent Events
Log Paths
Configuration
```

### 14.3 Data Source

Renderer calls:

```ts
runtimeBridge.health()
window.electron.diagnostics.getSystemStatus()
runtimeBridge.getRegistrySnapshot()
```

### 14.4 Status Cards

Use existing visual design system and `Colors` presets.

Cards should show:

- Electron available
- IPC available
- Runtime bridge mode
- Python runtime available
- Active strategy processes
- Registry entry count
- Recent error count

### 14.5 Logs

Expose:

- Open log directory
- Copy diagnostic summary
- Export runtime events

These actions go through preload and desktop services.

## 15. Security Plan

### 15.1 Renderer Security

Renderer must not receive:

- `ipcRenderer`
- Node `fs`
- Node `child_process`
- Unvalidated file system paths
- Arbitrary shell execution

### 15.2 Main Process Security

Main process must:

- Validate IPC payloads.
- Never execute user strings as shell commands.
- Use `spawn(command, args)` with controlled command paths.
- Restrict file reads/writes to workspace, userData, and configured runtime paths.
- Sanitize external URLs before opening.

### 15.3 Strategy Code Security

Phase one strategy execution is not a strong sandbox. The UI and docs should not claim otherwise.

Practical phase one constraints:

- Start only local Python process.
- No broker credentials.
- No arbitrary file mount.
- Temp strategy file cleanup.
- Process timeout.
- Output limits.

Future hardening:

- Run strategy inside container.
- Use restricted Python environment.
- Add broker permission envelope.
- Add capital access policy enforcement.

## 16. Error Handling Plan

### 16.1 Error Taxonomy

Define desktop error codes:

```text
APP_CONFIG_READ_FAILED
APP_CONFIG_WRITE_FAILED
IPC_INVALID_PAYLOAD
RUNTIME_CORE_NOT_FOUND
PYTHON_NOT_FOUND
RUNTIME_PROCESS_START_FAILED
RUNTIME_PROCESS_EXITED
RUNTIME_EVENT_PARSE_FAILED
DIAGNOSTICS_FAILED
```

### 16.2 IPC Errors

All handler failures return `IpcFailure`. Preload converts failures to rejected promises or typed result objects depending on API style.

### 16.3 Renderer Errors

Renderer orchestrators should:

- Catch bridge errors.
- Update runtime status to failed when appropriate.
- Add registry event for failure.
- Show user-readable error in diagnostics or toast layer.

Do not swallow errors in orchestrators.

## 17. Testing Plan

### 17.1 Type Checks

Required after each implementation batch:

```text
npm.cmd run typecheck
npm run build:desktop
```

Use `npm.cmd` in PowerShell if script execution policy blocks plain `npm`.

### 17.2 Desktop Unit Tests

If a test framework is added later, first tests should cover:

- IPC result envelope helpers.
- Runtime event parser.
- Process service command construction.
- Config service defaults.

Do not add a large test framework before the first Electron skeleton compiles unless needed.

### 17.3 Manual Electron Smoke Test

After skeleton:

- Start Vite.
- Start Electron.
- Confirm window opens.
- Confirm `window.electron.app.getVersion()` works.
- Confirm window controls work.
- Confirm diagnostics returns data.

### 17.4 Runtime Smoke Test

After Python runtime:

- Start a demo strategy.
- Confirm process appears in diagnostics.
- Confirm heartbeat events arrive.
- Confirm stop action kills process.
- Confirm registry updates.

## 18. Phase Execution Roadmap

### Phase 1: Electron Skeleton

Deliverables:

- `src/desktop/main/index.ts`
- `src/desktop/main/createMainWindow.ts`
- `src/desktop/preload/index.ts`
- `src/desktop/preload/exposeElectronApi.ts`
- `src/desktop/ipc/channels.ts`
- `src/desktop/ipc/registerIpcHandlers.ts`
- App, window, system handlers
- Desktop tsconfig alignment

Acceptance:

- `npm.cmd run typecheck` passes.
- `npm run build:desktop` passes.
- Electron can launch a window.
- Renderer sees `window.electron`.

### Phase 2: Contracts And Runtime Bridge

Deliverables:

- `src/contracts/electron/*`
- `src/contracts/runtime/*`
- `src/services/runtimeBridge/*`
- `useElectron.ts` migrated to contract imports.

Acceptance:

- Browser mode still works.
- Electron mode uses bridge.
- No raw IPC access in renderer.

### Phase 3: Strategy Orchestrator Extraction

Deliverables:

- `src/orchestrators/strategyOrchestrator.ts`
- `App.tsx` start execution logic reduced.
- Runtime bridge called from orchestrator.

Acceptance:

- Starting strategy still updates UI.
- Registry still receives strategy runtime entry.
- Browser bridge preserves current behavior.

### Phase 4: Desktop Runtime Services

Deliverables:

- Config service
- Log service
- Diagnostics service
- Process service
- Runtime process service
- Runtime event service

Acceptance:

- Diagnostics IPC returns real desktop status.
- Process service can run a harmless command in controlled tests.
- Runtime event service can broadcast mock events.

### Phase 5: Python Runtime Core

Deliverables:

- `runtime-core/python/nemt_runtime/cli.py`
- Health command
- Run strategy command
- Heartbeat event output
- Electron service starts Python process.

Acceptance:

- Electron starts runtime-core health check.
- Electron starts a demo strategy process.
- Heartbeat events reach renderer.
- Stop command works.

### Phase 6: Registry Event Ingestion

Deliverables:

- `src/bootstrap/runtimeEventBootstrap.ts`
- Store sync from runtime events.
- Diagnostics event table.

Acceptance:

- Runtime process events update stores.
- Registry snapshot matches visible runtime state.
- Errors are observable.

### Phase 7: Go Collector Skeleton

Deliverables:

- `runtime-core/go/collector`
- Health command
- Mock stream command
- Electron process service support.

Acceptance:

- Diagnostics can start/stop collector.
- Collector heartbeat events are parsed.

### Phase 8: Packaging

Deliverables:

- `electron-builder.yml` includes runtime-core resources.
- Production preload path works.
- App launches from packaged build.

Acceptance:

- `npm run package:win` succeeds.
- Installed app can open.
- Diagnostics finds bundled runtime-core.

## 19. Detailed First Implementation Batch

### 19.1 Files To Add First

```text
src/contracts/electron/ipcResult.ts
src/contracts/electron/ipcChannels.ts
src/contracts/electron/appContract.ts
src/contracts/electron/windowContract.ts
src/contracts/electron/runtimeContract.ts
src/contracts/electron/diagnosticsContract.ts
src/contracts/electron/index.ts
src/desktop/main/index.ts
src/desktop/main/createMainWindow.ts
src/desktop/main/security.ts
src/desktop/preload/index.ts
src/desktop/preload/exposeElectronApi.ts
src/desktop/ipc/registerIpcHandlers.ts
src/desktop/ipc/appHandlers.ts
src/desktop/ipc/windowHandlers.ts
src/desktop/ipc/diagnosticsHandlers.ts
src/desktop/ipc/runtimeHandlers.ts
src/desktop/services/diagnosticsService.ts
src/desktop/types/desktopContext.ts
src/desktop/tsconfig.json
```

### 19.2 Files To Modify First

```text
package.json
electron-builder.yml
src/hooks/useElectron.ts
```

### 19.3 First Batch Non-Goals

Do not implement full Python strategy execution in the first batch.

Do not redesign UI.

Do not remove old compatibility APIs.

Do not change portfolio or market strategy flows.

Do not move all stores.

### 19.4 First Batch Expected Shape

The first batch should make Electron real but minimal. The app should compile and launch. IPC should work. Diagnostics should return basic status. Runtime health can return a placeholder saying browser mock or desktop runtime service is not yet connected.

## 20. Implementation Rules

### 20.1 TypeScript Rules

- No `any`.
- Use `unknown` for untrusted payloads.
- Export prop and contract interfaces.
- Keep functions typed.
- Use typed IPC envelopes.

### 20.2 Electron Rules

- No raw `ipcRenderer` exposure.
- No arbitrary shell strings.
- No renderer Node integration.
- All IPC channels come from contract constants.
- Handlers live in `src/desktop/ipc`.
- Business capability lives in `src/desktop/services`.

### 20.3 Renderer Rules

- Components do not call `window.electron` directly.
- Orchestrators call `runtimeBridge`.
- Stores store state, not side-effect procedures.
- Bootstrap modules subscribe to runtime events.

### 20.4 Documentation Rules

Every phase should update:

- This execution plan if architecture changes.
- A shorter implementation note if behavior changes.
- Diagnostics docs once runtime-core is real.

## 21. Migration Strategy

### 21.1 Compatibility First

`window.electron.gateway` can remain temporarily because `useElectron.ts` expects it. But new code should prefer:

```text
window.electron.runtime
window.electron.diagnostics
```

### 21.2 Gradual Store Sync

Do not replace all seed and mock behavior immediately. The browser bridge should keep development flow stable. Electron bridge should become richer behind the same interface.

### 21.3 Root Component Reduction

Continue reducing `App.tsx`:

- Strategy start goes to `strategyOrchestrator`.
- Purchase strategy can later go to `strategyMarketOrchestrator`.
- Publish flows can later go to dedicated services.
- Runtime event bootstrap should mount once near app startup.

### 21.4 Old Config Cleanup

After `src/desktop/tsconfig.json` works:

- Decide whether `tsconfig.electron.json` is obsolete.
- If obsolete, remove or make it delegate clearly.
- Avoid two competing Electron TypeScript configs.

## 22. Risk Register

### 22.1 Build Path Drift

Risk:

Electron main points to one output path while TypeScript emits another.

Mitigation:

Keep `package.json`, `src/desktop/tsconfig.json`, and builder config aligned in the same implementation batch.

### 22.2 Preload Runtime Path Failure

Risk:

Preload works in development but fails after packaging.

Mitigation:

Always compute preload path from `__dirname` in main output. Test production build early.

### 22.3 Renderer Coupling To Electron

Risk:

Renderer starts calling `window.electron` everywhere.

Mitigation:

Introduce runtime bridge early and require orchestrators to use it.

### 22.4 Runtime Process Leaks

Risk:

Python or Go processes remain running after app exit.

Mitigation:

Runtime process service owns all child processes and stops them during `before-quit`.

### 22.5 False Sandbox Confidence

Risk:

The product appears to safely execute arbitrary strategy code, but phase one Python execution is not a true sandbox.

Mitigation:

Name it local simulation runtime. Add clear permission envelopes later before broker/capital access.

### 22.6 Event Flooding

Risk:

Runtime output floods renderer and slows UI.

Mitigation:

Throttle event broadcast, cap history, limit stdout line size.

### 22.7 Windows Path Edge Cases

Risk:

Spaces in `E:\NEMT runtime` or packaged app paths break runtime process startup.

Mitigation:

Use `spawn(command, args)` and avoid shell command strings.

## 23. Acceptance Checklist

### 23.1 Architecture Acceptance

- Electron main process exists under `src/desktop/main`.
- Preload exists under `src/desktop/preload`.
- IPC handlers exist under `src/desktop/ipc`.
- Contracts exist under `src/contracts`.
- Runtime bridge exists under `src/services/runtimeBridge`.
- Runtime-core folder exists.

### 23.2 Security Acceptance

- `contextIsolation` is true.
- `nodeIntegration` is false.
- Renderer does not receive raw IPC.
- IPC payloads use typed contracts.
- External URLs are validated.

### 23.3 Runtime Acceptance

- Runtime health is callable.
- Strategy runtime start is represented as a bridge call.
- Runtime events can be subscribed to.
- Registry snapshot can be read.
- Diagnostics reports active runtime processes.

### 23.4 Developer Experience Acceptance

- WebStorm MCP diagnostics are usable.
- TypeScript typecheck passes.
- Desktop build passes.
- Browser dev mode still works.
- Electron dev mode launches.

## 24. Suggested Immediate Next Step

The next implementation should start with Phase 1. The reason is simple: every later capability depends on the Electron host, preload membrane, and IPC contracts.

Start with these files:

```text
src/contracts/electron/ipcChannels.ts
src/contracts/electron/ipcResult.ts
src/desktop/main/index.ts
src/desktop/main/createMainWindow.ts
src/desktop/preload/index.ts
src/desktop/preload/exposeElectronApi.ts
src/desktop/ipc/registerIpcHandlers.ts
src/desktop/ipc/appHandlers.ts
src/desktop/ipc/windowHandlers.ts
src/desktop/ipc/diagnosticsHandlers.ts
src/desktop/tsconfig.json
```

Then run:

```text
npm.cmd run typecheck
npm run build:desktop
```

If those pass, the project has a real Electron spine. After that, runtime bridge and strategy orchestrator extraction can attach to something concrete.

## 25. Final Architectural Shape

The final shape should feel like this:

```text
User action
  -> React component
    -> Orchestrator
      -> Runtime bridge
        -> Preload API
          -> IPC contract
            -> Electron service
              -> Runtime core process
                -> Runtime event
                  -> Runtime event bootstrap
                    -> Stores
                      -> UI
```

This is the boundary expansion the project needs. It does not add a new visual feature node. It expands the software container itself by adding a desktop execution layer, typed process boundary, runtime event bus, and local compute substrate.

That is what turns NEMT Runtime from a frontend simulation shell into a desktop quantitative runtime platform.
