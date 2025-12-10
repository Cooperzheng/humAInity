'use client';

import { create } from 'zustand';

export type LogItem = {
  id: number;
  text: string;
  type: 'chat' | 'system';
};

export type AgentState = 'IDLE' | 'LISTENING' | 'THINKING' | 'ACTING' | 'ASKING';

type GameStore = {
  wood: number;
  food: number;
  logs: LogItem[];
  isNearAgent: boolean;
  inputFocused: boolean;
  agentState: AgentState;
  pendingCommand: string | null;
  addLog: (text: string, type?: LogItem['type']) => void;
  addWood: (n: number) => void;
  addFood: (n: number) => void;
  setNearAgent: (v: boolean) => void;
  setInputFocused: (v: boolean) => void;
  setAgentState: (s: AgentState) => void;
  setPendingCommand: (cmd: string | null) => void;
};

export const useGameState = create<GameStore>((set) => ({
  wood: 0,
  food: 0,
  logs: [],
  isNearAgent: false,
  inputFocused: false,
  agentState: 'IDLE',
  pendingCommand: null,
  addLog: (text, type = 'system') =>
    set((state) => ({
      logs: [...state.logs, { id: Date.now(), text, type }].slice(-200),
    })),
  addWood: (n) =>
    set((state) => ({
      wood: state.wood + n,
    })),
  addFood: (n) =>
    set((state) => ({
      food: state.food + n,
    })),
  setNearAgent: (v) => set(() => ({ isNearAgent: v })),
  setInputFocused: (v) => set(() => ({ inputFocused: v })),
  setAgentState: (s) => set(() => ({ agentState: s })),
  setPendingCommand: (cmd) => set(() => ({ pendingCommand: cmd })),
}));

