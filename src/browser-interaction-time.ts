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
  idleCallbacks?: BasicCallback[]
  activeCallbacks?: BasicCallback[]
  extraDocumentIdleEvents?: string[]
  idleTimeoutMs?: number
  stopTimerOnTabchange?: boolean
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

export default class BrowserInteractionTime {
  private running: boolean
  private times: Times[]
  private idle: boolean
  private checkCallbackIntervalId?: number
  private currentIdleTimeMs: number

  private idleTimeoutMs: number
  private checkCallbacksIntervalMs: number
  private stopTimerOnTabchange: boolean
  private browserTabActiveCallbacks: BasicCallback[]
  private browserTabInactiveCallbacks: BasicCallback[]
  private idleCallbacks: BasicCallback[]
  private activeCallbacks: BasicCallback[]
  private timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallbackData[]
  private absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[]
  private marks: Marks
  private measures: Measures
  private windowIdleEvents = ['scroll', 'resize']
  private documentIdleEvents = [
    'wheel',
    'keydown',
    'keyup',
    'mousedown',
    'mousemove',
    'touchstart',
    'touchmove',
    'click',
    'contextmenu',
  ]

  constructor({
    timeIntervalEllapsedCallbacks = [],
    absoluteTimeEllapsedCallbacks = [],
    checkCallbacksIntervalMs = 100,
    browserTabInactiveCallbacks = [],
    idleCallbacks = [],
    stopTimerOnTabchange = true,
    activeCallbacks = [],
    browserTabActiveCallbacks = [],
    idleTimeoutMs = 3000,
    extraDocumentIdleEvents = [],
  }: Settings) {
    this.running = false
    this.times = []
    this.idle = false
    this.currentIdleTimeMs = 0
    this.marks = {}
    this.measures = {}
    this.stopTimerOnTabchange = stopTimerOnTabchange
    this.browserTabActiveCallbacks = browserTabActiveCallbacks
    this.browserTabInactiveCallbacks = browserTabInactiveCallbacks
    this.checkCallbacksIntervalMs = checkCallbacksIntervalMs
    this.idleTimeoutMs = idleTimeoutMs
    this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks
    this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks
    this.idleCallbacks = idleCallbacks
    this.activeCallbacks = activeCallbacks
    this.documentIdleEvents = [
      ...this.documentIdleEvents,
      ...extraDocumentIdleEvents,
    ]

    this.registerEventListeners()
  }

  private onBrowserTabInactive = () => {
    // if running pause timer
    if (this.isRunning() && this.stopTimerOnTabchange) {
      this.stopTimer()
    }

    this.browserTabInactiveCallbacks.forEach((fn) =>
      fn(this.getTimeInMilliseconds())
    )
  }

  private onBrowserTabActive = () => {
    // if not running start timer
    if (!this.isRunning()) {
      this.startTimer()
    }

    this.browserTabActiveCallbacks.forEach((fn) =>
      fn(this.getTimeInMilliseconds())
    )
  }

  private onBrowserActiveChange = () => {
    if (document.visibilityState === 'visible') {
      this.onBrowserTabActive()
    } else {
      this.onBrowserTabInactive()
    }
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
          this.timeIntervalEllapsedCallbacks[index].timeInMilliseconds =
            multiplier(timeInMilliseconds)
        }
      }
    )

    if (
      this.currentIdleTimeMs >= this.idleTimeoutMs &&
      this.isRunning() &&
      !this.idle
    ) {
      this.idle = true
      this.stopTimer()
      this.idleCallbacks.forEach((fn) => fn(this.getTimeInMilliseconds()))
    } else {
      this.currentIdleTimeMs += this.checkCallbacksIntervalMs
    }
  }

  private resetIdleTime = () => {
    if (this.idle) {
      this.startTimer()
    }
    this.activeCallbacks.forEach((fn) => fn(this.getTimeInMilliseconds()))
    this.idle = false
    this.currentIdleTimeMs = 0
  }

  throttleResetIdleTime = throttle(this.resetIdleTime, 2000, {
    leading: true,
    trailing: false,
  })

  documentListenerOptions = { passive: true }
  windowListenerOptions = { ...this.documentListenerOptions, capture: true }

  private registerEventListeners = () => {
    document.addEventListener('visibilitychange', this.onBrowserActiveChange)

    this.windowIdleEvents.forEach((event) => {
      window.addEventListener(
        event,
        this.throttleResetIdleTime,
        this.windowListenerOptions
      )
    })

    this.documentIdleEvents.forEach((event) =>
      document.addEventListener(
        event,
        this.throttleResetIdleTime,
        this.documentListenerOptions
      )
    )
  }

  private unregisterEventListeners = () => {
    document.removeEventListener('visibilitychange', this.onBrowserActiveChange)

    this.windowIdleEvents.forEach((event) =>
      window.removeEventListener(
        event,
        this.throttleResetIdleTime,
        this.windowListenerOptions
      )
    )

    this.documentIdleEvents.forEach((event) =>
      document.removeEventListener(event, this.throttleResetIdleTime)
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
      stop: null,
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

  public addIdleCallback = (inactiveCallback: BasicCallback) => {
    this.idleCallbacks.push(inactiveCallback)
  }

  public addActiveCallback = (activeCallback: BasicCallback) => {
    this.activeCallbacks.push(activeCallback)
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

  public isIdle = () => {
    return this.idle
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
      duration: endMark.time - startMark.time,
    })
  }

  public getMeasures(name: string) {
    if (!this.measures[name] && this.measures[name].length < 1) {
      return
    }

    return this.measures[name]
  }
}
