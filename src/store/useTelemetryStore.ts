import {create} from 'zustand';
import {ControlTarget, TelemetryData} from '@types';

interface TelemetryState {
  telemetry?: TelemetryData;
  history: TelemetryData[];
  commandStates: Partial<Record<ControlTarget, 'idle' | 'pending' | 'error'>>;
  updateTelemetry: (payload: TelemetryData) => void;
  setCommandState: (target: ControlTarget, state: 'idle' | 'pending' | 'error') => void;
  mutateTelemetry: (patch: Partial<TelemetryData>) => void;
}

export const useTelemetryStore = create<TelemetryState>(set => ({
  history: [],
  commandStates: {},
  updateTelemetry(payload) {
    set(state => ({
      telemetry: payload,
      history: [payload, ...state.history].slice(0, 50),
    }));
  },
  setCommandState(target, stateValue) {
    set(state => ({
      commandStates: {...state.commandStates, [target]: stateValue},
    }));
  },
  mutateTelemetry(patch) {
    set(state => ({
      telemetry: state.telemetry ? {...state.telemetry, ...patch} : state.telemetry,
    }));
  },
}));
