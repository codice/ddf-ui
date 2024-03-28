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
import Button from '@mui/material/Button';
import user from '../../singletons/user-instance';
import { hot } from 'react-hot-loader';
import { AutoVariableSizeList } from 'react-window-components';
import Grid from '@mui/material/Grid';
import { Header } from './table-header';
import ResultItemRow from './result-item-row';
import Paper from '@mui/material/Paper';
import { Elevations } from '../../theme/theme';
import Divider from '@mui/material/Divider';
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks';
import { useStatusOfLazyResults } from '../../../js/model/LazyQueryResult/hooks';
import LinearProgress from '@mui/material/LinearProgress';
import { DarkDivider } from '../../dark-divider/dark-divider';
import { useTheme } from '@mui/material/styles';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import TableChartIcon from '@mui/icons-material/TableChart';
import TransferList from '../../tabs/metacard/transfer-list';
import { useDialog } from '../../dialog';
import { TypedUserInstance } from '../../singletons/TypedUser';
import useTimePrefs from '../../fields/useTimePrefs';
import { useScrollToItemOnSelection } from './result-item.collection';
import { Memo } from '../../memo/memo';
export var ResultsCommonControls = function (_a) {
    var getStartingLeft = _a.getStartingLeft, getStartingRight = _a.getStartingRight, onSave = _a.onSave;
    var dialogContext = useDialog();
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { item: true, className: "ml-auto pr-8 " },
            React.createElement(Button, { "data-id": "manage-attributes-button", onClick: function () {
                    dialogContext.setProps({
                        PaperProps: {
                            style: {
                                minWidth: 'none',
                            },
                            elevation: Elevations.panels,
                        },
                        open: true,
                        disableEnforceFocus: true,
                        children: (React.createElement("div", { style: {
                                minHeight: '60vh',
                            } },
                            React.createElement(TransferList, { startingLeft: getStartingLeft(), startingRight: getStartingRight(), onSave: function (active) {
                                    onSave(active);
                                } }))),
                    });
                }, color: "primary" }, "Manage Attributes"))));
};
var TableVisual = function (_a) {
    var selectionInterface = _a.selectionInterface, mode = _a.mode, setMode = _a.setMode;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var results = Object.values(lazyResults.results);
    var theme = useTheme();
    var _b = useStatusOfLazyResults({ lazyResults: lazyResults }), isSearching = _b.isSearching, status = _b.status;
    useTimePrefs();
    var headerRef = React.useRef(null);
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
    var prefs = user.get('user').get('preferences');
    var columnsWidth = new Map(prefs.get('columnWidths'));
    var _e = __read(React.useState(columnsWidth), 2), headerColWidth = _e[0], setHeaderColWidth = _e[1];
    var setWidth = function (width) {
        setHeaderColWidth(width);
    };
    var _f = __read(React.useState(0), 2), maxActionWidth = _f[0], setMaxActionWidth = _f[1];
    var _g = __read(React.useState(0), 2), maxAddOnWidth = _g[0], setMaxAddOnWidth = _g[1];
    return (React.createElement(Grid, { container: true, className: "w-full h-full bg-inherit", direction: "column", wrap: "nowrap" },
        React.createElement(Grid, { item: true },
            React.createElement(Grid, { container: true, className: "w-full pt-2 px-2", direction: "row", alignItems: "center" },
                React.createElement(ResultsCommonControls, { getStartingLeft: function () {
                        return TypedUserInstance.getResultsAttributesShownTable();
                    }, getStartingRight: function () {
                        return TypedUserInstance.getResultsAttributesPossibleTable();
                    }, onSave: function (active) {
                        user
                            .get('user')
                            .get('preferences')
                            .set('results-attributesShownTable', active);
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
        React.createElement(Grid, { item: true, className: "overflow-hidden bg-inherit w-full h-full p-2" },
            React.createElement(Paper, { elevation: Elevations.paper, className: "w-full h-full" }, isMounted ? (React.createElement(Grid, { container: true, className: "w-full h-full bg-inherit", direction: "column", wrap: "nowrap" },
                React.createElement(Grid, { item: true, className: "bg-inherit" },
                    React.createElement("div", { className: "w-auto overflow-auto scrollbars-hide bg-inherit", ref: headerRef },
                        React.createElement(Header, { lazyResults: lazyResults, setHeaderColWidth: setWidth, headerColWidth: headerColWidth, actionWidth: maxActionWidth, addOnWidth: maxAddOnWidth }))),
                React.createElement(Grid, { item: true },
                    React.createElement(Divider, { className: "w-full h-min" })),
                React.createElement(Grid, { item: true, className: "w-full h-full overflow-hidden bg-inherit" },
                    React.createElement(Memo, { dependencies: [
                            listRef.current,
                            lazyResults.results,
                            isSearching,
                            status,
                            maxAddOnWidth,
                        ] },
                        React.createElement(AutoVariableSizeList, { outerElementProps: {
                                onScroll: function (e) {
                                    if (headerRef.current) {
                                        headerRef.current.scrollLeft = e.target.scrollLeft;
                                    }
                                },
                                onMouseEnter: function () {
                                    setLastInteraction(Date.now());
                                },
                                onMouseUp: function () {
                                    setLastInteraction(Date.now());
                                },
                            }, defaultSize: 76, overscanCount: 10, controlledMeasuring: true, items: results, Item: function (_a) {
                                var itemRef = _a.itemRef, item = _a.item, measure = _a.measure, index = _a.index;
                                return (React.createElement("div", { ref: itemRef, className: "bg-inherit" },
                                    React.createElement(ResultItemRow, { lazyResult: item, measure: measure, index: index, results: results, selectionInterface: selectionInterface, headerColWidth: headerColWidth, actionWidth: maxActionWidth, setMaxActionWidth: function (width) {
                                            return setMaxActionWidth(function (maxWidth) {
                                                return Math.max(width, maxWidth);
                                            });
                                        }, addOnWidth: maxAddOnWidth, setMaxAddOnWidth: function (width) {
                                            return setMaxAddOnWidth(function (maxWidth) {
                                                return Math.max(width, maxWidth);
                                            });
                                        } })));
                            }, Empty: function () {
                                if (Object.values(status).length === 0) {
                                    return (React.createElement("div", { className: "p-2" }, "Search has not yet been run."));
                                }
                                if (isSearching) {
                                    return React.createElement(LinearProgress, { variant: "indeterminate" });
                                }
                                return (React.createElement("div", { className: "result-item-collection-empty p-2" }, "No Results Found"));
                            }, variableSizeListRef: listRef }))))) : (React.createElement(LinearProgress, { variant: "indeterminate" }))))));
};
export default hot(module)(TableVisual);
//# sourceMappingURL=table.js.map