import { __awaiter, __generator } from "tslib";
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
// check browser before loading the rest of the app
import { isSupportedBrowser } from './check-browser';
import { removeRedirectQueryParams } from './handle-query-params';
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isSupportedBrowser()) return [3 /*break*/, 4];
                removeRedirectQueryParams();
                return [4 /*yield*/, import('./js/WaitForReady')];
            case 1: 
            // wait for critical data to be fetched
            return [4 /*yield*/, (_a.sent()).waitForReady()];
            case 2:
                // wait for critical data to be fetched
                _a.sent();
                return [4 /*yield*/, import('./app')];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvaW5kZXgudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osbURBQW1EO0FBQ25ELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBR3BELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLHVCQUF1QixDQUNoRTtBQUFBLENBQUM7Ozs7cUJBRUksa0JBQWtCLEVBQUUsRUFBcEIsd0JBQW9CO2dCQUN0Qix5QkFBeUIsRUFBRSxDQUFBO2dCQUVwQixxQkFBTSxNQUFNLENBQUMsbUJBQW1CLENBQUMsRUFBQTs7WUFEeEMsdUNBQXVDO1lBQ3ZDLHFCQUFNLENBQUMsU0FBaUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxFQUFBOztnQkFEeEQsdUNBQXVDO2dCQUN2QyxTQUF3RCxDQUFBO2dCQUN4RCxxQkFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUE7O2dCQUFyQixTQUFxQixDQUFBOzs7OztLQUV4QixDQUFDLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLy8gY2hlY2sgYnJvd3NlciBiZWZvcmUgbG9hZGluZyB0aGUgcmVzdCBvZiB0aGUgYXBwXG5pbXBvcnQgeyBpc1N1cHBvcnRlZEJyb3dzZXIgfSBmcm9tICcuL2NoZWNrLWJyb3dzZXInXG4vL0B0cy1pZ25vcmVcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IHJlbW92ZVJlZGlyZWN0UXVlcnlQYXJhbXMgfSBmcm9tICcuL2hhbmRsZS1xdWVyeS1wYXJhbXMnXG47KGFzeW5jICgpID0+IHtcbiAgLy8gY2hlY2sgaWYgc3VwcG9ydGVkIGJyb3dzZXJcbiAgaWYgKGlzU3VwcG9ydGVkQnJvd3NlcigpKSB7XG4gICAgcmVtb3ZlUmVkaXJlY3RRdWVyeVBhcmFtcygpXG4gICAgLy8gd2FpdCBmb3IgY3JpdGljYWwgZGF0YSB0byBiZSBmZXRjaGVkXG4gICAgYXdhaXQgKGF3YWl0IGltcG9ydCgnLi9qcy9XYWl0Rm9yUmVhZHknKSkud2FpdEZvclJlYWR5KClcbiAgICBhd2FpdCBpbXBvcnQoJy4vYXBwJylcbiAgfVxufSkoKVxuIl19