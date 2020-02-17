# node-camera

> This rather complete Node wrapper for gphoto2*(required)* enables you to list all compatible cameras and their
> abilities, setup camera parameters, capture images, bursts, timelapses and even video, if supported.

## 1. Installation

### 1.1. Install prerequisities

As this package is a mere wrapper of the gphoto2's cli, you need to install that first:

#### a) MacOS

```
brew install gphoto2
```

#### b) Linux

```
sudo apt-get install gphoto2
```

#### c) Windows

Haven't tested it, so feel free to google instructions from somebody who has.

### 1.2. Install the npm package

After you have the dependencies installed, it's all easy-peasy lemon-squeezy from there:

```
yarn add node-camera
```

## 2. Getting started

```
import { Camera, Identificator } from "node-camera";

Camera.listCameras()
  .then(list => {
    if (list.length) {
      const CanonEOS7D = new Camera(list[0]);
      CanonEOS7D.identifyBy = Identificator.Model;
      CanonEOS7D.captureImage({
        forceOverwrite: true,
        filename: "./photo.%C"
      });
      setTimeout(
        () =>
          CanonEOS7D.captureImage(
            { forceOverwrite: true, interval: 3, filename: 'photo%03n.%C' },
            {
              onData: data => console.log("Received some logs: ", data.toString()),
              onError: error =>
                console.log("This was not supposed to happen: ", error.toString()),
              onClose: exitCode =>
                exitCode === 0
                  ? console.log("Do something now with the photos")
                  : console.log("This without an error usually means" +
                  " cancellation.")
            }
          ),
        5000
      );
      setTimeout(() => CanonEOS7D.stopCapture(), 15000);
    }
  })
  .catch(e => console.log(`error: ${e}`));

```

### 2.1. Notable stuff in the example

#### 2.1.1 Non-concurrency

Noticed the timeouts? If you try to capture another image whilst a capture process is still running, you'll get an error. To prevent this, you either have to wait or kill the process by calling `<CameraInstance>.stopCapture()`.

#### 2.1.2 Identificators

At line

`CanonEOS7D.identifyBy = Identificator.Model;`

we specify that `node-camera` should search for camera with name `Canon EOS 7D`, whereas if we write

`CanonEOS7D.identifyBy = Identificator.Port;`

the program will try to connect camera with the specified port. Identification by model is enabled as default, so if you have one camera only, you don't have to do anything.

However, should you have two or more cameras of the same make and model, identification by port comes in handy as it enables you to distinguish between the cameras.

#### 2.1.3 Filename

The `filename` option accepts %a, %A, %b, %B, %d, %H, %k, %I, %l, %j, %m, %M, %S, %y, %%, (see date(1)) and, in addition, %n for the number, %C for the filename suffix, %f for the filename without suffix, %F for the foldername, %: for the complete filename in lowercase.

Note that %: is still in alpha stage, and the actual character or syntax may still be changed. E.g. it might be possible to use %#f and %#C for lower case versions, and %^f and %^C for upper case versions.

%n is the only conversion specifier to accept a padding character and width: %03n will pad with zeros to width 3 (e.g. print the number 7 as “007”). Leaving out the padding character (e.g. %3n) will use an implementation specific default padding character which may or may not be suitable for use in file names.

## 3. API

### 3.1 Static methods

#### `Camera.listCameras(): Promise<ConnectionParams>`

#### `getConfigurationTree(port: string): Promise<CommandResult>`

Gets the whole configuration tree for the camera including current values and values that are possible to be set. This is useful e.g. for making a form to set up the camera.


### 3.2 Constructors

#### `Camera(cameraParams: ConnectionParams): Camera`

### 3.3 Instance methods

####`burst({length: number, filename?: string}, callbacks?: Callbacks): void`
Captures multiple images for a specified time as quickly as possible.

#### `captureImage(options: CaptureOptions, callbacks?: Callbacks): void`

Captures image or images using provided options.

#### `getConfig(propertyNames: string[]): Promise<CommandResult>`

Gets a configuration property/properties value from the camera.

#### `reset(): Promise<CommandResult>`

Resets the camera's port.

####`setConfig(properties: Record<string, any>): Promise<CommandResult>`
Sets configuration values.

#### `stopCapture(): void`

Kills an ongoing capture, e.g. when a timelapse length was set to undefined.

#### `timelapse(options: Pick<CaptureOptions,'frames' | 'interval' | 'filename'>, callbacks?: Callbacks)`

Captures multiple images in specified intervals for a specified or unspecified time.

### 3.4. Types and options

#### Capture Options

|      **Name**      | **Type** |  **Default**  |                                  **Description**                                   |
| :----------------: | :------: | :-----------: | :--------------------------------------------------------------------------------: |
|      **keep**      | boolean  |     false     |                      _Keep images on camera after capturing_                       |
|    **keepRAW**     | boolean  |     false     |                    _Keep RAW images on camera after capturing_                     |
|     **noKeep**     | boolean  |     true      |                    _Remove images from camera after capturing_                     |
|      **bulb**      |  number  |       -       |                        _Set bulb exposure time in seconds_                         |
|     **frames**     |  number  |  _infinite_   | _Set number of frames to capture (for a finite number has to have `interval` set)_ |
|    **interval**    |  number  |       1       |                         _Set capture interval in seconds_                          |
| **resetInterval**  | boolean  |     false     |                  _Reset capture interval on signal (default=no)_                   |
|    **filename**    |  string  | capture%4n.%C |                _Specify a filename or filename pattern (see 2.1.3)_                |
| **forceOverwrite** | boolean  |     true      |                          _Overwrite files without asking_                          |
|  **skipExisting**  | boolean  |     false     |                               _Skip existing files_                                |

#### Command Result

```
CommandResult {
     error?: any;
     data?: any;
   }
```

#### Camera Params

| **Name**  | **Type** | **Default** | **Example value** |
| :-------: | :------: | :---------: | :---------------: |
| **model** |  string  |      -      |  _Canon EOS 7D_   |
| **port**  |  string  |      -      |   _usb:020,006_   |
| **configuration**  |  object  |      -      |   _try for yourself_  |

#### Callbacks

```
Callbacks {
  onData?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: (exitCode: number) => void;
}
```

#### Identificator

```
enum Identificator {
  Port,
  Model
}
```
