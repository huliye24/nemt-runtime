/**
 * NEMT Platform - Aggregate Preload Script
 *
 * Loads the original preload (window.electron) first, then all extension APIs.
 * Each extension exposes its own top-level window property:
 *   window.electronData      - Data pipeline APIs
 *   window.electronDb        - Database APIs
 *   window.electronCompute   - Compute engine APIs
 *   window.electronFeed      - Market data feed APIs
 *   window.electronWorkspace - Workspace/multi-window APIs
 *   window.electronSystem    - Extended system APIs (notifications, shortcuts, updates)
 *   window.electronTelemetry - Telemetry/crash recovery APIs
 */

// Load the original preload first — this sets window.electron
require('./index');

// Load extension APIs — each calls contextBridge.exposeInMainWorld()
require('./extensions/dataApi');
require('./extensions/dbApi');
require('./extensions/computeApi');
require('./extensions/feedApi');
require('./extensions/workspaceApi');
require('./extensions/systemApi');
require('./extensions/telemetryApi');
