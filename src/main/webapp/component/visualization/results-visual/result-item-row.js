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
import { LayoutContext } from '../../golden-layout/visual-settings.provider';
import { RESULTS_ATTRIBUTES_TABLE, getDefaultResultsShownTable, } from '../settings-helpers';
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
    var _b = React.useContext(LayoutContext), getValue = _b.getValue, onStateChanged = _b.onStateChanged;
    var MetacardDefinitions = useMetacardDefinitions();
    var thumbnail = lazyResult.plain.metacard.properties.thumbnail;
    var _c = __read(React.useState(TypedUserInstance.getDecimalPrecision()), 2), decimalPrecision = _c[0], setDecimalPrecision = _c[1];
    var _d = __read(React.useState(getValue(RESULTS_ATTRIBUTES_TABLE, getDefaultResultsShownTable())), 2), shownAttributes = _d[0], setShownAttributes = _d[1];
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
        listenTo(user.get('user').get('preferences'), 'change:decimalPrecision', function () {
            setDecimalPrecision(TypedUserInstance.getDecimalPrecision());
        });
        onStateChanged(function () {
            var shownList = getValue(RESULTS_ATTRIBUTES_TABLE, getDefaultResultsShownTable());
            setShownAttributes(shownList);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LWl0ZW0tcm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL3Jlc3VsdHMtdmlzdWFsL3Jlc3VsdC1pdGVtLXJvdy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRTlDLE9BQU8sRUFDTCx5QkFBeUIsRUFDekIsd0JBQXdCLEdBQ3pCLE1BQU0seUNBQXlDLENBQUE7QUFDaEQsT0FBTyxJQUFJLE1BQU0sZ0NBQWdDLENBQUE7QUFDakQsT0FBTyx3QkFBd0IsTUFBTSwwQ0FBMEMsQ0FBQTtBQUMvRSxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQTtBQUN2RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxlQUFlLENBQUE7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJDQUEyQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFBO0FBQzlELE9BQU8sbUJBQW1CLE1BQU0seUNBQXlDLENBQUE7QUFDekUsT0FBTyxNQUFNLE1BQU0sb0JBQW9CLENBQUE7QUFDdkMsT0FBTyxVQUFVLE1BQU0sMkJBQTJCLENBQUE7QUFDbEQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0RBQXNELENBQUE7QUFDN0YsT0FBTyxLQUFLLE1BQU0sbUJBQW1CLENBQUE7QUFDckMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFN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Q3RDLE9BQU8sQ0FDTCw4QkFBTSxHQUFHLEVBQUUsS0FBSyxnQkFBYyxVQUFHLFFBQVEsQ0FBRSxJQUN4QyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUN4QywyQkFDRSxJQUFJLEVBQUUsVUFBRyxRQUFRLENBQUUsRUFDbkIsTUFBTSxFQUFDLFFBQVEsRUFDZixHQUFHLEVBQUMscUJBQXFCLElBRXhCLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FDckMsQ0FDTCxDQUFDLENBQUMsQ0FBQyxDQUNGLFVBQ0UsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO2dEQUNoQixLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDO2dEQUN0QixDQUFDLENBQUMsZUFBZSxDQUNiLFFBQVEsRUFDUixRQUFRLENBQ1QsR0FBRyxJQUFJO2dEQUNWLENBQUMsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUN2QyxDQUNILENBQ0ksQ0FDUixDQUFBO3dDQUNILENBQUMsQ0FBQyxDQUNFLENBQ1MsQ0FDbEIsQ0FDYSxDQUNaLENBQ1AsQ0FBQTs0QkFDSCxDQUFDLENBQUMsQ0FDRyxDQUNILENBQ0MsQ0FDTCxDQUNGLENBQ0YsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgeyBDZWxsQ29tcG9uZW50IH0gZnJvbSAnLi90YWJsZS1oZWFkZXInXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHtcbiAgdXNlUmVyZW5kZXJPbkJhY2tib25lU3luYyxcbiAgdXNlU2VsZWN0aW9uT2ZMYXp5UmVzdWx0LFxufSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvaG9va3MnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgQ2hlY2tCb3hPdXRsaW5lQmxhbmtJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2hlY2tCb3hPdXRsaW5lQmxhbmsnXG5pbXBvcnQgQ2hlY2tCb3hJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2hlY2tCb3gnXG5pbXBvcnQgeyBTZWxlY3Rpb25CYWNrZ3JvdW5kIH0gZnJvbSAnLi9yZXN1bHQtaXRlbSdcbmltcG9ydCB7IHVzZUJhY2tib25lIH0gZnJvbSAnLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyBUeXBlZFVzZXJJbnN0YW5jZSB9IGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvVHlwZWRVc2VyJ1xuaW1wb3J0IHVzZUNvb3JkaW5hdGVGb3JtYXQgZnJvbSAnLi4vLi4vdGFicy9tZXRhY2FyZC91c2VDb29yZGluYXRlRm9ybWF0J1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi8uLi8uLi9qcy9Db21tb24nXG5pbXBvcnQgRXh0ZW5zaW9ucyBmcm9tICcuLi8uLi8uLi9leHRlbnNpb24tcG9pbnRzJ1xuaW1wb3J0IHsgdXNlTWV0YWNhcmREZWZpbml0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvbWV0YWNhcmQtZGVmaW5pdGlvbnMuaG9va3MnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vLi4vanMvd3JlcXInXG5pbXBvcnQgeyBMYXlvdXRDb250ZXh0IH0gZnJvbSAnLi4vLi4vZ29sZGVuLWxheW91dC92aXN1YWwtc2V0dGluZ3MucHJvdmlkZXInXG5pbXBvcnQge1xuICBSRVNVTFRTX0FUVFJJQlVURVNfVEFCTEUsXG4gIGdldERlZmF1bHRSZXN1bHRzU2hvd25UYWJsZSxcbn0gZnJvbSAnLi4vc2V0dGluZ3MtaGVscGVycydcbnR5cGUgUmVzdWx0SXRlbUZ1bGxQcm9wcyA9IHtcbiAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gIG1lYXN1cmU6ICgpID0+IHZvaWRcbiAgaW5kZXg6IG51bWJlclxuICByZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXVxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxuICBoZWFkZXJDb2xXaWR0aDogTWFwPHN0cmluZywgc3RyaW5nPlxuICBhY3Rpb25XaWR0aDogbnVtYmVyXG4gIHNldE1heEFjdGlvbldpZHRoOiAod2lkdGg6IG51bWJlcikgPT4gdm9pZFxuICBhZGRPbldpZHRoOiBudW1iZXJcbiAgc2V0TWF4QWRkT25XaWR0aDogKHdpZHRoOiBudW1iZXIpID0+IHZvaWRcbn1cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclNlbGVjdGlvbigpIHtcbiAgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgd2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpXG4gIH0gZWxzZSBpZiAoKGRvY3VtZW50IGFzIGFueSkuc2VsZWN0aW9uKSB7XG4gICAgOyhkb2N1bWVudCBhcyBhbnkpLnNlbGVjdGlvbi5lbXB0eSgpXG4gIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBoYXNTZWxlY3Rpb24oKTogYm9vbGVhbiB7XG4gIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIHJldHVybiB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKSAhPT0gJydcbiAgfSBlbHNlIGlmICgoZG9jdW1lbnQgYXMgYW55KS5zZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gKGRvY3VtZW50IGFzIGFueSkuc2VsZWN0aW9uLnRvU3RyaW5nKCkgIT09ICcnXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cbmNvbnN0IENoZWNrYm94Q2VsbCA9ICh7IGxhenlSZXN1bHQgfTogeyBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHQgfSkgPT4ge1xuICBjb25zdCBpc1NlbGVjdGVkID0gdXNlU2VsZWN0aW9uT2ZMYXp5UmVzdWx0KHsgbGF6eVJlc3VsdCB9KVxuICByZXR1cm4gKFxuICAgIDxDZWxsQ29tcG9uZW50IGNsYXNzTmFtZT1cImgtZnVsbFwiIHN0eWxlPXt7IHdpZHRoOiAnYXV0bycsIHBhZGRpbmc6ICcwcHgnIH19PlxuICAgICAgPEJ1dHRvblxuICAgICAgICBkYXRhLWlkPVwic2VsZWN0LWNoZWNrYm94XCJcbiAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGxhenlSZXN1bHQuc2hpZnRTZWxlY3QoKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXp5UmVzdWx0LmNvbnRyb2xTZWxlY3QoKVxuICAgICAgICAgIH1cbiAgICAgICAgfX1cbiAgICAgICAgY2xhc3NOYW1lPVwiaC1mdWxsXCJcbiAgICAgID5cbiAgICAgICAge2lzU2VsZWN0ZWQgPyA8Q2hlY2tCb3hJY29uIC8+IDogPENoZWNrQm94T3V0bGluZUJsYW5rSWNvbiAvPn1cbiAgICAgIDwvQnV0dG9uPlxuICAgIDwvQ2VsbENvbXBvbmVudD5cbiAgKVxufVxuY29uc3QgUm93Q29tcG9uZW50ID0gKHtcbiAgbGF6eVJlc3VsdCxcbiAgbWVhc3VyZTogb3JpZ2luYWxNZWFzdXJlLFxuICBpbmRleCxcbiAgcmVzdWx0cyxcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICBoZWFkZXJDb2xXaWR0aCxcbiAgYWN0aW9uV2lkdGgsXG4gIHNldE1heEFjdGlvbldpZHRoLFxuICBhZGRPbldpZHRoLFxuICBzZXRNYXhBZGRPbldpZHRoLFxufTogUmVzdWx0SXRlbUZ1bGxQcm9wcykgPT4ge1xuICBjb25zdCB7IGdldFZhbHVlLCBvblN0YXRlQ2hhbmdlZCB9ID0gUmVhY3QudXNlQ29udGV4dChMYXlvdXRDb250ZXh0KVxuICBjb25zdCBNZXRhY2FyZERlZmluaXRpb25zID0gdXNlTWV0YWNhcmREZWZpbml0aW9ucygpXG4gIGNvbnN0IHRodW1ibmFpbCA9IGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aHVtYm5haWxcbiAgY29uc3QgW2RlY2ltYWxQcmVjaXNpb24sIHNldERlY2ltYWxQcmVjaXNpb25dID0gUmVhY3QudXNlU3RhdGUoXG4gICAgVHlwZWRVc2VySW5zdGFuY2UuZ2V0RGVjaW1hbFByZWNpc2lvbigpXG4gIClcbiAgY29uc3QgW3Nob3duQXR0cmlidXRlcywgc2V0U2hvd25BdHRyaWJ1dGVzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIGdldFZhbHVlKFxuICAgICAgUkVTVUxUU19BVFRSSUJVVEVTX1RBQkxFLFxuICAgICAgZ2V0RGVmYXVsdFJlc3VsdHNTaG93blRhYmxlKClcbiAgICApIGFzIHN0cmluZ1tdXG4gIClcbiAgY29uc3QgaXNMYXN0ID0gaW5kZXggPT09IHJlc3VsdHMubGVuZ3RoIC0gMVxuICBjb25zdCB7IGxpc3RlblRvIH0gPSB1c2VCYWNrYm9uZSgpXG4gIGNvbnN0IGNvbnZlcnRUb0Zvcm1hdCA9IHVzZUNvb3JkaW5hdGVGb3JtYXQoKVxuICBjb25zdCBjb252ZXJ0VG9QcmVjaXNpb24gPSAodmFsdWU6IGFueSkgPT4ge1xuICAgIHJldHVybiB2YWx1ZSAmJiBkZWNpbWFsUHJlY2lzaW9uXG4gICAgICA/IE51bWJlcih2YWx1ZSkudG9GaXhlZChkZWNpbWFsUHJlY2lzaW9uKVxuICAgICAgOiB2YWx1ZVxuICB9XG4gIHVzZVJlcmVuZGVyT25CYWNrYm9uZVN5bmMoeyBsYXp5UmVzdWx0IH0pXG5cbiAgY29uc3QgYWN0aW9uUmVmID0gUmVhY3QudXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKVxuICBjb25zdCBhZGRPblJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBhY3Rpb25XaWR0aCA9IGFjdGlvblJlZi5jdXJyZW50Py5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCB8fCAwXG4gICAgc2V0TWF4QWN0aW9uV2lkdGgoYWN0aW9uV2lkdGgpXG4gICAgY29uc3QgYWRkT25XaWR0aCA9IGFkZE9uUmVmLmN1cnJlbnQ/LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoIHx8IDBcbiAgICBzZXRNYXhBZGRPbldpZHRoKGFkZE9uV2lkdGgpXG4gIH0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsaXN0ZW5UbyhcbiAgICAgIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLFxuICAgICAgJ2NoYW5nZTpkZWNpbWFsUHJlY2lzaW9uJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgc2V0RGVjaW1hbFByZWNpc2lvbihUeXBlZFVzZXJJbnN0YW5jZS5nZXREZWNpbWFsUHJlY2lzaW9uKCkpXG4gICAgICB9XG4gICAgKVxuICAgIG9uU3RhdGVDaGFuZ2VkKCgpID0+IHtcbiAgICAgIGNvbnN0IHNob3duTGlzdCA9IGdldFZhbHVlKFxuICAgICAgICBSRVNVTFRTX0FUVFJJQlVURVNfVEFCTEUsXG4gICAgICAgIGdldERlZmF1bHRSZXN1bHRzU2hvd25UYWJsZSgpXG4gICAgICApXG4gICAgICBzZXRTaG93bkF0dHJpYnV0ZXMoc2hvd25MaXN0KVxuICAgIH0pXG4gIH0sIFtdKVxuICBjb25zdCBpbWdzcmMgPSBDb21tb24uZ2V0SW1hZ2VTcmModGh1bWJuYWlsKVxuICBjb25zdCBtZWFzdXJlID0gKCkgPT4ge1xuICAgIGlmIChcbiAgICAgIGNvbnRhaW5lclJlZi5jdXJyZW50Py5jbGllbnRIZWlnaHQgJiZcbiAgICAgIGNvbnRhaW5lclJlZi5jdXJyZW50Py5jbGllbnRIZWlnaHQgPiAwXG4gICAgKSB7XG4gICAgICBvcmlnaW5hbE1lYXN1cmUoKVxuICAgIH1cbiAgfVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIG1lYXN1cmUoKVxuICB9LCBbc2hvd25BdHRyaWJ1dGVzLCBjb252ZXJ0VG9Gb3JtYXRdKVxuICBjb25zdCBnZXREaXNwbGF5VmFsdWUgPSAodmFsdWU6IGFueSwgcHJvcGVydHk6IHN0cmluZykgPT4ge1xuICAgIGlmICh2YWx1ZSAmJiBNZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW3Byb3BlcnR5XSkge1xuICAgICAgc3dpdGNoIChNZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW3Byb3BlcnR5XS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgICAgICByZXR1cm4gY29udmVydFRvRm9ybWF0KHZhbHVlKVxuICAgICAgICBjYXNlICdMT05HJzpcbiAgICAgICAgY2FzZSAnRE9VQkxFJzpcbiAgICAgICAgY2FzZSAnRkxPQVQnOlxuICAgICAgICAgIHJldHVybiBjb252ZXJ0VG9QcmVjaXNpb24odmFsdWUpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGxpc3RlblRvKHdyZXFyLnZlbnQsICdhY3RpdmVDb250ZW50SXRlbUNoYW5nZWQnLCAoKSA9PiB7XG4gICAgbWVhc3VyZSgpXG4gIH0pXG4gIGNvbnN0IGNvbnRhaW5lclJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgY29uc3QgUmVzdWx0SXRlbUFjdGlvbkluc3RhbmNlID0gRXh0ZW5zaW9ucy5yZXN1bHRJdGVtQWN0aW9uKHtcbiAgICBsYXp5UmVzdWx0LFxuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgICBpdGVtQ29udGVudFJlZjogY29udGFpbmVyUmVmLFxuICB9KVxuXG4gIGNvbnN0IFJlc3VsdEl0ZW1BZGRPbkluc3RhbmNlID0gRXh0ZW5zaW9ucy5yZXN1bHRJdGVtUm93QWRkT24oe1xuICAgIGxhenlSZXN1bHQsXG4gICAgaXNUYWJsZVZpZXc6IHRydWUsXG4gIH0pXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IHJlZj17Y29udGFpbmVyUmVmfT5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiYmctaW5oZXJpdCBmbGV4IGl0ZW1zLXN0cmVjaCBmbGV4LW5vd3JhcFwiXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgd2lkdGg6IGFjdGlvbldpZHRoICsgYWRkT25XaWR0aCArIHNob3duQXR0cmlidXRlcy5sZW5ndGggKiAyMDAgKyAncHgnLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAga2V5PVwicmVzdWx0SXRlbUFjdGlvblwiXG4gICAgICAgICAgY2xhc3NOYW1lPXtgYmctaW5oZXJpdCBNdWktYm9yZGVyLWRpdmlkZXIgYm9yZGVyICR7XG4gICAgICAgICAgICBpc0xhc3QgPyAnJyA6ICdib3JkZXItYi0wJ1xuICAgICAgICAgIH0gYm9yZGVyLWwtMCAke2luZGV4ID09PSAwID8gJ2JvcmRlci10LTAnIDogJyd9YH1cbiAgICAgICAgPlxuICAgICAgICAgIHtSZXN1bHRJdGVtQWN0aW9uSW5zdGFuY2UgPyAoXG4gICAgICAgICAgICA8Q2VsbENvbXBvbmVudFxuICAgICAgICAgICAgICBrZXk9XCJyZXN1bHRJdGVtQWN0aW9uXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaC1mdWxsXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICB3aWR0aDogJ2F1dG8nLFxuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDAsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHJlZj17YWN0aW9uUmVmfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8UmVzdWx0SXRlbUFjdGlvbkluc3RhbmNlIC8+XG4gICAgICAgICAgICA8L0NlbGxDb21wb25lbnQ+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6IGFjdGlvbldpZHRoIH19IC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2BzdGlja3kgbGVmdC0wIHctYXV0byB6LTEwIGJnLWluaGVyaXQgTXVpLWJvcmRlci1kaXZpZGVyIGJvcmRlciAke1xuICAgICAgICAgICAgaXNMYXN0ID8gJycgOiAnYm9yZGVyLWItMCdcbiAgICAgICAgICB9IGJvcmRlci1sLTAgJHtpbmRleCA9PT0gMCA/ICdib3JkZXItdC0wJyA6ICcnfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8U2VsZWN0aW9uQmFja2dyb3VuZCBsYXp5UmVzdWx0PXtsYXp5UmVzdWx0fSAvPlxuICAgICAgICAgIDxDaGVja2JveENlbGwgbGF6eVJlc3VsdD17bGF6eVJlc3VsdH0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9e2ByZWxhdGl2ZSBNdWktYm9yZGVyLWRpdmlkZXIgYm9yZGVyIGJvcmRlci1iLTAgYm9yZGVyLXItMCBib3JkZXItbC0wICR7XG4gICAgICAgICAgICBpbmRleCA9PT0gMCA/ICdib3JkZXItdC0wJyA6ICcnXG4gICAgICAgICAgfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8U2VsZWN0aW9uQmFja2dyb3VuZFxuICAgICAgICAgICAgbGF6eVJlc3VsdD17bGF6eVJlc3VsdH1cbiAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiBhZGRPbldpZHRoICsgc2hvd25BdHRyaWJ1dGVzLmxlbmd0aCAqIDIwMCArICdweCcgfX1cbiAgICAgICAgICAvPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGRhdGEtaWQ9XCJyZXN1bHQtaXRlbS1yb3ctY29udGFpbmVyLWJ1dHRvblwiXG4gICAgICAgICAgICBvbk1vdXNlRG93bj17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgKiBTaGlmdCBrZXkgY2FuIGNhdXNlIHNlbGVjdGlvbnMgc2luY2Ugd2Ugc2V0IHRoZSBjbGFzcyB0byBhbGxvdyB0ZXh0IHNlbGVjdGlvbixcbiAgICAgICAgICAgICAgICogc28gdGhlIG9ubHkgc2NlbmFyaW8gd2Ugd2FudCB0byBwcmV2ZW50IHRoYXQgaW4gaXMgd2hlbiBzaGlmdCBjbGlja2luZ1xuICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJTZWxlY3Rpb24oKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25DbGljaz17KGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgIGlmIChoYXNTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChldmVudC5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgIGxhenlSZXN1bHQuc2hpZnRTZWxlY3QoKVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkge1xuICAgICAgICAgICAgICAgIGxhenlSZXN1bHQuY29udHJvbFNlbGVjdCgpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGF6eVJlc3VsdC5zZWxlY3QoKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgZGlzYWJsZUZvY3VzUmlwcGxlXG4gICAgICAgICAgICBkaXNhYmxlUmlwcGxlXG4gICAgICAgICAgICBkaXNhYmxlVG91Y2hSaXBwbGVcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm91dGxpbmUtbm9uZSByb3VuZGVkLW5vbmUgc2VsZWN0LXRleHQgcC0wIHRleHQtbGVmdCBicmVhay13b3JkcyBoLWZ1bGxcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgICA8R3JpZCBjb250YWluZXIgZGlyZWN0aW9uPVwicm93XCIgY2xhc3NOYW1lPVwiaC1mdWxsXCIgd3JhcD1cIm5vd3JhcFwiPlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgIGtleT1cInJlc3VsdEl0ZW1BZGRPblwiXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BNdWktYm9yZGVyLWRpdmlkZXIgYm9yZGVyIGJvcmRlci10LTAgYm9yZGVyLWwtMCAke1xuICAgICAgICAgICAgICAgICAgICBpc0xhc3QgPyAnJyA6ICdib3JkZXItYi0wJ1xuICAgICAgICAgICAgICAgICAgfSBoLWZ1bGxgfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6IGFkZE9uV2lkdGggfX0+XG4gICAgICAgICAgICAgICAgICAgIHtSZXN1bHRJdGVtQWRkT25JbnN0YW5jZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgPENlbGxDb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT1cInJlc3VsdEl0ZW1BZGRPblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJ2F1dG8nLFxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB0LTNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXthZGRPblJlZn1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7UmVzdWx0SXRlbUFkZE9uSW5zdGFuY2V9XG4gICAgICAgICAgICAgICAgICAgICAgPC9DZWxsQ29tcG9uZW50PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge3Nob3duQXR0cmlidXRlcy5tYXAoKHByb3BlcnR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICBsZXQgdmFsdWUgPSBsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgICBdIGFzIGFueVxuICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAnJ1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yICE9PSBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IFt2YWx1ZV1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgJiZcbiAgICAgICAgICAgICAgICAgICAgTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtwcm9wZXJ0eV1cbiAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKFxuICAgICAgICAgICAgICAgICAgICAgIE1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbcHJvcGVydHldLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcCgodmFsOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCAhPT0gdW5kZWZpbmVkICYmIHZhbCAhPT0gJydcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IHVzZXIuZ2V0VXNlclJlYWRhYmxlRGF0ZVRpbWUodmFsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogJydcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtwcm9wZXJ0eX0+XG4gICAgICAgICAgICAgICAgICAgICAgPENlbGxDb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17cHJvcGVydHl9XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLXByb3BlcnR5PXtgJHtwcm9wZXJ0eX1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgTXVpLWJvcmRlci1kaXZpZGVyIGJvcmRlciBib3JkZXItdC0wIGJvcmRlci1sLTAgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNMYXN0ID8gJycgOiAnYm9yZGVyLWItMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gaC1mdWxsYH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtdmFsdWU9e2Ake3ZhbHVlfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogYCR7aGVhZGVyQ29sV2lkdGguZ2V0KHByb3BlcnR5KX1gLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aDogJzIwMHB4JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge3Byb3BlcnR5ID09PSAndGh1bWJuYWlsJyAmJiB0aHVtYm5haWwgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWlkPVwidGh1bWJuYWlsLXZhbHVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9e2ltZ3NyY31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heEhlaWdodDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Mb2FkPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3I9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lYXN1cmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1pZD17YCR7cHJvcGVydHl9LXZhbHVlYH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdvcmRCcmVhazogJ2JyZWFrLXdvcmQnIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3ZhbHVlLm1hcCgoY3VyVmFsdWU6IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGtleT17aW5kZXh9IGRhdGEtdmFsdWU9e2Ake2N1clZhbHVlfWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2N1clZhbHVlLnRvU3RyaW5nKCkuc3RhcnRzV2l0aCgnaHR0cCcpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY9e2Ake2N1clZhbHVlfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtNZXRhY2FyZERlZmluaXRpb25zLmdldEFsaWFzKHByb3BlcnR5KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUubGVuZ3RoID4gMSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4IDwgdmFsdWUubGVuZ3RoIC0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBnZXREaXNwbGF5VmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyVmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSArICcsICdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogZ2V0RGlzcGxheVZhbHVlKGN1clZhbHVlLCBwcm9wZXJ0eSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9DZWxsQ29tcG9uZW50PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFJvd0NvbXBvbmVudClcbiJdfQ==