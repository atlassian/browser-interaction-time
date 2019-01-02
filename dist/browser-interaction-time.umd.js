(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.browserInteractionTime = factory());
}(this, (function () { 'use strict';

  var BrowserInteractionTime = /** @class */ (function () {
      function BrowserInteractionTime(_a, domApi) {
          var timeIntervalEllapsedCallbacks = _a.timeIntervalEllapsedCallbacks, absoluteTimeEllapsedCallbacks = _a.absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs = _a.checkCallbacksIntervalMs, userLeftCallbacks = _a.userLeftCallbacks, userReturnCallbacks = _a.userReturnCallbacks, idleTimeoutMs = _a.idleTimeoutMs;
          var _this = this;
          this.triggerUserLeftPage = function () {
              // if running pause timer
              if (_this.isRunning) {
                  _this.stopTimer();
              }
              _this.userLeftCallbacks.forEach(function (fn) { return fn(); });
          };
          this.triggerUserHasReturned = function () {
              // if not running start timer
              if (!_this.isRunning) {
                  _this.startTimer();
              }
              _this.userReturnCallbacks.forEach(function (fn) { return fn(); });
          };
          this.onTimePassed = function () {
              // check all callbacks time and if passed execute callback
              _this.absoluteTimeEllapsedCallbacks.forEach(function (_a, index) {
                  var callback = _a.callback, pending = _a.pending, timeInMilliseconds = _a.timeInMilliseconds;
                  if (pending && timeInMilliseconds >= _this.getTimeInMilliseconds()) {
                      callback();
                      _this.absoluteTimeEllapsedCallbacks[index].pending = true;
                  }
              });
              _this.timeIntervalEllapsedCallbacks.forEach(function (_a, index) {
                  var callback = _a.callback, timeInMilliseconds = _a.timeInMilliseconds, multiplier = _a.multiplier;
                  if (timeInMilliseconds >= _this.getTimeInMilliseconds()) {
                      callback();
                      _this.timeIntervalEllapsedCallbacks[index].timeInMilliseconds = multiplier(timeInMilliseconds);
                  }
              });
          };
          this.resetIdleCountdown = function () {
              _this.idle = false;
              _this.currentIdleTimeMs = 0;
          };
          this.visibilityChangeHandler = function () {
              if (_this.domApi.hidden) {
                  _this.triggerUserLeftPage();
              }
              else {
                  _this.triggerUserHasReturned();
              }
          };
          this.registerEventListeners = function () {
              _this.domApi.addEventListener('visibilitychange', _this.visibilityChangeHandler, false);
              _this.domApi.addEventListener('blur', _this.triggerUserLeftPage);
              _this.domApi.addEventListener('focus', _this.triggerUserHasReturned);
              _this.domApi.addEventListener('scroll', _this.resetIdleCountdown);
              _this.domApi.addEventListener('mousemove', _this.resetIdleCountdown);
              _this.domApi.addEventListener('keyup', _this.resetIdleCountdown);
              _this.domApi.addEventListener('touchstart', _this.resetIdleCountdown);
          };
          this.unregisterEventListeners = function () {
              _this.domApi.removeEventListener('visibilitychange', _this.visibilityChangeHandler, false);
              _this.domApi.removeEventListener('blur', _this.triggerUserLeftPage);
              _this.domApi.removeEventListener('focus', _this.triggerUserHasReturned);
              _this.domApi.removeEventListener('scroll', _this.resetIdleCountdown);
              _this.domApi.removeEventListener('mousemove', _this.resetIdleCountdown);
              _this.domApi.removeEventListener('keyup', _this.resetIdleCountdown);
              _this.domApi.removeEventListener('touchstart', _this.resetIdleCountdown);
          };
          this.checkCallbacksOnInterval = function () {
              _this.checkCallbackIntervalId = _this.domApi.setInterval(function () {
                  _this.onTimePassed();
              }, _this.checkCallbacksIntervalMs);
          };
          this.startTimer = function () {
              var last = _this.times[_this.times.length - 1];
              if (last && last.start && last.stop === undefined) {
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
          this.addUserLeftCallback = function (userLeftCallback) {
              _this.userLeftCallbacks.push(userLeftCallback);
          };
          this.addUserReturnCallback = function (userReturnCallback) {
              _this.userReturnCallbacks.push(userReturnCallback);
          };
          this.getTimeInMilliseconds = function () {
              return _this.times.reduce(function (acc, current) {
                  if (current.stop && current.start) {
                      return (acc +
                          (current.stop.getMilliseconds() - current.start.getMilliseconds()));
                  }
                  return acc;
              }, 0);
              return 0;
          };
          this.isRunning = function () {
              return _this.isRunning;
          };
          this.resetTime = function () {
              _this.times = [];
          };
          this.destroy = function () {
              _this.unregisterEventListeners();
              if (_this.checkCallbackIntervalId) {
                  _this.domApi.clearInterval(_this.checkCallbackIntervalId);
              }
          };
          this.userReturnCallbacks = userReturnCallbacks;
          this.userLeftCallbacks = userLeftCallbacks;
          this.times = [];
          this.idle = false;
          this.currentIdleTimeMs = 0;
          this.checkCallbacksIntervalMs = checkCallbacksIntervalMs || 250;
          this.idleTimeoutMs = idleTimeoutMs || 30000; // 30s
          this.running = false;
          this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks;
          this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks;
          this.domApi = domApi;
          this.registerEventListeners();
          this.startTimer();
          this.checkCallbacksOnInterval();
      }
      return BrowserInteractionTime;
  }());

  return BrowserInteractionTime;

})));
//# sourceMappingURL=browser-interaction-time.umd.js.map
