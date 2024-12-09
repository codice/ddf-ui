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
                                if (!Array.isArray(value)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdWx0LWl0ZW0tcm93LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL3Jlc3VsdHMtdmlzdWFsL3Jlc3VsdC1pdGVtLXJvdy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBRTlDLE9BQU8sRUFDTCx5QkFBeUIsRUFDekIsd0JBQXdCLEdBQ3pCLE1BQU0seUNBQXlDLENBQUE7QUFDaEQsT0FBTyxJQUFJLE1BQU0sZ0NBQWdDLENBQUE7QUFDakQsT0FBTyx3QkFBd0IsTUFBTSwwQ0FBMEMsQ0FBQTtBQUMvRSxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQTtBQUN2RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxlQUFlLENBQUE7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJDQUEyQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFBO0FBQzlELE9BQU8sbUJBQW1CLE1BQU0seUNBQXlDLENBQUE7QUFDekUsT0FBTyxNQUFNLE1BQU0sb0JBQW9CLENBQUE7QUFDdkMsT0FBTyxVQUFVLE1BQU0sMkJBQTJCLENBQUE7QUFDbEQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sc0RBQXNELENBQUE7QUFDN0YsT0FBTyxLQUFLLE1BQU0sbUJBQW1CLENBQUE7QUFDckMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFN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RSxLQUFhOzRDQUN0QyxPQUFPLENBQ0wsOEJBQU0sR0FBRyxFQUFFLEtBQUssZ0JBQWMsVUFBRyxRQUFRLENBQUUsSUFDeEMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDeEMsMkJBQ0UsSUFBSSxFQUFFLFVBQUcsUUFBUSxDQUFFLEVBQ25CLE1BQU0sRUFBQyxRQUFRLEVBQ2YsR0FBRyxFQUFDLHFCQUFxQixJQUV4QixtQkFBbUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQ3JDLENBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FDRixVQUNFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztnREFDaEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQztnREFDdEIsQ0FBQyxDQUFDLGVBQWUsQ0FDYixRQUFRLEVBQ1IsUUFBUSxDQUNULEdBQUcsSUFBSTtnREFDVixDQUFDLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FDdkMsQ0FDSCxDQUNJLENBQ1IsQ0FBQTt3Q0FDSCxDQUFDLENBQUMsQ0FDRSxDQUNTLENBQ2xCLENBQ2EsQ0FDWixDQUNQLENBQUE7NEJBQ0gsQ0FBQyxDQUFDLENBQ0csQ0FDSCxDQUNDLENBQ0wsQ0FDRixDQUNGLENBQ1AsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUNELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgQ2VsbENvbXBvbmVudCB9IGZyb20gJy4vdGFibGUtaGVhZGVyJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7XG4gIHVzZVJlcmVuZGVyT25CYWNrYm9uZVN5bmMsXG4gIHVzZVNlbGVjdGlvbk9mTGF6eVJlc3VsdCxcbn0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L2hvb2tzJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IENoZWNrQm94T3V0bGluZUJsYW5rSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0NoZWNrQm94T3V0bGluZUJsYW5rJ1xuaW1wb3J0IENoZWNrQm94SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0NoZWNrQm94J1xuaW1wb3J0IHsgU2VsZWN0aW9uQmFja2dyb3VuZCB9IGZyb20gJy4vcmVzdWx0LWl0ZW0nXG5pbXBvcnQgeyB1c2VCYWNrYm9uZSB9IGZyb20gJy4uLy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi9zaW5nbGV0b25zL1R5cGVkVXNlcidcbmltcG9ydCB1c2VDb29yZGluYXRlRm9ybWF0IGZyb20gJy4uLy4uL3RhYnMvbWV0YWNhcmQvdXNlQ29vcmRpbmF0ZUZvcm1hdCdcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vLi4vLi4vanMvQ29tbW9uJ1xuaW1wb3J0IEV4dGVuc2lvbnMgZnJvbSAnLi4vLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCB7IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL21ldGFjYXJkLWRlZmluaXRpb25zLmhvb2tzJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0IHsgTGF5b3V0Q29udGV4dCB9IGZyb20gJy4uLy4uL2dvbGRlbi1sYXlvdXQvdmlzdWFsLXNldHRpbmdzLnByb3ZpZGVyJ1xuaW1wb3J0IHtcbiAgUkVTVUxUU19BVFRSSUJVVEVTX1RBQkxFLFxuICBnZXREZWZhdWx0UmVzdWx0c1Nob3duVGFibGUsXG59IGZyb20gJy4uL3NldHRpbmdzLWhlbHBlcnMnXG50eXBlIFJlc3VsdEl0ZW1GdWxsUHJvcHMgPSB7XG4gIGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxuICBtZWFzdXJlOiAoKSA9PiB2b2lkXG4gIGluZGV4OiBudW1iZXJcbiAgcmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0W11cbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgaGVhZGVyQ29sV2lkdGg6IE1hcDxzdHJpbmcsIHN0cmluZz5cbiAgYWN0aW9uV2lkdGg6IG51bWJlclxuICBzZXRNYXhBY3Rpb25XaWR0aDogKHdpZHRoOiBudW1iZXIpID0+IHZvaWRcbiAgYWRkT25XaWR0aDogbnVtYmVyXG4gIHNldE1heEFkZE9uV2lkdGg6ICh3aWR0aDogbnVtYmVyKSA9PiB2b2lkXG59XG5leHBvcnQgZnVuY3Rpb24gY2xlYXJTZWxlY3Rpb24oKSB7XG4gIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKVxuICB9IGVsc2UgaWYgKChkb2N1bWVudCBhcyBhbnkpLnNlbGVjdGlvbikge1xuICAgIDsoZG9jdW1lbnQgYXMgYW55KS5zZWxlY3Rpb24uZW1wdHkoKVxuICB9XG59XG5leHBvcnQgZnVuY3Rpb24gaGFzU2VsZWN0aW9uKCk6IGJvb2xlYW4ge1xuICBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICByZXR1cm4gd2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKCkgIT09ICcnXG4gIH0gZWxzZSBpZiAoKGRvY3VtZW50IGFzIGFueSkuc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIChkb2N1bWVudCBhcyBhbnkpLnNlbGVjdGlvbi50b1N0cmluZygpICE9PSAnJ1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5jb25zdCBDaGVja2JveENlbGwgPSAoeyBsYXp5UmVzdWx0IH06IHsgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0IH0pID0+IHtcbiAgY29uc3QgaXNTZWxlY3RlZCA9IHVzZVNlbGVjdGlvbk9mTGF6eVJlc3VsdCh7IGxhenlSZXN1bHQgfSlcbiAgcmV0dXJuIChcbiAgICA8Q2VsbENvbXBvbmVudCBjbGFzc05hbWU9XCJoLWZ1bGxcIiBzdHlsZT17eyB3aWR0aDogJ2F1dG8nLCBwYWRkaW5nOiAnMHB4JyB9fT5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgZGF0YS1pZD1cInNlbGVjdC1jaGVja2JveFwiXG4gICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBsYXp5UmVzdWx0LnNoaWZ0U2VsZWN0KClcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGF6eVJlc3VsdC5jb250cm9sU2VsZWN0KClcbiAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT1cImgtZnVsbFwiXG4gICAgICA+XG4gICAgICAgIHtpc1NlbGVjdGVkID8gPENoZWNrQm94SWNvbiAvPiA6IDxDaGVja0JveE91dGxpbmVCbGFua0ljb24gLz59XG4gICAgICA8L0J1dHRvbj5cbiAgICA8L0NlbGxDb21wb25lbnQ+XG4gIClcbn1cbmNvbnN0IFJvd0NvbXBvbmVudCA9ICh7XG4gIGxhenlSZXN1bHQsXG4gIG1lYXN1cmU6IG9yaWdpbmFsTWVhc3VyZSxcbiAgaW5kZXgsXG4gIHJlc3VsdHMsXG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgaGVhZGVyQ29sV2lkdGgsXG4gIGFjdGlvbldpZHRoLFxuICBzZXRNYXhBY3Rpb25XaWR0aCxcbiAgYWRkT25XaWR0aCxcbiAgc2V0TWF4QWRkT25XaWR0aCxcbn06IFJlc3VsdEl0ZW1GdWxsUHJvcHMpID0+IHtcbiAgY29uc3QgeyBnZXRWYWx1ZSwgb25TdGF0ZUNoYW5nZWQgfSA9IFJlYWN0LnVzZUNvbnRleHQoTGF5b3V0Q29udGV4dClcbiAgY29uc3QgTWV0YWNhcmREZWZpbml0aW9ucyA9IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMoKVxuICBjb25zdCB0aHVtYm5haWwgPSBsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGh1bWJuYWlsXG4gIGNvbnN0IFtkZWNpbWFsUHJlY2lzaW9uLCBzZXREZWNpbWFsUHJlY2lzaW9uXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIFR5cGVkVXNlckluc3RhbmNlLmdldERlY2ltYWxQcmVjaXNpb24oKVxuICApXG4gIGNvbnN0IFtzaG93bkF0dHJpYnV0ZXMsIHNldFNob3duQXR0cmlidXRlc10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBnZXRWYWx1ZShcbiAgICAgIFJFU1VMVFNfQVRUUklCVVRFU19UQUJMRSxcbiAgICAgIGdldERlZmF1bHRSZXN1bHRzU2hvd25UYWJsZSgpXG4gICAgKSBhcyBzdHJpbmdbXVxuICApXG4gIGNvbnN0IGlzTGFzdCA9IGluZGV4ID09PSByZXN1bHRzLmxlbmd0aCAtIDFcbiAgY29uc3QgeyBsaXN0ZW5UbyB9ID0gdXNlQmFja2JvbmUoKVxuICBjb25zdCBjb252ZXJ0VG9Gb3JtYXQgPSB1c2VDb29yZGluYXRlRm9ybWF0KClcbiAgY29uc3QgY29udmVydFRvUHJlY2lzaW9uID0gKHZhbHVlOiBhbnkpID0+IHtcbiAgICByZXR1cm4gdmFsdWUgJiYgZGVjaW1hbFByZWNpc2lvblxuICAgICAgPyBOdW1iZXIodmFsdWUpLnRvRml4ZWQoZGVjaW1hbFByZWNpc2lvbilcbiAgICAgIDogdmFsdWVcbiAgfVxuICB1c2VSZXJlbmRlck9uQmFja2JvbmVTeW5jKHsgbGF6eVJlc3VsdCB9KVxuXG4gIGNvbnN0IGFjdGlvblJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgY29uc3QgYWRkT25SZWYgPSBSZWFjdC51c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgYWN0aW9uV2lkdGggPSBhY3Rpb25SZWYuY3VycmVudD8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGggfHwgMFxuICAgIHNldE1heEFjdGlvbldpZHRoKGFjdGlvbldpZHRoKVxuICAgIGNvbnN0IGFkZE9uV2lkdGggPSBhZGRPblJlZi5jdXJyZW50Py5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCB8fCAwXG4gICAgc2V0TWF4QWRkT25XaWR0aChhZGRPbldpZHRoKVxuICB9KVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGlzdGVuVG8oXG4gICAgICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKSxcbiAgICAgICdjaGFuZ2U6ZGVjaW1hbFByZWNpc2lvbicsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHNldERlY2ltYWxQcmVjaXNpb24oVHlwZWRVc2VySW5zdGFuY2UuZ2V0RGVjaW1hbFByZWNpc2lvbigpKVxuICAgICAgfVxuICAgIClcbiAgICBvblN0YXRlQ2hhbmdlZCgoKSA9PiB7XG4gICAgICBjb25zdCBzaG93bkxpc3QgPSBnZXRWYWx1ZShcbiAgICAgICAgUkVTVUxUU19BVFRSSUJVVEVTX1RBQkxFLFxuICAgICAgICBnZXREZWZhdWx0UmVzdWx0c1Nob3duVGFibGUoKVxuICAgICAgKVxuICAgICAgc2V0U2hvd25BdHRyaWJ1dGVzKHNob3duTGlzdClcbiAgICB9KVxuICB9LCBbXSlcbiAgY29uc3QgaW1nc3JjID0gQ29tbW9uLmdldEltYWdlU3JjKHRodW1ibmFpbClcbiAgY29uc3QgbWVhc3VyZSA9ICgpID0+IHtcbiAgICBpZiAoXG4gICAgICBjb250YWluZXJSZWYuY3VycmVudD8uY2xpZW50SGVpZ2h0ICYmXG4gICAgICBjb250YWluZXJSZWYuY3VycmVudD8uY2xpZW50SGVpZ2h0ID4gMFxuICAgICkge1xuICAgICAgb3JpZ2luYWxNZWFzdXJlKClcbiAgICB9XG4gIH1cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBtZWFzdXJlKClcbiAgfSwgW3Nob3duQXR0cmlidXRlcywgY29udmVydFRvRm9ybWF0XSlcbiAgY29uc3QgZ2V0RGlzcGxheVZhbHVlID0gKHZhbHVlOiBhbnksIHByb3BlcnR5OiBzdHJpbmcpID0+IHtcbiAgICBpZiAodmFsdWUgJiYgTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtwcm9wZXJ0eV0pIHtcbiAgICAgIHN3aXRjaCAoTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtwcm9wZXJ0eV0udHlwZSkge1xuICAgICAgICBjYXNlICdHRU9NRVRSWSc6XG4gICAgICAgICAgcmV0dXJuIGNvbnZlcnRUb0Zvcm1hdCh2YWx1ZSlcbiAgICAgICAgY2FzZSAnTE9ORyc6XG4gICAgICAgIGNhc2UgJ0RPVUJMRSc6XG4gICAgICAgIGNhc2UgJ0ZMT0FUJzpcbiAgICAgICAgICByZXR1cm4gY29udmVydFRvUHJlY2lzaW9uKHZhbHVlKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuICBsaXN0ZW5Ubyh3cmVxci52ZW50LCAnYWN0aXZlQ29udGVudEl0ZW1DaGFuZ2VkJywgKCkgPT4ge1xuICAgIG1lYXN1cmUoKVxuICB9KVxuICBjb25zdCBjb250YWluZXJSZWYgPSBSZWFjdC51c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpXG4gIGNvbnN0IFJlc3VsdEl0ZW1BY3Rpb25JbnN0YW5jZSA9IEV4dGVuc2lvbnMucmVzdWx0SXRlbUFjdGlvbih7XG4gICAgbGF6eVJlc3VsdCxcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgaXRlbUNvbnRlbnRSZWY6IGNvbnRhaW5lclJlZixcbiAgfSlcblxuICBjb25zdCBSZXN1bHRJdGVtQWRkT25JbnN0YW5jZSA9IEV4dGVuc2lvbnMucmVzdWx0SXRlbVJvd0FkZE9uKHtcbiAgICBsYXp5UmVzdWx0LFxuICAgIGlzVGFibGVWaWV3OiB0cnVlLFxuICB9KVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiByZWY9e2NvbnRhaW5lclJlZn0+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cImJnLWluaGVyaXQgZmxleCBpdGVtcy1zdHJlY2ggZmxleC1ub3dyYXBcIlxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHdpZHRoOiBhY3Rpb25XaWR0aCArIGFkZE9uV2lkdGggKyBzaG93bkF0dHJpYnV0ZXMubGVuZ3RoICogMjAwICsgJ3B4JyxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIGtleT1cInJlc3VsdEl0ZW1BY3Rpb25cIlxuICAgICAgICAgIGNsYXNzTmFtZT17YGJnLWluaGVyaXQgTXVpLWJvcmRlci1kaXZpZGVyIGJvcmRlciAke1xuICAgICAgICAgICAgaXNMYXN0ID8gJycgOiAnYm9yZGVyLWItMCdcbiAgICAgICAgICB9IGJvcmRlci1sLTAgJHtpbmRleCA9PT0gMCA/ICdib3JkZXItdC0wJyA6ICcnfWB9XG4gICAgICAgID5cbiAgICAgICAgICB7UmVzdWx0SXRlbUFjdGlvbkluc3RhbmNlID8gKFxuICAgICAgICAgICAgPENlbGxDb21wb25lbnRcbiAgICAgICAgICAgICAga2V5PVwicmVzdWx0SXRlbUFjdGlvblwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImgtZnVsbFwiXG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAwLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICByZWY9e2FjdGlvblJlZn1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFJlc3VsdEl0ZW1BY3Rpb25JbnN0YW5jZSAvPlxuICAgICAgICAgICAgPC9DZWxsQ29tcG9uZW50PlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiBhY3Rpb25XaWR0aCB9fSAvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgc3RpY2t5IGxlZnQtMCB3LWF1dG8gei0xMCBiZy1pbmhlcml0IE11aS1ib3JkZXItZGl2aWRlciBib3JkZXIgJHtcbiAgICAgICAgICAgIGlzTGFzdCA/ICcnIDogJ2JvcmRlci1iLTAnXG4gICAgICAgICAgfSBib3JkZXItbC0wICR7aW5kZXggPT09IDAgPyAnYm9yZGVyLXQtMCcgOiAnJ31gfVxuICAgICAgICA+XG4gICAgICAgICAgPFNlbGVjdGlvbkJhY2tncm91bmQgbGF6eVJlc3VsdD17bGF6eVJlc3VsdH0gLz5cbiAgICAgICAgICA8Q2hlY2tib3hDZWxsIGxhenlSZXN1bHQ9e2xhenlSZXN1bHR9IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtgcmVsYXRpdmUgTXVpLWJvcmRlci1kaXZpZGVyIGJvcmRlciBib3JkZXItYi0wIGJvcmRlci1yLTAgYm9yZGVyLWwtMCAke1xuICAgICAgICAgICAgaW5kZXggPT09IDAgPyAnYm9yZGVyLXQtMCcgOiAnJ1xuICAgICAgICAgIH1gfVxuICAgICAgICA+XG4gICAgICAgICAgPFNlbGVjdGlvbkJhY2tncm91bmRcbiAgICAgICAgICAgIGxhenlSZXN1bHQ9e2xhenlSZXN1bHR9XG4gICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogYWRkT25XaWR0aCArIHNob3duQXR0cmlidXRlcy5sZW5ndGggKiAyMDAgKyAncHgnIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBkYXRhLWlkPVwicmVzdWx0LWl0ZW0tcm93LWNvbnRhaW5lci1idXR0b25cIlxuICAgICAgICAgICAgb25Nb3VzZURvd249eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICogU2hpZnQga2V5IGNhbiBjYXVzZSBzZWxlY3Rpb25zIHNpbmNlIHdlIHNldCB0aGUgY2xhc3MgdG8gYWxsb3cgdGV4dCBzZWxlY3Rpb24sXG4gICAgICAgICAgICAgICAqIHNvIHRoZSBvbmx5IHNjZW5hcmlvIHdlIHdhbnQgdG8gcHJldmVudCB0aGF0IGluIGlzIHdoZW4gc2hpZnQgY2xpY2tpbmdcbiAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgIGlmIChldmVudC5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgIGNsZWFyU2VsZWN0aW9uKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoaGFzU2VsZWN0aW9uKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LnNoaWZ0U2VsZWN0KClcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpIHtcbiAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LmNvbnRyb2xTZWxlY3QoKVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhenlSZXN1bHQuc2VsZWN0KClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGRpc2FibGVGb2N1c1JpcHBsZVxuICAgICAgICAgICAgZGlzYWJsZVJpcHBsZVxuICAgICAgICAgICAgZGlzYWJsZVRvdWNoUmlwcGxlXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJvdXRsaW5lLW5vbmUgcm91bmRlZC1ub25lIHNlbGVjdC10ZXh0IHAtMCB0ZXh0LWxlZnQgYnJlYWstd29yZHMgaC1mdWxsXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIj5cbiAgICAgICAgICAgICAgPEdyaWQgY29udGFpbmVyIGRpcmVjdGlvbj1cInJvd1wiIGNsYXNzTmFtZT1cImgtZnVsbFwiIHdyYXA9XCJub3dyYXBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICBrZXk9XCJyZXN1bHRJdGVtQWRkT25cIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgTXVpLWJvcmRlci1kaXZpZGVyIGJvcmRlciBib3JkZXItdC0wIGJvcmRlci1sLTAgJHtcbiAgICAgICAgICAgICAgICAgICAgaXNMYXN0ID8gJycgOiAnYm9yZGVyLWItMCdcbiAgICAgICAgICAgICAgICAgIH0gaC1mdWxsYH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiBhZGRPbldpZHRoIH19PlxuICAgICAgICAgICAgICAgICAgICB7UmVzdWx0SXRlbUFkZE9uSW5zdGFuY2UgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgIDxDZWxsQ29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJyZXN1bHRJdGVtQWRkT25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwdC0zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17YWRkT25SZWZ9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge1Jlc3VsdEl0ZW1BZGRPbkluc3RhbmNlfVxuICAgICAgICAgICAgICAgICAgICAgIDwvQ2VsbENvbXBvbmVudD5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHtzaG93bkF0dHJpYnV0ZXMubWFwKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgICAgICAgbGV0IHZhbHVlID0gbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eVxuICAgICAgICAgICAgICAgICAgXSBhcyBhbnlcbiAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gJydcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBbdmFsdWVdXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlICYmXG4gICAgICAgICAgICAgICAgICAgIE1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbcHJvcGVydHldXG4gICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChcbiAgICAgICAgICAgICAgICAgICAgICBNZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW3Byb3BlcnR5XS50eXBlXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RBVEUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5tYXAoKHZhbDogYW55KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWwgIT09IHVuZGVmaW5lZCAmJiB2YWwgIT09ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyB1c2VyLmdldFVzZXJSZWFkYWJsZURhdGVUaW1lKHZhbClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17cHJvcGVydHl9PlxuICAgICAgICAgICAgICAgICAgICAgIDxDZWxsQ29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3Byb3BlcnR5fVxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1wcm9wZXJ0eT17YCR7cHJvcGVydHl9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YE11aS1ib3JkZXItZGl2aWRlciBib3JkZXIgYm9yZGVyLXQtMCBib3JkZXItbC0wICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzTGFzdCA/ICcnIDogJ2JvcmRlci1iLTAnXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGgtZnVsbGB9XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLXZhbHVlPXtgJHt2YWx1ZX1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGAke2hlYWRlckNvbFdpZHRoLmdldChwcm9wZXJ0eSl9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICcyMDBweCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtwcm9wZXJ0eSA9PT0gJ3RodW1ibmFpbCcgJiYgdGh1bWJuYWlsID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1pZD1cInRodW1ibmFpbC12YWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtpbWdzcmN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTG9hZD17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtaWQ9e2Ake3Byb3BlcnR5fS12YWx1ZWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyB3b3JkQnJlYWs6ICdicmVhay13b3JkJyB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt2YWx1ZS5tYXAoKGN1clZhbHVlOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBrZXk9e2luZGV4fSBkYXRhLXZhbHVlPXtgJHtjdXJWYWx1ZX1gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtjdXJWYWx1ZS50b1N0cmluZygpLnN0YXJ0c1dpdGgoJ2h0dHAnKSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBocmVmPXtgJHtjdXJWYWx1ZX1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7TWV0YWNhcmREZWZpbml0aW9ucy5nZXRBbGlhcyhwcm9wZXJ0eSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGAke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmxlbmd0aCA+IDEgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA8IHZhbHVlLmxlbmd0aCAtIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gZ2V0RGlzcGxheVZhbHVlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1clZhbHVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgKyAnLCAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGdldERpc3BsYXlWYWx1ZShjdXJWYWx1ZSwgcHJvcGVydHkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgIDwvQ2VsbENvbXBvbmVudD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShSb3dDb21wb25lbnQpXG4iXX0=