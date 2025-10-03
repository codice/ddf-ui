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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkQmF0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvVXBsb2FkQmF0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sV0FBVyxNQUFNLFVBQVUsQ0FBQTtBQUNsQyxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFDL0IsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sTUFBTSxDQUFBO0FBQ3pCLElBQU0saUJBQWlCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztJQUNuQyxDQUFDO0lBQUMsS0FBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQTtBQUNsRCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7QUFDUixlQUFlLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQzdDLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFFBQVE7UUFDTixPQUFPO1lBQ0wsTUFBTSxFQUFFLElBQUk7WUFDWixPQUFPLEVBQUUsRUFBRTtZQUNYLFVBQVUsRUFBRSxDQUFDO1lBQ2IsTUFBTSxFQUFFLENBQUM7WUFDVCxTQUFTLEVBQUUsQ0FBQztZQUNaLFFBQVEsRUFBRSxDQUFDO1lBQ1gsTUFBTSxFQUFFLENBQUM7WUFDVCxNQUFNLEVBQUUsQ0FBQztZQUNULE9BQU8sRUFBRSxLQUFLO1lBQ2QsUUFBUSxFQUFFLEtBQUs7WUFDZixXQUFXLEVBQUUsS0FBSztZQUNsQixNQUFNLEVBQUUsU0FBUztTQUNsQixDQUFBO0lBQ0gsQ0FBQztJQUNELFNBQVMsRUFBRTtRQUNUO1lBQ0UsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1lBQ25CLEdBQUcsRUFBRSxTQUFTO1lBQ2QsWUFBWSxFQUFFLFdBQVc7U0FDMUI7S0FDRjtJQUNELGFBQWE7UUFDWCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2xELElBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzFFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDbEQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDOUQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNsRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzlDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDdEQsQ0FBQztJQUNELG1KQUFtSjtJQUNuSixVQUFVLFlBQUMsVUFBZSxFQUFFLE9BQVk7UUFDdEMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFBO1FBQ3RCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3RCLENBQUM7UUFDRCxJQUFJLENBQUMsUUFBUSxDQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQ25CLHlCQUF5QixFQUN6QixJQUFJLENBQUMsa0JBQWtCLENBQ3hCLENBQUE7UUFDRCxJQUFJLENBQUMsUUFBUSxDQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQ25CLGVBQWUsRUFDZixJQUFJLENBQUMsbUJBQW1CLENBQ3pCLENBQUE7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQTtJQUN6QixDQUFDO0lBQ0QsZ0JBQWdCO1FBQ2QsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1lBQ3pELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FDdEIscUJBQXFCLEVBQ3JCLElBQUksQ0FBQyx5QkFBeUIsQ0FDL0IsQ0FBQTtZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1lBQ3ZELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7WUFDbkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDM0QsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFBO1lBQ3pFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQzVCLENBQUM7SUFDSCxDQUFDO0lBQ0QsYUFBYSxZQUFDLElBQVM7UUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQ3JCO1lBQ0UsSUFBSSxNQUFBO1NBQ0wsRUFDRDtZQUNFLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVE7U0FDaEMsQ0FDRixDQUFBO0lBQ0gsQ0FBQztJQUNELGFBQWEsWUFBQyxJQUFTO1FBQ3JCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUUsQ0FBQztZQUMvQixJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQ2xELENBQUM7SUFDSCxDQUFDO0lBQ0QsV0FBVyxZQUFDLElBQVM7UUFDbkIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDNUMsQ0FBQztJQUNILENBQUM7SUFDRCxjQUFjLFlBQUMsSUFBUztRQUN0QixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNoRCxDQUFDO1FBQ0QsaUJBQWlCLEVBQUUsQ0FBQTtJQUNyQixDQUFDO0lBQ0QsYUFBYTtRQUNYLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDUCxPQUFPLEVBQUUsSUFBSTtTQUNkLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCx5QkFBeUI7UUFDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNQLFVBQVUsRUFBRSxJQUFJLENBQUMsdUJBQXVCLEVBQUU7U0FDM0MsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUNELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQ3ZCLHFCQUFxQixFQUNyQixJQUFJLENBQUMseUJBQXlCLENBQy9CLENBQUE7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQ3hELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ3BELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBQzVELENBQUM7SUFDRCxtQkFBbUI7UUFBbkIsaUJBV0M7UUFWQyxvRUFBb0U7UUFDcEUscUdBQXFHO1FBQ3JHLFVBQVUsQ0FBQztZQUNULEtBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFBO1FBQzNCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNMLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDUCxRQUFRLEVBQUUsSUFBSTtZQUNkLFVBQVUsRUFBRSxHQUFHO1NBQ2hCLENBQUMsQ0FBQTtRQUNGLGlCQUFpQixFQUFFLENBQUE7SUFDckIsQ0FBQztJQUNELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTTtTQUNuQyxDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsbUJBQW1CO1FBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDUCxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxNQUFXLEVBQUUsTUFBVztnQkFDMUQsTUFBTSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUN0QyxPQUFPLE1BQU0sQ0FBQTtZQUNmLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDTixDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0QsS0FBSztRQUNILElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDN0IsQ0FBQztJQUNELE1BQU07UUFDSixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzVDLENBQUM7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUM1QixDQUFDO0lBQ0QsS0FBSztRQUNILElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNQLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsaUNBQWlDO2FBQ3RELENBQUMsQ0FDRDtZQUFDLEtBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsaUJBQWlCLENBQUMsQ0FBQTtZQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFBO1lBQ3JELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ3RDLENBQUM7SUFDSCxDQUFDO0lBQ0QsaUJBQWlCO1FBQ2YsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQzNCLENBQUM7SUFDRCx1QkFBdUI7UUFDckIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFBO1FBQ3pDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUN2QixPQUFPLEdBQUcsQ0FBQTtRQUNaLENBQUM7UUFDRCxJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUMsS0FBVSxFQUFFLElBQVM7WUFDcEQsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFBO1lBQzFCLE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ0wsSUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFDLEtBQVUsRUFBRSxJQUFTO1lBQ25ELEtBQUssSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQTtZQUM5QixPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNMLElBQUksUUFBUSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQTtRQUM3QyxJQUFJLFFBQVEsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDN0MsUUFBUSxHQUFHLEVBQUUsQ0FBQTtRQUNmLENBQUM7UUFDRCxPQUFPLFFBQVEsQ0FBQTtJQUNqQixDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgVXBsb2FkTW9kZWwgZnJvbSAnLi9VcGxvYWQnXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vd3JlcXInXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJ1xuY29uc3QgdXBkYXRlUHJlZmVyZW5jZXMgPSBfLnRocm90dGxlKCgpID0+IHtcbiAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcigncHJlZmVyZW5jZXM6c2F2ZScpXG59LCAxMDAwKVxuZXhwb3J0IGRlZmF1bHQgQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIG9wdGlvbnM6IHVuZGVmaW5lZCxcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVuc2VlbjogdHJ1ZSxcbiAgICAgIHVwbG9hZHM6IFtdLFxuICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgIGVycm9yczogMCxcbiAgICAgIHN1Y2Nlc3NlczogMCxcbiAgICAgIGNvbXBsZXRlOiAwLFxuICAgICAgYW1vdW50OiAwLFxuICAgICAgaXNzdWVzOiAwLFxuICAgICAgc2VuZGluZzogZmFsc2UsXG4gICAgICBmaW5pc2hlZDogZmFsc2UsXG4gICAgICBpbnRlcnJ1cHRlZDogZmFsc2UsXG4gICAgICBzZW50QXQ6IHVuZGVmaW5lZCxcbiAgICB9XG4gIH0sXG4gIHJlbGF0aW9uczogW1xuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk1hbnksXG4gICAgICBrZXk6ICd1cGxvYWRzJyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogVXBsb2FkTW9kZWwsXG4gICAgfSxcbiAgXSxcbiAgYmluZENhbGxiYWNrcygpIHtcbiAgICB0aGlzLmhhbmRsZUFkZEZpbGUgPSB0aGlzLmhhbmRsZUFkZEZpbGUuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlVG90YWxVcGxvYWRQcm9ncmVzcyA9IHRoaXMuaGFuZGxlVG90YWxVcGxvYWRQcm9ncmVzcy5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVTZW5kaW5nID0gdGhpcy5oYW5kbGVTZW5kaW5nLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZVF1ZXVlQ29tcGxldGUgPSB0aGlzLmhhbmRsZVF1ZXVlQ29tcGxldGUuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlU3VjY2VzcyA9IHRoaXMuaGFuZGxlU3VjY2Vzcy5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVFcnJvciA9IHRoaXMuaGFuZGxlRXJyb3IuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlQ29tcGxldGUgPSB0aGlzLmhhbmRsZUNvbXBsZXRlLmJpbmQodGhpcylcbiAgfSxcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDYxMzMpIEZJWE1FOiAnYXR0cmlidXRlcycgaXMgZGVjbGFyZWQgYnV0IGl0cyB2YWx1ZSBpcyBuZXZlciByZS4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gIGluaXRpYWxpemUoYXR0cmlidXRlczogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICB0aGlzLmJpbmRDYWxsYmFja3MoKVxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICBpZiAoIXRoaXMuaWQpIHtcbiAgICAgIHRoaXMuc2V0KCdpZCcsIHY0KCkpXG4gICAgfVxuICAgIHRoaXMubGlzdGVuVG8oXG4gICAgICB0aGlzLmdldCgndXBsb2FkcycpLFxuICAgICAgJ2FkZCByZW1vdmUgcmVzZXQgdXBkYXRlJyxcbiAgICAgIHRoaXMuaGFuZGxlVXBsb2FkVXBkYXRlXG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG8oXG4gICAgICB0aGlzLmdldCgndXBsb2FkcycpLFxuICAgICAgJ2NoYW5nZTppc3N1ZXMnLFxuICAgICAgdGhpcy5oYW5kbGVJc3N1ZXNVcGRhdGVzXG4gICAgKVxuICAgIHRoaXMubGlzdGVuVG9Ecm9wem9uZSgpXG4gIH0sXG4gIGxpc3RlblRvRHJvcHpvbmUoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kcm9wem9uZSkge1xuICAgICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9uKCdhZGRlZGZpbGUnLCB0aGlzLmhhbmRsZUFkZEZpbGUpXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oXG4gICAgICAgICd0b3RhbHVwbG9hZHByb2dyZXNzJyxcbiAgICAgICAgdGhpcy5oYW5kbGVUb3RhbFVwbG9hZFByb2dyZXNzXG4gICAgICApXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oJ3NlbmRpbmcnLCB0aGlzLmhhbmRsZVNlbmRpbmcpXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oJ3F1ZXVlY29tcGxldGUnLCB0aGlzLmhhbmRsZVF1ZXVlQ29tcGxldGUpXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oJ3N1Y2Nlc3MnLCB0aGlzLmhhbmRsZVN1Y2Nlc3MpXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oJ2Vycm9yJywgdGhpcy5oYW5kbGVFcnJvcilcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vbignY29tcGxldGUnLCB0aGlzLmhhbmRsZUNvbXBsZXRlKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnNldCgnaW50ZXJydXB0ZWQnLCB0aGlzLmdldCgnaW50ZXJydXB0ZWQnKSB8fCAhdGhpcy5nZXQoJ2ZpbmlzaGVkJykpXG4gICAgICB0aGlzLnNldCgnZmluaXNoZWQnLCB0cnVlKVxuICAgIH1cbiAgfSxcbiAgaGFuZGxlQWRkRmlsZShmaWxlOiBhbnkpIHtcbiAgICB0aGlzLmdldCgndXBsb2FkcycpLmFkZChcbiAgICAgIHtcbiAgICAgICAgZmlsZSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGRyb3B6b25lOiB0aGlzLm9wdGlvbnMuZHJvcHpvbmUsXG4gICAgICB9XG4gICAgKVxuICB9LFxuICBoYW5kbGVTdWNjZXNzKGZpbGU6IGFueSkge1xuICAgIGlmIChmaWxlLnN0YXR1cyAhPT0gJ2NhbmNlbGVkJykge1xuICAgICAgdGhpcy5zZXQoJ3N1Y2Nlc3NlcycsIHRoaXMuZ2V0KCdzdWNjZXNzZXMnKSArIDEpXG4gICAgfVxuICB9LFxuICBoYW5kbGVFcnJvcihmaWxlOiBhbnkpIHtcbiAgICBpZiAoZmlsZS5zdGF0dXMgIT09ICdjYW5jZWxlZCcpIHtcbiAgICAgIHRoaXMuc2V0KCdlcnJvcnMnLCB0aGlzLmdldCgnZXJyb3JzJykgKyAxKVxuICAgIH1cbiAgfSxcbiAgaGFuZGxlQ29tcGxldGUoZmlsZTogYW55KSB7XG4gICAgaWYgKGZpbGUuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgIHRoaXMuc2V0KCdjb21wbGV0ZScsIHRoaXMuZ2V0KCdjb21wbGV0ZScpICsgMSlcbiAgICB9XG4gICAgdXBkYXRlUHJlZmVyZW5jZXMoKVxuICB9LFxuICBoYW5kbGVTZW5kaW5nKCkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIHNlbmRpbmc6IHRydWUsXG4gICAgfSlcbiAgfSxcbiAgaGFuZGxlVG90YWxVcGxvYWRQcm9ncmVzcygpIHtcbiAgICB0aGlzLnNldCh7XG4gICAgICBwZXJjZW50YWdlOiB0aGlzLmNhbGN1bGF0ZVBlcmNlbnRhZ2VEb25lKCksXG4gICAgfSlcbiAgfSxcbiAgdW5saXN0ZW5Ub0Ryb3B6b25lKCkge1xuICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vZmYoJ2FkZGVkZmlsZScsIHRoaXMuaGFuZGxlQWRkRmlsZSlcbiAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub2ZmKFxuICAgICAgJ3RvdGFsdXBsb2FkcHJvZ3Jlc3MnLFxuICAgICAgdGhpcy5oYW5kbGVUb3RhbFVwbG9hZFByb2dyZXNzXG4gICAgKVxuICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vZmYoJ3NlbmRpbmcnLCB0aGlzLmhhbmRsZVNlbmRpbmcpXG4gICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9mZigncXVldWVjb21wbGV0ZScsIHRoaXMuaGFuZGxlUXVldWVDb21wbGV0ZSlcbiAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub2ZmKCdzdWNjZXNzJywgdGhpcy5oYW5kbGVTdWNjZXNzKVxuICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vZmYoJ2Vycm9yJywgdGhpcy5oYW5kbGVFcnJvcilcbiAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub2ZmKCdjb21wbGV0ZScsIHRoaXMuaGFuZGxlQ29tcGxldGUpXG4gIH0sXG4gIGhhbmRsZVF1ZXVlQ29tcGxldGUoKSB7XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2VueW8vZHJvcHpvbmUvYmxvYi92NC4zLjAvZGlzdC9kcm9wem9uZS5qcyNMNTZcbiAgICAvLyBpZiB3ZSByZW1vdmUgY2FsbGJhY2tzIHRvbyBlYXJseSB0aGlzIGxvb3Agd2lsbCBmYWlsLCBsb29rIHRvIHNlZSBpZiB1cGRhdGluZyB0byBsYXRlc3QgZml4ZXMgdGhpc1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy51bmxpc3RlblRvRHJvcHpvbmUoKVxuICAgIH0sIDApXG4gICAgdGhpcy5zZXQoe1xuICAgICAgZmluaXNoZWQ6IHRydWUsXG4gICAgICBwZXJjZW50YWdlOiAxMDAsXG4gICAgfSlcbiAgICB1cGRhdGVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIGhhbmRsZVVwbG9hZFVwZGF0ZSgpIHtcbiAgICB0aGlzLnNldCh7XG4gICAgICBhbW91bnQ6IHRoaXMuZ2V0KCd1cGxvYWRzJykubGVuZ3RoLFxuICAgIH0pXG4gIH0sXG4gIGhhbmRsZUlzc3Vlc1VwZGF0ZXMoKSB7XG4gICAgdGhpcy5zZXQoe1xuICAgICAgaXNzdWVzOiB0aGlzLmdldCgndXBsb2FkcycpLnJlZHVjZSgoaXNzdWVzOiBhbnksIHVwbG9hZDogYW55KSA9PiB7XG4gICAgICAgIGlzc3VlcyArPSB1cGxvYWQuZ2V0KCdpc3N1ZXMnKSA/IDEgOiAwXG4gICAgICAgIHJldHVybiBpc3N1ZXNcbiAgICAgIH0sIDApLFxuICAgIH0pXG4gIH0sXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuY2FuY2VsKClcbiAgICB0aGlzLmdldCgndXBsb2FkcycpLnJlc2V0KClcbiAgfSxcbiAgY2FuY2VsKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZHJvcHpvbmUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5yZW1vdmVBbGxGaWxlcyh0cnVlKVxuICAgIH1cbiAgICB0aGlzLnNldCgnZmluaXNoZWQnLCB0cnVlKVxuICB9LFxuICBzdGFydCgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRyb3B6b25lKSB7XG4gICAgICB0aGlzLnNldCh7XG4gICAgICAgIHNlbmRpbmc6IHRydWUsXG4gICAgICAgIHNlbnRBdDogRGF0ZS5ub3coKSwgLy8tIE1hdGgucmFuZG9tKCkgKiAxNCAqIDg2NDAwMDAwXG4gICAgICB9KVxuICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcigndXBsb2FkczphZGQnLCB0aGlzKVxuICAgICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlJywgdXBkYXRlUHJlZmVyZW5jZXMpXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub3B0aW9ucy5hdXRvUHJvY2Vzc1F1ZXVlID0gdHJ1ZVxuICAgICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLnByb2Nlc3NRdWV1ZSgpXG4gICAgfVxuICB9LFxuICBnZXRUaW1lQ29tcGFyYXRvcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3NlbnRBdCcpXG4gIH0sXG4gIGNhbGN1bGF0ZVBlcmNlbnRhZ2VEb25lKCkge1xuICAgIGNvbnN0IGZpbGVzID0gdGhpcy5vcHRpb25zLmRyb3B6b25lLmZpbGVzXG4gICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIDEwMFxuICAgIH1cbiAgICBjb25zdCB0b3RhbEJ5dGVzID0gZmlsZXMucmVkdWNlKCh0b3RhbDogYW55LCBmaWxlOiBhbnkpID0+IHtcbiAgICAgIHRvdGFsICs9IGZpbGUudXBsb2FkLnRvdGFsXG4gICAgICByZXR1cm4gdG90YWxcbiAgICB9LCAwKVxuICAgIGNvbnN0IGJ5dGVzU2VudCA9IGZpbGVzLnJlZHVjZSgodG90YWw6IGFueSwgZmlsZTogYW55KSA9PiB7XG4gICAgICB0b3RhbCArPSBmaWxlLnVwbG9hZC5ieXRlc1NlbnRcbiAgICAgIHJldHVybiB0b3RhbFxuICAgIH0sIDApXG4gICAgbGV0IHByb2dyZXNzID0gMTAwICogKGJ5dGVzU2VudCAvIHRvdGFsQnl0ZXMpXG4gICAgaWYgKHByb2dyZXNzID49IDEwMCAmJiAhdGhpcy5nZXQoJ2ZpbmlzaGVkJykpIHtcbiAgICAgIHByb2dyZXNzID0gOTlcbiAgICB9XG4gICAgcmV0dXJuIHByb2dyZXNzXG4gIH0sXG59KVxuIl19