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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLXVzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9zeXN0ZW0tdXNhZ2Uvc3lzdGVtLXVzYWdlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxXQUFXLE1BQU0sMkJBQTJCLENBQUE7QUFDbkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxJQUFJLE1BQU0sNkJBQTZCLENBQUE7QUFDOUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUM3RSxTQUFTLFVBQVU7O0lBQ2pCLE9BQU8sTUFBQSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsdUJBQXVCLDBDQUN6RCxnQkFBZ0IsQ0FBQTtBQUN0QixDQUFDO0FBQ0QsU0FBUyxpQkFBaUI7SUFDeEIsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDaEUsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFO1FBQ3hCLE1BQU0sQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUNsRCxPQUFPLElBQUksQ0FBQTtLQUNaO1NBQU07UUFDTCxPQUFPLENBQ0wsSUFBSSxDQUFDLEtBQUss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Q0FBSyxDQUFBO0FBQ2QsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgRGlhbG9nQWN0aW9ucyBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0FjdGlvbnMnXG5pbXBvcnQgRGlhbG9nVGl0bGUgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dUaXRsZSdcbmltcG9ydCBEaWFsb2dDb250ZW50IGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQ29udGVudCdcbmltcG9ydCBEaXZpZGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGl2aWRlcidcbmltcG9ydCB1c2VyIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCB7IHVzZURpYWxvZyB9IGZyb20gJy4uL2RpYWxvZydcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyB1c2VDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9jb25maWd1cmF0aW9uLmhvb2tzJ1xuZnVuY3Rpb24gaGFzTWVzc2FnZSgpIHtcbiAgcmV0dXJuIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvblxuICAgID8uc3lzdGVtVXNhZ2VUaXRsZVxufVxuZnVuY3Rpb24gaGFzTm90U2Vlbk1lc3NhZ2UoKSB7XG4gIGNvbnN0IHN5c3RlbVVzYWdlID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3N5c3RlbVVzYWdlJylcbiAgaWYgKHN5c3RlbVVzYWdlID09PSBudWxsKSB7XG4gICAgd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ3N5c3RlbVVzYWdlJywgJ3t9JylcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGVsc2Uge1xuICAgIHJldHVybiAoXG4gICAgICBKU09OLnBhcnNlKHN5c3RlbVVzYWdlKVt1c2VyLmdldCgndXNlcicpLmdldCgndXNlcm5hbWUnKV0gPT09IHVuZGVmaW5lZFxuICAgIClcbiAgfVxufVxuZnVuY3Rpb24gc2hvd25PbmNlUGVyU2Vzc2lvbigpIHtcbiAgcmV0dXJuIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvblxuICAgID8uc3lzdGVtVXNhZ2VPbmNlUGVyU2Vzc2lvblxufVxuZnVuY3Rpb24gc2hvdWxkRGlzcGxheU1lc3NhZ2UoKSB7XG4gIGlmIChoYXNNZXNzYWdlKCkpIHtcbiAgICBpZiAoIXNob3duT25jZVBlclNlc3Npb24oKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGhhc05vdFNlZW5NZXNzYWdlKClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cbmNvbnN0IFN5c3RlbVVzYWdlTW9kYWwgPSAoKSA9PiB7XG4gIGNvbnN0IENvbmZpZ3VyYXRpb24gPSB1c2VDb25maWd1cmF0aW9uKClcbiAgY29uc3QgZGlhbG9nQ29udGV4dCA9IHVzZURpYWxvZygpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNob3VsZERpc3BsYXlNZXNzYWdlKCkpIHtcbiAgICAgIG9wZW5Nb2RhbCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHVzZXIub25jZSgnc3luYycsICgpID0+IHtcbiAgICAgICAgb3Blbk1vZGFsKClcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbXSlcbiAgY29uc3Qgb3Blbk1vZGFsID0gKCkgPT4ge1xuICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgb25DbG9zZTogKF9ldmVudCwgcmVhc29uKSA9PiB7XG4gICAgICAgIGlmIChyZWFzb24gPT09ICdiYWNrZHJvcENsaWNrJykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIG9wZW46IHRydWUsXG4gICAgICBjaGlsZHJlbjogKFxuICAgICAgICA8PlxuICAgICAgICAgIDxEaWFsb2dUaXRsZSBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxuICAgICAgICAgICAge0NvbmZpZ3VyYXRpb24ucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb24/LnN5c3RlbVVzYWdlVGl0bGV9XG4gICAgICAgICAgPC9EaWFsb2dUaXRsZT5cbiAgICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgICAgIDxEaWFsb2dDb250ZW50IHN0eWxlPXt7IG1pbkhlaWdodDogJzMwZW0nLCBtaW5XaWR0aDogJzYwdmgnIH19PlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBkYW5nZXJvdXNseVNldElubmVySFRNTD17e1xuICAgICAgICAgICAgICAgIF9faHRtbDogQ29uZmlndXJhdGlvbi5nZXRTeXN0ZW1Vc2FnZU1lc3NhZ2UoKSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9EaWFsb2dDb250ZW50PlxuICAgICAgICAgIDxEaXZpZGVyIC8+XG4gICAgICAgICAgPERpYWxvZ0FjdGlvbnM+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgQ29uZmlndXJhdGlvbi5wbGF0Zm9ybVVpQ29uZmlndXJhdGlvblxuICAgICAgICAgICAgICAgICAgICA/LnN5c3RlbVVzYWdlT25jZVBlclNlc3Npb25cbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHN5c3RlbVVzYWdlID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ3N5c3RlbVVzYWdlJykgYXMgYW55XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICBzeXN0ZW1Vc2FnZVt1c2VyLmdldCgndXNlcicpLmdldCgndXNlcm5hbWUnKV0gPSAndHJ1ZSdcbiAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFxuICAgICAgICAgICAgICAgICAgICAnc3lzdGVtVXNhZ2UnLFxuICAgICAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShzeXN0ZW1Vc2FnZSlcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7XG4gICAgICAgICAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBBY2tub3dsZWRnZVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgICAgICA8Lz5cbiAgICAgICksXG4gICAgfSlcbiAgfVxuICByZXR1cm4gPD48Lz5cbn1cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFN5c3RlbVVzYWdlTW9kYWwpXG4iXX0=