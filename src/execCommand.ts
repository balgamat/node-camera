import { Callbacks, CommandResult } from "./types";

const util = require("util");
const spawn = require("child_process").spawn;
const exec = util.promisify(require("child_process").exec);

export const execCommand = async (args: string[]) => {
  return new Promise<CommandResult>(async (resolve, reject) => {
    try {
      console.log(`gphoto2 ${args.join(" ")}`);
      const { stdout, stderr } = await exec(`gphoto2 ${args.join(" ")}`);
      if (!!stderr) {
        reject({ error: stderr });
      }
      resolve({ data: stdout });
    } catch (error) {
      reject({ error });
    }
  });
};

export const spawnCommand = (args: string[], callbacks?: Callbacks) => {
  const command = spawn("gphoto2", args);

  command.stdout.on("data", (data: any) => {
    console.log(`node-camera/STDOUT >> ${data}`);
    callbacks?.onData && callbacks?.onData(data);
  });

  command.stderr.on("data", (error: any) => {
    console.log(`node-camera/STDERR >> ${error}`);
    callbacks?.onError && callbacks?.onError(error);
  });

  command.on("close", (code: number) => {
    console.log(`node-camera EXITED ${code}: ${EXIT_CODES[code] || "UNKNOWN"}`);
    callbacks?.onClose && callbacks?.onClose(EXIT_CODES[code] || "UNKNOWN");
  });

  return command;
};

const EXIT_CODES: any = {
  0: "IMAGE_CAPTURE_FINISHED",
  1: "IMAGE_CAPTURE_CANCELED"
};
