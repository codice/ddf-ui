import { __read } from "tslib";
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
import * as React from 'react';
import LocationComponent from './location';
import { ddToWkt, dmsToWkt, usngToWkt } from './utils';
import { hot } from 'react-hot-loader';
import LocationNewModel from './location-new';
export var LocationInputReact = function (_a) {
    var value = _a.value, onChange = _a.onChange, _b = _a.isStateDirty, isStateDirty = _b === void 0 ? false : _b, _c = _a.resetIsStateDirty, resetIsStateDirty = _c === void 0 ? function () { } : _c;
    var _d = __read(React.useState(new LocationNewModel({ wkt: value, mode: 'wkt' }).toJSON()), 2), state = _d[0], setState = _d[1];
    React.useEffect(function () {
        if (isStateDirty) {
            setState(new LocationNewModel({ wkt: value, mode: state.mode }).toJSON());
            resetIsStateDirty();
        }
    }, [isStateDirty]);
    React.useEffect(function () {
        if (state.valid) {
            switch (state.mode) {
                case 'wkt':
                    onChange(state.wkt);
                    break;
                case 'dd':
                    onChange(ddToWkt(state.dd));
                    break;
                case 'dms':
                    onChange(dmsToWkt(state.dms));
                    break;
                case 'usng':
                    onChange(usngToWkt(state.usng));
                    break;
                case 'keyword':
                    onChange(state.keyword ? state.keyword.wkt : null);
                    break;
                default:
            }
        }
        else {
            onChange('INVALID');
        }
    }, [state]);
    return React.createElement(LocationComponent, { state: state, options: {}, setState: setState });
};
export default hot(module)(LocationInputReact);
//# sourceMappingURL=location-new.view.js.map