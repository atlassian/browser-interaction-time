interface BaseTimeEllapsedCallbackData {
    callback: (timeInMs: number) => void;
    timeInMilliseconds: number;
}
declare type BasicCallback = (timeInMs: number) => void;
export interface TimeIntervalEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    multiplier: (time: number) => number;
}
export interface AbsoluteTimeEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    pending: boolean;
}
interface Settings {
    timeIntervalEllapsedCallbacks?: TimeIntervalEllapsedCallbackData[];
    absoluteTimeEllapsedCallbacks?: AbsoluteTimeEllapsedCallbackData[];
    browserTabInactiveCallbacks?: BasicCallback[];
    browserTabActiveCallbacks?: BasicCallback[];
    idleTimeoutMs?: number;
    checkCallbacksIntervalMs?: number;
}
export default class BrowserInteractionTime {
    private running;
    private times;
    private timeInMs;
    private idle;
    private checkCallbackIntervalId?;
    private currentIdleTimeMs;
    private idleTimeoutMs;
    private checkCallbacksIntervalMs;
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
    addBrowserTabInactiveCallback: (browserTabInactiveCallback: BasicCallback) => void;
    addBrowserTabActiveCallback: (browserTabActiveCallback: BasicCallback) => void;
    getTimeInMilliseconds: () => number;
    isRunning: () => boolean;
    reset: () => void;
    destroy: () => void;
}
export {};
