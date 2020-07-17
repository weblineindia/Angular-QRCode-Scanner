/// <reference path="./image-capture.d.ts" />
import * as tslib_1 from "tslib";
import { BrowserMultiFormatReader, ChecksumException, FormatException, NotFoundException } from '@zxing/library';
import { BehaviorSubject } from 'rxjs';
/**
 * Based on zxing-typescript BrowserCodeReader
 */
export class BrowserMultiFormatContinuousReader extends BrowserMultiFormatReader {
    constructor() {
        super(...arguments);
        /**
         * Says if there's a torch available for the current device.
         */
        this._isTorchAvailable = new BehaviorSubject(undefined);
    }
    /**
     * Exposes _tochAvailable .
     */
    get isTorchAvailable() {
        return this._isTorchAvailable.asObservable();
    }
    /**
     * Starts the decoding from the current or a new video element.
     *
     * @param callbackFn The callback to be executed after every scan attempt
     * @param deviceId The device's to be used Id
     * @param videoSource A new video element
     */
    continuousDecodeFromInputVideoDevice(deviceId, videoSource) {
        this.reset();
        // Keeps the deviceId between scanner resets.
        if (typeof deviceId !== 'undefined') {
            this.deviceId = deviceId;
        }
        if (typeof navigator === 'undefined') {
            return;
        }
        const scan$ = new BehaviorSubject({});
        try {
            // this.decodeFromInputVideoDeviceContinuously(deviceId, videoSource, (result, error) => scan$.next({ result, error }));
            this.getStreamForDevice({ deviceId })
                .then(stream => this.attachStreamToVideoAndCheckTorch(stream, videoSource))
                .then(videoElement => this.decodeOnSubject(scan$, videoElement, this.timeBetweenScansMillis));
        }
        catch (e) {
            scan$.error(e);
        }
        this._setScanStream(scan$);
        // @todo Find a way to emit a complete event on the scan stream once it's finished.
        return scan$.asObservable();
    }
    /**
     * Gets the media stream for certain device.
     * Falls back to any available device if no `deviceId` is defined.
     */
    getStreamForDevice({ deviceId }) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const constraints = this.getUserMediaConstraints(deviceId);
            const stream = yield navigator.mediaDevices.getUserMedia(constraints);
            return stream;
        });
    }
    /**
     * Creates media steram constraints for certain `deviceId`.
     * Falls back to any environment available device if no `deviceId` is defined.
     */
    getUserMediaConstraints(deviceId) {
        const video = typeof deviceId === 'undefined'
            ? { facingMode: { exact: 'environment' } }
            : { deviceId: { exact: deviceId } };
        const constraints = { video };
        return constraints;
    }
    /**
     * Enables and disables the device torch.
     */
    setTorch(on) {
        if (!this._isTorchAvailable.value) {
            // compatibility not checked yet
            return;
        }
        const tracks = this.getVideoTracks(this.stream);
        if (on) {
            this.applyTorchOnTracks(tracks, true);
        }
        else {
            this.applyTorchOnTracks(tracks, false);
            // @todo check possibility to disable torch without restart
            this.restart();
        }
    }
    /**
     * Update the torch compatibility state and attachs the stream to the preview element.
     */
    attachStreamToVideoAndCheckTorch(stream, videoSource) {
        this.updateTorchCompatibility(stream);
        return this.attachStreamToVideo(stream, videoSource);
    }
    /**
     * Checks if the stream supports torch control.
     *
     * @param stream The media stream used to check.
     */
    updateTorchCompatibility(stream) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const tracks = this.getVideoTracks(stream);
            for (const track of tracks) {
                if (yield this.isTorchCompatible(track)) {
                    this._isTorchAvailable.next(true);
                    break;
                }
            }
        });
    }
    /**
     *
     * @param stream The video stream where the tracks gonna be extracted from.
     */
    getVideoTracks(stream) {
        let tracks = [];
        try {
            tracks = stream.getVideoTracks();
        }
        finally {
            return tracks || [];
        }
    }
    /**
     *
     * @param track The media stream track that will be checked for compatibility.
     */
    isTorchCompatible(track) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let compatible = false;
            try {
                const imageCapture = new ImageCapture(track);
                const capabilities = yield imageCapture.getPhotoCapabilities();
                compatible = !!capabilities['torch'] || ('fillLightMode' in capabilities && capabilities.fillLightMode.length !== 0);
            }
            finally {
                return compatible;
            }
        });
    }
    /**
     * Apply the torch setting in all received tracks.
     */
    applyTorchOnTracks(tracks, state) {
        tracks.forEach(track => track.applyConstraints({
            advanced: [{ torch: state, fillLightMode: state ? 'torch' : 'none' }]
        }));
    }
    /**
     * Correctly sets a new scanStream value.
     */
    _setScanStream(scan$) {
        // cleans old stream
        this._cleanScanStream();
        // sets new stream
        this.scanStream = scan$;
    }
    /**
     * Cleans any old scan stream value.
     */
    _cleanScanStream() {
        if (this.scanStream && !this.scanStream.isStopped) {
            this.scanStream.complete();
        }
        this.scanStream = null;
    }
    /**
     * Decodes values in a stream with delays between scans.
     *
     * @param scan$ The subject to receive the values.
     * @param videoElement The video element the decode will be applied.
     * @param delay The delay between decode results.
     */
    decodeOnSubject(scan$, videoElement, delay) {
        // stops loop
        if (scan$.isStopped) {
            return;
        }
        let result;
        try {
            result = this.decode(videoElement);
            scan$.next({ result });
        }
        catch (error) {
            // stream cannot stop on fails.
            if (!error ||
                // scan Failure - found nothing, no error
                error instanceof NotFoundException ||
                // scan Error - found the QR but got error on decoding
                error instanceof ChecksumException ||
                error instanceof FormatException) {
                scan$.next({ error });
            }
            else {
                scan$.error(error);
            }
        }
        finally {
            const timeout = !result ? 0 : delay;
            setTimeout(() => this.decodeOnSubject(scan$, videoElement, delay), timeout);
        }
    }
    /**
     * Restarts the scanner.
     */
    restart() {
        // reset
        // start
        return this.continuousDecodeFromInputVideoDevice(this.deviceId, this.videoElement);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Aenhpbmcvbmd4LXNjYW5uZXIvIiwic291cmNlcyI6WyJsaWIvYnJvd3Nlci1tdWx0aS1mb3JtYXQtY29udGludW91cy1yZWFkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsNkNBQTZDOztBQUU3QyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFVLE1BQU0sZ0JBQWdCLENBQUM7QUFDekgsT0FBTyxFQUFFLGVBQWUsRUFBYyxNQUFNLE1BQU0sQ0FBQztBQUduRDs7R0FFRztBQUNILE1BQU0sT0FBTyxrQ0FBbUMsU0FBUSx3QkFBd0I7SUFBaEY7O1FBU0U7O1dBRUc7UUFDSyxzQkFBaUIsR0FBRyxJQUFJLGVBQWUsQ0FBVSxTQUFTLENBQUMsQ0FBQztJQTJPdEUsQ0FBQztJQXJQQzs7T0FFRztJQUNILElBQVcsZ0JBQWdCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFlBQVksRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFpQkQ7Ozs7OztPQU1HO0lBQ0ksb0NBQW9DLENBQ3pDLFFBQWlCLEVBQ2pCLFdBQThCO1FBRzlCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUViLDZDQUE2QztRQUM3QyxJQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRTtZQUNuQyxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztTQUMxQjtRQUVELElBQUksT0FBTyxTQUFTLEtBQUssV0FBVyxFQUFFO1lBQ3BDLE9BQU87U0FDUjtRQUVELE1BQU0sS0FBSyxHQUFHLElBQUksZUFBZSxDQUFpQixFQUFFLENBQUMsQ0FBQztRQUV0RCxJQUFJO1lBQ0Ysd0hBQXdIO1lBQ3hILElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDO2lCQUNsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2lCQUMxRSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztTQUNqRztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNoQjtRQUVELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0IsbUZBQW1GO1FBRW5GLE9BQU8sS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQzlCLENBQUM7SUFFRDs7O09BR0c7SUFDVSxrQkFBa0IsQ0FBQyxFQUFFLFFBQVEsRUFBNEI7O1lBQ3BFLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzRCxNQUFNLE1BQU0sR0FBRyxNQUFNLFNBQVMsQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3RFLE9BQU8sTUFBTSxDQUFDO1FBQ2hCLENBQUM7S0FBQTtJQUVEOzs7T0FHRztJQUNJLHVCQUF1QixDQUFDLFFBQWdCO1FBRTdDLE1BQU0sS0FBSyxHQUFHLE9BQU8sUUFBUSxLQUFLLFdBQVc7WUFDM0MsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxFQUFFO1lBQzFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDO1FBRXRDLE1BQU0sV0FBVyxHQUEyQixFQUFFLEtBQUssRUFBRSxDQUFDO1FBRXRELE9BQU8sV0FBVyxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7T0FFRztJQUNJLFFBQVEsQ0FBQyxFQUFXO1FBRXpCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFO1lBQ2pDLGdDQUFnQztZQUNoQyxPQUFPO1NBQ1I7UUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVoRCxJQUFJLEVBQUUsRUFBRTtZQUNOLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDdkM7YUFBTTtZQUNMLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdkMsMkRBQTJEO1lBQzNELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7SUFFRDs7T0FFRztJQUNLLGdDQUFnQyxDQUFDLE1BQW1CLEVBQUUsV0FBNkI7UUFDekYsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN2RCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNXLHdCQUF3QixDQUFDLE1BQW1COztZQUV4RCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRTNDLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO2dCQUMxQixJQUFJLE1BQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUN2QyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUNsQyxNQUFNO2lCQUNQO2FBQ0Y7UUFDSCxDQUFDO0tBQUE7SUFFRDs7O09BR0c7SUFDSyxjQUFjLENBQUMsTUFBbUI7UUFDeEMsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUk7WUFDRixNQUFNLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ2xDO2dCQUNPO1lBQ04sT0FBTyxNQUFNLElBQUksRUFBRSxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQztJQUVEOzs7T0FHRztJQUNXLGlCQUFpQixDQUFDLEtBQXVCOztZQUVyRCxJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFFdkIsSUFBSTtnQkFDRixNQUFNLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDN0MsTUFBTSxZQUFZLEdBQUcsTUFBTSxZQUFZLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztnQkFDL0QsVUFBVSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO2FBQ3RIO29CQUNPO2dCQUNOLE9BQU8sVUFBVSxDQUFDO2FBQ25CO1FBQ0gsQ0FBQztLQUFBO0lBRUQ7O09BRUc7SUFDSyxrQkFBa0IsQ0FBQyxNQUEwQixFQUFFLEtBQWM7UUFDbkUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztZQUM3QyxRQUFRLEVBQUUsQ0FBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUMzRSxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFRDs7T0FFRztJQUNLLGNBQWMsQ0FBQyxLQUFzQztRQUMzRCxvQkFBb0I7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDeEIsa0JBQWtCO1FBQ2xCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRDs7T0FFRztJQUNLLGdCQUFnQjtRQUV0QixJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRTtZQUNqRCxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQzVCO1FBRUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNLLGVBQWUsQ0FBQyxLQUFzQyxFQUFFLFlBQThCLEVBQUUsS0FBYTtRQUUzRyxhQUFhO1FBQ2IsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ25CLE9BQU87U0FDUjtRQUVELElBQUksTUFBYyxDQUFDO1FBRW5CLElBQUk7WUFDRixNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUNuQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztTQUN4QjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsK0JBQStCO1lBQy9CLElBQ0UsQ0FBQyxLQUFLO2dCQUNOLHlDQUF5QztnQkFDekMsS0FBSyxZQUFZLGlCQUFpQjtnQkFDbEMsc0RBQXNEO2dCQUN0RCxLQUFLLFlBQVksaUJBQWlCO2dCQUNsQyxLQUFLLFlBQVksZUFBZSxFQUNoQztnQkFDQSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQzthQUN2QjtpQkFBTTtnQkFDTCxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BCO1NBQ0Y7Z0JBQVM7WUFDUixNQUFNLE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDcEMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUM3RTtJQUNILENBQUM7SUFFRDs7T0FFRztJQUNLLE9BQU87UUFDYixRQUFRO1FBQ1IsUUFBUTtRQUNSLE9BQU8sSUFBSSxDQUFDLG9DQUFvQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3JGLENBQUM7Q0FFRiIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2ltYWdlLWNhcHR1cmUuZC50c1wiIC8+XG5cbmltcG9ydCB7IEJyb3dzZXJNdWx0aUZvcm1hdFJlYWRlciwgQ2hlY2tzdW1FeGNlcHRpb24sIEZvcm1hdEV4Y2VwdGlvbiwgTm90Rm91bmRFeGNlcHRpb24sIFJlc3VsdCB9IGZyb20gJ0B6eGluZy9saWJyYXJ5JztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgUmVzdWx0QW5kRXJyb3IgfSBmcm9tICcuL1Jlc3VsdEFuZEVycm9yJztcblxuLyoqXG4gKiBCYXNlZCBvbiB6eGluZy10eXBlc2NyaXB0IEJyb3dzZXJDb2RlUmVhZGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBCcm93c2VyTXVsdGlGb3JtYXRDb250aW51b3VzUmVhZGVyIGV4dGVuZHMgQnJvd3Nlck11bHRpRm9ybWF0UmVhZGVyIHtcblxuICAvKipcbiAgICogRXhwb3NlcyBfdG9jaEF2YWlsYWJsZSAuXG4gICAqL1xuICBwdWJsaWMgZ2V0IGlzVG9yY2hBdmFpbGFibGUoKTogT2JzZXJ2YWJsZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzVG9yY2hBdmFpbGFibGUuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogU2F5cyBpZiB0aGVyZSdzIGEgdG9yY2ggYXZhaWxhYmxlIGZvciB0aGUgY3VycmVudCBkZXZpY2UuXG4gICAqL1xuICBwcml2YXRlIF9pc1RvcmNoQXZhaWxhYmxlID0gbmV3IEJlaGF2aW9yU3ViamVjdDxib29sZWFuPih1bmRlZmluZWQpO1xuXG4gIC8qKlxuICAgKiBUaGUgZGV2aWNlIGlkIG9mIHRoZSBjdXJyZW50IG1lZGlhIGRldmljZS5cbiAgICovXG4gIHByaXZhdGUgZGV2aWNlSWQ6IHN0cmluZztcblxuICAvKipcbiAgICogSWYgdGhlcmUncyBzb21lIHNjYW4gc3RyZWFtIG9wZW4sIGl0IHNoYWwgYmUgaGVyZS5cbiAgICovXG4gIHByaXZhdGUgc2NhblN0cmVhbTogQmVoYXZpb3JTdWJqZWN0PFJlc3VsdEFuZEVycm9yPjtcblxuICAvKipcbiAgICogU3RhcnRzIHRoZSBkZWNvZGluZyBmcm9tIHRoZSBjdXJyZW50IG9yIGEgbmV3IHZpZGVvIGVsZW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSBjYWxsYmFja0ZuIFRoZSBjYWxsYmFjayB0byBiZSBleGVjdXRlZCBhZnRlciBldmVyeSBzY2FuIGF0dGVtcHRcbiAgICogQHBhcmFtIGRldmljZUlkIFRoZSBkZXZpY2UncyB0byBiZSB1c2VkIElkXG4gICAqIEBwYXJhbSB2aWRlb1NvdXJjZSBBIG5ldyB2aWRlbyBlbGVtZW50XG4gICAqL1xuICBwdWJsaWMgY29udGludW91c0RlY29kZUZyb21JbnB1dFZpZGVvRGV2aWNlKFxuICAgIGRldmljZUlkPzogc3RyaW5nLFxuICAgIHZpZGVvU291cmNlPzogSFRNTFZpZGVvRWxlbWVudFxuICApOiBPYnNlcnZhYmxlPFJlc3VsdEFuZEVycm9yPiB7XG5cbiAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICAvLyBLZWVwcyB0aGUgZGV2aWNlSWQgYmV0d2VlbiBzY2FubmVyIHJlc2V0cy5cbiAgICBpZiAodHlwZW9mIGRldmljZUlkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5kZXZpY2VJZCA9IGRldmljZUlkO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNjYW4kID0gbmV3IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj4oe30pO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIHRoaXMuZGVjb2RlRnJvbUlucHV0VmlkZW9EZXZpY2VDb250aW51b3VzbHkoZGV2aWNlSWQsIHZpZGVvU291cmNlLCAocmVzdWx0LCBlcnJvcikgPT4gc2NhbiQubmV4dCh7IHJlc3VsdCwgZXJyb3IgfSkpO1xuICAgICAgdGhpcy5nZXRTdHJlYW1Gb3JEZXZpY2UoeyBkZXZpY2VJZCB9KVxuICAgICAgICAudGhlbihzdHJlYW0gPT4gdGhpcy5hdHRhY2hTdHJlYW1Ub1ZpZGVvQW5kQ2hlY2tUb3JjaChzdHJlYW0sIHZpZGVvU291cmNlKSlcbiAgICAgICAgLnRoZW4odmlkZW9FbGVtZW50ID0+IHRoaXMuZGVjb2RlT25TdWJqZWN0KHNjYW4kLCB2aWRlb0VsZW1lbnQsIHRoaXMudGltZUJldHdlZW5TY2Fuc01pbGxpcykpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNjYW4kLmVycm9yKGUpO1xuICAgIH1cblxuICAgIHRoaXMuX3NldFNjYW5TdHJlYW0oc2NhbiQpO1xuXG4gICAgLy8gQHRvZG8gRmluZCBhIHdheSB0byBlbWl0IGEgY29tcGxldGUgZXZlbnQgb24gdGhlIHNjYW4gc3RyZWFtIG9uY2UgaXQncyBmaW5pc2hlZC5cblxuICAgIHJldHVybiBzY2FuJC5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBzdHJlYW0gZm9yIGNlcnRhaW4gZGV2aWNlLlxuICAgKiBGYWxscyBiYWNrIHRvIGFueSBhdmFpbGFibGUgZGV2aWNlIGlmIG5vIGBkZXZpY2VJZGAgaXMgZGVmaW5lZC5cbiAgICovXG4gIHB1YmxpYyBhc3luYyBnZXRTdHJlYW1Gb3JEZXZpY2UoeyBkZXZpY2VJZCB9OiBQYXJ0aWFsPE1lZGlhRGV2aWNlSW5mbz4pOiBQcm9taXNlPE1lZGlhU3RyZWFtPiB7XG4gICAgY29uc3QgY29uc3RyYWludHMgPSB0aGlzLmdldFVzZXJNZWRpYUNvbnN0cmFpbnRzKGRldmljZUlkKTtcbiAgICBjb25zdCBzdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYShjb25zdHJhaW50cyk7XG4gICAgcmV0dXJuIHN0cmVhbTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIG1lZGlhIHN0ZXJhbSBjb25zdHJhaW50cyBmb3IgY2VydGFpbiBgZGV2aWNlSWRgLlxuICAgKiBGYWxscyBiYWNrIHRvIGFueSBlbnZpcm9ubWVudCBhdmFpbGFibGUgZGV2aWNlIGlmIG5vIGBkZXZpY2VJZGAgaXMgZGVmaW5lZC5cbiAgICovXG4gIHB1YmxpYyBnZXRVc2VyTWVkaWFDb25zdHJhaW50cyhkZXZpY2VJZDogc3RyaW5nKTogTWVkaWFTdHJlYW1Db25zdHJhaW50cyB7XG5cbiAgICBjb25zdCB2aWRlbyA9IHR5cGVvZiBkZXZpY2VJZCA9PT0gJ3VuZGVmaW5lZCdcbiAgICAgID8geyBmYWNpbmdNb2RlOiB7IGV4YWN0OiAnZW52aXJvbm1lbnQnIH0gfVxuICAgICAgOiB7IGRldmljZUlkOiB7IGV4YWN0OiBkZXZpY2VJZCB9IH07XG5cbiAgICBjb25zdCBjb25zdHJhaW50czogTWVkaWFTdHJlYW1Db25zdHJhaW50cyA9IHsgdmlkZW8gfTtcblxuICAgIHJldHVybiBjb25zdHJhaW50cztcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGVzIGFuZCBkaXNhYmxlcyB0aGUgZGV2aWNlIHRvcmNoLlxuICAgKi9cbiAgcHVibGljIHNldFRvcmNoKG9uOiBib29sZWFuKTogdm9pZCB7XG5cbiAgICBpZiAoIXRoaXMuX2lzVG9yY2hBdmFpbGFibGUudmFsdWUpIHtcbiAgICAgIC8vIGNvbXBhdGliaWxpdHkgbm90IGNoZWNrZWQgeWV0XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgdHJhY2tzID0gdGhpcy5nZXRWaWRlb1RyYWNrcyh0aGlzLnN0cmVhbSk7XG5cbiAgICBpZiAob24pIHtcbiAgICAgIHRoaXMuYXBwbHlUb3JjaE9uVHJhY2tzKHRyYWNrcywgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXBwbHlUb3JjaE9uVHJhY2tzKHRyYWNrcywgZmFsc2UpO1xuICAgICAgLy8gQHRvZG8gY2hlY2sgcG9zc2liaWxpdHkgdG8gZGlzYWJsZSB0b3JjaCB3aXRob3V0IHJlc3RhcnRcbiAgICAgIHRoaXMucmVzdGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIHRvcmNoIGNvbXBhdGliaWxpdHkgc3RhdGUgYW5kIGF0dGFjaHMgdGhlIHN0cmVhbSB0byB0aGUgcHJldmlldyBlbGVtZW50LlxuICAgKi9cbiAgcHJpdmF0ZSBhdHRhY2hTdHJlYW1Ub1ZpZGVvQW5kQ2hlY2tUb3JjaChzdHJlYW06IE1lZGlhU3RyZWFtLCB2aWRlb1NvdXJjZTogSFRNTFZpZGVvRWxlbWVudCk6IFByb21pc2U8SFRNTFZpZGVvRWxlbWVudD4ge1xuICAgIHRoaXMudXBkYXRlVG9yY2hDb21wYXRpYmlsaXR5KHN0cmVhbSk7XG4gICAgcmV0dXJuIHRoaXMuYXR0YWNoU3RyZWFtVG9WaWRlbyhzdHJlYW0sIHZpZGVvU291cmNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHN0cmVhbSBzdXBwb3J0cyB0b3JjaCBjb250cm9sLlxuICAgKlxuICAgKiBAcGFyYW0gc3RyZWFtIFRoZSBtZWRpYSBzdHJlYW0gdXNlZCB0byBjaGVjay5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgdXBkYXRlVG9yY2hDb21wYXRpYmlsaXR5KHN0cmVhbTogTWVkaWFTdHJlYW0pOiBQcm9taXNlPHZvaWQ+IHtcblxuICAgIGNvbnN0IHRyYWNrcyA9IHRoaXMuZ2V0VmlkZW9UcmFja3Moc3RyZWFtKTtcblxuICAgIGZvciAoY29uc3QgdHJhY2sgb2YgdHJhY2tzKSB7XG4gICAgICBpZiAoYXdhaXQgdGhpcy5pc1RvcmNoQ29tcGF0aWJsZSh0cmFjaykpIHtcbiAgICAgICAgdGhpcy5faXNUb3JjaEF2YWlsYWJsZS5uZXh0KHRydWUpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICpcbiAgICogQHBhcmFtIHN0cmVhbSBUaGUgdmlkZW8gc3RyZWFtIHdoZXJlIHRoZSB0cmFja3MgZ29ubmEgYmUgZXh0cmFjdGVkIGZyb20uXG4gICAqL1xuICBwcml2YXRlIGdldFZpZGVvVHJhY2tzKHN0cmVhbTogTWVkaWFTdHJlYW0pIHtcbiAgICBsZXQgdHJhY2tzID0gW107XG4gICAgdHJ5IHtcbiAgICAgIHRyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xuICAgIH1cbiAgICBmaW5hbGx5IHtcbiAgICAgIHJldHVybiB0cmFja3MgfHwgW107XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSB0cmFjayBUaGUgbWVkaWEgc3RyZWFtIHRyYWNrIHRoYXQgd2lsbCBiZSBjaGVja2VkIGZvciBjb21wYXRpYmlsaXR5LlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBpc1RvcmNoQ29tcGF0aWJsZSh0cmFjazogTWVkaWFTdHJlYW1UcmFjaykge1xuXG4gICAgbGV0IGNvbXBhdGlibGUgPSBmYWxzZTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBpbWFnZUNhcHR1cmUgPSBuZXcgSW1hZ2VDYXB0dXJlKHRyYWNrKTtcbiAgICAgIGNvbnN0IGNhcGFiaWxpdGllcyA9IGF3YWl0IGltYWdlQ2FwdHVyZS5nZXRQaG90b0NhcGFiaWxpdGllcygpO1xuICAgICAgY29tcGF0aWJsZSA9ICEhY2FwYWJpbGl0aWVzWyd0b3JjaCddIHx8ICgnZmlsbExpZ2h0TW9kZScgaW4gY2FwYWJpbGl0aWVzICYmIGNhcGFiaWxpdGllcy5maWxsTGlnaHRNb2RlLmxlbmd0aCAhPT0gMCk7XG4gICAgfVxuICAgIGZpbmFsbHkge1xuICAgICAgcmV0dXJuIGNvbXBhdGlibGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGx5IHRoZSB0b3JjaCBzZXR0aW5nIGluIGFsbCByZWNlaXZlZCB0cmFja3MuXG4gICAqL1xuICBwcml2YXRlIGFwcGx5VG9yY2hPblRyYWNrcyh0cmFja3M6IE1lZGlhU3RyZWFtVHJhY2tbXSwgc3RhdGU6IGJvb2xlYW4pIHtcbiAgICB0cmFja3MuZm9yRWFjaCh0cmFjayA9PiB0cmFjay5hcHBseUNvbnN0cmFpbnRzKHtcbiAgICAgIGFkdmFuY2VkOiBbPGFueT57IHRvcmNoOiBzdGF0ZSwgZmlsbExpZ2h0TW9kZTogc3RhdGUgPyAndG9yY2gnIDogJ25vbmUnIH1dXG4gICAgfSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvcnJlY3RseSBzZXRzIGEgbmV3IHNjYW5TdHJlYW0gdmFsdWUuXG4gICAqL1xuICBwcml2YXRlIF9zZXRTY2FuU3RyZWFtKHNjYW4kOiBCZWhhdmlvclN1YmplY3Q8UmVzdWx0QW5kRXJyb3I+KTogdm9pZCB7XG4gICAgLy8gY2xlYW5zIG9sZCBzdHJlYW1cbiAgICB0aGlzLl9jbGVhblNjYW5TdHJlYW0oKTtcbiAgICAvLyBzZXRzIG5ldyBzdHJlYW1cbiAgICB0aGlzLnNjYW5TdHJlYW0gPSBzY2FuJDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhbnMgYW55IG9sZCBzY2FuIHN0cmVhbSB2YWx1ZS5cbiAgICovXG4gIHByaXZhdGUgX2NsZWFuU2NhblN0cmVhbSgpOiB2b2lkIHtcblxuICAgIGlmICh0aGlzLnNjYW5TdHJlYW0gJiYgIXRoaXMuc2NhblN0cmVhbS5pc1N0b3BwZWQpIHtcbiAgICAgIHRoaXMuc2NhblN0cmVhbS5jb21wbGV0ZSgpO1xuICAgIH1cblxuICAgIHRoaXMuc2NhblN0cmVhbSA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogRGVjb2RlcyB2YWx1ZXMgaW4gYSBzdHJlYW0gd2l0aCBkZWxheXMgYmV0d2VlbiBzY2Fucy5cbiAgICpcbiAgICogQHBhcmFtIHNjYW4kIFRoZSBzdWJqZWN0IHRvIHJlY2VpdmUgdGhlIHZhbHVlcy5cbiAgICogQHBhcmFtIHZpZGVvRWxlbWVudCBUaGUgdmlkZW8gZWxlbWVudCB0aGUgZGVjb2RlIHdpbGwgYmUgYXBwbGllZC5cbiAgICogQHBhcmFtIGRlbGF5IFRoZSBkZWxheSBiZXR3ZWVuIGRlY29kZSByZXN1bHRzLlxuICAgKi9cbiAgcHJpdmF0ZSBkZWNvZGVPblN1YmplY3Qoc2NhbiQ6IEJlaGF2aW9yU3ViamVjdDxSZXN1bHRBbmRFcnJvcj4sIHZpZGVvRWxlbWVudDogSFRNTFZpZGVvRWxlbWVudCwgZGVsYXk6IG51bWJlcik6IHZvaWQge1xuXG4gICAgLy8gc3RvcHMgbG9vcFxuICAgIGlmIChzY2FuJC5pc1N0b3BwZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcmVzdWx0OiBSZXN1bHQ7XG5cbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gdGhpcy5kZWNvZGUodmlkZW9FbGVtZW50KTtcbiAgICAgIHNjYW4kLm5leHQoeyByZXN1bHQgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIHN0cmVhbSBjYW5ub3Qgc3RvcCBvbiBmYWlscy5cbiAgICAgIGlmIChcbiAgICAgICAgIWVycm9yIHx8XG4gICAgICAgIC8vIHNjYW4gRmFpbHVyZSAtIGZvdW5kIG5vdGhpbmcsIG5vIGVycm9yXG4gICAgICAgIGVycm9yIGluc3RhbmNlb2YgTm90Rm91bmRFeGNlcHRpb24gfHxcbiAgICAgICAgLy8gc2NhbiBFcnJvciAtIGZvdW5kIHRoZSBRUiBidXQgZ290IGVycm9yIG9uIGRlY29kaW5nXG4gICAgICAgIGVycm9yIGluc3RhbmNlb2YgQ2hlY2tzdW1FeGNlcHRpb24gfHxcbiAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBGb3JtYXRFeGNlcHRpb25cbiAgICAgICkge1xuICAgICAgICBzY2FuJC5uZXh0KHsgZXJyb3IgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY2FuJC5lcnJvcihlcnJvcik7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGNvbnN0IHRpbWVvdXQgPSAhcmVzdWx0ID8gMCA6IGRlbGF5O1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmRlY29kZU9uU3ViamVjdChzY2FuJCwgdmlkZW9FbGVtZW50LCBkZWxheSksIHRpbWVvdXQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXN0YXJ0cyB0aGUgc2Nhbm5lci5cbiAgICovXG4gIHByaXZhdGUgcmVzdGFydCgpOiBPYnNlcnZhYmxlPFJlc3VsdEFuZEVycm9yPiB7XG4gICAgLy8gcmVzZXRcbiAgICAvLyBzdGFydFxuICAgIHJldHVybiB0aGlzLmNvbnRpbnVvdXNEZWNvZGVGcm9tSW5wdXRWaWRlb0RldmljZSh0aGlzLmRldmljZUlkLCB0aGlzLnZpZGVvRWxlbWVudCk7XG4gIH1cblxufVxuIl19