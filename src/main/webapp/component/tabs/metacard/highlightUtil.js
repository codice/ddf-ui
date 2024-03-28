import * as React from 'react';
import Typography from '@mui/material/Typography';
var comparator = function (a, b) {
    var aIndex = parseInt(a.startIndex);
    var bIndex = parseInt(b.startIndex);
    if (aIndex < bIndex) {
        return -1;
    }
    else if (aIndex === bIndex) {
        return 0;
    }
    else if (aIndex > bIndex) {
        return 1;
    }
    return 0;
};
export var displayHighlightedAttrInFull = function (highlights, text, index) {
    //sort these in the order in which they appear
    highlights.sort(comparator);
    // only use the highlights from this value if multivalued
    var filteredHighlights = highlights.filter(function (highlight) { return parseInt(highlight.valueIndex) === index; });
    var textArray = [];
    var currentIndex = 0;
    filteredHighlights.forEach(function (highlight, index) {
        var highlightStart = parseInt(highlight.startIndex);
        var highlightEnd = parseInt(highlight.endIndex);
        var beforeText = (React.createElement("span", { dangerouslySetInnerHTML: {
                __html: text.substring(currentIndex, highlightStart),
            } }));
        var highlightText = (React.createElement("span", { className: "highlight", "data-id": index }, text.substring(highlightStart, highlightEnd)));
        currentIndex = highlightEnd;
        textArray.push(beforeText);
        textArray.push(highlightText);
    });
    var afterText = (React.createElement("span", { dangerouslySetInnerHTML: {
            __html: text.substring(currentIndex),
        } }));
    textArray.push(afterText);
    return React.createElement(Typography, null, textArray);
};
//# sourceMappingURL=highlightUtil.js.map