export type Gesture = 'idle' | 'wave' | 'nod' | 'point' | 'shrug';
export type Expression = 'neutral' | 'smile' | 'think' | 'concern' | 'speak';

export interface AvatarCommand {
  gesture?: Gesture;
  expression?: Expression;
  gaze?: { x: number; y: number };
  lipSync?: number;
}

export interface AvatarTransform {
  brightness: number;
  opacity: number;
  scale: number;
  posX: number;
  posY: number;
  rotationY: number;
}