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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL1VwbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLEtBQUssTUFBTSxtQ0FBbUMsQ0FBQTtBQUNyRCxPQUFPLG1CQUFtQixDQUFBO0FBQzFCLFNBQVMsV0FBVyxDQUFDLElBQVMsRUFBRSxLQUFVO0lBQ3hDLE9BQU8sSUFBSSxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDbkMsQ0FBQztBQUNELFNBQVMsZUFBZSxDQUFDLEtBQVU7SUFDakMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDcEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDN0IsZUFBZTtRQUNmLFVBQVUsQ0FBQztZQUNULENBQUM7WUFBQyxDQUFTLENBQUMsT0FBTztpQkFDaEIsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDWCxLQUFLLENBQ0gsc0JBQXNCLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyx1QkFBdUIsQ0FDbkU7cUJBQ0UsSUFBSSxDQUFDLFVBQUMsUUFBUSxJQUFLLE9BQUEsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFmLENBQWUsQ0FBQztxQkFDbkMsSUFBSSxDQUFDLFVBQUMsUUFBUTtvQkFDYixLQUFLLENBQUMsR0FBRyxDQUFDO3dCQUNSLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQztxQkFDbkQsQ0FBQyxDQUFBO2dCQUNKLENBQUMsQ0FBQztnQkFDSixLQUFLLENBQUMsc0JBQXNCLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxhQUFhLENBQUM7cUJBQzVELElBQUksQ0FBQyxVQUFDLFFBQVEsSUFBSyxPQUFBLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBZixDQUFlLENBQUM7cUJBQ25DLElBQUksQ0FBQyxVQUFDLFFBQVE7b0JBQ2IsS0FBSyxDQUFDLEdBQUcsQ0FBQzt3QkFDUixNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7cUJBQ25ELENBQUMsQ0FBQTtnQkFDSixDQUFDLENBQUM7YUFDTCxDQUFDO2lCQUNELE1BQU0sQ0FBQztnQkFDTixLQUFLLENBQUMsR0FBRyxDQUFDO29CQUNSLFVBQVUsRUFBRSxLQUFLO2lCQUNsQixDQUFDLENBQUE7WUFDSixDQUFDLENBQUMsQ0FBQTtRQUNOLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNWLENBQUM7QUFDSCxDQUFDO0FBQ0QsZUFBZSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNuQyxPQUFPLEVBQUUsU0FBUztJQUNsQixRQUFRO1FBQ04sT0FBTztZQUNMLEVBQUUsRUFBRSxTQUFTO1lBQ2IsUUFBUSxFQUFFLFNBQVM7WUFDbkIsTUFBTSxFQUFFLFNBQVM7WUFDakIsSUFBSSxFQUFFLFNBQVM7WUFDZixVQUFVLEVBQUUsQ0FBQztZQUNiLE9BQU8sRUFBRSxLQUFLO1lBQ2QsT0FBTyxFQUFFLEtBQUs7WUFDZCxLQUFLLEVBQUUsS0FBSztZQUNaLE9BQU8sRUFBRSxFQUFFO1lBQ1gsVUFBVSxFQUFFLEtBQUs7WUFDakIsTUFBTSxFQUFFLEtBQUs7U0FDZCxDQUFBO0lBQ0gsQ0FBQztJQUNELGFBQWE7UUFDWCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNoRSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2xELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDbEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUM5QyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3BELElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2hFLENBQUM7SUFDRCxtSkFBbUo7SUFDbkosVUFBVSxZQUFDLFVBQWUsRUFBRSxPQUFZO1FBQ3RDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUNwQixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUN0QixJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQTtJQUMvQixDQUFDO0lBQ0Qsc0JBQXNCO1FBQ3BCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtZQUN2RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7WUFDckUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDbkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7WUFDdkQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7WUFDekQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtRQUNyRSxDQUFDO0lBQ0gsQ0FBQztJQUNELGFBQWEsWUFBQyxJQUFTO1FBQ3JCLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ1AsT0FBTyxFQUFFLElBQUk7YUFDZCxDQUFDLENBQUE7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUNELG9CQUFvQixZQUFDLElBQVMsRUFBRSxVQUFlO1FBQzdDLElBQUksV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ3BDLENBQUM7SUFDSCxDQUFDO0lBQ0QsV0FBVyxZQUFDLElBQVM7UUFDbkIsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDNUIsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxzQ0FBc0MsQ0FBQTtZQUNsRSxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNQLEtBQUssRUFBRSxJQUFJO2dCQUNYLE9BQU8sU0FBQTthQUNSLENBQUMsQ0FBQTtRQUNKLENBQUM7SUFDSCxDQUFDO0lBQ0QsV0FBVztRQUNULE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUE7SUFDaEUsQ0FBQztJQUNELG1CQUFtQjtRQUFuQixpQkFNQztRQUxDLG9FQUFvRTtRQUNwRSxxR0FBcUc7UUFDckcsVUFBVSxDQUFDO1lBQ1QsS0FBSSxDQUFDLGtCQUFrQixFQUFFLENBQUE7UUFDM0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ1AsQ0FBQztJQUNELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO1FBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtRQUN0RSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQTtRQUN4RCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNwRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQTtJQUM1RCxDQUFDO0lBQ0QsYUFBYSxZQUFDLElBQVM7UUFDckIsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDNUIsSUFBSSxPQUFPLEdBQUcsVUFBRyxJQUFJLENBQUMsSUFBSSw0QkFBeUIsQ0FBQTtZQUNuRCxJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQzlELElBQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFBO1lBQ3ZFLElBQUksUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BDLE9BQU8sSUFBSSxXQUFJLFFBQVEsQ0FBQyxNQUFNLGtCQUFlLENBQUE7WUFDL0MsQ0FBQztZQUNELElBQUksQ0FBQyxHQUFHLENBQUM7Z0JBQ1AsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDO2dCQUNwQyxRQUFRLFVBQUE7Z0JBQ1IsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxTQUFBO2FBQ1IsQ0FBQyxDQUFBO1lBQ0YsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3ZCLENBQUM7SUFDSCxDQUFDO0lBQ0QsY0FBYyxZQUFDLElBQVM7UUFDdEIsSUFBSSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssVUFBVSxFQUFFLENBQUM7WUFDMUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDOUIsQ0FBQztJQUNILENBQUM7SUFDRCxlQUFlO1FBQ2IsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3ZCLENBQUM7SUFDRCxNQUFNO1FBQ0osSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7WUFDbEQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7Z0JBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQzlCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IGZldGNoIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9mZXRjaCdcbmltcG9ydCAnLi4vanF1ZXJ5LndoZW5BbGwnXG5mdW5jdGlvbiBmaWxlTWF0Y2hlcyhmaWxlOiBhbnksIG1vZGVsOiBhbnkpIHtcbiAgcmV0dXJuIGZpbGUgPT09IG1vZGVsLmdldCgnZmlsZScpXG59XG5mdW5jdGlvbiBjaGVja1ZhbGlkYXRpb24obW9kZWw6IGFueSkge1xuICBpZiAobW9kZWwuZ2V0KCdpZCcpKSB7XG4gICAgbW9kZWwuc2V0KCd2YWxpZGF0aW5nJywgdHJ1ZSlcbiAgICAvL3dhaXQgZm9yIHNvbHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICh0aGlzOiBhbnkpIHtcbiAgICAgIDsoJCBhcyBhbnkpLndoZW5BbGxcbiAgICAgICAgLmFwcGx5KHRoaXMsIFtcbiAgICAgICAgICBmZXRjaChcbiAgICAgICAgICAgICcuL2ludGVybmFsL21ldGFjYXJkLycgKyBtb2RlbC5nZXQoJ2lkJykgKyAnL2F0dHJpYnV0ZS92YWxpZGF0aW9uJ1xuICAgICAgICAgIClcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgIG1vZGVsLnNldCh7XG4gICAgICAgICAgICAgICAgaXNzdWVzOiBtb2RlbC5nZXQoJ2lzc3VlcycpIHx8IHJlc3BvbnNlLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBmZXRjaCgnLi9pbnRlcm5hbC9tZXRhY2FyZC8nICsgbW9kZWwuZ2V0KCdpZCcpICsgJy92YWxpZGF0aW9uJylcbiAgICAgICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAgIG1vZGVsLnNldCh7XG4gICAgICAgICAgICAgICAgaXNzdWVzOiBtb2RlbC5nZXQoJ2lzc3VlcycpIHx8IHJlc3BvbnNlLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgXSlcbiAgICAgICAgLmFsd2F5cygoKSA9PiB7XG4gICAgICAgICAgbW9kZWwuc2V0KHtcbiAgICAgICAgICAgIHZhbGlkYXRpbmc6IGZhbHNlLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfSwgMjAwMClcbiAgfVxufVxuZXhwb3J0IGRlZmF1bHQgQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgb3B0aW9uczogdW5kZWZpbmVkLFxuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IHVuZGVmaW5lZCxcbiAgICAgIGNoaWxkcmVuOiB1bmRlZmluZWQsXG4gICAgICByZXN1bHQ6IHVuZGVmaW5lZCxcbiAgICAgIGZpbGU6IHVuZGVmaW5lZCxcbiAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICBzZW5kaW5nOiBmYWxzZSxcbiAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgZXJyb3I6IGZhbHNlLFxuICAgICAgbWVzc2FnZTogJycsXG4gICAgICB2YWxpZGF0aW5nOiBmYWxzZSxcbiAgICAgIGlzc3VlczogZmFsc2UsXG4gICAgfVxuICB9LFxuICBiaW5kQ2FsbGJhY2tzKCkge1xuICAgIHRoaXMuaGFuZGxlVXBsb2FkUHJvZ3Jlc3MgPSB0aGlzLmhhbmRsZVVwbG9hZFByb2dyZXNzLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZVNlbmRpbmcgPSB0aGlzLmhhbmRsZVNlbmRpbmcuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlU3VjY2VzcyA9IHRoaXMuaGFuZGxlU3VjY2Vzcy5iaW5kKHRoaXMpXG4gICAgdGhpcy5oYW5kbGVFcnJvciA9IHRoaXMuaGFuZGxlRXJyb3IuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlQ29tcGxldGUgPSB0aGlzLmhhbmRsZUNvbXBsZXRlLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZVF1ZXVlQ29tcGxldGUgPSB0aGlzLmhhbmRsZVF1ZXVlQ29tcGxldGUuYmluZCh0aGlzKVxuICB9LFxuICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNjEzMykgRklYTUU6ICdhdHRyaWJ1dGVzJyBpcyBkZWNsYXJlZCBidXQgaXRzIHZhbHVlIGlzIG5ldmVyIHJlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgaW5pdGlhbGl6ZShhdHRyaWJ1dGVzOiBhbnksIG9wdGlvbnM6IGFueSkge1xuICAgIHRoaXMuYmluZENhbGxiYWNrcygpXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuc2V0dXBEcm9wem9uZUxpc3RlbmVycygpXG4gIH0sXG4gIHNldHVwRHJvcHpvbmVMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kcm9wem9uZSkge1xuICAgICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9uKCdzZW5kaW5nJywgdGhpcy5oYW5kbGVTZW5kaW5nKVxuICAgICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9uKCd1cGxvYWRwcm9ncmVzcycsIHRoaXMuaGFuZGxlVXBsb2FkUHJvZ3Jlc3MpXG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub24oJ2Vycm9yJywgdGhpcy5oYW5kbGVFcnJvcilcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vbignc3VjY2VzcycsIHRoaXMuaGFuZGxlU3VjY2VzcylcbiAgICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vbignY29tcGxldGUnLCB0aGlzLmhhbmRsZUNvbXBsZXRlKVxuICAgICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9uKCdxdWV1ZWNvbXBsZXRlJywgdGhpcy5oYW5kbGVRdWV1ZUNvbXBsZXRlKVxuICAgIH1cbiAgfSxcbiAgaGFuZGxlU2VuZGluZyhmaWxlOiBhbnkpIHtcbiAgICBpZiAoZmlsZU1hdGNoZXMoZmlsZSwgdGhpcykpIHtcbiAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgc2VuZGluZzogdHJ1ZSxcbiAgICAgIH0pXG4gICAgfVxuICB9LFxuICBoYW5kbGVVcGxvYWRQcm9ncmVzcyhmaWxlOiBhbnksIHBlcmNlbnRhZ2U6IGFueSkge1xuICAgIGlmIChmaWxlTWF0Y2hlcyhmaWxlLCB0aGlzKSkge1xuICAgICAgdGhpcy5zZXQoJ3BlcmNlbnRhZ2UnLCBwZXJjZW50YWdlKVxuICAgIH1cbiAgfSxcbiAgaGFuZGxlRXJyb3IoZmlsZTogYW55KSB7XG4gICAgaWYgKGZpbGVNYXRjaGVzKGZpbGUsIHRoaXMpKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gZmlsZS5uYW1lICsgJyBjb3VsZCBub3QgYmUgdXBsb2FkZWQgc3VjY2Vzc2Z1bGx5LidcbiAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgZXJyb3I6IHRydWUsXG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICB9KVxuICAgIH1cbiAgfSxcbiAgaGFzQ2hpbGRyZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdjaGlsZHJlbicpICYmIHRoaXMuZ2V0KCdjaGlsZHJlbicpLmxlbmd0aCA+IDFcbiAgfSxcbiAgaGFuZGxlUXVldWVDb21wbGV0ZSgpIHtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZW55by9kcm9wem9uZS9ibG9iL3Y0LjMuMC9kaXN0L2Ryb3B6b25lLmpzI0w1NlxuICAgIC8vIGlmIHdlIHJlbW92ZSBjYWxsYmFja3MgdG9vIGVhcmx5IHRoaXMgbG9vcCB3aWxsIGZhaWwsIGxvb2sgdG8gc2VlIGlmIHVwZGF0aW5nIHRvIGxhdGVzdCBmaXhlcyB0aGlzXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnVubGlzdGVuVG9Ecm9wem9uZSgpXG4gICAgfSwgMClcbiAgfSxcbiAgdW5saXN0ZW5Ub0Ryb3B6b25lKCkge1xuICAgIHRoaXMub3B0aW9ucy5kcm9wem9uZS5vZmYoJ3NlbmRpbmcnLCB0aGlzLmhhbmRsZVNlbmRpbmcpXG4gICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9mZigncXVldWVjb21wbGV0ZScsIHRoaXMuaGFuZGxlUXVldWVDb21wbGV0ZSlcbiAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub2ZmKCd1cGxvYWRwcm9ncmVzcycsIHRoaXMuaGFuZGxlVXBsb2FkUHJvZ3Jlc3MpXG4gICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9mZignc3VjY2VzcycsIHRoaXMuaGFuZGxlU3VjY2VzcylcbiAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUub2ZmKCdlcnJvcicsIHRoaXMuaGFuZGxlRXJyb3IpXG4gICAgdGhpcy5vcHRpb25zLmRyb3B6b25lLm9mZignY29tcGxldGUnLCB0aGlzLmhhbmRsZUNvbXBsZXRlKVxuICB9LFxuICBoYW5kbGVTdWNjZXNzKGZpbGU6IGFueSkge1xuICAgIGlmIChmaWxlTWF0Y2hlcyhmaWxlLCB0aGlzKSkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSBgJHtmaWxlLm5hbWV9IHVwbG9hZGVkIHN1Y2Nlc3NmdWxseS5gXG4gICAgICBjb25zdCBhZGRlZElkc0hlYWRlciA9IGZpbGUueGhyLmdldFJlc3BvbnNlSGVhZGVyKCdhZGRlZC1pZHMnKVxuICAgICAgY29uc3QgY2hpbGRyZW4gPSBhZGRlZElkc0hlYWRlciA/IGFkZGVkSWRzSGVhZGVyLnNwbGl0KCcsJykgOiB1bmRlZmluZWRcbiAgICAgIGlmIChjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIG1lc3NhZ2UgKz0gYCAke2NoaWxkcmVuLmxlbmd0aH0gaXRlbXMgZm91bmQuYFxuICAgICAgfVxuICAgICAgdGhpcy5zZXQoe1xuICAgICAgICBpZDogZmlsZS54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2lkJyksXG4gICAgICAgIGNoaWxkcmVuLFxuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSlcbiAgICAgIGNoZWNrVmFsaWRhdGlvbih0aGlzKVxuICAgIH1cbiAgfSxcbiAgaGFuZGxlQ29tcGxldGUoZmlsZTogYW55KSB7XG4gICAgaWYgKGZpbGVNYXRjaGVzKGZpbGUsIHRoaXMpICYmIGZpbGUuc3RhdHVzID09PSAnY2FuY2VsZWQnKSB7XG4gICAgICB0aGlzLmNvbGxlY3Rpb24ucmVtb3ZlKHRoaXMpXG4gICAgfVxuICB9LFxuICBjaGVja1ZhbGlkYXRpb24oKSB7XG4gICAgY2hlY2tWYWxpZGF0aW9uKHRoaXMpXG4gIH0sXG4gIGNhbmNlbCgpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmRyb3B6b25lKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZHJvcHpvbmUucmVtb3ZlRmlsZSh0aGlzLmdldCgnZmlsZScpKVxuICAgICAgaWYgKHRoaXMuY29sbGVjdGlvbikge1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb24ucmVtb3ZlKHRoaXMpXG4gICAgICB9XG4gICAgfVxuICB9LFxufSlcbiJdfQ==