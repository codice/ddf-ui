import { __read } from "tslib";
import * as React from 'react';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import { LazyQueryResults } from '../../js/model/LazyQueryResult/LazyQueryResults';
import { useStatusOfLazyResults, useSelectedResults, useFilterTreeOfLazyResults, } from '../../js/model/LazyQueryResult/hooks';
var getLazyResultsFromSelectionInterface = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var currentSearch = selectionInterface.get('currentQuery');
    if (!currentSearch) {
        return new LazyQueryResults();
    }
    var result = currentSearch.get('result');
    if (!result) {
        return new LazyQueryResults();
    }
    return result.get('lazyResults');
};
export var useLazyResultsSelectedResultsFromSelectionInterface = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var selectedResults = useSelectedResults({ lazyResults: lazyResults });
    return selectedResults;
};
export var useLazyResultsStatusFromSelectionInterface = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var status = useStatusOfLazyResults({ lazyResults: lazyResults });
    return status;
};
export var useLazyResultsFilterTreeFromSelectionInterface = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var filterTree = useFilterTreeOfLazyResults({ lazyResults: lazyResults });
    return filterTree;
};
export var useLazyResultsFromSelectionInterface = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var _b = useBackbone(), listenToOnce = _b.listenToOnce, stopListening = _b.stopListening;
    // @ts-expect-error ts-migrate(6133) FIXME: 'forceRender' is declared but its value is never r... Remove this comment to see the full error message
    var _c = __read(React.useState(Math.random()), 2), forceRender = _c[0], setForceRender = _c[1];
    var _d = __read(React.useState(getLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    })), 2), lazyResults = _d[0], setLazyResults = _d[1];
    React.useEffect(function () {
        var unsubscribe = lazyResults.subscribeTo({
            subscribableThing: 'filteredResults',
            callback: function () {
                setForceRender(Math.random());
            },
        });
        return function () {
            unsubscribe();
        };
    }, [lazyResults]);
    React.useEffect(function () {
        setLazyResults(getLazyResultsFromSelectionInterface({ selectionInterface: selectionInterface }));
        listenToOnce(selectionInterface, 'change:currentQuery>result', function () {
            var currentQuery = selectionInterface.get('currentQuery');
            var result = currentQuery.get('result');
            if (result) {
                setLazyResults(getLazyResultsFromSelectionInterface({ selectionInterface: selectionInterface }));
            }
        });
        return function () {
            stopListening(selectionInterface);
        };
    }, [selectionInterface]);
    return lazyResults;
};
//# sourceMappingURL=hooks.js.map