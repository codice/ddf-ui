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
//# sourceMappingURL=session-timeout.js.map