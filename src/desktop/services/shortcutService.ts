import { globalShortcut } from 'electron';

export interface ShortcutBinding {
  id: string;
  accelerator: string;
  action: string;
  description: string;
  registered: boolean;
  registeredAt?: number;
}

export interface ShortcutActionEvent {
  action: string;
  accelerator: string;
  timestamp: number;
}

export class ShortcutService {
  private readonly bindings = new Map<string, ShortcutBinding>();
  private actionCallback: ((event: ShortcutActionEvent) => void) | null = null;

  register(binding: Omit<ShortcutBinding, 'registered'>): ShortcutBinding {
    const full: ShortcutBinding = {
      ...binding,
      registered: false,
      registeredAt: Date.now(),
    };

    try {
      const success = globalShortcut.register(binding.accelerator, () => {
        this.actionCallback?.({
          action: binding.action,
          accelerator: binding.accelerator,
          timestamp: Date.now(),
        });
      });

      full.registered = success;
      if (success) {
        this.bindings.set(binding.id, full);
      }
    } catch {
      full.registered = false;
    }

    return full;
  }

  unregister(bindingId: string): boolean {
    const binding = this.bindings.get(bindingId);
    if (!binding) return false;
    globalShortcut.unregister(binding.accelerator);
    this.bindings.delete(bindingId);
    return true;
  }

  unregisterAll(): void {
    globalShortcut.unregisterAll();
    this.bindings.clear();
  }

  isRegistered(accelerator: string): boolean {
    return globalShortcut.isRegistered(accelerator);
  }

  listBindings(): ShortcutBinding[] {
    return Array.from(this.bindings.values());
  }

  onAction(callback: (event: ShortcutActionEvent) => void): void {
    this.actionCallback = callback;
  }

  getDefaultTradingShortcuts(): Omit<ShortcutBinding, 'registered'>[] {
    return [
      { id: 'sc_new_signal', accelerator: 'CmdOrCtrl+Shift+N', action: 'trading:newSignal', description: 'Create new signal' },
      { id: 'sc_toggle_execution', accelerator: 'CmdOrCtrl+Shift+E', action: 'trading:toggleExecution', description: 'Toggle strategy execution' },
      { id: 'sc_emergency_stop', accelerator: 'CmdOrCtrl+Shift+X', action: 'trading:emergencyStop', description: 'Emergency stop all strategies' },
      { id: 'sc_quick_backtest', accelerator: 'CmdOrCtrl+Shift+B', action: 'trading:quickBacktest', description: 'Quick backtest current strategy' },
      { id: 'sc_toggle_monitor', accelerator: 'CmdOrCtrl+Shift+M', action: 'view:toggleMonitor', description: 'Toggle monitor panel' },
      { id: 'sc_export_data', accelerator: 'CmdOrCtrl+Shift+E', action: 'data:export', description: 'Export current data view' },
    ];
  }
}
