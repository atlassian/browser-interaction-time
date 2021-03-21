<p align="left">
  <img src="https://raw.githubusercontent.com/atlassian/browser-interaction-time/master/bit.png" width="200" />
</p>

# browser-interaction-time

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/atlassian/browser-interaction-time/issues)
[![license](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://raw.githubusercontent.com/atlassian/browser-interaction-time/master/LICENSE)
[![Build Status](https://travis-ci.org/atlassian/browser-interaction-time.svg?branch=master)](https://travis-ci.org/atlassian/browser-interaction-time)
[![npm](https://img.shields.io/npm/v/browser-interaction-time.svg)](https://www.npmjs.com/package/browser-interaction-time)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-brightgreen.svg)](http://semver.org/spec/v2.0.0.html)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/atlassian/browser-interaction-time.svg)](https://greenkeeper.io/)

BrowserInteractionTime lets you track the time a user is active on your webpage while ignoring time spent on a different tab or with a minimized window. It also ignores the time spent while the user is idle on a web page meaning after a certain amount of time (idleTimeoutMs) without any user interactions (scroll, mousemovement etc) the time will stop until the next user interaction.

## Importing BrowserInteractionTime

You can import the generated bundle to use the whole library like this:

```javascript
import BrowserInteractionTime from 'browser-interaction-time'
```

Additionally, you can import the transpiled modules from `dist/lib`:

```javascript
import BrowserInteractionTime from 'browser-interaction-time/dist/lib/'
```

## API

### Initialize

```js
import BrowserInteractionTime from 'browser-interaction-time'

const browserInteractionTime = new BrowserInteractiontime({
  timeIntervalEllapsedCallbacks: [],
  absoluteTimeEllapsedCallbacks: [],
  browserTabInactiveCallbacks: [],
  browserTabActiveCallbacks: [],
  idleTimeoutMs: 3000,
  checkCallbacksIntervalMs: 250
})
```

### Start timer

```js
browserInteractionTime.startTimer()
```

### Stop timer

```js
browserInteractionTime.stopTimer()
```

### Adding a callback that is executed on interval

```js
const cb = {
  multiplier: time => time * 2,
  timeInMilliseconds: 1000,
  callback: () => console.log('callback')
}
browserInteractionTime.addTimeIntervalEllapsedCallback(cb)
```

### Adding a callback that is executed on absolute time

```js
const callbackData = {
  timeInMilliseconds: 1000,
  callback: () => console.log('callback')
  pending: true
}
browserInteractionTime.addAbsoluteTimeEllapsedCallback(callbackData)
```

### Adding callback executed when browser tab becomes inactive

```js
const callback = () => console.log('some callback')
browserInteractionTime.addBrowserTabInactiveCallback(callback)
```

### Adding callback executed when browser tab becomes active

```js
const callback = () => console.log('some callback')
browserInteractionTime.addBrowserTabActiveCallback(callback)
```

### Set a mark on modified timeline (see https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark)

```js
browserInteractionTime.mark('a-mark')
browserInteractionTime.mark('b-mark')
```

### Get marks by name (see https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark)

```js
browserInteractionTime.getMarks('a-mark')
```

### Set measure time between 2 marks (see https://developer.mozilla.org/en-US/docs/Web/API/Performance/measure)

```js
browserInteractionTime.measure('a-measure', 'a-mark', 'b-mark')
```

### Get measure by name

```js
browserInteractionTime.getMeasures('a-measure') // Array of measures with name
```

### Get Time in Milliseconds

```js
browserInteractionTime.getTimeInMilliseconds() // number
```

### Check if timer is running

```js
browserInteractionTime.isRunning() // boolean
```

### Reset all times

```js
browserInteractionTime.reset()
```

### Cleanup event listeners and timers

```js
browserInteractionTime.destroy()
```

## NPM scripts

- `npm t`: Run test suite
- `npm start`: Run `npm run build` in watch mode
- `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
- `npm run test:prod`: Run linting and generate coverage
- `npm run build`: Generate bundles and typings, create docs
- `npm run lint`: Lints code
- `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)

## Author

Maximilian Heinz [@_meandmax_](https://twitter.com/_meandmax_)

## Collaborators

❤️ Logo Design by [Dominik Straka](http://www.dominikstraka.de/)
