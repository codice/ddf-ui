import * as React from 'react';
// create context with no upfront defaultValue
// without having to do undefined check all the time
export function createCtx(defaults) {
    var ctx = React.createContext(defaults);
    function useCtx() {
        var c = React.useContext(ctx);
        if (!c)
            throw new Error('useCtx must be inside a Provider with a value');
        return c;
    }
    return [useCtx, ctx.Provider]; // make TypeScript infer a tuple, not an array of union types
}
//# sourceMappingURL=context.js.map