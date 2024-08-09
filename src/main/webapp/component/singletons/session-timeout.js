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
//meant to be used for just in time feature detection
import Backbone from 'backbone';
import $ from 'jquery';
import _ from 'underscore';
import fetch from '../../react-component/utils/fetch';
import featureDetection from './feature-detection';
import { StartupDataStore } from '../../js/model/Startup/startup';
var invalidateUrl = './internal/session/invalidate?service=';
var idleNoticeDuration = 60000;
// Length of inactivity that will trigger user timeout (15 minutes in ms by default)
// See STIG V-69243
var idleTimeoutThreshold = StartupDataStore.Configuration.getPlatformUITimeout() > 0
    ? StartupDataStore.Configuration.getPlatformUITimeout() * 60000
    : 900000;
function getIdleTimeoutDate() {
    return idleTimeoutThreshold + Date.now();
}
var sessionTimeoutModel = new (Backbone.Model.extend({
    defaults: {
        showPrompt: false,
        idleTimeoutDate: 0,
    },
    initialize: function () {
        $(window).on('storage', this.handleLocalStorageChange.bind(this));
        this.listenTo(this, 'change:idleTimeoutDate', this.handleIdleTimeoutDate);
        this.listenTo(this, 'change:showPrompt', this.handleShowPrompt);
        this.resetIdleTimeoutDate();
        this.handleShowPrompt();
    },
    handleLocalStorageChange: function () {
        this.set('idleTimeoutDate', parseInt(localStorage.getItem('idleTimeoutDate')));
        this.hidePrompt();
    },
    handleIdleTimeoutDate: function () {
        this.clearPromptTimer();
        this.setPromptTimer();
        this.clearLogoutTimer();
        this.setLogoutTimer();
    },
    handleShowPrompt: function () {
        if (this.get('showPrompt')) {
            this.stopListeningForUserActivity();
        }
        else {
            this.startListeningForUserActivity();
        }
    },
    setPromptTimer: function () {
        var timeout = this.get('idleTimeoutDate') - idleNoticeDuration - Date.now();
        timeout = Math.max(0, timeout);
        this.promptTimer = setTimeout(this.showPrompt.bind(this), timeout);
    },
    showPrompt: function () {
        this.set('showPrompt', true);
    },
    hidePrompt: function () {
        this.set('showPrompt', false);
    },
    clearPromptTimer: function () {
        clearTimeout(this.promptTimer);
    },
    setLogoutTimer: function () {
        var timeout = this.get('idleTimeoutDate') - Date.now();
        timeout = Math.max(0, timeout);
        this.logoutTimer = setTimeout(this.logout.bind(this), timeout);
    },
    clearLogoutTimer: function () {
        clearTimeout(this.logoutTimer);
    },
    resetIdleTimeoutDate: function () {
        var idleTimeoutDate = getIdleTimeoutDate();
        if (featureDetection.supportsFeature('localStorage')) {
            try {
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
                localStorage.setItem('idleTimeoutDate', idleTimeoutDate);
            }
            catch (e) {
                featureDetection.addFailure('localStorage');
            }
        }
        this.set('idleTimeoutDate', idleTimeoutDate);
    },
    startListeningForUserActivity: function () {
        $(document).on('keydown.sessionTimeout mousedown.sessionTimeout', _.throttle(this.resetIdleTimeoutDate.bind(this), 5000));
    },
    stopListeningForUserActivity: function () {
        $(document).off('keydown.sessionTimeout mousedown.sessionTimeout');
    },
    logout: function () {
        if (window.onbeforeunload != null) {
            window.onbeforeunload = null;
        }
        fetch(invalidateUrl + window.location.href, {
            redirect: 'manual',
        }).finally(function () {
            window.location.reload();
        });
    },
    renew: function () {
        this.hidePrompt();
        this.resetIdleTimeoutDate();
    },
    getIdleSeconds: function () {
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'number' is not assignable to par... Remove this comment to see the full error message
        return parseInt((this.get('idleTimeoutDate') - Date.now()) / 1000);
    },
}))();
export default sessionTimeoutModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi10aW1lb3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9zaW5nbGV0b25zL3Nlc3Npb24tdGltZW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0oscURBQXFEO0FBQ3JELE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxDQUFDLE1BQU0sWUFBWSxDQUFBO0FBQzFCLE9BQU8sS0FBSyxNQUFNLG1DQUFtQyxDQUFBO0FBQ3JELE9BQU8sZ0JBQWdCLE1BQU0scUJBQXFCLENBQUE7QUFDbEQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDakUsSUFBTSxhQUFhLEdBQUcsd0NBQXdDLENBQUE7QUFDOUQsSUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUE7QUFDaEMsb0ZBQW9GO0FBQ3BGLG1CQUFtQjtBQUNuQixJQUFNLG9CQUFvQixHQUN4QixnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDO0lBQ3ZELENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxLQUFLO0lBQy9ELENBQUMsQ0FBQyxNQUFNLENBQUE7QUFDWixTQUFTLGtCQUFrQjtJQUN6QixPQUFPLG9CQUFvQixHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQTtBQUMxQyxDQUFDO0FBQ0QsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDckQsUUFBUSxFQUFFO1FBQ1IsVUFBVSxFQUFFLEtBQUs7UUFDakIsZUFBZSxFQUFFLENBQUM7S0FDbkI7SUFDRCxVQUFVO1FBQ1IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUs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dGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLy9tZWFudCB0byBiZSB1c2VkIGZvciBqdXN0IGluIHRpbWUgZmVhdHVyZSBkZXRlY3Rpb25cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2ZldGNoJ1xuaW1wb3J0IGZlYXR1cmVEZXRlY3Rpb24gZnJvbSAnLi9mZWF0dXJlLWRldGVjdGlvbidcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5jb25zdCBpbnZhbGlkYXRlVXJsID0gJy4vaW50ZXJuYWwvc2Vzc2lvbi9pbnZhbGlkYXRlP3NlcnZpY2U9J1xuY29uc3QgaWRsZU5vdGljZUR1cmF0aW9uID0gNjAwMDBcbi8vIExlbmd0aCBvZiBpbmFjdGl2aXR5IHRoYXQgd2lsbCB0cmlnZ2VyIHVzZXIgdGltZW91dCAoMTUgbWludXRlcyBpbiBtcyBieSBkZWZhdWx0KVxuLy8gU2VlIFNUSUcgVi02OTI0M1xuY29uc3QgaWRsZVRpbWVvdXRUaHJlc2hvbGQgPVxuICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UGxhdGZvcm1VSVRpbWVvdXQoKSA+IDBcbiAgICA/IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRQbGF0Zm9ybVVJVGltZW91dCgpICogNjAwMDBcbiAgICA6IDkwMDAwMFxuZnVuY3Rpb24gZ2V0SWRsZVRpbWVvdXREYXRlKCkge1xuICByZXR1cm4gaWRsZVRpbWVvdXRUaHJlc2hvbGQgKyBEYXRlLm5vdygpXG59XG5jb25zdCBzZXNzaW9uVGltZW91dE1vZGVsID0gbmV3IChCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0czoge1xuICAgIHNob3dQcm9tcHQ6IGZhbHNlLFxuICAgIGlkbGVUaW1lb3V0RGF0ZTogMCxcbiAgfSxcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICAkKHdpbmRvdykub24oJ3N0b3JhZ2UnLCB0aGlzLmhhbmRsZUxvY2FsU3RvcmFnZUNoYW5nZS5iaW5kKHRoaXMpKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTppZGxlVGltZW91dERhdGUnLCB0aGlzLmhhbmRsZUlkbGVUaW1lb3V0RGF0ZSlcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6c2hvd1Byb21wdCcsIHRoaXMuaGFuZGxlU2hvd1Byb21wdClcbiAgICB0aGlzLnJlc2V0SWRsZVRpbWVvdXREYXRlKClcbiAgICB0aGlzLmhhbmRsZVNob3dQcm9tcHQoKVxuICB9LFxuICBoYW5kbGVMb2NhbFN0b3JhZ2VDaGFuZ2UoKSB7XG4gICAgdGhpcy5zZXQoXG4gICAgICAnaWRsZVRpbWVvdXREYXRlJyxcbiAgICAgIHBhcnNlSW50KGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpZGxlVGltZW91dERhdGUnKSBhcyBhbnkpXG4gICAgKVxuICAgIHRoaXMuaGlkZVByb21wdCgpXG4gIH0sXG4gIGhhbmRsZUlkbGVUaW1lb3V0RGF0ZSgpIHtcbiAgICB0aGlzLmNsZWFyUHJvbXB0VGltZXIoKVxuICAgIHRoaXMuc2V0UHJvbXB0VGltZXIoKVxuICAgIHRoaXMuY2xlYXJMb2dvdXRUaW1lcigpXG4gICAgdGhpcy5zZXRMb2dvdXRUaW1lcigpXG4gIH0sXG4gIGhhbmRsZVNob3dQcm9tcHQoKSB7XG4gICAgaWYgKHRoaXMuZ2V0KCdzaG93UHJvbXB0JykpIHtcbiAgICAgIHRoaXMuc3RvcExpc3RlbmluZ0ZvclVzZXJBY3Rpdml0eSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhcnRMaXN0ZW5pbmdGb3JVc2VyQWN0aXZpdHkoKVxuICAgIH1cbiAgfSxcbiAgc2V0UHJvbXB0VGltZXIoKSB7XG4gICAgbGV0IHRpbWVvdXQgPSB0aGlzLmdldCgnaWRsZVRpbWVvdXREYXRlJykgLSBpZGxlTm90aWNlRHVyYXRpb24gLSBEYXRlLm5vdygpXG4gICAgdGltZW91dCA9IE1hdGgubWF4KDAsIHRpbWVvdXQpXG4gICAgdGhpcy5wcm9tcHRUaW1lciA9IHNldFRpbWVvdXQodGhpcy5zaG93UHJvbXB0LmJpbmQodGhpcyksIHRpbWVvdXQpXG4gIH0sXG4gIHNob3dQcm9tcHQoKSB7XG4gICAgdGhpcy5zZXQoJ3Nob3dQcm9tcHQnLCB0cnVlKVxuICB9LFxuICBoaWRlUHJvbXB0KCkge1xuICAgIHRoaXMuc2V0KCdzaG93UHJvbXB0JywgZmFsc2UpXG4gIH0sXG4gIGNsZWFyUHJvbXB0VGltZXIoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucHJvbXB0VGltZXIpXG4gIH0sXG4gIHNldExvZ291dFRpbWVyKCkge1xuICAgIGxldCB0aW1lb3V0ID0gdGhpcy5nZXQoJ2lkbGVUaW1lb3V0RGF0ZScpIC0gRGF0ZS5ub3coKVxuICAgIHRpbWVvdXQgPSBNYXRoLm1heCgwLCB0aW1lb3V0KVxuICAgIHRoaXMubG9nb3V0VGltZXIgPSBzZXRUaW1lb3V0KHRoaXMubG9nb3V0LmJpbmQodGhpcyksIHRpbWVvdXQpXG4gIH0sXG4gIGNsZWFyTG9nb3V0VGltZXIoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMubG9nb3V0VGltZXIpXG4gIH0sXG4gIHJlc2V0SWRsZVRpbWVvdXREYXRlKCkge1xuICAgIGNvbnN0IGlkbGVUaW1lb3V0RGF0ZSA9IGdldElkbGVUaW1lb3V0RGF0ZSgpXG4gICAgaWYgKGZlYXR1cmVEZXRlY3Rpb24uc3VwcG9ydHNGZWF0dXJlKCdsb2NhbFN0b3JhZ2UnKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICdudW1iZXInIGlzIG5vdCBhc3NpZ25hYmxlIHRvIHBhci4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpZGxlVGltZW91dERhdGUnLCBpZGxlVGltZW91dERhdGUpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGZlYXR1cmVEZXRlY3Rpb24uYWRkRmFpbHVyZSgnbG9jYWxTdG9yYWdlJylcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXQoJ2lkbGVUaW1lb3V0RGF0ZScsIGlkbGVUaW1lb3V0RGF0ZSlcbiAgfSxcbiAgc3RhcnRMaXN0ZW5pbmdGb3JVc2VyQWN0aXZpdHkoKSB7XG4gICAgJChkb2N1bWVudCkub24oXG4gICAgICAna2V5ZG93bi5zZXNzaW9uVGltZW91dCBtb3VzZWRvd24uc2Vzc2lvblRpbWVvdXQnLFxuICAgICAgXy50aHJvdHRsZSh0aGlzLnJlc2V0SWRsZVRpbWVvdXREYXRlLmJpbmQodGhpcyksIDUwMDApXG4gICAgKVxuICB9LFxuICBzdG9wTGlzdGVuaW5nRm9yVXNlckFjdGl2aXR5KCkge1xuICAgICQoZG9jdW1lbnQpLm9mZigna2V5ZG93bi5zZXNzaW9uVGltZW91dCBtb3VzZWRvd24uc2Vzc2lvblRpbWVvdXQnKVxuICB9LFxuICBsb2dvdXQoKSB7XG4gICAgaWYgKHdpbmRvdy5vbmJlZm9yZXVubG9hZCAhPSBudWxsKSB7XG4gICAgICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBudWxsXG4gICAgfVxuICAgIGZldGNoKGludmFsaWRhdGVVcmwgKyB3aW5kb3cubG9jYXRpb24uaHJlZiwge1xuICAgICAgcmVkaXJlY3Q6ICdtYW51YWwnLFxuICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgfSlcbiAgfSxcbiAgcmVuZXcoKSB7XG4gICAgdGhpcy5oaWRlUHJvbXB0KClcbiAgICB0aGlzLnJlc2V0SWRsZVRpbWVvdXREYXRlKClcbiAgfSxcbiAgZ2V0SWRsZVNlY29uZHMoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICdudW1iZXInIGlzIG5vdCBhc3NpZ25hYmxlIHRvIHBhci4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgcmV0dXJuIHBhcnNlSW50KCh0aGlzLmdldCgnaWRsZVRpbWVvdXREYXRlJykgLSBEYXRlLm5vdygpKSAvIDEwMDApXG4gIH0sXG59KSkoKVxuZXhwb3J0IGRlZmF1bHQgc2Vzc2lvblRpbWVvdXRNb2RlbFxuIl19