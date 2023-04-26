import { __assign, __makeTemplateObject, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { useLazyResultsStatusFromSelectionInterface } from '../selection-interface/hooks';
import Tooltip from '@material-ui/core/Tooltip';
import { Elevations } from '../theme/theme';
import FilterListIcon from '@material-ui/icons/FilterList';
import { fuzzyHits, fuzzyResultCount } from './fuzzy-results';
import ErrorIcon from '@material-ui/icons/Error';
import { useMenuState } from '../menu-state/menu-state';
import Popover from '@material-ui/core/Popover';
var Cell = styled.td(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  padding: 20px;\n  border: solid 1px rgba(120, 120, 120, 0.2);\n"], ["\n  padding: 20px;\n  border: solid 1px rgba(120, 120, 120, 0.2);\n"])));
var HeaderCell = styled.th(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  padding: 20px;\n"], ["\n  padding: 20px;\n"])));
var CellValue = function (props) {
    var value = props.value, _a = props.warnings, warnings = _a === void 0 ? [] : _a, message = props.message, alwaysShowValue = props.alwaysShowValue, hasReturned = props.hasReturned, successful = props.successful;
    return (React.createElement(React.Fragment, null,
        (!successful || message || (warnings && warnings.length > 0)) && (React.createElement(Tooltip, { title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" }, (function () {
                if (message) {
                    return message;
                }
                else if (warnings.length > 0) {
                    return warnings.map(function (warning) { return (React.createElement("div", { key: warning }, warning)); });
                }
                else {
                    return 'Something went wrong searching this source.';
                }
            })()) },
            React.createElement("span", { className: "fa fa-warning", style: { paddingRight: '5px' } }))),
        alwaysShowValue || (!message && hasReturned && successful)
            ? value
            : null,
        !hasReturned && !alwaysShowValue && (React.createElement("span", { className: "fa fa-circle-o-notch fa-spin", title: "Waiting for source to return" }))));
};
var QueryStatusRow = function (_a) {
    var status = _a.status, query = _a.query;
    var hasReturned = status.hasReturned;
    var successful = status.successful;
    var message = status.message;
    var warnings = status.warnings;
    var id = status.id;
    return (React.createElement("tr", { "data-id": "source-".concat(id, "-row") },
        React.createElement(Cell, { "data-id": "source-id-label" },
            React.createElement(CellValue, { value: id, hasReturned: hasReturned, successful: successful, warnings: warnings, message: message, alwaysShowValue: true })),
        React.createElement(Cell, { "data-id": "available-label" },
            React.createElement(CellValue, { value: "".concat(status.count, " hit").concat(status.count === 1 ? '' : 's'), hasReturned: hasReturned, successful: successful, warnings: warnings, message: message })),
        React.createElement(Cell, { "data-id": "possible-label" },
            React.createElement(CellValue, { value: fuzzyHits(status.hits), hasReturned: hasReturned, successful: successful, warnings: warnings, message: message })),
        React.createElement(Cell, { "data-id": "time-label" },
            React.createElement(CellValue, { value: status.elapsed / 1000, hasReturned: hasReturned, successful: successful, warnings: warnings, message: message })),
        React.createElement(Cell, { className: "status-filter" },
            React.createElement(Tooltip, { title: "Click to search only this source." },
                React.createElement(Button, { "data-id": "filter-button", onClick: function () {
                        query.set('sources', [status.id]);
                        query.startSearchFromFirstPage();
                    }, color: "primary" },
                    React.createElement(FilterListIcon, { className: "Mui-text-text-primary" }),
                    "Filter")))));
};
var QueryStatus = function (_a) {
    var statusBySource = _a.statusBySource, query = _a.query;
    return (React.createElement("table", null,
        React.createElement("tr", null,
            React.createElement(HeaderCell, null, "Source"),
            React.createElement(HeaderCell, { "data-help": "This is the number of results available based on the current sorting." }, "Available"),
            React.createElement(HeaderCell, { "data-help": "This is the total number of results (hits) that matched your search." }, "Possible"),
            React.createElement(HeaderCell, { "data-help": "This is the time (in seconds) that it took for the search to run." }, "Time (s)"),
            React.createElement(HeaderCell, { "data-help": "Locally filter results to be from a specific source." }, "Filter")),
        React.createElement("tbody", null, statusBySource.map(function (status) {
            return (React.createElement(QueryStatusRow, { key: status.id, status: status, query: query }));
        }))));
};
var LastRan = function (_a) {
    var currentAsOf = _a.currentAsOf;
    var _b = __read(React.useState(moment(currentAsOf).fromNow()), 2), howLongAgo = _b[0], setHowLongAgo = _b[1];
    React.useEffect(function () {
        setHowLongAgo(moment(currentAsOf).fromNow());
        var intervalId = setInterval(function () {
            setHowLongAgo(moment(currentAsOf).fromNow());
        }, 60000);
        return function () {
            clearInterval(intervalId);
        };
    }, [currentAsOf]);
    return React.createElement("div", { style: { whiteSpace: 'nowrap' } },
        "Current as of ",
        howLongAgo);
};
var QueryFeed = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var _b = useMenuState(), MuiButtonProps = _b.MuiButtonProps, MuiPopoverProps = _b.MuiPopoverProps;
    var _c = useLazyResultsStatusFromSelectionInterface({
        selectionInterface: selectionInterface
    }), status = _c.status, currentAsOf = _c.currentAsOf, isSearching = _c.isSearching;
    var statusBySource = Object.values(status);
    var resultMessage = '', pending = false, failed = false, warnings = false;
    if (statusBySource.length === 0) {
        resultMessage = 'Has not been run';
    }
    else {
        var sourcesThatHaveReturned = statusBySource.filter(function (status) { return status.hasReturned; });
        if (sourcesThatHaveReturned.length > 0) {
            var results = statusBySource
                .filter(function (status) { return status.hasReturned; })
                .filter(function (status) { return status.successful; });
            var available_1 = 0;
            var possible_1 = 0;
            results.forEach(function (result) {
                available_1 += result.count;
                possible_1 += result.hits;
            });
            resultMessage = "".concat(available_1, " hit").concat(available_1 === 1 ? '' : 's', " out of ").concat(fuzzyResultCount(possible_1), " possible");
        }
        else {
            resultMessage = 'Searching...';
        }
        failed = sourcesThatHaveReturned.some(function (status) { return !status.successful; });
        warnings = sourcesThatHaveReturned.some(function (status) { return status.warnings && status.warnings.length > 0; });
        pending = isSearching;
    }
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { container: true, direction: "row", alignItems: "center", wrap: "nowrap" },
            React.createElement(Grid, { item: true },
                React.createElement("div", { "data-id": "results-count-label", title: resultMessage, style: { whiteSpace: 'nowrap' } },
                    pending ? (React.createElement("i", { className: "fa fa-circle-o-notch fa-spin is-critical-animation" })) : (''),
                    failed ? React.createElement("i", { className: "fa fa-warning" }) : '',
                    resultMessage),
                React.createElement(LastRan, { currentAsOf: currentAsOf })),
            React.createElement(Grid, { item: true },
                React.createElement("div", null,
                    React.createElement("div", { className: "relative" },
                        React.createElement(Button, __assign({ "data-id": "heartbeat-button", title: "Show the full status for the search.", "data-help": "Show the full status for the search." }, MuiButtonProps),
                            React.createElement("span", { className: "fa fa-heartbeat" })),
                        React.createElement(Popover, __assign({}, MuiPopoverProps),
                            React.createElement(Paper, { "data-id": "query-status-container", style: { padding: '20px' }, className: "intrigue-table" },
                                React.createElement(QueryStatus, { statusBySource: statusBySource, query: selectionInterface.getCurrentQuery() }))),
                        warnings && (React.createElement("div", { className: "absolute bottom-0 right-0 text-sm" },
                            React.createElement(ErrorIcon, { fontSize: "inherit", color: "error" })))))))));
};
export default hot(module)(QueryFeed);
var templateObject_1, templateObject_2;
//# sourceMappingURL=query-feed.js.map