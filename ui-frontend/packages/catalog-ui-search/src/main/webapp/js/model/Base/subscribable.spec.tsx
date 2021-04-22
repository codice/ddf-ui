import { Subscribable } from './base-classes'

class ExampleClass extends Subscribable<'one' | 'two'> {
  constructor() {
    super()
    setTimeout(() => {
      this._notifySubscribers('one')
      this._notifySubscribers('two')
    }, 500) // 2000ms is max before jest complains
  }
}

describe('subscribable classes work as expected', () => {
  it('allows subscribing', (done) => {
    const exampleInstance = new ExampleClass()
    exampleInstance.subscribeTo({
      subscribableThing: 'one',
      callback: () => {
        done()
      },
    })
  })

  it('allows unsubscribing', (done) => {
    const exampleInstance = new ExampleClass()
    const unsubCall = exampleInstance.subscribeTo({
      subscribableThing: 'one',
      callback: () => {
        throw new Error('This should not happen')
      },
    })
    unsubCall()
    setTimeout(() => {
      done()
    }, 1000)
  })
})
