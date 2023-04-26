import { __assign, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import FilterLeaf from './filter-leaf';
import useTheme from '@material-ui/core/styles/useTheme';
import { HoverButton } from '../button/hover';
import { FilterBuilderClass, FilterClass, isFilterBuilderClass, } from './filter.structure';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import { Memo } from '../memo/memo';
import { Elevations } from '../theme/theme';
var OperatorData = [
    {
        label: 'AND',
        value: 'AND'
    },
    {
        label: 'OR',
        value: 'OR'
    },
];
var ChildFilter = function (_a) {
    var parentFilter = _a.parentFilter, filter = _a.filter, setFilter = _a.setFilter, index = _a.index, isFirst = _a.isFirst;
    return (React.createElement(React.Fragment, null,
        !isFirst ? (React.createElement(Grid, { "data-id": "filter-settings-container", container: true, direction: "row", alignItems: "center", justifyContent: "center", wrap: "nowrap", className: "relative" },
            React.createElement(Grid, { item: true, className: "p-2" },
                React.createElement(TextField, { "data-id": "filter-operator-select", value: parentFilter.type, onChange: function (e) {
                        var newOperator = e.target.value;
                        setFilter(new FilterBuilderClass(__assign(__assign({}, parentFilter), { type: newOperator })));
                    }, select: true, variant: "outlined", size: "small" }, OperatorData.map(function (operatorInfo) {
                    return (React.createElement(MenuItem, { key: operatorInfo.value, value: operatorInfo.value }, operatorInfo.label));
                }))),
            React.createElement(Grid, { item: true, className: "ml-auto position absolute right-0" },
                React.createElement(Button, { "data-id": "remove-child-filter-button", color: "primary", onClick: function () {
                        var newFilters = parentFilter.filters.slice(0);
                        newFilters.splice(index, 1);
                        setFilter(new FilterBuilderClass(__assign(__assign({}, parentFilter), { filters: newFilters })));
                    } }, "Remove")))) : null,
        isFilterBuilderClass(filter) ? (React.createElement(FilterBranch, { filter: filter, setFilter: function (newChildFilter) {
                var newFilters = parentFilter.filters.slice(0);
                newFilters.splice(index, 1, newChildFilter);
                setFilter(new FilterBuilderClass(__assign(__assign({}, parentFilter), { filters: newFilters })));
            } })) : (React.createElement(FilterLeaf, { filter: filter, setFilter: function (newChildFilter) {
                var newFilters = parentFilter.filters.slice(0);
                newFilters.splice(index, 1, newChildFilter);
                setFilter(new FilterBuilderClass(__assign(__assign({}, parentFilter), { filters: newFilters })));
            } }))));
};
var FilterBranch = function (_a) {
    var filter = _a.filter, setFilter = _a.setFilter, _b = _a.root, root = _b === void 0 ? false : _b;
    var _c = __read(React.useState(false), 2), hover = _c[0], setHover = _c[1];
    var theme = useTheme();
    /**
     * Any non root branches lacking filters are pruned.
     */
    React.useEffect(function () {
        filter.filters.forEach(function (childFilter, index) {
            if (isFilterBuilderClass(childFilter) &&
                childFilter.filters.length === 0) {
                var newFilters = filter.filters.slice(0);
                newFilters.splice(index, 1);
                setFilter(new FilterBuilderClass(__assign(__assign({}, filter), { filters: newFilters })));
            }
        });
    }, [filter]);
    var EnclosingElement = root ? Box : Paper;
    return (React.createElement("div", { onMouseOver: function () {
            setHover(true);
        }, onMouseOut: function () {
            setHover(false);
        } },
        React.createElement(EnclosingElement, { elevation: Elevations.panels, className: root ? '' : 'px-3 py-2' },
            React.createElement("div", { className: " relative" },
                React.createElement("div", { "data-id": root ? 'root-filter-group-container' : 'filter-group-contianer', className: "".concat(filter.negated ? 'border px-3 py-4 mt-2' : '', " transition-all duration-200"), style: {
                        borderColor: theme.palette.primary.main
                    } },
                    React.createElement(Grid, { item: true, className: "w-full filter-actions" },
                        React.createElement(Grid, { container: true, direction: "row", alignItems: "center", className: "w-full" },
                            React.createElement(Grid, { item: true },
                                React.createElement(Button, { "data-id": "add-field-button", color: "primary", onClick: function () {
                                        setFilter(new FilterBuilderClass(__assign(__assign({}, filter), { filters: filter.filters.concat([new FilterClass()]) })));
                                    } },
                                    React.createElement(AddIcon, { className: "Mui-text-text-primary" }),
                                    "Field")),
                            React.createElement(Grid, { item: true },
                                React.createElement(Button, { "data-id": "add-group-button", color: "primary", onClick: function () {
                                        setFilter(new FilterBuilderClass(__assign(__assign({}, filter), { filters: filter.filters.concat([
                                                new FilterBuilderClass(),
                                            ]) })));
                                    } },
                                    React.createElement(AddIcon, { className: "Mui-text-text-primary" }),
                                    "Group")),
                            filter.filters.length !== 0 ? (React.createElement(Grid, { item: true, className: "ml-auto" },
                                React.createElement(Button, { "data-id": "remove-first-filter-button", color: "primary", onClick: function () {
                                        var newFilters = filter.filters.slice(0);
                                        newFilters.splice(0, 1);
                                        setFilter(new FilterBuilderClass(__assign(__assign({}, filter), { filters: newFilters })));
                                    } }, "Remove"))) : null)),
                    filter.negated ? (React.createElement(React.Fragment, null,
                        React.createElement(HoverButton, { className: "absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 py-0 px-1 text-xs z-10", color: "primary", variant: "contained", onClick: function () {
                                setFilter(new FilterBuilderClass(__assign(__assign({}, filter), { negated: !filter.negated })));
                            } }, function (_a) {
                            var hover = _a.hover;
                            if (hover) {
                                return React.createElement(React.Fragment, null, "Remove Not");
                            }
                            else {
                                return React.createElement(React.Fragment, null, "NOT");
                            }
                        }))) : (React.createElement(React.Fragment, null,
                        React.createElement(Button, { "data-id": "not-group-button", className: "".concat(hover ? 'opacity-25' : 'opacity-0', " hover:opacity-100 focus:opacity-100 transition-opacity duration-200 absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 py-0 px-1 text-xs z-10"), color: "primary", variant: "contained", onClick: function () {
                                setFilter(new FilterBuilderClass(__assign(__assign({}, filter), { negated: !filter.negated })));
                            } }, "+ Not Group"))),
                    React.createElement(Memo, { dependencies: [filter] },
                        React.createElement(React.Fragment, null, filter.filters.map(function (childFilter, index) {
                            return (React.createElement(ChildFilter, { key: childFilter.id, parentFilter: filter, filter: childFilter, setFilter: setFilter, index: index, isFirst: index === 0, isLast: index === filter.filters.length - 1 }));
                        }))))))));
};
export default hot(module)(FilterBranch);
//# sourceMappingURL=filter-branch.js.map