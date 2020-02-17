import { Camera, Identificator } from "../src";

Camera.listCameras()
  .then(list => {
    if (list.length) {
      const CanonEOS7D = new Camera(list[0]);
      CanonEOS7D.identifyBy = Identificator.Model;
      CanonEOS7D.stopCapture();
      CanonEOS7D.burst({ length: 5, filename: "burst" });
    }
  })
  .catch(e => console.log(`error: ${e}`));
