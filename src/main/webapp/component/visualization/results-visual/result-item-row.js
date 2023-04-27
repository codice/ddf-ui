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
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { CellComponent } from './table-header';
import { useRerenderOnBackboneSync, useSelectionOfLazyResult, } from '../../../js/model/LazyQueryResult/hooks';
import metacardDefinitions from '../../singletons/metacard-definitions';
import user from '../../singletons/user-instance';
import TypedMetacardDefs from '../../tabs/metacard/metacardDefinitions';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { SelectionBackground } from './result-item';
import { useBackbone } from '../../selection-checkbox/useBackbone.hook';
import { TypedUserInstance } from '../../singletons/TypedUser';
import useCoordinateFormat from '../../tabs/metacard/useCoordinateFormat';
import Common from '../../../js/Common';
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
            }, className: "h-full children-block children-h-full" }, isSelected ? React.createElement(CheckBoxIcon, null) : React.createElement(CheckBoxOutlineBlankIcon, null))));
};
var RowComponent = function (_a) {
    var lazyResult = _a.lazyResult, measure = _a.measure, index = _a.index, results = _a.results, headerColWidth = _a.headerColWidth;
    var thumbnail = lazyResult.plain.metacard.properties.thumbnail;
    var _b = __read(React.useState(TypedUserInstance.getResultsAttributesShownTable()), 2), shownAttributes = _b[0], setShownAttributes = _b[1];
    var isLast = index === results.length - 1;
    var listenTo = useBackbone().listenTo;
    var convertToFormat = useCoordinateFormat();
    useRerenderOnBackboneSync({ lazyResult: lazyResult });
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:results-attributesShownTable', function () {
            setShownAttributes(TypedUserInstance.getResultsAttributesShownTable());
        });
    }, []);
    var imgsrc = Common.getImageSrc(thumbnail);
    React.useEffect(function () {
        measure();
    }, [shownAttributes, convertToFormat]);
    var getDisplayValue = function (value, property) {
        if (value && metacardDefinitions.metacardTypes[property]) {
            switch (metacardDefinitions.metacardTypes[property].type) {
                case 'GEOMETRY':
                    return convertToFormat(value);
            }
        }
        return value;
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "bg-inherit flex items-strech flex-nowrap", style: {
                width: shownAttributes.length * 200 + 'px'
            } },
            React.createElement("div", { className: "sticky left-0 w-auto z-10 bg-inherit Mui-border-divider border ".concat(isLast ? '' : 'border-b-0', " border-l-0 ").concat(index === 0 ? 'border-t-0' : '') },
                React.createElement(SelectionBackground, { lazyResult: lazyResult }),
                React.createElement(CheckboxCell, { lazyResult: lazyResult })),
            React.createElement("div", { className: "relative Mui-border-divider border border-b-0 border-r-0 border-l-0 ".concat(index === 0 ? 'border-t-0' : '') },
                React.createElement(SelectionBackground, { lazyResult: lazyResult, style: { width: shownAttributes.length * 200 + 'px' } }),
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
                    }, disableFocusRipple: true, disableRipple: true, disableTouchRipple: true, className: "outline-none rounded-none select-text p-0 text-left break-words h-full children-h-full" },
                    React.createElement("div", { className: "w-full h-full" },
                        React.createElement(Grid, { container: true, direction: "row", className: "h-full", wrap: "nowrap" }, shownAttributes.map(function (property) {
                            var value = lazyResult.plain.metacard.properties[property];
                            if (value === undefined) {
                                value = '';
                            }
                            if (value.constructor !== Array) {
                                value = [value];
                            }
                            if (value && metacardDefinitions.metacardTypes[property]) {
                                switch (metacardDefinitions.metacardTypes[property].type) {
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
                                        minWidth: '200px'
                                    } }, property === 'thumbnail' && thumbnail ? (React.createElement("img", { "data-id": "thumbnail-value", src: imgsrc, style: {
                                        maxWidth: '100%',
                                        maxHeight: '100%'
                                    }, onLoad: function () {
                                        measure();
                                    }, onError: function () {
                                        measure();
                                    } })) : (React.createElement(React.Fragment, null,
                                    React.createElement("div", { "data-id": "".concat(property, "-value"), style: { wordBreak: 'break-word' } }, value.map(function (curValue, index) {
                                        return (React.createElement("span", { key: index, "data-value": "".concat(curValue) }, curValue.toString().startsWith('http') ? (React.createElement("a", { href: "".concat(curValue), target: "_blank", rel: "noopener noreferrer" }, TypedMetacardDefs.getAlias({
                                            attr: property
                                        }))) : ("".concat(value.length > 1 &&
                                            index < value.length - 1
                                            ? curValue + ', '
                                            : getDisplayValue(curValue, property)))));
                                    })))))));
                        }))))))));
};
export default hot(module)(RowComponent);
//# sourceMappingURL=result-item-row.js.map