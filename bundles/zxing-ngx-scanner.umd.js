(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('@angular/forms'), require('@zxing/library'), require('rxjs')) :
    typeof define === 'function' && define.amd ? define('@zxing/ngx-scanner', ['exports', '@angular/common', '@angular/core', '@angular/forms', '@zxing/library', 'rxjs'], factory) :
    (global = global || self, factory((global.zxing = global.zxing || {}, global.zxing['ngx-scanner'] = {}), global.ng.common, global.ng.core, global.ng.forms, global.library, global.rxjs));
}(this, (function (exports, common, core, forms, library, rxjs) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __exportStar(m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    /// <reference path="./image-capture.d.ts" />
    /**
     * Based on zxing-typescript BrowserCodeReader
     */
    var BrowserMultiFormatContinuousReader = /** @class */ (function (_super) {
        __extends(BrowserMultiFormatContinuousReader, _super);
        function BrowserMultiFormatContinuousReader() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * Says if there's a torch available for the current device.
             */
            _this._isTorchAvailable = new rxjs.BehaviorSubject(undefined);
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
            var scan$ = new rxjs.BehaviorSubject({});
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
            return __awaiter(this, void 0, void 0, function () {
                var constraints, stream;
                return __generator(this, function (_b) {
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
            return __awaiter(this, void 0, void 0, function () {
                var e_1, _a, tracks, tracks_1, tracks_1_1, track, e_1_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            tracks = this.getVideoTracks(stream);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 6, 7, 8]);
                            tracks_1 = __values(tracks), tracks_1_1 = tracks_1.next();
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
            return __awaiter(this, void 0, void 0, function () {
                var compatible, imageCapture, capabilities;
                return __generator(this, function (_a) {
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
                    error instanceof library.NotFoundException ||
                    // scan Error - found the QR but got error on decoding
                    error instanceof library.ChecksumException ||
                    error instanceof library.FormatException) {
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
    }(library.BrowserMultiFormatReader));

    var ZXingScannerComponent = /** @class */ (function () {
        /**
         * Constructor to build the object and do some DI.
         */
        function ZXingScannerComponent() {
            /**
             * How the preview element shoud be fit inside the :host container.
             */
            this.previewFitMode = 'cover';
            // instance based emitters
            this.autostarted = new core.EventEmitter();
            this.autostarting = new core.EventEmitter();
            this.torchCompatible = new core.EventEmitter();
            this.scanSuccess = new core.EventEmitter();
            this.scanFailure = new core.EventEmitter();
            this.scanError = new core.EventEmitter();
            this.scanComplete = new core.EventEmitter();
            this.camerasFound = new core.EventEmitter();
            this.camerasNotFound = new core.EventEmitter();
            this.permissionResponse = new core.EventEmitter(true);
            this.hasDevices = new core.EventEmitter();
            this.deviceChange = new core.EventEmitter();
            this._device = null;
            this._enabled = true;
            this._hints = new Map();
            this.autofocusEnabled = true;
            this.autostart = true;
            this.formats = [library.BarcodeFormat.QR_CODE];
            // computed data
            this.hasNavigator = typeof navigator !== 'undefined';
            this.isMediaDevicesSuported = this.hasNavigator && !!navigator.mediaDevices;
        }
        Object.defineProperty(ZXingScannerComponent.prototype, "codeReader", {
            /**
             * Exposes the current code reader, so the user can use it's APIs.
             */
            get: function () {
                return this._codeReader;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZXingScannerComponent.prototype, "device", {
            /**
             * User device acessor.
             */
            get: function () {
                return this._device;
            },
            /**
             * User device input
             */
            set: function (device) {
                if (!device && device !== null) {
                    throw new library.ArgumentException('The `device` must be a valid MediaDeviceInfo or null.');
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
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZXingScannerComponent.prototype, "formats", {
            /**
             * Returns all the registered formats.
             */
            get: function () {
                return this.hints.get(library.DecodeHintType.POSSIBLE_FORMATS);
            },
            /**
             * Registers formats the scanner should support.
             *
             * @param input BarcodeFormat or case-insensitive string array.
             */
            set: function (input) {
                var _this = this;
                if (typeof input === 'string') {
                    throw new Error('Invalid formats, make sure the [formats] input is a binding.');
                }
                // formats may be set from html template as BarcodeFormat or string array
                var formats = input.map(function (f) { return _this.getBarcodeFormatOrFail(f); });
                var hints = this.hints;
                // updates the hints
                hints.set(library.DecodeHintType.POSSIBLE_FORMATS, formats);
                this.hints = hints;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZXingScannerComponent.prototype, "hints", {
            /**
             * Returns all the registered hints.
             */
            get: function () {
                return this._hints;
            },
            /**
             * Does what it takes to set the hints.
             */
            set: function (hints) {
                this._hints = hints;
                // @note avoid restarting the code reader when possible
                // new instance with new hints.
                this.restart();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZXingScannerComponent.prototype, "isAutostarting", {
            /**
             *
             */
            set: function (state) {
                this._isAutostarting = state;
                this.autostarting.next(state);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZXingScannerComponent.prototype, "isAutstarting", {
            /**
             *
             */
            get: function () {
                return this._isAutostarting;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZXingScannerComponent.prototype, "torch", {
            /**
             * Allow start scan or not.
             */
            set: function (on) {
                this.getCodeReader().setTorch(on);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZXingScannerComponent.prototype, "enable", {
            /**
             * Allow start scan or not.
             */
            set: function (enabled) {
                this._enabled = Boolean(enabled);
                if (!this._enabled) {
                    this.reset();
                }
                else if (this.device) {
                    this.scanFromDevice(this.device.deviceId);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZXingScannerComponent.prototype, "enabled", {
            /**
             * Tells if the scanner is enabled or not.
             */
            get: function () {
                return this._enabled;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ZXingScannerComponent.prototype, "tryHarder", {
            /**
             * If is `tryHarder` enabled.
             */
            get: function () {
                return this.hints.get(library.DecodeHintType.TRY_HARDER);
            },
            /**
             * Enable/disable tryHarder hint.
             */
            set: function (enable) {
                var hints = this.hints;
                if (enable) {
                    hints.set(library.DecodeHintType.TRY_HARDER, true);
                }
                else {
                    hints.delete(library.DecodeHintType.TRY_HARDER);
                }
                this.hints = hints;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Gets and registers all cammeras.
         */
        ZXingScannerComponent.prototype.askForPermission = function () {
            return __awaiter(this, void 0, void 0, function () {
                var stream, permission, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.hasNavigator) {
                                console.error('@zxing/ngx-scanner', 'Can\'t ask permission, navigator is not present.');
                                this.setPermission(null);
                                return [2 /*return*/, this.hasPermission];
                            }
                            if (!this.isMediaDevicesSuported) {
                                console.error('@zxing/ngx-scanner', 'Can\'t get user media, this is not supported.');
                                this.setPermission(null);
                                return [2 /*return*/, this.hasPermission];
                            }
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, 4, 5]);
                            return [4 /*yield*/, this.getAnyVideoDevice()];
                        case 2:
                            // Will try to ask for permission
                            stream = _a.sent();
                            permission = !!stream;
                            return [3 /*break*/, 5];
                        case 3:
                            err_1 = _a.sent();
                            return [2 /*return*/, this.handlePermissionException(err_1)];
                        case 4:
                            this.terminateStream(stream);
                            return [7 /*endfinally*/];
                        case 5:
                            this.setPermission(permission);
                            // Returns the permission
                            return [2 /*return*/, permission];
                    }
                });
            });
        };
        /**
         *
         */
        ZXingScannerComponent.prototype.getAnyVideoDevice = function () {
            return navigator.mediaDevices.getUserMedia({ video: true });
        };
        /**
         * Terminates a stream and it's tracks.
         */
        ZXingScannerComponent.prototype.terminateStream = function (stream) {
            if (stream) {
                stream.getTracks().forEach(function (t) { return t.stop(); });
            }
            stream = undefined;
        };
        /**
         * Initializes the component without starting the scanner.
         */
        ZXingScannerComponent.prototype.initAutostartOff = function () {
            // do not ask for permission when autostart is off
            this.isAutostarting = null;
            // just update devices information
            this.updateVideoInputDevices();
        };
        /**
         * Initializes the component and starts the scanner.
         * Permissions are asked to accomplish that.
         */
        ZXingScannerComponent.prototype.initAutostartOn = function () {
            return __awaiter(this, void 0, void 0, function () {
                var hasPermission, e_1, devices;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.isAutostarting = true;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this.askForPermission()];
                        case 2:
                            // Asks for permission before enumerating devices so it can get all the device's info
                            hasPermission = _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            console.error('Exception occurred while asking for permission:', e_1);
                            return [2 /*return*/];
                        case 4:
                            if (!hasPermission) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.updateVideoInputDevices()];
                        case 5:
                            devices = _a.sent();
                            this.autostartScanner(__spread(devices));
                            _a.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Checks if the given device is the current defined one.
         */
        ZXingScannerComponent.prototype.isCurrentDevice = function (device) {
            return this.device && device && device.deviceId === this.device.deviceId;
        };
        /**
         * Executed after the view initialization.
         */
        ZXingScannerComponent.prototype.ngAfterViewInit = function () {
            var _this = this;
            // makes torch availability information available to user
            this.getCodeReader().isTorchAvailable.subscribe(function (x) { return _this.torchCompatible.emit(x); });
            if (!this.autostart) {
                console.warn('New feature \'autostart\' disabled, be careful. Permissions and devices recovery has to be run manually.');
                // does the necessary configuration without autostarting
                this.initAutostartOff();
                return;
            }
            // configurates the component and starts the scanner
            this.initAutostartOn();
        };
        /**
         * Executes some actions before destroy the component.
         */
        ZXingScannerComponent.prototype.ngOnDestroy = function () {
            this.reset();
        };
        /**
         * Stops old `codeReader` and starts scanning in a new one.
         */
        ZXingScannerComponent.prototype.restart = function () {
            var prevDevice = this._reset();
            if (!prevDevice) {
                return;
            }
            // @note apenas necessario por enquanto causa da Torch
            this._codeReader = undefined;
            this.device = prevDevice;
        };
        /**
         * Discovers and updates known video input devices.
         */
        ZXingScannerComponent.prototype.updateVideoInputDevices = function () {
            return __awaiter(this, void 0, void 0, function () {
                var devices, hasDevices;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getCodeReader().listVideoInputDevices()];
                        case 1:
                            devices = (_a.sent()) || [];
                            hasDevices = devices && devices.length > 0;
                            // stores discovered devices and updates information
                            this.hasDevices.next(hasDevices);
                            this.camerasFound.next(__spread(devices));
                            if (!hasDevices) {
                                this.camerasNotFound.next();
                            }
                            return [2 /*return*/, devices];
                    }
                });
            });
        };
        /**
         * Starts the scanner with the back camera otherwise take the last
         * available device.
         */
        ZXingScannerComponent.prototype.autostartScanner = function (devices) {
            var matcher = function (_a) {
                var label = _a.label;
                return /back|trás|rear|traseira|environment|ambiente/gi.test(label);
            };
            // select the rear camera by default, otherwise take the last camera.
            var device = devices.find(matcher) || devices.pop();
            if (!device) {
                throw new Error('Impossible to autostart, no input devices available.');
            }
            this.device = device;
            // @note when listening to this change, callback code will sometimes run before the previous line.
            this.deviceChange.emit(device);
            this.isAutostarting = false;
            this.autostarted.next();
        };
        /**
         * Dispatches the scan success event.
         *
         * @param result the scan result.
         */
        ZXingScannerComponent.prototype.dispatchScanSuccess = function (result) {
            this.scanSuccess.next(result.getText());
        };
        /**
         * Dispatches the scan failure event.
         */
        ZXingScannerComponent.prototype.dispatchScanFailure = function (reason) {
            this.scanFailure.next(reason);
        };
        /**
         * Dispatches the scan error event.
         *
         * @param error the error thing.
         */
        ZXingScannerComponent.prototype.dispatchScanError = function (error) {
            this.scanError.next(error);
        };
        /**
         * Dispatches the scan event.
         *
         * @param result the scan result.
         */
        ZXingScannerComponent.prototype.dispatchScanComplete = function (result) {
            this.scanComplete.next(result);
        };
        /**
         * Returns the filtered permission.
         */
        ZXingScannerComponent.prototype.handlePermissionException = function (err) {
            // failed to grant permission to video input
            console.error('@zxing/ngx-scanner', 'Error when asking for permission.', err);
            var permission;
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
        };
        /**
         * Returns a valid BarcodeFormat or fails.
         */
        ZXingScannerComponent.prototype.getBarcodeFormatOrFail = function (format) {
            return typeof format === 'string'
                ? library.BarcodeFormat[format.trim().toUpperCase()]
                : format;
        };
        /**
         * Retorna um code reader, cria um se nenhume existe.
         */
        ZXingScannerComponent.prototype.getCodeReader = function () {
            if (!this._codeReader) {
                this._codeReader = new BrowserMultiFormatContinuousReader(this.hints);
            }
            return this._codeReader;
        };
        /**
         * Starts the continuous scanning for the given device.
         *
         * @param deviceId The deviceId from the device.
         */
        ZXingScannerComponent.prototype.scanFromDevice = function (deviceId) {
            var _this = this;
            var videoElement = this.previewElemRef.nativeElement;
            var codeReader = this.getCodeReader();
            var decodingStream = codeReader.continuousDecodeFromInputVideoDevice(deviceId, videoElement);
            if (!decodingStream) {
                throw new Error('Undefined decoding stream, aborting.');
            }
            var next = function (x) { return _this._onDecodeResult(x.result, x.error); };
            var error = function (err) { return _this._onDecodeError(err); };
            var complete = function () { _this.reset(); console.log('completed'); };
            decodingStream.subscribe(next, error, complete);
        };
        /**
         * Handles decode errors.
         */
        ZXingScannerComponent.prototype._onDecodeError = function (err) {
            this.dispatchScanError(err);
            this.reset();
        };
        /**
         * Handles decode results.
         */
        ZXingScannerComponent.prototype._onDecodeResult = function (result, error) {
            if (result) {
                this.dispatchScanSuccess(result);
            }
            else {
                this.dispatchScanFailure(error);
            }
            this.dispatchScanComplete(result);
        };
        /**
         * Stops the code reader and returns the previous selected device.
         */
        ZXingScannerComponent.prototype._reset = function () {
            if (!this._codeReader) {
                return;
            }
            var device = this.device;
            // do not set this.device inside this method, it would create a recursive loop
            this._device = null;
            this._codeReader.reset();
            return device;
        };
        /**
         * Resets the scanner and emits device change.
         */
        ZXingScannerComponent.prototype.reset = function () {
            this._reset();
            this.deviceChange.emit(null);
        };
        /**
         * Sets the permission value and emmits the event.
         */
        ZXingScannerComponent.prototype.setPermission = function (hasPermission) {
            this.hasPermission = hasPermission;
            this.permissionResponse.next(hasPermission);
        };
        __decorate([
            core.ViewChild('preview', { static: true }),
            __metadata("design:type", core.ElementRef)
        ], ZXingScannerComponent.prototype, "previewElemRef", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], ZXingScannerComponent.prototype, "autofocusEnabled", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "autostarted", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "autostarting", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], ZXingScannerComponent.prototype, "autostart", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], ZXingScannerComponent.prototype, "previewFitMode", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "torchCompatible", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "scanSuccess", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "scanFailure", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "scanError", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "scanComplete", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "camerasFound", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "camerasNotFound", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "permissionResponse", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "hasDevices", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", MediaDeviceInfo),
            __metadata("design:paramtypes", [MediaDeviceInfo])
        ], ZXingScannerComponent.prototype, "device", null);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], ZXingScannerComponent.prototype, "deviceChange", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array),
            __metadata("design:paramtypes", [Array])
        ], ZXingScannerComponent.prototype, "formats", null);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], ZXingScannerComponent.prototype, "torch", null);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], ZXingScannerComponent.prototype, "enable", null);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean),
            __metadata("design:paramtypes", [Boolean])
        ], ZXingScannerComponent.prototype, "tryHarder", null);
        ZXingScannerComponent = __decorate([
            core.Component({
                selector: 'zxing-scanner',
                template: "<video #preview [style.object-fit]=\"previewFitMode\">\n  <p>\n    Your browser does not support this feature, please try to upgrade it.\n  </p>\n  <p>\n    Seu navegador n\u00E3o suporta este recurso, por favor tente atualiz\u00E1-lo.\n  </p>\n</video>\n",
                changeDetection: core.ChangeDetectionStrategy.OnPush,
                styles: [":host{display:block}video{width:100%;height:auto;-o-object-fit:contain;object-fit:contain}"]
            }),
            __metadata("design:paramtypes", [])
        ], ZXingScannerComponent);
        return ZXingScannerComponent;
    }());

    var ZXingScannerModule = /** @class */ (function () {
        function ZXingScannerModule() {
        }
        ZXingScannerModule = __decorate([
            core.NgModule({
                imports: [
                    common.CommonModule,
                    forms.FormsModule
                ],
                declarations: [ZXingScannerComponent],
                exports: [ZXingScannerComponent],
            })
        ], ZXingScannerModule);
        return ZXingScannerModule;
    }());

    exports.ZXingScannerComponent = ZXingScannerComponent;
    exports.ZXingScannerModule = ZXingScannerModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=zxing-ngx-scanner.umd.js.map
