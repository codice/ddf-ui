import { __awaiter, __generator, __read } from "tslib";
/* Copyright (c) Connexta, LLC */
import fetch from '../../react-component/utils/fetch';
export var getRandomId = function () {
    return "a".concat(Math.round(Math.random() * 10000000000000).toString());
};
export var suggestionsToOptions = function (suggestions) {
    if (suggestions === undefined || Object.keys(suggestions).length === 0) {
        return [];
    }
    else {
        return Object.entries(suggestions).flatMap(function (_a) {
            var _b = __read(_a, 2), category = _b[0], tokens = _b[1];
            return tokens.map(function (token) { return ({
                type: category,
                token: token,
            }); });
        });
    }
};
export var fetchSuggestions = function (_a) {
    var text = _a.text, callback = _a.callback, signal = _a.signal;
    return __awaiter(void 0, void 0, void 0, function () {
        var res, json;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetch("./internal/boolean-search/suggest?q=".concat(encodeURIComponent(text)), {
                        signal: signal,
                    })];
                case 1:
                    res = _b.sent();
                    if (!res.ok) {
                        throw new Error(res.statusText);
                    }
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = _b.sent();
                    callback({
                        options: suggestionsToOptions(json.suggestions),
                        error: json.error,
                    });
                    return [2 /*return*/];
            }
        });
    });
};
export var fetchCql = function (_a) {
    var searchText = _a.searchText, searchProperty = _a.searchProperty, callback = _a.callback, signal = _a.signal;
    return __awaiter(void 0, void 0, void 0, function () {
        var trimmedInput, res, json;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    trimmedInput = searchText.trim();
                    if (!trimmedInput) return [3 /*break*/, 3];
                    return [4 /*yield*/, fetch("./internal/boolean-search/cql?q=".concat(encodeURIComponent(trimmedInput), "&e=").concat(encodeURIComponent(searchProperty)), {
                            signal: signal,
                        })];
                case 1:
                    res = _b.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    json = (_b.sent());
                    callback(json);
                    return [3 /*break*/, 4];
                case 3:
                    callback({ cql: '' });
                    _b.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vbGVhbi1zZWFyY2gtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2Jvb2xlYW4tc2VhcmNoLWJhci9ib29sZWFuLXNlYXJjaC11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsaUNBQWlDO0FBQ2pDLE9BQU8sS0FBSyxNQUFNLG1DQUFtQyxDQUFBO0FBRXJELE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRztJQUN6QixPQUFPLFdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUUsQ0FBQTtBQUNwRSxDQUFDLENBQUE7QUFXRCxNQUFNLENBQUMsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLFdBQXdCO0lBQzNELElBQUksV0FBVyxLQUFLLFNBQVMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdEUsT0FBTyxFQUFFLENBQUE7S0FDVjtTQUFNO1FBQ0wsT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQWtCO2dCQUFsQixLQUFBLGFBQWtCLEVBQWpCLFFBQVEsUUFBQSxFQUFFLE1BQU0sUUFBQTtZQUMzRCxPQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFhLElBQUssT0FBQSxDQUFDO2dCQUM3QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLE9BQUE7YUFDTixDQUFDLEVBSDRCLENBRzVCLENBQUM7UUFISCxDQUdHLENBQ0osQ0FBQTtLQUNGO0FBQ0gsQ0FBQyxDQUFBO0FBVUQsTUFBTSxDQUFDLElBQU0sZ0JBQWdCLEdBQUcsVUFBTyxFQVF0QztRQVBDLElBQUksVUFBQSxFQUNKLFFBQVEsY0FBQSxFQUNSLE1BQU0sWUFBQTs7Ozs7d0JBTU0scUJBQU0sS0FBSyxDQUNyQiw4Q0FBdUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUUsRUFDakU7d0JBQ0UsTUFBTSxRQUFBO3FCQUNQLENBQ0YsRUFBQTs7b0JBTEssR0FBRyxHQUFHLFNBS1g7b0JBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUU7d0JBQ1gsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7cUJBQ2hDO29CQUVZLHFCQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQTs7b0JBQXZCLElBQUksR0FBRyxTQUFnQjtvQkFDN0IsUUFBUSxDQUFDO3dCQUNQLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO3dCQUMvQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7cUJBQ2xCLENBQUMsQ0FBQTs7Ozs7Q0FDSCxDQUFBO0FBUUQsTUFBTSxDQUFDLElBQU0sUUFBUSxHQUFHLFVBQU8sRUFVOUI7UUFUQyxVQUFVLGdCQUFBLEVBQ1YsY0FBYyxvQkFBQSxFQUNkLFFBQVEsY0FBQSxFQUNSLE1BQU0sWUFBQTs7Ozs7O29CQU9GLFlBQVksR0FBRyxVQUFXLENBQUMsSUFBSSxFQUFFLENBQUE7eUJBRWpDLFlBQVksRUFBWix3QkFBWTtvQkFDRixxQkFBTSxLQUFLLENBQ3JCLDBDQUFtQyxrQkFBa0IsQ0FDbkQsWUFBYSxDQUNkLGdCQUFNLGtCQUFrQixDQUFDLGNBQWUsQ0FBQyxDQUFFLEVBQzVDOzRCQUNFLE1BQU0sUUFBQTt5QkFDUCxDQUNGLEVBQUE7O29CQVBLLEdBQUcsR0FBRyxTQU9YO29CQUVhLHFCQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQTs7b0JBQXhCLElBQUksR0FBRyxDQUFDLFNBQWdCLENBQThCO29CQUM1RCxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7OztvQkFFZCxRQUFRLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTs7Ozs7O0NBRXhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBDb3B5cmlnaHQgKGMpIENvbm5leHRhLCBMTEMgKi9cbmltcG9ydCBmZXRjaCBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvZmV0Y2gnXG5cbmV4cG9ydCBjb25zdCBnZXRSYW5kb21JZCA9ICgpID0+IHtcbiAgcmV0dXJuIGBhJHtNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDAwMDAwMCkudG9TdHJpbmcoKX1gXG59XG5cbmV4cG9ydCB0eXBlIE9wdGlvbiA9IHtcbiAgdHlwZTogc3RyaW5nXG4gIHRva2VuOiBzdHJpbmdcbn1cblxudHlwZSBTdWdnZXN0aW9ucyA9IHtcbiAgW2tleTogc3RyaW5nXTogc3RyaW5nW11cbn1cblxuZXhwb3J0IGNvbnN0IHN1Z2dlc3Rpb25zVG9PcHRpb25zID0gKHN1Z2dlc3Rpb25zOiBTdWdnZXN0aW9ucyk6IE9wdGlvbltdID0+IHtcbiAgaWYgKHN1Z2dlc3Rpb25zID09PSB1bmRlZmluZWQgfHwgT2JqZWN0LmtleXMoc3VnZ2VzdGlvbnMpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBbXVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBPYmplY3QuZW50cmllcyhzdWdnZXN0aW9ucykuZmxhdE1hcCgoW2NhdGVnb3J5LCB0b2tlbnNdKSA9PlxuICAgICAgdG9rZW5zLm1hcCgodG9rZW46IHN0cmluZykgPT4gKHtcbiAgICAgICAgdHlwZTogY2F0ZWdvcnksXG4gICAgICAgIHRva2VuLFxuICAgICAgfSkpXG4gICAgKVxuICB9XG59XG5cbnR5cGUgQ2FsbGJhY2tUeXBlID0gKHtcbiAgb3B0aW9ucyxcbiAgZXJyb3IsXG59OiB7XG4gIG9wdGlvbnM6IE9wdGlvbltdXG4gIGVycm9yOiBhbnlcbn0pID0+IHZvaWRcblxuZXhwb3J0IGNvbnN0IGZldGNoU3VnZ2VzdGlvbnMgPSBhc3luYyAoe1xuICB0ZXh0LFxuICBjYWxsYmFjayxcbiAgc2lnbmFsLFxufToge1xuICB0ZXh0OiBzdHJpbmdcbiAgY2FsbGJhY2s6IENhbGxiYWNrVHlwZVxuICBzaWduYWw6IEFib3J0U2lnbmFsXG59KSA9PiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKFxuICAgIGAuL2ludGVybmFsL2Jvb2xlYW4tc2VhcmNoL3N1Z2dlc3Q/cT0ke2VuY29kZVVSSUNvbXBvbmVudCh0ZXh0KX1gLFxuICAgIHtcbiAgICAgIHNpZ25hbCxcbiAgICB9XG4gIClcblxuICBpZiAoIXJlcy5vaykge1xuICAgIHRocm93IG5ldyBFcnJvcihyZXMuc3RhdHVzVGV4dClcbiAgfVxuXG4gIGNvbnN0IGpzb24gPSBhd2FpdCByZXMuanNvbigpXG4gIGNhbGxiYWNrKHtcbiAgICBvcHRpb25zOiBzdWdnZXN0aW9uc1RvT3B0aW9ucyhqc29uLnN1Z2dlc3Rpb25zKSxcbiAgICBlcnJvcjoganNvbi5lcnJvcixcbiAgfSlcbn1cblxudHlwZSBCb29sZWFuRW5kcG9pbnRSZXR1cm5UeXBlID0ge1xuICBjcWw/OiBzdHJpbmdcbiAgZXJyb3I/OiBib29sZWFuXG4gIGVycm9yTWVzc2FnZT86IHN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgZmV0Y2hDcWwgPSBhc3luYyAoe1xuICBzZWFyY2hUZXh0LFxuICBzZWFyY2hQcm9wZXJ0eSxcbiAgY2FsbGJhY2ssXG4gIHNpZ25hbCxcbn06IHtcbiAgY2FsbGJhY2s6IChyZXN1bHQ6IEJvb2xlYW5FbmRwb2ludFJldHVyblR5cGUpID0+IHZvaWRcbiAgc2VhcmNoVGV4dDogc3RyaW5nIHwgbnVsbFxuICBzZWFyY2hQcm9wZXJ0eT86IHN0cmluZ1xuICBzaWduYWw/OiBBYm9ydFNpZ25hbFxufSkgPT4ge1xuICBsZXQgdHJpbW1lZElucHV0ID0gc2VhcmNoVGV4dCEudHJpbSgpXG5cbiAgaWYgKHRyaW1tZWRJbnB1dCkge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKFxuICAgICAgYC4vaW50ZXJuYWwvYm9vbGVhbi1zZWFyY2gvY3FsP3E9JHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgIHRyaW1tZWRJbnB1dCFcbiAgICAgICl9JmU9JHtlbmNvZGVVUklDb21wb25lbnQoc2VhcmNoUHJvcGVydHkhKX1gLFxuICAgICAge1xuICAgICAgICBzaWduYWwsXG4gICAgICB9XG4gICAgKVxuXG4gICAgY29uc3QganNvbiA9IChhd2FpdCByZXMuanNvbigpKSBhcyBCb29sZWFuRW5kcG9pbnRSZXR1cm5UeXBlXG4gICAgY2FsbGJhY2soanNvbilcbiAgfSBlbHNlIHtcbiAgICBjYWxsYmFjayh7IGNxbDogJycgfSlcbiAgfVxufVxuIl19