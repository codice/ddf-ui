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
import $ from 'jquery';
import { Overridable } from '../../../js/model/Base/base-classes';
export default function saveFile(name, type, data) {
    return __awaiter(this, void 0, void 0, function () {
        var a, url;
        return __generator(this, function (_a) {
            if (data != null && navigator.msSaveBlob)
                return [2 /*return*/, navigator.msSaveBlob(new Blob([data], { type: type }), name)];
            a = $("<a style='display: none;'/>");
            url = window.URL.createObjectURL(new Blob([data], { type: type }));
            a.attr('href', url);
            a.attr('download', name);
            $('body').append(a);
            a[0].click();
            window.URL.revokeObjectURL(url);
            a.remove();
            return [2 /*return*/];
        });
    });
}
// return filename portion of content-disposition
export function getFilenameFromContentDisposition(contentDisposition) {
    if (contentDisposition == null) {
        return null;
    }
    var parts = contentDisposition.split('=', 2);
    if (parts.length !== 2) {
        return null;
    }
    return parts[1];
}
export var OverridableSaveFile = new Overridable(saveFile);
//# sourceMappingURL=save-file.js.map