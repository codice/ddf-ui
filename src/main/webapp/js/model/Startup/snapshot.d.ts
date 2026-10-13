import { Subscribable } from '../Base/base-classes';
/**
 *  useSyncExternalStore expects us to return a cached or immutable version of the object
 *  as a result, it tries to be smart and only rerender if the object itself is different (despite our subscription telling it to update)
 *  this allows us to do a simple compare / snapshot to handle our usage of mutable data with useSyncExternalStore
 */
export declare class SnapshotManager<Data> extends Subscribable<{
    thing: 'update';
}> {
    private snapshot;
    private getMutable;
    private subscribeToMutable;
    private updateSnapshot;
    constructor(getMutable: () => Data, subscribeToMutable: (callback: () => void) => void);
    subscribe: (callback: () => void) => () => void;
    getSnapshot: () => Data;
}
