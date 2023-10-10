import * as React from 'react';
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import user from '../singletons/user-instance';
import { useDialog } from '../dialog';
import { StartupDataStore } from '../../js/model/Startup/startup';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
function hasMessage() {
    var _a;
    return (_a = StartupDataStore.Configuration.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.systemUsageTitle;
}
function hasNotSeenMessage() {
    var systemUsage = window.sessionStorage.getItem('systemUsage');
    if (systemUsage === null) {
        window.sessionStorage.setItem('systemUsage', '{}');
        return true;
    }
    else {
        return (JSON.parse(systemUsage)[user.get('user').get('username')] === undefined);
    }
}
function shownOncePerSession() {
    var _a;
    return (_a = StartupDataStore.Configuration.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.systemUsageOncePerSession;
}
function shouldDisplayMessage() {
    if (hasMessage()) {
        if (!shownOncePerSession()) {
            return true;
        }
        else {
            return hasNotSeenMessage();
        }
    }
    else {
        return false;
    }
}
var SystemUsageModal = function () {
    var Configuration = useConfiguration();
    var dialogContext = useDialog();
    React.useEffect(function () {
        if (shouldDisplayMessage()) {
            openModal();
        }
        else {
            user.once('sync', function () {
                openModal();
            });
        }
    }, []);
    var openModal = function () {
        var _a;
        dialogContext.setProps({
            onClose: function (_event, reason) {
                if (reason === 'backdropClick') {
                    return;
                }
                dialogContext.setProps({
                    open: false,
                });
            },
            open: true,
            children: (React.createElement(React.Fragment, null,
                React.createElement(DialogTitle, { style: { textAlign: 'center' } }, (_a = Configuration.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.systemUsageTitle),
                React.createElement(Divider, null),
                React.createElement(DialogContent, { style: { minHeight: '30em', minWidth: '60vh' } },
                    React.createElement("div", { dangerouslySetInnerHTML: {
                            __html: Configuration.getSystemUsageMessage(),
                        } })),
                React.createElement(Divider, null),
                React.createElement(DialogActions, null,
                    React.createElement(Button, { variant: "contained", color: "primary", onClick: function () {
                            var _a;
                            if ((_a = Configuration.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.systemUsageOncePerSession) {
                                var systemUsage = JSON.parse(window.sessionStorage.getItem('systemUsage'));
                                systemUsage[user.get('user').get('username')] = 'true';
                                window.sessionStorage.setItem('systemUsage', JSON.stringify(systemUsage));
                            }
                            dialogContext.setProps({
                                open: false,
                            });
                        } }, "Acknowledge")))),
        });
    };
    return React.createElement(React.Fragment, null);
};
export default hot(module)(SystemUsageModal);
//# sourceMappingURL=system-usage.js.map