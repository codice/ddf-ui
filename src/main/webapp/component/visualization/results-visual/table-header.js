import { __assign, __read, __rest, __spreadArray } from "tslib";
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
import { hot } from 'react-hot-loader';
import _ from 'underscore';
import user from '../../singletons/user-instance';
import Button from '@mui/material/Button';
import { useSelectionOfLazyResults } from '../../../js/model/LazyQueryResult/hooks';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { TypedUserInstance } from '../../singletons/TypedUser';
import { useBackbone } from '../../selection-checkbox/useBackbone.hook';
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks';
export var CellComponent = React.forwardRef(function (props, ref) {
    var style = props.style, className = props.className, otherProps = __rest(props, ["style", "className"]);
    return (React.createElement("div", __assign({}, otherProps, { className: "inline-block ".concat(className, " p-2 overflow-auto whitespace-normal break-all "), style: __assign({ width: '200px', maxHeight: '200px' }, style), ref: ref })));
});
var updateSort = function (attribute) {
    var prefs = user.get('user').get('preferences');
    var prefResultSort = prefs.get('resultSort');
    var currSort = prefResultSort && prefResultSort.length
        ? prefResultSort.find(function (sort) { return sort.attribute === attribute; })
        : undefined;
    var sort = [
        {
            attribute: attribute,
            direction: 'ascending',
        },
    ];
    if (currSort) {
        sort[0].direction =
            currSort.direction === 'ascending' ? 'descending' : 'ascending';
    }
    prefs.set('resultSort', sort);
    prefs.savePreferences();
};
var getSortDirectionClass = function (attribute) {
    var sorts = user.get('user').get('preferences').get('resultSort');
    var matchedSort = sorts && sorts.find(function (sort) { return sort.attribute === attribute; });
    if (matchedSort && matchedSort.direction) {
        if (matchedSort.direction === 'ascending') {
            return 'fa fa-sort-asc';
        }
        else if (matchedSort.direction === 'descending') {
            return 'fa fa-sort-desc';
        }
        else {
            return '';
        }
    }
    else {
        return '';
    }
};
export var HeaderCheckbox = function (_a) {
    var _b = _a.showText, showText = _b === void 0 ? false : _b, lazyResults = _a.lazyResults, buttonProps = _a.buttonProps;
    var selection = useSelectionOfLazyResults({
        lazyResults: Object.values(lazyResults.results),
    });
    return (React.createElement(Button, __assign({ "data-id": "select-all-checkbox", color: "primary", onClick: function (event) {
            event.stopPropagation();
            if (selection === 'selected') {
                Object.values(lazyResults.results).forEach(function (lazyResult) {
                    lazyResult.setSelected(false);
                });
            }
            else {
                Object.values(lazyResults.results).forEach(function (lazyResult) {
                    lazyResult.setSelected(true);
                });
            }
        } }, buttonProps), (function () {
        switch (selection) {
            case 'partially':
                return (React.createElement(React.Fragment, null,
                    React.createElement(IndeterminateCheckBoxIcon, { className: "Mui-text-text-primary" }),
                    showText ? React.createElement("div", { className: "pl-2" }, "Select All") : null));
            case 'selected':
                return (React.createElement(React.Fragment, null,
                    React.createElement(CheckBoxIcon, { className: "Mui-text-text-primary" }),
                    showText ? React.createElement("div", { className: "pl-2" }, "Deselect All") : null));
            case 'unselected':
                return (React.createElement(React.Fragment, null,
                    React.createElement("div", { className: "Mui-text-text-primary" },
                        React.createElement(CheckBoxOutlineBlankIcon, null)),
                    showText ? React.createElement("div", { className: "pl-2" }, "Select All") : null));
        }
    })()));
};
export var Header = function (_a) {
    var lazyResults = _a.lazyResults, setHeaderColWidth = _a.setHeaderColWidth, headerColWidth = _a.headerColWidth, actionWidth = _a.actionWidth, addOnWidth = _a.addOnWidth;
    var MetacardDefinitions = useMetacardDefinitions();
    var handleSortClick = _.debounce(updateSort, 500, true);
    var _b = __read(React.useState(TypedUserInstance.getResultsAttributesShownTable()), 2), shownAttributes = _b[0], setShownAttributes = _b[1];
    var listenTo = useBackbone().listenTo;
    var _c = __read(React.useState(null), 2), activeIndex = _c[0], setActiveIndex = _c[1];
    var columnRefs = React.useRef(shownAttributes.map(function () { return React.createRef(); }));
    var prefs = user.get('user').get('preferences');
    var mouseDown = function (index) {
        setActiveIndex(index);
    };
    var mouseMove = React.useCallback(function (e) {
        var columnsWidth = new Map(__spreadArray([], __read(headerColWidth), false));
        if (headerColWidth.size === 0) {
            shownAttributes.map(function (col) {
                columnsWidth.set(col, '200px');
            });
        }
        shownAttributes.map(function (col, i) {
            if (i === activeIndex) {
                var currRef = columnRefs.current[i].current;
                var offset = currRef === null || currRef === void 0 ? void 0 : currRef.getBoundingClientRect().x;
                if (offset) {
                    var width = e.clientX - offset;
                    if (currRef) {
                        currRef.style.width = "".concat(width, "px");
                        columnsWidth.set(col, "".concat(width, "px"));
                    }
                }
            }
        });
        setHeaderColWidth(columnsWidth);
        prefs.set('columnWidths', columnsWidth);
        prefs.savePreferences();
    }, [activeIndex, shownAttributes]);
    var resetColumnWidth = function (col) {
        var columnsWidth = new Map(__spreadArray([], __read(headerColWidth), false));
        columnsWidth.set(col, '200px');
        setHeaderColWidth(columnsWidth);
        prefs.set('columnWidths', columnsWidth);
        prefs.savePreferences();
    };
    var removeListeners = React.useCallback(function () {
        window.removeEventListener('mousemove', mouseMove);
        window.removeEventListener('mouseup', removeListeners);
    }, [mouseMove]);
    var mouseUp = React.useCallback(function () {
        setActiveIndex(null);
        removeListeners();
    }, [setActiveIndex, removeListeners]);
    React.useEffect(function () {
        if (activeIndex !== null) {
            window.addEventListener('mousemove', mouseMove);
            window.addEventListener('mouseup', mouseUp);
        }
        return function () {
            removeListeners();
        };
    }, [activeIndex, mouseMove, mouseUp, removeListeners]);
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:results-attributesShownTable', function () {
            setShownAttributes(TypedUserInstance.getResultsAttributesShownTable());
            columnRefs.current =
                TypedUserInstance.getResultsAttributesShownTable().map(function () {
                    return React.createRef();
                });
        });
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { "data-id": "table-container", className: "bg-inherit whitespace-nowrap flex items-strech flex-nowrap", style: {
                width: shownAttributes.length * 200 + 'px',
                display: 'grid',
                gridTemplateColumns: "repeat(".concat(shownAttributes.length + 4, ", 1fr)"),
            } },
            React.createElement("div", { key: "resultItemAction", className: "bg-inherit Mui-border-divider border border-t-0 border-l-0 border-b-0" },
                React.createElement("div", { style: {
                        width: actionWidth,
                    } })),
            React.createElement("div", { className: "sticky left-0 w-auto z-10 bg-inherit Mui-border-divider border border-t-0 border-l-0 border-b-0" },
                React.createElement(CellComponent, { className: "bg-inherit", style: { width: 'auto', paddingLeft: '0px', paddingRight: '0px' } },
                    React.createElement(HeaderCheckbox, { lazyResults: lazyResults }))),
            React.createElement("div", { key: "resultItemAddOn", className: "bg-inherit Mui-border-divider border border-t-0 border-l-0 border-b-0" },
                React.createElement("div", { style: {
                        width: addOnWidth,
                    } })),
            shownAttributes.map(function (attr, index) {
                var label = MetacardDefinitions.getAlias(attr);
                var sortable = true;
                return (React.createElement("div", { key: attr, style: {
                        display: 'flex',
                        width: "".concat(headerColWidth.get(attr)),
                        minWidth: '200px',
                    }, ref: columnRefs.current[index] },
                    React.createElement(CellComponent, { className: "".concat(sortable ? 'is-sortable' : '', " Mui-border-divider border border-t-0 border-l-0 border-b-0"), "data-propertyid": "".concat(attr), "data-propertytext": "".concat(label ? "".concat(label) : "".concat(attr)), style: {
                            width: '100%',
                            minWidth: '200px',
                            display: 'flex',
                            padding: 0,
                        } },
                        React.createElement(Button, { disabled: !sortable, className: "w-full outline-none is-bold h-full", onClick: function () { return handleSortClick(attr); }, style: { width: '100%', marginRight: '5px' } },
                            React.createElement("div", { className: "w-full text-left" },
                                React.createElement("span", { className: "column-text is-bold", title: "".concat(label ? "".concat(label) : "".concat(attr)) }, "".concat(label ? "".concat(label) : "".concat(attr))),
                                React.createElement("span", { className: getSortDirectionClass(attr), style: { paddingLeft: '3px' } }))),
                        React.createElement("div", { style: { width: '10px', cursor: 'col-resize' }, className: "hover:border-solid", onDoubleClick: function () {
                                resetColumnWidth(attr);
                                var currRef = columnRefs.current[index].current;
                                if (currRef) {
                                    currRef.style.width = '200px';
                                }
                            }, onMouseDown: function () {
                                mouseDown(index);
                            } }))));
            }),
            React.createElement(CellComponent, { style: { width: '8px' } }),
            ' ')));
};
export default hot(module)(Header);
//# sourceMappingURL=table-header.js.map