/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import _cloneDeep from 'lodash.clonedeep'
import _isEqualWith from 'lodash.isequalwith'
import { Subscribable } from '../Base/base-classes'

/**
 *  useSyncExternalStore expects us to return a cached or immutable version of the object
 *  as a result, it tries to be smart and only rerender if the object itself is different (despite our subscription telling it to update)
 *  this allows us to do a simple compare / snapshot to handle our usage of mutable data with useSyncExternalStore
 */
export class SnapshotManager<Data> extends Subscribable<{ thing: 'update' }> {
  private snapshot: Data
  private getMutable: () => Data
  private subscribeToMutable: (callback: () => void) => void
  private updateSnapshot = () => {
    const newSnapshot = _cloneDeep(this.getMutable())
    if (
      !_isEqualWith(newSnapshot, this.snapshot, (_v1, _v2, key) => {
        if (key === 'subscriptionsToMe') {
          return true // Ignore the "subscriptionsToMe" field
        }
        // Perform default comparison for other fields
        return undefined
      })
    ) {
      this.snapshot = newSnapshot
      this._notifySubscribers({ thing: 'update' })
    }
  }
  constructor(
    getMutable: () => Data,
    subscribeToMutable: (callback: () => void) => void
  ) {
    super()
    this.getMutable = getMutable
    this.snapshot = _cloneDeep(this.getMutable())
    this.subscribeToMutable = subscribeToMutable
    this.subscribeToMutable(() => {
      this.updateSnapshot()
    })
  }
  subscribe = (callback: () => void) => {
    return this.subscribeTo({ subscribableThing: 'update', callback })
  }
  getSnapshot = (): Data => {
    return this.snapshot
  }
}
