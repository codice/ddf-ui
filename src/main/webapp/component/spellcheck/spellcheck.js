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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlbGxjaGVjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvc3BlbGxjaGVjay9zcGVsbGNoZWNrLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsb0NBQW9DLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQTtBQUVuRixJQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQTtBQU8xQixJQUFNLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxHQUFHLHNLQUFBLG1HQUs1QyxJQUFBLENBQUE7QUFFRCxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxtSEFBQSxnREFHeEIsSUFBQSxDQUFBO0FBRUQsSUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsR0FBRywwSEFBQSx1REFHckMsSUFBQSxDQUFBO0FBRUQsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsb0xBQUEsaUhBTTNCLElBQUEsQ0FBQTtBQUVELElBQU0sVUFBVSxHQUFHLFVBQUMsS0FBWTtJQUN4QixJQUFBLEtBQUEsT0FDSixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFBLEVBRGhCLDBCQUEwQixRQUFBLEVBQUUsNkJBQTZCLFFBQ3pDLENBQUE7SUFDakIsSUFBQSxLQUFBLE9BQ0osS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQURoQix5QkFBeUIsUUFBQSxFQUFFLDRCQUE0QixRQUN2QyxDQUFBO0lBRXZCLElBQU0sb0JBQW9CLEdBQUcsVUFBQyx1QkFBOEI7UUFDMUQsSUFBSSxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FB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QUk7b0JBQy9CLHVCQUF1QixLQUFLLFNBQVM7b0JBQ3JDLHVCQUF1QixDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FDcEMsb0JBQUMsUUFBUSxJQUNQLE9BQU8sRUFBRTt3QkFDUCw2QkFBNkIsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUE7b0JBQzVELENBQUMsSUFFQSwwQkFBMEIsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQ3BDLENBQ1osQ0FDd0IsQ0FDOUI7WUFDQSxVQUFVLEtBQUssSUFBSSxJQUFJLENBQ3RCLG9CQUFDLG1CQUFtQjtnQkFDbEIsb0JBQUMsV0FBVyxJQUNWLE9BQU8sRUFBRTt3QkFDUCxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUE7b0JBQ25CLENBQUMsSUFFQSxVQUFVLENBQ0M7Z0JBQ2IsZ0JBQWdCLEtBQUssSUFBSTtvQkFDeEIsZ0JBQWdCLEtBQUssU0FBUztvQkFDOUIsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUM3QixvQkFBQyxRQUFRLElBQ1AsT0FBTyxFQUFFO3dCQUNQLDRCQUE0QixDQUFDLENBQUMseUJBQXlCLENBQUMsQ0FBQTtvQkFDMUQsQ0FBQyxJQUVBLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FDbkMsQ0FDWixDQUNpQixDQUN2QixDQUNBLENBQ0osQ0FBQTtLQUNGO0lBQ0QsT0FBTyxJQUFJLENBQUE7QUFDYixDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCB7IHVzZUxhenlSZXN1bHRzRnJvbVNlbGVjdGlvbkludGVyZmFjZSB9IGZyb20gJy4uL3NlbGVjdGlvbi1pbnRlcmZhY2UvaG9va3MnXG5cbmNvbnN0IFNIT1dfTU9SRV9MRU5HVEggPSAyXG5cbnR5cGUgUHJvcHMgPSB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG4gIG1vZGVsOiBhbnlcbn1cblxuY29uc3QgU2hvd2luZ1Jlc3VsdHNGb3JDb250YWluZXIgPSBzdHlsZWQuZGl2YFxuICBwYWRkaW5nOiAwLjE1cmVtO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcbiAgYm9yZGVyOiBub25lICFpbXBvcnRhbnQ7XG5gXG5cbmNvbnN0IFNob3dNb3JlID0gc3R5bGVkLmFgXG4gIHBhZGRpbmc6IDAuMTVyZW07XG4gIGZvbnQtc2l6ZTogMC43NXJlbTtcbmBcblxuY29uc3QgRGlkWW91TWVhbkNvbnRhaW5lciA9IHN0eWxlZC5kaXZgXG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgYm9yZGVyOiBub25lICFpbXBvcnRhbnQ7XG5gXG5cbmNvbnN0IFJlc2VuZFF1ZXJ5ID0gc3R5bGVkLmFgXG4gIHBhZGRpbmc6IDAuMTVyZW07XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgZm9udC1zaXplOiAwLjc1cmVtO1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gIHdpZHRoOiAxMDAlO1xuYFxuXG5jb25zdCBTcGVsbGNoZWNrID0gKHByb3BzOiBQcm9wcykgPT4ge1xuICBjb25zdCBbZXhwYW5kU2hvd2luZ1Jlc3VsdEZvclRleHQsIHNldEV4cGFuZFNob3dpbmdSZXN1bHRGb3JUZXh0XSA9XG4gICAgUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBhbmREaWRZb3VNZWFuRmllbGRUZXh0LCBzZXRFeHBhbmREaWRZb3VNZWFuRmllbGRUZXh0XSA9XG4gICAgUmVhY3QudXNlU3RhdGUoZmFsc2UpXG5cbiAgY29uc3QgY3JlYXRlU2hvd1Jlc3VsdFRleHQgPSAoc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHM6IGFueVtdKSA9PiB7XG4gICAgbGV0IHNob3dpbmdSZXN1bHRzRm9yID0gJ1Nob3dpbmcgUmVzdWx0cyBmb3IgJ1xuICAgIGlmIChcbiAgICAgIHNob3dpbmdSZXN1bHRzRm9yRmllbGRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHNob3dpbmdSZXN1bHRzRm9yRmllbGRzICE9PSBudWxsICYmXG4gICAgICBzaG93aW5nUmVzdWx0c0ZvckZpZWxkcy5sZW5ndGggPiAwXG4gICAgKSB7XG4gICAgICBpZiAoIWV4cGFuZFNob3dpbmdSZXN1bHRGb3JUZXh0ICYmIHNob3dpbmdSZXN1bHRzRm9yRmllbGRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgc2hvd2luZ1Jlc3VsdHNGb3IgKz0gY3JlYXRlQ29uZGVuc2VkUmVzdWx0c0ZvclRleHQoXG4gICAgICAgICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHNcbiAgICAgICAgKVxuICAgICAgICByZXR1cm4gc2hvd2luZ1Jlc3VsdHNGb3JcbiAgICAgIH1cblxuICAgICAgc2hvd2luZ1Jlc3VsdHNGb3IgKz0gY3JlYXRlRXhwYW5kZWRSZXN1bHRzRm9yVGV4dChzaG93aW5nUmVzdWx0c0ZvckZpZWxkcylcbiAgICAgIHJldHVybiBzaG93aW5nUmVzdWx0c0ZvclxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgY3JlYXRlRGlkWW91TWVhblRleHQgPSAoZGlkWW91TWVhbkZpZWxkczogYW55W10pID0+IHtcbiAgICBsZXQgZGlkWW91TWVhbiA9ICdEaWQgeW91IG1lYW4gJ1xuICAgIGlmIChcbiAgICAgIGRpZFlvdU1lYW5GaWVsZHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgZGlkWW91TWVhbkZpZWxkcyAhPT0gbnVsbCAmJlxuICAgICAgZGlkWW91TWVhbkZpZWxkcy5sZW5ndGggPiAwXG4gICAgKSB7XG4gICAgICBpZiAoIWV4cGFuZERpZFlvdU1lYW5GaWVsZFRleHQgJiYgZGlkWW91TWVhbkZpZWxkcy5sZW5ndGggPiAyKSB7XG4gICAgICAgIGRpZFlvdU1lYW4gKz0gY3JlYXRlQ29uZGVuc2VkUmVzdWx0c0ZvclRleHQoZGlkWW91TWVhbkZpZWxkcylcbiAgICAgICAgcmV0dXJuIGRpZFlvdU1lYW5cbiAgICAgIH1cbiAgICAgIGRpZFlvdU1lYW4gKz0gY3JlYXRlRXhwYW5kZWRSZXN1bHRzRm9yVGV4dChkaWRZb3VNZWFuRmllbGRzKVxuICAgICAgcmV0dXJuIGRpZFlvdU1lYW5cbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGNyZWF0ZUNvbmRlbnNlZFJlc3VsdHNGb3JUZXh0ID0gKHNob3dpbmdSZXN1bHRzRm9yRmllbGRzOiBhbnlbXSkgPT4ge1xuICAgIGNvbnN0IGNvcHlRdWVyeSA9IFsuLi5zaG93aW5nUmVzdWx0c0ZvckZpZWxkc11cbiAgICBjb3B5UXVlcnkuc3BsaWNlKDAsIGNvcHlRdWVyeS5sZW5ndGggLSBTSE9XX01PUkVfTEVOR1RIKVxuICAgIHJldHVybiBjb3B5UXVlcnkuam9pbignLCAnKVxuICB9XG5cbiAgY29uc3QgY3JlYXRlRXhwYW5kZWRSZXN1bHRzRm9yVGV4dCA9IChzaG93aW5nUmVzdWx0c0ZvckZpZWxkczogYW55W10pID0+IHtcbiAgICByZXR1cm4gc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMuam9pbignLCAnKVxuICB9XG5cbiAgY29uc3QgcmVydW5RdWVyeSA9IChtb2RlbDogYW55KSA9PiB7XG4gICAgbW9kZWwuc2V0KCdzcGVsbGNoZWNrJywgZmFsc2UpXG4gICAgbW9kZWwuc3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlKClcbiAgICBtb2RlbC5zZXQoJ3NwZWxsY2hlY2snLCB0cnVlKVxuICB9XG5cbiAgY29uc3QgeyBzZWxlY3Rpb25JbnRlcmZhY2UsIG1vZGVsIH0gPSBwcm9wc1xuICBjb25zdCBsYXp5UmVzdWx0cyA9IHVzZUxhenlSZXN1bHRzRnJvbVNlbGVjdGlvbkludGVyZmFjZSh7XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuICBjb25zdCByZXN1bHRzID0gT2JqZWN0LnZhbHVlcyhsYXp5UmVzdWx0cy5yZXN1bHRzKVxuICBpZiAocmVzdWx0cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9IGVsc2UgaWYgKG1vZGVsLmdldCgnc3BlbGxjaGVjaycpKSB7XG4gICAgY29uc3QgeyBzaG93aW5nUmVzdWx0c0ZvckZpZWxkcywgZGlkWW91TWVhbkZpZWxkcyB9ID0gbGF6eVJlc3VsdHNcbiAgICBjb25zdCBzaG93aW5nUmVzdWx0c0ZvciA9IGNyZWF0ZVNob3dSZXN1bHRUZXh0KHNob3dpbmdSZXN1bHRzRm9yRmllbGRzKVxuICAgIGNvbnN0IGRpZFlvdU1lYW4gPSBjcmVhdGVEaWRZb3VNZWFuVGV4dChkaWRZb3VNZWFuRmllbGRzKVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDw+XG4gICAgICAgIHtzaG93aW5nUmVzdWx0c0ZvciAhPT0gbnVsbCAmJiAoXG4gICAgICAgICAgPFNob3dpbmdSZXN1bHRzRm9yQ29udGFpbmVyPlxuICAgICAgICAgICAge3Nob3dpbmdSZXN1bHRzRm9yfVxuICAgICAgICAgICAge3Nob3dpbmdSZXN1bHRzRm9yRmllbGRzICE9PSBudWxsICYmXG4gICAgICAgICAgICAgIHNob3dpbmdSZXN1bHRzRm9yRmllbGRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMubGVuZ3RoID4gMiAmJiAoXG4gICAgICAgICAgICAgICAgPFNob3dNb3JlXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldEV4cGFuZFNob3dpbmdSZXN1bHRGb3JUZXh0KCFleHBhbmRTaG93aW5nUmVzdWx0Rm9yVGV4dClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2V4cGFuZFNob3dpbmdSZXN1bHRGb3JUZXh0ID8gJ2xlc3MnIDogJ21vcmUnfVxuICAgICAgICAgICAgICAgIDwvU2hvd01vcmU+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9TaG93aW5nUmVzdWx0c0ZvckNvbnRhaW5lcj5cbiAgICAgICAgKX1cbiAgICAgICAge2RpZFlvdU1lYW4gIT09IG51bGwgJiYgKFxuICAgICAgICAgIDxEaWRZb3VNZWFuQ29udGFpbmVyPlxuICAgICAgICAgICAgPFJlc2VuZFF1ZXJ5XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICByZXJ1blF1ZXJ5KG1vZGVsKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7ZGlkWW91TWVhbn1cbiAgICAgICAgICAgIDwvUmVzZW5kUXVlcnk+XG4gICAgICAgICAgICB7ZGlkWW91TWVhbkZpZWxkcyAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICBkaWRZb3VNZWFuRmllbGRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgZGlkWW91TWVhbkZpZWxkcy5sZW5ndGggPiAyICYmIChcbiAgICAgICAgICAgICAgICA8U2hvd01vcmVcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0RXhwYW5kRGlkWW91TWVhbkZpZWxkVGV4dCghZXhwYW5kRGlkWW91TWVhbkZpZWxkVGV4dClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2V4cGFuZERpZFlvdU1lYW5GaWVsZFRleHQgPyAnbGVzcycgOiAnbW9yZSd9XG4gICAgICAgICAgICAgICAgPC9TaG93TW9yZT5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L0RpZFlvdU1lYW5Db250YWluZXI+XG4gICAgICAgICl9XG4gICAgICA8Lz5cbiAgICApXG4gIH1cbiAgcmV0dXJuIG51bGxcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoU3BlbGxjaGVjaylcbiJdfQ==