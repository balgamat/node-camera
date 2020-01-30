export interface ICmdResult {
  error?: any;
  data?: any;
}

export interface ConnectionParams {
  model: string;
  port: string;
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