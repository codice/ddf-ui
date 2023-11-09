import { __assign, __read } from "tslib";
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { DarkDivider } from '../dark-divider/dark-divider';
import { FilterBuilderClass, FilterClass, } from '../filter-builder/filter.structure';
import { useQuery, useUserQuery } from '../../js/model/TypedQuery';
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../selection-interface/hooks';
import { Elevations } from '../theme/theme';
import SelectionInterface from '../selection-interface/selection-interface.model';
import _debounce from 'lodash.debounce';
import LinearProgress from '@mui/material/LinearProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import QueryFeed from '../result-selector/query-feed';
import Paging from '../result-selector/paging';
import { getSortDirectionOptions } from '../../react-component/query-sort-selection/sort-selection-helpers';
import ResultsVisual from '../visualization/results-visual/results-visual';
import { SplitPane } from '../resizable-grid/resizable-grid';
import { GoldenLayout } from '../golden-layout/golden-layout';
import { Memo } from '../memo/memo';
import { useUpdateEffect } from 'react-use';
var modifySearch = function (_a) {
    var search = _a.search, filter = _a.filter, sortAttribute = _a.sortAttribute, sortDirection = _a.sortDirection;
    var filterBuilder = new FilterBuilderClass({
        type: 'AND',
        filters: [
            new FilterClass({
                type: '=',
                property: 'metacard-tags',
                value: 'query', // query
            }),
        ],
    });
    if (filter.length > 0) {
        filterBuilder.filters.push(new FilterClass({
            type: 'ILIKE',
            property: 'title',
            value: "*".concat(filter, "*"),
        }));
    }
    var sorts = [
        {
            attribute: sortAttribute === 'title' ? 'title' : 'metacard.modified',
            direction: sortDirection.toLowerCase(),
        },
    ];
    search.set('filterTree', filterBuilder);
    search.set('sorts', sorts);
    return search;
};
var buildSearchFromSelection = function (_a) {
    var search = _a.search, lazyResults = _a.lazyResults;
    var totalFilterTree = Object.values(lazyResults).reduce(function (filterTree, lazyResult) {
        filterTree.filters.push(new FilterBuilderClass(JSON.parse(lazyResult.plain.metacard.properties.filterTree)));
        return filterTree;
    }, new FilterBuilderClass({ type: 'OR', filters: [] }));
    search.set('filterTree', totalFilterTree);
    return search;
};
var SelectionInfoPane = function (_a) {
    var searchSelectionInterface = _a.searchSelectionInterface;
    var _b = __read(useUserQuery(), 1), search = _b[0];
    var lazyResults = useLazyResultsSelectedResultsFromSelectionInterface({
        selectionInterface: searchSelectionInterface,
    });
    var _c = __read(React.useState(new SelectionInterface({
        currentQuery: buildSearchFromSelection({ lazyResults: lazyResults, search: search }),
    })), 1), selectionInterface = _c[0];
    React.useEffect(function () {
        if (Object.keys(lazyResults).length > 0) {
            buildSearchFromSelection({
                search: search,
                lazyResults: lazyResults,
            });
            selectionInterface.getCurrentQuery().startSearchFromFirstPage();
        }
        else {
            selectionInterface.getCurrentQuery().cancelCurrentSearches();
        }
    }, [lazyResults]);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "block w-full h-full relative" },
            React.createElement("div", { className: Object.keys(lazyResults).length > 0
                    ? 'hidden'
                    : 'block py-2 pr-2 w-full h-full left-0 top-0 absolute z-10' },
                React.createElement("div", { className: "p-2 w-full h-full relative" },
                    React.createElement("div", { className: "opacity-75 bg-black absolute left-0 top-0 w-full h-full z-0" }),
                    React.createElement("div", { className: "block text-xl text-white z-10 relative" },
                        React.createElement("span", { className: "bg-black p-2" }, "Select a search(s) from the left to preview.")))),
            React.createElement(GoldenLayout, { selectionInterface: selectionInterface }))));
};
var SavedSearches = function () {
    var _a;
    var _b = __read(React.useState(''), 2), filter = _b[0], setFilter = _b[1];
    var _c = __read(React.useState('last modified'), 2), sortAttribute = _c[0], setSortAttribute = _c[1];
    var _d = __read(React.useState('descending'), 2), sortDirection = _d[0], setSortDirection = _d[1];
    var _f = __read(useQuery(), 1), search = _f[0];
    var selectionInterface = React.useMemo(function () {
        return new SelectionInterface({
            currentQuery: search,
        });
    }, []);
    var debouncedUpdate = React.useRef(_debounce(function (_a) {
        var filter = _a.filter, sortAttribute = _a.sortAttribute, sortDirection = _a.sortDirection, search = _a.search;
        modifySearch({ filter: filter, sortAttribute: sortAttribute, sortDirection: sortDirection, search: search });
        selectionInterface.getCurrentQuery().startSearchFromFirstPage();
        setIsUpdating(false);
    }, 500));
    var _g = __read(React.useState(false), 2), isUpdating = _g[0], setIsUpdating = _g[1];
    React.useEffect(function () {
        setIsUpdating(true);
        debouncedUpdate.current({
            filter: filter,
            sortAttribute: sortAttribute,
            sortDirection: sortDirection,
            search: selectionInterface.getCurrentQuery(),
        });
    }, [filter, sortAttribute, sortDirection]);
    useUpdateEffect(function () {
        /**
         * This makes sense, because we only have title and last modified.
         *
         * The natural inclination is inverted for sort direction for alphabetical vs time.
         */
        setSortDirection(sortAttribute === 'title' ? 'ascending' : 'descending');
    }, [sortAttribute]);
    return (React.createElement("div", { className: "w-full h-full flex flex-col flex-nowrap overflow-hidden " },
        React.createElement("div", { className: "shrink-0 w-full pt-2 pr-2" },
            React.createElement(Paper, { elevation: Elevations.panels, className: "min-h-16 w-full shrink-0 p-2 flex flex-row items-center flex-wrap" },
                React.createElement(TextField, { label: "Filter", size: "small", value: filter, variant: "outlined", autoFocus: true, onChange: function (e) {
                        setFilter(e.target.value);
                    } }),
                React.createElement(Autocomplete, { className: "w-48 ml-2", options: ['title', 'last modified'], renderOption: function (option) {
                        return React.createElement(React.Fragment, null, option);
                    }, value: sortAttribute, onChange: function (_e, newValue) {
                        setSortAttribute(newValue || 'title');
                    }, renderInput: function (params) {
                        return (React.createElement(TextField, __assign({}, params, { label: "Sort by", variant: "outlined", size: "small", inputProps: __assign({}, params.inputProps) })));
                    } }),
                React.createElement(Button, { className: "ml-2", size: "small", variant: "text", onClick: function () {
                        setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
                    } }, (_a = getSortDirectionOptions(sortAttribute === 'title' ? 'title' : 'metacard.modified').find(function (option) { return option.value === sortDirection; })) === null || _a === void 0 ? void 0 : _a.label),
                React.createElement("div", { className: "ml-auto" },
                    React.createElement(QueryFeed, { selectionInterface: selectionInterface })),
                React.createElement("div", { className: "ml-2" },
                    React.createElement(Paging, { selectionInterface: selectionInterface })))),
        React.createElement(DarkDivider, null),
        React.createElement("div", { className: "relative h-full overflow-hidden w-full shrink" },
            isUpdating ? (React.createElement(LinearProgress, { variant: "indeterminate", className: "absolute left-0 top-0 w-full h-min" })) : null,
            React.createElement(Memo, { dependencies: [] },
                React.createElement(SplitPane, { variant: "horizontal" },
                    React.createElement("div", { className: "py-2 w-full h-full" },
                        React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full" },
                            React.createElement(ResultsVisual, { selectionInterface: selectionInterface }))),
                    React.createElement(SelectionInfoPane, { searchSelectionInterface: selectionInterface }))))));
};
export default hot(module)(SavedSearches);
//# sourceMappingURL=browse.js.map