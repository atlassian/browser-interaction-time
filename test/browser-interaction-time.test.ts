import BrowserInteractionTime, {
  DomApi,
  TimeIntervalEllapsedCallbackData
} from '../src/browser-interaction-time'

/**
 * BrowserInteractionTime test
 */
describe('BrowserInteractionTime', () => {
  describe('is instantiable', () => {
    let DefaultBrowserInteractionTime: BrowserInteractionTime
    let domApi: DomApi
    beforeEach(() => {
      domApi = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        setInterval: jest.fn(() => 10),
        clearInterval: jest.fn(),
        hidden: false
      }

      DefaultBrowserInteractionTime = new BrowserInteractionTime(
        {
          timeIntervalEllapsedCallbacks: [],
          absoluteTimeEllapsedCallbacks: [],
          browserTabInactiveCallbacks: [],
          browserTabActiveCallbacks: [],
          pauseOnMouseMovement: false,
          pauseOnScroll: false,
          idleTimeoutMs: 3000,
          checkCallbacksIntervalMs: 250
        },
        domApi
      )
    })

    it('creates an instance', () => {
      expect(DefaultBrowserInteractionTime).toBeInstanceOf(
        BrowserInteractionTime
      )
    })

    it('registers event listeners', () => {
      expect(domApi.addEventListener).toBeCalledTimes(7)
    })

    it('starts a timer', () => {
      expect(DefaultBrowserInteractionTime.isRunning).toBeTruthy()
      expect(domApi.setInterval).toBeCalled()
    })
  })
  describe('API', () => {
    let DefaultBrowserInteractionTime: BrowserInteractionTime
    let intervalCallback: TimeIntervalEllapsedCallbackData
    let domApi: DomApi

    beforeEach(() => {
      domApi = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        setInterval: jest.fn(() => 10),
        clearInterval: jest.fn(),
        hidden: false
      }

      intervalCallback = {
        timeInMilliseconds: 2000,
        callback: jest.fn(),
        multiplier: x => x * 2
      }

      DefaultBrowserInteractionTime = new BrowserInteractionTime(
        {
          timeIntervalEllapsedCallbacks: [intervalCallback],
          absoluteTimeEllapsedCallbacks: [],
          browserTabInactiveCallbacks: [],
          browserTabActiveCallbacks: [],
          pauseOnMouseMovement: false,
          pauseOnScroll: false,
          idleTimeoutMs: 3000,
          checkCallbacksIntervalMs: 250
        },
        domApi
      )
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

    it('.destroy() calls removeEventListener and setInterval', () => {
      DefaultBrowserInteractionTime.destroy()
      expect(domApi.removeEventListener).toHaveBeenCalledTimes(7)
      expect(domApi.clearInterval).toBeCalled()
    })
  })
})
