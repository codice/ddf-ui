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
 * Lesser General Public License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import sessionTimeoutModel from './session-timeout';
import chai from 'chai';
var expect = chai.expect;
describe('session-timeout', function () {
    it('logout() navigates to the URL returned by the invalidate endpoint', function () { return __awaiter(void 0, void 0, void 0, function () {
        var navigated, originalNavigate;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    navigated = [];
                    originalNavigate = sessionTimeoutModel.navigate;
                    sessionTimeoutModel.navigate = function (url) {
                        navigated.push(url);
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, sessionTimeoutModel.logout()];
                case 2:
                    _a.sent();
                    expect(navigated).to.deep.equal(['/logout?service=test-logout']);
                    return [3 /*break*/, 4];
                case 3:
                    ;
                    sessionTimeoutModel.navigate = originalNavigate;
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi10aW1lb3V0LnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3NpbmdsZXRvbnMvc2Vzc2lvbi10aW1lb3V0LnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7SUFZSTtBQUNKLE9BQU8sbUJBQW1CLE1BQU0sbUJBQW1CLENBQUE7QUFDbkQsT0FBTyxJQUFJLE1BQU0sTUFBTSxDQUFBO0FBRXZCLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUE7QUFFMUIsUUFBUSxDQUFDLGlCQUFpQixFQUFFO0lBQzFCLEVBQUUsQ0FBQyxtRUFBbUUsRUFBRTs7Ozs7b0JBQ2hFLFNBQVMsR0FBYSxFQUFFLENBQUE7b0JBQ3hCLGdCQUFnQixHQUFJLG1CQUEyQixDQUFDLFFBQVEsQ0FDN0Q7b0JBQUMsbUJBQTJCLENBQUMsUUFBUSxHQUFHLFVBQUMsR0FBVzt3QkFDbkQsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtvQkFDckIsQ0FBQyxDQUFBOzs7O29CQUVDLHFCQUFPLG1CQUEyQixDQUFDLE1BQU0sRUFBRSxFQUFBOztvQkFBM0MsU0FBMkMsQ0FBQTtvQkFDM0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFBOzs7b0JBRWhFLENBQUM7b0JBQUMsbUJBQTJCLENBQUMsUUFBUSxHQUFHLGdCQUFnQixDQUFBOzs7OztTQUU1RCxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgc2Vzc2lvblRpbWVvdXRNb2RlbCBmcm9tICcuL3Nlc3Npb24tdGltZW91dCdcbmltcG9ydCBjaGFpIGZyb20gJ2NoYWknXG5cbmNvbnN0IGV4cGVjdCA9IGNoYWkuZXhwZWN0XG5cbmRlc2NyaWJlKCdzZXNzaW9uLXRpbWVvdXQnLCAoKSA9PiB7XG4gIGl0KCdsb2dvdXQoKSBuYXZpZ2F0ZXMgdG8gdGhlIFVSTCByZXR1cm5lZCBieSB0aGUgaW52YWxpZGF0ZSBlbmRwb2ludCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBuYXZpZ2F0ZWQ6IHN0cmluZ1tdID0gW11cbiAgICBjb25zdCBvcmlnaW5hbE5hdmlnYXRlID0gKHNlc3Npb25UaW1lb3V0TW9kZWwgYXMgYW55KS5uYXZpZ2F0ZVxuICAgIDsoc2Vzc2lvblRpbWVvdXRNb2RlbCBhcyBhbnkpLm5hdmlnYXRlID0gKHVybDogc3RyaW5nKSA9PiB7XG4gICAgICBuYXZpZ2F0ZWQucHVzaCh1cmwpXG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCAoc2Vzc2lvblRpbWVvdXRNb2RlbCBhcyBhbnkpLmxvZ291dCgpXG4gICAgICBleHBlY3QobmF2aWdhdGVkKS50by5kZWVwLmVxdWFsKFsnL2xvZ291dD9zZXJ2aWNlPXRlc3QtbG9nb3V0J10pXG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIDsoc2Vzc2lvblRpbWVvdXRNb2RlbCBhcyBhbnkpLm5hdmlnYXRlID0gb3JpZ2luYWxOYXZpZ2F0ZVxuICAgIH1cbiAgfSlcbn0pXG4iXX0=