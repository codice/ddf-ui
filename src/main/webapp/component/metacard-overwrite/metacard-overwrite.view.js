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
    var title = _a.title, lazyResult = _a.lazyResult, overwriteUrl = _a.overwriteUrl;
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
                url: (overwriteUrl ? overwriteUrl : './internal/catalog/') +
                    lazyResult.plain.id,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWNhcmQtb3ZlcndyaXRlLnZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L21ldGFjYXJkLW92ZXJ3cml0ZS9tZXRhY2FyZC1vdmVyd3JpdGUudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTs7QUFFSixtSkFBbUo7QUFDbkosT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sa0JBQWtCLE1BQU0sbUNBQW1DLENBQUE7QUFDbEUsT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sTUFBTSxNQUFNLG1CQUFtQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFDeEMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxXQUFXLE1BQU0sMkJBQTJCLENBQUE7QUFDbkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFHdkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFBO0FBQ3BFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFFckMsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsbUlBQUEsZ0VBSXRCLElBQUEsQ0FBQTtBQUVELElBQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxHQUFHLGdUQUFBLCtKQU1SLEVBQXlDLDRFQUlsRSxLQUp5QixVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQTlCLENBQThCLENBSWxFLENBQUE7QUFFRCxJQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsNkZBQUEsbUJBQ2hDLEVBQXdDLEtBQ3hELEtBRGdCLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBN0IsQ0FBNkIsQ0FDeEQsQ0FBQTtBQUVELElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxHQUFHLCtOQUFBLHFJQVFoQixFQUFvQyxjQUN4QyxFQUF1RCxLQUNqRSxLQUZjLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQXpCLENBQXlCLEVBQ3hDLFVBQUMsS0FBSyxJQUFLLE9BQUEsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBNUMsQ0FBNEMsQ0FDakUsQ0FBQTtBQUVELElBQU0saUJBQWlCLEdBQUcsTUFBTSxDQUFDLEdBQUcsa0hBQUEsaUJBQ3JCLEVBQW9DLDRCQUVsRCxLQUZjLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQXpCLENBQXlCLENBRWxELENBQUE7QUFFRCxJQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsR0FBRywyR0FBQSxpQkFDaEIsRUFBcUMsY0FDekMsRUFBdUQsS0FDakUsS0FGYyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUExQixDQUEwQixFQUN6QyxVQUFDLEtBQUssSUFBSyxPQUFBLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEVBQTVDLENBQTRDLENBQ2pFLENBQUE7QUFFRCxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsR0FBRyw4TkFBQSxrSEFPZCxFQUFvQyx5QkFDOUIsRUFBeUMsWUFDOUQsS0FGZSxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUF6QixDQUF5QixFQUM5QixVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQTlCLENBQThCLENBQzlELENBQUE7QUFFRCxJQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsOEtBQUEsYUFDckMsRUFBbUQsbUJBQzlDLEVBQW9DLGtCQUNyQyxFQUFxQyxtREFHbkQsS0FMVSxVQUFDLEtBQUssSUFBSyxPQUFBLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxFQUF4QyxDQUF3QyxFQUM5QyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUF6QixDQUF5QixFQUNyQyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUExQixDQUEwQixDQUduRCxDQUFBO0FBRUQsSUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyw4S0FBQSxhQUNuQyxFQUFtRCxtQkFDOUMsRUFBb0Msa0JBQ3JDLEVBQXFDLG1EQUduRCxLQUxVLFVBQUMsS0FBSyxJQUFLLE9BQUEsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEVBQXhDLENBQXdDLEVBQzlDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQXpCLENBQXlCLEVBQ3JDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLENBR25ELENBQUE7QUFFRCxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsR0FBRyxtSEFBQSxpQkFDakIsRUFBb0Msb0JBQ2xDLEVBQXdDLEtBQ3hELEtBRmMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGFBQWEsRUFBekIsQ0FBeUIsRUFDbEMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLGlCQUFpQixFQUE3QixDQUE2QixDQUN4RCxDQUFBO0FBRUQsSUFBTSxPQUFPLEdBQUcsVUFBQyxLQUFVLElBQUssT0FBQSxDQUM5QixvQkFBQyxpQkFBaUI7SUFDaEIsb0JBQUMsaUJBQWlCOztRQUVoQjtZQUFNLEtBQUssQ0FBQyxVQUFVO2dCQUFRO1FBQzlCLG9CQUFDLFlBQVkscUVBRUUsQ0FDRztJQUNwQixvQkFBQyxZQUFZOztRQUVYO1lBQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO2dCQUFRO1FBQzFDLG9CQUFDLFlBQVkscUVBRUUsQ0FDRjtJQUNmLG9CQUFDLFdBQVcsSUFBQyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsVUFBRyxLQUFLLENBQUMsVUFBVSxNQUFHLEVBQUUsR0FBSSxDQUN2QyxDQUNyQixFQWxCK0IsQ0FrQi9CLENBQUE7QUFFRCxJQUFNLE9BQU8sR0FBRyxVQUFDLEtBQVUsSUFBSyxPQUFBLENBQzlCLG9CQUFDLGdCQUFnQjtJQUNmLG9CQUFDLGFBQWEsUUFBRSxLQUFLLENBQUMsT0FBTyxDQUFpQixDQUM3QixDQUNwQixFQUorQixDQUkvQixDQUFBO0FBRUQsSUFBTSxLQUFLLEdBQUcsVUFBQyxLQUFVLElBQUssT0FBQSxDQUM1QixvQkFBQyxjQUFjO0lBQ2Isb0JBQUMsYUFBYSxRQUFFLEtBQUssQ0FBQyxPQUFPLENBQWlCLENBQy9CLENBQ2xCLEVBSjZCLENBSTdCLENBQUE7QUFFRCxJQUFNLE1BQU0sR0FBRztJQUNiLE9BQU8sU0FBQTtJQUNQLE9BQU8sU0FBQTtJQUNQLEtBQUssT0FBQTtDQUdOLENBQUE7QUFFRCxJQUFNLFlBQVksR0FBRztJQUNuQixLQUFLLEVBQUUsRUFBRTtJQUNULFVBQVUsRUFBRSxDQUFDO0lBQ2IsT0FBTyxFQUFFLEVBQUU7Q0FDWixDQUFBO0FBRUQsSUFBTSx3QkFBd0IsR0FBRyxVQUFDLGNBQW1CO0lBQ25ELElBQU0sWUFBWSxHQUFHLEVBQVMsQ0FBQTtJQUM5QixJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDakMsWUFBWSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUE7S0FDL0I7U0FBTSxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFDdEMsWUFBWSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUE7S0FDN0I7U0FBTSxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUU7UUFDeEMsWUFBWSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUE7S0FDL0I7U0FBTTtRQUNMLFlBQVksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFBO0tBQ3hCO0lBQ0QsWUFBWSxDQUFDLFVBQVUsR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQzFELFlBQVksQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUV2RCxPQUFPLFlBQVksQ0FBQTtBQUNyQixDQUFDLENBQUE7QUFFRCxJQUFNLGlCQUFpQixHQUFHLFVBQUMsRUFBK0M7UUFBN0MsVUFBVSxnQkFBQTtJQUNyQyxJQUFJLENBQUMsVUFBVSxFQUFFO1FBQ2YsT0FBTTtLQUNQO0lBQ0QsT0FBTyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQTtBQUNwRCxDQUFDLENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLEVBUWpDO1FBUEMsS0FBSyxXQUFBLEVBQ0wsVUFBVSxnQkFBQSxFQUNWLFlBQVksa0JBQUE7SUFNWixJQUFNLGFBQWEsR0FBRyxTQUFTLEVBQUUsQ0FBQTtJQUMzQixJQUFBLEtBQUEsT0FBc0MsS0FBSyxDQUFDLFFBQVEsQ0FBTSxJQUFJLENBQUMsSUFBQSxFQUE5RCxjQUFjLFFBQUEsRUFBRSxpQkFBaUIsUUFBNkIsQ0FBQTtJQUMvRCxJQUFBLEtBQUEsT0FBMEIsS0FBSyxDQUFDLFFBQVEsQ0FBTSxJQUFJLENBQUMsSUFBQSxFQUFsRCxRQUFRLFFBQUEsRUFBRSxXQUFXLFFBQTZCLENBQUE7SUFDbkQsSUFBQSxLQUFBLE9BQ0osS0FBSyxDQUFDLFFBQVEsQ0FBd0IsSUFBSSxDQUFDLElBQUEsRUFEdEMsZUFBZSxRQUFBLEVBQUUsa0JBQWtCLFFBQ0csQ0FBQTtJQUN2QyxJQUFBLEtBQThCLFdBQVcsRUFBRSxFQUF6QyxRQUFRLGNBQUEsRUFBRSxhQUFhLG1CQUFrQixDQUFBO0lBQzNDLElBQUEsS0FBQSxPQUFvQixLQUFLLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFBLEVBQS9DLEtBQUssUUFBQSxFQUFFLFFBQVEsUUFBZ0MsQ0FBQTtJQUV0RCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsT0FBTztZQUNMLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxVQUFVLGFBQVYsVUFBVSx1QkFBVixVQUFVLENBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3pELENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUVOLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFVBQVUsSUFBSSxlQUFlLEVBQUU7WUFDakMsSUFBTSxXQUFTLEdBQUc7Z0JBQ2hCLGdDQUFnQyxFQUM5QixVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQ2xDLGdDQUFnQyxDQUNqQyxJQUFJLEVBQUU7Z0JBQ1Qsd0JBQXdCLEVBQ3RCLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3RFLDZCQUE2QixFQUMzQixVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsNkJBQTZCLENBQUM7b0JBQ25FLEVBQUU7Z0JBQ0osNkJBQTZCLEVBQzNCLFVBQVUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyw2QkFBNkIsQ0FBQztvQkFDbkUsRUFBRTtnQkFDSixrQ0FBa0MsRUFDaEMsVUFBVSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUNsQyxrQ0FBa0MsQ0FDbkMsSUFBSSxFQUFFO2FBR1YsQ0FBQTtZQUNELFdBQVcsQ0FDVCxJQUFJLFFBQVEsQ0FBQyxlQUFlLEVBQUU7Z0JBQzVCLFNBQVMsRUFBRSxnQkFBZ0I7Z0JBQzNCLEdBQUcsRUFDRCxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDckQsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNyQixXQUFXLEVBQUUsT0FBTztnQkFDcEIsTUFBTSxFQUFFLEtBQUs7Z0JBQ2IsT0FBTyxZQUFDLEtBQVUsRUFBRSxJQUFTLEVBQUUsUUFBYTtvQkFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQyxTQUFTO3dCQUN2QyxXQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBVTs0QkFDdEMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFBO3dCQUM5QyxDQUFDLENBQUMsQ0FBQTtvQkFDSixDQUFDLENBQUMsQ0FBQTtnQkFDSixDQUFDO2FBQ0YsQ0FBQyxDQUNILENBQUE7U0FDRjtJQUNILENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFBO0lBRWpDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLFFBQVEsSUFBSSxVQUFVLEVBQUU7WUFDMUIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsVUFBVSxZQUFBLEVBQUUsQ0FBQyxFQUFFO2dCQUN0QyxrQkFBa0IsQ0FBQyxHQUFHLENBQUM7b0JBQ3JCLEVBQUUsRUFBRSxVQUFVLGFBQVYsVUFBVSx1QkFBVixVQUFVLENBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQ3hCLFFBQVEsRUFBRSxRQUFRO29CQUNsQixNQUFNLEVBQUUsVUFBVTtpQkFDbkIsQ0FBQyxDQUFBO2FBQ0g7WUFDRCxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFBO1NBQ3JEO0lBQ0gsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUE7SUFFMUIsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQUksY0FBYyxFQUFFO1lBQ2xCLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO1lBQ2xELElBQU0sVUFBUSxHQUFHO2dCQUNmLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO1lBQ3BELENBQUMsQ0FBQTtZQUNELElBQU0sYUFBVyxHQUNmLDhEQUE4RCxDQUFBO1lBQ2hFLFFBQVEsQ0FBQyxjQUFjLEVBQUUsYUFBVyxFQUFFLFVBQVEsQ0FBQyxDQUFBO1lBQy9DLE9BQU87Z0JBQ0wsSUFBSSxjQUFjLEVBQUU7b0JBQ2xCLGFBQWEsQ0FBQyxjQUFjLEVBQUUsYUFBVyxFQUFFLFVBQVEsQ0FBQyxDQUFBO2lCQUNyRDtZQUNILENBQUMsQ0FBQTtTQUNGO1FBQ0QsT0FBTyxjQUFPLENBQUMsQ0FBQTtJQUNqQixDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFBO0lBRXBCLElBQU0sU0FBUyxHQUFHO1FBQ2hCLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxVQUFVLGFBQVYsVUFBVSx1QkFBVixVQUFVLENBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQy9DLGtCQUFrQixDQUFDLEdBQUcsQ0FBQztZQUNyQixFQUFFLEVBQUUsVUFBVSxhQUFWLFVBQVUsdUJBQVYsVUFBVSxDQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLE1BQU0sRUFBRSxVQUFVO1NBQ25CLENBQUMsQ0FBQTtRQUNGLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLEVBQUUsVUFBVSxZQUFBLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDcEQsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFBO0lBQ3hCLENBQUMsQ0FBQTtJQUNELElBQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDckMsT0FBTyxDQUNMLG9CQUFDLElBQUk7UUFDSCw2QkFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLGtCQUFrQixHQUFJO1FBQzVELG9CQUFDLFdBQVcsUUFBRSxLQUFLLENBQWU7UUFDbEMsb0JBQUMsYUFBYSxJQUFDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7O1lBRXJDLCtCQUFNO3dGQUdRO1FBRWYsU0FBUyxJQUFJLG9CQUFDLFNBQVMsZUFBSyxLQUFLLEVBQUk7UUFFdEMsb0JBQUMsYUFBYTtZQUNaLG9CQUFDLE1BQU0sSUFDTCxPQUFPLEVBQUU7b0JBQ1AsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFBO29CQUN2QyxTQUFTLEVBQUUsQ0FBQTtnQkFDYixDQUFDLGFBR007WUFDVCxvQkFBQyxNQUFNLElBQ0wsT0FBTyxFQUFFO29CQUNQLGVBQWUsYUFBZixlQUFlLHVCQUFmLGVBQWUsQ0FBRSxLQUFLLEVBQUUsQ0FBQTtvQkFDeEIsU0FBUyxFQUFFLENBQUE7Z0JBQ2IsQ0FBQyxnQkFHTSxDQUNLLENBQ1gsQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Ryb3AuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IERyb3B6b25lIGZyb20gJ2Ryb3B6b25lJ1xuaW1wb3J0IE92ZXJ3cml0ZXNJbnN0YW5jZSBmcm9tICcuLi9zaW5nbGV0b25zL292ZXJ3cml0ZXMtaW5zdGFuY2UnXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IHsgcmVhZGFibGVDb2xvciB9IGZyb20gJ3BvbGlzaGVkJ1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBEaWFsb2dBY3Rpb25zIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGlhbG9nQWN0aW9ucydcbmltcG9ydCBEaWFsb2dUaXRsZSBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ1RpdGxlJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnQgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dDb250ZW50J1xuXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IHVzZURpYWxvZyB9IGZyb20gJy4uL2RpYWxvZydcblxuY29uc3QgUm9vdCA9IHN0eWxlZC5kaXZgXG4gIG92ZXJmbG93OiBhdXRvO1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICBoZWlnaHQ6IDEwMCU7XG5gXG5cbmNvbnN0IE92ZXJ3cml0ZVN0YXR1cyA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgd2hpdGUtc3BhY2U6IG5vcm1hbDtcbiAgdmVydGljYWwtYWxpZ246IHRvcCAhaW1wb3J0YW50O1xuICB3aWR0aDogMTAwJTtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVYKDAlKTtcbiAgdHJhbnNpdGlvbjogdHJhbnNmb3JtICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5jb3JlVHJhbnNpdGlvblRpbWV9IGxpbmVhcjtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHBhZGRpbmc6IDEwcHg7XG5gXG5cbmNvbnN0IE92ZXJ3cml0ZVByb2dyZXNzID0gc3R5bGVkKE92ZXJ3cml0ZVN0YXR1cylgXG4gIGxpbmUtaGVpZ2h0OiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWluaW11bUJ1dHRvblNpemV9O1xuYFxuXG5jb25zdCBQcm9ncmVzc1RleHQgPSBzdHlsZWQuZGl2YFxuICBwYWRkaW5nOiAxMHB4O1xuICB0b3A6IDBweDtcbiAgbGVmdDogMHB4O1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIHotaW5kZXg6IDE7XG4gIGZvbnQtc2l6ZTogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLmxhcmdlRm9udFNpemV9O1xuICBjb2xvcjogJHsocHJvcHMpID0+IHJlYWRhYmxlQ29sb3IocHJvcHMudGhlbWUuYmFja2dyb3VuZENvbnRlbnQpfTtcbmBcblxuY29uc3QgUHJvZ3Jlc3NUZXh0VW5kZXIgPSBzdHlsZWQuZGl2YFxuICBmb250LXNpemU6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5sYXJnZUZvbnRTaXplfTtcbiAgdmlzaWJpbGl0eTogaGlkZGVuO1xuYFxuXG5jb25zdCBQcm9ncmVzc0luZm8gPSBzdHlsZWQuZGl2YFxuICBmb250LXNpemU6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5tZWRpdW1Gb250U2l6ZX07XG4gIGNvbG9yOiAkeyhwcm9wcykgPT4gcmVhZGFibGVDb2xvcihwcm9wcy50aGVtZS5iYWNrZ3JvdW5kQ29udGVudCl9O1xuYFxuXG5jb25zdCBQcm9ncmVzc0JhciA9IHN0eWxlZC5kaXZgXG4gIHotaW5kZXg6IDA7XG4gIHRvcDogMHB4O1xuICBsZWZ0OiAwcHg7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgd2lkdGg6IDAlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGJhY2tncm91bmQ6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5wb3NpdGl2ZUNvbG9yfTtcbiAgdHJhbnNpdGlvbjogd2lkdGggJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLmNvcmVUcmFuc2l0aW9uVGltZX0gbGluZWFyO1xuYFxuXG5jb25zdCBPdmVyd3JpdGVTdWNjZXNzID0gc3R5bGVkKE92ZXJ3cml0ZVN0YXR1cylgXG4gIGNvbG9yOiAkeyhwcm9wcykgPT4gcmVhZGFibGVDb2xvcihwcm9wcy50aGVtZS5wb3NpdGl2ZUNvbG9yKX07XG4gIGJhY2tncm91bmQ6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5wb3NpdGl2ZUNvbG9yfTtcbiAgZm9udC1zaXplOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWVkaXVtRm9udFNpemV9O1xuICBvdmVyZmxvdy13cmFwOiBicmVhay13b3JkO1xuICB3aWR0aDogNTBlbTtcbmBcblxuY29uc3QgT3ZlcndyaXRlRXJyb3IgPSBzdHlsZWQoT3ZlcndyaXRlU3RhdHVzKWBcbiAgY29sb3I6ICR7KHByb3BzKSA9PiByZWFkYWJsZUNvbG9yKHByb3BzLnRoZW1lLm5lZ2F0aXZlQ29sb3IpfTtcbiAgYmFja2dyb3VuZDogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm5lZ2F0aXZlQ29sb3J9O1xuICBmb250LXNpemU6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5tZWRpdW1Gb250U2l6ZX07XG4gIG92ZXJmbG93LXdyYXA6IGJyZWFrLXdvcmQ7XG4gIHdpZHRoOiA1MGVtO1xuYFxuXG5jb25zdCBSZXN1bHRNZXNzYWdlID0gc3R5bGVkLmRpdmBcbiAgZm9udC1zaXplOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubGFyZ2VGb250U2l6ZX07XG4gIG1hcmdpbi1sZWZ0OiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWluaW11bUJ1dHRvblNpemV9O1xuYFxuXG5jb25zdCBTZW5kaW5nID0gKHByb3BzOiBhbnkpID0+IChcbiAgPE92ZXJ3cml0ZVByb2dyZXNzPlxuICAgIDxQcm9ncmVzc1RleHRVbmRlcj5cbiAgICAgIFVwbG9hZGluZyBGaWxlXG4gICAgICA8ZGl2Pntwcm9wcy5wZXJjZW50YWdlfSU8L2Rpdj5cbiAgICAgIDxQcm9ncmVzc0luZm8+XG4gICAgICAgIElmIHlvdSBsZWF2ZSB0aGlzIHZpZXcsIHRoZSBvdmVyd3JpdGUgd2lsbCBzdGlsbCBjb250aW51ZS5cbiAgICAgIDwvUHJvZ3Jlc3NJbmZvPlxuICAgIDwvUHJvZ3Jlc3NUZXh0VW5kZXI+XG4gICAgPFByb2dyZXNzVGV4dD5cbiAgICAgIFVwbG9hZGluZyBGaWxlXG4gICAgICA8ZGl2PntNYXRoLmZsb29yKHByb3BzLnBlcmNlbnRhZ2UpfSU8L2Rpdj5cbiAgICAgIDxQcm9ncmVzc0luZm8+XG4gICAgICAgIElmIHlvdSBsZWF2ZSB0aGlzIHZpZXcsIHRoZSBvdmVyd3JpdGUgd2lsbCBzdGlsbCBjb250aW51ZS5cbiAgICAgIDwvUHJvZ3Jlc3NJbmZvPlxuICAgIDwvUHJvZ3Jlc3NUZXh0PlxuICAgIDxQcm9ncmVzc0JhciBzdHlsZT17eyB3aWR0aDogYCR7cHJvcHMucGVyY2VudGFnZX0lYCB9fSAvPlxuICA8L092ZXJ3cml0ZVByb2dyZXNzPlxuKVxuXG5jb25zdCBTdWNjZXNzID0gKHByb3BzOiBhbnkpID0+IChcbiAgPE92ZXJ3cml0ZVN1Y2Nlc3M+XG4gICAgPFJlc3VsdE1lc3NhZ2U+e3Byb3BzLm1lc3NhZ2V9PC9SZXN1bHRNZXNzYWdlPlxuICA8L092ZXJ3cml0ZVN1Y2Nlc3M+XG4pXG5cbmNvbnN0IEVycm9yID0gKHByb3BzOiBhbnkpID0+IChcbiAgPE92ZXJ3cml0ZUVycm9yPlxuICAgIDxSZXN1bHRNZXNzYWdlPntwcm9wcy5tZXNzYWdlfTwvUmVzdWx0TWVzc2FnZT5cbiAgPC9PdmVyd3JpdGVFcnJvcj5cbilcblxuY29uc3QgU3RhZ2VzID0ge1xuICBTZW5kaW5nLFxuICBTdWNjZXNzLFxuICBFcnJvcixcbn0gYXMge1xuICBba2V5OiBzdHJpbmddOiBhbnlcbn1cblxuY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICBzdGFnZTogJycsXG4gIHBlcmNlbnRhZ2U6IDAsXG4gIG1lc3NhZ2U6ICcnLFxufVxuXG5jb25zdCBtYXBPdmVyd3JpdGVNb2RlbFRvU3RhdGUgPSAob3ZlcndyaXRlTW9kZWw6IGFueSkgPT4ge1xuICBjb25zdCBjdXJyZW50U3RhdGUgPSB7fSBhcyBhbnlcbiAgaWYgKG92ZXJ3cml0ZU1vZGVsLmdldCgnc3VjY2VzcycpKSB7XG4gICAgY3VycmVudFN0YXRlLnN0YWdlID0gJ1N1Y2Nlc3MnXG4gIH0gZWxzZSBpZiAob3ZlcndyaXRlTW9kZWwuZ2V0KCdlcnJvcicpKSB7XG4gICAgY3VycmVudFN0YXRlLnN0YWdlID0gJ0Vycm9yJ1xuICB9IGVsc2UgaWYgKG92ZXJ3cml0ZU1vZGVsLmdldCgnc2VuZGluZycpKSB7XG4gICAgY3VycmVudFN0YXRlLnN0YWdlID0gJ1NlbmRpbmcnXG4gIH0gZWxzZSB7XG4gICAgY3VycmVudFN0YXRlLnN0YWdlID0gJydcbiAgfVxuICBjdXJyZW50U3RhdGUucGVyY2VudGFnZSA9IG92ZXJ3cml0ZU1vZGVsLmdldCgncGVyY2VudGFnZScpXG4gIGN1cnJlbnRTdGF0ZS5tZXNzYWdlID0gb3ZlcndyaXRlTW9kZWwuZXNjYXBlKCdtZXNzYWdlJylcblxuICByZXR1cm4gY3VycmVudFN0YXRlXG59XG5cbmNvbnN0IGdldE92ZXJ3cml0ZU1vZGVsID0gKHsgbGF6eVJlc3VsdCB9OiB7IGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdCB9KSA9PiB7XG4gIGlmICghbGF6eVJlc3VsdCkge1xuICAgIHJldHVyblxuICB9XG4gIHJldHVybiBPdmVyd3JpdGVzSW5zdGFuY2UuZ2V0KGxhenlSZXN1bHQucGxhaW4uaWQpXG59XG5cbmV4cG9ydCBjb25zdCBNZXRhY2FyZE92ZXJ3cml0ZSA9ICh7XG4gIHRpdGxlLFxuICBsYXp5UmVzdWx0LFxuICBvdmVyd3JpdGVVcmwsXG59OiB7XG4gIHRpdGxlOiBzdHJpbmdcbiAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gIG92ZXJ3cml0ZVVybD86IHN0cmluZ1xufSkgPT4ge1xuICBjb25zdCBkaWFsb2dDb250ZXh0ID0gdXNlRGlhbG9nKClcbiAgY29uc3QgW292ZXJ3cml0ZU1vZGVsLCBzZXRPdmVyd3JpdGVNb2RlbF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG4gIGNvbnN0IFtkcm9wem9uZSwgc2V0RHJvcHpvbmVdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuICBjb25zdCBbZHJvcHpvbmVFbGVtZW50LCBzZXREcm9wZG93bkVsZW1lbnRdID1cbiAgICBSZWFjdC51c2VTdGF0ZTxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IHsgbGlzdGVuVG8sIHN0b3BMaXN0ZW5pbmcgfSA9IHVzZUJhY2tib25lKClcbiAgY29uc3QgW3N0YXRlLCBzZXRTdGF0ZV0gPSBSZWFjdC51c2VTdGF0ZShkZWZhdWx0U3RhdGUpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgT3ZlcndyaXRlc0luc3RhbmNlLnJlbW92ZUlmVW51c2VkKGxhenlSZXN1bHQ/LnBsYWluLmlkKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobGF6eVJlc3VsdCAmJiBkcm9wem9uZUVsZW1lbnQpIHtcbiAgICAgIGNvbnN0IG92ZXJyaWRlcyA9IHtcbiAgICAgICAgJ3NlY3VyaXR5LmFjY2Vzcy1hZG1pbmlzdHJhdG9ycyc6XG4gICAgICAgICAgbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW1xuICAgICAgICAgICAgJ3NlY3VyaXR5LmFjY2Vzcy1hZG1pbmlzdHJhdG9ycydcbiAgICAgICAgICBdIHx8IFtdLFxuICAgICAgICAnc2VjdXJpdHkuYWNjZXNzLWdyb3Vwcyc6XG4gICAgICAgICAgbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydzZWN1cml0eS5hY2Nlc3MtZ3JvdXBzJ10gfHwgW10sXG4gICAgICAgICdzZWN1cml0eS5hY2Nlc3MtZ3JvdXBzLXJlYWQnOlxuICAgICAgICAgIGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc2VjdXJpdHkuYWNjZXNzLWdyb3Vwcy1yZWFkJ10gfHxcbiAgICAgICAgICBbXSxcbiAgICAgICAgJ3NlY3VyaXR5LmFjY2Vzcy1pbmRpdmlkdWFscyc6XG4gICAgICAgICAgbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydzZWN1cml0eS5hY2Nlc3MtaW5kaXZpZHVhbHMnXSB8fFxuICAgICAgICAgIFtdLFxuICAgICAgICAnc2VjdXJpdHkuYWNjZXNzLWluZGl2aWR1YWxzLXJlYWQnOlxuICAgICAgICAgIGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1tcbiAgICAgICAgICAgICdzZWN1cml0eS5hY2Nlc3MtaW5kaXZpZHVhbHMtcmVhZCdcbiAgICAgICAgICBdIHx8IFtdLFxuICAgICAgfSBhcyB7XG4gICAgICAgIFtrZXk6IHN0cmluZ106IGFueVxuICAgICAgfVxuICAgICAgc2V0RHJvcHpvbmUoXG4gICAgICAgIG5ldyBEcm9wem9uZShkcm9wem9uZUVsZW1lbnQsIHtcbiAgICAgICAgICBwYXJhbU5hbWU6ICdwYXJzZS5yZXNvdXJjZScsIC8vcmVxdWlyZWQgdG8gcGFyc2UgbXVsdGlwYXJ0IGJvZHlcbiAgICAgICAgICB1cmw6XG4gICAgICAgICAgICAob3ZlcndyaXRlVXJsID8gb3ZlcndyaXRlVXJsIDogJy4vaW50ZXJuYWwvY2F0YWxvZy8nKSArXG4gICAgICAgICAgICBsYXp5UmVzdWx0LnBsYWluLmlkLFxuICAgICAgICAgIG1heEZpbGVzaXplOiA1MDAwMDAwLCAvL01CXG4gICAgICAgICAgbWV0aG9kOiAncHV0JyxcbiAgICAgICAgICBzZW5kaW5nKF9maWxlOiBhbnksIF94aHI6IGFueSwgZm9ybURhdGE6IGFueSkge1xuICAgICAgICAgICAgT2JqZWN0LmtleXMob3ZlcnJpZGVzKS5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IHtcbiAgICAgICAgICAgICAgb3ZlcnJpZGVzW2F0dHJpYnV0ZV0uZm9yRWFjaCgodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgncGFyc2UuJyArIGF0dHJpYnV0ZSwgdmFsdWUpXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfVxuICB9LCBbZHJvcHpvbmVFbGVtZW50LCBsYXp5UmVzdWx0XSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkcm9wem9uZSAmJiBsYXp5UmVzdWx0KSB7XG4gICAgICBpZiAoIWdldE92ZXJ3cml0ZU1vZGVsKHsgbGF6eVJlc3VsdCB9KSkge1xuICAgICAgICBPdmVyd3JpdGVzSW5zdGFuY2UuYWRkKHtcbiAgICAgICAgICBpZDogbGF6eVJlc3VsdD8ucGxhaW4uaWQsXG4gICAgICAgICAgZHJvcHpvbmU6IGRyb3B6b25lLFxuICAgICAgICAgIHJlc3VsdDogbGF6eVJlc3VsdCxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICAgIHNldE92ZXJ3cml0ZU1vZGVsKGdldE92ZXJ3cml0ZU1vZGVsKHsgbGF6eVJlc3VsdCB9KSlcbiAgICB9XG4gIH0sIFtkcm9wem9uZSwgbGF6eVJlc3VsdF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAob3ZlcndyaXRlTW9kZWwpIHtcbiAgICAgIHNldFN0YXRlKG1hcE92ZXJ3cml0ZU1vZGVsVG9TdGF0ZShvdmVyd3JpdGVNb2RlbCkpXG4gICAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgICAgc2V0U3RhdGUobWFwT3ZlcndyaXRlTW9kZWxUb1N0YXRlKG92ZXJ3cml0ZU1vZGVsKSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IGV2ZW50U3RyaW5nID1cbiAgICAgICAgJ2NoYW5nZTpwZXJjZW50YWdlIGNoYW5nZTpzZW5kaW5nIGNoYW5nZTplcnJvciBjaGFuZ2U6c3VjY2VzcydcbiAgICAgIGxpc3RlblRvKG92ZXJ3cml0ZU1vZGVsLCBldmVudFN0cmluZywgY2FsbGJhY2spXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAob3ZlcndyaXRlTW9kZWwpIHtcbiAgICAgICAgICBzdG9wTGlzdGVuaW5nKG92ZXJ3cml0ZU1vZGVsLCBldmVudFN0cmluZywgY2FsbGJhY2spXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHt9XG4gIH0sIFtvdmVyd3JpdGVNb2RlbF0pXG5cbiAgY29uc3Qgc3RhcnRPdmVyID0gKCkgPT4ge1xuICAgIE92ZXJ3cml0ZXNJbnN0YW5jZS5yZW1vdmUobGF6eVJlc3VsdD8ucGxhaW4uaWQpXG4gICAgT3ZlcndyaXRlc0luc3RhbmNlLmFkZCh7XG4gICAgICBpZDogbGF6eVJlc3VsdD8ucGxhaW4uaWQsXG4gICAgICBkcm9wem9uZTogZHJvcHpvbmUsXG4gICAgICByZXN1bHQ6IGxhenlSZXN1bHQsXG4gICAgfSlcbiAgICBzZXRPdmVyd3JpdGVNb2RlbChnZXRPdmVyd3JpdGVNb2RlbCh7IGxhenlSZXN1bHQgfSkpXG4gICAgc2V0U3RhdGUoZGVmYXVsdFN0YXRlKVxuICB9XG4gIGNvbnN0IENvbXBvbmVudCA9IFN0YWdlc1tzdGF0ZS5zdGFnZV1cbiAgcmV0dXJuIChcbiAgICA8Um9vdD5cbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ25vbmUnIH19IHJlZj17c2V0RHJvcGRvd25FbGVtZW50fSAvPlxuICAgICAgPERpYWxvZ1RpdGxlPnt0aXRsZX08L0RpYWxvZ1RpdGxlPlxuICAgICAgPERpYWxvZ0NvbnRlbnQgc3R5bGU9e3sgd2lkdGg6ICc1MGVtJyB9fT5cbiAgICAgICAgQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIG92ZXJ3cml0ZSB0aGUgY29udGVudD9cbiAgICAgICAgPGJyIC8+XG4gICAgICAgIFdBUk5JTkc6IFRoaXMgd2lsbCBjb21wbGV0ZWx5IG92ZXJ3cml0ZSB0aGUgY3VycmVudCBjb250ZW50IGFuZFxuICAgICAgICBtZXRhZGF0YS5cbiAgICAgIDwvRGlhbG9nQ29udGVudD5cblxuICAgICAge0NvbXBvbmVudCAmJiA8Q29tcG9uZW50IHsuLi5zdGF0ZX0gLz59XG5cbiAgICAgIDxEaWFsb2dBY3Rpb25zPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7IG9wZW46IGZhbHNlIH0pXG4gICAgICAgICAgICBzdGFydE92ZXIoKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBDYW5jZWxcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBkcm9wem9uZUVsZW1lbnQ/LmNsaWNrKClcbiAgICAgICAgICAgIHN0YXJ0T3ZlcigpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIE92ZXJ3cml0ZVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvRGlhbG9nQWN0aW9ucz5cbiAgICA8L1Jvb3Q+XG4gIClcbn1cbiJdfQ==