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
import 'focus-visible';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import 'font-awesome/css/font-awesome.css';
import '../lib/cesium-drawhelper/DrawHelper.css';
import 'golden-layout/src/css/goldenlayout-base.css';
import 'golden-layout/src/css/goldenlayout-dark-theme.css';
import '../styles/fonts.css';
import '../styles/input-range.css';
import '../styles/additional-styles.css';
import '../styles/plotly.css';
import Backbone from 'backbone';
import './extensions/application.patches';
import '../component/singletons/session-auto-renew';
import $ from 'jquery';
import { StartupDataStore } from './model/Startup/startup';
if (process.env.NODE_ENV !== 'production') {
    $('html').addClass('is-development');
    if (module === null || module === void 0 ? void 0 : module.hot) {
        import('react-hot-loader');
        $('html').addClass('is-hot-reloading');
    }
}
// @ts-ignore disable all react-beautiful-dnd development warnings (we have some spurious ones, but if you're working a component with this you can re-enable)
window['__react-beautiful-dnd-disable-dev-warnings'] = true;
window.CESIUM_BASE_URL = './cesium/assets';
//in here we drop in any top level patches, etc.
var associationsSet = Backbone.AssociatedModel.prototype.set;
// @ts-expect-error ts-migrate(2322) FIXME: Type '(key: any, value: any, options: any) => any'... Remove this comment to see the full error message
Backbone.AssociatedModel.prototype.set = function (key, value, options) {
    if (typeof key === 'object') {
        options = value;
    }
    if (options && options.withoutSet === true) {
        return this;
    }
    return associationsSet.apply(this, arguments);
};
$(window.document).ready(function () {
    var _a, _b, _c, _d;
    window.document.title =
        ((_a = StartupDataStore.Configuration.config) === null || _a === void 0 ? void 0 : _a.customBranding) +
            ' ' +
            ((_b = StartupDataStore.Configuration.config) === null || _b === void 0 ? void 0 : _b.product);
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    window.document.querySelector('.welcome-branding').textContent =
        (_c = StartupDataStore.Configuration.config) === null || _c === void 0 ? void 0 : _c.customBranding;
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    window.document.querySelector('.welcome-branding-name').textContent =
        (_d = StartupDataStore.Configuration.config) === null || _d === void 0 ? void 0 : _d.product;
    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
    window.document.querySelector('#loading').classList.add('show-welcome');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwbGljYXRpb25TZXR1cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9BcHBsaWNhdGlvblNldHVwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxlQUFlLENBQUE7QUFDdEIsT0FBTyx5Q0FBeUMsQ0FBQTtBQUNoRCxPQUFPLHlDQUF5QyxDQUFBO0FBQ2hELE9BQU8sc0RBQXNELENBQUE7QUFDN0QsT0FBTyxtQ0FBbUMsQ0FBQTtBQUMxQyxPQUFPLHlDQUF5QyxDQUFBO0FBQ2hELE9BQU8sNkNBQTZDLENBQUE7QUFDcEQsT0FBTyxtREFBbUQsQ0FBQTtBQUMxRCxPQUFPLHFCQUFxQixDQUFBO0FBQzVCLE9BQU8sMkJBQTJCLENBQUE7QUFDbEMsT0FBTyxpQ0FBaUMsQ0FBQTtBQUN4QyxPQUFPLHNCQUFzQixDQUFBO0FBQzdCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLGtDQUFrQyxDQUFBO0FBQ3pDLE9BQU8sNENBQTRDLENBQUE7QUFDbkQsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBQzFELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxFQUFFO0lBQ3pDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtJQUNwQyxJQUFLLE1BQWMsYUFBZCxNQUFNLHVCQUFOLE1BQU0sQ0FBVSxHQUFHLEVBQUU7UUFDeEIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFDMUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO0tBQ3ZDO0NBQ0Y7QUFDRCw4SkFBOEo7QUFDOUosTUFBTSxDQUFDLDRDQUE0QyxDQUFDLEdBQUcsSUFBSSxDQUMxRDtBQUFDLE1BQWMsQ0FBQyxlQUFlLEdBQUcsaUJBQWlCLENBQUE7QUFDcEQsZ0RBQWdEO0FBQ2hELElBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQTtBQUM5RCxtSkFBbUo7QUFDbkosUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQ3ZDLEdBQVEsRUFDUixLQUFVLEVBQ1YsT0FBWTtJQUVaLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1FBQzNCLE9BQU8sR0FBRyxLQUFLLENBQUE7S0FDaEI7SUFDRCxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxLQUFLLElBQUksRUFBRTtRQUMxQyxPQUFPLElBQUksQ0FBQTtLQUNaO0lBQ0QsT0FBTyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtBQUMvQyxDQUFDLENBQUE7QUFDRCxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQzs7SUFDdkIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLO1FBQ25CLENBQUEsTUFBQSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsTUFBTSwwQ0FBRSxjQUFjO1lBQ3JELEdBQUc7YUFDSCxNQUFBLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxNQUFNLDBDQUFFLE9BQU8sQ0FBQSxDQUFBO0lBQ2hELHNFQUFzRTtJQUN0RSxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLFdBQVc7UUFDNUQsTUFBQSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsTUFBTSwwQ0FBRSxjQUFjLENBQUE7SUFDdkQsc0VBQXNFO0lBQ3RFLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLENBQUMsV0FBVztRQUNqRSxNQUFBLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxNQUFNLDBDQUFFLE9BQU8sQ0FBQTtJQUNoRCxzRUFBc0U7SUFDdEUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUN6RSxDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0ICdmb2N1cy12aXNpYmxlJ1xuaW1wb3J0ICdjZXNpdW0vQnVpbGQvQ2VzaXVtL1dpZGdldHMvd2lkZ2V0cy5jc3MnXG5pbXBvcnQgJ0BibHVlcHJpbnRqcy9jb3JlL2xpYi9jc3MvYmx1ZXByaW50LmNzcydcbmltcG9ydCAnQGJsdWVwcmludGpzL2RhdGV0aW1lL2xpYi9jc3MvYmx1ZXByaW50LWRhdGV0aW1lLmNzcydcbmltcG9ydCAnZm9udC1hd2Vzb21lL2Nzcy9mb250LWF3ZXNvbWUuY3NzJ1xuaW1wb3J0ICcuLi9saWIvY2VzaXVtLWRyYXdoZWxwZXIvRHJhd0hlbHBlci5jc3MnXG5pbXBvcnQgJ2dvbGRlbi1sYXlvdXQvc3JjL2Nzcy9nb2xkZW5sYXlvdXQtYmFzZS5jc3MnXG5pbXBvcnQgJ2dvbGRlbi1sYXlvdXQvc3JjL2Nzcy9nb2xkZW5sYXlvdXQtZGFyay10aGVtZS5jc3MnXG5pbXBvcnQgJy4uL3N0eWxlcy9mb250cy5jc3MnXG5pbXBvcnQgJy4uL3N0eWxlcy9pbnB1dC1yYW5nZS5jc3MnXG5pbXBvcnQgJy4uL3N0eWxlcy9hZGRpdGlvbmFsLXN0eWxlcy5jc3MnXG5pbXBvcnQgJy4uL3N0eWxlcy9wbG90bHkuY3NzJ1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0ICcuL2V4dGVuc2lvbnMvYXBwbGljYXRpb24ucGF0Y2hlcydcbmltcG9ydCAnLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvc2Vzc2lvbi1hdXRvLXJlbmV3J1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4vbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgJCgnaHRtbCcpLmFkZENsYXNzKCdpcy1kZXZlbG9wbWVudCcpXG4gIGlmICgobW9kdWxlIGFzIGFueSk/LmhvdCkge1xuICAgIGltcG9ydCgncmVhY3QtaG90LWxvYWRlcicpXG4gICAgJCgnaHRtbCcpLmFkZENsYXNzKCdpcy1ob3QtcmVsb2FkaW5nJylcbiAgfVxufVxuLy8gQHRzLWlnbm9yZSBkaXNhYmxlIGFsbCByZWFjdC1iZWF1dGlmdWwtZG5kIGRldmVsb3BtZW50IHdhcm5pbmdzICh3ZSBoYXZlIHNvbWUgc3B1cmlvdXMgb25lcywgYnV0IGlmIHlvdSdyZSB3b3JraW5nIGEgY29tcG9uZW50IHdpdGggdGhpcyB5b3UgY2FuIHJlLWVuYWJsZSlcbndpbmRvd1snX19yZWFjdC1iZWF1dGlmdWwtZG5kLWRpc2FibGUtZGV2LXdhcm5pbmdzJ10gPSB0cnVlXG47KHdpbmRvdyBhcyBhbnkpLkNFU0lVTV9CQVNFX1VSTCA9ICcuL2Nlc2l1bS9hc3NldHMnXG4vL2luIGhlcmUgd2UgZHJvcCBpbiBhbnkgdG9wIGxldmVsIHBhdGNoZXMsIGV0Yy5cbmNvbnN0IGFzc29jaWF0aW9uc1NldCA9IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5wcm90b3R5cGUuc2V0XG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjMyMikgRklYTUU6IFR5cGUgJyhrZXk6IGFueSwgdmFsdWU6IGFueSwgb3B0aW9uczogYW55KSA9PiBhbnknLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbkJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKFxuICBrZXk6IGFueSxcbiAgdmFsdWU6IGFueSxcbiAgb3B0aW9uczogYW55XG4pIHtcbiAgaWYgKHR5cGVvZiBrZXkgPT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHZhbHVlXG4gIH1cbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy53aXRob3V0U2V0ID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuICByZXR1cm4gYXNzb2NpYXRpb25zU2V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cbiQod2luZG93LmRvY3VtZW50KS5yZWFkeSgoKSA9PiB7XG4gIHdpbmRvdy5kb2N1bWVudC50aXRsZSA9XG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZz8uY3VzdG9tQnJhbmRpbmcgK1xuICAgICcgJyArXG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZz8ucHJvZHVjdFxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcud2VsY29tZS1icmFuZGluZycpLnRleHRDb250ZW50ID1cbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnPy5jdXN0b21CcmFuZGluZ1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gIHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcud2VsY29tZS1icmFuZGluZy1uYW1lJykudGV4dENvbnRlbnQgPVxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWc/LnByb2R1Y3RcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvYWRpbmcnKS5jbGFzc0xpc3QuYWRkKCdzaG93LXdlbGNvbWUnKVxufSlcbiJdfQ==