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
import Backbone from 'backbone';
import $ from 'jquery';
import fetch from '../../react-component/utils/fetch';
import '../jquery.whenAll';
function fileMatches(file, model) {
    return file === model.get('file');
}
function checkValidation(model) {
    if (model.get('id')) {
        model.set('validating', true);
        //wait for solr
        setTimeout(function () {
            ;
            $.whenAll
                .apply(this, [
                fetch('./internal/metacard/' + model.get('id') + '/attribute/validation')
                    .then(function (response) { return response.json(); })
                    .then(function (response) {
                    model.set({
                        issues: model.get('issues') || response.length > 0,
                    });
                }),
                fetch('./internal/metacard/' + model.get('id') + '/validation')
                    .then(function (response) { return response.json(); })
                    .then(function (response) {
                    model.set({
                        issues: model.get('issues') || response.length > 0,
                    });
                }),
            ])
                .always(function () {
                model.set({
                    validating: false,
                });
            });
        }, 2000);
    }
}
export default Backbone.Model.extend({
    options: undefined,
    defaults: function () {
        return {
            id: undefined,
            children: undefined,
            result: undefined,
            file: undefined,
            percentage: 0,
            sending: false,
            success: false,
            error: false,
            message: '',
            validating: false,
            issues: false,
        };
    },
    bindCallbacks: function () {
        this.handleUploadProgress = this.handleUploadProgress.bind(this);
        this.handleSending = this.handleSending.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleComplete = this.handleComplete.bind(this);
        this.handleQueueComplete = this.handleQueueComplete.bind(this);
    },
    // @ts-expect-error ts-migrate(6133) FIXME: 'attributes' is declared but its value is never re... Remove this comment to see the full error message
    initialize: function (attributes, options) {
        this.bindCallbacks();
        this.options = options;
        this.setupDropzoneListeners();
    },
    setupDropzoneListeners: function () {
        if (this.options.dropzone) {
            this.options.dropzone.on('sending', this.handleSending);
            this.options.dropzone.on('uploadprogress', this.handleUploadProgress);
            this.options.dropzone.on('error', this.handleError);
            this.options.dropzone.on('success', this.handleSuccess);
            this.options.dropzone.on('complete', this.handleComplete);
            this.options.dropzone.on('queuecomplete', this.handleQueueComplete);
        }
    },
    handleSending: function (file) {
        if (fileMatches(file, this)) {
            this.set({
                sending: true,
            });
        }
    },
    handleUploadProgress: function (file, percentage) {
        if (fileMatches(file, this)) {
            this.set('percentage', percentage);
        }
    },
    handleError: function (file) {
        if (fileMatches(file, this)) {
            var message = file.name + ' could not be uploaded successfully.';
            this.set({
                error: true,
                message: message,
            });
        }
    },
    hasChildren: function () {
        return this.get('children') && this.get('children').length > 1;
    },
    handleQueueComplete: function () {
        var _this = this;
        // https://github.com/enyo/dropzone/blob/v4.3.0/dist/dropzone.js#L56
        // if we remove callbacks too early this loop will fail, look to see if updating to latest fixes this
        setTimeout(function () {
            _this.unlistenToDropzone();
        }, 0);
    },
    unlistenToDropzone: function () {
        this.options.dropzone.off('sending', this.handleSending);
        this.options.dropzone.off('queuecomplete', this.handleQueueComplete);
        this.options.dropzone.off('uploadprogress', this.handleUploadProgress);
        this.options.dropzone.off('success', this.handleSuccess);
        this.options.dropzone.off('error', this.handleError);
        this.options.dropzone.off('complete', this.handleComplete);
    },
    handleSuccess: function (file) {
        if (fileMatches(file, this)) {
            var message = "".concat(file.name, " uploaded successfully.");
            var addedIdsHeader = file.xhr.getResponseHeader('added-ids');
            var children = addedIdsHeader ? addedIdsHeader.split(',') : undefined;
            if (children && children.length > 1) {
                message += " ".concat(children.length, " items found.");
            }
            this.set({
                id: file.xhr.getResponseHeader('id'),
                children: children,
                success: true,
                message: message,
            });
            checkValidation(this);
        }
    },
    handleComplete: function (file) {
        if (fileMatches(file, this) && file.status === 'canceled') {
            this.collection.remove(this);
        }
    },
    checkValidation: function () {
        checkValidation(this);
    },
    cancel: function () {
        if (this.options.dropzone) {
            this.options.dropzone.removeFile(this.get('file'));
            if (this.collection) {
                this.collection.remove(this);
            }
        }
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL1VwbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLEtBQUssTUFBTSxtQ0FBbUMsQ0FBQTtBQUNyRCxPQUFPLG1CQUFtQixDQUFBO0FBQzFCLFNBQVMsV0FBVyxDQUFDLElBQVMsRUFBRSxLQUFVO0lBQ3hDLE9BQU8sSUFBSSxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbkMsQ0FBQztBQUNELFNBQVMsZUFBZSxDQUFDLEtBQVU7SUFDakMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ25CLEtBQUssQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBQzdCLGVBQWU7UUFDZixVQUFVLENBQUM7WUFDVCxDQUFDO1lBQUMsQ0FBUyxDQUFDLE9BQU87aUJBQ2hCLEtBQUssQ0FBQyxJQUFJLEVBQUU7Z0JBQ1gsS0FBSyxDQUNILHNCQUFzQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsdUJBQXVCLENBQ25FO3FCQUNFLElBQUksQ0FBQyxVQUFDLFFBQVEsSUFBSyxPQUFBLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBZixDQUFlLENBQUM7cUJBQ25DLElBQUksQ0FBQyxVQUFDLFFBQVE7b0JBQ2IsS0FBSyxDQUFDLEdBQUcsQ0FBQzt3QkFDUixNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7cUJBQ25ELENBQUMsQ0FBQTtnQkFDSixDQUFDLENBQUM7Z0JBQ0os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LENBQUE7YUFDOUM7WUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNQLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQztnQkFDcEMsUUFBUSxVQUFBO2dCQUNSLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sU0FBQTthQUNSLENBQUMsQ0FBQTtZQUNGLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUN0QjtJQUNILENBQUM7SUFDRCxjQUFjLFlBQUMsSUFBUztRQUN0QixJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUU7WUFDekQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDN0I7SUFDSCxDQUFDO0lBQ0QsZUFBZTtRQUNiLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUN2QixDQUFDO0lBQ0QsTUFBTTtRQUNKLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7WUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUNsRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO2FBQzdCO1NBQ0Y7SUFDSCxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2ZldGNoJ1xuaW1wb3J0ICcuLi9qcXVlcnkud2hlbkFsbCdcbmZ1bmN0aW9uIGZpbGVNYXRjaGVzKGZpbGU6IGFueSwgbW9kZWw6IGFueSkge1xuICByZXR1cm4gZmlsZSA9PT0gbW9kZWwuZ2V0KCdmaWxlJylcbn1cbmZ1bmN0aW9uIGNoZWNrVmFsaWRhdGlvbihtb2RlbDogYW55KSB7XG4gIGlmIChtb2RlbC5nZXQoJ2lkJykpIHtcbiAgICBtb2RlbC5zZXQoJ3ZhbGlkYXRpbmcnLCB0cnVlKVxuICAgIC8vd2FpdCBmb3Igc29sclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKHRoaXM6IGFueSkge1xuICAgICAgOygkIGFzIGFueSkud2hlbkFsbFxuICAgICAgICAuYXBwbHkodGhpcywgW1xuICAgICAgICAgIGZldGNoKFxuICAgICAgICAgICAgJy4vaW50ZXJuYWwvbWV0YWNhcmQvJyArIG1vZGVsLmdldCgnaWQnKSArICcvYXR0cmlidXRlL3ZhbGlkYXRpb24nXG4gICAgICAgICAgKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgbW9kZWwuc2V0KHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IG1vZGVsLmdldCgnaXNzdWVzJykgfHwgcmVzcG9uc2UubGVuZ3RoID4gMCxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgIGZldGNoKCcuL2ludGVybmFsL21ldGFjYXJkLycgKyBtb2RlbC5nZXQoJ2lkJykgKyAnL3ZhbGlkYXRpb24nKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgICAgbW9kZWwuc2V0KHtcbiAgICAgICAgICAgICAgICBpc3N1ZXM6IG1vZGVsLmdldCgnaXNzdWVzJykgfHwgcmVzcG9uc2UubGVuZ3RoID4gMCxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pLFxuICAgICAgICBdKVxuICAgICAgICAuYWx3YXlzKCgpID0+IHtcbiAgICAgICAgICBtb2RlbC5zZXQoe1xuICAgICAgICAgICAgdmFsaWRhdGluZzogZmFsc2UsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9LCAyMDAwKVxuICB9XG59XG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICBvcHRpb25zOiB1bmRlZmluZWQsXG4gIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogdW5kZWZpbmVkLFxuICAgICAgY2hpbGRyZW46IHVuZGVmaW5lZCxcbiAgICAgIHJlc3VsdDogdW5kZWZpbmVkLFxuICAgICAgZmlsZTogdW5kZWZpbmVkLFxuICAgICAgcGVyY2VudGFnZTogMCxcbiAgICAgIHNlbmRpbmc6IGZhbHNlLFxuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjogZmFsc2UsXG4gICAgICBtZXNzYWdlOiAnJyxcbiAgICAgIHZhbGlkYXRpbmc6IGZhbHNlLFxuICAgICAgaXNzdWVzOiBmYWxzZSxcbiAgICB9XG4gIH0sXG4gIGJpbmRDYWxsYmFja3MoKSB7XG4gICAgdGhpcy5oYW5kbGVVcGxvYWRQcm9ncmVzcyA9IHRoaXMuaGFuZGxlVXBsb2FkUHJvZ3Jlc3MuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlU2VuZGluZyA9IHRoaXMuaGFuZGxlU2VuZGluZy5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVTdWNjZXNzID0gdGhpcy5oYW5kbGVTdWNjZXNzLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZUVycm9yID0gdGhpcy5oYW5kbGVFcnJvci5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVDb21wbGV0ZSA9IHRoaXMuaGFuZGxlQ29tcGxldGUuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlUXVldWVDb21wbGV0ZSA9IHRoaXMuaGFuZGxlUXVldWVDb21wbGV0ZS5iaW5kKHRoaXMpXG4gIH0sXG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg2MTMzKSBGSVhNRTogJ2F0dHJpYnV0ZXMnIGlzIGRlY2xhcmVkIGJ1dCBpdHMgdmFsdWUgaXMgbmV2ZXIgcmUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICBpbml0aWFsaXplKGF0dHJpYnV0ZXM6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgdGhpcy5iaW5kQ2FsbGJhY2tzKClcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy5zZXR1cERyb3B6b25lTGlzdGVuZXJzKClcbiAgfSxcbiAgc2V0dXBEcm9wem9uZUxpc3RlbmVycygpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRyb3B6b25lKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oJ3NlbmRpbmcnLCB0aGlzLmhhbmRsZVNlbmRpbmcpXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oJ3VwbG9hZHByb2dyZXNzJywgdGhpcy5oYW5kbGVVcGxvYWRQcm9ncmVzcylcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vbignZXJyb3InLCB0aGlzLmhhbmRsZUVycm9yKVxuICAgICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9uKCdzdWNjZXNzJywgdGhpcy5oYW5kbGVTdWNjZXNzKVxuICAgICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9uKCdjb21wbGV0ZScsIHRoaXMuaGFuZGxlQ29tcGxldGUpXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oJ3F1ZXVlY29tcGxldGUnLCB0aGlzLmhhbmRsZVF1ZXVlQ29tcGxldGUpXG4gICAgfVxuICB9LFxuICBoYW5kbGVTZW5kaW5nKGZpbGU6IGFueSkge1xuICAgIGlmIChmaWxlTWF0Y2hlcyhmaWxlLCB0aGlzKSkge1xuICAgICAgdGhpcy5zZXQoe1xuICAgICAgICBzZW5kaW5nOiB0cnVlLFxuICAgICAgfSlcbiAgICB9XG4gIH0sXG4gIGhhbmRsZVVwbG9hZFByb2dyZXNzKGZpbGU6IGFueSwgcGVyY2VudGFnZTogYW55KSB7XG4gICAgaWYgKGZpbGVNYXRjaGVzKGZpbGUsIHRoaXMpKSB7XG4gICAgICB0aGlzLnNldCgncGVyY2VudGFnZScsIHBlcmNlbnRhZ2UpXG4gICAgfVxuICB9LFxuICBoYW5kbGVFcnJvcihmaWxlOiBhbnkpIHtcbiAgICBpZiAoZmlsZU1hdGNoZXMoZmlsZSwgdGhpcykpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBmaWxlLm5hbWUgKyAnIGNvdWxkIG5vdCBiZSB1cGxvYWRlZCBzdWNjZXNzZnVsbHkuJ1xuICAgICAgdGhpcy5zZXQoe1xuICAgICAgICBlcnJvcjogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuICBoYXNDaGlsZHJlbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2NoaWxkcmVuJykgJiYgdGhpcy5nZXQoJ2NoaWxkcmVuJykubGVuZ3RoID4gMVxuICB9LFxuICBoYW5kbGVRdWV1ZUNvbXBsZXRlKCkge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9lbnlvL2Ryb3B6b25lL2Jsb2IvdjQuMy4wL2Rpc3QvZHJvcHpvbmUuanMjTDU2XG4gICAgLy8gaWYgd2UgcmVtb3ZlIGNhbGxiYWNrcyB0b28gZWFybHkgdGhpcyBsb29wIHdpbGwgZmFpbCwgbG9vayB0byBzZWUgaWYgdXBkYXRpbmcgdG8gbGF0ZXN0IGZpeGVzIHRoaXNcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMudW5saXN0ZW5Ub0Ryb3B6b25lKClcbiAgICB9LCAwKVxuICB9LFxuICB1bmxpc3RlblRvRHJvcHpvbmUoKSB7XG4gICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9mZignc2VuZGluZycsIHRoaXMuaGFuZGxlU2VuZGluZylcbiAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub2ZmKCdxdWV1ZWNvbXBsZXRlJywgdGhpcy5oYW5kbGVRdWV1ZUNvbXBsZXRlKVxuICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vZmYoJ3VwbG9hZHByb2dyZXNzJywgdGhpcy5oYW5kbGVVcGxvYWRQcm9ncmVzcylcbiAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub2ZmKCdzdWNjZXNzJywgdGhpcy5oYW5kbGVTdWNjZXNzKVxuICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vZmYoJ2Vycm9yJywgdGhpcy5oYW5kbGVFcnJvcilcbiAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub2ZmKCdjb21wbGV0ZScsIHRoaXMuaGFuZGxlQ29tcGxldGUpXG4gIH0sXG4gIGhhbmRsZVN1Y2Nlc3MoZmlsZTogYW55KSB7XG4gICAgaWYgKGZpbGVNYXRjaGVzKGZpbGUsIHRoaXMpKSB7XG4gICAgICBsZXQgbWVzc2FnZSA9IGAke2ZpbGUubmFtZX0gdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5LmBcbiAgICAgIGNvbnN0IGFkZGVkSWRzSGVhZGVyID0gZmlsZS54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2FkZGVkLWlkcycpXG4gICAgICBjb25zdCBjaGlsZHJlbiA9IGFkZGVkSWRzSGVhZGVyID8gYWRkZWRJZHNIZWFkZXIuc3BsaXQoJywnKSA6IHVuZGVmaW5lZFxuICAgICAgaWYgKGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbWVzc2FnZSArPSBgICR7Y2hpbGRyZW4ubGVuZ3RofSBpdGVtcyBmb3VuZC5gXG4gICAgICB9XG4gICAgICB0aGlzLnNldCh7XG4gICAgICAgIGlkOiBmaWxlLnhoci5nZXRSZXNwb25zZUhlYWRlcignaWQnKSxcbiAgICAgICAgY2hpbGRyZW4sXG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICB9KVxuICAgICAgY2hlY2tWYWxpZGF0aW9uKHRoaXMpXG4gICAgfVxuICB9LFxuICBoYW5kbGVDb21wbGV0ZShmaWxlOiBhbnkpIHtcbiAgICBpZiAoZmlsZU1hdGNoZXMoZmlsZSwgdGhpcykgJiYgZmlsZS5zdGF0dXMgPT09ICdjYW5jZWxlZCcpIHtcbiAgICAgIHRoaXMuY29sbGVjdGlvbi5yZW1vdmUodGhpcylcbiAgICB9XG4gIH0sXG4gIGNoZWNrVmFsaWRhdGlvbigpIHtcbiAgICBjaGVja1ZhbGlkYXRpb24odGhpcylcbiAgfSxcbiAgY2FuY2VsKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuZHJvcHpvbmUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5yZW1vdmVGaWxlKHRoaXMuZ2V0KCdmaWxlJykpXG4gICAgICBpZiAodGhpcy5jb2xsZWN0aW9uKSB7XG4gICAgICAgIHRoaXMuY29sbGVjdGlvbi5yZW1vdmUodGhpcylcbiAgICAgIH1cbiAgICB9XG4gIH0sXG59KVxuIl19