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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1ub3RpZmljYXRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9zaW5nbGV0b25zL3VzZXItbm90aWZpY2F0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sbUNBQW1DLENBQUE7QUFFckQsT0FBTyxJQUFJLE1BQU0saUJBQWlCLENBQUE7QUFDbEMsT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBRS9CLGVBQWUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQzdDLFVBQVU7UUFDUixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDbEUsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3hCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUNELFVBQVUsWUFBQyxLQUFVO1FBQ25CLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQTtJQUNuQyxDQUFDO0lBQ0QsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFDLFlBQWlCLElBQUssT0FBQSxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUE7SUFDckUsQ0FBQztJQUNELE9BQU87UUFDTCxJQUFNLE9BQU8sR0FBUSxFQUFFLENBQUE7UUFDdkIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFlBQWlCO1lBQzdCLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO1lBQ2pDLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBQzVCLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQTtRQUNGLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN6QixPQUFNO1FBQ1IsQ0FBQztRQUNELEtBQUssQ0FBQywrQkFBK0IsRUFBRTtZQUNyQyxNQUFNLEVBQUUsS0FBSztZQUNiLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ3pDLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2FBQ25DO1NBQ0YsQ0FBQyxDQUFBO0lBQ0osQ0FBQztDQUNGLENBQUMsQ0FBQyxFQUFFLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBmZXRjaCBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvZmV0Y2gnXG5cbmltcG9ydCB1c2VyIGZyb20gJy4vdXNlci1pbnN0YW5jZSdcbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcblxuZXhwb3J0IGRlZmF1bHQgbmV3IChCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gIGluaXRpYWxpemUoKSB7XG4gICAgY29uc3QgdXBsb2FkcyA9IHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgndXBsb2FkcycpXG4gICAgY29uc3QgYWxlcnRzID0gdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCdhbGVydHMnKVxuICAgIHRoaXMuYWRkKHVwbG9hZHMubW9kZWxzKVxuICAgIHRoaXMuYWRkKGFsZXJ0cy5tb2RlbHMpXG4gICAgdGhpcy5saXN0ZW5Ubyh1cGxvYWRzLCAnYWRkJywgdGhpcy5hZGQpXG4gICAgdGhpcy5saXN0ZW5Ubyh1cGxvYWRzLCAncmVtb3ZlJywgdGhpcy5yZW1vdmUpXG4gICAgdGhpcy5saXN0ZW5UbyhhbGVydHMsICdhZGQnLCB0aGlzLmFkZClcbiAgICB0aGlzLmxpc3RlblRvKGFsZXJ0cywgJ3JlbW92ZScsIHRoaXMucmVtb3ZlKVxuICB9LFxuICBjb21wYXJhdG9yKG1vZGVsOiBhbnkpIHtcbiAgICByZXR1cm4gLW1vZGVsLmdldFRpbWVDb21wYXJhdG9yKClcbiAgfSxcbiAgaGFzVW5zZWVuKCkge1xuICAgIHJldHVybiB0aGlzLnNvbWUoKG5vdGlmaWNhdGlvbjogYW55KSA9PiBub3RpZmljYXRpb24uZ2V0KCd1bnNlZW4nKSlcbiAgfSxcbiAgc2V0U2VlbigpIHtcbiAgICBjb25zdCBzZXRTZWVuOiBhbnkgPSBbXVxuICAgIHRoaXMuZm9yRWFjaCgobm90aWZpY2F0aW9uOiBhbnkpID0+IHtcbiAgICAgIG5vdGlmaWNhdGlvbi5zZXQoJ3Vuc2VlbicsIGZhbHNlKVxuICAgICAgaWYgKG5vdGlmaWNhdGlvbi5nZXQoJ3F1ZXJ5SWQnKSkge1xuICAgICAgICBzZXRTZWVuLnB1c2gobm90aWZpY2F0aW9uKVxuICAgICAgfVxuICAgIH0pXG4gICAgaWYgKHNldFNlZW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZmV0Y2goJy4vaW50ZXJuYWwvdXNlci9ub3RpZmljYXRpb25zJywge1xuICAgICAgbWV0aG9kOiAncHV0JyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgYWxlcnRzOiBzZXRTZWVuIH0pLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgfSxcbiAgICB9KVxuICB9LFxufSkpKClcbiJdfQ==