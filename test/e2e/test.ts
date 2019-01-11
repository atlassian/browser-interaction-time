import { Selector } from 'testcafe'

fixture`Default`.page`./fixtures/index.html`

const nameInput = Selector('#developer-name')

test(`Test starts up successful`, async t => {
  const headline = Selector('.headline').innerText
  await t.expect(headline).eql('⏰browser-interaction-time')
})

const timerReached = Selector('.timer-reached').with({ timeout: 20000 })

test(`Timer is running`, async t => {
  await t.wait(2000)
  await t.expect(await timerReached.count).eql(1, { timeout: 20000 })
})

test(`Timer is running long`, async t => {
  await t.wait(10000)
  await t.expect(await timerReached.count).eql(4, { timeout: 20000 })
})
