import { forEach } from 'lodash'
import BrowserInteractionTime, {
  TimeIntervalEllapsedCallbackData,
  AbsoluteTimeEllapsedCallbackData,
} from '../../src/browser-interaction-time'
import 'jest-extended'

const exec = (testTimerFn: Function) => {
  setInterval(testTimerFn, 1000)
}

jest.mock('lodash/throttle', () => ({
  default: jest.fn((x) => x),
  __esModule: true,
}))

/**
 * BrowserInteractionTime test
 */
describe('BrowserInteractionTime', () => {
  let performanceNowMock: any

  beforeEach(() => {
    jest.useFakeTimers()
    performanceNowMock = jest.spyOn(performance, 'now')
    performance.now = performanceNowMock.mockImplementation(() => 0)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.clearAllTimers()
  })

  describe('is instantiable', () => {
    let defaultBrowserInteractionTime: BrowserInteractionTime
    let documentAddEventListenerSpy: jest.SpyInstance
    let windowAddEventListenerSpy: jest.SpyInstance

    beforeEach(() => {
      documentAddEventListenerSpy = jest.spyOn(document, 'addEventListener')
      windowAddEventListenerSpy = jest.spyOn(window, 'addEventListener')
      defaultBrowserInteractionTime = new BrowserInteractionTime({})
    })

    it('creates an instance', () => {
      expect(defaultBrowserInteractionTime).toBeInstanceOf(
        BrowserInteractionTime
      )
    })

    it('registers event listeners', () => {
      expect(windowAddEventListenerSpy).toBeCalledTimes(2)
      expect(documentAddEventListenerSpy).toBeCalledTimes(10)
    })
  })

  describe('API', () => {
    let defaultBrowserInteractionTime: BrowserInteractionTime
    let intervalCallback: TimeIntervalEllapsedCallbackData

    beforeEach(() => {
      intervalCallback = {
        timeInMilliseconds: 2000,
        callback: jest.fn(),
        multiplier: (x) => x * 2,
      }

      defaultBrowserInteractionTime = new BrowserInteractionTime({
        timeIntervalEllapsedCallbacks: [intervalCallback],
      })
    })

    it('.start() and .stop() returns time in milliseconds', () => {
      defaultBrowserInteractionTime.startTimer()
      defaultBrowserInteractionTime.stopTimer()
      expect(
        defaultBrowserInteractionTime.getTimeInMilliseconds()
      ).toBeDefined()

      expect(defaultBrowserInteractionTime.isRunning()).toBe(false)
    })

    it('.start() and .stop() multiple times returns time in milliseconds', () => {
      defaultBrowserInteractionTime.startTimer()
      defaultBrowserInteractionTime.stopTimer()
      defaultBrowserInteractionTime.startTimer()
      defaultBrowserInteractionTime.stopTimer()
      expect(
        defaultBrowserInteractionTime.getTimeInMilliseconds()
      ).toBeDefined()

      expect(defaultBrowserInteractionTime.isRunning()).toBe(false)
    })

    it('.reset() returns 0 as timeInMilliseconds', () => {
      defaultBrowserInteractionTime.reset()
      expect(defaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(0)
    })

    it('.mark() adds mark to marks collection', () => {
      defaultBrowserInteractionTime.startTimer()
      performanceNowMock.mockImplementation(() => 5000)
      defaultBrowserInteractionTime.mark('mark')
      expect(defaultBrowserInteractionTime.getMarks('mark')).toHaveLength(1)
      expect(defaultBrowserInteractionTime.getMarks('mark')).toEqual([
        { time: 5000 },
      ])
    })

    it('.measure() calculates time between the last marks of the same name', () => {
      defaultBrowserInteractionTime.startTimer()
      performanceNowMock.mockImplementation(() => 5000)
      defaultBrowserInteractionTime.mark('mark')
      performanceNowMock.mockImplementation(() => 10000)
      defaultBrowserInteractionTime.mark('other-mark')
      defaultBrowserInteractionTime.measure('measure-a', 'mark', 'other-mark')
      expect(defaultBrowserInteractionTime.getMeasures('measure-a')).toEqual([
        {
          name: 'measure-a',
          startTime: 5000,
          duration: 5000,
        },
      ])
    })
  })

  describe('absolute time callbacks are called when time is reached', () => {
    let defaultBrowserInteractionTime: BrowserInteractionTime
    let absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[]

    beforeEach(() => {
      absoluteTimeEllapsedCallbacks = [
        {
          timeInMilliseconds: 2000,
          callback: jest.fn(),
          pending: true,
        },
        {
          timeInMilliseconds: 6000,
          callback: jest.fn(),
          pending: true,
        },
      ]

      //defaultBrowserInteractionTime = new BrowserInteractionTime({absoluteTimeEllapsedCallbacks: absoluteTimeEllapsedCallbacks,})
      defaultBrowserInteractionTime = new BrowserInteractionTime({})
      absoluteTimeEllapsedCallbacks.forEach((x) => {
        defaultBrowserInteractionTime.addAbsoluteTimeEllapsedCallback(x)
      })
    })

    it('no callback is called', () => {
      defaultBrowserInteractionTime.startTimer()
      expect(defaultBrowserInteractionTime.isRunning()).toBe(true)
      absoluteTimeEllapsedCallbacks.forEach((callbackObject) => {
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
      defaultBrowserInteractionTime.startTimer()
      expect(defaultBrowserInteractionTime.isRunning()).toBe(true)
      expect(absoluteTimeEllapsedCallbacks[0].callback).toBeFunction()
      expect(absoluteTimeEllapsedCallbacks[0].callback).not.toBeCalled()
      expect(absoluteTimeEllapsedCallbacks[1].callback).not.toBeCalled()

      performance.now = performanceNowMock.mockImplementation(() => 3000)
      jest.advanceTimersByTime(3000)
      expect(defaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(
        3000
      )
      expect(absoluteTimeEllapsedCallbacks[0].callback).toBeCalled()
      expect(absoluteTimeEllapsedCallbacks[1].callback).not.toBeCalled()

      performance.now = performanceNowMock.mockImplementation(() => 7000)

      jest.advanceTimersByTime(4000)
      expect(defaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(
        7000
      )
      expect(absoluteTimeEllapsedCallbacks[1].callback).toBeCalled()
    })

    it('.start() and .stop() multiple times returns time in milliseconds', () => {
      defaultBrowserInteractionTime.startTimer()
      defaultBrowserInteractionTime.stopTimer()
      defaultBrowserInteractionTime.startTimer()
      defaultBrowserInteractionTime.stopTimer()
      performance.now = performanceNowMock.mockImplementation(() => 5100)

      jest.advanceTimersByTime(5100)

      expect(
        defaultBrowserInteractionTime.getTimeInMilliseconds()
      ).toBeDefined()
      expect(defaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(
        10200
      )

      expect(defaultBrowserInteractionTime.isRunning()).toBe(false)
    })

    it('.reset() returns 0 as timeInMilliseconds', () => {
      defaultBrowserInteractionTime.startTimer()

      performance.now = performanceNowMock.mockImplementation(() => 4000)

      jest.advanceTimersByTime(4000)
      expect(defaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(
        4000
      )
      defaultBrowserInteractionTime.reset()
      expect(defaultBrowserInteractionTime.getTimeInMilliseconds()).toEqual(0)
    })
  })

  describe('test remaing methods', () => {
    let defaultBrowserInteractionTime: BrowserInteractionTime
    beforeEach(() => {
      defaultBrowserInteractionTime = new BrowserInteractionTime({})
    })

    it('destroy defaultBrowserInteractionTime', () => {
      defaultBrowserInteractionTime.startTimer()
      let temp = defaultBrowserInteractionTime.destroy()
      expect(temp).toBeUndefined()
      defaultBrowserInteractionTime.stopTimer()
    })

    it('test isIdeal', () => {
      defaultBrowserInteractionTime.startTimer()
      expect(defaultBrowserInteractionTime.isIdle()).toBeFalse()
      jest.advanceTimersByTime(8000)
      expect(defaultBrowserInteractionTime.isIdle()).toBeTrue()
    })

    it('test with timeIntervalEllapsedCallbacks', () => {
      let mockCallback = jest.fn()
      defaultBrowserInteractionTime.addTimeIntervalEllapsedCallback({
        callback: mockCallback,
        timeInMilliseconds: 3000,
        multiplier: (x) => x + 3000,
      })
      defaultBrowserInteractionTime.startTimer()
      performance.now = performanceNowMock.mockImplementation(() => 4000)
      jest.advanceTimersByTime(4000)
      expect(mockCallback).toHaveBeenCalled()
    })
  })

  describe('test resetIdleTime function', () => {
    let defaultBrowserInteractionTime: BrowserInteractionTime
    const windowIdleEvents = ['scroll', 'resize']
    const documentIdleEvents = [
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
    let events: any = {}
    beforeEach(() => {
      events = {}
      document.addEventListener = jest.fn((event, callback, dummy) => {
        events[event] = callback
      })
      window.addEventListener = jest.fn((event, callback, dummy) => {
        events[event] = callback
      })

      events['visibilitychange'] = jest.fn((event, callback, dummy) => {
        events[event] = callback
      })

      defaultBrowserInteractionTime = new BrowserInteractionTime({})
    })

    it('will not call startTimer', () => {
      documentIdleEvents.forEach((x) => {
        events[x]()
      })
      windowIdleEvents.forEach((x) => {
        events[x]()
      })
      let mockCallback = jest.fn(defaultBrowserInteractionTime.startTimer)
      defaultBrowserInteractionTime.startTimer = mockCallback
      expect(mockCallback).toBeCalledTimes(0)
    })

    it('will call startTimer', () => {
      let mockCallback = jest.fn(defaultBrowserInteractionTime.startTimer)
      defaultBrowserInteractionTime.startTimer = mockCallback
      defaultBrowserInteractionTime.startTimer()
      jest.advanceTimersByTime(8000)
      documentIdleEvents.forEach((x) => {
        events[x]()
      })
      windowIdleEvents.forEach((x) => {
        events[x]()
      })
      expect(mockCallback).toBeCalledTimes(2)
    })

    it('visiblity change event', () => {
      let mockCallbackActive = jest.fn()
      let mockCallbackInActive = jest.fn()
      defaultBrowserInteractionTime.addBrowserTabActiveCallback(
        mockCallbackActive
      )
      defaultBrowserInteractionTime.addBrowserTabInactiveCallback(
        mockCallbackInActive
      )
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      })
      events['visibilitychange']()
      expect(mockCallbackActive).toBeCalledTimes(1)
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
      })
      events['visibilitychange']()
      expect(mockCallbackInActive).toBeCalledTimes(1)
    })
  })
})
