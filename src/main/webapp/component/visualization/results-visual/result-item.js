import { __assign, __read } from "tslib";
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
import LazyMetacardInteractions from './lazy-metacard-interactions';
import IconHelper from '../../../js/IconHelper';
import user from '../../singletons/user-instance';
import Button from '@mui/material/Button';
import LinkIcon from '@mui/icons-material/Link';
import GetAppIcon from '@mui/icons-material/GetApp';
import Grid from '@mui/material/Grid';
import { hot } from 'react-hot-loader';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import MoreIcon from '@mui/icons-material/MoreVert';
import WarningIcon from '@mui/icons-material/Warning';
import { useBackbone } from '../../selection-checkbox/useBackbone.hook';
import { useRerenderOnBackboneSync, useSelectionOfLazyResult, } from '../../../js/model/LazyQueryResult/hooks';
import Extensions from '../../../extension-points';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckIcon from '@mui/icons-material/Check';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Elevations } from '../../theme/theme';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';
import { clearSelection, hasSelection } from './result-item-row';
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../../selection-interface/hooks';
import { TypedUserInstance } from '../../singletons/TypedUser';
import useCoordinateFormat from '../../tabs/metacard/useCoordinateFormat';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from '../../link/link';
import { useMenuState } from '../../menu-state/menu-state';
import Popover from '@mui/material/Popover';
import Common from '../../../js/Common';
import ExtensionPoints from '../../../extension-points/extension-points';
import { StartupDataStore } from '../../../js/model/Startup/startup';
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks';
var PropertyComponent = function (props) {
    return (React.createElement("div", __assign({}, props, { className: "overflow-auto", style: {
            marginTop: '10px',
            opacity: '.7',
            maxHeight: '200px',
            minHeight: '21px', // firefox will show scroll bars all the time unless we do this minHeight :S
        } })));
};
var showSource = function () {
    return (StartupDataStore.Configuration.getResultShow().find(function (additionalProperty) {
        return additionalProperty === 'source-id';
    }) !== undefined);
};
var showRelevanceScore = function (_a) {
    var lazyResult = _a.lazyResult;
    return (StartupDataStore.Configuration.getShowRelevanceScores() &&
        lazyResult.hasRelevance());
};
export var getIconClassName = function (_a) {
    var lazyResult = _a.lazyResult;
    if (lazyResult.isRevision()) {
        return 'fa fa-history';
    }
    else if (lazyResult.isResource()) {
        return IconHelper.getClassByMetacardObject(lazyResult.plain);
    }
    else if (lazyResult.isDeleted()) {
        return 'fa fa-trash';
    }
    return IconHelper.getClassByMetacardObject(lazyResult.plain);
};
// @ts-expect-error ts-migrate(6133) FIXME: 'MultiSelectActions' is declared but its value is ... Remove this comment to see the full error message
var MultiSelectActions = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var selectedResultsArray = Object.values(selectedResults);
    var metacardInteractionMenuState = useMenuState();
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, { component: "div", className: selectedResultsArray.length === 0 ? 'relative' : 'relative', color: "primary", disabled: selectedResultsArray.length === 0, onClick: function (e) {
                e.stopPropagation();
                metacardInteractionMenuState.handleClick();
            }, ref: metacardInteractionMenuState.anchorRef, style: { height: '100%' }, size: "small" },
            selectedResultsArray.length,
            " selected",
            React.createElement(MoreIcon, { className: "Mui-text-text-primary" })),
        React.createElement(Popover, __assign({}, metacardInteractionMenuState.MuiPopoverProps),
            React.createElement(Paper, null,
                React.createElement(LazyMetacardInteractions, { lazyResults: selectedResultsArray, onClose: metacardInteractionMenuState.handleClose })))));
};
var dynamicActionClasses = 'h-full';
var DynamicActions = function (_a) {
    var lazyResult = _a.lazyResult;
    var triggerDownload = function (e) {
        e.stopPropagation();
        window.open(lazyResult.getDownloadUrl());
    };
    var metacardInteractionMenuState = useMenuState();
    return (React.createElement(Grid, { container: true, direction: "column", wrap: "nowrap", alignItems: "center" },
        React.createElement(Grid, { item: true, className: "h-full" },
            React.createElement(Button, { component: "div", "data-id": "result-item-more-vert-button", onClick: function (e) {
                    e.stopPropagation();
                    metacardInteractionMenuState.handleClick();
                }, style: { height: '100%' }, size: "small", ref: metacardInteractionMenuState.anchorRef },
                React.createElement(MoreIcon, null)),
            React.createElement(Popover, __assign({}, metacardInteractionMenuState.MuiPopoverProps, { keepMounted: true }),
                React.createElement(Paper, null,
                    React.createElement(LazyMetacardInteractions, { lazyResults: [lazyResult], onClose: metacardInteractionMenuState.handleClose })))),
        React.createElement(Grid, { item: true, className: dynamicActionClasses }, lazyResult.hasErrors() ? (React.createElement("div", { "data-id": "validation-errors-icon", className: "h-full", title: "Has validation errors.", "data-help": "Indicates the given result has a validation error.\n                     See the 'Quality' tab of the result for more details." },
            React.createElement(WarningIcon, null))) : ('')),
        React.createElement(Grid, { item: true, className: dynamicActionClasses }, !lazyResult.hasErrors() && lazyResult.hasWarnings() ? (React.createElement("div", { "data-id": "validation-warnings-icon", className: "h-full", title: "Has validation warnings.", "data-help": "Indicates the given result has a validation warning.\n                     See the 'Quality' tab of the result for more details." },
            React.createElement(WarningIcon, null))) : ('')),
        React.createElement(Grid, { item: true, className: dynamicActionClasses }, lazyResult.plain.metacard.properties['ext.link'] ? (React.createElement(Button, { component: "div", title: lazyResult.plain.metacard.properties['ext.link'], onClick: function (e) {
                e.stopPropagation();
                window.open(lazyResult.plain.metacard.properties['ext.link']);
            }, style: { height: '100%' }, size: "small" },
            React.createElement(LinkIcon, null))) : null),
        React.createElement(Grid, { item: true, className: dynamicActionClasses }, lazyResult.getDownloadUrl() ? (React.createElement(Button, { component: "div", "data-id": "download-button", onClick: function (e) {
                e.stopPropagation();
                triggerDownload(e);
            }, style: { height: '100%' }, size: "small" },
            React.createElement(GetAppIcon, null))) : null),
        React.createElement(Extensions.resultItemTitleAddOn, { lazyResult: lazyResult }),
        React.createElement(Grid, { item: true, className: dynamicActionClasses }, lazyResult.isSearch() ? (React.createElement(Link, { component: Button, "data-id": "edit-button", to: "/search/".concat(lazyResult.plain.id), style: { height: '100%' } },
            React.createElement(EditIcon, null))) : null)));
};
export var SelectionBackground = function (_a) {
    var lazyResult = _a.lazyResult;
    var isSelected = useSelectionOfLazyResult({ lazyResult: lazyResult });
    return (React.createElement("div", { className: "absolute left-0 top-0 z-0 w-full h-full Mui-bg-secondary", style: {
            opacity: isSelected ? 0.05 : 0,
        } }));
};
var IconButton = function (_a) {
    var lazyResult = _a.lazyResult, selectionInterface = _a.selectionInterface, itemContentRef = _a.itemContentRef;
    var MetacardDefinitions = useMetacardDefinitions();
    var isSelected = useSelectionOfLazyResult({ lazyResult: lazyResult });
    var ResultItemAction = ExtensionPoints.resultItemAction({
        lazyResult: lazyResult,
        selectionInterface: selectionInterface,
        itemContentRef: itemContentRef,
        className: 'scale-0 absolute z-10 left-0 -translate-x-full ml-[3px] group-hover:scale-100 transition pt-1',
    });
    var extraClasses = ResultItemAction
        ? 'group-hover:scale-50 group-hover:-translate-x-[85%]'
        : '';
    return (React.createElement(React.Fragment, null,
        ResultItemAction && (React.createElement(ResultItemAction, { lazyResult: lazyResult, selectionInterface: selectionInterface, itemContentRef: itemContentRef })),
        React.createElement(Button, { component: "div", "data-id": "select-checkbox", onClick: function (event) {
                event.stopPropagation(); // this button takes precedence over the enclosing button, and is always additive / subtractive (no deselect of other results)
                if (event.shiftKey) {
                    lazyResult.shiftSelect();
                }
                else {
                    lazyResult.controlSelect();
                }
            }, focusVisibleClassName: "focus-visible", className: "relative p-2 min-w-0 outline-none h-full group/checkbox shrink-0" },
            (function () {
                if (isSelected) {
                    return (React.createElement(React.Fragment, null,
                        React.createElement("div", { className: "".concat(extraClasses, " absolute w-full h-full left-0 top-0 opacity-0 transform transition duration-200 ease-in-out -translate-x-full group-hover/checkbox:scale-100") },
                            React.createElement(CheckBoxIcon, { className: "group-hover/checkbox:block group-focus-visible/checkbox:block hidden" }),
                            React.createElement(CheckIcon, { className: "group-hover/checkbox:hidden group-focus-visible/checkbox:hidden block" })),
                        React.createElement("div", { className: "".concat(extraClasses, " transform transition duration-200 ease-in-out -translate-x-full group-focus-visible/checkbox:!translate-x-0 group-hover/checkbox:!translate-x-0 group-hover/checkbox:scale-100") },
                            React.createElement(CheckBoxIcon, { className: "group-hover/checkbox:block group-focus-visible/checkbox:block hidden" }),
                            React.createElement(CheckIcon, { className: "group-hover/checkbox:hidden group-focus-visible/checkbox:hidden block" }))));
                }
                else if (!isSelected) {
                    return (React.createElement("div", { className: "transform " },
                        React.createElement(CheckBoxOutlineBlankIcon, { className: "group-hover/checkbox:visible group-focus-visible/checkbox:visible invisible" })));
                }
                return null;
            })(),
            React.createElement("span", { className: "".concat(getIconClassName({
                    lazyResult: lazyResult,
                }), " font-awesome-span group-focus-visible/checkbox:invisible group-hover/checkbox:invisible absolute z-0 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"), "data-help": MetacardDefinitions.getAlias('title'), title: "".concat(MetacardDefinitions.getAlias('title'), ": ").concat(lazyResult.plain.metacard.properties.title) }))));
};
// factored out for easy debugging (can add bg-gray-400 to see trail)
var diagonalHoverClasses = 'absolute z-50 right-0 bottom-100 h-4 transform scale-0 group-hover:scale-100 transition-all absolute z-50 right-0 bottom-100';
// fake event to pass ripple.stop
var fakeEvent = {
    type: '',
};
export var ResultItem = function (_a) {
    var lazyResult = _a.lazyResult, measure = _a.measure, selectionInterface = _a.selectionInterface;
    var MetacardDefinitions = useMetacardDefinitions();
    var rippleRef = React.useRef(null);
    var listenTo = useBackbone().listenTo;
    var convertToPrecision = function (value) {
        return value && decimalPrecision
            ? Number(value).toFixed(decimalPrecision)
            : value;
    };
    var convertToFormat = useCoordinateFormat();
    var _b = __read(React.useState(false), 2), renderExtras = _b[0], setRenderExtras = _b[1]; // dynamic actions are a significant part of rendering time, so delay until necessary
    var _c = __read(React.useState(TypedUserInstance.getDecimalPrecision()), 2), decimalPrecision = _c[0], setDecimalPrecision = _c[1];
    var _d = __read(React.useState(TypedUserInstance.getResultsAttributesShownList()), 2), shownAttributes = _d[0], setShownAttributes = _d[1];
    useRerenderOnBackboneSync({ lazyResult: lazyResult });
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:results-attributesShownList', function () {
            setShownAttributes(TypedUserInstance.getResultsAttributesShownList());
        });
        listenTo(user.get('user').get('preferences'), 'change:decimalPrecision', function () {
            setDecimalPrecision(TypedUserInstance.getDecimalPrecision());
        });
    }, []);
    React.useEffect(function () {
        measure();
    }, [shownAttributes, convertToFormat]);
    var thumbnail = lazyResult.plain.metacard.properties.thumbnail;
    var imgsrc = Common.getImageSrc(thumbnail);
    var buttonRef = React.useRef(null);
    var itemContentRef = React.useRef(null);
    var ResultItemAddOnInstance = Extensions.resultItemRowAddOn({
        lazyResult: lazyResult,
        isTableView: false,
    });
    var ResultTitleIconAddOnInstance = Extensions.resultTitleIconAddOn({
        lazyResult: lazyResult,
    });
    var shouldShowRelevance = showRelevanceScore({ lazyResult: lazyResult });
    var shouldShowSource = showSource();
    var extraHighlights = Object.keys(lazyResult.highlights).filter(function (attr) { return !shownAttributes.find(function (shownAttribute) { return shownAttribute === attr; }); });
    var getDisplayValue = function (_a) {
        var detail = _a.detail, lazyResult = _a.lazyResult;
        var value = lazyResult.plain.metacard.properties[detail];
        if (value && MetacardDefinitions.getAttributeMap()[detail]) {
            switch (MetacardDefinitions.getAttributeMap()[detail].type) {
                case 'DATE':
                    if (value.constructor === Array) {
                        value = value.map(function (val) {
                            return TypedUserInstance.getMomentDate(val);
                        });
                    }
                    else {
                        value = TypedUserInstance.getMomentDate(value);
                    }
                    break;
                case 'GEOMETRY':
                    value = convertToFormat(value);
                case 'LONG':
                case 'DOUBLE':
                case 'FLOAT':
                    value = convertToPrecision(value);
            }
        }
        if (Array.isArray(value)) {
            value = value.join(', ');
        }
        return value;
    };
    var detailsMap = shownAttributes
        .slice(1) // remove top one since that's special
        .map(function (detail) {
        return {
            attribute: detail,
            value: getDisplayValue({ detail: detail, lazyResult: lazyResult }),
        };
    })
        .filter(function (detail) {
        // this is special and is handled differently, see show source
        if (detail.attribute === 'source-id') {
            return false;
        }
        return detail.value;
    });
    return (React.createElement("button", { "data-id": "result-item-container-button", onMouseDown: function (event) {
            /**
             * Shift key can cause selections since we set the class to allow text selection,
             * so the only scenario we want to prevent that in is when shift clicking
             */
            if (event.shiftKey) {
                clearSelection();
            }
            /**
             * Stop the ripple that starts on focus, that's only for navigating by keyboard
             */
            setTimeout(function () {
                if (rippleRef.current) {
                    rippleRef.current.stop(fakeEvent);
                }
            }, 0);
        }, onClick: function (event) {
            if (hasSelection()) {
                return;
            }
            if (event.shiftKey) {
                lazyResult.shiftSelect();
            }
            else if (event.ctrlKey || event.metaKey) {
                lazyResult.controlSelect();
            }
            else {
                lazyResult.select();
            }
            if (rippleRef.current) {
                rippleRef.current.start(event);
            }
            setTimeout(function () {
                if (rippleRef.current) {
                    rippleRef.current.stop(fakeEvent);
                }
            }, 200);
        }, onMouseLeave: function () {
            /**
             * This is to prevent weirdness with the dynamic actions, where clicking a menu option there adds focus,
             * thus making the dynamic actions stay visible when the user starts to mouse away.
             */
            try {
                if (document.activeElement &&
                    buttonRef.current &&
                    buttonRef.current.contains(document.activeElement)) {
                    ;
                    document.activeElement.blur();
                }
            }
            catch (err) {
                console.error(err);
            }
        }, onMouseEnter: function () {
            setRenderExtras(true);
        }, onFocus: function (e) {
            setRenderExtras(true);
            if (e.target === e.currentTarget && rippleRef.current) {
                rippleRef.current.pulsate();
            }
        }, onBlur: function (e) {
            if (rippleRef.current) {
                rippleRef.current.stop(e);
            }
        }, ref: buttonRef, className: "select-text outline-none px-6 pr-12 p-2 text-left break-words group w-full Mui-bg-button" },
        React.createElement("div", { className: "w-full" },
            React.createElement(TouchRipple, { ref: rippleRef }),
            React.createElement(SelectionBackground, { lazyResult: lazyResult }),
            React.createElement("div", { className: "w-full relative z-0", ref: itemContentRef },
                React.createElement("div", { className: "w-full flex items-start" },
                    React.createElement(IconButton, { lazyResult: lazyResult, selectionInterface: selectionInterface, itemContentRef: itemContentRef }),
                    ResultTitleIconAddOnInstance && (React.createElement("div", { className: "pt-2 pr-1" }, ResultTitleIconAddOnInstance)),
                    React.createElement("div", { "data-id": "result-item-".concat(shownAttributes[0], "-label"), title: "".concat(MetacardDefinitions.getAlias(shownAttributes[0])), className: "shrink-1 w-full overflow-auto self-center", style: { maxHeight: '200px', minHeight: '21px' } }, shownAttributes[0] === 'thumbnail' && thumbnail ? (React.createElement("img", { "data-id": "result-item-thumbnail", src: imgsrc, style: { maxWidth: '100%', maxHeight: '200px' }, onLoad: function () {
                            measure();
                        }, onError: function () {
                            measure();
                        } })) : lazyResult.highlights[shownAttributes[0]] ? (React.createElement("span", { dangerouslySetInnerHTML: {
                            __html: lazyResult.highlights[shownAttributes[0]][0].highlight,
                        } })) : (getDisplayValue({ detail: shownAttributes[0], lazyResult: lazyResult })))),
                React.createElement("div", { className: "pl-3 ".concat(ResultItemAddOnInstance !== null ||
                        detailsMap.length > 0 ||
                        extraHighlights.length > 0 ||
                        shouldShowRelevance ||
                        shouldShowSource
                        ? 'pb-2'
                        : '') },
                    React.createElement("div", null, ResultItemAddOnInstance),
                    React.createElement("div", null,
                        detailsMap.map(function (detail) {
                            if (detail.attribute === 'thumbnail') {
                                return (React.createElement("img", { key: detail.attribute, "data-id": "result-item-thumbnail", src: imgsrc, style: {
                                        marginTop: '10px',
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                    }, onLoad: function () {
                                        measure();
                                    }, onError: function () {
                                        measure();
                                    } }));
                            }
                            return (React.createElement(PropertyComponent, { key: detail.attribute, "data-help": MetacardDefinitions.getAlias(detail.attribute), title: "".concat(MetacardDefinitions.getAlias(detail.attribute), ": ").concat(detail.value) },
                                React.createElement("span", null, lazyResult.highlights[detail.attribute] ? (React.createElement("span", { dangerouslySetInnerHTML: {
                                        __html: lazyResult.highlights[detail.attribute][0]
                                            .highlight,
                                    } })) : (getDisplayValue({
                                    detail: detail.attribute,
                                    lazyResult: lazyResult,
                                })))));
                        }),
                        extraHighlights.map(function (extraHighlight) {
                            var relevantHighlight = lazyResult.highlights[extraHighlight][0];
                            return (React.createElement(PropertyComponent, { key: relevantHighlight.attribute, "data-help": MetacardDefinitions.getAlias(relevantHighlight.attribute) },
                                React.createElement(Tooltip, { title: MetacardDefinitions.getAlias(relevantHighlight.attribute) },
                                    React.createElement("span", { dangerouslySetInnerHTML: {
                                            __html: relevantHighlight.highlight,
                                        } }))));
                        }),
                        shouldShowRelevance ? (React.createElement(PropertyComponent, { "data-help": "Relevance: ".concat(lazyResult.plain.relevance), title: "Relevance: ".concat(lazyResult.plain.relevance) },
                            React.createElement("span", null, lazyResult.getRoundedRelevance()))) : (''),
                        shouldShowSource ? (React.createElement(PropertyComponent, { title: "".concat(MetacardDefinitions.getAlias('source-id'), ": ").concat(lazyResult.plain.metacard.properties['source-id']), "data-help": MetacardDefinitions.getAlias('source-id') }, !lazyResult.isRemote() ? (React.createElement(React.Fragment, null,
                            React.createElement("span", { className: "fa fa-home" }),
                            React.createElement("span", { style: { marginLeft: '5px' } }, "local"))) : (React.createElement(React.Fragment, null,
                            React.createElement("span", { className: "fa fa-cloud" }),
                            React.createElement("span", { style: { marginLeft: '5px' } }, lazyResult.plain.metacard.properties['source-id']))))) : ('')))),
            renderExtras ? (React.createElement(React.Fragment, null,
                ' ',
                React.createElement("div", { className: "".concat(diagonalHoverClasses, " w-full transform translate-y-1") }),
                React.createElement("div", { className: "".concat(diagonalHoverClasses, " w-9/12 transform translate-y-2 ") }),
                React.createElement("div", { className: "".concat(diagonalHoverClasses, " w-6/12 transform translate-y-3") }),
                React.createElement("div", { className: "".concat(diagonalHoverClasses, " w-5/12 transform translate-y-4") }),
                React.createElement("div", { className: "".concat(diagonalHoverClasses, " w-4/12 transform translate-y-5") }),
                React.createElement("div", { className: "".concat(diagonalHoverClasses, " w-3/12 transform translate-y-6") }),
                React.createElement("div", { className: "".concat(diagonalHoverClasses, " w-2/12 transform translate-y-8") }),
                React.createElement("div", { className: "absolute z-40 group-hover:z-50 focus-within:z-50 right-0 top-0 focus-within:opacity-100 group-hover:opacity-100 hover:opacity-100 opacity-0 cursor-auto transform focus-within:scale-100 transition-all hover:scale-100 ease-in-out duration-200 hover:translate-x-0 hover:scale-x-100" },
                    React.createElement(Paper, { onClick: function (e) {
                            e.stopPropagation();
                        }, elevation: Elevations.overlays, className: "p-2" },
                        React.createElement(DynamicActions, { lazyResult: lazyResult }))))) : null)));
};
export default hot(module)(ResultItem);
//# sourceMappingURL=result-item.js.map