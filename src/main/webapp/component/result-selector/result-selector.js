import { __assign, __read } from "tslib";
import * as React from 'react';
import Spellcheck from '../spellcheck/spellcheck';
import Grid from '@mui/material/Grid';
import { hot } from 'react-hot-loader';
import QueryFeed from './query-feed';
import LinearProgress from '@mui/material/LinearProgress';
import Paging from './paging';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import FilterListIcon from '@mui/icons-material/FilterList';
import ResultFilter from '../result-filter/result-filter';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import EphemeralSearchSort from '../../react-component/query-sort-selection/ephemeral-search-sort';
import { useLazyResultsStatusFromSelectionInterface, useLazyResultsSelectedResultsFromSelectionInterface, } from '../selection-interface/hooks';
import VisualizationSelector from '../../react-component/visualization-selector/visualization-selector';
import LayoutDropdownIcon from '@mui/icons-material/ViewComfy';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import user from '../singletons/user-instance';
import MoreIcon from '@mui/icons-material/MoreVert';
import LazyMetacardInteractions from '../visualization/results-visual/lazy-metacard-interactions';
import { Elevations } from '../theme/theme';
import SelectionRipple from '../golden-layout/selection-ripple';
import Extensions from '../../extension-points';
import { useMenuState } from '../menu-state/menu-state';
import Popover from '@mui/material/Popover';
import Badge from '@mui/material/Badge';
var SelectedResults = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var selectedResultsArray = Object.values(selectedResults);
    var _b = useMenuState(), MuiButtonProps = _b.MuiButtonProps, MuiPopoverProps = _b.MuiPopoverProps, handleClose = _b.handleClose;
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, __assign({ "data-id": "result-selector-more-vert-button", className: "relative ".concat(selectedResultsArray.length === 0 ? 'invisible' : ''), color: "primary", disabled: selectedResultsArray.length === 0, style: { height: '100%' }, size: "small" }, MuiButtonProps),
            selectedResultsArray.length,
            " selected",
            React.createElement("div", { className: selectedResultsArray.length === 0 ? '' : 'Mui-text-text-primary' },
                React.createElement(MoreIcon, null))),
        React.createElement(Popover, __assign({}, MuiPopoverProps, { keepMounted: true }),
            React.createElement(Paper, null,
                React.createElement(LazyMetacardInteractions, { lazyResults: selectedResultsArray, onClose: handleClose })))));
};
var determineResultFilterSize = function () {
    var resultFilters = user.get('user').get('preferences').get('resultFilter');
    if (!resultFilters || !resultFilters.filters) {
        return 0;
    }
    return resultFilters.filters.length;
};
var determineResultSortSize = function () {
    var resultSorts = user.get('user').get('preferences').get('resultSort');
    if (!resultSorts) {
        return 0;
    }
    return resultSorts.length;
};
var ResultSelector = function (_a) {
    var selectionInterface = _a.selectionInterface, model = _a.model, goldenLayout = _a.goldenLayout, layoutResult = _a.layoutResult, editLayoutRef = _a.editLayoutRef;
    var isSearching = useLazyResultsStatusFromSelectionInterface({
        selectionInterface: selectionInterface,
    }).isSearching;
    var _b = __read(React.useState(determineResultFilterSize()), 2), resultFilterSize = _b[0], setResultFilterSize = _b[1];
    var _c = __read(React.useState(determineResultSortSize()), 2), resultSortSize = _c[0], setResultSortSize = _c[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:resultFilter', function () {
            setResultFilterSize(determineResultFilterSize());
        });
        listenTo(user.get('user').get('preferences'), 'change:resultSort', function () {
            setResultSortSize(determineResultSortSize());
        });
    }, []);
    var LayoutDropdown = Extensions.layoutDropdown({
        goldenLayout: goldenLayout,
        layoutResult: layoutResult,
        editLayoutRef: editLayoutRef,
    });
    var resultFilterMenuState = useMenuState();
    var resultSortMenuState = useMenuState();
    var layoutMenuState = useMenuState();
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { container: true, alignItems: "center", justifyContent: "flex-start", direction: "row" },
            isSearching ? (React.createElement(LinearProgress, { variant: "query", className: "opacity-100 absolute w-full h-1 left-0 bottom-0" })) : null,
            React.createElement(Grid, { item: true },
                React.createElement(Spellcheck, { key: Math.random(), selectionInterface: selectionInterface, model: model })),
            React.createElement(Grid, { item: true, className: "relative z-10" },
                React.createElement(QueryFeed, { selectionInterface: selectionInterface })),
            React.createElement(Grid, { item: true, className: "relative z-0" },
                React.createElement(SelectionRipple, { selectionInterface: selectionInterface }),
                React.createElement(SelectedResults, { selectionInterface: selectionInterface })),
            React.createElement(Grid, { item: true, className: "pl-2 mx-auto" },
                React.createElement(Paging, { selectionInterface: selectionInterface })),
            React.createElement(Grid, { item: true, className: "ml-auto" },
                React.createElement(Button, __assign({ "data-id": "filter-button", variant: "text", color: "primary" }, resultFilterMenuState.MuiButtonProps),
                    React.createElement(Badge, { color: "secondary", badgeContent: resultFilterSize, anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                        }, className: "items-center" },
                        React.createElement(FilterListIcon, { className: "Mui-text-text-primary" }),
                        "Filter")),
                React.createElement(Popover, __assign({}, resultFilterMenuState.MuiPopoverProps),
                    React.createElement(Paper, { className: "p-3", elevation: Elevations.overlays },
                        React.createElement(ResultFilter, { closeDropdown: resultFilterMenuState.handleClose })))),
            React.createElement(Grid, { item: true, className: "pl-2" },
                React.createElement(Button, __assign({ "data-id": "sort-button", variant: "text", color: "primary" }, resultSortMenuState.MuiButtonProps),
                    React.createElement(Badge, { color: "secondary", badgeContent: resultSortSize, anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                        }, className: "items-center" },
                        React.createElement(ArrowDownwardIcon, { className: "Mui-text-text-primary" }),
                        "Sort")),
                React.createElement(Popover, __assign({}, resultSortMenuState.MuiPopoverProps),
                    React.createElement(Paper, { className: "p-3", elevation: Elevations.overlays },
                        React.createElement(EphemeralSearchSort, { closeDropdown: resultSortMenuState.handleClose })))),
            React.createElement(Grid, { item: true, className: "pl-2" },
                React.createElement(Button, __assign({ "data-id": "layout-button", color: "primary" }, layoutMenuState.MuiButtonProps),
                    React.createElement(LayoutDropdownIcon, { className: "Mui-text-text-primary" }),
                    React.createElement("div", { className: "pl-1" }, "Layout")),
                React.createElement(Popover, __assign({}, layoutMenuState.MuiPopoverProps),
                    React.createElement(Paper, { className: "p-3", elevation: Elevations.overlays }, LayoutDropdown || (React.createElement(VisualizationSelector, { onClose: layoutMenuState.handleClose, goldenLayout: goldenLayout }))))))));
};
export default hot(module)(ResultSelector);
//# sourceMappingURL=result-selector.js.map