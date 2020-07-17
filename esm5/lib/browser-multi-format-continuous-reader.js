/// <reference path="./image-capture.d.ts" />
import * as tslib_1 from "tslib";
import { BrowserMultiFormatReader, ChecksumException, FormatException, NotFoundException } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
/**
 * Based on zxing-typescript BrowserCodeReader
 */
var BrowserMultiFormatContinuousReader = /** @class */ (function (_super) {
    tslib_1.__extends(BrowserMultiFormatContinuousReader, _super);
    function BrowserMultiFormatContinuousReader() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Says if there's a torch available for the current device.
         */
        _this._isTorchAvailable = new BehaviorSubject(undefined);
        return _this;
    }
    Object.defineProperty(BrowserMultiFormatContinuousReader.prototype, "isTorchAvailable", {
        /**
         * Exposes _tochAvailable .
         */
        get: function () {
            return this._isTorchAvailable.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Starts the decoding from the current or a new video element.
     *
     * @param callbackFn The callback to be executed after every scan attempt
     * @param deviceId The device's to be used Id
     * @param videoSource A new video element
     */
    BrowserMultiFormatContinuousReader.prototype.continuousDecodeFromInputVideoDevice = function (deviceId, videoSource) {
        var _this = this;
        this.reset();
        // Keeps the deviceId between scanner resets.
        if (typeof deviceId !== 'undefined') {
            this.deviceId = deviceId;
        }
        if (typeof navigator === 'undefined') {
            return;
        }
        var scan$ = new BehaviorSubject({});
        try {
            // this.decodeFromInputVideoDeviceContinuously(deviceId, videoSource, (result, error) => scan$.next({ result, error }));
            this.getStreamForDevice({ deviceId: deviceId })
                .then(function (stream) { return _this.attachStreamToVideoAndCheckTorch(stream, videoSource); })
                .then(function (videoElement) { return _this.decodeOnSubject(scan$, videoElement, _this.timeBetweenScansMillis); });
        }
        catch (e) {
            scan$.error(e);
        }
        this._setScanStream(scan$);
        // @todo Find a way to emit a complete event on the scan stream once it's finished.
        return scan$.asObservable();
    };
    /**
     * Gets the media stream for certain device.
     * Falls back to any available device if no `deviceId` is defined.
     */
    BrowserMultiFormatContinuousReader.prototype.getStreamForDevice = function (_a) {
        var deviceId = _a.deviceId;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var constraints, stream;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        constraints = this.getUserMediaConstraints(deviceId);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
                    case 1:
                        stream = _b.sent();
                        return [2 /*return*/, stream];
                }
            });
        });
    };
    /**
     * Creates media steram constraints for certain `deviceId`.
     * Falls back to any environment available device if no `deviceId` is defined.
     */
    BrowserMultiFormatContinuousReader.prototype.getUserMediaConstraints = function (deviceId) {
        var video = typeof deviceId === 'undefined'
            ? { facingMode: { exact: 'environment' } }
            : { deviceId: { exact: deviceId } };
        var constraints = { video: video };
        return constraints;
    };
    /**
     * Enables and disables the device torch.
     */
    BrowserMultiFormatContinuousReader.prototype.setTorch = function (on) {
        if (!this._isTorchAvailable.value) {
            // compatibility not checked yet
            return;
        }
        var tracks = this.getVideoTracks(this.stream);
        if (on) {
            this.applyTorchOnTracks(tracks, true);
        }
        else {
            this.applyTorchOnTracks(tracks, false);
            // @todo check possibility to disable torch without restart
            this.restart();
        }
    };
    /**
     * Update the torch compatibility state and attachs the stream to the preview element.
     */
    BrowserMultiFormatContinuousReader.prototype.attachStreamToVideoAndCheckTorch = function (stream, videoSource) {
        this.updateTorchCompatibility(stream);
        return this.attachStreamToVideo(stream, videoSource);
    };
    /**
     * Checks if the stream supports torch control.
     *
     * @param stream The media stream used to check.
     */
    BrowserMultiFormatContinuousReader.prototype.updateTorchCompatibility = function (stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_1, _a, tracks, tracks_1, tracks_1_1, track, e_1_1;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tracks = this.getVideoTracks(stream);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        tracks_1 = tslib_1.__values(tracks), tracks_1_1 = tracks_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!tracks_1_1.done) return [3 /*break*/, 5];
                        track = tracks_1_1.value;
                        return [4 /*yield*/, this.isTorchCompatible(track)];
                    case 3:
                        if (_b.sent()) {
                            this._isTorchAvailable.next(true);
                            return [3 /*break*/, 5];
                        }
                        _b.label = 4;
                    case 4:
                        tracks_1_1 = tracks_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (tracks_1_1 && !tracks_1_1.done && (_a = tracks_1.return)) _a.call(tracks_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param stream The video stream where the tracks gonna be extracted from.
     */
    BrowserMultiFormatContinuousReader.prototype.getVideoTracks = function (stream) {
        var tracks = [];
        try {
            tracks = stream.getVideoTracks();
        }
        finally {
            return tracks || [];
        }
    };
    /**
     *
     * @param track The media stream track that will be checked for compatibility.
     */
    BrowserMultiFormatContinuousReader.prototype.isTorchCompatible = function (track) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var compatible, imageCapture, capabilities;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        compatible = false;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        imageCapture = new ImageCapture(track);
                        return [4 /*yield*/, imageCapture.getPhotoCapabilities()];
                    case 2:
                        capabilities = _a.sent();
                        compatible = !!capabilities['torch'] || ('fillLightMode' in capabilities && capabilities.fillLightMode.length !== 0);
                        return [3 /*break*/, 4];
                    case 3: return [2 /*return*/, compatible];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Apply the torch setting in all received tracks.
     */
    BrowserMultiFormatContinuousReader.prototype.applyTorchOnTracks = function (tracks, state) {
        tracks.forEach(function (track) { return track.applyConstraints({
            advanced: [{ torch: state, fillLightMode: state ? 'torch' : 'none' }]
        }); });
    };
    /**
     * Correctly sets a new scanStream value.
     */
    BrowserMultiFormatContinuousReader.prototype._setScanStream = function (scan$) {
        // cleans old stream
        this._cleanScanStream();
        // sets new stream
        this.scanStream = scan$;
    };
    /**
     * Cleans any old scan stream value.
     */
    BrowserMultiFormatContinuousReader.prototype._cleanScanStream = function () {
        if (this.scanStream && !this.scanStream.isStopped) {
            this.scanStream.complete();
        }
        this.scanStream = null;
    };
    /**
     * Decodes values in a stream with delays between scans.
     *
     * @param scan$ The subject to receive the values.
     * @param videoElement The video element the decode will be applied.
     * @param delay The delay between decode results.
     */
    BrowserMultiFormatContinuousReader.prototype.decodeOnSubject = function (scan$, videoElement, delay) {
        var _this = this;
        // stops loop
        if (scan$.isStopped) {
            return;
        }
        var result;
        try {
            result = this.decode(videoElement);
            scan$.next({ result: result });
        }
        catch (error) {
            // stream cannot stop on fails.
            if (!error ||
                // scan Failure - found nothing, no error
                error instanceof NotFoundException ||
                // scan Error - found the QR but got error on decoding
                error instanceof ChecksumException ||
                error instanceof FormatException) {
                scan$.next({ error: error });
            }
            else {
                scan$.error(error);
            }
        }
        finally {
            var timeout = !result ? 0 : delay;
            setTimeout(function () { return _this.decodeOnSubject(scan$, videoElement, delay); }, timeout);
        }
    };
    /**
     * Restarts the scanner.
     */
    BrowserMultiFormatContinuousReader.prototype.restart = function () {
        // reset
        // start
        return this.continuousDecodeFromInputVideoDevice(this.deviceId, this.videoElement);
    };
    return BrowserMultiFormatContinuousReader;
}(BrowserMultiFormatReader));
export { BrowserMultiFormatContinuousReader };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Aenhpbmcvbmd4LXNjYW5uZXIvIiwic291cmNlcyI6WyJsaWIvYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkNBQTZDOztBQUU3QyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFVLE1BQU0sZ0JBQWdCLENBQUM7QUFDekgsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUduRDs7R0FFRztBQUNIO0lBQXdELDhEQUF3QjtJQUFoRjtRQUFBLHFFQXVQQztRQTlPQzs7V0FFRztRQUNLLHVCQUFpQixHQUFHLElBQUksZUFBZSxDQUFVLFNBQVMsQ0FBQyxDQUFDOztJQTJPdEUsQ0FBQztJQWxQQyxzQkFBVyxnRUFBZ0I7UUFIM0I7O1dBRUc7YUFDSDtZQUNFLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQy9DLENBQUM7OztPQUFBO0lBaUJEOzs7Ozs7T0FNRztJQUNJLGlGQUFvQyxHQUEzQyxVQUNFLFFBQWlCLEVBQ2pCLFdBQThCO1FBRmhDLGlCQWdDQztRQTNCQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFYiw2Q0FBNkM7UUFDN0MsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7WUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7U0FDMUI7UUFFRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsRUFBRTtZQUNwQyxPQUFPO1NBQ1I7UUFFRCxJQUFNLEtBQUssR0FBRyxJQUFJLGVBQWUsQ0FBaUIsRUFBRSxDQUFDLENBQUM7UUFFdEQsSUFBSTtZQUNGLHdIQUF3SDtZQUN4SCxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxRQUFRLFVBQUEs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S0FBSyxDQUFDLEVBQWhELENBQWdELEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDN0U7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSyxvREFBTyxHQUFmO1FBQ0UsUUFBUTtRQUNSLFFBQVE7UUFDUixPQUFPLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUgseUNBQUM7QUFBRCxDQUFDLEFBdlBELENBQXdELHdCQUF3QixHQXVQL0UiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9pbWFnZS1jYXB0dXJlLmQudHNcIiAvPlxuXG5pbXBvcnQgeyBCcm93c2VyTXVsdGlGb3JtYXRSZWFkZXIsIENoZWNrc3VtRXhjZXB0aW9uLCBGb3JtYXRFeGNlcHRpb24sIE5vdEZvdW5kRXhjZXB0aW9uLCBSZXN1bHQgfSBmcm9tICdAenhpbmcvbGlicmFyeSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IFJlc3VsdEFuZEVycm9yIH0gZnJvbSAnLi9SZXN1bHRBbmRFcnJvcic7XG5cbi8qKlxuICogQmFzZWQgb24genhpbmctdHlwZXNjcmlwdCBCcm93c2VyQ29kZVJlYWRlclxuICovXG5leHBvcnQgY2xhc3MgQnJvd3Nlck11bHRpRm9ybWF0Q29udGludW91c1JlYWRlciBleHRlbmRzIEJyb3dzZXJNdWx0aUZvcm1hdFJlYWRlciB7XG5cbiAgLyoqXG4gICAqIEV4cG9zZXMgX3RvY2hBdmFpbGFibGUgLlxuICAgKi9cbiAgcHVibGljIGdldCBpc1RvcmNoQXZhaWxhYmxlKCk6IE9ic2VydmFibGU8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9pc1RvcmNoQXZhaWxhYmxlLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNheXMgaWYgdGhlcmUncyBhIHRvcmNoIGF2YWlsYWJsZSBmb3IgdGhlIGN1cnJlbnQgZGV2aWNlLlxuICAgKi9cbiAgcHJpdmF0ZSBfaXNUb3JjaEF2YWlsYWJsZSA9IG5ldyBCZWhhdmlvclN1YmplY3Q8Ym9vbGVhbj4odW5kZWZpbmVkKTtcblxuICAvKipcbiAgICogVGhlIGRldmljZSBpZCBvZiB0aGUgY3VycmVudCBtZWRpYSBkZXZpY2UuXG4gICAqL1xuICBwcml2YXRlIGRldmljZUlkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIElmIHRoZXJlJ3Mgc29tZSBzY2FuIHN0cmVhbSBvcGVuLCBpdCBzaGFsIGJlIGhlcmUuXG4gICAqL1xuICBwcml2YXRlIHNjYW5TdHJlYW06IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj47XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyB0aGUgZGVjb2RpbmcgZnJvbSB0aGUgY3VycmVudCBvciBhIG5ldyB2aWRlbyBlbGVtZW50LlxuICAgKlxuICAgKiBAcGFyYW0gY2FsbGJhY2tGbiBUaGUgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgYWZ0ZXIgZXZlcnkgc2NhbiBhdHRlbXB0XG4gICAqIEBwYXJhbSBkZXZpY2VJZCBUaGUgZGV2aWNlJ3MgdG8gYmUgdXNlZCBJZFxuICAgKiBAcGFyYW0gdmlkZW9Tb3VyY2UgQSBuZXcgdmlkZW8gZWxlbWVudFxuICAgKi9cbiAgcHVibGljIGNvbnRpbnVvdXNEZWNvZGVGcm9tSW5wdXRWaWRlb0RldmljZShcbiAgICBkZXZpY2VJZD86IHN0cmluZyxcbiAgICB2aWRlb1NvdXJjZT86IEhUTUxWaWRlb0VsZW1lbnRcbiAgKTogT2JzZXJ2YWJsZTxSZXN1bHRBbmRFcnJvcj4ge1xuXG4gICAgdGhpcy5yZXNldCgpO1xuXG4gICAgLy8gS2VlcHMgdGhlIGRldmljZUlkIGJldHdlZW4gc2Nhbm5lciByZXNldHMuXG4gICAgaWYgKHR5cGVvZiBkZXZpY2VJZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuZGV2aWNlSWQgPSBkZXZpY2VJZDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzY2FuJCA9IG5ldyBCZWhhdmlvclN1YmplY3Q8UmVzdWx0QW5kRXJyb3I+KHt9KTtcblxuICAgIHRyeSB7XG4gICAgICAvLyB0aGlzLmRlY29kZUZyb21JbnB1dFZpZGVvRGV2aWNlQ29udGludW91c2x5KGRldmljZUlkLCB2aWRlb1NvdXJjZSwgKHJlc3VsdCwgZXJyb3IpID0+IHNjYW4kLm5leHQoeyByZXN1bHQsIGVycm9yIH0pKTtcbiAgICAgIHRoaXMuZ2V0U3RyZWFtRm9yRGV2aWNlKHsgZGV2aWNlSWQgfSlcbiAgICAgICAgLnRoZW4oc3RyZWFtID0+IHRoaXMuYXR0YWNoU3RyZWFtVG9WaWRlb0FuZENoZWNrVG9yY2goc3RyZWFtLCB2aWRlb1NvdXJjZSkpXG4gICAgICAgIC50aGVuKHZpZGVvRWxlbWVudCA9PiB0aGlzLmRlY29kZU9uU3ViamVjdChzY2FuJCwgdmlkZW9FbGVtZW50LCB0aGlzLnRpbWVCZXR3ZWVuU2NhbnNNaWxsaXMpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzY2FuJC5lcnJvcihlKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXRTY2FuU3RyZWFtKHNjYW4kKTtcblxuICAgIC8vIEB0b2RvIEZpbmQgYSB3YXkgdG8gZW1pdCBhIGNvbXBsZXRlIGV2ZW50IG9uIHRoZSBzY2FuIHN0cmVhbSBvbmNlIGl0J3MgZmluaXNoZWQuXG5cbiAgICByZXR1cm4gc2NhbiQuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbWVkaWEgc3RyZWFtIGZvciBjZXJ0YWluIGRldmljZS5cbiAgICogRmFsbHMgYmFjayB0byBhbnkgYXZhaWxhYmxlIGRldmljZSBpZiBubyBgZGV2aWNlSWRgIGlzIGRlZmluZWQuXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgZ2V0U3RyZWFtRm9yRGV2aWNlKHsgZGV2aWNlSWQgfTogUGFydGlhbDxNZWRpYURldmljZUluZm8+KTogUHJvbWlzZTxNZWRpYVN0cmVhbT4ge1xuICAgIGNvbnN0IGNvbnN0cmFpbnRzID0gdGhpcy5nZXRVc2VyTWVkaWFDb25zdHJhaW50cyhkZXZpY2VJZCk7XG4gICAgY29uc3Qgc3RyZWFtID0gYXdhaXQgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpO1xuICAgIHJldHVybiBzdHJlYW07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBtZWRpYSBzdGVyYW0gY29uc3RyYWludHMgZm9yIGNlcnRhaW4gYGRldmljZUlkYC5cbiAgICogRmFsbHMgYmFjayB0byBhbnkgZW52aXJvbm1lbnQgYXZhaWxhYmxlIGRldmljZSBpZiBubyBgZGV2aWNlSWRgIGlzIGRlZmluZWQuXG4gICAqL1xuICBwdWJsaWMgZ2V0VXNlck1lZGlhQ29uc3RyYWludHMoZGV2aWNlSWQ6IHN0cmluZyk6IE1lZGlhU3RyZWFtQ29uc3RyYWludHMge1xuXG4gICAgY29uc3QgdmlkZW8gPSB0eXBlb2YgZGV2aWNlSWQgPT09ICd1bmRlZmluZWQnXG4gICAgICA/IHsgZmFjaW5nTW9kZTogeyBleGFjdDogJ2Vudmlyb25tZW50JyB9IH1cbiAgICAgIDogeyBkZXZpY2VJZDogeyBleGFjdDogZGV2aWNlSWQgfSB9O1xuXG4gICAgY29uc3QgY29uc3RyYWludHM6IE1lZGlhU3RyZWFtQ29uc3RyYWludHMgPSB7IHZpZGVvIH07XG5cbiAgICByZXR1cm4gY29uc3RyYWludHM7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlcyBhbmQgZGlzYWJsZXMgdGhlIGRldmljZSB0b3JjaC5cbiAgICovXG4gIHB1YmxpYyBzZXRUb3JjaChvbjogYm9vbGVhbik6IHZvaWQge1xuXG4gICAgaWYgKCF0aGlzLl9pc1RvcmNoQXZhaWxhYmxlLnZhbHVlKSB7XG4gICAgICAvLyBjb21wYXRpYmlsaXR5IG5vdCBjaGVja2VkIHlldFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRyYWNrcyA9IHRoaXMuZ2V0VmlkZW9UcmFja3ModGhpcy5zdHJlYW0pO1xuXG4gICAgaWYgKG9uKSB7XG4gICAgICB0aGlzLmFwcGx5VG9yY2hPblRyYWNrcyh0cmFja3MsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFwcGx5VG9yY2hPblRyYWNrcyh0cmFja3MsIGZhbHNlKTtcbiAgICAgIC8vIEB0b2RvIGNoZWNrIHBvc3NpYmlsaXR5IHRvIGRpc2FibGUgdG9yY2ggd2l0aG91dCByZXN0YXJ0XG4gICAgICB0aGlzLnJlc3RhcnQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSB0b3JjaCBjb21wYXRpYmlsaXR5IHN0YXRlIGFuZCBhdHRhY2hzIHRoZSBzdHJlYW0gdG8gdGhlIHByZXZpZXcgZWxlbWVudC5cbiAgICovXG4gIHByaXZhdGUgYXR0YWNoU3RyZWFtVG9WaWRlb0FuZENoZWNrVG9yY2goc3RyZWFtOiBNZWRpYVN0cmVhbSwgdmlkZW9Tb3VyY2U6IEhUTUxWaWRlb0VsZW1lbnQpOiBQcm9taXNlPEhUTUxWaWRlb0VsZW1lbnQ+IHtcbiAgICB0aGlzLnVwZGF0ZVRvcmNoQ29tcGF0aWJpbGl0eShzdHJlYW0pO1xuICAgIHJldHVybiB0aGlzLmF0dGFjaFN0cmVhbVRvVmlkZW8oc3RyZWFtLCB2aWRlb1NvdXJjZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzdHJlYW0gc3VwcG9ydHMgdG9yY2ggY29udHJvbC5cbiAgICpcbiAgICogQHBhcmFtIHN0cmVhbSBUaGUgbWVkaWEgc3RyZWFtIHVzZWQgdG8gY2hlY2suXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIHVwZGF0ZVRvcmNoQ29tcGF0aWJpbGl0eShzdHJlYW06IE1lZGlhU3RyZWFtKTogUHJvbWlzZTx2b2lkPiB7XG5cbiAgICBjb25zdCB0cmFja3MgPSB0aGlzLmdldFZpZGVvVHJhY2tzKHN0cmVhbSk7XG5cbiAgICBmb3IgKGNvbnN0IHRyYWNrIG9mIHRyYWNrcykge1xuICAgICAgaWYgKGF3YWl0IHRoaXMuaXNUb3JjaENvbXBhdGlibGUodHJhY2spKSB7XG4gICAgICAgIHRoaXMuX2lzVG9yY2hBdmFpbGFibGUubmV4dCh0cnVlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBzdHJlYW0gVGhlIHZpZGVvIHN0cmVhbSB3aGVyZSB0aGUgdHJhY2tzIGdvbm5hIGJlIGV4dHJhY3RlZCBmcm9tLlxuICAgKi9cbiAgcHJpdmF0ZSBnZXRWaWRlb1RyYWNrcyhzdHJlYW06IE1lZGlhU3RyZWFtKSB7XG4gICAgbGV0IHRyYWNrcyA9IFtdO1xuICAgIHRyeSB7XG4gICAgICB0cmFja3MgPSBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKTtcbiAgICB9XG4gICAgZmluYWxseSB7XG4gICAgICByZXR1cm4gdHJhY2tzIHx8IFtdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gdHJhY2sgVGhlIG1lZGlhIHN0cmVhbSB0cmFjayB0aGF0IHdpbGwgYmUgY2hlY2tlZCBmb3IgY29tcGF0aWJpbGl0eS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgaXNUb3JjaENvbXBhdGlibGUodHJhY2s6IE1lZGlhU3RyZWFtVHJhY2spIHtcblxuICAgIGxldCBjb21wYXRpYmxlID0gZmFsc2U7XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgaW1hZ2VDYXB0dXJlID0gbmV3IEltYWdlQ2FwdHVyZSh0cmFjayk7XG4gICAgICBjb25zdCBjYXBhYmlsaXRpZXMgPSBhd2FpdCBpbWFnZUNhcHR1cmUuZ2V0UGhvdG9DYXBhYmlsaXRpZXMoKTtcbiAgICAgIGNvbXBhdGlibGUgPSAhIWNhcGFiaWxpdGllc1sndG9yY2gnXSB8fCAoJ2ZpbGxMaWdodE1vZGUnIGluIGNhcGFiaWxpdGllcyAmJiBjYXBhYmlsaXRpZXMuZmlsbExpZ2h0TW9kZS5sZW5ndGggIT09IDApO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgIHJldHVybiBjb21wYXRpYmxlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSB0aGUgdG9yY2ggc2V0dGluZyBpbiBhbGwgcmVjZWl2ZWQgdHJhY2tzLlxuICAgKi9cbiAgcHJpdmF0ZSBhcHBseVRvcmNoT25UcmFja3ModHJhY2tzOiBNZWRpYVN0cmVhbVRyYWNrW10sIHN0YXRlOiBib29sZWFuKSB7XG4gICAgdHJhY2tzLmZvckVhY2godHJhY2sgPT4gdHJhY2suYXBwbHlDb25zdHJhaW50cyh7XG4gICAgICBhZHZhbmNlZDogWzxhbnk+eyB0b3JjaDogc3RhdGUsIGZpbGxMaWdodE1vZGU6IHN0YXRlID8gJ3RvcmNoJyA6ICdub25lJyB9XVxuICAgIH0pKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3JyZWN0bHkgc2V0cyBhIG5ldyBzY2FuU3RyZWFtIHZhbHVlLlxuICAgKi9cbiAgcHJpdmF0ZSBfc2V0U2NhblN0cmVhbShzY2FuJDogQmVoYXZpb3JTdWJqZWN0PFJlc3VsdEFuZEVycm9yPik6IHZvaWQge1xuICAgIC8vIGNsZWFucyBvbGQgc3RyZWFtXG4gICAgdGhpcy5fY2xlYW5TY2FuU3RyZWFtKCk7XG4gICAgLy8gc2V0cyBuZXcgc3RyZWFtXG4gICAgdGhpcy5zY2FuU3RyZWFtID0gc2NhbiQ7XG4gIH1cblxuICAvKipcbiAgICogQ2xlYW5zIGFueSBvbGQgc2NhbiBzdHJlYW0gdmFsdWUuXG4gICAqL1xuICBwcml2YXRlIF9jbGVhblNjYW5TdHJlYW0oKTogdm9pZCB7XG5cbiAgICBpZiAodGhpcy5zY2FuU3RyZWFtICYmICF0aGlzLnNjYW5TdHJlYW0uaXNTdG9wcGVkKSB7XG4gICAgICB0aGlzLnNjYW5TdHJlYW0uY29tcGxldGUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNjYW5TdHJlYW0gPSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIERlY29kZXMgdmFsdWVzIGluIGEgc3RyZWFtIHdpdGggZGVsYXlzIGJldHdlZW4gc2NhbnMuXG4gICAqXG4gICAqIEBwYXJhbSBzY2FuJCBUaGUgc3ViamVjdCB0byByZWNlaXZlIHRoZSB2YWx1ZXMuXG4gICAqIEBwYXJhbSB2aWRlb0VsZW1lbnQgVGhlIHZpZGVvIGVsZW1lbnQgdGhlIGRlY29kZSB3aWxsIGJlIGFwcGxpZWQuXG4gICAqIEBwYXJhbSBkZWxheSBUaGUgZGVsYXkgYmV0d2VlbiBkZWNvZGUgcmVzdWx0cy5cbiAgICovXG4gIHByaXZhdGUgZGVjb2RlT25TdWJqZWN0KHNjYW4kOiBCZWhhdmlvclN1YmplY3Q8UmVzdWx0QW5kRXJyb3I+LCB2aWRlb0VsZW1lbnQ6IEhUTUxWaWRlb0VsZW1lbnQsIGRlbGF5OiBudW1iZXIpOiB2b2lkIHtcblxuICAgIC8vIHN0b3BzIGxvb3BcbiAgICBpZiAoc2NhbiQuaXNTdG9wcGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdDogUmVzdWx0O1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuZGVjb2RlKHZpZGVvRWxlbWVudCk7XG4gICAgICBzY2FuJC5uZXh0KHsgcmVzdWx0IH0pO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBzdHJlYW0gY2Fubm90IHN0b3Agb24gZmFpbHMuXG4gICAgICBpZiAoXG4gICAgICAgICFlcnJvciB8fFxuICAgICAgICAvLyBzY2FuIEZhaWx1cmUgLSBmb3VuZCBub3RoaW5nLCBubyBlcnJvclxuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIE5vdEZvdW5kRXhjZXB0aW9uIHx8XG4gICAgICAgIC8vIHNjYW4gRXJyb3IgLSBmb3VuZCB0aGUgUVIgYnV0IGdvdCBlcnJvciBvbiBkZWNvZGluZ1xuICAgICAgICBlcnJvciBpbnN0YW5jZW9mIENoZWNrc3VtRXhjZXB0aW9uIHx8XG4gICAgICAgIGVycm9yIGluc3RhbmNlb2YgRm9ybWF0RXhjZXB0aW9uXG4gICAgICApIHtcbiAgICAgICAgc2NhbiQubmV4dCh7IGVycm9yIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2NhbiQuZXJyb3IoZXJyb3IpO1xuICAgICAgfVxuICAgIH0gZmluYWxseSB7XG4gICAgICBjb25zdCB0aW1lb3V0ID0gIXJlc3VsdCA/IDAgOiBkZWxheTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5kZWNvZGVPblN1YmplY3Qoc2NhbiQsIHZpZGVvRWxlbWVudCwgZGVsYXkpLCB0aW1lb3V0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVzdGFydHMgdGhlIHNjYW5uZXIuXG4gICAqL1xuICBwcml2YXRlIHJlc3RhcnQoKTogT2JzZXJ2YWJsZTxSZXN1bHRBbmRFcnJvcj4ge1xuICAgIC8vIHJlc2V0XG4gICAgLy8gc3RhcnRcbiAgICByZXR1cm4gdGhpcy5jb250aW51b3VzRGVjb2RlRnJvbUlucHV0VmlkZW9EZXZpY2UodGhpcy5kZXZpY2VJZCwgdGhpcy52aWRlb0VsZW1lbnQpO1xuICB9XG5cbn1cbiJdfQ==