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
//# sourceMappingURL=check-browser.js.map