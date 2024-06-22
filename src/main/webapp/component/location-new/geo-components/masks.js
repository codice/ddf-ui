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
/* This is a collection of masking functions for the various coordinate inputs */
var decimalMask = ['.', /\d/, /\d/, /\d/, '"'];
export var latitudeDMSMask = function (rawValue) {
    var baseMask = [/\d/, /\d/, '°', /\d/, /\d/, "'", /\d/, /\d/];
    var pattern = new RegExp('^[0-9_]{2,3}[°*][0-9_]{2,3}[`\'’]([0-9_]{2,3}(?:[.][0-9]{0,3})?)"?');
    var match = rawValue.match(pattern);
    if (match) {
        var seconds = match[1];
        if (seconds.includes('.')) {
            return baseMask.concat(decimalMask);
        }
    }
    return baseMask.concat('"');
};
export var longitudeDMSMask = function (rawValue) {
    var baseMask = [/\d/, /\d/, /\d/, '°', /\d/, /\d/, "'", /\d/, /\d/];
    var pattern = new RegExp('^[0-9_]{3,4}[°*][0-9_]{2,3}[`\'’]([0-9_]{2,3}(?:[.][0-9]{0,3})?)"?');
    var match = rawValue.match(pattern);
    if (match) {
        var seconds = match[1];
        if (seconds.includes('.')) {
            return baseMask.concat(decimalMask);
        }
    }
    return baseMask.concat('"');
};
//# sourceMappingURL=masks.js.map