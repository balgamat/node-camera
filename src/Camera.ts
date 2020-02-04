import { execCommand, spawnCommand } from "./execCommand";
import {
  BurstOptions,
  Callbacks,
  CaptureOptions,
  ConnectionParams,
  Identificator
} from "./types";
import { EventEmitter } from "events";
import { ChildProcess } from "child_process";

export class Camera {
  constructor(params: ConnectionParams) {
    this.model = params.model;
    this.port = params.port;
    this._process = null;
    this._identifyBy = Identificator.Model;
  }

  public get identifyBy(): Identificator {
    return this._identifyBy;
  }

  private exec = (args: string[]) =>
    execCommand([
      this._identifyBy === Identificator.Model
        ? `--camera=${this.model}`
        : `--port=${this.port}`,
      ...args
    ]);

  private spawn = (args: string[], callbacks?: Callbacks) =>
    spawnCommand(
      [
        this._identifyBy === Identificator.Model
          ? `--camera=${this.model}`
          : `--port=${this.port}`,
        ...args
      ],
      callbacks
    );

  private fn = (args: string[]) => () => this.exec(args);
  private readonly model: string;
  private readonly port: string;
  private _identifyBy: Identificator;
  private _process: ChildProcess | null;

  public static listCameras = async () =>
    new Promise<any>(async (resolve, reject) => {
      const { data, error } = await execCommand(["--auto-detect"]);
      if (!!error) reject({ error });
      const [_, __, ...rest] = data.split("\n");
      const cameras = rest
        .map((line: string) => {
          const { 0: model, 1: port } = line
            .split("  ")
            .filter(fragment => fragment !== "")
            .map(fragment => (!!fragment ? fragment.trim() : fragment));
          return { model, port } as ConnectionParams;
        })
        .filter((c: ConnectionParams) => c.model && c.port);
      resolve(cameras);
    });

  public stopCapture = () => this._process?.kill();

  public set identifyBy(i: Identificator) {
    this._identifyBy = i;
  }

  public burst = (
    { length, filename }: BurstOptions,
    callbacks?: Callbacks
  ) => {
    const args = [
      `--set-config capturetarget=0`,
      "--set-config drivemode=`Continuous`",
      `--set-config eosremoterelease=2`,
      `--wait-event-and-download=${length}s`,
      `--set-config eosremoterelease=0`,
      `--wait-event=1s`,
    ];
    !!filename && args.push(`--filename=${filename}%n.%C`);
    console.log("ARGS", args);
    this._process = this.spawn(args, callbacks);
  };

  public captureImage = (
    {
      bulb,
      filename,
      forceOverwrite,
      frames,
      interval,
      keep,
      keepRAW,
      noKeep,
      resetInterval,
      skipExisting
    }: CaptureOptions,
    callbacks?: Callbacks
  ) => {
    const args: string[] = [];
    !!bulb && args.push(`--bulb=${bulb}`);
    !!filename && args.push(`--filename=${filename}`);
    !!frames && args.push(`--frames=${frames}`);
    !!interval && args.push(`--interval=${interval}`);
    forceOverwrite && args.push(`--force-overwrite`);
    keep && args.push(`--keep`);
    keepRAW && args.push(`--keep-raw`);
    noKeep && args.push(`--no-keep`);
    resetInterval && args.push(`--reset-interval`);
    skipExisting && args.push(`--skip-existing`);

    this._process = this.spawn(
      ["--capture-image-and-download", ...args],
      callbacks
    );
  };

  public timelapse = (
    {
      filename,
      frames,
      interval = 1
    }: Pick<CaptureOptions, "frames" | "interval" | "filename">,
    callbacks?: Callbacks
  ) => {
    const args: string[] = [];
    !!filename && args.push(`--filename=${filename}%n.%C`);
    !!frames && args.push(`--frames=${frames}`);
    !!interval && args.push(`--interval=${interval}`);
    args.push(`--force-overwrite`);

    this._process = this.spawn(
      ["--capture-image-and-download", ...args],
      callbacks
    );
  };

  public getConfig = (properties: string[]) =>
    this.exec(properties.map(p => `--get-config ${p}`));

  public setConfig = (properties: Record<string, any>) =>
    this.exec(
      Object.keys(properties).map(k => `--set-config ${k}=${properties[k]}`)
    );

  public reset = this.fn(["--reset"]);
}
