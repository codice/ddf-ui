import { __makeTemplateObject, __read } from "tslib";
import WithListenTo from './../../../react-component/backbone-container';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import styled from 'styled-components';
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks';
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks';
import Timeline from '../../timeline';
import moment from 'moment-timezone';
import useTimePrefs from '../../fields/useTimePrefs';
import metacardDefinitions from '../../singletons/metacard-definitions';
import properties from '../../../js/properties';
import IconHelper from '../../../js/IconHelper';
import useSnack from '../../hooks/useSnack';
import wreqr from '../../../js/wreqr';
import user from '../../singletons/user-instance';
import _ from 'lodash';
var maxDate = moment().tz(user.getTimeZone());
var TimelineWrapper = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  padding: 40px 40px 60px 40px;\n  height: 100%;\n\n  .MuiButton-label {\n    font-size: 0.875rem !important;\n  }\n"], ["\n  padding: 40px 40px 60px 40px;\n  height: 100%;\n\n  .MuiButton-label {\n    font-size: 0.875rem !important;\n  }\n"])));
var getDateAttributes = function (results) {
    var availableAttributes = Object.keys(results)
        .reduce(function (currentAvailable, key) {
        var result = results[key];
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'string[]' is not assignable to type 'never[]... Remove this comment to see the full error message
        currentAvailable = _.union(currentAvailable, Object.keys(result.plain.metacard.properties));
        return currentAvailable;
    }, [])
        .sort();
    var dateAttributes = availableAttributes.reduce(function (list, attribute) {
        if (metacardDefinitions.metacardTypes[attribute].type == 'DATE') {
            list.push(attribute);
        }
        return list;
    }, []);
    return dateAttributes;
};
var renderTooltip = function (timelineItems) {
    var itemsToExpand = 5;
    var results = timelineItems.slice(0, itemsToExpand).map(function (item) {
        var data = item.data;
        var icon = IconHelper.getFullByMetacardObject(data.plain);
        var metacard = data.plain.metacard.properties;
        return (React.createElement(React.Fragment, { key: metacard.id },
            React.createElement("span", { className: icon["class"] }),
            "\u00A0",
            React.createElement("span", null, metacard.title || metacard.id),
            React.createElement("br", null)));
    });
    var otherResults = (React.createElement(React.Fragment, null,
        React.createElement("br", null), "+".concat(timelineItems.length - itemsToExpand, " other results")));
    return (React.createElement(React.Fragment, null,
        results,
        timelineItems.length > itemsToExpand && otherResults));
};
var TimelineVisualization = function (props) {
    var selectionInterface = props.selectionInterface;
    useTimePrefs();
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface
    });
    var selectedResults = useSelectedResults({
        lazyResults: lazyResults
    });
    var results = lazyResults.results;
    var _a = __read(React.useState([]), 2), data = _a[0], setData = _a[1];
    var _b = __read(React.useState({}), 2), dateAttributeAliases = _b[0], setDateAttributeAliases = _b[1];
    var _c = __read(React.useState(0), 2), height = _c[0], setHeight = _c[1];
    var _d = __read(React.useState(false), 2), pause = _d[0], setPause = _d[1];
    var rootRef = React.useRef(null);
    var _e = __read(React.useState(false), 2), resized = _e[0], setResized = _e[1];
    var addSnack = useSnack();
    React.useEffect(function () {
        props.listenTo(wreqr.vent, 'resize', function () {
            if (rootRef.current) {
                // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                var rect = rootRef.current.getBoundingClientRect();
                setHeight(rect.height);
            }
            setResized(true);
        });
    }, []);
    React.useEffect(function () {
        if (resized) {
            setResized(false);
        }
    }, [resized]);
    React.useEffect(function () {
        var selectedIds = Object.values(selectedResults).map(function (result) { return result.plain.metacard.properties.id; });
        var possibleDateAttributes = getDateAttributes(results);
        var resultData = Object.values(results).map(function (result) {
            var metacard = result.plain.metacard.properties;
            var resultDateAttributes = {};
            possibleDateAttributes.forEach(function (dateAttribute) {
                resultDateAttributes[dateAttribute] = moment(metacard[dateAttribute]);
            });
            var id = metacard.id;
            var resultDataPoint = {
                id: id,
                selected: selectedIds.includes(id),
                data: result,
                attributes: resultDateAttributes
            };
            return resultDataPoint;
        });
        setData(resultData);
        if (Object.keys(possibleDateAttributes).length > 0) {
            var aliasMap_1 = {};
            possibleDateAttributes.forEach(function (dateAttribute) {
                aliasMap_1[dateAttribute] =
                    properties.attributeAliases[dateAttribute] || dateAttribute;
            });
            if (!_.isEqual(aliasMap_1, dateAttributeAliases)) {
                setDateAttributeAliases(aliasMap_1);
            }
        }
    }, [results, selectedResults]);
    var onSelect = function (selectedData) {
        var selectedIds = selectedData.map(function (d) { return d.id; });
        setPause(true);
        lazyResults.selectByIds(selectedIds);
        setPause(false);
    };
    if (pause) {
        return null;
    }
    return (React.createElement(TimelineWrapper, { "data-id": "timeline-container", ref: rootRef },
        React.createElement(Timeline, { min: moment('1975-01-01').tz(user.getTimeZone()), max: moment(maxDate), heightOffset: 250, onSelect: onSelect, data: data, dateAttributeAliases: dateAttributeAliases, renderTooltip: renderTooltip, format: user.getDateTimeFormat(), timezone: user.getTimeZone(), height: height, onCopy: function (copiedValue) {
                addSnack('Copied to clipboard: ' + copiedValue, {
                    alertProps: {
                        severity: 'success'
                    }
                });
            } })));
};
export default hot(module)(WithListenTo(TimelineVisualization));
var templateObject_1;
//# sourceMappingURL=timeline.js.map