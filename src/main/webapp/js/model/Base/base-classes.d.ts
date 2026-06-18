/**
 *  Attempt to pull out what is a fairly common pattern around subscribing
 *  to instances.
 */
export declare class Subscribable<T extends {
    thing: string;
    args?: any;
}> {
    subscriptionsToMe: Record<string, Record<string, (val: T['args']) => void>>;
    subscribeTo({ subscribableThing, callback, }: {
        subscribableThing: T['thing'];
        callback: (val: T['args']) => void;
    }): () => void;
    _notifySubscribers(parameters: T): void;
    constructor();
}
export declare class Overridable<T> extends Subscribable<{
    thing: 'override';
    args: T;
}> {
    private value;
    constructor(value: T);
    override(newValue: T): void;
    get(): T;
}
