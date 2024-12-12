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
import _ from 'underscore';
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
import { limitToDeleted, limitToHistoric } from '../../js/model/Query';
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
    var exportSize, customExportCount, selectionInterface, exportResultLimit, hiddenFields, columnOrder, srcs, sorts, query, cacheId, phonetics, spellcheck, additionalOptions, cqlFilterTree, exportCount, args, searches, queryCount, cql, resultIdSourcePairs, srcMap_1;
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
        additionalOptions = JSON.parse(query.get('additionalOptions') || '{}');
        cqlFilterTree = query.get('filterTree');
        if (query.options.limitToDeleted) {
            cqlFilterTree = limitToDeleted(cqlFilterTree);
        }
        else if (query.options.limitToHistoric) {
            cqlFilterTree = limitToHistoric(cqlFilterTree);
        }
        if (query.options.additionalOptions) {
            additionalOptions = _.extend(additionalOptions, query.options.additionalOptions);
        }
        exportCount = Math.min(getExportCount({ exportSize: exportSize, selectionInterface: selectionInterface, customExportCount: customExportCount }), exportResultLimit);
        args = {
            hiddenFields: hiddenFields.length > 0 ? hiddenFields : [],
            columnOrder: columnOrder.length > 0 ? columnOrder : [],
            columnAliasMap: (_a = StartupDataStore.Configuration.config) === null || _a === void 0 ? void 0 : _a.attributeAliases,
        };
        searches = [];
        queryCount = exportCount;
        cql = DEFAULT_USER_QUERY_OPTIONS.transformFilterTree({
            originalFilterTree: cqlFilterTree,
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
                additionalOptions: JSON.stringify(additionalOptions),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC90YWJsZS1leHBvcnQvdGFibGUtZXhwb3J0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUMzQyxtSkFBbUo7QUFDbkosT0FBTyxrQkFBa0IsTUFBTSxxQkFBcUIsQ0FBQTtBQUNwRCxPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQUN6RCxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQTtBQUV4QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRSxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLFdBQVcsRUFDWCx5QkFBeUIsRUFDekIsZUFBZSxHQUloQixNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sSUFBSSxNQUFNLDBDQUEwQyxDQUFBO0FBQzNELE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBRXRFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUNqRSxPQUFPLHVCQUF1QixNQUFNLDJFQUEyRSxDQUFBO0FBQy9HLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGlEQUFpRCxDQUFBO0FBQ3JGLE9BQU8sY0FBYyxNQUFNLHVEQUF1RCxDQUFBO0FBQ2xGLE9BQU8sYUFBYSxNQUFNLDJD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LFVBQVUsS0FBSyxRQUFRO3dCQUN2QixpQkFBaUIsR0FBRyxXQUFXLEVBRWpDLE9BQU8sRUFBRTt3QkFDUCxhQUFhLENBQUMsUUFBUSxFQUFFOzRCQUN0QixZQUFZLGNBQUE7NEJBQ1osVUFBVSxZQUFBOzRCQUNWLGlCQUFpQixtQkFBQTs0QkFDakIsa0JBQWtCLG9CQUFBO3lCQUNuQixDQUFDLENBQUE7b0JBQ0osQ0FBQyxhQUdjLENBQ2IsQ0FDUSxDQUNmLENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsWUFBWSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdjb250Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBjb250ZW50RGlzcG9zaXRpb24gZnJvbSAnY29udGVudC1kaXNwb3NpdGlvbidcbmltcG9ydCBMaW5lYXJQcm9ncmVzcyBmcm9tICdAbXVpL21hdGVyaWFsL0xpbmVhclByb2dyZXNzJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBBdXRvY29tcGxldGUgZnJvbSAnQG11aS9tYXRlcmlhbC9BdXRvY29tcGxldGUnXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IHVzZVNuYWNrIGZyb20gJy4uL2hvb2tzL3VzZVNuYWNrJ1xuaW1wb3J0IHsgQWRkU25hY2sgfSBmcm9tICcuLi9zbmFjay9zbmFjay5wcm92aWRlcidcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQge1xuICBnZXRFeHBvcnRPcHRpb25zLFxuICBUcmFuc2Zvcm1lcixcbiAgT3ZlcnJpZGFibGVHZXRDb2x1bW5PcmRlcixcbiAgZXhwb3J0UmVzdWx0U2V0LFxuICBFeHBvcnRDb3VudEluZm8sXG4gIEV4cG9ydEluZm8sXG4gIEV4cG9ydEZvcm1hdCxcbn0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2V4cG9ydCdcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgeyBERUZBVUxUX1VTRVJfUVVFUllfT1BUSU9OUyB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1R5cGVkUXVlcnknXG5cbmltcG9ydCB7IGdldFJlc3VsdFNldENxbCB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9jcWwnXG5pbXBvcnQgU3VtbWFyeU1hbmFnZUF0dHJpYnV0ZXMgZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3N1bW1hcnktbWFuYWdlLWF0dHJpYnV0ZXMvc3VtbWFyeS1tYW5hZ2UtYXR0cmlidXRlcydcbmltcG9ydCB7IE92ZXJyaWRhYmxlU2F2ZUZpbGUgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvc2F2ZS1maWxlL3NhdmUtZmlsZSdcbmltcG9ydCBQcm9ncmVzc0J1dHRvbiBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvcHJvZ3Jlc3MtYnV0dG9uL3Byb2dyZXNzLWJ1dHRvbidcbmltcG9ydCBEaWFsb2dDb250ZW50IGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQ29udGVudC9EaWFsb2dDb250ZW50J1xuaW1wb3J0IERpYWxvZ0FjdGlvbnMgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dBY3Rpb25zL0RpYWxvZ0FjdGlvbnMnXG5pbXBvcnQgRGlhbG9nQ29udGVudFRleHQgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dDb250ZW50VGV4dCdcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyBsaW1pdFRvRGVsZXRlZCwgbGltaXRUb0hpc3RvcmljIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvUXVlcnknXG5cbmV4cG9ydCB0eXBlIFByb3BzID0ge1xuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxuICBvbkNsb3NlPzogYW55XG4gIGV4cG9ydFN1Y2Nlc3NmdWw/OiBib29sZWFuXG4gIHNldEV4cG9ydFN1Y2Nlc3NmdWw/OiBhbnlcbn1cblxudHlwZSBTb3VyY2UgPSB7XG4gIGlkOiBzdHJpbmdcbiAgaGl0czogbnVtYmVyXG59XG5cbnR5cGUgT3B0aW9uID0ge1xuICBsYWJlbDogc3RyaW5nXG4gIHZhbHVlOiBzdHJpbmdcbn1cblxuZnVuY3Rpb24gZ2V0U3JjcyhzZWxlY3Rpb25JbnRlcmZhY2U6IGFueSkge1xuICByZXR1cm4gc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpLmdldFNlbGVjdGVkU291cmNlcygpXG59XG5cbmZ1bmN0aW9uIGdldEhpZGRlbkZpZWxkcygpOiBzdHJpbmdbXSB7XG4gIHJldHVybiB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ2NvbHVtbkhpZGUnKVxufVxuXG5mdW5jdGlvbiBnZXRTb3J0cyhzZWxlY3Rpb25JbnRlcmZhY2U6IGFueSkge1xuICByZXR1cm4gKFxuICAgIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgncmVzdWx0U29ydCcpIHx8XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpLmdldCgnc29ydHMnKVxuICApXG59XG5cbmZ1bmN0aW9uIGdldEhpdHMoc291cmNlczogU291cmNlW10pOiBudW1iZXIge1xuICByZXR1cm4gc291cmNlc1xuICAgIC5maWx0ZXIoKHNvdXJjZSkgPT4gc291cmNlLmlkICE9PSAnY2FjaGUnKVxuICAgIC5yZWR1Y2UoKGhpdHMsIHNvdXJjZSkgPT4gKHNvdXJjZS5oaXRzID8gaGl0cyArIHNvdXJjZS5oaXRzIDogaGl0cyksIDApXG59XG5mdW5jdGlvbiBnZXRFeHBvcnRDb3VudCh7XG4gIGV4cG9ydFNpemUsXG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgY3VzdG9tRXhwb3J0Q291bnQsXG59OiBFeHBvcnRDb3VudEluZm8pOiBudW1iZXIge1xuICBpZiAoZXhwb3J0U2l6ZSA9PT0gJ2N1c3RvbScpIHtcbiAgICByZXR1cm4gY3VzdG9tRXhwb3J0Q291bnRcbiAgfVxuICBjb25zdCByZXN1bHQgPSBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuZ2V0KCdyZXN1bHQnKVxuICByZXR1cm4gZXhwb3J0U2l6ZSA9PT0gJ2FsbCdcbiAgICA/IGdldEhpdHMoT2JqZWN0LnZhbHVlcyhyZXN1bHQuZ2V0KCdsYXp5UmVzdWx0cycpLnN0YXR1cykpXG4gICAgOiBPYmplY3Qua2V5cyhyZXN1bHQuZ2V0KCdsYXp5UmVzdWx0cycpLnJlc3VsdHMpLmxlbmd0aFxufVxuXG5leHBvcnQgY29uc3QgZ2V0V2FybmluZyA9IChleHBvcnRDb3VudEluZm86IEV4cG9ydENvdW50SW5mbyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGV4cG9ydFJlc3VsdExpbWl0ID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEV4cG9ydExpbWl0KClcbiAgY29uc3QgZXhwb3J0Q291bnQgPSBnZXRFeHBvcnRDb3VudChleHBvcnRDb3VudEluZm8pXG4gIGNvbnN0IHJlc3VsdCA9IGV4cG9ydENvdW50SW5mby5zZWxlY3Rpb25JbnRlcmZhY2VcbiAgICAuZ2V0Q3VycmVudFF1ZXJ5KClcbiAgICAuZ2V0KCdyZXN1bHQnKVxuICBjb25zdCB0b3RhbEhpdHMgPSBnZXRIaXRzKE9iamVjdC52YWx1ZXMocmVzdWx0LmdldCgnbGF6eVJlc3VsdHMnKS5zdGF0dXMpKVxuICBjb25zdCBsaW1pdFdhcm5pbmcgPSBgWW91IGNhbm5vdCBleHBvcnQgbW9yZSB0aGFuIHRoZSBhZG1pbmlzdHJhdG9yIGNvbmZpZ3VyZWQgbGltaXQgb2YgJHtleHBvcnRSZXN1bHRMaW1pdH0uYFxuICBsZXQgd2FybmluZ01lc3NhZ2UgPSAnJ1xuICBpZiAoZXhwb3J0Q291bnQgPiBleHBvcnRSZXN1bHRMaW1pdCkge1xuICAgIGlmIChleHBvcnRDb3VudEluZm8uZXhwb3J0U2l6ZSA9PT0gJ2N1c3RvbScpIHtcbiAgICAgIHJldHVybiBsaW1pdFdhcm5pbmdcbiAgICB9XG4gICAgd2FybmluZ01lc3NhZ2UgPVxuICAgICAgbGltaXRXYXJuaW5nICtcbiAgICAgIGAgIE9ubHkgJHtleHBvcnRSZXN1bHRMaW1pdH0gJHtcbiAgICAgICAgZXhwb3J0UmVzdWx0TGltaXQgPT09IDEgPyBgcmVzdWx0YCA6IGByZXN1bHRzYFxuICAgICAgfSB3aWxsIGJlIGV4cG9ydGVkLmBcbiAgfVxuICBpZiAoZXhwb3J0Q291bnRJbmZvLmV4cG9ydFNpemUgPT09ICdjdXN0b20nKSB7XG4gICAgaWYgKGV4cG9ydENvdW50ID4gdG90YWxIaXRzKSB7XG4gICAgICB3YXJuaW5nTWVzc2FnZSA9IGBZb3UgYXJlIHRyeWluZyB0byBleHBvcnQgJHtleHBvcnRDb3VudH0gcmVzdWx0cyBidXQgdGhlcmUgJHtcbiAgICAgICAgdG90YWxIaXRzID09PSAxID8gYGlzYCA6IGBhcmVgXG4gICAgICB9IG9ubHkgJHt0b3RhbEhpdHN9LiAgT25seSAke3RvdGFsSGl0c30gJHtcbiAgICAgICAgdG90YWxIaXRzID09PSAxID8gYHJlc3VsdGAgOiBgcmVzdWx0c2BcbiAgICAgIH0gd2lsbCBiZSBleHBvcnRlZC5gXG4gICAgfVxuICB9XG4gIGlmICh0b3RhbEhpdHMgPiAxMDAgJiYgZXhwb3J0Q291bnQgPiAxMDAgJiYgZXhwb3J0UmVzdWx0TGltaXQgPiAxMDApIHtcbiAgICB3YXJuaW5nTWVzc2FnZSArPSBgICBUaGlzIG1heSB0YWtlIGEgbG9uZyB0aW1lLmBcbiAgfVxuICByZXR1cm4gd2FybmluZ01lc3NhZ2Vcbn1cblxudHlwZSBTb3VyY2VJZFBhaXIgPSB7XG4gIGlkOiBzdHJpbmdcbiAgc291cmNlSWQ6IHN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgZ2V0RXhwb3J0Qm9keSA9IGFzeW5jIChFeHBvcnRJbmZvOiBFeHBvcnRJbmZvKSA9PiB7XG4gIGNvbnN0IHsgZXhwb3J0U2l6ZSwgY3VzdG9tRXhwb3J0Q291bnQsIHNlbGVjdGlvbkludGVyZmFjZSB9ID0gRXhwb3J0SW5mb1xuICBjb25zdCBleHBvcnRSZXN1bHRMaW1pdCA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRFeHBvcnRMaW1pdCgpXG4gIGNvbnN0IGhpZGRlbkZpZWxkcyA9IGdldEhpZGRlbkZpZWxkcygpXG4gIGNvbnN0IGNvbHVtbk9yZGVyID0gT3ZlcnJpZGFibGVHZXRDb2x1bW5PcmRlci5nZXQoKSgpXG4gIGNvbnN0IHNyY3MgPSBnZXRTcmNzKHNlbGVjdGlvbkludGVyZmFjZSlcbiAgY29uc3Qgc29ydHMgPSBnZXRTb3J0cyhzZWxlY3Rpb25JbnRlcmZhY2UpXG4gIGNvbnN0IHF1ZXJ5ID0gc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpXG4gIGNvbnN0IGNhY2hlSWQgPSBxdWVyeS5nZXQoJ2NhY2hlSWQnKVxuICBjb25zdCBwaG9uZXRpY3MgPSBxdWVyeS5nZXQoJ3Bob25ldGljcycpXG4gIGNvbnN0IHNwZWxsY2hlY2sgPSBxdWVyeS5nZXQoJ3NwZWxsY2hlY2snKVxuICBsZXQgYWRkaXRpb25hbE9wdGlvbnMgPSBKU09OLnBhcnNlKHF1ZXJ5LmdldCgnYWRkaXRpb25hbE9wdGlvbnMnKSB8fCAne30nKVxuXG4gIGxldCBjcWxGaWx0ZXJUcmVlID0gcXVlcnkuZ2V0KCdmaWx0ZXJUcmVlJylcbiAgaWYgKHF1ZXJ5Lm9wdGlvbnMubGltaXRUb0RlbGV0ZWQpIHtcbiAgICBjcWxGaWx0ZXJUcmVlID0gbGltaXRUb0RlbGV0ZWQoY3FsRmlsdGVyVHJlZSlcbiAgfSBlbHNlIGlmIChxdWVyeS5vcHRpb25zLmxpbWl0VG9IaXN0b3JpYykge1xuICAgIGNxbEZpbHRlclRyZWUgPSBsaW1pdFRvSGlzdG9yaWMoY3FsRmlsdGVyVHJlZSlcbiAgfVxuXG4gIGlmIChxdWVyeS5vcHRpb25zLmFkZGl0aW9uYWxPcHRpb25zKSB7XG4gICAgYWRkaXRpb25hbE9wdGlvbnMgPSBfLmV4dGVuZChcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zLFxuICAgICAgcXVlcnkub3B0aW9ucy5hZGRpdGlvbmFsT3B0aW9uc1xuICAgIClcbiAgfVxuXG4gIGNvbnN0IGV4cG9ydENvdW50ID0gTWF0aC5taW4oXG4gICAgZ2V0RXhwb3J0Q291bnQoeyBleHBvcnRTaXplLCBzZWxlY3Rpb25JbnRlcmZhY2UsIGN1c3RvbUV4cG9ydENvdW50IH0pLFxuICAgIGV4cG9ydFJlc3VsdExpbWl0XG4gIClcbiAgY29uc3QgYXJncyA9IHtcbiAgICBoaWRkZW5GaWVsZHM6IGhpZGRlbkZpZWxkcy5sZW5ndGggPiAwID8gaGlkZGVuRmllbGRzIDogW10sXG4gICAgY29sdW1uT3JkZXI6IGNvbHVtbk9yZGVyLmxlbmd0aCA+IDAgPyBjb2x1bW5PcmRlciA6IFtdLFxuICAgIGNvbHVtbkFsaWFzTWFwOiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnPy5hdHRyaWJ1dGVBbGlhc2VzLFxuICB9XG4gIGNvbnN0IHNlYXJjaGVzID0gW11cbiAgbGV0IHF1ZXJ5Q291bnQgPSBleHBvcnRDb3VudFxuICBsZXQgY3FsID0gREVGQVVMVF9VU0VSX1FVRVJZX09QVElPTlMudHJhbnNmb3JtRmlsdGVyVHJlZSh7XG4gICAgb3JpZ2luYWxGaWx0ZXJUcmVlOiBjcWxGaWx0ZXJUcmVlLFxuICAgIHF1ZXJ5UmVmOiBxdWVyeSxcbiAgfSlcbiAgaWYgKEV4cG9ydEluZm8uZXhwb3J0U2l6ZSA9PT0gJ2N1cnJlbnRQYWdlJykge1xuICAgIGNvbnN0IHJlc3VsdElkU291cmNlUGFpcnM6IFNvdXJjZUlkUGFpcltdID0gT2JqZWN0LnZhbHVlcyhcbiAgICAgIHF1ZXJ5LmdldCgncmVzdWx0JykuZ2V0KCdsYXp5UmVzdWx0cycpLnJlc3VsdHNcbiAgICApLm1hcCgocmVzdWx0OiBMYXp5UXVlcnlSZXN1bHQpID0+ICh7XG4gICAgICBpZDogcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ2lkJ10sXG4gICAgICBzb3VyY2VJZDogcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3NvdXJjZS1pZCddLFxuICAgIH0pKVxuXG4gICAgY29uc3Qgc3JjTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSByZXN1bHRJZFNvdXJjZVBhaXJzLnJlZHVjZShcbiAgICAgIChzcmNNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiwgY3VyUGFpcjogU291cmNlSWRQYWlyKSA9PiB7XG4gICAgICAgIGlmICghc3JjTWFwW2N1clBhaXIuc291cmNlSWRdKSB7XG4gICAgICAgICAgc3JjTWFwW2N1clBhaXIuc291cmNlSWRdID0gW11cbiAgICAgICAgfVxuICAgICAgICBzcmNNYXBbY3VyUGFpci5zb3VyY2VJZF0ucHVzaChjdXJQYWlyLmlkKVxuICAgICAgICByZXR1cm4gc3JjTWFwXG4gICAgICB9LFxuICAgICAge30gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nW10+XG4gICAgKVxuICAgIE9iamVjdC5rZXlzKHNyY01hcCkuZm9yRWFjaCgoc3JjKSA9PiB7XG4gICAgICBzZWFyY2hlcy5wdXNoKHtcbiAgICAgICAgc3JjczogW3NyY10sXG4gICAgICAgIGNxbDogZ2V0UmVzdWx0U2V0Q3FsKHNyY01hcFtzcmNdKSxcbiAgICAgICAgY291bnQ6IHNyY01hcFtzcmNdLmxlbmd0aCxcbiAgICAgICAgY2FjaGVJZCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBzZWFyY2hlcy5wdXNoKHtcbiAgICAgIHNyY3MsXG4gICAgICBjcWwsXG4gICAgICBjb3VudDogcXVlcnlDb3VudCxcbiAgICAgIGNhY2hlSWQsXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGhvbmV0aWNzLFxuICAgIHNwZWxsY2hlY2ssXG4gICAgYWRkaXRpb25hbE9wdGlvbnM6IEpTT04uc3RyaW5naWZ5KGFkZGl0aW9uYWxPcHRpb25zKSxcbiAgICBzZWFyY2hlcyxcbiAgICBjb3VudDogZXhwb3J0Q291bnQsXG4gICAgc29ydHMsXG4gICAgYXJncyxcbiAgfVxufVxuXG5jb25zdCBUYWJsZUV4cG9ydHMgPSAoe1xuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIG9uQ2xvc2UsXG4gIHNldEV4cG9ydFN1Y2Nlc3NmdWwsXG4gIGV4cG9ydFN1Y2Nlc3NmdWwsXG59OiBQcm9wcykgPT4ge1xuICBjb25zdCBleHBvcnRMaW1pdCA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRFeHBvcnRMaW1pdCgpXG4gIGNvbnN0IFtmb3JtYXRzLCBzZXRGb3JtYXRzXSA9IHVzZVN0YXRlPE9wdGlvbltdPihbXSlcbiAgY29uc3QgW2V4cG9ydEZvcm1hdCwgc2V0RXhwb3J0Rm9ybWF0XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbZXhwb3J0U2l6ZSwgc2V0RXhwb3J0U2l6ZV0gPSB1c2VTdGF0ZSgnYWxsJylcbiAgY29uc3QgW3dhcm5pbmcsIHNldFdhcm5pbmddID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtjdXN0b21FeHBvcnRDb3VudCwgc2V0Q3VzdG9tRXhwb3J0Q291bnRdID0gdXNlU3RhdGUoZXhwb3J0TGltaXQpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IG9uRXhwb3J0Q2xpY2sgPSBhc3luYyAoYWRkU25hY2s6IEFkZFNuYWNrLCBFeHBvcnRJbmZvOiBFeHBvcnRJbmZvKSA9PiB7XG4gICAgY29uc3QgZXhwb3J0Rm9ybWF0ID0gZW5jb2RlVVJJQ29tcG9uZW50KEV4cG9ydEluZm8uZXhwb3J0Rm9ybWF0KVxuICAgIHRyeSB7XG4gICAgICBzZXRMb2FkaW5nKHRydWUpXG4gICAgICBjb25zdCBib2R5ID0gYXdhaXQgZ2V0RXhwb3J0Qm9keShFeHBvcnRJbmZvKVxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBleHBvcnRSZXN1bHRTZXQoZXhwb3J0Rm9ybWF0LCBib2R5KVxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5ibG9iKClcbiAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJylcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBjb250ZW50RGlzcG9zaXRpb24ucGFyc2UoXG4gICAgICAgICAgcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtZGlzcG9zaXRpb24nKVxuICAgICAgICApLnBhcmFtZXRlcnMuZmlsZW5hbWVcbiAgICAgICAgT3ZlcnJpZGFibGVTYXZlRmlsZS5nZXQoKShmaWxlbmFtZSwgJ2RhdGE6JyArIGNvbnRlbnRUeXBlLCBkYXRhKVxuICAgICAgICBzZXRFeHBvcnRTdWNjZXNzZnVsKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRFeHBvcnRTdWNjZXNzZnVsKGZhbHNlKVxuICAgICAgICBhZGRTbmFjaygnRXJyb3I6IENvdWxkIG5vdCBleHBvcnQgcmVzdWx0cy4nLCB7XG4gICAgICAgICAgYWxlcnRQcm9wczogeyBzZXZlcml0eTogJ2Vycm9yJyB9LFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgc2V0RXhwb3J0U3VjY2Vzc2Z1bChmYWxzZSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICBpZiAoZXhwb3J0U3VjY2Vzc2Z1bCkge1xuICAgIG9uQ2xvc2UoKVxuICB9XG5cbiAgY29uc3QgZXhwb3J0U2l6ZXM6IE9wdGlvbltdID0gW1xuICAgIHtcbiAgICAgIGxhYmVsOiAnQ3VycmVudCBQYWdlJyxcbiAgICAgIHZhbHVlOiAnY3VycmVudFBhZ2UnLFxuICAgIH0sXG4gICAge1xuICAgICAgbGFiZWw6ICdBbGwgUmVzdWx0cycsXG4gICAgICB2YWx1ZTogJ2FsbCcsXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogJ1NwZWNpZmljIE51bWJlciBvZiBSZXN1bHRzJyxcbiAgICAgIHZhbHVlOiAnY3VzdG9tJyxcbiAgICB9LFxuICBdXG5cbiAgY29uc3QgYWRkU25hY2sgPSB1c2VTbmFjaygpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZmV0Y2hGb3JtYXRzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZm9ybWF0cyA9IGF3YWl0IGdldEV4cG9ydE9wdGlvbnMoVHJhbnNmb3JtZXIuUXVlcnkpXG5cbiAgICAgIHNldEZvcm1hdHMoXG4gICAgICAgIGZvcm1hdHMubWFwKChleHBvcnRGb3JtYXQ6IEV4cG9ydEZvcm1hdCkgPT4gKHtcbiAgICAgICAgICBsYWJlbDogZXhwb3J0Rm9ybWF0LmRpc3BsYXlOYW1lLFxuICAgICAgICAgIHZhbHVlOiBleHBvcnRGb3JtYXQuaWQsXG4gICAgICAgIH0pKVxuICAgICAgKVxuXG4gICAgICBmb3JtYXRzLmxlbmd0aCAmJiBzZXRFeHBvcnRGb3JtYXQoZm9ybWF0c1swXS5pZClcbiAgICB9XG4gICAgZmV0Y2hGb3JtYXRzKClcbiAgfSwgW10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRXYXJuaW5nKFxuICAgICAgZ2V0V2FybmluZyh7XG4gICAgICAgIGV4cG9ydFNpemUsXG4gICAgICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgICAgICAgY3VzdG9tRXhwb3J0Q291bnQsXG4gICAgICB9KVxuICAgIClcbiAgfSwgW2V4cG9ydFNpemUsIGN1c3RvbUV4cG9ydENvdW50XSlcblxuICByZXR1cm4gZm9ybWF0cy5sZW5ndGggPT09IDAgPyAoXG4gICAgPExpbmVhclByb2dyZXNzIGNsYXNzTmFtZT1cInctZnVsbCBoLTJcIiAvPlxuICApIDogKFxuICAgIDw+XG4gICAgICA8RGlhbG9nQ29udGVudD5cbiAgICAgICAgPERpYWxvZ0NvbnRlbnRUZXh0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC00XCIgc3R5bGU9e3sgbWluV2lkdGg6ICc0MDBweCcgfX0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTJcIj5cbiAgICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgb3B0aW9ucz17ZXhwb3J0U2l6ZXN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhfZTogYW55LCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgc2V0RXhwb3J0U2l6ZShuZXdWYWx1ZS52YWx1ZSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IGV4cG9ydFNpemV9XG4gICAgICAgICAgICAgICAgZ2V0T3B0aW9uTGFiZWw9eyhvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24ubGFiZWxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgICAgICAgICB2YWx1ZT17ZXhwb3J0U2l6ZXMuZmluZChcbiAgICAgICAgICAgICAgICAgIChjaG9pY2UpID0+IGNob2ljZS52YWx1ZSA9PT0gZXhwb3J0U2l6ZVxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IChcbiAgICAgICAgICAgICAgICAgIDxUZXh0RmllbGQgey4uLnBhcmFtc30gbGFiZWw9XCJFeHBvcnRcIiB2YXJpYW50PVwib3V0bGluZWRcIiAvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtleHBvcnRTaXplID09PSAnY3VzdG9tJyA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yXCI+XG4gICAgICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICBsYWJlbD1cIlwiXG4gICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIG51bWJlciBvZiByZXN1bHRzIHlvdSB3b3VsZCBsaWtlIHRvIGV4cG9ydFwiXG4gICAgICAgICAgICAgICAgICBuYW1lPVwiY3VzdG9tRXhwb3J0XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtjdXN0b21FeHBvcnRDb3VudH1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRDdXN0b21FeHBvcnRDb3VudChOdW1iZXIoZS50YXJnZXQudmFsdWUpKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yIGV4cG9ydC1mb3JtYXRcIj5cbiAgICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgb3B0aW9ucz17Zm9ybWF0c31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KF9lOiBhbnksIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRFeHBvcnRGb3JtYXQobmV3VmFsdWUudmFsdWUpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBpc09wdGlvbkVxdWFsVG9WYWx1ZT17KG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBleHBvcnRGb3JtYXR9XG4gICAgICAgICAgICAgICAgZ2V0T3B0aW9uTGFiZWw9eyhvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24ubGFiZWxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgICAgICAgICB2YWx1ZT17Zm9ybWF0cy5maW5kKChjaG9pY2UpID0+IGNob2ljZS52YWx1ZSA9PT0gZXhwb3J0Rm9ybWF0KX1cbiAgICAgICAgICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4gKFxuICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZCB7Li4ucGFyYW1zfSBsYWJlbD1cImFzXCIgdmFyaWFudD1cIm91dGxpbmVkXCIgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7Wydjc3YnLCAncnRmJywgJ3hsc3gnXS5pbmNsdWRlcyhleHBvcnRGb3JtYXQpID8gKFxuICAgICAgICAgICAgICA8U3VtbWFyeU1hbmFnZUF0dHJpYnV0ZXMgaXNFeHBvcnQ9e3RydWV9IC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIHt3YXJuaW5nICYmIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3YXJuaW5nIHRleHQtY2VudGVyIHB0LTFcIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS13YXJuaW5nXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj57d2FybmluZ308L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9EaWFsb2dDb250ZW50VGV4dD5cbiAgICAgIDwvRGlhbG9nQ29udGVudD5cbiAgICAgIDxEaWFsb2dBY3Rpb25zPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPVwicHQtMlwiXG4gICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXItMlwiXG4gICAgICAgICAgICBkaXNhYmxlZD17bG9hZGluZ31cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgb25DbG9zZSgpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDxQcm9ncmVzc0J1dHRvblxuICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgICAgICAgIGRpc2FibGVkPXtcbiAgICAgICAgICAgICAgbG9hZGluZyAmJlxuICAgICAgICAgICAgICBleHBvcnRTaXplID09PSAnY3VzdG9tJyAmJlxuICAgICAgICAgICAgICBjdXN0b21FeHBvcnRDb3VudCA+IGV4cG9ydExpbWl0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIG9uRXhwb3J0Q2xpY2soYWRkU25hY2ssIHtcbiAgICAgICAgICAgICAgICBleHBvcnRGb3JtYXQsXG4gICAgICAgICAgICAgICAgZXhwb3J0U2l6ZSxcbiAgICAgICAgICAgICAgICBjdXN0b21FeHBvcnRDb3VudCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIEV4cG9ydFxuICAgICAgICAgIDwvUHJvZ3Jlc3NCdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgIDwvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhYmxlRXhwb3J0c1xuIl19