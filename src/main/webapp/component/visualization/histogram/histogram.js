import { __assign, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks';
import { useBackbone } from '../../selection-checkbox/useBackbone.hook';
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import _cloneDeep from 'lodash.clonedeep';
import wreqr from '../../../js/wreqr';
import $ from 'jquery';
import _ from 'underscore';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'plot... Remove this comment to see the full error message
import Plotly from 'plotly.js/dist/plotly';
import moment from 'moment';
import extension from '../../../extension-points';
import { useTheme } from '@mui/material/styles';
import { getCustomHoverLabels, getCustomHoverTemplates, getCustomHover, } from './add-on-helpers';
import { StartupDataStore } from '../../../js/model/Startup/startup';
var zeroWidthSpace = '\u200B';
var plotlyDateFormat = 'YYYY-MM-DD HH:mm:ss.SS';
function getPlotlyDate(date) {
    return moment(date).format(plotlyDateFormat);
}
function calculateAvailableAttributes(results) {
    var availableAttributes = [];
    results.forEach(function (result) {
        availableAttributes = _.union(availableAttributes, Object.keys(result.plain.metacard.properties));
    });
    return availableAttributes
        .filter(function (attribute) {
        return !StartupDataStore.MetacardDefinitions.isHiddenAttribute(attribute);
    })
        .map(function (attribute) { return ({
        label: StartupDataStore.MetacardDefinitions.getAlias(attribute),
        value: attribute,
    }); });
}
function calculateAttributeArray(_a) {
    var results = _a.results, attribute = _a.attribute;
    var values = [];
    results.forEach(function (result) {
        if (StartupDataStore.MetacardDefinitions.getAttributeMap()[attribute]
            .multivalued) {
            var resultValues = result.plain.metacard.properties[attribute];
            if (resultValues && resultValues.forEach) {
                resultValues.forEach(function (value) {
                    addValueForAttributeToArray({ valueArray: values, attribute: attribute, value: value });
                });
            }
            else {
                addValueForAttributeToArray({
                    valueArray: values,
                    attribute: attribute,
                    value: resultValues,
                });
            }
        }
        else {
            addValueForAttributeToArray({
                valueArray: values,
                attribute: attribute,
                value: result.plain.metacard.properties[attribute],
            });
        }
    });
    return values;
}
function findMatchesForAttributeValues(results, attribute, values) {
    return results.filter(function (result) {
        if (StartupDataStore.MetacardDefinitions.getAttributeMap()[attribute]
            .multivalued) {
            var resultValues = result.plain.metacard.properties[attribute];
            if (resultValues && resultValues.forEach) {
                for (var i = 0; i < resultValues.length; i++) {
                    if (checkIfValueIsValid(values, attribute, resultValues[i])) {
                        return true;
                    }
                }
                return false;
            }
            else {
                return checkIfValueIsValid(values, attribute, resultValues);
            }
        }
        else {
            return checkIfValueIsValid(values, attribute, result.plain.metacard.properties[attribute]);
        }
    });
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function checkIfValueIsValid(values, attribute, value) {
    if (value !== undefined) {
        switch (StartupDataStore.MetacardDefinitions.getAttributeMap()[attribute].type) {
            case 'DATE':
                var plotlyDate = getPlotlyDate(value);
                return plotlyDate >= values[0] && plotlyDate <= values[1];
            case 'BOOLEAN':
            case 'STRING':
            case 'GEOMETRY':
                return values.indexOf(value.toString() + zeroWidthSpace) >= 0;
            default:
                return value >= values[0] && value <= values[1];
        }
    }
}
function addValueForAttributeToArray(_a) {
    var valueArray = _a.valueArray, attribute = _a.attribute, value = _a.value;
    if (value !== undefined) {
        switch (StartupDataStore.MetacardDefinitions.getAttributeMap()[attribute].type) {
            case 'DATE':
                valueArray.push(getPlotlyDate(value));
                break;
            case 'BOOLEAN':
            case 'STRING':
            case 'GEOMETRY':
                valueArray.push(value.toString() + zeroWidthSpace);
                break;
            default:
                valueArray.push(parseFloat(value));
                break;
        }
    }
}
function getIndexClicked(data) {
    return Math.max.apply(undefined, data.points.map(function (point) { return point.pointNumber; }));
}
function getValueFromClick(data, categories) {
    switch (data.points[0].xaxis.type) {
        case 'category':
            return [data.points[0].x];
        case 'date':
            var currentDate_1 = moment(data.points[0].x).format(plotlyDateFormat);
            return _.find(categories, function (category) {
                return currentDate_1 >= category[0] && currentDate_1 <= category[1];
            });
        default:
            return _.find(categories, function (category) {
                return (data.points[0].x >= category[0] && data.points[0].x <= category[1]);
            });
    }
}
function getLayout(fontColor, plot) {
    var baseLayout = {
        autosize: true,
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            family: '"Open Sans Light","Helvetica Neue",Helvetica,Arial,sans-serif',
            size: 16,
            color: 'inherit',
            fill: 'inherit',
        },
        margin: {
            t: 10,
            l: 50,
            r: 115,
            b: 140,
            pad: 0,
            autoexpand: true,
        },
        barmode: 'overlay',
        xaxis: {
            fixedrange: true,
            color: fontColor,
        },
        yaxis: {
            fixedrange: true,
            color: fontColor,
        },
        showlegend: true,
        legend: {
            font: { color: fontColor },
        },
    };
    if (plot) {
        baseLayout.xaxis.autorange = false;
        baseLayout.xaxis.range = plot._fullLayout.xaxis.range;
        baseLayout.yaxis.range = plot._fullLayout.yaxis.range;
        baseLayout.yaxis.autorange = false;
    }
    return baseLayout;
}
var getAutocompleteState = function (_a) {
    var lazyResults = _a.lazyResults, attributeToBin = _a.attributeToBin;
    return {
        choices: calculateAvailableAttributes(Object.values(lazyResults.results)),
        value: attributeToBin,
    };
};
export var Histogram = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var listenTo = useBackbone().listenTo;
    var theme = useTheme();
    var isDarkTheme = theme.palette.mode === 'dark';
    var _b = __read(React.useState(false), 2), noMatchingData = _b[0], setNoMatchingData = _b[1];
    var plotlyRef = React.useRef();
    var plotlyReadyForUpdatesRef = React.useRef(false);
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var selectedResults = useSelectedResults({ lazyResults: lazyResults });
    var _c = __read(React.useState(''), 2), attributeToBin = _c[0], setAttributeToBin = _c[1];
    var _d = __read(React.useState(getAutocompleteState({ lazyResults: lazyResults, attributeToBin: attributeToBin })), 2), autocompleteState = _d[0], setAutocompleteState = _d[1];
    var results = Object.values(lazyResults.results);
    React.useEffect(function () {
        setNoMatchingData(false);
    }, [lazyResults.results, attributeToBin]);
    React.useEffect(function () {
        setAutocompleteState(getAutocompleteState({ lazyResults: lazyResults, attributeToBin: attributeToBin }));
    }, [lazyResults.results]);
    React.useEffect(function () {
        showHistogram();
    }, [lazyResults.results, attributeToBin, theme]);
    React.useEffect(function () {
        if (plotlyReadyForUpdatesRef.current) {
            // avoid updating the histogram if it's not ready yet
            updateHistogram();
        }
    }, [selectedResults]);
    var defaultFontColor = isDarkTheme ? 'white' : 'black';
    var defaultHoverLabel = {
        bgcolor: isDarkTheme ? 'black' : 'white',
        font: {
            color: defaultFontColor,
        },
    };
    var getCustomHoverArray = function (categories, results) {
        var customArray = [];
        categories.forEach(function (category) {
            var matchedResults = findMatchesForAttributeValues(results, attributeToBin, category.constructor === Array ? category : [category]);
            if ((matchedResults && matchedResults.length > 0) ||
                customArray.length > 0) {
                customArray.push(getCustomHover(matchedResults, defaultHoverLabel));
            }
        });
        return customArray.length > 0 ? customArray : undefined;
    };
    var determineInitialData = function () {
        return [
            {
                x: calculateAttributeArray({
                    results: results,
                    attribute: attributeToBin,
                }),
                opacity: 1,
                type: 'histogram',
                name: 'Hits',
                marker: {
                    color: 'rgba(120, 120, 120, .05)',
                    line: {
                        color: 'rgba(120,120,120,.2)',
                        width: '2',
                    },
                },
                hovertemplate: '%{y} Hits<extra></extra>',
                hoverlabel: defaultHoverLabel,
            },
        ];
    };
    var determineData = function (plot) {
        var activeResults = results;
        var xbins = _cloneDeep(plot._fullData[0].xbins);
        var categories = retrieveCategoriesFromPlotly();
        var customHoverArray = undefined;
        var selectedCustomHoverArray = undefined;
        if (extension.customHistogramHover) {
            customHoverArray = getCustomHoverArray(categories, results);
            selectedCustomHoverArray = getCustomHoverArray(categories, Object.values(selectedResults));
        }
        return [
            {
                x: calculateAttributeArray({
                    results: activeResults,
                    attribute: attributeToBin,
                }),
                opacity: 1,
                type: 'histogram',
                name: 'Hits',
                marker: {
                    color: 'rgba(120, 120, 120, .05)',
                    line: {
                        color: 'rgba(120,120,120,.2)',
                        width: '2',
                    },
                },
                hoverlabel: customHoverArray
                    ? getCustomHoverLabels(customHoverArray)
                    : defaultHoverLabel,
                hovertemplate: customHoverArray
                    ? getCustomHoverTemplates('Hits', customHoverArray)
                    : '%{y} Hits<extra></extra>',
                autobinx: false,
                xbins: xbins,
            },
            {
                x: calculateAttributeArray({
                    results: Object.values(selectedResults),
                    attribute: attributeToBin,
                }),
                opacity: 1,
                type: 'histogram',
                name: 'Selected',
                marker: {
                    color: 'rgba(120, 120, 120, .2)',
                    line: {
                        color: 'rgba(120,120,120,.5)',
                        width: '2',
                    },
                },
                hoverlabel: selectedCustomHoverArray
                    ? getCustomHoverLabels(selectedCustomHoverArray)
                    : defaultHoverLabel,
                hovertemplate: selectedCustomHoverArray
                    ? getCustomHoverTemplates('Selected', selectedCustomHoverArray)
                    : '%{y} Selected<extra></extra>',
                autobinx: false,
                xbins: xbins,
            },
        ];
    };
    var handleResize = function () {
        if (plotlyRef.current) {
            var histogramElement = plotlyRef.current;
            $(histogramElement).find('rect.drag').off('mousedown');
            if (histogramElement._context) {
                Plotly.Plots.resize(histogramElement);
            }
            $(histogramElement)
                .find('rect.drag')
                .on('mousedown', function (event) {
                shiftKey.current = event.shiftKey;
                metaKey.current = event.metaKey;
                ctrlKey.current = event.ctrlKey;
            });
        }
    };
    React.useEffect(function () {
        var id = (Math.random() * 100).toFixed(0).toString();
        listenTo(wreqr.vent, 'resize', handleResize);
        $(window).on("resize.".concat(id), handleResize);
        return function () {
            $(window).off("resize.".concat(id));
        };
    }, []);
    var showHistogram = function () {
        plotlyReadyForUpdatesRef.current = false;
        if (plotlyRef.current) {
            if (results.length > 0 && attributeToBin) {
                var histogramElement_1 = plotlyRef.current;
                var initialData = determineInitialData();
                if (initialData[0].x.length === 0) {
                    setNoMatchingData(true);
                }
                else {
                    Plotly.newPlot(histogramElement_1, initialData, getLayout(defaultFontColor), {
                        displayModeBar: false,
                    }).then(function (plot) {
                        Plotly.newPlot(histogramElement_1, determineData(plot), getLayout(defaultFontColor, plot), {
                            displayModeBar: false,
                        });
                        handleResize();
                        listenToHistogram();
                        plotlyReadyForUpdatesRef.current = true;
                    });
                }
            }
            else {
                plotlyRef.current.innerHTML = '';
            }
        }
    };
    var updateHistogram = function () {
        if (plotlyRef.current) {
            var histogramElement = plotlyRef.current;
            if (histogramElement !== null &&
                histogramElement.children.length !== 0 &&
                attributeToBin &&
                results.length > 0) {
                try {
                    Plotly.deleteTraces(histogramElement, 1);
                }
                catch (err) {
                    console.error('Unable to delete trace', err);
                }
                Plotly.addTraces(histogramElement, determineData(histogramElement)[1]);
                handleResize();
            }
            else {
                histogramElement.innerHTML = '';
            }
        }
    };
    var selectBetween = function (firstIndex, lastIndex) {
        for (var i = firstIndex; i <= lastIndex; i++) {
            if (pointsSelected.current.indexOf(i) === -1) {
                pointsSelected.current.push(i);
            }
        }
        var attributeToCheck = attributeToBin;
        var categories = retrieveCategoriesFromPlotly();
        var validCategories = categories.slice(firstIndex, lastIndex);
        var activeSearchResults = results;
        var validResults = validCategories.reduce(function (results, category) {
            results = results.concat(findMatchesForAttributeValues(activeSearchResults, attributeToCheck, category.constructor === Array ? category : [category]));
            return results;
        }, []);
        validResults.forEach(function (result) {
            result.setSelected(true);
        });
    };
    // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
    var retrieveCategoriesFromPlotlyForDates = function () {
        if (plotlyRef.current) {
            var histogramElement = plotlyRef.current;
            var categories = [];
            var xbins = histogramElement._fullData[0].xbins;
            var min = xbins.start;
            var max = parseInt(moment(xbins.end).format('x'));
            var start = parseInt(moment(min).format('x'));
            var inMonths = xbins.size.constructor === String;
            var binSize = inMonths ? parseInt(xbins.size.substring(1)) : xbins.size;
            while (start < max) {
                var startDate = moment(start).format(plotlyDateFormat);
                var endDate = inMonths
                    ? moment(start).add(binSize, 'months').format(plotlyDateFormat)
                    : moment(start).add(binSize, 'ms').format(plotlyDateFormat);
                categories.push([startDate, endDate]);
                start = parseInt(inMonths
                    ? moment(start).add(binSize, 'months').format('x')
                    : moment(start).add(binSize, 'ms').format('x'));
            }
            return categories;
        }
    };
    // This is an internal variable for Plotly, so it might break if we update Plotly in the future.
    // Regardless, there was no other way to reliably get the categories.
    var retrieveCategoriesFromPlotly = function () {
        if (plotlyRef.current) {
            var histogramElement = plotlyRef.current;
            var xaxis = histogramElement._fullLayout.xaxis;
            switch (xaxis.type) {
                case 'category':
                    return xaxis._categories;
                case 'date':
                    return retrieveCategoriesFromPlotlyForDates();
                default:
                    var xbins = histogramElement._fullData[0].xbins;
                    var min = xbins.start;
                    var max = xbins.end;
                    var binSize = xbins.size;
                    var categories = [];
                    var start = min;
                    while (start < max) {
                        categories.push([start, start + binSize]);
                        start += binSize;
                    }
                    return categories;
            }
        }
    };
    var handleControlClick = function (data, alreadySelected) {
        var attributeToCheck = attributeToBin;
        var categories = retrieveCategoriesFromPlotly();
        var matchedResults = findMatchesForAttributeValues(results, attributeToCheck, getValueFromClick(data, categories));
        if (alreadySelected) {
            matchedResults.forEach(function (result) {
                result.setSelected(false);
            });
            pointsSelected.current.splice(pointsSelected.current.indexOf(getIndexClicked(data)), 1);
        }
        else {
            matchedResults.forEach(function (result) {
                result.setSelected(true);
            });
            pointsSelected.current.push(getIndexClicked(data));
        }
    };
    var handleShiftClick = function (data) {
        var indexClicked = getIndexClicked(data);
        var firstIndex = pointsSelected.current.length === 0
            ? -1
            : pointsSelected.current.reduce(function (currentMin, point) { return Math.min(currentMin, point); }, pointsSelected.current[0]);
        var lastIndex = pointsSelected.current.length === 0
            ? -1
            : pointsSelected.current.reduce(function (currentMin, point) { return Math.max(currentMin, point); }, pointsSelected.current[0]);
        if (firstIndex === -1 && lastIndex === -1) {
            lazyResults.deselect();
            handleControlClick(data, false);
        }
        else if (indexClicked <= firstIndex) {
            selectBetween(indexClicked, firstIndex);
        }
        else if (indexClicked >= lastIndex) {
            selectBetween(lastIndex, indexClicked + 1);
        }
        else {
            selectBetween(firstIndex, indexClicked + 1);
        }
    };
    var plotlyClickHandler = function (data) {
        var indexClicked = getIndexClicked(data);
        var alreadySelected = pointsSelected.current.indexOf(indexClicked) >= 0;
        if (shiftKey.current) {
            handleShiftClick(data);
        }
        else if (ctrlKey.current || metaKey.current) {
            handleControlClick(data, alreadySelected);
        }
        else {
            lazyResults.deselect();
            resetPointSelection();
            handleControlClick(data, alreadySelected);
        }
        resetKeyTracking();
    };
    var listenToHistogram = function () {
        if (plotlyRef.current) {
            var histogramElement = plotlyRef.current;
            histogramElement._ev.addListener('plotly_click', plotlyClickHandler);
        }
    };
    var shiftKey = React.useRef(false);
    var metaKey = React.useRef(false);
    var ctrlKey = React.useRef(false);
    var pointsSelected = React.useRef([]);
    var resetKeyTracking = function () {
        shiftKey.current = false;
        metaKey.current = false;
        ctrlKey.current = false;
    };
    var resetPointSelection = function () {
        pointsSelected.current = [];
    };
    if (Object.keys(lazyResults.results).length === 0) {
        return React.createElement("div", { style: { padding: '20px' } }, "No results found");
    }
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "p-2" },
            React.createElement(Autocomplete, { size: "small", options: autocompleteState.choices, onChange: function (_e, newValue) {
                    setAttributeToBin(newValue.value);
                }, isOptionEqualToValue: function (option) { return option.value === attributeToBin; }, getOptionLabel: function (option) {
                    return option.label;
                }, disableClearable: true, value: autocompleteState.choices.find(function (choice) { return choice.value === attributeToBin; }), renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { label: "Group by", variant: "outlined" }))); } })),
        React.createElement("div", { className: "plotly-histogram", ref: plotlyRef, style: {
                height: 'calc(100% - 135px)',
                width: '100%',
                display: noMatchingData ? 'none' : 'block',
            } }),
        noMatchingData ? (React.createElement("div", { style: { padding: '20px' } }, "No data in this result set has that attribute")) : null));
};
export default hot(module)(Histogram);
//# sourceMappingURL=histogram.js.map