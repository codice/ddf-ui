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
import { getDefaultComponentState } from '../visualization/settings-helpers';
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
                            React.createElement(ResultsVisual, { selectionInterface: selectionInterface, componentState: getDefaultComponentState('results') }))),
                    React.createElement(SelectionInfoPane, { searchSelectionInterface: selectionInterface }))))));
};
export default hot(module)(SavedSearches);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3NlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9wYWdlcy9icm93c2UudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQyxPQUFPLEtBQUssTUFBTSxxQkFBcUIsQ0FBQTtBQUN2QyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFBO0FBQzFELE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsV0FBVyxHQUNaLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUNsRSxPQUFPLEVBQUUsbURBQW1ELEVBQUUsTUFBTSw4QkFBOEIsQ0FBQTtBQUNsRyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDM0MsT0FBTyxrQkFBa0IsTUFBTSxrREFBa0QsQ0FBQTtBQUNqRixPQUFPLFNBQVMsTUFBTSxpQkFBaUIsQ0FBQTtBQUN2QyxPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQUN6RCxPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLFNBQVMsTUFBTSwrQkFBK0IsQ0FBQTtBQUNyRCxPQUFPLE1BQU0sTUFBTSwyQkFBMkIsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxtRUFBbUUsQ0FBQTtBQUMzRyxPQUFPLGFBQWEsTUFBTSxnREFBZ0QsQ0FBQTtBQUMxRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sa0NBQWtDLENBQUE7QUFDNUQsT0FBTyxFQUFF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QUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBQyxlQUFlOzRCQUM1RCxvQkFBQyxhQUFhLElBQ1osa0JBQWtCLEVBQUUsa0JBQWtCLEVBQ3RDLGNBQWMsRUFBRSx3QkFBd0IsQ0FBQyxTQUFTLENBQVEsR0FDMUQsQ0FDSSxDQUNKO29CQUNOLG9CQUFDLGlCQUFpQixJQUFDLHdCQUF3QixFQUFFLGtCQUFrQixHQUFJLENBQ3pELENBQ1AsQ0FDSCxDQUNGLENBQ1AsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmltcG9ydCBQYXBlciBmcm9tICdAbXVpL21hdGVyaWFsL1BhcGVyJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgRGFya0RpdmlkZXIgfSBmcm9tICcuLi9kYXJrLWRpdmlkZXIvZGFyay1kaXZpZGVyJ1xuaW1wb3J0IHtcbiAgRmlsdGVyQnVpbGRlckNsYXNzLFxuICBGaWx0ZXJDbGFzcyxcbn0gZnJvbSAnLi4vZmlsdGVyLWJ1aWxkZXIvZmlsdGVyLnN0cnVjdHVyZSdcbmltcG9ydCB7IHVzZVF1ZXJ5LCB1c2VVc2VyUXVlcnkgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9UeXBlZFF1ZXJ5J1xuaW1wb3J0IHsgdXNlTGF6eVJlc3VsdHNTZWxlY3RlZFJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWludGVyZmFjZS9ob29rcydcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcbmltcG9ydCBTZWxlY3Rpb25JbnRlcmZhY2UgZnJvbSAnLi4vc2VsZWN0aW9uLWludGVyZmFjZS9zZWxlY3Rpb24taW50ZXJmYWNlLm1vZGVsJ1xuaW1wb3J0IF9kZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCBBdXRvY29tcGxldGUgZnJvbSAnQG11aS9tYXRlcmlhbC9BdXRvY29tcGxldGUnXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IFF1ZXJ5RmVlZCBmcm9tICcuLi9yZXN1bHQtc2VsZWN0b3IvcXVlcnktZmVlZCdcbmltcG9ydCBQYWdpbmcgZnJvbSAnLi4vcmVzdWx0LXNlbGVjdG9yL3BhZ2luZydcbmltcG9ydCB7IGdldFNvcnREaXJlY3Rpb25PcHRpb25zIH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3F1ZXJ5LXNvcnQtc2VsZWN0aW9uL3NvcnQtc2VsZWN0aW9uLWhlbHBlcnMnXG5pbXBvcnQgUmVzdWx0c1Zpc3VhbCBmcm9tICcuLi92aXN1YWxpemF0aW9uL3Jlc3VsdHMtdmlzdWFsL3Jlc3VsdHMtdmlzdWFsJ1xuaW1wb3J0IHsgU3BsaXRQYW5lIH0gZnJvbSAnLi4vcmVzaXphYmxlLWdyaWQvcmVzaXphYmxlLWdyaWQnXG5pbXBvcnQgeyBHb2xkZW5MYXlvdXQgfSBmcm9tICcuLi9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHRzIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdHMnXG5pbXBvcnQgeyBNZW1vIH0gZnJvbSAnLi4vbWVtby9tZW1vJ1xuaW1wb3J0IHsgdXNlVXBkYXRlRWZmZWN0IH0gZnJvbSAncmVhY3QtdXNlJ1xuaW1wb3J0IHsgZ2V0RGVmYXVsdENvbXBvbmVudFN0YXRlIH0gZnJvbSAnLi4vdmlzdWFsaXphdGlvbi9zZXR0aW5ncy1oZWxwZXJzJ1xuXG50eXBlIE1vZGlmeVNlYXJjaFBhcmFtcyA9IHtcbiAgc2VhcmNoOiBhbnlcbiAgZmlsdGVyOiBzdHJpbmdcbiAgc29ydEF0dHJpYnV0ZTogU29ydEF0dHJpYnV0ZVR5cGVcbiAgc29ydERpcmVjdGlvbjogU29ydERpcmVjdGlvblR5cGVcbn1cblxuY29uc3QgbW9kaWZ5U2VhcmNoID0gKHtcbiAgc2VhcmNoLFxuICBmaWx0ZXIsXG4gIHNvcnRBdHRyaWJ1dGUsXG4gIHNvcnREaXJlY3Rpb24sXG59OiBNb2RpZnlTZWFyY2hQYXJhbXMpID0+IHtcbiAgY29uc3QgZmlsdGVyQnVpbGRlciA9IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgIHR5cGU6ICdBTkQnLFxuICAgIGZpbHRlcnM6IFtcbiAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgIHR5cGU6ICc9JywgLy8gPVxuICAgICAgICBwcm9wZXJ0eTogJ21ldGFjYXJkLXRhZ3MnLFxuICAgICAgICB2YWx1ZTogJ3F1ZXJ5JywgLy8gcXVlcnlcbiAgICAgIH0pLFxuICAgIF0sXG4gIH0pXG4gIGlmIChmaWx0ZXIubGVuZ3RoID4gMCkge1xuICAgIGZpbHRlckJ1aWxkZXIuZmlsdGVycy5wdXNoKFxuICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgcHJvcGVydHk6ICd0aXRsZScsXG4gICAgICAgIHZhbHVlOiBgKiR7ZmlsdGVyfSpgLFxuICAgICAgfSlcbiAgICApXG4gIH1cbiAgY29uc3Qgc29ydHMgPSBbXG4gICAge1xuICAgICAgYXR0cmlidXRlOiBzb3J0QXR0cmlidXRlID09PSAndGl0bGUnID8gJ3RpdGxlJyA6ICdtZXRhY2FyZC5tb2RpZmllZCcsXG4gICAgICBkaXJlY3Rpb246IHNvcnREaXJlY3Rpb24udG9Mb3dlckNhc2UoKSxcbiAgICB9LFxuICBdXG4gIHNlYXJjaC5zZXQoJ2ZpbHRlclRyZWUnLCBmaWx0ZXJCdWlsZGVyKVxuICBzZWFyY2guc2V0KCdzb3J0cycsIHNvcnRzKVxuICByZXR1cm4gc2VhcmNoXG59XG5cbnR5cGUgU29ydEF0dHJpYnV0ZVR5cGUgPSAndGl0bGUnIHwgJ2xhc3QgbW9kaWZpZWQnXG50eXBlIFNvcnREaXJlY3Rpb25UeXBlID0gJ2FzY2VuZGluZycgfCAnZGVzY2VuZGluZydcblxuY29uc3QgYnVpbGRTZWFyY2hGcm9tU2VsZWN0aW9uID0gKHtcbiAgc2VhcmNoLFxuICBsYXp5UmVzdWx0cyxcbn06IHtcbiAgc2VhcmNoOiBhbnlcbiAgbGF6eVJlc3VsdHM6IExhenlRdWVyeVJlc3VsdHNbJ3Jlc3VsdHMnXVxufSkgPT4ge1xuICBjb25zdCB0b3RhbEZpbHRlclRyZWUgPSBPYmplY3QudmFsdWVzKGxhenlSZXN1bHRzKS5yZWR1Y2UoXG4gICAgKGZpbHRlclRyZWUsIGxhenlSZXN1bHQpID0+IHtcbiAgICAgIGZpbHRlclRyZWUuZmlsdGVycy5wdXNoKFxuICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKFxuICAgICAgICAgIEpTT04ucGFyc2UobGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLmZpbHRlclRyZWUpXG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIHJldHVybiBmaWx0ZXJUcmVlXG4gICAgfSxcbiAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHsgdHlwZTogJ09SJywgZmlsdGVyczogW10gfSlcbiAgKVxuICBzZWFyY2guc2V0KCdmaWx0ZXJUcmVlJywgdG90YWxGaWx0ZXJUcmVlKVxuICByZXR1cm4gc2VhcmNoXG59XG5cbmNvbnN0IFNlbGVjdGlvbkluZm9QYW5lID0gKHtcbiAgc2VhcmNoU2VsZWN0aW9uSW50ZXJmYWNlLFxufToge1xuICBzZWFyY2hTZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxufSkgPT4ge1xuICBjb25zdCBbc2VhcmNoXSA9IHVzZVVzZXJRdWVyeSgpXG4gIGNvbnN0IGxhenlSZXN1bHRzID0gdXNlTGF6eVJlc3VsdHNTZWxlY3RlZFJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlKHtcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2U6IHNlYXJjaFNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgY29uc3QgW3NlbGVjdGlvbkludGVyZmFjZV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBuZXcgU2VsZWN0aW9uSW50ZXJmYWNlKHtcbiAgICAgIGN1cnJlbnRRdWVyeTogYnVpbGRTZWFyY2hGcm9tU2VsZWN0aW9uKHsgbGF6eVJlc3VsdHMsIHNlYXJjaCB9KSxcbiAgICB9KVxuICApXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKE9iamVjdC5rZXlzKGxhenlSZXN1bHRzKS5sZW5ndGggPiAwKSB7XG4gICAgICBidWlsZFNlYXJjaEZyb21TZWxlY3Rpb24oe1xuICAgICAgICBzZWFyY2gsXG4gICAgICAgIGxhenlSZXN1bHRzLFxuICAgICAgfSlcbiAgICAgIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5zdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UoKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuY2FuY2VsQ3VycmVudFNlYXJjaGVzKClcbiAgICB9XG4gIH0sIFtsYXp5UmVzdWx0c10pXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2sgdy1mdWxsIGgtZnVsbCByZWxhdGl2ZVwiPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGxhenlSZXN1bHRzKS5sZW5ndGggPiAwXG4gICAgICAgICAgICAgID8gJ2hpZGRlbidcbiAgICAgICAgICAgICAgOiAnYmxvY2sgcHktMiBwci0yIHctZnVsbCBoLWZ1bGwgbGVmdC0wIHRvcC0wIGFic29sdXRlIHotMTAnXG4gICAgICAgICAgfVxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTIgdy1mdWxsIGgtZnVsbCByZWxhdGl2ZVwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvcGFjaXR5LTc1IGJnLWJsYWNrIGFic29sdXRlIGxlZnQtMCB0b3AtMCB3LWZ1bGwgaC1mdWxsIHotMFwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXhsIHRleHQtd2hpdGUgei0xMCByZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJiZy1ibGFjayBwLTJcIj5cbiAgICAgICAgICAgICAgICBTZWxlY3QgYSBzZWFyY2gocykgZnJvbSB0aGUgbGVmdCB0byBwcmV2aWV3LlxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxHb2xkZW5MYXlvdXQgc2VsZWN0aW9uSW50ZXJmYWNlPXtzZWxlY3Rpb25JbnRlcmZhY2V9IC8+XG4gICAgICA8L2Rpdj5cbiAgICA8Lz5cbiAgKVxufVxuXG5jb25zdCBTYXZlZFNlYXJjaGVzID0gKCkgPT4ge1xuICBjb25zdCBbZmlsdGVyLCBzZXRGaWx0ZXJdID0gUmVhY3QudXNlU3RhdGUoJycpXG4gIGNvbnN0IFtzb3J0QXR0cmlidXRlLCBzZXRTb3J0QXR0cmlidXRlXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICdsYXN0IG1vZGlmaWVkJyBhcyBTb3J0QXR0cmlidXRlVHlwZVxuICApXG4gIGNvbnN0IFtzb3J0RGlyZWN0aW9uLCBzZXRTb3J0RGlyZWN0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgICdkZXNjZW5kaW5nJyBhcyBTb3J0RGlyZWN0aW9uVHlwZVxuICApXG4gIGNvbnN0IFtzZWFyY2hdID0gdXNlUXVlcnkoKVxuICBjb25zdCBzZWxlY3Rpb25JbnRlcmZhY2UgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gbmV3IFNlbGVjdGlvbkludGVyZmFjZSh7XG4gICAgICBjdXJyZW50UXVlcnk6IHNlYXJjaCxcbiAgICB9KVxuICB9LCBbXSlcbiAgY29uc3QgZGVib3VuY2VkVXBkYXRlID0gUmVhY3QudXNlUmVmKFxuICAgIF9kZWJvdW5jZShcbiAgICAgICh7XG4gICAgICAgIGZpbHRlcixcbiAgICAgICAgc29ydEF0dHJpYnV0ZSxcbiAgICAgICAgc29ydERpcmVjdGlvbixcbiAgICAgICAgc2VhcmNoLFxuICAgICAgfTogTW9kaWZ5U2VhcmNoUGFyYW1zKSA9PiB7XG4gICAgICAgIG1vZGlmeVNlYXJjaCh7IGZpbHRlciwgc29ydEF0dHJpYnV0ZSwgc29ydERpcmVjdGlvbiwgc2VhcmNoIH0pXG4gICAgICAgIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5zdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UoKVxuICAgICAgICBzZXRJc1VwZGF0aW5nKGZhbHNlKVxuICAgICAgfSxcbiAgICAgIDUwMFxuICAgIClcbiAgKVxuICBjb25zdCBbaXNVcGRhdGluZywgc2V0SXNVcGRhdGluZ10gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRJc1VwZGF0aW5nKHRydWUpXG4gICAgZGVib3VuY2VkVXBkYXRlLmN1cnJlbnQoe1xuICAgICAgZmlsdGVyLFxuICAgICAgc29ydEF0dHJpYnV0ZSxcbiAgICAgIHNvcnREaXJlY3Rpb24sXG4gICAgICBzZWFyY2g6IHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKSxcbiAgICB9KVxuICB9LCBbZmlsdGVyLCBzb3J0QXR0cmlidXRlLCBzb3J0RGlyZWN0aW9uXSlcbiAgdXNlVXBkYXRlRWZmZWN0KCgpID0+IHtcbiAgICAvKipcbiAgICAgKiBUaGlzIG1ha2VzIHNlbnNlLCBiZWNhdXNlIHdlIG9ubHkgaGF2ZSB0aXRsZSBhbmQgbGFzdCBtb2RpZmllZC5cbiAgICAgKlxuICAgICAqIFRoZSBuYXR1cmFsIGluY2xpbmF0aW9uIGlzIGludmVydGVkIGZvciBzb3J0IGRpcmVjdGlvbiBmb3IgYWxwaGFiZXRpY2FsIHZzIHRpbWUuXG4gICAgICovXG4gICAgc2V0U29ydERpcmVjdGlvbihzb3J0QXR0cmlidXRlID09PSAndGl0bGUnID8gJ2FzY2VuZGluZycgOiAnZGVzY2VuZGluZycpXG4gIH0sIFtzb3J0QXR0cmlidXRlXSlcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBvdmVyZmxvdy1oaWRkZW4gXCI+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInNocmluay0wIHctZnVsbCBwdC0yIHByLTJcIj5cbiAgICAgICAgPFBhcGVyXG4gICAgICAgICAgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc31cbiAgICAgICAgICBjbGFzc05hbWU9XCJtaW4taC0xNiB3LWZ1bGwgc2hyaW5rLTAgcC0yIGZsZXggZmxleC1yb3cgaXRlbXMtY2VudGVyIGZsZXgtd3JhcFwiXG4gICAgICAgID5cbiAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICBsYWJlbD1cIkZpbHRlclwiXG4gICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgdmFsdWU9e2ZpbHRlcn1cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICBhdXRvRm9jdXNcbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICBzZXRGaWx0ZXIoZS50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgICAgey8qIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1sZ1wiPlNvcnQgYnk8L2Rpdj4gKi99XG4gICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy00OCBtbC0yXCJcbiAgICAgICAgICAgIG9wdGlvbnM9e1sndGl0bGUnLCAnbGFzdCBtb2RpZmllZCddIGFzIFNvcnRBdHRyaWJ1dGVUeXBlW119XG4gICAgICAgICAgICByZW5kZXJPcHRpb249eyhvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIDw+e29wdGlvbn08Lz5cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICB2YWx1ZT17c29ydEF0dHJpYnV0ZX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoX2UsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgIHNldFNvcnRBdHRyaWJ1dGUobmV3VmFsdWUgfHwgJ3RpdGxlJylcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgICAgIHsuLi5wYXJhbXN9XG4gICAgICAgICAgICAgICAgICBsYWJlbD1cIlNvcnQgYnlcIlxuICAgICAgICAgICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgICBpbnB1dFByb3BzPXt7IC4uLnBhcmFtcy5pbnB1dFByb3BzIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1sLTJcIlxuICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0U29ydERpcmVjdGlvbihcbiAgICAgICAgICAgICAgICBzb3J0RGlyZWN0aW9uID09PSAnYXNjZW5kaW5nJyA/ICdkZXNjZW5kaW5nJyA6ICdhc2NlbmRpbmcnXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBnZXRTb3J0RGlyZWN0aW9uT3B0aW9ucyhcbiAgICAgICAgICAgICAgICBzb3J0QXR0cmlidXRlID09PSAndGl0bGUnID8gJ3RpdGxlJyA6ICdtZXRhY2FyZC5tb2RpZmllZCdcbiAgICAgICAgICAgICAgKS5maW5kKChvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gc29ydERpcmVjdGlvbik/LmxhYmVsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtbC1hdXRvXCI+XG4gICAgICAgICAgICA8UXVlcnlGZWVkIHNlbGVjdGlvbkludGVyZmFjZT17c2VsZWN0aW9uSW50ZXJmYWNlfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWwtMlwiPlxuICAgICAgICAgICAgPFBhZ2luZyBzZWxlY3Rpb25JbnRlcmZhY2U9e3NlbGVjdGlvbkludGVyZmFjZX0gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9QYXBlcj5cbiAgICAgIDwvZGl2PlxuICAgICAgPERhcmtEaXZpZGVyIC8+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIGgtZnVsbCBvdmVyZmxvdy1oaWRkZW4gdy1mdWxsIHNocmlua1wiPlxuICAgICAgICB7aXNVcGRhdGluZyA/IChcbiAgICAgICAgICA8TGluZWFyUHJvZ3Jlc3NcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMCB0b3AtMCB3LWZ1bGwgaC1taW5cIlxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICA8TWVtbyBkZXBlbmRlbmNpZXM9e1tdfT5cbiAgICAgICAgICA8U3BsaXRQYW5lIHZhcmlhbnQ9XCJob3Jpem9udGFsXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB5LTIgdy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc30gY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgICAgIDxSZXN1bHRzVmlzdWFsXG4gICAgICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e3NlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFN0YXRlPXtnZXREZWZhdWx0Q29tcG9uZW50U3RhdGUoJ3Jlc3VsdHMnKSBhcyBhbnl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPFNlbGVjdGlvbkluZm9QYW5lIHNlYXJjaFNlbGVjdGlvbkludGVyZmFjZT17c2VsZWN0aW9uSW50ZXJmYWNlfSAvPlxuICAgICAgICAgIDwvU3BsaXRQYW5lPlxuICAgICAgICA8L01lbW8+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShTYXZlZFNlYXJjaGVzKVxuIl19