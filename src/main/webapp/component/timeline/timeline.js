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
//# sourceMappingURL=timeline.js.map