import { __assign, __makeTemplateObject, __rest } from "tslib";
import * as React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import CreateIcon from '@mui/icons-material/AddBox';
export var ZeroWidthSpace = function () {
    return React.createElement(React.Fragment, null, String.fromCharCode(8203));
};
export var WrappedHeader = function (_a) {
    var title = _a.title, otherProps = __rest(_a, ["title"]);
    return (React.createElement(CardHeader, __assign({ title: React.createElement(React.Fragment, null,
            title,
            React.createElement(ZeroWidthSpace, null)) }, otherProps)));
};
export var WrappedCard = styled(React.forwardRef(function (props, ref) {
    return React.createElement(Card, __assign({}, props, { ref: ref }));
}))(templateObject_1 || (templateObject_1 = __makeTemplateObject([""], [""])));
export var WrappedCardActions = styled(React.forwardRef(function (props, ref) {
    return React.createElement(CardActions, __assign({}, props, { ref: ref }));
}))(templateObject_2 || (templateObject_2 = __makeTemplateObject([""], [""])));
export var WrappedCardContent = styled(React.forwardRef(function (props, ref) {
    return React.createElement(CardContent, __assign({}, props, { ref: ref }));
}))(templateObject_3 || (templateObject_3 = __makeTemplateObject([""], [""])));
export var WrappedCardContentLabel = function (props) {
    return React.createElement(Typography, __assign({}, props, { noWrap: true, style: { opacity: 0.6 } }));
};
export var WrappedCardContentValue = function (_a) {
    var children = _a.children, otherProps = __rest(_a, ["children"]);
    return (React.createElement(Typography, __assign({}, otherProps, { noWrap: true }),
        children,
        React.createElement(ZeroWidthSpace, null)));
};
export var WrappedCardActionArea = styled(React.forwardRef(function (props, ref) {
    return React.createElement(CardActionArea, __assign({}, props, { ref: ref }));
}))(templateObject_4 || (templateObject_4 = __makeTemplateObject([""], [""])));
export var CreateCard = styled(React.forwardRef(function (props, ref) {
    return (React.createElement(WrappedCard, __assign({}, props.cardProps, { ref: ref }),
        React.createElement(WrappedCardActionArea, { style: {
                height: '100%',
                textAlign: 'center',
            } },
            React.createElement(WrappedCardContent, null,
                React.createElement(CreateIcon, { style: {
                        fontSize: '7rem',
                    } }),
                React.createElement("h1", null, props.text)))));
}))(templateObject_5 || (templateObject_5 = __makeTemplateObject([""], [""])));
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5;
//# sourceMappingURL=card.js.map