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
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { CellComponent } from './table-header';
import { useRerenderOnBackboneSync, useSelectionOfLazyResult, } from '../../../js/model/LazyQueryResult/hooks';
import user from '../../singletons/user-instance';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { SelectionBackground } from './result-item';
import { useBackbone } from '../../selection-checkbox/useBackbone.hook';
import { TypedUserInstance } from '../../singletons/TypedUser';
import useCoordinateFormat from '../../tabs/metacard/useCoordinateFormat';
import Common from '../../../js/Common';
import Extensions from '../../../extension-points';
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks';
import wreqr from '../../../js/wreqr';
export function clearSelection() {
    if (window.getSelection) {
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        window.getSelection().removeAllRanges();
    }
    else if (document.selection) {
        ;
        document.selection.empty();
    }
}
export function hasSelection() {
    if (window.getSelection) {
        // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
        return window.getSelection().toString() !== '';
    }
    else if (document.selection) {
        return document.selection.toString() !== '';
    }
    else {
        return false;
    }
}
var CheckboxCell = function (_a) {
    var lazyResult = _a.lazyResult;
    var isSelected = useSelectionOfLazyResult({ lazyResult: lazyResult });
    return (React.createElement(CellComponent, { className: "h-full", style: { width: 'auto', padding: '0px' } },
        React.createElement(Button, { "data-id": "select-checkbox", onClick: function (event) {
                event.stopPropagation();
                if (event.shiftKey) {
                    lazyResult.shiftSelect();
                }
                else {
                    lazyResult.controlSelect();
                }
            }, className: "h-full" }, isSelected ? React.createElement(CheckBoxIcon, null) : React.createElement(CheckBoxOutlineBlankIcon, null))));
};
var RowComponent = function (_a) {
    var lazyResult = _a.lazyResult, originalMeasure = _a.measure, index = _a.index, results = _a.results, selectionInterface = _a.selectionInterface, headerColWidth = _a.headerColWidth, actionWidth = _a.actionWidth, setMaxActionWidth = _a.setMaxActionWidth, addOnWidth = _a.addOnWidth, setMaxAddOnWidth = _a.setMaxAddOnWidth;
    var MetacardDefinitions = useMetacardDefinitions();
    var thumbnail = lazyResult.plain.metacard.properties.thumbnail;
    var _b = __read(React.useState(TypedUserInstance.getDecimalPrecision()), 2), decimalPrecision = _b[0], setDecimalPrecision = _b[1];
    var _c = __read(React.useState(TypedUserInstance.getResultsAttributesShownTable()), 2), shownAttributes = _c[0], setShownAttributes = _c[1];
    var isLast = index === results.length - 1;
    var listenTo = useBackbone().listenTo;
    var convertToFormat = useCoordinateFormat();
    var convertToPrecision = function (value) {
        return value && decimalPrecision
            ? Number(value).toFixed(decimalPrecision)
            : value;
    };
    useRerenderOnBackboneSync({ lazyResult: lazyResult });
    var actionRef = React.useRef(null);
    var addOnRef = React.useRef(null);
    React.useEffect(function () {
        var _a, _b;
        var actionWidth = ((_a = actionRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect().width) || 0;
        setMaxActionWidth(actionWidth);
        var addOnWidth = ((_b = addOnRef.current) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect().width) || 0;
        setMaxAddOnWidth(addOnWidth);
    });
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:results-attributesShownTable', function () {
            setShownAttributes(TypedUserInstance.getResultsAttributesShownTable());
        });
        listenTo(user.get('user').get('preferences'), 'change:decimalPrecision', function () {
            setDecimalPrecision(TypedUserInstance.getDecimalPrecision());
        });
    }, []);
    var imgsrc = Common.getImageSrc(thumbnail);
    var measure = function () {
        var _a, _b;
        if (((_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.clientHeight) &&
            ((_b = containerRef.current) === null || _b === void 0 ? void 0 : _b.clientHeight) > 0) {
            originalMeasure();
        }
    };
    React.useEffect(function () {
        measure();
    }, [shownAttributes, convertToFormat]);
    var getDisplayValue = function (value, property) {
        if (value && MetacardDefinitions.getAttributeMap()[property]) {
            switch (MetacardDefinitions.getAttributeMap()[property].type) {
                case 'GEOMETRY':
                    return convertToFormat(value);
                case 'LONG':
                case 'DOUBLE':
                case 'FLOAT':
                    return convertToPrecision(value);
            }
        }
        return value;
    };
    listenTo(wreqr.vent, 'activeContentItemChanged', function () {
        measure();
    });
    var containerRef = React.useRef(null);
    var ResultItemActionInstance = Extensions.resultItemAction({
        lazyResult: lazyResult,
        selectionInterface: selectionInterface,
        itemContentRef: containerRef,
    });
    var ResultItemAddOnInstance = Extensions.resultItemRowAddOn({
        lazyResult: lazyResult,
        isTableView: true,
    });
    return (React.createElement("div", { ref: containerRef },
        React.createElement("div", { className: "bg-inherit flex items-strech flex-nowrap", style: {
                width: actionWidth + addOnWidth + shownAttributes.length * 200 + 'px',
            } },
            React.createElement("div", { key: "resultItemAction", className: "bg-inherit Mui-border-divider border ".concat(isLast ? '' : 'border-b-0', " border-l-0 ").concat(index === 0 ? 'border-t-0' : '') }, ResultItemActionInstance ? (React.createElement(CellComponent, { key: "resultItemAction", className: "h-full", style: {
                    width: 'auto',
                    padding: 0,
                }, ref: actionRef },
                React.createElement(ResultItemActionInstance, null))) : (React.createElement("div", { style: { width: actionWidth } }))),
            React.createElement("div", { className: "sticky left-0 w-auto z-10 bg-inherit Mui-border-divider border ".concat(isLast ? '' : 'border-b-0', " border-l-0 ").concat(index === 0 ? 'border-t-0' : '') },
                React.createElement(SelectionBackground, { lazyResult: lazyResult }),
                React.createElement(CheckboxCell, { lazyResult: lazyResult })),
            React.createElement("div", { className: "relative Mui-border-divider border border-b-0 border-r-0 border-l-0 ".concat(index === 0 ? 'border-t-0' : '') },
                React.createElement(SelectionBackground, { lazyResult: lazyResult, style: { width: addOnWidth + shownAttributes.length * 200 + 'px' } }),
                React.createElement(Button, { "data-id": "result-item-row-container-button", onMouseDown: function (event) {
                        /**
                         * Shift key can cause selections since we set the class to allow text selection,
                         * so the only scenario we want to prevent that in is when shift clicking
                         */
                        if (event.shiftKey) {
                            clearSelection();
                        }
                    }, onClick: function (event) {
                        if (hasSelection()) {
                            return;
                        }
                        if (event.shiftKey) {
                            lazyResult.shiftSelect();
                        }
                        else if (event.ctrlKey || event.metaKey) {
                            lazyResult.controlSelect();
                        }
                        else {
                            lazyResult.select();
                        }
                    }, disableFocusRipple: true, disableRipple: true, disableTouchRipple: true, className: "outline-none rounded-none select-text p-0 text-left break-words h-full" },
                    React.createElement("div", { className: "w-full h-full" },
                        React.createElement(Grid, { container: true, direction: "row", className: "h-full", wrap: "nowrap" },
                            React.createElement("div", { key: "resultItemAddOn", className: "Mui-border-divider border border-t-0 border-l-0 ".concat(isLast ? '' : 'border-b-0', " h-full") },
                                React.createElement("div", { style: { width: addOnWidth } }, ResultItemAddOnInstance && (React.createElement(CellComponent, { key: "resultItemAddOn", style: {
                                        width: 'auto',
                                    }, className: "pt-3", ref: addOnRef }, ResultItemAddOnInstance)))),
                            shownAttributes.map(function (property) {
                                var value = lazyResult.plain.metacard.properties[property];
                                if (value === undefined) {
                                    value = '';
                                }
                                if (value.constructor !== Array) {
                                    value = [value];
                                }
                                if (value &&
                                    MetacardDefinitions.getAttributeMap()[property]) {
                                    switch (MetacardDefinitions.getAttributeMap()[property].type) {
                                        case 'DATE':
                                            value = value.map(function (val) {
                                                return val !== undefined && val !== ''
                                                    ? user.getUserReadableDateTime(val)
                                                    : '';
                                            });
                                            break;
                                        default:
                                            break;
                                    }
                                }
                                return (React.createElement("div", { key: property },
                                    React.createElement(CellComponent, { key: property, "data-property": "".concat(property), className: "Mui-border-divider border border-t-0 border-l-0 ".concat(isLast ? '' : 'border-b-0', " h-full"), "data-value": "".concat(value), style: {
                                            width: "".concat(headerColWidth.get(property)),
                                            minWidth: '200px',
                                        } }, property === 'thumbnail' && thumbnail ? (React.createElement("img", { "data-id": "thumbnail-value", src: imgsrc, style: {
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                        }, onLoad: function () {
                                            measure();
                                        }, onError: function () {
                                            measure();
                                        } })) : (React.createElement(React.Fragment, null,
                                        React.createElement("div", { "data-id": "".concat(property, "-value"), style: { wordBreak: 'break-word' } }, value.map(function (curValue, index) {
                                            return (React.createElement("span", { key: index, "data-value": "".concat(curValue) }, curValue.toString().startsWith('http') ? (React.createElement("a", { href: "".concat(curValue), target: "_blank", rel: "noopener noreferrer" }, MetacardDefinitions.getAlias(property))) : ("".concat(value.length > 1 &&
                                                index < value.length - 1
                                                ? getDisplayValue(curValue, property) + ', '
                                                : getDisplayValue(curValue, property)))));
                                        })))))));
                            }))))))));
};
export default hot(module)(RowComponent);
//# sourceMappingURL=result-item-row.js.map