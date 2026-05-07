import { __makeTemplateObject, __read, __spreadArray } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
        return (_jsxs(_Fragment, { children: [showingResultsFor !== null && (_jsxs(ShowingResultsForContainer, { children: [showingResultsFor, showingResultsForFields !== null &&
                            showingResultsForFields !== undefined &&
                            showingResultsForFields.length > 2 && (_jsx(ShowMore, { onClick: function () {
                                setExpandShowingResultForText(!expandShowingResultForText);
                            }, children: expandShowingResultForText ? 'less' : 'more' }))] })), didYouMean !== null && (_jsxs(DidYouMeanContainer, { children: [_jsx(ResendQuery, { onClick: function () {
                                rerunQuery(model);
                            }, children: didYouMean }), didYouMeanFields !== null &&
                            didYouMeanFields !== undefined &&
                            didYouMeanFields.length > 2 && (_jsx(ShowMore, { onClick: function () {
                                setExpandDidYouMeanFieldText(!expandDidYouMeanFieldText);
                            }, children: expandDidYouMeanFieldText ? 'less' : 'more' }))] }))] }));
    }
    return null;
};
export default Spellcheck;
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BlbGxjaGVjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvc3BlbGxjaGVjay9zcGVsbGNoZWNrLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUU5QixPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsb0NBQW9DLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQTtBQUVuRixJQUFNLGdCQUFnQixHQUFHLENBQUMsQ0FBQTtBQU8xQixJQUFNLDBCQUEwQixHQUFHLE1BQU0sQ0FBQyxHQUFHLHNLQUFBLG1HQUs1QyxJQUFBLENBQUE7QUFFRCxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxtSEFBQSxnREFHeEIsSUFBQSxDQUFBO0FBRUQsSUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsR0FBRywwSEFBQSx1REFHckMsSUFBQSxDQUFBO0FBRUQsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLENBQUMsb0xBQUEsaUhBTTNCLElBQUEsQ0FBQTtBQUVELElBQU0sVUFBVSxHQUFHLFVBQUMsS0FBWTtJQUN4QixJQUFBLEtBQUEsT0FDSixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFBLEVBRGhCLDBCQUEwQixRQUFBLEVBQUUsNkJBQTZCLFFBQ3pDLENBQUE7SUFDakIsSUFBQSxLQUFBLE9BQ0osS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQURoQix5QkFBeUIsUUFBQSxFQUFFLDRCQUE0QixRQUN2QyxDQUFBO0lBRXZCLElBQU0sb0JBQW9CLEdBQUcsVUFBQyx1QkFBOEI7UUFDMUQsSUFBSSxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FBQTtRQUM5QyxJQUNFLHVCQUF1QixLQUFLLFNBQVM7WUFDckMsdUJBQXVCLEtBQUssSUFBSTtZQUNoQyx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNsQyxDQUFDO1lBQ0QsSUFBSSxDQUFDLDBCQUEwQixJQUFJLHVCQUF1QixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDdEUsaUJBQWlCLElBQUksNkJBQTZCLENBQ2hELHVCQUF1QixDQUN4QixDQUFBO2dCQUNELE9BQU8saUJBQWlCLENBQUE7WUFDMUIsQ0FBQztZQUVELGlCQUFpQixJQUFJLDRCQUE0QixDQUFDLHVCQUF1QixDQUFDLENBQUE7WUFDMUUsT0FBTyxpQkFBaUIsQ0FBQTtRQUMxQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLENBQUE7SUFFRCxJQUFNLG9CQUFvQixHQUFHLFVBQUMsZ0JBQXVCO1FBQ25ELElBQUksVUFBVSxHQUFHLGVBQWUsQ0FBQTtRQUNoQyxJQUNFLGdCQUFnQixLQUFLLFNBQVM7WUFDOUIsZ0JBQWdCLEtBQUssSUFBSTtZQUN6QixnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUMzQixDQUFDO1lBQ0QsSUFBSSxDQUFDLHlCQUF5QixJQUFJLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDOUQsVUFBVSxJQUFJLDZCQUE2QixDQUFDLGdCQUFnQixDQUFDLENBQUE7Z0JBQzdELE9BQU8sVUFBVSxDQUFBO1lBQ25CLENBQUM7WUFDRCxVQUFVLElBQUksNEJBQTRCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtZQUM1RCxPQUFPLFVBQVUsQ0FBQTtRQUNuQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLENBQUE7SUFFRCxJQUFNLDZCQUE2QixHQUFHLFVBQUMsdUJBQThCO1FBQ25FLElBQU0sU0FBUyw0QkFBTyx1QkFBdUIsU0FBQyxDQUFBO1FBQzlDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQTtRQUN4RCxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0IsQ0FBQyxDQUFBO0lBRUQsSUFBTSw0QkFBNEIsR0FBRyxVQUFDLHVCQUE4QjtRQUNsRSxPQUFPLHVCQUF1QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMzQyxDQUFDLENBQUE7SUFFRCxJQUFNLFVBQVUsR0FBRyxVQUFDLEtBQVU7UUFDNUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDOUIsS0FBSyxDQUFDLHdCQUF3QixFQUFFLENBQUE7UUFDaEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDL0IsQ0FBQyxDQUFBO0lBRU8sSUFBQSxrQkFBa0IsR0FBWSxLQUFLLG1CQUFqQixFQUFFLEtBQUssR0FBSyxLQUFLLE1BQVYsQ0FBVTtJQUMzQyxJQUFNLFdBQVcsR0FBRyxvQ0FBb0MsQ0FBQztRQUN2RCxrQkFBa0Isb0JBQUE7S0FDbkIsQ0FBQyxDQUFBO0lBQ0YsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDbEQsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztTQUFNLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDO1FBQzNCLElBQUEsdUJBQXVCLEdBQXVCLFdBQVcsd0JBQWxDLEVBQUUsZ0JBQWdCLEdBQUssV0FBVyxpQkFBaEIsQ0FBZ0I7UUFDakUsSUFBTSxpQkFBaUIsR0FBRyxvQkFBb0IsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO1FBQ3ZFLElBQU0sVUFBVSxHQUFHLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLENBQUE7UUFFekQsT0FBTyxDQUNMLDhCQUNHLGlCQUFpQixLQUFLLElBQUksSUFBSSxDQUM3QixNQUFDLDBCQUEwQixlQUN4QixpQkFBaUIsRUFDakIsdUJBQXVCLEtBQUssSUFBSTs0QkFDL0IsdUJBQXVCLEtBQUssU0FBUzs0QkFDckMsdUJBQXVCLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUNwQyxLQUFDLFFBQVEsSUFDUCxPQUFPLEVBQUU7Z0NBQ1AsNkJBQTZCLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFBOzRCQUM1RCxDQUFDLFlBRUEsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUNwQyxDQUNaLElBQ3dCLENBQzlCLEVBQ0EsVUFBVSxLQUFLLElBQUksSUFBSSxDQUN0QixNQUFDLG1CQUFtQixlQUNsQixLQUFDLFdBQVcsSUFDVixPQUFPLEVBQUU7Z0NBQ1AsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFBOzRCQUNuQixDQUFDLFlBRUEsVUFBVSxHQUNDLEVBQ2IsZ0JBQWdCLEtBQUssSUFBSTs0QkFDeEIsZ0JBQWdCLEtBQUssU0FBUzs0QkFDOUIsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUM3QixLQUFDLFFBQVEsSUFDUCxPQUFPLEVBQUU7Z0NBQ1AsNEJBQTRCLENBQUMsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBOzRCQUMxRCxDQUFDLFlBRUEseUJBQXlCLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUNuQyxDQUNaLElBQ2lCLENBQ3ZCLElBQ0EsQ0FDSixDQUFBO0lBQ0gsQ0FBQztJQUNELE9BQU8sSUFBSSxDQUFBO0FBQ2IsQ0FBQyxDQUFBO0FBRUQsZUFBZSxVQUFVLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgc3R5bGVkIGZyb20gJ3N0eWxlZC1jb21wb25lbnRzJ1xuaW1wb3J0IHsgdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWludGVyZmFjZS9ob29rcydcblxuY29uc3QgU0hPV19NT1JFX0xFTkdUSCA9IDJcblxudHlwZSBQcm9wcyA9IHtcbiAgc2VsZWN0aW9uSW50ZXJmYWNlOiBhbnlcbiAgbW9kZWw6IGFueVxufVxuXG5jb25zdCBTaG93aW5nUmVzdWx0c0ZvckNvbnRhaW5lciA9IHN0eWxlZC5kaXZgXG4gIHBhZGRpbmc6IDAuMTVyZW07XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgZm9udC1zaXplOiAwLjc1cmVtO1xuICBib3JkZXI6IG5vbmUgIWltcG9ydGFudDtcbmBcblxuY29uc3QgU2hvd01vcmUgPSBzdHlsZWQuYWBcbiAgcGFkZGluZzogMC4xNXJlbTtcbiAgZm9udC1zaXplOiAwLjc1cmVtO1xuYFxuXG5jb25zdCBEaWRZb3VNZWFuQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBib3JkZXI6IG5vbmUgIWltcG9ydGFudDtcbmBcblxuY29uc3QgUmVzZW5kUXVlcnkgPSBzdHlsZWQuYWBcbiAgcGFkZGluZzogMC4xNXJlbTtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBmb250LXNpemU6IDAuNzVyZW07XG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcbiAgd2lkdGg6IDEwMCU7XG5gXG5cbmNvbnN0IFNwZWxsY2hlY2sgPSAocHJvcHM6IFByb3BzKSA9PiB7XG4gIGNvbnN0IFtleHBhbmRTaG93aW5nUmVzdWx0Rm9yVGV4dCwgc2V0RXhwYW5kU2hvd2luZ1Jlc3VsdEZvclRleHRdID1cbiAgICBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZERpZFlvdU1lYW5GaWVsZFRleHQsIHNldEV4cGFuZERpZFlvdU1lYW5GaWVsZFRleHRdID1cbiAgICBSZWFjdC51c2VTdGF0ZShmYWxzZSlcblxuICBjb25zdCBjcmVhdGVTaG93UmVzdWx0VGV4dCA9IChzaG93aW5nUmVzdWx0c0ZvckZpZWxkczogYW55W10pID0+IHtcbiAgICBsZXQgc2hvd2luZ1Jlc3VsdHNGb3IgPSAnU2hvd2luZyBSZXN1bHRzIGZvciAnXG4gICAgaWYgKFxuICAgICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMgIT09IG51bGwgJiZcbiAgICAgIHNob3dpbmdSZXN1bHRzRm9yRmllbGRzLmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIGlmICghZXhwYW5kU2hvd2luZ1Jlc3VsdEZvclRleHQgJiYgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMubGVuZ3RoID4gMikge1xuICAgICAgICBzaG93aW5nUmVzdWx0c0ZvciArPSBjcmVhdGVDb25kZW5zZWRSZXN1bHRzRm9yVGV4dChcbiAgICAgICAgICBzaG93aW5nUmVzdWx0c0ZvckZpZWxkc1xuICAgICAgICApXG4gICAgICAgIHJldHVybiBzaG93aW5nUmVzdWx0c0ZvclxuICAgICAgfVxuXG4gICAgICBzaG93aW5nUmVzdWx0c0ZvciArPSBjcmVhdGVFeHBhbmRlZFJlc3VsdHNGb3JUZXh0KHNob3dpbmdSZXN1bHRzRm9yRmllbGRzKVxuICAgICAgcmV0dXJuIHNob3dpbmdSZXN1bHRzRm9yXG4gICAgfVxuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCBjcmVhdGVEaWRZb3VNZWFuVGV4dCA9IChkaWRZb3VNZWFuRmllbGRzOiBhbnlbXSkgPT4ge1xuICAgIGxldCBkaWRZb3VNZWFuID0gJ0RpZCB5b3UgbWVhbiAnXG4gICAgaWYgKFxuICAgICAgZGlkWW91TWVhbkZpZWxkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBkaWRZb3VNZWFuRmllbGRzICE9PSBudWxsICYmXG4gICAgICBkaWRZb3VNZWFuRmllbGRzLmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIGlmICghZXhwYW5kRGlkWW91TWVhbkZpZWxkVGV4dCAmJiBkaWRZb3VNZWFuRmllbGRzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgZGlkWW91TWVhbiArPSBjcmVhdGVDb25kZW5zZWRSZXN1bHRzRm9yVGV4dChkaWRZb3VNZWFuRmllbGRzKVxuICAgICAgICByZXR1cm4gZGlkWW91TWVhblxuICAgICAgfVxuICAgICAgZGlkWW91TWVhbiArPSBjcmVhdGVFeHBhbmRlZFJlc3VsdHNGb3JUZXh0KGRpZFlvdU1lYW5GaWVsZHMpXG4gICAgICByZXR1cm4gZGlkWW91TWVhblxuICAgIH1cbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgY3JlYXRlQ29uZGVuc2VkUmVzdWx0c0ZvclRleHQgPSAoc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHM6IGFueVtdKSA9PiB7XG4gICAgY29uc3QgY29weVF1ZXJ5ID0gWy4uLnNob3dpbmdSZXN1bHRzRm9yRmllbGRzXVxuICAgIGNvcHlRdWVyeS5zcGxpY2UoMCwgY29weVF1ZXJ5Lmxlbmd0aCAtIFNIT1dfTU9SRV9MRU5HVEgpXG4gICAgcmV0dXJuIGNvcHlRdWVyeS5qb2luKCcsICcpXG4gIH1cblxuICBjb25zdCBjcmVhdGVFeHBhbmRlZFJlc3VsdHNGb3JUZXh0ID0gKHNob3dpbmdSZXN1bHRzRm9yRmllbGRzOiBhbnlbXSkgPT4ge1xuICAgIHJldHVybiBzaG93aW5nUmVzdWx0c0ZvckZpZWxkcy5qb2luKCcsICcpXG4gIH1cblxuICBjb25zdCByZXJ1blF1ZXJ5ID0gKG1vZGVsOiBhbnkpID0+IHtcbiAgICBtb2RlbC5zZXQoJ3NwZWxsY2hlY2snLCBmYWxzZSlcbiAgICBtb2RlbC5zdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UoKVxuICAgIG1vZGVsLnNldCgnc3BlbGxjaGVjaycsIHRydWUpXG4gIH1cblxuICBjb25zdCB7IHNlbGVjdGlvbkludGVyZmFjZSwgbW9kZWwgfSA9IHByb3BzXG4gIGNvbnN0IGxhenlSZXN1bHRzID0gdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlKHtcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIH0pXG4gIGNvbnN0IHJlc3VsdHMgPSBPYmplY3QudmFsdWVzKGxhenlSZXN1bHRzLnJlc3VsdHMpXG4gIGlmIChyZXN1bHRzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsXG4gIH0gZWxzZSBpZiAobW9kZWwuZ2V0KCdzcGVsbGNoZWNrJykpIHtcbiAgICBjb25zdCB7IHNob3dpbmdSZXN1bHRzRm9yRmllbGRzLCBkaWRZb3VNZWFuRmllbGRzIH0gPSBsYXp5UmVzdWx0c1xuICAgIGNvbnN0IHNob3dpbmdSZXN1bHRzRm9yID0gY3JlYXRlU2hvd1Jlc3VsdFRleHQoc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMpXG4gICAgY29uc3QgZGlkWW91TWVhbiA9IGNyZWF0ZURpZFlvdU1lYW5UZXh0KGRpZFlvdU1lYW5GaWVsZHMpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPD5cbiAgICAgICAge3Nob3dpbmdSZXN1bHRzRm9yICE9PSBudWxsICYmIChcbiAgICAgICAgICA8U2hvd2luZ1Jlc3VsdHNGb3JDb250YWluZXI+XG4gICAgICAgICAgICB7c2hvd2luZ1Jlc3VsdHNGb3J9XG4gICAgICAgICAgICB7c2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgc2hvd2luZ1Jlc3VsdHNGb3JGaWVsZHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICBzaG93aW5nUmVzdWx0c0ZvckZpZWxkcy5sZW5ndGggPiAyICYmIChcbiAgICAgICAgICAgICAgICA8U2hvd01vcmVcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0RXhwYW5kU2hvd2luZ1Jlc3VsdEZvclRleHQoIWV4cGFuZFNob3dpbmdSZXN1bHRGb3JUZXh0KVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7ZXhwYW5kU2hvd2luZ1Jlc3VsdEZvclRleHQgPyAnbGVzcycgOiAnbW9yZSd9XG4gICAgICAgICAgICAgICAgPC9TaG93TW9yZT5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L1Nob3dpbmdSZXN1bHRzRm9yQ29udGFpbmVyPlxuICAgICAgICApfVxuICAgICAgICB7ZGlkWW91TWVhbiAhPT0gbnVsbCAmJiAoXG4gICAgICAgICAgPERpZFlvdU1lYW5Db250YWluZXI+XG4gICAgICAgICAgICA8UmVzZW5kUXVlcnlcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHJlcnVuUXVlcnkobW9kZWwpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtkaWRZb3VNZWFufVxuICAgICAgICAgICAgPC9SZXNlbmRRdWVyeT5cbiAgICAgICAgICAgIHtkaWRZb3VNZWFuRmllbGRzICE9PSBudWxsICYmXG4gICAgICAgICAgICAgIGRpZFlvdU1lYW5GaWVsZHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICBkaWRZb3VNZWFuRmllbGRzLmxlbmd0aCA+IDIgJiYgKFxuICAgICAgICAgICAgICAgIDxTaG93TW9yZVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRFeHBhbmREaWRZb3VNZWFuRmllbGRUZXh0KCFleHBhbmREaWRZb3VNZWFuRmllbGRUZXh0KVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7ZXhwYW5kRGlkWW91TWVhbkZpZWxkVGV4dCA/ICdsZXNzJyA6ICdtb3JlJ31cbiAgICAgICAgICAgICAgICA8L1Nob3dNb3JlPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgIDwvRGlkWW91TWVhbkNvbnRhaW5lcj5cbiAgICAgICAgKX1cbiAgICAgIDwvPlxuICAgIClcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnQgZGVmYXVsdCBTcGVsbGNoZWNrXG4iXX0=