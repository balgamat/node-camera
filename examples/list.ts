import { Camera } from "../src";

Camera.listCameras()
  .then(list => {
    if (list.length) {
      console.log('Detected cameras:\n', list);
    }
  })
  .catch(e => console.log(`error: ${e}`));
