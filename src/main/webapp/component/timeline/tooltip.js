import { __makeTemplateObject } from "tslib";
import * as React from 'react';
import styled from 'styled-components';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  position: absolute;\n  top: ", "px;\n  left: ", "px;\n  color: white;\n  background-color: rgba(0, 0, 0, 0.7);\n  max-width: 30%;\n  border-radius: 8px;\n  padding: 10px;\n  z-index: 1;\n  pointer-events: none;\n"], ["\n  position: absolute;\n  top: ", "px;\n  left: ", "px;\n  color: white;\n  background-color: rgba(0, 0, 0, 0.7);\n  max-width: 30%;\n  border-radius: 8px;\n  padding: 10px;\n  z-index: 1;\n  pointer-events: none;\n"])), function (props) { return props.pos.y; }, function (props) { return props.pos.x; });
export var Tooltip = function (props) {
    var x = props.x, y = props.y, message = props.message;
    return (React.createElement(Root, { pos: { x: x, y: y } },
        React.createElement("span", null, message)));
};
var templateObject_1;
//# sourceMappingURL=tooltip.js.map