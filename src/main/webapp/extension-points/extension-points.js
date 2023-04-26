import { __awaiter, __generator } from "tslib";
import { providers } from './providers';
import metacardInteractions from './metacard-interactions';
var ExtensionPoints = {
    providers: providers,
    metacardInteractions: metacardInteractions,
    customFilterInput: function () { return undefined; },
    customCanWritePermission: function () { return undefined; },
    customEditableAttributes: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, undefined];
    }); }); },
    resultItemTitleAddOn: function () { return null; },
    resultItemRowAddOn: function () { return null; },
    layoutDropdown: function () { return null; },
    customSourcesPage: null,
    serializeLocation: function () { return null; },
    handleFilter: function () { return null; },
    suggester: function () { return null; },
    handleMetacardUpdate: null,
    extraRoutes: function () { return null; },
    locationTypes: function (baseTypes) { return baseTypes; }
};
export default ExtensionPoints;
//# sourceMappingURL=extension-points.js.map