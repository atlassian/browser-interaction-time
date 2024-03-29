interface BaseTimeEllapsedCallbackData {
  callback: (timeInMs: number) => void
  timeInMilliseconds: number
}

type BasicCallback = (timeInMs: number) => void

interface TimeIntervalEllapsedCallbackData
  extends BaseTimeEllapsedCallbackData {
  multiplier: (time: number) => number
}

interface AbsoluteTimeEllapsedCallbackData
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

export {
  BaseTimeEllapsedCallbackData,
  BasicCallback,
  TimeIntervalEllapsedCallbackData,
  AbsoluteTimeEllapsedCallbackData,
  Settings,
  Times,
  Mark,
  Marks,
  Measure,
  Measures,
}
