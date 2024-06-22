import { __makeTemplateObject, __read, __spreadArray } from "tslib";
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
import * as React from 'react';
import { hot } from 'react-hot-loader';
import styled from 'styled-components';
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks';
var SHOW_MORE_LENGTH = 2;
var ShowingResultsForContainer = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  padding: 0.15rem;\n  text-align: center;\n  font-size: 0.75rem;\n  border: none !important;\n"], ["\n  padding: 0.15rem;\n  text-align: center;\n  font-size: 0.75rem;\n  border: none !important;\n"])));
var ShowMore = styled.a(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  padding: 0.15rem;\n  font-size: 0.75rem;\n"], ["\n  padding: 0.15rem;\n  font-size: 0.75rem;\n"])));
var DidYouMeanContainer = styled.div(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n  text-align: center;\n  border: none !important;\n"], ["\n  text-align: center;\n  border: none !important;\n"])));
var ResendQuery = styled.a(templateObject_4 || (templateObject_4 = __makeTemplateObject(["\n  padding: 0.15rem;\n  text-align: center;\n  font-size: 0.75rem;\n  text-decoration: none;\n  width: 100%;\n"], ["\n  padding: 0.15rem;\n  text-align: center;\n  font-size: 0.75rem;\n  text-decoration: none;\n  width: 100%;\n"])));
var Spellcheck = function (props) {
    var _a = __read(React.useState(false), 2), expandShowingResultForText = _a[0], setExpandShowingResultForText = _a[1];
    var _b = __read(React.useState(false), 2), expandDidYouMeanFieldText = _b[0], setExpandDidYouMeanFieldText = _b[1];
    var createShowResultText = function (showingResultsForFields) {
        var showingResultsFor = 'Showing Results for ';
        if (showingResultsForFields !== undefined &&
            showingResultsForFields !== null &&
            showingResultsForFields.length > 0) {
            if (!expandShowingResultForText && showingResultsForFields.length > 2) {
                showingResultsFor += createCondensedResultsForText(showingResultsForFields);
                return showingResultsFor;
            }
            showingResultsFor += createExpandedResultsForText(showingResultsForFields);
            return showingResultsFor;
        }
        return null;
    };
    var createDidYouMeanText = function (didYouMeanFields) {
        var didYouMean = 'Did you mean ';
        if (didYouMeanFields !== undefined &&
            didYouMeanFields !== null &&
            didYouMeanFields.length > 0) {
            if (!expandDidYouMeanFieldText && didYouMeanFields.length > 2) {
                didYouMean += createCondensedResultsForText(didYouMeanFields);
                return didYouMean;
            }
            didYouMean += createExpandedResultsForText(didYouMeanFields);
            return didYouMean;
        }
        return null;
    };
    var createCondensedResultsForText = function (showingResultsForFields) {
        var copyQuery = __spreadArray([], __read(showingResultsForFields), false);
        copyQuery.splice(0, copyQuery.length - SHOW_MORE_LENGTH);
        return copyQuery.join(', ');
    };
    var createExpandedResultsForText = function (showingResultsForFields) {
        return showingResultsForFields.join(', ');
    };
    var rerunQuery = function (model) {
        model.set('spellcheck', false);
        model.startSearchFromFirstPage();
        model.set('spellcheck', true);
    };
    var selectionInterface = props.selectionInterface, model = props.model;
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var results = Object.values(lazyResults.results);
    if (results.length === 0) {
        return null;
    }
    else if (model.get('spellcheck')) {
        var showingResultsForFields = lazyResults.showingResultsForFields, didYouMeanFields = lazyResults.didYouMeanFields;
        var showingResultsFor = createShowResultText(showingResultsForFields);
        var didYouMean = createDidYouMeanText(didYouMeanFields);
        return (React.createElement(React.Fragment, null,
            showingResultsFor !== null && (React.createElement(ShowingResultsForContainer, null,
                showingResultsFor,
                showingResultsForFields !== null &&
                    showingResultsForFields !== undefined &&
                    showingResultsForFields.length > 2 && (React.createElement(ShowMore, { onClick: function () {
                        setExpandShowingResultForText(!expandShowingResultForText);
                    } }, expandShowingResultForText ? 'less' : 'more')))),
            didYouMean !== null && (React.createElement(DidYouMeanContainer, null,
                React.createElement(ResendQuery, { onClick: function () {
                        rerunQuery(model);
                    } }, didYouMean),
                didYouMeanFields !== null &&
                    didYouMeanFields !== undefined &&
                    didYouMeanFields.length > 2 && (React.createElement(ShowMore, { onClick: function () {
                        setExpandDidYouMeanFieldText(!expandDidYouMeanFieldText);
                    } }, expandDidYouMeanFieldText ? 'less' : 'more'))))));
    }
    return null;
};
export default hot(module)(Spellcheck);
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=spellcheck.js.map