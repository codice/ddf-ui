import { Subscribable, Overridable } from './base-classes';
export declare function useSubscribable<T extends {
    thing: string;
    args?: any;
}>(subscribable: Subscribable<T>, thing: T['thing'], callback: (val: T['args']) => void): void;
export declare function useOverridable<T>(overridable: Overridable<T>): T;
