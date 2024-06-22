import { __read } from "tslib";
/* Copyright (c) Connexta, LLC */
import React, { useState } from 'react';
export var InteractionsContext = React.createContext({
    interactiveGeo: null,
    setInteractiveGeo: function () { },
    interactiveModels: [],
    setInteractiveModels: function () { },
    moveFrom: null,
    setMoveFrom: function () { },
    translation: null,
    setTranslation: function () { },
});
/**
 *  Doing this to save time for now.  In the future we should remove the interactions provider and the logic around it, solely using the models themselves and
 *  this isInteractive being set to do drag / drop.
 */
function useUpdateModelsSoTheyAreInteractive(_a) {
    var interactiveModels = _a.interactiveModels;
    React.useEffect(function () {
        interactiveModels.forEach(function (model) {
            model.set('isInteractive', true);
        });
        return function () {
            interactiveModels.forEach(function (model) {
                model.set('isInteractive', false);
            });
        };
    }, [interactiveModels]);
}
export function InteractionsProvider(_a) {
    var children = _a.children;
    var _b = __read(useState(null), 2), interactiveGeo = _b[0], setInteractiveGeo = _b[1];
    var _c = __read(useState([]), 2), interactiveModels = _c[0], setInteractiveModels = _c[1];
    var _d = __read(useState(null), 2), moveFrom = _d[0], setMoveFrom = _d[1];
    var _e = __read(useState(null), 2), translation = _e[0], setTranslation = _e[1];
    useUpdateModelsSoTheyAreInteractive({ interactiveModels: interactiveModels });
    return (React.createElement(InteractionsContext.Provider, { value: {
            interactiveGeo: interactiveGeo,
            setInteractiveGeo: setInteractiveGeo,
            interactiveModels: interactiveModels,
            setInteractiveModels: setInteractiveModels,
            moveFrom: moveFrom,
            setMoveFrom: setMoveFrom,
            translation: translation,
            setTranslation: setTranslation,
        } }, children));
}
//# sourceMappingURL=interactions.provider.js.map