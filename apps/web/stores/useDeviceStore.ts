import { create } from 'zustand';
import type { Device } from '@holo/shared';

interface DeviceState {
  devices: Device[];
  setDevices: (d: Device[]) => void;
  updateStatus: (id: string, status: Device['status']) => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  devices: [
    { id: 'd-mic', kind: 'microphone', name: 'Standard-Mikrofon', status: 'idle', online: true },
    { id: 'd-cam', kind: 'camera', name: 'Standard-Kamera', status: 'idle', online: true },
    { id: 'd-spk', kind: 'speaker', name: 'Standard-Lautsprecher', status: 'active', online: true },
    { id: 'd-proj', kind: 'projector', name: 'Hologramm-Projektor', status: 'active', online: true },
  ],
  setDevices: (devices) => set({ devices }),
  updateStatus: (id, status) =>
    set((s) => ({
      devices: s.devices.map((d) => (d.id === id ? { ...d, status } : d)),
    })),
}));