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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stYnJvd3Nlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jaGVjay1icm93c2VyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyx1QkFBdUIsQ0FBQTtBQUM5QixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFFdkMsSUFBTSxPQUFPLEdBQUcsTUFBTSxFQUFFLENBQUE7QUFFeEI7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUFHO0lBQ2hDLElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBQ0QsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQy9CLElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZELFFBQVEsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQyxLQUFLLFFBQVE7Z0JBQ1gseUZBQXlGO2dCQUN6RixPQUFPLE9BQU8sSUFBSSxFQUFFLENBQUE7WUFDdEIsS0FBSyxTQUFTO2dCQUNaLGdEQUFnRDtnQkFDaEQsT0FBTyxPQUFPLElBQUksRUFBRSxDQUFBO1lBQ3RCLEtBQUssTUFBTSxDQUFDO1lBQ1osS0FBSyxlQUFlO2dCQUNsQix5SEFBeUg7Z0JBQ3pILCtDQUErQztnQkFDL0MsT0FBTyxPQUFPLElBQUksRUFBRSxDQUFBO1lBQ3RCO2dCQUNFLE9BQU8sS0FBSyxDQUFBO1FBQ2hCLENBQUM7SUFDSCxDQUFDO1NBQU0sQ0FBQztRQUNOOzs7O1dBSUc7UUFDSCxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7QUFDSCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSx3QkFBd0IsR0FBRzs7SUFDdEMsTUFBQSxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQywwQ0FBRSxTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzNELE1BQUEsUUFBUTtTQUNMLGFBQWEsQ0FBQyxpQ0FBaUMsQ0FBQywwQ0FDL0MsZ0JBQWdCLENBQUMsT0FBTyxFQUFFO1FBQzFCLGNBQWMsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDdEQsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFBO0lBQ25CLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQyxDQUFBO0FBRUQsTUFBTSxDQUFDLElBQU0sc0JBQXNCLEdBQUc7O0lBQ3BDLE1BQUEsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQywwQ0FBRSxNQUFNLEVBQUUsQ0FBQTtBQUM5RCxDQUFDLENBQUE7QUFFRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDO0lBQzFCLHdCQUF3QixFQUFFLENBQUE7QUFDNUIsQ0FBQztLQUFNLENBQUM7SUFDTixzQkFBc0IsRUFBRSxDQUFBO0FBQzFCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAnLi9zdHlsZXMvdGFpbHdpbmQuY3NzJ1xuaW1wb3J0IHsgZGV0ZWN0IH0gZnJvbSAnZGV0ZWN0LWJyb3dzZXInXG5cbmNvbnN0IGJyb3dzZXIgPSBkZXRlY3QoKVxuXG4vKipcbiAqICBJZiB3ZSBjYW4ndCBkZXRlY3QgYnJvd3NlciwgYXNzdW1lIGl0J3Mgc3VwcG9ydGVkXG4gKlxuICogIElmIHdlIGNhbiwgY2hlY2sgaWYgaXQncyBzdXBwb3J0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGlzU3VwcG9ydGVkQnJvd3NlciA9ICgpID0+IHtcbiAgaWYgKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2lnbm9yZUJyb3dzZXJXYXJuaW5nJykpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGlmIChicm93c2VyICYmIGJyb3dzZXIudmVyc2lvbikge1xuICAgIGNvbnN0IHZlcnNpb24gPSBwYXJzZUludChicm93c2VyLnZlcnNpb24uc3BsaXQoJy4nKVswXSlcbiAgICBzd2l0Y2ggKGJyb3dzZXIgJiYgYnJvd3Nlci5uYW1lKSB7XG4gICAgICBjYXNlICdjaHJvbWUnOlxuICAgICAgICAvLyBodHRwczovL2Nocm9taXVtLmN5cHJlc3MuaW8vbWFjLyBmb3IgdGhvc2UgZGV2cyB3aG8gd2lzaCB0byB0ZXN0IG9sZCBjaHJvbWl1bSB2ZXJzaW9uc1xuICAgICAgICByZXR1cm4gdmVyc2lvbiA+PSA5MFxuICAgICAgY2FzZSAnZmlyZWZveCc6XG4gICAgICAgIC8vIGh0dHBzOi8vZnRwLm1vemlsbGEub3JnL3B1Yi9maXJlZm94L3JlbGVhc2VzL1xuICAgICAgICByZXR1cm4gdmVyc2lvbiA+PSA3OFxuICAgICAgY2FzZSAnZWRnZSc6XG4gICAgICBjYXNlICdlZGdlLWNocm9taXVtJzpcbiAgICAgICAgLy8gaHR0cHM6Ly9vZmZpY2VjZG5tYWMubWljcm9zb2Z0LmNvbS9wci8wM2FkZjYxOS0zOGM2LTQyNDktOTVmZi00YTAxYzBmZmM5NjIvTWFjQXV0b3VwZGF0ZS9NaWNyb3NvZnRFZGdlLTkwLjAuODE4LjM5LnBrZ1xuICAgICAgICAvLyBjaGFuZ2UgdmVyc2lvbiBvbiBlbmQgdG8gZ2V0IHRvIG9sZCB2ZXJzaW9uc1xuICAgICAgICByZXR1cm4gdmVyc2lvbiA+PSA5MVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8qKlxuICAgICAqICBBc3N1bXB0aW9uIGlzIHRoYXQgdGhpcyB3b3VsZCBoYXBwZW4gb25seSBpbiBhIG5ldyBicm93c2VyIHZlcnNpb24gd2hlcmUgdGhlIHVzZXIgYWdlbnQgZGVwcmVjYXRpb25cbiAgICAgKiAgaGFzIGdvbmUgdGhyb3VnaCAodGh1cyBpdCBzaG91bGQgYmUgYSByZWxhdGl2ZWx5IG5ldyB2ZXJzaW9uIG9mIGNocm9tZSBvciB3aGF0ZXZlciBicm93c2VyKSxcbiAgICAgKiAgc28gd2UgbGV0IGl0IHRocm91Z2ggYXMgc3VwcG9ydGVkLlxuICAgICAqL1xuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGhhbmRsZVVuc3VwcG9ydGVkQnJvd3NlciA9ICgpID0+IHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvYWRpbmcnKT8uY2xhc3NMaXN0LmFkZCgnaGlkZGVuJylcbiAgZG9jdW1lbnRcbiAgICAucXVlcnlTZWxlY3RvcignI2luY29tcGF0aWJsZS1icm93c2VyLWJnIGJ1dHRvbicpXG4gICAgPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2lnbm9yZUJyb3dzZXJXYXJuaW5nJywgJ3RydWUnKVxuICAgICAgbG9jYXRpb24ucmVsb2FkKClcbiAgICB9KVxufVxuXG5leHBvcnQgY29uc3QgaGFuZGxlU3VwcG9ydGVkQnJvd3NlciA9ICgpID0+IHtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2luY29tcGF0aWJsZS1icm93c2VyLWJnJyk/LnJlbW92ZSgpXG59XG5cbmlmICghaXNTdXBwb3J0ZWRCcm93c2VyKCkpIHtcbiAgaGFuZGxlVW5zdXBwb3J0ZWRCcm93c2VyKClcbn0gZWxzZSB7XG4gIGhhbmRsZVN1cHBvcnRlZEJyb3dzZXIoKVxufVxuIl19