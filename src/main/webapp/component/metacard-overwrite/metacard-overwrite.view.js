/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import { __assign, __makeTemplateObject, __read } from "tslib";
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'drop... Remove this comment to see the full error message
import Dropzone from 'dropzone';
import OverwritesInstance from '../singletons/overwrites-instance';
import React from 'react';
import styled from 'styled-components';
import { readableColor } from 'polished';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import { useDialog } from '../dialog';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  overflow: auto;\n  white-space: nowrap;\n  height: 100%;\n"], ["\n  overflow: auto;\n  white-space: nowrap;\n  height: 100%;\n"])));
var OverwriteStatus = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  display: inline-block;\n  white-space: normal;\n  vertical-align: top !important;\n  width: 100%;\n  transform: translateX(0%);\n  transition: transform ", " linear;\n  text-align: center;\n  position: relative;\n  padding: 10px;\n"], ["\n  display: inline-block;\n  white-space: normal;\n  vertical-align: top !important;\n  width: 100%;\n  transform: translateX(0%);\n  transition: transform ", " linear;\n  text-align: center;\n  position: relative;\n  padding: 10px;\n"])), function (props) { return props.theme.coreTransitionTime; });
var OverwriteProgress = styled(OverwriteStatus)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  line-height: ", ";\n"], ["\n  line-height: ", ";\n"])), function (props) { return props.theme.minimumButtonSize; });
var ProgressText = styled.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  padding: 10px;\n  top: 0px;\n  left: 0px;\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  z-index: 1;\n  font-size: ", ";\n  color: ", ";\n"], ["\n  padding: 10px;\n  top: 0px;\n  left: 0px;\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  z-index: 1;\n  font-size: ", ";\n  color: ", ";\n"])), function (props) { return props.theme.largeFontSize; }, function (props) { return readableColor(props.theme.backgroundContent); });
var ProgressTextUnder = styled.div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  font-size: ", ";\n  visibility: hidden;\n"], ["\n  font-size: ", ";\n  visibility: hidden;\n"])), function (props) { return props.theme.largeFontSize; });
var ProgressInfo = styled.div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  font-size: ", ";\n  color: ", ";\n"], ["\n  font-size: ", ";\n  color: ", ";\n"])), function (props) { return props.theme.mediumFontSize; }, function (props) { return readableColor(props.theme.backgroundContent); });
var ProgressBar = styled.div(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  z-index: 0;\n  top: 0px;\n  left: 0px;\n  position: absolute;\n  width: 0%;\n  height: 100%;\n  background: ", ";\n  transition: width ", " linear;\n"], ["\n  z-index: 0;\n  top: 0px;\n  left: 0px;\n  position: absolute;\n  width: 0%;\n  height: 100%;\n  background: ", ";\n  transition: width ", " linear;\n"])), function (props) { return props.theme.positiveColor; }, function (props) { return props.theme.coreTransitionTime; });
var OverwriteSuccess = styled(OverwriteStatus)(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n  color: ", ";\n  background: ", ";\n  font-size: ", ";\n  overflow-wrap: break-word;\n  width: 50em;\n"], ["\n  color: ", ";\n  background: ", ";\n  font-size: ", ";\n  overflow-wrap: break-word;\n  width: 50em;\n"])), function (props) { return readableColor(props.theme.positiveColor); }, function (props) { return props.theme.positiveColor; }, function (props) { return props.theme.mediumFontSize; });
var OverwriteError = styled(OverwriteStatus)(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n  color: ", ";\n  background: ", ";\n  font-size: ", ";\n  overflow-wrap: break-word;\n  width: 50em;\n"], ["\n  color: ", ";\n  background: ", ";\n  font-size: ", ";\n  overflow-wrap: break-word;\n  width: 50em;\n"])), function (props) { return readableColor(props.theme.negativeColor); }, function (props) { return props.theme.negativeColor; }, function (props) { return props.theme.mediumFontSize; });
var ResultMessage = styled.div(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n  font-size: ", ";\n  margin-left: ", ";\n"], ["\n  font-size: ", ";\n  margin-left: ", ";\n"])), function (props) { return props.theme.largeFontSize; }, function (props) { return props.theme.minimumButtonSize; });
var Sending = function (props) { return (React.createElement(OverwriteProgress, null,
    React.createElement(ProgressTextUnder, null,
        "Uploading File",
        React.createElement("div", null,
            props.percentage,
            "%"),
        React.createElement(ProgressInfo, null, "If you leave this view, the overwrite will still continue.")),
    React.createElement(ProgressText, null,
        "Uploading File",
        React.createElement("div", null,
            Math.floor(props.percentage),
            "%"),
        React.createElement(ProgressInfo, null, "If you leave this view, the overwrite will still continue.")),
    React.createElement(ProgressBar, { style: { width: "".concat(props.percentage, "%") } }))); };
var Success = function (props) { return (React.createElement(OverwriteSuccess, null,
    React.createElement(ResultMessage, null, props.message))); };
var Error = function (props) { return (React.createElement(OverwriteError, null,
    React.createElement(ResultMessage, null, props.message))); };
var Stages = {
    Sending: Sending,
    Success: Success,
    Error: Error,
};
var defaultState = {
    stage: '',
    percentage: 0,
    message: '',
};
var mapOverwriteModelToState = function (overwriteModel) {
    var currentState = {};
    if (overwriteModel.get('success')) {
        currentState.stage = 'Success';
    }
    else if (overwriteModel.get('error')) {
        currentState.stage = 'Error';
    }
    else if (overwriteModel.get('sending')) {
        currentState.stage = 'Sending';
    }
    else {
        currentState.stage = '';
    }
    currentState.percentage = overwriteModel.get('percentage');
    currentState.message = overwriteModel.escape('message');
    return currentState;
};
var getOverwriteModel = function (_a) {
    var lazyResult = _a.lazyResult;
    if (!lazyResult) {
        return;
    }
    return OverwritesInstance.get(lazyResult.plain.id);
};
export var MetacardOverwrite = function (_a) {
    var title = _a.title, lazyResult = _a.lazyResult;
    var dialogContext = useDialog();
    var _b = __read(React.useState(null), 2), overwriteModel = _b[0], setOverwriteModel = _b[1];
    var _c = __read(React.useState(null), 2), dropzone = _c[0], setDropzone = _c[1];
    var _d = __read(React.useState(null), 2), dropzoneElement = _d[0], setDropdownElement = _d[1];
    var _e = useBackbone(), listenTo = _e.listenTo, stopListening = _e.stopListening;
    var _f = __read(React.useState(defaultState), 2), state = _f[0], setState = _f[1];
    React.useEffect(function () {
        return function () {
            OverwritesInstance.removeIfUnused(lazyResult === null || lazyResult === void 0 ? void 0 : lazyResult.plain.id);
        };
    }, []);
    React.useEffect(function () {
        if (lazyResult && dropzoneElement) {
            var overrides_1 = {
                'security.access-administrators': lazyResult.plain.metacard.properties['security.access-administrators'] || [],
                'security.access-groups': lazyResult.plain.metacard.properties['security.access-groups'] || [],
                'security.access-groups-read': lazyResult.plain.metacard.properties['security.access-groups-read'] ||
                    [],
                'security.access-individuals': lazyResult.plain.metacard.properties['security.access-individuals'] ||
                    [],
                'security.access-individuals-read': lazyResult.plain.metacard.properties['security.access-individuals-read'] || [],
            };
            setDropzone(new Dropzone(dropzoneElement, {
                paramName: 'parse.resource',
                url: './internal/catalog/' + lazyResult.plain.id,
                maxFilesize: 5000000,
                method: 'put',
                sending: function (_file, _xhr, formData) {
                    Object.keys(overrides_1).forEach(function (attribute) {
                        overrides_1[attribute].forEach(function (value) {
                            formData.append('parse.' + attribute, value);
                        });
                    });
                },
            }));
        }
    }, [dropzoneElement, lazyResult]);
    React.useEffect(function () {
        if (dropzone && lazyResult) {
            if (!getOverwriteModel({ lazyResult: lazyResult })) {
                OverwritesInstance.add({
                    id: lazyResult === null || lazyResult === void 0 ? void 0 : lazyResult.plain.id,
                    dropzone: dropzone,
                    result: lazyResult,
                });
            }
            setOverwriteModel(getOverwriteModel({ lazyResult: lazyResult }));
        }
    }, [dropzone, lazyResult]);
    React.useEffect(function () {
        if (overwriteModel) {
            setState(mapOverwriteModelToState(overwriteModel));
            var callback_1 = function () {
                setState(mapOverwriteModelToState(overwriteModel));
            };
            var eventString_1 = 'change:percentage change:sending change:error change:success';
            listenTo(overwriteModel, eventString_1, callback_1);
            return function () {
                if (overwriteModel) {
                    stopListening(overwriteModel, eventString_1, callback_1);
                }
            };
        }
        return function () { };
    }, [overwriteModel]);
    var startOver = function () {
        OverwritesInstance.remove(lazyResult === null || lazyResult === void 0 ? void 0 : lazyResult.plain.id);
        OverwritesInstance.add({
            id: lazyResult === null || lazyResult === void 0 ? void 0 : lazyResult.plain.id,
            dropzone: dropzone,
            result: lazyResult,
        });
        setOverwriteModel(getOverwriteModel({ lazyResult: lazyResult }));
        setState(defaultState);
    };
    var Component = Stages[state.stage];
    return (React.createElement(Root, null,
        React.createElement("div", { style: { display: 'none' }, ref: setDropdownElement }),
        React.createElement(DialogTitle, null, title),
        React.createElement(DialogContent, { style: { width: '50em' } },
            "Are you sure you want to overwrite the content?",
            React.createElement("br", null),
            "WARNING: This will completely overwrite the current content and metadata."),
        Component && React.createElement(Component, __assign({}, state)),
        React.createElement(DialogActions, null,
            React.createElement(Button, { onClick: function () {
                    dialogContext.setProps({ open: false });
                    startOver();
                } }, "Cancel"),
            React.createElement(Button, { onClick: function () {
                    dropzoneElement === null || dropzoneElement === void 0 ? void 0 : dropzoneElement.click();
                    startOver();
                } }, "Overwrite"))));
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10;
//# sourceMappingURL=metacard-overwrite.view.js.map