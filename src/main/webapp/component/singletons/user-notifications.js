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
import fetch from '../../react-component/utils/fetch';
import user from './user-instance';
import Backbone from 'backbone';
export default new (Backbone.Collection.extend({
    initialize: function () {
        var uploads = user.get('user').get('preferences').get('uploads');
        var alerts = user.get('user').get('preferences').get('alerts');
        this.add(uploads.models);
        this.add(alerts.models);
        this.listenTo(uploads, 'add', this.add);
        this.listenTo(uploads, 'remove', this.remove);
        this.listenTo(alerts, 'add', this.add);
        this.listenTo(alerts, 'remove', this.remove);
    },
    comparator: function (model) {
        return -model.getTimeComparator();
    },
    hasUnseen: function () {
        return this.some(function (notification) { return notification.get('unseen'); });
    },
    setSeen: function () {
        var setSeen = [];
        this.forEach(function (notification) {
            notification.set('unseen', false);
            if (notification.get('queryId')) {
                setSeen.push(notification);
            }
        });
        if (setSeen.length === 0) {
            return;
        }
        fetch('./internal/user/notifications', {
            method: 'put',
            body: JSON.stringify({ alerts: setSeen }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },
}))();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub3RpZmljYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9zaW5nbGV0b25zL3VzZXItbm90aWZpY2F0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sbUNBQW1DLENBQUE7QUFFckQsT0FBTyxJQUFJLE1BQU0saUJBQWlCLENBQUE7QUFDbEMsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBRS9CLGVBQWUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQzdDLFVBQVU7UUFDUixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDbEUsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUNELFVBQVUsWUFBQyxLQUFVO1FBQ25CLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtJQUNuQyxDQUFDO0lBQ0QsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFDLFlBQWlCLElBQUssT0FBQSxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUE7SUFDckUsQ0FBQztJQUNELE9BQU87UUFDTCxJQUFNLE9BQU8sR0FBUSxFQUFFLENBQUE7UUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFlBQWlCO1lBQzdCLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO1lBQ2pDLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTthQUMzQjtRQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN4QixPQUFNO1NBQ1A7UUFDRCxLQUFLLENBQUMsK0JBQStCLEVBQUU7WUFDckMsTUFBTSxFQUFFLEtBQUs7WUFDYixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQztZQUN6QyxPQUFPLEVBQUU7Z0JBQ1AsY0FBYyxFQUFFLGtCQUFrQjthQUNuQztTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUMsRUFBRSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2ZldGNoJ1xuXG5pbXBvcnQgdXNlciBmcm9tICcuL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5cbmV4cG9ydCBkZWZhdWx0IG5ldyAoQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuICBpbml0aWFsaXplKCkge1xuICAgIGNvbnN0IHVwbG9hZHMgPSB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ3VwbG9hZHMnKVxuICAgIGNvbnN0IGFsZXJ0cyA9IHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnYWxlcnRzJylcbiAgICB0aGlzLmFkZCh1cGxvYWRzLm1vZGVscylcbiAgICB0aGlzLmFkZChhbGVydHMubW9kZWxzKVxuICAgIHRoaXMubGlzdGVuVG8odXBsb2FkcywgJ2FkZCcsIHRoaXMuYWRkKVxuICAgIHRoaXMubGlzdGVuVG8odXBsb2FkcywgJ3JlbW92ZScsIHRoaXMucmVtb3ZlKVxuICAgIHRoaXMubGlzdGVuVG8oYWxlcnRzLCAnYWRkJywgdGhpcy5hZGQpXG4gICAgdGhpcy5saXN0ZW5UbyhhbGVydHMsICdyZW1vdmUnLCB0aGlzLnJlbW92ZSlcbiAgfSxcbiAgY29tcGFyYXRvcihtb2RlbDogYW55KSB7XG4gICAgcmV0dXJuIC1tb2RlbC5nZXRUaW1lQ29tcGFyYXRvcigpXG4gIH0sXG4gIGhhc1Vuc2VlbigpIHtcbiAgICByZXR1cm4gdGhpcy5zb21lKChub3RpZmljYXRpb246IGFueSkgPT4gbm90aWZpY2F0aW9uLmdldCgndW5zZWVuJykpXG4gIH0sXG4gIHNldFNlZW4oKSB7XG4gICAgY29uc3Qgc2V0U2VlbjogYW55ID0gW11cbiAgICB0aGlzLmZvckVhY2goKG5vdGlmaWNhdGlvbjogYW55KSA9PiB7XG4gICAgICBub3RpZmljYXRpb24uc2V0KCd1bnNlZW4nLCBmYWxzZSlcbiAgICAgIGlmIChub3RpZmljYXRpb24uZ2V0KCdxdWVyeUlkJykpIHtcbiAgICAgICAgc2V0U2Vlbi5wdXNoKG5vdGlmaWNhdGlvbilcbiAgICAgIH1cbiAgICB9KVxuICAgIGlmIChzZXRTZWVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGZldGNoKCcuL2ludGVybmFsL3VzZXIvbm90aWZpY2F0aW9ucycsIHtcbiAgICAgIG1ldGhvZDogJ3B1dCcsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGFsZXJ0czogc2V0U2VlbiB9KSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0sXG4gICAgfSlcbiAgfSxcbn0pKSgpXG4iXX0=