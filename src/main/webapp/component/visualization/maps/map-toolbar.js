import { __assign, __read } from "tslib";
import Button from '@mui/material/Button';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import MapSettings from '../../../react-component/map-settings';
import ZoomToHomeButton from '../../../react-component/button/split-button/zoomToHome';
import Gazetteer from '../../../react-component/location/gazetteer';
import { LayersDropdown } from '../../layers/layers-dropdown';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import Paper from '@mui/material/Paper';
import { Elevations } from '../../theme/theme';
var ClusteringButton = function (_a) {
    var toggleClustering = _a.toggleClustering, isClustering = _a.isClustering;
    return (React.createElement(Button, { "data-id": "cluster-button", onClick: function () {
            toggleClustering();
        }, size: "small", color: "primary" },
        React.createElement("div", { className: "flex flex-row items-center" },
            isClustering ? (React.createElement(CheckBoxIcon, { className: "Mui-text-text-primary" })) : (React.createElement(CheckBoxOutlineBlankIcon, { className: "Mui-text-text-primary" })),
            React.createElement("span", { className: "pr-2" }, "Cluster"))));
};
export var MapToolbar = function (props) {
    var _a = __read(React.useState(false), 2), expanded = _a[0], setExpanded = _a[1];
    return (React.createElement(Paper, { className: "absolute z-10 right-0 m-4 max-w-full-4 truncate", elevation: Elevations.overlays },
        React.createElement("div", { className: "flex flex-row items-center overflow-auto w-full flex-nowrap px-2" },
            React.createElement("div", { className: "py-2" }, expanded ? (React.createElement(Button, { size: "small", color: "primary", onClick: function () {
                    setExpanded(false);
                }, className: "shrink-0" },
                React.createElement(KeyboardArrowRightIcon, { color: "inherit", className: "Mui-text-text-primary Mui-icon-size-small" }),
                React.createElement(KeyboardArrowRightIcon, { color: "inherit", className: "-ml-3 Mui-text-text-primary Mui-icon-size-small" }))) : (React.createElement(Button, { size: "small", color: "primary", onClick: function () {
                    setExpanded(true);
                }, "data-id": "expand-map-tools-button" },
                React.createElement(KeyboardArrowLeftIcon, { color: "inherit", className: "Mui-text-text-primary Mui-icon-size-small" }),
                React.createElement(KeyboardArrowLeftIcon, { color: "inherit", className: "-ml-3 Mui-text-text-primary Mui-icon-size-small" }),
                "Map Tools"))),
            expanded ? (React.createElement(React.Fragment, null,
                React.createElement("div", { className: "w-64 min-w-32 py-2 shrink-1 truncate" },
                    React.createElement(Gazetteer, { variant: "outlined", placeholder: "Go to a location", setState: function (_a) {
                            var polygon = _a.polygon;
                            return props.map.doPanZoom(polygon);
                        } })),
                React.createElement("div", { className: "py-2 pr-2 shrink-0" },
                    React.createElement(ClusteringButton, __assign({}, props))),
                React.createElement("div", { className: "Mui-bg-default w-min self-stretch shrink-0" }),
                React.createElement("div", { className: "py-2 px-2 shrink-0" },
                    React.createElement(LayersDropdown, null)),
                React.createElement("div", { className: "Mui-bg-default w-min self-stretch shrink-0" }),
                React.createElement("div", { className: "py-2 px-2 shrink-0" },
                    React.createElement(ZoomToHomeButton, { goHome: function () { return props.zoomToHome(); }, saveHome: function () { return props.saveAsHome(); } })),
                React.createElement("div", { className: "Mui-bg-default w-min self-stretch shrink-0" }),
                React.createElement("div", { className: "py-2 pl-2 shrink-0" },
                    React.createElement(MapSettings, null)))) : null)));
};
export default hot(module)(MapToolbar);
//# sourceMappingURL=map-toolbar.js.map