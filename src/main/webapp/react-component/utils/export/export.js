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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC91dGlscy9leHBvcnQvZXhwb3J0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxNQUFNLFVBQVUsQ0FBQTtBQUU1QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUNwRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUMzRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFFakUsTUFBTSxDQUFOLElBQVksV0FHWDtBQUhELFdBQVksV0FBVztJQUNyQixvQ0FBcUIsQ0FBQTtJQUNyQiw4QkFBZSxDQUFBO0FBQ2pCLENBQUMsRUFIVyxXQUFXLEtBQVgsV0FBVyxRQUd0QjtBQW1DRCxNQUFNLENBQUMsSUFBTSxnQkFBZ0IsR0FBRyxVQUFDLE9BQTBCO0lBQ3pELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU0sSUFBSyxPQUFBLGVBQWUsQ0FBQyxNQUFNLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFBO0FBQ3pELENBQUMsQ0FBQTtBQUVELElBQU0sV0FBVyxHQUFHLFVBQUMsTUFBdUI7SUFDMUMsSUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUE7SUFFMUIsT0FBTyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUMvQixDQUFDLENBQUE7QUFFRCxJQUFNLGlCQUFpQixHQUFHLFVBQUMsTUFBdUI7SUFDaEQsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRTlELE9BQU8sa0JBQWtCLENBQUMsUUFBUSxDQUFDLENBQUE7QUFD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QUMsbUNBQTRCLFdBQVcsQ0FBRSxFQUFFO29CQUM1RCxNQUFNLEVBQUUsTUFBTTtvQkFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0JBQzFCLE9BQU8sRUFBRTt3QkFDUCxjQUFjLEVBQUUsa0JBQWtCO3FCQUNuQztpQkFDRixDQUFDLEVBQUE7b0JBTkYsc0JBQU8sU0FNTCxFQUFBOzs7S0FDSCxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vZmV0Y2gnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IFR5cGVkVXNlckluc3RhbmNlIH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvVHlwZWRVc2VyJ1xuaW1wb3J0IHsgT3ZlcnJpZGFibGUgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9CYXNlL2Jhc2UtY2xhc3NlcydcblxuZXhwb3J0IGVudW0gVHJhbnNmb3JtZXIge1xuICBNZXRhY2FyZCA9ICdtZXRhY2FyZCcsXG4gIFF1ZXJ5ID0gJ3F1ZXJ5Jyxcbn1cblxuZXhwb3J0IHR5cGUgUmVzdWx0U2V0ID0ge1xuICBjcWw6IHN0cmluZ1xuICBzcmM/OiBzdHJpbmdcbiAgc3Jjcz86IHN0cmluZ1tdXG4gIHN0YXJ0PzogbnVtYmVyXG4gIGNvdW50OiBudW1iZXJcbn1cblxuZXhwb3J0IHR5cGUgRXhwb3J0Qm9keSA9IHtcbiAgc2VhcmNoZXM6IFJlc3VsdFNldFtdXG4gIGNvdW50OiBudW1iZXJcbiAgc29ydHM6IE9iamVjdFtdXG4gIGFyZ3M/OiBPYmplY3Rcbn1cblxuZXhwb3J0IHR5cGUgRXhwb3J0Rm9ybWF0ID0ge1xuICBpZDogc3RyaW5nXG4gIGRpc3BsYXlOYW1lOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBFeHBvcnRDb3VudEluZm8ge1xuICBleHBvcnRTaXplOiBzdHJpbmdcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgY3VzdG9tRXhwb3J0Q291bnQ6IG51bWJlclxufVxuXG5leHBvcnQgdHlwZSBFeHBvcnRJbmZvID0ge1xuICBleHBvcnRGb3JtYXQ6IHN0cmluZ1xuICBleHBvcnRTaXplOiBzdHJpbmdcbiAgY3VzdG9tRXhwb3J0Q291bnQ6IG51bWJlclxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxufVxuXG5leHBvcnQgY29uc3QgZ2V0RXhwb3J0UmVzdWx0cyA9IChyZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXSkgPT4ge1xuICByZXR1cm4gcmVzdWx0cy5tYXAoKHJlc3VsdCkgPT4gZ2V0RXhwb3J0UmVzdWx0KHJlc3VsdCkpXG59XG5cbmNvbnN0IGdldFJlc3VsdElkID0gKHJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0KSA9PiB7XG4gIGNvbnN0IGlkID0gcmVzdWx0LnBsYWluLmlkXG5cbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChpZClcbn1cblxuY29uc3QgZ2V0UmVzdWx0U291cmNlSWQgPSAocmVzdWx0OiBMYXp5UXVlcnlSZXN1bHQpID0+IHtcbiAgY29uc3Qgc291cmNlSWQgPSByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc291cmNlLWlkJ11cblxuICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHNvdXJjZUlkKVxufVxuXG5leHBvcnQgY29uc3QgZ2V0RXhwb3J0UmVzdWx0ID0gKHJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0KSA9PiB7XG4gIHJldHVybiB7XG4gICAgaWQ6IGdldFJlc3VsdElkKHJlc3VsdCksXG4gICAgc291cmNlOiBnZXRSZXN1bHRTb3VyY2VJZChyZXN1bHQpLFxuICAgIGF0dHJpYnV0ZXM6IE9iamVjdC5rZXlzKHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzKSxcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgZ2V0RXhwb3J0T3B0aW9ucyA9IGFzeW5jICh0eXBlOiBUcmFuc2Zvcm1lcikgPT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAuL2ludGVybmFsL3RyYW5zZm9ybWVycy8ke3R5cGV9YClcbiAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSlcbiAgICAudGhlbigoZXhwb3J0Rm9ybWF0cykgPT4ge1xuICAgICAgY29uc3QgY29uZmlndXJlZEZvcm1hdHMgPVxuICAgICAgICB0eXBlID09IFRyYW5zZm9ybWVyLk1ldGFjYXJkXG4gICAgICAgICAgPyBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0RXhwb3J0TWV0YWNhcmRGb3JtYXRPcHRpb25zKClcbiAgICAgICAgICA6IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRFeHBvcnRNZXRhY2FyZHNGb3JtYXRPcHRpb25zKClcblxuICAgICAgaWYgKGNvbmZpZ3VyZWRGb3JtYXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgbmV3Rm9ybWF0cyA9IGNvbmZpZ3VyZWRGb3JtYXRzXG4gICAgICAgICAgLm1hcCgoY29uZmlndXJlZEZvcm1hdDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWxpZEZvcm1hdCA9IGV4cG9ydEZvcm1hdHMuZmluZChcbiAgICAgICAgICAgICAgKGV4cG9ydEZvcm1hdDogRXhwb3J0Rm9ybWF0KSA9PlxuICAgICAgICAgICAgICAgIGV4cG9ydEZvcm1hdC5pZCA9PT0gY29uZmlndXJlZEZvcm1hdFxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaWYgKHZhbGlkRm9ybWF0ID09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICAgICAgY29uZmlndXJlZEZvcm1hdCArXG4gICAgICAgICAgICAgICAgICAnIGRvZXMgbm90IG1hdGNoIGFueSB2YWxpZCB0cmFuc2Zvcm1lcnM7IGNhbm5vdCBpbmNsdWRlIGZvcm1hdCBpbiBleHBvcnQgbGlzdC4nXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIHJldHVybiB2YWxpZEZvcm1hdFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbHRlcigoZm9ybWF0KSA9PiBmb3JtYXQgIT09IHVuZGVmaW5lZClcblxuICAgICAgICBpZiAobmV3Rm9ybWF0cy5sZW5ndGggPiAwKSByZXR1cm4gbmV3Rm9ybWF0c1xuICAgICAgICBlbHNlXG4gICAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgICBcIkNvdWxkIG5vdCBtYXRjaCBhZG1pbidzIGNvbmZpZ3VyZWQgZXhwb3J0IG9wdGlvbnMgdG8gYW55IHZhbGlkIHRyYW5zZm9ybWVycy4gXFxcbiAgICAgICAgICBSZXR1cm5pbmcgbGlzdCBvZiBhbGwgdmFsaWQgdHJhbnNmb3JtZXJzIGluc3RlYWQuXCJcbiAgICAgICAgICApXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICAnRXhwb3J0IGZvcm1hdHMgbm90IGNvbmZpZ3VyZWQuIFVzaW5nIGxpc3Qgb2YgYWxsIHZhbGlkIHRyYW5zZm9ybWVycyBpbnN0ZWFkLidcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGV4cG9ydEZvcm1hdHNcbiAgICB9KVxuXG4gIHJldHVybiByZXNwb25zZVxufVxuXG5leHBvcnQgY29uc3QgZ2V0Q29sdW1uT3JkZXIgPSAoKSA9PiB7XG4gIHJldHVybiBUeXBlZFVzZXJJbnN0YW5jZS5nZXRSZXN1bHRzQXR0cmlidXRlc1N1bW1hcnlTaG93bigpXG59XG5cbmV4cG9ydCBjb25zdCBPdmVycmlkYWJsZUdldENvbHVtbk9yZGVyID0gbmV3IE92ZXJyaWRhYmxlKGdldENvbHVtbk9yZGVyKVxuXG5leHBvcnQgY29uc3QgYWxpYXNNYXAgPSAoKSA9PiB7XG4gIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoXG4gICAgT2JqZWN0LmVudHJpZXMoXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnPy5hdHRyaWJ1dGVBbGlhc2VzIHx8IHt9XG4gICAgKVxuICAgICAgLm1hcCgoW2ssIHZdKSA9PiB7XG4gICAgICAgIHJldHVybiBgJHtrfT0ke3Z9YFxuICAgICAgfSlcbiAgICAgIC50b1N0cmluZygpXG4gIClcbn1cblxuZXhwb3J0IGNvbnN0IGV4cG9ydFJlc3VsdFNldCA9IGFzeW5jIChcbiAgdHJhbnNmb3JtZXI6IHN0cmluZyxcbiAgYm9keTogRXhwb3J0Qm9keVxuKSA9PiB7XG4gIHJldHVybiBhd2FpdCBmZXRjaChgLi9pbnRlcm5hbC9jcWwvdHJhbnNmb3JtLyR7dHJhbnNmb3JtZXJ9YCwge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSxcbiAgfSlcbn1cbiJdfQ==