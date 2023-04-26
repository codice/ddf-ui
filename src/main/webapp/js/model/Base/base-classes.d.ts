/**
 *  Attempt to pull out what is a fairly common pattern around subscribing
 *  to instances.
 */
export declare class Subscribable<T extends string> {
    subscriptionsToMe: Record<string, Record<string, () => void>>;
    subscribeTo({ subscribableThing, callback, }: {
        subscribableThing: T;
        callback: () => void;
    }): () => void;
    _notifySubscribers(subscribableThing: T): void;
    constructor();
}
