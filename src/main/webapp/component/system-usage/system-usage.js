import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
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
            children: (_jsxs(_Fragment, { children: [_jsx(DialogTitle, { style: { textAlign: 'center' }, children: (_a = Configuration.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.systemUsageTitle }), _jsx(Divider, {}), _jsx(DialogContent, { style: { minHeight: '30em', minWidth: '60vh' }, children: _jsx("div", { dangerouslySetInnerHTML: {
                                __html: Configuration.getSystemUsageMessage(),
                            } }) }), _jsx(Divider, {}), _jsx(DialogActions, { children: _jsx(Button, { variant: "contained", color: "primary", onClick: function () {
                                var _a;
                                if ((_a = Configuration.platformUiConfiguration) === null || _a === void 0 ? void 0 : _a.systemUsageOncePerSession) {
                                    var systemUsage = JSON.parse(window.sessionStorage.getItem('systemUsage'));
                                    systemUsage[user.get('user').get('username')] = 'true';
                                    window.sessionStorage.setItem('systemUsage', JSON.stringify(systemUsage));
                                }
                                dialogContext.setProps({
                                    open: false,
                                });
                            }, children: "Acknowledge" }) })] })),
        });
    };
    return _jsx(_Fragment, {});
};
export default SystemUsageModal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtLXVzYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9zeXN0ZW0tdXNhZ2Uvc3lzdGVtLXVzYWdlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxXQUFXLE1BQU0sMkJBQTJCLENBQUE7QUFDbkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxJQUFJLE1BQU0sNkJBQTZCLENBQUE7QUFDOUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFdBQVcsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUNqRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUM3RSxTQUFTLFVBQVU7O0lBQ2pCLE9BQU8sTUFBQSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsdUJBQXVCLDBDQUN6RCxnQkFBZ0IsQ0FBQTtBQUN0QixDQUFDO0FBQ0QsU0FBUyxpQkFBaUI7SUFDeEIsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDaEUsSUFBSSxXQUFXLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDekIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQ2xELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztTQUFNLENBQUM7UUFDTixPQUFPLENBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENB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QUNKO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFBO0lBQ0QsT0FBTyxtQkFBSyxDQUFBO0FBQ2QsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxnQkFBZ0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IERpYWxvZ0FjdGlvbnMgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dBY3Rpb25zJ1xuaW1wb3J0IERpYWxvZ1RpdGxlIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nVGl0bGUnXG5pbXBvcnQgRGlhbG9nQ29udGVudCBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0NvbnRlbnQnXG5pbXBvcnQgRGl2aWRlciBmcm9tICdAbXVpL21hdGVyaWFsL0RpdmlkZXInXG5pbXBvcnQgdXNlciBmcm9tICcuLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgeyB1c2VEaWFsb2cgfSBmcm9tICcuLi9kaWFsb2cnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHsgdXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvY29uZmlndXJhdGlvbi5ob29rcydcbmZ1bmN0aW9uIGhhc01lc3NhZ2UoKSB7XG4gIHJldHVybiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24ucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb25cbiAgICA/LnN5c3RlbVVzYWdlVGl0bGVcbn1cbmZ1bmN0aW9uIGhhc05vdFNlZW5NZXNzYWdlKCkge1xuICBjb25zdCBzeXN0ZW1Vc2FnZSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdzeXN0ZW1Vc2FnZScpXG4gIGlmIChzeXN0ZW1Vc2FnZSA9PT0gbnVsbCkge1xuICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKCdzeXN0ZW1Vc2FnZScsICd7fScpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKFxuICAgICAgSlNPTi5wYXJzZShzeXN0ZW1Vc2FnZSlbdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3VzZXJuYW1lJyldID09PSB1bmRlZmluZWRcbiAgICApXG4gIH1cbn1cbmZ1bmN0aW9uIHNob3duT25jZVBlclNlc3Npb24oKSB7XG4gIHJldHVybiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24ucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb25cbiAgICA/LnN5c3RlbVVzYWdlT25jZVBlclNlc3Npb25cbn1cbmZ1bmN0aW9uIHNob3VsZERpc3BsYXlNZXNzYWdlKCkge1xuICBpZiAoaGFzTWVzc2FnZSgpKSB7XG4gICAgaWYgKCFzaG93bk9uY2VQZXJTZXNzaW9uKCkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBoYXNOb3RTZWVuTWVzc2FnZSgpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5jb25zdCBTeXN0ZW1Vc2FnZU1vZGFsID0gKCkgPT4ge1xuICBjb25zdCBDb25maWd1cmF0aW9uID0gdXNlQ29uZmlndXJhdGlvbigpXG4gIGNvbnN0IGRpYWxvZ0NvbnRleHQgPSB1c2VEaWFsb2coKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzaG91bGREaXNwbGF5TWVzc2FnZSgpKSB7XG4gICAgICBvcGVuTW9kYWwoKVxuICAgIH0gZWxzZSB7XG4gICAgICB1c2VyLm9uY2UoJ3N5bmMnLCAoKSA9PiB7XG4gICAgICAgIG9wZW5Nb2RhbCgpXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW10pXG4gIGNvbnN0IG9wZW5Nb2RhbCA9ICgpID0+IHtcbiAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgIG9uQ2xvc2U6IChfZXZlbnQsIHJlYXNvbikgPT4ge1xuICAgICAgICBpZiAocmVhc29uID09PSAnYmFja2Ryb3BDbGljaycpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgY2hpbGRyZW46IChcbiAgICAgICAgPD5cbiAgICAgICAgICA8RGlhbG9nVGl0bGUgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cbiAgICAgICAgICAgIHtDb25maWd1cmF0aW9uLnBsYXRmb3JtVWlDb25maWd1cmF0aW9uPy5zeXN0ZW1Vc2FnZVRpdGxlfVxuICAgICAgICAgIDwvRGlhbG9nVGl0bGU+XG4gICAgICAgICAgPERpdmlkZXIgLz5cbiAgICAgICAgICA8RGlhbG9nQ29udGVudCBzdHlsZT17eyBtaW5IZWlnaHQ6ICczMGVtJywgbWluV2lkdGg6ICc2MHZoJyB9fT5cbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tcbiAgICAgICAgICAgICAgICBfX2h0bWw6IENvbmZpZ3VyYXRpb24uZ2V0U3lzdGVtVXNhZ2VNZXNzYWdlKCksXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvRGlhbG9nQ29udGVudD5cbiAgICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgICAgIDxEaWFsb2dBY3Rpb25zPlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgIENvbmZpZ3VyYXRpb24ucGxhdGZvcm1VaUNvbmZpZ3VyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgPy5zeXN0ZW1Vc2FnZU9uY2VQZXJTZXNzaW9uXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzeXN0ZW1Vc2FnZSA9IEpTT04ucGFyc2UoXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKCdzeXN0ZW1Vc2FnZScpIGFzIGFueVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgc3lzdGVtVXNhZ2VbdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3VzZXJuYW1lJyldID0gJ3RydWUnXG4gICAgICAgICAgICAgICAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcbiAgICAgICAgICAgICAgICAgICAgJ3N5c3RlbVVzYWdlJyxcbiAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoc3lzdGVtVXNhZ2UpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgICAgICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgQWNrbm93bGVkZ2VcbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvRGlhbG9nQWN0aW9ucz5cbiAgICAgICAgPC8+XG4gICAgICApLFxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIDw+PC8+XG59XG5leHBvcnQgZGVmYXVsdCBTeXN0ZW1Vc2FnZU1vZGFsXG4iXX0=