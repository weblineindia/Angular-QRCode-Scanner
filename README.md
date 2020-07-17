# AngularJS - Barcode / QRCode scanner

An AngularJS based Barcode / QRCode scanner component.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Choosing what decoders to run](#choosing-what-decoders-to-run)
- [Available format](#available-format)
- [Limitations](#limitations)
- [Advanced Usage](#advanced-usage)
- [Attributes](#attributes)
- [Want to Contribute?](#want-to-contribute)
- [Collection of Components](#collection-of-components)
- [Changelog](#changelog)
- [Credits](#credits)
- [License](#license)
- [Keywords](#Keywords)

## Installation

To install this package, run:

`npm i angular-weblineindia-qrcode-scanner --save` 

or

`npm i angular-weblineindia-qrcode-scanner --save`

## Usage

Import it on your module file:
```typescript

// some.module.ts
import { NgModule } from '@angular/core';

// your very important imports here

// the scanner!
import { ZXingScannerModule } from 'angular-weblineindia-qrcode-scanner';

// your other nice stuff

@NgModule({
  imports: [ 
    // ...
    // gets the scanner ready!
    ZXingScannerModule,
    // ...
  ]
})
export class SomeModule {}
```
<!-- some.component.html -->
```html

<zxing-scanner></zxing-scanner>

```

## Choosing what decoders to run

By default the component comes with QR code decoder enabled, to enable more decoders at once you can simply make use of the formats property like that:

<zxing-scanner [formats]="['QR_CODE', 'EAN_13', 'CODE_128', 'DATA_MATRIX']"></zxing-scanner>

You can also map the formats with the library's enum and pass them from the component:

<zxing-scanner [formats]="allowedFormats"></zxing-scanner>

```typescript

import { BarcodeFormat } from 'angular-weblineindia-qrcode-scanner/library';

export class MyComponent {

  allowedFormats = [ BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX /*, ...*/ ];

}
```

## Available format

```typescript

enum BarcodeFormat {
    /** Aztec 2D barcode format. */
    AZTEC,

    /** CODABAR 1D format. */
    CODABAR,

    /** Code 39 1D format. */
    CODE_39,

    /** Code 93 1D format. */
    CODE_93,

    /** Code 128 1D format. */
    CODE_128,

    /** Data Matrix 2D barcode format. */
    DATA_MATRIX,

    /** EAN-8 1D format. */
    EAN_8,

    /** EAN-13 1D format. */
    EAN_13,

    /** ITF (Interleaved Two of Five) 1D format. */
    ITF,

    /** MaxiCode 2D barcode format. */
    MAXICODE,

    /** PDF417 format. */
    PDF_417,

    /** QR Code 2D barcode format. */
    QR_CODE,

    /** RSS 14 */
    RSS_14,

    /** RSS EXPANDED */
    RSS_EXPANDED,

    /** UPC-A 1D format. */
    UPC_A,

    /** UPC-E 1D format. */
    UPC_E,

    /** UPC/EAN extension format. Not a stand-alone format. */
    UPC_EAN_EXTENSION

}

export default BarcodeFormat;

```

### Limitations

The component relies on zxing-typescript which currently supports some 2D and 1D barcode formats, but not all. On iOS-Devices camera access works only in native Safari and not in other Browsers (Chrome,...) or Apps that use an UIWebView or WKWebView. This is not a restriction of this component but of the limited WebRTC support by Apple.


### Advanced Usage

You can use some very cool attributes if you want:

<zxing-scanner
    [enable]="scannerEnabled"
    [(device)]="desiredDevice"
    [torch]="torch"
    (torchCompatible)="onTorchCompatible($event)"
    (camerasFound)="camerasFoundHandler($event)"
    (camerasNotFound)="camerasNotFoundHandler($event)"
    (scanSuccess)="scanSuccessHandler($event)"
    (scanError)="scanErrorHandler($event)"
    (scanFailure)="scanFailureHandler($event)"
    (scanComplete)="scanCompleteHandler($event)"
></zxing-scanner>


Logic-side (TypeScript)

```typescript
// on the template
// <zxing-scanner #scanner></zxing-scanner>

import { ViewChild } from '@angular/core';

export class AppComponent {

  @ViewChild('scanner', { static: false })
  scanner: ZXingScannerComponent;

  /**
   * Some method.
   */
  doSomething(): void {
    this.scanner.device = this.getBackCamera();
  }
 
  /**
   * Returns the back camera for ya.
   */
  getBackCamera() {
    return theBackCamera;
  }
}
```

Preview element's size

To customize CSS, please make use of Angular default piercing methods:

```css
:host zxing-scanner::ng-deep <some-element> {
  max-height: 70vh;
  width: 100vw;
  object-fit: contain;
}
```
Due to view-encapsulation it is required that the CSS-class that is to be used can be 'seen' from inside the scanner-component.


### Attributes :  

| Attribute                 | Default         | Description                                                                                                                                                      |  
|----------------------|:-----------------------------------:|:-------------------------| 
| enable             | true                    |Starts and Stops the scanning.              |
| autofocusEnabled             | true                    |Not working at the moment, needs ImageCapture API implementation.              |
| device             |                     |The video-device used for scanning (use one of the devices emitted by camerasFound), it can be set or emit some value.|
| torch experimental	             |                     |Can turn on/off the device flashlight.|
| torchCompatible experimental	             |                     |Tells if the device's torch is compatible w/ the scanner.|
| camerasFound             |                     |Emits an array of video-devices after view was initialized.|
| camerasNotFound             |                     |Emits a void event when cameras aren't found.|
| scanSuccess             |                     |Emits the result as string, after a valid QR code was scanned.|
| scanError             |                     |Emitted when some error occours during the scan proccess.|
| scanFailure	             |                     |Emitted when the scanner couldn't decode any relsult from the media stream.|
| scanComplete             |                     |Emitted after any scan attempt, no matter what.|


## Want to Contribute?

- Created something awesome, made this code better, added some functionality, or whatever (this is the hardest part).
- [Fork it](http://help.github.com/forking/).
- Create new branch to contribute your changes.
- Commit all your changes to your branch.
- Submit a [pull request](http://help.github.com/pull-requests/).

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

[mit]: https://github.com/weblineindia/AngularJS-QRCode-Scanner/blob/master/LICENSE

## Keywords

    angular-qrcode-scanner, angularjs-barcode-scanner, barcode-scanner, qrcode-scanner, angularjs-qrcode, qrcode

