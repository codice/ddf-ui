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
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import { Link } from '../../component/link/link';
import { Divider } from './metacard-interactions';
var ExpandMetacard = function (props) {
    if (!props.model || props.model.length !== 1) {
        return null;
    }
    var id = props.model[0].plain.id;
    var to = props.model[0].plain.metacardType === 'metacard.query'
        ? "/search/".concat(id)
        : "/metacards/".concat(id);
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, { fullWidth: true, component: Link, to: to, variant: "text", color: "primary", target: "_blank" }, "Open Metacard View"),
        React.createElement(Divider, null)));
};
export default hot(module)(ExpandMetacard);
//# sourceMappingURL=expand-interaction.js.map