import { __awaiter, __generator } from "tslib";
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
    navigate: function (url) {
        window.location.href = url;
    },
    logout: function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (window.onbeforeunload != null) {
                            window.onbeforeunload = null;
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(invalidateUrl + encodeURIComponent(window.location.href))];
                    case 2:
                        res = _c.sent();
                        _a = this.navigate;
                        return [4 /*yield*/, res.text()];
                    case 3:
                        _a.apply(this, [_c.sent()]);
                        return [3 /*break*/, 5];
                    case 4:
                        _b = _c.sent();
                        window.location.reload();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvbi10aW1lb3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9zaW5nbGV0b25zL3Nlc3Npb24tdGltZW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLHFEQUFxRDtBQUNyRCxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFDL0IsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEtBQUssTUFBTSxtQ0FBbUMsQ0FBQTtBQUNyRCxPQUFPLGdCQUFnQixNQUFNLHFCQUFxQixDQUFBO0FBQ2xELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pFLElBQU0sYUFBYSxHQUFHLHdDQUF3QyxDQUFBO0FBQzlELElBQU0sa0JBQWtCLEdBQUcsS0FBSyxDQUFBO0FBQ2hDLG9GQUFvRjtBQUNwRixtQkFBbUI7QUFDbkIsSUFBTSxvQkFBb0IsR0FDeEIsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQztJQUN2RCxDQUFDLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG9CQUFvQixFQUFFLEdBQUcsS0FBSztJQUMvRCxDQUFDLENBQUMsTUFBTSxDQUFBO0FBQ1osU0FBUyxrQkFBa0I7SUFDekIsT0FBTyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7QUFDMUMsQ0FBQztBQUNELElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ3JELFFBQVEsRUFBRTtRQUNSLFVBQVUsRUFBRSxLQUFLO1FBQ2pCLGVBQWUsRUFBRSxDQUFDO0tBQ25CO0lBQ0QsVUFBVTtRQUNSLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFF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QUFDO0lBQ0QsY0FBYztRQUNaLG1KQUFtSjtRQUNuSixPQUFPLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNwRSxDQUFDO0NBQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUNMLGVBQWUsbUJBQW1CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbi8vbWVhbnQgdG8gYmUgdXNlZCBmb3IganVzdCBpbiB0aW1lIGZlYXR1cmUgZGV0ZWN0aW9uXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IGZldGNoIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9mZXRjaCdcbmltcG9ydCBmZWF0dXJlRGV0ZWN0aW9uIGZyb20gJy4vZmVhdHVyZS1kZXRlY3Rpb24nXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuY29uc3QgaW52YWxpZGF0ZVVybCA9ICcuL2ludGVybmFsL3Nlc3Npb24vaW52YWxpZGF0ZT9zZXJ2aWNlPSdcbmNvbnN0IGlkbGVOb3RpY2VEdXJhdGlvbiA9IDYwMDAwXG4vLyBMZW5ndGggb2YgaW5hY3Rpdml0eSB0aGF0IHdpbGwgdHJpZ2dlciB1c2VyIHRpbWVvdXQgKDE1IG1pbnV0ZXMgaW4gbXMgYnkgZGVmYXVsdClcbi8vIFNlZSBTVElHIFYtNjkyNDNcbmNvbnN0IGlkbGVUaW1lb3V0VGhyZXNob2xkID1cbiAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFBsYXRmb3JtVUlUaW1lb3V0KCkgPiAwXG4gICAgPyBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UGxhdGZvcm1VSVRpbWVvdXQoKSAqIDYwMDAwXG4gICAgOiA5MDAwMDBcbmZ1bmN0aW9uIGdldElkbGVUaW1lb3V0RGF0ZSgpIHtcbiAgcmV0dXJuIGlkbGVUaW1lb3V0VGhyZXNob2xkICsgRGF0ZS5ub3coKVxufVxuY29uc3Qgc2Vzc2lvblRpbWVvdXRNb2RlbCA9IG5ldyAoQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgZGVmYXVsdHM6IHtcbiAgICBzaG93UHJvbXB0OiBmYWxzZSxcbiAgICBpZGxlVGltZW91dERhdGU6IDAsXG4gIH0sXG4gIGluaXRpYWxpemUoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdzdG9yYWdlJywgdGhpcy5oYW5kbGVMb2NhbFN0b3JhZ2VDaGFuZ2UuYmluZCh0aGlzKSlcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6aWRsZVRpbWVvdXREYXRlJywgdGhpcy5oYW5kbGVJZGxlVGltZW91dERhdGUpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOnNob3dQcm9tcHQnLCB0aGlzLmhhbmRsZVNob3dQcm9tcHQpXG4gICAgdGhpcy5yZXNldElkbGVUaW1lb3V0RGF0ZSgpXG4gICAgdGhpcy5oYW5kbGVTaG93UHJvbXB0KClcbiAgfSxcbiAgaGFuZGxlTG9jYWxTdG9yYWdlQ2hhbmdlKCkge1xuICAgIHRoaXMuc2V0KFxuICAgICAgJ2lkbGVUaW1lb3V0RGF0ZScsXG4gICAgICBwYXJzZUludChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnaWRsZVRpbWVvdXREYXRlJykgYXMgYW55KVxuICAgIClcbiAgICB0aGlzLmhpZGVQcm9tcHQoKVxuICB9LFxuICBoYW5kbGVJZGxlVGltZW91dERhdGUoKSB7XG4gICAgdGhpcy5jbGVhclByb21wdFRpbWVyKClcbiAgICB0aGlzLnNldFByb21wdFRpbWVyKClcbiAgICB0aGlzLmNsZWFyTG9nb3V0VGltZXIoKVxuICAgIHRoaXMuc2V0TG9nb3V0VGltZXIoKVxuICB9LFxuICBoYW5kbGVTaG93UHJvbXB0KCkge1xuICAgIGlmICh0aGlzLmdldCgnc2hvd1Byb21wdCcpKSB7XG4gICAgICB0aGlzLnN0b3BMaXN0ZW5pbmdGb3JVc2VyQWN0aXZpdHkoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0TGlzdGVuaW5nRm9yVXNlckFjdGl2aXR5KClcbiAgICB9XG4gIH0sXG4gIHNldFByb21wdFRpbWVyKCkge1xuICAgIGxldCB0aW1lb3V0ID0gdGhpcy5nZXQoJ2lkbGVUaW1lb3V0RGF0ZScpIC0gaWRsZU5vdGljZUR1cmF0aW9uIC0gRGF0ZS5ub3coKVxuICAgIHRpbWVvdXQgPSBNYXRoLm1heCgwLCB0aW1lb3V0KVxuICAgIHRoaXMucHJvbXB0VGltZXIgPSBzZXRUaW1lb3V0KHRoaXMuc2hvd1Byb21wdC5iaW5kKHRoaXMpLCB0aW1lb3V0KVxuICB9LFxuICBzaG93UHJvbXB0KCkge1xuICAgIHRoaXMuc2V0KCdzaG93UHJvbXB0JywgdHJ1ZSlcbiAgfSxcbiAgaGlkZVByb21wdCgpIHtcbiAgICB0aGlzLnNldCgnc2hvd1Byb21wdCcsIGZhbHNlKVxuICB9LFxuICBjbGVhclByb21wdFRpbWVyKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnByb21wdFRpbWVyKVxuICB9LFxuICBzZXRMb2dvdXRUaW1lcigpIHtcbiAgICBsZXQgdGltZW91dCA9IHRoaXMuZ2V0KCdpZGxlVGltZW91dERhdGUnKSAtIERhdGUubm93KClcbiAgICB0aW1lb3V0ID0gTWF0aC5tYXgoMCwgdGltZW91dClcbiAgICB0aGlzLmxvZ291dFRpbWVyID0gc2V0VGltZW91dCh0aGlzLmxvZ291dC5iaW5kKHRoaXMpLCB0aW1lb3V0KVxuICB9LFxuICBjbGVhckxvZ291dFRpbWVyKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLmxvZ291dFRpbWVyKVxuICB9LFxuICByZXNldElkbGVUaW1lb3V0RGF0ZSgpIHtcbiAgICBjb25zdCBpZGxlVGltZW91dERhdGUgPSBnZXRJZGxlVGltZW91dERhdGUoKVxuICAgIGlmIChmZWF0dXJlRGV0ZWN0aW9uLnN1cHBvcnRzRmVhdHVyZSgnbG9jYWxTdG9yYWdlJykpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAnbnVtYmVyJyBpcyBub3QgYXNzaWduYWJsZSB0byBwYXIuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaWRsZVRpbWVvdXREYXRlJywgaWRsZVRpbWVvdXREYXRlKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBmZWF0dXJlRGV0ZWN0aW9uLmFkZEZhaWx1cmUoJ2xvY2FsU3RvcmFnZScpXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2V0KCdpZGxlVGltZW91dERhdGUnLCBpZGxlVGltZW91dERhdGUpXG4gIH0sXG4gIHN0YXJ0TGlzdGVuaW5nRm9yVXNlckFjdGl2aXR5KCkge1xuICAgICQoZG9jdW1lbnQpLm9uKFxuICAgICAgJ2tleWRvd24uc2Vzc2lvblRpbWVvdXQgbW91c2Vkb3duLnNlc3Npb25UaW1lb3V0JyxcbiAgICAgIF8udGhyb3R0bGUodGhpcy5yZXNldElkbGVUaW1lb3V0RGF0ZS5iaW5kKHRoaXMpLCA1MDAwKVxuICAgIClcbiAgfSxcbiAgc3RvcExpc3RlbmluZ0ZvclVzZXJBY3Rpdml0eSgpIHtcbiAgICAkKGRvY3VtZW50KS5vZmYoJ2tleWRvd24uc2Vzc2lvblRpbWVvdXQgbW91c2Vkb3duLnNlc3Npb25UaW1lb3V0JylcbiAgfSxcbiAgbmF2aWdhdGUodXJsOiBzdHJpbmcpIHtcbiAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHVybFxuICB9LFxuICBhc3luYyBsb2dvdXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHdpbmRvdy5vbmJlZm9yZXVubG9hZCAhPSBudWxsKSB7XG4gICAgICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBudWxsXG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChcbiAgICAgICAgaW52YWxpZGF0ZVVybCArIGVuY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaHJlZilcbiAgICAgIClcbiAgICAgIHRoaXMubmF2aWdhdGUoYXdhaXQgcmVzLnRleHQoKSlcbiAgICB9IGNhdGNoIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgIH1cbiAgfSxcbiAgcmVuZXcoKSB7XG4gICAgdGhpcy5oaWRlUHJvbXB0KClcbiAgICB0aGlzLnJlc2V0SWRsZVRpbWVvdXREYXRlKClcbiAgfSxcbiAgZ2V0SWRsZVNlY29uZHMoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICdudW1iZXInIGlzIG5vdCBhc3NpZ25hYmxlIHRvIHBhci4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgcmV0dXJuIHBhcnNlSW50KCh0aGlzLmdldCgnaWRsZVRpbWVvdXREYXRlJykgLSBEYXRlLm5vdygpKSAvIDEwMDApXG4gIH0sXG59KSkoKVxuZXhwb3J0IGRlZmF1bHQgc2Vzc2lvblRpbWVvdXRNb2RlbFxuIl19