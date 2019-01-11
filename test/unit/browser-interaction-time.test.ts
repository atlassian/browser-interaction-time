import BrowserInteractionTime, {
  TimeIntervalEllapsedCallbackData,
  AbsoluteTimeEllapsedCallbackData
} from '../../src/browser-interaction-time'
import 'jest-extended'
const exec = (testTimerFn: Function) => {
  setInterval(testTimerFn, 1000)
}

/**
 * BrowserInteractionTime test
 */
describe('BrowserInteractionTime', () => {
  describe('is instantiable', () => {
    let DefaultBrowserInteractionTime: BrowserInteractionTime
    beforeEach(() => {
      DefaultBrowserInteractionTime = new BrowserInteractionTime({
        timeIntervalEllapsedCallbacks: [],
        absoluteTimeEllapsedCallbacks: [],
        browserTabInactiveCallbacks: [],
        browserTabActiveCallbacks: [],
        pauseOnMouseMovement: false,
        pauseOnScroll: false,
        idleTimeoutMs: 3000
      })
    })

    it('creates an instance', () => {
      expect(DefaultBrowserInteractionTime).toBeInstanceOf(
        BrowserInteractionTime
      )
    })

    it('starts a timer', () => {
      expect(DefaultBrowserInteractionTime.isRunning).toBeTruthy()
    })
  })

  describe('API', () => {
    let DefaultBrowserInteractionTime: BrowserInteractionTime
    let intervalCallback: TimeIntervalEllapsedCallbackData

    beforeEach(() => {
      intervalCallback = {
        timeInMilliseconds: 2000,
        callback: jest.fn(),
        multiplier: x => x * 2
      }

      DefaultBrowserInteractionTime = new BrowserInteractionTime({
        timeIntervalEllapsedCallbacks: [intervalCallback],
        absoluteTimeEllapsedCallbacks: [],
        browserTabInactiveCallbacks: [],
        browserTabActiveCallbacks: [],
        pauseOnMouseMovement: false,
        pauseOnScroll: false,
        idleTimeoutMs: 30000
      })
    })

    it('.start() and .stop() returns time in milliseconds', () => {
      DefaultBrowserInteractionTime.startTimer()
      DefaultBrowserInteractionTime.stopTimer()
      expect(
        DefaultBrowserInteractionTime.getTimeInMilliseconds()
      ).toBeDefined()

      expect(DefaultBrowserInteractionTime.isRunning()).toBe(false)
    })

    it('.start() and .stop() multiple times returns time in milliseconds', () => {
      DefaultBrowserInteractionTime.startTimer()
      DefaultBrowserInteractionTime.stopTimer()
      DefaultBrowserInteractionTime.startTimer()
      DefaultBrowserInteractionTime.stopTimer()
      expect(
        DefaultBrowserInteractionTime.getTimeInMilliseconds()
      ).toBeDefined()

      expect(DefaultBrowserInteractionTime.isRunning()).toBe(false)
    })

    it('.reset() returns 0 as timeInMilliseconds', () => {
      DefaultBrowserInteractionTime.reset()
      expect(DefaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(0)
    })
  })

  describe('absolute time callbacks are called when time is reached', () => {
    let DefaultBrowserInteractionTime: BrowserInteractionTime
    let absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[]

    beforeEach(() => {
      jest.useFakeTimers()

      absoluteTimeEllapsedCallbacks = [
        {
          timeInMilliseconds: 2000,
          callback: jest.fn(),
          pending: false
        },
        {
          timeInMilliseconds: 6000,
          callback: jest.fn(),
          pending: false
        }
      ]

      DefaultBrowserInteractionTime = new BrowserInteractionTime({
        timeIntervalEllapsedCallbacks: [],
        absoluteTimeEllapsedCallbacks: absoluteTimeEllapsedCallbacks,
        browserTabInactiveCallbacks: [],
        browserTabActiveCallbacks: [],
        pauseOnMouseMovement: false,
        pauseOnScroll: false,
        idleTimeoutMs: 30000
      })
    })

    afterEach(() => {
      jest.clearAllTimers()
    })

    it('no callback is called', () => {
      expect(DefaultBrowserInteractionTime.isRunning()).toBe(true)
      absoluteTimeEllapsedCallbacks.forEach(callbackObject => {
        expect(callbackObject.callback).not.toBeCalled()
      })
    })

    it('fake timers work as expected', () => {
      const testfn = jest.fn()
      exec(testfn)
      jest.advanceTimersByTime(10100)
      expect(testfn).toBeCalled()
      expect(testfn).toHaveBeenCalledTimes(10)
    })

    it('absoluteTimeEllapsedCallbacks are called on time', () => {
      expect(DefaultBrowserInteractionTime.isRunning()).toBe(true)
      expect(absoluteTimeEllapsedCallbacks[0].callback).toBeFunction()
      expect(absoluteTimeEllapsedCallbacks[0].callback).not.toBeCalled()
      expect(absoluteTimeEllapsedCallbacks[1].callback).not.toBeCalled()

      jest.advanceTimersByTime(3000)
      expect(DefaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(
        3000
      )
      expect(absoluteTimeEllapsedCallbacks[0].callback).toBeCalled()
      expect(absoluteTimeEllapsedCallbacks[1].callback).not.toBeCalled()

      jest.advanceTimersByTime(4000)
      expect(DefaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(
        7000
      )
      expect(absoluteTimeEllapsedCallbacks[1].callback).toBeCalled()
    })

    it('.start() and .stop() multiple times returns time in milliseconds', () => {
      DefaultBrowserInteractionTime.startTimer()
      DefaultBrowserInteractionTime.stopTimer()
      DefaultBrowserInteractionTime.startTimer()
      DefaultBrowserInteractionTime.stopTimer()
      expect(
        DefaultBrowserInteractionTime.getTimeInMilliseconds()
      ).toBeDefined()

      expect(DefaultBrowserInteractionTime.isRunning()).toBe(false)
    })

    it('.reset() returns 0 as timeInMilliseconds', () => {
      DefaultBrowserInteractionTime.reset()
      expect(DefaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(0)
    })
  })
})
