export type DeviceKind =
  | 'microphone'
  | 'camera'
  | 'speaker'
  | 'smart-home'
  | 'sensor'
  | 'robot'
  | 'display'
  | 'projector';

export interface Device {
  id: string;
  kind: DeviceKind;
  name: string;
  status: 'active' | 'idle' | 'locked';
  online: boolean;
}