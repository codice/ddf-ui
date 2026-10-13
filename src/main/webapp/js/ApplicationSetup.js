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
    var _a, _b, _c, _d, _e;
    window.document.title =
        ((_a = StartupDataStore.Configuration.config) === null || _a === void 0 ? void 0 : _a.customBranding) +
            ' ' +
            ((_b = StartupDataStore.Configuration.config) === null || _b === void 0 ? void 0 : _b.product);
    var welcomeBranding = window.document.querySelector('.welcome-branding');
    if (welcomeBranding) {
        welcomeBranding.textContent =
            ((_c = StartupDataStore.Configuration.config) === null || _c === void 0 ? void 0 : _c.customBranding) + '';
    }
    var welcomeBrandingName = window.document.querySelector('.welcome-branding-name');
    if (welcomeBrandingName) {
        welcomeBrandingName.textContent =
            ((_d = StartupDataStore.Configuration.config) === null || _d === void 0 ? void 0 : _d.product) + '';
    }
    (_e = window.document.querySelector('#loading')) === null || _e === void 0 ? void 0 : _e.classList.add('show-welcome');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwbGljYXRpb25TZXR1cC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9BcHBsaWNhdGlvblNldHVwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxlQUFlLENBQUE7QUFDdEIsT0FBTyx5Q0FBeUMsQ0FBQTtBQUNoRCxPQUFPLHlDQUF5QyxDQUFBO0FBQ2hELE9BQU8sc0RBQXNELENBQUE7QUFDN0QsT0FBTyxtQ0FBbUMsQ0FBQTtBQUMxQyxPQUFPLHlDQUF5QyxDQUFBO0FBQ2hELE9BQU8sNkNBQTZDLENBQUE7QUFDcEQsT0FBTyxtREFBbUQsQ0FBQTtBQUMxRCxPQUFPLHFCQUFxQixDQUFBO0FBQzVCLE9BQU8sMkJBQTJCLENBQUE7QUFDbEMsT0FBTyxpQ0FBaUMsQ0FBQTtBQUN4QyxPQUFPLHNCQUFzQixDQUFBO0FBQzdCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLGtDQUFrQyxDQUFBO0FBQ3pDLE9BQU8sNENBQTRDLENBQUE7QUFDbkQsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBQzFELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEtBQUssWUFBWSxFQUFFLENBQUM7SUFDMUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBQ3RDLENBQUM7QUFDRCw4SkFBOEo7QUFDOUosTUFBTSxDQUFDLDRDQUE0QyxDQUFDLEdBQUcsSUFBSSxDQUMxRDtBQUFDLE1BQWMsQ0FBQyxlQUFlLEdBQUcsaUJBQWlCLENBQUE7QUFDcEQsZ0RBQWdEO0FBQ2hELElBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQTtBQUM5RCxtSkFBbUo7QUFDbkosUUFBUSxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQ3ZDLEdBQVEsRUFDUixLQUFVLEVBQ1YsT0FBWTtJQUVaLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDNUIsT0FBTyxHQUFHLEtBQUssQ0FBQTtJQUNqQixDQUFDO0lBQ0QsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUUsQ0FBQztRQUMzQyxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFDRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFBO0FBQy9DLENBQUMsQ0FBQTtBQUNELENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsS0FBSyxDQUFDOztJQUN2QixNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUs7UUFDbkIsQ0FBQSxNQUFBLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxNQUFNLDBDQUFFLGNBQWM7WUFDckQsR0FBRzthQUNILE1BQUEsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sMENBQUUsT0FBTyxDQUFBLENBQUE7SUFDaEQsSUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtJQUMxRSxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQ3BCLGVBQWUsQ0FBQyxXQUFXO1lBQ3pCLENBQUEsTUFBQSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsTUFBTSwwQ0FBRSxjQUFjLElBQUcsRUFBRSxDQUFBO0lBQzlELENBQUM7SUFDRCxJQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUN2RCx3QkFBd0IsQ0FDekIsQ0FBQTtJQUNELElBQUksbUJBQW1CLEVBQUUsQ0FBQztRQUN4QixtQkFBbUIsQ0FBQyxXQUFXO1lBQzdCLENBQUEsTUFBQSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsTUFBTSwwQ0FBRSxPQUFPLElBQUcsRUFBRSxDQUFBO0lBQ3ZELENBQUM7SUFDRCxNQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQywwQ0FBRSxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0FBQzFFLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgJ2ZvY3VzLXZpc2libGUnXG5pbXBvcnQgJ2Nlc2l1bS9CdWlsZC9DZXNpdW0vV2lkZ2V0cy93aWRnZXRzLmNzcydcbmltcG9ydCAnQGJsdWVwcmludGpzL2NvcmUvbGliL2Nzcy9ibHVlcHJpbnQuY3NzJ1xuaW1wb3J0ICdAYmx1ZXByaW50anMvZGF0ZXRpbWUvbGliL2Nzcy9ibHVlcHJpbnQtZGF0ZXRpbWUuY3NzJ1xuaW1wb3J0ICdmb250LWF3ZXNvbWUvY3NzL2ZvbnQtYXdlc29tZS5jc3MnXG5pbXBvcnQgJy4uL2xpYi9jZXNpdW0tZHJhd2hlbHBlci9EcmF3SGVscGVyLmNzcydcbmltcG9ydCAnZ29sZGVuLWxheW91dC9zcmMvY3NzL2dvbGRlbmxheW91dC1iYXNlLmNzcydcbmltcG9ydCAnZ29sZGVuLWxheW91dC9zcmMvY3NzL2dvbGRlbmxheW91dC1kYXJrLXRoZW1lLmNzcydcbmltcG9ydCAnLi4vc3R5bGVzL2ZvbnRzLmNzcydcbmltcG9ydCAnLi4vc3R5bGVzL2lucHV0LXJhbmdlLmNzcydcbmltcG9ydCAnLi4vc3R5bGVzL2FkZGl0aW9uYWwtc3R5bGVzLmNzcydcbmltcG9ydCAnLi4vc3R5bGVzL3Bsb3RseS5jc3MnXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgJy4vZXh0ZW5zaW9ucy9hcHBsaWNhdGlvbi5wYXRjaGVzJ1xuaW1wb3J0ICcuLi9jb21wb25lbnQvc2luZ2xldG9ucy9zZXNzaW9uLWF1dG8tcmVuZXcnXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAkKCdodG1sJykuYWRkQ2xhc3MoJ2lzLWRldmVsb3BtZW50Jylcbn1cbi8vIEB0cy1pZ25vcmUgZGlzYWJsZSBhbGwgcmVhY3QtYmVhdXRpZnVsLWRuZCBkZXZlbG9wbWVudCB3YXJuaW5ncyAod2UgaGF2ZSBzb21lIHNwdXJpb3VzIG9uZXMsIGJ1dCBpZiB5b3UncmUgd29ya2luZyBhIGNvbXBvbmVudCB3aXRoIHRoaXMgeW91IGNhbiByZS1lbmFibGUpXG53aW5kb3dbJ19fcmVhY3QtYmVhdXRpZnVsLWRuZC1kaXNhYmxlLWRldi13YXJuaW5ncyddID0gdHJ1ZVxuOyh3aW5kb3cgYXMgYW55KS5DRVNJVU1fQkFTRV9VUkwgPSAnLi9jZXNpdW0vYXNzZXRzJ1xuLy9pbiBoZXJlIHdlIGRyb3AgaW4gYW55IHRvcCBsZXZlbCBwYXRjaGVzLCBldGMuXG5jb25zdCBhc3NvY2lhdGlvbnNTZXQgPSBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwucHJvdG90eXBlLnNldFxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzMjIpIEZJWE1FOiBUeXBlICcoa2V5OiBhbnksIHZhbHVlOiBhbnksIG9wdGlvbnM6IGFueSkgPT4gYW55Jy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5CYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChcbiAga2V5OiBhbnksXG4gIHZhbHVlOiBhbnksXG4gIG9wdGlvbnM6IGFueVxuKSB7XG4gIGlmICh0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xuICAgIG9wdGlvbnMgPSB2YWx1ZVxuICB9XG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMud2l0aG91dFNldCA9PT0gdHJ1ZSkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cbiAgcmV0dXJuIGFzc29jaWF0aW9uc1NldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG4kKHdpbmRvdy5kb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPVxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWc/LmN1c3RvbUJyYW5kaW5nICtcbiAgICAnICcgK1xuICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWc/LnByb2R1Y3RcbiAgY29uc3Qgd2VsY29tZUJyYW5kaW5nID0gd2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy53ZWxjb21lLWJyYW5kaW5nJylcbiAgaWYgKHdlbGNvbWVCcmFuZGluZykge1xuICAgIHdlbGNvbWVCcmFuZGluZy50ZXh0Q29udGVudCA9XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnPy5jdXN0b21CcmFuZGluZyArICcnXG4gIH1cbiAgY29uc3Qgd2VsY29tZUJyYW5kaW5nTmFtZSA9IHdpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICcud2VsY29tZS1icmFuZGluZy1uYW1lJ1xuICApXG4gIGlmICh3ZWxjb21lQnJhbmRpbmdOYW1lKSB7XG4gICAgd2VsY29tZUJyYW5kaW5nTmFtZS50ZXh0Q29udGVudCA9XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnPy5wcm9kdWN0ICsgJydcbiAgfVxuICB3aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvYWRpbmcnKT8uY2xhc3NMaXN0LmFkZCgnc2hvdy13ZWxjb21lJylcbn0pXG4iXX0=