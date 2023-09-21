import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import ResultItemCollection from './result-item.collection';
import Grid from '@mui/material/Grid';
import TableVisual from './table';
import Button from '@mui/material/Button';
import BackgroundInheritingDiv from '../../theme/background-inheriting-div';
export var ResultsViewContext = React.createContext({
    edit: null,
    setEdit: (function () { }),
});
var ResultsView = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var _b = __read(React.useState('card'), 2), mode = _b[0], setMode = _b[1];
    var _c = __read(React.useState(null), 2), edit = _c[0], setEdit = _c[1];
    return (React.createElement(ResultsViewContext.Provider, { value: { edit: edit, setEdit: setEdit } },
        React.createElement(Grid, { container: true, direction: "column", className: "w-full h-full bg-inherit", wrap: "nowrap" },
            React.createElement(Grid, { className: "w-full h-full bg-inherit relative " },
                edit !== null ? (React.createElement(BackgroundInheritingDiv, { className: "absolute left-0 top-0 w-full h-full z-10" },
                    React.createElement("div", { className: "w-full h-full p-2" },
                        "Currently editing: ",
                        edit.plain.metacard.properties.title,
                        React.createElement(Button, { onClick: function () {
                                setEdit(null);
                            } }, "Cancel")))) : null,
                (function () {
                    if (mode === 'card') {
                        return (React.createElement(ResultItemCollection, { mode: mode, setMode: setMode, selectionInterface: selectionInterface }));
                    }
                    else {
                        return (React.createElement(TableVisual, { selectionInterface: selectionInterface, mode: mode, setMode: setMode }));
                    }
                })()))));
};
export default hot(module)(ResultsView);
//# sourceMappingURL=results-visual.js.map