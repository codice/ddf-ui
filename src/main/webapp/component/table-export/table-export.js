import { __assign, __awaiter, __generator, __read } from "tslib";
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
import { useEffect, useState } from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cont... Remove this comment to see the full error message
import contentDisposition from 'content-disposition';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import useSnack from '../hooks/useSnack';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { getExportOptions, Transformer, OverridableGetColumnOrder, exportResultSet, } from '../../react-component/utils/export';
import user from '../../component/singletons/user-instance';
import { DEFAULT_USER_QUERY_OPTIONS } from '../../js/model/TypedQuery';
import { getResultSetCql } from '../../react-component/utils/cql';
import SummaryManageAttributes from '../../react-component/summary-manage-attributes/summary-manage-attributes';
import { OverridableSaveFile } from '../../react-component/utils/save-file/save-file';
import ProgressButton from '../../react-component/progress-button/progress-button';
import DialogContent from '@mui/material/DialogContent/DialogContent';
import DialogActions from '@mui/material/DialogActions/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
function getSrcs(selectionInterface) {
    return selectionInterface.getCurrentQuery().getSelectedSources();
}
function getHiddenFields() {
    return user.get('user').get('preferences').get('columnHide');
}
function getSorts(selectionInterface) {
    return (user.get('user').get('preferences').get('resultSort') ||
        selectionInterface.getCurrentQuery().get('sorts'));
}
function getHits(sources) {
    return sources
        .filter(function (source) { return source.id !== 'cache'; })
        .reduce(function (hits, source) { return (source.hits ? hits + source.hits : hits); }, 0);
}
function getExportCount(_a) {
    var exportSize = _a.exportSize, selectionInterface = _a.selectionInterface, customExportCount = _a.customExportCount;
    if (exportSize === 'custom') {
        return customExportCount;
    }
    var result = selectionInterface.getCurrentQuery().get('result');
    return exportSize === 'all'
        ? getHits(Object.values(result.get('lazyResults').status))
        : Object.keys(result.get('lazyResults').results).length;
}
export var getWarning = function (exportCountInfo) {
    var exportResultLimit = StartupDataStore.Configuration.getExportLimit();
    var exportCount = getExportCount(exportCountInfo);
    var result = exportCountInfo.selectionInterface
        .getCurrentQuery()
        .get('result');
    var totalHits = getHits(Object.values(result.get('lazyResults').status));
    var limitWarning = "You cannot export more than the administrator configured limit of ".concat(exportResultLimit, ".");
    var warningMessage = '';
    if (exportCount > exportResultLimit) {
        if (exportCountInfo.exportSize === 'custom') {
            return limitWarning;
        }
        warningMessage =
            limitWarning +
                "  Only ".concat(exportResultLimit, " ").concat(exportResultLimit === 1 ? "result" : "results", " will be exported.");
    }
    if (exportCountInfo.exportSize === 'custom') {
        if (exportCount > totalHits) {
            warningMessage = "You are trying to export ".concat(exportCount, " results but there ").concat(totalHits === 1 ? "is" : "are", " only ").concat(totalHits, ".  Only ").concat(totalHits, " ").concat(totalHits === 1 ? "result" : "results", " will be exported.");
        }
    }
    if (totalHits > 100 && exportCount > 100 && exportResultLimit > 100) {
        warningMessage += "  This may take a long time.";
    }
    return warningMessage;
};
export var getExportBody = function (ExportInfo) { return __awaiter(void 0, void 0, void 0, function () {
    var exportSize, customExportCount, selectionInterface, exportResultLimit, hiddenFields, columnOrder, srcs, sorts, query, cacheId, phonetics, spellcheck, results, pageSize, exportCount, args, queryCount, cql, searches;
    var _a;
    return __generator(this, function (_b) {
        exportSize = ExportInfo.exportSize, customExportCount = ExportInfo.customExportCount, selectionInterface = ExportInfo.selectionInterface;
        exportResultLimit = StartupDataStore.Configuration.getExportLimit();
        hiddenFields = getHiddenFields();
        columnOrder = OverridableGetColumnOrder.get()();
        srcs = getSrcs(selectionInterface);
        sorts = getSorts(selectionInterface);
        query = selectionInterface.getCurrentQuery();
        cacheId = query.get('cacheId');
        phonetics = query.get('phonetics');
        spellcheck = query.get('spellcheck');
        results = Object.keys(query.get('result').get('lazyResults').results);
        pageSize = results.length;
        exportCount = Math.min(getExportCount({ exportSize: exportSize, selectionInterface: selectionInterface, customExportCount: customExportCount }), exportResultLimit);
        args = {
            hiddenFields: hiddenFields.length > 0 ? hiddenFields : [],
            columnOrder: columnOrder.length > 0 ? columnOrder : [],
            columnAliasMap: (_a = StartupDataStore.Configuration.config) === null || _a === void 0 ? void 0 : _a.attributeAliases,
        };
        queryCount = exportCount;
        cql = DEFAULT_USER_QUERY_OPTIONS.transformFilterTree({
            originalFilterTree: query.get('filterTree'),
            queryRef: query,
        });
        if (ExportInfo.exportSize === 'currentPage') {
            queryCount = pageSize;
            cql = getResultSetCql(results);
        }
        searches = [
            {
                srcs: srcs,
                cql: cql,
                count: queryCount,
                cacheId: cacheId,
            },
        ];
        return [2 /*return*/, {
                phonetics: phonetics,
                spellcheck: spellcheck,
                searches: searches,
                count: exportCount,
                sorts: sorts,
                args: args,
            }];
    });
}); };
var TableExports = function (_a) {
    var selectionInterface = _a.selectionInterface, onClose = _a.onClose, setExportSuccessful = _a.setExportSuccessful, exportSuccessful = _a.exportSuccessful;
    var exportLimit = StartupDataStore.Configuration.getExportLimit();
    var _b = __read(useState([]), 2), formats = _b[0], setFormats = _b[1];
    var _c = __read(useState(''), 2), exportFormat = _c[0], setExportFormat = _c[1];
    var _d = __read(useState('all'), 2), exportSize = _d[0], setExportSize = _d[1];
    var _f = __read(useState(''), 2), warning = _f[0], setWarning = _f[1];
    var _g = __read(useState(exportLimit), 2), customExportCount = _g[0], setCustomExportCount = _g[1];
    var _h = __read(useState(false), 2), loading = _h[0], setLoading = _h[1];
    var onExportClick = function (addSnack, ExportInfo) { return __awaiter(void 0, void 0, void 0, function () {
        var exportFormat, body, response, data, contentType, filename, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    exportFormat = encodeURIComponent(ExportInfo.exportFormat);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    setLoading(true);
                    return [4 /*yield*/, getExportBody(ExportInfo)];
                case 2:
                    body = _a.sent();
                    return [4 /*yield*/, exportResultSet(exportFormat, body)];
                case 3:
                    response = _a.sent();
                    if (!(response.status === 200)) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.blob()];
                case 4:
                    data = _a.sent();
                    contentType = response.headers.get('content-type');
                    filename = contentDisposition.parse(response.headers.get('content-disposition')).parameters.filename;
                    OverridableSaveFile.get()(filename, 'data:' + contentType, data);
                    setExportSuccessful(true);
                    return [3 /*break*/, 6];
                case 5:
                    setExportSuccessful(false);
                    addSnack('Error: Could not export results.', {
                        alertProps: { severity: 'error' },
                    });
                    _a.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_1 = _a.sent();
                    console.error(error_1);
                    setExportSuccessful(false);
                    return [3 /*break*/, 9];
                case 8:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    if (exportSuccessful) {
        onClose();
    }
    var exportSizes = [
        {
            label: 'Current Page',
            value: 'currentPage',
        },
        {
            label: 'All Results',
            value: 'all',
        },
        {
            label: 'Specific Number of Results',
            value: 'custom',
        },
    ];
    var addSnack = useSnack();
    useEffect(function () {
        var fetchFormats = function () { return __awaiter(void 0, void 0, void 0, function () {
            var formats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getExportOptions(Transformer.Query)];
                    case 1:
                        formats = _a.sent();
                        setFormats(formats.map(function (exportFormat) { return ({
                            label: exportFormat.displayName,
                            value: exportFormat.id,
                        }); }));
                        formats.length && setExportFormat(formats[0].id);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchFormats();
    }, []);
    useEffect(function () {
        setWarning(getWarning({
            exportSize: exportSize,
            selectionInterface: selectionInterface,
            customExportCount: customExportCount,
        }));
    }, [exportSize, customExportCount]);
    return formats.length === 0 ? (React.createElement(LinearProgress, { className: "w-full h-2" })) : (React.createElement(React.Fragment, null,
        React.createElement(DialogContent, null,
            React.createElement(DialogContentText, null,
                React.createElement("div", { className: "p-4", style: { minWidth: '400px' } },
                    React.createElement("div", { className: "pt-2" },
                        React.createElement(Autocomplete, { size: "small", options: exportSizes, onChange: function (_e, newValue) {
                                setExportSize(newValue.value);
                            }, isOptionEqualToValue: function (option) { return option.value === exportSize; }, getOptionLabel: function (option) {
                                return option.label;
                            }, disableClearable: true, value: exportSizes.find(function (choice) { return choice.value === exportSize; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Export", variant: "outlined" }))); } })),
                    exportSize === 'custom' ? (React.createElement("div", { className: "pt-2" },
                        React.createElement(TextField, { fullWidth: true, size: "small", type: "number", label: "", placeholder: "Enter number of results you would like to export", name: "customExport", value: customExportCount, onChange: function (e) {
                                setCustomExportCount(Number(e.target.value));
                            }, variant: "outlined" }))) : (React.createElement("div", null)),
                    React.createElement("div", { className: "pt-2 export-format" },
                        React.createElement(Autocomplete, { size: "small", options: formats, onChange: function (_e, newValue) {
                                setExportFormat(newValue.value);
                            }, isOptionEqualToValue: function (option) { return option.value === exportFormat; }, getOptionLabel: function (option) {
                                return option.label;
                            }, disableClearable: true, value: formats.find(function (choice) { return choice.value === exportFormat; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "as", variant: "outlined" }))); } })),
                    ['csv', 'rtf', 'xlsx'].includes(exportFormat) ? (React.createElement(SummaryManageAttributes, { isExport: true })) : null,
                    warning && (React.createElement("div", { className: "warning text-center pt-1" },
                        React.createElement("i", { className: "fa fa-warning" }),
                        React.createElement("span", null, warning)))))),
        React.createElement(DialogActions, null,
            React.createElement("div", { className: "pt-2", style: { display: 'flex', justifyContent: 'flex-end' } },
                React.createElement(Button, { className: "mr-2", disabled: loading, variant: "text", onClick: function () {
                        onClose();
                    } }, "Cancel"),
                React.createElement(ProgressButton, { variant: "contained", color: "primary", loading: loading, disabled: loading &&
                        exportSize === 'custom' &&
                        customExportCount > exportLimit, onClick: function () {
                        onExportClick(addSnack, {
                            exportFormat: exportFormat,
                            exportSize: exportSize,
                            customExportCount: customExportCount,
                            selectionInterface: selectionInterface,
                        });
                    } }, "Export")))));
};
export default TableExports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC90YWJsZS1leHBvcnQvdGFibGUtZXhwb3J0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQzNDLG1KQUFtSjtBQUNuSixPQUFPLGtCQUFrQixNQUFNLHFCQUFxQixDQUFBO0FBQ3BELE9BQU8sY0FBYyxNQUFNLDhCQUE4QixDQUFBO0FBQ3pELE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sUUFBUSxNQUFNLG1CQUFtQixDQUFBO0FBRXhDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLHlCQUF5QixFQUN6QixlQUFlLEdBSWhCLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxJQUFJLE1BQU0sMENBQTBDLENBQUE7QUFDM0QsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFFdEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBQ2pFLE9BQU8sdUJBQXVCLE1BQU0sMkVBQTJFLENBQUE7QUFDL0csT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0saURBQWlELENBQUE7QUFDckYsT0FBTyxjQUFjLE1BQU0sdURBQXVELENBQUE7QUFDbEYsT0FBTyxhQUFhLE1BQU0sMkNBQTJDLENBQUE7QUFDckUsT0FBTyxhQUFhLE1BQU0s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QUFDLHVCQUF1QixJQUFDLFFBQVEsRUFBRSxJQUFJLEdBQUksQ0FDNUMsQ0FBQyxDQUFDLENBQUMsSUFBSTtvQkFDUCxPQUFPLElBQUksQ0FDViw2QkFBSyxTQUFTLEVBQUMsMEJBQTBCO3dCQUN2QywyQkFBRyxTQUFTLEVBQUMsZUFBZSxHQUFHO3dCQUMvQixrQ0FBTyxPQUFPLENBQVEsQ0FDbEIsQ0FDUCxDQUNHLENBQ1ksQ0FDTjtRQUNoQixvQkFBQyxhQUFhO1lBQ1osNkJBQ0UsU0FBUyxFQUFDLE1BQU0sRUFDaEIsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFO2dCQUV0RCxvQkFBQyxNQUFNLElBQ0wsU0FBUyxFQUFDLE1BQU0sRUFDaEIsUUFBUSxFQUFFLE9BQU8sRUFDakIsT0FBTyxFQUFDLE1BQU0sRUFDZCxPQUFPLEVBQUU7d0JBQ1AsT0FBTyxFQUFFLENBQUE7b0JBQ1gsQ0FBQyxhQUdNO2dCQUNULG9CQUFDLGNBQWMsSUFDYixPQUFPLEVBQUMsV0FBVyxFQUNuQixLQUFLLEVBQUMsU0FBUyxFQUNmLE9BQU8sRUFBRSxPQUFPLEVBQ2hCLFFBQVEsRUFDTixPQUFPO3dCQUNQLFVBQVUsS0FBSyxRQUFRO3dCQUN2QixpQkFBaUIsR0FBRyxXQUFXLEVBRWpDLE9BQU8sRUFBRTt3QkFDUCxhQUFhLENBQUMsUUFBUSxFQUFFOzRCQUN0QixZQUFZLGNBQUE7NEJBQ1osVUFBVSxZQUFBOzRCQUNWLGlCQUFpQixtQkFBQTs0QkFDakIsa0JBQWtCLG9CQUFBO3lCQUNuQixDQUFDLENBQUE7b0JBQ0osQ0FBQyxhQUdjLENBQ2IsQ0FDUSxDQUNmLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsWUFBWSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2NvbnQuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IGNvbnRlbnREaXNwb3NpdGlvbiBmcm9tICdjb250ZW50LWRpc3Bvc2l0aW9uJ1xuaW1wb3J0IExpbmVhclByb2dyZXNzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTGluZWFyUHJvZ3Jlc3MnXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgdXNlU25hY2sgZnJvbSAnLi4vaG9va3MvdXNlU25hY2snXG5pbXBvcnQgeyBBZGRTbmFjayB9IGZyb20gJy4uL3NuYWNrL3NuYWNrLnByb3ZpZGVyJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7XG4gIGdldEV4cG9ydE9wdGlvbnMsXG4gIFRyYW5zZm9ybWVyLFxuICBPdmVycmlkYWJsZUdldENvbHVtbk9yZGVyLFxuICBleHBvcnRSZXN1bHRTZXQsXG4gIEV4cG9ydENvdW50SW5mbyxcbiAgRXhwb3J0SW5mbyxcbiAgRXhwb3J0Rm9ybWF0LFxufSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvZXhwb3J0J1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCB7IERFRkFVTFRfVVNFUl9RVUVSWV9PUFRJT05TIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvVHlwZWRRdWVyeSdcblxuaW1wb3J0IHsgZ2V0UmVzdWx0U2V0Q3FsIH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2NxbCdcbmltcG9ydCBTdW1tYXJ5TWFuYWdlQXR0cmlidXRlcyBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvc3VtbWFyeS1tYW5hZ2UtYXR0cmlidXRlcy9zdW1tYXJ5LW1hbmFnZS1hdHRyaWJ1dGVzJ1xuaW1wb3J0IHsgT3ZlcnJpZGFibGVTYXZlRmlsZSB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9zYXZlLWZpbGUvc2F2ZS1maWxlJ1xuaW1wb3J0IFByb2dyZXNzQnV0dG9uIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9wcm9ncmVzcy1idXR0b24vcHJvZ3Jlc3MtYnV0dG9uJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnQgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dDb250ZW50L0RpYWxvZ0NvbnRlbnQnXG5pbXBvcnQgRGlhbG9nQWN0aW9ucyBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0FjdGlvbnMvRGlhbG9nQWN0aW9ucydcbmltcG9ydCBEaWFsb2dDb250ZW50VGV4dCBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0NvbnRlbnRUZXh0J1xuXG5leHBvcnQgdHlwZSBQcm9wcyA9IHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgb25DbG9zZT86IGFueVxuICBleHBvcnRTdWNjZXNzZnVsPzogYm9vbGVhblxuICBzZXRFeHBvcnRTdWNjZXNzZnVsPzogYW55XG59XG5cbnR5cGUgU291cmNlID0ge1xuICBpZDogc3RyaW5nXG4gIGhpdHM6IG51bWJlclxufVxuXG50eXBlIE9wdGlvbiA9IHtcbiAgbGFiZWw6IHN0cmluZ1xuICB2YWx1ZTogc3RyaW5nXG59XG5cbmZ1bmN0aW9uIGdldFNyY3Moc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnkpIHtcbiAgcmV0dXJuIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5nZXRTZWxlY3RlZFNvdXJjZXMoKVxufVxuXG5mdW5jdGlvbiBnZXRIaWRkZW5GaWVsZHMoKTogc3RyaW5nW10ge1xuICByZXR1cm4gdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCdjb2x1bW5IaWRlJylcbn1cblxuZnVuY3Rpb24gZ2V0U29ydHMoc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnkpIHtcbiAgcmV0dXJuIChcbiAgICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ3Jlc3VsdFNvcnQnKSB8fFxuICAgIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5nZXQoJ3NvcnRzJylcbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRIaXRzKHNvdXJjZXM6IFNvdXJjZVtdKTogbnVtYmVyIHtcbiAgcmV0dXJuIHNvdXJjZXNcbiAgICAuZmlsdGVyKChzb3VyY2UpID0+IHNvdXJjZS5pZCAhPT0gJ2NhY2hlJylcbiAgICAucmVkdWNlKChoaXRzLCBzb3VyY2UpID0+IChzb3VyY2UuaGl0cyA/IGhpdHMgKyBzb3VyY2UuaGl0cyA6IGhpdHMpLCAwKVxufVxuXG5mdW5jdGlvbiBnZXRFeHBvcnRDb3VudCh7XG4gIGV4cG9ydFNpemUsXG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgY3VzdG9tRXhwb3J0Q291bnQsXG59OiBFeHBvcnRDb3VudEluZm8pOiBudW1iZXIge1xuICBpZiAoZXhwb3J0U2l6ZSA9PT0gJ2N1c3RvbScpIHtcbiAgICByZXR1cm4gY3VzdG9tRXhwb3J0Q291bnRcbiAgfVxuICBjb25zdCByZXN1bHQgPSBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuZ2V0KCdyZXN1bHQnKVxuICByZXR1cm4gZXhwb3J0U2l6ZSA9PT0gJ2FsbCdcbiAgICA/IGdldEhpdHMoT2JqZWN0LnZhbHVlcyhyZXN1bHQuZ2V0KCdsYXp5UmVzdWx0cycpLnN0YXR1cykpXG4gICAgOiBPYmplY3Qua2V5cyhyZXN1bHQuZ2V0KCdsYXp5UmVzdWx0cycpLnJlc3VsdHMpLmxlbmd0aFxufVxuXG5leHBvcnQgY29uc3QgZ2V0V2FybmluZyA9IChleHBvcnRDb3VudEluZm86IEV4cG9ydENvdW50SW5mbyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGV4cG9ydFJlc3VsdExpbWl0ID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEV4cG9ydExpbWl0KClcbiAgY29uc3QgZXhwb3J0Q291bnQgPSBnZXRFeHBvcnRDb3VudChleHBvcnRDb3VudEluZm8pXG4gIGNvbnN0IHJlc3VsdCA9IGV4cG9ydENvdW50SW5mby5zZWxlY3Rpb25JbnRlcmZhY2VcbiAgICAuZ2V0Q3VycmVudFF1ZXJ5KClcbiAgICAuZ2V0KCdyZXN1bHQnKVxuICBjb25zdCB0b3RhbEhpdHMgPSBnZXRIaXRzKE9iamVjdC52YWx1ZXMocmVzdWx0LmdldCgnbGF6eVJlc3VsdHMnKS5zdGF0dXMpKVxuICBjb25zdCBsaW1pdFdhcm5pbmcgPSBgWW91IGNhbm5vdCBleHBvcnQgbW9yZSB0aGFuIHRoZSBhZG1pbmlzdHJhdG9yIGNvbmZpZ3VyZWQgbGltaXQgb2YgJHtleHBvcnRSZXN1bHRMaW1pdH0uYFxuICBsZXQgd2FybmluZ01lc3NhZ2UgPSAnJ1xuICBpZiAoZXhwb3J0Q291bnQgPiBleHBvcnRSZXN1bHRMaW1pdCkge1xuICAgIGlmIChleHBvcnRDb3VudEluZm8uZXhwb3J0U2l6ZSA9PT0gJ2N1c3RvbScpIHtcbiAgICAgIHJldHVybiBsaW1pdFdhcm5pbmdcbiAgICB9XG4gICAgd2FybmluZ01lc3NhZ2UgPVxuICAgICAgbGltaXRXYXJuaW5nICtcbiAgICAgIGAgIE9ubHkgJHtleHBvcnRSZXN1bHRMaW1pdH0gJHtcbiAgICAgICAgZXhwb3J0UmVzdWx0TGltaXQgPT09IDEgPyBgcmVzdWx0YCA6IGByZXN1bHRzYFxuICAgICAgfSB3aWxsIGJlIGV4cG9ydGVkLmBcbiAgfVxuICBpZiAoZXhwb3J0Q291bnRJbmZvLmV4cG9ydFNpemUgPT09ICdjdXN0b20nKSB7XG4gICAgaWYgKGV4cG9ydENvdW50ID4gdG90YWxIaXRzKSB7XG4gICAgICB3YXJuaW5nTWVzc2FnZSA9IGBZb3UgYXJlIHRyeWluZyB0byBleHBvcnQgJHtleHBvcnRDb3VudH0gcmVzdWx0cyBidXQgdGhlcmUgJHtcbiAgICAgICAgdG90YWxIaXRzID09PSAxID8gYGlzYCA6IGBhcmVgXG4gICAgICB9IG9ubHkgJHt0b3RhbEhpdHN9LiAgT25seSAke3RvdGFsSGl0c30gJHtcbiAgICAgICAgdG90YWxIaXRzID09PSAxID8gYHJlc3VsdGAgOiBgcmVzdWx0c2BcbiAgICAgIH0gd2lsbCBiZSBleHBvcnRlZC5gXG4gICAgfVxuICB9XG4gIGlmICh0b3RhbEhpdHMgPiAxMDAgJiYgZXhwb3J0Q291bnQgPiAxMDAgJiYgZXhwb3J0UmVzdWx0TGltaXQgPiAxMDApIHtcbiAgICB3YXJuaW5nTWVzc2FnZSArPSBgICBUaGlzIG1heSB0YWtlIGEgbG9uZyB0aW1lLmBcbiAgfVxuICByZXR1cm4gd2FybmluZ01lc3NhZ2Vcbn1cblxuZXhwb3J0IGNvbnN0IGdldEV4cG9ydEJvZHkgPSBhc3luYyAoRXhwb3J0SW5mbzogRXhwb3J0SW5mbykgPT4ge1xuICBjb25zdCB7IGV4cG9ydFNpemUsIGN1c3RvbUV4cG9ydENvdW50LCBzZWxlY3Rpb25JbnRlcmZhY2UgfSA9IEV4cG9ydEluZm9cbiAgY29uc3QgZXhwb3J0UmVzdWx0TGltaXQgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RXhwb3J0TGltaXQoKVxuICBjb25zdCBoaWRkZW5GaWVsZHMgPSBnZXRIaWRkZW5GaWVsZHMoKVxuICBjb25zdCBjb2x1bW5PcmRlciA9IE92ZXJyaWRhYmxlR2V0Q29sdW1uT3JkZXIuZ2V0KCkoKVxuICBjb25zdCBzcmNzID0gZ2V0U3JjcyhzZWxlY3Rpb25JbnRlcmZhY2UpXG4gIGNvbnN0IHNvcnRzID0gZ2V0U29ydHMoc2VsZWN0aW9uSW50ZXJmYWNlKVxuICBjb25zdCBxdWVyeSA9IHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKVxuICBjb25zdCBjYWNoZUlkID0gcXVlcnkuZ2V0KCdjYWNoZUlkJylcbiAgY29uc3QgcGhvbmV0aWNzID0gcXVlcnkuZ2V0KCdwaG9uZXRpY3MnKVxuICBjb25zdCBzcGVsbGNoZWNrID0gcXVlcnkuZ2V0KCdzcGVsbGNoZWNrJylcbiAgY29uc3QgcmVzdWx0cyA9IE9iamVjdC5rZXlzKHF1ZXJ5LmdldCgncmVzdWx0JykuZ2V0KCdsYXp5UmVzdWx0cycpLnJlc3VsdHMpXG4gIGNvbnN0IHBhZ2VTaXplID0gcmVzdWx0cy5sZW5ndGhcbiAgY29uc3QgZXhwb3J0Q291bnQgPSBNYXRoLm1pbihcbiAgICBnZXRFeHBvcnRDb3VudCh7IGV4cG9ydFNpemUsIHNlbGVjdGlvbkludGVyZmFjZSwgY3VzdG9tRXhwb3J0Q291bnQgfSksXG4gICAgZXhwb3J0UmVzdWx0TGltaXRcbiAgKVxuICBjb25zdCBhcmdzID0ge1xuICAgIGhpZGRlbkZpZWxkczogaGlkZGVuRmllbGRzLmxlbmd0aCA+IDAgPyBoaWRkZW5GaWVsZHMgOiBbXSxcbiAgICBjb2x1bW5PcmRlcjogY29sdW1uT3JkZXIubGVuZ3RoID4gMCA/IGNvbHVtbk9yZGVyIDogW10sXG4gICAgY29sdW1uQWxpYXNNYXA6IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWc/LmF0dHJpYnV0ZUFsaWFzZXMsXG4gIH1cblxuICBsZXQgcXVlcnlDb3VudCA9IGV4cG9ydENvdW50XG4gIGxldCBjcWwgPSBERUZBVUxUX1VTRVJfUVVFUllfT1BUSU9OUy50cmFuc2Zvcm1GaWx0ZXJUcmVlKHtcbiAgICBvcmlnaW5hbEZpbHRlclRyZWU6IHF1ZXJ5LmdldCgnZmlsdGVyVHJlZScpLFxuICAgIHF1ZXJ5UmVmOiBxdWVyeSxcbiAgfSlcbiAgaWYgKEV4cG9ydEluZm8uZXhwb3J0U2l6ZSA9PT0gJ2N1cnJlbnRQYWdlJykge1xuICAgIHF1ZXJ5Q291bnQgPSBwYWdlU2l6ZVxuICAgIGNxbCA9IGdldFJlc3VsdFNldENxbChyZXN1bHRzKVxuICB9XG5cbiAgY29uc3Qgc2VhcmNoZXMgPSBbXG4gICAge1xuICAgICAgc3JjcyxcbiAgICAgIGNxbCxcbiAgICAgIGNvdW50OiBxdWVyeUNvdW50LFxuICAgICAgY2FjaGVJZCxcbiAgICB9LFxuICBdXG5cbiAgcmV0dXJuIHtcbiAgICBwaG9uZXRpY3MsXG4gICAgc3BlbGxjaGVjayxcbiAgICBzZWFyY2hlcyxcbiAgICBjb3VudDogZXhwb3J0Q291bnQsXG4gICAgc29ydHMsXG4gICAgYXJncyxcbiAgfVxufVxuXG5jb25zdCBUYWJsZUV4cG9ydHMgPSAoe1xuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIG9uQ2xvc2UsXG4gIHNldEV4cG9ydFN1Y2Nlc3NmdWwsXG4gIGV4cG9ydFN1Y2Nlc3NmdWwsXG59OiBQcm9wcykgPT4ge1xuICBjb25zdCBleHBvcnRMaW1pdCA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRFeHBvcnRMaW1pdCgpXG4gIGNvbnN0IFtmb3JtYXRzLCBzZXRGb3JtYXRzXSA9IHVzZVN0YXRlPE9wdGlvbltdPihbXSlcbiAgY29uc3QgW2V4cG9ydEZvcm1hdCwgc2V0RXhwb3J0Rm9ybWF0XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbZXhwb3J0U2l6ZSwgc2V0RXhwb3J0U2l6ZV0gPSB1c2VTdGF0ZSgnYWxsJylcbiAgY29uc3QgW3dhcm5pbmcsIHNldFdhcm5pbmddID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtjdXN0b21FeHBvcnRDb3VudCwgc2V0Q3VzdG9tRXhwb3J0Q291bnRdID0gdXNlU3RhdGUoZXhwb3J0TGltaXQpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IG9uRXhwb3J0Q2xpY2sgPSBhc3luYyAoYWRkU25hY2s6IEFkZFNuYWNrLCBFeHBvcnRJbmZvOiBFeHBvcnRJbmZvKSA9PiB7XG4gICAgY29uc3QgZXhwb3J0Rm9ybWF0ID0gZW5jb2RlVVJJQ29tcG9uZW50KEV4cG9ydEluZm8uZXhwb3J0Rm9ybWF0KVxuICAgIHRyeSB7XG4gICAgICBzZXRMb2FkaW5nKHRydWUpXG4gICAgICBjb25zdCBib2R5ID0gYXdhaXQgZ2V0RXhwb3J0Qm9keShFeHBvcnRJbmZvKVxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBleHBvcnRSZXN1bHRTZXQoZXhwb3J0Rm9ybWF0LCBib2R5KVxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5ibG9iKClcbiAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJylcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBjb250ZW50RGlzcG9zaXRpb24ucGFyc2UoXG4gICAgICAgICAgcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtZGlzcG9zaXRpb24nKVxuICAgICAgICApLnBhcmFtZXRlcnMuZmlsZW5hbWVcbiAgICAgICAgT3ZlcnJpZGFibGVTYXZlRmlsZS5nZXQoKShmaWxlbmFtZSwgJ2RhdGE6JyArIGNvbnRlbnRUeXBlLCBkYXRhKVxuICAgICAgICBzZXRFeHBvcnRTdWNjZXNzZnVsKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRFeHBvcnRTdWNjZXNzZnVsKGZhbHNlKVxuICAgICAgICBhZGRTbmFjaygnRXJyb3I6IENvdWxkIG5vdCBleHBvcnQgcmVzdWx0cy4nLCB7XG4gICAgICAgICAgYWxlcnRQcm9wczogeyBzZXZlcml0eTogJ2Vycm9yJyB9LFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgc2V0RXhwb3J0U3VjY2Vzc2Z1bChmYWxzZSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICBpZiAoZXhwb3J0U3VjY2Vzc2Z1bCkge1xuICAgIG9uQ2xvc2UoKVxuICB9XG5cbiAgY29uc3QgZXhwb3J0U2l6ZXM6IE9wdGlvbltdID0gW1xuICAgIHtcbiAgICAgIGxhYmVsOiAnQ3VycmVudCBQYWdlJyxcbiAgICAgIHZhbHVlOiAnY3VycmVudFBhZ2UnLFxuICAgIH0sXG4gICAge1xuICAgICAgbGFiZWw6ICdBbGwgUmVzdWx0cycsXG4gICAgICB2YWx1ZTogJ2FsbCcsXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogJ1NwZWNpZmljIE51bWJlciBvZiBSZXN1bHRzJyxcbiAgICAgIHZhbHVlOiAnY3VzdG9tJyxcbiAgICB9LFxuICBdXG5cbiAgY29uc3QgYWRkU25hY2sgPSB1c2VTbmFjaygpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZmV0Y2hGb3JtYXRzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZm9ybWF0cyA9IGF3YWl0IGdldEV4cG9ydE9wdGlvbnMoVHJhbnNmb3JtZXIuUXVlcnkpXG5cbiAgICAgIHNldEZvcm1hdHMoXG4gICAgICAgIGZvcm1hdHMubWFwKChleHBvcnRGb3JtYXQ6IEV4cG9ydEZvcm1hdCkgPT4gKHtcbiAgICAgICAgICBsYWJlbDogZXhwb3J0Rm9ybWF0LmRpc3BsYXlOYW1lLFxuICAgICAgICAgIHZhbHVlOiBleHBvcnRGb3JtYXQuaWQsXG4gICAgICAgIH0pKVxuICAgICAgKVxuXG4gICAgICBmb3JtYXRzLmxlbmd0aCAmJiBzZXRFeHBvcnRGb3JtYXQoZm9ybWF0c1swXS5pZClcbiAgICB9XG4gICAgZmV0Y2hGb3JtYXRzKClcbiAgfSwgW10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRXYXJuaW5nKFxuICAgICAgZ2V0V2FybmluZyh7XG4gICAgICAgIGV4cG9ydFNpemUsXG4gICAgICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgICAgICAgY3VzdG9tRXhwb3J0Q291bnQsXG4gICAgICB9KVxuICAgIClcbiAgfSwgW2V4cG9ydFNpemUsIGN1c3RvbUV4cG9ydENvdW50XSlcblxuICByZXR1cm4gZm9ybWF0cy5sZW5ndGggPT09IDAgPyAoXG4gICAgPExpbmVhclByb2dyZXNzIGNsYXNzTmFtZT1cInctZnVsbCBoLTJcIiAvPlxuICApIDogKFxuICAgIDw+XG4gICAgICA8RGlhbG9nQ29udGVudD5cbiAgICAgICAgPERpYWxvZ0NvbnRlbnRUZXh0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC00XCIgc3R5bGU9e3sgbWluV2lkdGg6ICc0MDBweCcgfX0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTJcIj5cbiAgICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgb3B0aW9ucz17ZXhwb3J0U2l6ZXN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhfZTogYW55LCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgc2V0RXhwb3J0U2l6ZShuZXdWYWx1ZS52YWx1ZSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IGV4cG9ydFNpemV9XG4gICAgICAgICAgICAgICAgZ2V0T3B0aW9uTGFiZWw9eyhvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24ubGFiZWxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgICAgICAgICB2YWx1ZT17ZXhwb3J0U2l6ZXMuZmluZChcbiAgICAgICAgICAgICAgICAgIChjaG9pY2UpID0+IGNob2ljZS52YWx1ZSA9PT0gZXhwb3J0U2l6ZVxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IChcbiAgICAgICAgICAgICAgICAgIDxUZXh0RmllbGQgey4uLnBhcmFtc30gbGFiZWw9XCJFeHBvcnRcIiB2YXJpYW50PVwib3V0bGluZWRcIiAvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtleHBvcnRTaXplID09PSAnY3VzdG9tJyA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yXCI+XG4gICAgICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICBsYWJlbD1cIlwiXG4gICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIG51bWJlciBvZiByZXN1bHRzIHlvdSB3b3VsZCBsaWtlIHRvIGV4cG9ydFwiXG4gICAgICAgICAgICAgICAgICBuYW1lPVwiY3VzdG9tRXhwb3J0XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtjdXN0b21FeHBvcnRDb3VudH1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRDdXN0b21FeHBvcnRDb3VudChOdW1iZXIoZS50YXJnZXQudmFsdWUpKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yIGV4cG9ydC1mb3JtYXRcIj5cbiAgICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgb3B0aW9ucz17Zm9ybWF0c31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KF9lOiBhbnksIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRFeHBvcnRGb3JtYXQobmV3VmFsdWUudmFsdWUpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBpc09wdGlvbkVxdWFsVG9WYWx1ZT17KG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBleHBvcnRGb3JtYXR9XG4gICAgICAgICAgICAgICAgZ2V0T3B0aW9uTGFiZWw9eyhvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24ubGFiZWxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgICAgICAgICB2YWx1ZT17Zm9ybWF0cy5maW5kKChjaG9pY2UpID0+IGNob2ljZS52YWx1ZSA9PT0gZXhwb3J0Rm9ybWF0KX1cbiAgICAgICAgICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4gKFxuICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZCB7Li4ucGFyYW1zfSBsYWJlbD1cImFzXCIgdmFyaWFudD1cIm91dGxpbmVkXCIgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7Wydjc3YnLCAncnRmJywgJ3hsc3gnXS5pbmNsdWRlcyhleHBvcnRGb3JtYXQpID8gKFxuICAgICAgICAgICAgICA8U3VtbWFyeU1hbmFnZUF0dHJpYnV0ZXMgaXNFeHBvcnQ9e3RydWV9IC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIHt3YXJuaW5nICYmIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3YXJuaW5nIHRleHQtY2VudGVyIHB0LTFcIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS13YXJuaW5nXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj57d2FybmluZ308L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9EaWFsb2dDb250ZW50VGV4dD5cbiAgICAgIDwvRGlhbG9nQ29udGVudD5cbiAgICAgIDxEaWFsb2dBY3Rpb25zPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPVwicHQtMlwiXG4gICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXItMlwiXG4gICAgICAgICAgICBkaXNhYmxlZD17bG9hZGluZ31cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgb25DbG9zZSgpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDxQcm9ncmVzc0J1dHRvblxuICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgICAgICAgIGRpc2FibGVkPXtcbiAgICAgICAgICAgICAgbG9hZGluZyAmJlxuICAgICAgICAgICAgICBleHBvcnRTaXplID09PSAnY3VzdG9tJyAmJlxuICAgICAgICAgICAgICBjdXN0b21FeHBvcnRDb3VudCA+IGV4cG9ydExpbWl0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIG9uRXhwb3J0Q2xpY2soYWRkU25hY2ssIHtcbiAgICAgICAgICAgICAgICBleHBvcnRGb3JtYXQsXG4gICAgICAgICAgICAgICAgZXhwb3J0U2l6ZSxcbiAgICAgICAgICAgICAgICBjdXN0b21FeHBvcnRDb3VudCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIEV4cG9ydFxuICAgICAgICAgIDwvUHJvZ3Jlc3NCdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgIDwvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhYmxlRXhwb3J0c1xuIl19