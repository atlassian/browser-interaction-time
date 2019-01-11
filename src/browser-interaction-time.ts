interface BaseTimeEllapsedCallbackData {
  callback: (timeInMs: number) => void
  timeInMilliseconds: number
}

type BasicCallback = (timeInMs: number) => void

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
  browserTabInactiveCallbacks: BasicCallback[]
  browserTabActiveCallbacks: BasicCallback[]
  pauseOnMouseMovement: boolean
  pauseOnScroll: boolean
  idleTimeoutMs: number
  checkCallbacksIntervalMs?: number
}
interface Times {
  start: number
  stop: number | null
}
export default class BrowserInteractionTime {
  private times: Times[]
  private intervalId?: number
  private running: boolean
  private idleTimeoutMs: number
  private currentIdleTimeMs: number
  private timeInMs: number
  private checkCallbacksIntervalMs: number
  private idle: boolean
  private checkCallbackIntervalId?: number
  private browserTabActiveCallbacks: BasicCallback[]
  private browserTabInactiveCallbacks: BasicCallback[]
  private timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallbackData[]
  private absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[]

  constructor({
    timeIntervalEllapsedCallbacks,
    absoluteTimeEllapsedCallbacks,
    checkCallbacksIntervalMs,
    browserTabInactiveCallbacks,
    browserTabActiveCallbacks,
    idleTimeoutMs
  }: Settings) {
    this.browserTabActiveCallbacks = browserTabActiveCallbacks
    this.browserTabInactiveCallbacks = browserTabInactiveCallbacks
    this.times = []
    this.timeInMs = 0
    this.idle = false
    this.currentIdleTimeMs = 0
    this.checkCallbacksIntervalMs = checkCallbacksIntervalMs || 100
    this.idleTimeoutMs = idleTimeoutMs || 30000 // 30s
    this.running = false
    this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks
    this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks
    this.registerEventListeners()
    this.startTimer()
    this.checkCallbacksOnInterval()
  }

  private onBrowserTabInactive = () => {
    // if running pause timer
    if (this.isRunning()) {
      this.stopTimer()
    }

    this.browserTabInactiveCallbacks.forEach(fn =>
      fn(this.getTimeInMilliseconds())
    )
  }

  private onBrowserTabActive = () => {
    // if not running start timer
    if (!this.isRunning()) {
      this.startTimer()
    }
    this.browserTabActiveCallbacks.forEach(fn =>
      fn(this.getTimeInMilliseconds())
    )
  }

  private onTimePassed = () => {
    // check all callbacks time and if passed execute callback
    this.absoluteTimeEllapsedCallbacks.forEach(
      ({ callback, pending, timeInMilliseconds }, index) => {
        if (!pending && timeInMilliseconds <= this.getTimeInMilliseconds()) {
          callback(this.getTimeInMilliseconds())
          this.absoluteTimeEllapsedCallbacks[index].pending = true
        }
      }
    )

    this.timeIntervalEllapsedCallbacks.forEach(
      ({ callback, timeInMilliseconds, multiplier }, index) => {
        if (timeInMilliseconds <= this.getTimeInMilliseconds()) {
          callback(this.getTimeInMilliseconds())
          this.timeIntervalEllapsedCallbacks[
            index
          ].timeInMilliseconds = multiplier(timeInMilliseconds)
        }
      }
    )

    if (this.currentIdleTimeMs >= this.idleTimeoutMs && this.isRunning()) {
      this.idle = true
      this.stopTimer()
    } else {
      this.currentIdleTimeMs += this.checkCallbacksIntervalMs
    }
  }

  private resetIdleCountdown = () => {
    if (this.idle) {
      this.startTimer()
    }
    this.idle = false
    this.currentIdleTimeMs = 0
  }

  private visibilityChangeHandler = (event: Event) => {
    if (document.hidden) {
      this.onBrowserTabInactive()
    } else {
      this.onBrowserTabActive()
    }
  }

  private registerEventListeners = () => {
    document.addEventListener(
      'visibilitychange',
      this.visibilityChangeHandler,
      false
    )

    document.addEventListener('blur', this.onBrowserTabInactive)
    document.addEventListener('focus', this.onBrowserTabActive)
    document.addEventListener('scroll', this.resetIdleCountdown)
    document.addEventListener('mousemove', this.resetIdleCountdown)
    document.addEventListener('keyup', this.resetIdleCountdown)
    document.addEventListener('touchstart', this.resetIdleCountdown)
  }

  private unregisterEventListeners = () => {
    document.removeEventListener(
      'visibilitychange',
      this.visibilityChangeHandler,
      false
    )

    document.removeEventListener('blur', this.onBrowserTabInactive)
    document.removeEventListener('focus', this.onBrowserTabActive)
    document.removeEventListener('scroll', this.resetIdleCountdown)
    document.removeEventListener('mousemove', this.resetIdleCountdown)
    document.removeEventListener('keyup', this.resetIdleCountdown)
    document.removeEventListener('touchstart', this.resetIdleCountdown)
  }

  private checkCallbacksOnInterval = () => {
    this.checkCallbackIntervalId = window.setInterval(() => {
      this.onTimePassed()
      this.timeInMs += this.checkCallbacksIntervalMs
    }, this.checkCallbacksIntervalMs)
  }

  public startTimer = () => {
    const last = this.times[this.times.length - 1]
    if (last && last.stop === null) {
      return
    }
    this.times.push({
      start: this.timeInMs,
      stop: null
    })
    this.running = true
  }

  public stopTimer = () => {
    if (!this.times.length) {
      return
    }
    this.times[this.times.length - 1].stop = this.timeInMs
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
    browserTabInactiveCallback: BasicCallback
  ) => {
    this.browserTabInactiveCallbacks.push(browserTabInactiveCallback)
  }

  public addBrowserTabActiveCallback = (
    browserTabActiveCallback: BasicCallback
  ) => {
    this.browserTabActiveCallbacks.push(browserTabActiveCallback)
  }

  public getTimeInMilliseconds = (): number => {
    return this.times.reduce((acc, current) => {
      if (current.stop) {
        acc = acc + (current.stop - current.start)
      } else {
        acc = acc + (this.timeInMs - current.start)
      }
      return acc
    }, 0)
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
      window.clearInterval(this.checkCallbackIntervalId)
    }
  }
}
