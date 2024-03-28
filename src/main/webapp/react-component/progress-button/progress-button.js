import { __assign } from "tslib";
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
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
var ProgressButton = function (props) {
    var children = props.children, style = props.style, disabled = props.disabled, loading = props.loading, variant = props.variant, color = props.color, size = props.size, progressVariant = props.progressVariant, onClick = props.onClick, buttonProps = props.buttonProps, linearProgressProps = props.linearProgressProps, circularProgressProps = props.circularProgressProps, className = props.className, dataId = props.dataId;
    var Loading = function () {
        return progressVariant === 'circular' ? (React.createElement(CircularProgress, __assign({ size: 24, className: "absolute" }, circularProgressProps))) : (React.createElement(LinearProgress, __assign({ className: "absolute w-full h-full opacity-25" }, linearProgressProps)));
    };
    return (React.createElement(Button, __assign({ "data-id": dataId, style: style, variant: variant || 'contained', color: color || 'primary', size: size, className: "relative ".concat(className), disabled: loading || disabled, onClick: onClick }, buttonProps),
        children,
        loading && React.createElement(Loading, null)));
};
export default ProgressButton;
//# sourceMappingURL=progress-button.js.map