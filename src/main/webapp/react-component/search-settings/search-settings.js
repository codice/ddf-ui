import { __makeTemplateObject, __read } from "tslib";
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
import user from '../../component/singletons/user-instance';
import QuerySettings from '../../component/query-settings/query-settings';
import { UserQuery } from '../../js/model/TypedQuery';
import styled from 'styled-components';
import { hot } from 'react-hot-loader';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Input from '@mui/material/Input';
import Swath from '../../component/swath/swath';
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook';
import { MuiOutlinedInputBorderClasses, Elevations, } from '../../component/theme/theme';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
var Root = styled.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  overflow: hidden;\n  padding: ", ";\n"], ["\n  overflow: hidden;\n  padding: ", ";\n"])), function (props) { return props.theme.minimumSpacing; });
var getResultCount = function () {
    return user.get('user').get('preferences').get('resultCount');
};
var SearchSettings = function () {
    var config = useConfiguration().config;
    var configuredMaxResultCount = (config === null || config === void 0 ? void 0 : config.resultCount) || 250;
    var _a = __read(React.useState(UserQuery() // we pass this to query settings
    ), 1), queryModel = _a[0];
    var _b = __read(React.useState(getResultCount()), 2), resultCount = _b[0], setResultCount = _b[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:resultCount', function () {
            setResultCount(getResultCount());
        });
    }, []);
    React.useEffect(function () {
        return function () {
            var _a = queryModel.toJSON(), sorts = _a.sorts, phonetics = _a.phonetics, spellcheck = _a.spellcheck, sources = _a.sources;
            user.getPreferences().get('querySettings').set({
                sorts: sorts,
                phonetics: phonetics,
                spellcheck: spellcheck,
                sources: sources,
            });
            user.savePreferences();
        };
    }, []);
    return (React.createElement(Root, null,
        React.createElement(Tooltip, { placement: "right", title: React.createElement(Paper, { elevation: Elevations.overlays, className: "p-3" },
                React.createElement(Typography, { variant: "h6" }, "For example:"),
                React.createElement(Typography, null,
                    "Searching 3 data sources with the current setting could return as many as ",
                    resultCount * 3,
                    " results in a single page.")) },
            React.createElement("div", null,
                React.createElement(Typography, { id: "resultcount-slider", className: "pb-2" }, "Results per page per data source"),
                React.createElement(Grid, { className: "w-full ".concat(MuiOutlinedInputBorderClasses), container: true, alignItems: "center", direction: "column" },
                    React.createElement(Grid, { item: true, className: "w-full" },
                        React.createElement(Input, { fullWidth: true, value: resultCount, margin: "dense", onChange: function (e) {
                                user.getPreferences().set({
                                    resultCount: Math.min(parseInt(e.target.value), configuredMaxResultCount),
                                });
                            }, inputProps: {
                                className: 'text-center',
                                step: 10,
                                min: 1,
                                max: configuredMaxResultCount,
                                type: 'number',
                                'aria-labelledby': 'resultcount-slider',
                            } })),
                    React.createElement(Grid, { item: true, className: "w-full px-10" },
                        React.createElement(Slider, { value: resultCount, onChange: function (_e, newValue) {
                                user.getPreferences().set({
                                    resultCount: newValue,
                                });
                            }, "aria-labelledby": "input-slider", min: 1, max: configuredMaxResultCount, step: 10, marks: [
                                {
                                    value: 1,
                                    label: '1',
                                },
                                {
                                    value: configuredMaxResultCount,
                                    label: "".concat(configuredMaxResultCount),
                                },
                            ] }))))),
        React.createElement("div", { className: "py-5" },
            React.createElement(Swath, { className: "w-full h-1" })),
        React.createElement(Typography, { variant: "h5" }, "Defaults for New Searches"),
        React.createElement(QuerySettings, { model: queryModel })));
};
export default hot(module)(SearchSettings);
var templateObject_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLXNldHRpbmdzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9zZWFyY2gtc2V0dGluZ3Mvc2VhcmNoLXNldHRpbmdzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sSUFBSSxNQUFNLDBDQUEwQyxDQUFBO0FBQzNELE9BQU8sYUFBYSxNQUFNLCtDQUErQyxDQUFBO0FBQ3pFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUNyRCxPQUFPLE1BQU0sTUFBTSxtQkFBbUIsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxJQUFJLE1BQU0sb0JBQW9CLENBQUE7QUFDckMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxLQUFLLE1BQU0sNkJBQTZCLENBQUE7QUFDL0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFEQUFxRCxDQUFBO0FBQ2pGLE9BQU8sRUFDTCw2QkFBNkIsRUFDN0IsVUFBVSxHQUNYLE1BQU0sNkJBQTZCLENBQUE7QUFDcEMsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNENBQTRDLENBQUE7QUFDN0UsSUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsOEdBQUEsb0NBRVYsRUFBcUMsS0FDakQsS0FEWSxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxLQUFLLENB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OlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgUXVlcnlTZXR0aW5ncyBmcm9tICcuLi8uLi9jb21wb25lbnQvcXVlcnktc2V0dGluZ3MvcXVlcnktc2V0dGluZ3MnXG5pbXBvcnQgeyBVc2VyUXVlcnkgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9UeXBlZFF1ZXJ5J1xuaW1wb3J0IHN0eWxlZCBmcm9tICdzdHlsZWQtY29tcG9uZW50cydcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgVHlwb2dyYXBoeSBmcm9tICdAbXVpL21hdGVyaWFsL1R5cG9ncmFwaHknXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgU2xpZGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvU2xpZGVyJ1xuaW1wb3J0IElucHV0IGZyb20gJ0BtdWkvbWF0ZXJpYWwvSW5wdXQnXG5pbXBvcnQgU3dhdGggZnJvbSAnLi4vLi4vY29tcG9uZW50L3N3YXRoL3N3YXRoJ1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQge1xuICBNdWlPdXRsaW5lZElucHV0Qm9yZGVyQ2xhc3NlcyxcbiAgRWxldmF0aW9ucyxcbn0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3RoZW1lL3RoZW1lJ1xuaW1wb3J0IFRvb2x0aXAgZnJvbSAnQG11aS9tYXRlcmlhbC9Ub29sdGlwJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyB1c2VDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9jb25maWd1cmF0aW9uLmhvb2tzJ1xuY29uc3QgUm9vdCA9IHN0eWxlZC5kaXZgXG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHBhZGRpbmc6ICR7KHByb3BzKSA9PiBwcm9wcy50aGVtZS5taW5pbXVtU3BhY2luZ307XG5gXG5jb25zdCBnZXRSZXN1bHRDb3VudCA9ICgpID0+IHtcbiAgcmV0dXJuIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgncmVzdWx0Q291bnQnKSBhcyBudW1iZXJcbn1cbmNvbnN0IFNlYXJjaFNldHRpbmdzID0gKCkgPT4ge1xuICBjb25zdCB7IGNvbmZpZyB9ID0gdXNlQ29uZmlndXJhdGlvbigpXG4gIGNvbnN0IGNvbmZpZ3VyZWRNYXhSZXN1bHRDb3VudCA9IGNvbmZpZz8ucmVzdWx0Q291bnQgfHwgMjUwXG4gIGNvbnN0IFtxdWVyeU1vZGVsXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIFVzZXJRdWVyeSgpIC8vIHdlIHBhc3MgdGhpcyB0byBxdWVyeSBzZXR0aW5nc1xuICApXG4gIGNvbnN0IFtyZXN1bHRDb3VudCwgc2V0UmVzdWx0Q291bnRdID0gUmVhY3QudXNlU3RhdGUoZ2V0UmVzdWx0Q291bnQoKSlcbiAgY29uc3QgeyBsaXN0ZW5UbyB9ID0gdXNlQmFja2JvbmUoKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxpc3RlblRvKHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLCAnY2hhbmdlOnJlc3VsdENvdW50JywgKCkgPT4ge1xuICAgICAgc2V0UmVzdWx0Q291bnQoZ2V0UmVzdWx0Q291bnQoKSlcbiAgICB9KVxuICB9LCBbXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29uc3QgeyBzb3J0cywgcGhvbmV0aWNzLCBzcGVsbGNoZWNrLCBzb3VyY2VzIH0gPSBxdWVyeU1vZGVsLnRvSlNPTigpXG4gICAgICB1c2VyLmdldFByZWZlcmVuY2VzKCkuZ2V0KCdxdWVyeVNldHRpbmdzJykuc2V0KHtcbiAgICAgICAgc29ydHMsXG4gICAgICAgIHBob25ldGljcyxcbiAgICAgICAgc3BlbGxjaGVjayxcbiAgICAgICAgc291cmNlcyxcbiAgICAgIH0pXG4gICAgICB1c2VyLnNhdmVQcmVmZXJlbmNlcygpXG4gICAgfVxuICB9LCBbXSlcbiAgcmV0dXJuIChcbiAgICA8Um9vdD5cbiAgICAgIDxUb29sdGlwXG4gICAgICAgIHBsYWNlbWVudD1cInJpZ2h0XCJcbiAgICAgICAgdGl0bGU9e1xuICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9IGNsYXNzTmFtZT1cInAtM1wiPlxuICAgICAgICAgICAgPFR5cG9ncmFwaHkgdmFyaWFudD1cImg2XCI+Rm9yIGV4YW1wbGU6PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgPFR5cG9ncmFwaHk+XG4gICAgICAgICAgICAgIFNlYXJjaGluZyAzIGRhdGEgc291cmNlcyB3aXRoIHRoZSBjdXJyZW50IHNldHRpbmcgY291bGQgcmV0dXJuIGFzXG4gICAgICAgICAgICAgIG1hbnkgYXMge3Jlc3VsdENvdW50ICogM30gcmVzdWx0cyBpbiBhIHNpbmdsZSBwYWdlLlxuICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgIH1cbiAgICAgID5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8VHlwb2dyYXBoeSBpZD1cInJlc3VsdGNvdW50LXNsaWRlclwiIGNsYXNzTmFtZT1cInBiLTJcIj5cbiAgICAgICAgICAgIFJlc3VsdHMgcGVyIHBhZ2UgcGVyIGRhdGEgc291cmNlXG4gICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuXG4gICAgICAgICAgPEdyaWRcbiAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCAke011aU91dGxpbmVkSW5wdXRCb3JkZXJDbGFzc2VzfWB9XG4gICAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAgICAgICAgZGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbFwiPlxuICAgICAgICAgICAgICA8SW5wdXRcbiAgICAgICAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICAgICAgICB2YWx1ZT17cmVzdWx0Q291bnR9XG4gICAgICAgICAgICAgICAgbWFyZ2luPVwiZGVuc2VcIlxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgdXNlci5nZXRQcmVmZXJlbmNlcygpLnNldCh7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdENvdW50OiBNYXRoLm1pbihcbiAgICAgICAgICAgICAgICAgICAgICBwYXJzZUludChlLnRhcmdldC52YWx1ZSksXG4gICAgICAgICAgICAgICAgICAgICAgY29uZmlndXJlZE1heFJlc3VsdENvdW50XG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgaW5wdXRQcm9wcz17e1xuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAndGV4dC1jZW50ZXInLFxuICAgICAgICAgICAgICAgICAgc3RlcDogMTAsXG4gICAgICAgICAgICAgICAgICBtaW46IDEsXG4gICAgICAgICAgICAgICAgICBtYXg6IGNvbmZpZ3VyZWRNYXhSZXN1bHRDb3VudCxcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgICAgICAgICAgICAgJ2FyaWEtbGFiZWxsZWRieSc6ICdyZXN1bHRjb3VudC1zbGlkZXInLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBweC0xMFwiPlxuICAgICAgICAgICAgICA8U2xpZGVyXG4gICAgICAgICAgICAgICAgdmFsdWU9e3Jlc3VsdENvdW50fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoX2UsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICB1c2VyLmdldFByZWZlcmVuY2VzKCkuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0Q291bnQ6IG5ld1ZhbHVlLFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWxsZWRieT1cImlucHV0LXNsaWRlclwiXG4gICAgICAgICAgICAgICAgbWluPXsxfVxuICAgICAgICAgICAgICAgIG1heD17Y29uZmlndXJlZE1heFJlc3VsdENvdW50fVxuICAgICAgICAgICAgICAgIHN0ZXA9ezEwfVxuICAgICAgICAgICAgICAgIG1hcmtzPXtbXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiAxLFxuICAgICAgICAgICAgICAgICAgICBsYWJlbDogJzEnLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGNvbmZpZ3VyZWRNYXhSZXN1bHRDb3VudCxcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGAke2NvbmZpZ3VyZWRNYXhSZXN1bHRDb3VudH1gLFxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1Rvb2x0aXA+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInB5LTVcIj5cbiAgICAgICAgPFN3YXRoIGNsYXNzTmFtZT1cInctZnVsbCBoLTFcIiAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8VHlwb2dyYXBoeSB2YXJpYW50PVwiaDVcIj5EZWZhdWx0cyBmb3IgTmV3IFNlYXJjaGVzPC9UeXBvZ3JhcGh5PlxuICAgICAgPFF1ZXJ5U2V0dGluZ3MgbW9kZWw9e3F1ZXJ5TW9kZWx9IC8+XG4gICAgPC9Sb290PlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShTZWFyY2hTZXR0aW5ncylcbiJdfQ==