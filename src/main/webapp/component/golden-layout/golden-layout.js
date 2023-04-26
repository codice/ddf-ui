import { __read } from "tslib";
import * as React from 'react';
import { useResizableGridContext } from '../resizable-grid/resizable-grid';
import { GoldenLayoutViewReact } from './golden-layout.view';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ResultSelector from '../result-selector/result-selector';
import { Elevations } from '../theme/theme';
export var GoldenLayout = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var _b = __read(React.useState(null), 2), goldenLayout = _b[0], setGoldenLayout = _b[1];
    var closed = useResizableGridContext().closed;
    React.useEffect(function () {
        setTimeout(function () {
            if (goldenLayout)
                goldenLayout.updateSize();
        }, 100);
    }, [closed, goldenLayout]);
    React.useEffect(function () {
        setTimeout(function () {
            if (goldenLayout)
                goldenLayout.updateSize();
        }, 1000);
    }, [goldenLayout]);
    return (React.createElement(Grid, { "data-id": "results-container", container: true, direction: "column", className: "w-full h-full", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full relative z-1 pb-2 pt-2 pr-2 shrink-0" },
            React.createElement(Paper, { elevation: Elevations.panels, className: "w-full p-3 overflow-hidden" }, goldenLayout ? (React.createElement(ResultSelector, { selectionInterface: selectionInterface, model: selectionInterface.getCurrentQuery(), goldenLayout: goldenLayout })) : null)),
        React.createElement(Grid, { item: true, className: "w-full h-full overflow-hidden shrink-1 pb-2 pr-2" },
            React.createElement(GoldenLayoutViewReact, { selectionInterface: selectionInterface, configName: "goldenLayout", setGoldenLayout: setGoldenLayout }))));
};
//# sourceMappingURL=golden-layout.js.map