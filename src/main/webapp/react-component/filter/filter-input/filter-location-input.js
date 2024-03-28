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
import React from 'react';
import LocationView from '../../location/location';
import { hot } from 'react-hot-loader';
/**
 * consolidated with location since there is no reason for indirection here, we should delete this
 */
var LocationInput = function (_a) {
    var onChange = _a.onChange, value = _a.value, errorListener = _a.errorListener;
    return (React.createElement(LocationView, { onChange: onChange, value: value, errorListener: errorListener }));
};
export default hot(module)(LocationInput);
//# sourceMappingURL=filter-location-input.js.map