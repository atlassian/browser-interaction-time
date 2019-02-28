import throttle from 'lodash/throttle'

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
  timeIntervalEllapsedCallbacks?: TimeIntervalEllapsedCallbackData[]
  absoluteTimeEllapsedCallbacks?: AbsoluteTimeEllapsedCallbackData[]
  browserTabInactiveCallbacks?: BasicCallback[]
  browserTabActiveCallbacks?: BasicCallback[]
  idleTimeoutMs?: number
  checkCallbacksIntervalMs?: number
}
interface Times {
  start: number
  stop: number | null
}

interface Mark {
  time: number
}

interface Marks {
  [key: string]: Mark[]
}

interface Measure {
  name: string
  startTime: number
  duration: number
}

interface Measures {
  [key: string]: Measure[]
}
const windowIdleEvents = ['scroll', 'resize']
const documentIdleEvents = [
  'mousemove',
  'keyup',
  'keydown',
  'touchstart',
  'click',
  'contextmenu'
]

export default class BrowserInteractionTime {
  private running: boolean
  private times: Times[]
  private idle: boolean
  private checkCallbackIntervalId?: number
  private currentIdleTimeMs: number

  private idleTimeoutMs: number
  private checkCallbacksIntervalMs: number
  private browserTabActiveCallbacks: BasicCallback[]
  private browserTabInactiveCallbacks: BasicCallback[]
  private timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallbackData[]
  private absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[]
  private marks: Marks
  private measures: Measures

  constructor({
    timeIntervalEllapsedCallbacks,
    absoluteTimeEllapsedCallbacks,
    checkCallbacksIntervalMs,
    browserTabInactiveCallbacks,
    browserTabActiveCallbacks,
    idleTimeoutMs
  }: Settings) {
    this.running = false
    this.times = []
    this.idle = false
    this.currentIdleTimeMs = 0
    this.marks = {}
    this.measures = {}
    this.browserTabActiveCallbacks = browserTabActiveCallbacks || []
    this.browserTabInactiveCallbacks = browserTabInactiveCallbacks || []
    this.checkCallbacksIntervalMs = checkCallbacksIntervalMs || 100
    this.idleTimeoutMs = idleTimeoutMs || 3000 // 3s
    this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks || []
    this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks || []

    this.registerEventListeners()
  }

  private onBrowserTabInactive = (event: Event) => {
    // if running pause timer
    if (this.isRunning()) {
      this.stopTimer()
    }

    this.browserTabInactiveCallbacks.forEach(fn =>
      fn(this.getTimeInMilliseconds())
    )
  }

  private onBrowserTabActive = (event: Event) => {
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
        if (pending && timeInMilliseconds <= this.getTimeInMilliseconds()) {
          callback(this.getTimeInMilliseconds())
          this.absoluteTimeEllapsedCallbacks[index].pending = false
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

  private resetIdleTime = () => {
    if (this.idle) {
      this.startTimer()
    }
    this.idle = false
    this.currentIdleTimeMs = 0
  }

  private registerEventListeners = () => {
    const eventListenerOptions = { passive: true }

    window.addEventListener(
      'blur',
      this.onBrowserTabInactive,
      eventListenerOptions
    )
    window.addEventListener(
      'focus',
      this.onBrowserTabActive,
      eventListenerOptions
    )

    const throttleResetIdleTime = throttle(this.resetIdleTime, 2000, {
      leading: true,
      trailing: false
    })
    windowIdleEvents.forEach(event => {
      window.addEventListener(
        event,
        throttleResetIdleTime,
        eventListenerOptions
      )
    })

    documentIdleEvents.forEach(event =>
      document.addEventListener(
        event,
        throttleResetIdleTime,
        eventListenerOptions
      )
    )
  }

  private unregisterEventListeners = () => {
    window.removeEventListener('blur', this.onBrowserTabInactive)
    window.removeEventListener('focus', this.onBrowserTabActive)
    windowIdleEvents.forEach(event =>
      window.removeEventListener(event, this.resetIdleTime)
    )

    documentIdleEvents.forEach(event =>
      document.removeEventListener(event, this.resetIdleTime)
    )
  }

  private checkCallbacksOnInterval = () => {
    this.checkCallbackIntervalId = window.setInterval(() => {
      this.onTimePassed()
    }, this.checkCallbacksIntervalMs)
  }

  public startTimer = () => {
    if (!this.checkCallbackIntervalId) {
      this.checkCallbacksOnInterval()
    }
    const last = this.times[this.times.length - 1]
    if (last && last.stop === null) {
      return
    }
    this.times.push({
      start: performance.now(),
      stop: null
    })
    this.running = true
  }

  public stopTimer = () => {
    if (!this.times.length) {
      return
    }
    this.times[this.times.length - 1].stop = performance.now()
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
        acc = acc + (performance.now() - current.start)
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

  public mark(key: string) {
    if (!this.marks[key]) {
      this.marks[key] = []
    }
    this.marks[key].push({ time: this.getTimeInMilliseconds() })
  }

  public getMarks(name: string) {
    if (this.marks[name].length < 1) {
      return
    }

    return this.marks[name]
  }

  public measure(name: string, startMarkName: string, endMarkName: string) {
    const startMarks = this.marks[startMarkName]
    const startMark = startMarks[startMarks.length - 1]
    const endMarks = this.marks[endMarkName]
    const endMark = endMarks[endMarks.length - 1]

    if (!this.measures[name]) {
      this.measures[name] = []
    }

    this.measures[name].push({
      name,
      startTime: startMark.time,
      duration: endMark.time - startMark.time
    })
  }

  public getMeasures(name: string) {
    if (!this.measures[name] && this.measures[name].length < 1) {
      return
    }

    return this.measures[name]
  }
}
