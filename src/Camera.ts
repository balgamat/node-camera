import { execCommand, spawnCommand } from "./execCommand";
import {
  BurstOptions,
  Callbacks,
  CaptureOptions,
  CommandResult,
  CameraParams,
  Identificator
} from "./types";
import { ChildProcess } from "child_process";
// @ts-ignore
import { assocPath } from "./utilities";

export class Camera {
  constructor(params: CameraParams) {
    this.model = params.model;
    this.port = params.port;
    this._process = null;
    this._identifyBy = Identificator.Model;
  }

  public get identifyBy(): Identificator {
    return this._identifyBy;
  }

  private exec = (args: string[]) => {
    !!this._process && this._process.kill();

    return execCommand([
      this._identifyBy === Identificator.Model
        ? `--camera=${this.model}`
        : `--port=${this.port}`,
      ...args
    ]);
  };

  private spawn = (args: string[], callbacks?: Callbacks) => {
    !!this._process && this._process.kill();

    return spawnCommand(
      [
        this._identifyBy === Identificator.Model
          ? `--camera=${this.model}`
          : `--port=${this.port}`,
        ...args
      ],
      callbacks
    );
  };

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
        .map(async (line: string) => {
          const { 0: model, 1: port } = line
            .split("  ")
            .filter(fragment => fragment !== "")
            .map(fragment => (!!fragment ? fragment.trim() : fragment));
          const configuration =
            !!model && !!port
              ? (await Camera.getConfigurationTree(port)).data
              : undefined;
          return {
            model,
            port,
            configuration
          } as CameraParams;
        });
      const result = await Promise.all(cameras);
      // @ts-ignore
      resolve(result.filter((c: CameraParams) => c.model && c.port));
    });

  public stopCapture = () => this._process?.kill();

  public set identifyBy(i: Identificator) {
    this._identifyBy = i;
  }

  public burst = (
    { length, filename, burstMode, forceOverwrite, captureTarget }: BurstOptions,
    callbacks?: Callbacks
  ) => {
    if (this.model.startsWith("Canon")) {
      const args = [
        `--set-config=capturetarget=${ captureTarget === undefined ? 0 : captureTarget}`,
        `--set-config=drivemode=${burstMode === undefined ? 2 : burstMode}`,
        `--set-config=eosremoterelease=2`,
        `--wait-event-and-download=${length}s`,
        `--set-config=eosremoterelease=4`,
        `--wait-event=1s`
      ];
      !!forceOverwrite && args.push(`--force-overwrite`)
      !!filename && args.push(`--filename=${filename}%n.%C`);
      this._process = this.spawn(args, callbacks);
    } else {
      callbacks?.onError &&
        callbacks.onError(
          "NOT_SUPPORTED: Burst is supported on Canon cameras only."
        );
    }
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
      Object.keys(properties).map(k => `--set-config=${k}=${properties[k]}`)
    );

  public reset = this.fn(["--reset"]);

  static getConfigurationTree = (port: string) =>
    new Promise<CommandResult>(async (resolve, reject) => {
      try {
        const { data, error } = await execCommand([
          `--port=${port}`,
          `--list-all-config`
        ]);
        if (error) reject(error);

        const props: string[] = data.trim().split("END\n");
        const tree = props.reduce((tree, prop) => {
          if (prop === "") return tree;
          const [
            pathLine,
            labelLine,
            readonlyLine,
            typeLine,
            valueLine,
            ...choices
          ] = prop.trim().split("\n");

          const propertyObj = {
            label: labelLine.slice(7),
            isReadonly: readonlyLine === "Readonly: 1",
            type: typeLine.slice(6),
            value: valueLine.slice(9),

            options:
              choices.length > 0
                ? choices.map(choice => {
                    const composite = choice.slice(8);
                    const spacePosition = composite.indexOf(" ");
                    return spacePosition === -1
                      ? undefined
                      : {
                          label: composite.slice(spacePosition + 1),
                          value: composite.slice(0, spacePosition)
                        };
                  })
                : undefined
          };
          return assocPath(pathLine.slice(6).split("/"), propertyObj, tree);
        }, {});

        resolve({ data: tree });
      } catch (e) {
        reject({ error: e });
      }
    });
}
