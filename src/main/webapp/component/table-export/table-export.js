import { __awaiter, __generator, __read } from "tslib";
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
import TableExport from '../../react-component/table-export';
import { getExportOptions, Transformer, } from '../../react-component/utils/export';
import user from '../../component/singletons/user-instance';
import { exportResultSet, } from '../../react-component/utils/export';
import saveFile from '../../react-component/utils/save-file';
import { DEFAULT_USER_QUERY_OPTIONS } from '../../js/model/TypedQuery';
import useSnack from '../hooks/useSnack';
import properties from '../../js/properties';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cont... Remove this comment to see the full error message
import contentDisposition from 'content-disposition';
import { getResultSetCql } from '../../react-component/utils/cql';
function getSrcs(selectionInterface) {
    return selectionInterface.getCurrentQuery().getSelectedSources();
}
function getColumnOrder(filteredAttributes) {
    return user
        .get('user')
        .get('preferences')
        .get('columnOrder')
        .filter(function (property) {
        return filteredAttributes.includes(property) && !properties.isHidden(property);
    });
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
    var exportCount = getExportCount(exportCountInfo);
    var result = exportCountInfo.selectionInterface
        .getCurrentQuery()
        .get('result');
    var totalHits = getHits(Object.values(result.get('lazyResults').status));
    var limitWarning = "You cannot export more than the administrator configured limit of ".concat(properties.exportResultLimit, ".");
    var warningMessage = '';
    if (exportCount > properties.exportResultLimit) {
        if (exportCountInfo.exportSize === 'custom') {
            return limitWarning;
        }
        warningMessage =
            limitWarning +
                "  Only ".concat(properties.exportResultLimit, " ").concat(properties.exportResultLimit === 1 ? "result" : "results", " will be exported.");
    }
    if (exportCountInfo.exportSize === 'custom') {
        if (exportCount > totalHits) {
            warningMessage = "You are trying to export ".concat(exportCount, " results but there ").concat(totalHits === 1 ? "is" : "are", " only ").concat(totalHits, ".  Only ").concat(totalHits, " ").concat(totalHits === 1 ? "result" : "results", " will be exported.");
        }
    }
    if (totalHits > 100 &&
        exportCount > 100 &&
        properties.exportResultLimit > 100) {
        warningMessage += "  This may take a long time.";
    }
    return warningMessage;
};
export var getDownloadBody = function (downloadInfo) {
    var exportSize = downloadInfo.exportSize, customExportCount = downloadInfo.customExportCount, selectionInterface = downloadInfo.selectionInterface, filteredAttributes = downloadInfo.filteredAttributes;
    var hiddenFields = getHiddenFields();
    var columnOrder = getColumnOrder(filteredAttributes);
    var srcs = getSrcs(selectionInterface);
    var sorts = getSorts(selectionInterface);
    var query = selectionInterface.getCurrentQuery();
    var cacheId = query.get('cacheId');
    var phonetics = query.get('phonetics');
    var spellcheck = query.get('spellcheck');
    var results = Object.keys(query.get('result').get('lazyResults').results);
    var pageSize = results.length;
    var exportCount = Math.min(getExportCount({ exportSize: exportSize, selectionInterface: selectionInterface, customExportCount: customExportCount }), properties.exportResultLimit);
    var args = {
        hiddenFields: hiddenFields.length > 0 ? hiddenFields : [],
        columnOrder: columnOrder.length > 0 ? columnOrder : [],
        columnAliasMap: properties.attributeAliases
    };
    var queryCount = exportCount;
    var cql = DEFAULT_USER_QUERY_OPTIONS.transformFilterTree({
        originalFilterTree: query.get('filterTree'),
        queryRef: query
    });
    if (downloadInfo.exportSize !== 'all') {
        queryCount = pageSize;
        cql = getResultSetCql(results);
    }
    var searches = [
        {
            srcs: srcs,
            cql: cql,
            count: queryCount,
            cacheId: cacheId
        },
    ];
    return {
        phonetics: phonetics,
        spellcheck: spellcheck,
        searches: searches,
        count: exportCount,
        sorts: sorts,
        args: args
    };
};
var generateOnDownloadClick = function (addSnack) {
    return function (downloadInfo) { return __awaiter(void 0, void 0, void 0, function () {
        var exportFormat, body, response, data, contentType, filename, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    exportFormat = encodeURIComponent(downloadInfo.exportFormat);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    body = getDownloadBody(downloadInfo);
                    return [4 /*yield*/, exportResultSet(exportFormat, body)];
                case 2:
                    response = _a.sent();
                    if (!(response.status === 200)) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.blob()];
                case 3:
                    data = _a.sent();
                    contentType = response.headers.get('content-type');
                    filename = contentDisposition.parse(response.headers.get('content-disposition')).parameters.filename;
                    saveFile(filename, 'data:' + contentType, data);
                    return [3 /*break*/, 5];
                case 4:
                    addSnack('Error: Could not export results.', {
                        alertProps: { severity: 'error' }
                    });
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
};
var TableExports = function (_a) {
    var selectionInterface = _a.selectionInterface, filteredAttributes = _a.filteredAttributes;
    var _b = __read(useState([]), 2), formats = _b[0], setFormats = _b[1];
    var addSnack = useSnack();
    useEffect(function () {
        var fetchFormats = function () { return __awaiter(void 0, void 0, void 0, function () {
            var exportFormats, sortedExportFormats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getExportOptions(Transformer.Query)];
                    case 1:
                        exportFormats = _a.sent();
                        sortedExportFormats = exportFormats.sort(function (format1, format2) {
                            return format1.displayName.localeCompare(format2.displayName);
                        });
                        setFormats(sortedExportFormats.map(function (exportFormat) { return ({
                            label: exportFormat.displayName,
                            value: exportFormat.id
                        }); }));
                        return [2 /*return*/];
                }
            });
        }); };
        fetchFormats();
    }, []);
    return (React.createElement(TableExport, { exportFormats: formats, selectionInterface: selectionInterface, getWarning: getWarning, onDownloadClick: generateOnDownloadClick(addSnack), filteredAttributes: filteredAttributes }));
};
export default TableExports;
//# sourceMappingURL=table-export.js.map