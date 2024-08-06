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
import ThemeContainer from '../../react-component/theme';
import { IntlProvider } from 'react-intl';
import { Provider as ThemeProvider } from '../../component/theme/theme';
import { SnackProvider } from '../../component/snack/snack.provider';
import { DialogProvider } from '../../component/dialog';
import { HashRouter as Router } from 'react-router-dom';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
var ProviderContainer = function (props) {
    var getI18n = useConfiguration().getI18n;
    return (React.createElement(React.Fragment, null,
        React.createElement(ThemeContainer, null,
            React.createElement(IntlProvider, { locale: navigator.language, messages: getI18n() },
                React.createElement(ThemeProvider, null,
                    React.createElement(Router, null,
                        React.createElement(SnackProvider, null,
                            React.createElement(DialogProvider, null,
                                React.createElement(React.Fragment, null, props.children)))))))));
};
export default hot(module)(ProviderContainer);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXJzLmNvbnRhaW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9leHRlbnNpb24tcG9pbnRzL3Byb3ZpZGVycy9wcm92aWRlcnMuY29udGFpbmVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBRXRDLE9BQU8sY0FBYyxNQUFNLDZCQUE2QixDQUFBO0FBQ3hELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxZQUFZLENBQUE7QUFDekMsT0FBTyxFQUFFLFFBQVEsSUFBSSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQTtBQUN2RSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0NBQXNDLENBQUE7QUFDcEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3ZELE9BQU8sRUFBRSxVQUFVLElBQUksTUFBTSxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNENBQTRDLENBQUE7QUFNN0UsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLEtBQVk7SUFDN0IsSUFBQSxPQUFPLEdBQUssZ0JBQWdCLEVBQUUsUUFBdkIsQ0FBdUI7SUFDdEMsT0FBTyxDQUNMLG9CQUFDLEtBQUssQ0FBQyxRQUFRO1FBQ2Isb0JBQUMsY0FBYztZQUNiLG9CQUFDLFlBQVksSUFBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFO2dCQUMzRCxvQkFBQyxhQUFhO29CQUNaLG9CQUFDLE1BQU07d0JBQ0wsb0JBQUMsYUFBYTs0QkFDWixvQkFBQyxjQUFjO2dDQUNiLDBDQUFHLEtBQUssQ0FBQyxRQUFRLENBQUksQ0FDTixDQUNILENBQ1QsQ0FDSyxDQUNILENBQ0EsQ0FDRixDQUNsQixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuXG5pbXBvcnQgVGhlbWVDb250YWluZXIgZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3RoZW1lJ1xuaW1wb3J0IHsgSW50bFByb3ZpZGVyIH0gZnJvbSAncmVhY3QtaW50bCdcbmltcG9ydCB7IFByb3ZpZGVyIGFzIFRoZW1lUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvdGhlbWUvdGhlbWUnXG5pbXBvcnQgeyBTbmFja1Byb3ZpZGVyIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3NuYWNrL3NuYWNrLnByb3ZpZGVyJ1xuaW1wb3J0IHsgRGlhbG9nUHJvdmlkZXIgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvZGlhbG9nJ1xuaW1wb3J0IHsgSGFzaFJvdXRlciBhcyBSb3V0ZXIgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xuaW1wb3J0IHsgdXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvY29uZmlndXJhdGlvbi5ob29rcydcblxuZXhwb3J0IHR5cGUgUHJvcHMgPSB7XG4gIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGVcbn1cblxuY29uc3QgUHJvdmlkZXJDb250YWluZXIgPSAocHJvcHM6IFByb3BzKSA9PiB7XG4gIGNvbnN0IHsgZ2V0STE4biB9ID0gdXNlQ29uZmlndXJhdGlvbigpXG4gIHJldHVybiAoXG4gICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgPFRoZW1lQ29udGFpbmVyPlxuICAgICAgICA8SW50bFByb3ZpZGVyIGxvY2FsZT17bmF2aWdhdG9yLmxhbmd1YWdlfSBtZXNzYWdlcz17Z2V0STE4bigpfT5cbiAgICAgICAgICA8VGhlbWVQcm92aWRlcj5cbiAgICAgICAgICAgIDxSb3V0ZXI+XG4gICAgICAgICAgICAgIDxTbmFja1Byb3ZpZGVyPlxuICAgICAgICAgICAgICAgIDxEaWFsb2dQcm92aWRlcj5cbiAgICAgICAgICAgICAgICAgIDw+e3Byb3BzLmNoaWxkcmVufTwvPlxuICAgICAgICAgICAgICAgIDwvRGlhbG9nUHJvdmlkZXI+XG4gICAgICAgICAgICAgIDwvU25hY2tQcm92aWRlcj5cbiAgICAgICAgICAgIDwvUm91dGVyPlxuICAgICAgICAgIDwvVGhlbWVQcm92aWRlcj5cbiAgICAgICAgPC9JbnRsUHJvdmlkZXI+XG4gICAgICA8L1RoZW1lQ29udGFpbmVyPlxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoUHJvdmlkZXJDb250YWluZXIpXG4iXX0=