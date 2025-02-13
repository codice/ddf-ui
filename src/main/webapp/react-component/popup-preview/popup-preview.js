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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAtcHJldmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvcG9wdXAtcHJldmlldy9wb3B1cC1wcmV2aWV3LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scURBQXFELENBQUE7QUFjakYsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsa29CQUFBLDhFQUVQLEVBQXNDLHNFQUl2QyxFQUFxQyxtT0FXdkIsRUFBc0Msa01BU2xFLEtBeEJlLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLEVBSXZDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLEVBV3ZCLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLENBU2xFLENBQUE7QUFFRCxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyx1UEFBQSxvTEFRdkIsSUFBQSxDQUFBO0FBRUQsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsdVRBQUEsaUpBT0osRUFBd0MsaUdBSzdELEtBTHFCLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBN0IsQ0FBNkIsQ0FLN0QsQ0FBQTtBQUVELElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxDQUFDLDBMQUFBLHVIQUszQixJQUFBLENBQUE7QUFFRCxJQUFN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LG9CQUFDLFlBQVksSUFDWCxHQUFHLEVBQUUsWUFBWSxDQUFDLEVBQUUsRUFDcEIsT0FBTyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLG9CQUFvQixFQUFFLENBQUE7d0JBQ3pDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFBO29CQUNwRCxDQUFDLElBRUEsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUNuQyxDQUNoQixDQUFBO1lBQ0gsQ0FBQyxDQUFDLENBQ1EsQ0FDZixDQUFBO1NBQ0Y7UUFDRCxPQUFNO0lBQ1IsQ0FBQyxDQUFDLEVBQUUsQ0FDQyxDQUNSLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5cbmV4cG9ydCB0eXBlIE1ldGFjYXJkVHlwZSA9IHtcbiAgZ2V0UHJldmlldzogRnVuY3Rpb25cbiAgZ2V0VGl0bGU6IEZ1bmN0aW9uXG4gIGlkOiBTdHJpbmdcbiAgdG9KU09OOiAoKSA9PiBhbnlcbn1cblxuZXhwb3J0IHR5cGUgTG9jYXRpb25UeXBlID0ge1xuICBsZWZ0OiBudW1iZXJcbiAgdG9wOiBudW1iZXJcbn1cblxuY29uc3QgUm9vdCA9IHN0eWxlZC5kaXZgXG4gIGZvbnQtZmFtaWx5OiAnSW5jb25zb2xhdGEnLCAnTHVjaWRhIENvbnNvbGUnLCBtb25vc3BhY2U7XG4gIGJhY2tncm91bmQ6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5iYWNrZ3JvdW5kTW9kYWx9O1xuICBkaXNwbGF5OiBibG9jaztcbiAgd2lkdGg6IGF1dG87XG4gIGhlaWdodDogYXV0bztcbiAgZm9udC1zaXplOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUubWVkaXVtRm9udFNpemV9O1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIHBhZGRpbmc6IDRweDtcbiAgbWF4LWhlaWdodDogMjkwcHg7XG4gIG1heC13aWR0aDogNTAlO1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTEuMjUlLCAtMTAwJSk7XG5cbiAgJjo6YmVmb3JlIHtcbiAgICB0b3A6IDEwMCU7XG4gICAgY29udGVudDogJyAnO1xuICAgIGJvcmRlci10b3A6IDE1cHggc29saWQgJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLmJhY2tncm91bmRNb2RhbH07XG4gICAgYm9yZGVyLWxlZnQ6IDEwcHggc29saWQgdHJhbnNwYXJlbnQ7XG4gICAgYm9yZGVyLXJpZ2h0OiAxMHB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGhlaWdodDogMDtcbiAgICB3aWR0aDogMDtcbiAgICBsZWZ0OiA1MCU7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICB9XG5gXG5cbmNvbnN0IFRpdGxlID0gc3R5bGVkLmRpdmBcbiAgZm9udC1zaXplOiAyMHB4O1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDJweCA2cHg7XG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICBmb250LWZhbWlseTogJ09wZW4gU2FucycsIGFyaWFsLCBzYW5zLXNlcmlmO1xuYFxuXG5jb25zdCBQcmV2aWV3ID0gc3R5bGVkLmRpdmBcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBtaW4td2lkdGg6IDIwMHB4O1xuICBoZWlnaHQ6IDEwMCU7XG4gIG1pbi1oZWlnaHQ6IDE1cHg7XG4gIG1heC1oZWlnaHQ6IDI1MHB4O1xuICBwYWRkaW5nOiAycHg7XG4gIGJhY2tncm91bmQtY29sb3I6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5iYWNrZ3JvdW5kQ29udGVudH07XG4gIGJvcmRlcjogMXB4IHNvbGlkO1xuICBvdmVyZmxvdy15OiBhdXRvO1xuICBvdmVyZmxvdy14OiBhdXRvO1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbmBcblxuY29uc3QgUHJldmlld1RleHQgPSBzdHlsZWQucGBcbiAgZm9udC1mYW1pbHk6ICdPcGVuIFNhbnMnLCBhcmlhbCwgc2Fucy1zZXJpZjtcbiAgZm9udC1zaXplOiAxNHB4O1xuICBwYWRkaW5nOiAycHggNHB4O1xuICB3aGl0ZS1zcGFjZTogcHJlLWxpbmU7XG5gXG5cbmNvbnN0IENsdXN0ZXJMaXN0ID0gc3R5bGVkLnVsYFxuICBtYXJnaW46IDFweDtcbiAgcGFkZGluZzogMXB4O1xuICBib3JkZXI6IDFweCBzb2xpZDtcbmBcblxuY29uc3QgQ2x1c3RlclRpdGxlID0gc3R5bGVkLmxpYFxuICBmb250LXNpemU6IDE4cHg7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMnB4IDZweDtcbiAgd2hpdGUtc3BhY2U6IG5vd3JhcDtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG4gIGZvbnQtZmFtaWx5OiAnT3BlbiBTYW5zJywgYXJpYWwsIHNhbnMtc2VyaWY7XG5cbiAgJjpob3ZlciB7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLmJhY2tncm91bmRTbGlkZW91dH07XG4gIH1cbmBcblxuY29uc3QgTk9fUFJFVklFVyA9ICdObyBwcmV2aWV3IHRleHQgYXZhaWxhYmxlLidcbmNvbnN0IFNUQVRVU19PSyA9IDIwMFxuXG5jb25zdCBUT1BfT0ZGU0VUID0gNjBcblxuY29uc3QgRFJBR19TRU5TSVRJVklUWSA9IDEwXG5cbnR5cGUgUHJvcHMgPSB7XG4gIG1hcDogYW55XG4gIHNlbGVjdGlvbkludGVyZmFjZToge1xuICAgIGdldFNlbGVjdGVkUmVzdWx0czogKCkgPT4ge1xuICAgICAgbW9kZWxzOiBNZXRhY2FyZFR5cGVbXVxuICAgIH0gJiBBcnJheTxNZXRhY2FyZFR5cGU+XG4gICAgZ2V0QWN0aXZlU2VhcmNoUmVzdWx0czogKCkgPT4ge1xuICAgICAgbW9kZWxzOiBNZXRhY2FyZFR5cGVbXVxuICAgIH0gJiBBcnJheTxNZXRhY2FyZFR5cGU+XG4gICAgY2xlYXJTZWxlY3RlZFJlc3VsdHM6ICgpID0+IHZvaWRcbiAgICBhZGRTZWxlY3RlZFJlc3VsdDogKG1ldGFjYXJkOiBNZXRhY2FyZFR5cGUpID0+IHZvaWRcbiAgfVxuICBtYXBNb2RlbDogYW55XG59XG5cbmNvbnN0IGdldExlZnQgPSAobG9jYXRpb246IHVuZGVmaW5lZCB8IExvY2F0aW9uVHlwZSkgPT4ge1xuICByZXR1cm4gbG9jYXRpb24gPyBsb2NhdGlvbi5sZWZ0ICsgJ3B4JyA6IDBcbn1cblxuY29uc3QgZ2V0VG9wID0gKGxvY2F0aW9uOiB1bmRlZmluZWQgfCBMb2NhdGlvblR5cGUpID0+IHtcbiAgcmV0dXJuIGxvY2F0aW9uID8gbG9jYXRpb24udG9wIC0gVE9QX09GRlNFVCArICdweCcgOiAwXG59XG5cbmNvbnN0IGV4dHJhY3RQcmV2aWV3VGV4dCA9IChyZXNwb25zZUh0bWw6IHN0cmluZykgPT4ge1xuICBjb25zdCBodG1sRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2h0bWwnKVxuICBodG1sRWxlbWVudC5pbm5lckhUTUwgPSByZXNwb25zZUh0bWxcbiAgY29uc3QgYm9keUVsZW1lbnQgPSBodG1sRWxlbWVudCEucXVlcnlTZWxlY3RvcignYm9keScpXG4gIGlmIChib2R5RWxlbWVudCkge1xuICAgIGJvZHlFbGVtZW50LmlubmVySFRNTCA9IGJvZHlFbGVtZW50LmlubmVySFRNTC5yZXBsYWNlKC88YnJcXHMqXFwvPz4vZ20sICdcXG4nKVxuICAgIHJldHVybiBib2R5RWxlbWVudC5pbm5lclRleHRcbiAgfVxuICByZXR1cm4gTk9fUFJFVklFV1xufVxuXG5jb25zdCBnZXRQcmV2aWV3VGV4dCA9ICh7XG4gIHRhcmdldE1ldGFjYXJkLFxuICBzZXRQcmV2aWV3VGV4dCxcbn06IHtcbiAgdGFyZ2V0TWV0YWNhcmQ6IE1ldGFjYXJkVHlwZSB8IHVuZGVmaW5lZFxuICBzZXRQcmV2aWV3VGV4dDogUmVhY3QuRGlzcGF0Y2g8UmVhY3QuU2V0U3RhdGVBY3Rpb248c3RyaW5nIHwgdW5kZWZpbmVkPj5cbn0pID0+IHtcbiAgaWYgKHRhcmdldE1ldGFjYXJkKSB7XG4gICAgY29uc3QgdXJsID0gdGFyZ2V0TWV0YWNhcmQuZ2V0UHJldmlldygpIGFzIHN0cmluZ1xuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gU1RBVFVTX09LKSB7XG4gICAgICAgIGNvbnN0IHByZXZpZXdUZXh0ID0gZXh0cmFjdFByZXZpZXdUZXh0KHhoci5yZXNwb25zZVRleHQpXG4gICAgICAgIHNldFByZXZpZXdUZXh0KHByZXZpZXdUZXh0ICE9PSBOT19QUkVWSUVXID8gcHJldmlld1RleHQgOiB1bmRlZmluZWQpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHhoci5vcGVuKCdHRVQnLCB1cmwpXG4gICAgeGhyLnNlbmQoKVxuICB9IGVsc2Uge1xuICAgIHNldFByZXZpZXdUZXh0KHVuZGVmaW5lZClcbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgcGl4ZWwgbG9jYXRpb24gZnJvbSBhIG1ldGFjYXJkKHMpXG4gKiByZXR1cm5zIHsgbGVmdCwgdG9wIH0gcmVsYXRpdmUgdG8gdGhlIG1hcCB2aWV3XG4gKi9cbmNvbnN0IGdldExvY2F0aW9uID0gKG1hcDogYW55LCB0YXJnZXQ6IE1ldGFjYXJkVHlwZVtdKSA9PiB7XG4gIGlmICh0YXJnZXQpIHtcbiAgICBjb25zdCBsb2NhdGlvbiA9IG1hcC5nZXRXaW5kb3dMb2NhdGlvbnNPZlJlc3VsdHModGFyZ2V0KVxuICAgIGNvbnN0IGNvb3JkaW5hdGVzID0gbG9jYXRpb24gPyBsb2NhdGlvblswXSA6IHVuZGVmaW5lZFxuICAgIHJldHVybiBjb29yZGluYXRlc1xuICAgICAgPyB7IGxlZnQ6IGNvb3JkaW5hdGVzWzBdLCB0b3A6IGNvb3JkaW5hdGVzWzFdIH1cbiAgICAgIDogdW5kZWZpbmVkXG4gIH1cbiAgcmV0dXJuXG59XG5cbmNvbnN0IEhvb2tQb3B1cFByZXZpZXcgPSAocHJvcHM6IFByb3BzKSA9PiB7XG4gIGNvbnN0IHsgbWFwLCBzZWxlY3Rpb25JbnRlcmZhY2UgfSA9IHByb3BzXG4gIGNvbnN0IFtsb2NhdGlvbiwgc2V0TG9jYXRpb25dID0gUmVhY3QudXNlU3RhdGUoXG4gICAgdW5kZWZpbmVkIGFzIHVuZGVmaW5lZCB8IExvY2F0aW9uVHlwZVxuICApXG4gIGNvbnN0IGRyYWdSZWYgPSBSZWFjdC51c2VSZWYoMClcbiAgY29uc3QgW29wZW4sIHNldE9wZW5dID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtwcmV2aWV3VGV4dCwgc2V0UHJldmlld1RleHRdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgdW5kZWZpbmVkIGFzIHVuZGVmaW5lZCB8IHN0cmluZ1xuICApXG4gIGNvbnN0IHsgbGlzdGVuVG8gfSA9IHVzZUJhY2tib25lKClcblxuICBjb25zdCBnZXRUYXJnZXQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHNlbGVjdGlvbkludGVyZmFjZS5nZXRTZWxlY3RlZFJlc3VsdHMoKVxuICB9XG5cbiAgbGV0IHBvcHVwQW5pbWF0aW9uRnJhbWVJZDogYW55XG4gIGNvbnN0IHN0YXJ0UG9wdXBBbmltYXRpbmcgPSAobWFwOiBhbnkpID0+IHtcbiAgICBpZiAoZ2V0VGFyZ2V0KCkubGVuZ3RoICE9PSAwKSB7XG4gICAgICBwb3B1cEFuaW1hdGlvbkZyYW1lSWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBnZXRMb2NhdGlvbihtYXAsIGdldFRhcmdldCgpKVxuICAgICAgICBzZXRMb2NhdGlvbihsb2NhdGlvbilcbiAgICAgICAgc3RhcnRQb3B1cEFuaW1hdGluZyhtYXApXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGhhbmRsZUNhbWVyYU1vdmVFbmQgPSAoKSA9PiB7XG4gICAgaWYgKGdldFRhcmdldCgpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHBvcHVwQW5pbWF0aW9uRnJhbWVJZClcbiAgICB9XG4gIH1cblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxpc3RlblRvKFxuICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLmdldFNlbGVjdGVkUmVzdWx0cygpLFxuICAgICAgJ3Jlc2V0IGFkZCByZW1vdmUnLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0aW9uSW50ZXJmYWNlLmdldFNlbGVjdGVkUmVzdWx0cygpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGdldFByZXZpZXdUZXh0KHtcbiAgICAgICAgICAgIHRhcmdldE1ldGFjYXJkOiBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0U2VsZWN0ZWRSZXN1bHRzKCkubW9kZWxzWzBdLFxuICAgICAgICAgICAgc2V0UHJldmlld1RleHQsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBzZXRMb2NhdGlvbihnZXRMb2NhdGlvbihtYXAsIGdldFRhcmdldCgpKSlcbiAgICAgICAgaWYgKHNlbGVjdGlvbkludGVyZmFjZS5nZXRTZWxlY3RlZFJlc3VsdHMoKS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICBzZXRPcGVuKHRydWUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApXG4gICAgbWFwLm9uTW91c2VUcmFja2luZ0ZvclBvcHVwKFxuICAgICAgKCkgPT4ge1xuICAgICAgICBkcmFnUmVmLmN1cnJlbnQgPSAwXG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICBkcmFnUmVmLmN1cnJlbnQgKz0gMVxuICAgICAgfSxcbiAgICAgIChfZXZlbnQ6IGFueSwgbWFwVGFyZ2V0OiBhbnkpID0+IHtcbiAgICAgICAgaWYgKERSQUdfU0VOU0lUSVZJVFkgPiBkcmFnUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBzZXRPcGVuKG1hcFRhcmdldC5tYXBUYXJnZXQgIT09IHVuZGVmaW5lZClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIClcblxuICAgIG1hcC5vbkNhbWVyYU1vdmVTdGFydCgoKSA9PiB7XG4gICAgICBzdGFydFBvcHVwQW5pbWF0aW5nKG1hcClcbiAgICB9KVxuICAgIG1hcC5vbkNhbWVyYU1vdmVFbmQoKCkgPT4ge1xuICAgICAgaGFuZGxlQ2FtZXJhTW92ZUVuZCgpXG4gICAgfSlcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUocG9wdXBBbmltYXRpb25GcmFtZUlkKVxuICAgIH1cbiAgfSwgW10pXG5cbiAgaWYgKCFvcGVuKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPFJvb3Qgc3R5bGU9e3sgbGVmdDogZ2V0TGVmdChsb2NhdGlvbiksIHRvcDogZ2V0VG9wKGxvY2F0aW9uKSB9fT5cbiAgICAgIHsoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2VsZWN0aW9uSW50ZXJmYWNlLmdldFNlbGVjdGVkUmVzdWx0cygpLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGNvbnN0IG1ldGFjYXJkSlNPTiA9IHNlbGVjdGlvbkludGVyZmFjZVxuICAgICAgICAgICAgLmdldFNlbGVjdGVkUmVzdWx0cygpXG4gICAgICAgICAgICAubW9kZWxzWzBdLnRvSlNPTigpXG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxUaXRsZT57bWV0YWNhcmRKU09OLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGV9PC9UaXRsZT5cbiAgICAgICAgICAgICAge3ByZXZpZXdUZXh0ICYmIChcbiAgICAgICAgICAgICAgICA8UHJldmlldz5cbiAgICAgICAgICAgICAgICAgIDxQcmV2aWV3VGV4dD57cHJldmlld1RleHR9PC9QcmV2aWV3VGV4dD5cbiAgICAgICAgICAgICAgICA8L1ByZXZpZXc+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApXG4gICAgICAgIH0gZWxzZSBpZiAoc2VsZWN0aW9uSW50ZXJmYWNlLmdldFNlbGVjdGVkUmVzdWx0cygpLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPENsdXN0ZXJMaXN0PlxuICAgICAgICAgICAgICB7c2VsZWN0aW9uSW50ZXJmYWNlXG4gICAgICAgICAgICAgICAgLmdldFNlbGVjdGVkUmVzdWx0cygpXG4gICAgICAgICAgICAgICAgLm1hcCgoY2x1c3Rlck1vZGVsOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxDbHVzdGVyVGl0bGVcbiAgICAgICAgICAgICAgICAgICAgICBrZXk9e2NsdXN0ZXJNb2RlbC5pZH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UuY2xlYXJTZWxlY3RlZFJlc3VsdHMoKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLmFkZFNlbGVjdGVkUmVzdWx0KGNsdXN0ZXJNb2RlbClcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2NsdXN0ZXJNb2RlbC50b0pTT04oKS5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlfVxuICAgICAgICAgICAgICAgICAgICA8L0NsdXN0ZXJUaXRsZT5cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIDwvQ2x1c3Rlckxpc3Q+XG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIHJldHVyblxuICAgICAgfSkoKX1cbiAgICA8L1Jvb3Q+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoSG9va1BvcHVwUHJldmlldylcbiJdfQ==