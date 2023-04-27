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
import { TypedProperties } from '../component/singletons/TypedProperties';
import _get from 'lodash/get';
var _map = Object.keys(TypedProperties.getIconConfig()).reduce(function (totalIconMap, iconConfigKey) {
    var iconProp = TypedProperties.getIconConfig()[iconConfigKey];
    totalIconMap[iconConfigKey] = {
        "class": iconProp.className,
        style: {
            code: iconProp.code,
            font: iconProp.font,
            size: iconProp.size
        }
    };
    return totalIconMap;
}, {});
/* Maps top-level mime type category names to the closest icon. */
var _mimeMap = {
    application: _map.document,
    audio: _map.sound,
    example: _map["default"],
    font: _map.document,
    image: _map.image,
    message: _map.document,
    model: _map.dataset,
    multipart: _map.collection,
    text: _map.text,
    video: _map.video
};
/*  This is the default icon that will be used if a Metacard cannot be
        mapped to an icon. Set default attributes to empty strings for no icon. */
var _default = _map["default"];
/* Remove resource keyword from datatype and covert to lowercase. */
function _formatAttribute(attr) {
    if (attr !== undefined) {
        return attr.toLowerCase().replace(' resource', '');
    }
    return attr;
}
/* Checks if the attribute value exists in the icon map. */
function _iconExistsInMap(attr, map) {
    if (attr instanceof Array) {
        attr = attr[0];
    }
    if (attr !== undefined &&
        attr.length > 0 &&
        map.hasOwnProperty(_formatAttribute(attr))) {
        return true;
    }
    else {
        return false;
    }
}
/* Find the correct icon based on various Metacard attributes. */
function _deriveIconByMetacardObject(metacard) {
    var prop, dataTypes, metacardType, mimeType, contentType, icon = _default;
    prop = metacard.metacard.properties;
    dataTypes = prop.datatype;
    metacardType = _formatAttribute(prop['metacard-type']);
    mimeType = _formatAttribute(prop['media.type']);
    contentType = _formatAttribute(prop['metadata-content-type']);
    if (mimeType !== undefined) {
        var mime_1 = mimeType.split('/');
        if (mime_1 && mime_1.length === 2) {
            mimeType = mime_1[0];
        }
    }
    if (_iconExistsInMap(dataTypes, _map)) {
        icon = _get(_map, _formatAttribute(dataTypes[0]), _default);
    }
    else if (_iconExistsInMap(metacardType, _map)) {
        icon = _get(_map, metacardType, _default);
    }
    else if (_iconExistsInMap(contentType, _map)) {
        icon = _get(_map, contentType, _default);
    }
    else if (_iconExistsInMap(mimeType, _mimeMap)) {
        icon = _get(_mimeMap, mimeType, _default);
    }
    if (metacardType === 'metacard.query') {
        return {
            "class": 'fa fa-search',
            style: {
                code: 'f002',
                font: 'FontAwesome',
                size: '12px'
            }
        };
    }
    if (!icon) {
        return {
            "class": 'fa fa-question',
            style: {
                code: 'f128',
                font: 'FontAwesome',
                size: '12px'
            }
        };
    }
    return icon;
}
/* Find the correct icon by icon name. */
function _deriveIconByName(name) {
    return _get(_map, _formatAttribute(name), _default);
}
export default {
    getClassByMetacardObject: function (metacard) {
        var i = _deriveIconByMetacardObject(metacard);
        return _get(i, 'class', _default["class"]);
    },
    getUnicode: function () {
        return _get(_map, 'style.code', _default.style.code);
    },
    getFont: function () {
        return _get(_map, 'style.font', _default.style.font);
    },
    getSize: function () {
        return _get(_map, 'style.size', _default.style.size);
    },
    getFullByMetacardObject: function (metacard) {
        var i = _deriveIconByMetacardObject(metacard);
        return i !== undefined ? i : _default;
    },
    getClassByName: function (name) {
        var i = _deriveIconByName(name);
        return _get(i, 'class', _default === null || _default === void 0 ? void 0 : _default["class"]);
    }
};
//# sourceMappingURL=IconHelper.js.map