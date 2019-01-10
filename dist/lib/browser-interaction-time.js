"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BrowserInteractionTime = /** @class */ (function () {
    function BrowserInteractionTime(_a) {
        var timeIntervalEllapsedCallbacks = _a.timeIntervalEllapsedCallbacks, absoluteTimeEllapsedCallbacks = _a.absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs = _a.checkCallbacksIntervalMs, userLeftCallbacks = _a.browserTabInactiveCallbacks, userReturnCallbacks = _a.browserTabActiveCallbacks, idleTimeoutMs = _a.idleTimeoutMs;
        var _this = this;
        this.onBrowserTabInactive = function () {
            // if running pause timer
            if (_this.isRunning) {
                _this.stopTimer();
            }
            console.log('current time inactive is', _this.getTimeInMilliseconds());
            _this.browserTabInactiveCallbacks.forEach(function (fn) { return fn(); });
        };
        this.onBrowserTabActive = function () {
            // if not running start timer
            if (!_this.isRunning) {
                _this.startTimer();
            }
            console.log('current time active is', _this.getTimeInMilliseconds());
            _this.browserTabActiveCallbacks.forEach(function (fn) { return fn(); });
        };
        this.onTimePassed = function () {
            // check all callbacks time and if passed execute callback
            _this.absoluteTimeEllapsedCallbacks.forEach(function (_a, index) {
                var callback = _a.callback, pending = _a.pending, timeInMilliseconds = _a.timeInMilliseconds;
                if (pending && timeInMilliseconds <= _this.getTimeInMilliseconds()) {
                    callback();
                    _this.absoluteTimeEllapsedCallbacks[index].pending = true;
                }
            });
            _this.timeIntervalEllapsedCallbacks.forEach(function (_a, index) {
                var callback = _a.callback, timeInMilliseconds = _a.timeInMilliseconds, multiplier = _a.multiplier;
                if (timeInMilliseconds <= _this.getTimeInMilliseconds()) {
                    callback();
                    _this.timeIntervalEllapsedCallbacks[index].timeInMilliseconds = multiplier(timeInMilliseconds);
                }
            });
        };
        this.resetIdleCountdown = function () {
            _this.idle = false;
            _this.currentIdleTimeMs = 0;
        };
        this.visibilityChangeHandler = function (event) {
            if (document.hidden) {
                _this.onBrowserTabInactive();
            }
            else {
                _this.onBrowserTabActive();
            }
        };
        this.registerEventListeners = function () {
            document.addEventListener('visibilitychange', _this.visibilityChangeHandler, false);
            document.addEventListener('blur', _this.onBrowserTabInactive);
            document.addEventListener('focus', _this.onBrowserTabActive);
            document.addEventListener('scroll', _this.resetIdleCountdown);
            document.addEventListener('mousemove', _this.resetIdleCountdown);
            document.addEventListener('keyup', _this.resetIdleCountdown);
            document.addEventListener('touchstart', _this.resetIdleCountdown);
        };
        this.unregisterEventListeners = function () {
            document.removeEventListener('visibilitychange', _this.visibilityChangeHandler, false);
            document.removeEventListener('blur', _this.onBrowserTabInactive);
            document.removeEventListener('focus', _this.onBrowserTabActive);
            document.removeEventListener('scroll', _this.resetIdleCountdown);
            document.removeEventListener('mousemove', _this.resetIdleCountdown);
            document.removeEventListener('keyup', _this.resetIdleCountdown);
            document.removeEventListener('touchstart', _this.resetIdleCountdown);
        };
        this.checkCallbacksOnInterval = function () {
            _this.checkCallbackIntervalId = window.setInterval(function () {
                _this.onTimePassed();
            }, _this.checkCallbacksIntervalMs);
        };
        this.startTimer = function () {
            var last = _this.times[_this.times.length - 1];
            if (last && last.start && last.stop === null) {
                return;
            }
            _this.times.push({
                start: new Date(),
                stop: null
            });
            _this.running = true;
        };
        this.stopTimer = function () {
            if (!_this.times.length) {
                return;
            }
            _this.times[_this.times.length - 1].stop = new Date();
            _this.running = false;
        };
        this.addTimeIntervalEllapsedCallback = function (timeIntervalEllapsedCallback) {
            _this.timeIntervalEllapsedCallbacks.push(timeIntervalEllapsedCallback);
        };
        this.addAbsoluteTimeEllapsedCallback = function (absoluteTimeEllapsedCallback) {
            _this.absoluteTimeEllapsedCallbacks.push(absoluteTimeEllapsedCallback);
        };
        this.addBrowserTabInactiveCallback = function (browserTabInactiveCallback) {
            _this.browserTabInactiveCallbacks.push(browserTabInactiveCallback);
        };
        this.addBrowserTabActiveCallback = function (browserTabActiveCallback) {
            _this.browserTabActiveCallbacks.push(browserTabActiveCallback);
        };
        this.getTimeInMilliseconds = function () {
            return _this.times.reduce(function (acc, current) {
                if (current.stop && current.start) {
                    return acc + (current.stop.getTime() - current.start.getTime());
                }
                if (!current.stop && current.start) {
                    var now = new Date();
                    return acc + (now.getTime() - current.start.getTime());
                }
                return acc;
            }, 0);
            return 0;
        };
        this.isRunning = function () {
            return _this.running;
        };
        this.reset = function () {
            _this.times = [];
        };
        this.destroy = function () {
            _this.unregisterEventListeners();
            if (_this.checkCallbackIntervalId) {
                window.clearInterval(_this.checkCallbackIntervalId);
            }
        };
        this.browserTabActiveCallbacks = userReturnCallbacks;
        this.browserTabInactiveCallbacks = userLeftCallbacks;
        this.times = [];
        this.idle = false;
        this.currentIdleTimeMs = 0;
        this.checkCallbacksIntervalMs = checkCallbacksIntervalMs || 250;
        this.idleTimeoutMs = idleTimeoutMs || 30000; // 30s
        this.running = false;
        this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks;
        this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks;
        this.registerEventListeners();
        this.startTimer();
        this.checkCallbacksOnInterval();
    }
    return BrowserInteractionTime;
}());
exports.default = BrowserInteractionTime;
//# sourceMappingURL=browser-interaction-time.js.map