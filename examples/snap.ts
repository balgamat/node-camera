import { Camera, Identificator } from "../src";

Camera.listCameras()
  .then(list => {
    if (list.length) {
      const CanonEOS7D = new Camera(list[0]);
      CanonEOS7D.captureImage({ filename: "photo.%C", forceOverwrite: true });
    }
  })
  .catch(e => console.log(`error: ${e}`));
