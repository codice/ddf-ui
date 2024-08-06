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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9ncmFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL2hpc3RvZ3JhbS9oaXN0b2dyYW0udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFHdEYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJDQUEyQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFBO0FBQzVFLE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFBO0FBQ3pDLE9BQU8sS0FBSyxNQUFNLG1CQUFtQixDQUFBO0FBQ3JDLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLHVCQUF1QixDQUFBO0FBQzFDLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUMzQixPQUFPLFNBQVMsTUFBTSwyQkFBMkIsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDL0MsT0FBTyxFQUVMLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsY0FBYyxHQUNmLE1BQU0sa0JBQWtCLENBQUE7QUFDekIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUNBQW1DLENBQUE7QUFDcEUsSUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFBO0FBQy9CLElBQU0sZ0JBQWdCLEdBQUcsd0JBQXdCLENBQUE7QUFDakQsU0FBUyxhQUFhLENBQUMsSUFBWTtJQUNqQyxPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtBQUM5QyxDQUFDO0FBQ0QsU0FBUyw0QkFBNEIsQ0FBQyxPQUEwQjtJQUM5RCxJQUFJLG1CQUFtQixHQUFHLEVBQWMsQ0FBQTtJQUN4QyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTTtRQUNyQixtQkFBbUIsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUMzQixtQkFBbUIsRUFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FDOUMsQ0FBQTtJQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxtQkFBbUI7U0FDdkIsTUFBTSxDQUNMLFVBQUMsU0FBUztRQUNSLE9BQUEsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUM7SUFBbEUsQ0FBa0UsQ0FDckU7U0FDQSxHQUFHLENBQUMsVUFBQyxTQUFTLElBQUssT0FBQSxDQUFDO1FBQ25CLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBQy9ELEtBQUssRUFBRSxTQUFTO0tBQ2pCLENBQUMsRUFIa0IsQ0FHbEIsQ0FBQyxDQUFBO0FBQ1AsQ0FBQztBQUNELFNBQVMsdUJBQXVCLENBQUMsRUFNaEM7UUFMQyxPQUFPLGFBQUEsRUFDUCxTQUFTLGVBQUE7SUFLVCxJQUFNLE1BQU0sR0FBRyxFQUFjLENBQUE7SUFDN0IsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07UUFDckIsSUFDRSxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxTQUFTLENBQUM7YUFDOUQsV0FBVyxFQUNkO1lBQ0EsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ2hFLElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUU7Z0JBQ3hDLFlBQVksQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFVO29CQUM5QiwyQkFBMkIsQ0FBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsU0FBUyxXQUFBLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxDQUFBO2dCQUN2RSxDQUFDLENBQUMsQ0FBQTthQUNIO2lCQUFNO2dCQUNMLDJCQUEyQixDQUFDO29CQUMxQixVQUFVLEVBQUUsTUFBTTtvQkFDbEIsU0FBUyxXQUFBO29CQUNULEtBQUssRUFBRSxZQUFZO2lCQUNwQixDQUFDLENBQUE7YUFDSDtTQUNGO2FBQU07WUFDTCwyQkFBMkIsQ0FBQztnQkFDMUIsVUFBVSxFQUFFLE1BQU07Z0JBQ2xCLFNBQVMsV0FBQTtnQkFDVCxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQzthQUNuRCxDQUFDLENBQUE7U0FDSDtJQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxNQUFNLENBQUE7QUFDZixDQUFDO0FBQ0QsU0FBUyw2QkFBNkIsQ0FDcEMsT0FBMEIsRUFDMUIsU0FBaUIsRUFDakIsTUFBYTtJQUViLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFDLE1BQU07UUFDM0IsSUFDRSxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxTQUFTLENBQUM7YUFDOUQsV0FBVyxFQUNkO1lBQ0EsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ2hFLElBQUksWUFBWSxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUU7Z0JBQ3hDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUM1QyxJQUFJLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7d0JBQzNELE9BQU8sSUFBSSxDQUFBO3FCQUNaO2lCQUNGO2dCQUNELE9BQU8sS0FBSyxDQUFBO2FBQ2I7aUJBQU07Z0JBQ0wsT0FBTyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFBO2FBQzVEO1NBQ0Y7YUFBTTtZQUNMLE9BQU8sbUJBQW1CLENBQ3hCLE1BQU0sRUFDTixTQUFTLEVBQ1QsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUM1QyxDQUFBO1NBQ0Y7SUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFDRCw4RUFBOEU7QUFDOUUsU0FBUyxtQkFBbUIsQ0FBQyxNQUFhLEVBQUUsU0FBaUIsRUFBRSxLQUFVO0lBQ3ZFLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtRQUN2QixRQUNFLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFDdEU7WUFDQSxLQUFLLE1BQU07Z0JBQ1QsSUFBTSxVQUFVLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUN2QyxPQUFPLFVBQVUsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUMzRCxLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxVQUFVO2dCQUNiLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQy9EO2dCQUNFLE9BQU8sS0FBSyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ2xEO0tBQ0Y7QUFDSCxDQUFDO0FBQ0QsU0FBUywyQkFBMkIsQ0FBQyxFQVFwQztRQVBDLFVBQVUsZ0JBQUEsRUFDVixTQUFTLGVBQUEsRUFDVCxLQUFLLFdBQUE7SUFNTCxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7UUFDdkIsUUFDRSxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLEVBQ3RFO1lBQ0EsS0FBSyxNQUFNO2dCQUNULFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7Z0JBQ3JDLE1BQUs7WUFDUCxLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssUUFBUSxDQUFDO1lBQ2QsS0FBSyxVQUFVO2dCQUNiLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLGNBQWMsQ0FBQyxDQUFBO2dCQUNsRCxNQUFLO1lBQ1A7Z0JBQ0UsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtnQkFDbEMsTUFBSztTQUNSO0tBQ0Y7QUFDSCxDQUFDO0FBQ0QsU0FBUyxlQUFlLENBQUMsSUFBUztJQUNoQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUNuQixTQUFTLEVBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFVLElBQUssT0FBQSxLQUFLLENBQUMsV0FBVyxFQUFqQixDQUFpQixDQUFDLENBQ3pDLENBQUE7QUFDYixDQUFDO0FBQ0QsU0FBUyxpQkFBaUIsQ0FBQyxJQUFTLEVBQUUsVUFBZTtJQUNuRCxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtRQUNqQyxLQUFLLFVBQVU7WUFDYixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUMzQixLQUFLLE1BQU07WUFDVCxJQUFNLGFBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtZQUNyRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQUMsUUFBYTtnQkFDdEMsT0FBTyxhQUFXLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQVcsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDakUsQ0FBQyxDQUFDLENBQUE7UUFDSjtZQUNFLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsVUFBQyxRQUFhO2dCQUN0QyxPQUFPLENBQ0wsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FDbkUsQ0FBQTtZQUNILENBQUMsQ0FBQyxDQUFBO0tBQ0w7QUFDSCxDQUFDO0FBQ0QsU0FBUyxTQUFTLENBQUMsU0FBaUIsRUFBRSxJQUFVO0lBQzlDLElBQU0sVUFBVSxHQUFHO1FBQ2pCLFFBQVEsRUFBRSxJQUFJO1FBQ2QsYUFBYSxFQUFFLGVBQWU7UUFDOUIsWUFBWSxFQUFFLGVBQWU7UUFDN0IsSUFBSSxFQUFFO1lBQ0osTUFBTSxFQUFFLCtEQUErRDtZQUN2RSxJQUFJLEVBQUUsRUFBRTtZQUNSLEtBQUssRUFBRSxTQUFTO1lBQ2hCLElBQUksRUFBRSxTQUFTO1NBQ2hCO1FBQ0QsTUFBTSxFQUFFO1lBQ04sQ0FBQyxFQUFFLEVBQUU7WUFDTCxDQUFDLEVBQUUsRUFBRTtZQUNMLENBQUMsRUFBRSxHQUFHO1lBQ04sQ0FBQyxFQUFFLEdBQUc7WUFDTixHQUFHLEVBQUUsQ0FBQztZQUNOLFVBQVUsRUFBRSxJQUFJO1NBQ2pCO1FBQ0QsT0FBTyxFQUFFLFNBQVM7UUFDbEIsS0FBSyxFQUFFO1lBQ0wsVUFBVSxFQUFFLElBQUk7WUFDaEIsS0FBSyxFQUFFLFNBQVM7U0FDakI7UUFDRCxLQUFLLEVBQUU7WUFDTCxVQUFVLEVBQUUsSUFBSTtZQUNoQixLQUFLLEVBQUUsU0FBUztTQUNqQjtRQUNELFVBQVUsRUFBRSxJQUFJO1FBQ2hCLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUU7U0FDM0I7S0FDSyxDQUFBO0lBQ1IsSUFBSSxJQUFJLEVBQUU7UUFDUixVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUE7UUFDbEMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFBO1FBQ3JELFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQTtRQUNyRCxVQUFVLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUE7S0FDbkM7SUFDRCxPQUFPLFVBQVUsQ0FBQTtBQUNuQixDQUFDO0FBSUQsSUFBTSxvQkFBb0IsR0FBRyxVQUFDLEVBTTdCO1FBTEMsV0FBVyxpQkFBQSxFQUNYLGNBQWMsb0JBQUE7SUFLZCxPQUFPO1FBQ0wsT0FBTyxFQUFFLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3pFLEtBQUssRUFBRSxjQUFjO0tBQ3RCLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxNQUFNLENBQUMsSUFBTSxTQUFTLEdBQUcsVUFBQyxFQUE2QjtRQUEzQixrQkFBa0Isd0JBQUE7SUFDcEMsSUFBQSxRQUFRLEdBQUssV0FBVyxFQUFFLFNBQWxCLENBQWtCO0lBQ2xDLElBQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFBO0lBQ3hCLElBQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQTtJQUMzQyxJQUFBLEtBQUEsT0FBc0MsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUExRCxjQUFjLFFBQUEsRUFBRSxpQkFBaUIsUUFBeUIsQ0FBQTtJQUNqRSxJQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFrQixDQUFBO0lBQ2hELElBQU0sd0JBQXdCLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNwRCxJQUFNLFdBQVcsR0FBRyxvQ0FBb0MsQ0FBQztRQUN2RCxrQkFBa0Isb0JBQUE7S0FDbkIsQ0FBQyxDQUFBO0lBQ0YsSUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUMsRUFBRSxXQUFXLGFBQUEsRUFBRSxDQUFDLENBQUE7SUFDckQsSUFBQSxLQUFBLE9BQXNDLEtBQUssQ0FBQyxRQUFRLENBQUMsRUFBWSxDQUFDLElBQUEsRUFBakUsY0FBYyxRQUFBLEVBQUUsaUJBQWlCLFFBQWdDLENBQUE7SUFDbEUsSUFBQSxLQUFBLE9BQTRDLEtBQUssQ0FBQyxRQUFRLENBQzlELG9CQUFvQixDQUFDLEVBQUUsV0FBVyxhQUFBLEVBQUUsY0FBYyxnQkFBQSxFQUFFLENBQUMsQ0FDdEQsSUFBQSxFQUZNLGlCQUFpQixRQUFBLEVBQUUsb0JBQW9CLFFBRTdDLENBQUE7SUFDRCxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNsRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDMUIsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFBO0lBQ3pDLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxvQkFBb0IsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLFdBQVcsYUFBQSxFQUFFLGNBQWMsZ0JBQUEsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUM3RSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQTtJQUN6QixLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsYUFBYSxFQUFFLENBQUE7SUFDakIsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNoRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSx3QkFBd0IsQ0FBQyxPQUFPLEVBQUU7WUFDcEMscURBQXFEO1lBQ3JELGVBQWUsRUFBRSxDQUFBO1NBQ2xCO0lBQ0gsQ0FBQyxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQTtJQUVyQixJQUFNLGdCQUFnQixHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUE7SUFDeEQsSUFBTSxpQkFBaUIsR0FBRztRQUN4QixPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU87UUFDeEMsSUFBSSxFQUFFO1lBQ0osS0FBSyxFQUFFLGdCQUFnQjtTQUN4QjtLQUNGLENBQUE7SUFFRCxJQUFNLG1CQUFtQixHQUFHLFVBQzFCLFVBQWlCLEVBQ2pCLE9BQTBCO1FBRTFCLElBQU0sV0FBVyxHQUFrQixFQUFFLENBQUE7UUFDckMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVE7WUFDMUIsSUFBTSxjQUFjLEdBQUcsNkJBQTZCLENBQ2xELE9BQU8sRUFDUCxjQUFjLEVBQ2QsUUFBUSxDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FDdkQsQ0FBQTtZQUVELElBQ0UsQ0FBQyxjQUFjLElBQUksY0FBYyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7Z0JBQzdDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUN0QjtnQkFDQSxXQUFXLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFBO2FBQ3BFO1FBQ0gsQ0FBQyxDQUFDLENBQUE7UUFDRixPQUFPLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtJQUN6RCxDQUFDLENBQUE7SUFFRCxJQUFNLG9CQUFvQixHQUFHO1FBQzNCLE9BQU87WUFDTDtnQkFDRSxDQUFDLEVBQUUsdUJBQXVCLENBQUM7b0JBQ3pCLE9BQU8sU0FBQTtvQkFDUCxTQUFTLEVBQUUsY0FBYztpQkFDMUIsQ0FBQztnQkFDRixPQUFPLEVBQUUsQ0FBQztnQkFDVixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLE1BQU07Z0JBQ1osTUFBTSxFQUFFO29CQUNOLEtBQUssRUFBRSwwQkFBMEI7b0JBQ2pDLElBQUksRUFBRTt3QkFDSixLQUFLLEVBQUUsc0JBQXNCO3dCQUM3QixLQUFLLEVBQUUsR0FBRztxQkFDWDtpQkFDRjtnQkFDRCxhQUFhLEVBQUUsMEJBQTBCO2dCQUN6QyxVQUFVLEVBQUUsaUJBQWlCO2FBQzlCO1NBQ0YsQ0FBQTtJQUNILENBQUMsQ0FBQTtJQUNELElBQU0sYUFBYSxHQUFHLFVBQUMsSUFBUztRQUM5QixJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUE7UUFDN0IsSUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7UUFFakQsSUFBTSxVQUFVLEdBQVUsNEJBQTRCLEVBQUUsQ0FBQTtRQUV4RCxJQUFJLGdCQUFnQixHQUFRLFNBQVMsQ0FBQTtRQUNyQyxJQUFJLHdCQUF3QixHQUFRLFNBQVMsQ0FBQTtRQUU3QyxJQUFJLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRTtZQUNsQyxnQkFBZ0IsR0FBRyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFFM0Qsd0JBQXdCLEdBQUcsbUJBQW1CLENBQzVDLFVBQVUsRUFDVixNQUFNLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUMvQixDQUFBO1NBQ0Y7UUFFRCxPQUFPO1lBQ0w7Z0JBQ0UsQ0FBQyxFQUFFLHVCQUF1QixDQUFDO29CQUN6QixPQUFPLEVBQUUsYUFBYTtvQkFDdEIsU0FBUyxFQUFFLGNBQWM7aUJBQzFCLENBQUM7Z0JBQ0YsT0FBTyxFQUFFLENBQUM7Z0JBQ1YsSUFBSSxFQUFFLFdBQVc7Z0JBQ2pCLElBQUksRUFBRSxNQUFNO2dCQUNaLE1BQU0sRUFBRTtvQkFDTixLQUFLLEVBQUUsMEJBQTBCO29CQUNqQyxJQUFJLEVBQUU7d0JBQ0osS0FBSyxFQUFFLHNCQUFzQjt3QkFDN0IsS0FBSyxFQUFFLEdBQUc7cUJBQ1g7aUJBQ0Y7Z0JBQ0QsVUFBVSxFQUFFLGdCQUFnQjtvQkFDMUIsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDO29CQUN4QyxDQUFDLENBQUMsaUJBQWlCO2dCQUNyQixhQUFhLEVBQUUsZ0JBQWdCO29CQUM3QixDQUFDLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDO29CQUNuRCxDQUFDLENBQUMsMEJBQTBCO2dCQUM5QixRQUFRLEVBQUUsS0FBSztnQkFDZixLQUFLLE9BQUE7YUFDTjtZQUNEO2dCQUNFLENBQUMsRUFBRSx1QkFBdUIsQ0FBQztvQkFDekIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDO29CQUN2QyxTQUFTLEVBQUUsY0FBYztpQkFDMUIsQ0FBQztnQkFDRixPQUFPLEVBQUUsQ0FBQztnQkFDVixJQUFJLEVBQUUsV0FBVztnQkFDakIsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLE1BQU0sRUFBRTtvQkFDTixLQUFLLEVBQUUseUJBQXlCO29CQUNoQyxJQUFJLEVBQUU7d0JBQ0osS0FBSyxFQUFFLHNCQUFzQjt3QkFDN0IsS0FBSyxFQUFFLEdBQUc7cUJBQ1g7aUJBQ0Y7Z0JBQ0QsVUFBVSxFQUFFLHdCQUF3QjtvQkFDbEMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLHdCQUF3QixDQUFDO29CQUNoRCxDQUFDLENBQUMsaUJBQWlCO2dCQUNyQixhQUFhLEVBQUUsd0JBQXdCO29CQUNyQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsVUFBVSxFQUFFLHdCQUF3QixDQUFDO29CQUMvRCxDQUFDLENBQUMsOEJBQThCO2dCQUNsQyxRQUFRLEVBQUUsS0FBSztnQkFDZixLQUFLLE9BQUE7YUFDTjtTQUNGLENBQUE7SUFDSCxDQUFDLENBQUE7SUFDRCxJQUFNLFlBQVksR0FBRztRQUNuQixJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUU7WUFDckIsSUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFBO1lBQzFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDdEQsSUFBSyxnQkFBd0IsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3RDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUE7YUFDdEM7WUFDRCxDQUFDLENBQUMsZ0JBQWdCLENBQUM7aUJBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUM7aUJBQ2pCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBQyxLQUFVO2dCQUMxQixRQUFRLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUE7Z0JBQ2pDLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQTtnQkFDL0IsT0FBTyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFBO1lBQ2pDLENBQUMsQ0FBQyxDQUFBO1NBQ0w7SUFDSCxDQUFDLENBQUE7SUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQ3RELFFBQVEsQ0FBRSxLQUFhLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQTtRQUNyRCxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFVLEVBQUUsQ0FBRSxFQUFFLFlBQVksQ0FBQyxDQUFBO1FBQzFDLE9BQU87WUFDTCxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLGlCQUFVLEVBQUUsQ0FBRSxDQUFDLENBQUE7UUFDL0IsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sSUFBTSxhQUFhLEdBQUc7UUFDcEIsd0JBQXdCLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQTtRQUN4QyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUU7WUFDckIsSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxjQUFjLEVBQUU7Z0JBQ3hDLElBQU0sa0JBQWdCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQTtnQkFDMUMsSUFBTSxXQUFXLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQTtnQkFDMUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQ2pDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFBO2lCQUN4QjtxQkFBTTtvQkFDTCxNQUFNLENBQUMsT0FBTyxDQUNaLGtCQUFnQixFQUNoQixXQUFXLEVBQ1gsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEVBQzNCO3dCQUNFLGNBQWMsRUFBRSxLQUFLO3FCQUN0QixDQUNGLENBQUMsSUFBSSxDQUFDLFVBQUMsSUFBUzt3QkFDZixNQUFNLENBQUMsT0FBTyxDQUNaLGtCQUFnQixFQUNoQixhQUFhLENBQUMsSUFBSSxDQUFDLEVBQ25CLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsRUFDakM7NEJBQ0UsY0FBYyxFQUFFLEtBQUs7eUJBQ3RCLENBQ0YsQ0FBQTt3QkFDRCxZQUFZLEVBQUUsQ0FBQTt3QkFDZCxpQkFBaUIsRUFBRSxDQUFBO3dCQUNuQix3QkFBd0IsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFBO29CQUN6QyxDQUFDLENBQUMsQ0FBQTtpQkFDSDthQUNGO2lCQUFNO2dCQUNMLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQTthQUNqQztTQUNGO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsSUFBTSxlQUFlLEdBQUc7UUFDdEIsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFO1lBQ3JCLElBQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQTtZQUMxQyxJQUNFLGdCQUFnQixLQUFLLElBQUk7Z0JBQ3pCLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQztnQkFDdEMsY0FBYztnQkFDZCxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDbEI7Z0JBQ0EsSUFBSTtvQkFDRixNQUFNLENBQUMsWUFBWSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFBO2lCQUN6QztnQkFBQyxPQUFPLEdBQUcsRUFBRTtvQkFDWixPQUFPLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLEdBQUcsQ0FBQyxDQUFBO2lCQUM3QztnQkFDRCxNQUFNLENBQUMsU0FBUyxDQUFDLGdCQUFnQixFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ3RFLFlBQVksRUFBRSxDQUFBO2FBQ2Y7aUJBQU07Z0JBQ0wsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQTthQUNoQztTQUNGO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsSUFBTSxhQUFhLEdBQUcsVUFBQyxVQUFrQixFQUFFLFNBQWlCO1FBQzFELEtBQUssSUFBSSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDNUMsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDNUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7YUFDL0I7U0FDRjtRQUNELElBQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFBO1FBQ3ZDLElBQU0sVUFBVSxHQUFHLDRCQUE0QixFQUFFLENBQUE7UUFDakQsSUFBTSxlQUFlLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUE7UUFDL0QsSUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUE7UUFDbkMsSUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLE1BQU0sQ0FDekMsVUFBQyxPQUFZLEVBQUUsUUFBYTtZQUMxQixPQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FDdEIsNkJBQTZCLENBQzNCLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsUUFBUSxDQUFDLFdBQVcsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FDdkQsQ0FDRixDQUFBO1lBQ0QsT0FBTyxPQUFPLENBQUE7UUFDaEIsQ0FBQyxFQUNELEVBQXVCLENBQ0gsQ0FBQTtRQUN0QixZQUFZLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTTtZQUMxQixNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzFCLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFBO0lBQ0QsOEVBQThFO0lBQzlFLElBQU0sb0NBQW9DLEdBQUc7UUFDM0MsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFO1lBQ3JCLElBQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQTtZQUMxQyxJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUE7WUFDckIsSUFBTSxLQUFLLEdBQUksZ0JBQXdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtZQUMxRCxJQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFBO1lBQ3ZCLElBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1lBQ25ELElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDN0MsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEtBQUssTUFBTSxDQUFBO1lBQ2xELElBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUE7WUFDekUsT0FBTyxLQUFLLEdBQUcsR0FBRyxFQUFFO2dCQUNsQixJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUE7Z0JBQ3hELElBQU0sT0FBTyxHQUFHLFFBQVE7b0JBQ3RCLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7b0JBQy9ELENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtnQkFDN0QsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBO2dCQUNyQyxLQUFLLEdBQUcsUUFBUSxDQUNkLFFBQVE7b0JBQ04sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7b0JBQ2xELENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ2pELENBQUE7YUFDRjtZQUNELE9BQU8sVUFBVSxDQUFBO1NBQ2xCO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsZ0dBQWdHO0lBQ2hHLHFFQUFxRTtJQUNyRSxJQUFNLDRCQUE0QixHQUFHO1FBQ25DLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtZQUNyQixJQUFNLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUE7WUFDMUMsSUFBTSxLQUFLLEdBQUksZ0JBQXdCLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQTtZQUN6RCxRQUFRLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ2xCLEtBQUssVUFBVTtvQkFDYixPQUFPLEtBQUssQ0FBQyxXQUFXLENBQUE7Z0JBQzFCLEtBQUssTUFBTTtvQkFDVCxPQUFPLG9DQUFvQyxFQUFFLENBQUE7Z0JBQy9DO29CQUNFLElBQU0sS0FBSyxHQUFJLGdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7b0JBQzFELElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUE7b0JBQ3ZCLElBQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUE7b0JBQ3JCLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUE7b0JBQzFCLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQTtvQkFDckIsSUFBSSxLQUFLLEdBQUcsR0FBRyxDQUFBO29CQUNmLE9BQU8sS0FBSyxHQUFHLEdBQUcsRUFBRTt3QkFDbEIsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQTt3QkFDekMsS0FBSyxJQUFJLE9BQU8sQ0FBQTtxQkFDakI7b0JBQ0QsT0FBTyxVQUFVLENBQUE7YUFDcEI7U0FDRjtJQUNILENBQUMsQ0FBQTtJQUNELElBQU0sa0JBQWtCLEdBQUcsVUFBQyxJQUFTLEVBQUUsZUFBd0I7UUFDN0QsSUFBTSxnQkFBZ0IsR0FBRyxjQUFjLENBQUE7UUFDdkMsSUFBTSxVQUFVLEdBQUcsNEJBQTRCLEVBQUUsQ0FBQTtRQUNqRCxJQUFNLGNBQWMsR0FBRyw2QkFBNkIsQ0FDbEQsT0FBTyxFQUNQLGdCQUFnQixFQUNoQixpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQ3BDLENBQUE7UUFDRCxJQUFJLGVBQWUsRUFBRTtZQUNuQixjQUFjLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTTtnQkFDNUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUMzQixDQUFDLENBQUMsQ0FBQTtZQUNGLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUMzQixjQUFjLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDckQsQ0FBQyxDQUNGLENBQUE7U0FDRjthQUFNO1lBQ0wsY0FBYyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07Z0JBQzVCLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDMUIsQ0FBQyxDQUFDLENBQUE7WUFDRixjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtTQUNuRDtJQUNILENBQUMsQ0FBQTtJQUNELElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxJQUFTO1FBQ2pDLElBQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUMxQyxJQUFNLFVBQVUsR0FDZCxjQUFjLENBQUMsT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDSixDQUFDLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQzNCLFVBQUMsVUFBVSxFQUFFLEtBQUssSUFBSyxPQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxFQUEzQixDQUEyQixFQUNsRCxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUMxQixDQUFBO1FBQ1AsSUFBTSxTQUFTLEdBQ2IsY0FBYyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUNqQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUMzQixVQUFDLFVBQVUsRUFBRSxLQUFLLElBQUssT0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsRUFBM0IsQ0FBMkIsRUFDbEQsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FDMUIsQ0FBQTtRQUNQLElBQUksVUFBVSxLQUFLLENBQUMsQ0FBQyxJQUFJLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUN6QyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUE7WUFDdEIsa0JBQWtCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO1NBQ2hDO2FBQU0sSUFBSSxZQUFZLElBQUksVUFBVSxFQUFFO1lBQ3JDLGFBQWEsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUE7U0FDeEM7YUFBTSxJQUFJLFlBQVksSUFBSSxTQUFTLEVBQUU7WUFDcEMsYUFBYSxDQUFDLFNBQVMsRUFBRSxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUE7U0FDM0M7YUFBTTtZQUNMLGFBQWEsQ0FBQyxVQUFVLEVBQUUsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFBO1NBQzVDO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsSUFBTSxrQkFBa0IsR0FBRyxVQUFDLElBQVM7UUFDbkMsSUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzFDLElBQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN6RSxJQUFJLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDcEIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDdkI7YUFBTSxJQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtZQUM3QyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7U0FDMUM7YUFBTTtZQUNMLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQTtZQUN0QixtQkFBbUIsRUFBRSxDQUFBO1lBQ3JCLGtCQUFrQixDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FBQTtTQUMxQztRQUNELGdCQUFnQixFQUFFLENBQUE7SUFDcEIsQ0FBQyxDQUFBO0lBQ0QsSUFBTSxpQkFBaUIsR0FBRztRQUN4QixJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUU7WUFDckIsSUFBTSxnQkFBZ0IsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUN6QztZQUFDLGdCQUF3QixDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQ3hDLGNBQWMsRUFDZCxrQkFBa0IsQ0FDbkIsQ0FBQTtTQUNGO0lBQ0gsQ0FBQyxDQUFBO0lBQ0QsSUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNwQyxJQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ25DLElBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDbkMsSUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFjLENBQUMsQ0FBQTtJQUNuRCxJQUFNLGdCQUFnQixHQUFHO1FBQ3ZCLFFBQVEsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO1FBQ3hCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO1FBQ3ZCLE9BQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFBO0lBQ3pCLENBQUMsQ0FBQTtJQUNELElBQU0sbUJBQW1CLEdBQUc7UUFDMUIsY0FBYyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUE7SUFDN0IsQ0FBQyxDQUFBO0lBQ0QsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQ2pELE9BQU8sNkJBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSx1QkFBd0IsQ0FBQTtLQUMvRDtJQUNELE9BQU8sQ0FDTDtRQUNFLDZCQUFLLFNBQVMsRUFBQyxLQUFLO1lBQ2xCLG9CQUFDLFlBQVksSUFDWCxJQUFJLEVBQUMsT0FBTyxFQUNaLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxPQUFPLEVBQ2xDLFFBQVEsRUFBRSxVQUFDLEVBQU8sRUFBRSxRQUFRO29CQUMxQixpQkFBaUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7Z0JBQ25DLENBQUMsRUFDRCxvQkFBb0IsRUFBRSxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxLQUFLLEtBQUssY0FBYyxFQUEvQixDQUErQixFQUNqRSxjQUFjLEVBQUUsVUFBQyxNQUFNO29CQUNyQixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUE7Z0JBQ3JCLENBQUMsRUFDRCxnQkFBZ0IsUUFDaEIsS0FBSyxFQUFFLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ25DLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssS0FBSyxjQUFjLEVBQS9CLENBQStCLENBQzVDLEVBQ0QsV0FBVyxFQUFFLFVBQUMsTUFBTSxJQUFLLE9BQUEsQ0FDdkIsb0JBQUMsU0FBUyxlQUFLLE1BQU0sSUFBRSxLQUFLLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBQyxVQUFVLElBQUcsQ0FDOUQsRUFGd0IsQ0FFeEIsR0FDRCxDQUNFO1FBQ04sNkJBQ0UsU0FBUyxFQUFDLGtCQUFrQixFQUM1QixHQUFHLEVBQUUsU0FBZ0IsRUFDckIsS0FBSyxFQUFFO2dCQUNMLE1BQU0sRUFBRSxvQkFBb0I7Z0JBQzVCLEtBQUssRUFBRSxNQUFNO2dCQUNiLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTzthQUMzQyxHQUNEO1FBQ0QsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUNoQiw2QkFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLG9EQUV6QixDQUNQLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDUCxDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCB7IHVzZUxhenlSZXN1bHRzRnJvbVNlbGVjdGlvbkludGVyZmFjZSB9IGZyb20gJy4uLy4uL3NlbGVjdGlvbi1pbnRlcmZhY2UvaG9va3MnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHRzIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdHMnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IHVzZVNlbGVjdGVkUmVzdWx0cyB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9ob29rcydcbmltcG9ydCBBdXRvY29tcGxldGUgZnJvbSAnQG11aS9tYXRlcmlhbC9BdXRvY29tcGxldGUnXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IF9jbG9uZURlZXAgZnJvbSAnbG9kYXNoLmNsb25lZGVlcCdcbmltcG9ydCB3cmVxciBmcm9tICcuLi8uLi8uLi9qcy93cmVxcidcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdwbG90Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBQbG90bHkgZnJvbSAncGxvdGx5LmpzL2Rpc3QvcGxvdGx5J1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnXG5pbXBvcnQgZXh0ZW5zaW9uIGZyb20gJy4uLy4uLy4uL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgeyB1c2VUaGVtZSB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJ1xuaW1wb3J0IHtcbiAgQ3VzdG9tSG92ZXIsXG4gIGdldEN1c3RvbUhvdmVyTGFiZWxzLFxuICBnZXRDdXN0b21Ib3ZlclRlbXBsYXRlcyxcbiAgZ2V0Q3VzdG9tSG92ZXIsXG59IGZyb20gJy4vYWRkLW9uLWhlbHBlcnMnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuY29uc3QgemVyb1dpZHRoU3BhY2UgPSAnXFx1MjAwQidcbmNvbnN0IHBsb3RseURhdGVGb3JtYXQgPSAnWVlZWS1NTS1ERCBISDptbTpzcy5TUydcbmZ1bmN0aW9uIGdldFBsb3RseURhdGUoZGF0ZTogc3RyaW5nKSB7XG4gIHJldHVybiBtb21lbnQoZGF0ZSkuZm9ybWF0KHBsb3RseURhdGVGb3JtYXQpXG59XG5mdW5jdGlvbiBjYWxjdWxhdGVBdmFpbGFibGVBdHRyaWJ1dGVzKHJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdKSB7XG4gIGxldCBhdmFpbGFibGVBdHRyaWJ1dGVzID0gW10gYXMgc3RyaW5nW11cbiAgcmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICBhdmFpbGFibGVBdHRyaWJ1dGVzID0gXy51bmlvbihcbiAgICAgIGF2YWlsYWJsZUF0dHJpYnV0ZXMsXG4gICAgICBPYmplY3Qua2V5cyhyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgICApXG4gIH0pXG4gIHJldHVybiBhdmFpbGFibGVBdHRyaWJ1dGVzXG4gICAgLmZpbHRlcihcbiAgICAgIChhdHRyaWJ1dGUpID0+XG4gICAgICAgICFTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuaXNIaWRkZW5BdHRyaWJ1dGUoYXR0cmlidXRlKVxuICAgIClcbiAgICAubWFwKChhdHRyaWJ1dGUpID0+ICh7XG4gICAgICBsYWJlbDogU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEFsaWFzKGF0dHJpYnV0ZSksXG4gICAgICB2YWx1ZTogYXR0cmlidXRlLFxuICAgIH0pKVxufVxuZnVuY3Rpb24gY2FsY3VsYXRlQXR0cmlidXRlQXJyYXkoe1xuICByZXN1bHRzLFxuICBhdHRyaWJ1dGUsXG59OiB7XG4gIHJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdXG4gIGF0dHJpYnV0ZTogc3RyaW5nXG59KSB7XG4gIGNvbnN0IHZhbHVlcyA9IFtdIGFzIHN0cmluZ1tdXG4gIHJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgaWYgKFxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2F0dHJpYnV0ZV1cbiAgICAgICAgLm11bHRpdmFsdWVkXG4gICAgKSB7XG4gICAgICBjb25zdCByZXN1bHRWYWx1ZXMgPSByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyaWJ1dGVdXG4gICAgICBpZiAocmVzdWx0VmFsdWVzICYmIHJlc3VsdFZhbHVlcy5mb3JFYWNoKSB7XG4gICAgICAgIHJlc3VsdFZhbHVlcy5mb3JFYWNoKCh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgYWRkVmFsdWVGb3JBdHRyaWJ1dGVUb0FycmF5KHsgdmFsdWVBcnJheTogdmFsdWVzLCBhdHRyaWJ1dGUsIHZhbHVlIH0pXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZGRWYWx1ZUZvckF0dHJpYnV0ZVRvQXJyYXkoe1xuICAgICAgICAgIHZhbHVlQXJyYXk6IHZhbHVlcyxcbiAgICAgICAgICBhdHRyaWJ1dGUsXG4gICAgICAgICAgdmFsdWU6IHJlc3VsdFZhbHVlcyxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYWRkVmFsdWVGb3JBdHRyaWJ1dGVUb0FycmF5KHtcbiAgICAgICAgdmFsdWVBcnJheTogdmFsdWVzLFxuICAgICAgICBhdHRyaWJ1dGUsXG4gICAgICAgIHZhbHVlOiByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyaWJ1dGVdLFxuICAgICAgfSlcbiAgICB9XG4gIH0pXG4gIHJldHVybiB2YWx1ZXNcbn1cbmZ1bmN0aW9uIGZpbmRNYXRjaGVzRm9yQXR0cmlidXRlVmFsdWVzKFxuICByZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXSxcbiAgYXR0cmlidXRlOiBzdHJpbmcsXG4gIHZhbHVlczogYW55W11cbikge1xuICByZXR1cm4gcmVzdWx0cy5maWx0ZXIoKHJlc3VsdCkgPT4ge1xuICAgIGlmIChcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVthdHRyaWJ1dGVdXG4gICAgICAgIC5tdWx0aXZhbHVlZFxuICAgICkge1xuICAgICAgY29uc3QgcmVzdWx0VmFsdWVzID0gcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cmlidXRlXVxuICAgICAgaWYgKHJlc3VsdFZhbHVlcyAmJiByZXN1bHRWYWx1ZXMuZm9yRWFjaCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdFZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChjaGVja0lmVmFsdWVJc1ZhbGlkKHZhbHVlcywgYXR0cmlidXRlLCByZXN1bHRWYWx1ZXNbaV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjaGVja0lmVmFsdWVJc1ZhbGlkKHZhbHVlcywgYXR0cmlidXRlLCByZXN1bHRWYWx1ZXMpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjaGVja0lmVmFsdWVJc1ZhbGlkKFxuICAgICAgICB2YWx1ZXMsXG4gICAgICAgIGF0dHJpYnV0ZSxcbiAgICAgICAgcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cmlidXRlXVxuICAgICAgKVxuICAgIH1cbiAgfSlcbn1cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDMwKSBGSVhNRTogTm90IGFsbCBjb2RlIHBhdGhzIHJldHVybiBhIHZhbHVlLlxuZnVuY3Rpb24gY2hlY2tJZlZhbHVlSXNWYWxpZCh2YWx1ZXM6IGFueVtdLCBhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHN3aXRjaCAoXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbYXR0cmlidXRlXS50eXBlXG4gICAgKSB7XG4gICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgY29uc3QgcGxvdGx5RGF0ZSA9IGdldFBsb3RseURhdGUodmFsdWUpXG4gICAgICAgIHJldHVybiBwbG90bHlEYXRlID49IHZhbHVlc1swXSAmJiBwbG90bHlEYXRlIDw9IHZhbHVlc1sxXVxuICAgICAgY2FzZSAnQk9PTEVBTic6XG4gICAgICBjYXNlICdTVFJJTkcnOlxuICAgICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgICByZXR1cm4gdmFsdWVzLmluZGV4T2YodmFsdWUudG9TdHJpbmcoKSArIHplcm9XaWR0aFNwYWNlKSA+PSAwXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdmFsdWUgPj0gdmFsdWVzWzBdICYmIHZhbHVlIDw9IHZhbHVlc1sxXVxuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gYWRkVmFsdWVGb3JBdHRyaWJ1dGVUb0FycmF5KHtcbiAgdmFsdWVBcnJheSxcbiAgYXR0cmlidXRlLFxuICB2YWx1ZSxcbn06IHtcbiAgdmFsdWVBcnJheTogYW55W11cbiAgYXR0cmlidXRlOiBzdHJpbmdcbiAgdmFsdWU6IGFueVxufSkge1xuICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHN3aXRjaCAoXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbYXR0cmlidXRlXS50eXBlXG4gICAgKSB7XG4gICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgdmFsdWVBcnJheS5wdXNoKGdldFBsb3RseURhdGUodmFsdWUpKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnQk9PTEVBTic6XG4gICAgICBjYXNlICdTVFJJTkcnOlxuICAgICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgICB2YWx1ZUFycmF5LnB1c2godmFsdWUudG9TdHJpbmcoKSArIHplcm9XaWR0aFNwYWNlKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFsdWVBcnJheS5wdXNoKHBhcnNlRmxvYXQodmFsdWUpKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gZ2V0SW5kZXhDbGlja2VkKGRhdGE6IGFueSkge1xuICByZXR1cm4gTWF0aC5tYXguYXBwbHkoXG4gICAgdW5kZWZpbmVkLFxuICAgIGRhdGEucG9pbnRzLm1hcCgocG9pbnQ6IGFueSkgPT4gcG9pbnQucG9pbnROdW1iZXIpXG4gICkgYXMgbnVtYmVyXG59XG5mdW5jdGlvbiBnZXRWYWx1ZUZyb21DbGljayhkYXRhOiBhbnksIGNhdGVnb3JpZXM6IGFueSkge1xuICBzd2l0Y2ggKGRhdGEucG9pbnRzWzBdLnhheGlzLnR5cGUpIHtcbiAgICBjYXNlICdjYXRlZ29yeSc6XG4gICAgICByZXR1cm4gW2RhdGEucG9pbnRzWzBdLnhdXG4gICAgY2FzZSAnZGF0ZSc6XG4gICAgICBjb25zdCBjdXJyZW50RGF0ZSA9IG1vbWVudChkYXRhLnBvaW50c1swXS54KS5mb3JtYXQocGxvdGx5RGF0ZUZvcm1hdClcbiAgICAgIHJldHVybiBfLmZpbmQoY2F0ZWdvcmllcywgKGNhdGVnb3J5OiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlID49IGNhdGVnb3J5WzBdICYmIGN1cnJlbnREYXRlIDw9IGNhdGVnb3J5WzFdXG4gICAgICB9KVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gXy5maW5kKGNhdGVnb3JpZXMsIChjYXRlZ29yeTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgZGF0YS5wb2ludHNbMF0ueCA+PSBjYXRlZ29yeVswXSAmJiBkYXRhLnBvaW50c1swXS54IDw9IGNhdGVnb3J5WzFdXG4gICAgICAgIClcbiAgICAgIH0pXG4gIH1cbn1cbmZ1bmN0aW9uIGdldExheW91dChmb250Q29sb3I6IHN0cmluZywgcGxvdD86IGFueSkge1xuICBjb25zdCBiYXNlTGF5b3V0ID0ge1xuICAgIGF1dG9zaXplOiB0cnVlLFxuICAgIHBhcGVyX2JnY29sb3I6ICdyZ2JhKDAsMCwwLDApJyxcbiAgICBwbG90X2JnY29sb3I6ICdyZ2JhKDAsMCwwLDApJyxcbiAgICBmb250OiB7XG4gICAgICBmYW1pbHk6ICdcIk9wZW4gU2FucyBMaWdodFwiLFwiSGVsdmV0aWNhIE5ldWVcIixIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZicsXG4gICAgICBzaXplOiAxNixcbiAgICAgIGNvbG9yOiAnaW5oZXJpdCcsXG4gICAgICBmaWxsOiAnaW5oZXJpdCcsXG4gICAgfSxcbiAgICBtYXJnaW46IHtcbiAgICAgIHQ6IDEwLFxuICAgICAgbDogNTAsXG4gICAgICByOiAxMTUsXG4gICAgICBiOiAxNDAsXG4gICAgICBwYWQ6IDAsXG4gICAgICBhdXRvZXhwYW5kOiB0cnVlLFxuICAgIH0sXG4gICAgYmFybW9kZTogJ292ZXJsYXknLFxuICAgIHhheGlzOiB7XG4gICAgICBmaXhlZHJhbmdlOiB0cnVlLFxuICAgICAgY29sb3I6IGZvbnRDb2xvcixcbiAgICB9LFxuICAgIHlheGlzOiB7XG4gICAgICBmaXhlZHJhbmdlOiB0cnVlLFxuICAgICAgY29sb3I6IGZvbnRDb2xvcixcbiAgICB9LFxuICAgIHNob3dsZWdlbmQ6IHRydWUsXG4gICAgbGVnZW5kOiB7XG4gICAgICBmb250OiB7IGNvbG9yOiBmb250Q29sb3IgfSxcbiAgICB9LFxuICB9IGFzIGFueVxuICBpZiAocGxvdCkge1xuICAgIGJhc2VMYXlvdXQueGF4aXMuYXV0b3JhbmdlID0gZmFsc2VcbiAgICBiYXNlTGF5b3V0LnhheGlzLnJhbmdlID0gcGxvdC5fZnVsbExheW91dC54YXhpcy5yYW5nZVxuICAgIGJhc2VMYXlvdXQueWF4aXMucmFuZ2UgPSBwbG90Ll9mdWxsTGF5b3V0LnlheGlzLnJhbmdlXG4gICAgYmFzZUxheW91dC55YXhpcy5hdXRvcmFuZ2UgPSBmYWxzZVxuICB9XG4gIHJldHVybiBiYXNlTGF5b3V0XG59XG50eXBlIFByb3BzID0ge1xuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxufVxuY29uc3QgZ2V0QXV0b2NvbXBsZXRlU3RhdGUgPSAoe1xuICBsYXp5UmVzdWx0cyxcbiAgYXR0cmlidXRlVG9CaW4sXG59OiB7XG4gIGxhenlSZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRzXG4gIGF0dHJpYnV0ZVRvQmluOiBhbnlcbn0pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBjaG9pY2VzOiBjYWxjdWxhdGVBdmFpbGFibGVBdHRyaWJ1dGVzKE9iamVjdC52YWx1ZXMobGF6eVJlc3VsdHMucmVzdWx0cykpLFxuICAgIHZhbHVlOiBhdHRyaWJ1dGVUb0JpbixcbiAgfVxufVxuZXhwb3J0IGNvbnN0IEhpc3RvZ3JhbSA9ICh7IHNlbGVjdGlvbkludGVyZmFjZSB9OiBQcm9wcykgPT4ge1xuICBjb25zdCB7IGxpc3RlblRvIH0gPSB1c2VCYWNrYm9uZSgpXG4gIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuICBjb25zdCBpc0RhcmtUaGVtZSA9IHRoZW1lLnBhbGV0dGUubW9kZSA9PT0gJ2RhcmsnXG4gIGNvbnN0IFtub01hdGNoaW5nRGF0YSwgc2V0Tm9NYXRjaGluZ0RhdGFdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHBsb3RseVJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudD4oKVxuICBjb25zdCBwbG90bHlSZWFkeUZvclVwZGF0ZXNSZWYgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IGxhenlSZXN1bHRzID0gdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlKHtcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIH0pXG4gIGNvbnN0IHNlbGVjdGVkUmVzdWx0cyA9IHVzZVNlbGVjdGVkUmVzdWx0cyh7IGxhenlSZXN1bHRzIH0pXG4gIGNvbnN0IFthdHRyaWJ1dGVUb0Jpbiwgc2V0QXR0cmlidXRlVG9CaW5dID0gUmVhY3QudXNlU3RhdGUoJycgYXMgc3RyaW5nKVxuICBjb25zdCBbYXV0b2NvbXBsZXRlU3RhdGUsIHNldEF1dG9jb21wbGV0ZVN0YXRlXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIGdldEF1dG9jb21wbGV0ZVN0YXRlKHsgbGF6eVJlc3VsdHMsIGF0dHJpYnV0ZVRvQmluIH0pXG4gIClcbiAgY29uc3QgcmVzdWx0cyA9IE9iamVjdC52YWx1ZXMobGF6eVJlc3VsdHMucmVzdWx0cylcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXROb01hdGNoaW5nRGF0YShmYWxzZSlcbiAgfSwgW2xhenlSZXN1bHRzLnJlc3VsdHMsIGF0dHJpYnV0ZVRvQmluXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRBdXRvY29tcGxldGVTdGF0ZShnZXRBdXRvY29tcGxldGVTdGF0ZSh7IGxhenlSZXN1bHRzLCBhdHRyaWJ1dGVUb0JpbiB9KSlcbiAgfSwgW2xhenlSZXN1bHRzLnJlc3VsdHNdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNob3dIaXN0b2dyYW0oKVxuICB9LCBbbGF6eVJlc3VsdHMucmVzdWx0cywgYXR0cmlidXRlVG9CaW4sIHRoZW1lXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocGxvdGx5UmVhZHlGb3JVcGRhdGVzUmVmLmN1cnJlbnQpIHtcbiAgICAgIC8vIGF2b2lkIHVwZGF0aW5nIHRoZSBoaXN0b2dyYW0gaWYgaXQncyBub3QgcmVhZHkgeWV0XG4gICAgICB1cGRhdGVIaXN0b2dyYW0oKVxuICAgIH1cbiAgfSwgW3NlbGVjdGVkUmVzdWx0c10pXG5cbiAgY29uc3QgZGVmYXVsdEZvbnRDb2xvciA9IGlzRGFya1RoZW1lID8gJ3doaXRlJyA6ICdibGFjaydcbiAgY29uc3QgZGVmYXVsdEhvdmVyTGFiZWwgPSB7XG4gICAgYmdjb2xvcjogaXNEYXJrVGhlbWUgPyAnYmxhY2snIDogJ3doaXRlJyxcbiAgICBmb250OiB7XG4gICAgICBjb2xvcjogZGVmYXVsdEZvbnRDb2xvcixcbiAgICB9LFxuICB9XG5cbiAgY29uc3QgZ2V0Q3VzdG9tSG92ZXJBcnJheSA9IChcbiAgICBjYXRlZ29yaWVzOiBhbnlbXSxcbiAgICByZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXVxuICApID0+IHtcbiAgICBjb25zdCBjdXN0b21BcnJheTogQ3VzdG9tSG92ZXJbXSA9IFtdXG4gICAgY2F0ZWdvcmllcy5mb3JFYWNoKChjYXRlZ29yeSkgPT4ge1xuICAgICAgY29uc3QgbWF0Y2hlZFJlc3VsdHMgPSBmaW5kTWF0Y2hlc0ZvckF0dHJpYnV0ZVZhbHVlcyhcbiAgICAgICAgcmVzdWx0cyxcbiAgICAgICAgYXR0cmlidXRlVG9CaW4sXG4gICAgICAgIGNhdGVnb3J5LmNvbnN0cnVjdG9yID09PSBBcnJheSA/IGNhdGVnb3J5IDogW2NhdGVnb3J5XVxuICAgICAgKVxuXG4gICAgICBpZiAoXG4gICAgICAgIChtYXRjaGVkUmVzdWx0cyAmJiBtYXRjaGVkUmVzdWx0cy5sZW5ndGggPiAwKSB8fFxuICAgICAgICBjdXN0b21BcnJheS5sZW5ndGggPiAwXG4gICAgICApIHtcbiAgICAgICAgY3VzdG9tQXJyYXkucHVzaChnZXRDdXN0b21Ib3ZlcihtYXRjaGVkUmVzdWx0cywgZGVmYXVsdEhvdmVyTGFiZWwpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGN1c3RvbUFycmF5Lmxlbmd0aCA+IDAgPyBjdXN0b21BcnJheSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgY29uc3QgZGV0ZXJtaW5lSW5pdGlhbERhdGEgPSAoKSA9PiB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgeDogY2FsY3VsYXRlQXR0cmlidXRlQXJyYXkoe1xuICAgICAgICAgIHJlc3VsdHMsXG4gICAgICAgICAgYXR0cmlidXRlOiBhdHRyaWJ1dGVUb0JpbixcbiAgICAgICAgfSksXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIHR5cGU6ICdoaXN0b2dyYW0nLFxuICAgICAgICBuYW1lOiAnSGl0cycsXG4gICAgICAgIG1hcmtlcjoge1xuICAgICAgICAgIGNvbG9yOiAncmdiYSgxMjAsIDEyMCwgMTIwLCAuMDUpJyxcbiAgICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgICBjb2xvcjogJ3JnYmEoMTIwLDEyMCwxMjAsLjIpJyxcbiAgICAgICAgICAgIHdpZHRoOiAnMicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgaG92ZXJ0ZW1wbGF0ZTogJyV7eX0gSGl0czxleHRyYT48L2V4dHJhPicsXG4gICAgICAgIGhvdmVybGFiZWw6IGRlZmF1bHRIb3ZlckxhYmVsLFxuICAgICAgfSxcbiAgICBdXG4gIH1cbiAgY29uc3QgZGV0ZXJtaW5lRGF0YSA9IChwbG90OiBhbnkpID0+IHtcbiAgICBjb25zdCBhY3RpdmVSZXN1bHRzID0gcmVzdWx0c1xuICAgIGNvbnN0IHhiaW5zID0gX2Nsb25lRGVlcChwbG90Ll9mdWxsRGF0YVswXS54YmlucylcblxuICAgIGNvbnN0IGNhdGVnb3JpZXM6IGFueVtdID0gcmV0cmlldmVDYXRlZ29yaWVzRnJvbVBsb3RseSgpXG5cbiAgICBsZXQgY3VzdG9tSG92ZXJBcnJheTogYW55ID0gdW5kZWZpbmVkXG4gICAgbGV0IHNlbGVjdGVkQ3VzdG9tSG92ZXJBcnJheTogYW55ID0gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXh0ZW5zaW9uLmN1c3RvbUhpc3RvZ3JhbUhvdmVyKSB7XG4gICAgICBjdXN0b21Ib3ZlckFycmF5ID0gZ2V0Q3VzdG9tSG92ZXJBcnJheShjYXRlZ29yaWVzLCByZXN1bHRzKVxuXG4gICAgICBzZWxlY3RlZEN1c3RvbUhvdmVyQXJyYXkgPSBnZXRDdXN0b21Ib3ZlckFycmF5KFxuICAgICAgICBjYXRlZ29yaWVzLFxuICAgICAgICBPYmplY3QudmFsdWVzKHNlbGVjdGVkUmVzdWx0cylcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICB4OiBjYWxjdWxhdGVBdHRyaWJ1dGVBcnJheSh7XG4gICAgICAgICAgcmVzdWx0czogYWN0aXZlUmVzdWx0cyxcbiAgICAgICAgICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZVRvQmluLFxuICAgICAgICB9KSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgdHlwZTogJ2hpc3RvZ3JhbScsXG4gICAgICAgIG5hbWU6ICdIaXRzJyxcbiAgICAgICAgbWFya2VyOiB7XG4gICAgICAgICAgY29sb3I6ICdyZ2JhKDEyMCwgMTIwLCAxMjAsIC4wNSknLFxuICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgxMjAsMTIwLDEyMCwuMiknLFxuICAgICAgICAgICAgd2lkdGg6ICcyJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBob3ZlcmxhYmVsOiBjdXN0b21Ib3ZlckFycmF5XG4gICAgICAgICAgPyBnZXRDdXN0b21Ib3ZlckxhYmVscyhjdXN0b21Ib3ZlckFycmF5KVxuICAgICAgICAgIDogZGVmYXVsdEhvdmVyTGFiZWwsXG4gICAgICAgIGhvdmVydGVtcGxhdGU6IGN1c3RvbUhvdmVyQXJyYXlcbiAgICAgICAgICA/IGdldEN1c3RvbUhvdmVyVGVtcGxhdGVzKCdIaXRzJywgY3VzdG9tSG92ZXJBcnJheSlcbiAgICAgICAgICA6ICcle3l9IEhpdHM8ZXh0cmE+PC9leHRyYT4nLFxuICAgICAgICBhdXRvYmlueDogZmFsc2UsXG4gICAgICAgIHhiaW5zLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogY2FsY3VsYXRlQXR0cmlidXRlQXJyYXkoe1xuICAgICAgICAgIHJlc3VsdHM6IE9iamVjdC52YWx1ZXMoc2VsZWN0ZWRSZXN1bHRzKSxcbiAgICAgICAgICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZVRvQmluLFxuICAgICAgICB9KSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgdHlwZTogJ2hpc3RvZ3JhbScsXG4gICAgICAgIG5hbWU6ICdTZWxlY3RlZCcsXG4gICAgICAgIG1hcmtlcjoge1xuICAgICAgICAgIGNvbG9yOiAncmdiYSgxMjAsIDEyMCwgMTIwLCAuMiknLFxuICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgxMjAsMTIwLDEyMCwuNSknLFxuICAgICAgICAgICAgd2lkdGg6ICcyJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBob3ZlcmxhYmVsOiBzZWxlY3RlZEN1c3RvbUhvdmVyQXJyYXlcbiAgICAgICAgICA/IGdldEN1c3RvbUhvdmVyTGFiZWxzKHNlbGVjdGVkQ3VzdG9tSG92ZXJBcnJheSlcbiAgICAgICAgICA6IGRlZmF1bHRIb3ZlckxhYmVsLFxuICAgICAgICBob3ZlcnRlbXBsYXRlOiBzZWxlY3RlZEN1c3RvbUhvdmVyQXJyYXlcbiAgICAgICAgICA/IGdldEN1c3RvbUhvdmVyVGVtcGxhdGVzKCdTZWxlY3RlZCcsIHNlbGVjdGVkQ3VzdG9tSG92ZXJBcnJheSlcbiAgICAgICAgICA6ICcle3l9IFNlbGVjdGVkPGV4dHJhPjwvZXh0cmE+JyxcbiAgICAgICAgYXV0b2Jpbng6IGZhbHNlLFxuICAgICAgICB4YmlucyxcbiAgICAgIH0sXG4gICAgXVxuICB9XG4gIGNvbnN0IGhhbmRsZVJlc2l6ZSA9ICgpID0+IHtcbiAgICBpZiAocGxvdGx5UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IGhpc3RvZ3JhbUVsZW1lbnQgPSBwbG90bHlSZWYuY3VycmVudFxuICAgICAgJChoaXN0b2dyYW1FbGVtZW50KS5maW5kKCdyZWN0LmRyYWcnKS5vZmYoJ21vdXNlZG93bicpXG4gICAgICBpZiAoKGhpc3RvZ3JhbUVsZW1lbnQgYXMgYW55KS5fY29udGV4dCkge1xuICAgICAgICBQbG90bHkuUGxvdHMucmVzaXplKGhpc3RvZ3JhbUVsZW1lbnQpXG4gICAgICB9XG4gICAgICAkKGhpc3RvZ3JhbUVsZW1lbnQpXG4gICAgICAgIC5maW5kKCdyZWN0LmRyYWcnKVxuICAgICAgICAub24oJ21vdXNlZG93bicsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgc2hpZnRLZXkuY3VycmVudCA9IGV2ZW50LnNoaWZ0S2V5XG4gICAgICAgICAgbWV0YUtleS5jdXJyZW50ID0gZXZlbnQubWV0YUtleVxuICAgICAgICAgIGN0cmxLZXkuY3VycmVudCA9IGV2ZW50LmN0cmxLZXlcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBpZCA9IChNYXRoLnJhbmRvbSgpICogMTAwKS50b0ZpeGVkKDApLnRvU3RyaW5nKClcbiAgICBsaXN0ZW5Ubygod3JlcXIgYXMgYW55KS52ZW50LCAncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICAgICQod2luZG93KS5vbihgcmVzaXplLiR7aWR9YCwgaGFuZGxlUmVzaXplKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAkKHdpbmRvdykub2ZmKGByZXNpemUuJHtpZH1gKVxuICAgIH1cbiAgfSwgW10pXG4gIGNvbnN0IHNob3dIaXN0b2dyYW0gPSAoKSA9PiB7XG4gICAgcGxvdGx5UmVhZHlGb3JVcGRhdGVzUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgIGlmIChwbG90bHlSZWYuY3VycmVudCkge1xuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID4gMCAmJiBhdHRyaWJ1dGVUb0Jpbikge1xuICAgICAgICBjb25zdCBoaXN0b2dyYW1FbGVtZW50ID0gcGxvdGx5UmVmLmN1cnJlbnRcbiAgICAgICAgY29uc3QgaW5pdGlhbERhdGEgPSBkZXRlcm1pbmVJbml0aWFsRGF0YSgpXG4gICAgICAgIGlmIChpbml0aWFsRGF0YVswXS54Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHNldE5vTWF0Y2hpbmdEYXRhKHRydWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUGxvdGx5Lm5ld1Bsb3QoXG4gICAgICAgICAgICBoaXN0b2dyYW1FbGVtZW50LFxuICAgICAgICAgICAgaW5pdGlhbERhdGEsXG4gICAgICAgICAgICBnZXRMYXlvdXQoZGVmYXVsdEZvbnRDb2xvciksXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGRpc3BsYXlNb2RlQmFyOiBmYWxzZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApLnRoZW4oKHBsb3Q6IGFueSkgPT4ge1xuICAgICAgICAgICAgUGxvdGx5Lm5ld1Bsb3QoXG4gICAgICAgICAgICAgIGhpc3RvZ3JhbUVsZW1lbnQsXG4gICAgICAgICAgICAgIGRldGVybWluZURhdGEocGxvdCksXG4gICAgICAgICAgICAgIGdldExheW91dChkZWZhdWx0Rm9udENvbG9yLCBwbG90KSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlNb2RlQmFyOiBmYWxzZSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaGFuZGxlUmVzaXplKClcbiAgICAgICAgICAgIGxpc3RlblRvSGlzdG9ncmFtKClcbiAgICAgICAgICAgIHBsb3RseVJlYWR5Rm9yVXBkYXRlc1JlZi5jdXJyZW50ID0gdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBsb3RseVJlZi5jdXJyZW50LmlubmVySFRNTCA9ICcnXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHVwZGF0ZUhpc3RvZ3JhbSA9ICgpID0+IHtcbiAgICBpZiAocGxvdGx5UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IGhpc3RvZ3JhbUVsZW1lbnQgPSBwbG90bHlSZWYuY3VycmVudFxuICAgICAgaWYgKFxuICAgICAgICBoaXN0b2dyYW1FbGVtZW50ICE9PSBudWxsICYmXG4gICAgICAgIGhpc3RvZ3JhbUVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoICE9PSAwICYmXG4gICAgICAgIGF0dHJpYnV0ZVRvQmluICYmXG4gICAgICAgIHJlc3VsdHMubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgUGxvdGx5LmRlbGV0ZVRyYWNlcyhoaXN0b2dyYW1FbGVtZW50LCAxKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmFibGUgdG8gZGVsZXRlIHRyYWNlJywgZXJyKVxuICAgICAgICB9XG4gICAgICAgIFBsb3RseS5hZGRUcmFjZXMoaGlzdG9ncmFtRWxlbWVudCwgZGV0ZXJtaW5lRGF0YShoaXN0b2dyYW1FbGVtZW50KVsxXSlcbiAgICAgICAgaGFuZGxlUmVzaXplKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpc3RvZ3JhbUVsZW1lbnQuaW5uZXJIVE1MID0gJydcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3Qgc2VsZWN0QmV0d2VlbiA9IChmaXJzdEluZGV4OiBudW1iZXIsIGxhc3RJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IGZpcnN0SW5kZXg7IGkgPD0gbGFzdEluZGV4OyBpKyspIHtcbiAgICAgIGlmIChwb2ludHNTZWxlY3RlZC5jdXJyZW50LmluZGV4T2YoaSkgPT09IC0xKSB7XG4gICAgICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnQucHVzaChpKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBhdHRyaWJ1dGVUb0NoZWNrID0gYXR0cmlidXRlVG9CaW5cbiAgICBjb25zdCBjYXRlZ29yaWVzID0gcmV0cmlldmVDYXRlZ29yaWVzRnJvbVBsb3RseSgpXG4gICAgY29uc3QgdmFsaWRDYXRlZ29yaWVzID0gY2F0ZWdvcmllcy5zbGljZShmaXJzdEluZGV4LCBsYXN0SW5kZXgpXG4gICAgY29uc3QgYWN0aXZlU2VhcmNoUmVzdWx0cyA9IHJlc3VsdHNcbiAgICBjb25zdCB2YWxpZFJlc3VsdHMgPSB2YWxpZENhdGVnb3JpZXMucmVkdWNlKFxuICAgICAgKHJlc3VsdHM6IGFueSwgY2F0ZWdvcnk6IGFueSkgPT4ge1xuICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoXG4gICAgICAgICAgZmluZE1hdGNoZXNGb3JBdHRyaWJ1dGVWYWx1ZXMoXG4gICAgICAgICAgICBhY3RpdmVTZWFyY2hSZXN1bHRzLFxuICAgICAgICAgICAgYXR0cmlidXRlVG9DaGVjayxcbiAgICAgICAgICAgIGNhdGVnb3J5LmNvbnN0cnVjdG9yID09PSBBcnJheSA/IGNhdGVnb3J5IDogW2NhdGVnb3J5XVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgfSxcbiAgICAgIFtdIGFzIExhenlRdWVyeVJlc3VsdFtdXG4gICAgKSBhcyBMYXp5UXVlcnlSZXN1bHRbXVxuICAgIHZhbGlkUmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgIHJlc3VsdC5zZXRTZWxlY3RlZCh0cnVlKVxuICAgIH0pXG4gIH1cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG4gIGNvbnN0IHJldHJpZXZlQ2F0ZWdvcmllc0Zyb21QbG90bHlGb3JEYXRlcyA9ICgpID0+IHtcbiAgICBpZiAocGxvdGx5UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IGhpc3RvZ3JhbUVsZW1lbnQgPSBwbG90bHlSZWYuY3VycmVudFxuICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IFtdXG4gICAgICBjb25zdCB4YmlucyA9IChoaXN0b2dyYW1FbGVtZW50IGFzIGFueSkuX2Z1bGxEYXRhWzBdLnhiaW5zXG4gICAgICBjb25zdCBtaW4gPSB4Ymlucy5zdGFydFxuICAgICAgY29uc3QgbWF4ID0gcGFyc2VJbnQobW9tZW50KHhiaW5zLmVuZCkuZm9ybWF0KCd4JykpXG4gICAgICBsZXQgc3RhcnQgPSBwYXJzZUludChtb21lbnQobWluKS5mb3JtYXQoJ3gnKSlcbiAgICAgIGNvbnN0IGluTW9udGhzID0geGJpbnMuc2l6ZS5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nXG4gICAgICBjb25zdCBiaW5TaXplID0gaW5Nb250aHMgPyBwYXJzZUludCh4Ymlucy5zaXplLnN1YnN0cmluZygxKSkgOiB4Ymlucy5zaXplXG4gICAgICB3aGlsZSAoc3RhcnQgPCBtYXgpIHtcbiAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gbW9tZW50KHN0YXJ0KS5mb3JtYXQocGxvdGx5RGF0ZUZvcm1hdClcbiAgICAgICAgY29uc3QgZW5kRGF0ZSA9IGluTW9udGhzXG4gICAgICAgICAgPyBtb21lbnQoc3RhcnQpLmFkZChiaW5TaXplLCAnbW9udGhzJykuZm9ybWF0KHBsb3RseURhdGVGb3JtYXQpXG4gICAgICAgICAgOiBtb21lbnQoc3RhcnQpLmFkZChiaW5TaXplLCAnbXMnKS5mb3JtYXQocGxvdGx5RGF0ZUZvcm1hdClcbiAgICAgICAgY2F0ZWdvcmllcy5wdXNoKFtzdGFydERhdGUsIGVuZERhdGVdKVxuICAgICAgICBzdGFydCA9IHBhcnNlSW50KFxuICAgICAgICAgIGluTW9udGhzXG4gICAgICAgICAgICA/IG1vbWVudChzdGFydCkuYWRkKGJpblNpemUsICdtb250aHMnKS5mb3JtYXQoJ3gnKVxuICAgICAgICAgICAgOiBtb21lbnQoc3RhcnQpLmFkZChiaW5TaXplLCAnbXMnKS5mb3JtYXQoJ3gnKVxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gY2F0ZWdvcmllc1xuICAgIH1cbiAgfVxuICAvLyBUaGlzIGlzIGFuIGludGVybmFsIHZhcmlhYmxlIGZvciBQbG90bHksIHNvIGl0IG1pZ2h0IGJyZWFrIGlmIHdlIHVwZGF0ZSBQbG90bHkgaW4gdGhlIGZ1dHVyZS5cbiAgLy8gUmVnYXJkbGVzcywgdGhlcmUgd2FzIG5vIG90aGVyIHdheSB0byByZWxpYWJseSBnZXQgdGhlIGNhdGVnb3JpZXMuXG4gIGNvbnN0IHJldHJpZXZlQ2F0ZWdvcmllc0Zyb21QbG90bHkgPSAoKSA9PiB7XG4gICAgaWYgKHBsb3RseVJlZi5jdXJyZW50KSB7XG4gICAgICBjb25zdCBoaXN0b2dyYW1FbGVtZW50ID0gcGxvdGx5UmVmLmN1cnJlbnRcbiAgICAgIGNvbnN0IHhheGlzID0gKGhpc3RvZ3JhbUVsZW1lbnQgYXMgYW55KS5fZnVsbExheW91dC54YXhpc1xuICAgICAgc3dpdGNoICh4YXhpcy50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2NhdGVnb3J5JzpcbiAgICAgICAgICByZXR1cm4geGF4aXMuX2NhdGVnb3JpZXNcbiAgICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgICAgcmV0dXJuIHJldHJpZXZlQ2F0ZWdvcmllc0Zyb21QbG90bHlGb3JEYXRlcygpXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc3QgeGJpbnMgPSAoaGlzdG9ncmFtRWxlbWVudCBhcyBhbnkpLl9mdWxsRGF0YVswXS54Ymluc1xuICAgICAgICAgIGNvbnN0IG1pbiA9IHhiaW5zLnN0YXJ0XG4gICAgICAgICAgY29uc3QgbWF4ID0geGJpbnMuZW5kXG4gICAgICAgICAgY29uc3QgYmluU2l6ZSA9IHhiaW5zLnNpemVcbiAgICAgICAgICBjb25zdCBjYXRlZ29yaWVzID0gW11cbiAgICAgICAgICB2YXIgc3RhcnQgPSBtaW5cbiAgICAgICAgICB3aGlsZSAoc3RhcnQgPCBtYXgpIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXMucHVzaChbc3RhcnQsIHN0YXJ0ICsgYmluU2l6ZV0pXG4gICAgICAgICAgICBzdGFydCArPSBiaW5TaXplXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjYXRlZ29yaWVzXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IGhhbmRsZUNvbnRyb2xDbGljayA9IChkYXRhOiBhbnksIGFscmVhZHlTZWxlY3RlZDogYm9vbGVhbikgPT4ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZVRvQ2hlY2sgPSBhdHRyaWJ1dGVUb0JpblxuICAgIGNvbnN0IGNhdGVnb3JpZXMgPSByZXRyaWV2ZUNhdGVnb3JpZXNGcm9tUGxvdGx5KClcbiAgICBjb25zdCBtYXRjaGVkUmVzdWx0cyA9IGZpbmRNYXRjaGVzRm9yQXR0cmlidXRlVmFsdWVzKFxuICAgICAgcmVzdWx0cyxcbiAgICAgIGF0dHJpYnV0ZVRvQ2hlY2ssXG4gICAgICBnZXRWYWx1ZUZyb21DbGljayhkYXRhLCBjYXRlZ29yaWVzKVxuICAgIClcbiAgICBpZiAoYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICBtYXRjaGVkUmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgcmVzdWx0LnNldFNlbGVjdGVkKGZhbHNlKVxuICAgICAgfSlcbiAgICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnQuc3BsaWNlKFxuICAgICAgICBwb2ludHNTZWxlY3RlZC5jdXJyZW50LmluZGV4T2YoZ2V0SW5kZXhDbGlja2VkKGRhdGEpKSxcbiAgICAgICAgMVxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRjaGVkUmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgcmVzdWx0LnNldFNlbGVjdGVkKHRydWUpXG4gICAgICB9KVxuICAgICAgcG9pbnRzU2VsZWN0ZWQuY3VycmVudC5wdXNoKGdldEluZGV4Q2xpY2tlZChkYXRhKSlcbiAgICB9XG4gIH1cbiAgY29uc3QgaGFuZGxlU2hpZnRDbGljayA9IChkYXRhOiBhbnkpID0+IHtcbiAgICBjb25zdCBpbmRleENsaWNrZWQgPSBnZXRJbmRleENsaWNrZWQoZGF0YSlcbiAgICBjb25zdCBmaXJzdEluZGV4ID1cbiAgICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnQubGVuZ3RoID09PSAwXG4gICAgICAgID8gLTFcbiAgICAgICAgOiBwb2ludHNTZWxlY3RlZC5jdXJyZW50LnJlZHVjZShcbiAgICAgICAgICAgIChjdXJyZW50TWluLCBwb2ludCkgPT4gTWF0aC5taW4oY3VycmVudE1pbiwgcG9pbnQpLFxuICAgICAgICAgICAgcG9pbnRzU2VsZWN0ZWQuY3VycmVudFswXVxuICAgICAgICAgIClcbiAgICBjb25zdCBsYXN0SW5kZXggPVxuICAgICAgcG9pbnRzU2VsZWN0ZWQuY3VycmVudC5sZW5ndGggPT09IDBcbiAgICAgICAgPyAtMVxuICAgICAgICA6IHBvaW50c1NlbGVjdGVkLmN1cnJlbnQucmVkdWNlKFxuICAgICAgICAgICAgKGN1cnJlbnRNaW4sIHBvaW50KSA9PiBNYXRoLm1heChjdXJyZW50TWluLCBwb2ludCksXG4gICAgICAgICAgICBwb2ludHNTZWxlY3RlZC5jdXJyZW50WzBdXG4gICAgICAgICAgKVxuICAgIGlmIChmaXJzdEluZGV4ID09PSAtMSAmJiBsYXN0SW5kZXggPT09IC0xKSB7XG4gICAgICBsYXp5UmVzdWx0cy5kZXNlbGVjdCgpXG4gICAgICBoYW5kbGVDb250cm9sQ2xpY2soZGF0YSwgZmFsc2UpXG4gICAgfSBlbHNlIGlmIChpbmRleENsaWNrZWQgPD0gZmlyc3RJbmRleCkge1xuICAgICAgc2VsZWN0QmV0d2VlbihpbmRleENsaWNrZWQsIGZpcnN0SW5kZXgpXG4gICAgfSBlbHNlIGlmIChpbmRleENsaWNrZWQgPj0gbGFzdEluZGV4KSB7XG4gICAgICBzZWxlY3RCZXR3ZWVuKGxhc3RJbmRleCwgaW5kZXhDbGlja2VkICsgMSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0QmV0d2VlbihmaXJzdEluZGV4LCBpbmRleENsaWNrZWQgKyAxKVxuICAgIH1cbiAgfVxuICBjb25zdCBwbG90bHlDbGlja0hhbmRsZXIgPSAoZGF0YTogYW55KSA9PiB7XG4gICAgY29uc3QgaW5kZXhDbGlja2VkID0gZ2V0SW5kZXhDbGlja2VkKGRhdGEpXG4gICAgY29uc3QgYWxyZWFkeVNlbGVjdGVkID0gcG9pbnRzU2VsZWN0ZWQuY3VycmVudC5pbmRleE9mKGluZGV4Q2xpY2tlZCkgPj0gMFxuICAgIGlmIChzaGlmdEtleS5jdXJyZW50KSB7XG4gICAgICBoYW5kbGVTaGlmdENsaWNrKGRhdGEpXG4gICAgfSBlbHNlIGlmIChjdHJsS2V5LmN1cnJlbnQgfHwgbWV0YUtleS5jdXJyZW50KSB7XG4gICAgICBoYW5kbGVDb250cm9sQ2xpY2soZGF0YSwgYWxyZWFkeVNlbGVjdGVkKVxuICAgIH0gZWxzZSB7XG4gICAgICBsYXp5UmVzdWx0cy5kZXNlbGVjdCgpXG4gICAgICByZXNldFBvaW50U2VsZWN0aW9uKClcbiAgICAgIGhhbmRsZUNvbnRyb2xDbGljayhkYXRhLCBhbHJlYWR5U2VsZWN0ZWQpXG4gICAgfVxuICAgIHJlc2V0S2V5VHJhY2tpbmcoKVxuICB9XG4gIGNvbnN0IGxpc3RlblRvSGlzdG9ncmFtID0gKCkgPT4ge1xuICAgIGlmIChwbG90bHlSZWYuY3VycmVudCkge1xuICAgICAgY29uc3QgaGlzdG9ncmFtRWxlbWVudCA9IHBsb3RseVJlZi5jdXJyZW50XG4gICAgICA7KGhpc3RvZ3JhbUVsZW1lbnQgYXMgYW55KS5fZXYuYWRkTGlzdGVuZXIoXG4gICAgICAgICdwbG90bHlfY2xpY2snLFxuICAgICAgICBwbG90bHlDbGlja0hhbmRsZXJcbiAgICAgIClcbiAgICB9XG4gIH1cbiAgY29uc3Qgc2hpZnRLZXkgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IG1ldGFLZXkgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IGN0cmxLZXkgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IHBvaW50c1NlbGVjdGVkID0gUmVhY3QudXNlUmVmKFtdIGFzIG51bWJlcltdKVxuICBjb25zdCByZXNldEtleVRyYWNraW5nID0gKCkgPT4ge1xuICAgIHNoaWZ0S2V5LmN1cnJlbnQgPSBmYWxzZVxuICAgIG1ldGFLZXkuY3VycmVudCA9IGZhbHNlXG4gICAgY3RybEtleS5jdXJyZW50ID0gZmFsc2VcbiAgfVxuICBjb25zdCByZXNldFBvaW50U2VsZWN0aW9uID0gKCkgPT4ge1xuICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnQgPSBbXVxuICB9XG4gIGlmIChPYmplY3Qua2V5cyhsYXp5UmVzdWx0cy5yZXN1bHRzKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMjBweCcgfX0+Tm8gcmVzdWx0cyBmb3VuZDwvZGl2PlxuICB9XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0yXCI+XG4gICAgICAgIDxBdXRvY29tcGxldGVcbiAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgIG9wdGlvbnM9e2F1dG9jb21wbGV0ZVN0YXRlLmNob2ljZXN9XG4gICAgICAgICAgb25DaGFuZ2U9eyhfZTogYW55LCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgc2V0QXR0cmlidXRlVG9CaW4obmV3VmFsdWUudmFsdWUpXG4gICAgICAgICAgfX1cbiAgICAgICAgICBpc09wdGlvbkVxdWFsVG9WYWx1ZT17KG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBhdHRyaWJ1dGVUb0Jpbn1cbiAgICAgICAgICBnZXRPcHRpb25MYWJlbD17KG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5sYWJlbFxuICAgICAgICAgIH19XG4gICAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICAgIHZhbHVlPXthdXRvY29tcGxldGVTdGF0ZS5jaG9pY2VzLmZpbmQoXG4gICAgICAgICAgICAoY2hvaWNlKSA9PiBjaG9pY2UudmFsdWUgPT09IGF0dHJpYnV0ZVRvQmluXG4gICAgICAgICAgKX1cbiAgICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4gKFxuICAgICAgICAgICAgPFRleHRGaWVsZCB7Li4ucGFyYW1zfSBsYWJlbD1cIkdyb3VwIGJ5XCIgdmFyaWFudD1cIm91dGxpbmVkXCIgLz5cbiAgICAgICAgICApfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cInBsb3RseS1oaXN0b2dyYW1cIlxuICAgICAgICByZWY9e3Bsb3RseVJlZiBhcyBhbnl9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgaGVpZ2h0OiAnY2FsYygxMDAlIC0gMTM1cHgpJyxcbiAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgIGRpc3BsYXk6IG5vTWF0Y2hpbmdEYXRhID8gJ25vbmUnIDogJ2Jsb2NrJyxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICB7bm9NYXRjaGluZ0RhdGEgPyAoXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzIwcHgnIH19PlxuICAgICAgICAgIE5vIGRhdGEgaW4gdGhpcyByZXN1bHQgc2V0IGhhcyB0aGF0IGF0dHJpYnV0ZVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvPlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShIaXN0b2dyYW0pXG4iXX0=