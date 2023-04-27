/* Copyright (c) Connexta, LLC */
import { green, red } from '@material-ui/core/colors';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import Check from '@material-ui/icons/Check';
import Close from '@material-ui/icons/Close';
import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { Elevations } from '../theme/theme';
var ValidationIndicator = function (_a) {
    var helperText = _a.helperMessage, error = _a.error;
    return (React.createElement(InputAdornment, { position: "start" },
        React.createElement(Tooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" }, helperText) }, error ? (React.createElement(Close, { style: { color: red[500] } })) : (React.createElement(Check, { style: { color: green[500] } })))));
};
export default ValidationIndicator;
//# sourceMappingURL=validation-indicator.js.map