import { __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
import { Memo } from '../../memo/memo';
import { LayoutContext } from '../../golden-layout/visual-settings.provider';
import { RESULTS_ATTRIBUTES_LIST, getDefaultResultsShownList, } from '../settings-helpers';
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
    var _b = React.useContext(LayoutContext), setValue = _b.setValue, getValue = _b.getValue;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var results = Object.values(lazyResults.results);
    var theme = useTheme();
    var _c = useStatusOfLazyResults({ lazyResults: lazyResults }), isSearching = _c.isSearching, status = _c.status;
    /**
     * Note that this scenario only plays out when the component is first created, so if this is open before a search is run it will already be mounted.
     *
     * This is solely to keep the illusion of responsiveness when switching from table mode to list mode (or dropping a new result visual in)
     */
    var _d = __read(React.useState(false), 2), isMounted = _d[0], setIsMounted = _d[1];
    var _e = useScrollToItemOnSelection({
        selectionInterface: selectionInterface,
    }), listRef = _e.listRef, setLastInteraction = _e.setLastInteraction;
    React.useEffect(function () {
        var mountedTimeout = setTimeout(function () {
            setIsMounted(true);
        }, 1000);
        return function () {
            clearTimeout(mountedTimeout);
        };
    }, []);
    return (_jsxs(Grid, { container: true, className: "w-full h-full", direction: "column", wrap: "nowrap", children: [_jsx(Grid, { item: true, className: "w-full", children: _jsxs(Grid, { container: true, className: "w-full pt-2 px-2", direction: "row", alignItems: "center", children: [_jsx(Grid, { item: true, className: "pl-6", children: _jsx(HeaderCheckbox, { showText: true, lazyResults: lazyResults, buttonProps: {
                                    style: {
                                        minWidth: 0,
                                    },
                                } }) }), _jsx(ResultsCommonControls, { getStartingLeft: function () {
                                return getValue(RESULTS_ATTRIBUTES_LIST, getDefaultResultsShownList());
                            }, getStartingRight: function () {
                                return TypedUserInstance.getResultsAttributesPossibleList(getValue(RESULTS_ATTRIBUTES_LIST));
                            }, onSave: function (active) { return setValue(RESULTS_ATTRIBUTES_LIST, active); } }), _jsx(Grid, { item: true, className: "pr-2", children: _jsxs(Button, { "data-id": "list-button", onClick: function () {
                                    setMode('card');
                                }, style: {
                                    borderBottom: mode === 'card'
                                        ? "1px solid ".concat(theme.palette.primary.main)
                                        : '1px solid transparent',
                                }, children: [_jsx(ViewAgendaIcon, {}), "List"] }) }), _jsx(Grid, { item: true, children: _jsxs(Button, { "data-id": "table-button", onClick: function () {
                                    setMode('table');
                                }, style: {
                                    borderBottom: mode === 'table'
                                        ? "1px solid ".concat(theme.palette.primary.main)
                                        : '1px solid transparent',
                                }, children: [_jsx(TableChartIcon, {}), "Table"] }) })] }) }), _jsx(DarkDivider, { className: "w-full h-min my-2" }), _jsx(Grid, { item: true, className: "w-full h-full p-2", children: _jsx(Paper, { elevation: Elevations.paper, className: "w-full h-full", children: isMounted ? (_jsx(Memo, { dependencies: [
                            listRef.current,
                            lazyResults.results,
                            isSearching,
                            status,
                        ], children: _jsx(AutoVariableSizeList, { controlledMeasuring: true, items: results, defaultSize: 60, overscanCount: 10, Item: function (_a) {
                                var itemRef = _a.itemRef, item = _a.item, measure = _a.measure, index = _a.index, width = _a.width;
                                return (_jsxs("div", { ref: itemRef, className: "relative", children: [index !== 0 ? (_jsx(_Fragment, { children: _jsx("div", { className: "h-min w-full Mui-bg-divider" }) })) : null, _jsx(ResultItem, { lazyResults: results, lazyResult: item, selectionInterface: selectionInterface, measure: measure, index: index, width: width }), index === results.length - 1 ? (_jsx(_Fragment, { children: _jsx("div", { className: "h-min w-full Mui-bg-divider" }) })) : null] }));
                            }, Empty: function () {
                                if (Object.values(status).length === 0) {
                                    return (_jsx("div", { className: "p-2", children: "Search has not yet been run." }));
                                }
                                if (isSearching) {
                                    return _jsx(LinearProgress, { variant: "indeterminate" });
                                }
                                return (_jsx("div", { className: "result-item-collection-empty p-2", children: "No Results Found" }));
                            }, outerElementProps: {
                                onMouseEnter: function () {
                                    setLastInteraction(Date.now());
                                },
                                onMouseUp: function () {
                                    setLastInteraction(Date.now());
                                },
                            }, variableSizeListRef: listRef }) })) : (_jsx(LinearProgress, { variant: "indeterminate" })) }) })] }));
};
export default ResultCards;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LWl0ZW0uY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9yZXN1bHRzLXZpc3VhbC9yZXN1bHQtaXRlbS5jb2xsZWN0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLFVBQVUsTUFBTSxlQUFlLENBQUE7QUFFdEMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDOUQsT0FBTyxJQUFJLE1BQU0sb0JBQW9CLENBQUE7QUFDckMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFFekMsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBQ3RGLE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsc0JBQXNCLEdBQ3ZCLE1BQU0seUNBQXlDLENBQUE7QUFDaEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sY0FBYyxNQUFNLDhCQUE4QixDQUFBO0FBQ3pELE9BQU8sY0FBYyxNQUFNLGdDQUFnQyxDQUFBO0FBQzNELE9BQU8sY0FBYyxNQUFNLGdDQUFnQyxDQUFBO0FBQzNELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDN0QsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sU0FBUyxDQUFBO0FBQy9DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFBO0FBRTlELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOENBQThDLENBQUE7QUFDNUUsT0FBTyxFQUNMLHVCQUF1QixFQUN2QiwwQkFBMEIsR0FDM0IsTUFBTSxxQkFBcUIsQ0FBQTtBQVE1QixTQUFTLFlBQVksQ0FBQyxFQVlyQjtRQVhDLE9BQU8sYUFBQSxFQUNQLEtBQUssV0FBQSxFQUNMLGdCQUFnQixzQkFBQSxFQUNoQixtQkFBbUIseUJBQUEsRUFDbkIsZUFBZSxxQkFBQTtJQVFmLGdCQUFnQixDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUM7UUFDdEQsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsZUFBZSxDQUFDLE9BQVEsQ0FBQTtRQUNqRSxJQUFJLG1CQUFtQixHQUFHLElBQUksRUFBRSxDQUFDO1lBQy9CLE9BQU07UUFDUixDQUFDO1FBQ0QsSUFBSyxPQUFPLENBQUMsS0FBYSxDQUFDLFlBQVksS0FBSyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN4RSxlQUFlLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtZQUNwQyxtQkFBbUIsQ0FBQyxPQUFPLEdBQUksT0FBTyxDQUFDLEtBQWEsQ0FBQyxZQUFZLENBQUE7UUFDbkUsQ0FBQztRQUNELElBQUksQ0FBRSxPQUFPLENBQUMsS0FBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3hDLE9BQU8sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQ3RDLENBQUM7UUFDRCxZQUFZLENBQUM7WUFDWCxPQUFPLFNBQUE7WUFDUCxLQUFLLE9BQUE7WUFDTCxnQkFBZ0Isa0JBQUE7WUFDaEIsbUJBQW1CLHFCQUFBO1lBQ25CLGVBQWUsaUJBQUE7U0FDaEIsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDO0FBRUQsU0FBUyxvQkFBb0IsQ0FBQyxFQVk3QjtRQVhDLE9BQU8sYUFBQSxFQUNQLEtBQUssV0FBQSxFQUNMLGdCQUFnQixzQkFBQSxFQUNoQixtQkFBbUIseUJBQUEsRUFDbkIsZUFBZSxxQkFBQTtJQVFmLGVBQWUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO0lBQ3BDLG1CQUFtQixDQUFDLE9BQU8sR0FBSSxPQUFPLENBQUMsS0FBYSxDQUFDLFlBQVksQ0FBQTtJQUNqRSxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUNwQyxZQUFZLENBQUM7UUFDWCxPQUFPLFNBQUE7UUFDUCxLQUFLLE9BQUE7UUFDTCxnQkFBZ0Isa0JBQUE7UUFDaEIsbUJBQW1CLHFCQUFBO1FBQ25CLGVBQWUsaUJBQUE7S0FDaEIsQ0FBQyxDQUFBO0FBQ0osQ0FBQztBQUVELE1BQU0sQ0FBQyxJQUFNLDBCQUEwQixHQUFHLFVBQUMsRUFJMUM7UUFIQyxrQkFBa0Isd0JBQUE7SUFJWixJQUFBLEtBQUEsT0FBd0MsS0FBSyxDQUFDLFFBQVEsQ0FDMUQsSUFBSSxDQUNMLElBQUEsRUFGTSxlQUFlLFFBQUEsRUFBRSxrQkFBa0IsUUFFekMsQ0FBQTtJQUNELElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQTBCLElBQUksQ0FBQyxDQUFBO0lBQzNELElBQU0sV0FBVyxHQUFHLG9DQUFvQyxDQUFDO1FBQ3ZELGtCQUFrQixvQkFBQTtLQUNuQixDQUFDLENBQUE7SUFDRixJQUFNLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQyxFQUFFLFdBQVcsYUFBQSxFQUFFLENBQUMsQ0FBQTtJQUMzRCxJQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxNQUFNLENBQWdCLElBQUksQ0FBQyxDQUFBO0lBQzFELElBQU0sbUJBQW1CLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBZ0IsSUFBSSxDQUFDLENBQUE7SUFDN0QsSUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBZ0IsSUFBSSxDQUFDLENBQUE7SUFFekQsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3JELElBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7UUFDL0MsSUFDRSxPQUFPLENBQUMsT0FBTztZQUNmLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQztZQUNwQixJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxlQUFlLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUN6QyxDQUFDO1lBQ0Qsb0JBQW9CLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTztnQkFDeEIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QyxnQkFBZ0Isa0JBQUE7Z0JBQ2hCLG1CQUFtQixxQkFBQTtnQkFDbkIsZUFBZSxpQkFBQTthQUNoQixDQUFDLENBQUE7UUFDSixDQUFDO1FBQ0QsT0FBTztZQUNMLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFpQixDQUFDLENBQUE7UUFDakUsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLFdBQVcsRUFBRSxlQUFlLENBQUMsQ0FBQyxDQUFBO0lBQ25ELE9BQU8sRUFBRSxPQUFPLFNBQUEsRUFBRSxrQkFBa0Isb0JBQUEsRUFBRSxDQUFBO0FBQ3hDLENBQUMsQ0FBQTtBQUVELElBQU0sV0FBVyxHQUFHLFVBQUMsRUFBNEM7UUFBMUMsSUFBSSxVQUFBLEVBQUUsT0FBTyxhQUFBLEVBQUUsa0JBQWtCLHdCQUFBO0lBQ2hELElBQUEsS0FBeUIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBdEQsUUFBUSxjQUFBLEVBQUUsUUFBUSxjQUFvQyxDQUFBO0lBQzlELElBQU0sV0FBVyxHQUFHLG9DQUFvQyxDQUFDO1FBQ3ZELGtCQUFrQixvQkFBQTtLQUNuQixDQUFDLENBQUE7SUFDRixJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNsRCxJQUFNLEtBQUssR0FBRyxRQUFRLEVBQUUsQ0FBQTtJQUNsQixJQUFBLEtBQTBCLHNCQUFzQixDQUFDLEVBQUUsV0FBVyxhQUFBLEVBQUUsQ0FBQyxFQUEvRCxXQUFXLGlCQUFBLEVBQUUsTUFBTSxZQUE0QyxDQUFBO0lBRXZFOzs7O09BSUc7SUFDRyxJQUFBLEtBQUEsT0FBNEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUFoRCxTQUFTLFFBQUEsRUFBRSxZQUFZLFFBQXlCLENBQUE7SUFFakQsSUFBQSxLQUFrQywwQkFBMEIsQ0FBQztRQUNqRSxrQkFBa0Isb0JBQUE7S0FDbkIsQ0FBQyxFQUZNLE9BQU8sYUFBQSxFQUFFLGtCQUFrQix3QkFFakMsQ0FBQTtJQUVGLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFNLGNBQWMsR0FBRyxVQUFVLENBQUM7WUFDaEMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3BCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUNSLE9BQU87WUFDTCxZQUFZLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDOUIsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sT0FBTyxDQUNMLE1BQUMsSUFBSSxJQUFDLFNBQVMsUUFBQyxTQUFTLEVBQUMsZUFBZSxFQUFDLFNBQVMsRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLFFBQVEsYUFDeEUsS0FBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxRQUFRLFlBQzNCLE1BQUMsSUFBSSxJQUNILFNBQVMsUUFDVCxTQUFTLEVBQUMsa0JBQWtCLEVBQzVCLFNBQVMsRUFBQyxLQUFLLEVBQ2YsVUFBVSxFQUFDLFFBQVEsYUFFbkIsS0FBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxNQUFNLFlBQ3pCLEtBQUMsY0FBYyxJQUNiLFFBQVEsUUFDUixXQUFXLEVBQUUsV0FBVyxFQUN4QixXQUFXLEVBQUU7b0NBQ1gsS0FBSyxFQUFFO3dDQUNMLFFBQVEsRUFBRSxDQUFDO3FDQUNaO2lDQUNGLEdBQ0QsR0FDRyxFQUNQLEtBQUMscUJBQXFCLElBQ3BCLGVBQWUsRUFBRTtnQ0FDZixPQUFBLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSwwQkFBMEIsRUFBRSxDQUFDOzRCQUEvRCxDQUErRCxFQUVqRSxnQkFBZ0IsRUFBRTtnQ0FDaEIsT0FBTyxpQkFBaUIsQ0FBQyxnQ0FBZ0MsQ0FDdkQsUUFBUSxDQUFDLHVCQUF1QixDQUFDLENBQ2xDLENBQUE7NEJBQ0gsQ0FBQyxFQUNELE1BQU0sRUFBRSxVQUFDLE1BQU0sSUFBSyxPQUFBLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxNQUFNLENBQUMsRUFBekMsQ0FBeUMsR0FDN0QsRUFDRixLQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLE1BQU0sWUFDekIsTUFBQyxNQUFNLGVBQ0csYUFBYSxFQUNyQixPQUFPLEVBQUU7b0NBQ1AsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO2dDQUNqQixDQUFDLEVBQ0QsS0FBSyxFQUFFO29DQUNMLFlBQVksRUFDVixJQUFJLEtBQUssTUFBTTt3Q0FDYixDQUFDLENBQUMsb0JBQWEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFO3dDQUMzQyxDQUFDLENBQUMsdUJBQXVCO2lDQUM5QixhQUVELEtBQUMsY0FBYyxLQUFHLFlBRVgsR0FDSixFQUNQLEtBQUMsSUFBSSxJQUFDLElBQUksa0JBQ1IsTUFBQyxNQUFNLGVBQ0csY0FBYyxFQUN0QixPQUFPLEVBQUU7b0NBQ1AsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dDQUNsQixDQUFDLEVBQ0QsS0FBSyxFQUFFO29DQUNMLFlBQVksRUFDVixJQUFJLEtBQUssT0FBTzt3Q0FDZCxDQUFDLENBQUMsb0JBQWEsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFFO3dDQUMzQyxDQUFDLENBQUMsdUJBQXVCO2lDQUM5QixhQUVELEtBQUMsY0FBYyxLQUFHLGFBRVgsR0FDSixJQUNGLEdBQ0YsRUFDUCxLQUFDLFdBQVcsSUFBQyxTQUFTLEVBQUMsbUJBQW1CLEdBQUcsRUFDN0MsS0FBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyxtQkFBbUIsWUFDdEMsS0FBQyxLQUFLLElBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFDLGVBQWUsWUFDMUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUNYLEtBQUMsSUFBSSxJQUNILFlBQVksRUFBRTs0QkFDWixPQUFPLENBQUMsT0FBTzs0QkFDZixXQUFXLENBQUMsT0FBTzs0QkFDbkIsV0FBVzs0QkFDWCxNQUFNO3lCQUNQLFlBRUQsS0FBQyxvQkFBb0IsSUFDbkIsbUJBQW1CLEVBQUUsSUFBSSxFQUN6QixLQUFLLEVBQUUsT0FBTyxFQUNkLFdBQVcsRUFBRSxFQUFFLEVBQ2YsYUFBYSxFQUFFLEVBQUUsRUFDakIsSUFBSSxFQUFFLFVBQUMsRUFBd0M7b0NBQXRDLE9BQU8sYUFBQSxFQUFFLElBQUksVUFBQSxFQUFFLE9BQU8sYUFBQSxFQUFFLEtBQUssV0FBQSxFQUFFLEtBQUssV0FBQTtnQ0FDM0MsT0FBTyxDQUNMLGVBQUssR0FBRyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUMsVUFBVSxhQUNwQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUNiLDRCQUNFLGNBQUssU0FBUyxFQUFDLDZCQUE2QixHQUFHLEdBQzlDLENBQ0osQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUNSLEtBQUMsVUFBVSxJQUNULFdBQVcsRUFBRSxPQUFPLEVBQ3BCLFVBQVUsRUFBRSxJQUFJLEVBQ2hCLGtCQUFrQixFQUFFLGtCQUFrQixFQUN0QyxPQUFPLEVBQUUsT0FBTyxFQUNoQixLQUFLLEVBQUUsS0FBSyxFQUNaLEtBQUssRUFBRSxLQUFLLEdBQ1osRUFDRCxLQUFLLEtBQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzlCLDRCQUNFLGNBQUssU0FBUyxFQUFDLDZCQUE2QixHQUFHLEdBQzlDLENBQ0osQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUNKLENBQ1AsQ0FBQTs0QkFDSCxDQUFDLEVBQ0QsS0FBSyxFQUFFO2dDQUNMLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7b0NBQ3ZDLE9BQU8sQ0FDTCxjQUFLLFNBQVMsRUFBQyxLQUFLLDZDQUFtQyxDQUN4RCxDQUFBO2dDQUNILENBQUM7Z0NBQ0QsSUFBSSxXQUFXLEVBQUUsQ0FBQztvQ0FDaEIsT0FBTyxLQUFDLGNBQWMsSUFBQyxPQUFPLEVBQUMsZUFBZSxHQUFHLENBQUE7Z0NBQ25ELENBQUM7Z0NBQ0QsT0FBTyxDQUNMLGNBQUssU0FBUyxFQUFDLGtDQUFrQyxpQ0FFM0MsQ0FDUCxDQUFBOzRCQUNILENBQUMsRUFDRCxpQkFBaUIsRUFBRTtnQ0FDakIsWUFBWSxFQUFFO29DQUNaLGtCQUFrQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFBO2dDQUNoQyxDQUFDO2dDQUNELFNBQVMsRUFBRTtvQ0FDVCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTtnQ0FDaEMsQ0FBQzs2QkFDRixFQUNELG1CQUFtQixFQUFFLE9BQU8sR0FDNUIsR0FDRyxDQUNSLENBQUMsQ0FBQyxDQUFDLENBQ0YsS0FBQyxjQUFjLElBQUMsT0FBTyxFQUFDLGVBQWUsR0FBRyxDQUMzQyxHQUNLLEdBQ0gsSUFDRixDQUNSLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFdBQVcsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgUmVzdWx0SXRlbSBmcm9tICcuL3Jlc3VsdC1pdGVtJ1xuXG5pbXBvcnQgeyBBdXRvVmFyaWFibGVTaXplTGlzdCB9IGZyb20gJ3JlYWN0LXdpbmRvdy1jb21wb25lbnRzJ1xuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi8uLi90aGVtZS90aGVtZSdcbmltcG9ydCB7IHVzZUxhenlSZXN1bHRzRnJvbVNlbGVjdGlvbkludGVyZmFjZSB9IGZyb20gJy4uLy4uL3NlbGVjdGlvbi1pbnRlcmZhY2UvaG9va3MnXG5pbXBvcnQge1xuICB1c2VTZWxlY3RlZFJlc3VsdHMsXG4gIHVzZVN0YXR1c09mTGF6eVJlc3VsdHMsXG59IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9ob29rcydcbmltcG9ydCB7IHVzZVRoZW1lIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9zdHlsZXMnXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCBWaWV3QWdlbmRhSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL1ZpZXdBZ2VuZGEnXG5pbXBvcnQgVGFibGVDaGFydEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9UYWJsZUNoYXJ0J1xuaW1wb3J0IHsgSGVhZGVyQ2hlY2tib3ggfSBmcm9tICcuL3RhYmxlLWhlYWRlcidcbmltcG9ydCB7IERhcmtEaXZpZGVyIH0gZnJvbSAnLi4vLi4vZGFyay1kaXZpZGVyL2RhcmstZGl2aWRlcidcbmltcG9ydCB7IFJlc3VsdHNDb21tb25Db250cm9scyB9IGZyb20gJy4vdGFibGUnXG5pbXBvcnQgeyBUeXBlZFVzZXJJbnN0YW5jZSB9IGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvVHlwZWRVc2VyJ1xuaW1wb3J0IHsgVmFyaWFibGVTaXplTGlzdCB9IGZyb20gJ3JlYWN0LXdpbmRvdydcbmltcG9ydCB7IE1lbW8gfSBmcm9tICcuLi8uLi9tZW1vL21lbW8nXG5pbXBvcnQgeyBMYXlvdXRDb250ZXh0IH0gZnJvbSAnLi4vLi4vZ29sZGVuLWxheW91dC92aXN1YWwtc2V0dGluZ3MucHJvdmlkZXInXG5pbXBvcnQge1xuICBSRVNVTFRTX0FUVFJJQlVURVNfTElTVCxcbiAgZ2V0RGVmYXVsdFJlc3VsdHNTaG93bkxpc3QsXG59IGZyb20gJy4uL3NldHRpbmdzLWhlbHBlcnMnXG5cbnR5cGUgUHJvcHMgPSB7XG4gIG1vZGU6IGFueVxuICBzZXRNb2RlOiBhbnlcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbn1cblxuZnVuY3Rpb24gc2Nyb2xsVG9JdGVtKHtcbiAgbGlzdFJlZixcbiAgaW5kZXgsXG4gIGFuaW1hdGlvbkZyYW1lSWQsXG4gIGN1cnJlbnRTY3JvbGxPZmZzZXQsXG4gIGxhc3RDaGFuZ2VkVGltZSxcbn06IHtcbiAgbGlzdFJlZjogVmFyaWFibGVTaXplTGlzdFxuICBpbmRleDogbnVtYmVyXG4gIGFuaW1hdGlvbkZyYW1lSWQ6IFJlYWN0Lk11dGFibGVSZWZPYmplY3Q8bnVtYmVyIHwgbnVsbD5cbiAgY3VycmVudFNjcm9sbE9mZnNldDogUmVhY3QuTXV0YWJsZVJlZk9iamVjdDxudW1iZXIgfCBudWxsPlxuICBsYXN0Q2hhbmdlZFRpbWU6IFJlYWN0Lk11dGFibGVSZWZPYmplY3Q8bnVtYmVyIHwgbnVsbD5cbn0pIHtcbiAgYW5pbWF0aW9uRnJhbWVJZC5jdXJyZW50ID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgY29uc3QgdGltZVNpbmNlTGFzdENoYW5nZSA9IERhdGUubm93KCkgLSBsYXN0Q2hhbmdlZFRpbWUuY3VycmVudCFcbiAgICBpZiAodGltZVNpbmNlTGFzdENoYW5nZSA+IDEwMDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAoKGxpc3RSZWYuc3RhdGUgYXMgYW55KS5zY3JvbGxPZmZzZXQgIT09IGN1cnJlbnRTY3JvbGxPZmZzZXQuY3VycmVudCkge1xuICAgICAgbGFzdENoYW5nZWRUaW1lLmN1cnJlbnQgPSBEYXRlLm5vdygpXG4gICAgICBjdXJyZW50U2Nyb2xsT2Zmc2V0LmN1cnJlbnQgPSAobGlzdFJlZi5zdGF0ZSBhcyBhbnkpLnNjcm9sbE9mZnNldFxuICAgIH1cbiAgICBpZiAoIShsaXN0UmVmLnN0YXRlIGFzIGFueSkuaXNTY3JvbGxpbmcpIHtcbiAgICAgIGxpc3RSZWYuc2Nyb2xsVG9JdGVtKGluZGV4LCAnc21hcnQnKVxuICAgIH1cbiAgICBzY3JvbGxUb0l0ZW0oe1xuICAgICAgbGlzdFJlZixcbiAgICAgIGluZGV4LFxuICAgICAgYW5pbWF0aW9uRnJhbWVJZCxcbiAgICAgIGN1cnJlbnRTY3JvbGxPZmZzZXQsXG4gICAgICBsYXN0Q2hhbmdlZFRpbWUsXG4gICAgfSlcbiAgfSlcbn1cblxuZnVuY3Rpb24gc3RhcnRTY3JvbGxpbmdUb0l0ZW0oe1xuICBsaXN0UmVmLFxuICBpbmRleCxcbiAgYW5pbWF0aW9uRnJhbWVJZCxcbiAgY3VycmVudFNjcm9sbE9mZnNldCxcbiAgbGFzdENoYW5nZWRUaW1lLFxufToge1xuICBsaXN0UmVmOiBWYXJpYWJsZVNpemVMaXN0XG4gIGluZGV4OiBudW1iZXJcbiAgYW5pbWF0aW9uRnJhbWVJZDogUmVhY3QuTXV0YWJsZVJlZk9iamVjdDxudW1iZXIgfCBudWxsPlxuICBjdXJyZW50U2Nyb2xsT2Zmc2V0OiBSZWFjdC5NdXRhYmxlUmVmT2JqZWN0PG51bWJlciB8IG51bGw+XG4gIGxhc3RDaGFuZ2VkVGltZTogUmVhY3QuTXV0YWJsZVJlZk9iamVjdDxudW1iZXIgfCBudWxsPlxufSkge1xuICBsYXN0Q2hhbmdlZFRpbWUuY3VycmVudCA9IERhdGUubm93KClcbiAgY3VycmVudFNjcm9sbE9mZnNldC5jdXJyZW50ID0gKGxpc3RSZWYuc3RhdGUgYXMgYW55KS5zY3JvbGxPZmZzZXRcbiAgbGlzdFJlZi5zY3JvbGxUb0l0ZW0oaW5kZXgsICdzbWFydCcpXG4gIHNjcm9sbFRvSXRlbSh7XG4gICAgbGlzdFJlZixcbiAgICBpbmRleCxcbiAgICBhbmltYXRpb25GcmFtZUlkLFxuICAgIGN1cnJlbnRTY3JvbGxPZmZzZXQsXG4gICAgbGFzdENoYW5nZWRUaW1lLFxuICB9KVxufVxuXG5leHBvcnQgY29uc3QgdXNlU2Nyb2xsVG9JdGVtT25TZWxlY3Rpb24gPSAoe1xuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogUHJvcHNbJ3NlbGVjdGlvbkludGVyZmFjZSddXG59KSA9PiB7XG4gIGNvbnN0IFtsYXN0SW50ZXJhY3Rpb24sIHNldExhc3RJbnRlcmFjdGlvbl0gPSBSZWFjdC51c2VTdGF0ZTxudW1iZXIgfCBudWxsPihcbiAgICBudWxsXG4gIClcbiAgY29uc3QgbGlzdFJlZiA9IFJlYWN0LnVzZVJlZjxWYXJpYWJsZVNpemVMaXN0IHwgbnVsbD4obnVsbClcbiAgY29uc3QgbGF6eVJlc3VsdHMgPSB1c2VMYXp5UmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2Uoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgY29uc3Qgc2VsZWN0ZWRSZXN1bHRzID0gdXNlU2VsZWN0ZWRSZXN1bHRzKHsgbGF6eVJlc3VsdHMgfSlcbiAgY29uc3QgYW5pbWF0aW9uRnJhbWVJZCA9IFJlYWN0LnVzZVJlZjxudW1iZXIgfCBudWxsPihudWxsKVxuICBjb25zdCBjdXJyZW50U2Nyb2xsT2Zmc2V0ID0gUmVhY3QudXNlUmVmPG51bWJlciB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGxhc3RDaGFuZ2VkVGltZSA9IFJlYWN0LnVzZVJlZjxudW1iZXIgfCBudWxsPihudWxsKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgYWxsUmVzdWx0cyA9IE9iamVjdC52YWx1ZXMobGF6eVJlc3VsdHMucmVzdWx0cylcbiAgICBjb25zdCBzZWxlY3RlZCA9IE9iamVjdC52YWx1ZXMoc2VsZWN0ZWRSZXN1bHRzKVxuICAgIGlmIChcbiAgICAgIGxpc3RSZWYuY3VycmVudCAmJlxuICAgICAgc2VsZWN0ZWQubGVuZ3RoID49IDEgJiZcbiAgICAgIERhdGUubm93KCkgLSAobGFzdEludGVyYWN0aW9uIHx8IDApID4gNTAwXG4gICAgKSB7XG4gICAgICBzdGFydFNjcm9sbGluZ1RvSXRlbSh7XG4gICAgICAgIGxpc3RSZWY6IGxpc3RSZWYuY3VycmVudCxcbiAgICAgICAgaW5kZXg6IGFsbFJlc3VsdHMuaW5kZXhPZihzZWxlY3RlZFswXSksXG4gICAgICAgIGFuaW1hdGlvbkZyYW1lSWQsXG4gICAgICAgIGN1cnJlbnRTY3JvbGxPZmZzZXQsXG4gICAgICAgIGxhc3RDaGFuZ2VkVGltZSxcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbWF0aW9uRnJhbWVJZC5jdXJyZW50IGFzIG51bWJlcilcbiAgICB9XG4gIH0sIFtzZWxlY3RlZFJlc3VsdHMsIGxhenlSZXN1bHRzLCBsYXN0SW50ZXJhY3Rpb25dKVxuICByZXR1cm4geyBsaXN0UmVmLCBzZXRMYXN0SW50ZXJhY3Rpb24gfVxufVxuXG5jb25zdCBSZXN1bHRDYXJkcyA9ICh7IG1vZGUsIHNldE1vZGUsIHNlbGVjdGlvbkludGVyZmFjZSB9OiBQcm9wcykgPT4ge1xuICBjb25zdCB7IHNldFZhbHVlLCBnZXRWYWx1ZSB9ID0gUmVhY3QudXNlQ29udGV4dChMYXlvdXRDb250ZXh0KVxuICBjb25zdCBsYXp5UmVzdWx0cyA9IHVzZUxhenlSZXN1bHRzRnJvbVNlbGVjdGlvbkludGVyZmFjZSh7XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuICBjb25zdCByZXN1bHRzID0gT2JqZWN0LnZhbHVlcyhsYXp5UmVzdWx0cy5yZXN1bHRzKVxuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKClcbiAgY29uc3QgeyBpc1NlYXJjaGluZywgc3RhdHVzIH0gPSB1c2VTdGF0dXNPZkxhenlSZXN1bHRzKHsgbGF6eVJlc3VsdHMgfSlcblxuICAvKipcbiAgICogTm90ZSB0aGF0IHRoaXMgc2NlbmFyaW8gb25seSBwbGF5cyBvdXQgd2hlbiB0aGUgY29tcG9uZW50IGlzIGZpcnN0IGNyZWF0ZWQsIHNvIGlmIHRoaXMgaXMgb3BlbiBiZWZvcmUgYSBzZWFyY2ggaXMgcnVuIGl0IHdpbGwgYWxyZWFkeSBiZSBtb3VudGVkLlxuICAgKlxuICAgKiBUaGlzIGlzIHNvbGVseSB0byBrZWVwIHRoZSBpbGx1c2lvbiBvZiByZXNwb25zaXZlbmVzcyB3aGVuIHN3aXRjaGluZyBmcm9tIHRhYmxlIG1vZGUgdG8gbGlzdCBtb2RlIChvciBkcm9wcGluZyBhIG5ldyByZXN1bHQgdmlzdWFsIGluKVxuICAgKi9cbiAgY29uc3QgW2lzTW91bnRlZCwgc2V0SXNNb3VudGVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IHsgbGlzdFJlZiwgc2V0TGFzdEludGVyYWN0aW9uIH0gPSB1c2VTY3JvbGxUb0l0ZW1PblNlbGVjdGlvbih7XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgbW91bnRlZFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldElzTW91bnRlZCh0cnVlKVxuICAgIH0sIDEwMDApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dChtb3VudGVkVGltZW91dClcbiAgICB9XG4gIH0sIFtdKVxuICByZXR1cm4gKFxuICAgIDxHcmlkIGNvbnRhaW5lciBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCIgZGlyZWN0aW9uPVwiY29sdW1uXCIgd3JhcD1cIm5vd3JhcFwiPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGxcIj5cbiAgICAgICAgPEdyaWRcbiAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHQtMiBweC0yXCJcbiAgICAgICAgICBkaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAgICA+XG4gICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJwbC02XCI+XG4gICAgICAgICAgICA8SGVhZGVyQ2hlY2tib3hcbiAgICAgICAgICAgICAgc2hvd1RleHRcbiAgICAgICAgICAgICAgbGF6eVJlc3VsdHM9e2xhenlSZXN1bHRzfVxuICAgICAgICAgICAgICBidXR0b25Qcm9wcz17e1xuICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICBtaW5XaWR0aDogMCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgPFJlc3VsdHNDb21tb25Db250cm9sc1xuICAgICAgICAgICAgZ2V0U3RhcnRpbmdMZWZ0PXsoKSA9PlxuICAgICAgICAgICAgICBnZXRWYWx1ZShSRVNVTFRTX0FUVFJJQlVURVNfTElTVCwgZ2V0RGVmYXVsdFJlc3VsdHNTaG93bkxpc3QoKSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdldFN0YXJ0aW5nUmlnaHQ9eygpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIFR5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzUG9zc2libGVMaXN0KFxuICAgICAgICAgICAgICAgIGdldFZhbHVlKFJFU1VMVFNfQVRUUklCVVRFU19MSVNUKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25TYXZlPXsoYWN0aXZlKSA9PiBzZXRWYWx1ZShSRVNVTFRTX0FUVFJJQlVURVNfTElTVCwgYWN0aXZlKX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwicHItMlwiPlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBkYXRhLWlkPVwibGlzdC1idXR0b25cIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0TW9kZSgnY2FyZCcpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOlxuICAgICAgICAgICAgICAgICAgbW9kZSA9PT0gJ2NhcmQnXG4gICAgICAgICAgICAgICAgICAgID8gYDFweCBzb2xpZCAke3RoZW1lLnBhbGV0dGUucHJpbWFyeS5tYWlufWBcbiAgICAgICAgICAgICAgICAgICAgOiAnMXB4IHNvbGlkIHRyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFZpZXdBZ2VuZGFJY29uIC8+XG4gICAgICAgICAgICAgIExpc3RcbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICA8R3JpZCBpdGVtPlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBkYXRhLWlkPVwidGFibGUtYnV0dG9uXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldE1vZGUoJ3RhYmxlJylcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206XG4gICAgICAgICAgICAgICAgICBtb2RlID09PSAndGFibGUnXG4gICAgICAgICAgICAgICAgICAgID8gYDFweCBzb2xpZCAke3RoZW1lLnBhbGV0dGUucHJpbWFyeS5tYWlufWBcbiAgICAgICAgICAgICAgICAgICAgOiAnMXB4IHNvbGlkIHRyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFRhYmxlQ2hhcnRJY29uIC8+XG4gICAgICAgICAgICAgIFRhYmxlXG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxEYXJrRGl2aWRlciBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1taW4gbXktMlwiIC8+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcC0yXCI+XG4gICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFwZXJ9IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIj5cbiAgICAgICAgICB7aXNNb3VudGVkID8gKFxuICAgICAgICAgICAgPE1lbW9cbiAgICAgICAgICAgICAgZGVwZW5kZW5jaWVzPXtbXG4gICAgICAgICAgICAgICAgbGlzdFJlZi5jdXJyZW50LFxuICAgICAgICAgICAgICAgIGxhenlSZXN1bHRzLnJlc3VsdHMsXG4gICAgICAgICAgICAgICAgaXNTZWFyY2hpbmcsXG4gICAgICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8QXV0b1ZhcmlhYmxlU2l6ZUxpc3Q8TGF6eVF1ZXJ5UmVzdWx0LCBIVE1MRGl2RWxlbWVudD5cbiAgICAgICAgICAgICAgICBjb250cm9sbGVkTWVhc3VyaW5nPXt0cnVlfVxuICAgICAgICAgICAgICAgIGl0ZW1zPXtyZXN1bHRzfVxuICAgICAgICAgICAgICAgIGRlZmF1bHRTaXplPXs2MH1cbiAgICAgICAgICAgICAgICBvdmVyc2NhbkNvdW50PXsxMH1cbiAgICAgICAgICAgICAgICBJdGVtPXsoeyBpdGVtUmVmLCBpdGVtLCBtZWFzdXJlLCBpbmRleCwgd2lkdGggfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiByZWY9e2l0ZW1SZWZ9IGNsYXNzTmFtZT1cInJlbGF0aXZlXCI+XG4gICAgICAgICAgICAgICAgICAgICAge2luZGV4ICE9PSAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLW1pbiB3LWZ1bGwgTXVpLWJnLWRpdmlkZXJcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgPFJlc3VsdEl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHRzPXtyZXN1bHRzfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17aXRlbX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZT17c2VsZWN0aW9uSW50ZXJmYWNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZT17bWVhc3VyZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXt3aWR0aH1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIHtpbmRleCA9PT0gcmVzdWx0cy5sZW5ndGggLSAxID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLW1pbiB3LWZ1bGwgTXVpLWJnLWRpdmlkZXJcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgRW1wdHk9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QudmFsdWVzKHN0YXR1cykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTJcIj5TZWFyY2ggaGFzIG5vdCB5ZXQgYmVlbiBydW4uPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmIChpc1NlYXJjaGluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gPExpbmVhclByb2dyZXNzIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCIgLz5cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVzdWx0LWl0ZW0tY29sbGVjdGlvbi1lbXB0eSBwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICBObyBSZXN1bHRzIEZvdW5kXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgb3V0ZXJFbGVtZW50UHJvcHM9e3tcbiAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcjogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRMYXN0SW50ZXJhY3Rpb24oRGF0ZS5ub3coKSlcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBvbk1vdXNlVXA6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0TGFzdEludGVyYWN0aW9uKERhdGUubm93KCkpXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdmFyaWFibGVTaXplTGlzdFJlZj17bGlzdFJlZn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvTWVtbz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPExpbmVhclByb2dyZXNzIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCIgLz5cbiAgICAgICAgICApfVxuICAgICAgICA8L1BhcGVyPlxuICAgICAgPC9HcmlkPlxuICAgIDwvR3JpZD5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZXN1bHRDYXJkc1xuIl19