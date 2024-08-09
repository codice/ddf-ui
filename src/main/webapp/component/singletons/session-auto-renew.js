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
import fetch from '../../react-component/utils/fetch';
var sessionExpiryUrl = './internal/session/expiry';
var sessionAutoRenewModel = new (Backbone.Model.extend({
    defaults: {
        sessionRenewDate: undefined,
    },
    initialize: function () {
        this.initializeSessionRenewDate();
        this.listenTo(this, 'change:sessionRenewDate', this.handleSessionRenewDate);
    },
    initializeSessionRenewDate: function () {
        fetch(sessionExpiryUrl)
            .then(function (response) { return response.json(); })
            .then(this.handleExpiryTimeResponse.bind(this))
            .catch(function () {
            console.warn('what do we do on failure');
        });
    },
    handleExpiryTimeResponse: function (response) {
        var msUntilTimeout = parseInt(response);
        var msUntilAutoRenew = Math.max(msUntilTimeout * 0.7, msUntilTimeout - 60000); // 70% or at least one minute before
        this.set('sessionRenewDate', Date.now() + msUntilAutoRenew);
    },
    handleSessionRenewDate: function () {
        this.clearSessionRenewTimer();
        this.setSessionRenewTimer();
    },
    setSessionRenewTimer: function () {
        this.sessionRenewTimer = setTimeout(this.renewSession.bind(this), this.get('sessionRenewDate') - Date.now());
    },
    clearSessionRenewTimer: function () {
        clearTimeout(this.sessionRenewTimer);
    },
    renewSession: function () {
        fetch(sessionExpiryUrl)
            .then(function (response) { return response.json(); })
            .then(this.handleExpiryTimeResponse.bind(this))
            .catch(function () {
            console.warn('what do we do on a failure');
        });
    },
}))();
export default sessionAutoRenewModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi1hdXRvLXJlbmV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9zaW5nbGV0b25zL3Nlc3Npb24tYXV0by1yZW5ldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBRUoscURBQXFEO0FBRXJELE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEtBQUssTUFBTSxtQ0FBbUMsQ0FBQTtBQUVyRCxJQUFNLGdCQUFnQixHQUFHLDJCQUEyQixDQUFBO0FBRXBELElBQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3ZELFFBQVEsRUFBRTtRQUNSLGdCQUFnQixFQUFFLFNBQVM7S0FDNUI7SUFDRCxVQUFVO1FBQ1IsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUE7UUFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUseUJBQXlCLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUE7SUFDN0UsQ0FBQztJQUNELDBCQUEwQjtRQUN4QixLQUFLLENBQUMsZ0JBQWdCLENBQUM7YUFDcEIsSUFBSSxDQUFDLFVBQUMsUUFBUSxJQUFLLE9BQUEsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFmLENBQWUsQ0FBQzthQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM5QyxLQUFLLENBQUM7WUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUE7UUFDMUMsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0lBQ0Qsd0JBQXdCLFlBQUMsUUFBYTtRQUNwQyxJQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDekMsSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUMvQixjQUFjLEdBQUcsR0FBRyxFQUNwQixjQUFjLEdBQUcsS0FBSyxDQUN2QixDQUFBLENBQUMsb0NBQW9DO1FBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLGdCQUFnQixDQUFDLENBQUE7SUFDN0QsQ0FBQztJQUNELHNCQUFzQjtRQUNwQixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQTtRQUM3QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQTtJQUM3QixDQUFDO0lBQ0Qsb0JBQW9CO1FBQ2xCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxVQUFVLENBQ2pDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUMxQyxDQUFBO0lBQ0gsQ0FBQztJQUNELHNCQUFzQjtRQUNwQixZQUFZLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUE7SUFDdEMsQ0FBQztJQUNELFlBQVk7UUFDVixLQUFLLENBQUMsZ0JBQWdCLENBQUM7YUFDcEIsSUFBSSxDQUFDLFVBQUMsUUFBUSxJQUFLLE9BQUEsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFmLENBQWUsQ0FBQzthQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM5QyxLQUFLLENBQUM7WUFDTCxPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUE7UUFDNUMsQ0FBQyxDQUFDLENBQUE7SUFDTixDQUFDO0NBQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUVMLGVBQWUscUJBQXFCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuLy9tZWFudCB0byBiZSB1c2VkIGZvciBqdXN0IGluIHRpbWUgZmVhdHVyZSBkZXRlY3Rpb25cblxuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IGZldGNoIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9mZXRjaCdcblxuY29uc3Qgc2Vzc2lvbkV4cGlyeVVybCA9ICcuL2ludGVybmFsL3Nlc3Npb24vZXhwaXJ5J1xuXG5jb25zdCBzZXNzaW9uQXV0b1JlbmV3TW9kZWwgPSBuZXcgKEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gIGRlZmF1bHRzOiB7XG4gICAgc2Vzc2lvblJlbmV3RGF0ZTogdW5kZWZpbmVkLFxuICB9LFxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZVNlc3Npb25SZW5ld0RhdGUoKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpzZXNzaW9uUmVuZXdEYXRlJywgdGhpcy5oYW5kbGVTZXNzaW9uUmVuZXdEYXRlKVxuICB9LFxuICBpbml0aWFsaXplU2Vzc2lvblJlbmV3RGF0ZSgpIHtcbiAgICBmZXRjaChzZXNzaW9uRXhwaXJ5VXJsKVxuICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAudGhlbih0aGlzLmhhbmRsZUV4cGlyeVRpbWVSZXNwb25zZS5iaW5kKHRoaXMpKVxuICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgY29uc29sZS53YXJuKCd3aGF0IGRvIHdlIGRvIG9uIGZhaWx1cmUnKVxuICAgICAgfSlcbiAgfSxcbiAgaGFuZGxlRXhwaXJ5VGltZVJlc3BvbnNlKHJlc3BvbnNlOiBhbnkpIHtcbiAgICBjb25zdCBtc1VudGlsVGltZW91dCA9IHBhcnNlSW50KHJlc3BvbnNlKVxuICAgIGNvbnN0IG1zVW50aWxBdXRvUmVuZXcgPSBNYXRoLm1heChcbiAgICAgIG1zVW50aWxUaW1lb3V0ICogMC43LFxuICAgICAgbXNVbnRpbFRpbWVvdXQgLSA2MDAwMFxuICAgICkgLy8gNzAlIG9yIGF0IGxlYXN0IG9uZSBtaW51dGUgYmVmb3JlXG4gICAgdGhpcy5zZXQoJ3Nlc3Npb25SZW5ld0RhdGUnLCBEYXRlLm5vdygpICsgbXNVbnRpbEF1dG9SZW5ldylcbiAgfSxcbiAgaGFuZGxlU2Vzc2lvblJlbmV3RGF0ZSgpIHtcbiAgICB0aGlzLmNsZWFyU2Vzc2lvblJlbmV3VGltZXIoKVxuICAgIHRoaXMuc2V0U2Vzc2lvblJlbmV3VGltZXIoKVxuICB9LFxuICBzZXRTZXNzaW9uUmVuZXdUaW1lcigpIHtcbiAgICB0aGlzLnNlc3Npb25SZW5ld1RpbWVyID0gc2V0VGltZW91dChcbiAgICAgIHRoaXMucmVuZXdTZXNzaW9uLmJpbmQodGhpcyksXG4gICAgICB0aGlzLmdldCgnc2Vzc2lvblJlbmV3RGF0ZScpIC0gRGF0ZS5ub3coKVxuICAgIClcbiAgfSxcbiAgY2xlYXJTZXNzaW9uUmVuZXdUaW1lcigpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5zZXNzaW9uUmVuZXdUaW1lcilcbiAgfSxcbiAgcmVuZXdTZXNzaW9uKCkge1xuICAgIGZldGNoKHNlc3Npb25FeHBpcnlVcmwpXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSlcbiAgICAgIC50aGVuKHRoaXMuaGFuZGxlRXhwaXJ5VGltZVJlc3BvbnNlLmJpbmQodGhpcykpXG4gICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICBjb25zb2xlLndhcm4oJ3doYXQgZG8gd2UgZG8gb24gYSBmYWlsdXJlJylcbiAgICAgIH0pXG4gIH0sXG59KSkoKVxuXG5leHBvcnQgZGVmYXVsdCBzZXNzaW9uQXV0b1JlbmV3TW9kZWxcbiJdfQ==