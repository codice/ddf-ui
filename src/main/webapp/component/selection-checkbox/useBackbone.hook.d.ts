export type WithBackboneProps = {
    listenTo: (object: any, events: string, callback: Function) => any;
    stopListening: (object?: any, events?: string | undefined, callback?: Function | undefined) => any;
    listenToOnce: (object: any, events: string, callback: Function) => any;
};
export declare function useBackbone(): WithBackboneProps;
/**
 *  This is the most common use case.  You start listening at the first lifecycle (render), and stop listening at the last lifecycle (destruction).
 *  If the paremeters ever change, we unlisten to the old case and relisten with the new parameters (object, events, callback).
 *
 *  For more complex uses, it's better to use useBackbone which gives you more control.
 * @param parameters
 */
export declare function useListenTo(...parameters: Parameters<WithBackboneProps['listenTo']>): void;
