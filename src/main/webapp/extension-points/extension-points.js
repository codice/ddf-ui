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
    resultTitleIconAddOn: function () { return null; },
    resultItemRowAddOn: function () { return null; },
    layoutDropdown: function () { return null; },
    customSourcesPage: null,
    serializeLocation: function () { return null; },
    handleFilter: function () { return null; },
    suggester: function () { return null; },
    handleMetacardUpdate: null,
    extraRoutes: function () { return null; },
    locationTypes: function (baseTypes) { return baseTypes; },
    userInformation: function () { return null; },
    extraFooter: function () { return null; },
    extraHeader: function () { return null; },
    customMapBadge: function () { return undefined; },
    resultItemAction: function (_a) {
        var _selectionInterface = _a.selectionInterface, _lazyResult = _a.lazyResult, _containerRef = _a.itemContentRef;
        return null;
    },
    attributeEditor: function () { return null; },
    customHistogramHover: undefined,
    timelineItemAddOn: function () { return null; },
    extraSidebarButtons: function () { return null; },
    includeNavigationButtons: false,
};
export default ExtensionPoints;
//# sourceMappingURL=extension-points.js.map