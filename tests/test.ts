import { Camera } from "../src";

Camera.listCameras()
  .then(r => {
    console.log(r);
    if (r.length) {
      const CanonEOS7D = new Camera(r[0]);
      CanonEOS7D.captureImage({ forceOverwrite: true, filename: "photo.jpg" })
        .then(ci => console.log(ci))
        .catch(e => console.log(`error: ${JSON.stringify(e)}`));
    }
  })
  .catch(e => console.log(`error: ${e}`));
