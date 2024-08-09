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
    var exportSize, customExportCount, selectionInterface, exportResultLimit, hiddenFields, columnOrder, srcs, sorts, query, cacheId, phonetics, spellcheck, exportCount, args, searches, queryCount, cql, resultIdSourcePairs, srcMap_1;
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
        exportCount = Math.min(getExportCount({ exportSize: exportSize, selectionInterface: selectionInterface, customExportCount: customExportCount }), exportResultLimit);
        args = {
            hiddenFields: hiddenFields.length > 0 ? hiddenFields : [],
            columnOrder: columnOrder.length > 0 ? columnOrder : [],
            columnAliasMap: (_a = StartupDataStore.Configuration.config) === null || _a === void 0 ? void 0 : _a.attributeAliases,
        };
        searches = [];
        queryCount = exportCount;
        cql = DEFAULT_USER_QUERY_OPTIONS.transformFilterTree({
            originalFilterTree: query.get('filterTree'),
            queryRef: query,
        });
        if (ExportInfo.exportSize === 'currentPage') {
            resultIdSourcePairs = Object.values(query.get('result').get('lazyResults').results).map(function (result) { return ({
                id: result.plain.metacard.properties['id'],
                sourceId: result.plain.metacard.properties['source-id'],
            }); });
            srcMap_1 = resultIdSourcePairs.reduce(function (srcMap, curPair) {
                if (!srcMap[curPair.sourceId]) {
                    srcMap[curPair.sourceId] = [];
                }
                srcMap[curPair.sourceId].push(curPair.id);
                return srcMap;
            }, {});
            Object.keys(srcMap_1).forEach(function (src) {
                searches.push({
                    srcs: [src],
                    cql: getResultSetCql(srcMap_1[src]),
                    count: srcMap_1[src].length,
                    cacheId: cacheId,
                });
            });
        }
        else {
            searches.push({
                srcs: srcs,
                cql: cql,
                count: queryCount,
                cacheId: cacheId,
            });
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC90YWJsZS1leHBvcnQvdGFibGUtZXhwb3J0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQzNDLG1KQUFtSjtBQUNuSixPQUFPLGtCQUFrQixNQUFNLHFCQUFxQixDQUFBO0FBQ3BELE9BQU8sY0FBYyxNQUFNLDhCQUE4QixDQUFBO0FBQ3pELE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sUUFBUSxNQUFNLG1CQUFtQixDQUFBO0FBRXhDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLE9BQU8sRUFDTCxnQkFBZ0IsRUFDaEIsV0FBVyxFQUNYLHlCQUF5QixFQUN6QixlQUFlLEdBSWhCLE1BQU0sb0NBQW9DLENBQUE7QUFDM0MsT0FBTyxJQUFJLE1BQU0sMENBQTBDLENBQUE7QUFDM0QsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFFdEUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlDQUFpQyxDQUFBO0FBQ2pFLE9BQU8sdUJBQXVCLE1BQU0sMkVBQTJFLENBQUE7QUFDL0csT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0saURBQWlELENBQUE7QUFDckYsT0FBTyxjQUFjLE1BQU0sdURBQXVELENBQUE7QUFDbEYsT0FBTyxhQUFhLE1BQU0sMkNBQTJDLENBQUE7QUFDckUsT0FBTyxhQUFhLE1BQU0s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Q2hCLG9CQUFDLGFBQWE7WUFDWiw2QkFDRSxTQUFTLEVBQUMsTUFBTSxFQUNoQixLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUU7Z0JBRXRELG9CQUFDLE1BQU0sSUFDTCxTQUFTLEVBQUMsTUFBTSxFQUNoQixRQUFRLEVBQUUsT0FBTyxFQUNqQixPQUFPLEVBQUMsTUFBTSxFQUNkLE9BQU8sRUFBRTt3QkFDUCxPQUFPLEVBQUUsQ0FBQTtvQkFDWCxDQUFDLGFBR007Z0JBQ1Qsb0JBQUMsY0FBYyxJQUNiLE9BQU8sRUFBQyxXQUFXLEVBQ25CLEtBQUssRUFBQyxTQUFTLEVBQ2YsT0FBTyxFQUFFLE9BQU8sRUFDaEIsUUFBUSxFQUNOLE9BQU87d0JBQ1AsVUFBVSxLQUFLLFFBQVE7d0JBQ3ZCLGlCQUFpQixHQUFHLFdBQVcsRUFFakMsT0FBTyxFQUFFO3dCQUNQLGFBQWEsQ0FBQyxRQUFRLEVBQUU7NEJBQ3RCLFlBQVksY0FBQTs0QkFDWixVQUFVLFlBQUE7NEJBQ1YsaUJBQWlCLG1CQUFBOzRCQUNqQixrQkFBa0Isb0JBQUE7eUJBQ25CLENBQUMsQ0FBQTtvQkFDSixDQUFDLGFBR2MsQ0FDYixDQUNRLENBQ2YsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxZQUFZLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnY29udC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgY29udGVudERpc3Bvc2l0aW9uIGZyb20gJ2NvbnRlbnQtZGlzcG9zaXRpb24nXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQXV0b2NvbXBsZXRlJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmltcG9ydCB1c2VTbmFjayBmcm9tICcuLi9ob29rcy91c2VTbmFjaydcbmltcG9ydCB7IEFkZFNuYWNrIH0gZnJvbSAnLi4vc25hY2svc25hY2sucHJvdmlkZXInXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHtcbiAgZ2V0RXhwb3J0T3B0aW9ucyxcbiAgVHJhbnNmb3JtZXIsXG4gIE92ZXJyaWRhYmxlR2V0Q29sdW1uT3JkZXIsXG4gIGV4cG9ydFJlc3VsdFNldCxcbiAgRXhwb3J0Q291bnRJbmZvLFxuICBFeHBvcnRJbmZvLFxuICBFeHBvcnRGb3JtYXQsXG59IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9leHBvcnQnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IHsgREVGQVVMVF9VU0VSX1FVRVJZX09QVElPTlMgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9UeXBlZFF1ZXJ5J1xuXG5pbXBvcnQgeyBnZXRSZXN1bHRTZXRDcWwgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvY3FsJ1xuaW1wb3J0IFN1bW1hcnlNYW5hZ2VBdHRyaWJ1dGVzIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9zdW1tYXJ5LW1hbmFnZS1hdHRyaWJ1dGVzL3N1bW1hcnktbWFuYWdlLWF0dHJpYnV0ZXMnXG5pbXBvcnQgeyBPdmVycmlkYWJsZVNhdmVGaWxlIH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL3NhdmUtZmlsZS9zYXZlLWZpbGUnXG5pbXBvcnQgUHJvZ3Jlc3NCdXR0b24gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3Byb2dyZXNzLWJ1dHRvbi9wcm9ncmVzcy1idXR0b24nXG5pbXBvcnQgRGlhbG9nQ29udGVudCBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0NvbnRlbnQvRGlhbG9nQ29udGVudCdcbmltcG9ydCBEaWFsb2dBY3Rpb25zIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQWN0aW9ucy9EaWFsb2dBY3Rpb25zJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnRUZXh0IGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQ29udGVudFRleHQnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuXG5leHBvcnQgdHlwZSBQcm9wcyA9IHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgb25DbG9zZT86IGFueVxuICBleHBvcnRTdWNjZXNzZnVsPzogYm9vbGVhblxuICBzZXRFeHBvcnRTdWNjZXNzZnVsPzogYW55XG59XG5cbnR5cGUgU291cmNlID0ge1xuICBpZDogc3RyaW5nXG4gIGhpdHM6IG51bWJlclxufVxuXG50eXBlIE9wdGlvbiA9IHtcbiAgbGFiZWw6IHN0cmluZ1xuICB2YWx1ZTogc3RyaW5nXG59XG5cbmZ1bmN0aW9uIGdldFNyY3Moc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnkpIHtcbiAgcmV0dXJuIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5nZXRTZWxlY3RlZFNvdXJjZXMoKVxufVxuXG5mdW5jdGlvbiBnZXRIaWRkZW5GaWVsZHMoKTogc3RyaW5nW10ge1xuICByZXR1cm4gdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCdjb2x1bW5IaWRlJylcbn1cblxuZnVuY3Rpb24gZ2V0U29ydHMoc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnkpIHtcbiAgcmV0dXJuIChcbiAgICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ3Jlc3VsdFNvcnQnKSB8fFxuICAgIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5nZXQoJ3NvcnRzJylcbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRIaXRzKHNvdXJjZXM6IFNvdXJjZVtdKTogbnVtYmVyIHtcbiAgcmV0dXJuIHNvdXJjZXNcbiAgICAuZmlsdGVyKChzb3VyY2UpID0+IHNvdXJjZS5pZCAhPT0gJ2NhY2hlJylcbiAgICAucmVkdWNlKChoaXRzLCBzb3VyY2UpID0+IChzb3VyY2UuaGl0cyA/IGhpdHMgKyBzb3VyY2UuaGl0cyA6IGhpdHMpLCAwKVxufVxuZnVuY3Rpb24gZ2V0RXhwb3J0Q291bnQoe1xuICBleHBvcnRTaXplLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIGN1c3RvbUV4cG9ydENvdW50LFxufTogRXhwb3J0Q291bnRJbmZvKTogbnVtYmVyIHtcbiAgaWYgKGV4cG9ydFNpemUgPT09ICdjdXN0b20nKSB7XG4gICAgcmV0dXJuIGN1c3RvbUV4cG9ydENvdW50XG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpLmdldCgncmVzdWx0JylcbiAgcmV0dXJuIGV4cG9ydFNpemUgPT09ICdhbGwnXG4gICAgPyBnZXRIaXRzKE9iamVjdC52YWx1ZXMocmVzdWx0LmdldCgnbGF6eVJlc3VsdHMnKS5zdGF0dXMpKVxuICAgIDogT2JqZWN0LmtleXMocmVzdWx0LmdldCgnbGF6eVJlc3VsdHMnKS5yZXN1bHRzKS5sZW5ndGhcbn1cblxuZXhwb3J0IGNvbnN0IGdldFdhcm5pbmcgPSAoZXhwb3J0Q291bnRJbmZvOiBFeHBvcnRDb3VudEluZm8pOiBzdHJpbmcgPT4ge1xuICBjb25zdCBleHBvcnRSZXN1bHRMaW1pdCA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRFeHBvcnRMaW1pdCgpXG4gIGNvbnN0IGV4cG9ydENvdW50ID0gZ2V0RXhwb3J0Q291bnQoZXhwb3J0Q291bnRJbmZvKVxuICBjb25zdCByZXN1bHQgPSBleHBvcnRDb3VudEluZm8uc2VsZWN0aW9uSW50ZXJmYWNlXG4gICAgLmdldEN1cnJlbnRRdWVyeSgpXG4gICAgLmdldCgncmVzdWx0JylcbiAgY29uc3QgdG90YWxIaXRzID0gZ2V0SGl0cyhPYmplY3QudmFsdWVzKHJlc3VsdC5nZXQoJ2xhenlSZXN1bHRzJykuc3RhdHVzKSlcbiAgY29uc3QgbGltaXRXYXJuaW5nID0gYFlvdSBjYW5ub3QgZXhwb3J0IG1vcmUgdGhhbiB0aGUgYWRtaW5pc3RyYXRvciBjb25maWd1cmVkIGxpbWl0IG9mICR7ZXhwb3J0UmVzdWx0TGltaXR9LmBcbiAgbGV0IHdhcm5pbmdNZXNzYWdlID0gJydcbiAgaWYgKGV4cG9ydENvdW50ID4gZXhwb3J0UmVzdWx0TGltaXQpIHtcbiAgICBpZiAoZXhwb3J0Q291bnRJbmZvLmV4cG9ydFNpemUgPT09ICdjdXN0b20nKSB7XG4gICAgICByZXR1cm4gbGltaXRXYXJuaW5nXG4gICAgfVxuICAgIHdhcm5pbmdNZXNzYWdlID1cbiAgICAgIGxpbWl0V2FybmluZyArXG4gICAgICBgICBPbmx5ICR7ZXhwb3J0UmVzdWx0TGltaXR9ICR7XG4gICAgICAgIGV4cG9ydFJlc3VsdExpbWl0ID09PSAxID8gYHJlc3VsdGAgOiBgcmVzdWx0c2BcbiAgICAgIH0gd2lsbCBiZSBleHBvcnRlZC5gXG4gIH1cbiAgaWYgKGV4cG9ydENvdW50SW5mby5leHBvcnRTaXplID09PSAnY3VzdG9tJykge1xuICAgIGlmIChleHBvcnRDb3VudCA+IHRvdGFsSGl0cykge1xuICAgICAgd2FybmluZ01lc3NhZ2UgPSBgWW91IGFyZSB0cnlpbmcgdG8gZXhwb3J0ICR7ZXhwb3J0Q291bnR9IHJlc3VsdHMgYnV0IHRoZXJlICR7XG4gICAgICAgIHRvdGFsSGl0cyA9PT0gMSA/IGBpc2AgOiBgYXJlYFxuICAgICAgfSBvbmx5ICR7dG90YWxIaXRzfS4gIE9ubHkgJHt0b3RhbEhpdHN9ICR7XG4gICAgICAgIHRvdGFsSGl0cyA9PT0gMSA/IGByZXN1bHRgIDogYHJlc3VsdHNgXG4gICAgICB9IHdpbGwgYmUgZXhwb3J0ZWQuYFxuICAgIH1cbiAgfVxuICBpZiAodG90YWxIaXRzID4gMTAwICYmIGV4cG9ydENvdW50ID4gMTAwICYmIGV4cG9ydFJlc3VsdExpbWl0ID4gMTAwKSB7XG4gICAgd2FybmluZ01lc3NhZ2UgKz0gYCAgVGhpcyBtYXkgdGFrZSBhIGxvbmcgdGltZS5gXG4gIH1cbiAgcmV0dXJuIHdhcm5pbmdNZXNzYWdlXG59XG5cbnR5cGUgU291cmNlSWRQYWlyID0ge1xuICBpZDogc3RyaW5nXG4gIHNvdXJjZUlkOiBzdHJpbmdcbn1cblxuZXhwb3J0IGNvbnN0IGdldEV4cG9ydEJvZHkgPSBhc3luYyAoRXhwb3J0SW5mbzogRXhwb3J0SW5mbykgPT4ge1xuICBjb25zdCB7IGV4cG9ydFNpemUsIGN1c3RvbUV4cG9ydENvdW50LCBzZWxlY3Rpb25JbnRlcmZhY2UgfSA9IEV4cG9ydEluZm9cbiAgY29uc3QgZXhwb3J0UmVzdWx0TGltaXQgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RXhwb3J0TGltaXQoKVxuICBjb25zdCBoaWRkZW5GaWVsZHMgPSBnZXRIaWRkZW5GaWVsZHMoKVxuICBjb25zdCBjb2x1bW5PcmRlciA9IE92ZXJyaWRhYmxlR2V0Q29sdW1uT3JkZXIuZ2V0KCkoKVxuICBjb25zdCBzcmNzID0gZ2V0U3JjcyhzZWxlY3Rpb25JbnRlcmZhY2UpXG4gIGNvbnN0IHNvcnRzID0gZ2V0U29ydHMoc2VsZWN0aW9uSW50ZXJmYWNlKVxuICBjb25zdCBxdWVyeSA9IHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKVxuICBjb25zdCBjYWNoZUlkID0gcXVlcnkuZ2V0KCdjYWNoZUlkJylcbiAgY29uc3QgcGhvbmV0aWNzID0gcXVlcnkuZ2V0KCdwaG9uZXRpY3MnKVxuICBjb25zdCBzcGVsbGNoZWNrID0gcXVlcnkuZ2V0KCdzcGVsbGNoZWNrJylcbiAgY29uc3QgZXhwb3J0Q291bnQgPSBNYXRoLm1pbihcbiAgICBnZXRFeHBvcnRDb3VudCh7IGV4cG9ydFNpemUsIHNlbGVjdGlvbkludGVyZmFjZSwgY3VzdG9tRXhwb3J0Q291bnQgfSksXG4gICAgZXhwb3J0UmVzdWx0TGltaXRcbiAgKVxuICBjb25zdCBhcmdzID0ge1xuICAgIGhpZGRlbkZpZWxkczogaGlkZGVuRmllbGRzLmxlbmd0aCA+IDAgPyBoaWRkZW5GaWVsZHMgOiBbXSxcbiAgICBjb2x1bW5PcmRlcjogY29sdW1uT3JkZXIubGVuZ3RoID4gMCA/IGNvbHVtbk9yZGVyIDogW10sXG4gICAgY29sdW1uQWxpYXNNYXA6IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWc/LmF0dHJpYnV0ZUFsaWFzZXMsXG4gIH1cbiAgY29uc3Qgc2VhcmNoZXMgPSBbXVxuICBsZXQgcXVlcnlDb3VudCA9IGV4cG9ydENvdW50XG4gIGxldCBjcWwgPSBERUZBVUxUX1VTRVJfUVVFUllfT1BUSU9OUy50cmFuc2Zvcm1GaWx0ZXJUcmVlKHtcbiAgICBvcmlnaW5hbEZpbHRlclRyZWU6IHF1ZXJ5LmdldCgnZmlsdGVyVHJlZScpLFxuICAgIHF1ZXJ5UmVmOiBxdWVyeSxcbiAgfSlcbiAgaWYgKEV4cG9ydEluZm8uZXhwb3J0U2l6ZSA9PT0gJ2N1cnJlbnRQYWdlJykge1xuICAgIGNvbnN0IHJlc3VsdElkU291cmNlUGFpcnM6IFNvdXJjZUlkUGFpcltdID0gT2JqZWN0LnZhbHVlcyhcbiAgICAgIHF1ZXJ5LmdldCgncmVzdWx0JykuZ2V0KCdsYXp5UmVzdWx0cycpLnJlc3VsdHNcbiAgICApLm1hcCgocmVzdWx0OiBMYXp5UXVlcnlSZXN1bHQpID0+ICh7XG4gICAgICBpZDogcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ2lkJ10sXG4gICAgICBzb3VyY2VJZDogcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3NvdXJjZS1pZCddLFxuICAgIH0pKVxuXG4gICAgY29uc3Qgc3JjTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSByZXN1bHRJZFNvdXJjZVBhaXJzLnJlZHVjZShcbiAgICAgIChzcmNNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiwgY3VyUGFpcjogU291cmNlSWRQYWlyKSA9PiB7XG4gICAgICAgIGlmICghc3JjTWFwW2N1clBhaXIuc291cmNlSWRdKSB7XG4gICAgICAgICAgc3JjTWFwW2N1clBhaXIuc291cmNlSWRdID0gW11cbiAgICAgICAgfVxuICAgICAgICBzcmNNYXBbY3VyUGFpci5zb3VyY2VJZF0ucHVzaChjdXJQYWlyLmlkKVxuICAgICAgICByZXR1cm4gc3JjTWFwXG4gICAgICB9LFxuICAgICAge30gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+XG4gICAgKVxuICAgIE9iamVjdC5rZXlzKHNyY01hcCkuZm9yRWFjaCgoc3JjKSA9PiB7XG4gICAgICBzZWFyY2hlcy5wdXNoKHtcbiAgICAgICAgc3JjczogW3NyY10sXG4gICAgICAgIGNxbDogZ2V0UmVzdWx0U2V0Q3FsKHNyY01hcFtzcmNdKSxcbiAgICAgICAgY291bnQ6IHNyY01hcFtzcmNdLmxlbmd0aCxcbiAgICAgICAgY2FjaGVJZCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBzZWFyY2hlcy5wdXNoKHtcbiAgICAgIHNyY3MsXG4gICAgICBjcWwsXG4gICAgICBjb3VudDogcXVlcnlDb3VudCxcbiAgICAgIGNhY2hlSWQsXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGhvbmV0aWNzLFxuICAgIHNwZWxsY2hlY2ssXG4gICAgc2VhcmNoZXMsXG4gICAgY291bnQ6IGV4cG9ydENvdW50LFxuICAgIHNvcnRzLFxuICAgIGFyZ3MsXG4gIH1cbn1cblxuY29uc3QgVGFibGVFeHBvcnRzID0gKHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICBvbkNsb3NlLFxuICBzZXRFeHBvcnRTdWNjZXNzZnVsLFxuICBleHBvcnRTdWNjZXNzZnVsLFxufTogUHJvcHMpID0+IHtcbiAgY29uc3QgZXhwb3J0TGltaXQgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RXhwb3J0TGltaXQoKVxuICBjb25zdCBbZm9ybWF0cywgc2V0Rm9ybWF0c10gPSB1c2VTdGF0ZTxPcHRpb25bXT4oW10pXG4gIGNvbnN0IFtleHBvcnRGb3JtYXQsIHNldEV4cG9ydEZvcm1hdF0gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2V4cG9ydFNpemUsIHNldEV4cG9ydFNpemVdID0gdXNlU3RhdGUoJ2FsbCcpXG4gIGNvbnN0IFt3YXJuaW5nLCBzZXRXYXJuaW5nXSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbY3VzdG9tRXhwb3J0Q291bnQsIHNldEN1c3RvbUV4cG9ydENvdW50XSA9IHVzZVN0YXRlKGV4cG9ydExpbWl0KVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBvbkV4cG9ydENsaWNrID0gYXN5bmMgKGFkZFNuYWNrOiBBZGRTbmFjaywgRXhwb3J0SW5mbzogRXhwb3J0SW5mbykgPT4ge1xuICAgIGNvbnN0IGV4cG9ydEZvcm1hdCA9IGVuY29kZVVSSUNvbXBvbmVudChFeHBvcnRJbmZvLmV4cG9ydEZvcm1hdClcbiAgICB0cnkge1xuICAgICAgc2V0TG9hZGluZyh0cnVlKVxuICAgICAgY29uc3QgYm9keSA9IGF3YWl0IGdldEV4cG9ydEJvZHkoRXhwb3J0SW5mbylcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZXhwb3J0UmVzdWx0U2V0KGV4cG9ydEZvcm1hdCwgYm9keSlcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuYmxvYigpXG4gICAgICAgIGNvbnN0IGNvbnRlbnRUeXBlID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpXG4gICAgICAgIGNvbnN0IGZpbGVuYW1lID0gY29udGVudERpc3Bvc2l0aW9uLnBhcnNlKFxuICAgICAgICAgIHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LWRpc3Bvc2l0aW9uJylcbiAgICAgICAgKS5wYXJhbWV0ZXJzLmZpbGVuYW1lXG4gICAgICAgIE92ZXJyaWRhYmxlU2F2ZUZpbGUuZ2V0KCkoZmlsZW5hbWUsICdkYXRhOicgKyBjb250ZW50VHlwZSwgZGF0YSlcbiAgICAgICAgc2V0RXhwb3J0U3VjY2Vzc2Z1bCh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0RXhwb3J0U3VjY2Vzc2Z1bChmYWxzZSlcbiAgICAgICAgYWRkU25hY2soJ0Vycm9yOiBDb3VsZCBub3QgZXhwb3J0IHJlc3VsdHMuJywge1xuICAgICAgICAgIGFsZXJ0UHJvcHM6IHsgc2V2ZXJpdHk6ICdlcnJvcicgfSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgIHNldEV4cG9ydFN1Y2Nlc3NmdWwoZmFsc2UpXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldExvYWRpbmcoZmFsc2UpXG4gICAgfVxuICB9XG5cbiAgaWYgKGV4cG9ydFN1Y2Nlc3NmdWwpIHtcbiAgICBvbkNsb3NlKClcbiAgfVxuXG4gIGNvbnN0IGV4cG9ydFNpemVzOiBPcHRpb25bXSA9IFtcbiAgICB7XG4gICAgICBsYWJlbDogJ0N1cnJlbnQgUGFnZScsXG4gICAgICB2YWx1ZTogJ2N1cnJlbnRQYWdlJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIGxhYmVsOiAnQWxsIFJlc3VsdHMnLFxuICAgICAgdmFsdWU6ICdhbGwnLFxuICAgIH0sXG4gICAge1xuICAgICAgbGFiZWw6ICdTcGVjaWZpYyBOdW1iZXIgb2YgUmVzdWx0cycsXG4gICAgICB2YWx1ZTogJ2N1c3RvbScsXG4gICAgfSxcbiAgXVxuXG4gIGNvbnN0IGFkZFNuYWNrID0gdXNlU25hY2soKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGZldGNoRm9ybWF0cyA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IGZvcm1hdHMgPSBhd2FpdCBnZXRFeHBvcnRPcHRpb25zKFRyYW5zZm9ybWVyLlF1ZXJ5KVxuXG4gICAgICBzZXRGb3JtYXRzKFxuICAgICAgICBmb3JtYXRzLm1hcCgoZXhwb3J0Rm9ybWF0OiBFeHBvcnRGb3JtYXQpID0+ICh7XG4gICAgICAgICAgbGFiZWw6IGV4cG9ydEZvcm1hdC5kaXNwbGF5TmFtZSxcbiAgICAgICAgICB2YWx1ZTogZXhwb3J0Rm9ybWF0LmlkLFxuICAgICAgICB9KSlcbiAgICAgIClcblxuICAgICAgZm9ybWF0cy5sZW5ndGggJiYgc2V0RXhwb3J0Rm9ybWF0KGZvcm1hdHNbMF0uaWQpXG4gICAgfVxuICAgIGZldGNoRm9ybWF0cygpXG4gIH0sIFtdKVxuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0V2FybmluZyhcbiAgICAgIGdldFdhcm5pbmcoe1xuICAgICAgICBleHBvcnRTaXplLFxuICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgICAgIGN1c3RvbUV4cG9ydENvdW50LFxuICAgICAgfSlcbiAgICApXG4gIH0sIFtleHBvcnRTaXplLCBjdXN0b21FeHBvcnRDb3VudF0pXG5cbiAgcmV0dXJuIGZvcm1hdHMubGVuZ3RoID09PSAwID8gKFxuICAgIDxMaW5lYXJQcm9ncmVzcyBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0yXCIgLz5cbiAgKSA6IChcbiAgICA8PlxuICAgICAgPERpYWxvZ0NvbnRlbnQ+XG4gICAgICAgIDxEaWFsb2dDb250ZW50VGV4dD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNFwiIHN0eWxlPXt7IG1pbldpZHRoOiAnNDAwcHgnIH19PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yXCI+XG4gICAgICAgICAgICAgIDxBdXRvY29tcGxldGVcbiAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICAgIG9wdGlvbnM9e2V4cG9ydFNpemVzfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoX2U6IGFueSwgbmV3VmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgIHNldEV4cG9ydFNpemUobmV3VmFsdWUudmFsdWUpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBpc09wdGlvbkVxdWFsVG9WYWx1ZT17KG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBleHBvcnRTaXplfVxuICAgICAgICAgICAgICAgIGdldE9wdGlvbkxhYmVsPXsob3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9uLmxhYmVsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlQ2xlYXJhYmxlXG4gICAgICAgICAgICAgICAgdmFsdWU9e2V4cG9ydFNpemVzLmZpbmQoXG4gICAgICAgICAgICAgICAgICAoY2hvaWNlKSA9PiBjaG9pY2UudmFsdWUgPT09IGV4cG9ydFNpemVcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkIHsuLi5wYXJhbXN9IGxhYmVsPVwiRXhwb3J0XCIgdmFyaWFudD1cIm91dGxpbmVkXCIgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7ZXhwb3J0U2l6ZSA9PT0gJ2N1c3RvbScgPyAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHQtMlwiPlxuICAgICAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgbGFiZWw9XCJcIlxuICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJFbnRlciBudW1iZXIgb2YgcmVzdWx0cyB5b3Ugd291bGQgbGlrZSB0byBleHBvcnRcIlxuICAgICAgICAgICAgICAgICAgbmFtZT1cImN1c3RvbUV4cG9ydFwiXG4gICAgICAgICAgICAgICAgICB2YWx1ZT17Y3VzdG9tRXhwb3J0Q291bnR9XG4gICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0Q3VzdG9tRXhwb3J0Q291bnQoTnVtYmVyKGUudGFyZ2V0LnZhbHVlKSlcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPGRpdiAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHQtMiBleHBvcnQtZm9ybWF0XCI+XG4gICAgICAgICAgICAgIDxBdXRvY29tcGxldGVcbiAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICAgIG9wdGlvbnM9e2Zvcm1hdHN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhfZTogYW55LCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgc2V0RXhwb3J0Rm9ybWF0KG5ld1ZhbHVlLnZhbHVlKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgaXNPcHRpb25FcXVhbFRvVmFsdWU9eyhvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gZXhwb3J0Rm9ybWF0fVxuICAgICAgICAgICAgICAgIGdldE9wdGlvbkxhYmVsPXsob3B0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9uLmxhYmVsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlQ2xlYXJhYmxlXG4gICAgICAgICAgICAgICAgdmFsdWU9e2Zvcm1hdHMuZmluZCgoY2hvaWNlKSA9PiBjaG9pY2UudmFsdWUgPT09IGV4cG9ydEZvcm1hdCl9XG4gICAgICAgICAgICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IChcbiAgICAgICAgICAgICAgICAgIDxUZXh0RmllbGQgey4uLnBhcmFtc30gbGFiZWw9XCJhc1wiIHZhcmlhbnQ9XCJvdXRsaW5lZFwiIC8+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge1snY3N2JywgJ3J0ZicsICd4bHN4J10uaW5jbHVkZXMoZXhwb3J0Rm9ybWF0KSA/IChcbiAgICAgICAgICAgICAgPFN1bW1hcnlNYW5hZ2VBdHRyaWJ1dGVzIGlzRXhwb3J0PXt0cnVlfSAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICB7d2FybmluZyAmJiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwid2FybmluZyB0ZXh0LWNlbnRlciBwdC0xXCI+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtd2FybmluZ1wiIC8+XG4gICAgICAgICAgICAgICAgPHNwYW4+e3dhcm5pbmd9PC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvRGlhbG9nQ29udGVudFRleHQ+XG4gICAgICA8L0RpYWxvZ0NvbnRlbnQ+XG4gICAgICA8RGlhbG9nQWN0aW9ucz5cbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT1cInB0LTJcIlxuICAgICAgICAgIHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdmbGV4LWVuZCcgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1yLTJcIlxuICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XG4gICAgICAgICAgICB2YXJpYW50PVwidGV4dFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIG9uQ2xvc2UoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8UHJvZ3Jlc3NCdXR0b25cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIGxvYWRpbmc9e2xvYWRpbmd9XG4gICAgICAgICAgICBkaXNhYmxlZD17XG4gICAgICAgICAgICAgIGxvYWRpbmcgJiZcbiAgICAgICAgICAgICAgZXhwb3J0U2l6ZSA9PT0gJ2N1c3RvbScgJiZcbiAgICAgICAgICAgICAgY3VzdG9tRXhwb3J0Q291bnQgPiBleHBvcnRMaW1pdFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBvbkV4cG9ydENsaWNrKGFkZFNuYWNrLCB7XG4gICAgICAgICAgICAgICAgZXhwb3J0Rm9ybWF0LFxuICAgICAgICAgICAgICAgIGV4cG9ydFNpemUsXG4gICAgICAgICAgICAgICAgY3VzdG9tRXhwb3J0Q291bnQsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBFeHBvcnRcbiAgICAgICAgICA8L1Byb2dyZXNzQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvRGlhbG9nQWN0aW9ucz5cbiAgICA8Lz5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBUYWJsZUV4cG9ydHNcbiJdfQ==