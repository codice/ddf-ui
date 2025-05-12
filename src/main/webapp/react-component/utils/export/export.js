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
import fetch from '../fetch';
import { StartupDataStore } from '../../../js/model/Startup/startup';
import { TypedUserInstance } from '../../../component/singletons/TypedUser';
import { Overridable } from '../../../js/model/Base/base-classes';
export var Transformer;
(function (Transformer) {
    Transformer["Metacard"] = "metacard";
    Transformer["Query"] = "query";
})(Transformer || (Transformer = {}));
export var getExportResults = function (results) {
    return results.map(function (result) { return getExportResult(result); });
};
var getResultId = function (result) {
    var id = result.plain.id;
    return encodeURIComponent(id);
};
var getResultSourceId = function (result) {
    var sourceId = result.plain.metacard.properties['source-id'];
    return encodeURIComponent(sourceId);
};
export var getExportResult = function (result) {
    return {
        id: getResultId(result),
        source: getResultSourceId(result),
        attributes: Object.keys(result.plain.metacard.properties),
    };
};
export var getExportOptions = function (type) { return __awaiter(void 0, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("./internal/transformers/".concat(type))
                    .then(function (response) { return response.json(); })
                    .then(function (exportFormats) {
                    var configuredFormats = type == Transformer.Metacard
                        ? StartupDataStore.Configuration.getExportMetacardFormatOptions()
                        : StartupDataStore.Configuration.getExportMetacardsFormatOptions();
                    if (configuredFormats.length > 0) {
                        var newFormats = configuredFormats
                            .map(function (configuredFormat) {
                            var validFormat = exportFormats.find(function (exportFormat) {
                                return exportFormat.id === configuredFormat;
                            });
                            if (validFormat == undefined)
                                console.log(configuredFormat +
                                    ' does not match any valid transformers; cannot include format in export list.');
                            return validFormat;
                        })
                            .filter(function (format) { return format !== undefined; });
                        if (newFormats.length > 0)
                            return newFormats;
                        else
                            console.log("Could not match admin's configured export options to any valid transformers. \
          Returning list of all valid transformers instead.");
                    }
                    else {
                        console.log('Export formats not configured. Using list of all valid transformers instead.');
                    }
                    return exportFormats;
                })];
            case 1:
                response = _a.sent();
                return [2 /*return*/, response];
        }
    });
}); };
export var getColumnOrder = function () {
    return TypedUserInstance.getResultsAttributesSummaryShown();
};
export var OverridableGetColumnOrder = new Overridable(getColumnOrder);
export var aliasMap = function () {
    var _a;
    return encodeURIComponent(Object.entries(((_a = StartupDataStore.Configuration.config) === null || _a === void 0 ? void 0 : _a.attributeAliases) || {})
        .map(function (_a) {
        var _b = __read(_a, 2), k = _b[0], v = _b[1];
        return "".concat(k, "=").concat(v);
    })
        .toString());
};
export var exportResultSet = function (transformer, body) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("./internal/cql/transform/".concat(transformer), {
                    method: 'POST',
                    body: JSON.stringify(body),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC91dGlscy9leHBvcnQvZXhwb3J0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUMzRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFFakUsTUFBTSxDQUFOLElBQVksV0FHWDtBQUhELFdBQVksV0FBVztJQUNyQixvQ0FBcUIsQ0FBQTtJQUNyQiw4QkFBZSxDQUFBO0FBQ2pCLENBQUMsRUFIVyxXQUFXLEtBQVgsV0FBVyxRQUd0QjtBQW1DRCxNQUFNLENBQUMsSUFBTSxnQkFBZ0IsR0FBRyxVQUFDLE9BQTBCO0lBQ3pELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLGVBQWUsQ0FBQyxNQUFNLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFBO0FBQ3pELENBQUMsQ0FBQTtBQUVELElBQU0sV0FBVyxHQUFHLFVBQUMsTUFBdUI7SUFDMUMsSUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUE7SUFFMUIsT0FBTyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUMvQixDQUFDLENBQUE7QUFFRCxJQUFNLGlCQUFpQixHQUFHLFVBQUMsTUFBdUI7SUFDaEQsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRTlELE9BQU8sa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUE7QUFD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O29CQUVULHFCQUFNLEtBQUssQ0FBQyxtQ0FBNEIsV0FBVyxDQUFFLEVBQUU7b0JBQzVELE1BQU0sRUFBRSxNQUFNO29CQUNkLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztvQkFDMUIsT0FBTyxFQUFFO3dCQUNQLGNBQWMsRUFBRSxrQkFBa0I7cUJBQ25DO2lCQUNGLENBQUMsRUFBQTtvQkFORixzQkFBTyxTQU1MLEVBQUE7OztLQUNILENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBmZXRjaCBmcm9tICcuLi9mZXRjaCdcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy9UeXBlZFVzZXInXG5pbXBvcnQgeyBPdmVycmlkYWJsZSB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0Jhc2UvYmFzZS1jbGFzc2VzJ1xuXG5leHBvcnQgZW51bSBUcmFuc2Zvcm1lciB7XG4gIE1ldGFjYXJkID0gJ21ldGFjYXJkJyxcbiAgUXVlcnkgPSAncXVlcnknLFxufVxuXG5leHBvcnQgdHlwZSBSZXN1bHRTZXQgPSB7XG4gIGNxbDogc3RyaW5nXG4gIHNyYz86IHN0cmluZ1xuICBzcmNzPzogc3RyaW5nW11cbiAgc3RhcnQ/OiBudW1iZXJcbiAgY291bnQ6IG51bWJlclxufVxuXG5leHBvcnQgdHlwZSBFeHBvcnRCb2R5ID0ge1xuICBzZWFyY2hlczogUmVzdWx0U2V0W11cbiAgY291bnQ6IG51bWJlclxuICBzb3J0czogT2JqZWN0W11cbiAgYXJncz86IE9iamVjdFxufVxuXG5leHBvcnQgdHlwZSBFeHBvcnRGb3JtYXQgPSB7XG4gIGlkOiBzdHJpbmdcbiAgZGlzcGxheU5hbWU6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEV4cG9ydENvdW50SW5mbyB7XG4gIGV4cG9ydFNpemU6IHN0cmluZ1xuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxuICBjdXN0b21FeHBvcnRDb3VudDogbnVtYmVyXG59XG5cbmV4cG9ydCB0eXBlIEV4cG9ydEluZm8gPSB7XG4gIGV4cG9ydEZvcm1hdDogc3RyaW5nXG4gIGV4cG9ydFNpemU6IHN0cmluZ1xuICBjdXN0b21FeHBvcnRDb3VudDogbnVtYmVyXG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59XG5cbmV4cG9ydCBjb25zdCBnZXRFeHBvcnRSZXN1bHRzID0gKHJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdKSA9PiB7XG4gIHJldHVybiByZXN1bHRzLm1hcCgocmVzdWx0KSA9PiBnZXRFeHBvcnRSZXN1bHQocmVzdWx0KSlcbn1cblxuY29uc3QgZ2V0UmVzdWx0SWQgPSAocmVzdWx0OiBMYXp5UXVlcnlSZXN1bHQpID0+IHtcbiAgY29uc3QgaWQgPSByZXN1bHQucGxhaW4uaWRcblxuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGlkKVxufVxuXG5jb25zdCBnZXRSZXN1bHRTb3VyY2VJZCA9IChyZXN1bHQ6IExhenlRdWVyeVJlc3VsdCkgPT4ge1xuICBjb25zdCBzb3VyY2VJZCA9IHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydzb3VyY2UtaWQnXVxuXG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc291cmNlSWQpXG59XG5cbmV4cG9ydCBjb25zdCBnZXRFeHBvcnRSZXN1bHQgPSAocmVzdWx0OiBMYXp5UXVlcnlSZXN1bHQpID0+IHtcbiAgcmV0dXJuIHtcbiAgICBpZDogZ2V0UmVzdWx0SWQocmVzdWx0KSxcbiAgICBzb3VyY2U6IGdldFJlc3VsdFNvdXJjZUlkKHJlc3VsdCksXG4gICAgYXR0cmlidXRlczogT2JqZWN0LmtleXMocmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMpLFxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBnZXRFeHBvcnRPcHRpb25zID0gYXN5bmMgKHR5cGU6IFRyYW5zZm9ybWVyKSA9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYC4vaW50ZXJuYWwvdHJhbnNmb3JtZXJzLyR7dHlwZX1gKVxuICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgIC50aGVuKChleHBvcnRGb3JtYXRzKSA9PiB7XG4gICAgICBjb25zdCBjb25maWd1cmVkRm9ybWF0cyA9XG4gICAgICAgIHR5cGUgPT0gVHJhbnNmb3JtZXIuTWV0YWNhcmRcbiAgICAgICAgICA/IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRFeHBvcnRNZXRhY2FyZEZvcm1hdE9wdGlvbnMoKVxuICAgICAgICAgIDogU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEV4cG9ydE1ldGFjYXJkc0Zvcm1hdE9wdGlvbnMoKVxuXG4gICAgICBpZiAoY29uZmlndXJlZEZvcm1hdHMubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBuZXdGb3JtYXRzID0gY29uZmlndXJlZEZvcm1hdHNcbiAgICAgICAgICAubWFwKChjb25maWd1cmVkRm9ybWF0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHZhbGlkRm9ybWF0ID0gZXhwb3J0Rm9ybWF0cy5maW5kKFxuICAgICAgICAgICAgICAoZXhwb3J0Rm9ybWF0OiBFeHBvcnRGb3JtYXQpID0+XG4gICAgICAgICAgICAgICAgZXhwb3J0Rm9ybWF0LmlkID09PSBjb25maWd1cmVkRm9ybWF0XG4gICAgICAgICAgICApXG4gICAgICAgICAgICBpZiAodmFsaWRGb3JtYXQgPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgICAgICBjb25maWd1cmVkRm9ybWF0ICtcbiAgICAgICAgICAgICAgICAgICcgZG9lcyBub3QgbWF0Y2ggYW55IHZhbGlkIHRyYW5zZm9ybWVyczsgY2Fubm90IGluY2x1ZGUgZm9ybWF0IGluIGV4cG9ydCBsaXN0LidcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgcmV0dXJuIHZhbGlkRm9ybWF0XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmlsdGVyKChmb3JtYXQpID0+IGZvcm1hdCAhPT0gdW5kZWZpbmVkKVxuXG4gICAgICAgIGlmIChuZXdGb3JtYXRzLmxlbmd0aCA+IDApIHJldHVybiBuZXdGb3JtYXRzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAgIFwiQ291bGQgbm90IG1hdGNoIGFkbWluJ3MgY29uZmlndXJlZCBleHBvcnQgb3B0aW9ucyB0byBhbnkgdmFsaWQgdHJhbnNmb3JtZXJzLiBcXFxuICAgICAgICAgIFJldHVybmluZyBsaXN0IG9mIGFsbCB2YWxpZCB0cmFuc2Zvcm1lcnMgaW5zdGVhZC5cIlxuICAgICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICdFeHBvcnQgZm9ybWF0cyBub3QgY29uZmlndXJlZC4gVXNpbmcgbGlzdCBvZiBhbGwgdmFsaWQgdHJhbnNmb3JtZXJzIGluc3RlYWQuJ1xuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gZXhwb3J0Rm9ybWF0c1xuICAgIH0pXG5cbiAgcmV0dXJuIHJlc3BvbnNlXG59XG5cbmV4cG9ydCBjb25zdCBnZXRDb2x1bW5PcmRlciA9ICgpID0+IHtcbiAgcmV0dXJuIFR5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzU3VtbWFyeVNob3duKClcbn1cblxuZXhwb3J0IGNvbnN0IE92ZXJyaWRhYmxlR2V0Q29sdW1uT3JkZXIgPSBuZXcgT3ZlcnJpZGFibGUoZ2V0Q29sdW1uT3JkZXIpXG5cbmV4cG9ydCBjb25zdCBhbGlhc01hcCA9ICgpID0+IHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChcbiAgICBPYmplY3QuZW50cmllcyhcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWc/LmF0dHJpYnV0ZUFsaWFzZXMgfHwge31cbiAgICApXG4gICAgICAubWFwKChbaywgdl0pID0+IHtcbiAgICAgICAgcmV0dXJuIGAke2t9PSR7dn1gXG4gICAgICB9KVxuICAgICAgLnRvU3RyaW5nKClcbiAgKVxufVxuXG5leHBvcnQgY29uc3QgZXhwb3J0UmVzdWx0U2V0ID0gYXN5bmMgKFxuICB0cmFuc2Zvcm1lcjogc3RyaW5nLFxuICBib2R5OiBFeHBvcnRCb2R5XG4pID0+IHtcbiAgcmV0dXJuIGF3YWl0IGZldGNoKGAuL2ludGVybmFsL2NxbC90cmFuc2Zvcm0vJHt0cmFuc2Zvcm1lcn1gLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICB9LFxuICB9KVxufVxuIl19