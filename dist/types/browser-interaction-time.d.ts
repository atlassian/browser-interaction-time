interface BaseTimeEllapsedCallbackData {
    callback: (timeInMs: number) => void;
    timeInMilliseconds: number;
}
declare type basicCallback = (timeInMs: number) => void;
export interface TimeIntervalEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    multiplier: (time: number) => number;
}
export interface AbsoluteTimeEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    pending: boolean;
}
interface Settings {
    timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallbackData[];
    absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[];
    browserTabInactiveCallbacks: basicCallback[];
    browserTabActiveCallbacks: basicCallback[];
    pauseOnMouseMovement: boolean;
    pauseOnScroll: boolean;
    idleTimeoutMs: number;
    checkCallbacksIntervalMs?: number;
}
export default class BrowserInteractionTime {
    private times;
    private intervalId?;
    private running;
    private idleTimeoutMs;
    private currentIdleTimeMs;
    private timeInMs;
    private checkCallbacksIntervalMs;
    private idle;
    private checkCallbackIntervalId?;
    private browserTabActiveCallbacks;
    private browserTabInactiveCallbacks;
    private timeIntervalEllapsedCallbacks;
    private absoluteTimeEllapsedCallbacks;
    constructor({ timeIntervalEllapsedCallbacks, absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs, browserTabInactiveCallbacks, browserTabActiveCallbacks, idleTimeoutMs }: Settings);
    private onBrowserTabInactive;
    private onBrowserTabActive;
    private onTimePassed;
    private resetIdleCountdown;
    private visibilityChangeHandler;
    private registerEventListeners;
    private unregisterEventListeners;
    private checkCallbacksOnInterval;
    startTimer: () => void;
    stopTimer: () => void;
    addTimeIntervalEllapsedCallback: (timeIntervalEllapsedCallback: TimeIntervalEllapsedCallbackData) => void;
    addAbsoluteTimeEllapsedCallback: (absoluteTimeEllapsedCallback: AbsoluteTimeEllapsedCallbackData) => void;
    addBrowserTabInactiveCallback: (browserTabInactiveCallback: basicCallback) => void;
    addBrowserTabActiveCallback: (browserTabActiveCallback: basicCallback) => void;
    getTimeInMilliseconds: () => number;
    isRunning: () => boolean;
    reset: () => void;
    destroy: () => void;
}
export {};
