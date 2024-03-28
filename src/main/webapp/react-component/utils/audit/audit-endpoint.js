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
//# sourceMappingURL=audit-endpoint.js.map