import React from 'react';
import type { ViewId } from '@/types';
import { Sidebar } from './Sidebar';

export interface AppShellProps {
  activeView: ViewId;
  title: string;
  description: string;
  onViewChange: (view: ViewId) => void;
  header: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({
  activeView,
  title,
  description,
  onViewChange,
  header,
  children,
}: AppShellProps) {
  return (
    <div
      className="flex h-screen w-screen overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--nemt-bg, #0d0d0d)' }}
    >
      <div
        className="flex-shrink-0 border-r"
        style={{
          backgroundColor: 'var(--nemt-bg-secondary, #141414)',
          borderColor: 'var(--nemt-border, #1e1e1e)',
        }}
      >
        <Sidebar activeView={activeView} onViewChange={onViewChange} />
      </div>

      <main className="flex flex-1 flex-col overflow-hidden">
        {header}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--nemt-bg, #0d0d0d)' }}>
          <div className="mx-auto max-w-6xl px-8 py-8">
            <div className="mb-10">
              <h1 className="mb-2 text-3xl font-semibold text-white tracking-tight">{title}</h1>
              <p className="text-sm text-neutral-500">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
