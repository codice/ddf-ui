import { __assign, __read, __spreadArray } from "tslib";
import React, { createContext, useState, useEffect, useMemo } from 'react';
import Button from '@mui/material/Button';
import SnackBar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Portal from '@mui/material/Portal';
var AUTO_DISMISS = 5000;
// Gives the addSnack function the correct type signature
export var SnackBarContext = createContext({});
export function SnackProvider(_a) {
    var children = _a.children;
    var _b = __read(useState([]), 2), snacks = _b[0], setSnacks = _b[1];
    var _c = __read(useState({}), 2), currentSnack = _c[0], setCurrentSnack = _c[1];
    var addSnack = function (message, props) {
        if (props === void 0) { props = {}; }
        var newSnack = __assign({ message: message }, props);
        setSnacks(function (snacks) {
            if (props.id) {
                var snackIndex = snacks.findIndex(function (s) { return s.id === props.id; });
                if (snackIndex >= 0) {
                    snacks.splice(snackIndex, 1);
                }
            }
            return __spreadArray([newSnack], __read(snacks), false);
        });
        var closeSnack = function () {
            setSnacks(function (snacks) { return snacks.filter(function (snack) { return snack !== newSnack; }); });
        };
        return closeSnack;
    };
    // Set current snack to be displayed
    useEffect(function () {
        if (snacks.length > 0) {
            setCurrentSnack(snacks[snacks.length - 1]);
        }
    }, [snacks]);
    // Remove snack after timeout
    useEffect(function () {
        if (currentSnack.message) {
            var timeout = currentSnack.timeout || AUTO_DISMISS;
            var timer_1 = setTimeout(function () {
                removeCurrentSnack();
            }, timeout);
            return function () { return clearTimeout(timer_1); };
        }
        return;
    }, [currentSnack]);
    var handleClose = function (_e, reason) {
        if (reason === 'clickaway' && currentSnack.clickawayCloseable) {
            removeCurrentSnack();
        }
        else if (reason !== 'clickaway' && currentSnack.closeable) {
            removeCurrentSnack();
        }
    };
    var handleUndo = function () {
        currentSnack.undo && currentSnack.undo();
        removeCurrentSnack();
    };
    var removeCurrentSnack = function () {
        setCurrentSnack({});
        setSnacks(function (snacks) { return snacks.slice(0, snacks.length - 1); });
    };
    var value = useMemo(function () { return addSnack; }, []);
    var message = currentSnack.message, status = currentSnack.status, closeable = currentSnack.closeable, undo = currentSnack.undo, snackBarProps = currentSnack.snackBarProps, alertProps = currentSnack.alertProps;
    return (React.createElement(SnackBarContext.Provider, { value: value },
        children,
        message && (React.createElement(Portal, null,
            React.createElement(SnackBar, __assign({ key: message, className: "left-0 bottom-0 p-4 max-w-full", anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'left',
                }, open: true, onClose: handleClose }, snackBarProps),
                React.createElement(Alert, __assign({ style: {
                        minWidth: '18rem',
                        alignItems: 'center',
                    }, action: React.createElement(React.Fragment, null,
                        undo && (React.createElement(Button, { color: "inherit", size: "small", style: { fontSize: '.75rem' }, onClick: handleUndo }, "UNDO")),
                        closeable && (
                        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
                        React.createElement(IconButton, { style: { padding: '3px' }, color: "inherit", onClick: handleClose, size: "large" },
                            React.createElement(CloseIcon, { fontSize: "small" })))), severity: status }, alertProps), message))))));
}
//# sourceMappingURL=snack.provider.js.map