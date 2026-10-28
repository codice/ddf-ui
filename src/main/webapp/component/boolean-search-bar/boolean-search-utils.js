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
export var fetchSuggestions = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var res, json;
    var text = _b.text, callback = _b.callback, signal = _b.signal;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, fetch("./internal/boolean-search/suggest?q=".concat(encodeURIComponent(text)), {
                    signal: signal,
                })];
            case 1:
                res = _c.sent();
                if (!res.ok) {
                    throw new Error(res.statusText);
                }
                return [4 /*yield*/, res.json()];
            case 2:
                json = _c.sent();
                callback({
                    options: suggestionsToOptions(json.suggestions),
                    error: json.error,
                });
                return [2 /*return*/];
        }
    });
}); };
export var fetchCql = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var trimmedInput, res, json;
    var searchText = _b.searchText, searchProperty = _b.searchProperty, callback = _b.callback, signal = _b.signal;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                trimmedInput = searchText.trim();
                if (!trimmedInput) return [3 /*break*/, 3];
                return [4 /*yield*/, fetch("./internal/boolean-search/cql?q=".concat(encodeURIComponent(trimmedInput), "&e=").concat(encodeURIComponent(searchProperty)), {
                        signal: signal,
                    })];
            case 1:
                res = _c.sent();
                return [4 /*yield*/, res.json()];
            case 2:
                json = (_c.sent());
                callback(json);
                return [3 /*break*/, 4];
            case 3:
                callback({ cql: '' });
                _c.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vbGVhbi1zZWFyY2gtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2Jvb2xlYW4tc2VhcmNoLWJhci9ib29sZWFuLXNlYXJjaC11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsaUNBQWlDO0FBQ2pDLE9BQU8sS0FBSyxNQUFNLG1DQUFtQyxDQUFBO0FBRXJELE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRztJQUN6QixPQUFPLFdBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUUsQ0FBQTtBQUNwRSxDQUFDLENBQUE7QUFXRCxNQUFNLENBQUMsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLFdBQXdCO0lBQzNELElBQUksV0FBVyxLQUFLLFNBQVMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUN2RSxPQUFPLEVBQUUsQ0FBQTtJQUNYLENBQUM7U0FBTSxDQUFDO1FBQ04sT0FBTyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQWtCO2dCQUFsQixLQUFBLGFBQWtCLEVBQWpCLFFBQVEsUUFBQSxFQUFFLE1BQU0sUUFBQTtZQUMzRCxPQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFhLElBQUssT0FBQSxDQUFDO2dCQUM3QixJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLE9BQUE7YUFDTixDQUFDLEVBSDRCLENBRzVCLENBQUM7UUFISCxDQUdHLENBQ0osQ0FBQTtJQUNILENBQUM7QUFDSCxDQUFDLENBQUE7QUFVRCxNQUFNLENBQUMsSUFBTSxnQkFBZ0IsR0FBRyxpRUFBTyxFQVF0Qzs7UUFQQyxJQUFJLFVBQUEsRUFDSixRQUFRLGNBQUEsRUFDUixNQUFNLFlBQUE7OztvQkFNTSxxQkFBTSxLQUFLLENBQ3JCLDhDQUF1QyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBRSxFQUNqRTtvQkFDRSxNQUFNLFFBQUE7aUJBQ1AsQ0FDRixFQUFBOztnQkFMSyxHQUFHLEdBQUcsU0FLWDtnQkFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFBO2dCQUNqQyxDQUFDO2dCQUVZLHFCQUFNLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBQTs7Z0JBQXZCLElBQUksR0FBRyxTQUFnQjtnQkFDN0IsUUFBUSxDQUFDO29CQUNQLE9BQU8sRUFBRSxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUMvQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7aUJBQ2xCLENBQUMsQ0FBQTs7OztLQUNILENBQUE7QUFRRCxNQUFNLENBQUMsSUFBTSxRQUFRLEdBQUcsaUVBQU8sRUFVOUI7O1FBVEMsVUFBVSxnQkFBQSxFQUNWLGNBQWMsb0JBQUEsRUFDZCxRQUFRLGNBQUEsRUFDUixNQUFNLFlBQUE7Ozs7Z0JBT0YsWUFBWSxHQUFHLFVBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtxQkFFakMsWUFBWSxFQUFaLHdCQUFZO2dCQUNGLHFCQUFNLEtBQUssQ0FDckIsMENBQW1DLGtCQUFrQixDQUNuRCxZQUFhLENBQ2QsZ0JBQU0sa0JBQWtCLENBQUMsY0FBZSxDQUFDLENBQUUsRUFDNUM7d0JBQ0UsTUFBTSxRQUFBO3FCQUNQLENBQ0YsRUFBQTs7Z0JBUEssR0FBRyxHQUFHLFNBT1g7Z0JBRWEscUJBQU0sR0FBRyxDQUFDLElBQUksRUFBRSxFQUFBOztnQkFBeEIsSUFBSSxHQUFHLENBQUMsU0FBZ0IsQ0FBOEI7Z0JBQzVELFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTs7O2dCQUVkLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBOzs7OztLQUV4QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyogQ29weXJpZ2h0IChjKSBDb25uZXh0YSwgTExDICovXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2ZldGNoJ1xuXG5leHBvcnQgY29uc3QgZ2V0UmFuZG9tSWQgPSAoKSA9PiB7XG4gIHJldHVybiBgYSR7TWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwMDAwMDAwMDAwMDApLnRvU3RyaW5nKCl9YFxufVxuXG5leHBvcnQgdHlwZSBPcHRpb24gPSB7XG4gIHR5cGU6IHN0cmluZ1xuICB0b2tlbjogc3RyaW5nXG59XG5cbnR5cGUgU3VnZ2VzdGlvbnMgPSB7XG4gIFtrZXk6IHN0cmluZ106IHN0cmluZ1tdXG59XG5cbmV4cG9ydCBjb25zdCBzdWdnZXN0aW9uc1RvT3B0aW9ucyA9IChzdWdnZXN0aW9uczogU3VnZ2VzdGlvbnMpOiBPcHRpb25bXSA9PiB7XG4gIGlmIChzdWdnZXN0aW9ucyA9PT0gdW5kZWZpbmVkIHx8IE9iamVjdC5rZXlzKHN1Z2dlc3Rpb25zKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW11cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gT2JqZWN0LmVudHJpZXMoc3VnZ2VzdGlvbnMpLmZsYXRNYXAoKFtjYXRlZ29yeSwgdG9rZW5zXSkgPT5cbiAgICAgIHRva2Vucy5tYXAoKHRva2VuOiBzdHJpbmcpID0+ICh7XG4gICAgICAgIHR5cGU6IGNhdGVnb3J5LFxuICAgICAgICB0b2tlbixcbiAgICAgIH0pKVxuICAgIClcbiAgfVxufVxuXG50eXBlIENhbGxiYWNrVHlwZSA9ICh7XG4gIG9wdGlvbnMsXG4gIGVycm9yLFxufToge1xuICBvcHRpb25zOiBPcHRpb25bXVxuICBlcnJvcjogYW55XG59KSA9PiB2b2lkXG5cbmV4cG9ydCBjb25zdCBmZXRjaFN1Z2dlc3Rpb25zID0gYXN5bmMgKHtcbiAgdGV4dCxcbiAgY2FsbGJhY2ssXG4gIHNpZ25hbCxcbn06IHtcbiAgdGV4dDogc3RyaW5nXG4gIGNhbGxiYWNrOiBDYWxsYmFja1R5cGVcbiAgc2lnbmFsOiBBYm9ydFNpZ25hbFxufSkgPT4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChcbiAgICBgLi9pbnRlcm5hbC9ib29sZWFuLXNlYXJjaC9zdWdnZXN0P3E9JHtlbmNvZGVVUklDb21wb25lbnQodGV4dCl9YCxcbiAgICB7XG4gICAgICBzaWduYWwsXG4gICAgfVxuICApXG5cbiAgaWYgKCFyZXMub2spIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IocmVzLnN0YXR1c1RleHQpXG4gIH1cblxuICBjb25zdCBqc29uID0gYXdhaXQgcmVzLmpzb24oKVxuICBjYWxsYmFjayh7XG4gICAgb3B0aW9uczogc3VnZ2VzdGlvbnNUb09wdGlvbnMoanNvbi5zdWdnZXN0aW9ucyksXG4gICAgZXJyb3I6IGpzb24uZXJyb3IsXG4gIH0pXG59XG5cbnR5cGUgQm9vbGVhbkVuZHBvaW50UmV0dXJuVHlwZSA9IHtcbiAgY3FsPzogc3RyaW5nXG4gIGVycm9yPzogYm9vbGVhblxuICBlcnJvck1lc3NhZ2U/OiBzdHJpbmdcbn1cblxuZXhwb3J0IGNvbnN0IGZldGNoQ3FsID0gYXN5bmMgKHtcbiAgc2VhcmNoVGV4dCxcbiAgc2VhcmNoUHJvcGVydHksXG4gIGNhbGxiYWNrLFxuICBzaWduYWwsXG59OiB7XG4gIGNhbGxiYWNrOiAocmVzdWx0OiBCb29sZWFuRW5kcG9pbnRSZXR1cm5UeXBlKSA9PiB2b2lkXG4gIHNlYXJjaFRleHQ6IHN0cmluZyB8IG51bGxcbiAgc2VhcmNoUHJvcGVydHk/OiBzdHJpbmdcbiAgc2lnbmFsPzogQWJvcnRTaWduYWxcbn0pID0+IHtcbiAgbGV0IHRyaW1tZWRJbnB1dCA9IHNlYXJjaFRleHQhLnRyaW0oKVxuXG4gIGlmICh0cmltbWVkSW5wdXQpIHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChcbiAgICAgIGAuL2ludGVybmFsL2Jvb2xlYW4tc2VhcmNoL2NxbD9xPSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICB0cmltbWVkSW5wdXQhXG4gICAgICApfSZlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNlYXJjaFByb3BlcnR5ISl9YCxcbiAgICAgIHtcbiAgICAgICAgc2lnbmFsLFxuICAgICAgfVxuICAgIClcblxuICAgIGNvbnN0IGpzb24gPSAoYXdhaXQgcmVzLmpzb24oKSkgYXMgQm9vbGVhbkVuZHBvaW50UmV0dXJuVHlwZVxuICAgIGNhbGxiYWNrKGpzb24pXG4gIH0gZWxzZSB7XG4gICAgY2FsbGJhY2soeyBjcWw6ICcnIH0pXG4gIH1cbn1cbiJdfQ==