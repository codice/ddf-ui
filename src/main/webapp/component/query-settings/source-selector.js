import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import sourcesInstance from '../../component/singletons/sources-instance';
import Typography from '@material-ui/core/Typography';
import Swath from '../swath/swath';
import Grid from '@material-ui/core/Grid';
import HomeIcon from '@material-ui/icons/Home';
import CloudIcon from '@material-ui/icons/Cloud';
import WarningIcon from '@material-ui/icons/Warning';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import Chip from '@material-ui/core/Chip';
import _ from 'lodash';
var getHumanReadableSourceName = function (sourceId) {
    if (sourceId === 'all') {
        return 'All';
    }
    else if (sourceId === 'remote') {
        return (React.createElement(Grid, { container: true, alignItems: "center", direction: "row" },
            React.createElement(Grid, { item: true }, "Slow (offsite)"),
            ' ',
            React.createElement(Grid, { item: true },
                React.createElement(CloudIcon, null))));
    }
    else if (sourceId === 'local') {
        return (React.createElement(Grid, { container: true, alignItems: "center", direction: "row" },
            React.createElement(Grid, { item: true }, "Fast (onsite)"),
            ' ',
            React.createElement(Grid, { item: true },
                React.createElement(HomeIcon, null))));
    }
    return sourceId;
};
var getSourcesFromSearch = function (_a) {
    var search = _a.search;
    return search.get('sources') || [];
};
var isHarvested = function (sourceId) {
    return sourcesInstance.getHarvested().includes(sourceId);
};
var shouldBeSelected = function (_a) {
    var srcId = _a.srcId, sources = _a.sources;
    if (sources.includes('all')) {
        return true;
    }
    else if (sources.includes('local') && isHarvested(srcId)) {
        return true;
    }
    else if (sources.includes('remote') &&
        !isHarvested(srcId) &&
        srcId !== 'all' &&
        srcId !== 'local') {
        return true;
    }
    if (sources.includes(srcId)) {
        return true;
    }
    return false;
};
/**
 * So we used to use two separate search properties to track sources, federation and sources.
 * If federation was enterprise, we searched everything.  If not, we looked to sources.  I also think local was a thing.
 *
 * Instead, we're going to swap to storing only one property, sources (an array of strings).
 * If sources includes, 'all' then that's enterprise.  If it includes 'local', then that means everything local.
 * If it includes 'remote', that that means everything remote.  All other values are singular selections of a source.
 */
var SourceSelector = function (_a) {
    var search = _a.search;
    var _b = __read(React.useState(sourcesInstance.toJSON()), 2), availableSources = _b[0], setAvailableSources = _b[1];
    var _c = __read(React.useState(getSourcesFromSearch({ search: search })), 2), sources = _c[0], setSources = _c[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(search, 'change:sources', function () {
            setSources(getSourcesFromSearch({ search: search }));
        });
        listenTo(sourcesInstance, 'change', function () {
            setAvailableSources(sourcesInstance.toJSON());
        });
    }, []);
    React.useEffect(function () {
        search.set('sources', sources);
    }, [sources]);
    var availableLocalSources = availableSources.filter(function (availableSource) {
        return sourcesInstance.getHarvested().includes(availableSource.id);
    });
    var availableRemoteSources = availableSources.filter(function (availableSource) {
        return !sourcesInstance.getHarvested().includes(availableSource.id);
    });
    return (React.createElement("div", null,
        React.createElement(Typography, { className: "pb-2" }, "Data Sources"),
        React.createElement(TextField, { "data-id": "data-sources-select", fullWidth: true, variant: "outlined", select: true, SelectProps: {
                multiple: true,
                renderValue: function (selected) {
                    return (React.createElement(Grid, { container: true, alignItems: "center", direction: "row" }, selected
                        .sort(function (a, b) {
                        return a.toLowerCase().localeCompare(b.toLowerCase()); // case insensitive sort
                    })
                        .sort(function (a) {
                        if (a === 'local' || a === 'remote') {
                            return -1; // move these subcategories upwards to front
                        }
                        return 0;
                    })
                        .map(function (src) {
                        return (React.createElement(Grid, { item: true, key: src, className: "mr-2" },
                            React.createElement(Chip, { variant: "outlined", color: "default", className: "cursor-pointer", label: getHumanReadableSourceName(src) })));
                    })));
                },
                MenuProps: {
                    getContentAnchorEl: null
                }
            }, value: sources, onChange: function (e) {
                // first of all I'm sorry, second of all, order matters in these cases.  Should really just make a state machine out of this.
                // https://xstate.js.org/docs/  perhaps?
                var newSources = e.target.value;
                // these first three if only apply if the value didn't previous exist (user is going from not all to 'all', etc.)
                var newLocalSources = newSources
                    .filter(function (src) { return !['all', 'remote', 'local'].includes(src); })
                    .filter(function (src) { return isHarvested(src); });
                var newRemoteSources = newSources
                    .filter(function (src) { return !['all', 'remote', 'local'].includes(src); })
                    .filter(function (src) { return !isHarvested(src); });
                if ((newSources.includes('all') && !sources.includes('all')) ||
                    (newSources.includes('local') &&
                        newSources.includes('remote') &&
                        (!sources.includes('remote') || !sources.includes('local')) &&
                        !sources.includes('all'))) {
                    setSources(['all']);
                }
                else if (sources.includes('all') && newSources.includes('local')) {
                    setSources(['remote']);
                }
                else if (sources.includes('all') && newSources.includes('remote')) {
                    setSources(['local']);
                }
                else if (sources.includes('all') && newLocalSources.length > 0) {
                    setSources(_.difference(availableLocalSources.map(function (src) { return src.id; }).concat(['remote']), newLocalSources));
                }
                else if (sources.includes('all') && newRemoteSources.length > 0) {
                    setSources(_.difference(availableRemoteSources.map(function (src) { return src.id; }).concat(['local']), newRemoteSources));
                }
                else if (sources.includes('local') && newLocalSources.length > 0) {
                    setSources(_.difference(sources
                        .filter(function (src) { return src !== 'local'; })
                        .concat(availableLocalSources.map(function (src) { return src.id; })), newLocalSources));
                }
                else if (sources.includes('remote') &&
                    newRemoteSources.length > 0) {
                    setSources(_.difference(sources
                        .filter(function (src) { return src !== 'remote'; })
                        .concat(availableRemoteSources.map(function (src) { return src.id; })), newRemoteSources));
                }
                else if (newSources.includes('local') &&
                    !sources.includes('local')) {
                    setSources(newSources.filter(function (val) { return !isHarvested(val) && val !== 'all'; }));
                }
                else if (newSources.includes('remote') &&
                    !sources.includes('remote')) {
                    setSources(['remote'].concat(newSources.filter(function (val) { return isHarvested(val) && val !== 'all'; })));
                }
                else if (newSources.length ===
                    availableLocalSources.length + availableRemoteSources.length ||
                    (newSources.includes('local') &&
                        newSources.length === availableRemoteSources.length + 1) ||
                    (newSources.includes('remote') &&
                        newSources.length === availableLocalSources.length + 1)) {
                    setSources(['all']);
                }
                else if (availableLocalSources.length > 0 &&
                    _.difference(availableLocalSources.map(function (src) { return src.id; }), newSources.filter(function (src) { return isHarvested(src); })).length === 0) {
                    setSources(['local'].concat(newSources.filter(function (src) { return !isHarvested(src); })));
                }
                else if (availableRemoteSources.length > 0 &&
                    _.difference(availableRemoteSources.map(function (src) { return src.id; }), newSources.filter(function (src) { return !isHarvested(src); })).length === 0) {
                    setSources(['remote'].concat(newSources.filter(function (src) { return isHarvested(src); })));
                }
                else {
                    // in these case, we now have to determine if we should remove all, remote, or local based on what is in newSources
                    // no matter what all should be removed
                    newSources = newSources.filter(function (src) { return src !== 'all'; });
                    if (newSources.find(function (src) { return isHarvested(src); })) {
                        newSources = newSources.filter(function (src) { return src !== 'local'; });
                    }
                    if (newSources.find(function (src) { return src !== 'remote' && !isHarvested(src); })) {
                        newSources = newSources.filter(function (src) { return src !== 'remote'; });
                    }
                    setSources(newSources);
                }
            }, size: "small" },
            React.createElement(MenuItem, { "data-id": "all-option", value: "all" },
                React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap" },
                    React.createElement(Grid, { container: true, direction: "row", alignItems: "center" },
                        React.createElement(Grid, { item: true, className: "pr-2" }, shouldBeSelected({ srcId: 'all', sources: sources }) ? (React.createElement(CheckBoxIcon, null)) : (React.createElement(CheckBoxOutlineBlankIcon, null))),
                        React.createElement(Grid, { item: true }, "All")))),
            availableLocalSources.length > 0 ? (React.createElement(MenuItem, { "data-id": "onsite-option", value: "local" },
                React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pl-3" },
                    React.createElement(Grid, { item: true, className: "pr-2" },
                        React.createElement(Swath, { className: "w-1 h-full" })),
                    React.createElement(Grid, { container: true, direction: "row", alignItems: "center" },
                        React.createElement(Grid, { item: true, className: "pr-2" }, shouldBeSelected({ srcId: 'local', sources: sources }) ? (React.createElement(CheckBoxIcon, null)) : (React.createElement(CheckBoxOutlineBlankIcon, null))),
                        React.createElement(Grid, { item: true }, "Fast (onsite)"),
                        React.createElement(Grid, { item: true, className: "pl-2" },
                            React.createElement(HomeIcon, null)))))) : null,
            availableLocalSources.length > 0
                ? availableLocalSources.map(function (source) {
                    return (React.createElement(MenuItem, { "data-id": "source-".concat(source.id, "-option"), key: source.id, value: source.id },
                        React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pl-6" },
                            React.createElement(Grid, { item: true, className: "pl-3 pr-3" },
                                React.createElement(Swath, { className: "w-1 h-full" })),
                            React.createElement(Grid, { container: true, direction: "row", alignItems: "center" },
                                React.createElement(Grid, { item: true, className: "pr-2" }, shouldBeSelected({ srcId: source.id, sources: sources }) ? (React.createElement(CheckBoxIcon, null)) : (React.createElement(CheckBoxOutlineBlankIcon, null))),
                                React.createElement(Grid, { item: true },
                                    React.createElement("div", { className: source.available
                                            ? 'Mui-text-text-primary'
                                            : 'Mui-text-warning' }, source.id)),
                                React.createElement(Grid, { item: true, className: "pl-2" }, source.available ? null : React.createElement(WarningIcon, null))))));
                })
                : null,
            availableRemoteSources.length > -1 ? (React.createElement(MenuItem, { "data-id": "offsite-option", value: "remote" },
                React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pl-3" },
                    React.createElement(Grid, { item: true, className: "pr-2" },
                        React.createElement(Swath, { className: "w-1 h-full" })),
                    React.createElement(Grid, { container: true, direction: "row", alignItems: "center" },
                        React.createElement(Grid, { item: true, className: "pr-2" }, shouldBeSelected({ srcId: 'remote', sources: sources }) ? (React.createElement(CheckBoxIcon, null)) : (React.createElement(CheckBoxOutlineBlankIcon, null))),
                        React.createElement(Grid, { item: true }, "Slow (offsite)"),
                        React.createElement(Grid, { item: true, className: "pl-2" },
                            React.createElement(CloudIcon, null)))))) : null,
            availableRemoteSources.length > 0
                ? availableRemoteSources.map(function (source) {
                    return (React.createElement(MenuItem, { "data-id": "source-".concat(source.id, "-option"), key: source.id, value: source.id },
                        React.createElement(Grid, { container: true, alignItems: "stretch", direction: "row", wrap: "nowrap", className: "pl-6" },
                            React.createElement(Grid, { item: true, className: "pl-3 pr-3" },
                                React.createElement(Swath, { className: "w-1 h-full" })),
                            React.createElement(Grid, { container: true, direction: "row", alignItems: "center" },
                                React.createElement(Grid, { item: true, className: "pr-2" }, shouldBeSelected({ srcId: source.id, sources: sources }) ? (React.createElement(CheckBoxIcon, null)) : (React.createElement(CheckBoxOutlineBlankIcon, null))),
                                React.createElement(Grid, { item: true },
                                    React.createElement("div", { className: source.available
                                            ? 'Mui-text-text-primary'
                                            : 'Mui-text-warning' }, source.id)),
                                React.createElement(Grid, { item: true, className: "pl-2" }, source.available ? null : React.createElement(WarningIcon, null))))));
                })
                : null)));
};
export default hot(module)(SourceSelector);
//# sourceMappingURL=source-selector.js.map