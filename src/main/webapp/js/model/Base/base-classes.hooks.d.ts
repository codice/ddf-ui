import { Subscribable, Overridable } from './base-classes';
export declare function useSubscribable<T extends {
    thing: string;
    args?: any;
}>(subscribable: Subscribable<T>, thing: T['thing'], callback: (val: T['args']) => void): void;
/**
 * Notice that we are passing a function to useState. This is because useState will call functions
 * that are passed to it to compute the initial state. Since overridable.get() could return a function,
 * we need to encapsulate the call to it within another function to ensure that useState handles it correctly.
 * Similar with setValue, when passed a function it assumes you're trying to access the previous state, so we
 * need to encapsulate that call as well.
 */
export declare function useOverridable<T>(overridable: Overridable<T>): T;
