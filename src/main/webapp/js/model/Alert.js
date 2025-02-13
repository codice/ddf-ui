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
import Backbone from 'backbone';
import { v4 } from 'uuid';
import 'backbone-associations';
export default Backbone.AssociatedModel.extend({
    defaults: {
        unseen: true,
        queryId: undefined,
        when: undefined,
        metacardIds: [],
    },
    initialize: function () {
        if (!this.id) {
            this.set('id', v4());
        }
    },
    getTimeComparator: function () {
        return this.get('when');
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWxlcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvQWxlcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUVKLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUUvQixPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBQ3pCLE9BQU8sdUJBQXVCLENBQUE7QUFFOUIsZUFBZSxRQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUM3QyxRQUFRLEVBQUU7UUFDUixNQUFNLEVBQUUsSUFBSTtRQUNaLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUFFLEVBQUU7S0FDaEI7SUFDRCxVQUFVO1FBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7WUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1NBQ3JCO0lBQ0gsQ0FBQztJQUNELGlCQUFpQjtRQUNmLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN6QixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcblxuaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJ1xuaW1wb3J0ICdiYWNrYm9uZS1hc3NvY2lhdGlvbnMnXG5cbmV4cG9ydCBkZWZhdWx0IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0czoge1xuICAgIHVuc2VlbjogdHJ1ZSxcbiAgICBxdWVyeUlkOiB1bmRlZmluZWQsXG4gICAgd2hlbjogdW5kZWZpbmVkLFxuICAgIG1ldGFjYXJkSWRzOiBbXSxcbiAgfSxcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAoIXRoaXMuaWQpIHtcbiAgICAgIHRoaXMuc2V0KCdpZCcsIHY0KCkpXG4gICAgfVxuICB9LFxuICBnZXRUaW1lQ29tcGFyYXRvcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3doZW4nKVxuICB9LFxufSlcbiJdfQ==