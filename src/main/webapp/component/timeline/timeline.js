import { __makeTemplateObject, __read, __spreadArray } from "tslib";
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
        return (React.createElement(React.Fragment, null,
            React.createElement("span", null, d),
            React.createElement("br", null)));
    });
    var otherResults = (React.createElement(React.Fragment, null,
        React.createElement("br", null), "+".concat(data.length - 5, " other results")));
    return (React.createElement(React.Fragment, null,
        titles,
        data.length > 5 && otherResults));
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
    var handleZoom = function () {
        // Tooltip sticks around without this.
        setTooltip(null);
        var transform = d3.event.transform;
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
        .scaleExtent([1, 24 * 60 * 60]) // Allows selections down to the minute at full zoom
        .translateExtent([
        [0, 0],
        [width, height],
    ])
        .extent([
        [0, 0],
        [width, height],
    ])
        .filter(function () {
        // If event triggered below xAxis, let default zoom behavior handle it (allows panning by dragging on axis)
        console.debug('Click/Drag Event: ', d3.event);
        var axisOffset = heightOffset ? heightOffset - 50 : -10;
        if (d3.event.layerY > height + AXIS_MARGIN - AXIS_HEIGHT - axisOffset) {
            console.debug('Drag below xAxis, ignore');
            return true;
        }
        else {
            console.debug("Drag above xAxis, don't ignore");
        }
        var shouldFilterEvent = d3.event.type !== 'mousedown';
        if (!shouldFilterEvent) {
            console.debug('Ignoring event type: ', d3.event.type);
        }
        return shouldFilterEvent;
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
        // When the d3Container mousemove event triggers, show the hover line
        d3.select(d3ContainerRef.current).on('mousemove', function () {
            var coord = d3.mouse(this);
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
            .on('mousemove', function () {
            var id = d3.select(this).node().id;
            var x = d3.event.layerX;
            var y = d3.event.layerY;
            var tooltipInBounds = x <= width * 0.75;
            setTooltip({
                // If the tooltip will overflow off the timeline, set x to left of the cursor instead of right.
                x: tooltipInBounds ? x + 25 : x - width * 0.25,
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
         *
         * Selection Drag does two things:
         * 1. When the user drags across the timeline, a range selection will be created.
         * 2. If the drag event is only 5 pixels or less from start to finish AND ends on a rect object,
         * assume that the user meant to click instead of drag, and properly trigger a click action on the rect.
         */
        var getSelectionDrag = function () {
            var clickStart;
            return d3
                .drag()
                .on('start', function () {
                clickStart = d3.event.x;
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
                // Set isDragging to false to trigger a selection update, additionally check if user meant to click.
                .on('end', function () {
                if (!props.mode) {
                    showElement(d3.select(hoverLineRef.current));
                    setIsDragging(false);
                    var clickDistance = clickStart - d3.event.x;
                    var sourceEvent = d3.event.sourceEvent;
                    if (Math.abs(clickDistance) < 5) {
                        var nodeName = sourceEvent.srcElement.nodeName;
                        setSelectionRange([]);
                        if (nodeName === 'rect' || nodeName === 'line') {
                            var x_1 = d3.event.x;
                            var bucket = dataBuckets.find(function (b) { return b.x1 < x_1 && x_1 <= b.x2; });
                            bucket && props.onSelect && props.onSelect(bucket.items);
                        }
                    }
                }
            })
                .on('drag', function () {
                if (props.mode !== 'single') {
                    var diff = d3.event.x - d3.event.subject.x;
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
            });
        };
        d3.select(d3ContainerRef.current).call(getSelectionDrag());
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
                .on('drag', function () {
                var dragValue = xScale.invert(d3.event.x);
                var dateWithTimezone = moment.tz(dragValue, props.timezone);
                var BUFFER = 10; // Buffer in pixels to keep sliders from overlapping/crossing
                if (slider === 'LEFT') {
                    var maximumX = xScale(selectionRange[1]) - BUFFER;
                    if (d3.event.x <= maximumX) {
                        setSelectionRange([dateWithTimezone, selectionRange[1]]);
                    }
                }
                else if (slider === 'RIGHT') {
                    var minimumX = xScale(selectionRange[0]) + BUFFER;
                    if (d3.event.x >= minimumX) {
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
                .on('drag', function () {
                var value = d3.event.x - d3.event.subject.x;
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
        return (React.createElement(React.Fragment, null,
            React.createElement("br", null),
            React.createElement(Button, { variant: "contained", onClick: function () {
                    var hiddenTextArea = document.createElement('textarea');
                    hiddenTextArea.innerText = formattedDate;
                    document.body.appendChild(hiddenTextArea);
                    hiddenTextArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(hiddenTextArea);
                    props.onCopy && props.onCopy(formattedDate);
                } }, formattedDate)));
    };
    var renderContext = function () {
        var renderStartAndEnd = function () { return (React.createElement(React.Fragment, null,
            React.createElement(TimeText, null,
                React.createElement("b", null, "Start"),
                selectionRange[0] && renderCopyableDate(selectionRange[0])),
            React.createElement(TimeText, null,
                React.createElement("b", null, "End"),
                selectionRange[1] && renderCopyableDate(selectionRange[1])))); };
        // Single States - Empty, Single Time
        if (props.mode === 'single') {
            if (!selectionRange[0]) {
                return (React.createElement(Message, null, "Click to select a time. Zoom with the scroll wheel."));
            }
            return (React.createElement(TimeText, null,
                React.createElement("b", null, "Time"),
                selectionRange[0] && renderCopyableDate(selectionRange[0])));
            // Range States - Empty, Range of Times
        }
        else if (props.mode === 'range') {
            if (!selectionRange[0]) {
                return (React.createElement(Message, null, "Drag to select a range. Zoom with the scroll wheel."));
            }
            return renderStartAndEnd();
            // Selection States - Empty, Start Time, Start + End Times
        }
        else {
            if (!selectionRange[0]) {
                return (React.createElement(Message, null, "Click to select a cluster of results. Zoom with the scroll wheel."));
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
    return (React.createElement(Root, { ref: rootRef, style: { height: '100%' } },
        React.createElement("div", null,
            React.createElement(DateAttributeSelect, { visible: props.data && props.data.length > 0, variant: "outlined", onChange: function (e) { return setSelectedDateAttribute(e.target.value); }, value: selectedDateAttribute }, possibleDateAttributes.map(function (dateAttribute) { return (React.createElement(MenuItem, { value: dateAttribute }, lookupAlias(dateAttribute))); }))),
        tooltip && (React.createElement(Tooltip, { message: tooltip.message, x: tooltip.x, y: tooltip.y })),
        React.createElement("svg", { ref: d3ContainerRef },
            React.createElement("g", { className: "data-holder" }),
            React.createElement("rect", { ref: brushBarRef, className: "brushBar" }),
            React.createElement("g", { ref: hoverLineRef, style: { display: 'none' } },
                React.createElement(HoverLine, { x1: "0", y1: "0", x2: "0", y2: "50" })),
            React.createElement(HoverLineText, { x: "0", y: "0", style: { display: 'none' }, ref: hoverLineTextRef }),
            React.createElement(MarkerHover, { ref: leftMarkerRef },
                React.createElement(MarkerLine, { x1: "0", y1: "0", x2: "0", y2: "50" }),
                React.createElement(MarkerLine, { x1: "0", y1: "0", x2: "0", y2: "50", hidden: true })),
            React.createElement(MarkerHover, { ref: rightMarkerRef },
                React.createElement(MarkerLine, { x1: "0", y1: "0", x2: "0", y2: "50" }),
                React.createElement(MarkerLine, { x1: "0", y1: "0", x2: "0", y2: "50", hidden: true })),
            React.createElement("g", { className: "axis axis--x", id: "axis" },
                React.createElement("rect", { width: width, height: AXIS_HEIGHT + AXIS_MARGIN, fillOpacity: "0", fill: "black" }))),
        React.createElement(ContextRow, null,
            renderContext(),
            React.createElement(ButtonArea, null,
                React.createElement(TimelineButton, { variant: "contained", onClick: function () { return zoomOut(); }, icon: true }, "-"),
                React.createElement(TimelineButton, { variant: "contained", onClick: function () { return zoomIn(); }, icon: true }, "+"),
                props.onDone && props.mode && (React.createElement(TimelineButton, { color: "primary", variant: "contained", onClick: function () {
                        props.onDone && props.onDone(selectionRange);
                        setSelectionRange([]);
                    } }, "Done"))))));
};
export default Timeline;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9, templateObject_10, templateObject_11;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3RpbWVsaW5lL3RpbWVsaW5lLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUE7QUFDeEIsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sT0FBTyxDQUFBO0FBQ25ELE9BQU8sRUFBRSxPQUFPLEVBQWdCLE1BQU0sV0FBVyxDQUFBO0FBQ2pELE9BQU8sRUFDTCxLQUFLLEVBQ0wsVUFBVSxFQUNWLGVBQWUsRUFDZixvQkFBb0IsRUFDcEIsV0FBVyxHQUNaLE1BQU0sUUFBUSxDQUFBO0FBQ2YsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sU0FBUyxDQUFBO0FBQzNDLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUV0QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLFFBQVEsTUFBTSx3QkFBd0IsQ0FBQTtBQUM3QyxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFBO0FBQ2xDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxVQUFVLENBQUE7QUFDeEMsT0FBTyxNQUFrQixNQUFNLGlCQUFpQixDQUFBO0FBQ2hELFlBQVk7QUFDWixJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUE7QUFDdEIsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFBO0FBQ3RCLGNBQWM7QUFDZCxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsR0FBRyxpSkFBQSw4RUFJNUIsSUFBQSxDQUFBO0FBQ0QsSUFBTSxhQUFhLEdBQUcsTUFBTSxD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QUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQTt3QkFDNUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUE7b0JBQ3ZCLENBQUMsV0FHYyxDQUNsQixDQUNVLENBQ0YsQ0FDUixDQUNSLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxlQUFlLFFBQVEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGQzIGZyb20gJ2QzJ1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGUgfSBmcm9tICdyZWFjdCdcbmltcG9ydCB7IFRvb2x0aXAsIFRvb2x0aXBQcm9wcyB9IGZyb20gJy4vdG9vbHRpcCdcbmltcG9ydCB7XG4gIHJhbmdlLFxuICBmb3JtYXREYXRlLFxuICBkYXRlV2l0aGluUmFuZ2UsXG4gIGNvbnZlcnRUb0Rpc3BsYXlhYmxlLFxuICBtdWx0aUZvcm1hdCxcbn0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgdXNlU2VsZWN0aW9uUmFuZ2UgfSBmcm9tICcuL2hvb2tzJ1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IHsgVGltZXNjYWxlIH0gZnJvbSAnLi90eXBlcydcbmltcG9ydCBzdHlsZWQgZnJvbSAnc3R5bGVkLWNvbXBvbmVudHMnXG5pbXBvcnQgU2VsZWN0IGZyb20gJ0BtdWkvbWF0ZXJpYWwvU2VsZWN0J1xuaW1wb3J0IE1lbnVJdGVtIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTWVudUl0ZW0nXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IHsgbGlnaHRlbiB9IGZyb20gJ3BvbGlzaGVkJ1xuaW1wb3J0IHsgcmVhZGFibGVDb2xvciB9IGZyb20gJ3BvbGlzaGVkJ1xuaW1wb3J0IG1vbWVudCwgeyBNb21lbnQgfSBmcm9tICdtb21lbnQtdGltZXpvbmUnXG4vLyBDb25zdGFudHNcbmNvbnN0IEFYSVNfTUFSR0lOID0gMjBcbmNvbnN0IEFYSVNfSEVJR0hUID0gMTVcbi8vIENvbG9yIFRoZW1lXG5jb25zdCBDb250ZXh0Um93ID0gc3R5bGVkLmRpdmBcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBzcGFjZS1iZXR3ZWVuO1xuICBtYXJnaW4tdG9wOiAxMHB4O1xuYFxuY29uc3QgSG92ZXJMaW5lVGV4dCA9IHN0eWxlZC50ZXh0YFxuICBmaWxsOiAkeyh7IHRoZW1lIH0pID0+IHJlYWRhYmxlQ29sb3IodGhlbWUuYmFja2dyb3VuZENvbnRlbnQpfTtcbiAgZm9udC1mYW1pbHk6ICdPcGVuIFNhbnMnLCBzYW5zLXNlcmlmO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbmBcbmNvbnN0IEhvdmVyTGluZSA9IHN0eWxlZC5saW5lYFxuICBzdHJva2U6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUucHJpbWFyeUNvbG9yfTtcbiAgc3Ryb2tlLXdpZHRoOiAzO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbmBcbmNvbnN0IE1hcmtlckhvdmVyID0gc3R5bGVkLmdgXG4gIDpob3ZlciB7XG4gICAgY3Vyc29yOiBldy1yZXNpemU7XG4gIH1cbmBcbmNvbnN0IE1hcmtlckxpbmUgPSBzdHlsZWQubGluZTx7XG4gIGhpZGRlbj86IGJvb2xlYW5cbn0+YFxuICBzdHJva2U6ICR7KHByb3BzOiBhbnkpID0+XG4gICAgIXByb3BzLmhpZGRlblxuICAgICAgPyBsaWdodGVuKDAuMSwgcHJvcHMudGhlbWUucHJpbWFyeUNvbG9yKVxuICAgICAgOiAncmdiYSgwLCAwLCAwLCAwKSd9O1xuICBzdHJva2Utd2lkdGg6ICR7KHByb3BzOiBhbnkpID0+ICghcHJvcHMuaGlkZGVuID8gMiA6IDE4KX07XG5gXG5jb25zdCBUaW1lbGluZUJ1dHRvbiA9IHN0eWxlZChCdXR0b24pPHtcbiAgaWNvbj86IGJvb2xlYW5cbiAgY29sb3I/OiBzdHJpbmdcbn0+YFxuICBkaXNwbGF5OiBmbGV4O1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgZm9udC1mYW1pbHk6ICdPcGVuIFNhbnMnLCBzYW5zLXNlcmlmO1xuICBtaW4td2lkdGg6IDNyZW07XG4gIGhlaWdodDogM3JlbTtcblxuICAkeyh7IGljb24gfSkgPT5cbiAgICAhaWNvbiAmJlxuICAgIGBcbiAgICAgIGZvbnQtc2l6ZTogMXJlbTtcbiAgICAgIHBhZGRpbmc6IDBweCAyMHB4O1xuICAgICAgbWFyZ2luLWxlZnQ6IDE1cHggIWltcG9ydGFudDtcbiAgICBgfSA6aG92ZXIge1xuICB9XG5cbiAgOmZvY3VzIHtcbiAgICBvdXRsaW5lOiBub25lO1xuICB9XG5gXG5jb25zdCBEYXRlQXR0cmlidXRlU2VsZWN0ID0gc3R5bGVkKFNlbGVjdCk8e1xuICB2aXNpYmxlPzogYm9vbGVhblxufT5gXG4gIG1hcmdpbjogMTBweDtcbiAgdmlzaWJpbGl0eTogJHsocHJvcHM6IGFueSkgPT4gKHByb3BzLnZpc2libGUgPyAndmlzaWJsZScgOiAnaGlkZGVuJyl9O1xuYFxuY29uc3QgQnV0dG9uQXJlYSA9IHN0eWxlZC5kaXZgXG4gIG1hcmdpbjogMTBweDtcbiAgZGlzcGxheTogZmxleDtcbiAganVzdGlmeS1jb250ZW50OiBmbGV4LWVuZDtcbiAgbWFyZ2luLXJpZ2h0OiAyMHB4O1xuXG4gIGJ1dHRvbiB7XG4gICAgbWFyZ2luLWxlZnQ6IDVweDtcbiAgfVxuYFxuY29uc3QgUm9vdCA9IHN0eWxlZC5kaXZgXG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG5cbiAgLmJydXNoQmFyIHtcbiAgICAvKiBUaGlzIHdpbGwgbGV0IHlvdSBzZWxlY3QvaG92ZXIgcmVjb3JkcyBiZWhpbmQgYXJlYSwgYnV0IGNhbid0IGJydXNoLWRyYWcgYXJlYSBpZiBpdCdzIHNldC4gKi9cbiAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICBvcGFjaXR5OiAwLjU7XG5cbiAgICAvKiBJZiBpdCdzIGRpc2NvdmVyZWQgdGhhdCBicnVzaCBkcmFnZ2luZyBpcyB3YW50ZWQgbW9yZSB0aGFuIGhvdmVyaW5nIGJlaGluZCB0aGUgaGlnaGxpZ2h0ZWQgYnJ1c2ggYXJlYSwgXG4gICAgc2ltcGx5IGNvbW1lbnQgdGhlIGFib3ZlIGxpbmVzIGFuZCB1bmNvbW1lbnQgdGhpcyBvcGFjaXR5ICovXG4gICAgLyogb3BhY2l0eTogMC4xOyAqL1xuICAgIGZpbGw6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUucHJpbWFyeUNvbG9yfTtcbiAgICBkaXNwbGF5OiBub25lO1xuXG4gICAgOmhvdmVyIHtcbiAgICAgIGN1cnNvcjogbW92ZTtcbiAgICAgIGZpbGw6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUucHJpbWFyeUNvbG9yfTtcbiAgICAgIG9wYWNpdHk6IDAuNTtcbiAgICB9XG4gIH1cblxuICAuYXhpcyB7XG4gICAgY29sb3I6ICR7KHsgdGhlbWUgfSkgPT4gcmVhZGFibGVDb2xvcih0aGVtZS5iYWNrZ3JvdW5kQ29udGVudCl9O1xuICAgIGZvbnQtc2l6ZTogMC45cmVtO1xuICAgIDpob3ZlciB7XG4gICAgICBjdXJzb3I6IGV3LXJlc2l6ZTtcbiAgICB9XG4gIH1cblxuICAuc2VsZWN0ZWQge1xuICAgIGZpbGw6ICR7KHsgdGhlbWUgfSkgPT4gdGhlbWUucHJpbWFyeUNvbG9yfSAhaW1wb3J0YW50O1xuICB9XG5cbiAgLmRhdGEge1xuICAgIGZpbGw6ICR7KHsgdGhlbWU6IHsgdGhlbWUgfSB9KSA9PlxuICAgICAgdGhlbWUgPT09ICdkYXJrJyA/IGxpZ2h0ZW4oMC43LCAnYmxhY2snKSA6IGxpZ2h0ZW4oMC4zLCAnYmxhY2snKX07XG4gICAgZmlsbC1vcGFjaXR5OiAwLjc7XG4gICAgOmhvdmVyIHtcbiAgICAgIHN0cm9rZS13aWR0aDogMnB4O1xuICAgICAgc3Ryb2tlOiAkeyh7IHRoZW1lIH0pID0+IHRoZW1lLnByaW1hcnlDb2xvcn07XG4gICAgfVxuICB9XG5gXG5jb25zdCBUaW1lVGV4dCA9IHN0eWxlZC5kaXZgXG4gIG1hcmdpbjogMTBweDtcbiAgZm9udC1mYW1pbHk6ICdPcGVuIFNhbnMnLCBzYW5zLXNlcmlmO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG5cbiAgYnIge1xuICAgIGxpbmUtaGVpZ2h0OiAxNTAlO1xuICB9XG5gXG5jb25zdCBNZXNzYWdlID0gc3R5bGVkLnNwYW5gXG4gIGZvbnQtZmFtaWx5OiAnT3BlbiBTYW5zJywgc2Fucy1zZXJpZjtcbiAgbWFyZ2luOiAxMHB4O1xuICBjb2xvcjogJHsoeyB0aGVtZSB9KSA9PiByZWFkYWJsZUNvbG9yKHRoZW1lLmJhY2tncm91bmRDb250ZW50KX07XG5gXG4vLyBIZWxwZXIgTWV0aG9kc1xuY29uc3QgZ2VuZXJhdGVUb29sdGlwTWVzc2FnZSA9IChkYXRhOiBzdHJpbmdbXSkgPT4ge1xuICBjb25zdCB0aXRsZXMgPSBkYXRhLnNsaWNlKDAsIDUpLm1hcCgoZCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIDxzcGFuPntkfTwvc3Bhbj5cbiAgICAgICAgPGJyIC8+XG4gICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgIClcbiAgfSlcbiAgY29uc3Qgb3RoZXJSZXN1bHRzID0gKFxuICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgIDxiciAvPlxuICAgICAge2ArJHtkYXRhLmxlbmd0aCAtIDV9IG90aGVyIHJlc3VsdHNgfVxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gIClcbiAgcmV0dXJuIChcbiAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICB7dGl0bGVzfVxuICAgICAge2RhdGEubGVuZ3RoID4gNSAmJiBvdGhlclJlc3VsdHN9XG4gICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgKVxufVxuLyoqXG4gKiBHaXZlbiBhIGQzIHNlbGVjdGlvbiwgc2V0IHRoZSBkaXNwbGF5IHRvIG5vbmUuXG4gKi9cbmNvbnN0IGhpZGVFbGVtZW50ID0gKGVsZW1lbnQ6IGQzLlNlbGVjdGlvbjxudWxsLCB1bmtub3duLCBudWxsLCB1bmRlZmluZWQ+KSA9PlxuICBlbGVtZW50LmF0dHIoJ3N0eWxlJywgJ2Rpc3BsYXk6IG5vbmUnKVxuLyoqXG4gKiBHaXZlbiBhIGQzIHNlbGVjdGlvbiwgc2V0IHRoZSBkaXNwbGF5IHRvIGJsb2NrLlxuICovXG5jb25zdCBzaG93RWxlbWVudCA9IChlbGVtZW50OiBkMy5TZWxlY3Rpb248bnVsbCwgdW5rbm93biwgbnVsbCwgdW5kZWZpbmVkPikgPT5cbiAgZWxlbWVudC5hdHRyKCdzdHlsZScsICdkaXNwbGF5OiBibG9jaycpXG4vKipcbiAqIERvbWFpbiBpcyB0aGUgbWluaW11bSBhbmQgbWF4aW11bSB2YWx1ZXMgdGhhdCB0aGUgc2NhbGUgY29udGFpbnMuXG4gKi9cbmNvbnN0IGdldFRpbWVzY2FsZUZyb21XaWR0aCA9IChcbiAgd2lkdGg6IG51bWJlcixcbiAgbWluOiBNb21lbnQgPSBtb21lbnQoJzE5ODAtMDEtMDE6MDA6MDAuMDAweicpLFxuICBtYXg6IE1vbWVudCA9IG1vbWVudCgpXG4pOiBUaW1lc2NhbGUgPT4ge1xuICBjb25zdCB0aW1lU2NhbGUgPSBkMy5zY2FsZVV0YygpLmRvbWFpbihbbWluLCBtYXhdKS5uaWNlKClcbiAgdGltZVNjYWxlLnJhbmdlKFtBWElTX01BUkdJTiwgd2lkdGggLSBBWElTX01BUkdJTl0pXG4gIHJldHVybiB0aW1lU2NhbGVcbn1cbmNvbnN0IGdldFBvc3NpYmxlRGF0ZUF0dHJpYnV0ZXMgPSAodGltZWxpbmVJdGVtczogVGltZWxpbmVJdGVtW10pOiBzdHJpbmdbXSA9PiB7XG4gIHJldHVybiBfKHRpbWVsaW5lSXRlbXMpXG4gICAgLm1hcCgoZCkgPT4gZC5hdHRyaWJ1dGVzKSAvL3tjcmVhdGVkOiB7ZGlzcGxheTogXCJDcmVhdGVkXCIsIHZhbHVlOiBuZXcgRGF0ZSgpfX1cbiAgICAuZmxhdE1hcCgobykgPT4gT2JqZWN0LmtleXMobykpIC8vW2NyZWF0ZWRdXG4gICAgLnVuaXEoKVxuICAgIC52YWx1ZSgpXG59XG4vLyBUeXBlc1xuZXhwb3J0IHR5cGUgVGltZWxpbmVJdGVtID0ge1xuICBpZDogc3RyaW5nXG4gIHNlbGVjdGVkOiBib29sZWFuXG4gIGRhdGE/OiBhbnlcbiAgYXR0cmlidXRlczoge1xuICAgIFtrZXk6IHN0cmluZ106IE1vbWVudFtdXG4gIH1cbn1cbnR5cGUgQnVja2V0ID0ge1xuICB4MTogbnVtYmVyXG4gIHgyOiBudW1iZXJcbiAgc2VsZWN0ZWQ6IGJvb2xlYW5cbiAgaXRlbXM6IFRpbWVsaW5lSXRlbVtdXG59XG5leHBvcnQgaW50ZXJmYWNlIFRpbWVsaW5lUHJvcHMge1xuICAvKipcbiAgICogSGVpZ2h0IGluIHBpeGVscy5cbiAgICovXG4gIGhlaWdodDogbnVtYmVyXG4gIC8qKlxuICAgKiBNb2RlIHRoYXQgdGhlIHRpbWVsaW5lIHNob3VsZCBiZSBpbi5cbiAgICovXG4gIG1vZGU/OiAnc2luZ2xlJyB8ICdyYW5nZSdcbiAgLyoqXG4gICAqIFRpbWV6b25lIHRvIHVzZSB3aGVuIGRpc3BsYXlpbmcgdGltZXMuXG4gICAqL1xuICB0aW1lem9uZTogc3RyaW5nXG4gIC8qKlxuICAgKiBEYXRlIGZvcm1hdCB0byB1c2Ugd2hlbiBkaXNwbGF5aW5nIHRpbWVzLlxuICAgKi9cbiAgZm9ybWF0OiBzdHJpbmdcbiAgLyoqXG4gICAqIFRpbWVsaW5lSXRlbSBwb2ludHNcbiAgICovXG4gIGRhdGE/OiBUaW1lbGluZUl0ZW1bXVxuICAvKipcbiAgICogQWxpYXMgTWFwIGZvciBkYXRlIGF0dHJpYnV0ZXNcbiAgICovXG4gIGRhdGVBdHRyaWJ1dGVBbGlhc2VzPzoge1xuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZ1xuICB9XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgZG9uZSBidXR0b24gaXMgY2xpY2tlZCwgcHJvdmlkaW5nIHRoZSBjdXJyZW50IHNlbGVjdGlvbiByYW5nZS5cbiAgICovXG4gIG9uRG9uZT86IChzZWxlY3Rpb25SYW5nZTogTW9tZW50W10pID0+IHZvaWRcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHRoZSBhIHNlbGVjdGlvbiBpcyBtYWRlLlxuICAgKi9cbiAgb25TZWxlY3Q/OiAoZGF0YTogVGltZWxpbmVJdGVtW10pID0+IHZvaWRcbiAgLyoqXG4gICAqIFJlbmRlciBmdW5jdGlvbiBmb3IgdG9vbHRpcHNcbiAgICovXG4gIHJlbmRlclRvb2x0aXA/OiAoZGF0YTogVGltZWxpbmVJdGVtW10pID0+IGFueVxuICAvKipcbiAgICogSGVpZ2h0IG9mZnNldCB0byBjb21iYXQgaXNzdWVzIHdpdGggZHluYW1pYyBoZWlnaHRzIHdoZW4gcmVuZGVyaW5nIHRoZSB0aW1lbGluZS5cbiAgICovXG4gIGhlaWdodE9mZnNldD86IG51bWJlclxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBkYXRlIGlzIGNvcGllZCB0byB0aGUgY2xpcGJvYXJkLlxuICAgKi9cbiAgb25Db3B5PzogKGNvcGllZFZhbHVlOiBzdHJpbmcpID0+IHZvaWRcbiAgLyoqXG4gICAqIE1pbmltdW0gZGF0ZSBib3VuZHMgdG8gcmVuZGVyIGl0ZW1zIGJldHdlZW4uXG4gICAqL1xuICBtaW4/OiBNb21lbnRcbiAgLyoqXG4gICAqIE1heGltdW0gZGF0ZSBib3VuZHMgdG8gcmVuZGVyIGl0ZW1zIGJldHdlZW4uXG4gICAqL1xuICBtYXg/OiBNb21lbnRcbn1cbi8qXG4gKiBUT0RPU1xuICogLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqXG4gKiAxLiBPbiBob3ZlciBzaG91bGQgd29yayB3aGVuIHRoZSBvbiBob3ZlciBpcyBiZWhpbmQgdGhlIGFyZWEgbWFya2VyIHdoaWxlIHN0aWxsIGxldHRpbmcgeW91IGJydXNoIGRyYWcgKGlmIHBvc3NpYmxlKVxuICovXG4vLyBQbGVhc2Ugc2VlIGh0dHBzOi8vYWxpZ25lZGxlZnQuY29tL3R1dG9yaWFscy9kMy9zY2FsZXMgZm9yIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgZDMgc2NhbGVzLlxuZXhwb3J0IGNvbnN0IFRpbWVsaW5lID0gKHByb3BzOiBUaW1lbGluZVByb3BzKSA9PiB7XG4gIC8qKlxuICAgKiBUaGUgdXNlUmVmIEhvb2sgY3JlYXRlcyBhIHZhcmlhYmxlIHRoYXQgXCJob2xkcyBvblwiIHRvIGEgdmFsdWUgYWNyb3NzIHJlbmRlcmluZ1xuICAgKiBwYXNzZXMuIEluIHRoaXMgY2FzZSBpdCB3aWxsIGhvbGQgb3VyIGNvbXBvbmVudCdzIFNWRyBET00gZWxlbWVudC4gSXQnc1xuICAgKiBpbml0aWFsaXplZCBudWxsIGFuZCBSZWFjdCB3aWxsIGFzc2lnbiBpdCBsYXRlciAoc2VlIHRoZSByZXR1cm4gc3RhdGVtZW50KVxuICAgKi9cbiAgY29uc3Qgcm9vdFJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBkM0NvbnRhaW5lclJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBob3ZlckxpbmVSZWYgPSB1c2VSZWYobnVsbClcbiAgY29uc3QgaG92ZXJMaW5lVGV4dFJlZiA9IHVzZVJlZihudWxsKVxuICBjb25zdCBsZWZ0TWFya2VyUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IHJpZ2h0TWFya2VyUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IGJydXNoQmFyUmVmID0gdXNlUmVmKG51bGwpXG4gIGNvbnN0IHsgbWluLCBtYXggfSA9IHByb3BzXG4gIGNvbnN0IFt3aWR0aCwgc2V0V2lkdGhdID0gdXNlU3RhdGUoMClcbiAgY29uc3QgaGVpZ2h0ID0gcHJvcHMuaGVpZ2h0XG4gIGNvbnN0IGhlaWdodE9mZnNldCA9IHByb3BzLmhlaWdodE9mZnNldCA/IHByb3BzLmhlaWdodE9mZnNldCA6IDBcbiAgY29uc3QgcG9zc2libGVEYXRlQXR0cmlidXRlcyA9IGdldFBvc3NpYmxlRGF0ZUF0dHJpYnV0ZXMocHJvcHMuZGF0YSB8fCBbXSlcbiAgY29uc3QgdGltZXNjYWxlID0gZ2V0VGltZXNjYWxlRnJvbVdpZHRoKHdpZHRoLCBtaW4sIG1heClcbiAgY29uc3QgW3hTY2FsZSwgc2V0WFNjYWxlXSA9IHVzZVN0YXRlKCgpID0+IHRpbWVzY2FsZSlcbiAgY29uc3QgW3hBeGlzLCBzZXRYQXhpc10gPSB1c2VTdGF0ZSgoKSA9PlxuICAgIGQzLmF4aXNCb3R0b20oeFNjYWxlKS50aWNrU2l6ZShBWElTX0hFSUdIVCkudGlja0Zvcm1hdChtdWx0aUZvcm1hdClcbiAgKVxuICBjb25zdCBbZGF0YUJ1Y2tldHMsIHNldERhdGFCdWNrZXRzXSA9IHVzZVN0YXRlPEJ1Y2tldFtdPihbXSlcbiAgY29uc3QgW3Rvb2x0aXAsIHNldFRvb2x0aXBdID0gdXNlU3RhdGU8VG9vbHRpcFByb3BzIHwgbnVsbD4oKVxuICBjb25zdCBbc2VsZWN0ZWREYXRlQXR0cmlidXRlLCBzZXRTZWxlY3RlZERhdGVBdHRyaWJ1dGVdID0gdXNlU3RhdGUoJycpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGVkRGF0ZUF0dHJpYnV0ZSA9PT0gJycgJiYgcG9zc2libGVEYXRlQXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICBzZXRTZWxlY3RlZERhdGVBdHRyaWJ1dGUocG9zc2libGVEYXRlQXR0cmlidXRlc1swXSlcbiAgICB9XG4gIH0sIFtwb3NzaWJsZURhdGVBdHRyaWJ1dGVzXSlcbiAgY29uc3QgW2lzRHJhZ2dpbmcsIHNldElzRHJhZ2dpbmddID0gdXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtzZWxlY3Rpb25SYW5nZSwgc2V0U2VsZWN0aW9uUmFuZ2VdID0gdXNlU2VsZWN0aW9uUmFuZ2UoW10sIHRpbWVzY2FsZSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAod2lkdGggIT0gMCkge1xuICAgICAgY29uc29sZS5kZWJ1ZyhgV2lkdGggdXBkYXRlZCB0byAke3dpZHRofWApXG4gICAgICBzZXRYU2NhbGUoKCkgPT4gdGltZXNjYWxlKVxuICAgIH1cbiAgfSwgW3dpZHRoXSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zb2xlLmRlYnVnKGB4U2NhbGUgdXBkYXRlZCB0byAke3hTY2FsZS5yYW5nZSgpfWApXG4gICAgY29uc3QgW2xlZnQsIHJpZ2h0XSA9IHhTY2FsZS5yYW5nZSgpXG4gICAgaWYgKGxlZnQgPCByaWdodCkge1xuICAgICAgY29uc3QgbmV3WEF4aXMgPSB4QXhpcy5zY2FsZSh4U2NhbGUpXG4gICAgICBzZXRYQXhpcygoKSA9PiBuZXdYQXhpcylcbiAgICAgIGQzLnNlbGVjdCgnLmF4aXMtLXgnKS5jYWxsKG5ld1hBeGlzKVxuICAgIH1cbiAgfSwgW3hTY2FsZSwgcHJvcHMudGltZXpvbmUsIHByb3BzLmZvcm1hdF0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHJvb3RSZWYuY3VycmVudCkge1xuICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgY29uc3QgcmVjdCA9IHJvb3RSZWYuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgc2V0V2lkdGgocmVjdC53aWR0aClcbiAgICB9XG4gIH0sIFtyb290UmVmXSlcbiAgLyoqXG4gICAqIEV2ZXJ5IDEwMCBtcywgcG9sbCB0byBzZWUgdGhlIG5ldyBwYXJlbnQgcmVjdCB3aWR0aC5cbiAgICogSWYgdGhlIG5ldyBwYXJlbnQgcmVjdCB3aWR0aCBpcyBkaWZmZXJlbnQgdGhhbiBjdXJyZW50IHdpZHRoLCB1cGRhdGUgdGhlIHdpZHRoLlxuICAgKi9cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmIChyb290UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgICBjb25zdCByZWN0ID0gcm9vdFJlZi5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIGlmIChyZWN0LndpZHRoICE9PSB3aWR0aCkge1xuICAgICAgICAgIHNldFdpZHRoKHJlY3Qud2lkdGgpXG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sIDEwMClcbiAgfSwgW3Jvb3RSZWYsIHdpZHRoXSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICB6b29tQmVoYXZpb3Iuc2NhbGVUbyhcbiAgICAgIGQzLnNlbGVjdChkM0NvbnRhaW5lclJlZi5jdXJyZW50KS50cmFuc2l0aW9uKCkuZHVyYXRpb24oMCkgYXMgYW55LFxuICAgICAgMVxuICAgIClcbiAgfSwgW3dpZHRoXSlcbiAgY29uc3QgbWFya2VySGVpZ2h0ID0gaGVpZ2h0IC0gNzAgLSBBWElTX0hFSUdIVCAtIGhlaWdodE9mZnNldFxuICAvKipcbiAgICogV2hlbiBhIHpvb20gZXZlbnQgaXMgdHJpZ2dlcmVkLCB1c2UgdGhlIHRyYW5zZm9ybSBldmVudCB0byBjcmVhdGUgYSBuZXcgeFNjYWxlLFxuICAgKiB0aGVuIGNyZWF0ZSBhIG5ldyB4QXhpcyB1c2luZyB0aGUgc2NhbGUgYW5kIHVwZGF0ZSBleGlzdGluZyB4QXhpc1xuICAgKi9cbiAgY29uc3QgaGFuZGxlWm9vbSA9ICgpID0+IHtcbiAgICAvLyBUb29sdGlwIHN0aWNrcyBhcm91bmQgd2l0aG91dCB0aGlzLlxuICAgIHNldFRvb2x0aXAobnVsbClcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBkMy5ldmVudC50cmFuc2Zvcm1cbiAgICBpZiAod2lkdGggIT0gMCkge1xuICAgICAgY29uc3QgbmV3WFNjYWxlID0gdHJhbnNmb3JtLnJlc2NhbGVYKHRpbWVzY2FsZSlcbiAgICAgIHNldFhTY2FsZSgoKSA9PiBuZXdYU2NhbGUpXG4gICAgICBjb25zdCBuZXdYQXhpcyA9IHhBeGlzLnNjYWxlKG5ld1hTY2FsZSlcbiAgICAgIHNldFhBeGlzKCgpID0+IG5ld1hBeGlzKVxuICAgICAgLy8gQXBwbHkgdGhlIG5ldyB4QXhpc1xuICAgICAgZDMuc2VsZWN0KCcuYXhpcy0teCcpLmNhbGwoeEF4aXMpXG4gICAgfVxuICB9XG4gIGNvbnN0IHpvb21CZWhhdmlvciA9IGQzXG4gICAgLnpvb20oKVxuICAgIC5zY2FsZUV4dGVudChbMSwgMjQgKiA2MCAqIDYwXSkgLy8gQWxsb3dzIHNlbGVjdGlvbnMgZG93biB0byB0aGUgbWludXRlIGF0IGZ1bGwgem9vbVxuICAgIC50cmFuc2xhdGVFeHRlbnQoW1xuICAgICAgWzAsIDBdLFxuICAgICAgW3dpZHRoLCBoZWlnaHRdLFxuICAgIF0pXG4gICAgLmV4dGVudChbXG4gICAgICBbMCwgMF0sXG4gICAgICBbd2lkdGgsIGhlaWdodF0sXG4gICAgXSlcbiAgICAuZmlsdGVyKCgpID0+IHtcbiAgICAgIC8vIElmIGV2ZW50IHRyaWdnZXJlZCBiZWxvdyB4QXhpcywgbGV0IGRlZmF1bHQgem9vbSBiZWhhdmlvciBoYW5kbGUgaXQgKGFsbG93cyBwYW5uaW5nIGJ5IGRyYWdnaW5nIG9uIGF4aXMpXG4gICAgICBjb25zb2xlLmRlYnVnKCdDbGljay9EcmFnIEV2ZW50OiAnLCBkMy5ldmVudClcbiAgICAgIGNvbnN0IGF4aXNPZmZzZXQgPSBoZWlnaHRPZmZzZXQgPyBoZWlnaHRPZmZzZXQgLSA1MCA6IC0xMFxuICAgICAgaWYgKGQzLmV2ZW50LmxheWVyWSA+IGhlaWdodCArIEFYSVNfTUFSR0lOIC0gQVhJU19IRUlHSFQgLSBheGlzT2Zmc2V0KSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ0RyYWcgYmVsb3cgeEF4aXMsIGlnbm9yZScpXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmRlYnVnKFwiRHJhZyBhYm92ZSB4QXhpcywgZG9uJ3QgaWdub3JlXCIpXG4gICAgICB9XG4gICAgICBjb25zdCBzaG91bGRGaWx0ZXJFdmVudCA9IGQzLmV2ZW50LnR5cGUgIT09ICdtb3VzZWRvd24nXG4gICAgICBpZiAoIXNob3VsZEZpbHRlckV2ZW50KSB7XG4gICAgICAgIGNvbnNvbGUuZGVidWcoJ0lnbm9yaW5nIGV2ZW50IHR5cGU6ICcsIGQzLmV2ZW50LnR5cGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2hvdWxkRmlsdGVyRXZlbnRcbiAgICB9KVxuICAgIC5vbignem9vbScsIGhhbmRsZVpvb20pXG4gIGNvbnN0IHpvb21JbiA9ICgpID0+IHtcbiAgICB6b29tQmVoYXZpb3Iuc2NhbGVCeShcbiAgICAgIGQzLnNlbGVjdChkM0NvbnRhaW5lclJlZi5jdXJyZW50KS50cmFuc2l0aW9uKCkuZHVyYXRpb24oNzUwKSBhcyBhbnksXG4gICAgICAyXG4gICAgKVxuICB9XG4gIGNvbnN0IHpvb21PdXQgPSAoKSA9PiB7XG4gICAgem9vbUJlaGF2aW9yLnNjYWxlQnkoXG4gICAgICBkMy5zZWxlY3QoZDNDb250YWluZXJSZWYuY3VycmVudCkudHJhbnNpdGlvbigpLmR1cmF0aW9uKDc1MCkgYXMgYW55LFxuICAgICAgMC41XG4gICAgKVxuICB9XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLyoqXG4gICAgICogUmFuZ2UgaXMgdGhlIHJhbmdlIG9mIHBvc3NpYmxlIG91dHB1dCB2YWx1ZXMgdXNlZCBpbiBkaXNwbGF5LlxuICAgICAqIERvbWFpbiBtYXBzIHRvIFJhbmdlXG4gICAgICogaS5lLiBEYXRlcyBtYXAgdG8gUGl4ZWxzXG4gICAgICovXG4gICAgY29uc3QgcmVuZGVySW5pdGlhbFhBeGlzID0gKCkgPT4ge1xuICAgICAgY29uc3Qgc3ZnID0gZDNcbiAgICAgICAgLnNlbGVjdChkM0NvbnRhaW5lclJlZi5jdXJyZW50KVxuICAgICAgICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodClcbiAgICAgIHN2Z1xuICAgICAgICAuc2VsZWN0KCcuYXhpcy0teCcpXG4gICAgICAgIC5hdHRyKFxuICAgICAgICAgICd0cmFuc2Zvcm0nLFxuICAgICAgICAgIGB0cmFuc2xhdGUoMCAke2hlaWdodCAtIChBWElTX01BUkdJTiArIEFYSVNfSEVJR0hUICsgaGVpZ2h0T2Zmc2V0KX0pYFxuICAgICAgICApXG4gICAgICAgIC5jYWxsKHhBeGlzKVxuICAgIH1cbiAgICBpZiAoZDNDb250YWluZXJSZWYuY3VycmVudCkge1xuICAgICAgcmVuZGVySW5pdGlhbFhBeGlzKClcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGQzLnNlbGVjdChkM0NvbnRhaW5lclJlZi5jdXJyZW50KVxuICAgICAgY29udGFpbmVyLmNhbGwoem9vbUJlaGF2aW9yIGFzIGFueSlcbiAgICB9XG4gIH0sIFtoZWlnaHQsIHdpZHRoXSlcbiAgLy8gQWRkIG1vdXNlIGhhbmRsZXJzIHRvIGxpc3RlbiB0byBkMyBtb3VzZSBldmVudHNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAvLyBXaGVuIHRoZSBkM0NvbnRhaW5lciBtb3VzZW1vdmUgZXZlbnQgdHJpZ2dlcnMsIHNob3cgdGhlIGhvdmVyIGxpbmVcbiAgICBkMy5zZWxlY3QoZDNDb250YWluZXJSZWYuY3VycmVudCkub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGNvb3JkID0gZDMubW91c2UodGhpcyBhcyBhbnkpXG4gICAgICBkMy5zZWxlY3QoaG92ZXJMaW5lUmVmLmN1cnJlbnQpXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7Y29vcmRbMF19LCAke21hcmtlckhlaWdodH0pYClcbiAgICAgICAgLmF0dHIoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrJylcbiAgICAgIGNvbnN0IGhvdmVyRGF0ZSA9IG1vbWVudC50eih4U2NhbGUuaW52ZXJ0KGNvb3JkWzBdKSwgcHJvcHMudGltZXpvbmUpXG4gICAgICBjb25zdCBmb3JtYXR0ZWREYXRlID0gZm9ybWF0RGF0ZShob3ZlckRhdGUsIHByb3BzLmZvcm1hdClcbiAgICAgIGNvbnN0IHdpZHRoQnVmZmVyID0gMTUwXG4gICAgICBjb25zdCBtYXhYID0gd2lkdGggLSB3aWR0aEJ1ZmZlclxuICAgICAgbGV0IHhQb3MgPSBjb29yZFswXVxuICAgICAgaWYgKHhQb3MgPCB3aWR0aEJ1ZmZlcikgeFBvcyA9IHdpZHRoQnVmZmVyXG4gICAgICBpZiAoeFBvcyA+IG1heFgpIHhQb3MgPSBtYXhYXG4gICAgICBjb25zdCB5UG9zID0gMjBcbiAgICAgIGQzLnNlbGVjdChob3ZlckxpbmVUZXh0UmVmLmN1cnJlbnQpXG4gICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eFBvc30sICR7eVBvc30pYClcbiAgICAgICAgLmF0dHIoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrJylcbiAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgIC50ZXh0KGZvcm1hdHRlZERhdGUpXG4gICAgfSlcbiAgICAvLyBXaGVuIHRoZSBkM0NvbnRhaW5lciBtb3VzZWxlYXZlIGV2ZW50IHRyaWdnZXJzLCBzZXQgdGhlIGhvdmVyVmFsdWUgdG8gbnVsbCBhbmQgaGlkZSB0aGUgaG92ZXJMaW5lIGxpbmVcbiAgICBkMy5zZWxlY3QoZDNDb250YWluZXJSZWYuY3VycmVudCkub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBoaWRlRWxlbWVudChkMy5zZWxlY3QoaG92ZXJMaW5lUmVmLmN1cnJlbnQpKVxuICAgICAgaGlkZUVsZW1lbnQoZDMuc2VsZWN0KGhvdmVyTGluZVRleHRSZWYuY3VycmVudCkpXG4gICAgfSlcbiAgfSwgW3hTY2FsZSwgcHJvcHMudGltZXpvbmUsIHByb3BzLmZvcm1hdCwgcHJvcHMuaGVpZ2h0XSlcbiAgLy8gUmVuZGVyIHJlY3RhbmdsZXNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBtaW4gPSB4U2NhbGUucmFuZ2UoKVswXVxuICAgIGNvbnN0IG1heCA9IHhTY2FsZS5yYW5nZSgpWzFdXG4gICAgY29uc3QgTlVNX0JVQ0tFVFMgPSBNYXRoLnJvdW5kKHdpZHRoIC8gMzApIC8vIDMwIGlzIGp1c3QgYSBjb25zdGFudCB0aGF0IEkgZm91bmQgdG8gbG9vayBnb29kLlxuICAgIGNvbnN0IGJ1Y2tldFdpZHRoID0gKG1heCAtIG1pbikgLyBOVU1fQlVDS0VUU1xuICAgIGNvbnN0IGJ1Y2tldHM6IEJ1Y2tldFtdID0gcmFuZ2UoTlVNX0JVQ0tFVFMpLm1hcCgoaSkgPT4gKHtcbiAgICAgIHgxOiBtaW4gKyBidWNrZXRXaWR0aCAqIGksXG4gICAgICB4MjogbWluICsgYnVja2V0V2lkdGggKiAoaSArIDEpLFxuICAgICAgaXRlbXM6IFtdLFxuICAgICAgc2VsZWN0ZWQ6IGZhbHNlLFxuICAgIH0pKVxuICAgIGlmIChwcm9wcy5kYXRhICYmIHNlbGVjdGVkRGF0ZUF0dHJpYnV0ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkMy5zZWxlY3RBbGwoJy5kYXRhJykucmVtb3ZlKClcbiAgICAgIHByb3BzLmRhdGEuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgICBjb25zdCBkYXRlID0gZC5hdHRyaWJ1dGVzW3NlbGVjdGVkRGF0ZUF0dHJpYnV0ZSFdXG4gICAgICAgIGlmIChkYXRlID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzY2FsZWREYXRlcyA9IGRhdGUubWFwKChkKSA9PiB4U2NhbGUoZCkpXG4gICAgICAgIHNjYWxlZERhdGVzLmZvckVhY2goKHNjYWxlZERhdGUpID0+IHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ1Y2tldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGIgPSBidWNrZXRzW2ldXG4gICAgICAgICAgICBpZiAoYi54MSA8IHNjYWxlZERhdGUgJiYgc2NhbGVkRGF0ZSA8IGIueDIpIHtcbiAgICAgICAgICAgICAgYi5pdGVtcy5wdXNoKGQpXG4gICAgICAgICAgICAgIGlmIChkLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgYi5zZWxlY3RlZCA9IHRydWVcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICBjb25zdCBtb3N0SXRlbXNJbkFCdWNrZXQgPSBNYXRoLm1heCguLi5idWNrZXRzLm1hcCgoYikgPT4gYi5pdGVtcy5sZW5ndGgpKVxuICAgICAgY29uc3QgaGVpZ2h0UGVySXRlbSA9IChoZWlnaHQgLSAoaGVpZ2h0T2Zmc2V0ICsgNzUpKSAvIG1vc3RJdGVtc0luQUJ1Y2tldFxuICAgICAgc2V0RGF0YUJ1Y2tldHMoYnVja2V0cylcbiAgICAgIGJ1Y2tldHMuZm9yRWFjaCgoYiwgaSkgPT4ge1xuICAgICAgICBjb25zdCByZWN0YW5nbGVIZWlnaHQgPSBiLml0ZW1zLmxlbmd0aCAqIGhlaWdodFBlckl0ZW1cbiAgICAgICAgY29uc3QgeCA9IChiLngxICsgYi54MikgLyAyIC0gMTVcbiAgICAgICAgY29uc3QgeSA9XG4gICAgICAgICAgaGVpZ2h0IC0gcmVjdGFuZ2xlSGVpZ2h0IC0gKEFYSVNfTUFSR0lOICsgQVhJU19IRUlHSFQgKyBoZWlnaHRPZmZzZXQpXG4gICAgICAgIGQzLnNlbGVjdCgnLmRhdGEtaG9sZGVyJylcbiAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgICAgICAuYXR0cignY2xhc3MnLCBgZGF0YSAke2Iuc2VsZWN0ZWQgPyAnc2VsZWN0ZWQnIDogJyd9YClcbiAgICAgICAgICAuYXR0cignd2lkdGgnLCBidWNrZXRXaWR0aCAtIDUpXG4gICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHJlY3RhbmdsZUhlaWdodClcbiAgICAgICAgICAuYXR0cignaWQnLCBpKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYClcbiAgICAgICAgICAuYXBwZW5kKCdyZWN0JylcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbcHJvcHMuZGF0YSwgeFNjYWxlLCBzZWxlY3RlZERhdGVBdHRyaWJ1dGUsIHdpZHRoLCBoZWlnaHRdKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGQzLnNlbGVjdCgnLmRhdGEtaG9sZGVyJylcbiAgICAgIC5zZWxlY3RBbGwoJy5kYXRhJylcbiAgICAgIC5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2V0VG9vbHRpcChudWxsKVxuICAgICAgfSlcbiAgICAgIC5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBpZCA9IChkMy5zZWxlY3QodGhpcykubm9kZSgpIGFzIGFueSkuaWRcbiAgICAgICAgY29uc3QgeCA9IGQzLmV2ZW50LmxheWVyWFxuICAgICAgICBjb25zdCB5ID0gZDMuZXZlbnQubGF5ZXJZXG4gICAgICAgIGNvbnN0IHRvb2x0aXBJbkJvdW5kcyA9IHggPD0gd2lkdGggKiAwLjc1XG4gICAgICAgIHNldFRvb2x0aXAoe1xuICAgICAgICAgIC8vIElmIHRoZSB0b29sdGlwIHdpbGwgb3ZlcmZsb3cgb2ZmIHRoZSB0aW1lbGluZSwgc2V0IHggdG8gbGVmdCBvZiB0aGUgY3Vyc29yIGluc3RlYWQgb2YgcmlnaHQuXG4gICAgICAgICAgeDogdG9vbHRpcEluQm91bmRzID8geCArIDI1IDogeCAtIHdpZHRoICogMC4yNSxcbiAgICAgICAgICB5OiB5IC0gMjAsXG4gICAgICAgICAgbWVzc2FnZTogcHJvcHMucmVuZGVyVG9vbHRpcFxuICAgICAgICAgICAgPyBwcm9wcy5yZW5kZXJUb29sdGlwKGRhdGFCdWNrZXRzW2lkXS5pdGVtcylcbiAgICAgICAgICAgIDogZ2VuZXJhdGVUb29sdGlwTWVzc2FnZShkYXRhQnVja2V0c1tpZF0uaXRlbXMubWFwKChkKSA9PiBkLmlkKSksXG4gICAgICAgIH0pXG4gICAgICB9KVxuICB9LCBbZGF0YUJ1Y2tldHNdKVxuICAvLyBJZiBkcmFnZ2luZyBpcyBmaW5pc2hlZCwgdXBkYXRlIHNlbGVjdGVkIHJlc3VsdHMuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKFxuICAgICAgIWlzRHJhZ2dpbmcgJiZcbiAgICAgIHByb3BzLmRhdGEgJiZcbiAgICAgIHNlbGVjdGVkRGF0ZUF0dHJpYnV0ZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAhcHJvcHMubW9kZVxuICAgICkge1xuICAgICAgaWYgKHNlbGVjdGlvblJhbmdlLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIGNvbnN0IHgxID0geFNjYWxlKHNlbGVjdGlvblJhbmdlWzBdKVxuICAgICAgICBjb25zdCB4MiA9IHhTY2FsZShzZWxlY3Rpb25SYW5nZVsxXSlcbiAgICAgICAgLy8gUHJlZmlsdGVyIHRvIG9ubHkgYnVja2V0cyB3ZSBjYXJlIGFib3V0XG4gICAgICAgIGNvbnN0IGJ1Y2tldHNDb250YWluaW5nUmVsZXZhbnREYXRhID0gZGF0YUJ1Y2tldHMuZmlsdGVyKFxuICAgICAgICAgIChiKSA9PlxuICAgICAgICAgICAgKHgxIDwgYi54MSAmJiBiLngyIDwgeDIpIHx8XG4gICAgICAgICAgICAoYi54MSA8IHgxICYmIHgxIDwgYi54MikgfHxcbiAgICAgICAgICAgIChiLngxIDwgeDIgJiYgeDIgPCBiLngyKVxuICAgICAgICApXG4gICAgICAgIC8vIEdldCB0aGUgZGF0YSBpbnNpZGUgdGhvc2UgYnVja2V0cyB0aGF0IGZhbGxzIHdpdGhpbiB0aGUgc2VsZWN0aW9uXG4gICAgICAgIGNvbnN0IGRhdGFUb1NlbGVjdCA9IF8uZmxhdE1hcChcbiAgICAgICAgICBidWNrZXRzQ29udGFpbmluZ1JlbGV2YW50RGF0YSxcbiAgICAgICAgICAoYikgPT4gYi5pdGVtc1xuICAgICAgICApLmZpbHRlcigoZCkgPT5cbiAgICAgICAgICBkLmF0dHJpYnV0ZXNbc2VsZWN0ZWREYXRlQXR0cmlidXRlIV0uc29tZSgobW9tZW50KSA9PlxuICAgICAgICAgICAgZGF0ZVdpdGhpblJhbmdlKG1vbWVudCwgc2VsZWN0aW9uUmFuZ2UpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgIHByb3BzLm9uU2VsZWN0ICYmIHByb3BzLm9uU2VsZWN0KGRhdGFUb1NlbGVjdClcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtpc0RyYWdnaW5nXSlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAvKipcbiAgICAgKlxuICAgICAqIFNlbGVjdGlvbiBEcmFnIGRvZXMgdHdvIHRoaW5nczpcbiAgICAgKiAxLiBXaGVuIHRoZSB1c2VyIGRyYWdzIGFjcm9zcyB0aGUgdGltZWxpbmUsIGEgcmFuZ2Ugc2VsZWN0aW9uIHdpbGwgYmUgY3JlYXRlZC5cbiAgICAgKiAyLiBJZiB0aGUgZHJhZyBldmVudCBpcyBvbmx5IDUgcGl4ZWxzIG9yIGxlc3MgZnJvbSBzdGFydCB0byBmaW5pc2ggQU5EIGVuZHMgb24gYSByZWN0IG9iamVjdCxcbiAgICAgKiBhc3N1bWUgdGhhdCB0aGUgdXNlciBtZWFudCB0byBjbGljayBpbnN0ZWFkIG9mIGRyYWcsIGFuZCBwcm9wZXJseSB0cmlnZ2VyIGEgY2xpY2sgYWN0aW9uIG9uIHRoZSByZWN0LlxuICAgICAqL1xuICAgIGNvbnN0IGdldFNlbGVjdGlvbkRyYWcgPSAoKSA9PiB7XG4gICAgICBsZXQgY2xpY2tTdGFydDogbnVtYmVyXG4gICAgICByZXR1cm4gKFxuICAgICAgICBkM1xuICAgICAgICAgIC5kcmFnKClcbiAgICAgICAgICAub24oJ3N0YXJ0JywgKCkgPT4ge1xuICAgICAgICAgICAgY2xpY2tTdGFydCA9IGQzLmV2ZW50LnhcbiAgICAgICAgICAgIGNvbnN0IG5ld0xlZnREYXRlID0gbW9tZW50LnR6KFxuICAgICAgICAgICAgICB4U2NhbGUuaW52ZXJ0KGNsaWNrU3RhcnQpLFxuICAgICAgICAgICAgICBwcm9wcy50aW1lem9uZVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaWYgKHByb3BzLm1vZGUgPT09ICdzaW5nbGUnKSB7XG4gICAgICAgICAgICAgIHNldFNlbGVjdGlvblJhbmdlKFtuZXdMZWZ0RGF0ZV0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZXRJc0RyYWdnaW5nKHRydWUpXG4gICAgICAgICAgICAgIGhpZGVFbGVtZW50KGQzLnNlbGVjdChob3ZlckxpbmVSZWYuY3VycmVudCkpXG4gICAgICAgICAgICAgIGhpZGVFbGVtZW50KGQzLnNlbGVjdChob3ZlckxpbmVUZXh0UmVmLmN1cnJlbnQpKVxuICAgICAgICAgICAgICBzZXRTZWxlY3Rpb25SYW5nZShbbmV3TGVmdERhdGVdKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8gU2V0IGlzRHJhZ2dpbmcgdG8gZmFsc2UgdG8gdHJpZ2dlciBhIHNlbGVjdGlvbiB1cGRhdGUsIGFkZGl0aW9uYWxseSBjaGVjayBpZiB1c2VyIG1lYW50IHRvIGNsaWNrLlxuICAgICAgICAgIC5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcm9wcy5tb2RlKSB7XG4gICAgICAgICAgICAgIHNob3dFbGVtZW50KGQzLnNlbGVjdChob3ZlckxpbmVSZWYuY3VycmVudCkpXG4gICAgICAgICAgICAgIHNldElzRHJhZ2dpbmcoZmFsc2UpXG4gICAgICAgICAgICAgIGNvbnN0IGNsaWNrRGlzdGFuY2UgPSBjbGlja1N0YXJ0IC0gZDMuZXZlbnQueFxuICAgICAgICAgICAgICBjb25zdCBzb3VyY2VFdmVudCA9IGQzLmV2ZW50LnNvdXJjZUV2ZW50XG4gICAgICAgICAgICAgIGlmIChNYXRoLmFicyhjbGlja0Rpc3RhbmNlKSA8IDUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlTmFtZSA9IHNvdXJjZUV2ZW50LnNyY0VsZW1lbnQubm9kZU5hbWVcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3Rpb25SYW5nZShbXSlcbiAgICAgICAgICAgICAgICBpZiAobm9kZU5hbWUgPT09ICdyZWN0JyB8fCBub2RlTmFtZSA9PT0gJ2xpbmUnKSB7XG4gICAgICAgICAgICAgICAgICBjb25zdCB4ID0gZDMuZXZlbnQueFxuICAgICAgICAgICAgICAgICAgY29uc3QgYnVja2V0ID0gZGF0YUJ1Y2tldHMuZmluZCgoYikgPT4gYi54MSA8IHggJiYgeCA8PSBiLngyKVxuICAgICAgICAgICAgICAgICAgYnVja2V0ICYmIHByb3BzLm9uU2VsZWN0ICYmIHByb3BzLm9uU2VsZWN0KGJ1Y2tldC5pdGVtcylcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC5vbignZHJhZycsICgpID0+IHtcbiAgICAgICAgICAgIGlmIChwcm9wcy5tb2RlICE9PSAnc2luZ2xlJykge1xuICAgICAgICAgICAgICBjb25zdCBkaWZmID0gZDMuZXZlbnQueCAtIGQzLmV2ZW50LnN1YmplY3QueFxuICAgICAgICAgICAgICBjb25zdCBpbml0aWFsRGF0ZSA9IG1vbWVudC50eihcbiAgICAgICAgICAgICAgICB4U2NhbGUuaW52ZXJ0KGNsaWNrU3RhcnQpLFxuICAgICAgICAgICAgICAgIHByb3BzLnRpbWV6b25lXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgbGV0IGRyYWdDdXJyZW50ID0gY2xpY2tTdGFydCArIGRpZmZcbiAgICAgICAgICAgICAgY29uc3QgZHJhZ0RhdGUgPSBtb21lbnQudHooXG4gICAgICAgICAgICAgICAgeFNjYWxlLmludmVydChkcmFnQ3VycmVudCksXG4gICAgICAgICAgICAgICAgcHJvcHMudGltZXpvbmVcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBpZiAoZGlmZiA+IDApIHtcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3Rpb25SYW5nZShbaW5pdGlhbERhdGUsIGRyYWdEYXRlXSlcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3Rpb25SYW5nZShbZHJhZ0RhdGUsIGluaXRpYWxEYXRlXSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pIGFzIGFueVxuICAgICAgKVxuICAgIH1cbiAgICBkMy5zZWxlY3QoZDNDb250YWluZXJSZWYuY3VycmVudCkuY2FsbChnZXRTZWxlY3Rpb25EcmFnKCkpXG4gIH0sIFtkYXRhQnVja2V0cywgc2VsZWN0aW9uUmFuZ2UsIHhTY2FsZSwgcHJvcHMudGltZXpvbmUsIHByb3BzLmZvcm1hdF0pXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aGUgZHJhZyBiZWhhdmlvciB1c2VkIHdoZW4gc2VsZWN0aW5nIHRoZSBsZWZ0IG9yIHJpZ2h0IHNsaWRlci5cbiAgICAgKlxuICAgICAqIFZhbGlkYXRpb24gZm9yIHNsaWRlcnM6XG4gICAgICogLSBMZWZ0IHNsaWRlciBjYW5ub3QgYmUgd2l0aGluIDEwIHBpeGVscyBvZiB0aGUgcmlnaHQgc2xpZGVyLlxuICAgICAqIC0gUmlnaHQgc2xpZGVyIGNhbm5vdCBiZSB3aXRoaW4gMTAgcGl4ZWxzIG9mIHRoZSBsZWZ0IHNsaWRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBzbGlkZXIgLSBXaGljaCBzbGlkZXIgdGhlIGRyYWcgYmVoYXZpb3Igc2hvdWxkIGFmZmVjdC5cbiAgICAgKi9cbiAgICBjb25zdCBnZXRFZGdlRHJhZyA9IChzbGlkZXI6ICdMRUZUJyB8ICdSSUdIVCcpID0+XG4gICAgICBkM1xuICAgICAgICAuZHJhZygpXG4gICAgICAgIC5vbignc3RhcnQnLCAoKSA9PiB7XG4gICAgICAgICAgaGlkZUVsZW1lbnQoZDMuc2VsZWN0KGhvdmVyTGluZVJlZi5jdXJyZW50KSlcbiAgICAgICAgICBoaWRlRWxlbWVudChkMy5zZWxlY3QoaG92ZXJMaW5lVGV4dFJlZi5jdXJyZW50KSlcbiAgICAgICAgICBzZXRJc0RyYWdnaW5nKHRydWUpXG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZW5kJywgKCkgPT4gc2V0SXNEcmFnZ2luZyhmYWxzZSkpXG4gICAgICAgIC5vbignZHJhZycsICgpID0+IHtcbiAgICAgICAgICBjb25zdCBkcmFnVmFsdWUgPSB4U2NhbGUuaW52ZXJ0KGQzLmV2ZW50LngpXG4gICAgICAgICAgY29uc3QgZGF0ZVdpdGhUaW1lem9uZSA9IG1vbWVudC50eihkcmFnVmFsdWUsIHByb3BzLnRpbWV6b25lKVxuICAgICAgICAgIGNvbnN0IEJVRkZFUiA9IDEwIC8vIEJ1ZmZlciBpbiBwaXhlbHMgdG8ga2VlcCBzbGlkZXJzIGZyb20gb3ZlcmxhcHBpbmcvY3Jvc3NpbmdcbiAgICAgICAgICBpZiAoc2xpZGVyID09PSAnTEVGVCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG1heGltdW1YID0geFNjYWxlKHNlbGVjdGlvblJhbmdlWzFdKSAtIEJVRkZFUlxuICAgICAgICAgICAgaWYgKGQzLmV2ZW50LnggPD0gbWF4aW11bVgpIHtcbiAgICAgICAgICAgICAgc2V0U2VsZWN0aW9uUmFuZ2UoW2RhdGVXaXRoVGltZXpvbmUsIHNlbGVjdGlvblJhbmdlWzFdXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHNsaWRlciA9PT0gJ1JJR0hUJykge1xuICAgICAgICAgICAgY29uc3QgbWluaW11bVggPSB4U2NhbGUoc2VsZWN0aW9uUmFuZ2VbMF0pICsgQlVGRkVSXG4gICAgICAgICAgICBpZiAoZDMuZXZlbnQueCA+PSBtaW5pbXVtWCkge1xuICAgICAgICAgICAgICBzZXRTZWxlY3Rpb25SYW5nZShbc2VsZWN0aW9uUmFuZ2VbMF0sIGRhdGVXaXRoVGltZXpvbmVdKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSkgYXMgYW55XG4gICAgZDMuc2VsZWN0KGxlZnRNYXJrZXJSZWYuY3VycmVudCkuY2FsbChnZXRFZGdlRHJhZygnTEVGVCcpKVxuICAgIGQzLnNlbGVjdChyaWdodE1hcmtlclJlZi5jdXJyZW50KS5jYWxsKGdldEVkZ2VEcmFnKCdSSUdIVCcpKVxuICB9LCBbeFNjYWxlLCBzZWxlY3Rpb25SYW5nZSwgcHJvcHMudGltZXpvbmVdKVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aGUgZHJhZyBiZWhhdmlvciB1c2VkIHdoZW4gc2VsZWN0aW5nIHRoZSBtaWRkbGUgYXJlYSBiZXR3ZWVuIGEgcmFuZ2UuXG4gICAgICpcbiAgICAgKiBOT1RFOiBUaGlzIHdpbGwgbm90IGJlIHVzZWQgaWYgLmJydXNoQmFyIGNsYXNzIGhhcyAncG9pbnRlci1ldmVudHM6IG5vbmUnIHNldCwgYXMgdGhlIGV2ZW50cyB3aWxsIG5ldmVyIGJlIGhpdC5cbiAgICAgKi9cbiAgICBjb25zdCBnZXRCcnVzaERyYWcgPSAoKSA9PlxuICAgICAgZDNcbiAgICAgICAgLmRyYWcoKVxuICAgICAgICAub24oJ3N0YXJ0JywgKCkgPT4ge1xuICAgICAgICAgIHNldElzRHJhZ2dpbmcodHJ1ZSlcbiAgICAgICAgICBoaWRlRWxlbWVudChkMy5zZWxlY3QoaG92ZXJMaW5lUmVmLmN1cnJlbnQpKVxuICAgICAgICAgIGhpZGVFbGVtZW50KGQzLnNlbGVjdChob3ZlckxpbmVUZXh0UmVmLmN1cnJlbnQpKVxuICAgICAgICB9KVxuICAgICAgICAub24oJ2VuZCcsICgpID0+IHNldElzRHJhZ2dpbmcoZmFsc2UpKVxuICAgICAgICAub24oJ2RyYWcnLCAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBkMy5ldmVudC54IC0gZDMuZXZlbnQuc3ViamVjdC54XG4gICAgICAgICAgY29uc3QgY3VycmVudExlZnQgPSB4U2NhbGUoc2VsZWN0aW9uUmFuZ2VbMF0pXG4gICAgICAgICAgY29uc3QgY3VycmVudFJpZ2h0ID0geFNjYWxlKHNlbGVjdGlvblJhbmdlWzFdKVxuICAgICAgICAgIGNvbnN0IG5ld0xlZnQgPSBjdXJyZW50TGVmdCArIHZhbHVlXG4gICAgICAgICAgY29uc3QgbmV3UmlnaHQgPSBjdXJyZW50UmlnaHQgKyB2YWx1ZVxuICAgICAgICAgIGNvbnN0IG5ld0xlZnREYXRlID0gbW9tZW50LnR6KHhTY2FsZS5pbnZlcnQobmV3TGVmdCksIHByb3BzLnRpbWV6b25lKVxuICAgICAgICAgIGNvbnN0IG5ld1JpZ2h0RGF0ZSA9IG1vbWVudC50eihcbiAgICAgICAgICAgIHhTY2FsZS5pbnZlcnQobmV3UmlnaHQpLFxuICAgICAgICAgICAgcHJvcHMudGltZXpvbmVcbiAgICAgICAgICApXG4gICAgICAgICAgc2V0U2VsZWN0aW9uUmFuZ2UoW25ld0xlZnREYXRlLCBuZXdSaWdodERhdGVdKVxuICAgICAgICB9KSBhcyBhbnlcbiAgICBkMy5zZWxlY3QoYnJ1c2hCYXJSZWYuY3VycmVudCkuY2FsbChnZXRCcnVzaERyYWcoKSlcbiAgfSwgW3hTY2FsZSwgc2VsZWN0aW9uUmFuZ2UsIHByb3BzLnRpbWV6b25lXSlcbiAgLy8gV2hlbiB0aGUgc2VsZWN0aW9uIHJhbmdlIGlzIGNoYW5nZWQgb3IgdGhlIHNjYWxlIGNoYW5nZXMgdXBkYXRlIHRoZSBsZWZ0LCByaWdodCwgYW5kIGJydXNoIG1hcmtlcnNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoXG4gICAgICBsZWZ0TWFya2VyUmVmLmN1cnJlbnQgJiZcbiAgICAgIHJpZ2h0TWFya2VyUmVmLmN1cnJlbnQgJiZcbiAgICAgIGJydXNoQmFyUmVmLmN1cnJlbnRcbiAgICApIHtcbiAgICAgIGNvbnN0IGxlZnRNYXJrZXIgPSBkMy5zZWxlY3QobGVmdE1hcmtlclJlZi5jdXJyZW50KVxuICAgICAgY29uc3QgcmlnaHRNYXJrZXIgPSBkMy5zZWxlY3QocmlnaHRNYXJrZXJSZWYuY3VycmVudClcbiAgICAgIGNvbnN0IGJydXNoQmFyID0gZDMuc2VsZWN0KGJydXNoQmFyUmVmLmN1cnJlbnQpXG4gICAgICBpZiAocHJvcHMubW9kZSA9PT0gJ3NpbmdsZScgJiYgc2VsZWN0aW9uUmFuZ2UubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGNvbnN0IGxlZnRNYXJrZXIgPSBkMy5zZWxlY3QobGVmdE1hcmtlclJlZi5jdXJyZW50KVxuICAgICAgICBjb25zdCBsZWZ0VmFsdWUgPSBzZWxlY3Rpb25SYW5nZVswXVxuICAgICAgICBsZWZ0TWFya2VyXG4gICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHt4U2NhbGUobGVmdFZhbHVlKX0sICR7bWFya2VySGVpZ2h0fSlgKVxuICAgICAgICAgIC5hdHRyKCdzdHlsZScsICdkaXNwbGF5OiBibG9jaycpXG4gICAgICB9IGVsc2UgaWYgKHByb3BzLm1vZGUgIT09ICdzaW5nbGUnICYmIHNlbGVjdGlvblJhbmdlLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIGNvbnN0IFtsZWZ0VmFsdWUsIHJpZ2h0VmFsdWVdID0gc2VsZWN0aW9uUmFuZ2VcbiAgICAgICAgbGVmdE1hcmtlclxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKCR7eFNjYWxlKGxlZnRWYWx1ZSl9LCAke21hcmtlckhlaWdodH0pYClcbiAgICAgICAgICAuYXR0cignc3R5bGUnLCAnZGlzcGxheTogYmxvY2snKVxuICAgICAgICByaWdodE1hcmtlclxuICAgICAgICAgIC5hdHRyKFxuICAgICAgICAgICAgJ3RyYW5zZm9ybScsXG4gICAgICAgICAgICBgdHJhbnNsYXRlKCR7eFNjYWxlKHJpZ2h0VmFsdWUpfSwgJHttYXJrZXJIZWlnaHR9KWBcbiAgICAgICAgICApXG4gICAgICAgICAgLmF0dHIoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrJylcbiAgICAgICAgYnJ1c2hCYXJcbiAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke3hTY2FsZShsZWZ0VmFsdWUpfSwke21hcmtlckhlaWdodH0pYClcbiAgICAgICAgICAuYXR0cignd2lkdGgnLCB4U2NhbGUocmlnaHRWYWx1ZSkgLSB4U2NhbGUobGVmdFZhbHVlKSlcbiAgICAgICAgICAuYXR0cignaGVpZ2h0JywgJzUwJylcbiAgICAgICAgICAuYXR0cignc3R5bGUnLCAnZGlzcGxheTogYmxvY2snKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlkZUVsZW1lbnQobGVmdE1hcmtlciBhcyBhbnkpXG4gICAgICAgIGhpZGVFbGVtZW50KHJpZ2h0TWFya2VyIGFzIGFueSlcbiAgICAgICAgaGlkZUVsZW1lbnQoYnJ1c2hCYXIgYXMgYW55KVxuICAgICAgfVxuICAgIH1cbiAgfSwgW3hTY2FsZSwgc2VsZWN0aW9uUmFuZ2UsIHByb3BzLm1vZGUsIHByb3BzLmhlaWdodCwgcHJvcHMudGltZXpvbmVdKVxuICBjb25zdCByZW5kZXJDb3B5YWJsZURhdGUgPSAoZGF0ZTogTW9tZW50KSA9PiB7XG4gICAgY29uc3QgZm9ybWF0dGVkRGF0ZSA9IGNvbnZlcnRUb0Rpc3BsYXlhYmxlKFxuICAgICAgZGF0ZSxcbiAgICAgIHByb3BzLnRpbWV6b25lLFxuICAgICAgcHJvcHMuZm9ybWF0XG4gICAgKVxuICAgIHJldHVybiAoXG4gICAgICA8PlxuICAgICAgICA8YnIgLz5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlblRleHRBcmVhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKVxuICAgICAgICAgICAgaGlkZGVuVGV4dEFyZWEuaW5uZXJUZXh0ID0gZm9ybWF0dGVkRGF0ZVxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChoaWRkZW5UZXh0QXJlYSlcbiAgICAgICAgICAgIGhpZGRlblRleHRBcmVhLnNlbGVjdCgpXG4gICAgICAgICAgICBkb2N1bWVudC5leGVjQ29tbWFuZCgnY29weScpXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGhpZGRlblRleHRBcmVhKVxuICAgICAgICAgICAgcHJvcHMub25Db3B5ICYmIHByb3BzLm9uQ29weShmb3JtYXR0ZWREYXRlKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7Zm9ybWF0dGVkRGF0ZX1cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8Lz5cbiAgICApXG4gIH1cbiAgY29uc3QgcmVuZGVyQ29udGV4dCA9ICgpID0+IHtcbiAgICBjb25zdCByZW5kZXJTdGFydEFuZEVuZCA9ICgpID0+IChcbiAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgPFRpbWVUZXh0PlxuICAgICAgICAgIDxiPlN0YXJ0PC9iPlxuICAgICAgICAgIHtzZWxlY3Rpb25SYW5nZVswXSAmJiByZW5kZXJDb3B5YWJsZURhdGUoc2VsZWN0aW9uUmFuZ2VbMF0pfVxuICAgICAgICA8L1RpbWVUZXh0PlxuICAgICAgICA8VGltZVRleHQ+XG4gICAgICAgICAgPGI+RW5kPC9iPlxuICAgICAgICAgIHtzZWxlY3Rpb25SYW5nZVsxXSAmJiByZW5kZXJDb3B5YWJsZURhdGUoc2VsZWN0aW9uUmFuZ2VbMV0pfVxuICAgICAgICA8L1RpbWVUZXh0PlxuICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICApXG4gICAgLy8gU2luZ2xlIFN0YXRlcyAtIEVtcHR5LCBTaW5nbGUgVGltZVxuICAgIGlmIChwcm9wcy5tb2RlID09PSAnc2luZ2xlJykge1xuICAgICAgaWYgKCFzZWxlY3Rpb25SYW5nZVswXSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxNZXNzYWdlPkNsaWNrIHRvIHNlbGVjdCBhIHRpbWUuIFpvb20gd2l0aCB0aGUgc2Nyb2xsIHdoZWVsLjwvTWVzc2FnZT5cbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRpbWVUZXh0PlxuICAgICAgICAgIDxiPlRpbWU8L2I+XG4gICAgICAgICAge3NlbGVjdGlvblJhbmdlWzBdICYmIHJlbmRlckNvcHlhYmxlRGF0ZShzZWxlY3Rpb25SYW5nZVswXSl9XG4gICAgICAgIDwvVGltZVRleHQ+XG4gICAgICApXG4gICAgICAvLyBSYW5nZSBTdGF0ZXMgLSBFbXB0eSwgUmFuZ2Ugb2YgVGltZXNcbiAgICB9IGVsc2UgaWYgKHByb3BzLm1vZGUgPT09ICdyYW5nZScpIHtcbiAgICAgIGlmICghc2VsZWN0aW9uUmFuZ2VbMF0pIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8TWVzc2FnZT5EcmFnIHRvIHNlbGVjdCBhIHJhbmdlLiBab29tIHdpdGggdGhlIHNjcm9sbCB3aGVlbC48L01lc3NhZ2U+XG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiByZW5kZXJTdGFydEFuZEVuZCgpXG4gICAgICAvLyBTZWxlY3Rpb24gU3RhdGVzIC0gRW1wdHksIFN0YXJ0IFRpbWUsIFN0YXJ0ICsgRW5kIFRpbWVzXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghc2VsZWN0aW9uUmFuZ2VbMF0pIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8TWVzc2FnZT5cbiAgICAgICAgICAgIENsaWNrIHRvIHNlbGVjdCBhIGNsdXN0ZXIgb2YgcmVzdWx0cy4gWm9vbSB3aXRoIHRoZSBzY3JvbGwgd2hlZWwuXG4gICAgICAgICAgPC9NZXNzYWdlPlxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gcmVuZGVyU3RhcnRBbmRFbmQoKVxuICAgIH1cbiAgfVxuICBjb25zdCBsb29rdXBBbGlhcyA9IChhdHRyaWJ1dGU6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHsgZGF0ZUF0dHJpYnV0ZUFsaWFzZXMgfSA9IHByb3BzXG4gICAgaWYgKGRhdGVBdHRyaWJ1dGVBbGlhc2VzICYmIGRhdGVBdHRyaWJ1dGVBbGlhc2VzW2F0dHJpYnV0ZV0pIHtcbiAgICAgIHJldHVybiBkYXRlQXR0cmlidXRlQWxpYXNlc1thdHRyaWJ1dGVdXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhdHRyaWJ1dGVcbiAgICB9XG4gIH1cbiAgcmV0dXJuIChcbiAgICA8Um9vdCByZWY9e3Jvb3RSZWZ9IHN0eWxlPXt7IGhlaWdodDogJzEwMCUnIH19PlxuICAgICAgPGRpdj5cbiAgICAgICAgPERhdGVBdHRyaWJ1dGVTZWxlY3RcbiAgICAgICAgICB2aXNpYmxlPXtwcm9wcy5kYXRhICYmIHByb3BzLmRhdGEhLmxlbmd0aCA+IDB9XG4gICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICBvbkNoYW5nZT17KGU6IGFueSkgPT4gc2V0U2VsZWN0ZWREYXRlQXR0cmlidXRlKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICB2YWx1ZT17c2VsZWN0ZWREYXRlQXR0cmlidXRlfVxuICAgICAgICA+XG4gICAgICAgICAge3Bvc3NpYmxlRGF0ZUF0dHJpYnV0ZXMubWFwKChkYXRlQXR0cmlidXRlOiBzdHJpbmcpID0+IChcbiAgICAgICAgICAgIDxNZW51SXRlbSB2YWx1ZT17ZGF0ZUF0dHJpYnV0ZX0+XG4gICAgICAgICAgICAgIHtsb29rdXBBbGlhcyhkYXRlQXR0cmlidXRlKX1cbiAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvRGF0ZUF0dHJpYnV0ZVNlbGVjdD5cbiAgICAgIDwvZGl2PlxuICAgICAge3Rvb2x0aXAgJiYgKFxuICAgICAgICA8VG9vbHRpcCBtZXNzYWdlPXt0b29sdGlwLm1lc3NhZ2V9IHg9e3Rvb2x0aXAueH0geT17dG9vbHRpcC55fSAvPlxuICAgICAgKX1cbiAgICAgIDxzdmcgcmVmPXtkM0NvbnRhaW5lclJlZn0+XG4gICAgICAgIDxnIGNsYXNzTmFtZT1cImRhdGEtaG9sZGVyXCIgLz5cblxuICAgICAgICA8cmVjdCByZWY9e2JydXNoQmFyUmVmfSBjbGFzc05hbWU9XCJicnVzaEJhclwiIC8+XG5cbiAgICAgICAgPGcgcmVmPXtob3ZlckxpbmVSZWZ9IHN0eWxlPXt7IGRpc3BsYXk6ICdub25lJyB9fT5cbiAgICAgICAgICA8SG92ZXJMaW5lIHgxPVwiMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiNTBcIiAvPlxuICAgICAgICA8L2c+XG5cbiAgICAgICAgPEhvdmVyTGluZVRleHRcbiAgICAgICAgICB4PVwiMFwiXG4gICAgICAgICAgeT1cIjBcIlxuICAgICAgICAgIHN0eWxlPXt7IGRpc3BsYXk6ICdub25lJyB9fVxuICAgICAgICAgIHJlZj17aG92ZXJMaW5lVGV4dFJlZn1cbiAgICAgICAgLz5cblxuICAgICAgICA8TWFya2VySG92ZXIgcmVmPXtsZWZ0TWFya2VyUmVmfT5cbiAgICAgICAgICA8TWFya2VyTGluZSB4MT1cIjBcIiB5MT1cIjBcIiB4Mj1cIjBcIiB5Mj1cIjUwXCIgLz5cbiAgICAgICAgICA8TWFya2VyTGluZSB4MT1cIjBcIiB5MT1cIjBcIiB4Mj1cIjBcIiB5Mj1cIjUwXCIgaGlkZGVuPXt0cnVlfSAvPlxuICAgICAgICA8L01hcmtlckhvdmVyPlxuICAgICAgICA8TWFya2VySG92ZXIgcmVmPXtyaWdodE1hcmtlclJlZn0+XG4gICAgICAgICAgPE1hcmtlckxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIwXCIgeTI9XCI1MFwiIC8+XG4gICAgICAgICAgPE1hcmtlckxpbmUgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIwXCIgeTI9XCI1MFwiIGhpZGRlbj17dHJ1ZX0gLz5cbiAgICAgICAgPC9NYXJrZXJIb3Zlcj5cblxuICAgICAgICA8ZyBjbGFzc05hbWU9XCJheGlzIGF4aXMtLXhcIiBpZD1cImF4aXNcIj5cbiAgICAgICAgICA8cmVjdFxuICAgICAgICAgICAgd2lkdGg9e3dpZHRofVxuICAgICAgICAgICAgaGVpZ2h0PXtBWElTX0hFSUdIVCArIEFYSVNfTUFSR0lOfVxuICAgICAgICAgICAgZmlsbE9wYWNpdHk9XCIwXCJcbiAgICAgICAgICAgIGZpbGw9XCJibGFja1wiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9nPlxuICAgICAgPC9zdmc+XG4gICAgICA8Q29udGV4dFJvdz5cbiAgICAgICAge3JlbmRlckNvbnRleHQoKX1cbiAgICAgICAgPEJ1dHRvbkFyZWE+XG4gICAgICAgICAgPFRpbWVsaW5lQnV0dG9uIHZhcmlhbnQ9XCJjb250YWluZWRcIiBvbkNsaWNrPXsoKSA9PiB6b29tT3V0KCl9IGljb24+XG4gICAgICAgICAgICAtXG4gICAgICAgICAgPC9UaW1lbGluZUJ1dHRvbj5cbiAgICAgICAgICA8VGltZWxpbmVCdXR0b24gdmFyaWFudD1cImNvbnRhaW5lZFwiIG9uQ2xpY2s9eygpID0+IHpvb21JbigpfSBpY29uPlxuICAgICAgICAgICAgK1xuICAgICAgICAgIDwvVGltZWxpbmVCdXR0b24+XG4gICAgICAgICAge3Byb3BzLm9uRG9uZSAmJiBwcm9wcy5tb2RlICYmIChcbiAgICAgICAgICAgIDxUaW1lbGluZUJ1dHRvblxuICAgICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHByb3BzLm9uRG9uZSAmJiBwcm9wcy5vbkRvbmUoc2VsZWN0aW9uUmFuZ2UpXG4gICAgICAgICAgICAgICAgc2V0U2VsZWN0aW9uUmFuZ2UoW10pXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIERvbmVcbiAgICAgICAgICAgIDwvVGltZWxpbmVCdXR0b24+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9CdXR0b25BcmVhPlxuICAgICAgPC9Db250ZXh0Um93PlxuICAgIDwvUm9vdD5cbiAgKVxufVxuZXhwb3J0IGRlZmF1bHQgVGltZWxpbmVcbiJdfQ==