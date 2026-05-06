/**
 * Menu Manager - Application Menu Module
 *
 * Responsibilities:
 * - Build application menu
 * - Menu event handling
 * - Keyboard shortcuts
 */

import { Menu, BrowserWindow, dialog, MenuItemConstructorOptions } from 'electron';
import log from 'electron-log';

class MenuManager {
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  build(): void {
    const template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    log.info('Application menu built');
  }

  private buildTemplate(): MenuItemConstructorOptions[] {
    return [
      this.buildFileMenu(),
      this.buildEditMenu(),
      this.buildViewMenu(),
      this.buildSimulationMenu(),
      this.buildWindowMenu(),
      this.buildHelpMenu(),
    ];
  }

  private buildFileMenu(): MenuItemConstructorOptions {
    return {
      label: 'File',
      submenu: [
        {
          label: 'New Simulation',
          accelerator: 'CmdOrCtrl+N',
          click: () => this.sendToRenderer('menu:newSimulation'),
        },
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            if (!this.mainWindow) return;
            const result = await dialog.showOpenDialog(this.mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'CSV Files', extensions: ['csv'] },
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] },
              ],
            });
            if (!result.canceled && result.filePaths.length > 0) {
              this.sendToRenderer('file:opened', result.filePaths[0]);
            }
          },
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => this.sendToRenderer('menu:save'),
        },
        {
          label: 'Export Results...',
          accelerator: 'CmdOrCtrl+E',
          click: async () => {
            if (!this.mainWindow) return;
            const result = await dialog.showSaveDialog(this.mainWindow, {
              filters: [
                { name: 'PNG Image', extensions: ['png'] },
                { name: 'JSON Data', extensions: ['json'] },
                { name: 'CSV Data', extensions: ['csv'] },
              ],
            });
            if (!result.canceled && result.filePath) {
              this.sendToRenderer('file:export', result.filePath);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => this.sendToRenderer('menu:settings'),
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            const { app } = require('electron');
            app.quit();
          },
        },
      ],
    };
  }

  private buildEditMenu(): MenuItemConstructorOptions {
    return {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    };
  }

  private buildViewMenu(): MenuItemConstructorOptions {
    return {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: 'Toggle Developer Tools', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'Fullscreen', accelerator: 'F11', role: 'togglefullscreen' },
      ],
    };
  }

  private buildSimulationMenu(): MenuItemConstructorOptions {
    return {
      label: 'Simulation',
      submenu: [
        {
          label: 'Run Simulation',
          accelerator: 'F5',
          click: () => this.sendToRenderer('menu:runSimulation'),
        },
        {
          label: 'Stop Simulation',
          accelerator: 'Shift+F5',
          click: () => this.sendToRenderer('menu:stopSimulation'),
        },
        { type: 'separator' },
        {
          label: 'Noise Scan',
          click: () => this.sendToRenderer('menu:noiseScan'),
        },
        {
          label: 'Nonlinear Scan',
          click: () => this.sendToRenderer('menu:nonlinearScan'),
        },
        { type: 'separator' },
        {
          label: 'Full Pipeline',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => this.sendToRenderer('menu:fullPipeline'),
        },
      ],
    };
  }

  private buildWindowMenu(): MenuItemConstructorOptions {
    return {
      label: 'Window',
      submenu: [
        { label: 'Minimize', role: 'minimize' },
        { label: 'Close', role: 'close' },
      ],
    };
  }

  private buildHelpMenu(): MenuItemConstructorOptions {
    return {
      label: 'Help',
      submenu: [
        {
          label: 'NEMT Theory Docs',
          click: () => this.sendToRenderer('menu:theoryDocs'),
        },
        {
          label: 'API Docs',
          click: () => this.sendToRenderer('menu:apiDocs'),
        },
        { type: 'separator' },
        {
          label: 'About NEMT Platform',
          click: () => {
            if (this.mainWindow) {
              dialog.showMessageBox(this.mainWindow, {
                type: 'info',
                title: 'About NEMT Platform',
                message: 'NEMT Platform',
                detail: 'Version: 1.0.0\n\nNon-Equilibrium Market Theory Quantitative Trading Platform',
              });
            }
          },
        },
      ],
    };
  }

  private sendToRenderer(channel: string, ...args: unknown[]): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(channel, ...args);
    }
  }
}

export default MenuManager;
