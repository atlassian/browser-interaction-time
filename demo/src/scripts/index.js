import '../styles/index.scss';
import BrowserInteractionTime from '../../../dist/browser-interaction-time.umd';

var bit = new BrowserInteractionTime(
  {
    timeIntervalEllapsedCallbacks: [
      {
        timeInMilliseconds: 1000,
        callback: () => console.log('timer reached'),
        multiplier: x => x * 2
      }
    ],
    absoluteTimeEllapsedCallbacks: [],
    browserTabInactiveCallbacks: [() => console.log('inactive tab')],
    browserTabActiveCallbacks: [() => console.log('active tab')],
    pauseOnMouseMovement: false,
    pauseOnScroll: false,
    idleTimeoutMs: 3000,
    checkCallbacksIntervalMs: 250
  },
  {
    addEventListener: window.addEventListener.bind(window),
    removeEventListener: window.removeEventListener.bind(window),
    setInterval: setInterval.bind(window),
    clearInterval: clearInterval.bind(window),
    hidden: document.hidden
  }
);
