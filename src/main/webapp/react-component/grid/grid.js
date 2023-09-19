import { __assign, __makeTemplateObject } from "tslib";
import * as React from 'react';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';
export var WrappedGrid = styled(React.forwardRef(function (props, ref) {
    return React.createElement(Grid, __assign({}, props, { ref: ref }));
}))(templateObject_1 || (templateObject_1 = __makeTemplateObject([""], [""])));
var GridItem = styled(WrappedGrid)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  > * {\n    height: 100%;\n  }\n"], ["\n  > * {\n    height: 100%;\n  }\n"])));
export var WrappedCardGridItem = function (_a) {
    var children = _a.children, gridItemProps = _a.gridItemProps;
    return (React.createElement(GridItem, __assign({}, gridItemProps, { item: true, xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }), children));
};
export var WrappedCardGrid = styled(function (_a) {
    var gridProps = _a.gridProps, children = _a.children;
    return (React.createElement(WrappedGrid, __assign({ container: true, spacing: 3, direction: "row", justifyContent: "flex-start", wrap: "wrap" }, gridProps), children));
})(templateObject_3 || (templateObject_3 = __makeTemplateObject([""], [""])));
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=grid.js.map