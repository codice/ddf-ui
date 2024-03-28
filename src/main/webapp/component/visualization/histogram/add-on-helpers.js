import extension from '../../../extension-points';
export var getCustomHover = function (results, defaultHoverlabel) {
    var defaultHover = {
        text: '',
        bgColor: defaultHoverlabel.bgcolor,
        fontColor: defaultHoverlabel.font.color,
    };
    if (!extension.customHistogramHover)
        return defaultHover;
    return (extension.customHistogramHover({
        results: results,
    }) || defaultHover);
};
export var getCustomHoverTemplates = function (name, customHoverArray) {
    return customHoverArray.map(function (customHover) {
        return "%{y} ".concat(name).concat(customHover.text, "<extra></extra>");
    });
};
export var getCustomHoverLabels = function (customHoverArray) {
    return {
        bgcolor: customHoverArray.map(function (customHover) { return customHover.bgColor; }),
        font: {
            color: customHoverArray.map(function (customHover) { return customHover.fontColor; }),
        },
    };
};
//# sourceMappingURL=add-on-helpers.js.map