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
/**
 * ApplicationSetup needs to happen first.
 * This ensures styles are applied correctly,
 * because some of our styles have the same specificity as vendor
 * styles.
 */
;
(function verifyFirstImport() {
    if (document.querySelector('[data-styled-components]')) {
        var firstImportErrorMessage = "The entry import has to be the first (top) import for your application, otherwise styles won't be applied properly.\n    If you're seeing this, it probably means you need to move your import of the Entry file to the top of whatever file it's in.\n    ";
        alert(firstImportErrorMessage);
        throw Error(firstImportErrorMessage);
    }
})();
import '../js/ApplicationSetup';
import ExtensionPoints from '../extension-points';
import { attemptToStart } from './ApplicationStart';
var entry = function (extensionPoints, startFunction) {
    if (extensionPoints === void 0) { extensionPoints = {}; }
    if (startFunction === void 0) { startFunction = attemptToStart; }
    Object.assign(ExtensionPoints, extensionPoints);
    startFunction();
};
export default entry;
//# sourceMappingURL=Entry.js.map