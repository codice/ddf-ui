import { __awaiter, __generator } from "tslib";
import fetch from '../fetch';
export var postAuditLog = function (_a) {
    var action = _a.action, component = _a.component, items = _a.items;
    return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    body = {
                        action: action,
                        component: component,
                        items: items,
                    };
                    return [4 /*yield*/, fetch("./internal/audit/", {
                            method: 'POST',
                            body: JSON.stringify(body),
                        })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
export var postSimpleAuditLog = function (_a) {
    var action = _a.action, component = _a.component;
    return __awaiter(void 0, void 0, void 0, function () {
        var body;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    body = {
                        action: action,
                        component: component,
                    };
                    return [4 /*yield*/, fetch("./internal/audit/simple", {
                            method: 'POST',
                            body: JSON.stringify(body),
                        })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaXQtZW5kcG9pbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L3V0aWxzL2F1ZGl0L2F1ZGl0LWVuZHBvaW50LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBa0I1QixNQUFNLENBQUMsSUFBTSxZQUFZLEdBQUcsVUFBTyxFQUFzQztRQUFwQyxNQUFNLFlBQUEsRUFBRSxTQUFTLGVBQUEsRUFBRSxLQUFLLFdBQUE7Ozs7OztvQkFDckQsSUFBSSxHQUFHO3dCQUNYLE1BQU0sUUFBQTt3QkFDTixTQUFTLFdBQUE7d0JBQ1QsS0FBSyxPQUFBO3FCQUNOLENBQUE7b0JBQ0QscUJBQU0sS0FBSyxDQUFDLG1CQUFtQixFQUFFOzRCQUMvQixNQUFNLEVBQUUsTUFBTTs0QkFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7eUJBQzNCLENBQUMsRUFBQTs7b0JBSEYsU0FHRSxDQUFBOzs7OztDQUNILENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxrQkFBa0IsR0FBRyxVQUFPLEVBR3hCO1FBRmYsTUFBTSxZQUFBLEVBQ04sU0FBUyxlQUFBOzs7Ozs7b0JBRUgsSUFBSSxHQUFHO3dCQUNYLE1BQU0sUUFBQTt3QkFDTixTQUFTLFdBQUE7cUJBQ1YsQ0FBQTtvQkFDRCxxQkFBTSxLQUFLLENBQUMseUJBQXlCLEVBQUU7NEJBQ3JDLE1BQU0sRUFBRSxNQUFNOzRCQUNkLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQzt5QkFDM0IsQ0FBQyxFQUFBOztvQkFIRixTQUdFLENBQUE7Ozs7O0NBQ0gsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmZXRjaCBmcm9tICcuLi9mZXRjaCdcblxuZXhwb3J0IHR5cGUgQXVkaXRJdGVtID0ge1xuICBpZDogU3RyaW5nXG4gICdzb3VyY2UtaWQnPzogU3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIEF1ZGl0TG9nID0ge1xuICBhY3Rpb246IHN0cmluZ1xuICBjb21wb25lbnQ6IHN0cmluZ1xuICBpdGVtczogQXVkaXRJdGVtW11cbn1cblxuZXhwb3J0IHR5cGUgU2ltcGxlQXVkaXRMb2cgPSB7XG4gIGFjdGlvbjogc3RyaW5nXG4gIGNvbXBvbmVudDogc3RyaW5nXG59XG5cbmV4cG9ydCBjb25zdCBwb3N0QXVkaXRMb2cgPSBhc3luYyAoeyBhY3Rpb24sIGNvbXBvbmVudCwgaXRlbXMgfTogQXVkaXRMb2cpID0+IHtcbiAgY29uc3QgYm9keSA9IHtcbiAgICBhY3Rpb24sXG4gICAgY29tcG9uZW50LFxuICAgIGl0ZW1zLFxuICB9XG4gIGF3YWl0IGZldGNoKGAuL2ludGVybmFsL2F1ZGl0L2AsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IHBvc3RTaW1wbGVBdWRpdExvZyA9IGFzeW5jICh7XG4gIGFjdGlvbixcbiAgY29tcG9uZW50LFxufTogU2ltcGxlQXVkaXRMb2cpID0+IHtcbiAgY29uc3QgYm9keSA9IHtcbiAgICBhY3Rpb24sXG4gICAgY29tcG9uZW50LFxuICB9XG4gIGF3YWl0IGZldGNoKGAuL2ludGVybmFsL2F1ZGl0L3NpbXBsZWAsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgfSlcbn1cbiJdfQ==