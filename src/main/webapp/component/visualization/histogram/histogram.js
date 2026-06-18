import { __assign, __read } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks';
import { useBackbone } from '../../selection-checkbox/useBackbone.hook';
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import _cloneDeep from 'lodash.clonedeep';
import wreqr from '../../../js/wreqr';
import $ from 'jquery';
import _ from 'underscore';
import Plotly from 'plotly.js';
import moment from 'moment-timezone';
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
    var plotlyRef = React.useRef(null);
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
            var matchedResults = findMatchesForAttributeValues(results, attributeToBin, Array.isArray(category) ? category : [category]);
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
                        width: 2,
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
        var baseHoverTemplate = '%{y} Hits<br>%{x}<extra></extra>';
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
                        width: 2,
                    },
                },
                hoverlabel: customHoverArray
                    ? getCustomHoverLabels(customHoverArray)
                    : defaultHoverLabel,
                hovertemplate: customHoverArray
                    ? getCustomHoverTemplates('Hits', customHoverArray)
                    : baseHoverTemplate,
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
                        width: 2,
                    },
                },
                hoverlabel: selectedCustomHoverArray
                    ? getCustomHoverLabels(selectedCustomHoverArray)
                    : defaultHoverLabel,
                hovertemplate: selectedCustomHoverArray
                    ? getCustomHoverTemplates('Selected', selectedCustomHoverArray)
                    : baseHoverTemplate,
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
            results = results.concat(findMatchesForAttributeValues(activeSearchResults, attributeToCheck, Array.isArray(category) ? category : [category]));
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
        return _jsx("div", { style: { padding: '20px' }, children: "No results found" });
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "p-2", children: _jsx(Autocomplete, { size: "small", options: autocompleteState.choices, onChange: function (_e, newValue) {
                        setAttributeToBin(newValue.value);
                    }, isOptionEqualToValue: function (option) { return option.value === attributeToBin; }, getOptionLabel: function (option) {
                        return option.label;
                    }, disableClearable: true, value: autocompleteState.choices.find(function (choice) { return choice.value === attributeToBin; }), renderInput: function (params) { return (_jsx(TextField, __assign({}, params, { label: "Group by", variant: "outlined" }))); } }) }), _jsx("div", { className: "plotly-histogram", ref: plotlyRef, style: {
                    height: 'calc(100% - 135px)',
                    width: '100%',
                    display: noMatchingData ? 'none' : 'block',
                } }), noMatchingData ? (_jsx("div", { style: { padding: '20px' }, children: "No data in this result set has that attribute" })) : null] }));
};
export default Histogram;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9ncmFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL2hpc3RvZ3JhbS9oaXN0b2dyYW0udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFHdEYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJDQUEyQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFBO0FBQzVFLE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFBO0FBQ3pDLE9BQU8sS0FBSyxNQUFNLG1CQUFtQixDQUFBO0FBQ3JDLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFBO0FBQzlCLE9BQU8sTUFBTSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BDLE9BQU8sU0FBUyxNQUFNLDJCQUEyQixDQUFBO0FBQ2pELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUMvQyxPQUFPLEVBRUwsb0JBQW9CLEVBQ3BCLHVCQUF1QixFQUN2QixjQUFjLEdBQ2YsTUFBTSxrQkFBa0IsQ0FBQTtBQUN6QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUNwRSxJQUFNLGNBQWMsR0FBRyxRQUFRLENBQUE7QUFDL0IsSUFBTSxnQkFBZ0IsR0FBRyx3QkFBd0IsQ0FBQTtBQUNqRCxTQUFTLGFBQWEsQ0FBQyxJQUFZO0lBQ2pDLE9BQU8sTUFBTSxD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QUFDLE9BQU8sQ0FBQyxJQUFJLENBQ25DLFVBQUMsTUFBTSxJQUFLLE9BQUEsTUFBTSxDQUFDLEtBQUssS0FBSyxjQUFjLEVBQS9CLENBQStCLENBQzVDLEVBQ0QsV0FBVyxFQUFFLFVBQUMsTUFBTSxJQUFLLE9BQUEsQ0FDdkIsS0FBQyxTQUFTLGVBQUssTUFBTSxJQUFFLEtBQUssRUFBQyxVQUFVLEVBQUMsT0FBTyxFQUFDLFVBQVUsSUFBRyxDQUM5RCxFQUZ3QixDQUV4QixHQUNELEdBQ0UsRUFDTixjQUNFLFNBQVMsRUFBQyxrQkFBa0IsRUFDNUIsR0FBRyxFQUFFLFNBQWdCLEVBQ3JCLEtBQUssRUFBRTtvQkFDTCxNQUFNLEVBQUUsb0JBQW9CO29CQUM1QixLQUFLLEVBQUUsTUFBTTtvQkFDYixPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU87aUJBQzNDLEdBQ0QsRUFDRCxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQ2hCLGNBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSw4REFFekIsQ0FDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQ1AsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IHsgdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vLi4vc2VsZWN0aW9uLWludGVyZmFjZS9ob29rcydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdHMgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0cydcbmltcG9ydCB7IExhenlRdWVyeVJlc3VsdCB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHQnXG5pbXBvcnQgeyB1c2VCYWNrYm9uZSB9IGZyb20gJy4uLy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHsgdXNlU2VsZWN0ZWRSZXN1bHRzIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L2hvb2tzJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgX2Nsb25lRGVlcCBmcm9tICdsb2Rhc2guY2xvbmVkZWVwJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uLy4uLy4uL2pzL3dyZXFyJ1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBQbG90bHkgZnJvbSAncGxvdGx5LmpzJ1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQtdGltZXpvbmUnXG5pbXBvcnQgZXh0ZW5zaW9uIGZyb20gJy4uLy4uLy4uL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgeyB1c2VUaGVtZSB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJ1xuaW1wb3J0IHtcbiAgQ3VzdG9tSG92ZXIsXG4gIGdldEN1c3RvbUhvdmVyTGFiZWxzLFxuICBnZXRDdXN0b21Ib3ZlclRlbXBsYXRlcyxcbiAgZ2V0Q3VzdG9tSG92ZXIsXG59IGZyb20gJy4vYWRkLW9uLWhlbHBlcnMnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuY29uc3QgemVyb1dpZHRoU3BhY2UgPSAnXFx1MjAwQidcbmNvbnN0IHBsb3RseURhdGVGb3JtYXQgPSAnWVlZWS1NTS1ERCBISDptbTpzcy5TUydcbmZ1bmN0aW9uIGdldFBsb3RseURhdGUoZGF0ZTogc3RyaW5nKSB7XG4gIHJldHVybiBtb21lbnQoZGF0ZSkuZm9ybWF0KHBsb3RseURhdGVGb3JtYXQpXG59XG5mdW5jdGlvbiBjYWxjdWxhdGVBdmFpbGFibGVBdHRyaWJ1dGVzKHJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdKSB7XG4gIGxldCBhdmFpbGFibGVBdHRyaWJ1dGVzID0gW10gYXMgc3RyaW5nW11cbiAgcmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICBhdmFpbGFibGVBdHRyaWJ1dGVzID0gXy51bmlvbihcbiAgICAgIGF2YWlsYWJsZUF0dHJpYnV0ZXMsXG4gICAgICBPYmplY3Qua2V5cyhyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgICApXG4gIH0pXG4gIHJldHVybiBhdmFpbGFibGVBdHRyaWJ1dGVzXG4gICAgLmZpbHRlcihcbiAgICAgIChhdHRyaWJ1dGUpID0+XG4gICAgICAgICFTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuaXNIaWRkZW5BdHRyaWJ1dGUoYXR0cmlidXRlKVxuICAgIClcbiAgICAubWFwKChhdHRyaWJ1dGUpID0+ICh7XG4gICAgICBsYWJlbDogU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEFsaWFzKGF0dHJpYnV0ZSksXG4gICAgICB2YWx1ZTogYXR0cmlidXRlLFxuICAgIH0pKVxufVxuZnVuY3Rpb24gY2FsY3VsYXRlQXR0cmlidXRlQXJyYXkoe1xuICByZXN1bHRzLFxuICBhdHRyaWJ1dGUsXG59OiB7XG4gIHJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdXG4gIGF0dHJpYnV0ZTogc3RyaW5nXG59KSB7XG4gIGNvbnN0IHZhbHVlcyA9IFtdIGFzIHN0cmluZ1tdXG4gIHJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgaWYgKFxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2F0dHJpYnV0ZV1cbiAgICAgICAgLm11bHRpdmFsdWVkXG4gICAgKSB7XG4gICAgICBjb25zdCByZXN1bHRWYWx1ZXMgPSByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyaWJ1dGVdXG4gICAgICBpZiAocmVzdWx0VmFsdWVzICYmIHJlc3VsdFZhbHVlcy5mb3JFYWNoKSB7XG4gICAgICAgIHJlc3VsdFZhbHVlcy5mb3JFYWNoKCh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgYWRkVmFsdWVGb3JBdHRyaWJ1dGVUb0FycmF5KHsgdmFsdWVBcnJheTogdmFsdWVzLCBhdHRyaWJ1dGUsIHZhbHVlIH0pXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhZGRWYWx1ZUZvckF0dHJpYnV0ZVRvQXJyYXkoe1xuICAgICAgICAgIHZhbHVlQXJyYXk6IHZhbHVlcyxcbiAgICAgICAgICBhdHRyaWJ1dGUsXG4gICAgICAgICAgdmFsdWU6IHJlc3VsdFZhbHVlcyxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYWRkVmFsdWVGb3JBdHRyaWJ1dGVUb0FycmF5KHtcbiAgICAgICAgdmFsdWVBcnJheTogdmFsdWVzLFxuICAgICAgICBhdHRyaWJ1dGUsXG4gICAgICAgIHZhbHVlOiByZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyaWJ1dGVdLFxuICAgICAgfSlcbiAgICB9XG4gIH0pXG4gIHJldHVybiB2YWx1ZXNcbn1cbmZ1bmN0aW9uIGZpbmRNYXRjaGVzRm9yQXR0cmlidXRlVmFsdWVzKFxuICByZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXSxcbiAgYXR0cmlidXRlOiBzdHJpbmcsXG4gIHZhbHVlczogYW55W11cbikge1xuICByZXR1cm4gcmVzdWx0cy5maWx0ZXIoKHJlc3VsdCkgPT4ge1xuICAgIGlmIChcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVthdHRyaWJ1dGVdXG4gICAgICAgIC5tdWx0aXZhbHVlZFxuICAgICkge1xuICAgICAgY29uc3QgcmVzdWx0VmFsdWVzID0gcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cmlidXRlXVxuICAgICAgaWYgKHJlc3VsdFZhbHVlcyAmJiByZXN1bHRWYWx1ZXMuZm9yRWFjaCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdFZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChjaGVja0lmVmFsdWVJc1ZhbGlkKHZhbHVlcywgYXR0cmlidXRlLCByZXN1bHRWYWx1ZXNbaV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjaGVja0lmVmFsdWVJc1ZhbGlkKHZhbHVlcywgYXR0cmlidXRlLCByZXN1bHRWYWx1ZXMpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjaGVja0lmVmFsdWVJc1ZhbGlkKFxuICAgICAgICB2YWx1ZXMsXG4gICAgICAgIGF0dHJpYnV0ZSxcbiAgICAgICAgcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cmlidXRlXVxuICAgICAgKVxuICAgIH1cbiAgfSlcbn1cbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDMwKSBGSVhNRTogTm90IGFsbCBjb2RlIHBhdGhzIHJldHVybiBhIHZhbHVlLlxuZnVuY3Rpb24gY2hlY2tJZlZhbHVlSXNWYWxpZCh2YWx1ZXM6IGFueVtdLCBhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHN3aXRjaCAoXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbYXR0cmlidXRlXS50eXBlXG4gICAgKSB7XG4gICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgY29uc3QgcGxvdGx5RGF0ZSA9IGdldFBsb3RseURhdGUodmFsdWUpXG4gICAgICAgIHJldHVybiBwbG90bHlEYXRlID49IHZhbHVlc1swXSAmJiBwbG90bHlEYXRlIDw9IHZhbHVlc1sxXVxuICAgICAgY2FzZSAnQk9PTEVBTic6XG4gICAgICBjYXNlICdTVFJJTkcnOlxuICAgICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgICByZXR1cm4gdmFsdWVzLmluZGV4T2YodmFsdWUudG9TdHJpbmcoKSArIHplcm9XaWR0aFNwYWNlKSA+PSAwXG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gdmFsdWUgPj0gdmFsdWVzWzBdICYmIHZhbHVlIDw9IHZhbHVlc1sxXVxuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gYWRkVmFsdWVGb3JBdHRyaWJ1dGVUb0FycmF5KHtcbiAgdmFsdWVBcnJheSxcbiAgYXR0cmlidXRlLFxuICB2YWx1ZSxcbn06IHtcbiAgdmFsdWVBcnJheTogYW55W11cbiAgYXR0cmlidXRlOiBzdHJpbmdcbiAgdmFsdWU6IGFueVxufSkge1xuICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIHN3aXRjaCAoXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbYXR0cmlidXRlXS50eXBlXG4gICAgKSB7XG4gICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgdmFsdWVBcnJheS5wdXNoKGdldFBsb3RseURhdGUodmFsdWUpKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnQk9PTEVBTic6XG4gICAgICBjYXNlICdTVFJJTkcnOlxuICAgICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgICB2YWx1ZUFycmF5LnB1c2godmFsdWUudG9TdHJpbmcoKSArIHplcm9XaWR0aFNwYWNlKVxuICAgICAgICBicmVha1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFsdWVBcnJheS5wdXNoKHBhcnNlRmxvYXQodmFsdWUpKVxuICAgICAgICBicmVha1xuICAgIH1cbiAgfVxufVxuZnVuY3Rpb24gZ2V0SW5kZXhDbGlja2VkKGRhdGE6IGFueSkge1xuICByZXR1cm4gTWF0aC5tYXguYXBwbHkoXG4gICAgdW5kZWZpbmVkLFxuICAgIGRhdGEucG9pbnRzLm1hcCgocG9pbnQ6IGFueSkgPT4gcG9pbnQucG9pbnROdW1iZXIpXG4gICkgYXMgbnVtYmVyXG59XG5mdW5jdGlvbiBnZXRWYWx1ZUZyb21DbGljayhkYXRhOiBhbnksIGNhdGVnb3JpZXM6IGFueSkge1xuICBzd2l0Y2ggKGRhdGEucG9pbnRzWzBdLnhheGlzLnR5cGUpIHtcbiAgICBjYXNlICdjYXRlZ29yeSc6XG4gICAgICByZXR1cm4gW2RhdGEucG9pbnRzWzBdLnhdXG4gICAgY2FzZSAnZGF0ZSc6XG4gICAgICBjb25zdCBjdXJyZW50RGF0ZSA9IG1vbWVudChkYXRhLnBvaW50c1swXS54KS5mb3JtYXQocGxvdGx5RGF0ZUZvcm1hdClcbiAgICAgIHJldHVybiBfLmZpbmQoY2F0ZWdvcmllcywgKGNhdGVnb3J5OiBhbnkpID0+IHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnREYXRlID49IGNhdGVnb3J5WzBdICYmIGN1cnJlbnREYXRlIDw9IGNhdGVnb3J5WzFdXG4gICAgICB9KVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gXy5maW5kKGNhdGVnb3JpZXMsIChjYXRlZ29yeTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgZGF0YS5wb2ludHNbMF0ueCA+PSBjYXRlZ29yeVswXSAmJiBkYXRhLnBvaW50c1swXS54IDw9IGNhdGVnb3J5WzFdXG4gICAgICAgIClcbiAgICAgIH0pXG4gIH1cbn1cbmZ1bmN0aW9uIGdldExheW91dChmb250Q29sb3I6IHN0cmluZywgcGxvdD86IGFueSkge1xuICBjb25zdCBiYXNlTGF5b3V0ID0ge1xuICAgIGF1dG9zaXplOiB0cnVlLFxuICAgIHBhcGVyX2JnY29sb3I6ICdyZ2JhKDAsMCwwLDApJyxcbiAgICBwbG90X2JnY29sb3I6ICdyZ2JhKDAsMCwwLDApJyxcbiAgICBmb250OiB7XG4gICAgICBmYW1pbHk6ICdcIk9wZW4gU2FucyBMaWdodFwiLFwiSGVsdmV0aWNhIE5ldWVcIixIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZicsXG4gICAgICBzaXplOiAxNixcbiAgICAgIGNvbG9yOiAnaW5oZXJpdCcsXG4gICAgICBmaWxsOiAnaW5oZXJpdCcsXG4gICAgfSxcbiAgICBtYXJnaW46IHtcbiAgICAgIHQ6IDEwLFxuICAgICAgbDogNTAsXG4gICAgICByOiAxMTUsXG4gICAgICBiOiAxNDAsXG4gICAgICBwYWQ6IDAsXG4gICAgICBhdXRvZXhwYW5kOiB0cnVlLFxuICAgIH0sXG4gICAgYmFybW9kZTogJ292ZXJsYXknLFxuICAgIHhheGlzOiB7XG4gICAgICBmaXhlZHJhbmdlOiB0cnVlLFxuICAgICAgY29sb3I6IGZvbnRDb2xvcixcbiAgICB9LFxuICAgIHlheGlzOiB7XG4gICAgICBmaXhlZHJhbmdlOiB0cnVlLFxuICAgICAgY29sb3I6IGZvbnRDb2xvcixcbiAgICB9LFxuICAgIHNob3dsZWdlbmQ6IHRydWUsXG4gICAgbGVnZW5kOiB7XG4gICAgICBmb250OiB7IGNvbG9yOiBmb250Q29sb3IgfSxcbiAgICB9LFxuICB9IGFzIGFueVxuICBpZiAocGxvdCkge1xuICAgIGJhc2VMYXlvdXQueGF4aXMuYXV0b3JhbmdlID0gZmFsc2VcbiAgICBiYXNlTGF5b3V0LnhheGlzLnJhbmdlID0gcGxvdC5fZnVsbExheW91dC54YXhpcy5yYW5nZVxuICAgIGJhc2VMYXlvdXQueWF4aXMucmFuZ2UgPSBwbG90Ll9mdWxsTGF5b3V0LnlheGlzLnJhbmdlXG4gICAgYmFzZUxheW91dC55YXhpcy5hdXRvcmFuZ2UgPSBmYWxzZVxuICB9XG4gIHJldHVybiBiYXNlTGF5b3V0XG59XG50eXBlIFByb3BzID0ge1xuICBzZWxlY3Rpb25JbnRlcmZhY2U6IGFueVxufVxuY29uc3QgZ2V0QXV0b2NvbXBsZXRlU3RhdGUgPSAoe1xuICBsYXp5UmVzdWx0cyxcbiAgYXR0cmlidXRlVG9CaW4sXG59OiB7XG4gIGxhenlSZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRzXG4gIGF0dHJpYnV0ZVRvQmluOiBhbnlcbn0pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBjaG9pY2VzOiBjYWxjdWxhdGVBdmFpbGFibGVBdHRyaWJ1dGVzKE9iamVjdC52YWx1ZXMobGF6eVJlc3VsdHMucmVzdWx0cykpLFxuICAgIHZhbHVlOiBhdHRyaWJ1dGVUb0JpbixcbiAgfVxufVxuZXhwb3J0IGNvbnN0IEhpc3RvZ3JhbSA9ICh7IHNlbGVjdGlvbkludGVyZmFjZSB9OiBQcm9wcykgPT4ge1xuICBjb25zdCB7IGxpc3RlblRvIH0gPSB1c2VCYWNrYm9uZSgpXG4gIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuICBjb25zdCBpc0RhcmtUaGVtZSA9IHRoZW1lLnBhbGV0dGUubW9kZSA9PT0gJ2RhcmsnXG4gIGNvbnN0IFtub01hdGNoaW5nRGF0YSwgc2V0Tm9NYXRjaGluZ0RhdGFdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IHBsb3RseVJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IHBsb3RseVJlYWR5Rm9yVXBkYXRlc1JlZiA9IFJlYWN0LnVzZVJlZihmYWxzZSlcbiAgY29uc3QgbGF6eVJlc3VsdHMgPSB1c2VMYXp5UmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2Uoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgY29uc3Qgc2VsZWN0ZWRSZXN1bHRzID0gdXNlU2VsZWN0ZWRSZXN1bHRzKHsgbGF6eVJlc3VsdHMgfSlcbiAgY29uc3QgW2F0dHJpYnV0ZVRvQmluLCBzZXRBdHRyaWJ1dGVUb0Jpbl0gPSBSZWFjdC51c2VTdGF0ZSgnJyBhcyBzdHJpbmcpXG4gIGNvbnN0IFthdXRvY29tcGxldGVTdGF0ZSwgc2V0QXV0b2NvbXBsZXRlU3RhdGVdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgZ2V0QXV0b2NvbXBsZXRlU3RhdGUoeyBsYXp5UmVzdWx0cywgYXR0cmlidXRlVG9CaW4gfSlcbiAgKVxuICBjb25zdCByZXN1bHRzID0gT2JqZWN0LnZhbHVlcyhsYXp5UmVzdWx0cy5yZXN1bHRzKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldE5vTWF0Y2hpbmdEYXRhKGZhbHNlKVxuICB9LCBbbGF6eVJlc3VsdHMucmVzdWx0cywgYXR0cmlidXRlVG9CaW5dKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldEF1dG9jb21wbGV0ZVN0YXRlKGdldEF1dG9jb21wbGV0ZVN0YXRlKHsgbGF6eVJlc3VsdHMsIGF0dHJpYnV0ZVRvQmluIH0pKVxuICB9LCBbbGF6eVJlc3VsdHMucmVzdWx0c10pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2hvd0hpc3RvZ3JhbSgpXG4gIH0sIFtsYXp5UmVzdWx0cy5yZXN1bHRzLCBhdHRyaWJ1dGVUb0JpbiwgdGhlbWVdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwbG90bHlSZWFkeUZvclVwZGF0ZXNSZWYuY3VycmVudCkge1xuICAgICAgLy8gYXZvaWQgdXBkYXRpbmcgdGhlIGhpc3RvZ3JhbSBpZiBpdCdzIG5vdCByZWFkeSB5ZXRcbiAgICAgIHVwZGF0ZUhpc3RvZ3JhbSgpXG4gICAgfVxuICB9LCBbc2VsZWN0ZWRSZXN1bHRzXSlcblxuICBjb25zdCBkZWZhdWx0Rm9udENvbG9yID0gaXNEYXJrVGhlbWUgPyAnd2hpdGUnIDogJ2JsYWNrJ1xuICBjb25zdCBkZWZhdWx0SG92ZXJMYWJlbCA9IHtcbiAgICBiZ2NvbG9yOiBpc0RhcmtUaGVtZSA/ICdibGFjaycgOiAnd2hpdGUnLFxuICAgIGZvbnQ6IHtcbiAgICAgIGNvbG9yOiBkZWZhdWx0Rm9udENvbG9yLFxuICAgIH0sXG4gIH1cblxuICBjb25zdCBnZXRDdXN0b21Ib3ZlckFycmF5ID0gKFxuICAgIGNhdGVnb3JpZXM6IGFueVtdLFxuICAgIHJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdXG4gICkgPT4ge1xuICAgIGNvbnN0IGN1c3RvbUFycmF5OiBDdXN0b21Ib3ZlcltdID0gW11cbiAgICBjYXRlZ29yaWVzLmZvckVhY2goKGNhdGVnb3J5KSA9PiB7XG4gICAgICBjb25zdCBtYXRjaGVkUmVzdWx0cyA9IGZpbmRNYXRjaGVzRm9yQXR0cmlidXRlVmFsdWVzKFxuICAgICAgICByZXN1bHRzLFxuICAgICAgICBhdHRyaWJ1dGVUb0JpbixcbiAgICAgICAgQXJyYXkuaXNBcnJheShjYXRlZ29yeSkgPyBjYXRlZ29yeSA6IFtjYXRlZ29yeV1cbiAgICAgIClcblxuICAgICAgaWYgKFxuICAgICAgICAobWF0Y2hlZFJlc3VsdHMgJiYgbWF0Y2hlZFJlc3VsdHMubGVuZ3RoID4gMCkgfHxcbiAgICAgICAgY3VzdG9tQXJyYXkubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIGN1c3RvbUFycmF5LnB1c2goZ2V0Q3VzdG9tSG92ZXIobWF0Y2hlZFJlc3VsdHMsIGRlZmF1bHRIb3ZlckxhYmVsKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBjdXN0b21BcnJheS5sZW5ndGggPiAwID8gY3VzdG9tQXJyYXkgOiB1bmRlZmluZWRcbiAgfVxuXG4gIGNvbnN0IGRldGVybWluZUluaXRpYWxEYXRhID0gKCk6IFBsb3RseS5EYXRhW10gPT4ge1xuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIHg6IGNhbGN1bGF0ZUF0dHJpYnV0ZUFycmF5KHtcbiAgICAgICAgICByZXN1bHRzLFxuICAgICAgICAgIGF0dHJpYnV0ZTogYXR0cmlidXRlVG9CaW4sXG4gICAgICAgIH0pLFxuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICB0eXBlOiAnaGlzdG9ncmFtJyxcbiAgICAgICAgbmFtZTogJ0hpdHMnLFxuICAgICAgICBtYXJrZXI6IHtcbiAgICAgICAgICBjb2xvcjogJ3JnYmEoMTIwLCAxMjAsIDEyMCwgLjA1KScsXG4gICAgICAgICAgbGluZToge1xuICAgICAgICAgICAgY29sb3I6ICdyZ2JhKDEyMCwxMjAsMTIwLC4yKScsXG4gICAgICAgICAgICB3aWR0aDogMixcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBob3ZlcnRlbXBsYXRlOiAnJXt5fSBIaXRzPGV4dHJhPjwvZXh0cmE+JyxcbiAgICAgICAgaG92ZXJsYWJlbDogZGVmYXVsdEhvdmVyTGFiZWwsXG4gICAgICB9LFxuICAgIF1cbiAgfVxuICBjb25zdCBkZXRlcm1pbmVEYXRhID0gKHBsb3Q6IGFueSk6IFBsb3RseS5EYXRhW10gPT4ge1xuICAgIGNvbnN0IGFjdGl2ZVJlc3VsdHMgPSByZXN1bHRzXG4gICAgY29uc3QgeGJpbnMgPSBfY2xvbmVEZWVwKHBsb3QuX2Z1bGxEYXRhWzBdLnhiaW5zKVxuICAgIGNvbnN0IGNhdGVnb3JpZXM6IGFueVtdID0gcmV0cmlldmVDYXRlZ29yaWVzRnJvbVBsb3RseSgpXG5cbiAgICBsZXQgY3VzdG9tSG92ZXJBcnJheTogYW55ID0gdW5kZWZpbmVkXG4gICAgbGV0IHNlbGVjdGVkQ3VzdG9tSG92ZXJBcnJheTogYW55ID0gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXh0ZW5zaW9uLmN1c3RvbUhpc3RvZ3JhbUhvdmVyKSB7XG4gICAgICBjdXN0b21Ib3ZlckFycmF5ID0gZ2V0Q3VzdG9tSG92ZXJBcnJheShjYXRlZ29yaWVzLCByZXN1bHRzKVxuICAgICAgc2VsZWN0ZWRDdXN0b21Ib3ZlckFycmF5ID0gZ2V0Q3VzdG9tSG92ZXJBcnJheShcbiAgICAgICAgY2F0ZWdvcmllcyxcbiAgICAgICAgT2JqZWN0LnZhbHVlcyhzZWxlY3RlZFJlc3VsdHMpXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgYmFzZUhvdmVyVGVtcGxhdGUgPSAnJXt5fSBIaXRzPGJyPiV7eH08ZXh0cmE+PC9leHRyYT4nXG5cbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICB4OiBjYWxjdWxhdGVBdHRyaWJ1dGVBcnJheSh7XG4gICAgICAgICAgcmVzdWx0czogYWN0aXZlUmVzdWx0cyxcbiAgICAgICAgICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZVRvQmluLFxuICAgICAgICB9KSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgdHlwZTogJ2hpc3RvZ3JhbScsXG4gICAgICAgIG5hbWU6ICdIaXRzJyxcbiAgICAgICAgbWFya2VyOiB7XG4gICAgICAgICAgY29sb3I6ICdyZ2JhKDEyMCwgMTIwLCAxMjAsIC4wNSknLFxuICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgxMjAsMTIwLDEyMCwuMiknLFxuICAgICAgICAgICAgd2lkdGg6IDIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgaG92ZXJsYWJlbDogY3VzdG9tSG92ZXJBcnJheVxuICAgICAgICAgID8gZ2V0Q3VzdG9tSG92ZXJMYWJlbHMoY3VzdG9tSG92ZXJBcnJheSlcbiAgICAgICAgICA6IGRlZmF1bHRIb3ZlckxhYmVsLFxuICAgICAgICBob3ZlcnRlbXBsYXRlOiBjdXN0b21Ib3ZlckFycmF5XG4gICAgICAgICAgPyBnZXRDdXN0b21Ib3ZlclRlbXBsYXRlcygnSGl0cycsIGN1c3RvbUhvdmVyQXJyYXkpXG4gICAgICAgICAgOiBiYXNlSG92ZXJUZW1wbGF0ZSxcbiAgICAgICAgYXV0b2Jpbng6IGZhbHNlLFxuICAgICAgICB4YmlucyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHg6IGNhbGN1bGF0ZUF0dHJpYnV0ZUFycmF5KHtcbiAgICAgICAgICByZXN1bHRzOiBPYmplY3QudmFsdWVzKHNlbGVjdGVkUmVzdWx0cyksXG4gICAgICAgICAgYXR0cmlidXRlOiBhdHRyaWJ1dGVUb0JpbixcbiAgICAgICAgfSksXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIHR5cGU6ICdoaXN0b2dyYW0nLFxuICAgICAgICBuYW1lOiAnU2VsZWN0ZWQnLFxuICAgICAgICBtYXJrZXI6IHtcbiAgICAgICAgICBjb2xvcjogJ3JnYmEoMTIwLCAxMjAsIDEyMCwgLjIpJyxcbiAgICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgICBjb2xvcjogJ3JnYmEoMTIwLDEyMCwxMjAsLjUpJyxcbiAgICAgICAgICAgIHdpZHRoOiAyLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGhvdmVybGFiZWw6IHNlbGVjdGVkQ3VzdG9tSG92ZXJBcnJheVxuICAgICAgICAgID8gZ2V0Q3VzdG9tSG92ZXJMYWJlbHMoc2VsZWN0ZWRDdXN0b21Ib3ZlckFycmF5KVxuICAgICAgICAgIDogZGVmYXVsdEhvdmVyTGFiZWwsXG4gICAgICAgIGhvdmVydGVtcGxhdGU6IHNlbGVjdGVkQ3VzdG9tSG92ZXJBcnJheVxuICAgICAgICAgID8gZ2V0Q3VzdG9tSG92ZXJUZW1wbGF0ZXMoJ1NlbGVjdGVkJywgc2VsZWN0ZWRDdXN0b21Ib3ZlckFycmF5KVxuICAgICAgICAgIDogYmFzZUhvdmVyVGVtcGxhdGUsXG4gICAgICAgIGF1dG9iaW54OiBmYWxzZSxcbiAgICAgICAgeGJpbnMsXG4gICAgICB9LFxuICAgIF1cbiAgfVxuICBjb25zdCBoYW5kbGVSZXNpemUgPSAoKSA9PiB7XG4gICAgaWYgKHBsb3RseVJlZi5jdXJyZW50KSB7XG4gICAgICBjb25zdCBoaXN0b2dyYW1FbGVtZW50ID0gcGxvdGx5UmVmLmN1cnJlbnRcbiAgICAgICQoaGlzdG9ncmFtRWxlbWVudCkuZmluZCgncmVjdC5kcmFnJykub2ZmKCdtb3VzZWRvd24nKVxuICAgICAgaWYgKChoaXN0b2dyYW1FbGVtZW50IGFzIGFueSkuX2NvbnRleHQpIHtcbiAgICAgICAgUGxvdGx5LlBsb3RzLnJlc2l6ZShoaXN0b2dyYW1FbGVtZW50KVxuICAgICAgfVxuICAgICAgJChoaXN0b2dyYW1FbGVtZW50KVxuICAgICAgICAuZmluZCgncmVjdC5kcmFnJylcbiAgICAgICAgLm9uKCdtb3VzZWRvd24nLCAoZXZlbnQ6IGFueSkgPT4ge1xuICAgICAgICAgIHNoaWZ0S2V5LmN1cnJlbnQgPSBldmVudC5zaGlmdEtleVxuICAgICAgICAgIG1ldGFLZXkuY3VycmVudCA9IGV2ZW50Lm1ldGFLZXlcbiAgICAgICAgICBjdHJsS2V5LmN1cnJlbnQgPSBldmVudC5jdHJsS2V5XG4gICAgICAgIH0pXG4gICAgfVxuICB9XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgaWQgPSAoTWF0aC5yYW5kb20oKSAqIDEwMCkudG9GaXhlZCgwKS50b1N0cmluZygpXG4gICAgbGlzdGVuVG8oKHdyZXFyIGFzIGFueSkudmVudCwgJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSlcbiAgICAkKHdpbmRvdykub24oYHJlc2l6ZS4ke2lkfWAsIGhhbmRsZVJlc2l6ZSlcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgJCh3aW5kb3cpLm9mZihgcmVzaXplLiR7aWR9YClcbiAgICB9XG4gIH0sIFtdKVxuICBjb25zdCBzaG93SGlzdG9ncmFtID0gKCkgPT4ge1xuICAgIHBsb3RseVJlYWR5Rm9yVXBkYXRlc1JlZi5jdXJyZW50ID0gZmFsc2VcbiAgICBpZiAocGxvdGx5UmVmLmN1cnJlbnQpIHtcbiAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA+IDAgJiYgYXR0cmlidXRlVG9CaW4pIHtcbiAgICAgICAgY29uc3QgaGlzdG9ncmFtRWxlbWVudCA9IHBsb3RseVJlZi5jdXJyZW50XG4gICAgICAgIGNvbnN0IGluaXRpYWxEYXRhID0gZGV0ZXJtaW5lSW5pdGlhbERhdGEoKVxuICAgICAgICBpZiAoKGluaXRpYWxEYXRhWzBdIGFzIGFueSkueC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBzZXROb01hdGNoaW5nRGF0YSh0cnVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIFBsb3RseS5uZXdQbG90KFxuICAgICAgICAgICAgaGlzdG9ncmFtRWxlbWVudCxcbiAgICAgICAgICAgIGluaXRpYWxEYXRhLFxuICAgICAgICAgICAgZ2V0TGF5b3V0KGRlZmF1bHRGb250Q29sb3IpLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBkaXNwbGF5TW9kZUJhcjogZmFsc2UsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgKS50aGVuKChwbG90OiBhbnkpID0+IHtcbiAgICAgICAgICAgIFBsb3RseS5uZXdQbG90KFxuICAgICAgICAgICAgICBoaXN0b2dyYW1FbGVtZW50LFxuICAgICAgICAgICAgICBkZXRlcm1pbmVEYXRhKHBsb3QpLFxuICAgICAgICAgICAgICBnZXRMYXlvdXQoZGVmYXVsdEZvbnRDb2xvciwgcGxvdCksXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TW9kZUJhcjogZmFsc2UsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGhhbmRsZVJlc2l6ZSgpXG4gICAgICAgICAgICBsaXN0ZW5Ub0hpc3RvZ3JhbSgpXG4gICAgICAgICAgICBwbG90bHlSZWFkeUZvclVwZGF0ZXNSZWYuY3VycmVudCA9IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbG90bHlSZWYuY3VycmVudC5pbm5lckhUTUwgPSAnJ1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBjb25zdCB1cGRhdGVIaXN0b2dyYW0gPSAoKSA9PiB7XG4gICAgaWYgKHBsb3RseVJlZi5jdXJyZW50KSB7XG4gICAgICBjb25zdCBoaXN0b2dyYW1FbGVtZW50ID0gcGxvdGx5UmVmLmN1cnJlbnRcbiAgICAgIGlmIChcbiAgICAgICAgaGlzdG9ncmFtRWxlbWVudCAhPT0gbnVsbCAmJlxuICAgICAgICBoaXN0b2dyYW1FbGVtZW50LmNoaWxkcmVuLmxlbmd0aCAhPT0gMCAmJlxuICAgICAgICBhdHRyaWJ1dGVUb0JpbiAmJlxuICAgICAgICByZXN1bHRzLmxlbmd0aCA+IDBcbiAgICAgICkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIFBsb3RseS5kZWxldGVUcmFjZXMoaGlzdG9ncmFtRWxlbWVudCwgMSlcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcignVW5hYmxlIHRvIGRlbGV0ZSB0cmFjZScsIGVycilcbiAgICAgICAgfVxuICAgICAgICBQbG90bHkuYWRkVHJhY2VzKGhpc3RvZ3JhbUVsZW1lbnQsIGRldGVybWluZURhdGEoaGlzdG9ncmFtRWxlbWVudClbMV0pXG4gICAgICAgIGhhbmRsZVJlc2l6ZSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoaXN0b2dyYW1FbGVtZW50LmlubmVySFRNTCA9ICcnXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHNlbGVjdEJldHdlZW4gPSAoZmlyc3RJbmRleDogbnVtYmVyLCBsYXN0SW5kZXg6IG51bWJlcikgPT4ge1xuICAgIGZvciAobGV0IGkgPSBmaXJzdEluZGV4OyBpIDw9IGxhc3RJbmRleDsgaSsrKSB7XG4gICAgICBpZiAocG9pbnRzU2VsZWN0ZWQuY3VycmVudC5pbmRleE9mKGkpID09PSAtMSkge1xuICAgICAgICBwb2ludHNTZWxlY3RlZC5jdXJyZW50LnB1c2goaSlcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgYXR0cmlidXRlVG9DaGVjayA9IGF0dHJpYnV0ZVRvQmluXG4gICAgY29uc3QgY2F0ZWdvcmllcyA9IHJldHJpZXZlQ2F0ZWdvcmllc0Zyb21QbG90bHkoKVxuICAgIGNvbnN0IHZhbGlkQ2F0ZWdvcmllcyA9IGNhdGVnb3JpZXMuc2xpY2UoZmlyc3RJbmRleCwgbGFzdEluZGV4KVxuICAgIGNvbnN0IGFjdGl2ZVNlYXJjaFJlc3VsdHMgPSByZXN1bHRzXG4gICAgY29uc3QgdmFsaWRSZXN1bHRzID0gdmFsaWRDYXRlZ29yaWVzLnJlZHVjZShcbiAgICAgIChyZXN1bHRzOiBhbnksIGNhdGVnb3J5OiBhbnkpID0+IHtcbiAgICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KFxuICAgICAgICAgIGZpbmRNYXRjaGVzRm9yQXR0cmlidXRlVmFsdWVzKFxuICAgICAgICAgICAgYWN0aXZlU2VhcmNoUmVzdWx0cyxcbiAgICAgICAgICAgIGF0dHJpYnV0ZVRvQ2hlY2ssXG4gICAgICAgICAgICBBcnJheS5pc0FycmF5KGNhdGVnb3J5KSA/IGNhdGVnb3J5IDogW2NhdGVnb3J5XVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gcmVzdWx0c1xuICAgICAgfSxcbiAgICAgIFtdIGFzIExhenlRdWVyeVJlc3VsdFtdXG4gICAgKSBhcyBMYXp5UXVlcnlSZXN1bHRbXVxuICAgIHZhbGlkUmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgIHJlc3VsdC5zZXRTZWxlY3RlZCh0cnVlKVxuICAgIH0pXG4gIH1cbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG4gIGNvbnN0IHJldHJpZXZlQ2F0ZWdvcmllc0Zyb21QbG90bHlGb3JEYXRlcyA9ICgpID0+IHtcbiAgICBpZiAocGxvdGx5UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IGhpc3RvZ3JhbUVsZW1lbnQgPSBwbG90bHlSZWYuY3VycmVudFxuICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IFtdXG4gICAgICBjb25zdCB4YmlucyA9IChoaXN0b2dyYW1FbGVtZW50IGFzIGFueSkuX2Z1bGxEYXRhWzBdLnhiaW5zXG4gICAgICBjb25zdCBtaW4gPSB4Ymlucy5zdGFydFxuICAgICAgY29uc3QgbWF4ID0gcGFyc2VJbnQobW9tZW50KHhiaW5zLmVuZCkuZm9ybWF0KCd4JykpXG4gICAgICBsZXQgc3RhcnQgPSBwYXJzZUludChtb21lbnQobWluKS5mb3JtYXQoJ3gnKSlcbiAgICAgIGNvbnN0IGluTW9udGhzID0geGJpbnMuc2l6ZS5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nXG4gICAgICBjb25zdCBiaW5TaXplID0gaW5Nb250aHMgPyBwYXJzZUludCh4Ymlucy5zaXplLnN1YnN0cmluZygxKSkgOiB4Ymlucy5zaXplXG4gICAgICB3aGlsZSAoc3RhcnQgPCBtYXgpIHtcbiAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gbW9tZW50KHN0YXJ0KS5mb3JtYXQocGxvdGx5RGF0ZUZvcm1hdClcbiAgICAgICAgY29uc3QgZW5kRGF0ZSA9IGluTW9udGhzXG4gICAgICAgICAgPyBtb21lbnQoc3RhcnQpLmFkZChiaW5TaXplLCAnbW9udGhzJykuZm9ybWF0KHBsb3RseURhdGVGb3JtYXQpXG4gICAgICAgICAgOiBtb21lbnQoc3RhcnQpLmFkZChiaW5TaXplLCAnbXMnKS5mb3JtYXQocGxvdGx5RGF0ZUZvcm1hdClcbiAgICAgICAgY2F0ZWdvcmllcy5wdXNoKFtzdGFydERhdGUsIGVuZERhdGVdKVxuICAgICAgICBzdGFydCA9IHBhcnNlSW50KFxuICAgICAgICAgIGluTW9udGhzXG4gICAgICAgICAgICA/IG1vbWVudChzdGFydCkuYWRkKGJpblNpemUsICdtb250aHMnKS5mb3JtYXQoJ3gnKVxuICAgICAgICAgICAgOiBtb21lbnQoc3RhcnQpLmFkZChiaW5TaXplLCAnbXMnKS5mb3JtYXQoJ3gnKVxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gY2F0ZWdvcmllc1xuICAgIH1cbiAgfVxuICAvLyBUaGlzIGlzIGFuIGludGVybmFsIHZhcmlhYmxlIGZvciBQbG90bHksIHNvIGl0IG1pZ2h0IGJyZWFrIGlmIHdlIHVwZGF0ZSBQbG90bHkgaW4gdGhlIGZ1dHVyZS5cbiAgLy8gUmVnYXJkbGVzcywgdGhlcmUgd2FzIG5vIG90aGVyIHdheSB0byByZWxpYWJseSBnZXQgdGhlIGNhdGVnb3JpZXMuXG4gIGNvbnN0IHJldHJpZXZlQ2F0ZWdvcmllc0Zyb21QbG90bHkgPSAoKSA9PiB7XG4gICAgaWYgKHBsb3RseVJlZi5jdXJyZW50KSB7XG4gICAgICBjb25zdCBoaXN0b2dyYW1FbGVtZW50ID0gcGxvdGx5UmVmLmN1cnJlbnRcbiAgICAgIGNvbnN0IHhheGlzID0gKGhpc3RvZ3JhbUVsZW1lbnQgYXMgYW55KS5fZnVsbExheW91dC54YXhpc1xuICAgICAgc3dpdGNoICh4YXhpcy50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2NhdGVnb3J5JzpcbiAgICAgICAgICByZXR1cm4geGF4aXMuX2NhdGVnb3JpZXNcbiAgICAgICAgY2FzZSAnZGF0ZSc6XG4gICAgICAgICAgcmV0dXJuIHJldHJpZXZlQ2F0ZWdvcmllc0Zyb21QbG90bHlGb3JEYXRlcygpXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc3QgeGJpbnMgPSAoaGlzdG9ncmFtRWxlbWVudCBhcyBhbnkpLl9mdWxsRGF0YVswXS54Ymluc1xuICAgICAgICAgIGNvbnN0IG1pbiA9IHhiaW5zLnN0YXJ0XG4gICAgICAgICAgY29uc3QgbWF4ID0geGJpbnMuZW5kXG4gICAgICAgICAgY29uc3QgYmluU2l6ZSA9IHhiaW5zLnNpemVcbiAgICAgICAgICBjb25zdCBjYXRlZ29yaWVzID0gW11cbiAgICAgICAgICB2YXIgc3RhcnQgPSBtaW5cbiAgICAgICAgICB3aGlsZSAoc3RhcnQgPCBtYXgpIHtcbiAgICAgICAgICAgIGNhdGVnb3JpZXMucHVzaChbc3RhcnQsIHN0YXJ0ICsgYmluU2l6ZV0pXG4gICAgICAgICAgICBzdGFydCArPSBiaW5TaXplXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjYXRlZ29yaWVzXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IGhhbmRsZUNvbnRyb2xDbGljayA9IChkYXRhOiBhbnksIGFscmVhZHlTZWxlY3RlZDogYm9vbGVhbikgPT4ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZVRvQ2hlY2sgPSBhdHRyaWJ1dGVUb0JpblxuICAgIGNvbnN0IGNhdGVnb3JpZXMgPSByZXRyaWV2ZUNhdGVnb3JpZXNGcm9tUGxvdGx5KClcbiAgICBjb25zdCBtYXRjaGVkUmVzdWx0cyA9IGZpbmRNYXRjaGVzRm9yQXR0cmlidXRlVmFsdWVzKFxuICAgICAgcmVzdWx0cyxcbiAgICAgIGF0dHJpYnV0ZVRvQ2hlY2ssXG4gICAgICBnZXRWYWx1ZUZyb21DbGljayhkYXRhLCBjYXRlZ29yaWVzKVxuICAgIClcbiAgICBpZiAoYWxyZWFkeVNlbGVjdGVkKSB7XG4gICAgICBtYXRjaGVkUmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgcmVzdWx0LnNldFNlbGVjdGVkKGZhbHNlKVxuICAgICAgfSlcbiAgICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnQuc3BsaWNlKFxuICAgICAgICBwb2ludHNTZWxlY3RlZC5jdXJyZW50LmluZGV4T2YoZ2V0SW5kZXhDbGlja2VkKGRhdGEpKSxcbiAgICAgICAgMVxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICBtYXRjaGVkUmVzdWx0cy5mb3JFYWNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgcmVzdWx0LnNldFNlbGVjdGVkKHRydWUpXG4gICAgICB9KVxuICAgICAgcG9pbnRzU2VsZWN0ZWQuY3VycmVudC5wdXNoKGdldEluZGV4Q2xpY2tlZChkYXRhKSlcbiAgICB9XG4gIH1cbiAgY29uc3QgaGFuZGxlU2hpZnRDbGljayA9IChkYXRhOiBhbnkpID0+IHtcbiAgICBjb25zdCBpbmRleENsaWNrZWQgPSBnZXRJbmRleENsaWNrZWQoZGF0YSlcbiAgICBjb25zdCBmaXJzdEluZGV4ID1cbiAgICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnQubGVuZ3RoID09PSAwXG4gICAgICAgID8gLTFcbiAgICAgICAgOiBwb2ludHNTZWxlY3RlZC5jdXJyZW50LnJlZHVjZShcbiAgICAgICAgICAgIChjdXJyZW50TWluLCBwb2ludCkgPT4gTWF0aC5taW4oY3VycmVudE1pbiwgcG9pbnQpLFxuICAgICAgICAgICAgcG9pbnRzU2VsZWN0ZWQuY3VycmVudFswXVxuICAgICAgICAgIClcbiAgICBjb25zdCBsYXN0SW5kZXggPVxuICAgICAgcG9pbnRzU2VsZWN0ZWQuY3VycmVudC5sZW5ndGggPT09IDBcbiAgICAgICAgPyAtMVxuICAgICAgICA6IHBvaW50c1NlbGVjdGVkLmN1cnJlbnQucmVkdWNlKFxuICAgICAgICAgICAgKGN1cnJlbnRNaW4sIHBvaW50KSA9PiBNYXRoLm1heChjdXJyZW50TWluLCBwb2ludCksXG4gICAgICAgICAgICBwb2ludHNTZWxlY3RlZC5jdXJyZW50WzBdXG4gICAgICAgICAgKVxuICAgIGlmIChmaXJzdEluZGV4ID09PSAtMSAmJiBsYXN0SW5kZXggPT09IC0xKSB7XG4gICAgICBsYXp5UmVzdWx0cy5kZXNlbGVjdCgpXG4gICAgICBoYW5kbGVDb250cm9sQ2xpY2soZGF0YSwgZmFsc2UpXG4gICAgfSBlbHNlIGlmIChpbmRleENsaWNrZWQgPD0gZmlyc3RJbmRleCkge1xuICAgICAgc2VsZWN0QmV0d2VlbihpbmRleENsaWNrZWQsIGZpcnN0SW5kZXgpXG4gICAgfSBlbHNlIGlmIChpbmRleENsaWNrZWQgPj0gbGFzdEluZGV4KSB7XG4gICAgICBzZWxlY3RCZXR3ZWVuKGxhc3RJbmRleCwgaW5kZXhDbGlja2VkICsgMSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0QmV0d2VlbihmaXJzdEluZGV4LCBpbmRleENsaWNrZWQgKyAxKVxuICAgIH1cbiAgfVxuICBjb25zdCBwbG90bHlDbGlja0hhbmRsZXIgPSAoZGF0YTogYW55KSA9PiB7XG4gICAgY29uc3QgaW5kZXhDbGlja2VkID0gZ2V0SW5kZXhDbGlja2VkKGRhdGEpXG4gICAgY29uc3QgYWxyZWFkeVNlbGVjdGVkID0gcG9pbnRzU2VsZWN0ZWQuY3VycmVudC5pbmRleE9mKGluZGV4Q2xpY2tlZCkgPj0gMFxuICAgIGlmIChzaGlmdEtleS5jdXJyZW50KSB7XG4gICAgICBoYW5kbGVTaGlmdENsaWNrKGRhdGEpXG4gICAgfSBlbHNlIGlmIChjdHJsS2V5LmN1cnJlbnQgfHwgbWV0YUtleS5jdXJyZW50KSB7XG4gICAgICBoYW5kbGVDb250cm9sQ2xpY2soZGF0YSwgYWxyZWFkeVNlbGVjdGVkKVxuICAgIH0gZWxzZSB7XG4gICAgICBsYXp5UmVzdWx0cy5kZXNlbGVjdCgpXG4gICAgICByZXNldFBvaW50U2VsZWN0aW9uKClcbiAgICAgIGhhbmRsZUNvbnRyb2xDbGljayhkYXRhLCBhbHJlYWR5U2VsZWN0ZWQpXG4gICAgfVxuICAgIHJlc2V0S2V5VHJhY2tpbmcoKVxuICB9XG4gIGNvbnN0IGxpc3RlblRvSGlzdG9ncmFtID0gKCkgPT4ge1xuICAgIGlmIChwbG90bHlSZWYuY3VycmVudCkge1xuICAgICAgY29uc3QgaGlzdG9ncmFtRWxlbWVudCA9IHBsb3RseVJlZi5jdXJyZW50XG4gICAgICA7KGhpc3RvZ3JhbUVsZW1lbnQgYXMgYW55KS5fZXYuYWRkTGlzdGVuZXIoXG4gICAgICAgICdwbG90bHlfY2xpY2snLFxuICAgICAgICBwbG90bHlDbGlja0hhbmRsZXJcbiAgICAgIClcbiAgICB9XG4gIH1cbiAgY29uc3Qgc2hpZnRLZXkgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IG1ldGFLZXkgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IGN0cmxLZXkgPSBSZWFjdC51c2VSZWYoZmFsc2UpXG4gIGNvbnN0IHBvaW50c1NlbGVjdGVkID0gUmVhY3QudXNlUmVmKFtdIGFzIG51bWJlcltdKVxuICBjb25zdCByZXNldEtleVRyYWNraW5nID0gKCkgPT4ge1xuICAgIHNoaWZ0S2V5LmN1cnJlbnQgPSBmYWxzZVxuICAgIG1ldGFLZXkuY3VycmVudCA9IGZhbHNlXG4gICAgY3RybEtleS5jdXJyZW50ID0gZmFsc2VcbiAgfVxuICBjb25zdCByZXNldFBvaW50U2VsZWN0aW9uID0gKCkgPT4ge1xuICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnQgPSBbXVxuICB9XG4gIGlmIChPYmplY3Qua2V5cyhsYXp5UmVzdWx0cy5yZXN1bHRzKS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMjBweCcgfX0+Tm8gcmVzdWx0cyBmb3VuZDwvZGl2PlxuICB9XG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0yXCI+XG4gICAgICAgIDxBdXRvY29tcGxldGVcbiAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgIG9wdGlvbnM9e2F1dG9jb21wbGV0ZVN0YXRlLmNob2ljZXN9XG4gICAgICAgICAgb25DaGFuZ2U9eyhfZTogYW55LCBuZXdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgc2V0QXR0cmlidXRlVG9CaW4obmV3VmFsdWUudmFsdWUpXG4gICAgICAgICAgfX1cbiAgICAgICAgICBpc09wdGlvbkVxdWFsVG9WYWx1ZT17KG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBhdHRyaWJ1dGVUb0Jpbn1cbiAgICAgICAgICBnZXRPcHRpb25MYWJlbD17KG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbi5sYWJlbFxuICAgICAgICAgIH19XG4gICAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICAgIHZhbHVlPXthdXRvY29tcGxldGVTdGF0ZS5jaG9pY2VzLmZpbmQoXG4gICAgICAgICAgICAoY2hvaWNlKSA9PiBjaG9pY2UudmFsdWUgPT09IGF0dHJpYnV0ZVRvQmluXG4gICAgICAgICAgKX1cbiAgICAgICAgICByZW5kZXJJbnB1dD17KHBhcmFtcykgPT4gKFxuICAgICAgICAgICAgPFRleHRGaWVsZCB7Li4ucGFyYW1zfSBsYWJlbD1cIkdyb3VwIGJ5XCIgdmFyaWFudD1cIm91dGxpbmVkXCIgLz5cbiAgICAgICAgICApfVxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cInBsb3RseS1oaXN0b2dyYW1cIlxuICAgICAgICByZWY9e3Bsb3RseVJlZiBhcyBhbnl9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgaGVpZ2h0OiAnY2FsYygxMDAlIC0gMTM1cHgpJyxcbiAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgIGRpc3BsYXk6IG5vTWF0Y2hpbmdEYXRhID8gJ25vbmUnIDogJ2Jsb2NrJyxcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgICB7bm9NYXRjaGluZ0RhdGEgPyAoXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzIwcHgnIH19PlxuICAgICAgICAgIE5vIGRhdGEgaW4gdGhpcyByZXN1bHQgc2V0IGhhcyB0aGF0IGF0dHJpYnV0ZVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvPlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBIaXN0b2dyYW1cbiJdfQ==