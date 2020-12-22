import { Subscribable } from '../Base/base-classes'
import * as React from 'react'
import { LazyQueryResult } from '../LazyQueryResult/LazyQueryResult'
import fetch from '../../../react-component/utils/fetch'
type AsyncSubscriptionsType = 'update'
/**
 *  Provides a singleton for tracking async tasks in the UI
 */
class AsyncTasksClass extends Subscribable<'add' | 'remove' | 'update'> {
  list: Array<AsyncTask>
  constructor() {
    super()
    this.list = []
  }
  delete({ lazyResult }: { lazyResult: LazyQueryResult }) {
    const existingTask = this.list
      .filter(RestoreTask.isRestoreTask)
      .find((task) => task.lazyResult === lazyResult)
    if (existingTask) {
      return existingTask
    }
    const newTask = new DeleteTask({ lazyResult })
    this.add(newTask)
    return newTask
  }
  restore({ lazyResult }: { lazyResult: LazyQueryResult }) {
    const existingTask = this.list
      .filter(RestoreTask.isRestoreTask)
      .find((task) => task.lazyResult === lazyResult)
    if (existingTask) {
      return existingTask
    }
    const newTask = new RestoreTask({ lazyResult })
    this.add(newTask)
    return newTask
  }
  isRestoreTask(task: AsyncTask): task is RestoreTask {
    return RestoreTask.isRestoreTask(task)
  }
  isDeleteTask(task: AsyncTask): task is DeleteTask {
    return DeleteTask.isDeleteTask(task)
  }
  private add(asyncTask: AsyncTask) {
    if (this.list.indexOf(asyncTask) === -1) {
      this.list.push(asyncTask)
      this._notifySubscribers('add')
      this._notifySubscribers('update')
    }
  }
  remove(asyncTask: AsyncTask) {
    const index = this.list.indexOf(asyncTask)
    if (index >= 0) {
      this.list.splice(this.list.indexOf(asyncTask), 1)
      this._notifySubscribers('remove')
      this._notifySubscribers('update')
    }
  }
}

export const AsyncTasks = new AsyncTasksClass()

/**
 * Goal is to provide a common abstraction to track long running async tasks in the UI, and free up the user to do whatever they want during them.
 * Through subscriptions, we'll allow views to track progress if necessary. (useTaskProgress hooks?)
 */
class AsyncTask extends Subscribable<AsyncSubscriptionsType> {
  constructor() {
    super()
  }
}

export const useRenderOnAsyncTasksAddOrRemove = () => {
  const [, setForceRender] = React.useState(Math.random())
  React.useEffect(() => {
    const unsub = AsyncTasks.subscribeTo({
      subscribableThing: 'update',
      callback: () => {
        setForceRender(Math.random())
      },
    })
    return () => {
      unsub()
    }
  }, [])
  return
}

/**
 * Pass an async task that you want updates for.  Each update will cause your component to rerender,
 * and then you can then check whatever you want to about the task.
 */
export const useRenderOnAsyncTaskUpdate = ({
  asyncTask,
}: {
  asyncTask: AsyncTask
}) => {
  const [, setForceRender] = React.useState(Math.random())
  React.useEffect(() => {
    const unsub = asyncTask.subscribeTo({
      subscribableThing: 'update',
      callback: () => {
        setForceRender(Math.random())
      },
    })
    return () => {
      unsub()
    }
  }, [])
  return
}

class RestoreTask extends AsyncTask {
  lazyResult: LazyQueryResult
  constructor({ lazyResult }: { lazyResult: LazyQueryResult }) {
    super()
    this.lazyResult = lazyResult
    this.attemptRestore()
  }
  attemptRestore() {
    const unsubscibeCallback = this.lazyResult.subscribeTo({
      subscribableThing: 'backboneSync',
      callback: () => {
        const deletedId = this.lazyResult.plain.metacard.properties[
          'metacard.deleted.id'
        ]
        const deletedVersion = this.lazyResult.plain.metacard.properties[
          'metacard.deleted.version'
        ]
        const sourceId = this.lazyResult.plain.metacard.properties['source-id']
        if (!deletedId) {
          window.setTimeout(() => {
            this.lazyResult.getBackbone().refreshData()
          }, 5000)
        } else {
          fetch(
            `./internal/history/revert/${deletedId}/${deletedVersion}/${sourceId}`
          ).then(() => {
            this._notifySubscribers('update')
          })
          unsubscibeCallback()
        }
      },
    })
    window.setTimeout(() => {
      this.lazyResult.getBackbone().refreshData()
    }, 5000)
  }
  static isRestoreTask(task: any): task is RestoreTask {
    return task.constructor === RestoreTask
  }
}

class DeleteTask extends AsyncTask {
  lazyResult: LazyQueryResult
  constructor({ lazyResult }: { lazyResult: LazyQueryResult }) {
    super()
    this.lazyResult = lazyResult
    setTimeout(() => {
      this.attemptDelete()
    }, 1000)
  }
  attemptDelete() {
    const payload = {
      id: '1',
      jsonrpc: '2.0',
      method: 'ddf.catalog/delete',
      params: {
        ids: [this.lazyResult.plain.id],
      },
    }
    fetch('/direct', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(() => {
      this._notifySubscribers('update')
    })
  }
  static isDeleteTask(task: any): task is DeleteTask {
    return task.constructor === DeleteTask
  }
}
