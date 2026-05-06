import { app } from 'electron';

export interface ProtocolHandler {
  protocol: string;
  action: string;
  params: Record<string, string>;
}

export class ProtocolService {
  private handlers = new Map<string, (handler: ProtocolHandler) => void>();
  private registered = false;

  registerProtocol(protocol: string): void {
    if (this.registered) return;

    app.setAsDefaultProtocolClient(protocol);
    this.registered = true;

    app.on('open-url', (_event, url) => {
      this.handleUrl(url);
    });

    // Handle Windows/Linux deep link arguments
    const args = process.argv;
    for (const arg of args) {
      if (arg.startsWith(`${protocol}://`)) {
        this.handleUrl(arg);
      }
    }
  }

  onProtocolAction(action: string, handler: (handler: ProtocolHandler) => void): () => void {
    this.handlers.set(action, handler);
    return () => this.handlers.delete(action);
  }

  private handleUrl(url: string): void {
    try {
      const parsed = new URL(url);
      const params: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const handler: ProtocolHandler = {
        protocol: parsed.protocol.replace(':', ''),
        action: parsed.hostname,
        params,
      };

      const actionHandler = this.handlers.get(handler.action);
      actionHandler?.(handler);
    } catch {
      // ignore malformed URLs
    }
  }

  getRegisteredProtocol(): string | null {
    return this.registered ? 'nemt' : null;
  }
}
