interface BaseTimeEllapsedCallbackData {
  callback: () => void
  timeInMilliseconds: number
}

export interface TimeIntervalEllapsedCallbackData
  extends BaseTimeEllapsedCallbackData {
  multiplier: (time: number) => number
}

export interface AbsoluteTimeEllapsedCallbackData
  extends BaseTimeEllapsedCallbackData {
  pending: boolean
}

interface Settings {
  timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallbackData[]
  absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[]
  browserTabInactiveCallbacks: Function[]
  browserTabActiveCallbacks: Function[]
  pauseOnMouseMovement: boolean
  pauseOnScroll: boolean
  idleTimeoutMs: number
  checkCallbacksIntervalMs: number
}

export interface DomApi {
  addEventListener: (type: string, fn: Function, options?: any) => void
  removeEventListener: (type: string, fn: Function, options?: any) => void
  setInterval: (fn: Function, interval: number) => number
  clearInterval: (id: number) => void
  hidden: boolean
}

interface Times {
  start: Date
  stop: Date | null
}
export default class BrowserInteractionTime {
  private times: Times[]
  private intervalId?: number
  private running: boolean
  private idleTimeoutMs: number
  private currentIdleTimeMs: number
  private checkCallbacksIntervalMs: number
  private idle: boolean
  private checkCallbackIntervalId?: number
  private browserTabActiveCallbacks: Function[]
  private browserTabInactiveCallbacks: Function[]
  private timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallbackData[]
  private absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[]
  private domApi: DomApi

  constructor(
    {
      timeIntervalEllapsedCallbacks,
      absoluteTimeEllapsedCallbacks,
      checkCallbacksIntervalMs,
      browserTabInactiveCallbacks: userLeftCallbacks,
      browserTabActiveCallbacks: userReturnCallbacks,
      idleTimeoutMs
    }: Settings,
    domApi: DomApi
  ) {
    this.browserTabActiveCallbacks = userReturnCallbacks
    this.browserTabInactiveCallbacks = userLeftCallbacks
    this.times = []
    this.idle = false
    this.currentIdleTimeMs = 0
    this.checkCallbacksIntervalMs = checkCallbacksIntervalMs || 250
    this.idleTimeoutMs = idleTimeoutMs || 30000 // 30s
    this.running = false
    this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks
    this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks
    this.domApi = domApi
    this.registerEventListeners()
    this.startTimer()
    this.checkCallbacksOnInterval()
  }

  private onBrowserTabInactive = () => {
    // if running pause timer
    if (this.isRunning) {
      this.stopTimer()
    }
    this.browserTabInactiveCallbacks.forEach(fn => fn())
  }

  private onBrowserTabActive = () => {
    // if not running start timer
    if (!this.isRunning) {
      this.startTimer()
    }
    this.browserTabActiveCallbacks.forEach(fn => fn())
  }

  private onTimePassed = () => {
    // check all callbacks time and if passed execute callback
    this.absoluteTimeEllapsedCallbacks.forEach(
      ({ callback, pending, timeInMilliseconds }, index) => {
        if (pending && timeInMilliseconds >= this.getTimeInMilliseconds()) {
          callback()
          this.absoluteTimeEllapsedCallbacks[index].pending = true
        }
      }
    )

    this.timeIntervalEllapsedCallbacks.forEach(
      ({ callback, timeInMilliseconds, multiplier }, index) => {
        if (timeInMilliseconds >= this.getTimeInMilliseconds()) {
          callback()
          this.timeIntervalEllapsedCallbacks[
            index
          ].timeInMilliseconds = multiplier(timeInMilliseconds)
        }
      }
    )
  }

  private resetIdleCountdown = () => {
    this.idle = false
    this.currentIdleTimeMs = 0
  }

  private visibilityChangeHandler = () => {
    if (this.domApi.hidden) {
      this.onBrowserTabInactive()
    } else {
      this.onBrowserTabActive()
    }
  }

  private registerEventListeners = () => {
    this.domApi.addEventListener(
      'visibilitychange',
      this.visibilityChangeHandler,
      false
    )

    this.domApi.addEventListener('blur', this.onBrowserTabInactive)
    this.domApi.addEventListener('focus', this.onBrowserTabActive)
    this.domApi.addEventListener('scroll', this.resetIdleCountdown)
    this.domApi.addEventListener('mousemove', this.resetIdleCountdown)
    this.domApi.addEventListener('keyup', this.resetIdleCountdown)
    this.domApi.addEventListener('touchstart', this.resetIdleCountdown)
  }

  private unregisterEventListeners = () => {
    this.domApi.removeEventListener(
      'visibilitychange',
      this.visibilityChangeHandler,
      false
    )

    this.domApi.removeEventListener('blur', this.onBrowserTabInactive)
    this.domApi.removeEventListener('focus', this.onBrowserTabActive)
    this.domApi.removeEventListener('scroll', this.resetIdleCountdown)
    this.domApi.removeEventListener('mousemove', this.resetIdleCountdown)
    this.domApi.removeEventListener('keyup', this.resetIdleCountdown)
    this.domApi.removeEventListener('touchstart', this.resetIdleCountdown)
  }

  private checkCallbacksOnInterval = () => {
    this.checkCallbackIntervalId = this.domApi.setInterval(() => {
      this.onTimePassed()
    }, this.checkCallbacksIntervalMs)
  }

  public startTimer = () => {
    const last = this.times[this.times.length - 1]
    if (last && last.start && last.stop === null) {
      return
    }
    this.times.push({
      start: new Date(),
      stop: null
    })
    this.running = true
  }

  public stopTimer = () => {
    if (!this.times.length) {
      return
    }
    this.times[this.times.length - 1].stop = new Date()
    this.running = false
  }

  public addTimeIntervalEllapsedCallback = (
    timeIntervalEllapsedCallback: TimeIntervalEllapsedCallbackData
  ) => {
    this.timeIntervalEllapsedCallbacks.push(timeIntervalEllapsedCallback)
  }

  public addAbsoluteTimeEllapsedCallback = (
    absoluteTimeEllapsedCallback: AbsoluteTimeEllapsedCallbackData
  ) => {
    this.absoluteTimeEllapsedCallbacks.push(absoluteTimeEllapsedCallback)
  }

  public addBrowserTabInactiveCallback = (
    browserTabInactiveCallback: Function
  ) => {
    this.browserTabInactiveCallbacks.push(browserTabInactiveCallback)
  }

  public addBrowserTabActiveCallback = (browserTabActiveCallback: Function) => {
    this.browserTabActiveCallbacks.push(browserTabActiveCallback)
  }

  public getTimeInMilliseconds = (): number => {
    return this.times.reduce((acc, current) => {
      if (current.stop && current.start) {
        return (
          acc +
          (current.stop.getMilliseconds() - current.start.getMilliseconds())
        )
      }
      return acc
    }, 0)
    return 0
  }

  public isRunning = () => {
    return this.running
  }

  public reset = () => {
    this.times = []
  }

  public destroy = () => {
    this.unregisterEventListeners()
    if (this.checkCallbackIntervalId) {
      this.domApi.clearInterval(this.checkCallbackIntervalId)
    }
  }
}
