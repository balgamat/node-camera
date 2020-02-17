import { Camera, Identificator } from "../src";

Camera.listCameras()
  .then(list => {
    if (list.length) {
      const CanonEOS7D = new Camera(list[0]);
      CanonEOS7D.identifyBy = Identificator.Model;
      CanonEOS7D.captureImage({
        forceOverwrite: true,
        filename: "./photo.jpg"
      });
      setTimeout(
        () =>
          CanonEOS7D.captureImage(
            { forceOverwrite: true, interval: 3, filename: "photo%03n.%C" },
            {
              onData: data => console.log("Received some logs: ", data),
              onError: error =>
                console.log("This was not supposed to happen: ", error),
              onClose: exitCode =>
                exitCode == 0
                  ? console.log("Do something now with the photos")
                  : console.log(
                      "This without an error usually means" + " cancellation."
                    )
            }
          ),
        5000
      );
      setTimeout(() => {
        CanonEOS7D.stopCapture();
        CanonEOS7D.burst({length: 2, filename: 'burst%03n.%C'})
      }, 15000);
    }
  })
  .catch(e => console.log(`error: ${e}`));
