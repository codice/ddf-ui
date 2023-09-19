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
import UploadModel from './Upload';
import Backbone from 'backbone';
import wreqr from '../wreqr';
import _ from 'underscore';
import { v4 } from 'uuid';
var updatePreferences = _.throttle(function () {
    ;
    wreqr.vent.trigger('preferences:save');
}, 1000);
export default Backbone.AssociatedModel.extend({
    options: undefined,
    defaults: function () {
        return {
            unseen: true,
            uploads: [],
            percentage: 0,
            errors: 0,
            successes: 0,
            complete: 0,
            amount: 0,
            issues: 0,
            sending: false,
            finished: false,
            interrupted: false,
            sentAt: undefined,
        };
    },
    relations: [
        {
            type: Backbone.Many,
            key: 'uploads',
            relatedModel: UploadModel,
        },
    ],
    bindCallbacks: function () {
        this.handleAddFile = this.handleAddFile.bind(this);
        this.handleTotalUploadProgress = this.handleTotalUploadProgress.bind(this);
        this.handleSending = this.handleSending.bind(this);
        this.handleQueueComplete = this.handleQueueComplete.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleComplete = this.handleComplete.bind(this);
    },
    // @ts-expect-error ts-migrate(6133) FIXME: 'attributes' is declared but its value is never re... Remove this comment to see the full error message
    initialize: function (attributes, options) {
        this.bindCallbacks();
        this.options = options;
        if (!this.id) {
            this.set('id', v4());
        }
        this.listenTo(this.get('uploads'), 'add remove reset update', this.handleUploadUpdate);
        this.listenTo(this.get('uploads'), 'change:issues', this.handleIssuesUpdates);
        this.listenToDropzone();
    },
    listenToDropzone: function () {
        if (this.options.dropzone) {
            this.options.dropzone.on('addedfile', this.handleAddFile);
            this.options.dropzone.on('totaluploadprogress', this.handleTotalUploadProgress);
            this.options.dropzone.on('sending', this.handleSending);
            this.options.dropzone.on('queuecomplete', this.handleQueueComplete);
            this.options.dropzone.on('success', this.handleSuccess);
            this.options.dropzone.on('error', this.handleError);
            this.options.dropzone.on('complete', this.handleComplete);
        }
        else {
            this.set('interrupted', this.get('interrupted') || !this.get('finished'));
            this.set('finished', true);
        }
    },
    handleAddFile: function (file) {
        this.get('uploads').add({
            file: file,
        }, {
            dropzone: this.options.dropzone,
        });
    },
    handleSuccess: function (file) {
        if (file.status !== 'canceled') {
            this.set('successes', this.get('successes') + 1);
        }
    },
    handleError: function (file) {
        if (file.status !== 'canceled') {
            this.set('errors', this.get('errors') + 1);
        }
    },
    handleComplete: function (file) {
        if (file.status === 'success') {
            this.set('complete', this.get('complete') + 1);
        }
        updatePreferences();
    },
    handleSending: function () {
        this.set({
            sending: true,
        });
    },
    handleTotalUploadProgress: function () {
        this.set({
            percentage: this.calculatePercentageDone(),
        });
    },
    unlistenToDropzone: function () {
        this.options.dropzone.off('addedfile', this.handleAddFile);
        this.options.dropzone.off('totaluploadprogress', this.handleTotalUploadProgress);
        this.options.dropzone.off('sending', this.handleSending);
        this.options.dropzone.off('queuecomplete', this.handleQueueComplete);
        this.options.dropzone.off('success', this.handleSuccess);
        this.options.dropzone.off('error', this.handleError);
        this.options.dropzone.off('complete', this.handleComplete);
    },
    handleQueueComplete: function () {
        var _this = this;
        // https://github.com/enyo/dropzone/blob/v4.3.0/dist/dropzone.js#L56
        // if we remove callbacks too early this loop will fail, look to see if updating to latest fixes this
        setTimeout(function () {
            _this.unlistenToDropzone();
        }, 0);
        this.set({
            finished: true,
            percentage: 100,
        });
        updatePreferences();
    },
    handleUploadUpdate: function () {
        this.set({
            amount: this.get('uploads').length,
        });
    },
    handleIssuesUpdates: function () {
        this.set({
            issues: this.get('uploads').reduce(function (issues, upload) {
                issues += upload.get('issues') ? 1 : 0;
                return issues;
            }, 0),
        });
    },
    clear: function () {
        this.cancel();
        this.get('uploads').reset();
    },
    cancel: function () {
        if (this.options.dropzone) {
            this.options.dropzone.removeAllFiles(true);
        }
        this.set('finished', true);
    },
    start: function () {
        if (this.options.dropzone) {
            this.set({
                sending: true,
                sentAt: Date.now(), //- Math.random() * 14 * 86400000
            });
            wreqr.vent.trigger('uploads:add', this);
            this.listenTo(this, 'change', updatePreferences);
            this.options.dropzone.options.autoProcessQueue = true;
            this.options.dropzone.processQueue();
        }
    },
    getTimeComparator: function () {
        return this.get('sentAt');
    },
    calculatePercentageDone: function () {
        var files = this.options.dropzone.files;
        if (files.length === 0) {
            return 100;
        }
        var totalBytes = files.reduce(function (total, file) {
            total += file.upload.total;
            return total;
        }, 0);
        var bytesSent = files.reduce(function (total, file) {
            total += file.upload.bytesSent;
            return total;
        }, 0);
        var progress = 100 * (bytesSent / totalBytes);
        if (progress >= 100 && !this.get('finished')) {
            progress = 99;
        }
        return progress;
    },
});
//# sourceMappingURL=UploadBatch.js.map