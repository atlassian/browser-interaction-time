import BrowserInteractionTime, {
  TimeIntervalEllapsedCallbackData,
  AbsoluteTimeEllapsedCallbackData
} from '../../src/browser-interaction-time'
import 'jest-extended'

const exec = (testTimerFn: Function) => {
  setInterval(testTimerFn, 1000)
}

jest.mock('lodash/throttle', () => ({ default: jest.fn(), __esModule: true }))

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
      expect(windowAddEventListenerSpy).toBeCalledTimes(4)
      expect(documentAddEventListenerSpy).toBeCalledTimes(9)
    })
  })

  describe('API', () => {
    let defaultBrowserInteractionTime: BrowserInteractionTime
    let intervalCallback: TimeIntervalEllapsedCallbackData

    beforeEach(() => {
      intervalCallback = {
        timeInMilliseconds: 2000,
        callback: jest.fn(),
        multiplier: x => x * 2
      }

      defaultBrowserInteractionTime = new BrowserInteractionTime({
        timeIntervalEllapsedCallbacks: [intervalCallback]
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
        { time: 5000 }
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
          duration: 5000
        }
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
          pending: true
        },
        {
          timeInMilliseconds: 6000,
          callback: jest.fn(),
          pending: true
        }
      ]

      defaultBrowserInteractionTime = new BrowserInteractionTime({
        absoluteTimeEllapsedCallbacks: absoluteTimeEllapsedCallbacks
      })
    })

    it('no callback is called', () => {
      defaultBrowserInteractionTime.startTimer()
      expect(defaultBrowserInteractionTime.isRunning()).toBe(true)
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
})
