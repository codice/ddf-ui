import { __makeTemplateObject, __read, __spreadArray } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as d3 from 'd3';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Tooltip } from './tooltip';
import { range, formatDate, dateWithinRange, convertToDisplayable, multiFormat, } from './util';
import { useSelectionRange } from './hooks';
import _ from 'lodash';
import styled from 'styled-components';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { lighten } from 'polished';
import { readableColor } from 'polished';
import moment from 'moment-timezone';
// Constants
var AXIS_MARGIN = 20;
var AXIS_HEIGHT = 15;
// Color Theme
var ContextRow = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: flex;\n  justify-content: space-between;\n  margin-top: 10px;\n"], ["\n  display: flex;\n  justify-content: space-between;\n  margin-top: 10px;\n"])));
var HoverLineText = styled.text(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  fill: ", ";\n  font-family: 'Open Sans', sans-serif;\n  pointer-events: none;\n"], ["\n  fill: ", ";\n  font-family: 'Open Sans', sans-serif;\n  pointer-events: none;\n"])), function (_a) {
    var theme = _a.theme;
    return readableColor(theme.backgroundContent);
});
var HoverLine = styled.line(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  stroke: ", ";\n  stroke-width: 3;\n  pointer-events: none;\n"], ["\n  stroke: ", ";\n  stroke-width: 3;\n  pointer-events: none;\n"])), function (_a) {
    var theme = _a.theme;
    return theme.primaryColor;
});
var MarkerHover = styled.g(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  :hover {\n    cursor: ew-resize;\n  }\n"], ["\n  :hover {\n    cursor: ew-resize;\n  }\n"])));
var MarkerLine = styled.line(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  stroke: ", ";\n  stroke-width: ", ";\n"], ["\n  stroke: ", ";\n  stroke-width: ", ";\n"])), function (props) {
    return !props.hidden
        ? lighten(0.1, props.theme.primaryColor)
        : 'rgba(0, 0, 0, 0)';
}, function (props) { return (!props.hidden ? 2 : 18); });
var TimelineButton = styled(Button)(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  display: flex;\n  justify-content: center;\n  font-family: 'Open Sans', sans-serif;\n  min-width: 3rem;\n  height: 3rem;\n\n  ", " :hover {\n  }\n\n  :focus {\n    outline: none;\n  }\n"], ["\n  display: flex;\n  justify-content: center;\n  font-family: 'Open Sans', sans-serif;\n  min-width: 3rem;\n  height: 3rem;\n\n  ", " :hover {\n  }\n\n  :focus {\n    outline: none;\n  }\n"])), function (_a) {
    var icon = _a.icon;
    return !icon &&
        "\n      font-size: 1rem;\n      padding: 0px 20px;\n      margin-left: 15px !important;\n    ";
});
var DateAttributeSelect = styled(Select)(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  margin: 10px;\n  visibility: ", ";\n"], ["\n  margin: 10px;\n  visibility: ", ";\n"])), function (props) { return (props.visible ? 'visible' : 'hidden'); });
var ButtonArea = styled.div(templateObject_8 || (templateObject_8 = __makeTemplateObject(["\n  margin: 10px;\n  display: flex;\n  justify-content: flex-end;\n  margin-right: 20px;\n\n  button {\n    margin-left: 5px;\n  }\n"], ["\n  margin: 10px;\n  display: flex;\n  justify-content: flex-end;\n  margin-right: 20px;\n\n  button {\n    margin-left: 5px;\n  }\n"])));
var Root = styled.div(templateObject_9 || (templateObject_9 = __makeTemplateObject(["\n  display: flex;\n  flex-direction: column;\n\n  .brushBar {\n    /* This will let you select/hover records behind area, but can't brush-drag area if it's set. */\n    pointer-events: none;\n    opacity: 0.5;\n\n    /* If it's discovered that brush dragging is wanted more than hovering behind the highlighted brush area, \n    simply comment the above lines and uncomment this opacity */\n    /* opacity: 0.1; */\n    fill: ", ";\n    display: none;\n\n    :hover {\n      cursor: move;\n      fill: ", ";\n      opacity: 0.5;\n    }\n  }\n\n  .axis {\n    color: ", ";\n    font-size: 0.9rem;\n    :hover {\n      cursor: ew-resize;\n    }\n  }\n\n  .selected {\n    fill: ", " !important;\n  }\n\n  .data {\n    fill: ", ";\n    fill-opacity: 0.7;\n    :hover {\n      stroke-width: 2px;\n      stroke: ", ";\n    }\n  }\n"], ["\n  display: flex;\n  flex-direction: column;\n\n  .brushBar {\n    /* This will let you select/hover records behind area, but can't brush-drag area if it's set. */\n    pointer-events: none;\n    opacity: 0.5;\n\n    /* If it's discovered that brush dragging is wanted more than hovering behind the highlighted brush area, \n    simply comment the above lines and uncomment this opacity */\n    /* opacity: 0.1; */\n    fill: ", ";\n    display: none;\n\n    :hover {\n      cursor: move;\n      fill: ", ";\n      opacity: 0.5;\n    }\n  }\n\n  .axis {\n    color: ", ";\n    font-size: 0.9rem;\n    :hover {\n      cursor: ew-resize;\n    }\n  }\n\n  .selected {\n    fill: ", " !important;\n  }\n\n  .data {\n    fill: ", ";\n    fill-opacity: 0.7;\n    :hover {\n      stroke-width: 2px;\n      stroke: ", ";\n    }\n  }\n"])), function (_a) {
    var theme = _a.theme;
    return theme.primaryColor;
}, function (_a) {
    var theme = _a.theme;
    return theme.primaryColor;
}, function (_a) {
    var theme = _a.theme;
    return readableColor(theme.backgroundContent);
}, function (_a) {
    var theme = _a.theme;
    return theme.primaryColor;
}, function (_a) {
    var theme = _a.theme.theme;
    return theme === 'dark' ? lighten(0.7, 'black') : lighten(0.3, 'black');
}, function (_a) {
    var theme = _a.theme;
    return theme.primaryColor;
});
var TimeText = styled.div(templateObject_10 || (templateObject_10 = __makeTemplateObject(["\n  margin: 10px;\n  font-family: 'Open Sans', sans-serif;\n  text-align: center;\n\n  br {\n    line-height: 150%;\n  }\n"], ["\n  margin: 10px;\n  font-family: 'Open Sans', sans-serif;\n  text-align: center;\n\n  br {\n    line-height: 150%;\n  }\n"])));
var Message = styled.span(templateObject_11 || (templateObject_11 = __makeTemplateObject(["\n  font-family: 'Open Sans', sans-serif;\n  margin: 10px;\n  color: ", ";\n"], ["\n  font-family: 'Open Sans', sans-serif;\n  margin: 10px;\n  color: ", ";\n"
    // Helper Methods
])), function (_a) {
    var theme = _a.theme;
    return readableColor(theme.backgroundContent);
});
// Helper Methods
var generateTooltipMessage = function (data) {
    var titles = data.slice(0, 5).map(function (d) {
        return (_jsxs(React.Fragment, { children: [_jsx("span", { children: d }), _jsx("br", {})] }));
    });
    var otherResults = (_jsxs(React.Fragment, { children: [_jsx("br", {}), "+".concat(data.length - 5, " other results")] }));
    return (_jsxs(React.Fragment, { children: [titles, data.length > 5 && otherResults] }));
};
/**
 * Given a d3 selection, set the display to none.
 */
var hideElement = function (element) {
    return element.attr('style', 'display: none');
};
/**
 * Given a d3 selection, set the display to block.
 */
var showElement = function (element) {
    return element.attr('style', 'display: block');
};
/**
 * Domain is the minimum and maximum values that the scale contains.
 */
var getTimescaleFromWidth = function (width, min, max) {
    if (min === void 0) { min = moment('1980-01-01:00:00.000z'); }
    if (max === void 0) { max = moment(); }
    var timeScale = d3.scaleUtc().domain([min, max]).nice();
    timeScale.range([AXIS_MARGIN, width - AXIS_MARGIN]);
    return timeScale;
};
var getPossibleDateAttributes = function (timelineItems) {
    return _(timelineItems)
        .map(function (d) { return d.attributes; }) //{created: {display: "Created", value: new Date()}}
        .flatMap(function (o) { return Object.keys(o); }) //[created]
        .uniq()
        .value();
};
/*
 * TODOS
 * --------------------
 *
 * 1. On hover should work when the on hover is behind the area marker while still letting you brush drag (if possible)
 */
// Please see https://alignedleft.com/tutorials/d3/scales for more information about d3 scales.
export var Timeline = function (props) {
    /**
     * The useRef Hook creates a variable that "holds on" to a value across rendering
     * passes. In this case it will hold our component's SVG DOM element. It's
     * initialized null and React will assign it later (see the return statement)
     */
    var rootRef = useRef(null);
    var d3ContainerRef = useRef(null);
    var hoverLineRef = useRef(null);
    var hoverLineTextRef = useRef(null);
    var leftMarkerRef = useRef(null);
    var rightMarkerRef = useRef(null);
    var brushBarRef = useRef(null);
    var min = props.min, max = props.max;
    var _a = __read(useState(0), 2), width = _a[0], setWidth = _a[1];
    var height = props.height;
    var heightOffset = props.heightOffset ? props.heightOffset : 0;
    var possibleDateAttributes = getPossibleDateAttributes(props.data || []);
    var timescale = getTimescaleFromWidth(width, min, max);
    var _b = __read(useState(function () { return timescale; }), 2), xScale = _b[0], setXScale = _b[1];
    var _c = __read(useState(function () {
        return d3.axisBottom(xScale).tickSize(AXIS_HEIGHT).tickFormat(multiFormat);
    }), 2), xAxis = _c[0], setXAxis = _c[1];
    var _d = __read(useState([]), 2), dataBuckets = _d[0], setDataBuckets = _d[1];
    var _e = __read(useState(), 2), tooltip = _e[0], setTooltip = _e[1];
    var _f = __read(useState(''), 2), selectedDateAttribute = _f[0], setSelectedDateAttribute = _f[1];
    useEffect(function () {
        if (selectedDateAttribute === '' && possibleDateAttributes.length > 0) {
            setSelectedDateAttribute(possibleDateAttributes[0]);
        }
    }, [possibleDateAttributes]);
    var _g = __read(useState(false), 2), isDragging = _g[0], setIsDragging = _g[1];
    var _h = __read(useSelectionRange([], timescale), 2), selectionRange = _h[0], setSelectionRange = _h[1];
    useEffect(function () {
        if (width != 0) {
            console.debug("Width updated to ".concat(width));
            setXScale(function () { return timescale; });
        }
    }, [width]);
    useEffect(function () {
        console.debug("xScale updated to ".concat(xScale.range()));
        var _a = __read(xScale.range(), 2), left = _a[0], right = _a[1];
        if (left < right) {
            var newXAxis_1 = xAxis.scale(xScale);
            setXAxis(function () { return newXAxis_1; });
            d3.select('.axis--x').call(newXAxis_1);
        }
    }, [xScale, props.timezone, props.format]);
    useEffect(function () {
        if (rootRef.current) {
            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
            var rect = rootRef.current.getBoundingClientRect();
            setWidth(rect.width);
        }
    }, [rootRef]);
    /**
     * Every 100 ms, poll to see the new parent rect width.
     * If the new parent rect width is different than current width, update the width.
     */
    useEffect(function () {
        var interval = setInterval(function () {
            if (rootRef.current) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                var rect = rootRef.current.getBoundingClientRect();
                if (rect.width !== width) {
                    setWidth(rect.width);
                    clearInterval(interval);
                }
            }
        }, 100);
    }, [rootRef, width]);
    useEffect(function () {
        zoomBehavior.scaleTo(d3.select(d3ContainerRef.current).transition().duration(0), 1);
    }, [width]);
    var markerHeight = height - 70 - AXIS_HEIGHT - heightOffset;
    /**
     * When a zoom event is triggered, use the transform event to create a new xScale,
     * then create a new xAxis using the scale and update existing xAxis
     */
    var handleZoom = function (event) {
        // Tooltip sticks around without this.
        setTooltip(null);
        var transform = event.transform;
        if (width != 0) {
            var newXScale_1 = transform.rescaleX(timescale);
            setXScale(function () { return newXScale_1; });
            var newXAxis_2 = xAxis.scale(newXScale_1);
            setXAxis(function () { return newXAxis_2; });
            // Apply the new xAxis
            d3.select('.axis--x').call(xAxis);
        }
    };
    var zoomBehavior = d3
        .zoom()
        .scaleExtent([1, 24 * 60 * 60])
        .translateExtent([
        [0, 0],
        [width, height],
    ])
        .extent([
        [0, 0],
        [width, height],
    ])
        .filter(function (event) {
        // Allow wheel events, on axis or not
        if (event.type === 'wheel') {
            return true;
        }
        // Check if event is on axis
        var clickedOnAxis = event.target.closest('#axis') !== null;
        console.debug('Clicked On Axis: ', clickedOnAxis);
        // Block all pan behavior if not clicking on axis (we are brushing instead)
        return clickedOnAxis;
    })
        .on('zoom', handleZoom);
    var zoomIn = function () {
        zoomBehavior.scaleBy(d3.select(d3ContainerRef.current).transition().duration(750), 2);
    };
    var zoomOut = function () {
        zoomBehavior.scaleBy(d3.select(d3ContainerRef.current).transition().duration(750), 0.5);
    };
    useEffect(function () {
        /**
         * Range is the range of possible output values used in display.
         * Domain maps to Range
         * i.e. Dates map to Pixels
         */
        var renderInitialXAxis = function () {
            var svg = d3
                .select(d3ContainerRef.current)
                .attr('width', width)
                .attr('height', height);
            svg
                .select('.axis--x')
                .attr('transform', "translate(0 ".concat(height - (AXIS_MARGIN + AXIS_HEIGHT + heightOffset), ")"))
                .call(xAxis);
        };
        if (d3ContainerRef.current) {
            renderInitialXAxis();
            var container = d3.select(d3ContainerRef.current);
            container.call(zoomBehavior);
        }
    }, [height, width]);
    // Add mouse handlers to listen to d3 mouse events
    useEffect(function () {
        d3.select(d3ContainerRef.current).on('mousemove', function (event) {
            var coord = d3.pointer(event);
            d3.select(hoverLineRef.current)
                .attr('transform', "translate(".concat(coord[0], ", ").concat(markerHeight, ")"))
                .attr('style', 'display: block');
            var hoverDate = moment.tz(xScale.invert(coord[0]), props.timezone);
            var formattedDate = formatDate(hoverDate, props.format);
            var widthBuffer = 150;
            var maxX = width - widthBuffer;
            var xPos = coord[0];
            if (xPos < widthBuffer)
                xPos = widthBuffer;
            if (xPos > maxX)
                xPos = maxX;
            var yPos = 20;
            d3.select(hoverLineTextRef.current)
                .attr('transform', "translate(".concat(xPos, ", ").concat(yPos, ")"))
                .attr('style', 'display: block')
                .attr('text-anchor', 'middle')
                .text(formattedDate);
        });
        // When the d3Container mouseleave event triggers, set the hoverValue to null and hide the hoverLine line
        d3.select(d3ContainerRef.current).on('mouseleave', function () {
            hideElement(d3.select(hoverLineRef.current));
            hideElement(d3.select(hoverLineTextRef.current));
        });
    }, [xScale, props.timezone, props.format, props.height]);
    // Render rectangles
    useEffect(function () {
        var min = xScale.range()[0];
        var max = xScale.range()[1];
        var NUM_BUCKETS = Math.round(width / 30); // 30 is just a constant that I found to look good.
        var bucketWidth = (max - min) / NUM_BUCKETS;
        var buckets = range(NUM_BUCKETS).map(function (i) { return ({
            x1: min + bucketWidth * i,
            x2: min + bucketWidth * (i + 1),
            items: [],
            selected: false,
        }); });
        if (props.data && selectedDateAttribute !== undefined) {
            d3.selectAll('.data').remove();
            props.data.forEach(function (d) {
                var date = d.attributes[selectedDateAttribute];
                if (date == null) {
                    return;
                }
                var scaledDates = date.map(function (d) { return xScale(d); });
                scaledDates.forEach(function (scaledDate) {
                    for (var i = 0; i < buckets.length; i++) {
                        var b = buckets[i];
                        if (b.x1 < scaledDate && scaledDate < b.x2) {
                            b.items.push(d);
                            if (d.selected) {
                                b.selected = true;
                            }
                            break;
                        }
                    }
                });
            });
            var mostItemsInABucket = Math.max.apply(Math, __spreadArray([], __read(buckets.map(function (b) { return b.items.length; })), false));
            var heightPerItem_1 = (height - (heightOffset + 75)) / mostItemsInABucket;
            setDataBuckets(buckets);
            buckets.forEach(function (b, i) {
                if (b.items.length === 0 || heightPerItem_1 <= 0) {
                    return;
                }
                var rectangleHeight = b.items.length * heightPerItem_1;
                var x = (b.x1 + b.x2) / 2 - 15;
                var y = height - rectangleHeight - (AXIS_MARGIN + AXIS_HEIGHT + heightOffset);
                d3.select('.data-holder')
                    .append('rect')
                    .attr('class', "data ".concat(b.selected ? 'selected' : ''))
                    .attr('width', bucketWidth - 5)
                    .attr('height', rectangleHeight)
                    .attr('id', i)
                    .attr('transform', "translate(".concat(x, ", ").concat(y, ")"))
                    .append('rect');
            });
        }
    }, [props.data, xScale, selectedDateAttribute, width, height]);
    useEffect(function () {
        d3.select('.data-holder')
            .selectAll('.data')
            .on('mouseleave', function () {
            setTooltip(null);
        })
            .on('mousemove', function (event) {
            var id = event.target.id;
            var x = event.offsetX;
            var y = event.offsetY;
            var tooltipInBounds = x <= width * 0.75;
            setTooltip({
                x: tooltipInBounds ? x + 25 : x - width * 0.25, // handles tooltip going off screen
                y: y - 20,
                message: props.renderTooltip
                    ? props.renderTooltip(dataBuckets[id].items)
                    : generateTooltipMessage(dataBuckets[id].items.map(function (d) { return d.id; })),
            });
        });
    }, [dataBuckets]);
    // If dragging is finished, update selected results.
    useEffect(function () {
        if (!isDragging &&
            props.data &&
            selectedDateAttribute !== undefined &&
            !props.mode) {
            if (selectionRange.length == 2) {
                var x1_1 = xScale(selectionRange[0]);
                var x2_1 = xScale(selectionRange[1]);
                // Prefilter to only buckets we care about
                var bucketsContainingRelevantData = dataBuckets.filter(function (b) {
                    return (x1_1 < b.x1 && b.x2 < x2_1) ||
                        (b.x1 < x1_1 && x1_1 < b.x2) ||
                        (b.x1 < x2_1 && x2_1 < b.x2);
                });
                // Get the data inside those buckets that falls within the selection
                var dataToSelect = _.flatMap(bucketsContainingRelevantData, function (b) { return b.items; }).filter(function (d) {
                    return d.attributes[selectedDateAttribute].some(function (moment) {
                        return dateWithinRange(moment, selectionRange);
                    });
                });
                props.onSelect && props.onSelect(dataToSelect);
            }
        }
    }, [isDragging]);
    useEffect(function () {
        /**
         * Selection Drag does two things:
         * 1. When the user drags across the timeline, a range selection will be created.
         * 2. If the drag event is only 5 pixels or less from start to finish AND ends on a rect object,
         * assume that the user meant to click instead of drag, and properly trigger a click action on the rect.
         */
        var getSelectionDrag = function () {
            var clickStart;
            return d3
                .drag()
                .filter(function (event) {
                // block events if they're on the axis
                var clickedOnAxis = event.target.closest('#axis') !== null;
                console.debug('Clicked On Axis: ', clickedOnAxis);
                // Allow all events not on the axis
                return !clickedOnAxis;
            })
                .on('start', function (event) {
                clickStart = event.x;
                var newLeftDate = moment.tz(xScale.invert(clickStart), props.timezone);
                if (props.mode === 'single') {
                    setSelectionRange([newLeftDate]);
                }
                else {
                    setIsDragging(true);
                    hideElement(d3.select(hoverLineRef.current));
                    hideElement(d3.select(hoverLineTextRef.current));
                    setSelectionRange([newLeftDate]);
                }
            })
                .on('drag', function (event) {
                if (props.mode !== 'single') {
                    var diff = event.x - event.subject.x;
                    var initialDate = moment.tz(xScale.invert(clickStart), props.timezone);
                    var dragCurrent = clickStart + diff;
                    var dragDate = moment.tz(xScale.invert(dragCurrent), props.timezone);
                    if (diff > 0) {
                        setSelectionRange([initialDate, dragDate]);
                    }
                    else {
                        setSelectionRange([dragDate, initialDate]);
                    }
                }
            })
                .on('end', function (event) {
                if (!props.mode) {
                    showElement(d3.select(hoverLineRef.current));
                    setIsDragging(false);
                    var clickDistance = clickStart - event.x;
                    var sourceEvent = event.sourceEvent;
                    if (Math.abs(clickDistance) < 5) {
                        var nodeName = sourceEvent.target.nodeName;
                        setSelectionRange([]);
                        if (nodeName === 'rect' || nodeName === 'line') {
                            var x_1 = event.x;
                            var bucket = dataBuckets.find(function (b) { return b.x1 < x_1 && x_1 <= b.x2; });
                            bucket && props.onSelect && props.onSelect(bucket.items);
                        }
                    }
                }
            });
        };
        // Apply drag behavior to both the overlay and data-holder
        d3.select(d3ContainerRef.current)
            .select('.brush-overlay')
            .call(getSelectionDrag());
        d3.select(d3ContainerRef.current)
            .select('.data-holder')
            .call(getSelectionDrag());
    }, [dataBuckets, selectionRange, xScale, props.timezone, props.format]);
    useEffect(function () {
        /**
         * Creates the drag behavior used when selecting the left or right slider.
         *
         * Validation for sliders:
         * - Left slider cannot be within 10 pixels of the right slider.
         * - Right slider cannot be within 10 pixels of the left slider.
         *
         * @param slider - Which slider the drag behavior should affect.
         */
        var getEdgeDrag = function (slider) {
            return d3
                .drag()
                .on('start', function () {
                hideElement(d3.select(hoverLineRef.current));
                hideElement(d3.select(hoverLineTextRef.current));
                setIsDragging(true);
            })
                .on('end', function () { return setIsDragging(false); })
                .on('drag', function (event) {
                var dragValue = xScale.invert(event.x);
                var dateWithTimezone = moment.tz(dragValue, props.timezone);
                var BUFFER = 10; // Buffer in pixels to keep sliders from overlapping/crossing
                if (slider === 'LEFT') {
                    var maximumX = xScale(selectionRange[1]) - BUFFER;
                    if (event.x <= maximumX) {
                        setSelectionRange([dateWithTimezone, selectionRange[1]]);
                    }
                }
                else if (slider === 'RIGHT') {
                    var minimumX = xScale(selectionRange[0]) + BUFFER;
                    if (event.x >= minimumX) {
                        setSelectionRange([selectionRange[0], dateWithTimezone]);
                    }
                }
            });
        };
        d3.select(leftMarkerRef.current).call(getEdgeDrag('LEFT'));
        d3.select(rightMarkerRef.current).call(getEdgeDrag('RIGHT'));
    }, [xScale, selectionRange, props.timezone]);
    useEffect(function () {
        /**
         * Create the drag behavior used when selecting the middle area between a range.
         *
         * NOTE: This will not be used if .brushBar class has 'pointer-events: none' set, as the events will never be hit.
         */
        var getBrushDrag = function () {
            return d3
                .drag()
                .on('start', function () {
                setIsDragging(true);
                hideElement(d3.select(hoverLineRef.current));
                hideElement(d3.select(hoverLineTextRef.current));
            })
                .on('end', function () { return setIsDragging(false); })
                .on('drag', function (event) {
                var value = event.x - event.subject.x;
                var currentLeft = xScale(selectionRange[0]);
                var currentRight = xScale(selectionRange[1]);
                var newLeft = currentLeft + value;
                var newRight = currentRight + value;
                var newLeftDate = moment.tz(xScale.invert(newLeft), props.timezone);
                var newRightDate = moment.tz(xScale.invert(newRight), props.timezone);
                setSelectionRange([newLeftDate, newRightDate]);
            });
        };
        d3.select(brushBarRef.current).call(getBrushDrag());
    }, [xScale, selectionRange, props.timezone]);
    // When the selection range is changed or the scale changes update the left, right, and brush markers
    useEffect(function () {
        if (leftMarkerRef.current &&
            rightMarkerRef.current &&
            brushBarRef.current) {
            var leftMarker = d3.select(leftMarkerRef.current);
            var rightMarker = d3.select(rightMarkerRef.current);
            var brushBar = d3.select(brushBarRef.current);
            if (props.mode === 'single' && selectionRange.length === 1) {
                var leftMarker_1 = d3.select(leftMarkerRef.current);
                var leftValue = selectionRange[0];
                leftMarker_1
                    .attr('transform', "translate(".concat(xScale(leftValue), ", ").concat(markerHeight, ")"))
                    .attr('style', 'display: block');
            }
            else if (props.mode !== 'single' && selectionRange.length == 2) {
                var _a = __read(selectionRange, 2), leftValue = _a[0], rightValue = _a[1];
                leftMarker
                    .attr('transform', "translate(".concat(xScale(leftValue), ", ").concat(markerHeight, ")"))
                    .attr('style', 'display: block');
                rightMarker
                    .attr('transform', "translate(".concat(xScale(rightValue), ", ").concat(markerHeight, ")"))
                    .attr('style', 'display: block');
                brushBar
                    .attr('transform', "translate(".concat(xScale(leftValue), ",").concat(markerHeight, ")"))
                    .attr('width', xScale(rightValue) - xScale(leftValue))
                    .attr('height', '50')
                    .attr('style', 'display: block');
            }
            else {
                hideElement(leftMarker);
                hideElement(rightMarker);
                hideElement(brushBar);
            }
        }
    }, [xScale, selectionRange, props.mode, props.height, props.timezone]);
    var renderCopyableDate = function (date) {
        var formattedDate = convertToDisplayable(date, props.timezone, props.format);
        return (_jsxs(_Fragment, { children: [_jsx("br", {}), _jsx(Button, { variant: "contained", onClick: function () {
                        var hiddenTextArea = document.createElement('textarea');
                        hiddenTextArea.innerText = formattedDate;
                        document.body.appendChild(hiddenTextArea);
                        hiddenTextArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(hiddenTextArea);
                        props.onCopy && props.onCopy(formattedDate);
                    }, children: formattedDate })] }));
    };
    var renderContext = function () {
        var renderStartAndEnd = function () { return (_jsxs(React.Fragment, { children: [_jsxs(TimeText, { children: [_jsx("b", { children: "Start" }), selectionRange[0] && renderCopyableDate(selectionRange[0])] }), _jsxs(TimeText, { children: [_jsx("b", { children: "End" }), selectionRange[1] && renderCopyableDate(selectionRange[1])] })] })); };
        // Single States - Empty, Single Time
        if (props.mode === 'single') {
            if (!selectionRange[0]) {
                return (_jsx(Message, { children: "Click to select a time. Zoom with the scroll wheel." }));
            }
            return (_jsxs(TimeText, { children: [_jsx("b", { children: "Time" }), selectionRange[0] && renderCopyableDate(selectionRange[0])] }));
            // Range States - Empty, Range of Times
        }
        else if (props.mode === 'range') {
            if (!selectionRange[0]) {
                return (_jsx(Message, { children: "Drag to select a range. Zoom with the scroll wheel." }));
            }
            return renderStartAndEnd();
            // Selection States - Empty, Start Time, Start + End Times
        }
        else {
            if (!selectionRange[0]) {
                return (_jsx(Message, { children: "Click to select a cluster of results. Zoom with the scroll wheel." }));
            }
            return renderStartAndEnd();
        }
    };
    var lookupAlias = function (attribute) {
        var dateAttributeAliases = props.dateAttributeAliases;
        if (dateAttributeAliases && dateAttributeAliases[attribute]) {
            return dateAttributeAliases[attribute];
        }
        else {
            return attribute;
        }
    };
    var brushOverlayWidth = Math.max(width - 2 * AXIS_MARGIN, 0);
    var brushOverlayHeight = Math.max(height - (AXIS_MARGIN + AXIS_HEIGHT + heightOffset), 0);
    return (_jsxs(Root, { ref: rootRef, style: { height: '100%' }, children: [_jsx("div", { children: _jsx(DateAttributeSelect, { visible: props.data && props.data.length > 0, variant: "outlined", onChange: function (e) { return setSelectedDateAttribute(e.target.value); }, value: selectedDateAttribute, children: possibleDateAttributes.map(function (dateAttribute) { return (_jsx(MenuItem, { value: dateAttribute, children: lookupAlias(dateAttribute) })); }) }) }), tooltip && (_jsx(Tooltip, { message: tooltip.message, x: tooltip.x, y: tooltip.y })), _jsxs("svg", { ref: d3ContainerRef, children: [_jsx("rect", { className: "brush-overlay", x: AXIS_MARGIN, y: 0, width: brushOverlayWidth, height: brushOverlayHeight, fill: "transparent" }), _jsx("g", { className: "data-holder" }), _jsx("rect", { ref: brushBarRef, className: "brushBar" }), _jsx("g", { ref: hoverLineRef, style: { display: 'none' }, children: _jsx(HoverLine, { x1: "0", y1: "0", x2: "0", y2: "50" }) }), _jsx(HoverLineText, { x: "0", y: "0", style: { display: 'none' }, ref: hoverLineTextRef }), _jsxs(MarkerHover, { ref: leftMarkerRef, children: [_jsx(MarkerLine, { x1: "0", y1: "0", x2: "0", y2: "50" }), _jsx(MarkerLine, { x1: "0", y1: "0", x2: "0", y2: "50", hidden: true })] }), _jsxs(MarkerHover, { ref: rightMarkerRef, children: [_jsx(MarkerLine, { x1: "0", y1: "0", x2: "0", y2: "50" }), _jsx(MarkerLine, { x1: "0", y1: "0", x2: "0", y2: "50", hidden: true })] }), _jsx("g", { className: "axis axis--x", id: "axis", children: _jsx("rect", { width: width, height: AXIS_HEIGHT + AXIS_MARGIN, fillOpacity: "0", fill: "black" }) })] }), _jsxs(ContextRow, { children: [renderContext(), _jsxs(ButtonArea, { children: [_jsx(TimelineButton, { variant: "contained", onClick: function () { return zoomOut(); }, icon: true, children: "-" }), _jsx(TimelineButton, { variant: "contained", onClick: function () { return zoomIn(); }, icon: true, children: "+" }), props.onDone && props.mode && (_jsx(TimelineButton, { color: "primary", variant: "contained", onClick: function () {
                                    props.onDone && props.onDone(selectionRange);
                                    setSelectionRange([]);
                                }, children: "Done" }))] })] })] }));
};
export default Timeline;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3RpbWVsaW5lL3RpbWVsaW5lLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFBO0FBQ3hCLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUNuRCxPQUFPLEVBQUUsT0FBTyxFQUFnQixNQUFNLFdBQVcsQ0FBQTtBQUNqRCxPQUFPLEVBQ0wsS0FBSyxFQUNMLFVBQVUsRUFDVixlQUFlLEVBQ2Ysb0JBQW9CLEVBQ3BCLFdBQVcsR0FDWixNQUFNLFFBQVEsQ0FBQTtBQUNmLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLFNBQVMsQ0FBQTtBQUMzQyxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFFdEIsT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxRQUFRLE1BQU0sd0JBQXdCLENBQUE7QUFDN0MsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQTtBQUNsQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ3hDLE9BQU8sTUFBa0IsTUFBTSxpQkFBaUIsQ0FBQTtBQUNoRCxZQUFZO0FBQ1osSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFBO0FBQ3RCLElBQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUN0QixjQUFjO0FBQ2QsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLEdBQUcsaUpBQUEsOEVBSTVCLElBQUEsQ0FBQTtBQUNELElBQU0sYUFBYSxHQUFHLE1BQU0s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USxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZDMgZnJvbSAnZDMnXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgVG9vbHRpcCwgVG9vbHRpcFByb3BzIH0gZnJvbSAnLi90b29sdGlwJ1xuaW1wb3J0IHtcbiAgcmFuZ2UsXG4gIGZvcm1hdERhdGUsXG4gIGRhdGVXaXRoaW5SYW5nZSxcbiAgY29udmVydFRvRGlzcGxheWFibGUsXG4gIG11bHRpRm9ybWF0LFxufSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyB1c2VTZWxlY3Rpb25SYW5nZSB9IGZyb20gJy4vaG9va3MnXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgeyBUaW1lc2NhbGUgfSBmcm9tICcuL3R5cGVzJ1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCBTZWxlY3QgZnJvbSAnQG11aS9tYXRlcmlhbC9TZWxlY3QnXG5pbXBvcnQgTWVudUl0ZW0gZnJvbSAnQG11aS9tYXRlcmlhbC9NZW51SXRlbSdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgeyBsaWdodGVuIH0gZnJvbSAncG9saXNoZWQnXG5pbXBvcnQgeyByZWFkYWJsZUNvbG9yIH0gZnJvbSAncG9saXNoZWQnXG5pbXBvcnQgbW9tZW50LCB7IE1vbWVudCB9IGZyb20gJ21vbWVudC10aW1lem9uZSdcbi8vIENvbnN0YW50c1xuY29uc3QgQVhJU19NQVJHSU4gPSAyMFxuY29uc3QgQVhJU19IRUlHSFQgPSAxNVxuLy8gQ29sb3IgVGhlbWVcbmNvbnN0IENvbnRleHRSb3cgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gIG1hcmdpbi10b3A6IDEwcHg7XG5gXG5jb25zdCBIb3ZlckxpbmVUZXh0ID0gc3R5bGVkLnRleHRgXG4gIGZpbGw6ICR7KHsgdGhlbWUgfSkgPT4gcmVhZGFibGVDb2xvcih0aGVtZS5iYWNrZ3JvdW5kQ29udGVudCl9O1xuICBmb250LWZhbWlseTogJ09wZW4gU2FucycsIHNhbnMtc2VyaWY7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xuYFxuY29uc3QgSG92ZXJMaW5lID0gc3R5bGVkLmxpbmVgXG4gIHN0cm9rZTogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5wcmltYXJ5Q29sb3J9O1xuICBzdHJva2Utd2lkdGg6IDM7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xuYFxuY29uc3QgTWFya2VySG92ZXIgPSBzdHlsZWQuZ2BcbiAgOmhvdmVyIHtcbiAgICBjdXJzb3I6IGV3LXJlc2l6ZTtcbiAgfVxuYFxuY29uc3QgTWFya2VyTGluZSA9IHN0eWxlZC5saW5lPHtcbiAgaGlkZGVuPzogYm9vbGVhblxufT5gXG4gIHN0cm9rZTogJHsocHJvcHM6IGFueSkgPT5cbiAgICAhcHJvcHMuaGlkZGVuXG4gICAgICA/IGxpZ2h0ZW4oMC4xLCBwcm9wcy50aGVtZS5wcmltYXJ5Q29sb3IpXG4gICAgICA6ICdyZ2JhKDAsIDAsIDAsIDApJ307XG4gIHN0cm9rZS13aWR0aDogJHsocHJvcHM6IGFueSkgPT4gKCFwcm9wcy5oaWRkZW4gPyAyIDogMTgpfTtcbmBcbmNvbnN0IFRpbWVsaW5lQnV0dG9uID0gc3R5bGVkKEJ1dHRvbik8e1xuICBpY29uPzogYm9vbGVhblxuICBjb2xvcj86IHN0cmluZ1xufT5gXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICBmb250LWZhbWlseTogJ09wZW4gU2FucycsIHNhbnMtc2VyaWY7XG4gIG1pbi13aWR0aDogM3JlbTtcbiAgaGVpZ2h0OiAzcmVtO1xuXG4gICR7KHsgaWNvbiB9KSA9PlxuICAgICFpY29uICYmXG4gICAgYFxuICAgICAgZm9udC1zaXplOiAxcmVtO1xuICAgICAgcGFkZGluZzogMHB4IDIwcHg7XG4gICAgICBtYXJnaW4tbGVmdDogMTVweCAhaW1wb3J0YW50O1xuICAgIGB9IDpob3ZlciB7XG4gIH1cblxuICA6Zm9jdXMge1xuICAgIG91dGxpbmU6IG5vbmU7XG4gIH1cbmBcbmNvbnN0IERhdGVBdHRyaWJ1dGVTZWxlY3QgPSBzdHlsZWQoU2VsZWN0KTx7XG4gIHZpc2libGU/OiBib29sZWFuXG59PmBcbiAgbWFyZ2luOiAxMHB4O1xuICB2aXNpYmlsaXR5OiAkeyhwcm9wczogYW55KSA9PiAocHJvcHMudmlzaWJsZSA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nKX07XG5gXG5jb25zdCBCdXR0b25BcmVhID0gc3R5bGVkLmRpdmBcbiAgbWFyZ2luOiAxMHB4O1xuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGZsZXgtZW5kO1xuICBtYXJnaW4tcmlnaHQ6IDIwcHg7XG5cbiAgYnV0dG9uIHtcbiAgICBtYXJnaW4tbGVmdDogNXB4O1xuICB9XG5gXG5jb25zdCBSb290ID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcblxuICAuYnJ1c2hCYXIge1xuICAgIC8qIFRoaXMgd2lsbCBsZXQgeW91IHNlbGVjdC9ob3ZlciByZWNvcmRzIGJlaGluZCBhcmVhLCBidXQgY2FuJ3QgYnJ1c2gtZHJhZyBhcmVhIGlmIGl0J3Mgc2V0LiAqL1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgIG9wYWNpdHk6IDAuNTtcblxuICAgIC8qIElmIGl0J3MgZGlzY292ZXJlZCB0aGF0IGJydXNoIGRyYWdnaW5nIGlzIHdhbnRlZCBtb3JlIHRoYW4gaG92ZXJpbmcgYmVoaW5kIHRoZSBoaWdobGlnaHRlZCBicnVzaCBhcmVhLCBcbiAgICBzaW1wbHkgY29tbWVudCB0aGUgYWJvdmUgbGluZXMgYW5kIHVuY29tbWVudCB0aGlzIG9wYWNpdHkgKi9cbiAgICAvKiBvcGFjaXR5OiAwLjE7ICovXG4gICAgZmlsbDogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5wcmltYXJ5Q29sb3J9O1xuICAgIGRpc3BsYXk6IG5vbmU7XG5cbiAgICA6aG92ZXIge1xuICAgICAgY3Vyc29yOiBtb3ZlO1xuICAgICAgZmlsbDogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5wcmltYXJ5Q29sb3J9O1xuICAgICAgb3BhY2l0eTogMC41O1xuICAgIH1cbiAgfVxuXG4gIC5heGlzIHtcbiAgICBjb2xvcjogJHsoeyB0aGVtZSB9KSA9PiByZWFkYWJsZUNvbG9yKHRoZW1lLmJhY2tncm91bmRDb250ZW50KX07XG4gICAgZm9udC1zaXplOiAwLjlyZW07XG4gICAgOmhvdmVyIHtcbiAgICAgIGN1cnNvcjogZXctcmVzaXplO1xuICAgIH1cbiAgfVxuXG4gIC5zZWxlY3RlZCB7XG4gICAgZmlsbDogJHsoeyB0aGVtZSB9KSA9PiB0aGVtZS5wcmltYXJ5Q29sb3J9ICFpbXBvcnRhbnQ7XG4gIH1cblxuICAuZGF0YSB7XG4gICAgZmlsbDogJHsoeyB0aGVtZTogeyB0aGVtZSB9IH0pID0+XG4gICAgICB0aGVtZSA9PT0gJ2RhcmsnID8gbGlnaHRlbigwLjcsICdibGFjaycpIDogbGlnaHRlbigwLjMsICdibGFjaycpfTtcbiAgICBmaWxsLW9wYWNpdHk6IDAuNztcbiAgICA6aG92ZXIge1xuICAgICAgc3Ryb2tlLXdpZHRoOiAycHg7XG4gICAgICBzdHJva2U6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUucHJpbWFyeUNvbG9yfTtcbiAgICB9XG4gIH1cbmBcbmNvbnN0IFRpbWVUZXh0ID0gc3R5bGVkLmRpdmBcbiAgbWFyZ2luOiAxMHB4O1xuICBmb250LWZhbWlseTogJ09wZW4gU2FucycsIHNhbnMtc2VyaWY7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcblxuICBiciB7XG4gICAgbGluZS1oZWlnaHQ6IDE1MCU7XG4gIH1cbmBcbmNvbnN0IE1lc3NhZ2UgPSBzdHlsZWQuc3BhbmBcbiAgZm9udC1mYW1pbHk6ICdPcGVuIFNhbnMnLCBzYW5zLXNlcmlmO1xuICBtYXJnaW46IDEwcHg7XG4gIGNvbG9yOiAkeyh7IHRoZW1lIH0pID0+IHJlYWRhYmxlQ29sb3IodGhlbWUuYmFja2dyb3VuZENvbnRlbnQpfTtcbmBcbi8vIEhlbHBlciBNZXRob2RzXG5jb25zdCBnZW5lcmF0ZVRvb2x0aXBNZXNzYWdlID0gKGRhdGE6IHN0cmluZ1tdKSA9PiB7XG4gIGNvbnN0IHRpdGxlcyA9IGRhdGEuc2xpY2UoMCwgNSkubWFwKChkKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgPHNwYW4+e2R9PC9zcGFuPlxuICAgICAgICA8YnIgLz5cbiAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgKVxuICB9KVxuICBjb25zdCBvdGhlclJlc3VsdHMgPSAoXG4gICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgPGJyIC8+XG4gICAgICB7YCske2RhdGEubGVuZ3RoIC0gNX0gb3RoZXIgcmVzdWx0c2B9XG4gICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgKVxuICByZXR1cm4gKFxuICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgIHt0aXRsZXN9XG4gICAgICB7ZGF0YS5sZW5ndGggPiA1ICYmIG90aGVyUmVzdWx0c31cbiAgICA8L1JlYWN0LkZyYWdtZW50PlxuICApXG59XG4vKipcbiAqIEdpdmVuIGEgZDMgc2VsZWN0aW9uLCBzZXQgdGhlIGRpc3BsYXkgdG8gbm9uZS5cbiAqL1xuY29uc3QgaGlkZUVsZW1lbnQgPSAoZWxlbWVudDogZDMuU2VsZWN0aW9uPG51bGwsIHVua25vd24sIG51bGwsIHVuZGVmaW5lZD4pID0+XG4gIGVsZW1lbnQuYXR0cignc3R5bGUnLCAnZGlzcGxheTogbm9uZScpXG4vKipcbiAqIEdpdmVuIGEgZDMgc2VsZWN0aW9uLCBzZXQgdGhlIGRpc3BsYXkgdG8gYmxvY2suXG4gKi9cbmNvbnN0IHNob3dFbGVtZW50ID0gKGVsZW1lbnQ6IGQzLlNlbGVjdGlvbjxudWxsLCB1bmtub3duLCBudWxsLCB1bmRlZmluZWQ+KSA9PlxuICBlbGVtZW50LmF0dHIoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrJylcbi8qKlxuICogRG9tYWluIGlzIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHZhbHVlcyB0aGF0IHRoZSBzY2FsZSBjb250YWlucy5cbiAqL1xuY29uc3QgZ2V0VGltZXNjYWxlRnJvbVdpZHRoID0gKFxuICB3aWR0aDogbnVtYmVyLFxuICBtaW46IE1vbWVudCA9IG1vbWVudCgnMTk4MC0wMS0wMTowMDowMC4wMDB6JyksXG4gIG1heDogTW9tZW50ID0gbW9tZW50KClcbik6IFRpbWVzY2FsZSA9PiB7XG4gIGNvbnN0IHRpbWVTY2FsZSA9IGQzLnNjYWxlVXRjKCkuZG9tYWluKFttaW4sIG1heF0pLm5pY2UoKVxuICB0aW1lU2NhbGUucmFuZ2UoW0FYSVNfTUFSR0lOLCB3aWR0aCAtIEFYSVNfTUFSR0lOXSlcbiAgcmV0dXJuIHRpbWVTY2FsZVxufVxuY29uc3QgZ2V0UG9zc2libGVEYXRlQXR0cmlidXRlcyA9ICh0aW1lbGluZUl0ZW1zOiBUaW1lbGluZUl0ZW1bXSk6IHN0cmluZ1tdID0+IHtcbiAgcmV0dXJuIF8odGltZWxpbmVJdGVtcylcbiAgICAubWFwKChkKSA9PiBkLmF0dHJpYnV0ZXMpIC8ve2NyZWF0ZWQ6IHtkaXNwbGF5OiBcIkNyZWF0ZWRcIiwgdmFsdWU6IG5ldyBEYXRlKCl9fVxuICAgIC5mbGF0TWFwKChvKSA9PiBPYmplY3Qua2V5cyhvKSkgLy9bY3JlYXRlZF1cbiAgICAudW5pcSgpXG4gICAgLnZhbHVlKClcbn1cbi8vIFR5cGVzXG5leHBvcnQgdHlwZSBUaW1lbGluZUl0ZW0gPSB7XG4gIGlkOiBzdHJpbmdcbiAgc2VsZWN0ZWQ6IGJvb2xlYW5cbiAgZGF0YT86IGFueVxuICBhdHRyaWJ1dGVzOiB7XG4gICAgW2tleTogc3RyaW5nXTogTW9tZW50W11cbiAgfVxufVxudHlwZSBCdWNrZXQgPSB7XG4gIHgxOiBudW1iZXJcbiAgeDI6IG51bWJlclxuICBzZWxlY3RlZDogYm9vbGVhblxuICBpdGVtczogVGltZWxpbmVJdGVtW11cbn1cbmV4cG9ydCBpbnRlcmZhY2UgVGltZWxpbmVQcm9wcyB7XG4gIC8qKlxuICAgKiBIZWlnaHQgaW4gcGl4ZWxzLlxuICAgKi9cbiAgaGVpZ2h0OiBudW1iZXJcbiAgLyoqXG4gICAqIE1vZGUgdGhhdCB0aGUgdGltZWxpbmUgc2hvdWxkIGJlIGluLlxuICAgKi9cbiAgbW9kZT86ICdzaW5nbGUnIHwgJ3JhbmdlJ1xuICAvKipcbiAgICogVGltZXpvbmUgdG8gdXNlIHdoZW4gZGlzcGxheWluZyB0aW1lcy5cbiAgICovXG4gIHRpbWV6b25lOiBzdHJpbmdcbiAgLyoqXG4gICAqIERhdGUgZm9ybWF0IHRvIHVzZSB3aGVuIGRpc3BsYXlpbmcgdGltZXMuXG4gICAqL1xuICBmb3JtYXQ6IHN0cmluZ1xuICAvKipcbiAgICogVGltZWxpbmVJdGVtIHBvaW50c1xuICAgKi9cbiAgZGF0YT86IFRpbWVsaW5lSXRlbVtdXG4gIC8qKlxuICAgKiBBbGlhcyBNYXAgZm9yIGRhdGUgYXR0cmlidXRlc1xuICAgKi9cbiAgZGF0ZUF0dHJpYnV0ZUFsaWFzZXM/OiB7XG4gICAgW2tleTogc3RyaW5nXTogc3RyaW5nXG4gIH1cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBkb25lIGJ1dHRvbiBpcyBjbGlja2VkLCBwcm92aWRpbmcgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIHJhbmdlLlxuICAgKi9cbiAgb25Eb25lPzogKHNlbGVjdGlvblJhbmdlOiBNb21lbnRbXSkgPT4gdm9pZFxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIGEgc2VsZWN0aW9uIGlzIG1hZGUuXG4gICAqL1xuICBvblNlbGVjdD86IChkYXRhOiBUaW1lbGluZUl0ZW1bXSkgPT4gdm9pZFxuICAvKipcbiAgICogUmVuZGVyIGZ1bmN0aW9uIGZvciB0b29sdGlwc1xuICAgKi9cbiAgcmVuZGVyVG9vbHRpcD86IChkYXRhOiBUaW1lbGluZUl0ZW1bXSkgPT4gYW55XG4gIC8qKlxuICAgKiBIZWlnaHQgb2Zmc2V0IHRvIGNvbWJhdCBpc3N1ZXMgd2l0aCBkeW5hbWljIGhlaWdodHMgd2hlbiByZW5kZXJpbmcgdGhlIHRpbWVsaW5lLlxuICAgKi9cbiAgaGVpZ2h0T2Zmc2V0PzogbnVtYmVyXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIGRhdGUgaXMgY29waWVkIHRvIHRoZSBjbGlwYm9hcmQuXG4gICAqL1xuICBvbkNvcHk/OiAoY29waWVkVmFsdWU6IHN0cmluZykgPT4gdm9pZFxuICAvKipcbiAgICogTWluaW11bSBkYXRlIGJvdW5kcyB0byByZW5kZXIgaXRlbXMgYmV0d2Vlbi5cbiAgICovXG4gIG1pbj86IE1vbWVudFxuICAvKipcbiAgICogTWF4aW11bSBkYXRlIGJvdW5kcyB0byByZW5kZXIgaXRlbXMgYmV0d2Vlbi5cbiAgICovXG4gIG1heD86IE1vbWVudFxufVxuLypcbiAqIFRPRE9TXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuICpcbiAqIDEuIE9uIGhvdmVyIHNob3VsZCB3b3JrIHdoZW4gdGhlIG9uIGhvdmVyIGlzIGJlaGluZCB0aGUgYXJlYSBtYXJrZXIgd2hpbGUgc3RpbGwgbGV0dGluZyB5b3UgYnJ1c2ggZHJhZyAoaWYgcG9zc2libGUpXG4gKi9cbi8vIFBsZWFzZSBzZWUgaHR0cHM6Ly9hbGlnbmVkbGVmdC5jb20vdHV0b3JpYWxzL2QzL3NjYWxlcyBmb3IgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCBkMyBzY2FsZXMuXG5leHBvcnQgY29uc3QgVGltZWxpbmUgPSAocHJvcHM6IFRpbWVsaW5lUHJvcHMpID0+IHtcbiAgLyoqXG4gICAqIFRoZSB1c2VSZWYgSG9vayBjcmVhdGVzIGEgdmFyaWFibGUgdGhhdCBcImhvbGRzIG9uXCIgdG8gYSB2YWx1ZSBhY3Jvc3MgcmVuZGVyaW5nXG4gICAqIHBhc3Nlcy4gSW4gdGhpcyBjYXNlIGl0IHdpbGwgaG9sZCBvdXIgY29tcG9uZW50J3MgU1ZHIERPTSBlbGVtZW50LiBJdCdzXG4gICAqIGluaXRpYWxpemVkIG51bGwgYW5kIFJlYWN0IHdpbGwgYXNzaWduIGl0IGxhdGVyIChzZWUgdGhlIHJldHVybiBzdGF0ZW1lbnQpXG4gICAqL1xuICBjb25zdCByb290UmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IGQzQ29udGFpbmVyUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IGhvdmVyTGluZVJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBob3ZlckxpbmVUZXh0UmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IGxlZnRNYXJrZXJSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgcmlnaHRNYXJrZXJSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgYnJ1c2hCYXJSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgeyBtaW4sIG1heCB9ID0gcHJvcHNcbiAgY29uc3QgW3dpZHRoLCBzZXRXaWR0aF0gPSB1c2VTdGF0ZSgwKVxuICBjb25zdCBoZWlnaHQgPSBwcm9wcy5oZWlnaHRcbiAgY29uc3QgaGVpZ2h0T2Zmc2V0ID0gcHJvcHMuaGVpZ2h0T2Zmc2V0ID8gcHJvcHMuaGVpZ2h0T2Zmc2V0IDogMFxuICBjb25zdCBwb3NzaWJsZURhdGVBdHRyaWJ1dGVzID0gZ2V0UG9zc2libGVEYXRlQXR0cmlidXRlcyhwcm9wcy5kYXRhIHx8IFtdKVxuICBjb25zdCB0aW1lc2NhbGUgPSBnZXRUaW1lc2NhbGVGcm9tV2lkdGgod2lkdGgsIG1pbiwgbWF4KVxuICBjb25zdCBbeFNjYWxlLCBzZXRYU2NhbGVdID0gdXNlU3RhdGUoKCkgPT4gdGltZXNjYWxlKVxuICBjb25zdCBbeEF4aXMsIHNldFhBeGlzXSA9IHVzZVN0YXRlKCgpID0+XG4gICAgZDMuYXhpc0JvdHRvbSh4U2NhbGUpLnRpY2tTaXplKEFYSVNfSEVJR0hUKS50aWNrRm9ybWF0KG11bHRpRm9ybWF0KVxuICApXG4gIGNvbnN0IFtkYXRhQnVja2V0cywgc2V0RGF0YUJ1Y2tldHNdID0gdXNlU3RhdGU8QnVja2V0W10+KFtdKVxuICBjb25zdCBbdG9vbHRpcCwgc2V0VG9vbHRpcF0gPSB1c2VTdGF0ZTxUb29sdGlwUHJvcHMgfCBudWxsPigpXG4gIGNvbnN0IFtzZWxlY3RlZERhdGVBdHRyaWJ1dGUsIHNldFNlbGVjdGVkRGF0ZUF0dHJpYnV0ZV0gPSB1c2VTdGF0ZSgnJylcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VsZWN0ZWREYXRlQXR0cmlidXRlID09PSAnJyAmJiBwb3NzaWJsZURhdGVBdHRyaWJ1dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHNldFNlbGVjdGVkRGF0ZUF0dHJpYnV0ZShwb3NzaWJsZURhdGVBdHRyaWJ1dGVzWzBdKVxuICAgIH1cbiAgfSwgW3Bvc3NpYmxlRGF0ZUF0dHJpYnV0ZXNdKVxuICBjb25zdCBbaXNEcmFnZ2luZywgc2V0SXNEcmFnZ2luZ10gPSB1c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW3NlbGVjdGlvblJhbmdlLCBzZXRTZWxlY3Rpb25SYW5nZV0gPSB1c2VTZWxlY3Rpb25SYW5nZShbXSwgdGltZXNjYWxlKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICh3aWR0aCAhPSAwKSB7XG4gICAgICBjb25zb2xlLmRlYnVnKGBXaWR0aCB1cGRhdGVkIHRvICR7d2lkdGh9YClcbiAgICAgIHNldFhTY2FsZSgoKSA9PiB0aW1lc2NhbGUpXG4gICAgfVxuICB9LCBbd2lkdGhdKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnNvbGUuZGVidWcoYHhTY2FsZSB1cGRhdGVkIHRvICR7eFNjYWxlLnJhbmdlKCl9YClcbiAgICBjb25zdCBbbGVmdCwgcmlnaHRdID0geFNjYWxlLnJhbmdlKClcbiAgICBpZiAobGVmdCA8IHJpZ2h0KSB7XG4gICAgICBjb25zdCBuZXdYQXhpcyA9IHhBeGlzLnNjYWxlKHhTY2FsZSlcbiAgICAgIHNldFhBeGlzKCgpID0+IG5ld1hBeGlzKVxuICAgICAgZDMuc2VsZWN0KCcuYXhpcy0teCcpLmNhbGwobmV3WEF4aXMgYXMgYW55KVxuICAgIH1cbiAgfSwgW3hTY2FsZSwgcHJvcHMudGltZXpvbmUsIHByb3BzLmZvcm1hdF0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJvb3RSZWYuY3VycmVudCkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY29uc3QgcmVjdCA9IHJvb3RSZWYuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgc2V0V2lkdGgocmVjdC53aWR0aClcbiAgICB9XG4gIH0sIFtyb290UmVmXSlcbiAgLyoqXG4gICAqIEV2ZXJ5IDEwMCBtcywgcG9sbCB0byBzZWUgdGhlIG5ldyBwYXJlbnQgcmVjdCB3aWR0aC5cbiAgICogSWYgdGhlIG5ldyBwYXJlbnQgcmVjdCB3aWR0aCBpcyBkaWZmZXJlbnQgdGhhbiBjdXJyZW50IHdpZHRoLCB1cGRhdGUgdGhlIHdpZHRoLlxuICAgKi9cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmIChyb290UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgICBjb25zdCByZWN0ID0gcm9vdFJlZi5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGlmIChyZWN0LndpZHRoICE9PSB3aWR0aCkge1xuICAgICAgICAgIHNldFdpZHRoKHJlY3Qud2lkdGgpXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIDEwMClcbiAgfSwgW3Jvb3RSZWYsIHdpZHRoXSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB6b29tQmVoYXZpb3Iuc2NhbGVUbyhcbiAgICAgIGQzLnNlbGVjdChkM0NvbnRhaW5lclJlZi5jdXJyZW50KS50cmFuc2l0aW9uKCkuZHVyYXRpb24oMCkgYXMgYW55LFxuICAgICAgMVxuICAgIClcbiAgfSwgW3dpZHRoXSlcbiAgY29uc3QgbWFya2VySGVpZ2h0ID0gaGVpZ2h0IC0gNzAgLSBBWElTX0hFSUdIVCAtIGhlaWdodE9mZnNldFxuICAvKipcbiAgICogV2hlbiBhIHpvb20gZXZlbnQgaXMgdHJpZ2dlcmVkLCB1c2UgdGhlIHRyYW5zZm9ybSBldmVudCB0byBjcmVhdGUgYSBuZXcgeFNjYWxlLFxuICAgKiB0aGVuIGNyZWF0ZSBhIG5ldyB4QXhpcyB1c2luZyB0aGUgc2NhbGUgYW5kIHVwZGF0ZSBleGlzdGluZyB4QXhpc1xuICAgKi9cbiAgY29uc3QgaGFuZGxlWm9vbSA9IChldmVudDogYW55KSA9PiB7XG4gICAgLy8gVG9vbHRpcCBzdGlja3MgYXJvdW5kIHdpdGhvdXQgdGhpcy5cbiAgICBzZXRUb29sdGlwKG51bGwpXG4gICAgY29uc3QgdHJhbnNmb3JtID0gZXZlbnQudHJhbnNmb3JtXG4gICAgaWYgKHdpZHRoICE9IDApIHtcbiAgICAgIGNvbnN0IG5ld1hTY2FsZSA9IHRyYW5zZm9ybS5yZXNjYWxlWCh0aW1lc2NhbGUpXG4gICAgICBzZXRYU2NhbGUoKCkgPT4gbmV3WFNjYWxlKVxuICAgICAgY29uc3QgbmV3WEF4aXMgPSB4QXhpcy5zY2FsZShuZXdYU2NhbGUpXG4gICAgICBzZXRYQXhpcygoKSA9PiBuZXdYQXhpcylcbiAgICAgIC8vIEFwcGx5IHRoZSBuZXcgeEF4aXNcbiAgICAgIGQzLnNlbGVjdCgnLmF4aXMtLXgnKS5jYWxsKHhBeGlzIGFzIGFueSlcbiAgICB9XG4gIH1cbiAgY29uc3Qgem9vbUJlaGF2aW9yID0gZDNcbiAgICAuem9vbSgpXG4gICAgLnNjYWxlRXh0ZW50KFsxLCAyNCAqIDYwICogNjBdKVxuICAgIC50cmFuc2xhdGVFeHRlbnQoW1xuICAgICAgWzAsIDBdLFxuICAgICAgW3dpZHRoLCBoZWlnaHRdLFxuICAgIF0pXG4gICAgLmV4dGVudChbXG4gICAgICBbMCwgMF0sXG4gICAgICBbd2lkdGgsIGhlaWdodF0sXG4gICAgXSlcbiAgICAuZmlsdGVyKChldmVudDogYW55KSA9PiB7XG4gICAgICAvLyBBbGxvdyB3aGVlbCBldmVudHMsIG9uIGF4aXMgb3Igbm90XG4gICAgICBpZiAoZXZlbnQudHlwZSA9PT0gJ3doZWVsJykge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiBldmVudCBpcyBvbiBheGlzXG4gICAgICBjb25zdCBjbGlja2VkT25BeGlzID0gZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJyNheGlzJykgIT09IG51bGxcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NsaWNrZWQgT24gQXhpczogJywgY2xpY2tlZE9uQXhpcylcblxuICAgICAgLy8gQmxvY2sgYWxsIHBhbiBiZWhhdmlvciBpZiBub3QgY2xpY2tpbmcgb24gYXhpcyAod2UgYXJlIGJydXNoaW5nIGluc3RlYWQpXG4gICAgICByZXR1cm4gY2xpY2tlZE9uQXhpc1xuICAgIH0pXG4gICAgLm9uKCd6b29tJywgaGFuZGxlWm9vbSlcbiAgY29uc3Qgem9vbUluID0gKCkgPT4ge1xuICAgIHpvb21CZWhhdmlvci5zY2FsZUJ5KFxuICAgICAgZDMuc2VsZWN0KGQzQ29udGFpbmVyUmVmLmN1cnJlbnQpLnRyYW5zaXRpb24oKS5kdXJhdGlvbig3NTApIGFzIGFueSxcbiAgICAgIDJcbiAgICApXG4gIH1cbiAgY29uc3Qgem9vbU91dCA9ICgpID0+IHtcbiAgICB6b29tQmVoYXZpb3Iuc2NhbGVCeShcbiAgICAgIGQzLnNlbGVjdChkM0NvbnRhaW5lclJlZi5jdXJyZW50KS50cmFuc2l0aW9uKCkuZHVyYXRpb24oNzUwKSBhcyBhbnksXG4gICAgICAwLjVcbiAgICApXG4gIH1cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAvKipcbiAgICAgKiBSYW5nZSBpcyB0aGUgcmFuZ2Ugb2YgcG9zc2libGUgb3V0cHV0IHZhbHVlcyB1c2VkIGluIGRpc3BsYXkuXG4gICAgICogRG9tYWluIG1hcHMgdG8gUmFuZ2VcbiAgICAgKiBpLmUuIERhdGVzIG1hcCB0byBQaXhlbHNcbiAgICAgKi9cbiAgICBjb25zdCByZW5kZXJJbml0aWFsWEF4aXMgPSAoKSA9PiB7XG4gICAgICBjb25zdCBzdmcgPSBkM1xuICAgICAgICAuc2VsZWN0KGQzQ29udGFpbmVyUmVmLmN1cnJlbnQpXG4gICAgICAgIC5hdHRyKCd3aWR0aCcsIHdpZHRoKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KVxuICAgICAgc3ZnXG4gICAgICAgIC5zZWxlY3QoJy5heGlzLS14JylcbiAgICAgICAgLmF0dHIoXG4gICAgICAgICAgJ3RyYW5zZm9ybScsXG4gICAgICAgICAgYHRyYW5zbGF0ZSgwICR7aGVpZ2h0IC0gKEFYSVNfTUFSR0lOICsgQVhJU19IRUlHSFQgKyBoZWlnaHRPZmZzZXQpfSlgXG4gICAgICAgIClcbiAgICAgICAgLmNhbGwoeEF4aXMgYXMgYW55KVxuICAgIH1cbiAgICBpZiAoZDNDb250YWluZXJSZWYuY3VycmVudCkge1xuICAgICAgcmVuZGVySW5pdGlhbFhBeGlzKClcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGQzLnNlbGVjdChkM0NvbnRhaW5lclJlZi5jdXJyZW50KVxuICAgICAgY29udGFpbmVyLmNhbGwoem9vbUJlaGF2aW9yIGFzIGFueSlcbiAgICB9XG4gIH0sIFtoZWlnaHQsIHdpZHRoXSlcbiAgLy8gQWRkIG1vdXNlIGhhbmRsZXJzIHRvIGxpc3RlbiB0byBkMyBtb3VzZSBldmVudHNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBkMy5zZWxlY3QoZDNDb250YWluZXJSZWYuY3VycmVudCkub24oJ21vdXNlbW92ZScsIChldmVudDogYW55KSA9PiB7XG4gICAgICBjb25zdCBjb29yZCA9IGQzLnBvaW50ZXIoZXZlbnQpXG4gICAgICBkMy5zZWxlY3QoaG92ZXJMaW5lUmVmLmN1cnJlbnQpXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7Y29vcmRbMF19LCAke21hcmtlckhlaWdodH0pYClcbiAgICAgICAgLmF0dHIoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrJylcbiAgICAgIGNvbnN0IGhvdmVyRGF0ZSA9IG1vbWVudC50eih4U2NhbGUuaW52ZXJ0KGNvb3JkWzBdKSwgcHJvcHMudGltZXpvbmUpXG4gICAgICBjb25zdCBmb3JtYXR0ZWREYXRlID0gZm9ybWF0RGF0ZShob3ZlckRhdGUsIHByb3BzLmZvcm1hdClcbiAgICAgIGNvbnN0IHdpZHRoQnVmZmVyID0gMTUwXG4gICAgICBjb25zdCBtYXhYID0gd2lkdGggLSB3aWR0aEJ1ZmZlclxuICAgICAgbGV0IHhQb3MgPSBjb29yZFswXVxuICAgICAgaWYgKHhQb3MgPCB3aWR0aEJ1ZmZlcikgeFBvcyA9IHdpZHRoQnVmZmVyXG4gICAgICBpZiAoeFBvcyA+IG1heFgpIHhQb3MgPSBtYXhYXG4gICAgICBjb25zdCB5UG9zID0gMjBcbiAgICAgIGQzLnNlbGVjdChob3ZlckxpbmVUZXh0UmVmLmN1cnJlbnQpXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eFBvc30sICR7eVBvc30pYClcbiAgICAgICAgLmF0dHIoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrJylcbiAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgIC50ZXh0KGZvcm1hdHRlZERhdGUpXG4gICAgfSlcbiAgICAvLyBXaGVuIHRoZSBkM0NvbnRhaW5lciBtb3VzZWxlYXZlIGV2ZW50IHRyaWdnZXJzLCBzZXQgdGhlIGhvdmVyVmFsdWUgdG8gbnVsbCBhbmQgaGlkZSB0aGUgaG92ZXJMaW5lIGxpbmVcbiAgICBkMy5zZWxlY3QoZDNDb250YWluZXJSZWYuY3VycmVudCkub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBoaWRlRWxlbWVudChkMy5zZWxlY3QoaG92ZXJMaW5lUmVmLmN1cnJlbnQpKVxuICAgICAgaGlkZUVsZW1lbnQoZDMuc2VsZWN0KGhvdmVyTGluZVRleHRSZWYuY3VycmVudCkpXG4gICAgfSlcbiAgfSwgW3hTY2FsZSwgcHJvcHMudGltZXpvbmUsIHByb3BzLmZvcm1hdCwgcHJvcHMuaGVpZ2h0XSlcbiAgLy8gUmVuZGVyIHJlY3RhbmdsZXNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBtaW4gPSB4U2NhbGUucmFuZ2UoKVswXVxuICAgIGNvbnN0IG1heCA9IHhTY2FsZS5yYW5nZSgpWzFdXG4gICAgY29uc3QgTlVNX0JVQ0tFVFMgPSBNYXRoLnJvdW5kKHdpZHRoIC8gMzApIC8vIDMwIGlzIGp1c3QgYSBjb25zdGFudCB0aGF0IEkgZm91bmQgdG8gbG9vayBnb29kLlxuICAgIGNvbnN0IGJ1Y2tldFdpZHRoID0gKG1heCAtIG1pbikgLyBOVU1fQlVDS0VUU1xuICAgIGNvbnN0IGJ1Y2tldHM6IEJ1Y2tldFtdID0gcmFuZ2UoTlVNX0JVQ0tFVFMpLm1hcCgoaSkgPT4gKHtcbiAgICAgIHgxOiBtaW4gKyBidWNrZXRXaWR0aCAqIGksXG4gICAgICB4MjogbWluICsgYnVja2V0V2lkdGggKiAoaSArIDEpLFxuICAgICAgaXRlbXM6IFtdLFxuICAgICAgc2VsZWN0ZWQ6IGZhbHNlLFxuICAgIH0pKVxuICAgIGlmIChwcm9wcy5kYXRhICYmIHNlbGVjdGVkRGF0ZUF0dHJpYnV0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkMy5zZWxlY3RBbGwoJy5kYXRhJykucmVtb3ZlKClcbiAgICAgIHByb3BzLmRhdGEuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRlID0gZC5hdHRyaWJ1dGVzW3NlbGVjdGVkRGF0ZUF0dHJpYnV0ZSFdXG4gICAgICAgIGlmIChkYXRlID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzY2FsZWREYXRlcyA9IGRhdGUubWFwKChkKSA9PiB4U2NhbGUoZCkpXG4gICAgICAgIHNjYWxlZERhdGVzLmZvckVhY2goKHNjYWxlZERhdGUpID0+IHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1Y2tldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGIgPSBidWNrZXRzW2ldXG4gICAgICAgICAgICBpZiAoYi54MSA8IHNjYWxlZERhdGUgJiYgc2NhbGVkRGF0ZSA8IGIueDIpIHtcbiAgICAgICAgICAgICAgYi5pdGVtcy5wdXNoKGQpXG4gICAgICAgICAgICAgIGlmIChkLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgYi5zZWxlY3RlZCA9IHRydWVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICBjb25zdCBtb3N0SXRlbXNJbkFCdWNrZXQgPSBNYXRoLm1heCguLi5idWNrZXRzLm1hcCgoYikgPT4gYi5pdGVtcy5sZW5ndGgpKVxuICAgICAgY29uc3QgaGVpZ2h0UGVySXRlbSA9IChoZWlnaHQgLSAoaGVpZ2h0T2Zmc2V0ICsgNzUpKSAvIG1vc3RJdGVtc0luQUJ1Y2tldFxuICAgICAgc2V0RGF0YUJ1Y2tldHMoYnVja2V0cylcbiAgICAgIGJ1Y2tldHMuZm9yRWFjaCgoYiwgaSkgPT4ge1xuICAgICAgICBpZiAoYi5pdGVtcy5sZW5ndGggPT09IDAgfHwgaGVpZ2h0UGVySXRlbSA8PSAwKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVjdGFuZ2xlSGVpZ2h0ID0gYi5pdGVtcy5sZW5ndGggKiBoZWlnaHRQZXJJdGVtXG4gICAgICAgIGNvbnN0IHggPSAoYi54MSArIGIueDIpIC8gMiAtIDE1XG4gICAgICAgIGNvbnN0IHkgPVxuICAgICAgICAgIGhlaWdodCAtIHJlY3RhbmdsZUhlaWdodCAtIChBWElTX01BUkdJTiArIEFYSVNfSEVJR0hUICsgaGVpZ2h0T2Zmc2V0KVxuICAgICAgICBkMy5zZWxlY3QoJy5kYXRhLWhvbGRlcicpXG4gICAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgLmF0dHIoJ2NsYXNzJywgYGRhdGEgJHtiLnNlbGVjdGVkID8gJ3NlbGVjdGVkJyA6ICcnfWApXG4gICAgICAgICAgLmF0dHIoJ3dpZHRoJywgYnVja2V0V2lkdGggLSA1KVxuICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCByZWN0YW5nbGVIZWlnaHQpXG4gICAgICAgICAgLmF0dHIoJ2lkJywgaSlcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3h9LCAke3l9KWApXG4gICAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICB9KVxuICAgIH1cbiAgfSwgW3Byb3BzLmRhdGEsIHhTY2FsZSwgc2VsZWN0ZWREYXRlQXR0cmlidXRlLCB3aWR0aCwgaGVpZ2h0XSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBkMy5zZWxlY3QoJy5kYXRhLWhvbGRlcicpXG4gICAgICAuc2VsZWN0QWxsKCcuZGF0YScpXG4gICAgICAub24oJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICAgIHNldFRvb2x0aXAobnVsbClcbiAgICAgIH0pXG4gICAgICAub24oJ21vdXNlbW92ZScsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gKGV2ZW50LnRhcmdldCBhcyBhbnkpLmlkXG4gICAgICAgIGNvbnN0IHggPSBldmVudC5vZmZzZXRYXG4gICAgICAgIGNvbnN0IHkgPSBldmVudC5vZmZzZXRZXG4gICAgICAgIGNvbnN0IHRvb2x0aXBJbkJvdW5kcyA9IHggPD0gd2lkdGggKiAwLjc1XG4gICAgICAgIHNldFRvb2x0aXAoe1xuICAgICAgICAgIHg6IHRvb2x0aXBJbkJvdW5kcyA/IHggKyAyNSA6IHggLSB3aWR0aCAqIDAuMjUsIC8vIGhhbmRsZXMgdG9vbHRpcCBnb2luZyBvZmYgc2NyZWVuXG4gICAgICAgICAgeTogeSAtIDIwLFxuICAgICAgICAgIG1lc3NhZ2U6IHByb3BzLnJlbmRlclRvb2x0aXBcbiAgICAgICAgICAgID8gcHJvcHMucmVuZGVyVG9vbHRpcChkYXRhQnVja2V0c1tpZF0uaXRlbXMpXG4gICAgICAgICAgICA6IGdlbmVyYXRlVG9vbHRpcE1lc3NhZ2UoZGF0YUJ1Y2tldHNbaWRdLml0ZW1zLm1hcCgoZCkgPT4gZC5pZCkpLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgfSwgW2RhdGFCdWNrZXRzXSlcbiAgLy8gSWYgZHJhZ2dpbmcgaXMgZmluaXNoZWQsIHVwZGF0ZSBzZWxlY3RlZCByZXN1bHRzLlxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChcbiAgICAgICFpc0RyYWdnaW5nICYmXG4gICAgICBwcm9wcy5kYXRhICYmXG4gICAgICBzZWxlY3RlZERhdGVBdHRyaWJ1dGUgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgIXByb3BzLm1vZGVcbiAgICApIHtcbiAgICAgIGlmIChzZWxlY3Rpb25SYW5nZS5sZW5ndGggPT0gMikge1xuICAgICAgICBjb25zdCB4MSA9IHhTY2FsZShzZWxlY3Rpb25SYW5nZVswXSlcbiAgICAgICAgY29uc3QgeDIgPSB4U2NhbGUoc2VsZWN0aW9uUmFuZ2VbMV0pXG4gICAgICAgIC8vIFByZWZpbHRlciB0byBvbmx5IGJ1Y2tldHMgd2UgY2FyZSBhYm91dFxuICAgICAgICBjb25zdCBidWNrZXRzQ29udGFpbmluZ1JlbGV2YW50RGF0YSA9IGRhdGFCdWNrZXRzLmZpbHRlcihcbiAgICAgICAgICAoYikgPT5cbiAgICAgICAgICAgICh4MSA8IGIueDEgJiYgYi54MiA8IHgyKSB8fFxuICAgICAgICAgICAgKGIueDEgPCB4MSAmJiB4MSA8IGIueDIpIHx8XG4gICAgICAgICAgICAoYi54MSA8IHgyICYmIHgyIDwgYi54MilcbiAgICAgICAgKVxuICAgICAgICAvLyBHZXQgdGhlIGRhdGEgaW5zaWRlIHRob3NlIGJ1Y2tldHMgdGhhdCBmYWxscyB3aXRoaW4gdGhlIHNlbGVjdGlvblxuICAgICAgICBjb25zdCBkYXRhVG9TZWxlY3QgPSBfLmZsYXRNYXAoXG4gICAgICAgICAgYnVja2V0c0NvbnRhaW5pbmdSZWxldmFudERhdGEsXG4gICAgICAgICAgKGIpID0+IGIuaXRlbXNcbiAgICAgICAgKS5maWx0ZXIoKGQpID0+XG4gICAgICAgICAgZC5hdHRyaWJ1dGVzW3NlbGVjdGVkRGF0ZUF0dHJpYnV0ZSFdLnNvbWUoKG1vbWVudCkgPT5cbiAgICAgICAgICAgIGRhdGVXaXRoaW5SYW5nZShtb21lbnQsIHNlbGVjdGlvblJhbmdlKVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICBwcm9wcy5vblNlbGVjdCAmJiBwcm9wcy5vblNlbGVjdChkYXRhVG9TZWxlY3QpXG4gICAgICB9XG4gICAgfVxuICB9LCBbaXNEcmFnZ2luZ10pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLyoqXG4gICAgICogU2VsZWN0aW9uIERyYWcgZG9lcyB0d28gdGhpbmdzOlxuICAgICAqIDEuIFdoZW4gdGhlIHVzZXIgZHJhZ3MgYWNyb3NzIHRoZSB0aW1lbGluZSwgYSByYW5nZSBzZWxlY3Rpb24gd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqIDIuIElmIHRoZSBkcmFnIGV2ZW50IGlzIG9ubHkgNSBwaXhlbHMgb3IgbGVzcyBmcm9tIHN0YXJ0IHRvIGZpbmlzaCBBTkQgZW5kcyBvbiBhIHJlY3Qgb2JqZWN0LFxuICAgICAqIGFzc3VtZSB0aGF0IHRoZSB1c2VyIG1lYW50IHRvIGNsaWNrIGluc3RlYWQgb2YgZHJhZywgYW5kIHByb3Blcmx5IHRyaWdnZXIgYSBjbGljayBhY3Rpb24gb24gdGhlIHJlY3QuXG4gICAgICovXG4gICAgY29uc3QgZ2V0U2VsZWN0aW9uRHJhZyA9ICgpID0+IHtcbiAgICAgIGxldCBjbGlja1N0YXJ0OiBudW1iZXJcbiAgICAgIHJldHVybiBkM1xuICAgICAgICAuZHJhZygpXG4gICAgICAgIC5maWx0ZXIoKGV2ZW50OiBhbnkpID0+IHtcbiAgICAgICAgICAvLyBibG9jayBldmVudHMgaWYgdGhleSdyZSBvbiB0aGUgYXhpc1xuICAgICAgICAgIGNvbnN0IGNsaWNrZWRPbkF4aXMgPSBldmVudC50YXJnZXQuY2xvc2VzdCgnI2F4aXMnKSAhPT0gbnVsbFxuICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ0NsaWNrZWQgT24gQXhpczogJywgY2xpY2tlZE9uQXhpcylcblxuICAgICAgICAgIC8vIEFsbG93IGFsbCBldmVudHMgbm90IG9uIHRoZSBheGlzXG4gICAgICAgICAgcmV0dXJuICFjbGlja2VkT25BeGlzXG4gICAgICAgIH0pXG4gICAgICAgIC5vbignc3RhcnQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICBjbGlja1N0YXJ0ID0gZXZlbnQueFxuICAgICAgICAgIGNvbnN0IG5ld0xlZnREYXRlID0gbW9tZW50LnR6KFxuICAgICAgICAgICAgeFNjYWxlLmludmVydChjbGlja1N0YXJ0KSxcbiAgICAgICAgICAgIHByb3BzLnRpbWV6b25lXG4gICAgICAgICAgKVxuICAgICAgICAgIGlmIChwcm9wcy5tb2RlID09PSAnc2luZ2xlJykge1xuICAgICAgICAgICAgc2V0U2VsZWN0aW9uUmFuZ2UoW25ld0xlZnREYXRlXSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0SXNEcmFnZ2luZyh0cnVlKVxuICAgICAgICAgICAgaGlkZUVsZW1lbnQoZDMuc2VsZWN0KGhvdmVyTGluZVJlZi5jdXJyZW50KSlcbiAgICAgICAgICAgIGhpZGVFbGVtZW50KGQzLnNlbGVjdChob3ZlckxpbmVUZXh0UmVmLmN1cnJlbnQpKVxuICAgICAgICAgICAgc2V0U2VsZWN0aW9uUmFuZ2UoW25ld0xlZnREYXRlXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZHJhZycsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKHByb3BzLm1vZGUgIT09ICdzaW5nbGUnKSB7XG4gICAgICAgICAgICBjb25zdCBkaWZmID0gZXZlbnQueCAtIGV2ZW50LnN1YmplY3QueFxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbERhdGUgPSBtb21lbnQudHooXG4gICAgICAgICAgICAgIHhTY2FsZS5pbnZlcnQoY2xpY2tTdGFydCksXG4gICAgICAgICAgICAgIHByb3BzLnRpbWV6b25lXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBsZXQgZHJhZ0N1cnJlbnQgPSBjbGlja1N0YXJ0ICsgZGlmZlxuICAgICAgICAgICAgY29uc3QgZHJhZ0RhdGUgPSBtb21lbnQudHooXG4gICAgICAgICAgICAgIHhTY2FsZS5pbnZlcnQoZHJhZ0N1cnJlbnQpLFxuICAgICAgICAgICAgICBwcm9wcy50aW1lem9uZVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaWYgKGRpZmYgPiAwKSB7XG4gICAgICAgICAgICAgIHNldFNlbGVjdGlvblJhbmdlKFtpbml0aWFsRGF0ZSwgZHJhZ0RhdGVdKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2V0U2VsZWN0aW9uUmFuZ2UoW2RyYWdEYXRlLCBpbml0aWFsRGF0ZV0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub24oJ2VuZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgIGlmICghcHJvcHMubW9kZSkge1xuICAgICAgICAgICAgc2hvd0VsZW1lbnQoZDMuc2VsZWN0KGhvdmVyTGluZVJlZi5jdXJyZW50KSlcbiAgICAgICAgICAgIHNldElzRHJhZ2dpbmcoZmFsc2UpXG4gICAgICAgICAgICBjb25zdCBjbGlja0Rpc3RhbmNlID0gY2xpY2tTdGFydCAtIGV2ZW50LnhcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUV2ZW50ID0gZXZlbnQuc291cmNlRXZlbnRcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhjbGlja0Rpc3RhbmNlKSA8IDUpIHtcbiAgICAgICAgICAgICAgY29uc3Qgbm9kZU5hbWUgPSBzb3VyY2VFdmVudC50YXJnZXQubm9kZU5hbWVcbiAgICAgICAgICAgICAgc2V0U2VsZWN0aW9uUmFuZ2UoW10pXG4gICAgICAgICAgICAgIGlmIChub2RlTmFtZSA9PT0gJ3JlY3QnIHx8IG5vZGVOYW1lID09PSAnbGluZScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB4ID0gZXZlbnQueFxuICAgICAgICAgICAgICAgIGNvbnN0IGJ1Y2tldCA9IGRhdGFCdWNrZXRzLmZpbmQoKGIpID0+IGIueDEgPCB4ICYmIHggPD0gYi54MilcbiAgICAgICAgICAgICAgICBidWNrZXQgJiYgcHJvcHMub25TZWxlY3QgJiYgcHJvcHMub25TZWxlY3QoYnVja2V0Lml0ZW1zKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vIEFwcGx5IGRyYWcgYmVoYXZpb3IgdG8gYm90aCB0aGUgb3ZlcmxheSBhbmQgZGF0YS1ob2xkZXJcbiAgICBkMy5zZWxlY3QoZDNDb250YWluZXJSZWYuY3VycmVudClcbiAgICAgIC5zZWxlY3QoJy5icnVzaC1vdmVybGF5JylcbiAgICAgIC5jYWxsKGdldFNlbGVjdGlvbkRyYWcoKSBhcyBhbnkpXG5cbiAgICBkMy5zZWxlY3QoZDNDb250YWluZXJSZWYuY3VycmVudClcbiAgICAgIC5zZWxlY3QoJy5kYXRhLWhvbGRlcicpXG4gICAgICAuY2FsbChnZXRTZWxlY3Rpb25EcmFnKCkgYXMgYW55KVxuICB9LCBbZGF0YUJ1Y2tldHMsIHNlbGVjdGlvblJhbmdlLCB4U2NhbGUsIHByb3BzLnRpbWV6b25lLCBwcm9wcy5mb3JtYXRdKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGRyYWcgYmVoYXZpb3IgdXNlZCB3aGVuIHNlbGVjdGluZyB0aGUgbGVmdCBvciByaWdodCBzbGlkZXIuXG4gICAgICpcbiAgICAgKiBWYWxpZGF0aW9uIGZvciBzbGlkZXJzOlxuICAgICAqIC0gTGVmdCBzbGlkZXIgY2Fubm90IGJlIHdpdGhpbiAxMCBwaXhlbHMgb2YgdGhlIHJpZ2h0IHNsaWRlci5cbiAgICAgKiAtIFJpZ2h0IHNsaWRlciBjYW5ub3QgYmUgd2l0aGluIDEwIHBpeGVscyBvZiB0aGUgbGVmdCBzbGlkZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gc2xpZGVyIC0gV2hpY2ggc2xpZGVyIHRoZSBkcmFnIGJlaGF2aW9yIHNob3VsZCBhZmZlY3QuXG4gICAgICovXG4gICAgY29uc3QgZ2V0RWRnZURyYWcgPSAoc2xpZGVyOiAnTEVGVCcgfCAnUklHSFQnKSA9PlxuICAgICAgZDNcbiAgICAgICAgLmRyYWcoKVxuICAgICAgICAub24oJ3N0YXJ0JywgKCkgPT4ge1xuICAgICAgICAgIGhpZGVFbGVtZW50KGQzLnNlbGVjdChob3ZlckxpbmVSZWYuY3VycmVudCkpXG4gICAgICAgICAgaGlkZUVsZW1lbnQoZDMuc2VsZWN0KGhvdmVyTGluZVRleHRSZWYuY3VycmVudCkpXG4gICAgICAgICAgc2V0SXNEcmFnZ2luZyh0cnVlKVxuICAgICAgICB9KVxuICAgICAgICAub24oJ2VuZCcsICgpID0+IHNldElzRHJhZ2dpbmcoZmFsc2UpKVxuICAgICAgICAub24oJ2RyYWcnLCAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRyYWdWYWx1ZSA9IHhTY2FsZS5pbnZlcnQoZXZlbnQueClcbiAgICAgICAgICBjb25zdCBkYXRlV2l0aFRpbWV6b25lID0gbW9tZW50LnR6KGRyYWdWYWx1ZSwgcHJvcHMudGltZXpvbmUpXG4gICAgICAgICAgY29uc3QgQlVGRkVSID0gMTAgLy8gQnVmZmVyIGluIHBpeGVscyB0byBrZWVwIHNsaWRlcnMgZnJvbSBvdmVybGFwcGluZy9jcm9zc2luZ1xuICAgICAgICAgIGlmIChzbGlkZXIgPT09ICdMRUZUJykge1xuICAgICAgICAgICAgY29uc3QgbWF4aW11bVggPSB4U2NhbGUoc2VsZWN0aW9uUmFuZ2VbMV0pIC0gQlVGRkVSXG4gICAgICAgICAgICBpZiAoZXZlbnQueCA8PSBtYXhpbXVtWCkge1xuICAgICAgICAgICAgICBzZXRTZWxlY3Rpb25SYW5nZShbZGF0ZVdpdGhUaW1lem9uZSwgc2VsZWN0aW9uUmFuZ2VbMV1dKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoc2xpZGVyID09PSAnUklHSFQnKSB7XG4gICAgICAgICAgICBjb25zdCBtaW5pbXVtWCA9IHhTY2FsZShzZWxlY3Rpb25SYW5nZVswXSkgKyBCVUZGRVJcbiAgICAgICAgICAgIGlmIChldmVudC54ID49IG1pbmltdW1YKSB7XG4gICAgICAgICAgICAgIHNldFNlbGVjdGlvblJhbmdlKFtzZWxlY3Rpb25SYW5nZVswXSwgZGF0ZVdpdGhUaW1lem9uZV0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KSBhcyBhbnlcbiAgICBkMy5zZWxlY3QobGVmdE1hcmtlclJlZi5jdXJyZW50KS5jYWxsKGdldEVkZ2VEcmFnKCdMRUZUJykpXG4gICAgZDMuc2VsZWN0KHJpZ2h0TWFya2VyUmVmLmN1cnJlbnQpLmNhbGwoZ2V0RWRnZURyYWcoJ1JJR0hUJykpXG4gIH0sIFt4U2NhbGUsIHNlbGVjdGlvblJhbmdlLCBwcm9wcy50aW1lem9uZV0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRoZSBkcmFnIGJlaGF2aW9yIHVzZWQgd2hlbiBzZWxlY3RpbmcgdGhlIG1pZGRsZSBhcmVhIGJldHdlZW4gYSByYW5nZS5cbiAgICAgKlxuICAgICAqIE5PVEU6IFRoaXMgd2lsbCBub3QgYmUgdXNlZCBpZiAuYnJ1c2hCYXIgY2xhc3MgaGFzICdwb2ludGVyLWV2ZW50czogbm9uZScgc2V0LCBhcyB0aGUgZXZlbnRzIHdpbGwgbmV2ZXIgYmUgaGl0LlxuICAgICAqL1xuICAgIGNvbnN0IGdldEJydXNoRHJhZyA9ICgpID0+XG4gICAgICBkM1xuICAgICAgICAuZHJhZygpXG4gICAgICAgIC5vbignc3RhcnQnLCAoKSA9PiB7XG4gICAgICAgICAgc2V0SXNEcmFnZ2luZyh0cnVlKVxuICAgICAgICAgIGhpZGVFbGVtZW50KGQzLnNlbGVjdChob3ZlckxpbmVSZWYuY3VycmVudCkpXG4gICAgICAgICAgaGlkZUVsZW1lbnQoZDMuc2VsZWN0KGhvdmVyTGluZVRleHRSZWYuY3VycmVudCkpXG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZW5kJywgKCkgPT4gc2V0SXNEcmFnZ2luZyhmYWxzZSkpXG4gICAgICAgIC5vbignZHJhZycsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBldmVudC54IC0gZXZlbnQuc3ViamVjdC54XG4gICAgICAgICAgY29uc3QgY3VycmVudExlZnQgPSB4U2NhbGUoc2VsZWN0aW9uUmFuZ2VbMF0pXG4gICAgICAgICAgY29uc3QgY3VycmVudFJpZ2h0ID0geFNjYWxlKHNlbGVjdGlvblJhbmdlWzFdKVxuICAgICAgICAgIGNvbnN0IG5ld0xlZnQgPSBjdXJyZW50TGVmdCArIHZhbHVlXG4gICAgICAgICAgY29uc3QgbmV3UmlnaHQgPSBjdXJyZW50UmlnaHQgKyB2YWx1ZVxuICAgICAgICAgIGNvbnN0IG5ld0xlZnREYXRlID0gbW9tZW50LnR6KHhTY2FsZS5pbnZlcnQobmV3TGVmdCksIHByb3BzLnRpbWV6b25lKVxuICAgICAgICAgIGNvbnN0IG5ld1JpZ2h0RGF0ZSA9IG1vbWVudC50eihcbiAgICAgICAgICAgIHhTY2FsZS5pbnZlcnQobmV3UmlnaHQpLFxuICAgICAgICAgICAgcHJvcHMudGltZXpvbmVcbiAgICAgICAgICApXG4gICAgICAgICAgc2V0U2VsZWN0aW9uUmFuZ2UoW25ld0xlZnREYXRlLCBuZXdSaWdodERhdGVdKVxuICAgICAgICB9KSBhcyBhbnlcbiAgICBkMy5zZWxlY3QoYnJ1c2hCYXJSZWYuY3VycmVudCkuY2FsbChnZXRCcnVzaERyYWcoKSlcbiAgfSwgW3hTY2FsZSwgc2VsZWN0aW9uUmFuZ2UsIHByb3BzLnRpbWV6b25lXSlcbiAgLy8gV2hlbiB0aGUgc2VsZWN0aW9uIHJhbmdlIGlzIGNoYW5nZWQgb3IgdGhlIHNjYWxlIGNoYW5nZXMgdXBkYXRlIHRoZSBsZWZ0LCByaWdodCwgYW5kIGJydXNoIG1hcmtlcnNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoXG4gICAgICBsZWZ0TWFya2VyUmVmLmN1cnJlbnQgJiZcbiAgICAgIHJpZ2h0TWFya2VyUmVmLmN1cnJlbnQgJiZcbiAgICAgIGJydXNoQmFyUmVmLmN1cnJlbnRcbiAgICApIHtcbiAgICAgIGNvbnN0IGxlZnRNYXJrZXIgPSBkMy5zZWxlY3QobGVmdE1hcmtlclJlZi5jdXJyZW50KVxuICAgICAgY29uc3QgcmlnaHRNYXJrZXIgPSBkMy5zZWxlY3QocmlnaHRNYXJrZXJSZWYuY3VycmVudClcbiAgICAgIGNvbnN0IGJydXNoQmFyID0gZDMuc2VsZWN0KGJydXNoQmFyUmVmLmN1cnJlbnQpXG4gICAgICBpZiAocHJvcHMubW9kZSA9PT0gJ3NpbmdsZScgJiYgc2VsZWN0aW9uUmFuZ2UubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IGxlZnRNYXJrZXIgPSBkMy5zZWxlY3QobGVmdE1hcmtlclJlZi5jdXJyZW50KVxuICAgICAgICBjb25zdCBsZWZ0VmFsdWUgPSBzZWxlY3Rpb25SYW5nZVswXVxuICAgICAgICBsZWZ0TWFya2VyXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4U2NhbGUobGVmdFZhbHVlKX0sICR7bWFya2VySGVpZ2h0fSlgKVxuICAgICAgICAgIC5hdHRyKCdzdHlsZScsICdkaXNwbGF5OiBibG9jaycpXG4gICAgICB9IGVsc2UgaWYgKHByb3BzLm1vZGUgIT09ICdzaW5nbGUnICYmIHNlbGVjdGlvblJhbmdlLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIGNvbnN0IFtsZWZ0VmFsdWUsIHJpZ2h0VmFsdWVdID0gc2VsZWN0aW9uUmFuZ2VcbiAgICAgICAgbGVmdE1hcmtlclxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eFNjYWxlKGxlZnRWYWx1ZSl9LCAke21hcmtlckhlaWdodH0pYClcbiAgICAgICAgICAuYXR0cignc3R5bGUnLCAnZGlzcGxheTogYmxvY2snKVxuICAgICAgICByaWdodE1hcmtlclxuICAgICAgICAgIC5hdHRyKFxuICAgICAgICAgICAgJ3RyYW5zZm9ybScsXG4gICAgICAgICAgICBgdHJhbnNsYXRlKCR7eFNjYWxlKHJpZ2h0VmFsdWUpfSwgJHttYXJrZXJIZWlnaHR9KWBcbiAgICAgICAgICApXG4gICAgICAgICAgLmF0dHIoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrJylcbiAgICAgICAgYnJ1c2hCYXJcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3hTY2FsZShsZWZ0VmFsdWUpfSwke21hcmtlckhlaWdodH0pYClcbiAgICAgICAgICAuYXR0cignd2lkdGgnLCB4U2NhbGUocmlnaHRWYWx1ZSkgLSB4U2NhbGUobGVmdFZhbHVlKSlcbiAgICAgICAgICAuYXR0cignaGVpZ2h0JywgJzUwJylcbiAgICAgICAgICAuYXR0cignc3R5bGUnLCAnZGlzcGxheTogYmxvY2snKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlkZUVsZW1lbnQobGVmdE1hcmtlciBhcyBhbnkpXG4gICAgICAgIGhpZGVFbGVtZW50KHJpZ2h0TWFya2VyIGFzIGFueSlcbiAgICAgICAgaGlkZUVsZW1lbnQoYnJ1c2hCYXIgYXMgYW55KVxuICAgICAgfVxuICAgIH1cbiAgfSwgW3hTY2FsZSwgc2VsZWN0aW9uUmFuZ2UsIHByb3BzLm1vZGUsIHByb3BzLmhlaWdodCwgcHJvcHMudGltZXpvbmVdKVxuICBjb25zdCByZW5kZXJDb3B5YWJsZURhdGUgPSAoZGF0ZTogTW9tZW50KSA9PiB7XG4gICAgY29uc3QgZm9ybWF0dGVkRGF0ZSA9IGNvbnZlcnRUb0Rpc3BsYXlhYmxlKFxuICAgICAgZGF0ZSxcbiAgICAgIHByb3BzLnRpbWV6b25lLFxuICAgICAgcHJvcHMuZm9ybWF0XG4gICAgKVxuICAgIHJldHVybiAoXG4gICAgICA8PlxuICAgICAgICA8YnIgLz5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlblRleHRBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICAgICAgICAgICAgaGlkZGVuVGV4dEFyZWEuaW5uZXJUZXh0ID0gZm9ybWF0dGVkRGF0ZVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChoaWRkZW5UZXh0QXJlYSlcbiAgICAgICAgICAgIGhpZGRlblRleHRBcmVhLnNlbGVjdCgpXG4gICAgICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGhpZGRlblRleHRBcmVhKVxuICAgICAgICAgICAgcHJvcHMub25Db3B5ICYmIHByb3BzLm9uQ29weShmb3JtYXR0ZWREYXRlKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7Zm9ybWF0dGVkRGF0ZX1cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8Lz5cbiAgICApXG4gIH1cbiAgY29uc3QgcmVuZGVyQ29udGV4dCA9ICgpID0+IHtcbiAgICBjb25zdCByZW5kZXJTdGFydEFuZEVuZCA9ICgpID0+IChcbiAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgPFRpbWVUZXh0PlxuICAgICAgICAgIDxiPlN0YXJ0PC9iPlxuICAgICAgICAgIHtzZWxlY3Rpb25SYW5nZVswXSAmJiByZW5kZXJDb3B5YWJsZURhdGUoc2VsZWN0aW9uUmFuZ2VbMF0pfVxuICAgICAgICA8L1RpbWVUZXh0PlxuICAgICAgICA8VGltZVRleHQ+XG4gICAgICAgICAgPGI+RW5kPC9iPlxuICAgICAgICAgIHtzZWxlY3Rpb25SYW5nZVsxXSAmJiByZW5kZXJDb3B5YWJsZURhdGUoc2VsZWN0aW9uUmFuZ2VbMV0pfVxuICAgICAgICA8L1RpbWVUZXh0PlxuICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICApXG4gICAgLy8gU2luZ2xlIFN0YXRlcyAtIEVtcHR5LCBTaW5nbGUgVGltZVxuICAgIGlmIChwcm9wcy5tb2RlID09PSAnc2luZ2xlJykge1xuICAgICAgaWYgKCFzZWxlY3Rpb25SYW5nZVswXSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxNZXNzYWdlPkNsaWNrIHRvIHNlbGVjdCBhIHRpbWUuIFpvb20gd2l0aCB0aGUgc2Nyb2xsIHdoZWVsLjwvTWVzc2FnZT5cbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRpbWVUZXh0PlxuICAgICAgICAgIDxiPlRpbWU8L2I+XG4gICAgICAgICAge3NlbGVjdGlvblJhbmdlWzBdICYmIHJlbmRlckNvcHlhYmxlRGF0ZShzZWxlY3Rpb25SYW5nZVswXSl9XG4gICAgICAgIDwvVGltZVRleHQ+XG4gICAgICApXG4gICAgICAvLyBSYW5nZSBTdGF0ZXMgLSBFbXB0eSwgUmFuZ2Ugb2YgVGltZXNcbiAgICB9IGVsc2UgaWYgKHByb3BzLm1vZGUgPT09ICdyYW5nZScpIHtcbiAgICAgIGlmICghc2VsZWN0aW9uUmFuZ2VbMF0pIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8TWVzc2FnZT5EcmFnIHRvIHNlbGVjdCBhIHJhbmdlLiBab29tIHdpdGggdGhlIHNjcm9sbCB3aGVlbC48L01lc3NhZ2U+XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiByZW5kZXJTdGFydEFuZEVuZCgpXG4gICAgICAvLyBTZWxlY3Rpb24gU3RhdGVzIC0gRW1wdHksIFN0YXJ0IFRpbWUsIFN0YXJ0ICsgRW5kIFRpbWVzXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghc2VsZWN0aW9uUmFuZ2VbMF0pIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8TWVzc2FnZT5cbiAgICAgICAgICAgIENsaWNrIHRvIHNlbGVjdCBhIGNsdXN0ZXIgb2YgcmVzdWx0cy4gWm9vbSB3aXRoIHRoZSBzY3JvbGwgd2hlZWwuXG4gICAgICAgICAgPC9NZXNzYWdlPlxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVuZGVyU3RhcnRBbmRFbmQoKVxuICAgIH1cbiAgfVxuICBjb25zdCBsb29rdXBBbGlhcyA9IChhdHRyaWJ1dGU6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHsgZGF0ZUF0dHJpYnV0ZUFsaWFzZXMgfSA9IHByb3BzXG4gICAgaWYgKGRhdGVBdHRyaWJ1dGVBbGlhc2VzICYmIGRhdGVBdHRyaWJ1dGVBbGlhc2VzW2F0dHJpYnV0ZV0pIHtcbiAgICAgIHJldHVybiBkYXRlQXR0cmlidXRlQWxpYXNlc1thdHRyaWJ1dGVdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhdHRyaWJ1dGVcbiAgICB9XG4gIH1cbiAgY29uc3QgYnJ1c2hPdmVybGF5V2lkdGggPSBNYXRoLm1heCh3aWR0aCAtIDIgKiBBWElTX01BUkdJTiwgMClcbiAgY29uc3QgYnJ1c2hPdmVybGF5SGVpZ2h0ID0gTWF0aC5tYXgoXG4gICAgaGVpZ2h0IC0gKEFYSVNfTUFSR0lOICsgQVhJU19IRUlHSFQgKyBoZWlnaHRPZmZzZXQpLFxuICAgIDBcbiAgKVxuICByZXR1cm4gKFxuICAgIDxSb290IHJlZj17cm9vdFJlZn0gc3R5bGU9e3sgaGVpZ2h0OiAnMTAwJScgfX0+XG4gICAgICA8ZGl2PlxuICAgICAgICA8RGF0ZUF0dHJpYnV0ZVNlbGVjdFxuICAgICAgICAgIHZpc2libGU9e3Byb3BzLmRhdGEgJiYgcHJvcHMuZGF0YSEubGVuZ3RoID4gMH1cbiAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgIG9uQ2hhbmdlPXsoZTogYW55KSA9PiBzZXRTZWxlY3RlZERhdGVBdHRyaWJ1dGUoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgIHZhbHVlPXtzZWxlY3RlZERhdGVBdHRyaWJ1dGV9XG4gICAgICAgID5cbiAgICAgICAgICB7cG9zc2libGVEYXRlQXR0cmlidXRlcy5tYXAoKGRhdGVBdHRyaWJ1dGU6IHN0cmluZykgPT4gKFxuICAgICAgICAgICAgPE1lbnVJdGVtIHZhbHVlPXtkYXRlQXR0cmlidXRlfT5cbiAgICAgICAgICAgICAge2xvb2t1cEFsaWFzKGRhdGVBdHRyaWJ1dGUpfVxuICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9EYXRlQXR0cmlidXRlU2VsZWN0PlxuICAgICAgPC9kaXY+XG4gICAgICB7dG9vbHRpcCAmJiAoXG4gICAgICAgIDxUb29sdGlwIG1lc3NhZ2U9e3Rvb2x0aXAubWVzc2FnZX0geD17dG9vbHRpcC54fSB5PXt0b29sdGlwLnl9IC8+XG4gICAgICApfVxuICAgICAgPHN2ZyByZWY9e2QzQ29udGFpbmVyUmVmfT5cbiAgICAgICAgPHJlY3RcbiAgICAgICAgICBjbGFzc05hbWU9XCJicnVzaC1vdmVybGF5XCJcbiAgICAgICAgICB4PXtBWElTX01BUkdJTn1cbiAgICAgICAgICB5PXswfVxuICAgICAgICAgIHdpZHRoPXticnVzaE92ZXJsYXlXaWR0aH1cbiAgICAgICAgICBoZWlnaHQ9e2JydXNoT3ZlcmxheUhlaWdodH1cbiAgICAgICAgICBmaWxsPVwidHJhbnNwYXJlbnRcIlxuICAgICAgICAvPlxuICAgICAgICA8ZyBjbGFzc05hbWU9XCJkYXRhLWhvbGRlclwiIC8+XG5cbiAgICAgICAgPHJlY3QgcmVmPXticnVzaEJhclJlZn0gY2xhc3NOYW1lPVwiYnJ1c2hCYXJcIiAvPlxuXG4gICAgICAgIDxnIHJlZj17aG92ZXJMaW5lUmVmfSBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX0+XG4gICAgICAgICAgPEhvdmVyTGluZSB4MT1cIjBcIiB5MT1cIjBcIiB4Mj1cIjBcIiB5Mj1cIjUwXCIgLz5cbiAgICAgICAgPC9nPlxuXG4gICAgICAgIDxIb3ZlckxpbmVUZXh0XG4gICAgICAgICAgeD1cIjBcIlxuICAgICAgICAgIHk9XCIwXCJcbiAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX1cbiAgICAgICAgICByZWY9e2hvdmVyTGluZVRleHRSZWZ9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPE1hcmtlckhvdmVyIHJlZj17bGVmdE1hcmtlclJlZn0+XG4gICAgICAgICAgPE1hcmtlckxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIwXCIgeTI9XCI1MFwiIC8+XG4gICAgICAgICAgPE1hcmtlckxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIwXCIgeTI9XCI1MFwiIGhpZGRlbj17dHJ1ZX0gLz5cbiAgICAgICAgPC9NYXJrZXJIb3Zlcj5cbiAgICAgICAgPE1hcmtlckhvdmVyIHJlZj17cmlnaHRNYXJrZXJSZWZ9PlxuICAgICAgICAgIDxNYXJrZXJMaW5lIHgxPVwiMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiNTBcIiAvPlxuICAgICAgICAgIDxNYXJrZXJMaW5lIHgxPVwiMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiNTBcIiBoaWRkZW49e3RydWV9IC8+XG4gICAgICAgIDwvTWFya2VySG92ZXI+XG5cbiAgICAgICAgPGcgY2xhc3NOYW1lPVwiYXhpcyBheGlzLS14XCIgaWQ9XCJheGlzXCI+XG4gICAgICAgICAgPHJlY3RcbiAgICAgICAgICAgIHdpZHRoPXt3aWR0aH1cbiAgICAgICAgICAgIGhlaWdodD17QVhJU19IRUlHSFQgKyBBWElTX01BUkdJTn1cbiAgICAgICAgICAgIGZpbGxPcGFjaXR5PVwiMFwiXG4gICAgICAgICAgICBmaWxsPVwiYmxhY2tcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPENvbnRleHRSb3c+XG4gICAgICAgIHtyZW5kZXJDb250ZXh0KCl9XG4gICAgICAgIDxCdXR0b25BcmVhPlxuICAgICAgICAgIDxUaW1lbGluZUJ1dHRvbiB2YXJpYW50PVwiY29udGFpbmVkXCIgb25DbGljaz17KCkgPT4gem9vbU91dCgpfSBpY29uPlxuICAgICAgICAgICAgLVxuICAgICAgICAgIDwvVGltZWxpbmVCdXR0b24+XG4gICAgICAgICAgPFRpbWVsaW5lQnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiBvbkNsaWNrPXsoKSA9PiB6b29tSW4oKX0gaWNvbj5cbiAgICAgICAgICAgICtcbiAgICAgICAgICA8L1RpbWVsaW5lQnV0dG9uPlxuICAgICAgICAgIHtwcm9wcy5vbkRvbmUgJiYgcHJvcHMubW9kZSAmJiAoXG4gICAgICAgICAgICA8VGltZWxpbmVCdXR0b25cbiAgICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBwcm9wcy5vbkRvbmUgJiYgcHJvcHMub25Eb25lKHNlbGVjdGlvblJhbmdlKVxuICAgICAgICAgICAgICAgIHNldFNlbGVjdGlvblJhbmdlKFtdKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBEb25lXG4gICAgICAgICAgICA8L1RpbWVsaW5lQnV0dG9uPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvQnV0dG9uQXJlYT5cbiAgICAgIDwvQ29udGV4dFJvdz5cbiAgICA8L1Jvb3Q+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IFRpbWVsaW5lXG4iXX0=