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
import { __assign } from "tslib";
import PermanentSearchSort from '../../react-component/query-sort-selection/permanent-search-sort';
import * as React from 'react';
import SourceSelector from './source-selector';
import SourcesInfo from './sources-info';
import Phonetics from './phonetics';
import Spellcheck from './spellcheck';
import { hot } from 'react-hot-loader';
import { Memo } from '../memo/memo';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
/**
 * This is expensive to rerender, so we memo.  However, if the inner components aren't listening to the query,
 * this will not work.
 */
var QuerySettings = function (_a) {
    var model = _a.model, Extensions = _a.Extensions;
    var config = useConfiguration().config;
    return (React.createElement(Memo, { dependencies: [model] },
        React.createElement("div", null,
            Extensions ? React.createElement(Extensions, __assign({}, { model: model })) : null,
            (config === null || config === void 0 ? void 0 : config.isSpellcheckEnabled) ? (React.createElement("div", { className: "pb-2" },
                React.createElement(Spellcheck, { model: model }))) : null,
            (config === null || config === void 0 ? void 0 : config.isPhoneticsEnabled) ? (React.createElement("div", { className: "pb-2" },
                React.createElement(Phonetics, { model: model }))) : null,
            React.createElement("div", { className: "pb-2" },
                React.createElement(PermanentSearchSort, { model: model })),
            React.createElement("div", { className: "pb-2" },
                React.createElement(SourceSelector, { search: model })),
            React.createElement("div", null,
                React.createElement(SourcesInfo, null)))));
};
export default hot(module)(QuerySettings);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnktc2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L3F1ZXJ5LXNldHRpbmdzL3F1ZXJ5LXNldHRpbmdzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJOztBQUVKLE9BQU8sbUJBQW1CLE1BQU0sa0VBQWtFLENBQUE7QUFFbEcsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxjQUFjLE1BQU0sbUJBQW1CLENBQUE7QUFDOUMsT0FBTyxXQUFXLE1BQU0sZ0JBQWdCLENBQUE7QUFDeEMsT0FBTyxTQUFTLE1BQU0sYUFBYSxDQUFBO0FBQ25DLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQTtBQUNyQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUVuQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQU83RTs7O0dBR0c7QUFDSCxJQUFNLGFBQWEsR0FBRyxVQUFDLEVBQTRCO1FBQTFCLEtBQUssV0FBQSxFQUFFLFVBQVUsZ0JBQUE7SUFDaEMsSUFBQSxNQUFNLEdBQUssZ0JBQWdCLEVBQUUsT0FBdkIsQ0FBdUI7SUFDckMsT0FBTyxDQUNMLG9CQUFDLElBQUksSUFBQyxZQUFZLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDekI7WUFDRyxVQUFVLENBQUMsQ0FBQyxDQUFDLG9CQUFDLFVBQVUsZUFBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ3hELENBQUEsTUFBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLG1CQUFtQixFQUFDLENBQUMsQ0FBQyxDQUM3Qiw2QkFBSyxTQUFTLEVBQUMsTUFBTTtnQkFDbkIsb0JBQUMsVUFBVSxJQUFDLEtBQUssRUFBRSxLQUFLLEdBQUksQ0FDeEIsQ0FDUCxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQ1AsQ0FBQSxNQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsa0JBQWtCLEVBQUMsQ0FBQyxDQUFDLENBQzVCLDZCQUFLLFNBQVMsRUFBQyxNQUFNO2dCQUNuQixvQkFBQyxTQUFTLElBQUMsS0FBSyxFQUFFLEtBQUssR0FBSSxDQUN2QixDQUNQLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDUiw2QkFBSyxTQUFTLEVBQUMsTUFBTTtnQkFDbkIsb0JBQUMsbUJBQW1CLElBQUMsS0FBSyxFQUFFLEtBQUssR0FBSSxDQUNqQztZQUVOLDZCQUFLLFNBQVMsRUFBQyxNQUFNO2dCQUNuQixvQkFBQyxjQUFjLElBQUMsTUFBTSxFQUFFLEtBQUssR0FBSSxDQUM3QjtZQUNOO2dCQUNFLG9CQUFDLFdBQVcsT0FBRyxDQUNYLENBQ0YsQ0FDRCxDQUNSLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuXG5pbXBvcnQgUGVybWFuZW50U2VhcmNoU29ydCBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvcXVlcnktc29ydC1zZWxlY3Rpb24vcGVybWFuZW50LXNlYXJjaC1zb3J0J1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBTb3VyY2VTZWxlY3RvciBmcm9tICcuL3NvdXJjZS1zZWxlY3RvcidcbmltcG9ydCBTb3VyY2VzSW5mbyBmcm9tICcuL3NvdXJjZXMtaW5mbydcbmltcG9ydCBQaG9uZXRpY3MgZnJvbSAnLi9waG9uZXRpY3MnXG5pbXBvcnQgU3BlbGxjaGVjayBmcm9tICcuL3NwZWxsY2hlY2snXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgTWVtbyB9IGZyb20gJy4uL21lbW8vbWVtbydcbmltcG9ydCB7IFF1ZXJ5VHlwZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1F1ZXJ5J1xuaW1wb3J0IHsgdXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvY29uZmlndXJhdGlvbi5ob29rcydcblxudHlwZSBQcm9wcyA9IHtcbiAgbW9kZWw6IFF1ZXJ5VHlwZVxuICBFeHRlbnNpb25zPzogUmVhY3QuRnVuY3Rpb25Db21wb25lbnQ8YW55PlxufVxuXG4vKipcbiAqIFRoaXMgaXMgZXhwZW5zaXZlIHRvIHJlcmVuZGVyLCBzbyB3ZSBtZW1vLiAgSG93ZXZlciwgaWYgdGhlIGlubmVyIGNvbXBvbmVudHMgYXJlbid0IGxpc3RlbmluZyB0byB0aGUgcXVlcnksXG4gKiB0aGlzIHdpbGwgbm90IHdvcmsuXG4gKi9cbmNvbnN0IFF1ZXJ5U2V0dGluZ3MgPSAoeyBtb2RlbCwgRXh0ZW5zaW9ucyB9OiBQcm9wcykgPT4ge1xuICBjb25zdCB7IGNvbmZpZyB9ID0gdXNlQ29uZmlndXJhdGlvbigpXG4gIHJldHVybiAoXG4gICAgPE1lbW8gZGVwZW5kZW5jaWVzPXtbbW9kZWxdfT5cbiAgICAgIDxkaXY+XG4gICAgICAgIHtFeHRlbnNpb25zID8gPEV4dGVuc2lvbnMgey4uLnsgbW9kZWw6IG1vZGVsIH19IC8+IDogbnVsbH1cbiAgICAgICAge2NvbmZpZz8uaXNTcGVsbGNoZWNrRW5hYmxlZCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBiLTJcIj5cbiAgICAgICAgICAgIDxTcGVsbGNoZWNrIG1vZGVsPXttb2RlbH0gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIHtjb25maWc/LmlzUGhvbmV0aWNzRW5hYmxlZCA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBiLTJcIj5cbiAgICAgICAgICAgIDxQaG9uZXRpY3MgbW9kZWw9e21vZGVsfSAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYi0yXCI+XG4gICAgICAgICAgPFBlcm1hbmVudFNlYXJjaFNvcnQgbW9kZWw9e21vZGVsfSAvPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInBiLTJcIj5cbiAgICAgICAgICA8U291cmNlU2VsZWN0b3Igc2VhcmNoPXttb2RlbH0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPFNvdXJjZXNJbmZvIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9NZW1vPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFF1ZXJ5U2V0dGluZ3MpXG4iXX0=