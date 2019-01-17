import { Selector } from 'testcafe'

fixture`Default`.page`./fixtures/index.html`

test(`Test starts up successful`, async t => {
  const headline = Selector('.headline').innerText
  await t.expect(headline).eql('⏰browser-interaction-time')
})

const timerReachedInterval = Selector('.timer-reached-interval').with({
  timeout: 20000
})
const timerReachedAbsolute = Selector('.timer-reached-absolute').with({
  timeout: 20000
})

const blurSelector = Selector('.tab-became-inactive').with({
  timeout: 20000
})

const focusSelector = Selector('.tab-became-active').with({
  timeout: 20000
})

test(`interval callbacks are called when running 1.5s`, async t => {
  await t.wait(1500)
  await t.expect(await timerReachedAbsolute.count).eql(1, { timeout: 20000 })
})

test(`absolute callbacks are called when running 1.5s`, async t => {
  await t.wait(1500)
  await t.expect(await timerReachedAbsolute.count).eql(1, { timeout: 20000 })
})

test(`interval callbacks are called when running 10s`, async t => {
  await t.wait(10000)
  await t.expect(await timerReachedInterval.count).eql(4, { timeout: 20000 })
})

test(`absolute callbacks are called when running 10s`, async t => {
  await t.wait(10000)
  await t.expect(await timerReachedAbsolute.count).eql(2, { timeout: 20000 })
})

test(`focus and blur callbacks are called`, async t => {
  await t.wait(1500)
  await t.expect(await blurSelector.count).eql(1, { timeout: 20000 })
  await t.expect(await focusSelector.count).eql(1, { timeout: 20000 })
})

fixture`Timeout`.page`./fixtures/timeout.html`

test(`Test starts up successful`, async t => {
  const headline = Selector('.headline').innerText
  await t.expect(headline).eql('⏰browser-interaction-time')
})

test(`with idleTimeoutMs set to 3000ms only callbacks until 3000ms should be called`, async t => {
  await t.wait(10000)
  await t.expect(await timerReachedAbsolute.count).eql(1, { timeout: 20000 })
  await t.expect(await timerReachedInterval.count).eql(2, { timeout: 20000 })
})
