/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import { __makeTemplateObject } from "tslib";
import { hot } from 'react-hot-loader';
import * as React from 'react';
import Button from '@mui/material/Button';
import styled from 'styled-components';
import LinearProgress from '@mui/material/LinearProgress';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  overflow: auto;\n  height: 100%;\n\n  .metacardHistory-cell {\n    float: left;\n    padding: 10px;\n    text-align: center;\n  }\n\n  ", ";\n"], ["\n  overflow: auto;\n  height: 100%;\n\n  .metacardHistory-cell {\n    float: left;\n    padding: 10px;\n    text-align: center;\n  }\n\n  ", ";\n"])), function (props) {
    if (props.theme.screenBelow(props.theme.smallScreenSize)) {
        return "\n        .metacardHistory-body {\n          max-height: none;\n          overflow: auto;\n        }\n  \n        .metacardHistory-cell {\n          display: block;\n          width: 100%;\n        }\n    ";
    }
    return;
});
var Header = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  height: 50px;\n"], ["\n  height: 50px;\n"])));
var Row = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  transition: padding ", " linear;\n"], ["\n  transition: padding ", " linear;\n"
    // prettier-ignore
])), function (props) { return props.theme.transitionTime; });
// prettier-ignore
var Body = styled.div(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  max-height: calc(100% - ", "*2 - 20px - ", ");\n  overflow: auto;\n  overflow-x: hidden;\n  width: 100%;\n  cursor: pointer;\n  display: table;\n  content: \" \";\n  > *,\n  > * > td {\n    display: inline-block;\n    width: 100%;\n    border-top: 1px solid rgba(255, 255, 255, 0.1);\n    border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n  }\n  > *:hover,\n  > *:hover > td {\n    border-top: 1px solid rgba(255, 255, 255, 0.2);\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2);\n  }\n"], ["\n  max-height: calc(100% - ", "*2 - 20px - ", ");\n  overflow: auto;\n  overflow-x: hidden;\n  width: 100%;\n  cursor: pointer;\n  display: table;\n  content: \" \";\n  > *,\n  > * > td {\n    display: inline-block;\n    width: 100%;\n    border-top: 1px solid rgba(255, 255, 255, 0.1);\n    border-bottom: 1px solid rgba(255, 255, 255, 0.1);\n  }\n  > *:hover,\n  > *:hover > td {\n    border-top: 1px solid rgba(255, 255, 255, 0.2);\n    border-bottom: 1px solid rgba(255, 255, 255, 0.2);\n  }\n"])), function (props) { return props.theme.minimumButtonSize; }, function (props) { return props.theme.minimumSpacing; });
var Version = styled.div(templateObject_5 || (templateObject_5 = __makeTemplateObject(["\n  width: 20%;\n"], ["\n  width: 20%;\n"])));
var Date = styled.div(templateObject_6 || (templateObject_6 = __makeTemplateObject(["\n  width: 50%;\n"], ["\n  width: 50%;\n"])));
var Modified = styled.div(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n  width: 30%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n"], ["\n  width: 30%;\n  overflow: hidden;\n  text-overflow: ellipsis;\n"])));
var MetacardHistory = function (props) {
    var onClick = props.onClick, revertToSelectedVersion = props.revertToSelectedVersion, history = props.history, selectedVersion = props.selectedVersion, loading = props.loading, canEdit = props.canEdit;
    return loading ? (React.createElement(LinearProgress, { className: "w-full h-2" })) : (React.createElement(React.Fragment, null,
        React.createElement(Root, null,
            React.createElement(Header, null,
                React.createElement(Row, null,
                    React.createElement(Version, { className: "metacardHistory-cell" }, "Version"),
                    React.createElement(Date, { className: "metacardHistory-cell" }, "Date"),
                    React.createElement(Modified, { className: "metacardHistory-cell" }, "Modified by"))),
            React.createElement(Body, { className: "metacardHistory-body", "data-help": "This is the history of changes to\nthis item.  If you have the right permissions, you can click one of the items in the list\nand then click 'Revert to Selected Version' to restore the item to that specific state.  No history\nwill be lost in the process.  Instead a new version will be created that is equal to the state you\nhave chosen." }, history.map(function (historyItem) {
                return (React.createElement(Row, { className: "".concat(selectedVersion === historyItem.id &&
                        ' bg-gray-600 bg-opacity-25'), "data-id": historyItem.id, key: historyItem.id, onClick: onClick },
                    React.createElement(Version, { className: "metacardHistory-cell" }, historyItem.versionNumber),
                    React.createElement(Date, { className: "metacardHistory-cell" }, historyItem.niceDate),
                    React.createElement(Modified, { className: "metacardHistory-cell" }, historyItem.editedBy)));
            })),
            selectedVersion && canEdit && (React.createElement(Button, { fullWidth: true, className: "p-2", variant: "contained", color: "primary", onClick: revertToSelectedVersion }, "Revert to selected version")))));
};
export default hot(module)(MetacardHistory);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
//# sourceMappingURL=presentation.js.map