
# ZXing

### Runs on your favorite ECMAScript ecosystem

> If it doesn't, we gonna make it.

## What is ZXing?

> [ZXing][1] ("zebra crossing") is an open-source, multi-format 1D/2D barcode image processing library implemented in Java, with ports to other languages.

## Supported Formats


| 1D product | 1D industrial       | 2D             |
| ---------- | ------------------- | -------------- |
| ~~UPC-A~~  | Code 39             | QR Code        |
| ~~UPC-E~~  | ~~Code 93~~         | Data Matrix    |
| EAN-8      | Code 128            | ~~Aztec~~ \*   |
| EAN-13     | ~~Codabar~~         | ~~PDF 417~~ \* |
|            | ITF                 | ~~MaxiCode~~   |
|            | RSS-14              |
|            | ~~RSS-Expanded~~ \* |

**\*** In progress, may have open PR.


## Installation

`npm i angular-weblineindia-qrcode-scanner/library --save`

or

`yarn add angular-weblineindia-qrcode-scanner/library`

## Usage

### Use on browser with ES6 modules:

```html
<script type="module">
  import { BrowserQRCodeReader } from 'angular-weblineindia-qrcode-scanner/library';

  const codeReader = new BrowserQRCodeReader();
  const img = document.getElementById('img');

  try {
      const result = await codeReader.decodeFromImage(img);
  } catch (err) {
      console.error(err);
  }

  console.log(result);
</script>
```

#### Or asynchronously:

```html
<script type="module">
  import('angular-weblineindia-qrcode-scanner/library').then({ BrowserQRCodeReader } => {

    const codeReader = new BrowserQRCodeReader();
    const img = document.getElementById('img');

    try {
        const result = await codeReader.decodeFromImage(img);
    } catch (err) {
        console.error(err);
    }

    console.log(result);

  });
</script>
```

### Use on browser with AMD:

```html
<script type="text/javascript" src="https://unpkg.com/requirejs"></script>
<script type="text/javascript">
  require(['angular-weblineindia-qrcode-scanner/library'], ZXing => {
    const codeReader = new ZXing.BrowserQRCodeReader();
    const img = document.getElementById('img');

    try {
        const result = await codeReader.decodeFromImage(img);
    } catch (err) {
        console.error(err);
    }

    console.log(result);
  });
</script>
```

### Use on browser with UMD:

```html
<script type="text/javascript" src="https://unpkg.com/angular-weblineindia-qrcode-scanner/library@latest"></script>
<script type="text/javascript">
  window.addEventListener('load', () => {
    const codeReader = new ZXing.BrowserQRCodeReader();
    const img = document.getElementById('img');

    try {
        const result = await codeReader.decodeFromImage(img);
    } catch (err) {
        console.error(err);
    }

    console.log(result);
  });
</script>
```

### Use outside the browser with CommonJS:

```javascript
const { MultiFormatReader, BarcodeFormat } = require('angular-weblineindia-qrcode-scanner/library/esm5'); // use this path since v0.5.1

const hints = new Map();
const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX/*, ...*/];

hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

const reader = new MultiFormatReader();

reader.setHints(hints);

const luminanceSource = new RGBLuminanceSource(imgWidth, imgHeight, imgByteArray);
const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

reader.decode(binaryBitmap);
```

## Browser Support

The browser layer is using the [MediaDevices](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices) web API which is not supported by older browsers.

_You can use external polyfills like [WebRTC adapter](https://github.com/webrtc/adapter) to increase browser compatibility._

Also, note that the library is using the [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) (`Int32Array`, `Uint8ClampedArray`, etc.) which are not available in older browsers (e.g. Android 4 default browser).

_You can use [core-js](https://github.com/zloirock/core-js) to add support to these browsers._

### Scanning from Video Camera

To display the input from the video camera you will need to add a video element in the HTML page:

```html
<video
  id="video"
  width="300"
  height="200"
  style="border: 1px solid gray"
></video>
```

To start decoding, first obtain a list of video input devices with:

```javascript
const codeReader = new ZXing.BrowserQRCodeReader();

codeReader
  .listVideoInputDevices()
  .then(videoInputDevices => {
    videoInputDevices.forEach(device =>
      console.log(`${device.label}, ${device.deviceId}`)
    );
  })
  .catch(err => console.error(err));
```

If there is just one input device you can use the first `deviceId` and the video element id (in the example below is also 'video') to decode:

```javascript
const firstDeviceId = videoInputDevices[0].deviceId;

codeReader
  .decodeFromInputVideoDevice(firstDeviceId, 'video')
  .then(result => console.log(result.text))
  .catch(err => console.error(err));
```

If there are more input devices then you will need to chose one for `codeReader.decodeFromInputVideoDevice` device id parameter.

You can also provide `undefined` for the device id parameter in which case the library will automatically choose the camera, preferring the main (environment facing) camera if more are available:

```javascript
codeReader
  .decodeFromInputVideoDevice(undefined, 'video')
  .then(result => console.log(result.text))
  .catch(err => console.error(err));
```

### Scanning from Video File

Similar as above you can use a video element in the HTML page:

```html
<video
  id="video"
  width="300"
  height="200"
  style="border: 1px solid gray"
></video>
```

And to decode the video from an url:

```javascript
const codeReader = new ZXing.BrowserQRCodeReader();
const videoSrc = 'your url to a video';

codeReader
  .decodeFromVideo('video', videoSrc)
  .then(result => console.log(result.text))
  .catch(err => console.error(err));
```

You can also decode the video url without showing it in the page, in this case no `video` element is needed in HTML.

```javascript
codeReader
  .decodeFromVideoUrl(videoUrl)
  .then(result => console.log(result.text))
  .catch(err => console.error(err));

// or alternatively

codeReader
  .decodeFromVideo(null, videoUrl)
  .then(result => console.log(result.text))
  .catch(err => console.error(err));
```

### Scanning from Image

Similar as above you can use a img element in the HTML page (with src attribute set):

```html
<img
  id="img"
  src="qrcode-image.png"
  width="200"
  height="300"
  style="border: 1px solid gray"
/>
```

And to decode the image:

```javascript
const codeReader = new ZXing.BrowserQRCodeReader();
const img = document.getElementById('img');

codeReader
  .decodeFromImage(img)
  .then(result => console.log(result.text))
  .catch(err => console.error(err));
```

You can also decode the image url without showing it in the page, in this case no `img` element is needed in HTML:

```javascript
const imgSrc = 'url to image';

codeReader
  .decodeFromImage(undefined, imgSrc)
  .then(result => console.log(result.text))
  .catch(err => console.error(err));
```

Or decode the image url directly from an url, with an `img` element in page (notice no `src` attribute is set for `img` element):

```html
<img
  id="img-to-decode"
  width="200"
  height="300"
  style="border: 1px solid gray"
/>
```

```javascript
const imgSrc = 'url to image';
const imgDomId = 'img-to-decode';

codeReader
  .decodeFromImage(imgDomId, imgSrc)
  .then(result => console.log(result.text))
  .catch(err => console.error(err));
```

## Barcode generation

To generate a QR Code SVG image include 'zxing.qrcodewriter.min.js' from `build/vanillajs`. You will need to include an element where the SVG element will be appended:

```html
<div id="result"></div>
```

And then:

```javascript
const codeWriter = new ZXing.BrowserQRCodeSvgWriter();
// you can get a SVG element.
const svgElement = codeWriter.write(input, 300, 300);
// or render it directly to DOM.
codeWriter.writeToDom('#result', input, 300, 300);
```

## Want to Contribute?

- Created something awesome, made this code better, added some functionality, or whatever (this is the hardest part).
- [Fork it](http://help.github.com/forking/).
- Create new branch to contribute your changes.
- Commit all your changes to your branch.
- Submit a [pull request](http://help.github.com/pull-requests/).

-----

## Need Help? 

We also provide a free, basic support for all users who want to use this Angular QR-Scanner in their software project. In case you want to customize this scanner to suit your development needs, then feel free to contact our [Angular developers](https://www.weblineindia.com/hire-vuejs-developer.html).

-----

## Collection of Components

We have built many other components and free resources for software development in various programming languages. Kindly click here to view our [Free Resources for Software Development](https://www.weblineindia.com/software-development-resources.html).

------

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## Credits

angular-weblineindia-qrcode-scanner is inspired by [@zxing/ngx-scanner](https://www.npmjs.com/package/@zxing/ngx-scanner).

## License

[MIT](LICENSE)

[mit]: https://github.com/weblineindia/Vue-Swipe-Action/blob/master/LICENSE

## Keywords

    angular,
    editor,
    native,
    wysiwyg,
    angular-editor,
    angular-wysiwyg-editor,
    wysiwyg-editor,
    rich,
    rich text editor

