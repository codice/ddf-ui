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
                        return getValue(RESULTS_ATTRIBUTES_LIST, getDefaultResultsShownList());
                    }, getStartingRight: function () {
                        return TypedUserInstance.getResultsAttributesPossibleList(getValue(RESULTS_ATTRIBUTES_LIST));
                    }, onSave: function (active) { return setValue(RESULTS_ATTRIBUTES_LIST, active); } }),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LWl0ZW0uY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdmlzdWFsaXphdGlvbi9yZXN1bHRzLXZpc3VhbC9yZXN1bHQtaXRlbS5jb2xsZWN0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sVUFBVSxNQUFNLGVBQWUsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDOUQsT0FBTyxJQUFJLE1BQU0sb0JBQW9CLENBQUE7QUFDckMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFFekMsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxvQ0FBb0MsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBQ3RGLE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsc0JBQXNCLEdBQ3ZCLE1BQU0seUNBQXlDLENBQUE7QUFDaEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFBO0FBQy9DLE9BQU8sY0FBYyxNQUFNLDhCQUE4QixDQUFBO0FBQ3pELE9BQU8sY0FBYyxNQUFNLGdDQUFnQyxDQUFBO0FBQzNELE9BQU8sY0FBYyxNQUFNLGdDQUFnQyxDQUFBO0FBQzNELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDN0QsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sU0FBUyxDQUFBO0FB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QUssR0FDWjs0QkFDRCxLQUFLLEtBQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzlCO2dDQUNFLDZCQUFLLFNBQVMsRUFBQyw2QkFBNkIsR0FBRyxDQUM5QyxDQUNKLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDSixDQUNQLENBQUE7b0JBQ0gsQ0FBQyxFQUNELEtBQUssRUFBRTt3QkFDTCxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDdEMsT0FBTyxDQUNMLDZCQUFLLFNBQVMsRUFBQyxLQUFLLG1DQUFtQyxDQUN4RCxDQUFBO3lCQUNGO3dCQUNELElBQUksV0FBVyxFQUFFOzRCQUNmLE9BQU8sb0JBQUMsY0FBYyxJQUFDLE9BQU8sRUFBQyxlQUFlLEdBQUcsQ0FBQTt5QkFDbEQ7d0JBQ0QsT0FBTyxDQUNMLDZCQUFLLFNBQVMsRUFBQyxrQ0FBa0MsdUJBRTNDLENBQ1AsQ0FBQTtvQkFDSCxDQUFDLEVBQ0QsaUJBQWlCLEVBQUU7d0JBQ2pCLFlBQVksRUFBRTs0QkFDWixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQTt3QkFDaEMsQ0FBQzt3QkFDRCxTQUFTLEVBQUU7NEJBQ1Qsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUE7d0JBQ2hDLENBQUM7cUJBQ0YsRUFDRCxtQkFBbUIsRUFBRSxPQUFPLEdBQzVCLENBQ0csQ0FDUixDQUFDLENBQUMsQ0FBQyxDQUNGLG9CQUFDLGNBQWMsSUFBQyxPQUFPLEVBQUMsZUFBZSxHQUFHLENBQzNDLENBQ0ssQ0FDSCxDQUNGLENBQ1IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBSZXN1bHRJdGVtIGZyb20gJy4vcmVzdWx0LWl0ZW0nXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgQXV0b1ZhcmlhYmxlU2l6ZUxpc3QgfSBmcm9tICdyZWFjdC13aW5kb3ctY29tcG9uZW50cydcbmltcG9ydCBHcmlkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvR3JpZCdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyBFbGV2YXRpb25zIH0gZnJvbSAnLi4vLi4vdGhlbWUvdGhlbWUnXG5pbXBvcnQgeyB1c2VMYXp5UmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2UgfSBmcm9tICcuLi8uLi9zZWxlY3Rpb24taW50ZXJmYWNlL2hvb2tzJ1xuaW1wb3J0IHtcbiAgdXNlU2VsZWN0ZWRSZXN1bHRzLFxuICB1c2VTdGF0dXNPZkxhenlSZXN1bHRzLFxufSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvaG9va3MnXG5pbXBvcnQgeyB1c2VUaGVtZSB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJ1xuaW1wb3J0IExpbmVhclByb2dyZXNzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTGluZWFyUHJvZ3Jlc3MnXG5pbXBvcnQgVmlld0FnZW5kYUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9WaWV3QWdlbmRhJ1xuaW1wb3J0IFRhYmxlQ2hhcnRJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvVGFibGVDaGFydCdcbmltcG9ydCB7IEhlYWRlckNoZWNrYm94IH0gZnJvbSAnLi90YWJsZS1oZWFkZXInXG5pbXBvcnQgeyBEYXJrRGl2aWRlciB9IGZyb20gJy4uLy4uL2RhcmstZGl2aWRlci9kYXJrLWRpdmlkZXInXG5pbXBvcnQgeyBSZXN1bHRzQ29tbW9uQ29udHJvbHMgfSBmcm9tICcuL3RhYmxlJ1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi9zaW5nbGV0b25zL1R5cGVkVXNlcidcbmltcG9ydCB7IFZhcmlhYmxlU2l6ZUxpc3QgfSBmcm9tICdyZWFjdC13aW5kb3cnXG5pbXBvcnQgeyBNZW1vIH0gZnJvbSAnLi4vLi4vbWVtby9tZW1vJ1xuaW1wb3J0IHsgTGF5b3V0Q29udGV4dCB9IGZyb20gJy4uLy4uL2dvbGRlbi1sYXlvdXQvdmlzdWFsLXNldHRpbmdzLnByb3ZpZGVyJ1xuaW1wb3J0IHtcbiAgUkVTVUxUU19BVFRSSUJVVEVTX0xJU1QsXG4gIGdldERlZmF1bHRSZXN1bHRzU2hvd25MaXN0LFxufSBmcm9tICcuLi9zZXR0aW5ncy1oZWxwZXJzJ1xuXG50eXBlIFByb3BzID0ge1xuICBtb2RlOiBhbnlcbiAgc2V0TW9kZTogYW55XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59XG5cbmZ1bmN0aW9uIHNjcm9sbFRvSXRlbSh7XG4gIGxpc3RSZWYsXG4gIGluZGV4LFxuICBhbmltYXRpb25GcmFtZUlkLFxuICBjdXJyZW50U2Nyb2xsT2Zmc2V0LFxuICBsYXN0Q2hhbmdlZFRpbWUsXG59OiB7XG4gIGxpc3RSZWY6IFZhcmlhYmxlU2l6ZUxpc3RcbiAgaW5kZXg6IG51bWJlclxuICBhbmltYXRpb25GcmFtZUlkOiBSZWFjdC5NdXRhYmxlUmVmT2JqZWN0PG51bWJlciB8IG51bGw+XG4gIGN1cnJlbnRTY3JvbGxPZmZzZXQ6IFJlYWN0Lk11dGFibGVSZWZPYmplY3Q8bnVtYmVyIHwgbnVsbD5cbiAgbGFzdENoYW5nZWRUaW1lOiBSZWFjdC5NdXRhYmxlUmVmT2JqZWN0PG51bWJlciB8IG51bGw+XG59KSB7XG4gIGFuaW1hdGlvbkZyYW1lSWQuY3VycmVudCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGNvbnN0IHRpbWVTaW5jZUxhc3RDaGFuZ2UgPSBEYXRlLm5vdygpIC0gbGFzdENoYW5nZWRUaW1lLmN1cnJlbnQhXG4gICAgaWYgKHRpbWVTaW5jZUxhc3RDaGFuZ2UgPiAxMDAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKChsaXN0UmVmLnN0YXRlIGFzIGFueSkuc2Nyb2xsT2Zmc2V0ICE9PSBjdXJyZW50U2Nyb2xsT2Zmc2V0LmN1cnJlbnQpIHtcbiAgICAgIGxhc3RDaGFuZ2VkVGltZS5jdXJyZW50ID0gRGF0ZS5ub3coKVxuICAgICAgY3VycmVudFNjcm9sbE9mZnNldC5jdXJyZW50ID0gKGxpc3RSZWYuc3RhdGUgYXMgYW55KS5zY3JvbGxPZmZzZXRcbiAgICB9XG4gICAgaWYgKCEobGlzdFJlZi5zdGF0ZSBhcyBhbnkpLmlzU2Nyb2xsaW5nKSB7XG4gICAgICBsaXN0UmVmLnNjcm9sbFRvSXRlbShpbmRleCwgJ3NtYXJ0JylcbiAgICB9XG4gICAgc2Nyb2xsVG9JdGVtKHtcbiAgICAgIGxpc3RSZWYsXG4gICAgICBpbmRleCxcbiAgICAgIGFuaW1hdGlvbkZyYW1lSWQsXG4gICAgICBjdXJyZW50U2Nyb2xsT2Zmc2V0LFxuICAgICAgbGFzdENoYW5nZWRUaW1lLFxuICAgIH0pXG4gIH0pXG59XG5cbmZ1bmN0aW9uIHN0YXJ0U2Nyb2xsaW5nVG9JdGVtKHtcbiAgbGlzdFJlZixcbiAgaW5kZXgsXG4gIGFuaW1hdGlvbkZyYW1lSWQsXG4gIGN1cnJlbnRTY3JvbGxPZmZzZXQsXG4gIGxhc3RDaGFuZ2VkVGltZSxcbn06IHtcbiAgbGlzdFJlZjogVmFyaWFibGVTaXplTGlzdFxuICBpbmRleDogbnVtYmVyXG4gIGFuaW1hdGlvbkZyYW1lSWQ6IFJlYWN0Lk11dGFibGVSZWZPYmplY3Q8bnVtYmVyIHwgbnVsbD5cbiAgY3VycmVudFNjcm9sbE9mZnNldDogUmVhY3QuTXV0YWJsZVJlZk9iamVjdDxudW1iZXIgfCBudWxsPlxuICBsYXN0Q2hhbmdlZFRpbWU6IFJlYWN0Lk11dGFibGVSZWZPYmplY3Q8bnVtYmVyIHwgbnVsbD5cbn0pIHtcbiAgbGFzdENoYW5nZWRUaW1lLmN1cnJlbnQgPSBEYXRlLm5vdygpXG4gIGN1cnJlbnRTY3JvbGxPZmZzZXQuY3VycmVudCA9IChsaXN0UmVmLnN0YXRlIGFzIGFueSkuc2Nyb2xsT2Zmc2V0XG4gIGxpc3RSZWYuc2Nyb2xsVG9JdGVtKGluZGV4LCAnc21hcnQnKVxuICBzY3JvbGxUb0l0ZW0oe1xuICAgIGxpc3RSZWYsXG4gICAgaW5kZXgsXG4gICAgYW5pbWF0aW9uRnJhbWVJZCxcbiAgICBjdXJyZW50U2Nyb2xsT2Zmc2V0LFxuICAgIGxhc3RDaGFuZ2VkVGltZSxcbiAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHVzZVNjcm9sbFRvSXRlbU9uU2VsZWN0aW9uID0gKHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxufToge1xuICBzZWxlY3Rpb25JbnRlcmZhY2U6IFByb3BzWydzZWxlY3Rpb25JbnRlcmZhY2UnXVxufSkgPT4ge1xuICBjb25zdCBbbGFzdEludGVyYWN0aW9uLCBzZXRMYXN0SW50ZXJhY3Rpb25dID0gUmVhY3QudXNlU3RhdGU8bnVtYmVyIHwgbnVsbD4oXG4gICAgbnVsbFxuICApXG4gIGNvbnN0IGxpc3RSZWYgPSBSZWFjdC51c2VSZWY8VmFyaWFibGVTaXplTGlzdCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGxhenlSZXN1bHRzID0gdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlKHtcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIH0pXG4gIGNvbnN0IHNlbGVjdGVkUmVzdWx0cyA9IHVzZVNlbGVjdGVkUmVzdWx0cyh7IGxhenlSZXN1bHRzIH0pXG4gIGNvbnN0IGFuaW1hdGlvbkZyYW1lSWQgPSBSZWFjdC51c2VSZWY8bnVtYmVyIHwgbnVsbD4obnVsbClcbiAgY29uc3QgY3VycmVudFNjcm9sbE9mZnNldCA9IFJlYWN0LnVzZVJlZjxudW1iZXIgfCBudWxsPihudWxsKVxuICBjb25zdCBsYXN0Q2hhbmdlZFRpbWUgPSBSZWFjdC51c2VSZWY8bnVtYmVyIHwgbnVsbD4obnVsbClcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGFsbFJlc3VsdHMgPSBPYmplY3QudmFsdWVzKGxhenlSZXN1bHRzLnJlc3VsdHMpXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBPYmplY3QudmFsdWVzKHNlbGVjdGVkUmVzdWx0cylcbiAgICBpZiAoXG4gICAgICBsaXN0UmVmLmN1cnJlbnQgJiZcbiAgICAgIHNlbGVjdGVkLmxlbmd0aCA+PSAxICYmXG4gICAgICBEYXRlLm5vdygpIC0gKGxhc3RJbnRlcmFjdGlvbiB8fCAwKSA+IDUwMFxuICAgICkge1xuICAgICAgc3RhcnRTY3JvbGxpbmdUb0l0ZW0oe1xuICAgICAgICBsaXN0UmVmOiBsaXN0UmVmLmN1cnJlbnQsXG4gICAgICAgIGluZGV4OiBhbGxSZXN1bHRzLmluZGV4T2Yoc2VsZWN0ZWRbMF0pLFxuICAgICAgICBhbmltYXRpb25GcmFtZUlkLFxuICAgICAgICBjdXJyZW50U2Nyb2xsT2Zmc2V0LFxuICAgICAgICBsYXN0Q2hhbmdlZFRpbWUsXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW1hdGlvbkZyYW1lSWQuY3VycmVudCBhcyBudW1iZXIpXG4gICAgfVxuICB9LCBbc2VsZWN0ZWRSZXN1bHRzLCBsYXp5UmVzdWx0cywgbGFzdEludGVyYWN0aW9uXSlcbiAgcmV0dXJuIHsgbGlzdFJlZiwgc2V0TGFzdEludGVyYWN0aW9uIH1cbn1cblxuY29uc3QgUmVzdWx0Q2FyZHMgPSAoeyBtb2RlLCBzZXRNb2RlLCBzZWxlY3Rpb25JbnRlcmZhY2UgfTogUHJvcHMpID0+IHtcbiAgY29uc3QgeyBzZXRWYWx1ZSwgZ2V0VmFsdWUgfSA9IFJlYWN0LnVzZUNvbnRleHQoTGF5b3V0Q29udGV4dClcbiAgY29uc3QgbGF6eVJlc3VsdHMgPSB1c2VMYXp5UmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2Uoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgY29uc3QgcmVzdWx0cyA9IE9iamVjdC52YWx1ZXMobGF6eVJlc3VsdHMucmVzdWx0cylcbiAgY29uc3QgdGhlbWUgPSB1c2VUaGVtZSgpXG4gIGNvbnN0IHsgaXNTZWFyY2hpbmcsIHN0YXR1cyB9ID0gdXNlU3RhdHVzT2ZMYXp5UmVzdWx0cyh7IGxhenlSZXN1bHRzIH0pXG5cbiAgLyoqXG4gICAqIE5vdGUgdGhhdCB0aGlzIHNjZW5hcmlvIG9ubHkgcGxheXMgb3V0IHdoZW4gdGhlIGNvbXBvbmVudCBpcyBmaXJzdCBjcmVhdGVkLCBzbyBpZiB0aGlzIGlzIG9wZW4gYmVmb3JlIGEgc2VhcmNoIGlzIHJ1biBpdCB3aWxsIGFscmVhZHkgYmUgbW91bnRlZC5cbiAgICpcbiAgICogVGhpcyBpcyBzb2xlbHkgdG8ga2VlcCB0aGUgaWxsdXNpb24gb2YgcmVzcG9uc2l2ZW5lc3Mgd2hlbiBzd2l0Y2hpbmcgZnJvbSB0YWJsZSBtb2RlIHRvIGxpc3QgbW9kZSAob3IgZHJvcHBpbmcgYSBuZXcgcmVzdWx0IHZpc3VhbCBpbilcbiAgICovXG4gIGNvbnN0IFtpc01vdW50ZWQsIHNldElzTW91bnRlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCB7IGxpc3RSZWYsIHNldExhc3RJbnRlcmFjdGlvbiB9ID0gdXNlU2Nyb2xsVG9JdGVtT25TZWxlY3Rpb24oe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IG1vdW50ZWRUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRJc01vdW50ZWQodHJ1ZSlcbiAgICB9LCAxMDAwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQobW91bnRlZFRpbWVvdXQpXG4gICAgfVxuICB9LCBbXSlcbiAgcmV0dXJuIChcbiAgICA8R3JpZCBjb250YWluZXIgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiIGRpcmVjdGlvbj1cImNvbHVtblwiIHdyYXA9XCJub3dyYXBcIj5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsXCI+XG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB0LTIgcHgtMlwiXG4gICAgICAgICAgZGlyZWN0aW9uPVwicm93XCJcbiAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwicGwtNlwiPlxuICAgICAgICAgICAgPEhlYWRlckNoZWNrYm94XG4gICAgICAgICAgICAgIHNob3dUZXh0XG4gICAgICAgICAgICAgIGxhenlSZXN1bHRzPXtsYXp5UmVzdWx0c31cbiAgICAgICAgICAgICAgYnV0dG9uUHJvcHM9e3tcbiAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgbWluV2lkdGg6IDAsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgIDxSZXN1bHRzQ29tbW9uQ29udHJvbHNcbiAgICAgICAgICAgIGdldFN0YXJ0aW5nTGVmdD17KCkgPT5cbiAgICAgICAgICAgICAgZ2V0VmFsdWUoUkVTVUxUU19BVFRSSUJVVEVTX0xJU1QsIGdldERlZmF1bHRSZXN1bHRzU2hvd25MaXN0KCkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnZXRTdGFydGluZ1JpZ2h0PXsoKSA9PiB7XG4gICAgICAgICAgICAgIHJldHVybiBUeXBlZFVzZXJJbnN0YW5jZS5nZXRSZXN1bHRzQXR0cmlidXRlc1Bvc3NpYmxlTGlzdChcbiAgICAgICAgICAgICAgICBnZXRWYWx1ZShSRVNVTFRTX0FUVFJJQlVURVNfTElTVClcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uU2F2ZT17KGFjdGl2ZSkgPT4gc2V0VmFsdWUoUkVTVUxUU19BVFRSSUJVVEVTX0xJU1QsIGFjdGl2ZSl9XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInByLTJcIj5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgZGF0YS1pZD1cImxpc3QtYnV0dG9uXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldE1vZGUoJ2NhcmQnKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTpcbiAgICAgICAgICAgICAgICAgIG1vZGUgPT09ICdjYXJkJ1xuICAgICAgICAgICAgICAgICAgICA/IGAxcHggc29saWQgJHt0aGVtZS5wYWxldHRlLnByaW1hcnkubWFpbn1gXG4gICAgICAgICAgICAgICAgICAgIDogJzFweCBzb2xpZCB0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxWaWV3QWdlbmRhSWNvbiAvPlxuICAgICAgICAgICAgICBMaXN0XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgZGF0YS1pZD1cInRhYmxlLWJ1dHRvblwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRNb2RlKCd0YWJsZScpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOlxuICAgICAgICAgICAgICAgICAgbW9kZSA9PT0gJ3RhYmxlJ1xuICAgICAgICAgICAgICAgICAgICA/IGAxcHggc29saWQgJHt0aGVtZS5wYWxldHRlLnByaW1hcnkubWFpbn1gXG4gICAgICAgICAgICAgICAgICAgIDogJzFweCBzb2xpZCB0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxUYWJsZUNoYXJ0SWNvbiAvPlxuICAgICAgICAgICAgICBUYWJsZVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0dyaWQ+XG4gICAgICA8RGFya0RpdmlkZXIgY2xhc3NOYW1lPVwidy1mdWxsIGgtbWluIG15LTJcIiAvPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHAtMlwiPlxuICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhcGVyfSBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCI+XG4gICAgICAgICAge2lzTW91bnRlZCA/IChcbiAgICAgICAgICAgIDxNZW1vXG4gICAgICAgICAgICAgIGRlcGVuZGVuY2llcz17W1xuICAgICAgICAgICAgICAgIGxpc3RSZWYuY3VycmVudCxcbiAgICAgICAgICAgICAgICBsYXp5UmVzdWx0cy5yZXN1bHRzLFxuICAgICAgICAgICAgICAgIGlzU2VhcmNoaW5nLFxuICAgICAgICAgICAgICAgIHN0YXR1cyxcbiAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEF1dG9WYXJpYWJsZVNpemVMaXN0PExhenlRdWVyeVJlc3VsdCwgSFRNTERpdkVsZW1lbnQ+XG4gICAgICAgICAgICAgICAgY29udHJvbGxlZE1lYXN1cmluZz17dHJ1ZX1cbiAgICAgICAgICAgICAgICBpdGVtcz17cmVzdWx0c31cbiAgICAgICAgICAgICAgICBkZWZhdWx0U2l6ZT17NjB9XG4gICAgICAgICAgICAgICAgb3ZlcnNjYW5Db3VudD17MTB9XG4gICAgICAgICAgICAgICAgSXRlbT17KHsgaXRlbVJlZiwgaXRlbSwgbWVhc3VyZSwgaW5kZXgsIHdpZHRoIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgcmVmPXtpdGVtUmVmfSBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtpbmRleCAhPT0gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC1taW4gdy1mdWxsIE11aS1iZy1kaXZpZGVyXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgIDxSZXN1bHRJdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0cz17cmVzdWx0c31cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQ9e2l0ZW19XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e3NlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1lYXN1cmU9e21lYXN1cmV9XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleD17aW5kZXh9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17d2lkdGh9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICB7aW5kZXggPT09IHJlc3VsdHMubGVuZ3RoIC0gMSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC1taW4gdy1mdWxsIE11aS1iZy1kaXZpZGVyXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIEVtcHR5PXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnZhbHVlcyhzdGF0dXMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0yXCI+U2VhcmNoIGhhcyBub3QgeWV0IGJlZW4gcnVuLjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoaXNTZWFyY2hpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxMaW5lYXJQcm9ncmVzcyB2YXJpYW50PVwiaW5kZXRlcm1pbmF0ZVwiIC8+XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlc3VsdC1pdGVtLWNvbGxlY3Rpb24tZW1wdHkgcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgTm8gUmVzdWx0cyBGb3VuZFxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIG91dGVyRWxlbWVudFByb3BzPXt7XG4gICAgICAgICAgICAgICAgICBvbk1vdXNlRW50ZXI6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0TGFzdEludGVyYWN0aW9uKERhdGUubm93KCkpXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgb25Nb3VzZVVwOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldExhc3RJbnRlcmFjdGlvbihEYXRlLm5vdygpKVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIHZhcmlhYmxlU2l6ZUxpc3RSZWY9e2xpc3RSZWZ9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L01lbW8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxMaW5lYXJQcm9ncmVzcyB2YXJpYW50PVwiaW5kZXRlcm1pbmF0ZVwiIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9QYXBlcj5cbiAgICAgIDwvR3JpZD5cbiAgICA8L0dyaWQ+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoUmVzdWx0Q2FyZHMpXG4iXX0=