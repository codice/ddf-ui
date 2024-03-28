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
import * as ReactDOM from 'react-dom';
var Portal = function (_a) {
    var children = _a.children;
    /*
      Why this wrapper?  Well, styled-components doesn't have a good
      abstraction for making a portal yet, so we keep the portal lightly styled
      in a wrapper where we feed styled-components.  Hence the overflow set
      to visible.  This allows us to accomplish pretty much exactly what
      we want.
    */
    var _b = __read(React.useState(document.createElement('react-portal')), 1), wrapper = _b[0];
    React.useEffect(function () {
        wrapper.style.position = 'absolute';
        wrapper.style.left = '0px';
        wrapper.style.top = '0px';
        wrapper.style.display = 'block';
        wrapper.style.overflow = 'visible';
        wrapper.style.zIndex = '103'; // use creation / append order from here on out
        document.body.appendChild(wrapper);
        return function () {
            wrapper.remove();
        };
    }, []);
    return ReactDOM.createPortal(children, wrapper);
};
export default Portal;
//# sourceMappingURL=portal.js.map