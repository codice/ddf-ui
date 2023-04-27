import * as React from 'react';
import { hot } from 'react-hot-loader';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import properties from '../../js/properties';
import user from '../singletons/user-instance';
import { useDialog } from '../dialog';
function hasMessage() {
    return properties.ui.systemUsageTitle;
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
    return properties.ui.systemUsageOncePerSession;
}
function shouldDisplayMessage() {
    if (hasMessage()) {
        if (!shownOncePerSession() || user.get('user').isGuestUser()) {
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
    var dialogContext = useDialog();
    React.useEffect(function () {
        if (user.fetched && shouldDisplayMessage()) {
            openModal();
        }
        else {
            user.once('sync', function () {
                openModal();
            });
        }
    }, []);
    var openModal = function () {
        dialogContext.setProps({
            onClose: function (_event, reason) {
                if (reason === 'backdropClick') {
                    return;
                }
                dialogContext.setProps({
                    open: false
                });
            },
            open: true,
            children: (React.createElement(React.Fragment, null,
                React.createElement(DialogTitle, { style: { textAlign: 'center' } }, properties.ui.systemUsageTitle),
                React.createElement(Divider, null),
                React.createElement(DialogContent, { style: { minHeight: '30em', minWidth: '60vh' } },
                    React.createElement("div", { dangerouslySetInnerHTML: {
                            __html: properties.ui.systemUsageMessage
                        } })),
                React.createElement(Divider, null),
                React.createElement(DialogActions, null,
                    React.createElement(Button, { variant: "contained", color: "primary", onClick: function () {
                            if (!user.get('user').isGuestUser() &&
                                properties.ui.systemUsageOncePerSession) {
                                var systemUsage = JSON.parse(window.sessionStorage.getItem('systemUsage'));
                                systemUsage[user.get('user').get('username')] = 'true';
                                window.sessionStorage.setItem('systemUsage', JSON.stringify(systemUsage));
                            }
                            dialogContext.setProps({
                                open: false
                            });
                        } }, "Acknowledge"))))
        });
    };
    return React.createElement(React.Fragment, null);
};
export default hot(module)(SystemUsageModal);
//# sourceMappingURL=system-usage.js.map