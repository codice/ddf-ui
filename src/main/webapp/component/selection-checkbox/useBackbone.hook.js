import Backbone from 'backbone';
import * as React from 'react';
export function useBackbone() {
    var backboneModel = new Backbone.Model({});
    React.useEffect(function () {
        return function () {
            backboneModel.stopListening();
            backboneModel.destroy();
        };
    }, []);
    return {
        listenTo: backboneModel.listenTo.bind(backboneModel),
        stopListening: backboneModel.stopListening.bind(backboneModel),
        listenToOnce: backboneModel.listenToOnce.bind(backboneModel),
    };
}
/**
 *  This is the most common use case.  You start listening at the first lifecycle (render), and stop listening at the last lifecycle (destruction).
 *  If the paremeters ever change, we unlisten to the old case and relisten with the new parameters (object, events, callback).
 *
 *  For more complex uses, it's better to use useBackbone which gives you more control.
 * @param parameters
 */
export function useListenTo() {
    var parameters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parameters[_i] = arguments[_i];
    }
    var _a = useBackbone(), listenTo = _a.listenTo, stopListening = _a.stopListening;
    React.useEffect(function () {
        if (parameters[0]) {
            listenTo.apply(undefined, parameters);
        }
        return function () {
            if (parameters[0]) {
                stopListening.apply(undefined, parameters);
            }
        };
    }, [parameters]);
}
//# sourceMappingURL=useBackbone.hook.js.map