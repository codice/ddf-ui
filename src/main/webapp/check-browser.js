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
import './styles/tailwind.css';
import { detect } from 'detect-browser';
var browser = detect();
/**
 *  If we can't detect browser, assume it's supported
 *
 *  If we can, check if it's supported
 */
export var isSupportedBrowser = function () {
    if (sessionStorage.getItem('ignoreBrowserWarning')) {
        return true;
    }
    if (browser && browser.version) {
        var version = parseInt(browser.version.split('.')[0]);
        switch (browser && browser.name) {
            case 'chrome':
                // https://chromium.cypress.io/mac/ for those devs who wish to test old chromium versions
                return version >= 90;
            case 'firefox':
                // https://ftp.mozilla.org/pub/firefox/releases/
                return version >= 78;
            case 'edge':
            case 'edge-chromium':
                // https://officecdnmac.microsoft.com/pr/03adf619-38c6-4249-95ff-4a01c0ffc962/MacAutoupdate/MicrosoftEdge-90.0.818.39.pkg
                // change version on end to get to old versions
                return version >= 91;
            default:
                return false;
        }
    }
    else {
        /**
         *  Assumption is that this would happen only in a new browser version where the user agent deprecation
         *  has gone through (thus it should be a relatively new version of chrome or whatever browser),
         *  so we let it through as supported.
         */
        return true;
    }
};
export var handleUnsupportedBrowser = function () {
    var _a, _b;
    (_a = document.querySelector('#loading')) === null || _a === void 0 ? void 0 : _a.classList.add('hidden');
    (_b = document
        .querySelector('#incompatible-browser-bg button')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', function () {
        sessionStorage.setItem('ignoreBrowserWarning', 'true');
        location.reload();
    });
};
export var handleSupportedBrowser = function () {
    var _a;
    (_a = document.querySelector('#incompatible-browser-bg')) === null || _a === void 0 ? void 0 : _a.remove();
};
if (!isSupportedBrowser()) {
    handleUnsupportedBrowser();
}
else {
    handleSupportedBrowser();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jaGVjay1icm93c2VyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyx1QkFBdUIsQ0FBQTtBQUM5QixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFdkMsSUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUE7QUFFeEI7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUFHO0lBQ2hDLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFO1FBQ2xELE9BQU8sSUFBSSxDQUFBO0tBQ1o7SUFDRCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO1FBQzlCLElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZELFFBQVEsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7WUFDL0IsS0FBSyxRQUFRO2dCQUNYLHlGQUF5RjtnQkFDekYsT0FBTyxPQUFPLElBQUksRUFBRSxDQUFBO1lBQ3RCLEtBQUssU0FBUztnQkFDWixnREFBZ0Q7Z0JBQ2hELE9BQU8sT0FBTyxJQUFJLEVBQUUsQ0FBQTtZQUN0QixLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssZUFBZTtnQkFDbEIseUhBQXlIO2dCQUN6SCwrQ0FBK0M7Z0JBQy9DLE9BQU8sT0FBTyxJQUFJLEVBQUUsQ0FBQTtZQUN0QjtnQkFDRSxPQUFPLEtBQUssQ0FBQTtTQUNmO0tBQ0Y7U0FBTTtRQUNMOzs7O1dBSUc7UUFDSCxPQUFPLElBQUksQ0FBQTtLQUNaO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLElBQU0sd0JBQXdCLEdBQUc7O0lBQ3RDLE1BQUEsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsMENBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMzRCxNQUFBLFFBQVE7U0FDTCxhQUFhLENBQUMsaUNBQWlDLENBQUMsMENBQy9DLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtRQUMxQixjQUFjLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3RELFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNuQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLHNCQUFzQixHQUFHOztJQUNwQyxNQUFBLFFBQVEsQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUMsMENBQUUsTUFBTSxFQUFFLENBQUE7QUFDOUQsQ0FBQyxDQUFBO0FBRUQsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7SUFDekIsd0JBQXdCLEVBQUUsQ0FBQTtDQUMzQjtLQUFNO0lBQ0wsc0JBQXNCLEVBQUUsQ0FBQTtDQUN6QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICcuL3N0eWxlcy90YWlsd2luZC5jc3MnXG5pbXBvcnQgeyBkZXRlY3QgfSBmcm9tICdkZXRlY3QtYnJvd3NlcidcblxuY29uc3QgYnJvd3NlciA9IGRldGVjdCgpXG5cbi8qKlxuICogIElmIHdlIGNhbid0IGRldGVjdCBicm93c2VyLCBhc3N1bWUgaXQncyBzdXBwb3J0ZWRcbiAqXG4gKiAgSWYgd2UgY2FuLCBjaGVjayBpZiBpdCdzIHN1cHBvcnRlZFxuICovXG5leHBvcnQgY29uc3QgaXNTdXBwb3J0ZWRCcm93c2VyID0gKCkgPT4ge1xuICBpZiAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnaWdub3JlQnJvd3Nlcldhcm5pbmcnKSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgaWYgKGJyb3dzZXIgJiYgYnJvd3Nlci52ZXJzaW9uKSB7XG4gICAgY29uc3QgdmVyc2lvbiA9IHBhcnNlSW50KGJyb3dzZXIudmVyc2lvbi5zcGxpdCgnLicpWzBdKVxuICAgIHN3aXRjaCAoYnJvd3NlciAmJiBicm93c2VyLm5hbWUpIHtcbiAgICAgIGNhc2UgJ2Nocm9tZSc6XG4gICAgICAgIC8vIGh0dHBzOi8vY2hyb21pdW0uY3lwcmVzcy5pby9tYWMvIGZvciB0aG9zZSBkZXZzIHdobyB3aXNoIHRvIHRlc3Qgb2xkIGNocm9taXVtIHZlcnNpb25zXG4gICAgICAgIHJldHVybiB2ZXJzaW9uID49IDkwXG4gICAgICBjYXNlICdmaXJlZm94JzpcbiAgICAgICAgLy8gaHR0cHM6Ly9mdHAubW96aWxsYS5vcmcvcHViL2ZpcmVmb3gvcmVsZWFzZXMvXG4gICAgICAgIHJldHVybiB2ZXJzaW9uID49IDc4XG4gICAgICBjYXNlICdlZGdlJzpcbiAgICAgIGNhc2UgJ2VkZ2UtY2hyb21pdW0nOlxuICAgICAgICAvLyBodHRwczovL29mZmljZWNkbm1hYy5taWNyb3NvZnQuY29tL3ByLzAzYWRmNjE5LTM4YzYtNDI0OS05NWZmLTRhMDFjMGZmYzk2Mi9NYWNBdXRvdXBkYXRlL01pY3Jvc29mdEVkZ2UtOTAuMC44MTguMzkucGtnXG4gICAgICAgIC8vIGNoYW5nZSB2ZXJzaW9uIG9uIGVuZCB0byBnZXQgdG8gb2xkIHZlcnNpb25zXG4gICAgICAgIHJldHVybiB2ZXJzaW9uID49IDkxXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLyoqXG4gICAgICogIEFzc3VtcHRpb24gaXMgdGhhdCB0aGlzIHdvdWxkIGhhcHBlbiBvbmx5IGluIGEgbmV3IGJyb3dzZXIgdmVyc2lvbiB3aGVyZSB0aGUgdXNlciBhZ2VudCBkZXByZWNhdGlvblxuICAgICAqICBoYXMgZ29uZSB0aHJvdWdoICh0aHVzIGl0IHNob3VsZCBiZSBhIHJlbGF0aXZlbHkgbmV3IHZlcnNpb24gb2YgY2hyb21lIG9yIHdoYXRldmVyIGJyb3dzZXIpLFxuICAgICAqICBzbyB3ZSBsZXQgaXQgdGhyb3VnaCBhcyBzdXBwb3J0ZWQuXG4gICAgICovXG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgaGFuZGxlVW5zdXBwb3J0ZWRCcm93c2VyID0gKCkgPT4ge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbG9hZGluZycpPy5jbGFzc0xpc3QuYWRkKCdoaWRkZW4nKVxuICBkb2N1bWVudFxuICAgIC5xdWVyeVNlbGVjdG9yKCcjaW5jb21wYXRpYmxlLWJyb3dzZXItYmcgYnV0dG9uJylcbiAgICA/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnaWdub3JlQnJvd3Nlcldhcm5pbmcnLCAndHJ1ZScpXG4gICAgICBsb2NhdGlvbi5yZWxvYWQoKVxuICAgIH0pXG59XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVTdXBwb3J0ZWRCcm93c2VyID0gKCkgPT4ge1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaW5jb21wYXRpYmxlLWJyb3dzZXItYmcnKT8ucmVtb3ZlKClcbn1cblxuaWYgKCFpc1N1cHBvcnRlZEJyb3dzZXIoKSkge1xuICBoYW5kbGVVbnN1cHBvcnRlZEJyb3dzZXIoKVxufSBlbHNlIHtcbiAgaGFuZGxlU3VwcG9ydGVkQnJvd3NlcigpXG59XG4iXX0=