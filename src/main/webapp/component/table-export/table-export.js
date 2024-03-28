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
import GetAppIcon from '@mui/icons-material/GetApp';
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
export var getDownloadBody = function (downloadInfo) { return __awaiter(void 0, void 0, void 0, function () {
    var exportSize, customExportCount, selectionInterface, exportResultLimit, hiddenFields, columnOrder, srcs, sorts, query, cacheId, phonetics, spellcheck, results, pageSize, exportCount, args, queryCount, cql, searches;
    var _a;
    return __generator(this, function (_b) {
        exportSize = downloadInfo.exportSize, customExportCount = downloadInfo.customExportCount, selectionInterface = downloadInfo.selectionInterface;
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
        if (downloadInfo.exportSize !== 'all') {
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
var onDownloadClick = function (addSnack, downloadInfo) { return __awaiter(void 0, void 0, void 0, function () {
    var exportFormat, body, response, data, contentType, filename, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                exportFormat = encodeURIComponent(downloadInfo.exportFormat);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
                return [4 /*yield*/, getDownloadBody(downloadInfo)];
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
                return [3 /*break*/, 6];
            case 5:
                addSnack('Error: Could not export results.', {
                    alertProps: { severity: 'error' },
                });
                _a.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                error_1 = _a.sent();
                console.error(error_1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
var TableExports = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var exportLimit = StartupDataStore.Configuration.getExportLimit();
    var _b = __read(useState([]), 2), formats = _b[0], setFormats = _b[1];
    var _c = __read(useState(''), 2), exportFormat = _c[0], setExportFormat = _c[1];
    var _d = __read(useState('all'), 2), exportSize = _d[0], setExportSize = _d[1];
    var _f = __read(useState(''), 2), warning = _f[0], setWarning = _f[1];
    var _g = __read(useState(exportLimit), 2), customExportCount = _g[0], setCustomExportCount = _g[1];
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
    return formats.length === 0 ? (React.createElement(LinearProgress, { className: "w-full h-2" })) : (React.createElement("div", { className: "p-4", style: { minWidth: '400px' } },
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
            React.createElement("span", null, warning))),
        React.createElement("div", { className: "pt-2" },
            React.createElement(Button, { fullWidth: true, variant: "contained", color: "primary", disabled: exportSize === 'custom' && customExportCount > exportLimit, onClick: function () {
                    return onDownloadClick(addSnack, {
                        exportFormat: exportFormat,
                        exportSize: exportSize,
                        customExportCount: customExportCount,
                        selectionInterface: selectionInterface,
                    });
                } },
                React.createElement(GetAppIcon, null),
                " Download"))));
};
export default TableExports;
//# sourceMappingURL=table-export.js.map