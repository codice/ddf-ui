import { __assign, __awaiter, __generator, __read } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
    return formats.length === 0 ? (_jsx(LinearProgress, { className: "w-full h-2" })) : (_jsxs(_Fragment, { children: [_jsx(DialogContent, { children: _jsx(DialogContentText, { children: _jsxs("div", { className: "p-4", style: { minWidth: '400px' }, children: [_jsx("div", { className: "pt-2", children: _jsx(Autocomplete, { size: "small", options: exportSizes, onChange: function (_e, newValue) {
                                        setExportSize(newValue.value);
                                    }, isOptionEqualToValue: function (option) { return option.value === exportSize; }, getOptionLabel: function (option) {
                                        return option.label;
                                    }, disableClearable: true, value: exportSizes.find(function (choice) { return choice.value === exportSize; }), renderInput: function (params) { return (_jsx(TextField, __assign({}, params, { label: "Export", variant: "outlined" }))); } }) }), exportSize === 'custom' ? (_jsx("div", { className: "pt-2", children: _jsx(TextField, { fullWidth: true, size: "small", type: "number", label: "", placeholder: "Enter number of results you would like to export", name: "customExport", value: customExportCount, onChange: function (e) {
                                        setCustomExportCount(Number(e.target.value));
                                    }, variant: "outlined" }) })) : (_jsx("div", {})), _jsx("div", { className: "pt-2 export-format", children: _jsx(Autocomplete, { size: "small", options: formats, onChange: function (_e, newValue) {
                                        setExportFormat(newValue.value);
                                    }, isOptionEqualToValue: function (option) { return option.value === exportFormat; }, getOptionLabel: function (option) {
                                        return option.label;
                                    }, disableClearable: true, value: formats.find(function (choice) { return choice.value === exportFormat; }), renderInput: function (params) { return (_jsx(TextField, __assign({}, params, { label: "as", variant: "outlined" }))); } }) }), ['csv', 'rtf', 'xlsx'].includes(exportFormat) ? (_jsx(SummaryManageAttributes, { isExport: true })) : null, warning && (_jsxs("div", { className: "warning text-center pt-1", children: [_jsx("i", { className: "fa fa-warning" }), _jsx("span", { children: warning })] }))] }) }) }), _jsx(DialogActions, { children: _jsxs("div", { className: "pt-2", style: { display: 'flex', justifyContent: 'flex-end' }, children: [_jsx(Button, { className: "mr-2", disabled: loading, variant: "text", onClick: function () {
                                onClose();
                            }, children: "Cancel" }), _jsx(ProgressButton, { variant: "contained", color: "primary", loading: loading, disabled: loading &&
                                exportSize === 'custom' &&
                                customExportCount > exportLimit, onClick: function () {
                                onExportClick(addSnack, {
                                    exportFormat: exportFormat,
                                    exportSize: exportSize,
                                    customExportCount: customExportCount,
                                    selectionInterface: selectionInterface,
                                });
                            }, children: "Export" })] }) })] }));
};
export default TableExports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC90YWJsZS1leHBvcnQvdGFibGUtZXhwb3J0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDM0MsbUpBQW1KO0FBQ25KLE9BQU8sa0JBQWtCLE1BQU0scUJBQXFCLENBQUE7QUFDcEQsT0FBTyxjQUFjLE1BQU0sOEJBQThCLENBQUE7QUFDekQsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxZQUFZLE1BQU0sNEJBQTRCLENBQUE7QUFDckQsT0FBTyxTQUFTLE1BQU0seUJBQXlCLENBQUE7QUFDL0MsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUE7QUFFeEMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDakUsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixXQUFXLEVBQ1gseUJBQXlCLEVBQ3pCLGVBQWUsR0FJaEIsTUFBTSxvQ0FBb0MsQ0FBQTtBQUMzQyxPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsMEJBQTBCLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUV0RSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFDakUsT0FBTyx1QkFBdUIsTUFBTSwyRUFBMkUsQ0FBQTtBQUMvRyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxpREFBaUQsQ0FBQTtBQUNyRixPQUFPLGNBQWMsTUFBTSx1REFBdUQsQ0FBQTtBQUNsRixPQUFPLGFBQWEsTUFBTSwyQ0FBMkMsQ0FBQTtBQUNyRSxPQUFPLGFBQWEsTUFBTSwyQ0FB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bkIsS0FBSyxFQUFDLFNBQVMsRUFDZixPQUFPLEVBQUUsT0FBTyxFQUNoQixRQUFRLEVBQ04sT0FBTztnQ0FDUCxVQUFVLEtBQUssUUFBUTtnQ0FDdkIsaUJBQWlCLEdBQUcsV0FBVyxFQUVqQyxPQUFPLEVBQUU7Z0NBQ1AsYUFBYSxDQUFDLFFBQVEsRUFBRTtvQ0FDdEIsWUFBWSxjQUFBO29DQUNaLFVBQVUsWUFBQTtvQ0FDVixpQkFBaUIsbUJBQUE7b0NBQ2pCLGtCQUFrQixvQkFBQTtpQ0FDbkIsQ0FBQyxDQUFBOzRCQUNKLENBQUMsdUJBR2MsSUFDYixHQUNRLElBQ2YsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxZQUFZLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2NvbnQuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IGNvbnRlbnREaXNwb3NpdGlvbiBmcm9tICdjb250ZW50LWRpc3Bvc2l0aW9uJ1xuaW1wb3J0IExpbmVhclByb2dyZXNzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTGluZWFyUHJvZ3Jlc3MnXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgdXNlU25hY2sgZnJvbSAnLi4vaG9va3MvdXNlU25hY2snXG5pbXBvcnQgeyBBZGRTbmFjayB9IGZyb20gJy4uL3NuYWNrL3NuYWNrLnByb3ZpZGVyJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7XG4gIGdldEV4cG9ydE9wdGlvbnMsXG4gIFRyYW5zZm9ybWVyLFxuICBPdmVycmlkYWJsZUdldENvbHVtbk9yZGVyLFxuICBleHBvcnRSZXN1bHRTZXQsXG4gIEV4cG9ydENvdW50SW5mbyxcbiAgRXhwb3J0SW5mbyxcbiAgRXhwb3J0Rm9ybWF0LFxufSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvZXhwb3J0J1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCB7IERFRkFVTFRfVVNFUl9RVUVSWV9PUFRJT05TIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvVHlwZWRRdWVyeSdcblxuaW1wb3J0IHsgZ2V0UmVzdWx0U2V0Q3FsIH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2NxbCdcbmltcG9ydCBTdW1tYXJ5TWFuYWdlQXR0cmlidXRlcyBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvc3VtbWFyeS1tYW5hZ2UtYXR0cmlidXRlcy9zdW1tYXJ5LW1hbmFnZS1hdHRyaWJ1dGVzJ1xuaW1wb3J0IHsgT3ZlcnJpZGFibGVTYXZlRmlsZSB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9zYXZlLWZpbGUvc2F2ZS1maWxlJ1xuaW1wb3J0IFByb2dyZXNzQnV0dG9uIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9wcm9ncmVzcy1idXR0b24vcHJvZ3Jlc3MtYnV0dG9uJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnQgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dDb250ZW50L0RpYWxvZ0NvbnRlbnQnXG5pbXBvcnQgRGlhbG9nQWN0aW9ucyBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0FjdGlvbnMvRGlhbG9nQWN0aW9ucydcbmltcG9ydCBEaWFsb2dDb250ZW50VGV4dCBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0NvbnRlbnRUZXh0J1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IGxpbWl0VG9EZWxldGVkLCBsaW1pdFRvSGlzdG9yaWMgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9RdWVyeSdcblxuZXhwb3J0IHR5cGUgUHJvcHMgPSB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG4gIG9uQ2xvc2U/OiBhbnlcbiAgZXhwb3J0U3VjY2Vzc2Z1bD86IGJvb2xlYW5cbiAgc2V0RXhwb3J0U3VjY2Vzc2Z1bD86IGFueVxufVxuXG50eXBlIFNvdXJjZSA9IHtcbiAgaWQ6IHN0cmluZ1xuICBoaXRzOiBudW1iZXJcbn1cblxudHlwZSBPcHRpb24gPSB7XG4gIGxhYmVsOiBzdHJpbmdcbiAgdmFsdWU6IHN0cmluZ1xufVxuXG5mdW5jdGlvbiBnZXRTcmNzKHNlbGVjdGlvbkludGVyZmFjZTogYW55KSB7XG4gIHJldHVybiBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuZ2V0U2VsZWN0ZWRTb3VyY2VzKClcbn1cblxuZnVuY3Rpb24gZ2V0SGlkZGVuRmllbGRzKCk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnY29sdW1uSGlkZScpXG59XG5cbmZ1bmN0aW9uIGdldFNvcnRzKHNlbGVjdGlvbkludGVyZmFjZTogYW55KSB7XG4gIHJldHVybiAoXG4gICAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCdyZXN1bHRTb3J0JykgfHxcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuZ2V0KCdzb3J0cycpXG4gIClcbn1cblxuZnVuY3Rpb24gZ2V0SGl0cyhzb3VyY2VzOiBTb3VyY2VbXSk6IG51bWJlciB7XG4gIHJldHVybiBzb3VyY2VzXG4gICAgLmZpbHRlcigoc291cmNlKSA9PiBzb3VyY2UuaWQgIT09ICdjYWNoZScpXG4gICAgLnJlZHVjZSgoaGl0cywgc291cmNlKSA9PiAoc291cmNlLmhpdHMgPyBoaXRzICsgc291cmNlLmhpdHMgOiBoaXRzKSwgMClcbn1cbmZ1bmN0aW9uIGdldEV4cG9ydENvdW50KHtcbiAgZXhwb3J0U2l6ZSxcbiAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICBjdXN0b21FeHBvcnRDb3VudCxcbn06IEV4cG9ydENvdW50SW5mbyk6IG51bWJlciB7XG4gIGlmIChleHBvcnRTaXplID09PSAnY3VzdG9tJykge1xuICAgIHJldHVybiBjdXN0b21FeHBvcnRDb3VudFxuICB9XG4gIGNvbnN0IHJlc3VsdCA9IHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5nZXQoJ3Jlc3VsdCcpXG4gIHJldHVybiBleHBvcnRTaXplID09PSAnYWxsJ1xuICAgID8gZ2V0SGl0cyhPYmplY3QudmFsdWVzKHJlc3VsdC5nZXQoJ2xhenlSZXN1bHRzJykuc3RhdHVzKSlcbiAgICA6IE9iamVjdC5rZXlzKHJlc3VsdC5nZXQoJ2xhenlSZXN1bHRzJykucmVzdWx0cykubGVuZ3RoXG59XG5cbmV4cG9ydCBjb25zdCBnZXRXYXJuaW5nID0gKGV4cG9ydENvdW50SW5mbzogRXhwb3J0Q291bnRJbmZvKTogc3RyaW5nID0+IHtcbiAgY29uc3QgZXhwb3J0UmVzdWx0TGltaXQgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RXhwb3J0TGltaXQoKVxuICBjb25zdCBleHBvcnRDb3VudCA9IGdldEV4cG9ydENvdW50KGV4cG9ydENvdW50SW5mbylcbiAgY29uc3QgcmVzdWx0ID0gZXhwb3J0Q291bnRJbmZvLnNlbGVjdGlvbkludGVyZmFjZVxuICAgIC5nZXRDdXJyZW50UXVlcnkoKVxuICAgIC5nZXQoJ3Jlc3VsdCcpXG4gIGNvbnN0IHRvdGFsSGl0cyA9IGdldEhpdHMoT2JqZWN0LnZhbHVlcyhyZXN1bHQuZ2V0KCdsYXp5UmVzdWx0cycpLnN0YXR1cykpXG4gIGNvbnN0IGxpbWl0V2FybmluZyA9IGBZb3UgY2Fubm90IGV4cG9ydCBtb3JlIHRoYW4gdGhlIGFkbWluaXN0cmF0b3IgY29uZmlndXJlZCBsaW1pdCBvZiAke2V4cG9ydFJlc3VsdExpbWl0fS5gXG4gIGxldCB3YXJuaW5nTWVzc2FnZSA9ICcnXG4gIGlmIChleHBvcnRDb3VudCA+IGV4cG9ydFJlc3VsdExpbWl0KSB7XG4gICAgaWYgKGV4cG9ydENvdW50SW5mby5leHBvcnRTaXplID09PSAnY3VzdG9tJykge1xuICAgICAgcmV0dXJuIGxpbWl0V2FybmluZ1xuICAgIH1cbiAgICB3YXJuaW5nTWVzc2FnZSA9XG4gICAgICBsaW1pdFdhcm5pbmcgK1xuICAgICAgYCAgT25seSAke2V4cG9ydFJlc3VsdExpbWl0fSAke1xuICAgICAgICBleHBvcnRSZXN1bHRMaW1pdCA9PT0gMSA/IGByZXN1bHRgIDogYHJlc3VsdHNgXG4gICAgICB9IHdpbGwgYmUgZXhwb3J0ZWQuYFxuICB9XG4gIGlmIChleHBvcnRDb3VudEluZm8uZXhwb3J0U2l6ZSA9PT0gJ2N1c3RvbScpIHtcbiAgICBpZiAoZXhwb3J0Q291bnQgPiB0b3RhbEhpdHMpIHtcbiAgICAgIHdhcm5pbmdNZXNzYWdlID0gYFlvdSBhcmUgdHJ5aW5nIHRvIGV4cG9ydCAke2V4cG9ydENvdW50fSByZXN1bHRzIGJ1dCB0aGVyZSAke1xuICAgICAgICB0b3RhbEhpdHMgPT09IDEgPyBgaXNgIDogYGFyZWBcbiAgICAgIH0gb25seSAke3RvdGFsSGl0c30uICBPbmx5ICR7dG90YWxIaXRzfSAke1xuICAgICAgICB0b3RhbEhpdHMgPT09IDEgPyBgcmVzdWx0YCA6IGByZXN1bHRzYFxuICAgICAgfSB3aWxsIGJlIGV4cG9ydGVkLmBcbiAgICB9XG4gIH1cbiAgaWYgKHRvdGFsSGl0cyA+IDEwMCAmJiBleHBvcnRDb3VudCA+IDEwMCAmJiBleHBvcnRSZXN1bHRMaW1pdCA+IDEwMCkge1xuICAgIHdhcm5pbmdNZXNzYWdlICs9IGAgIFRoaXMgbWF5IHRha2UgYSBsb25nIHRpbWUuYFxuICB9XG4gIHJldHVybiB3YXJuaW5nTWVzc2FnZVxufVxuXG50eXBlIFNvdXJjZUlkUGFpciA9IHtcbiAgaWQ6IHN0cmluZ1xuICBzb3VyY2VJZDogc3RyaW5nXG59XG5cbmV4cG9ydCBjb25zdCBnZXRFeHBvcnRCb2R5ID0gYXN5bmMgKEV4cG9ydEluZm86IEV4cG9ydEluZm8pID0+IHtcbiAgY29uc3QgeyBleHBvcnRTaXplLCBjdXN0b21FeHBvcnRDb3VudCwgc2VsZWN0aW9uSW50ZXJmYWNlIH0gPSBFeHBvcnRJbmZvXG4gIGNvbnN0IGV4cG9ydFJlc3VsdExpbWl0ID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEV4cG9ydExpbWl0KClcbiAgY29uc3QgaGlkZGVuRmllbGRzID0gZ2V0SGlkZGVuRmllbGRzKClcbiAgY29uc3QgY29sdW1uT3JkZXIgPSBPdmVycmlkYWJsZUdldENvbHVtbk9yZGVyLmdldCgpKClcbiAgY29uc3Qgc3JjcyA9IGdldFNyY3Moc2VsZWN0aW9uSW50ZXJmYWNlKVxuICBjb25zdCBzb3J0cyA9IGdldFNvcnRzKHNlbGVjdGlvbkludGVyZmFjZSlcbiAgY29uc3QgcXVlcnkgPSBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KClcbiAgY29uc3QgY2FjaGVJZCA9IHF1ZXJ5LmdldCgnY2FjaGVJZCcpXG4gIGNvbnN0IHBob25ldGljcyA9IHF1ZXJ5LmdldCgncGhvbmV0aWNzJylcbiAgY29uc3Qgc3BlbGxjaGVjayA9IHF1ZXJ5LmdldCgnc3BlbGxjaGVjaycpXG4gIGxldCBhZGRpdGlvbmFsT3B0aW9ucyA9IEpTT04ucGFyc2UocXVlcnkuZ2V0KCdhZGRpdGlvbmFsT3B0aW9ucycpIHx8ICd7fScpXG5cbiAgbGV0IGNxbEZpbHRlclRyZWUgPSBxdWVyeS5nZXQoJ2ZpbHRlclRyZWUnKVxuICBpZiAocXVlcnkub3B0aW9ucy5saW1pdFRvRGVsZXRlZCkge1xuICAgIGNxbEZpbHRlclRyZWUgPSBsaW1pdFRvRGVsZXRlZChjcWxGaWx0ZXJUcmVlKVxuICB9IGVsc2UgaWYgKHF1ZXJ5Lm9wdGlvbnMubGltaXRUb0hpc3RvcmljKSB7XG4gICAgY3FsRmlsdGVyVHJlZSA9IGxpbWl0VG9IaXN0b3JpYyhjcWxGaWx0ZXJUcmVlKVxuICB9XG5cbiAgaWYgKHF1ZXJ5Lm9wdGlvbnMuYWRkaXRpb25hbE9wdGlvbnMpIHtcbiAgICBhZGRpdGlvbmFsT3B0aW9ucyA9IF8uZXh0ZW5kKFxuICAgICAgYWRkaXRpb25hbE9wdGlvbnMsXG4gICAgICBxdWVyeS5vcHRpb25zLmFkZGl0aW9uYWxPcHRpb25zXG4gICAgKVxuICB9XG5cbiAgY29uc3QgZXhwb3J0Q291bnQgPSBNYXRoLm1pbihcbiAgICBnZXRFeHBvcnRDb3VudCh7IGV4cG9ydFNpemUsIHNlbGVjdGlvbkludGVyZmFjZSwgY3VzdG9tRXhwb3J0Q291bnQgfSksXG4gICAgZXhwb3J0UmVzdWx0TGltaXRcbiAgKVxuICBjb25zdCBhcmdzID0ge1xuICAgIGhpZGRlbkZpZWxkczogaGlkZGVuRmllbGRzLmxlbmd0aCA+IDAgPyBoaWRkZW5GaWVsZHMgOiBbXSxcbiAgICBjb2x1bW5PcmRlcjogY29sdW1uT3JkZXIubGVuZ3RoID4gMCA/IGNvbHVtbk9yZGVyIDogW10sXG4gICAgY29sdW1uQWxpYXNNYXA6IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWc/LmF0dHJpYnV0ZUFsaWFzZXMsXG4gIH1cbiAgY29uc3Qgc2VhcmNoZXMgPSBbXVxuICBsZXQgcXVlcnlDb3VudCA9IGV4cG9ydENvdW50XG4gIGxldCBjcWwgPSBERUZBVUxUX1VTRVJfUVVFUllfT1BUSU9OUy50cmFuc2Zvcm1GaWx0ZXJUcmVlKHtcbiAgICBvcmlnaW5hbEZpbHRlclRyZWU6IGNxbEZpbHRlclRyZWUsXG4gICAgcXVlcnlSZWY6IHF1ZXJ5LFxuICB9KVxuICBpZiAoRXhwb3J0SW5mby5leHBvcnRTaXplID09PSAnY3VycmVudFBhZ2UnKSB7XG4gICAgY29uc3QgcmVzdWx0SWRTb3VyY2VQYWlyczogU291cmNlSWRQYWlyW10gPSBPYmplY3QudmFsdWVzKFxuICAgICAgcXVlcnkuZ2V0KCdyZXN1bHQnKS5nZXQoJ2xhenlSZXN1bHRzJykucmVzdWx0c1xuICAgICkubWFwKChyZXN1bHQ6IExhenlRdWVyeVJlc3VsdCkgPT4gKHtcbiAgICAgIGlkOiByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snaWQnXSxcbiAgICAgIHNvdXJjZUlkOiByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc291cmNlLWlkJ10sXG4gICAgfSkpXG5cbiAgICBjb25zdCBzcmNNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHJlc3VsdElkU291cmNlUGFpcnMucmVkdWNlKFxuICAgICAgKHNyY01hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+LCBjdXJQYWlyOiBTb3VyY2VJZFBhaXIpID0+IHtcbiAgICAgICAgaWYgKCFzcmNNYXBbY3VyUGFpci5zb3VyY2VJZF0pIHtcbiAgICAgICAgICBzcmNNYXBbY3VyUGFpci5zb3VyY2VJZF0gPSBbXVxuICAgICAgICB9XG4gICAgICAgIHNyY01hcFtjdXJQYWlyLnNvdXJjZUlkXS5wdXNoKGN1clBhaXIuaWQpXG4gICAgICAgIHJldHVybiBzcmNNYXBcbiAgICAgIH0sXG4gICAgICB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT5cbiAgICApXG4gICAgT2JqZWN0LmtleXMoc3JjTWFwKS5mb3JFYWNoKChzcmMpID0+IHtcbiAgICAgIHNlYXJjaGVzLnB1c2goe1xuICAgICAgICBzcmNzOiBbc3JjXSxcbiAgICAgICAgY3FsOiBnZXRSZXN1bHRTZXRDcWwoc3JjTWFwW3NyY10pLFxuICAgICAgICBjb3VudDogc3JjTWFwW3NyY10ubGVuZ3RoLFxuICAgICAgICBjYWNoZUlkLFxuICAgICAgfSlcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIHNlYXJjaGVzLnB1c2goe1xuICAgICAgc3JjcyxcbiAgICAgIGNxbCxcbiAgICAgIGNvdW50OiBxdWVyeUNvdW50LFxuICAgICAgY2FjaGVJZCxcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwaG9uZXRpY3MsXG4gICAgc3BlbGxjaGVjayxcbiAgICBhZGRpdGlvbmFsT3B0aW9uczogSlNPTi5zdHJpbmdpZnkoYWRkaXRpb25hbE9wdGlvbnMpLFxuICAgIHNlYXJjaGVzLFxuICAgIGNvdW50OiBleHBvcnRDb3VudCxcbiAgICBzb3J0cyxcbiAgICBhcmdzLFxuICB9XG59XG5cbmNvbnN0IFRhYmxlRXhwb3J0cyA9ICh7XG4gIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgb25DbG9zZSxcbiAgc2V0RXhwb3J0U3VjY2Vzc2Z1bCxcbiAgZXhwb3J0U3VjY2Vzc2Z1bCxcbn06IFByb3BzKSA9PiB7XG4gIGNvbnN0IGV4cG9ydExpbWl0ID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEV4cG9ydExpbWl0KClcbiAgY29uc3QgW2Zvcm1hdHMsIHNldEZvcm1hdHNdID0gdXNlU3RhdGU8T3B0aW9uW10+KFtdKVxuICBjb25zdCBbZXhwb3J0Rm9ybWF0LCBzZXRFeHBvcnRGb3JtYXRdID0gdXNlU3RhdGUoJycpXG4gIGNvbnN0IFtleHBvcnRTaXplLCBzZXRFeHBvcnRTaXplXSA9IHVzZVN0YXRlKCdhbGwnKVxuICBjb25zdCBbd2FybmluZywgc2V0V2FybmluZ10gPSB1c2VTdGF0ZSgnJylcbiAgY29uc3QgW2N1c3RvbUV4cG9ydENvdW50LCBzZXRDdXN0b21FeHBvcnRDb3VudF0gPSB1c2VTdGF0ZShleHBvcnRMaW1pdClcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3Qgb25FeHBvcnRDbGljayA9IGFzeW5jIChhZGRTbmFjazogQWRkU25hY2ssIEV4cG9ydEluZm86IEV4cG9ydEluZm8pID0+IHtcbiAgICBjb25zdCBleHBvcnRGb3JtYXQgPSBlbmNvZGVVUklDb21wb25lbnQoRXhwb3J0SW5mby5leHBvcnRGb3JtYXQpXG4gICAgdHJ5IHtcbiAgICAgIHNldExvYWRpbmcodHJ1ZSlcbiAgICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBnZXRFeHBvcnRCb2R5KEV4cG9ydEluZm8pXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGV4cG9ydFJlc3VsdFNldChleHBvcnRGb3JtYXQsIGJvZHkpXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKVxuICAgICAgICBjb25zdCBjb250ZW50VHlwZSA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKVxuICAgICAgICBjb25zdCBmaWxlbmFtZSA9IGNvbnRlbnREaXNwb3NpdGlvbi5wYXJzZShcbiAgICAgICAgICByZXNwb25zZS5oZWFkZXJzLmdldCgnY29udGVudC1kaXNwb3NpdGlvbicpXG4gICAgICAgICkucGFyYW1ldGVycy5maWxlbmFtZVxuICAgICAgICBPdmVycmlkYWJsZVNhdmVGaWxlLmdldCgpKGZpbGVuYW1lLCAnZGF0YTonICsgY29udGVudFR5cGUsIGRhdGEpXG4gICAgICAgIHNldEV4cG9ydFN1Y2Nlc3NmdWwodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEV4cG9ydFN1Y2Nlc3NmdWwoZmFsc2UpXG4gICAgICAgIGFkZFNuYWNrKCdFcnJvcjogQ291bGQgbm90IGV4cG9ydCByZXN1bHRzLicsIHtcbiAgICAgICAgICBhbGVydFByb3BzOiB7IHNldmVyaXR5OiAnZXJyb3InIH0sXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgICBzZXRFeHBvcnRTdWNjZXNzZnVsKGZhbHNlKVxuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuXG4gIGlmIChleHBvcnRTdWNjZXNzZnVsKSB7XG4gICAgb25DbG9zZSgpXG4gIH1cblxuICBjb25zdCBleHBvcnRTaXplczogT3B0aW9uW10gPSBbXG4gICAge1xuICAgICAgbGFiZWw6ICdDdXJyZW50IFBhZ2UnLFxuICAgICAgdmFsdWU6ICdjdXJyZW50UGFnZScsXG4gICAgfSxcbiAgICB7XG4gICAgICBsYWJlbDogJ0FsbCBSZXN1bHRzJyxcbiAgICAgIHZhbHVlOiAnYWxsJyxcbiAgICB9LFxuICAgIHtcbiAgICAgIGxhYmVsOiAnU3BlY2lmaWMgTnVtYmVyIG9mIFJlc3VsdHMnLFxuICAgICAgdmFsdWU6ICdjdXN0b20nLFxuICAgIH0sXG4gIF1cblxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmZXRjaEZvcm1hdHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBmb3JtYXRzID0gYXdhaXQgZ2V0RXhwb3J0T3B0aW9ucyhUcmFuc2Zvcm1lci5RdWVyeSlcblxuICAgICAgc2V0Rm9ybWF0cyhcbiAgICAgICAgZm9ybWF0cy5tYXAoKGV4cG9ydEZvcm1hdDogRXhwb3J0Rm9ybWF0KSA9PiAoe1xuICAgICAgICAgIGxhYmVsOiBleHBvcnRGb3JtYXQuZGlzcGxheU5hbWUsXG4gICAgICAgICAgdmFsdWU6IGV4cG9ydEZvcm1hdC5pZCxcbiAgICAgICAgfSkpXG4gICAgICApXG5cbiAgICAgIGZvcm1hdHMubGVuZ3RoICYmIHNldEV4cG9ydEZvcm1hdChmb3JtYXRzWzBdLmlkKVxuICAgIH1cbiAgICBmZXRjaEZvcm1hdHMoKVxuICB9LCBbXSlcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldFdhcm5pbmcoXG4gICAgICBnZXRXYXJuaW5nKHtcbiAgICAgICAgZXhwb3J0U2l6ZSxcbiAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICAgICAgICBjdXN0b21FeHBvcnRDb3VudCxcbiAgICAgIH0pXG4gICAgKVxuICB9LCBbZXhwb3J0U2l6ZSwgY3VzdG9tRXhwb3J0Q291bnRdKVxuXG4gIHJldHVybiBmb3JtYXRzLmxlbmd0aCA9PT0gMCA/IChcbiAgICA8TGluZWFyUHJvZ3Jlc3MgY2xhc3NOYW1lPVwidy1mdWxsIGgtMlwiIC8+XG4gICkgOiAoXG4gICAgPD5cbiAgICAgIDxEaWFsb2dDb250ZW50PlxuICAgICAgICA8RGlhbG9nQ29udGVudFRleHQ+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTRcIiBzdHlsZT17eyBtaW5XaWR0aDogJzQwMHB4JyB9fT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHQtMlwiPlxuICAgICAgICAgICAgICA8QXV0b2NvbXBsZXRlXG4gICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICBvcHRpb25zPXtleHBvcnRTaXplc31cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KF9lOiBhbnksIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBzZXRFeHBvcnRTaXplKG5ld1ZhbHVlLnZhbHVlKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgaXNPcHRpb25FcXVhbFRvVmFsdWU9eyhvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gZXhwb3J0U2l6ZX1cbiAgICAgICAgICAgICAgICBnZXRPcHRpb25MYWJlbD17KG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5sYWJlbFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICAgICAgICAgIHZhbHVlPXtleHBvcnRTaXplcy5maW5kKFxuICAgICAgICAgICAgICAgICAgKGNob2ljZSkgPT4gY2hvaWNlLnZhbHVlID09PSBleHBvcnRTaXplXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4gKFxuICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZCB7Li4ucGFyYW1zfSBsYWJlbD1cIkV4cG9ydFwiIHZhcmlhbnQ9XCJvdXRsaW5lZFwiIC8+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge2V4cG9ydFNpemUgPT09ICdjdXN0b20nID8gKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTJcIj5cbiAgICAgICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgIGxhYmVsPVwiXCJcbiAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRW50ZXIgbnVtYmVyIG9mIHJlc3VsdHMgeW91IHdvdWxkIGxpa2UgdG8gZXhwb3J0XCJcbiAgICAgICAgICAgICAgICAgIG5hbWU9XCJjdXN0b21FeHBvcnRcIlxuICAgICAgICAgICAgICAgICAgdmFsdWU9e2N1c3RvbUV4cG9ydENvdW50fVxuICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldEN1c3RvbUV4cG9ydENvdW50KE51bWJlcihlLnRhcmdldC52YWx1ZSkpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxkaXYgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTIgZXhwb3J0LWZvcm1hdFwiPlxuICAgICAgICAgICAgICA8QXV0b2NvbXBsZXRlXG4gICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICBvcHRpb25zPXtmb3JtYXRzfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoX2U6IGFueSwgbmV3VmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgIHNldEV4cG9ydEZvcm1hdChuZXdWYWx1ZS52YWx1ZSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IGV4cG9ydEZvcm1hdH1cbiAgICAgICAgICAgICAgICBnZXRPcHRpb25MYWJlbD17KG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5sYWJlbFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICAgICAgICAgIHZhbHVlPXtmb3JtYXRzLmZpbmQoKGNob2ljZSkgPT4gY2hvaWNlLnZhbHVlID09PSBleHBvcnRGb3JtYXQpfVxuICAgICAgICAgICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkIHsuLi5wYXJhbXN9IGxhYmVsPVwiYXNcIiB2YXJpYW50PVwib3V0bGluZWRcIiAvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHtbJ2NzdicsICdydGYnLCAneGxzeCddLmluY2x1ZGVzKGV4cG9ydEZvcm1hdCkgPyAoXG4gICAgICAgICAgICAgIDxTdW1tYXJ5TWFuYWdlQXR0cmlidXRlcyBpc0V4cG9ydD17dHJ1ZX0gLz5cbiAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAge3dhcm5pbmcgJiYgKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIndhcm5pbmcgdGV4dC1jZW50ZXIgcHQtMVwiPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLXdhcm5pbmdcIiAvPlxuICAgICAgICAgICAgICAgIDxzcGFuPnt3YXJuaW5nfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0RpYWxvZ0NvbnRlbnRUZXh0PlxuICAgICAgPC9EaWFsb2dDb250ZW50PlxuICAgICAgPERpYWxvZ0FjdGlvbnM+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJwdC0yXCJcbiAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnZmxleC1lbmQnIH19XG4gICAgICAgID5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJtci0yXCJcbiAgICAgICAgICAgIGRpc2FibGVkPXtsb2FkaW5nfVxuICAgICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBvbkNsb3NlKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgQ2FuY2VsXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPFByb2dyZXNzQnV0dG9uXG4gICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICBsb2FkaW5nPXtsb2FkaW5nfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e1xuICAgICAgICAgICAgICBsb2FkaW5nICYmXG4gICAgICAgICAgICAgIGV4cG9ydFNpemUgPT09ICdjdXN0b20nICYmXG4gICAgICAgICAgICAgIGN1c3RvbUV4cG9ydENvdW50ID4gZXhwb3J0TGltaXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgb25FeHBvcnRDbGljayhhZGRTbmFjaywge1xuICAgICAgICAgICAgICAgIGV4cG9ydEZvcm1hdCxcbiAgICAgICAgICAgICAgICBleHBvcnRTaXplLFxuICAgICAgICAgICAgICAgIGN1c3RvbUV4cG9ydENvdW50LFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgRXhwb3J0XG4gICAgICAgICAgPC9Qcm9ncmVzc0J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L0RpYWxvZ0FjdGlvbnM+XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgVGFibGVFeHBvcnRzXG4iXX0=