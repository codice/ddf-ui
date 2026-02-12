import { __makeTemplateObject, __read } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(Root, { style: { left: getLeft(location), top: getTop(location) }, children: (function () {
            if (selectionInterface.getSelectedResults().length === 1) {
                var metacardJSON = selectionInterface
                    .getSelectedResults()
                    .models[0].toJSON();
                return (_jsxs(_Fragment, { children: [_jsx(Title, { children: metacardJSON.metacard.properties.title }), previewText && (_jsx(Preview, { children: _jsx(PreviewText, { children: previewText }) }))] }));
            }
            else if (selectionInterface.getSelectedResults().length > 1) {
                return (_jsx(ClusterList, { children: selectionInterface
                        .getSelectedResults()
                        .map(function (clusterModel) {
                        return (_jsx(ClusterTitle, { onClick: function () {
                                selectionInterface.clearSelectedResults();
                                selectionInterface.addSelectedResult(clusterModel);
                            }, children: clusterModel.toJSON().metacard.properties.title }, clusterModel.id));
                    }) }));
            }
            return;
        })() }));
};
export default HookPopupPreview;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wdXAtcHJldmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvcG9wdXAtcHJldmlldy9wb3B1cC1wcmV2aWV3LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUU5QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scURBQXFELENBQUE7QUFjakYsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsa29CQUFBLDhFQUVQLEVBQXNDLHNFQUl2QyxFQUFxQyxtT0FXdkIsRUFBc0Msa01BU2xFLEtBeEJlLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLEVBSXZDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQTFCLENBQTBCLEVBV3ZCLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQTNCLENBQTJCLENBU2xFLENBQUE7QUFFRCxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyx1UEFBQSxvTEFRdkIsSUFBQSxDQUFBO0FBRUQsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEdBQUcsdVRBQUEsaUpBT0osRUFBd0MsaUdBSzdELEtBTHFCLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBN0IsQ0FBNkIsQ0FLN0QsQ0FBQTtBQUVELElBQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxDQUFDLDBMQUFBLHVIQUszQixJQUFBLENBQUE7QUFFRCxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsRUFBRSw4SEFBQSwyREFJNUIsSUFB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LFdBQVcsY0FDVCxrQkFBa0I7eUJBQ2hCLGtCQUFrQixFQUFFO3lCQUNwQixHQUFHLENBQUMsVUFBQyxZQUFpQjt3QkFDckIsT0FBTyxDQUNMLEtBQUMsWUFBWSxJQUVYLE9BQU8sRUFBRTtnQ0FDUCxrQkFBa0IsQ0FBQyxvQkFBb0IsRUFBRSxDQUFBO2dDQUN6QyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQTs0QkFDcEQsQ0FBQyxZQUVBLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssSUFOM0MsWUFBWSxDQUFDLEVBQUUsQ0FPUCxDQUNoQixDQUFBO29CQUNILENBQUMsQ0FBQyxHQUNRLENBQ2YsQ0FBQTtZQUNILENBQUM7WUFDRCxPQUFNO1FBQ1IsQ0FBQyxDQUFDLEVBQUUsR0FDQyxDQUNSLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLGdCQUFnQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCB7IHVzZUJhY2tib25lIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuXG5leHBvcnQgdHlwZSBNZXRhY2FyZFR5cGUgPSB7XG4gIGdldFByZXZpZXc6IEZ1bmN0aW9uXG4gIGdldFRpdGxlOiBGdW5jdGlvblxuICBpZDogU3RyaW5nXG4gIHRvSlNPTjogKCkgPT4gYW55XG59XG5cbmV4cG9ydCB0eXBlIExvY2F0aW9uVHlwZSA9IHtcbiAgbGVmdDogbnVtYmVyXG4gIHRvcDogbnVtYmVyXG59XG5cbmNvbnN0IFJvb3QgPSBzdHlsZWQuZGl2YFxuICBmb250LWZhbWlseTogJ0luY29uc29sYXRhJywgJ0x1Y2lkYSBDb25zb2xlJywgbW9ub3NwYWNlO1xuICBiYWNrZ3JvdW5kOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUuYmFja2dyb3VuZE1vZGFsfTtcbiAgZGlzcGxheTogYmxvY2s7XG4gIHdpZHRoOiBhdXRvO1xuICBoZWlnaHQ6IGF1dG87XG4gIGZvbnQtc2l6ZTogJHsocHJvcHMpID0+IHByb3BzLnRoZW1lLm1lZGl1bUZvbnRTaXplfTtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xuICBwYWRkaW5nOiA0cHg7XG4gIG1heC1oZWlnaHQ6IDI5MHB4O1xuICBtYXgtd2lkdGg6IDUwJTtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUxLjI1JSwgLTEwMCUpO1xuXG4gICY6OmJlZm9yZSB7XG4gICAgdG9wOiAxMDAlO1xuICAgIGNvbnRlbnQ6ICcgJztcbiAgICBib3JkZXItdG9wOiAxNXB4IHNvbGlkICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5iYWNrZ3JvdW5kTW9kYWx9O1xuICAgIGJvcmRlci1sZWZ0OiAxMHB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1yaWdodDogMTBweCBzb2xpZCB0cmFuc3BhcmVudDtcbiAgICBoZWlnaHQ6IDA7XG4gICAgd2lkdGg6IDA7XG4gICAgbGVmdDogNTAlO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgfVxuYFxuXG5jb25zdCBUaXRsZSA9IHN0eWxlZC5kaXZgXG4gIGZvbnQtc2l6ZTogMjBweDtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAycHggNnB4O1xuICB3aGl0ZS1zcGFjZTogbm93cmFwO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcbiAgZm9udC1mYW1pbHk6ICdPcGVuIFNhbnMnLCBhcmlhbCwgc2Fucy1zZXJpZjtcbmBcblxuY29uc3QgUHJldmlldyA9IHN0eWxlZC5kaXZgXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgbWluLXdpZHRoOiAyMDBweDtcbiAgaGVpZ2h0OiAxMDAlO1xuICBtaW4taGVpZ2h0OiAxNXB4O1xuICBtYXgtaGVpZ2h0OiAyNTBweDtcbiAgcGFkZGluZzogMnB4O1xuICBiYWNrZ3JvdW5kLWNvbG9yOiAkeyhwcm9wcykgPT4gcHJvcHMudGhlbWUuYmFja2dyb3VuZENvbnRlbnR9O1xuICBib3JkZXI6IDFweCBzb2xpZDtcbiAgb3ZlcmZsb3cteTogYXV0bztcbiAgb3ZlcmZsb3cteDogYXV0bztcbiAgdGV4dC1vdmVyZmxvdzogZWxsaXBzaXM7XG5gXG5cbmNvbnN0IFByZXZpZXdUZXh0ID0gc3R5bGVkLnBgXG4gIGZvbnQtZmFtaWx5OiAnT3BlbiBTYW5zJywgYXJpYWwsIHNhbnMtc2VyaWY7XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgcGFkZGluZzogMnB4IDRweDtcbiAgd2hpdGUtc3BhY2U6IHByZS1saW5lO1xuYFxuXG5jb25zdCBDbHVzdGVyTGlzdCA9IHN0eWxlZC51bGBcbiAgbWFyZ2luOiAxcHg7XG4gIHBhZGRpbmc6IDFweDtcbiAgYm9yZGVyOiAxcHggc29saWQ7XG5gXG5cbmNvbnN0IENsdXN0ZXJUaXRsZSA9IHN0eWxlZC5saWBcbiAgZm9udC1zaXplOiAxOHB4O1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDJweCA2cHg7XG4gIHdoaXRlLXNwYWNlOiBub3dyYXA7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHRleHQtb3ZlcmZsb3c6IGVsbGlwc2lzO1xuICBmb250LWZhbWlseTogJ09wZW4gU2FucycsIGFyaWFsLCBzYW5zLXNlcmlmO1xuXG4gICY6aG92ZXIge1xuICAgIGJhY2tncm91bmQtY29sb3I6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5iYWNrZ3JvdW5kU2xpZGVvdXR9O1xuICB9XG5gXG5cbmNvbnN0IE5PX1BSRVZJRVcgPSAnTm8gcHJldmlldyB0ZXh0IGF2YWlsYWJsZS4nXG5jb25zdCBTVEFUVVNfT0sgPSAyMDBcblxuY29uc3QgVE9QX09GRlNFVCA9IDYwXG5cbmNvbnN0IERSQUdfU0VOU0lUSVZJVFkgPSAxMFxuXG50eXBlIFByb3BzID0ge1xuICBtYXA6IGFueVxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IHtcbiAgICBnZXRTZWxlY3RlZFJlc3VsdHM6ICgpID0+IHtcbiAgICAgIG1vZGVsczogTWV0YWNhcmRUeXBlW11cbiAgICB9ICYgQXJyYXk8TWV0YWNhcmRUeXBlPlxuICAgIGdldEFjdGl2ZVNlYXJjaFJlc3VsdHM6ICgpID0+IHtcbiAgICAgIG1vZGVsczogTWV0YWNhcmRUeXBlW11cbiAgICB9ICYgQXJyYXk8TWV0YWNhcmRUeXBlPlxuICAgIGNsZWFyU2VsZWN0ZWRSZXN1bHRzOiAoKSA9PiB2b2lkXG4gICAgYWRkU2VsZWN0ZWRSZXN1bHQ6IChtZXRhY2FyZDogTWV0YWNhcmRUeXBlKSA9PiB2b2lkXG4gIH1cbiAgbWFwTW9kZWw6IGFueVxufVxuXG5jb25zdCBnZXRMZWZ0ID0gKGxvY2F0aW9uOiB1bmRlZmluZWQgfCBMb2NhdGlvblR5cGUpID0+IHtcbiAgcmV0dXJuIGxvY2F0aW9uID8gbG9jYXRpb24ubGVmdCArICdweCcgOiAwXG59XG5cbmNvbnN0IGdldFRvcCA9IChsb2NhdGlvbjogdW5kZWZpbmVkIHwgTG9jYXRpb25UeXBlKSA9PiB7XG4gIHJldHVybiBsb2NhdGlvbiA/IGxvY2F0aW9uLnRvcCAtIFRPUF9PRkZTRVQgKyAncHgnIDogMFxufVxuXG5jb25zdCBleHRyYWN0UHJldmlld1RleHQgPSAocmVzcG9uc2VIdG1sOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgaHRtbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdodG1sJylcbiAgaHRtbEVsZW1lbnQuaW5uZXJIVE1MID0gcmVzcG9uc2VIdG1sXG4gIGNvbnN0IGJvZHlFbGVtZW50ID0gaHRtbEVsZW1lbnQhLnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKVxuICBpZiAoYm9keUVsZW1lbnQpIHtcbiAgICBib2R5RWxlbWVudC5pbm5lckhUTUwgPSBib2R5RWxlbWVudC5pbm5lckhUTUwucmVwbGFjZSgvPGJyXFxzKlxcLz8+L2dtLCAnXFxuJylcbiAgICByZXR1cm4gYm9keUVsZW1lbnQuaW5uZXJUZXh0XG4gIH1cbiAgcmV0dXJuIE5PX1BSRVZJRVdcbn1cblxuY29uc3QgZ2V0UHJldmlld1RleHQgPSAoe1xuICB0YXJnZXRNZXRhY2FyZCxcbiAgc2V0UHJldmlld1RleHQsXG59OiB7XG4gIHRhcmdldE1ldGFjYXJkOiBNZXRhY2FyZFR5cGUgfCB1bmRlZmluZWRcbiAgc2V0UHJldmlld1RleHQ6IFJlYWN0LkRpc3BhdGNoPFJlYWN0LlNldFN0YXRlQWN0aW9uPHN0cmluZyB8IHVuZGVmaW5lZD4+XG59KSA9PiB7XG4gIGlmICh0YXJnZXRNZXRhY2FyZCkge1xuICAgIGNvbnN0IHVybCA9IHRhcmdldE1ldGFjYXJkLmdldFByZXZpZXcoKSBhcyBzdHJpbmdcbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgaWYgKHhoci5zdGF0dXMgPT09IFNUQVRVU19PSykge1xuICAgICAgICBjb25zdCBwcmV2aWV3VGV4dCA9IGV4dHJhY3RQcmV2aWV3VGV4dCh4aHIucmVzcG9uc2VUZXh0KVxuICAgICAgICBzZXRQcmV2aWV3VGV4dChwcmV2aWV3VGV4dCAhPT0gTk9fUFJFVklFVyA/IHByZXZpZXdUZXh0IDogdW5kZWZpbmVkKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB4aHIub3BlbignR0VUJywgdXJsKVxuICAgIHhoci5zZW5kKClcbiAgfSBlbHNlIHtcbiAgICBzZXRQcmV2aWV3VGV4dCh1bmRlZmluZWQpXG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIHBpeGVsIGxvY2F0aW9uIGZyb20gYSBtZXRhY2FyZChzKVxuICogcmV0dXJucyB7IGxlZnQsIHRvcCB9IHJlbGF0aXZlIHRvIHRoZSBtYXAgdmlld1xuICovXG5jb25zdCBnZXRMb2NhdGlvbiA9IChtYXA6IGFueSwgdGFyZ2V0OiBNZXRhY2FyZFR5cGVbXSkgPT4ge1xuICBpZiAodGFyZ2V0KSB7XG4gICAgY29uc3QgbG9jYXRpb24gPSBtYXAuZ2V0V2luZG93TG9jYXRpb25zT2ZSZXN1bHRzKHRhcmdldClcbiAgICBjb25zdCBjb29yZGluYXRlcyA9IGxvY2F0aW9uID8gbG9jYXRpb25bMF0gOiB1bmRlZmluZWRcbiAgICByZXR1cm4gY29vcmRpbmF0ZXNcbiAgICAgID8geyBsZWZ0OiBjb29yZGluYXRlc1swXSwgdG9wOiBjb29yZGluYXRlc1sxXSB9XG4gICAgICA6IHVuZGVmaW5lZFxuICB9XG4gIHJldHVyblxufVxuXG5jb25zdCBIb29rUG9wdXBQcmV2aWV3ID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCB7IG1hcCwgc2VsZWN0aW9uSW50ZXJmYWNlIH0gPSBwcm9wc1xuICBjb25zdCBbbG9jYXRpb24sIHNldExvY2F0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIHVuZGVmaW5lZCBhcyB1bmRlZmluZWQgfCBMb2NhdGlvblR5cGVcbiAgKVxuICBjb25zdCBkcmFnUmVmID0gUmVhY3QudXNlUmVmKDApXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbcHJldmlld1RleHQsIHNldFByZXZpZXdUZXh0XSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIHVuZGVmaW5lZCBhcyB1bmRlZmluZWQgfCBzdHJpbmdcbiAgKVxuICBjb25zdCB7IGxpc3RlblRvIH0gPSB1c2VCYWNrYm9uZSgpXG5cbiAgY29uc3QgZ2V0VGFyZ2V0ID0gKCkgPT4ge1xuICAgIHJldHVybiBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0U2VsZWN0ZWRSZXN1bHRzKClcbiAgfVxuXG4gIGxldCBwb3B1cEFuaW1hdGlvbkZyYW1lSWQ6IGFueVxuICBjb25zdCBzdGFydFBvcHVwQW5pbWF0aW5nID0gKG1hcDogYW55KSA9PiB7XG4gICAgaWYgKGdldFRhcmdldCgpLmxlbmd0aCAhPT0gMCkge1xuICAgICAgcG9wdXBBbmltYXRpb25GcmFtZUlkID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZ2V0TG9jYXRpb24obWFwLCBnZXRUYXJnZXQoKSlcbiAgICAgICAgc2V0TG9jYXRpb24obG9jYXRpb24pXG4gICAgICAgIHN0YXJ0UG9wdXBBbmltYXRpbmcobWFwKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBjb25zdCBoYW5kbGVDYW1lcmFNb3ZlRW5kID0gKCkgPT4ge1xuICAgIGlmIChnZXRUYXJnZXQoKS5sZW5ndGggIT09IDApIHtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShwb3B1cEFuaW1hdGlvbkZyYW1lSWQpXG4gICAgfVxuICB9XG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsaXN0ZW5UbyhcbiAgICAgIHNlbGVjdGlvbkludGVyZmFjZS5nZXRTZWxlY3RlZFJlc3VsdHMoKSxcbiAgICAgICdyZXNldCBhZGQgcmVtb3ZlJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGlvbkludGVyZmFjZS5nZXRTZWxlY3RlZFJlc3VsdHMoKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBnZXRQcmV2aWV3VGV4dCh7XG4gICAgICAgICAgICB0YXJnZXRNZXRhY2FyZDogc2VsZWN0aW9uSW50ZXJmYWNlLmdldFNlbGVjdGVkUmVzdWx0cygpLm1vZGVsc1swXSxcbiAgICAgICAgICAgIHNldFByZXZpZXdUZXh0LFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgc2V0TG9jYXRpb24oZ2V0TG9jYXRpb24obWFwLCBnZXRUYXJnZXQoKSkpXG4gICAgICAgIGlmIChzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0U2VsZWN0ZWRSZXN1bHRzKCkubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgc2V0T3Blbih0cnVlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKVxuICAgIG1hcC5vbk1vdXNlVHJhY2tpbmdGb3JQb3B1cChcbiAgICAgICgpID0+IHtcbiAgICAgICAgZHJhZ1JlZi5jdXJyZW50ID0gMFxuICAgICAgfSxcbiAgICAgICgpID0+IHtcbiAgICAgICAgZHJhZ1JlZi5jdXJyZW50ICs9IDFcbiAgICAgIH0sXG4gICAgICAoX2V2ZW50OiBhbnksIG1hcFRhcmdldDogYW55KSA9PiB7XG4gICAgICAgIGlmIChEUkFHX1NFTlNJVElWSVRZID4gZHJhZ1JlZi5jdXJyZW50KSB7XG4gICAgICAgICAgc2V0T3BlbihtYXBUYXJnZXQubWFwVGFyZ2V0ICE9PSB1bmRlZmluZWQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApXG5cbiAgICBtYXAub25DYW1lcmFNb3ZlU3RhcnQoKCkgPT4ge1xuICAgICAgc3RhcnRQb3B1cEFuaW1hdGluZyhtYXApXG4gICAgfSlcbiAgICBtYXAub25DYW1lcmFNb3ZlRW5kKCgpID0+IHtcbiAgICAgIGhhbmRsZUNhbWVyYU1vdmVFbmQoKVxuICAgIH0pXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKHBvcHVwQW5pbWF0aW9uRnJhbWVJZClcbiAgICB9XG4gIH0sIFtdKVxuXG4gIGlmICghb3Blbikge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxSb290IHN0eWxlPXt7IGxlZnQ6IGdldExlZnQobG9jYXRpb24pLCB0b3A6IGdldFRvcChsb2NhdGlvbikgfX0+XG4gICAgICB7KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHNlbGVjdGlvbkludGVyZmFjZS5nZXRTZWxlY3RlZFJlc3VsdHMoKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICBjb25zdCBtZXRhY2FyZEpTT04gPSBzZWxlY3Rpb25JbnRlcmZhY2VcbiAgICAgICAgICAgIC5nZXRTZWxlY3RlZFJlc3VsdHMoKVxuICAgICAgICAgICAgLm1vZGVsc1swXS50b0pTT04oKVxuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8VGl0bGU+e21ldGFjYXJkSlNPTi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlfTwvVGl0bGU+XG4gICAgICAgICAgICAgIHtwcmV2aWV3VGV4dCAmJiAoXG4gICAgICAgICAgICAgICAgPFByZXZpZXc+XG4gICAgICAgICAgICAgICAgICA8UHJldmlld1RleHQ+e3ByZXZpZXdUZXh0fTwvUHJldmlld1RleHQ+XG4gICAgICAgICAgICAgICAgPC9QcmV2aWV3PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKVxuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdGlvbkludGVyZmFjZS5nZXRTZWxlY3RlZFJlc3VsdHMoKS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxDbHVzdGVyTGlzdD5cbiAgICAgICAgICAgICAge3NlbGVjdGlvbkludGVyZmFjZVxuICAgICAgICAgICAgICAgIC5nZXRTZWxlY3RlZFJlc3VsdHMoKVxuICAgICAgICAgICAgICAgIC5tYXAoKGNsdXN0ZXJNb2RlbDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8Q2x1c3RlclRpdGxlXG4gICAgICAgICAgICAgICAgICAgICAga2V5PXtjbHVzdGVyTW9kZWwuaWR9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLmNsZWFyU2VsZWN0ZWRSZXN1bHRzKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZS5hZGRTZWxlY3RlZFJlc3VsdChjbHVzdGVyTW9kZWwpXG4gICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHtjbHVzdGVyTW9kZWwudG9KU09OKCkubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9DbHVzdGVyVGl0bGU+XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICA8L0NsdXN0ZXJMaXN0PlxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH0pKCl9XG4gICAgPC9Sb290PlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IEhvb2tQb3B1cFByZXZpZXdcbiJdfQ==