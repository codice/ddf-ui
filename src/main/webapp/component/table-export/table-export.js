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
import { limitCqlToDeleted } from '../../react-component/utils/cql/cql';
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
                var cql = getResultSetCql(srcMap_1[src]);
                if (query.options.limitToDeleted) {
                    cql = limitCqlToDeleted(cql);
                }
                searches.push({
                    srcs: [src],
                    cql: cql,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC90YWJsZS1leHBvcnQvdGFibGUtZXhwb3J0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUMzQyxtSkFBbUo7QUFDbkosT0FBTyxrQkFBa0IsTUFBTSxxQkFBcUIsQ0FBQTtBQUNwRCxPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQUN6RCxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLFlBQVksTUFBTSw0QkFBNEIsQ0FBQTtBQUNyRCxPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQTtBQUV4QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRSxPQUFPLEVBQ0wsZ0JBQWdCLEVBQ2hCLFdBQVcsRUFDWCx5QkFBeUIsRUFDekIsZUFBZSxHQUloQixNQUFNLG9DQUFvQyxDQUFBO0FBQzNDLE9BQU8sSUFBSSxNQUFNLDBDQUEwQyxDQUFBO0FBQzNELE9BQU8sRUFBRSwwQkFBMEIsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBRXRFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUNqRSxPQUFPLHVCQUF1QixNQUFNLDJFQUEyRSxDQUFBO0FBQy9HLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGlEQUFpRCxDQUFBO0FBQ3JGLE9BQU8sY0FBYyxNQUFNLHVEQUF1RCxDQUFBO0FBQ2xGLE9BQU8sYUFBYSxNQUFNLDJD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QyxNQUFNLEVBQ2QsT0FBTyxFQUFFO3dCQUNQLE9BQU8sRUFBRSxDQUFBO29CQUNYLENBQUMsYUFHTTtnQkFDVCxvQkFBQyxjQUFjLElBQ2IsT0FBTyxFQUFDLFdBQVcsRUFDbkIsS0FBSyxFQUFDLFNBQVMsRUFDZixPQUFPLEVBQUUsT0FBTyxFQUNoQixRQUFRLEVBQ04sT0FBTzt3QkFDUCxVQUFVLEtBQUssUUFBUTt3QkFDdkIsaUJBQWlCLEdBQUcsV0FBVyxFQUVqQyxPQUFPLEVBQUU7d0JBQ1AsYUFBYSxDQUFDLFFBQVEsRUFBRTs0QkFDdEIsWUFBWSxjQUFBOzRCQUNaLFVBQVUsWUFBQTs0QkFDVixpQkFBaUIsbUJBQUE7NEJBQ2pCLGtCQUFrQixvQkFBQTt5QkFDbkIsQ0FBQyxDQUFBO29CQUNKLENBQUMsYUFHYyxDQUNiLENBQ1EsQ0FDZixDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLFlBQVksQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnY29udC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgY29udGVudERpc3Bvc2l0aW9uIGZyb20gJ2NvbnRlbnQtZGlzcG9zaXRpb24nXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQXV0b2NvbXBsZXRlJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmltcG9ydCB1c2VTbmFjayBmcm9tICcuLi9ob29rcy91c2VTbmFjaydcbmltcG9ydCB7IEFkZFNuYWNrIH0gZnJvbSAnLi4vc25hY2svc25hY2sucHJvdmlkZXInXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHtcbiAgZ2V0RXhwb3J0T3B0aW9ucyxcbiAgVHJhbnNmb3JtZXIsXG4gIE92ZXJyaWRhYmxlR2V0Q29sdW1uT3JkZXIsXG4gIGV4cG9ydFJlc3VsdFNldCxcbiAgRXhwb3J0Q291bnRJbmZvLFxuICBFeHBvcnRJbmZvLFxuICBFeHBvcnRGb3JtYXQsXG59IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9leHBvcnQnXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IHsgREVGQVVMVF9VU0VSX1FVRVJZX09QVElPTlMgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9UeXBlZFF1ZXJ5J1xuXG5pbXBvcnQgeyBnZXRSZXN1bHRTZXRDcWwgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvY3FsJ1xuaW1wb3J0IFN1bW1hcnlNYW5hZ2VBdHRyaWJ1dGVzIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9zdW1tYXJ5LW1hbmFnZS1hdHRyaWJ1dGVzL3N1bW1hcnktbWFuYWdlLWF0dHJpYnV0ZXMnXG5pbXBvcnQgeyBPdmVycmlkYWJsZVNhdmVGaWxlIH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL3NhdmUtZmlsZS9zYXZlLWZpbGUnXG5pbXBvcnQgUHJvZ3Jlc3NCdXR0b24gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3Byb2dyZXNzLWJ1dHRvbi9wcm9ncmVzcy1idXR0b24nXG5pbXBvcnQgRGlhbG9nQ29udGVudCBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0NvbnRlbnQvRGlhbG9nQ29udGVudCdcbmltcG9ydCBEaWFsb2dBY3Rpb25zIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQWN0aW9ucy9EaWFsb2dBY3Rpb25zJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnRUZXh0IGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQ29udGVudFRleHQnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgbGltaXRUb0RlbGV0ZWQsIGxpbWl0VG9IaXN0b3JpYyB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1F1ZXJ5J1xuaW1wb3J0IHsgbGltaXRDcWxUb0RlbGV0ZWQgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvY3FsL2NxbCdcblxuZXhwb3J0IHR5cGUgUHJvcHMgPSB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG4gIG9uQ2xvc2U/OiBhbnlcbiAgZXhwb3J0U3VjY2Vzc2Z1bD86IGJvb2xlYW5cbiAgc2V0RXhwb3J0U3VjY2Vzc2Z1bD86IGFueVxufVxuXG50eXBlIFNvdXJjZSA9IHtcbiAgaWQ6IHN0cmluZ1xuICBoaXRzOiBudW1iZXJcbn1cblxudHlwZSBPcHRpb24gPSB7XG4gIGxhYmVsOiBzdHJpbmdcbiAgdmFsdWU6IHN0cmluZ1xufVxuXG5mdW5jdGlvbiBnZXRTcmNzKHNlbGVjdGlvbkludGVyZmFjZTogYW55KSB7XG4gIHJldHVybiBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuZ2V0U2VsZWN0ZWRTb3VyY2VzKClcbn1cblxuZnVuY3Rpb24gZ2V0SGlkZGVuRmllbGRzKCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnY29sdW1uSGlkZScpXG59XG5cbmZ1bmN0aW9uIGdldFNvcnRzKHNlbGVjdGlvbkludGVyZmFjZTogYW55KSB7XG4gIHJldHVybiAoXG4gICAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCdyZXN1bHRTb3J0JykgfHxcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuZ2V0KCdzb3J0cycpXG4gIClcbn1cblxuZnVuY3Rpb24gZ2V0SGl0cyhzb3VyY2VzOiBTb3VyY2VbXSk6IG51bWJlciB7XG4gIHJldHVybiBzb3VyY2VzXG4gICAgLmZpbHRlcigoc291cmNlKSA9PiBzb3VyY2UuaWQgIT09ICdjYWNoZScpXG4gICAgLnJlZHVjZSgoaGl0cywgc291cmNlKSA9PiAoc291cmNlLmhpdHMgPyBoaXRzICsgc291cmNlLmhpdHMgOiBoaXRzKSwgMClcbn1cbmZ1bmN0aW9uIGdldEV4cG9ydENvdW50KHtcbiAgZXhwb3J0U2l6ZSxcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICBjdXN0b21FeHBvcnRDb3VudCxcbn06IEV4cG9ydENvdW50SW5mbyk6IG51bWJlciB7XG4gIGlmIChleHBvcnRTaXplID09PSAnY3VzdG9tJykge1xuICAgIHJldHVybiBjdXN0b21FeHBvcnRDb3VudFxuICB9XG4gIGNvbnN0IHJlc3VsdCA9IHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5nZXQoJ3Jlc3VsdCcpXG4gIHJldHVybiBleHBvcnRTaXplID09PSAnYWxsJ1xuICAgID8gZ2V0SGl0cyhPYmplY3QudmFsdWVzKHJlc3VsdC5nZXQoJ2xhenlSZXN1bHRzJykuc3RhdHVzKSlcbiAgICA6IE9iamVjdC5rZXlzKHJlc3VsdC5nZXQoJ2xhenlSZXN1bHRzJykucmVzdWx0cykubGVuZ3RoXG59XG5cbmV4cG9ydCBjb25zdCBnZXRXYXJuaW5nID0gKGV4cG9ydENvdW50SW5mbzogRXhwb3J0Q291bnRJbmZvKTogc3RyaW5nID0+IHtcbiAgY29uc3QgZXhwb3J0UmVzdWx0TGltaXQgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RXhwb3J0TGltaXQoKVxuICBjb25zdCBleHBvcnRDb3VudCA9IGdldEV4cG9ydENvdW50KGV4cG9ydENvdW50SW5mbylcbiAgY29uc3QgcmVzdWx0ID0gZXhwb3J0Q291bnRJbmZvLnNlbGVjdGlvbkludGVyZmFjZVxuICAgIC5nZXRDdXJyZW50UXVlcnkoKVxuICAgIC5nZXQoJ3Jlc3VsdCcpXG4gIGNvbnN0IHRvdGFsSGl0cyA9IGdldEhpdHMoT2JqZWN0LnZhbHVlcyhyZXN1bHQuZ2V0KCdsYXp5UmVzdWx0cycpLnN0YXR1cykpXG4gIGNvbnN0IGxpbWl0V2FybmluZyA9IGBZb3UgY2Fubm90IGV4cG9ydCBtb3JlIHRoYW4gdGhlIGFkbWluaXN0cmF0b3IgY29uZmlndXJlZCBsaW1pdCBvZiAke2V4cG9ydFJlc3VsdExpbWl0fS5gXG4gIGxldCB3YXJuaW5nTWVzc2FnZSA9ICcnXG4gIGlmIChleHBvcnRDb3VudCA+IGV4cG9ydFJlc3VsdExpbWl0KSB7XG4gICAgaWYgKGV4cG9ydENvdW50SW5mby5leHBvcnRTaXplID09PSAnY3VzdG9tJykge1xuICAgICAgcmV0dXJuIGxpbWl0V2FybmluZ1xuICAgIH1cbiAgICB3YXJuaW5nTWVzc2FnZSA9XG4gICAgICBsaW1pdFdhcm5pbmcgK1xuICAgICAgYCAgT25seSAke2V4cG9ydFJlc3VsdExpbWl0fSAke1xuICAgICAgICBleHBvcnRSZXN1bHRMaW1pdCA9PT0gMSA/IGByZXN1bHRgIDogYHJlc3VsdHNgXG4gICAgICB9IHdpbGwgYmUgZXhwb3J0ZWQuYFxuICB9XG4gIGlmIChleHBvcnRDb3VudEluZm8uZXhwb3J0U2l6ZSA9PT0gJ2N1c3RvbScpIHtcbiAgICBpZiAoZXhwb3J0Q291bnQgPiB0b3RhbEhpdHMpIHtcbiAgICAgIHdhcm5pbmdNZXNzYWdlID0gYFlvdSBhcmUgdHJ5aW5nIHRvIGV4cG9ydCAke2V4cG9ydENvdW50fSByZXN1bHRzIGJ1dCB0aGVyZSAke1xuICAgICAgICB0b3RhbEhpdHMgPT09IDEgPyBgaXNgIDogYGFyZWBcbiAgICAgIH0gb25seSAke3RvdGFsSGl0c30uICBPbmx5ICR7dG90YWxIaXRzfSAke1xuICAgICAgICB0b3RhbEhpdHMgPT09IDEgPyBgcmVzdWx0YCA6IGByZXN1bHRzYFxuICAgICAgfSB3aWxsIGJlIGV4cG9ydGVkLmBcbiAgICB9XG4gIH1cbiAgaWYgKHRvdGFsSGl0cyA+IDEwMCAmJiBleHBvcnRDb3VudCA+IDEwMCAmJiBleHBvcnRSZXN1bHRMaW1pdCA+IDEwMCkge1xuICAgIHdhcm5pbmdNZXNzYWdlICs9IGAgIFRoaXMgbWF5IHRha2UgYSBsb25nIHRpbWUuYFxuICB9XG4gIHJldHVybiB3YXJuaW5nTWVzc2FnZVxufVxuXG50eXBlIFNvdXJjZUlkUGFpciA9IHtcbiAgaWQ6IHN0cmluZ1xuICBzb3VyY2VJZDogc3RyaW5nXG59XG5cbmV4cG9ydCBjb25zdCBnZXRFeHBvcnRCb2R5ID0gYXN5bmMgKEV4cG9ydEluZm86IEV4cG9ydEluZm8pID0+IHtcbiAgY29uc3QgeyBleHBvcnRTaXplLCBjdXN0b21FeHBvcnRDb3VudCwgc2VsZWN0aW9uSW50ZXJmYWNlIH0gPSBFeHBvcnRJbmZvXG4gIGNvbnN0IGV4cG9ydFJlc3VsdExpbWl0ID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEV4cG9ydExpbWl0KClcbiAgY29uc3QgaGlkZGVuRmllbGRzID0gZ2V0SGlkZGVuRmllbGRzKClcbiAgY29uc3QgY29sdW1uT3JkZXIgPSBPdmVycmlkYWJsZUdldENvbHVtbk9yZGVyLmdldCgpKClcbiAgY29uc3Qgc3JjcyA9IGdldFNyY3Moc2VsZWN0aW9uSW50ZXJmYWNlKVxuICBjb25zdCBzb3J0cyA9IGdldFNvcnRzKHNlbGVjdGlvbkludGVyZmFjZSlcbiAgY29uc3QgcXVlcnkgPSBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KClcbiAgY29uc3QgY2FjaGVJZCA9IHF1ZXJ5LmdldCgnY2FjaGVJZCcpXG4gIGNvbnN0IHBob25ldGljcyA9IHF1ZXJ5LmdldCgncGhvbmV0aWNzJylcbiAgY29uc3Qgc3BlbGxjaGVjayA9IHF1ZXJ5LmdldCgnc3BlbGxjaGVjaycpXG4gIGxldCBhZGRpdGlvbmFsT3B0aW9ucyA9IEpTT04ucGFyc2UocXVlcnkuZ2V0KCdhZGRpdGlvbmFsT3B0aW9ucycpIHx8ICd7fScpXG5cbiAgbGV0IGNxbEZpbHRlclRyZWUgPSBxdWVyeS5nZXQoJ2ZpbHRlclRyZWUnKVxuICBpZiAocXVlcnkub3B0aW9ucy5saW1pdFRvRGVsZXRlZCkge1xuICAgIGNxbEZpbHRlclRyZWUgPSBsaW1pdFRvRGVsZXRlZChjcWxGaWx0ZXJUcmVlKVxuICB9IGVsc2UgaWYgKHF1ZXJ5Lm9wdGlvbnMubGltaXRUb0hpc3RvcmljKSB7XG4gICAgY3FsRmlsdGVyVHJlZSA9IGxpbWl0VG9IaXN0b3JpYyhjcWxGaWx0ZXJUcmVlKVxuICB9XG5cbiAgaWYgKHF1ZXJ5Lm9wdGlvbnMuYWRkaXRpb25hbE9wdGlvbnMpIHtcbiAgICBhZGRpdGlvbmFsT3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAgYWRkaXRpb25hbE9wdGlvbnMsXG4gICAgICBxdWVyeS5vcHRpb25zLmFkZGl0aW9uYWxPcHRpb25zXG4gICAgKVxuICB9XG5cbiAgY29uc3QgZXhwb3J0Q291bnQgPSBNYXRoLm1pbihcbiAgICBnZXRFeHBvcnRDb3VudCh7IGV4cG9ydFNpemUsIHNlbGVjdGlvbkludGVyZmFjZSwgY3VzdG9tRXhwb3J0Q291bnQgfSksXG4gICAgZXhwb3J0UmVzdWx0TGltaXRcbiAgKVxuICBjb25zdCBhcmdzID0ge1xuICAgIGhpZGRlbkZpZWxkczogaGlkZGVuRmllbGRzLmxlbmd0aCA+IDAgPyBoaWRkZW5GaWVsZHMgOiBbXSxcbiAgICBjb2x1bW5PcmRlcjogY29sdW1uT3JkZXIubGVuZ3RoID4gMCA/IGNvbHVtbk9yZGVyIDogW10sXG4gICAgY29sdW1uQWxpYXNNYXA6IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWc/LmF0dHJpYnV0ZUFsaWFzZXMsXG4gIH1cbiAgY29uc3Qgc2VhcmNoZXMgPSBbXVxuICBsZXQgcXVlcnlDb3VudCA9IGV4cG9ydENvdW50XG4gIGxldCBjcWwgPSBERUZBVUxUX1VTRVJfUVVFUllfT1BUSU9OUy50cmFuc2Zvcm1GaWx0ZXJUcmVlKHtcbiAgICBvcmlnaW5hbEZpbHRlclRyZWU6IGNxbEZpbHRlclRyZWUsXG4gICAgcXVlcnlSZWY6IHF1ZXJ5LFxuICB9KVxuICBpZiAoRXhwb3J0SW5mby5leHBvcnRTaXplID09PSAnY3VycmVudFBhZ2UnKSB7XG4gICAgY29uc3QgcmVzdWx0SWRTb3VyY2VQYWlyczogU291cmNlSWRQYWlyW10gPSBPYmplY3QudmFsdWVzKFxuICAgICAgcXVlcnkuZ2V0KCdyZXN1bHQnKS5nZXQoJ2xhenlSZXN1bHRzJykucmVzdWx0c1xuICAgICkubWFwKChyZXN1bHQ6IExhenlRdWVyeVJlc3VsdCkgPT4gKHtcbiAgICAgIGlkOiByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snaWQnXSxcbiAgICAgIHNvdXJjZUlkOiByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc291cmNlLWlkJ10sXG4gICAgfSkpXG5cbiAgICBjb25zdCBzcmNNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHJlc3VsdElkU291cmNlUGFpcnMucmVkdWNlKFxuICAgICAgKHNyY01hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+LCBjdXJQYWlyOiBTb3VyY2VJZFBhaXIpID0+IHtcbiAgICAgICAgaWYgKCFzcmNNYXBbY3VyUGFpci5zb3VyY2VJZF0pIHtcbiAgICAgICAgICBzcmNNYXBbY3VyUGFpci5zb3VyY2VJZF0gPSBbXVxuICAgICAgICB9XG4gICAgICAgIHNyY01hcFtjdXJQYWlyLnNvdXJjZUlkXS5wdXNoKGN1clBhaXIuaWQpXG4gICAgICAgIHJldHVybiBzcmNNYXBcbiAgICAgIH0sXG4gICAgICB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT5cbiAgICApXG4gICAgT2JqZWN0LmtleXMoc3JjTWFwKS5mb3JFYWNoKChzcmMpID0+IHtcbiAgICAgIGxldCBjcWwgPSBnZXRSZXN1bHRTZXRDcWwoc3JjTWFwW3NyY10pXG4gICAgICBpZiAocXVlcnkub3B0aW9ucy5saW1pdFRvRGVsZXRlZCkge1xuICAgICAgICBjcWwgPSBsaW1pdENxbFRvRGVsZXRlZChjcWwpXG4gICAgICB9XG4gICAgICBzZWFyY2hlcy5wdXNoKHtcbiAgICAgICAgc3JjczogW3NyY10sXG4gICAgICAgIGNxbCxcbiAgICAgICAgY291bnQ6IHNyY01hcFtzcmNdLmxlbmd0aCxcbiAgICAgICAgY2FjaGVJZCxcbiAgICAgIH0pXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBzZWFyY2hlcy5wdXNoKHtcbiAgICAgIHNyY3MsXG4gICAgICBjcWwsXG4gICAgICBjb3VudDogcXVlcnlDb3VudCxcbiAgICAgIGNhY2hlSWQsXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGhvbmV0aWNzLFxuICAgIHNwZWxsY2hlY2ssXG4gICAgYWRkaXRpb25hbE9wdGlvbnM6IEpTT04uc3RyaW5naWZ5KGFkZGl0aW9uYWxPcHRpb25zKSxcbiAgICBzZWFyY2hlcyxcbiAgICBjb3VudDogZXhwb3J0Q291bnQsXG4gICAgc29ydHMsXG4gICAgYXJncyxcbiAgfVxufVxuXG5jb25zdCBUYWJsZUV4cG9ydHMgPSAoe1xuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIG9uQ2xvc2UsXG4gIHNldEV4cG9ydFN1Y2Nlc3NmdWwsXG4gIGV4cG9ydFN1Y2Nlc3NmdWwsXG59OiBQcm9wcykgPT4ge1xuICBjb25zdCBleHBvcnRMaW1pdCA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRFeHBvcnRMaW1pdCgpXG4gIGNvbnN0IFtmb3JtYXRzLCBzZXRGb3JtYXRzXSA9IHVzZVN0YXRlPE9wdGlvbltdPihbXSlcbiAgY29uc3QgW2V4cG9ydEZvcm1hdCwgc2V0RXhwb3J0Rm9ybWF0XSA9IHVzZVN0YXRlKCcnKVxuICBjb25zdCBbZXhwb3J0U2l6ZSwgc2V0RXhwb3J0U2l6ZV0gPSB1c2VTdGF0ZSgnYWxsJylcbiAgY29uc3QgW3dhcm5pbmcsIHNldFdhcm5pbmddID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtjdXN0b21FeHBvcnRDb3VudCwgc2V0Q3VzdG9tRXhwb3J0Q291bnRdID0gdXNlU3RhdGUoZXhwb3J0TGltaXQpXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxuXG4gIGNvbnN0IG9uRXhwb3J0Q2xpY2sgPSBhc3luYyAoYWRkU25hY2s6IEFkZFNuYWNrLCBFeHBvcnRJbmZvOiBFeHBvcnRJbmZvKSA9PiB7XG4gICAgY29uc3QgZXhwb3J0Rm9ybWF0ID0gZW5jb2RlVVJJQ29tcG9uZW50KEV4cG9ydEluZm8uZXhwb3J0Rm9ybWF0KVxuICAgIHRyeSB7XG4gICAgICBzZXRMb2FkaW5nKHRydWUpXG4gICAgICBjb25zdCBib2R5ID0gYXdhaXQgZ2V0RXhwb3J0Qm9keShFeHBvcnRJbmZvKVxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBleHBvcnRSZXN1bHRTZXQoZXhwb3J0Rm9ybWF0LCBib2R5KVxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5ibG9iKClcbiAgICAgICAgY29uc3QgY29udGVudFR5cGUgPSByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJylcbiAgICAgICAgY29uc3QgZmlsZW5hbWUgPSBjb250ZW50RGlzcG9zaXRpb24ucGFyc2UoXG4gICAgICAgICAgcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2NvbnRlbnQtZGlzcG9zaXRpb24nKVxuICAgICAgICApLnBhcmFtZXRlcnMuZmlsZW5hbWVcbiAgICAgICAgT3ZlcnJpZGFibGVTYXZlRmlsZS5nZXQoKShmaWxlbmFtZSwgJ2RhdGE6JyArIGNvbnRlbnRUeXBlLCBkYXRhKVxuICAgICAgICBzZXRFeHBvcnRTdWNjZXNzZnVsKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRFeHBvcnRTdWNjZXNzZnVsKGZhbHNlKVxuICAgICAgICBhZGRTbmFjaygnRXJyb3I6IENvdWxkIG5vdCBleHBvcnQgcmVzdWx0cy4nLCB7XG4gICAgICAgICAgYWxlcnRQcm9wczogeyBzZXZlcml0eTogJ2Vycm9yJyB9LFxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgc2V0RXhwb3J0U3VjY2Vzc2Z1bChmYWxzZSlcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSlcbiAgICB9XG4gIH1cblxuICBpZiAoZXhwb3J0U3VjY2Vzc2Z1bCkge1xuICAgIG9uQ2xvc2UoKVxuICB9XG5cbiAgY29uc3QgZXhwb3J0U2l6ZXM6IE9wdGlvbltdID0gW1xuICAgIHtcbiAgICAgIGxhYmVsOiAnQ3VycmVudCBQYWdlJyxcbiAgICAgIHZhbHVlOiAnY3VycmVudFBhZ2UnLFxuICAgIH0sXG4gICAge1xuICAgICAgbGFiZWw6ICdBbGwgUmVzdWx0cycsXG4gICAgICB2YWx1ZTogJ2FsbCcsXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogJ1NwZWNpZmljIE51bWJlciBvZiBSZXN1bHRzJyxcbiAgICAgIHZhbHVlOiAnY3VzdG9tJyxcbiAgICB9LFxuICBdXG5cbiAgY29uc3QgYWRkU25hY2sgPSB1c2VTbmFjaygpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgZmV0Y2hGb3JtYXRzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgZm9ybWF0cyA9IGF3YWl0IGdldEV4cG9ydE9wdGlvbnMoVHJhbnNmb3JtZXIuUXVlcnkpXG5cbiAgICAgIHNldEZvcm1hdHMoXG4gICAgICAgIGZvcm1hdHMubWFwKChleHBvcnRGb3JtYXQ6IEV4cG9ydEZvcm1hdCkgPT4gKHtcbiAgICAgICAgICBsYWJlbDogZXhwb3J0Rm9ybWF0LmRpc3BsYXlOYW1lLFxuICAgICAgICAgIHZhbHVlOiBleHBvcnRGb3JtYXQuaWQsXG4gICAgICAgIH0pKVxuICAgICAgKVxuXG4gICAgICBmb3JtYXRzLmxlbmd0aCAmJiBzZXRFeHBvcnRGb3JtYXQoZm9ybWF0c1swXS5pZClcbiAgICB9XG4gICAgZmV0Y2hGb3JtYXRzKClcbiAgfSwgW10pXG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRXYXJuaW5nKFxuICAgICAgZ2V0V2FybmluZyh7XG4gICAgICAgIGV4cG9ydFNpemUsXG4gICAgICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgICAgICAgY3VzdG9tRXhwb3J0Q291bnQsXG4gICAgICB9KVxuICAgIClcbiAgfSwgW2V4cG9ydFNpemUsIGN1c3RvbUV4cG9ydENvdW50XSlcblxuICByZXR1cm4gZm9ybWF0cy5sZW5ndGggPT09IDAgPyAoXG4gICAgPExpbmVhclByb2dyZXNzIGNsYXNzTmFtZT1cInctZnVsbCBoLTJcIiAvPlxuICApIDogKFxuICAgIDw+XG4gICAgICA8RGlhbG9nQ29udGVudD5cbiAgICAgICAgPERpYWxvZ0NvbnRlbnRUZXh0PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC00XCIgc3R5bGU9e3sgbWluV2lkdGg6ICc0MDBweCcgfX0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTJcIj5cbiAgICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgb3B0aW9ucz17ZXhwb3J0U2l6ZXN9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhfZTogYW55LCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgc2V0RXhwb3J0U2l6ZShuZXdWYWx1ZS52YWx1ZSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IGV4cG9ydFNpemV9XG4gICAgICAgICAgICAgICAgZ2V0T3B0aW9uTGFiZWw9eyhvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24ubGFiZWxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgICAgICAgICB2YWx1ZT17ZXhwb3J0U2l6ZXMuZmluZChcbiAgICAgICAgICAgICAgICAgIChjaG9pY2UpID0+IGNob2ljZS52YWx1ZSA9PT0gZXhwb3J0U2l6ZVxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IChcbiAgICAgICAgICAgICAgICAgIDxUZXh0RmllbGQgey4uLnBhcmFtc30gbGFiZWw9XCJFeHBvcnRcIiB2YXJpYW50PVwib3V0bGluZWRcIiAvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtleHBvcnRTaXplID09PSAnY3VzdG9tJyA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yXCI+XG4gICAgICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICBsYWJlbD1cIlwiXG4gICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIG51bWJlciBvZiByZXN1bHRzIHlvdSB3b3VsZCBsaWtlIHRvIGV4cG9ydFwiXG4gICAgICAgICAgICAgICAgICBuYW1lPVwiY3VzdG9tRXhwb3J0XCJcbiAgICAgICAgICAgICAgICAgIHZhbHVlPXtjdXN0b21FeHBvcnRDb3VudH1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRDdXN0b21FeHBvcnRDb3VudChOdW1iZXIoZS50YXJnZXQudmFsdWUpKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdC0yIGV4cG9ydC1mb3JtYXRcIj5cbiAgICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgb3B0aW9ucz17Zm9ybWF0c31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KF9lOiBhbnksIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRFeHBvcnRGb3JtYXQobmV3VmFsdWUudmFsdWUpXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBpc09wdGlvbkVxdWFsVG9WYWx1ZT17KG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBleHBvcnRGb3JtYXR9XG4gICAgICAgICAgICAgICAgZ2V0T3B0aW9uTGFiZWw9eyhvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb24ubGFiZWxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgICAgICAgICB2YWx1ZT17Zm9ybWF0cy5maW5kKChjaG9pY2UpID0+IGNob2ljZS52YWx1ZSA9PT0gZXhwb3J0Rm9ybWF0KX1cbiAgICAgICAgICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4gKFxuICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZCB7Li4ucGFyYW1zfSBsYWJlbD1cImFzXCIgdmFyaWFudD1cIm91dGxpbmVkXCIgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7Wydjc3YnLCAncnRmJywgJ3hsc3gnXS5pbmNsdWRlcyhleHBvcnRGb3JtYXQpID8gKFxuICAgICAgICAgICAgICA8U3VtbWFyeU1hbmFnZUF0dHJpYnV0ZXMgaXNFeHBvcnQ9e3RydWV9IC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIHt3YXJuaW5nICYmIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3YXJuaW5nIHRleHQtY2VudGVyIHB0LTFcIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS13YXJuaW5nXCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj57d2FybmluZ308L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9EaWFsb2dDb250ZW50VGV4dD5cbiAgICAgIDwvRGlhbG9nQ29udGVudD5cbiAgICAgIDxEaWFsb2dBY3Rpb25zPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPVwicHQtMlwiXG4gICAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBqdXN0aWZ5Q29udGVudDogJ2ZsZXgtZW5kJyB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXItMlwiXG4gICAgICAgICAgICBkaXNhYmxlZD17bG9hZGluZ31cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgb25DbG9zZSgpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDxQcm9ncmVzc0J1dHRvblxuICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgICAgICAgIGRpc2FibGVkPXtcbiAgICAgICAgICAgICAgbG9hZGluZyAmJlxuICAgICAgICAgICAgICBleHBvcnRTaXplID09PSAnY3VzdG9tJyAmJlxuICAgICAgICAgICAgICBjdXN0b21FeHBvcnRDb3VudCA+IGV4cG9ydExpbWl0XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIG9uRXhwb3J0Q2xpY2soYWRkU25hY2ssIHtcbiAgICAgICAgICAgICAgICBleHBvcnRGb3JtYXQsXG4gICAgICAgICAgICAgICAgZXhwb3J0U2l6ZSxcbiAgICAgICAgICAgICAgICBjdXN0b21FeHBvcnRDb3VudCxcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIEV4cG9ydFxuICAgICAgICAgIDwvUHJvZ3Jlc3NCdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgIDwvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhYmxlRXhwb3J0c1xuIl19