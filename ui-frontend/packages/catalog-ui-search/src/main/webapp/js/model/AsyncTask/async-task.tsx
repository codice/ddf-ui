import { Subscribable } from '../Base/base-classes'

type AsyncSubscriptionsType = 'done'

class AsyncTask extends Subscribable<AsyncSubscriptionsType> {
  constructor() {
    super()
  }
}

class RestoreTask extends AsyncTask {
  id: string
  constructor({ id }: { id: string }) {
    super()
    this.id = id
    this.attemptRestore()
  }
  attemptRestore() {
    this._notifySubscribers('done')
  }
}
