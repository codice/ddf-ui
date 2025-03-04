import { __read } from "tslib";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import React from 'react';
export function useDialogState() {
    var _a = __read(React.useState(false), 2), open = _a[0], setOpen = _a[1];
    var handleClick = function () {
        setOpen(!open);
    };
    var handleClose = function () {
        setOpen(false);
    };
    return {
        open: open,
        handleClick: handleClick,
        handleClose: handleClose,
        /**
         * Handy prop bundles for passing to common components
         */
        dropdownProps: {
            open: open,
            handleClose: handleClose,
        },
        MuiButtonComponents: {
            Button: Button,
        },
        MuiDialogComponents: {
            Dialog: Dialog,
            DialogContent: DialogContent,
            DialogTitle: DialogTitle,
            DialogActions: DialogActions,
            DialogContentText: DialogContentText,
        },
        MuiDialogProps: {
            open: open,
            onClose: handleClose,
        },
        MuiButtonProps: {
            onClick: handleClick,
        },
        buttonProps: {
            onClick: handleClick,
        },
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlRGlhbG9nU3RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2hvb2tzL3VzZURpYWxvZ1N0YXRlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBRUEsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxXQUFXLE1BQU0sMkJBQTJCLENBQUE7QUFDbkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxpQkFBaUIsTUFBTSxpQ0FBaUMsQ0FBQTtBQUMvRCxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFekIsTUFBTSxVQUFVLGNBQWM7SUFDdEIsSUFBQSxLQUFBLE9BQWtCLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUEsRUFBdEMsSUFBSSxRQUFBLEVBQUUsT0FBTyxRQUF5QixDQUFBO0lBQzdDLElBQU0sV0FBVyxHQUFHO1FBQ2xCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2hCLENBQUMsQ0FBQTtJQUVELElBQU0sV0FBVyxHQUFHO1FBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQixDQUFDLENBQUE7SUFFRCxPQUFPO1FBQ0wsSUFBSSxNQUFBO1FBQ0osV0FBVyxhQUFBO1FBQ1gsV0FBVyxhQUFBO1FBQ1g7O1dBRUc7UUFDSCxhQUFhLEVBQUU7WUFDYixJQUFJLE1BQUE7WUFDSixXQUFXLGFBQUE7U0FDWjtRQUNELG1CQUFtQixFQUFFO1lBQ25CLE1BQU0sUUFBQTtTQUNQO1FBQ0QsbUJBQW1CLEVBQUU7WUFDbkIsTUFBTSxRQUFBO1lBQ04sYUFBYSxlQUFBO1lBQ2IsV0FBVyxhQUFBO1lBQ1gsYUFBYSxlQUFBO1lBQ2IsaUJBQWlCLG1CQUFBO1NBQ2xCO1FBQ0QsY0FBYyxFQUFFO1lBQ2QsSUFBSSxNQUFBO1lBQ0osT0FBTyxFQUFFLFdBQVc7U0FDOEI7UUFDcEQsY0FBYyxFQUFFO1lBQ2QsT0FBTyxFQUFFLFdBQVc7U0FDcUI7UUFDM0MsV0FBVyxFQUFFO1lBQ1gsT0FBTyxFQUFFLFdBQVc7U0FDckI7S0FDRixDQUFBO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEJ1dHRvblByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgeyBEaWFsb2dQcm9wcyB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBEaWFsb2cgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2cnXG5pbXBvcnQgRGlhbG9nVGl0bGUgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dUaXRsZSdcbmltcG9ydCBEaWFsb2dBY3Rpb25zIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQWN0aW9ucydcbmltcG9ydCBEaWFsb2dDb250ZW50IGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQ29udGVudCdcbmltcG9ydCBEaWFsb2dDb250ZW50VGV4dCBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0NvbnRlbnRUZXh0J1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5leHBvcnQgZnVuY3Rpb24gdXNlRGlhbG9nU3RhdGUoKSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBoYW5kbGVDbGljayA9ICgpID0+IHtcbiAgICBzZXRPcGVuKCFvcGVuKVxuICB9XG5cbiAgY29uc3QgaGFuZGxlQ2xvc2UgPSAoKSA9PiB7XG4gICAgc2V0T3BlbihmYWxzZSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgb3BlbixcbiAgICBoYW5kbGVDbGljayxcbiAgICBoYW5kbGVDbG9zZSxcbiAgICAvKipcbiAgICAgKiBIYW5keSBwcm9wIGJ1bmRsZXMgZm9yIHBhc3NpbmcgdG8gY29tbW9uIGNvbXBvbmVudHNcbiAgICAgKi9cbiAgICBkcm9wZG93blByb3BzOiB7XG4gICAgICBvcGVuLFxuICAgICAgaGFuZGxlQ2xvc2UsXG4gICAgfSxcbiAgICBNdWlCdXR0b25Db21wb25lbnRzOiB7XG4gICAgICBCdXR0b24sXG4gICAgfSxcbiAgICBNdWlEaWFsb2dDb21wb25lbnRzOiB7XG4gICAgICBEaWFsb2csXG4gICAgICBEaWFsb2dDb250ZW50LFxuICAgICAgRGlhbG9nVGl0bGUsXG4gICAgICBEaWFsb2dBY3Rpb25zLFxuICAgICAgRGlhbG9nQ29udGVudFRleHQsXG4gICAgfSxcbiAgICBNdWlEaWFsb2dQcm9wczoge1xuICAgICAgb3BlbixcbiAgICAgIG9uQ2xvc2U6IGhhbmRsZUNsb3NlLFxuICAgIH0gYXMgUmVxdWlyZWQ8UGljazxEaWFsb2dQcm9wcywgJ29wZW4nIHwgJ29uQ2xvc2UnPj4sXG4gICAgTXVpQnV0dG9uUHJvcHM6IHtcbiAgICAgIG9uQ2xpY2s6IGhhbmRsZUNsaWNrLFxuICAgIH0gYXMgUmVxdWlyZWQ8UGljazxCdXR0b25Qcm9wcywgJ29uQ2xpY2snPj4sXG4gICAgYnV0dG9uUHJvcHM6IHtcbiAgICAgIG9uQ2xpY2s6IGhhbmRsZUNsaWNrLFxuICAgIH0sXG4gIH1cbn1cbiJdfQ==