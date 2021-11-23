export interface CommandResult {
  error?: any;
  data?: any;
}

export interface CameraParams {
  model: string;
  port: string;
  configuration?: object;
}

export interface Callbacks {
  onData?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: (exitCode: number) => void;
}

export enum Identificator {
  Port,
  Model
}

export type CaptureOptions = Partial<{
  keep: boolean;
  keepRAW: boolean;
  noKeep: boolean;
  bulb: number;
  frames: number;
  interval: number;
  resetInterval: boolean;
  filename: string;
  forceOverwrite: boolean;
  skipExisting: boolean;
}>;

export type BurstOptions = { captureTarget: number, length: number, burstMode?: number,  deleteAllFiles?: boolean, filename?: string, forceOverwrite?: boolean };
