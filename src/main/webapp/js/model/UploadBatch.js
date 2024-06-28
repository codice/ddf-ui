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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkQmF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvVXBsb2FkQmF0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sV0FBVyxNQUFNLFVBQVUsQ0FBQTtBQUNsQyxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFDL0IsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBQ3pCLElBQU0saUJBQWlCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNuQyxDQUFDO0lBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUNsRCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDUixlQUFlLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQzdDLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFFBQVE7UUFDTixPQUFPO1lBQ0wsTUFBTSxFQUFFLElBQUk7WUFDWixPQUFPLEVBQUUsRUFBRTtZQUNYLFVBQVUsRUFBRSxDQUFDO1lBQ2IsTUFBTSxFQUFFLENBQUM7WUFDVCxTQUFTLEVBQUUsQ0FBQztZQUNaLFFBQVEsRUFBRSxDQUFDO1lBQ1gsTUFBTSxFQUFFLENBQUM7WUFDVCxNQUFNLEVBQUUsQ0FBQztZQUNULE9BQU8sRUFBRSxLQUFLO1lBQ2QsUUFBUSxFQUFFLEtBQUs7WUFDZixXQUFXLEVBQUUsS0FBSztZQUNsQixNQUFNLEVBQUUsU0FBUztTQUNsQixDQUFBO0lBQ0gsQ0FBQztJQUNELFNBQVMsRUFBRTtRQUNUO1lBQ0UsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1lBQ25CLEdBQUcsRUFBRSxTQUFTO1lBQ2QsWUFBWSxFQUFF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b25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBVcGxvYWRNb2RlbCBmcm9tICcuL1VwbG9hZCdcbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCB3cmVxciBmcm9tICcuLi93cmVxcidcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgeyB2NCB9IGZyb20gJ3V1aWQnXG5jb25zdCB1cGRhdGVQcmVmZXJlbmNlcyA9IF8udGhyb3R0bGUoKCkgPT4ge1xuICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCdwcmVmZXJlbmNlczpzYXZlJylcbn0sIDEwMDApXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgb3B0aW9uczogdW5kZWZpbmVkLFxuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdW5zZWVuOiB0cnVlLFxuICAgICAgdXBsb2FkczogW10sXG4gICAgICBwZXJjZW50YWdlOiAwLFxuICAgICAgZXJyb3JzOiAwLFxuICAgICAgc3VjY2Vzc2VzOiAwLFxuICAgICAgY29tcGxldGU6IDAsXG4gICAgICBhbW91bnQ6IDAsXG4gICAgICBpc3N1ZXM6IDAsXG4gICAgICBzZW5kaW5nOiBmYWxzZSxcbiAgICAgIGZpbmlzaGVkOiBmYWxzZSxcbiAgICAgIGludGVycnVwdGVkOiBmYWxzZSxcbiAgICAgIHNlbnRBdDogdW5kZWZpbmVkLFxuICAgIH1cbiAgfSxcbiAgcmVsYXRpb25zOiBbXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuTWFueSxcbiAgICAgIGtleTogJ3VwbG9hZHMnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBVcGxvYWRNb2RlbCxcbiAgICB9LFxuICBdLFxuICBiaW5kQ2FsbGJhY2tzKCkge1xuICAgIHRoaXMuaGFuZGxlQWRkRmlsZSA9IHRoaXMuaGFuZGxlQWRkRmlsZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVUb3RhbFVwbG9hZFByb2dyZXNzID0gdGhpcy5oYW5kbGVUb3RhbFVwbG9hZFByb2dyZXNzLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZVNlbmRpbmcgPSB0aGlzLmhhbmRsZVNlbmRpbmcuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlUXVldWVDb21wbGV0ZSA9IHRoaXMuaGFuZGxlUXVldWVDb21wbGV0ZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVTdWNjZXNzID0gdGhpcy5oYW5kbGVTdWNjZXNzLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZUVycm9yID0gdGhpcy5oYW5kbGVFcnJvci5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVDb21wbGV0ZSA9IHRoaXMuaGFuZGxlQ29tcGxldGUuYmluZCh0aGlzKVxuICB9LFxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNjEzMykgRklYTUU6ICdhdHRyaWJ1dGVzJyBpcyBkZWNsYXJlZCBidXQgaXRzIHZhbHVlIGlzIG5ldmVyIHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgaW5pdGlhbGl6ZShhdHRyaWJ1dGVzOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIHRoaXMuYmluZENhbGxiYWNrcygpXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIGlmICghdGhpcy5pZCkge1xuICAgICAgdGhpcy5zZXQoJ2lkJywgdjQoKSlcbiAgICB9XG4gICAgdGhpcy5saXN0ZW5UbyhcbiAgICAgIHRoaXMuZ2V0KCd1cGxvYWRzJyksXG4gICAgICAnYWRkIHJlbW92ZSByZXNldCB1cGRhdGUnLFxuICAgICAgdGhpcy5oYW5kbGVVcGxvYWRVcGRhdGVcbiAgICApXG4gICAgdGhpcy5saXN0ZW5UbyhcbiAgICAgIHRoaXMuZ2V0KCd1cGxvYWRzJyksXG4gICAgICAnY2hhbmdlOmlzc3VlcycsXG4gICAgICB0aGlzLmhhbmRsZUlzc3Vlc1VwZGF0ZXNcbiAgICApXG4gICAgdGhpcy5saXN0ZW5Ub0Ryb3B6b25lKClcbiAgfSxcbiAgbGlzdGVuVG9Ecm9wem9uZSgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRyb3B6b25lKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oJ2FkZGVkZmlsZScsIHRoaXMuaGFuZGxlQWRkRmlsZSlcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vbihcbiAgICAgICAgJ3RvdGFsdXBsb2FkcHJvZ3Jlc3MnLFxuICAgICAgICB0aGlzLmhhbmRsZVRvdGFsVXBsb2FkUHJvZ3Jlc3NcbiAgICAgIClcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vbignc2VuZGluZycsIHRoaXMuaGFuZGxlU2VuZGluZylcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vbigncXVldWVjb21wbGV0ZScsIHRoaXMuaGFuZGxlUXVldWVDb21wbGV0ZSlcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vbignc3VjY2VzcycsIHRoaXMuaGFuZGxlU3VjY2VzcylcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vbignZXJyb3InLCB0aGlzLmhhbmRsZUVycm9yKVxuICAgICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9uKCdjb21wbGV0ZScsIHRoaXMuaGFuZGxlQ29tcGxldGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0KCdpbnRlcnJ1cHRlZCcsIHRoaXMuZ2V0KCdpbnRlcnJ1cHRlZCcpIHx8ICF0aGlzLmdldCgnZmluaXNoZWQnKSlcbiAgICAgIHRoaXMuc2V0KCdmaW5pc2hlZCcsIHRydWUpXG4gICAgfVxuICB9LFxuICBoYW5kbGVBZGRGaWxlKGZpbGU6IGFueSkge1xuICAgIHRoaXMuZ2V0KCd1cGxvYWRzJykuYWRkKFxuICAgICAge1xuICAgICAgICBmaWxlLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgZHJvcHpvbmU6IHRoaXMub3B0aW9ucy5kcm9wem9uZSxcbiAgICAgIH1cbiAgICApXG4gIH0sXG4gIGhhbmRsZVN1Y2Nlc3MoZmlsZTogYW55KSB7XG4gICAgaWYgKGZpbGUuc3RhdHVzICE9PSAnY2FuY2VsZWQnKSB7XG4gICAgICB0aGlzLnNldCgnc3VjY2Vzc2VzJywgdGhpcy5nZXQoJ3N1Y2Nlc3NlcycpICsgMSlcbiAgICB9XG4gIH0sXG4gIGhhbmRsZUVycm9yKGZpbGU6IGFueSkge1xuICAgIGlmIChmaWxlLnN0YXR1cyAhPT0gJ2NhbmNlbGVkJykge1xuICAgICAgdGhpcy5zZXQoJ2Vycm9ycycsIHRoaXMuZ2V0KCdlcnJvcnMnKSArIDEpXG4gICAgfVxuICB9LFxuICBoYW5kbGVDb21wbGV0ZShmaWxlOiBhbnkpIHtcbiAgICBpZiAoZmlsZS5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICAgICAgdGhpcy5zZXQoJ2NvbXBsZXRlJywgdGhpcy5nZXQoJ2NvbXBsZXRlJykgKyAxKVxuICAgIH1cbiAgICB1cGRhdGVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIGhhbmRsZVNlbmRpbmcoKSB7XG4gICAgdGhpcy5zZXQoe1xuICAgICAgc2VuZGluZzogdHJ1ZSxcbiAgICB9KVxuICB9LFxuICBoYW5kbGVUb3RhbFVwbG9hZFByb2dyZXNzKCkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIHBlcmNlbnRhZ2U6IHRoaXMuY2FsY3VsYXRlUGVyY2VudGFnZURvbmUoKSxcbiAgICB9KVxuICB9LFxuICB1bmxpc3RlblRvRHJvcHpvbmUoKSB7XG4gICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9mZignYWRkZWRmaWxlJywgdGhpcy5oYW5kbGVBZGRGaWxlKVxuICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vZmYoXG4gICAgICAndG90YWx1cGxvYWRwcm9ncmVzcycsXG4gICAgICB0aGlzLmhhbmRsZVRvdGFsVXBsb2FkUHJvZ3Jlc3NcbiAgICApXG4gICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9mZignc2VuZGluZycsIHRoaXMuaGFuZGxlU2VuZGluZylcbiAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub2ZmKCdxdWV1ZWNvbXBsZXRlJywgdGhpcy5oYW5kbGVRdWV1ZUNvbXBsZXRlKVxuICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vZmYoJ3N1Y2Nlc3MnLCB0aGlzLmhhbmRsZVN1Y2Nlc3MpXG4gICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9mZignZXJyb3InLCB0aGlzLmhhbmRsZUVycm9yKVxuICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vZmYoJ2NvbXBsZXRlJywgdGhpcy5oYW5kbGVDb21wbGV0ZSlcbiAgfSxcbiAgaGFuZGxlUXVldWVDb21wbGV0ZSgpIHtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZW55by9kcm9wem9uZS9ibG9iL3Y0LjMuMC9kaXN0L2Ryb3B6b25lLmpzI0w1NlxuICAgIC8vIGlmIHdlIHJlbW92ZSBjYWxsYmFja3MgdG9vIGVhcmx5IHRoaXMgbG9vcCB3aWxsIGZhaWwsIGxvb2sgdG8gc2VlIGlmIHVwZGF0aW5nIHRvIGxhdGVzdCBmaXhlcyB0aGlzXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnVubGlzdGVuVG9Ecm9wem9uZSgpXG4gICAgfSwgMClcbiAgICB0aGlzLnNldCh7XG4gICAgICBmaW5pc2hlZDogdHJ1ZSxcbiAgICAgIHBlcmNlbnRhZ2U6IDEwMCxcbiAgICB9KVxuICAgIHVwZGF0ZVByZWZlcmVuY2VzKClcbiAgfSxcbiAgaGFuZGxlVXBsb2FkVXBkYXRlKCkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIGFtb3VudDogdGhpcy5nZXQoJ3VwbG9hZHMnKS5sZW5ndGgsXG4gICAgfSlcbiAgfSxcbiAgaGFuZGxlSXNzdWVzVXBkYXRlcygpIHtcbiAgICB0aGlzLnNldCh7XG4gICAgICBpc3N1ZXM6IHRoaXMuZ2V0KCd1cGxvYWRzJykucmVkdWNlKChpc3N1ZXM6IGFueSwgdXBsb2FkOiBhbnkpID0+IHtcbiAgICAgICAgaXNzdWVzICs9IHVwbG9hZC5nZXQoJ2lzc3VlcycpID8gMSA6IDBcbiAgICAgICAgcmV0dXJuIGlzc3Vlc1xuICAgICAgfSwgMCksXG4gICAgfSlcbiAgfSxcbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5jYW5jZWwoKVxuICAgIHRoaXMuZ2V0KCd1cGxvYWRzJykucmVzZXQoKVxuICB9LFxuICBjYW5jZWwoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kcm9wem9uZSkge1xuICAgICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLnJlbW92ZUFsbEZpbGVzKHRydWUpXG4gICAgfVxuICAgIHRoaXMuc2V0KCdmaW5pc2hlZCcsIHRydWUpXG4gIH0sXG4gIHN0YXJ0KCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZHJvcHpvbmUpIHtcbiAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgc2VuZGluZzogdHJ1ZSxcbiAgICAgICAgc2VudEF0OiBEYXRlLm5vdygpLCAvLy0gTWF0aC5yYW5kb20oKSAqIDE0ICogODY0MDAwMDBcbiAgICAgIH0pXG4gICAgICA7KHdyZXFyIGFzIGFueSkudmVudC50cmlnZ2VyKCd1cGxvYWRzOmFkZCcsIHRoaXMpXG4gICAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2UnLCB1cGRhdGVQcmVmZXJlbmNlcylcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vcHRpb25zLmF1dG9Qcm9jZXNzUXVldWUgPSB0cnVlXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUucHJvY2Vzc1F1ZXVlKClcbiAgICB9XG4gIH0sXG4gIGdldFRpbWVDb21wYXJhdG9yKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnc2VudEF0JylcbiAgfSxcbiAgY2FsY3VsYXRlUGVyY2VudGFnZURvbmUoKSB7XG4gICAgY29uc3QgZmlsZXMgPSB0aGlzLm9wdGlvbnMuZHJvcHpvbmUuZmlsZXNcbiAgICBpZiAoZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gMTAwXG4gICAgfVxuICAgIGNvbnN0IHRvdGFsQnl0ZXMgPSBmaWxlcy5yZWR1Y2UoKHRvdGFsOiBhbnksIGZpbGU6IGFueSkgPT4ge1xuICAgICAgdG90YWwgKz0gZmlsZS51cGxvYWQudG90YWxcbiAgICAgIHJldHVybiB0b3RhbFxuICAgIH0sIDApXG4gICAgY29uc3QgYnl0ZXNTZW50ID0gZmlsZXMucmVkdWNlKCh0b3RhbDogYW55LCBmaWxlOiBhbnkpID0+IHtcbiAgICAgIHRvdGFsICs9IGZpbGUudXBsb2FkLmJ5dGVzU2VudFxuICAgICAgcmV0dXJuIHRvdGFsXG4gICAgfSwgMClcbiAgICBsZXQgcHJvZ3Jlc3MgPSAxMDAgKiAoYnl0ZXNTZW50IC8gdG90YWxCeXRlcylcbiAgICBpZiAocHJvZ3Jlc3MgPj0gMTAwICYmICF0aGlzLmdldCgnZmluaXNoZWQnKSkge1xuICAgICAgcHJvZ3Jlc3MgPSA5OVxuICAgIH1cbiAgICByZXR1cm4gcHJvZ3Jlc3NcbiAgfSxcbn0pXG4iXX0=