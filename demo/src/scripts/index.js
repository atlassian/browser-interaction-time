import '../styles/index.scss';
import BrowserInteractionTime from '../../../dist/browser-interaction-time.umd';

document.addEventListener('DOMContentLoaded', () => {
  const appendMessageToDom = text => time => {
    const element = document.createElement('div');
    element.innerHTML = `<span>${text}: ${time} ms</span>`;
    document.body.appendChild(element);
  };

  var bit = new BrowserInteractionTime({
    timeIntervalEllapsedCallbacks: [
      {
        timeInMilliseconds: 1000,
        callback: appendMessageToDom('Timer reached'),
        multiplier: x => x * 2
      }
    ],
    absoluteTimeEllapsedCallbacks: [],
    browserTabInactiveCallbacks: [appendMessageToDom('Tab became inactive')],
    browserTabActiveCallbacks: [appendMessageToDom('Tab became active')],
    pauseOnMouseMovement: false,
    pauseOnScroll: false,
    idleTimeoutMs: 3000
  });

  bit.startTimer();
});
