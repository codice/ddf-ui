import { __read } from "tslib";
import React from 'react';
import { useEffect } from 'react';
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks';
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks';
import { postAuditLog, } from '../../../react-component/utils/audit/audit-endpoint';
export var useSelectionAuditing = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var selectedResults = useSelectedResults({
        lazyResults: lazyResults,
    });
    var _b = __read(React.useState(new Set()), 2), selectedIds = _b[0], setSelectedIds = _b[1];
    var getAuditItems = function (ids) {
        var items = [];
        ids.forEach(function (id) {
            var _a, _b, _c;
            var properties = (_c = (_b = (_a = lazyResults === null || lazyResults === void 0 ? void 0 : lazyResults.results[id]) === null || _a === void 0 ? void 0 : _a.plain) === null || _b === void 0 ? void 0 : _b.metacard) === null || _c === void 0 ? void 0 : _c.properties;
            if (properties) {
                items.push({ id: properties.id, 'source-id': properties['source-id'] });
            }
        });
        return items;
    };
    useEffect(function () {
        var newSelectedIds = new Set(Object.keys(selectedResults));
        var unselectedIds = new Set();
        selectedIds.forEach(function (id) {
            if (!newSelectedIds.has(id)) {
                unselectedIds.add(id);
            }
        });
        var newSelectedItems = getAuditItems(newSelectedIds);
        var unselectedItems = getAuditItems(unselectedIds);
        if (unselectedItems.length > 0) {
            postAuditLog({
                action: 'unselected',
                component: 'resource',
                items: unselectedItems,
            });
        }
        if (newSelectedItems.length > 0) {
            postAuditLog({
                action: 'selected',
                component: 'resource',
                items: newSelectedItems,
            });
            setSelectedIds(newSelectedIds);
        }
    }, [selectedResults]);
};
export var AuditComponent = function (_a) {
    var selectionInterface = _a.selectionInterface;
    useSelectionAuditing({ selectionInterface: selectionInterface });
    return null;
};
//# sourceMappingURL=inspector.audit.js.map