/**
 *  Attempt to pull out what is a fairly common pattern around subscribing
 *  to instances.
 */
export class Subscribable<T extends [string, any]> {
  subscriptionsToMe: Record<string, Record<string, (val: T[1]) => void>>
  subscribeTo({
    subscribableThing,
    callback,
  }: {
    subscribableThing: T[0]
    callback: (val: T[1]) => void
  }) {
    const id = Math.random().toString()
    if (!this.subscriptionsToMe[subscribableThing]) {
      this.subscriptionsToMe[subscribableThing] = {}
    }
    this.subscriptionsToMe[subscribableThing][id] = callback
    return () => {
      delete this.subscriptionsToMe[subscribableThing][id]
    }
  }
  _notifySubscribers(subscribableThing: T[0], val: T[1]) {
    const subscribers = this.subscriptionsToMe[subscribableThing]
    if (subscribers)
      Object.values(subscribers).forEach((callback) => callback(val))
  }
  constructor() {
    this.subscriptionsToMe = {}
  }
}
