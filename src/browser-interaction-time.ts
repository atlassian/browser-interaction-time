type NoArgNoReturn = () => void

interface BaseTimeEllapsedCallback {
  callback: () => void
  timeInMilliseconds: number
}

export interface TimeIntervalEllapsedCallback extends BaseTimeEllapsedCallback {
  multiplier: (time: number) => number
}

export interface AbsoluteTimeEllapsedCallback extends BaseTimeEllapsedCallback {
  pending: boolean
}

interface Settings {
  timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallback[]
  absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallback[]
  userLeftCallbacks: NoArgNoReturn[]
  userReturnCallbacks: NoArgNoReturn[]
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
  private userReturnCallbacks: NoArgNoReturn[]
  private userLeftCallbacks: NoArgNoReturn[]
  private timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallback[]
  private absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallback[]
  private domApi: DomApi

  constructor(
    {
      timeIntervalEllapsedCallbacks,
      absoluteTimeEllapsedCallbacks,
      checkCallbacksIntervalMs,
      userLeftCallbacks,
      userReturnCallbacks,
      idleTimeoutMs
    }: Settings,
    domApi: DomApi
  ) {
    this.userReturnCallbacks = userReturnCallbacks
    this.userLeftCallbacks = userLeftCallbacks
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

  private triggerUserLeftPage = () => {
    // if running pause timer
    if (this.isRunning) {
      this.stopTimer()
    }
    this.userLeftCallbacks.forEach(fn => fn())
  }

  private triggerUserHasReturned = () => {
    // if not running start timer
    if (!this.isRunning) {
      this.startTimer()
    }
    this.userReturnCallbacks.forEach(fn => fn())
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
      this.triggerUserLeftPage()
    } else {
      this.triggerUserHasReturned()
    }
  }

  private registerEventListeners = () => {
    this.domApi.addEventListener(
      'visibilitychange',
      this.visibilityChangeHandler,
      false
    )

    this.domApi.addEventListener('blur', this.triggerUserLeftPage)
    this.domApi.addEventListener('focus', this.triggerUserHasReturned)
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

    this.domApi.removeEventListener('blur', this.triggerUserLeftPage)
    this.domApi.removeEventListener('focus', this.triggerUserHasReturned)
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
    if (last && last.start && last.stop === undefined) {
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
    timeIntervalEllapsedCallback: TimeIntervalEllapsedCallback
  ) => {
    this.timeIntervalEllapsedCallbacks.push(timeIntervalEllapsedCallback)
  }

  public addAbsoluteTimeEllapsedCallback = (
    absoluteTimeEllapsedCallback: AbsoluteTimeEllapsedCallback
  ) => {
    this.absoluteTimeEllapsedCallbacks.push(absoluteTimeEllapsedCallback)
  }

  public addUserLeftCallback = (userLeftCallback: NoArgNoReturn) => {
    this.userLeftCallbacks.push(userLeftCallback)
  }

  public addUserReturnCallback = (userReturnCallback: NoArgNoReturn) => {
    this.userReturnCallbacks.push(userReturnCallback)
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
    return this.isRunning
  }

  public resetTime = () => {
    this.times = []
  }

  public destroy = () => {
    this.unregisterEventListeners()
    if (this.checkCallbackIntervalId) {
      this.domApi.clearInterval(this.checkCallbackIntervalId)
    }
  }
}
