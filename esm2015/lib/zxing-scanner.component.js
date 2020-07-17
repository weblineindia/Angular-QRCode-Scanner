import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild, } from '@angular/core';
import { ArgumentException, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { BrowserMultiFormatContinuousReader } from './browser-multi-format-continuous-reader';
let ZXingScannerComponent = class ZXingScannerComponent {
    /**
     * Constructor to build the object and do some DI.
     */
    constructor() {
        /**
         * How the preview element shoud be fit inside the :host container.
         */
        this.previewFitMode = 'cover';
        // instance based emitters
        this.autostarted = new EventEmitter();
        this.autostarting = new EventEmitter();
        this.torchCompatible = new EventEmitter();
        this.scanSuccess = new EventEmitter();
        this.scanFailure = new EventEmitter();
        this.scanError = new EventEmitter();
        this.scanComplete = new EventEmitter();
        this.camerasFound = new EventEmitter();
        this.camerasNotFound = new EventEmitter();
        this.permissionResponse = new EventEmitter(true);
        this.hasDevices = new EventEmitter();
        this.deviceChange = new EventEmitter();
        this._device = null;
        this._enabled = true;
        this._hints = new Map();
        this.autofocusEnabled = true;
        this.autostart = true;
        this.formats = [BarcodeFormat.QR_CODE];
        // computed data
        this.hasNavigator = typeof navigator !== 'undefined';
        this.isMediaDevicesSuported = this.hasNavigator && !!navigator.mediaDevices;
    }
    /**
     * Exposes the current code reader, so the user can use it's APIs.
     */
    get codeReader() {
        return this._codeReader;
    }
    /**
     * User device input
     */
    set device(device) {
        if (!device && device !== null) {
            throw new ArgumentException('The `device` must be a valid MediaDeviceInfo or null.');
        }
        if (this.isCurrentDevice(device)) {
            console.warn('Setting the same device is not allowed.');
            return;
        }
        if (this.isAutostarting) {
            // do not allow setting devices during auto-start, since it will set one and emit it.
            console.warn('Avoid setting a device during auto-start.');
            return;
        }
        if (!this.hasPermission) {
            console.warn('Permissions not set yet, waiting for them to be set to apply device change.');
            // this.permissionResponse
            //   .pipe(
            //     take(1),
            //     tap(() => console.log(`Permissions set, applying device change${device ? ` (${device.deviceId})` : ''}.`))
            //   )
            //   .subscribe(() => this.device = device);
            // return;
        }
        // in order to change the device the codeReader gotta be reseted
        this._reset();
        this._device = device;
        // if enabled, starts scanning
        if (this._enabled && device !== null) {
            this.scanFromDevice(device.deviceId);
        }
    }
    /**
     * User device acessor.
     */
    get device() {
        return this._device;
    }
    /**
     * Returns all the registered formats.
     */
    get formats() {
        return this.hints.get(DecodeHintType.POSSIBLE_FORMATS);
    }
    /**
     * Registers formats the scanner should support.
     *
     * @param input BarcodeFormat or case-insensitive string array.
     */
    set formats(input) {
        if (typeof input === 'string') {
            throw new Error('Invalid formats, make sure the [formats] input is a binding.');
        }
        // formats may be set from html template as BarcodeFormat or string array
        const formats = input.map(f => this.getBarcodeFormatOrFail(f));
        const hints = this.hints;
        // updates the hints
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        this.hints = hints;
    }
    /**
     * Returns all the registered hints.
     */
    get hints() {
        return this._hints;
    }
    /**
     * Does what it takes to set the hints.
     */
    set hints(hints) {
        this._hints = hints;
        // @note avoid restarting the code reader when possible
        // new instance with new hints.
        this.restart();
    }
    /**
     *
     */
    set isAutostarting(state) {
        this._isAutostarting = state;
        this.autostarting.next(state);
    }
    /**
     *
     */
    get isAutstarting() {
        return this._isAutostarting;
    }
    /**
     * Allow start scan or not.
     */
    set torch(on) {
        this.getCodeReader().setTorch(on);
    }
    /**
     * Allow start scan or not.
     */
    set enable(enabled) {
        this._enabled = Boolean(enabled);
        if (!this._enabled) {
            this.reset();
        }
        else if (this.device) {
            this.scanFromDevice(this.device.deviceId);
        }
    }
    /**
     * Tells if the scanner is enabled or not.
     */
    get enabled() {
        return this._enabled;
    }
    /**
     * If is `tryHarder` enabled.
     */
    get tryHarder() {
        return this.hints.get(DecodeHintType.TRY_HARDER);
    }
    /**
     * Enable/disable tryHarder hint.
     */
    set tryHarder(enable) {
        const hints = this.hints;
        if (enable) {
            hints.set(DecodeHintType.TRY_HARDER, true);
        }
        else {
            hints.delete(DecodeHintType.TRY_HARDER);
        }
        this.hints = hints;
    }
    /**
     * Gets and registers all cammeras.
     */
    askForPermission() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.hasNavigator) {
                console.error('@zxing/ngx-scanner', 'Can\'t ask permission, navigator is not present.');
                this.setPermission(null);
                return this.hasPermission;
            }
            if (!this.isMediaDevicesSuported) {
                console.error('@zxing/ngx-scanner', 'Can\'t get user media, this is not supported.');
                this.setPermission(null);
                return this.hasPermission;
            }
            let stream;
            let permission;
            try {
                // Will try to ask for permission
                stream = yield this.getAnyVideoDevice();
                permission = !!stream;
            }
            catch (err) {
                return this.handlePermissionException(err);
            }
            finally {
                this.terminateStream(stream);
            }
            this.setPermission(permission);
            // Returns the permission
            return permission;
        });
    }
    /**
     *
     */
    getAnyVideoDevice() {
        return navigator.mediaDevices.getUserMedia({ video: true });
    }
    /**
     * Terminates a stream and it's tracks.
     */
    terminateStream(stream) {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }
        stream = undefined;
    }
    /**
     * Initializes the component without starting the scanner.
     */
    initAutostartOff() {
        // do not ask for permission when autostart is off
        this.isAutostarting = null;
        // just update devices information
        this.updateVideoInputDevices();
    }
    /**
     * Initializes the component and starts the scanner.
     * Permissions are asked to accomplish that.
     */
    initAutostartOn() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.isAutostarting = true;
            let hasPermission;
            try {
                // Asks for permission before enumerating devices so it can get all the device's info
                hasPermission = yield this.askForPermission();
            }
            catch (e) {
                console.error('Exception occurred while asking for permission:', e);
                return;
            }
            // from this point, things gonna need permissions
            if (hasPermission) {
                const devices = yield this.updateVideoInputDevices();
                this.autostartScanner([...devices]);
            }
        });
    }
    /**
     * Checks if the given device is the current defined one.
     */
    isCurrentDevice(device) {
        return this.device && device && device.deviceId === this.device.deviceId;
    }
    /**
     * Executed after the view initialization.
     */
    ngAfterViewInit() {
        // makes torch availability information available to user
        this.getCodeReader().isTorchAvailable.subscribe(x => this.torchCompatible.emit(x));
        if (!this.autostart) {
            console.warn('New feature \'autostart\' disabled, be careful. Permissions and devices recovery has to be run manually.');
            // does the necessary configuration without autostarting
            this.initAutostartOff();
            return;
        }
        // configurates the component and starts the scanner
        this.initAutostartOn();
    }
    /**
     * Executes some actions before destroy the component.
     */
    ngOnDestroy() {
        this.reset();
    }
    /**
     * Stops old `codeReader` and starts scanning in a new one.
     */
    restart() {
        const prevDevice = this._reset();
        if (!prevDevice) {
            return;
        }
        // @note apenas necessario por enquanto causa da Torch
        this._codeReader = undefined;
        this.device = prevDevice;
    }
    /**
     * Discovers and updates known video input devices.
     */
    updateVideoInputDevices() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // permissions aren't needed to get devices, but to access them and their info
            const devices = (yield this.getCodeReader().listVideoInputDevices()) || [];
            const hasDevices = devices && devices.length > 0;
            // stores discovered devices and updates information
            this.hasDevices.next(hasDevices);
            this.camerasFound.next([...devices]);
            if (!hasDevices) {
                this.camerasNotFound.next();
            }
            return devices;
        });
    }
    /**
     * Starts the scanner with the back camera otherwise take the last
     * available device.
     */
    autostartScanner(devices) {
        const matcher = ({ label }) => /back|trás|rear|traseira|environment|ambiente/gi.test(label);
        // select the rear camera by default, otherwise take the last camera.
        const device = devices.find(matcher) || devices.pop();
        if (!device) {
            throw new Error('Impossible to autostart, no input devices available.');
        }
        this.device = device;
        // @note when listening to this change, callback code will sometimes run before the previous line.
        this.deviceChange.emit(device);
        this.isAutostarting = false;
        this.autostarted.next();
    }
    /**
     * Dispatches the scan success event.
     *
     * @param result the scan result.
     */
    dispatchScanSuccess(result) {
        this.scanSuccess.next(result.getText());
    }
    /**
     * Dispatches the scan failure event.
     */
    dispatchScanFailure(reason) {
        this.scanFailure.next(reason);
    }
    /**
     * Dispatches the scan error event.
     *
     * @param error the error thing.
     */
    dispatchScanError(error) {
        this.scanError.next(error);
    }
    /**
     * Dispatches the scan event.
     *
     * @param result the scan result.
     */
    dispatchScanComplete(result) {
        this.scanComplete.next(result);
    }
    /**
     * Returns the filtered permission.
     */
    handlePermissionException(err) {
        // failed to grant permission to video input
        console.error('@zxing/ngx-scanner', 'Error when asking for permission.', err);
        let permission;
        switch (err.name) {
            // usually caused by not secure origins
            case 'NotSupportedError':
                console.warn('@zxing/ngx-scanner', err.message);
                // could not claim
                permission = null;
                // can't check devices
                this.hasDevices.next(null);
                break;
            // user denied permission
            case 'NotAllowedError':
                console.warn('@zxing/ngx-scanner', err.message);
                // claimed and denied permission
                permission = false;
                // this means that input devices exists
                this.hasDevices.next(true);
                break;
            // the device has no attached input devices
            case 'NotFoundError':
                console.warn('@zxing/ngx-scanner', err.message);
                // no permissions claimed
                permission = null;
                // because there was no devices
                this.hasDevices.next(false);
                // tells the listener about the error
                this.camerasNotFound.next(err);
                break;
            case 'NotReadableError':
                console.warn('@zxing/ngx-scanner', 'Couldn\'t read the device(s)\'s stream, it\'s probably in use by another app.');
                // no permissions claimed
                permission = null;
                // there are devices, which I couldn't use
                this.hasDevices.next(false);
                // tells the listener about the error
                this.camerasNotFound.next(err);
                break;
            default:
                console.warn('@zxing/ngx-scanner', 'I was not able to define if I have permissions for camera or not.', err);
                // unknown
                permission = null;
                // this.hasDevices.next(undefined;
                break;
        }
        this.setPermission(permission);
        // tells the listener about the error
        this.permissionResponse.error(err);
        return permission;
    }
    /**
     * Returns a valid BarcodeFormat or fails.
     */
    getBarcodeFormatOrFail(format) {
        return typeof format === 'string'
            ? BarcodeFormat[format.trim().toUpperCase()]
            : format;
    }
    /**
     * Retorna um code reader, cria um se nenhume existe.
     */
    getCodeReader() {
        if (!this._codeReader) {
            this._codeReader = new BrowserMultiFormatContinuousReader(this.hints);
        }
        return this._codeReader;
    }
    /**
     * Starts the continuous scanning for the given device.
     *
     * @param deviceId The deviceId from the device.
     */
    scanFromDevice(deviceId) {
        const videoElement = this.previewElemRef.nativeElement;
        const codeReader = this.getCodeReader();
        const decodingStream = codeReader.continuousDecodeFromInputVideoDevice(deviceId, videoElement);
        if (!decodingStream) {
            throw new Error('Undefined decoding stream, aborting.');
        }
        const next = (x) => this._onDecodeResult(x.result, x.error);
        const error = (err) => this._onDecodeError(err);
        const complete = () => { this.reset(); console.log('completed'); };
        decodingStream.subscribe(next, error, complete);
    }
    /**
     * Handles decode errors.
     */
    _onDecodeError(err) {
        this.dispatchScanError(err);
        this.reset();
    }
    /**
     * Handles decode results.
     */
    _onDecodeResult(result, error) {
        if (result) {
            this.dispatchScanSuccess(result);
        }
        else {
            this.dispatchScanFailure(error);
        }
        this.dispatchScanComplete(result);
    }
    /**
     * Stops the code reader and returns the previous selected device.
     */
    _reset() {
        if (!this._codeReader) {
            return;
        }
        const device = this.device;
        // do not set this.device inside this method, it would create a recursive loop
        this._device = null;
        this._codeReader.reset();
        return device;
    }
    /**
     * Resets the scanner and emits device change.
     */
    reset() {
        this._reset();
        this.deviceChange.emit(null);
    }
    /**
     * Sets the permission value and emmits the event.
     */
    setPermission(hasPermission) {
        this.hasPermission = hasPermission;
        this.permissionResponse.next(hasPermission);
    }
};
tslib_1.__decorate([
    ViewChild('preview', { static: true }),
    tslib_1.__metadata("design:type", ElementRef)
], ZXingScannerComponent.prototype, "previewElemRef", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], ZXingScannerComponent.prototype, "autofocusEnabled", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "autostarted", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "autostarting", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], ZXingScannerComponent.prototype, "autostart", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], ZXingScannerComponent.prototype, "previewFitMode", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "torchCompatible", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "scanSuccess", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "scanFailure", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "scanError", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "scanComplete", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "camerasFound", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "camerasNotFound", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "permissionResponse", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "hasDevices", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", MediaDeviceInfo),
    tslib_1.__metadata("design:paramtypes", [MediaDeviceInfo])
], ZXingScannerComponent.prototype, "device", null);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", EventEmitter)
], ZXingScannerComponent.prototype, "deviceChange", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array),
    tslib_1.__metadata("design:paramtypes", [Array])
], ZXingScannerComponent.prototype, "formats", null);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean),
    tslib_1.__metadata("design:paramtypes", [Boolean])
], ZXingScannerComponent.prototype, "torch", null);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean),
    tslib_1.__metadata("design:paramtypes", [Boolean])
], ZXingScannerComponent.prototype, "enable", null);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean),
    tslib_1.__metadata("design:paramtypes", [Boolean])
], ZXingScannerComponent.prototype, "tryHarder", null);
ZXingScannerComponent = tslib_1.__decorate([
    Component({
        selector: 'zxing-scanner',
        template: "<video #preview [style.object-fit]=\"previewFitMode\">\n  <p>\n    Your browser does not support this feature, please try to upgrade it.\n  </p>\n  <p>\n    Seu navegador n\u00E3o suporta este recurso, por favor tente atualiz\u00E1-lo.\n  </p>\n</video>\n",
        changeDetection: ChangeDetectionStrategy.OnPush,
        styles: [":host{display:block}video{width:100%;height:auto;-o-object-fit:contain;object-fit:contain}"]
    }),
    tslib_1.__metadata("design:paramtypes", [])
], ZXingScannerComponent);
export { ZXingScannerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoienhpbmctc2Nhbm5lci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Aenhpbmcvbmd4LXNjYW5uZXIvIiwic291cmNlcyI6WyJsaWIvenhpbmctc2Nhbm5lci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFFTCx1QkFBdUIsRUFDdkIsU0FBUyxFQUNULFVBQVUsRUFDVixZQUFZLEVBQ1osS0FBSyxFQUVMLE1BQU0sRUFDTixTQUFTLEdBQ1YsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUNMLGlCQUFpQixFQUNqQixhQUFhLEVBQ2IsY0FBYyxFQUdmLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEIsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLE1BQU0sMENBQTBDLENBQUM7QUFTOUYsSUFBYSxxQkFBcUIsR0FBbEMsTUFBYSxxQkFBcUI7SUEwVGhDOztPQUVHO0lBQ0g7UUFyUEE7O1dBRUc7UUFFSCxtQkFBYyxHQUF5RCxPQUFPLENBQUM7UUFrUDdFLDBCQUEwQjtRQUMxQixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUMxQyxJ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Q1QsUUFBUSxFQUFFLGVBQWU7UUFDekIsMlFBQTZDO1FBRTdDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNOztLQUNoRCxDQUFDOztHQUNXLHFCQUFxQixDQTZ0QmpDO1NBN3RCWSxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBFbGVtZW50UmVmLFxuICBFdmVudEVtaXR0ZXIsXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIE91dHB1dCxcbiAgVmlld0NoaWxkLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtcbiAgQXJndW1lbnRFeGNlcHRpb24sXG4gIEJhcmNvZGVGb3JtYXQsXG4gIERlY29kZUhpbnRUeXBlLFxuICBFeGNlcHRpb24sXG4gIFJlc3VsdFxufSBmcm9tICdAenhpbmcvbGlicmFyeSc7XG5cbmltcG9ydCB7IEJyb3dzZXJNdWx0aUZvcm1hdENvbnRpbnVvdXNSZWFkZXIgfSBmcm9tICcuL2Jyb3dzZXItbXVsdGktZm9ybWF0LWNvbnRpbnVvdXMtcmVhZGVyJztcbmltcG9ydCB7IFJlc3VsdEFuZEVycm9yIH0gZnJvbSAnLi9SZXN1bHRBbmRFcnJvcic7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3p4aW5nLXNjYW5uZXInLFxuICB0ZW1wbGF0ZVVybDogJy4venhpbmctc2Nhbm5lci5jb21wb25lbnQuaHRtbCcsXG4gIHN0eWxlVXJsczogWycuL3p4aW5nLXNjYW5uZXIuY29tcG9uZW50LnNjc3MnXSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgWlhpbmdTY2FubmVyQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcblxuICAvKipcbiAgICogU3VwcG9ydGVkIEhpbnRzIG1hcC5cbiAgICovXG4gIHByaXZhdGUgX2hpbnRzOiBNYXA8RGVjb2RlSGludFR5cGUsIGFueT4gfCBudWxsO1xuXG4gIC8qKlxuICAgKiBUaGUgWlhpbmcgY29kZSByZWFkZXIuXG4gICAqL1xuICBwcml2YXRlIF9jb2RlUmVhZGVyOiBCcm93c2VyTXVsdGlGb3JtYXRDb250aW51b3VzUmVhZGVyO1xuXG4gIC8qKlxuICAgKiBUaGUgZGV2aWNlIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gc2NhbiB0aGluZ3MuXG4gICAqL1xuICBwcml2YXRlIF9kZXZpY2U6IE1lZGlhRGV2aWNlSW5mbztcblxuICAvKipcbiAgICogVGhlIGRldmljZSB0aGF0IHNob3VsZCBiZSB1c2VkIHRvIHNjYW4gdGhpbmdzLlxuICAgKi9cbiAgcHJpdmF0ZSBfZW5hYmxlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICpcbiAgICovXG4gIHByaXZhdGUgX2lzQXV0b3N0YXJ0aW5nOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBIYXMgYG5hdmlnYXRvcmAgYWNjZXNzLlxuICAgKi9cbiAgcHJpdmF0ZSBoYXNOYXZpZ2F0b3I6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFNheXMgaWYgc29tZSBuYXRpdmUgQVBJIGlzIHN1cHBvcnRlZC5cbiAgICovXG4gIHByaXZhdGUgaXNNZWRpYURldmljZXNTdXBvcnRlZDogYm9vbGVhbjtcblxuICAvKipcbiAgICogSWYgdGhlIHVzZXItYWdlbnQgYWxsb3dlZCB0aGUgdXNlIG9mIHRoZSBjYW1lcmEgb3Igbm90LlxuICAgKi9cbiAgcHJpdmF0ZSBoYXNQZXJtaXNzaW9uOiBib29sZWFuIHwgbnVsbDtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBwcmV2aWV3IGVsZW1lbnQsIHNob3VsZCBiZSB0aGUgYHZpZGVvYCB0YWcuXG4gICAqL1xuICBAVmlld0NoaWxkKCdwcmV2aWV3JywgeyBzdGF0aWM6IHRydWUgfSlcbiAgcHJldmlld0VsZW1SZWY6IEVsZW1lbnRSZWY8SFRNTFZpZGVvRWxlbWVudD47XG5cbiAgLyoqXG4gICAqIEVuYWJsZSBvciBkaXNhYmxlIGF1dG9mb2N1cyBvZiB0aGUgY2FtZXJhIChtaWdodCBoYXZlIGFuIGltcGFjdCBvbiBwZXJmb3JtYW5jZSlcbiAgICovXG4gIEBJbnB1dCgpXG4gIGF1dG9mb2N1c0VuYWJsZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gYW5kIGlmIHRoZSBzY2FubmVyIGlzIGF1dG9zdGFydGVkLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIGF1dG9zdGFydGVkOiBFdmVudEVtaXR0ZXI8dm9pZD47XG5cbiAgLyoqXG4gICAqIFRydWUgZHVyaW5nIGF1dG9zdGFydCBhbmQgZmFsc2UgYWZ0ZXIuIEl0IHdpbGwgYmUgbnVsbCBpZiB3b24ndCBhdXRvc3RhcnQgYXQgYWxsLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIGF1dG9zdGFydGluZzogRXZlbnRFbWl0dGVyPGJvb2xlYW4gfCBudWxsPjtcblxuICAvKipcbiAgICogSWYgdGhlIHNjYW5uZXIgc2hvdWxkIGF1dG9zdGFydCB3aXRoIHRoZSBmaXJzdCBhdmFpbGFibGUgZGV2aWNlLlxuICAgKi9cbiAgQElucHV0KClcbiAgYXV0b3N0YXJ0OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBIb3cgdGhlIHByZXZpZXcgZWxlbWVudCBzaG91ZCBiZSBmaXQgaW5zaWRlIHRoZSA6aG9zdCBjb250YWluZXIuXG4gICAqL1xuICBASW5wdXQoKVxuICBwcmV2aWV3Rml0TW9kZTogJ2ZpbGwnIHwgJ2NvbnRhaW4nIHwgJ2NvdmVyJyB8ICdzY2FsZS1kb3duJyB8ICdub25lJyA9ICdjb3Zlcic7XG5cbiAgLyoqXG4gICAqIEVtaXR0cyBldmVudHMgd2hlbiB0aGUgdG9yY2ggY29tcGF0aWJpbGl0eSBpcyBjaGFuZ2VkLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIHRvcmNoQ29tcGF0aWJsZTogRXZlbnRFbWl0dGVyPGJvb2xlYW4+O1xuXG4gIC8qKlxuICAgKiBFbWl0dHMgZXZlbnRzIHdoZW4gYSBzY2FuIGlzIHN1Y2Nlc3NmdWwgcGVyZm9ybWVkLCB3aWxsIGluamVjdCB0aGUgc3RyaW5nIHZhbHVlIG9mIHRoZSBRUi1jb2RlIHRvIHRoZSBjYWxsYmFjay5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBzY2FuU3VjY2VzczogRXZlbnRFbWl0dGVyPHN0cmluZz47XG5cbiAgLyoqXG4gICAqIEVtaXR0cyBldmVudHMgd2hlbiBhIHNjYW4gZmFpbHMgd2l0aG91dCBlcnJvcnMsIHVzZWZ1bGwgdG8ga25vdyBob3cgbXVjaCBzY2FuIHRyaWVzIHdoZXJlIG1hZGUuXG4gICAqL1xuICBAT3V0cHV0KClcbiAgc2NhbkZhaWx1cmU6IEV2ZW50RW1pdHRlcjxFeGNlcHRpb24gfCB1bmRlZmluZWQ+O1xuXG4gIC8qKlxuICAgKiBFbWl0dHMgZXZlbnRzIHdoZW4gYSBzY2FuIHRocm93cyBzb21lIGVycm9yLCB3aWxsIGluamVjdCB0aGUgZXJyb3IgdG8gdGhlIGNhbGxiYWNrLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIHNjYW5FcnJvcjogRXZlbnRFbWl0dGVyPEVycm9yPjtcblxuICAvKipcbiAgICogRW1pdHRzIGV2ZW50cyB3aGVuIGEgc2NhbiBpcyBwZXJmb3JtZWQsIHdpbGwgaW5qZWN0IHRoZSBSZXN1bHQgdmFsdWUgb2YgdGhlIFFSLWNvZGUgc2NhbiAoaWYgYXZhaWxhYmxlKSB0byB0aGUgY2FsbGJhY2suXG4gICAqL1xuICBAT3V0cHV0KClcbiAgc2NhbkNvbXBsZXRlOiBFdmVudEVtaXR0ZXI8UmVzdWx0PjtcblxuICAvKipcbiAgICogRW1pdHRzIGV2ZW50cyB3aGVuIG5vIGNhbWVyYXMgYXJlIGZvdW5kLCB3aWxsIGluamVjdCBhbiBleGNlcHRpb24gKGlmIGF2YWlsYWJsZSkgdG8gdGhlIGNhbGxiYWNrLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIGNhbWVyYXNGb3VuZDogRXZlbnRFbWl0dGVyPE1lZGlhRGV2aWNlSW5mb1tdPjtcblxuICAvKipcbiAgICogRW1pdHRzIGV2ZW50cyB3aGVuIG5vIGNhbWVyYXMgYXJlIGZvdW5kLCB3aWxsIGluamVjdCBhbiBleGNlcHRpb24gKGlmIGF2YWlsYWJsZSkgdG8gdGhlIGNhbGxiYWNrLlxuICAgKi9cbiAgQE91dHB1dCgpXG4gIGNhbWVyYXNOb3RGb3VuZDogRXZlbnRFbWl0dGVyPGFueT47XG5cbiAgLyoqXG4gICAqIEVtaXR0cyBldmVudHMgd2hlbiB0aGUgdXNlcnMgYW5zd2VycyBmb3IgcGVybWlzc2lvbi5cbiAgICovXG4gIEBPdXRwdXQoKVxuICBwZXJtaXNzaW9uUmVzcG9uc2U6IEV2ZW50RW1pdHRlcjxib29sZWFuPjtcblxuICAvKipcbiAgICogRW1pdHRzIGV2ZW50cyB3aGVuIGhhcyBkZXZpY2VzIHN0YXR1cyBpcyB1cGRhdGUuXG4gICAqL1xuICBAT3V0cHV0KClcbiAgaGFzRGV2aWNlczogRXZlbnRFbWl0dGVyPGJvb2xlYW4+O1xuXG4gIC8qKlxuICAgKiBFeHBvc2VzIHRoZSBjdXJyZW50IGNvZGUgcmVhZGVyLCBzbyB0aGUgdXNlciBjYW4gdXNlIGl0J3MgQVBJcy5cbiAgICovXG4gIGdldCBjb2RlUmVhZGVyKCk6IEJyb3dzZXJNdWx0aUZvcm1hdENvbnRpbnVvdXNSZWFkZXIge1xuICAgIHJldHVybiB0aGlzLl9jb2RlUmVhZGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFVzZXIgZGV2aWNlIGlucHV0XG4gICAqL1xuICBASW5wdXQoKVxuICBzZXQgZGV2aWNlKGRldmljZTogTWVkaWFEZXZpY2VJbmZvIHwgbnVsbCkge1xuXG4gICAgaWYgKCFkZXZpY2UgJiYgZGV2aWNlICE9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgQXJndW1lbnRFeGNlcHRpb24oJ1RoZSBgZGV2aWNlYCBtdXN0IGJlIGEgdmFsaWQgTWVkaWFEZXZpY2VJbmZvIG9yIG51bGwuJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNDdXJyZW50RGV2aWNlKGRldmljZSkpIHtcbiAgICAgIGNvbnNvbGUud2FybignU2V0dGluZyB0aGUgc2FtZSBkZXZpY2UgaXMgbm90IGFsbG93ZWQuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuaXNBdXRvc3RhcnRpbmcpIHtcbiAgICAgIC8vIGRvIG5vdCBhbGxvdyBzZXR0aW5nIGRldmljZXMgZHVyaW5nIGF1dG8tc3RhcnQsIHNpbmNlIGl0IHdpbGwgc2V0IG9uZSBhbmQgZW1pdCBpdC5cbiAgICAgIGNvbnNvbGUud2FybignQXZvaWQgc2V0dGluZyBhIGRldmljZSBkdXJpbmcgYXV0by1zdGFydC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaGFzUGVybWlzc2lvbikge1xuICAgICAgY29uc29sZS53YXJuKCdQZXJtaXNzaW9ucyBub3Qgc2V0IHlldCwgd2FpdGluZyBmb3IgdGhlbSB0byBiZSBzZXQgdG8gYXBwbHkgZGV2aWNlIGNoYW5nZS4nKTtcbiAgICAgIC8vIHRoaXMucGVybWlzc2lvblJlc3BvbnNlXG4gICAgICAvLyAgIC5waXBlKFxuICAgICAgLy8gICAgIHRha2UoMSksXG4gICAgICAvLyAgICAgdGFwKCgpID0+IGNvbnNvbGUubG9nKGBQZXJtaXNzaW9ucyBzZXQsIGFwcGx5aW5nIGRldmljZSBjaGFuZ2Uke2RldmljZSA/IGAgKCR7ZGV2aWNlLmRldmljZUlkfSlgIDogJyd9LmApKVxuICAgICAgLy8gICApXG4gICAgICAvLyAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5kZXZpY2UgPSBkZXZpY2UpO1xuICAgICAgLy8gcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGluIG9yZGVyIHRvIGNoYW5nZSB0aGUgZGV2aWNlIHRoZSBjb2RlUmVhZGVyIGdvdHRhIGJlIHJlc2V0ZWRcbiAgICB0aGlzLl9yZXNldCgpO1xuXG4gICAgdGhpcy5fZGV2aWNlID0gZGV2aWNlO1xuXG4gICAgLy8gaWYgZW5hYmxlZCwgc3RhcnRzIHNjYW5uaW5nXG4gICAgaWYgKHRoaXMuX2VuYWJsZWQgJiYgZGV2aWNlICE9PSBudWxsKSB7XG4gICAgICB0aGlzLnNjYW5Gcm9tRGV2aWNlKGRldmljZS5kZXZpY2VJZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEVtaXRzIHdoZW4gdGhlIGN1cnJlbnQgZGV2aWNlIGlzIGNoYW5nZWQuXG4gICAqL1xuICBAT3V0cHV0KClcbiAgZGV2aWNlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8TWVkaWFEZXZpY2VJbmZvPjtcblxuICAvKipcbiAgICogVXNlciBkZXZpY2UgYWNlc3Nvci5cbiAgICovXG4gIGdldCBkZXZpY2UoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RldmljZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFsbCB0aGUgcmVnaXN0ZXJlZCBmb3JtYXRzLlxuICAgKi9cbiAgZ2V0IGZvcm1hdHMoKTogQmFyY29kZUZvcm1hdFtdIHtcbiAgICByZXR1cm4gdGhpcy5oaW50cy5nZXQoRGVjb2RlSGludFR5cGUuUE9TU0lCTEVfRk9STUFUUyk7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGZvcm1hdHMgdGhlIHNjYW5uZXIgc2hvdWxkIHN1cHBvcnQuXG4gICAqXG4gICAqIEBwYXJhbSBpbnB1dCBCYXJjb2RlRm9ybWF0IG9yIGNhc2UtaW5zZW5zaXRpdmUgc3RyaW5nIGFycmF5LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGZvcm1hdHMoaW5wdXQ6IEJhcmNvZGVGb3JtYXRbXSkge1xuXG4gICAgaWYgKHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBmb3JtYXRzLCBtYWtlIHN1cmUgdGhlIFtmb3JtYXRzXSBpbnB1dCBpcyBhIGJpbmRpbmcuJyk7XG4gICAgfVxuXG4gICAgLy8gZm9ybWF0cyBtYXkgYmUgc2V0IGZyb20gaHRtbCB0ZW1wbGF0ZSBhcyBCYXJjb2RlRm9ybWF0IG9yIHN0cmluZyBhcnJheVxuICAgIGNvbnN0IGZvcm1hdHMgPSBpbnB1dC5tYXAoZiA9PiB0aGlzLmdldEJhcmNvZGVGb3JtYXRPckZhaWwoZikpO1xuXG4gICAgY29uc3QgaGludHMgPSB0aGlzLmhpbnRzO1xuXG4gICAgLy8gdXBkYXRlcyB0aGUgaGludHNcbiAgICBoaW50cy5zZXQoRGVjb2RlSGludFR5cGUuUE9TU0lCTEVfRk9STUFUUywgZm9ybWF0cyk7XG5cbiAgICB0aGlzLmhpbnRzID0gaGludHM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgdGhlIHJlZ2lzdGVyZWQgaGludHMuXG4gICAqL1xuICBnZXQgaGludHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hpbnRzO1xuICB9XG5cbiAgLyoqXG4gICAqIERvZXMgd2hhdCBpdCB0YWtlcyB0byBzZXQgdGhlIGhpbnRzLlxuICAgKi9cbiAgc2V0IGhpbnRzKGhpbnRzOiBNYXA8RGVjb2RlSGludFR5cGUsIGFueT4pIHtcblxuICAgIHRoaXMuX2hpbnRzID0gaGludHM7XG5cbiAgICAvLyBAbm90ZSBhdm9pZCByZXN0YXJ0aW5nIHRoZSBjb2RlIHJlYWRlciB3aGVuIHBvc3NpYmxlXG5cbiAgICAvLyBuZXcgaW5zdGFuY2Ugd2l0aCBuZXcgaGludHMuXG4gICAgdGhpcy5yZXN0YXJ0KCk7XG4gIH1cblxuICAvKipcbiAgICpcbiAgICovXG4gIHNldCBpc0F1dG9zdGFydGluZyhzdGF0ZTogYm9vbGVhbiB8IG51bGwpIHtcbiAgICB0aGlzLl9pc0F1dG9zdGFydGluZyA9IHN0YXRlO1xuICAgIHRoaXMuYXV0b3N0YXJ0aW5nLm5leHQoc3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBnZXQgaXNBdXRzdGFydGluZygpOiBib29sZWFuIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQXV0b3N0YXJ0aW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93IHN0YXJ0IHNjYW4gb3Igbm90LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IHRvcmNoKG9uOiBib29sZWFuKSB7XG4gICAgdGhpcy5nZXRDb2RlUmVhZGVyKCkuc2V0VG9yY2gob24pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsbG93IHN0YXJ0IHNjYW4gb3Igbm90LlxuICAgKi9cbiAgQElucHV0KClcbiAgc2V0IGVuYWJsZShlbmFibGVkOiBib29sZWFuKSB7XG5cbiAgICB0aGlzLl9lbmFibGVkID0gQm9vbGVhbihlbmFibGVkKTtcblxuICAgIGlmICghdGhpcy5fZW5hYmxlZCkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5kZXZpY2UpIHtcbiAgICAgIHRoaXMuc2NhbkZyb21EZXZpY2UodGhpcy5kZXZpY2UuZGV2aWNlSWQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUZWxscyBpZiB0aGUgc2Nhbm5lciBpcyBlbmFibGVkIG9yIG5vdC5cbiAgICovXG4gIGdldCBlbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9lbmFibGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIGlzIGB0cnlIYXJkZXJgIGVuYWJsZWQuXG4gICAqL1xuICBnZXQgdHJ5SGFyZGVyKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmhpbnRzLmdldChEZWNvZGVIaW50VHlwZS5UUllfSEFSREVSKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGUvZGlzYWJsZSB0cnlIYXJkZXIgaGludC5cbiAgICovXG4gIEBJbnB1dCgpXG4gIHNldCB0cnlIYXJkZXIoZW5hYmxlOiBib29sZWFuKSB7XG5cbiAgICBjb25zdCBoaW50cyA9IHRoaXMuaGludHM7XG5cbiAgICBpZiAoZW5hYmxlKSB7XG4gICAgICBoaW50cy5zZXQoRGVjb2RlSGludFR5cGUuVFJZX0hBUkRFUiwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhpbnRzLmRlbGV0ZShEZWNvZGVIaW50VHlwZS5UUllfSEFSREVSKTtcbiAgICB9XG5cbiAgICB0aGlzLmhpbnRzID0gaGludHM7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3RydWN0b3IgdG8gYnVpbGQgdGhlIG9iamVjdCBhbmQgZG8gc29tZSBESS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIGluc3RhbmNlIGJhc2VkIGVtaXR0ZXJzXG4gICAgdGhpcy5hdXRvc3RhcnRlZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmF1dG9zdGFydGluZyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLnRvcmNoQ29tcGF0aWJsZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLnNjYW5TdWNjZXNzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuc2NhbkZhaWx1cmUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5zY2FuRXJyb3IgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5zY2FuQ29tcGxldGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5jYW1lcmFzRm91bmQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5jYW1lcmFzTm90Rm91bmQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5wZXJtaXNzaW9uUmVzcG9uc2UgPSBuZXcgRXZlbnRFbWl0dGVyKHRydWUpO1xuICAgIHRoaXMuaGFzRGV2aWNlcyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmRldmljZUNoYW5nZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcblxuICAgIHRoaXMuX2RldmljZSA9IG51bGw7XG4gICAgdGhpcy5fZW5hYmxlZCA9IHRydWU7XG4gICAgdGhpcy5faGludHMgPSBuZXcgTWFwPERlY29kZUhpbnRUeXBlLCBhbnk+KCk7XG4gICAgdGhpcy5hdXRvZm9jdXNFbmFibGVkID0gdHJ1ZTtcbiAgICB0aGlzLmF1dG9zdGFydCA9IHRydWU7XG4gICAgdGhpcy5mb3JtYXRzID0gW0JhcmNvZGVGb3JtYXQuUVJfQ09ERV07XG5cbiAgICAvLyBjb21wdXRlZCBkYXRhXG4gICAgdGhpcy5oYXNOYXZpZ2F0b3IgPSB0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJztcbiAgICB0aGlzLmlzTWVkaWFEZXZpY2VzU3Vwb3J0ZWQgPSB0aGlzLmhhc05hdmlnYXRvciAmJiAhIW5hdmlnYXRvci5tZWRpYURldmljZXM7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbmQgcmVnaXN0ZXJzIGFsbCBjYW1tZXJhcy5cbiAgICovXG4gIGFzeW5jIGFza0ZvclBlcm1pc3Npb24oKTogUHJvbWlzZTxib29sZWFuPiB7XG5cbiAgICBpZiAoIXRoaXMuaGFzTmF2aWdhdG9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdAenhpbmcvbmd4LXNjYW5uZXInLCAnQ2FuXFwndCBhc2sgcGVybWlzc2lvbiwgbmF2aWdhdG9yIGlzIG5vdCBwcmVzZW50LicpO1xuICAgICAgdGhpcy5zZXRQZXJtaXNzaW9uKG51bGwpO1xuICAgICAgcmV0dXJuIHRoaXMuaGFzUGVybWlzc2lvbjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNNZWRpYURldmljZXNTdXBvcnRlZCkge1xuICAgICAgY29uc29sZS5lcnJvcignQHp4aW5nL25neC1zY2FubmVyJywgJ0NhblxcJ3QgZ2V0IHVzZXIgbWVkaWEsIHRoaXMgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgIHRoaXMuc2V0UGVybWlzc2lvbihudWxsKTtcbiAgICAgIHJldHVybiB0aGlzLmhhc1Blcm1pc3Npb247XG4gICAgfVxuXG4gICAgbGV0IHN0cmVhbTogTWVkaWFTdHJlYW07XG4gICAgbGV0IHBlcm1pc3Npb246IGJvb2xlYW47XG5cbiAgICB0cnkge1xuICAgICAgLy8gV2lsbCB0cnkgdG8gYXNrIGZvciBwZXJtaXNzaW9uXG4gICAgICBzdHJlYW0gPSBhd2FpdCB0aGlzLmdldEFueVZpZGVvRGV2aWNlKCk7XG4gICAgICBwZXJtaXNzaW9uID0gISFzdHJlYW07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4gdGhpcy5oYW5kbGVQZXJtaXNzaW9uRXhjZXB0aW9uKGVycik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMudGVybWluYXRlU3RyZWFtKHN0cmVhbSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZXRQZXJtaXNzaW9uKHBlcm1pc3Npb24pO1xuXG4gICAgLy8gUmV0dXJucyB0aGUgcGVybWlzc2lvblxuICAgIHJldHVybiBwZXJtaXNzaW9uO1xuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBnZXRBbnlWaWRlb0RldmljZSgpOiBQcm9taXNlPE1lZGlhU3RyZWFtPiB7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHsgdmlkZW86IHRydWUgfSk7XG4gIH1cblxuICAvKipcbiAgICogVGVybWluYXRlcyBhIHN0cmVhbSBhbmQgaXQncyB0cmFja3MuXG4gICAqL1xuICBwcml2YXRlIHRlcm1pbmF0ZVN0cmVhbShzdHJlYW06IE1lZGlhU3RyZWFtKSB7XG5cbiAgICBpZiAoc3RyZWFtKSB7XG4gICAgICBzdHJlYW0uZ2V0VHJhY2tzKCkuZm9yRWFjaCh0ID0+IHQuc3RvcCgpKTtcbiAgICB9XG5cbiAgICBzdHJlYW0gPSB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGNvbXBvbmVudCB3aXRob3V0IHN0YXJ0aW5nIHRoZSBzY2FubmVyLlxuICAgKi9cbiAgcHJpdmF0ZSBpbml0QXV0b3N0YXJ0T2ZmKCk6IHZvaWQge1xuXG4gICAgLy8gZG8gbm90IGFzayBmb3IgcGVybWlzc2lvbiB3aGVuIGF1dG9zdGFydCBpcyBvZmZcbiAgICB0aGlzLmlzQXV0b3N0YXJ0aW5nID0gbnVsbDtcblxuICAgIC8vIGp1c3QgdXBkYXRlIGRldmljZXMgaW5mb3JtYXRpb25cbiAgICB0aGlzLnVwZGF0ZVZpZGVvSW5wdXREZXZpY2VzKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGNvbXBvbmVudCBhbmQgc3RhcnRzIHRoZSBzY2FubmVyLlxuICAgKiBQZXJtaXNzaW9ucyBhcmUgYXNrZWQgdG8gYWNjb21wbGlzaCB0aGF0LlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBpbml0QXV0b3N0YXJ0T24oKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICB0aGlzLmlzQXV0b3N0YXJ0aW5nID0gdHJ1ZTtcblxuICAgIGxldCBoYXNQZXJtaXNzaW9uOiBib29sZWFuO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIEFza3MgZm9yIHBlcm1pc3Npb24gYmVmb3JlIGVudW1lcmF0aW5nIGRldmljZXMgc28gaXQgY2FuIGdldCBhbGwgdGhlIGRldmljZSdzIGluZm9cbiAgICAgIGhhc1Blcm1pc3Npb24gPSBhd2FpdCB0aGlzLmFza0ZvclBlcm1pc3Npb24oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFeGNlcHRpb24gb2NjdXJyZWQgd2hpbGUgYXNraW5nIGZvciBwZXJtaXNzaW9uOicsIGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGZyb20gdGhpcyBwb2ludCwgdGhpbmdzIGdvbm5hIG5lZWQgcGVybWlzc2lvbnNcbiAgICBpZiAoaGFzUGVybWlzc2lvbikge1xuICAgICAgY29uc3QgZGV2aWNlcyA9IGF3YWl0IHRoaXMudXBkYXRlVmlkZW9JbnB1dERldmljZXMoKTtcbiAgICAgIHRoaXMuYXV0b3N0YXJ0U2Nhbm5lcihbLi4uZGV2aWNlc10pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIGRldmljZSBpcyB0aGUgY3VycmVudCBkZWZpbmVkIG9uZS5cbiAgICovXG4gIGlzQ3VycmVudERldmljZShkZXZpY2U6IE1lZGlhRGV2aWNlSW5mbykge1xuICAgIHJldHVybiB0aGlzLmRldmljZSAmJiBkZXZpY2UgJiYgZGV2aWNlLmRldmljZUlkID09PSB0aGlzLmRldmljZS5kZXZpY2VJZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlZCBhZnRlciB0aGUgdmlldyBpbml0aWFsaXphdGlvbi5cbiAgICovXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcblxuICAgIC8vIG1ha2VzIHRvcmNoIGF2YWlsYWJpbGl0eSBpbmZvcm1hdGlvbiBhdmFpbGFibGUgdG8gdXNlclxuICAgIHRoaXMuZ2V0Q29kZVJlYWRlcigpLmlzVG9yY2hBdmFpbGFibGUuc3Vic2NyaWJlKHggPT4gdGhpcy50b3JjaENvbXBhdGlibGUuZW1pdCh4KSk7XG5cbiAgICBpZiAoIXRoaXMuYXV0b3N0YXJ0KSB7XG4gICAgICBjb25zb2xlLndhcm4oJ05ldyBmZWF0dXJlIFxcJ2F1dG9zdGFydFxcJyBkaXNhYmxlZCwgYmUgY2FyZWZ1bC4gUGVybWlzc2lvbnMgYW5kIGRldmljZXMgcmVjb3ZlcnkgaGFzIHRvIGJlIHJ1biBtYW51YWxseS4nKTtcblxuICAgICAgLy8gZG9lcyB0aGUgbmVjZXNzYXJ5IGNvbmZpZ3VyYXRpb24gd2l0aG91dCBhdXRvc3RhcnRpbmdcbiAgICAgIHRoaXMuaW5pdEF1dG9zdGFydE9mZigpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gY29uZmlndXJhdGVzIHRoZSBjb21wb25lbnQgYW5kIHN0YXJ0cyB0aGUgc2Nhbm5lclxuICAgIHRoaXMuaW5pdEF1dG9zdGFydE9uKCk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgc29tZSBhY3Rpb25zIGJlZm9yZSBkZXN0cm95IHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgb2xkIGBjb2RlUmVhZGVyYCBhbmQgc3RhcnRzIHNjYW5uaW5nIGluIGEgbmV3IG9uZS5cbiAgICovXG4gIHJlc3RhcnQoKTogdm9pZCB7XG5cbiAgICBjb25zdCBwcmV2RGV2aWNlID0gdGhpcy5fcmVzZXQoKTtcblxuICAgIGlmICghcHJldkRldmljZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEBub3RlIGFwZW5hcyBuZWNlc3NhcmlvIHBvciBlbnF1YW50byBjYXVzYSBkYSBUb3JjaFxuICAgIHRoaXMuX2NvZGVSZWFkZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5kZXZpY2UgPSBwcmV2RGV2aWNlO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc2NvdmVycyBhbmQgdXBkYXRlcyBrbm93biB2aWRlbyBpbnB1dCBkZXZpY2VzLlxuICAgKi9cbiAgYXN5bmMgdXBkYXRlVmlkZW9JbnB1dERldmljZXMoKTogUHJvbWlzZTxNZWRpYURldmljZUluZm9bXT4ge1xuXG4gICAgLy8gcGVybWlzc2lvbnMgYXJlbid0IG5lZWRlZCB0byBnZXQgZGV2aWNlcywgYnV0IHRvIGFjY2VzcyB0aGVtIGFuZCB0aGVpciBpbmZvXG4gICAgY29uc3QgZGV2aWNlcyA9IGF3YWl0IHRoaXMuZ2V0Q29kZVJlYWRlcigpLmxpc3RWaWRlb0lucHV0RGV2aWNlcygpIHx8IFtdO1xuICAgIGNvbnN0IGhhc0RldmljZXMgPSBkZXZpY2VzICYmIGRldmljZXMubGVuZ3RoID4gMDtcblxuICAgIC8vIHN0b3JlcyBkaXNjb3ZlcmVkIGRldmljZXMgYW5kIHVwZGF0ZXMgaW5mb3JtYXRpb25cbiAgICB0aGlzLmhhc0RldmljZXMubmV4dChoYXNEZXZpY2VzKTtcbiAgICB0aGlzLmNhbWVyYXNGb3VuZC5uZXh0KFsuLi5kZXZpY2VzXSk7XG5cbiAgICBpZiAoIWhhc0RldmljZXMpIHtcbiAgICAgIHRoaXMuY2FtZXJhc05vdEZvdW5kLm5leHQoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGV2aWNlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHNjYW5uZXIgd2l0aCB0aGUgYmFjayBjYW1lcmEgb3RoZXJ3aXNlIHRha2UgdGhlIGxhc3RcbiAgICogYXZhaWxhYmxlIGRldmljZS5cbiAgICovXG4gIHByaXZhdGUgYXV0b3N0YXJ0U2Nhbm5lcihkZXZpY2VzOiBNZWRpYURldmljZUluZm9bXSkge1xuXG4gICAgY29uc3QgbWF0Y2hlciA9ICh7IGxhYmVsIH0pID0+IC9iYWNrfHRyw6FzfHJlYXJ8dHJhc2VpcmF8ZW52aXJvbm1lbnR8YW1iaWVudGUvZ2kudGVzdChsYWJlbCk7XG5cbiAgICAvLyBzZWxlY3QgdGhlIHJlYXIgY2FtZXJhIGJ5IGRlZmF1bHQsIG90aGVyd2lzZSB0YWtlIHRoZSBsYXN0IGNhbWVyYS5cbiAgICBjb25zdCBkZXZpY2UgPSBkZXZpY2VzLmZpbmQobWF0Y2hlcikgfHwgZGV2aWNlcy5wb3AoKTtcblxuICAgIGlmICghZGV2aWNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ltcG9zc2libGUgdG8gYXV0b3N0YXJ0LCBubyBpbnB1dCBkZXZpY2VzIGF2YWlsYWJsZS4nKTtcbiAgICB9XG5cbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICAvLyBAbm90ZSB3aGVuIGxpc3RlbmluZyB0byB0aGlzIGNoYW5nZSwgY2FsbGJhY2sgY29kZSB3aWxsIHNvbWV0aW1lcyBydW4gYmVmb3JlIHRoZSBwcmV2aW91cyBsaW5lLlxuICAgIHRoaXMuZGV2aWNlQ2hhbmdlLmVtaXQoZGV2aWNlKTtcblxuICAgIHRoaXMuaXNBdXRvc3RhcnRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmF1dG9zdGFydGVkLm5leHQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIHRoZSBzY2FuIHN1Y2Nlc3MgZXZlbnQuXG4gICAqXG4gICAqIEBwYXJhbSByZXN1bHQgdGhlIHNjYW4gcmVzdWx0LlxuICAgKi9cbiAgcHJpdmF0ZSBkaXNwYXRjaFNjYW5TdWNjZXNzKHJlc3VsdDogUmVzdWx0KTogdm9pZCB7XG4gICAgdGhpcy5zY2FuU3VjY2Vzcy5uZXh0KHJlc3VsdC5nZXRUZXh0KCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgdGhlIHNjYW4gZmFpbHVyZSBldmVudC5cbiAgICovXG4gIHByaXZhdGUgZGlzcGF0Y2hTY2FuRmFpbHVyZShyZWFzb24/OiBFeGNlcHRpb24pOiB2b2lkIHtcbiAgICB0aGlzLnNjYW5GYWlsdXJlLm5leHQocmVhc29uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIHRoZSBzY2FuIGVycm9yIGV2ZW50LlxuICAgKlxuICAgKiBAcGFyYW0gZXJyb3IgdGhlIGVycm9yIHRoaW5nLlxuICAgKi9cbiAgcHJpdmF0ZSBkaXNwYXRjaFNjYW5FcnJvcihlcnJvcjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5zY2FuRXJyb3IubmV4dChlcnJvcik7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyB0aGUgc2NhbiBldmVudC5cbiAgICpcbiAgICogQHBhcmFtIHJlc3VsdCB0aGUgc2NhbiByZXN1bHQuXG4gICAqL1xuICBwcml2YXRlIGRpc3BhdGNoU2NhbkNvbXBsZXRlKHJlc3VsdDogUmVzdWx0KTogdm9pZCB7XG4gICAgdGhpcy5zY2FuQ29tcGxldGUubmV4dChyZXN1bHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGZpbHRlcmVkIHBlcm1pc3Npb24uXG4gICAqL1xuICBwcml2YXRlIGhhbmRsZVBlcm1pc3Npb25FeGNlcHRpb24oZXJyOiBET01FeGNlcHRpb24pOiBib29sZWFuIHtcblxuICAgIC8vIGZhaWxlZCB0byBncmFudCBwZXJtaXNzaW9uIHRvIHZpZGVvIGlucHV0XG4gICAgY29uc29sZS5lcnJvcignQHp4aW5nL25neC1zY2FubmVyJywgJ0Vycm9yIHdoZW4gYXNraW5nIGZvciBwZXJtaXNzaW9uLicsIGVycik7XG5cbiAgICBsZXQgcGVybWlzc2lvbjogYm9vbGVhbjtcblxuICAgIHN3aXRjaCAoZXJyLm5hbWUpIHtcblxuICAgICAgLy8gdXN1YWxseSBjYXVzZWQgYnkgbm90IHNlY3VyZSBvcmlnaW5zXG4gICAgICBjYXNlICdOb3RTdXBwb3J0ZWRFcnJvcic6XG4gICAgICAgIGNvbnNvbGUud2FybignQHp4aW5nL25neC1zY2FubmVyJywgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAvLyBjb3VsZCBub3QgY2xhaW1cbiAgICAgICAgcGVybWlzc2lvbiA9IG51bGw7XG4gICAgICAgIC8vIGNhbid0IGNoZWNrIGRldmljZXNcbiAgICAgICAgdGhpcy5oYXNEZXZpY2VzLm5leHQobnVsbCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyB1c2VyIGRlbmllZCBwZXJtaXNzaW9uXG4gICAgICBjYXNlICdOb3RBbGxvd2VkRXJyb3InOlxuICAgICAgICBjb25zb2xlLndhcm4oJ0B6eGluZy9uZ3gtc2Nhbm5lcicsIGVyci5tZXNzYWdlKTtcbiAgICAgICAgLy8gY2xhaW1lZCBhbmQgZGVuaWVkIHBlcm1pc3Npb25cbiAgICAgICAgcGVybWlzc2lvbiA9IGZhbHNlO1xuICAgICAgICAvLyB0aGlzIG1lYW5zIHRoYXQgaW5wdXQgZGV2aWNlcyBleGlzdHNcbiAgICAgICAgdGhpcy5oYXNEZXZpY2VzLm5leHQodHJ1ZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICAvLyB0aGUgZGV2aWNlIGhhcyBubyBhdHRhY2hlZCBpbnB1dCBkZXZpY2VzXG4gICAgICBjYXNlICdOb3RGb3VuZEVycm9yJzpcbiAgICAgICAgY29uc29sZS53YXJuKCdAenhpbmcvbmd4LXNjYW5uZXInLCBlcnIubWVzc2FnZSk7XG4gICAgICAgIC8vIG5vIHBlcm1pc3Npb25zIGNsYWltZWRcbiAgICAgICAgcGVybWlzc2lvbiA9IG51bGw7XG4gICAgICAgIC8vIGJlY2F1c2UgdGhlcmUgd2FzIG5vIGRldmljZXNcbiAgICAgICAgdGhpcy5oYXNEZXZpY2VzLm5leHQoZmFsc2UpO1xuICAgICAgICAvLyB0ZWxscyB0aGUgbGlzdGVuZXIgYWJvdXQgdGhlIGVycm9yXG4gICAgICAgIHRoaXMuY2FtZXJhc05vdEZvdW5kLm5leHQoZXJyKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ05vdFJlYWRhYmxlRXJyb3InOlxuICAgICAgICBjb25zb2xlLndhcm4oJ0B6eGluZy9uZ3gtc2Nhbm5lcicsICdDb3VsZG5cXCd0IHJlYWQgdGhlIGRldmljZShzKVxcJ3Mgc3RyZWFtLCBpdFxcJ3MgcHJvYmFibHkgaW4gdXNlIGJ5IGFub3RoZXIgYXBwLicpO1xuICAgICAgICAvLyBubyBwZXJtaXNzaW9ucyBjbGFpbWVkXG4gICAgICAgIHBlcm1pc3Npb24gPSBudWxsO1xuICAgICAgICAvLyB0aGVyZSBhcmUgZGV2aWNlcywgd2hpY2ggSSBjb3VsZG4ndCB1c2VcbiAgICAgICAgdGhpcy5oYXNEZXZpY2VzLm5leHQoZmFsc2UpO1xuICAgICAgICAvLyB0ZWxscyB0aGUgbGlzdGVuZXIgYWJvdXQgdGhlIGVycm9yXG4gICAgICAgIHRoaXMuY2FtZXJhc05vdEZvdW5kLm5leHQoZXJyKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnNvbGUud2FybignQHp4aW5nL25neC1zY2FubmVyJywgJ0kgd2FzIG5vdCBhYmxlIHRvIGRlZmluZSBpZiBJIGhhdmUgcGVybWlzc2lvbnMgZm9yIGNhbWVyYSBvciBub3QuJywgZXJyKTtcbiAgICAgICAgLy8gdW5rbm93blxuICAgICAgICBwZXJtaXNzaW9uID0gbnVsbDtcbiAgICAgICAgLy8gdGhpcy5oYXNEZXZpY2VzLm5leHQodW5kZWZpbmVkO1xuICAgICAgICBicmVhaztcblxuICAgIH1cblxuICAgIHRoaXMuc2V0UGVybWlzc2lvbihwZXJtaXNzaW9uKTtcblxuICAgIC8vIHRlbGxzIHRoZSBsaXN0ZW5lciBhYm91dCB0aGUgZXJyb3JcbiAgICB0aGlzLnBlcm1pc3Npb25SZXNwb25zZS5lcnJvcihlcnIpO1xuXG4gICAgcmV0dXJuIHBlcm1pc3Npb247XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHZhbGlkIEJhcmNvZGVGb3JtYXQgb3IgZmFpbHMuXG4gICAqL1xuICBwcml2YXRlIGdldEJhcmNvZGVGb3JtYXRPckZhaWwoZm9ybWF0OiBzdHJpbmcgfCBCYXJjb2RlRm9ybWF0KTogQmFyY29kZUZvcm1hdCB7XG4gICAgcmV0dXJuIHR5cGVvZiBmb3JtYXQgPT09ICdzdHJpbmcnXG4gICAgICA/IEJhcmNvZGVGb3JtYXRbZm9ybWF0LnRyaW0oKS50b1VwcGVyQ2FzZSgpXVxuICAgICAgOiBmb3JtYXQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0b3JuYSB1bSBjb2RlIHJlYWRlciwgY3JpYSB1bSBzZSBuZW5odW1lIGV4aXN0ZS5cbiAgICovXG4gIHByaXZhdGUgZ2V0Q29kZVJlYWRlcigpOiBCcm93c2VyTXVsdGlGb3JtYXRDb250aW51b3VzUmVhZGVyIHtcblxuICAgIGlmICghdGhpcy5fY29kZVJlYWRlcikge1xuICAgICAgdGhpcy5fY29kZVJlYWRlciA9IG5ldyBCcm93c2VyTXVsdGlGb3JtYXRDb250aW51b3VzUmVhZGVyKHRoaXMuaGludHMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jb2RlUmVhZGVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgY29udGludW91cyBzY2FubmluZyBmb3IgdGhlIGdpdmVuIGRldmljZS5cbiAgICpcbiAgICogQHBhcmFtIGRldmljZUlkIFRoZSBkZXZpY2VJZCBmcm9tIHRoZSBkZXZpY2UuXG4gICAqL1xuICBwcml2YXRlIHNjYW5Gcm9tRGV2aWNlKGRldmljZUlkOiBzdHJpbmcpOiB2b2lkIHtcblxuICAgIGNvbnN0IHZpZGVvRWxlbWVudCA9IHRoaXMucHJldmlld0VsZW1SZWYubmF0aXZlRWxlbWVudDtcblxuICAgIGNvbnN0IGNvZGVSZWFkZXIgPSB0aGlzLmdldENvZGVSZWFkZXIoKTtcblxuICAgIGNvbnN0IGRlY29kaW5nU3RyZWFtID0gY29kZVJlYWRlci5jb250aW51b3VzRGVjb2RlRnJvbUlucHV0VmlkZW9EZXZpY2UoZGV2aWNlSWQsIHZpZGVvRWxlbWVudCk7XG5cbiAgICBpZiAoIWRlY29kaW5nU3RyZWFtKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZGVmaW5lZCBkZWNvZGluZyBzdHJlYW0sIGFib3J0aW5nLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG5leHQgPSAoeDogUmVzdWx0QW5kRXJyb3IpID0+IHRoaXMuX29uRGVjb2RlUmVzdWx0KHgucmVzdWx0LCB4LmVycm9yKTtcbiAgICBjb25zdCBlcnJvciA9IChlcnI6IGFueSkgPT4gdGhpcy5fb25EZWNvZGVFcnJvcihlcnIpO1xuICAgIGNvbnN0IGNvbXBsZXRlID0gKCkgPT4geyB0aGlzLnJlc2V0KCk7IGNvbnNvbGUubG9nKCdjb21wbGV0ZWQnKTsgfTtcblxuICAgIGRlY29kaW5nU3RyZWFtLnN1YnNjcmliZShuZXh0LCBlcnJvciwgY29tcGxldGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgZGVjb2RlIGVycm9ycy5cbiAgICovXG4gIHByaXZhdGUgX29uRGVjb2RlRXJyb3IoZXJyOiBhbnkpIHtcbiAgICB0aGlzLmRpc3BhdGNoU2NhbkVycm9yKGVycik7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgZGVjb2RlIHJlc3VsdHMuXG4gICAqL1xuICBwcml2YXRlIF9vbkRlY29kZVJlc3VsdChyZXN1bHQ6IFJlc3VsdCwgZXJyb3I6IEV4Y2VwdGlvbik6IHZvaWQge1xuXG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgdGhpcy5kaXNwYXRjaFNjYW5TdWNjZXNzKHJlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGlzcGF0Y2hTY2FuRmFpbHVyZShlcnJvcik7XG4gICAgfVxuXG4gICAgdGhpcy5kaXNwYXRjaFNjYW5Db21wbGV0ZShyZXN1bHQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3BzIHRoZSBjb2RlIHJlYWRlciBhbmQgcmV0dXJucyB0aGUgcHJldmlvdXMgc2VsZWN0ZWQgZGV2aWNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVzZXQoKTogTWVkaWFEZXZpY2VJbmZvIHtcblxuICAgIGlmICghdGhpcy5fY29kZVJlYWRlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRldmljZSA9IHRoaXMuZGV2aWNlO1xuICAgIC8vIGRvIG5vdCBzZXQgdGhpcy5kZXZpY2UgaW5zaWRlIHRoaXMgbWV0aG9kLCBpdCB3b3VsZCBjcmVhdGUgYSByZWN1cnNpdmUgbG9vcFxuICAgIHRoaXMuX2RldmljZSA9IG51bGw7XG5cbiAgICB0aGlzLl9jb2RlUmVhZGVyLnJlc2V0KCk7XG5cbiAgICByZXR1cm4gZGV2aWNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgc2Nhbm5lciBhbmQgZW1pdHMgZGV2aWNlIGNoYW5nZS5cbiAgICovXG4gIHB1YmxpYyByZXNldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9yZXNldCgpO1xuICAgIHRoaXMuZGV2aWNlQ2hhbmdlLmVtaXQobnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgcGVybWlzc2lvbiB2YWx1ZSBhbmQgZW1taXRzIHRoZSBldmVudC5cbiAgICovXG4gIHByaXZhdGUgc2V0UGVybWlzc2lvbihoYXNQZXJtaXNzaW9uOiBib29sZWFuIHwgbnVsbCk6IHZvaWQge1xuICAgIHRoaXMuaGFzUGVybWlzc2lvbiA9IGhhc1Blcm1pc3Npb247XG4gICAgdGhpcy5wZXJtaXNzaW9uUmVzcG9uc2UubmV4dChoYXNQZXJtaXNzaW9uKTtcbiAgfVxuXG59XG4iXX0=