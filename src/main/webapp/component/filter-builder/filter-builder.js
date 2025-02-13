import { __assign, __read } from "tslib";
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
import FilterBranch from './filter-branch';
import { FilterBuilderClass, isFilterBuilderClass } from './filter.structure';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
var convertToFilterIfNecessary = function (_a) {
    var filter = _a.filter;
    if (isFilterBuilderClass(filter)) {
        return filter;
    }
    if (filter.filters === undefined) {
        return new FilterBuilderClass({
            type: 'AND',
            filters: [filter],
            negated: false,
        });
    }
    return new FilterBuilderClass(__assign({}, filter));
};
var getBaseFilter = function (_a) {
    var model = _a.model;
    var filter = model.get('filterTree');
    return convertToFilterIfNecessary({ filter: filter });
};
/**
 * We use the filterTree of the model as the single source of truth, so it's always up to date.
 * As a result, we have to listen to updates to it.
 */
export var FilterBuilderRoot = function (_a) {
    var model = _a.model, errorListener = _a.errorListener;
    var _b = __read(React.useState(getBaseFilter({ model: model })), 2), filter = _b[0], setFilter = _b[1];
    var _c = useBackbone(), listenTo = _c.listenTo, stopListening = _c.stopListening;
    React.useEffect(function () {
        var callback = function () {
            setFilter(getBaseFilter({ model: model }));
        };
        listenTo(model, 'change:filterTree', callback);
        return function () {
            stopListening(model, 'change:filterTree', callback);
        };
    }, [model]);
    return (React.createElement("div", null,
        React.createElement(FilterBranch, { filter: filter, setFilter: function (update) {
                model.set('filterTree', update); // update the filterTree directly so it's always in sync and we're ready to search
            }, root: true, errorListener: errorListener })));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLWJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2ZpbHRlci1idWlsZGVyL2ZpbHRlci1idWlsZGVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRTlCLE9BQU8sWUFBWSxNQUFNLGlCQUFpQixDQUFBO0FBRTFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9CQUFvQixDQUFBO0FBQzdFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQVVwRSxJQUFNLDBCQUEwQixHQUFHLFVBQUMsRUFJbkM7UUFIQyxNQUFNLFlBQUE7SUFJTixJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ2hDLE9BQU8sTUFBTSxDQUFBO0tBQ2Q7SUFDRCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFO1FBQ2hDLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQztZQUM1QixJQUFJLEVBQUUsS0FBSztZQUNYLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNqQixPQUFPLEVBQUUsS0FBSztTQUNmLENBQUMsQ0FBQTtLQUNIO0lBQ0QsT0FBTyxJQUFJLGtCQUFrQixjQUN4QixNQUFNLEVBQ1QsQ0FBQTtBQUNKLENBQUMsQ0FBQTtBQUVELElBQU0sYUFBYSxHQUFHLFVBQUMsRUFBeUI7UUFBdkIsS0FBSyxXQUFBO0lBQzVCLElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUE7SUFDdEMsT0FBTywwQkFBMEIsQ0FBQyxFQUFFLE1BQU0sUUFBQSxFQUFFLENBQUMsQ0FBQTtBQUMvQyxDQUFDLENBQUE7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLEVBQStCO1FBQTdCLEtBQUssV0FBQSxFQUFFLGFBQWEsbUJBQUE7SUFDaEQsSUFBQSxLQUFBLE9BQXNCLEtBQUssQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFBLEVBQUUsQ0FBQyxDQUFDLElBQUEsRUFBN0QsTUFBTSxRQUFBLEVBQUUsU0FBUyxRQUE0QyxDQUFBO0lBQzlELElBQUEsS0FBOEIsV0FBVyxFQUFFLEVBQXpDLFFBQVEsY0FBQSxFQUFFLGFBQWEsbUJBQWtCLENBQUE7SUFDakQsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQU0sUUFBUSxHQUFHO1lBQ2YsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBQSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3JDLENBQUMsQ0FBQTtRQUNELFFBQVEsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDOUMsT0FBTztZQUNMLGFBQWEsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDckQsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNYLE9BQU8sQ0FDTDtRQUNFLG9CQUFDLFlBQVksSUFDWCxNQUFNLEVBQUUsTUFBTSxFQUNkLFNBQVMsRUFBRSxVQUFDLE1BQU07Z0JBQ2hCLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFBLENBQUMsa0ZBQWtGO1lBQ3BILENBQUMsRUFDRCxJQUFJLEVBQUUsSUFBSSxFQUNWLGFBQWEsRUFBRSxhQUFhLEdBQzVCLENBQ0UsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcblxuaW1wb3J0IEZpbHRlckJyYW5jaCBmcm9tICcuL2ZpbHRlci1icmFuY2gnXG5cbmltcG9ydCB7IEZpbHRlckJ1aWxkZXJDbGFzcywgaXNGaWx0ZXJCdWlsZGVyQ2xhc3MgfSBmcm9tICcuL2ZpbHRlci5zdHJ1Y3R1cmUnXG5pbXBvcnQgeyB1c2VCYWNrYm9uZSB9IGZyb20gJy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHsgVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9sb2NhdGlvbi92YWxpZGF0b3JzJ1xuXG50eXBlIFByb3BzID0ge1xuICBtb2RlbDogYW55XG4gIGVycm9yTGlzdGVuZXI/OiAodmFsaWRhdGlvblJlc3VsdHM6IHtcbiAgICBba2V5OiBzdHJpbmddOiBWYWxpZGF0aW9uUmVzdWx0IHwgdW5kZWZpbmVkXG4gIH0pID0+IHZvaWRcbn1cblxuY29uc3QgY29udmVydFRvRmlsdGVySWZOZWNlc3NhcnkgPSAoe1xuICBmaWx0ZXIsXG59OiB7XG4gIGZpbHRlcjogYW55XG59KTogRmlsdGVyQnVpbGRlckNsYXNzID0+IHtcbiAgaWYgKGlzRmlsdGVyQnVpbGRlckNsYXNzKGZpbHRlcikpIHtcbiAgICByZXR1cm4gZmlsdGVyXG4gIH1cbiAgaWYgKGZpbHRlci5maWx0ZXJzID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgICB0eXBlOiAnQU5EJyxcbiAgICAgIGZpbHRlcnM6IFtmaWx0ZXJdLFxuICAgICAgbmVnYXRlZDogZmFsc2UsXG4gICAgfSlcbiAgfVxuICByZXR1cm4gbmV3IEZpbHRlckJ1aWxkZXJDbGFzcyh7XG4gICAgLi4uZmlsdGVyLFxuICB9KVxufVxuXG5jb25zdCBnZXRCYXNlRmlsdGVyID0gKHsgbW9kZWwgfTogeyBtb2RlbDogYW55IH0pOiBGaWx0ZXJCdWlsZGVyQ2xhc3MgPT4ge1xuICBjb25zdCBmaWx0ZXIgPSBtb2RlbC5nZXQoJ2ZpbHRlclRyZWUnKVxuICByZXR1cm4gY29udmVydFRvRmlsdGVySWZOZWNlc3NhcnkoeyBmaWx0ZXIgfSlcbn1cblxuLyoqXG4gKiBXZSB1c2UgdGhlIGZpbHRlclRyZWUgb2YgdGhlIG1vZGVsIGFzIHRoZSBzaW5nbGUgc291cmNlIG9mIHRydXRoLCBzbyBpdCdzIGFsd2F5cyB1cCB0byBkYXRlLlxuICogQXMgYSByZXN1bHQsIHdlIGhhdmUgdG8gbGlzdGVuIHRvIHVwZGF0ZXMgdG8gaXQuXG4gKi9cbmV4cG9ydCBjb25zdCBGaWx0ZXJCdWlsZGVyUm9vdCA9ICh7IG1vZGVsLCBlcnJvckxpc3RlbmVyIH06IFByb3BzKSA9PiB7XG4gIGNvbnN0IFtmaWx0ZXIsIHNldEZpbHRlcl0gPSBSZWFjdC51c2VTdGF0ZShnZXRCYXNlRmlsdGVyKHsgbW9kZWwgfSkpXG4gIGNvbnN0IHsgbGlzdGVuVG8sIHN0b3BMaXN0ZW5pbmcgfSA9IHVzZUJhY2tib25lKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHNldEZpbHRlcihnZXRCYXNlRmlsdGVyKHsgbW9kZWwgfSkpXG4gICAgfVxuICAgIGxpc3RlblRvKG1vZGVsLCAnY2hhbmdlOmZpbHRlclRyZWUnLCBjYWxsYmFjaylcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3RvcExpc3RlbmluZyhtb2RlbCwgJ2NoYW5nZTpmaWx0ZXJUcmVlJywgY2FsbGJhY2spXG4gICAgfVxuICB9LCBbbW9kZWxdKVxuICByZXR1cm4gKFxuICAgIDxkaXY+XG4gICAgICA8RmlsdGVyQnJhbmNoXG4gICAgICAgIGZpbHRlcj17ZmlsdGVyfVxuICAgICAgICBzZXRGaWx0ZXI9eyh1cGRhdGUpID0+IHtcbiAgICAgICAgICBtb2RlbC5zZXQoJ2ZpbHRlclRyZWUnLCB1cGRhdGUpIC8vIHVwZGF0ZSB0aGUgZmlsdGVyVHJlZSBkaXJlY3RseSBzbyBpdCdzIGFsd2F5cyBpbiBzeW5jIGFuZCB3ZSdyZSByZWFkeSB0byBzZWFyY2hcbiAgICAgICAgfX1cbiAgICAgICAgcm9vdD17dHJ1ZX1cbiAgICAgICAgZXJyb3JMaXN0ZW5lcj17ZXJyb3JMaXN0ZW5lcn1cbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIClcbn1cbiJdfQ==