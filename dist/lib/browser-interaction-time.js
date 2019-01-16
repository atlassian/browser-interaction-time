"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BrowserInteractionTime = /** @class */ (function () {
    function BrowserInteractionTime(_a) {
        var timeIntervalEllapsedCallbacks = _a.timeIntervalEllapsedCallbacks, absoluteTimeEllapsedCallbacks = _a.absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs = _a.checkCallbacksIntervalMs, browserTabInactiveCallbacks = _a.browserTabInactiveCallbacks, browserTabActiveCallbacks = _a.browserTabActiveCallbacks, idleTimeoutMs = _a.idleTimeoutMs;
        var _this = this;
        this.onBrowserTabInactive = function () {
            // if running pause timer
            if (_this.isRunning()) {
                _this.stopTimer();
            }
            _this.browserTabInactiveCallbacks.forEach(function (fn) {
                return fn(_this.getTimeInMilliseconds());
            });
        };
        this.onBrowserTabActive = function () {
            // if not running start timer
            if (!_this.isRunning()) {
                _this.startTimer();
            }
            _this.browserTabActiveCallbacks.forEach(function (fn) {
                return fn(_this.getTimeInMilliseconds());
            });
        };
        this.onTimePassed = function () {
            // check all callbacks time and if passed execute callback
            _this.absoluteTimeEllapsedCallbacks.forEach(function (_a, index) {
                var callback = _a.callback, pending = _a.pending, timeInMilliseconds = _a.timeInMilliseconds;
                if (!pending && timeInMilliseconds <= _this.getTimeInMilliseconds()) {
                    callback(_this.getTimeInMilliseconds());
                    _this.absoluteTimeEllapsedCallbacks[index].pending = true;
                }
            });
            _this.timeIntervalEllapsedCallbacks.forEach(function (_a, index) {
                var callback = _a.callback, timeInMilliseconds = _a.timeInMilliseconds, multiplier = _a.multiplier;
                if (timeInMilliseconds <= _this.getTimeInMilliseconds()) {
                    callback(_this.getTimeInMilliseconds());
                    _this.timeIntervalEllapsedCallbacks[index].timeInMilliseconds = multiplier(timeInMilliseconds);
                }
            });
            if (_this.currentIdleTimeMs >= _this.idleTimeoutMs && _this.isRunning()) {
                _this.idle = true;
                _this.stopTimer();
            }
            else {
                _this.currentIdleTimeMs += _this.checkCallbacksIntervalMs;
            }
        };
        this.resetIdleCountdown = function () {
            if (_this.idle) {
                _this.startTimer();
            }
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
            document.addEventListener('visibilitychange', _this.visibilityChangeHandler);
            var eventlistenerOptions = { passive: true };
            window.addEventListener('blur', _this.onBrowserTabInactive);
            window.addEventListener('focus', _this.onBrowserTabActive);
            document.addEventListener('scroll', _this.resetIdleCountdown, eventlistenerOptions);
            document.addEventListener('mousemove', _this.resetIdleCountdown, eventlistenerOptions);
            document.addEventListener('keyup', _this.resetIdleCountdown, eventlistenerOptions);
            document.addEventListener('touchstart', _this.resetIdleCountdown, eventlistenerOptions);
        };
        this.unregisterEventListeners = function () {
            document.removeEventListener('visibilitychange', _this.visibilityChangeHandler);
            window.removeEventListener('blur', _this.onBrowserTabInactive);
            window.removeEventListener('focus', _this.onBrowserTabActive);
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
            if (last && last.stop === null) {
                return;
            }
            _this.times.push({
                start: Date.now(),
                stop: null
            });
            _this.running = true;
        };
        this.stopTimer = function () {
            if (!_this.times.length) {
                return;
            }
            _this.times[_this.times.length - 1].stop = Date.now();
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
                if (current.stop) {
                    acc = acc + (current.stop - current.start);
                }
                else {
                    acc = acc + (Date.now() - current.start);
                }
                return acc;
            }, 0);
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
        this.running = false;
        this.times = [];
        this.idle = false;
        this.currentIdleTimeMs = 0;
        this.browserTabActiveCallbacks = browserTabActiveCallbacks || [];
        this.browserTabInactiveCallbacks = browserTabInactiveCallbacks || [];
        this.checkCallbacksIntervalMs = checkCallbacksIntervalMs || 100;
        this.idleTimeoutMs = idleTimeoutMs || 30000; // 30s
        this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks || [];
        this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks || [];
        this.registerEventListeners();
        this.checkCallbacksOnInterval();
    }
    return BrowserInteractionTime;
}());
exports.default = BrowserInteractionTime;
//# sourceMappingURL=browser-interaction-time.js.map