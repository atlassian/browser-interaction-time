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
        setInterval: jest.fn(),
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
    let domApi: DomApi
    beforeEach(() => {
      domApi = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        setInterval: jest.fn(),
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

    it('.start() and .stop() returns time in milliseconds', () => {
      DefaultBrowserInteractionTime.startTimer()
      DefaultBrowserInteractionTime.stopTimer()
      expect(
        DefaultBrowserInteractionTime.getTimeInMilliseconds()
      ).toBeDefined()
    })
  })
})
