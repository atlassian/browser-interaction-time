import { Selector } from 'testcafe'

fixture`Default`.page`./fixtures/index.html`

const nameInput = Selector('#developer-name')

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

test(`Timer is running 1.5s`, async t => {
  await t.wait(1500)
  await t.expect(await timerReachedInterval.count).eql(1, { timeout: 20000 })
  await t.expect(await timerReachedAbsolute.count).eql(1, { timeout: 20000 })
})

test(`Timer is running 10s`, async t => {
  await t.wait(10000)
  await t.expect(await timerReachedInterval.count).eql(4, { timeout: 20000 })
  await t.expect(await timerReachedAbsolute.count).eql(2, { timeout: 20000 })
})
