import { Subscribable } from '../Base/base-classes'
import * as React from 'react'
import { LazyQueryResult } from '../LazyQueryResult/LazyQueryResult'
import fetch from '../../../react-component/utils/fetch'
import { useParams } from 'react-router-dom'
const Common = require('../../Common.js')
import CQL from '../../cql'

type PlainMetacardPropertiesType = LazyQueryResult['plain']['metacard']['properties']

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
      .filter(DeleteTask.isInstanceOf)
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
      .filter(RestoreTask.isInstanceOf)
      .find((task) => task.lazyResult === lazyResult)
    if (existingTask) {
      return existingTask
    }
    const newTask = new RestoreTask({ lazyResult })
    this.add(newTask)
    return newTask
  }
  createSearch({ data }: { data: PlainMetacardPropertiesType }) {
    const newTask = new CreateSearchTask({ data })
    this.add(newTask)
    return newTask
  }
  saveSearch({
    lazyResult,
    data,
  }: {
    data: PlainMetacardPropertiesType
    lazyResult: LazyQueryResult
  }) {
    const existingTask = this.list
      .filter(SaveSearchTask.isInstanceOf)
      .find((task) => task.lazyResult === lazyResult)
    if (existingTask) {
      existingTask.update({ data })
      return existingTask
    }
    const newTask = new SaveSearchTask({ lazyResult, data })
    this.add(newTask)
    return newTask
  }
  isRestoreTask(task: AsyncTask): task is RestoreTask {
    return RestoreTask.isInstanceOf(task)
  }
  isDeleteTask(task: AsyncTask): task is DeleteTask {
    return DeleteTask.isInstanceOf(task)
  }
  isCreateSearchTask(task: AsyncTask): task is CreateSearchTask {
    return CreateSearchTask.isInstanceOf(task)
  }
  isSaveSearchTask(task: AsyncTask): task is SaveSearchTask {
    return SaveSearchTask.isInstanceOf(task)
  }
  hasShowableTasks() {
    return (
      this.list.filter((task) => !SaveSearchTask.isInstanceOf(task)).length > 0
    )
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
abstract class AsyncTask extends Subscribable<AsyncSubscriptionsType> {
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

// allow someone to see if one exists, and sub to updates
export const useRestoreSearchTaskBasedOnParams = () => {
  const { id } = useParams<{ id?: string }>()
  const task = useRestoreSearchTask({ id })
  return task
}

// allow someone to see if one exists, and sub to updates
export const useRestoreSearchTask = ({ id }: { id?: string }) => {
  const [task, setTask] = React.useState(null as null | RestoreTask)
  useRenderOnAsyncTasksAddOrRemove()
  React.useEffect(() => {
    const updateTask = () => {
      /**
       *  Watch out for metacard.deleted.id not existing, hence the guard,
       * and also that either id could match depending on where we are in the restore
       * process
       */
      const relevantTask = id
        ? AsyncTasks.list.filter(RestoreTask.isInstanceOf).find((task) => {
            return (
              task.lazyResult.plain.metacard.properties[
                'metacard.deleted.id'
              ] === id || task.lazyResult.plain.metacard.properties['id'] === id
            )
          })
        : null
      setTask(relevantTask || null)
    }
    const unsub = AsyncTasks.subscribeTo({
      subscribableThing: 'update',
      callback: () => {
        updateTask()
      },
    })
    updateTask()
    return () => {
      unsub()
    }
  }, [id])

  return task
}

// allow someone to see if one exists, and sub to updates
export const useCreateSearchTaskBasedOnParams = () => {
  const { id } = useParams<{ id?: string }>()
  const task = useCreateSearchTask({ id })
  return task
}

// allow someone to see if one exists, and sub to updates
export const useCreateSearchTask = ({ id }: { id?: string }) => {
  const [task, setTask] = React.useState(null as null | CreateSearchTask)
  useRenderOnAsyncTasksAddOrRemove()
  React.useEffect(() => {
    const updateTask = () => {
      const relevantTask = AsyncTasks.list
        .filter(CreateSearchTask.isInstanceOf)
        .find((task) => {
          return task.data.id === id
        })
      setTask(relevantTask || null)
    }
    const unsub = AsyncTasks.subscribeTo({
      subscribableThing: 'update',
      callback: () => {
        updateTask()
      },
    })
    updateTask()
    return () => {
      unsub()
    }
  }, [id])

  return task
}

// allow someone to see if one exists, and sub to updates
export const useSaveSearchTaskBasedOnParams = () => {
  const { id } = useParams<{ id?: string }>()
  const task = useSaveSearchTask({ id })
  return task
}

// allow someone to see if one exists, and sub to updates
export const useSaveSearchTask = ({ id }: { id?: string }) => {
  const [task, setTask] = React.useState(null as null | CreateSearchTask)
  useRenderOnAsyncTasksAddOrRemove()
  React.useEffect(() => {
    const updateTask = () => {
      const relevantTask = AsyncTasks.list
        .filter(SaveSearchTask.isInstanceOf)
        .find((task) => {
          return task.data.id === id
        })
      setTask(relevantTask || null)
    }
    const unsub = AsyncTasks.subscribeTo({
      subscribableThing: 'update',
      callback: () => {
        updateTask()
      },
    })
    updateTask()
    return () => {
      unsub()
    }
  }, [id])

  return task
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

const getCqlForFilterTree = (filterTree: any): string => {
  if (typeof filterTree === 'string') {
    try {
      filterTree = JSON.parse(filterTree)
    } catch (err) {
      // Continue using string literal if string is not valid JSON.
    }
  }
  return CQL.write(filterTree)
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
  static isInstanceOf(task: any): task is RestoreTask {
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
  static isInstanceOf(task: any): task is DeleteTask {
    return task.constructor === DeleteTask
  }
}

class CreateSearchTask extends AsyncTask {
  lazyResult?: LazyQueryResult
  data: LazyQueryResult['plain']['metacard']['properties']
  constructor({
    data,
  }: {
    data: LazyQueryResult['plain']['metacard']['properties']
  }) {
    super()
    this.data = data
    this.data.id = Common.generateUUID()
    setTimeout(() => {
      this.attemptSave()
    }, 1000)
  }
  attemptSave() {
    const payload = {
      id: '1',
      jsonrpc: '2.0',
      method: 'ddf.catalog/create',
      params: {
        metacards: [
          {
            attributes: {
              'metacard-tags': ['query'],
              ...this.data,
              cql: getCqlForFilterTree(this.data.filterTree),
            },
            metacardType: 'metacard.query',
          },
        ],
      },
    }

    fetch('/direct', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(() => {
      this._notifySubscribers('update')
    })
  }
  static isInstanceOf(task: any): task is CreateSearchTask {
    return task.constructor === CreateSearchTask
  }
}

class SaveSearchTask extends AsyncTask {
  lazyResult: LazyQueryResult
  data: PlainMetacardPropertiesType
  controller: AbortController
  timeoutid: number | undefined
  constructor({
    lazyResult,
    data,
  }: {
    lazyResult: LazyQueryResult
    data: PlainMetacardPropertiesType
  }) {
    super()
    this.lazyResult = lazyResult
    this.data = data
    this.controller = new AbortController()
    this.attemptSave()
  }
  update({ data }: { data: PlainMetacardPropertiesType }) {
    clearTimeout(this.timeoutid)
    this.controller.abort()
    this.data = data
    this.attemptSave()
  }
  attemptSave() {
    this.controller = new AbortController()
    this.timeoutid = window.setTimeout(() => {
      const payload = {
        id: '1',
        jsonrpc: '2.0',
        method: 'ddf.catalog/create',
        params: {
          metacards: [
            {
              attributes: {
                'metacard-tags': ['query'],
                ...this.data,
                cql: getCqlForFilterTree(this.data.filterTree),
              },
              metacardType: 'metacard.query',
            },
          ],
        },
      }

      fetch('/direct', {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: this.controller.signal,
      }).then(() => {
        this.lazyResult.getBackbone().refreshData()
        const unsub = this.lazyResult.subscribeTo({
          subscribableThing: 'backboneSync',
          callback: () => {
            this._notifySubscribers('update')
            unsub()
          },
        })
      })
    }, 3000)
  }
  static isInstanceOf(task: any): task is SaveSearchTask {
    return task.constructor === SaveSearchTask
  }
}
