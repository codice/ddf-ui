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
    return (properties.ui as any).systemUsageTitle;
}
function hasNotSeenMessage() {
    const systemUsage = window.sessionStorage.getItem('systemUsage');
    if (systemUsage === null) {
        window.sessionStorage.setItem('systemUsage', '{}');
        return true;
    }
    else {
        return (JSON.parse(systemUsage)[user.get('user').get('username')] === undefined);
    }
}
function shownOncePerSession() {
    return (properties.ui as any).systemUsageOncePerSession;
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
const SystemUsageModal = () => {
    const dialogContext = useDialog();
    React.useEffect(() => {
        if (user.fetched && shouldDisplayMessage()) {
            openModal();
        }
        else {
            user.once('sync', () => {
                openModal();
            });
        }
    }, []);
    const openModal = () => {
        dialogContext.setProps({
            disableBackdropClick: true,
            open: true,
            children: (<>
          <DialogTitle style={{ textAlign: 'center' }}>
            {(properties.ui as any).systemUsageTitle}
          </DialogTitle>
          <Divider />
          <DialogContent style={{ minHeight: '30em', minWidth: '60vh' }}>
            <div dangerouslySetInnerHTML={{
                    __html: (properties.ui as any).systemUsageMessage,
                }}/>
          </DialogContent>
          <Divider />
          <DialogActions>
            <Button variant="contained" color="primary" onClick={() => {
                    if (!user.get('user').isGuestUser() &&
                        (properties.ui as any).systemUsageOncePerSession) {
                        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | null' is not assignable... Remove this comment to see the full error message
                        const systemUsage = JSON.parse(window.sessionStorage.getItem('systemUsage'));
                        systemUsage[user.get('user').get('username')] = 'true';
                        window.sessionStorage.setItem('systemUsage', JSON.stringify(systemUsage));
                    }
                    dialogContext.setProps({
                        open: false,
                    });
                }}>
              Acknowledge
            </Button>
          </DialogActions>
        </>),
        });
    };
    return <></>;
};
export default hot(module)(SystemUsageModal);
