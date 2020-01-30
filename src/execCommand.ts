import {ICmdResult} from "./types";

const util = require('util');
const exec = util.promisify(require('child_process').exec);

export const execCommand = async (args: string[]) => {
    return new Promise<ICmdResult>(async (resolve, reject) => {
        try {
            console.log(`gphoto2 ${args.join(' ')}`);
            const {stdout, stderr} = await exec(`gphoto2 ${args.join(' ')}`);
            if (!!stderr) {
                reject({error: stderr});
            }
            resolve({data: stdout});
        } catch (error) {
            reject({error});
        }
    });
};
