import BrowserInteractionTime, {
  TimeIntervalEllapsedCallbackData
} from '../src/browser-interaction-time'

const window = global

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
        idleTimeoutMs: 3000,
        checkCallbacksIntervalMs: 250
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
        idleTimeoutMs: 3000,
        checkCallbacksIntervalMs: 250
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
})
