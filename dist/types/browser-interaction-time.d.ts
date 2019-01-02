declare type NoArgNoReturn = () => void;
interface BaseTimeEllapsedCallback {
    callback: () => void;
    timeInMilliseconds: number;
}
export interface TimeIntervalEllapsedCallback extends BaseTimeEllapsedCallback {
    multiplier: (time: number) => number;
}
export interface AbsoluteTimeEllapsedCallback extends BaseTimeEllapsedCallback {
    pending: boolean;
}
interface Settings {
    timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallback[];
    absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallback[];
    userLeftCallbacks: NoArgNoReturn[];
    userReturnCallbacks: NoArgNoReturn[];
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
    private userReturnCallbacks;
    private userLeftCallbacks;
    private timeIntervalEllapsedCallbacks;
    private absoluteTimeEllapsedCallbacks;
    private domApi;
    constructor({ timeIntervalEllapsedCallbacks, absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs, userLeftCallbacks, userReturnCallbacks, idleTimeoutMs }: Settings, domApi: DomApi);
    private triggerUserLeftPage;
    private triggerUserHasReturned;
    private onTimePassed;
    private resetIdleCountdown;
    private visibilityChangeHandler;
    private registerEventListeners;
    private unregisterEventListeners;
    private checkCallbacksOnInterval;
    startTimer: () => void;
    stopTimer: () => void;
    addTimeIntervalEllapsedCallback: (timeIntervalEllapsedCallback: TimeIntervalEllapsedCallback) => void;
    addAbsoluteTimeEllapsedCallback: (absoluteTimeEllapsedCallback: AbsoluteTimeEllapsedCallback) => void;
    addUserLeftCallback: (userLeftCallback: NoArgNoReturn) => void;
    addUserReturnCallback: (userReturnCallback: NoArgNoReturn) => void;
    getTimeInMilliseconds: () => number;
    isRunning: () => any;
    resetTime: () => void;
    destroy: () => void;
}
export {};
