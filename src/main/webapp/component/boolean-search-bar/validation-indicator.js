/* Copyright (c) Connexta, LLC */
import { green, red } from '@mui/material/colors';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import * as React from 'react';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
var ValidationIndicator = function (_a) {
    var helperText = _a.helperMessage, error = _a.error;
    return (React.createElement(InputAdornment, { position: "start" },
        React.createElement(Tooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" }, helperText) }, error ? (React.createElement(Close, { style: { color: red[500] } })) : (React.createElement(Check, { style: { color: green[500] } })))));
};
export default ValidationIndicator;
//# sourceMappingURL=validation-indicator.js.map