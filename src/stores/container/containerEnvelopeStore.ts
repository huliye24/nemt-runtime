/**
 * NEMT Runtime - Container Envelope Store
 */

import { create } from 'zustand';

import type { ContainerEnvelope, IsolationLevel } from '@/types/container';

interface ContainerEnvelopeState {
  envelopes: ContainerEnvelope[];
  selectedEnvelopeId: string | null;
}

interface ContainerEnvelopeActions {
  addEnvelope: (envelope: ContainerEnvelope) => void;
  updateEnvelope: (id: string, updates: Partial<ContainerEnvelope>) => void;
  removeEnvelope: (id: string) => void;
  selectEnvelope: (id: string | null) => void;
  setEnvelopes: (envelopes: ContainerEnvelope[]) => void;
}

export const useContainerEnvelopeStore = create<ContainerEnvelopeState & ContainerEnvelopeActions>()((set) => ({
  envelopes: [],
  selectedEnvelopeId: null,
  addEnvelope: (envelope) => set((state) => ({ envelopes: [...state.envelopes, envelope] })),
  updateEnvelope: (id, updates) =>
    set((state) => ({
      envelopes: state.envelopes.map((envelope) =>
        envelope.id === id ? { ...envelope, ...updates, updatedAt: Date.now() } : envelope,
      ),
    })),
  removeEnvelope: (id) =>
    set((state) => ({
      envelopes: state.envelopes.filter((envelope) => envelope.id !== id),
      selectedEnvelopeId: state.selectedEnvelopeId === id ? null : state.selectedEnvelopeId,
    })),
  selectEnvelope: (id) => set({ selectedEnvelopeId: id }),
  setEnvelopes: (envelopes) => set({ envelopes }),
}));

export const useContainerEnvelopes = () => useContainerEnvelopeStore((state) => state.envelopes);
export const useSelectedContainerEnvelopeId = () => useContainerEnvelopeStore((state) => state.selectedEnvelopeId);
export const useSelectedContainerEnvelope = () =>
  useContainerEnvelopeStore((state) =>
    state.envelopes.find((envelope) => envelope.id === state.selectedEnvelopeId) ?? null,
  );
export const useEnvelopesByIsolationLevel = (isolationLevel: IsolationLevel) =>
  useContainerEnvelopeStore((state) => state.envelopes.filter((envelope) => envelope.isolationLevel === isolationLevel));
