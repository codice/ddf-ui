import * as React from 'react';
export declare function createCtx<A>(defaults?: Partial<A>): readonly [() => NonNullable<A>, React.Provider<A | undefined>];
