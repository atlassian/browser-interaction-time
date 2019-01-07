interface BaseTimeEllapsedCallbackData {
    callback: () => void;
    timeInMilliseconds: number;
}
export interface TimeIntervalEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    multiplier: (time: number) => number;
}
export interface AbsoluteTimeEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    pending: boolean;
}
interface Settings {
    timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallbackData[];
    absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[];
    browserTabInactiveCallbacks: Function[];
    browserTabActiveCallbacks: Function[];
    pauseOnMouseMovement: boolean;
    pauseOnScroll: boolean;
    idleTimeoutMs: number;
    checkCallbacksIntervalMs: number;
}
export interface DomApi {
    addEventListener: (type: string, fn: Function, options?: any) => void;
    removeEventListener: (type: string, fn: Function, options?: any) => void;
    setInterval: (fn: Function, interval: number) => number;
    clearInterval: (id: number) => void;
    hidden: boolean;
}
export default class BrowserInteractionTime {
    private times;
    private intervalId?;
    private running;
    private idleTimeoutMs;
    private currentIdleTimeMs;
    private checkCallbacksIntervalMs;
    private idle;
    private checkCallbackIntervalId?;
    private browserTabActiveCallbacks;
    private browserTabInactiveCallbacks;
    private timeIntervalEllapsedCallbacks;
    private absoluteTimeEllapsedCallbacks;
    private domApi;
    constructor({ timeIntervalEllapsedCallbacks, absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs, browserTabInactiveCallbacks: userLeftCallbacks, browserTabActiveCallbacks: userReturnCallbacks, idleTimeoutMs }: Settings, domApi: DomApi);
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
    addBrowserTabInactiveCallback: (browserTabInactiveCallback: Function) => void;
    addBrowserTabActiveCallback: (browserTabActiveCallback: Function) => void;
    getTimeInMilliseconds: () => number;
    isRunning: () => any;
    reset: () => void;
    destroy: () => void;
}
export {};
