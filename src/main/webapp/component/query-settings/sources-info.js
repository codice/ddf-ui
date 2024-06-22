import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import StorageIcon from '@mui/icons-material/Storage';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import ExtensionPoints from '../../extension-points';
import SourcesPage from '../../react-component/sources/presentation';
import { Elevations } from '../theme/theme';
import { useMenuState } from '../menu-state/menu-state';
var SourcesInfo = function () {
    var _a = useMenuState(), anchorRef = _a.anchorRef, handleClick = _a.handleClick, handleClose = _a.handleClose, open = _a.open;
    var popoverActions = React.useRef(null);
    var onChange = function () {
        if (popoverActions.current) {
            popoverActions.current.updatePosition();
        }
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, { component: "div", "data-id": "sources-button", fullWidth: true, variant: "text", color: "primary", onClick: handleClick, ref: anchorRef },
            React.createElement(Grid, { container: true, direction: "row", alignItems: "center", wrap: "nowrap" },
                React.createElement(Grid, { item: true, className: "pr-1" },
                    React.createElement(StorageIcon, { className: "Mui-text-text-primary" })),
                React.createElement(Grid, { item: true }, "Sources"))),
        React.createElement(Popover, { action: popoverActions, open: open, anchorEl: anchorRef.current, onClose: handleClose, anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
            }, transformOrigin: {
                vertical: 'top',
                horizontal: 'center',
            }, className: "max-h-screen-1/2" },
            React.createElement(Paper, { elevation: Elevations.overlays, className: "min-w-120" }, ExtensionPoints.customSourcesPage ? (React.createElement(ExtensionPoints.customSourcesPage, { onChange: onChange })) : (React.createElement(SourcesPage, null))))));
};
export default hot(module)(SourcesInfo);
//# sourceMappingURL=sources-info.js.map