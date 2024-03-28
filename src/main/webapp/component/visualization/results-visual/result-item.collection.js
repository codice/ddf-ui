import { __read } from "tslib";
/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import * as React from 'react';
import ResultItem from './result-item';
import { hot } from 'react-hot-loader';
import { AutoVariableSizeList } from 'react-window-components';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Elevations } from '../../theme/theme';
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks';
import { useSelectedResults, useStatusOfLazyResults, } from '../../../js/model/LazyQueryResult/hooks';
import { useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import TableChartIcon from '@mui/icons-material/TableChart';
import { HeaderCheckbox } from './table-header';
import { DarkDivider } from '../../dark-divider/dark-divider';
import { ResultsCommonControls } from './table';
import { TypedUserInstance } from '../../singletons/TypedUser';
import user from '../../singletons/user-instance';
import { Memo } from '../../memo/memo';
function scrollToItem(_a) {
    var listRef = _a.listRef, index = _a.index, animationFrameId = _a.animationFrameId, currentScrollOffset = _a.currentScrollOffset, lastChangedTime = _a.lastChangedTime;
    animationFrameId.current = window.requestAnimationFrame(function () {
        var timeSinceLastChange = Date.now() - lastChangedTime.current;
        if (timeSinceLastChange > 1000) {
            return;
        }
        if (listRef.state.scrollOffset !== currentScrollOffset.current) {
            lastChangedTime.current = Date.now();
            currentScrollOffset.current = listRef.state.scrollOffset;
        }
        if (!listRef.state.isScrolling) {
            listRef.scrollToItem(index, 'smart');
        }
        scrollToItem({
            listRef: listRef,
            index: index,
            animationFrameId: animationFrameId,
            currentScrollOffset: currentScrollOffset,
            lastChangedTime: lastChangedTime,
        });
    });
}
function startScrollingToItem(_a) {
    var listRef = _a.listRef, index = _a.index, animationFrameId = _a.animationFrameId, currentScrollOffset = _a.currentScrollOffset, lastChangedTime = _a.lastChangedTime;
    lastChangedTime.current = Date.now();
    currentScrollOffset.current = listRef.state.scrollOffset;
    listRef.scrollToItem(index, 'smart');
    scrollToItem({
        listRef: listRef,
        index: index,
        animationFrameId: animationFrameId,
        currentScrollOffset: currentScrollOffset,
        lastChangedTime: lastChangedTime,
    });
}
export var useScrollToItemOnSelection = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var _b = __read(React.useState(null), 2), lastInteraction = _b[0], setLastInteraction = _b[1];
    var listRef = React.useRef(null);
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var selectedResults = useSelectedResults({ lazyResults: lazyResults });
    var animationFrameId = React.useRef(null);
    var currentScrollOffset = React.useRef(null);
    var lastChangedTime = React.useRef(null);
    React.useEffect(function () {
        var allResults = Object.values(lazyResults.results);
        var selected = Object.values(selectedResults);
        if (listRef.current &&
            selected.length >= 1 &&
            Date.now() - (lastInteraction || 0) > 500) {
            startScrollingToItem({
                listRef: listRef.current,
                index: allResults.indexOf(selected[0]),
                animationFrameId: animationFrameId,
                currentScrollOffset: currentScrollOffset,
                lastChangedTime: lastChangedTime,
            });
        }
        return function () {
            window.cancelAnimationFrame(animationFrameId.current);
        };
    }, [selectedResults, lazyResults, lastInteraction]);
    return { listRef: listRef, setLastInteraction: setLastInteraction };
};
var ResultCards = function (_a) {
    var mode = _a.mode, setMode = _a.setMode, selectionInterface = _a.selectionInterface;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var results = Object.values(lazyResults.results);
    var theme = useTheme();
    var _b = useStatusOfLazyResults({ lazyResults: lazyResults }), isSearching = _b.isSearching, status = _b.status;
    /**
     * Note that this scenario only plays out when the component is first created, so if this is open before a search is run it will already be mounted.
     *
     * This is solely to keep the illusion of responsiveness when switching from table mode to list mode (or dropping a new result visual in)
     */
    var _c = __read(React.useState(false), 2), isMounted = _c[0], setIsMounted = _c[1];
    var _d = useScrollToItemOnSelection({
        selectionInterface: selectionInterface,
    }), listRef = _d.listRef, setLastInteraction = _d.setLastInteraction;
    React.useEffect(function () {
        var mountedTimeout = setTimeout(function () {
            setIsMounted(true);
        }, 1000);
        return function () {
            clearTimeout(mountedTimeout);
        };
    }, []);
    return (React.createElement(Grid, { container: true, className: "w-full h-full", direction: "column", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full" },
            React.createElement(Grid, { container: true, className: "w-full pt-2 px-2", direction: "row", alignItems: "center" },
                React.createElement(Grid, { item: true, className: "pl-6" },
                    React.createElement(HeaderCheckbox, { showText: true, lazyResults: lazyResults, buttonProps: {
                            style: {
                                minWidth: 0,
                            },
                        } })),
                React.createElement(ResultsCommonControls, { getStartingLeft: function () {
                        return TypedUserInstance.getResultsAttributesShownList();
                    }, getStartingRight: function () {
                        return TypedUserInstance.getResultsAttributesPossibleList();
                    }, onSave: function (active) {
                        user
                            .get('user')
                            .get('preferences')
                            .set('results-attributesShownList', active);
                        user.savePreferences();
                    } }),
                React.createElement(Grid, { item: true, className: "pr-2" },
                    React.createElement(Button, { "data-id": "list-button", onClick: function () {
                            setMode('card');
                        }, style: {
                            borderBottom: mode === 'card'
                                ? "1px solid ".concat(theme.palette.primary.main)
                                : '1px solid transparent',
                        } },
                        React.createElement(ViewAgendaIcon, null),
                        "List")),
                React.createElement(Grid, { item: true },
                    React.createElement(Button, { "data-id": "table-button", onClick: function () {
                            setMode('table');
                        }, style: {
                            borderBottom: mode === 'table'
                                ? "1px solid ".concat(theme.palette.primary.main)
                                : '1px solid transparent',
                        } },
                        React.createElement(TableChartIcon, null),
                        "Table")))),
        React.createElement(DarkDivider, { className: "w-full h-min my-2" }),
        React.createElement(Grid, { item: true, className: "w-full h-full p-2" },
            React.createElement(Paper, { elevation: Elevations.paper, className: "w-full h-full" }, isMounted ? (React.createElement(Memo, { dependencies: [
                    listRef.current,
                    lazyResults.results,
                    isSearching,
                    status,
                ] },
                React.createElement(AutoVariableSizeList, { controlledMeasuring: true, items: results, defaultSize: 60, overscanCount: 10, Item: function (_a) {
                        var itemRef = _a.itemRef, item = _a.item, measure = _a.measure, index = _a.index, width = _a.width;
                        return (React.createElement("div", { ref: itemRef, className: "relative" },
                            index !== 0 ? (React.createElement(React.Fragment, null,
                                React.createElement("div", { className: "h-min w-full Mui-bg-divider" }))) : null,
                            React.createElement(ResultItem, { lazyResults: results, lazyResult: item, selectionInterface: selectionInterface, measure: measure, index: index, width: width }),
                            index === results.length - 1 ? (React.createElement(React.Fragment, null,
                                React.createElement("div", { className: "h-min w-full Mui-bg-divider" }))) : null));
                    }, Empty: function () {
                        if (Object.values(status).length === 0) {
                            return (React.createElement("div", { className: "p-2" }, "Search has not yet been run."));
                        }
                        if (isSearching) {
                            return React.createElement(LinearProgress, { variant: "indeterminate" });
                        }
                        return (React.createElement("div", { className: "result-item-collection-empty p-2" }, "No Results Found"));
                    }, outerElementProps: {
                        onMouseEnter: function () {
                            setLastInteraction(Date.now());
                        },
                        onMouseUp: function () {
                            setLastInteraction(Date.now());
                        },
                    }, variableSizeListRef: listRef }))) : (React.createElement(LinearProgress, { variant: "indeterminate" }))))));
};
export default hot(module)(ResultCards);
//# sourceMappingURL=result-item.collection.js.map