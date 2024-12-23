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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9ncmFtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL2hpc3RvZ3JhbS9oaXN0b2dyYW0udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLE1BQU0saUNBQWlDLENBQUE7QUFHdEYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJDQUEyQyxDQUFBO0FBQ3ZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHlDQUF5QyxDQUFBO0FBQzVFLE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sVUFBVSxNQUFNLGtCQUFrQixDQUFBO0FBQ3pDLE9BQU8sS0FBSyxNQUFNLG1CQUFtQixDQUFBO0FBQ3JDLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsbUpBQW1KO0FBQ25KLE9BQU8sTUFBTSxNQUFNLHVCQUF1QixDQUFBO0FBQzFDLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQTtBQUMzQixPQUFPLFNBQVMsTUFBTSwyQkFBMkIsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDL0MsT0FBTyxFQUVMLG9CQUFvQixFQUNwQix1QkFBdUIsRUFDdkIsY0FBYyxHQUNmLE1BQU0sa0JBQWtCLENBQUE7QUFDekIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUNBQW1DLENBQUE7QUFDcEUsSUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFBO0FBQy9CLElBQU0sZ0JBQWdCLEdBQUcs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REFFekIsQ0FDUCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ1AsQ0FDSixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgeyB1c2VMYXp5UmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2UgfSBmcm9tICcuLi8uLi9zZWxlY3Rpb24taW50ZXJmYWNlL2hvb2tzJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0cyB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL0xhenlRdWVyeVJlc3VsdC9MYXp5UXVlcnlSZXN1bHRzJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IHVzZUJhY2tib25lIH0gZnJvbSAnLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyB1c2VTZWxlY3RlZFJlc3VsdHMgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvaG9va3MnXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQXV0b2NvbXBsZXRlJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmltcG9ydCBfY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC5jbG9uZWRlZXAnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vLi4vLi4vanMvd3JlcXInXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAncGxvdC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgUGxvdGx5IGZyb20gJ3Bsb3RseS5qcy9kaXN0L3Bsb3RseSdcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50J1xuaW1wb3J0IGV4dGVuc2lvbiBmcm9tICcuLi8uLi8uLi9leHRlbnNpb24tcG9pbnRzJ1xuaW1wb3J0IHsgdXNlVGhlbWUgfSBmcm9tICdAbXVpL21hdGVyaWFsL3N0eWxlcydcbmltcG9ydCB7XG4gIEN1c3RvbUhvdmVyLFxuICBnZXRDdXN0b21Ib3ZlckxhYmVscyxcbiAgZ2V0Q3VzdG9tSG92ZXJUZW1wbGF0ZXMsXG4gIGdldEN1c3RvbUhvdmVyLFxufSBmcm9tICcuL2FkZC1vbi1oZWxwZXJzJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmNvbnN0IHplcm9XaWR0aFNwYWNlID0gJ1xcdTIwMEInXG5jb25zdCBwbG90bHlEYXRlRm9ybWF0ID0gJ1lZWVktTU0tREQgSEg6bW06c3MuU1MnXG5mdW5jdGlvbiBnZXRQbG90bHlEYXRlKGRhdGU6IHN0cmluZykge1xuICByZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdChwbG90bHlEYXRlRm9ybWF0KVxufVxuZnVuY3Rpb24gY2FsY3VsYXRlQXZhaWxhYmxlQXR0cmlidXRlcyhyZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXSkge1xuICBsZXQgYXZhaWxhYmxlQXR0cmlidXRlcyA9IFtdIGFzIHN0cmluZ1tdXG4gIHJlc3VsdHMuZm9yRWFjaCgocmVzdWx0KSA9PiB7XG4gICAgYXZhaWxhYmxlQXR0cmlidXRlcyA9IF8udW5pb24oXG4gICAgICBhdmFpbGFibGVBdHRyaWJ1dGVzLFxuICAgICAgT2JqZWN0LmtleXMocmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMpXG4gICAgKVxuICB9KVxuICByZXR1cm4gYXZhaWxhYmxlQXR0cmlidXRlc1xuICAgIC5maWx0ZXIoXG4gICAgICAoYXR0cmlidXRlKSA9PlxuICAgICAgICAhU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmlzSGlkZGVuQXR0cmlidXRlKGF0dHJpYnV0ZSlcbiAgICApXG4gICAgLm1hcCgoYXR0cmlidXRlKSA9PiAoe1xuICAgICAgbGFiZWw6IFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBbGlhcyhhdHRyaWJ1dGUpLFxuICAgICAgdmFsdWU6IGF0dHJpYnV0ZSxcbiAgICB9KSlcbn1cbmZ1bmN0aW9uIGNhbGN1bGF0ZUF0dHJpYnV0ZUFycmF5KHtcbiAgcmVzdWx0cyxcbiAgYXR0cmlidXRlLFxufToge1xuICByZXN1bHRzOiBMYXp5UXVlcnlSZXN1bHRbXVxuICBhdHRyaWJ1dGU6IHN0cmluZ1xufSkge1xuICBjb25zdCB2YWx1ZXMgPSBbXSBhcyBzdHJpbmdbXVxuICByZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgIGlmIChcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVthdHRyaWJ1dGVdXG4gICAgICAgIC5tdWx0aXZhbHVlZFxuICAgICkge1xuICAgICAgY29uc3QgcmVzdWx0VmFsdWVzID0gcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cmlidXRlXVxuICAgICAgaWYgKHJlc3VsdFZhbHVlcyAmJiByZXN1bHRWYWx1ZXMuZm9yRWFjaCkge1xuICAgICAgICByZXN1bHRWYWx1ZXMuZm9yRWFjaCgodmFsdWU6IGFueSkgPT4ge1xuICAgICAgICAgIGFkZFZhbHVlRm9yQXR0cmlidXRlVG9BcnJheSh7IHZhbHVlQXJyYXk6IHZhbHVlcywgYXR0cmlidXRlLCB2YWx1ZSB9KVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWRkVmFsdWVGb3JBdHRyaWJ1dGVUb0FycmF5KHtcbiAgICAgICAgICB2YWx1ZUFycmF5OiB2YWx1ZXMsXG4gICAgICAgICAgYXR0cmlidXRlLFxuICAgICAgICAgIHZhbHVlOiByZXN1bHRWYWx1ZXMsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGFkZFZhbHVlRm9yQXR0cmlidXRlVG9BcnJheSh7XG4gICAgICAgIHZhbHVlQXJyYXk6IHZhbHVlcyxcbiAgICAgICAgYXR0cmlidXRlLFxuICAgICAgICB2YWx1ZTogcmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cmlidXRlXSxcbiAgICAgIH0pXG4gICAgfVxuICB9KVxuICByZXR1cm4gdmFsdWVzXG59XG5mdW5jdGlvbiBmaW5kTWF0Y2hlc0ZvckF0dHJpYnV0ZVZhbHVlcyhcbiAgcmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0W10sXG4gIGF0dHJpYnV0ZTogc3RyaW5nLFxuICB2YWx1ZXM6IGFueVtdXG4pIHtcbiAgcmV0dXJuIHJlc3VsdHMuZmlsdGVyKChyZXN1bHQpID0+IHtcbiAgICBpZiAoXG4gICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClbYXR0cmlidXRlXVxuICAgICAgICAubXVsdGl2YWx1ZWRcbiAgICApIHtcbiAgICAgIGNvbnN0IHJlc3VsdFZhbHVlcyA9IHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW2F0dHJpYnV0ZV1cbiAgICAgIGlmIChyZXN1bHRWYWx1ZXMgJiYgcmVzdWx0VmFsdWVzLmZvckVhY2gpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRWYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoY2hlY2tJZlZhbHVlSXNWYWxpZCh2YWx1ZXMsIGF0dHJpYnV0ZSwgcmVzdWx0VmFsdWVzW2ldKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY2hlY2tJZlZhbHVlSXNWYWxpZCh2YWx1ZXMsIGF0dHJpYnV0ZSwgcmVzdWx0VmFsdWVzKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2hlY2tJZlZhbHVlSXNWYWxpZChcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICBhdHRyaWJ1dGUsXG4gICAgICAgIHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW2F0dHJpYnV0ZV1cbiAgICAgIClcbiAgICB9XG4gIH0pXG59XG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAzMCkgRklYTUU6IE5vdCBhbGwgY29kZSBwYXRocyByZXR1cm4gYSB2YWx1ZS5cbmZ1bmN0aW9uIGNoZWNrSWZWYWx1ZUlzVmFsaWQodmFsdWVzOiBhbnlbXSwgYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICBzd2l0Y2ggKFxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2F0dHJpYnV0ZV0udHlwZVxuICAgICkge1xuICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgIGNvbnN0IHBsb3RseURhdGUgPSBnZXRQbG90bHlEYXRlKHZhbHVlKVxuICAgICAgICByZXR1cm4gcGxvdGx5RGF0ZSA+PSB2YWx1ZXNbMF0gJiYgcGxvdGx5RGF0ZSA8PSB2YWx1ZXNbMV1cbiAgICAgIGNhc2UgJ0JPT0xFQU4nOlxuICAgICAgY2FzZSAnU1RSSU5HJzpcbiAgICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgICAgcmV0dXJuIHZhbHVlcy5pbmRleE9mKHZhbHVlLnRvU3RyaW5nKCkgKyB6ZXJvV2lkdGhTcGFjZSkgPj0gMFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHZhbHVlID49IHZhbHVlc1swXSAmJiB2YWx1ZSA8PSB2YWx1ZXNbMV1cbiAgICB9XG4gIH1cbn1cbmZ1bmN0aW9uIGFkZFZhbHVlRm9yQXR0cmlidXRlVG9BcnJheSh7XG4gIHZhbHVlQXJyYXksXG4gIGF0dHJpYnV0ZSxcbiAgdmFsdWUsXG59OiB7XG4gIHZhbHVlQXJyYXk6IGFueVtdXG4gIGF0dHJpYnV0ZTogc3RyaW5nXG4gIHZhbHVlOiBhbnlcbn0pIHtcbiAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICBzd2l0Y2ggKFxuICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2F0dHJpYnV0ZV0udHlwZVxuICAgICkge1xuICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgIHZhbHVlQXJyYXkucHVzaChnZXRQbG90bHlEYXRlKHZhbHVlKSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ0JPT0xFQU4nOlxuICAgICAgY2FzZSAnU1RSSU5HJzpcbiAgICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgICAgdmFsdWVBcnJheS5wdXNoKHZhbHVlLnRvU3RyaW5nKCkgKyB6ZXJvV2lkdGhTcGFjZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhbHVlQXJyYXkucHVzaChwYXJzZUZsb2F0KHZhbHVlKSlcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbn1cbmZ1bmN0aW9uIGdldEluZGV4Q2xpY2tlZChkYXRhOiBhbnkpIHtcbiAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KFxuICAgIHVuZGVmaW5lZCxcbiAgICBkYXRhLnBvaW50cy5tYXAoKHBvaW50OiBhbnkpID0+IHBvaW50LnBvaW50TnVtYmVyKVxuICApIGFzIG51bWJlclxufVxuZnVuY3Rpb24gZ2V0VmFsdWVGcm9tQ2xpY2soZGF0YTogYW55LCBjYXRlZ29yaWVzOiBhbnkpIHtcbiAgc3dpdGNoIChkYXRhLnBvaW50c1swXS54YXhpcy50eXBlKSB7XG4gICAgY2FzZSAnY2F0ZWdvcnknOlxuICAgICAgcmV0dXJuIFtkYXRhLnBvaW50c1swXS54XVxuICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgY29uc3QgY3VycmVudERhdGUgPSBtb21lbnQoZGF0YS5wb2ludHNbMF0ueCkuZm9ybWF0KHBsb3RseURhdGVGb3JtYXQpXG4gICAgICByZXR1cm4gXy5maW5kKGNhdGVnb3JpZXMsIChjYXRlZ29yeTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiBjdXJyZW50RGF0ZSA+PSBjYXRlZ29yeVswXSAmJiBjdXJyZW50RGF0ZSA8PSBjYXRlZ29yeVsxXVxuICAgICAgfSlcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIF8uZmluZChjYXRlZ29yaWVzLCAoY2F0ZWdvcnk6IGFueSkgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIGRhdGEucG9pbnRzWzBdLnggPj0gY2F0ZWdvcnlbMF0gJiYgZGF0YS5wb2ludHNbMF0ueCA8PSBjYXRlZ29yeVsxXVxuICAgICAgICApXG4gICAgICB9KVxuICB9XG59XG5mdW5jdGlvbiBnZXRMYXlvdXQoZm9udENvbG9yOiBzdHJpbmcsIHBsb3Q/OiBhbnkpIHtcbiAgY29uc3QgYmFzZUxheW91dCA9IHtcbiAgICBhdXRvc2l6ZTogdHJ1ZSxcbiAgICBwYXBlcl9iZ2NvbG9yOiAncmdiYSgwLDAsMCwwKScsXG4gICAgcGxvdF9iZ2NvbG9yOiAncmdiYSgwLDAsMCwwKScsXG4gICAgZm9udDoge1xuICAgICAgZmFtaWx5OiAnXCJPcGVuIFNhbnMgTGlnaHRcIixcIkhlbHZldGljYSBOZXVlXCIsSGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWYnLFxuICAgICAgc2l6ZTogMTYsXG4gICAgICBjb2xvcjogJ2luaGVyaXQnLFxuICAgICAgZmlsbDogJ2luaGVyaXQnLFxuICAgIH0sXG4gICAgbWFyZ2luOiB7XG4gICAgICB0OiAxMCxcbiAgICAgIGw6IDUwLFxuICAgICAgcjogMTE1LFxuICAgICAgYjogMTQwLFxuICAgICAgcGFkOiAwLFxuICAgICAgYXV0b2V4cGFuZDogdHJ1ZSxcbiAgICB9LFxuICAgIGJhcm1vZGU6ICdvdmVybGF5JyxcbiAgICB4YXhpczoge1xuICAgICAgZml4ZWRyYW5nZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiBmb250Q29sb3IsXG4gICAgfSxcbiAgICB5YXhpczoge1xuICAgICAgZml4ZWRyYW5nZTogdHJ1ZSxcbiAgICAgIGNvbG9yOiBmb250Q29sb3IsXG4gICAgfSxcbiAgICBzaG93bGVnZW5kOiB0cnVlLFxuICAgIGxlZ2VuZDoge1xuICAgICAgZm9udDogeyBjb2xvcjogZm9udENvbG9yIH0sXG4gICAgfSxcbiAgfSBhcyBhbnlcbiAgaWYgKHBsb3QpIHtcbiAgICBiYXNlTGF5b3V0LnhheGlzLmF1dG9yYW5nZSA9IGZhbHNlXG4gICAgYmFzZUxheW91dC54YXhpcy5yYW5nZSA9IHBsb3QuX2Z1bGxMYXlvdXQueGF4aXMucmFuZ2VcbiAgICBiYXNlTGF5b3V0LnlheGlzLnJhbmdlID0gcGxvdC5fZnVsbExheW91dC55YXhpcy5yYW5nZVxuICAgIGJhc2VMYXlvdXQueWF4aXMuYXV0b3JhbmdlID0gZmFsc2VcbiAgfVxuICByZXR1cm4gYmFzZUxheW91dFxufVxudHlwZSBQcm9wcyA9IHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbn1cbmNvbnN0IGdldEF1dG9jb21wbGV0ZVN0YXRlID0gKHtcbiAgbGF6eVJlc3VsdHMsXG4gIGF0dHJpYnV0ZVRvQmluLFxufToge1xuICBsYXp5UmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0c1xuICBhdHRyaWJ1dGVUb0JpbjogYW55XG59KSA9PiB7XG4gIHJldHVybiB7XG4gICAgY2hvaWNlczogY2FsY3VsYXRlQXZhaWxhYmxlQXR0cmlidXRlcyhPYmplY3QudmFsdWVzKGxhenlSZXN1bHRzLnJlc3VsdHMpKSxcbiAgICB2YWx1ZTogYXR0cmlidXRlVG9CaW4sXG4gIH1cbn1cbmV4cG9ydCBjb25zdCBIaXN0b2dyYW0gPSAoeyBzZWxlY3Rpb25JbnRlcmZhY2UgfTogUHJvcHMpID0+IHtcbiAgY29uc3QgeyBsaXN0ZW5UbyB9ID0gdXNlQmFja2JvbmUoKVxuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKClcbiAgY29uc3QgaXNEYXJrVGhlbWUgPSB0aGVtZS5wYWxldHRlLm1vZGUgPT09ICdkYXJrJ1xuICBjb25zdCBbbm9NYXRjaGluZ0RhdGEsIHNldE5vTWF0Y2hpbmdEYXRhXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBwbG90bHlSZWYgPSBSZWFjdC51c2VSZWY8SFRNTERpdkVsZW1lbnQ+KClcbiAgY29uc3QgcGxvdGx5UmVhZHlGb3JVcGRhdGVzUmVmID0gUmVhY3QudXNlUmVmKGZhbHNlKVxuICBjb25zdCBsYXp5UmVzdWx0cyA9IHVzZUxhenlSZXN1bHRzRnJvbVNlbGVjdGlvbkludGVyZmFjZSh7XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuICBjb25zdCBzZWxlY3RlZFJlc3VsdHMgPSB1c2VTZWxlY3RlZFJlc3VsdHMoeyBsYXp5UmVzdWx0cyB9KVxuICBjb25zdCBbYXR0cmlidXRlVG9CaW4sIHNldEF0dHJpYnV0ZVRvQmluXSA9IFJlYWN0LnVzZVN0YXRlKCcnIGFzIHN0cmluZylcbiAgY29uc3QgW2F1dG9jb21wbGV0ZVN0YXRlLCBzZXRBdXRvY29tcGxldGVTdGF0ZV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBnZXRBdXRvY29tcGxldGVTdGF0ZSh7IGxhenlSZXN1bHRzLCBhdHRyaWJ1dGVUb0JpbiB9KVxuICApXG4gIGNvbnN0IHJlc3VsdHMgPSBPYmplY3QudmFsdWVzKGxhenlSZXN1bHRzLnJlc3VsdHMpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0Tm9NYXRjaGluZ0RhdGEoZmFsc2UpXG4gIH0sIFtsYXp5UmVzdWx0cy5yZXN1bHRzLCBhdHRyaWJ1dGVUb0Jpbl0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0QXV0b2NvbXBsZXRlU3RhdGUoZ2V0QXV0b2NvbXBsZXRlU3RhdGUoeyBsYXp5UmVzdWx0cywgYXR0cmlidXRlVG9CaW4gfSkpXG4gIH0sIFtsYXp5UmVzdWx0cy5yZXN1bHRzXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzaG93SGlzdG9ncmFtKClcbiAgfSwgW2xhenlSZXN1bHRzLnJlc3VsdHMsIGF0dHJpYnV0ZVRvQmluLCB0aGVtZV0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHBsb3RseVJlYWR5Rm9yVXBkYXRlc1JlZi5jdXJyZW50KSB7XG4gICAgICAvLyBhdm9pZCB1cGRhdGluZyB0aGUgaGlzdG9ncmFtIGlmIGl0J3Mgbm90IHJlYWR5IHlldFxuICAgICAgdXBkYXRlSGlzdG9ncmFtKClcbiAgICB9XG4gIH0sIFtzZWxlY3RlZFJlc3VsdHNdKVxuXG4gIGNvbnN0IGRlZmF1bHRGb250Q29sb3IgPSBpc0RhcmtUaGVtZSA/ICd3aGl0ZScgOiAnYmxhY2snXG4gIGNvbnN0IGRlZmF1bHRIb3ZlckxhYmVsID0ge1xuICAgIGJnY29sb3I6IGlzRGFya1RoZW1lID8gJ2JsYWNrJyA6ICd3aGl0ZScsXG4gICAgZm9udDoge1xuICAgICAgY29sb3I6IGRlZmF1bHRGb250Q29sb3IsXG4gICAgfSxcbiAgfVxuXG4gIGNvbnN0IGdldEN1c3RvbUhvdmVyQXJyYXkgPSAoXG4gICAgY2F0ZWdvcmllczogYW55W10sXG4gICAgcmVzdWx0czogTGF6eVF1ZXJ5UmVzdWx0W11cbiAgKSA9PiB7XG4gICAgY29uc3QgY3VzdG9tQXJyYXk6IEN1c3RvbUhvdmVyW10gPSBbXVxuICAgIGNhdGVnb3JpZXMuZm9yRWFjaCgoY2F0ZWdvcnkpID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoZWRSZXN1bHRzID0gZmluZE1hdGNoZXNGb3JBdHRyaWJ1dGVWYWx1ZXMoXG4gICAgICAgIHJlc3VsdHMsXG4gICAgICAgIGF0dHJpYnV0ZVRvQmluLFxuICAgICAgICBBcnJheS5pc0FycmF5KGNhdGVnb3J5KSA/IGNhdGVnb3J5IDogW2NhdGVnb3J5XVxuICAgICAgKVxuXG4gICAgICBpZiAoXG4gICAgICAgIChtYXRjaGVkUmVzdWx0cyAmJiBtYXRjaGVkUmVzdWx0cy5sZW5ndGggPiAwKSB8fFxuICAgICAgICBjdXN0b21BcnJheS5sZW5ndGggPiAwXG4gICAgICApIHtcbiAgICAgICAgY3VzdG9tQXJyYXkucHVzaChnZXRDdXN0b21Ib3ZlcihtYXRjaGVkUmVzdWx0cywgZGVmYXVsdEhvdmVyTGFiZWwpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGN1c3RvbUFycmF5Lmxlbmd0aCA+IDAgPyBjdXN0b21BcnJheSA6IHVuZGVmaW5lZFxuICB9XG5cbiAgY29uc3QgZGV0ZXJtaW5lSW5pdGlhbERhdGEgPSAoKSA9PiB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHtcbiAgICAgICAgeDogY2FsY3VsYXRlQXR0cmlidXRlQXJyYXkoe1xuICAgICAgICAgIHJlc3VsdHMsXG4gICAgICAgICAgYXR0cmlidXRlOiBhdHRyaWJ1dGVUb0JpbixcbiAgICAgICAgfSksXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIHR5cGU6ICdoaXN0b2dyYW0nLFxuICAgICAgICBuYW1lOiAnSGl0cycsXG4gICAgICAgIG1hcmtlcjoge1xuICAgICAgICAgIGNvbG9yOiAncmdiYSgxMjAsIDEyMCwgMTIwLCAuMDUpJyxcbiAgICAgICAgICBsaW5lOiB7XG4gICAgICAgICAgICBjb2xvcjogJ3JnYmEoMTIwLDEyMCwxMjAsLjIpJyxcbiAgICAgICAgICAgIHdpZHRoOiAnMicsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgaG92ZXJ0ZW1wbGF0ZTogJyV7eX0gSGl0czxleHRyYT48L2V4dHJhPicsXG4gICAgICAgIGhvdmVybGFiZWw6IGRlZmF1bHRIb3ZlckxhYmVsLFxuICAgICAgfSxcbiAgICBdXG4gIH1cbiAgY29uc3QgZGV0ZXJtaW5lRGF0YSA9IChwbG90OiBhbnkpID0+IHtcbiAgICBjb25zdCBhY3RpdmVSZXN1bHRzID0gcmVzdWx0c1xuICAgIGNvbnN0IHhiaW5zID0gX2Nsb25lRGVlcChwbG90Ll9mdWxsRGF0YVswXS54YmlucylcblxuICAgIGNvbnN0IGNhdGVnb3JpZXM6IGFueVtdID0gcmV0cmlldmVDYXRlZ29yaWVzRnJvbVBsb3RseSgpXG5cbiAgICBsZXQgY3VzdG9tSG92ZXJBcnJheTogYW55ID0gdW5kZWZpbmVkXG4gICAgbGV0IHNlbGVjdGVkQ3VzdG9tSG92ZXJBcnJheTogYW55ID0gdW5kZWZpbmVkXG5cbiAgICBpZiAoZXh0ZW5zaW9uLmN1c3RvbUhpc3RvZ3JhbUhvdmVyKSB7XG4gICAgICBjdXN0b21Ib3ZlckFycmF5ID0gZ2V0Q3VzdG9tSG92ZXJBcnJheShjYXRlZ29yaWVzLCByZXN1bHRzKVxuXG4gICAgICBzZWxlY3RlZEN1c3RvbUhvdmVyQXJyYXkgPSBnZXRDdXN0b21Ib3ZlckFycmF5KFxuICAgICAgICBjYXRlZ29yaWVzLFxuICAgICAgICBPYmplY3QudmFsdWVzKHNlbGVjdGVkUmVzdWx0cylcbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAge1xuICAgICAgICB4OiBjYWxjdWxhdGVBdHRyaWJ1dGVBcnJheSh7XG4gICAgICAgICAgcmVzdWx0czogYWN0aXZlUmVzdWx0cyxcbiAgICAgICAgICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZVRvQmluLFxuICAgICAgICB9KSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgdHlwZTogJ2hpc3RvZ3JhbScsXG4gICAgICAgIG5hbWU6ICdIaXRzJyxcbiAgICAgICAgbWFya2VyOiB7XG4gICAgICAgICAgY29sb3I6ICdyZ2JhKDEyMCwgMTIwLCAxMjAsIC4wNSknLFxuICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgxMjAsMTIwLDEyMCwuMiknLFxuICAgICAgICAgICAgd2lkdGg6ICcyJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBob3ZlcmxhYmVsOiBjdXN0b21Ib3ZlckFycmF5XG4gICAgICAgICAgPyBnZXRDdXN0b21Ib3ZlckxhYmVscyhjdXN0b21Ib3ZlckFycmF5KVxuICAgICAgICAgIDogZGVmYXVsdEhvdmVyTGFiZWwsXG4gICAgICAgIGhvdmVydGVtcGxhdGU6IGN1c3RvbUhvdmVyQXJyYXlcbiAgICAgICAgICA/IGdldEN1c3RvbUhvdmVyVGVtcGxhdGVzKCdIaXRzJywgY3VzdG9tSG92ZXJBcnJheSlcbiAgICAgICAgICA6ICcle3l9IEhpdHM8ZXh0cmE+PC9leHRyYT4nLFxuICAgICAgICBhdXRvYmlueDogZmFsc2UsXG4gICAgICAgIHhiaW5zLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgeDogY2FsY3VsYXRlQXR0cmlidXRlQXJyYXkoe1xuICAgICAgICAgIHJlc3VsdHM6IE9iamVjdC52YWx1ZXMoc2VsZWN0ZWRSZXN1bHRzKSxcbiAgICAgICAgICBhdHRyaWJ1dGU6IGF0dHJpYnV0ZVRvQmluLFxuICAgICAgICB9KSxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgdHlwZTogJ2hpc3RvZ3JhbScsXG4gICAgICAgIG5hbWU6ICdTZWxlY3RlZCcsXG4gICAgICAgIG1hcmtlcjoge1xuICAgICAgICAgIGNvbG9yOiAncmdiYSgxMjAsIDEyMCwgMTIwLCAuMiknLFxuICAgICAgICAgIGxpbmU6IHtcbiAgICAgICAgICAgIGNvbG9yOiAncmdiYSgxMjAsMTIwLDEyMCwuNSknLFxuICAgICAgICAgICAgd2lkdGg6ICcyJyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBob3ZlcmxhYmVsOiBzZWxlY3RlZEN1c3RvbUhvdmVyQXJyYXlcbiAgICAgICAgICA/IGdldEN1c3RvbUhvdmVyTGFiZWxzKHNlbGVjdGVkQ3VzdG9tSG92ZXJBcnJheSlcbiAgICAgICAgICA6IGRlZmF1bHRIb3ZlckxhYmVsLFxuICAgICAgICBob3ZlcnRlbXBsYXRlOiBzZWxlY3RlZEN1c3RvbUhvdmVyQXJyYXlcbiAgICAgICAgICA/IGdldEN1c3RvbUhvdmVyVGVtcGxhdGVzKCdTZWxlY3RlZCcsIHNlbGVjdGVkQ3VzdG9tSG92ZXJBcnJheSlcbiAgICAgICAgICA6ICcle3l9IFNlbGVjdGVkPGV4dHJhPjwvZXh0cmE+JyxcbiAgICAgICAgYXV0b2Jpbng6IGZhbHNlLFxuICAgICAgICB4YmlucyxcbiAgICAgIH0sXG4gICAgXVxuICB9XG4gIGNvbnN0IGhhbmRsZVJlc2l6ZSA9ICgpID0+IHtcbiAgICBpZiAocGxvdGx5UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IGhpc3RvZ3JhbUVsZW1lbnQgPSBwbG90bHlSZWYuY3VycmVudFxuICAgICAgJChoaXN0b2dyYW1FbGVtZW50KS5maW5kKCdyZWN0LmRyYWcnKS5vZmYoJ21vdXNlZG93bicpXG4gICAgICBpZiAoKGhpc3RvZ3JhbUVsZW1lbnQgYXMgYW55KS5fY29udGV4dCkge1xuICAgICAgICBQbG90bHkuUGxvdHMucmVzaXplKGhpc3RvZ3JhbUVsZW1lbnQpXG4gICAgICB9XG4gICAgICAkKGhpc3RvZ3JhbUVsZW1lbnQpXG4gICAgICAgIC5maW5kKCdyZWN0LmRyYWcnKVxuICAgICAgICAub24oJ21vdXNlZG93bicsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgICAgc2hpZnRLZXkuY3VycmVudCA9IGV2ZW50LnNoaWZ0S2V5XG4gICAgICAgICAgbWV0YUtleS5jdXJyZW50ID0gZXZlbnQubWV0YUtleVxuICAgICAgICAgIGN0cmxLZXkuY3VycmVudCA9IGV2ZW50LmN0cmxLZXlcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBpZCA9IChNYXRoLnJhbmRvbSgpICogMTAwKS50b0ZpeGVkKDApLnRvU3RyaW5nKClcbiAgICBsaXN0ZW5Ubygod3JlcXIgYXMgYW55KS52ZW50LCAncmVzaXplJywgaGFuZGxlUmVzaXplKVxuICAgICQod2luZG93KS5vbihgcmVzaXplLiR7aWR9YCwgaGFuZGxlUmVzaXplKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAkKHdpbmRvdykub2ZmKGByZXNpemUuJHtpZH1gKVxuICAgIH1cbiAgfSwgW10pXG4gIGNvbnN0IHNob3dIaXN0b2dyYW0gPSAoKSA9PiB7XG4gICAgcGxvdGx5UmVhZHlGb3JVcGRhdGVzUmVmLmN1cnJlbnQgPSBmYWxzZVxuICAgIGlmIChwbG90bHlSZWYuY3VycmVudCkge1xuICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID4gMCAmJiBhdHRyaWJ1dGVUb0Jpbikge1xuICAgICAgICBjb25zdCBoaXN0b2dyYW1FbGVtZW50ID0gcGxvdGx5UmVmLmN1cnJlbnRcbiAgICAgICAgY29uc3QgaW5pdGlhbERhdGEgPSBkZXRlcm1pbmVJbml0aWFsRGF0YSgpXG4gICAgICAgIGlmIChpbml0aWFsRGF0YVswXS54Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHNldE5vTWF0Y2hpbmdEYXRhKHRydWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUGxvdGx5Lm5ld1Bsb3QoXG4gICAgICAgICAgICBoaXN0b2dyYW1FbGVtZW50LFxuICAgICAgICAgICAgaW5pdGlhbERhdGEsXG4gICAgICAgICAgICBnZXRMYXlvdXQoZGVmYXVsdEZvbnRDb2xvciksXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGRpc3BsYXlNb2RlQmFyOiBmYWxzZSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICApLnRoZW4oKHBsb3Q6IGFueSkgPT4ge1xuICAgICAgICAgICAgUGxvdGx5Lm5ld1Bsb3QoXG4gICAgICAgICAgICAgIGhpc3RvZ3JhbUVsZW1lbnQsXG4gICAgICAgICAgICAgIGRldGVybWluZURhdGEocGxvdCksXG4gICAgICAgICAgICAgIGdldExheW91dChkZWZhdWx0Rm9udENvbG9yLCBwbG90KSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlNb2RlQmFyOiBmYWxzZSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgaGFuZGxlUmVzaXplKClcbiAgICAgICAgICAgIGxpc3RlblRvSGlzdG9ncmFtKClcbiAgICAgICAgICAgIHBsb3RseVJlYWR5Rm9yVXBkYXRlc1JlZi5jdXJyZW50ID0gdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBsb3RseVJlZi5jdXJyZW50LmlubmVySFRNTCA9ICcnXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNvbnN0IHVwZGF0ZUhpc3RvZ3JhbSA9ICgpID0+IHtcbiAgICBpZiAocGxvdGx5UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IGhpc3RvZ3JhbUVsZW1lbnQgPSBwbG90bHlSZWYuY3VycmVudFxuICAgICAgaWYgKFxuICAgICAgICBoaXN0b2dyYW1FbGVtZW50ICE9PSBudWxsICYmXG4gICAgICAgIGhpc3RvZ3JhbUVsZW1lbnQuY2hpbGRyZW4ubGVuZ3RoICE9PSAwICYmXG4gICAgICAgIGF0dHJpYnV0ZVRvQmluICYmXG4gICAgICAgIHJlc3VsdHMubGVuZ3RoID4gMFxuICAgICAgKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgUGxvdGx5LmRlbGV0ZVRyYWNlcyhoaXN0b2dyYW1FbGVtZW50LCAxKVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmFibGUgdG8gZGVsZXRlIHRyYWNlJywgZXJyKVxuICAgICAgICB9XG4gICAgICAgIFBsb3RseS5hZGRUcmFjZXMoaGlzdG9ncmFtRWxlbWVudCwgZGV0ZXJtaW5lRGF0YShoaXN0b2dyYW1FbGVtZW50KVsxXSlcbiAgICAgICAgaGFuZGxlUmVzaXplKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGhpc3RvZ3JhbUVsZW1lbnQuaW5uZXJIVE1MID0gJydcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3Qgc2VsZWN0QmV0d2VlbiA9IChmaXJzdEluZGV4OiBudW1iZXIsIGxhc3RJbmRleDogbnVtYmVyKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IGZpcnN0SW5kZXg7IGkgPD0gbGFzdEluZGV4OyBpKyspIHtcbiAgICAgIGlmIChwb2ludHNTZWxlY3RlZC5jdXJyZW50LmluZGV4T2YoaSkgPT09IC0xKSB7XG4gICAgICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnQucHVzaChpKVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBhdHRyaWJ1dGVUb0NoZWNrID0gYXR0cmlidXRlVG9CaW5cbiAgICBjb25zdCBjYXRlZ29yaWVzID0gcmV0cmlldmVDYXRlZ29yaWVzRnJvbVBsb3RseSgpXG4gICAgY29uc3QgdmFsaWRDYXRlZ29yaWVzID0gY2F0ZWdvcmllcy5zbGljZShmaXJzdEluZGV4LCBsYXN0SW5kZXgpXG4gICAgY29uc3QgYWN0aXZlU2VhcmNoUmVzdWx0cyA9IHJlc3VsdHNcbiAgICBjb25zdCB2YWxpZFJlc3VsdHMgPSB2YWxpZENhdGVnb3JpZXMucmVkdWNlKFxuICAgICAgKHJlc3VsdHM6IGFueSwgY2F0ZWdvcnk6IGFueSkgPT4ge1xuICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5jb25jYXQoXG4gICAgICAgICAgZmluZE1hdGNoZXNGb3JBdHRyaWJ1dGVWYWx1ZXMoXG4gICAgICAgICAgICBhY3RpdmVTZWFyY2hSZXN1bHRzLFxuICAgICAgICAgICAgYXR0cmlidXRlVG9DaGVjayxcbiAgICAgICAgICAgIEFycmF5LmlzQXJyYXkoY2F0ZWdvcnkpID8gY2F0ZWdvcnkgOiBbY2F0ZWdvcnldXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgIHJldHVybiByZXN1bHRzXG4gICAgICB9LFxuICAgICAgW10gYXMgTGF6eVF1ZXJ5UmVzdWx0W11cbiAgICApIGFzIExhenlRdWVyeVJlc3VsdFtdXG4gICAgdmFsaWRSZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgICAgcmVzdWx0LnNldFNlbGVjdGVkKHRydWUpXG4gICAgfSlcbiAgfVxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAzMCkgRklYTUU6IE5vdCBhbGwgY29kZSBwYXRocyByZXR1cm4gYSB2YWx1ZS5cbiAgY29uc3QgcmV0cmlldmVDYXRlZ29yaWVzRnJvbVBsb3RseUZvckRhdGVzID0gKCkgPT4ge1xuICAgIGlmIChwbG90bHlSZWYuY3VycmVudCkge1xuICAgICAgY29uc3QgaGlzdG9ncmFtRWxlbWVudCA9IHBsb3RseVJlZi5jdXJyZW50XG4gICAgICBjb25zdCBjYXRlZ29yaWVzID0gW11cbiAgICAgIGNvbnN0IHhiaW5zID0gKGhpc3RvZ3JhbUVsZW1lbnQgYXMgYW55KS5fZnVsbERhdGFbMF0ueGJpbnNcbiAgICAgIGNvbnN0IG1pbiA9IHhiaW5zLnN0YXJ0XG4gICAgICBjb25zdCBtYXggPSBwYXJzZUludChtb21lbnQoeGJpbnMuZW5kKS5mb3JtYXQoJ3gnKSlcbiAgICAgIGxldCBzdGFydCA9IHBhcnNlSW50KG1vbWVudChtaW4pLmZvcm1hdCgneCcpKVxuICAgICAgY29uc3QgaW5Nb250aHMgPSB4Ymlucy5zaXplLmNvbnN0cnVjdG9yID09PSBTdHJpbmdcbiAgICAgIGNvbnN0IGJpblNpemUgPSBpbk1vbnRocyA/IHBhcnNlSW50KHhiaW5zLnNpemUuc3Vic3RyaW5nKDEpKSA6IHhiaW5zLnNpemVcbiAgICAgIHdoaWxlIChzdGFydCA8IG1heCkge1xuICAgICAgICBjb25zdCBzdGFydERhdGUgPSBtb21lbnQoc3RhcnQpLmZvcm1hdChwbG90bHlEYXRlRm9ybWF0KVxuICAgICAgICBjb25zdCBlbmREYXRlID0gaW5Nb250aHNcbiAgICAgICAgICA/IG1vbWVudChzdGFydCkuYWRkKGJpblNpemUsICdtb250aHMnKS5mb3JtYXQocGxvdGx5RGF0ZUZvcm1hdClcbiAgICAgICAgICA6IG1vbWVudChzdGFydCkuYWRkKGJpblNpemUsICdtcycpLmZvcm1hdChwbG90bHlEYXRlRm9ybWF0KVxuICAgICAgICBjYXRlZ29yaWVzLnB1c2goW3N0YXJ0RGF0ZSwgZW5kRGF0ZV0pXG4gICAgICAgIHN0YXJ0ID0gcGFyc2VJbnQoXG4gICAgICAgICAgaW5Nb250aHNcbiAgICAgICAgICAgID8gbW9tZW50KHN0YXJ0KS5hZGQoYmluU2l6ZSwgJ21vbnRocycpLmZvcm1hdCgneCcpXG4gICAgICAgICAgICA6IG1vbWVudChzdGFydCkuYWRkKGJpblNpemUsICdtcycpLmZvcm1hdCgneCcpXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYXRlZ29yaWVzXG4gICAgfVxuICB9XG4gIC8vIFRoaXMgaXMgYW4gaW50ZXJuYWwgdmFyaWFibGUgZm9yIFBsb3RseSwgc28gaXQgbWlnaHQgYnJlYWsgaWYgd2UgdXBkYXRlIFBsb3RseSBpbiB0aGUgZnV0dXJlLlxuICAvLyBSZWdhcmRsZXNzLCB0aGVyZSB3YXMgbm8gb3RoZXIgd2F5IHRvIHJlbGlhYmx5IGdldCB0aGUgY2F0ZWdvcmllcy5cbiAgY29uc3QgcmV0cmlldmVDYXRlZ29yaWVzRnJvbVBsb3RseSA9ICgpID0+IHtcbiAgICBpZiAocGxvdGx5UmVmLmN1cnJlbnQpIHtcbiAgICAgIGNvbnN0IGhpc3RvZ3JhbUVsZW1lbnQgPSBwbG90bHlSZWYuY3VycmVudFxuICAgICAgY29uc3QgeGF4aXMgPSAoaGlzdG9ncmFtRWxlbWVudCBhcyBhbnkpLl9mdWxsTGF5b3V0LnhheGlzXG4gICAgICBzd2l0Y2ggKHhheGlzLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnY2F0ZWdvcnknOlxuICAgICAgICAgIHJldHVybiB4YXhpcy5fY2F0ZWdvcmllc1xuICAgICAgICBjYXNlICdkYXRlJzpcbiAgICAgICAgICByZXR1cm4gcmV0cmlldmVDYXRlZ29yaWVzRnJvbVBsb3RseUZvckRhdGVzKClcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zdCB4YmlucyA9IChoaXN0b2dyYW1FbGVtZW50IGFzIGFueSkuX2Z1bGxEYXRhWzBdLnhiaW5zXG4gICAgICAgICAgY29uc3QgbWluID0geGJpbnMuc3RhcnRcbiAgICAgICAgICBjb25zdCBtYXggPSB4Ymlucy5lbmRcbiAgICAgICAgICBjb25zdCBiaW5TaXplID0geGJpbnMuc2l6ZVxuICAgICAgICAgIGNvbnN0IGNhdGVnb3JpZXMgPSBbXVxuICAgICAgICAgIHZhciBzdGFydCA9IG1pblxuICAgICAgICAgIHdoaWxlIChzdGFydCA8IG1heCkge1xuICAgICAgICAgICAgY2F0ZWdvcmllcy5wdXNoKFtzdGFydCwgc3RhcnQgKyBiaW5TaXplXSlcbiAgICAgICAgICAgIHN0YXJ0ICs9IGJpblNpemVcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNhdGVnb3JpZXNcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgY29uc3QgaGFuZGxlQ29udHJvbENsaWNrID0gKGRhdGE6IGFueSwgYWxyZWFkeVNlbGVjdGVkOiBib29sZWFuKSA9PiB7XG4gICAgY29uc3QgYXR0cmlidXRlVG9DaGVjayA9IGF0dHJpYnV0ZVRvQmluXG4gICAgY29uc3QgY2F0ZWdvcmllcyA9IHJldHJpZXZlQ2F0ZWdvcmllc0Zyb21QbG90bHkoKVxuICAgIGNvbnN0IG1hdGNoZWRSZXN1bHRzID0gZmluZE1hdGNoZXNGb3JBdHRyaWJ1dGVWYWx1ZXMoXG4gICAgICByZXN1bHRzLFxuICAgICAgYXR0cmlidXRlVG9DaGVjayxcbiAgICAgIGdldFZhbHVlRnJvbUNsaWNrKGRhdGEsIGNhdGVnb3JpZXMpXG4gICAgKVxuICAgIGlmIChhbHJlYWR5U2VsZWN0ZWQpIHtcbiAgICAgIG1hdGNoZWRSZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgICAgICByZXN1bHQuc2V0U2VsZWN0ZWQoZmFsc2UpXG4gICAgICB9KVxuICAgICAgcG9pbnRzU2VsZWN0ZWQuY3VycmVudC5zcGxpY2UoXG4gICAgICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnQuaW5kZXhPZihnZXRJbmRleENsaWNrZWQoZGF0YSkpLFxuICAgICAgICAxXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIG1hdGNoZWRSZXN1bHRzLmZvckVhY2goKHJlc3VsdCkgPT4ge1xuICAgICAgICByZXN1bHQuc2V0U2VsZWN0ZWQodHJ1ZSlcbiAgICAgIH0pXG4gICAgICBwb2ludHNTZWxlY3RlZC5jdXJyZW50LnB1c2goZ2V0SW5kZXhDbGlja2VkKGRhdGEpKVxuICAgIH1cbiAgfVxuICBjb25zdCBoYW5kbGVTaGlmdENsaWNrID0gKGRhdGE6IGFueSkgPT4ge1xuICAgIGNvbnN0IGluZGV4Q2xpY2tlZCA9IGdldEluZGV4Q2xpY2tlZChkYXRhKVxuICAgIGNvbnN0IGZpcnN0SW5kZXggPVxuICAgICAgcG9pbnRzU2VsZWN0ZWQuY3VycmVudC5sZW5ndGggPT09IDBcbiAgICAgICAgPyAtMVxuICAgICAgICA6IHBvaW50c1NlbGVjdGVkLmN1cnJlbnQucmVkdWNlKFxuICAgICAgICAgICAgKGN1cnJlbnRNaW4sIHBvaW50KSA9PiBNYXRoLm1pbihjdXJyZW50TWluLCBwb2ludCksXG4gICAgICAgICAgICBwb2ludHNTZWxlY3RlZC5jdXJyZW50WzBdXG4gICAgICAgICAgKVxuICAgIGNvbnN0IGxhc3RJbmRleCA9XG4gICAgICBwb2ludHNTZWxlY3RlZC5jdXJyZW50Lmxlbmd0aCA9PT0gMFxuICAgICAgICA/IC0xXG4gICAgICAgIDogcG9pbnRzU2VsZWN0ZWQuY3VycmVudC5yZWR1Y2UoXG4gICAgICAgICAgICAoY3VycmVudE1pbiwgcG9pbnQpID0+IE1hdGgubWF4KGN1cnJlbnRNaW4sIHBvaW50KSxcbiAgICAgICAgICAgIHBvaW50c1NlbGVjdGVkLmN1cnJlbnRbMF1cbiAgICAgICAgICApXG4gICAgaWYgKGZpcnN0SW5kZXggPT09IC0xICYmIGxhc3RJbmRleCA9PT0gLTEpIHtcbiAgICAgIGxhenlSZXN1bHRzLmRlc2VsZWN0KClcbiAgICAgIGhhbmRsZUNvbnRyb2xDbGljayhkYXRhLCBmYWxzZSlcbiAgICB9IGVsc2UgaWYgKGluZGV4Q2xpY2tlZCA8PSBmaXJzdEluZGV4KSB7XG4gICAgICBzZWxlY3RCZXR3ZWVuKGluZGV4Q2xpY2tlZCwgZmlyc3RJbmRleClcbiAgICB9IGVsc2UgaWYgKGluZGV4Q2xpY2tlZCA+PSBsYXN0SW5kZXgpIHtcbiAgICAgIHNlbGVjdEJldHdlZW4obGFzdEluZGV4LCBpbmRleENsaWNrZWQgKyAxKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RCZXR3ZWVuKGZpcnN0SW5kZXgsIGluZGV4Q2xpY2tlZCArIDEpXG4gICAgfVxuICB9XG4gIGNvbnN0IHBsb3RseUNsaWNrSGFuZGxlciA9IChkYXRhOiBhbnkpID0+IHtcbiAgICBjb25zdCBpbmRleENsaWNrZWQgPSBnZXRJbmRleENsaWNrZWQoZGF0YSlcbiAgICBjb25zdCBhbHJlYWR5U2VsZWN0ZWQgPSBwb2ludHNTZWxlY3RlZC5jdXJyZW50LmluZGV4T2YoaW5kZXhDbGlja2VkKSA+PSAwXG4gICAgaWYgKHNoaWZ0S2V5LmN1cnJlbnQpIHtcbiAgICAgIGhhbmRsZVNoaWZ0Q2xpY2soZGF0YSlcbiAgICB9IGVsc2UgaWYgKGN0cmxLZXkuY3VycmVudCB8fCBtZXRhS2V5LmN1cnJlbnQpIHtcbiAgICAgIGhhbmRsZUNvbnRyb2xDbGljayhkYXRhLCBhbHJlYWR5U2VsZWN0ZWQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGxhenlSZXN1bHRzLmRlc2VsZWN0KClcbiAgICAgIHJlc2V0UG9pbnRTZWxlY3Rpb24oKVxuICAgICAgaGFuZGxlQ29udHJvbENsaWNrKGRhdGEsIGFscmVhZHlTZWxlY3RlZClcbiAgICB9XG4gICAgcmVzZXRLZXlUcmFja2luZygpXG4gIH1cbiAgY29uc3QgbGlzdGVuVG9IaXN0b2dyYW0gPSAoKSA9PiB7XG4gICAgaWYgKHBsb3RseVJlZi5jdXJyZW50KSB7XG4gICAgICBjb25zdCBoaXN0b2dyYW1FbGVtZW50ID0gcGxvdGx5UmVmLmN1cnJlbnRcbiAgICAgIDsoaGlzdG9ncmFtRWxlbWVudCBhcyBhbnkpLl9ldi5hZGRMaXN0ZW5lcihcbiAgICAgICAgJ3Bsb3RseV9jbGljaycsXG4gICAgICAgIHBsb3RseUNsaWNrSGFuZGxlclxuICAgICAgKVxuICAgIH1cbiAgfVxuICBjb25zdCBzaGlmdEtleSA9IFJlYWN0LnVzZVJlZihmYWxzZSlcbiAgY29uc3QgbWV0YUtleSA9IFJlYWN0LnVzZVJlZihmYWxzZSlcbiAgY29uc3QgY3RybEtleSA9IFJlYWN0LnVzZVJlZihmYWxzZSlcbiAgY29uc3QgcG9pbnRzU2VsZWN0ZWQgPSBSZWFjdC51c2VSZWYoW10gYXMgbnVtYmVyW10pXG4gIGNvbnN0IHJlc2V0S2V5VHJhY2tpbmcgPSAoKSA9PiB7XG4gICAgc2hpZnRLZXkuY3VycmVudCA9IGZhbHNlXG4gICAgbWV0YUtleS5jdXJyZW50ID0gZmFsc2VcbiAgICBjdHJsS2V5LmN1cnJlbnQgPSBmYWxzZVxuICB9XG4gIGNvbnN0IHJlc2V0UG9pbnRTZWxlY3Rpb24gPSAoKSA9PiB7XG4gICAgcG9pbnRzU2VsZWN0ZWQuY3VycmVudCA9IFtdXG4gIH1cbiAgaWYgKE9iamVjdC5rZXlzKGxhenlSZXN1bHRzLnJlc3VsdHMpLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcyMHB4JyB9fT5ObyByZXN1bHRzIGZvdW5kPC9kaXY+XG4gIH1cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTJcIj5cbiAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgb3B0aW9ucz17YXV0b2NvbXBsZXRlU3RhdGUuY2hvaWNlc31cbiAgICAgICAgICBvbkNoYW5nZT17KF9lOiBhbnksIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICBzZXRBdHRyaWJ1dGVUb0JpbihuZXdWYWx1ZS52YWx1ZSlcbiAgICAgICAgICB9fVxuICAgICAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IGF0dHJpYnV0ZVRvQmlufVxuICAgICAgICAgIGdldE9wdGlvbkxhYmVsPXsob3B0aW9uKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gb3B0aW9uLmxhYmVsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBkaXNhYmxlQ2xlYXJhYmxlXG4gICAgICAgICAgdmFsdWU9e2F1dG9jb21wbGV0ZVN0YXRlLmNob2ljZXMuZmluZChcbiAgICAgICAgICAgIChjaG9pY2UpID0+IGNob2ljZS52YWx1ZSA9PT0gYXR0cmlidXRlVG9CaW5cbiAgICAgICAgICApfVxuICAgICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiAoXG4gICAgICAgICAgICA8VGV4dEZpZWxkIHsuLi5wYXJhbXN9IGxhYmVsPVwiR3JvdXAgYnlcIiB2YXJpYW50PVwib3V0bGluZWRcIiAvPlxuICAgICAgICAgICl9XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwicGxvdGx5LWhpc3RvZ3JhbVwiXG4gICAgICAgIHJlZj17cGxvdGx5UmVmIGFzIGFueX1cbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBoZWlnaHQ6ICdjYWxjKDEwMCUgLSAxMzVweCknLFxuICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgZGlzcGxheTogbm9NYXRjaGluZ0RhdGEgPyAnbm9uZScgOiAnYmxvY2snLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICAgIHtub01hdGNoaW5nRGF0YSA/IChcbiAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMjBweCcgfX0+XG4gICAgICAgICAgTm8gZGF0YSBpbiB0aGlzIHJlc3VsdCBzZXQgaGFzIHRoYXQgYXR0cmlidXRlXG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC8+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKEhpc3RvZ3JhbSlcbiJdfQ==