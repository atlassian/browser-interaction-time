(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.browserInteractionTime = factory());
}(this, (function () { 'use strict';

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
                  _this.timeInMs += _this.checkCallbacksIntervalMs;
              }, _this.checkCallbacksIntervalMs);
          };
          this.startTimer = function () {
              var last = _this.times[_this.times.length - 1];
              if (last && last.stop === null) {
                  return;
              }
              _this.times.push({
                  start: _this.timeInMs,
                  stop: null
              });
              _this.running = true;
          };
          this.stopTimer = function () {
              if (!_this.times.length) {
                  return;
              }
              _this.times[_this.times.length - 1].stop = _this.timeInMs;
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
                      acc = acc + (_this.timeInMs - current.start);
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
          this.browserTabActiveCallbacks = browserTabActiveCallbacks;
          this.browserTabInactiveCallbacks = browserTabInactiveCallbacks;
          this.times = [];
          this.timeInMs = 0;
          this.idle = false;
          this.currentIdleTimeMs = 0;
          this.checkCallbacksIntervalMs = checkCallbacksIntervalMs || 100;
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

  return BrowserInteractionTime;

})));
//# sourceMappingURL=browser-interaction-time.umd.js.map
