import { __awaiter, __generator } from "tslib";
import fetch from '../fetch';
export var postAuditLog = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var body;
    var action = _b.action, component = _b.component, items = _b.items;
    return __generator(this, function (_c) {
        switch (_c.label) {
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
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
export var postSimpleAuditLog = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var body;
    var action = _b.action, component = _b.component;
    return __generator(this, function (_c) {
        switch (_c.label) {
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
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaXQtZW5kcG9pbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvcmVhY3QtY29tcG9uZW50L3V0aWxzL2F1ZGl0L2F1ZGl0LWVuZHBvaW50LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBa0I1QixNQUFNLENBQUMsSUFBTSxZQUFZLEdBQUcsaUVBQU8sRUFBc0M7O1FBQXBDLE1BQU0sWUFBQSxFQUFFLFNBQVMsZUFBQSxFQUFFLEtBQUssV0FBQTs7OztnQkFDckQsSUFBSSxHQUFHO29CQUNYLE1BQU0sUUFBQTtvQkFDTixTQUFTLFdBQUE7b0JBQ1QsS0FBSyxPQUFBO2lCQUNOLENBQUE7Z0JBQ0QscUJBQU0sS0FBSyxDQUFDLG1CQUFtQixFQUFFO3dCQUMvQixNQUFNLEVBQUUsTUFBTTt3QkFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7cUJBQzNCLENBQUMsRUFBQTs7Z0JBSEYsU0FHRSxDQUFBOzs7O0tBQ0gsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUFHLGlFQUFPLEVBR3hCOztRQUZmLE1BQU0sWUFBQSxFQUNOLFNBQVMsZUFBQTs7OztnQkFFSCxJQUFJLEdBQUc7b0JBQ1gsTUFBTSxRQUFBO29CQUNOLFNBQVMsV0FBQTtpQkFDVixDQUFBO2dCQUNELHFCQUFNLEtBQUssQ0FBQyx5QkFBeUIsRUFBRTt3QkFDckMsTUFBTSxFQUFFLE1BQU07d0JBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO3FCQUMzQixDQUFDLEVBQUE7O2dCQUhGLFNBR0UsQ0FBQTs7OztLQUNILENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZmV0Y2ggZnJvbSAnLi4vZmV0Y2gnXG5cbmV4cG9ydCB0eXBlIEF1ZGl0SXRlbSA9IHtcbiAgaWQ6IFN0cmluZ1xuICAnc291cmNlLWlkJz86IFN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBBdWRpdExvZyA9IHtcbiAgYWN0aW9uOiBzdHJpbmdcbiAgY29tcG9uZW50OiBzdHJpbmdcbiAgaXRlbXM6IEF1ZGl0SXRlbVtdXG59XG5cbmV4cG9ydCB0eXBlIFNpbXBsZUF1ZGl0TG9nID0ge1xuICBhY3Rpb246IHN0cmluZ1xuICBjb21wb25lbnQ6IHN0cmluZ1xufVxuXG5leHBvcnQgY29uc3QgcG9zdEF1ZGl0TG9nID0gYXN5bmMgKHsgYWN0aW9uLCBjb21wb25lbnQsIGl0ZW1zIH06IEF1ZGl0TG9nKSA9PiB7XG4gIGNvbnN0IGJvZHkgPSB7XG4gICAgYWN0aW9uLFxuICAgIGNvbXBvbmVudCxcbiAgICBpdGVtcyxcbiAgfVxuICBhd2FpdCBmZXRjaChgLi9pbnRlcm5hbC9hdWRpdC9gLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gIH0pXG59XG5cbmV4cG9ydCBjb25zdCBwb3N0U2ltcGxlQXVkaXRMb2cgPSBhc3luYyAoe1xuICBhY3Rpb24sXG4gIGNvbXBvbmVudCxcbn06IFNpbXBsZUF1ZGl0TG9nKSA9PiB7XG4gIGNvbnN0IGJvZHkgPSB7XG4gICAgYWN0aW9uLFxuICAgIGNvbXBvbmVudCxcbiAgfVxuICBhd2FpdCBmZXRjaChgLi9pbnRlcm5hbC9hdWRpdC9zaW1wbGVgLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gIH0pXG59XG4iXX0=