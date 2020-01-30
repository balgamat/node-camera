import { execCommand } from "./execCommand";
import { CaptureOptions, ConnectionParams, Identificator } from "./types";

export class Camera {
  private static _identifyCamerasBy: Identificator;
  private readonly port: string;
  private readonly model: string;

  constructor(params: ConnectionParams) {
    this.model = params.model;
    this.port = params.port;
  }

  get identififyCameraBy(): Identificator {
    return Camera._identifyCamerasBy;
  }

  set identififyCameraBy(i: Identificator) {
    Camera._identifyCamerasBy = i;
  }

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

  public captureImage = async ({
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
  }: CaptureOptions) => {
    const args: string[] = [];
    !!bulb && args.push(`--bulb=${bulb}`);
    !!filename && args.push(`--filename="${filename}"`);
    !!frames && args.push(`--frames=${frames}`);
    !!interval && args.push(`--interval=${interval}`);
    forceOverwrite && args.push(`--force-overwrite`);
    keep && args.push(`--keep`);
    keepRAW && args.push(`--keep-raw`);
    noKeep && args.push(`--no-keep`);
    resetInterval && args.push(`--reset-interval`);
    skipExisting && args.push(`--skip-existing`);

    console.log("args", args);

    return new Promise<any>(async (resolve, reject) => {
      try {
        const { data, error } = await this.exec([
          "--capture-image-and-download",
          ...args
        ]);
        if (!!error) reject({ error });
        resolve({ data });
      } catch (error) {
        reject(error);
      }
    });
  };

  private exec = (args: string[]) =>
    execCommand([
      Camera._identifyCamerasBy === Identificator.Model
        ? `--camera="${this.model}"`
        : `--port="${this.port}"`,
      ...args
    ]);

  private fn = (args: string[]) => () => this.exec(args);

  public reset = this.fn(["--reset"]);
}
