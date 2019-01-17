import { Selector } from 'testcafe'

fixture`Default`.page`./fixtures/timeout.html`

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

test(`with idleTimeoutMs set to 3000ms only callbacks until 3000ms should be called`, async t => {
  await t.wait(10000)
  await t.expect(await timerReachedAbsolute.count).eql(1, { timeout: 20000 })
  await t.expect(await timerReachedInterval.count).eql(2, { timeout: 20000 })
})
