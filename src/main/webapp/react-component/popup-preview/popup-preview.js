import { __makeTemplateObject, __read } from "tslib";
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
import * as React from 'react';
import { hot } from 'react-hot-loader';
import styled from 'styled-components';
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  font-family: 'Inconsolata', 'Lucida Console', monospace;\n  background: ", ";\n  display: block;\n  width: auto;\n  height: auto;\n  font-size: ", ";\n  position: absolute;\n  text-align: left;\n  padding: 4px;\n  max-height: 290px;\n  max-width: 50%;\n  transform: translate(-51.25%, -100%);\n\n  &::before {\n    top: 100%;\n    content: ' ';\n    border-top: 15px solid ", ";\n    border-left: 10px solid transparent;\n    border-right: 10px solid transparent;\n    height: 0;\n    width: 0;\n    left: 50%;\n    position: absolute;\n    pointer-events: none;\n  }\n"], ["\n  font-family: 'Inconsolata', 'Lucida Console', monospace;\n  background: ", ";\n  display: block;\n  width: auto;\n  height: auto;\n  font-size: ", ";\n  position: absolute;\n  text-align: left;\n  padding: 4px;\n  max-height: 290px;\n  max-width: 50%;\n  transform: translate(-51.25%, -100%);\n\n  &::before {\n    top: 100%;\n    content: ' ';\n    border-top: 15px solid ", ";\n    border-left: 10px solid transparent;\n    border-right: 10px solid transparent;\n    height: 0;\n    width: 0;\n    left: 50%;\n    position: absolute;\n    pointer-events: none;\n  }\n"])), function (props) { return props.theme.backgroundModal; }, function (props) { return props.theme.mediumFontSize; }, function (props) { return props.theme.backgroundModal; });
var Title = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  font-size: 20px;\n  margin: 0;\n  padding: 2px 6px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-family: 'Open Sans', arial, sans-serif;\n"], ["\n  font-size: 20px;\n  margin: 0;\n  padding: 2px 6px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-family: 'Open Sans', arial, sans-serif;\n"])));
var Preview = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  position: relative;\n  min-width: 200px;\n  height: 100%;\n  min-height: 15px;\n  max-height: 250px;\n  padding: 2px;\n  background-color: ", ";\n  border: 1px solid;\n  overflow-y: auto;\n  overflow-x: auto;\n  text-overflow: ellipsis;\n"], ["\n  position: relative;\n  min-width: 200px;\n  height: 100%;\n  min-height: 15px;\n  max-height: 250px;\n  padding: 2px;\n  background-color: ", ";\n  border: 1px solid;\n  overflow-y: auto;\n  overflow-x: auto;\n  text-overflow: ellipsis;\n"])), function (props) { return props.theme.backgroundContent; });
var PreviewText = styled.p(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  font-family: 'Open Sans', arial, sans-serif;\n  font-size: 14px;\n  padding: 2px 4px;\n  white-space: pre-line;\n"], ["\n  font-family: 'Open Sans', arial, sans-serif;\n  font-size: 14px;\n  padding: 2px 4px;\n  white-space: pre-line;\n"])));
var ClusterList = styled.ul(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  margin: 1px;\n  padding: 1px;\n  border: 1px solid;\n"], ["\n  margin: 1px;\n  padding: 1px;\n  border: 1px solid;\n"])));
var ClusterTitle = styled.li(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  font-size: 18px;\n  margin: 0;\n  padding: 2px 6px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-family: 'Open Sans', arial, sans-serif;\n\n  &:hover {\n    background-color: ", ";\n  }\n"], ["\n  font-size: 18px;\n  margin: 0;\n  padding: 2px 6px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  font-family: 'Open Sans', arial, sans-serif;\n\n  &:hover {\n    background-color: ", ";\n  }\n"])), function (props) { return props.theme.backgroundSlideout; });
var NO_PREVIEW = 'No preview text available.';
var STATUS_OK = 200;
var TOP_OFFSET = 60;
var DRAG_SENSITIVITY = 10;
var getLeft = function (location) {
    return location ? location.left + 'px' : 0;
};
var getTop = function (location) {
    return location ? location.top - TOP_OFFSET + 'px' : 0;
};
var extractPreviewText = function (responseHtml) {
    var htmlElement = document.createElement('html');
    htmlElement.innerHTML = responseHtml;
    var bodyElement = htmlElement.querySelector('body');
    if (bodyElement) {
        bodyElement.innerHTML = bodyElement.innerHTML.replace(/<br\s*\/?>/gm, '\n');
        return bodyElement.innerText;
    }
    return NO_PREVIEW;
};
var getPreviewText = function (_a) {
    var targetMetacard = _a.targetMetacard, setPreviewText = _a.setPreviewText;
    if (targetMetacard) {
        var url = targetMetacard.getPreview();
        var xhr_1 = new XMLHttpRequest();
        xhr_1.addEventListener('load', function () {
            if (xhr_1.status === STATUS_OK) {
                var previewText = extractPreviewText(xhr_1.responseText);
                setPreviewText(previewText !== NO_PREVIEW ? previewText : undefined);
            }
        });
        xhr_1.open('GET', url);
        xhr_1.send();
    }
    else {
        setPreviewText(undefined);
    }
};
/**
 * Get the pixel location from a metacard(s)
 * returns { left, top } relative to the map view
 */
var getLocation = function (map, target) {
    if (target) {
        var location_1 = map.getWindowLocationsOfResults(target);
        var coordinates = location_1 ? location_1[0] : undefined;
        return coordinates
            ? { left: coordinates[0], top: coordinates[1] }
            : undefined;
    }
    return;
};
var HookPopupPreview = function (props) {
    var map = props.map, selectionInterface = props.selectionInterface;
    var _a = __read(React.useState(undefined), 2), location = _a[0], setLocation = _a[1];
    var dragRef = React.useRef(0);
    var _b = __read(React.useState(false), 2), open = _b[0], setOpen = _b[1];
    var _c = __read(React.useState(undefined), 2), previewText = _c[0], setPreviewText = _c[1];
    var listenTo = useBackbone().listenTo;
    var getTarget = function () {
        return selectionInterface.getSelectedResults();
    };
    var popupAnimationFrameId;
    var startPopupAnimating = function (map) {
        if (getTarget().length !== 0) {
            popupAnimationFrameId = window.requestAnimationFrame(function () {
                var location = getLocation(map, getTarget());
                setLocation(location);
                startPopupAnimating(map);
            });
        }
    };
    var handleCameraMoveEnd = function () {
        if (getTarget().length !== 0) {
            window.cancelAnimationFrame(popupAnimationFrameId);
        }
    };
    React.useEffect(function () {
        listenTo(selectionInterface.getSelectedResults(), 'reset add remove', function () {
            if (selectionInterface.getSelectedResults().length === 1) {
                getPreviewText({
                    targetMetacard: selectionInterface.getSelectedResults().models[0],
                    setPreviewText: setPreviewText,
                });
            }
            setLocation(getLocation(map, getTarget()));
            if (selectionInterface.getSelectedResults().length !== 0) {
                setOpen(true);
            }
        });
        map.onMouseTrackingForPopup(function () {
            dragRef.current = 0;
        }, function () {
            dragRef.current += 1;
        }, function (_event, mapTarget) {
            if (DRAG_SENSITIVITY > dragRef.current) {
                setOpen(mapTarget.mapTarget !== undefined);
            }
        });
        map.onCameraMoveStart(function () {
            startPopupAnimating(map);
        });
        map.onCameraMoveEnd(function () {
            handleCameraMoveEnd();
        });
        return function () {
            window.cancelAnimationFrame(popupAnimationFrameId);
        };
    }, []);
    if (!open) {
        return null;
    }
    return (React.createElement(Root, { style: { left: getLeft(location), top: getTop(location) } }, (function () {
        if (selectionInterface.getSelectedResults().length === 1) {
            var metacardJSON = selectionInterface
                .getSelectedResults()
                .models[0].toJSON();
            return (React.createElement(React.Fragment, null,
                React.createElement(Title, null, metacardJSON.metacard.properties.title),
                previewText && (React.createElement(Preview, null,
                    React.createElement(PreviewText, null, previewText)))));
        }
        else if (selectionInterface.getSelectedResults().length > 1) {
            return (React.createElement(ClusterList, null, selectionInterface
                .getSelectedResults()
                .map(function (clusterModel) {
                return (React.createElement(ClusterTitle, { key: clusterModel.id, onClick: function () {
                        selectionInterface.clearSelectedResults();
                        selectionInterface.addSelectedResult(clusterModel);
                    } }, clusterModel.toJSON().metacard.properties.title));
            })));
        }
        return;
    })()));
};
export default hot(module)(HookPopupPreview);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
//# sourceMappingURL=popup-preview.js.map