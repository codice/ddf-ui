import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useParams } from 'react-router-dom';
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks';
import { useStatusOfLazyResults } from '../../js/model/LazyQueryResult/hooks';
import CircularProgress from '@mui/material/CircularProgress';
import SelectionInterfaceModel from '../selection-interface/selection-interface.model';
import Grid from '@mui/material/Grid';
import { DEFAULT_QUERY_OPTIONS, useUserQuery } from '../../js/model/TypedQuery';
import { FilterBuilderClass, FilterClass, } from '../filter-builder/filter.structure';
import { TypedUserInstance, useEphemeralFilter } from '../singletons/TypedUser';
import Button from '@mui/material/Button';
import { TitleView } from '../visualization/inspector/inspector';
export var getFilterTreeForId = function (_a) {
    var id = _a.id;
    return new FilterBuilderClass({
        type: 'AND',
        filters: [
            new FilterClass({
                type: '=',
                value: id,
                property: '"id"',
            }),
            new FilterClass({
                type: 'ILIKE',
                value: '*',
                property: '"metacard-tags"',
            }),
        ],
    });
};
var MetacardNavRoute = function () {
    var params = useParams();
    var _a = __read(React.useState(params.metacardId || params.id), 2), id = _a[0], setId = _a[1];
    React.useEffect(function () {
        setId(params.metacardId || params.id);
    }, [params.metacardId]);
    var _b = __read(useUserQuery({
        attributes: {
            filterTree: getFilterTreeForId({ id: id }),
        },
        options: {
            transformDefaults: DEFAULT_QUERY_OPTIONS.transformDefaults,
        },
    }), 1), query = _b[0];
    var ephemeralFilter = useEphemeralFilter();
    var _c = __read(React.useState(new SelectionInterfaceModel({
        currentQuery: query,
    })), 1), selectionInterface = _c[0];
    React.useEffect(function () {
        query.set('filterTree', getFilterTreeForId({ id: id }));
        query.cancelCurrentSearches();
        query.startSearchFromFirstPage();
        return function () {
            query.cancelCurrentSearches();
        };
    }, [id]);
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var isSearching = useStatusOfLazyResults({ lazyResults: lazyResults }).isSearching;
    var filteredResults = Object.values(lazyResults.results);
    var notFoundYet = isSearching && filteredResults.length === 0;
    if (notFoundYet) {
        return (React.createElement(React.Fragment, null,
            React.createElement("div", null,
                React.createElement(CircularProgress, { color: "inherit" }))));
    }
    else if (filteredResults.length === 0) {
        return (React.createElement("div", { className: "flex h-full items-center" },
            React.createElement("div", null, " No result could be found."),
            ephemeralFilter ? (React.createElement(Button, { variant: "outlined", color: "primary", className: "ml-2", onClick: function () {
                    TypedUserInstance.removeEphemeralFilter();
                } }, "Remove filter?")) : null));
    }
    else {
        return (React.createElement(Grid, { container: true, alignItems: "center", className: "w-full h-full" },
            React.createElement(Grid, { item: true, className: "max-w-full" },
                React.createElement(TitleView, { lazyResult: filteredResults[0] }))));
    }
};
export default hot(module)(MetacardNavRoute);
//# sourceMappingURL=metacard-nav.js.map