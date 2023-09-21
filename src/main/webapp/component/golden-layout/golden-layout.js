import { __read } from "tslib";
import * as React from 'react';
import { useResizableGridContext } from '../resizable-grid/resizable-grid';
import { GoldenLayoutViewReact } from './golden-layout.view';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ResultSelector from '../result-selector/result-selector';
import { Elevations } from '../theme/theme';
var useUpdateGoldenLayoutSize = function (_a) {
    var goldenLayout = _a.goldenLayout, closed = _a.closed;
    React.useEffect(function () {
        setTimeout(function () {
            if (goldenLayout && goldenLayout.isInitialised)
                goldenLayout.updateSize();
        }, 100);
    }, [closed, goldenLayout]);
};
export var GoldenLayout = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var _b = __read(React.useState(null), 2), goldenLayout = _b[0], setGoldenLayout = _b[1];
    var closed = useResizableGridContext().closed;
    useUpdateGoldenLayoutSize({ goldenLayout: goldenLayout, closed: closed });
    return (React.createElement(Grid, { "data-id": "results-container", container: true, direction: "column", className: "w-full h-full", wrap: "nowrap" },
        React.createElement(Grid, { item: true, className: "w-full relative z-1 pb-2 pt-2 pr-2 shrink-0" },
            React.createElement(Paper, { elevation: Elevations.panels, className: "w-full py-1 px-2 overflow-hidden" }, goldenLayout ? (React.createElement(ResultSelector, { selectionInterface: selectionInterface, model: selectionInterface.getCurrentQuery(), goldenLayout: goldenLayout })) : null)),
        React.createElement(Grid, { item: true, className: "w-full h-full overflow-hidden shrink-1 pb-2 pr-2" },
            React.createElement(GoldenLayoutViewReact, { selectionInterface: selectionInterface, configName: "goldenLayout", setGoldenLayout: setGoldenLayout }))));
};
//# sourceMappingURL=golden-layout.js.map