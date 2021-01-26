/**
 *  Attempt to pull out what is a fairly common pattern around subscribing
 *  to instances.
 */
export class Subscribable<T extends string> {
  subscriptionsToMe: Record<string, Record<string, () => void>>
  subscribeTo({
    subscribableThing,
    callback,
  }: {
    subscribableThing: T
    callback: () => void
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
  _notifySubscribers(subscribableThing: T) {
    const subscribers = this.subscriptionsToMe[subscribableThing]
    if (subscribers)
      Object.values(subscribers).forEach((callback) => callback())
  }
  constructor() {
    this.subscriptionsToMe = {}
  }
}
