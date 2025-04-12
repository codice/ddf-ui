import { __makeTemplateObject } from "tslib";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import styled from 'styled-components';
import SourceItem from '../source-item';
import SourcesSummary from '../sources-summary';
import { useSources } from '../../js/model/Startup/sources.hooks';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  display: block;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n"], ["\n  display: block;\n  height: 100%;\n  width: 100%;\n  overflow: hidden;\n"])));
var SourcesCenter = styled.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  margin: auto;\n  max-width: ", ";\n  padding: 0px\n    ", ";\n  overflow: auto;\n  height: 100%;\n"], ["\n  margin: auto;\n  max-width: ", ";\n  padding: 0px\n    ", ";\n  overflow: auto;\n  height: 100%;\n"])), function (props) {
    return props.theme.screenBelow(props.theme.mediumScreenSize)
        ? '100%'
        : '1200px';
}, function (props) {
    return props.theme.screenBelow(props.theme.mediumScreenSize) ? '20px' : '100px';
});
export default (function () {
    var sources = useSources().sources;
    var amountDown = sources.reduce(function (blob, source) {
        if (source.available === false) {
            return blob + 1;
        }
        return blob;
    }, 0);
    return (_jsx(Root, { children: _jsxs(SourcesCenter, { children: [_jsx(SourcesSummary, { amountDown: amountDown }), sources.map(function (source) {
                    return (_jsx(SourceItem, { sourceActions: source.sourceActions, id: source.id, available: source.available }, source.id));
                })] }) }));
});
var templateObject_1, templateObject_2;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VudGF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9zb3VyY2VzL3ByZXNlbnRhdGlvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBRUosT0FBTyxNQUFNLE1BQU0sbUJBQW1CLENBQUE7QUFDdEMsT0FBTyxVQUFVLE1BQU0sZ0JBQWdCLENBQUE7QUFDdkMsT0FBTyxjQUFjLE1BQU0sb0JBQW9CLENBQUE7QUFDL0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNDQUFzQyxDQUFBO0FBRWpFLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxHQUFHLGdKQUFBLDZFQUt0QixJQUFBLENBQUE7QUFFRCxJQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsR0FBRywyS0FBQSxrQ0FFakIsRUFJWix5QkFFRyxFQUN3RSx5Q0FHN0UsS0FWYyxVQUFDLEtBQUs7SUFDakIsT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDO1FBQzFELENBQUMsQ0FBQyxNQUFNO1FBQ1IsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtBQUNkLENBQUMsRUFFRyxVQUFDLEtBQUs7SUFDTixPQUFBLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPO0FBQXhFLENBQXdFLENBRzdFLENBQUE7QUFFRCxnQkFBZTtJQUNMLElBQUEsT0FBTyxHQUFLLFVBQVUsRUFBRSxRQUFqQixDQUFpQjtJQUNoQyxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUMsSUFBSSxFQUFFLE1BQU07UUFDN0MsSUFBSSxNQUFNLENBQUMsU0FBUyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQy9CLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQTtRQUNqQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDTCxPQUFPLENBQ0wsS0FBQyxJQUFJLGNBQ0gsTUFBQyxhQUFhLGVBQ1osS0FBQyxjQUFjLElBQUMsVUFBVSxFQUFFLFVBQVUsR0FBSSxFQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTTtvQkFDbEIsT0FBTyxDQUNMLEtBQUMsVUFBVSxJQUVULGFBQWEsRUFBRSxNQUFNLENBQUMsYUFBYSxFQUNuQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFDYixTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsSUFIdEIsTUFBTSxDQUFDLEVBQUUsQ0FJZCxDQUNILENBQUE7Z0JBQ0gsQ0FBQyxDQUFDLElBQ1ksR0FDWCxDQUNSLENBQUE7QUFDSCxDQUFDLEVBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCBTb3VyY2VJdGVtIGZyb20gJy4uL3NvdXJjZS1pdGVtJ1xuaW1wb3J0IFNvdXJjZXNTdW1tYXJ5IGZyb20gJy4uL3NvdXJjZXMtc3VtbWFyeSdcbmltcG9ydCB7IHVzZVNvdXJjZXMgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3NvdXJjZXMuaG9va3MnXG5cbmNvbnN0IFJvb3QgPSBzdHlsZWQuZGl2YFxuICBkaXNwbGF5OiBibG9jaztcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMTAwJTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbmBcblxuY29uc3QgU291cmNlc0NlbnRlciA9IHN0eWxlZC5kaXZgXG4gIG1hcmdpbjogYXV0bztcbiAgbWF4LXdpZHRoOiAkeyhwcm9wcykgPT4ge1xuICAgIHJldHVybiBwcm9wcy50aGVtZS5zY3JlZW5CZWxvdyhwcm9wcy50aGVtZS5tZWRpdW1TY3JlZW5TaXplKVxuICAgICAgPyAnMTAwJSdcbiAgICAgIDogJzEyMDBweCdcbiAgfX07XG4gIHBhZGRpbmc6IDBweFxuICAgICR7KHByb3BzKSA9PlxuICAgICAgcHJvcHMudGhlbWUuc2NyZWVuQmVsb3cocHJvcHMudGhlbWUubWVkaXVtU2NyZWVuU2l6ZSkgPyAnMjBweCcgOiAnMTAwcHgnfTtcbiAgb3ZlcmZsb3c6IGF1dG87XG4gIGhlaWdodDogMTAwJTtcbmBcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4ge1xuICBjb25zdCB7IHNvdXJjZXMgfSA9IHVzZVNvdXJjZXMoKVxuICBjb25zdCBhbW91bnREb3duID0gc291cmNlcy5yZWR1Y2UoKGJsb2IsIHNvdXJjZSkgPT4ge1xuICAgIGlmIChzb3VyY2UuYXZhaWxhYmxlID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGJsb2IgKyAxXG4gICAgfVxuICAgIHJldHVybiBibG9iXG4gIH0sIDApXG4gIHJldHVybiAoXG4gICAgPFJvb3Q+XG4gICAgICA8U291cmNlc0NlbnRlcj5cbiAgICAgICAgPFNvdXJjZXNTdW1tYXJ5IGFtb3VudERvd249e2Ftb3VudERvd259IC8+XG4gICAgICAgIHtzb3VyY2VzLm1hcCgoc291cmNlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxTb3VyY2VJdGVtXG4gICAgICAgICAgICAgIGtleT17c291cmNlLmlkfVxuICAgICAgICAgICAgICBzb3VyY2VBY3Rpb25zPXtzb3VyY2Uuc291cmNlQWN0aW9uc31cbiAgICAgICAgICAgICAgaWQ9e3NvdXJjZS5pZH1cbiAgICAgICAgICAgICAgYXZhaWxhYmxlPXtzb3VyY2UuYXZhaWxhYmxlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgPC9Tb3VyY2VzQ2VudGVyPlxuICAgIDwvUm9vdD5cbiAgKVxufVxuIl19