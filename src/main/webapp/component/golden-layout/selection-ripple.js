import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../selection-interface/hooks';
import { useTheme } from '@mui/material/styles';
var SelectionRipple = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var theme = useTheme();
    var selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var selectedResultsArray = Object.values(selectedResults);
    var _b = __read(React.useState(selectedResultsArray.length !== 0), 2), hasSelection = _b[0], setHasSelection = _b[1];
    React.useEffect(function () {
        setHasSelection(selectedResultsArray.length !== 0);
    });
    return (React.createElement("div", { className: " w-full h-full absolute z-0 left-0 top-0 transition-transform  transform overflow-visible  ease-in-out ".concat(hasSelection ? 'duration-1000' : 'duration-0'), style: {
            transform: hasSelection
                ? 'scale(100) translateX(0%) translateY(0%)'
                : 'scale(1) translateX(0%) translateY(0%)',
            background: theme.palette.secondary.main,
            opacity: hasSelection
                ? theme.palette.mode === 'dark'
                    ? 0.05
                    : 0.05
                : 0,
        } }));
};
export default hot(module)(SelectionRipple);
//# sourceMappingURL=selection-ripple.js.map