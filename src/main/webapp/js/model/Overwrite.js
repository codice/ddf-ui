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
export default Backbone.Model.extend({
    defaults: function () {
        return {
            id: undefined,
            result: undefined,
            file: undefined,
            percentage: 0,
            sending: false,
            success: false,
            error: false,
            message: '',
            dropzone: undefined,
        };
    },
    initialize: function () {
        this.setupDropzoneListeners();
    },
    setupDropzoneListeners: function () {
        this.get('dropzone').on('sending', this.handleSending.bind(this));
        this.get('dropzone').on('uploadprogress', this.handleUploadProgress.bind(this));
        this.get('dropzone').on('error', this.handleError.bind(this));
        this.get('dropzone').on('success', this.handleSuccess.bind(this));
    },
    handleSending: function (file) {
        this.set({
            file: file,
            sending: true,
        });
    },
    handleUploadProgress: function (_file, percentage) {
        this.set('percentage', percentage);
    },
    handleError: function (file, response) {
        var result = this.get('result');
        var message = result.plain.metacard.properties.title +
            ' could not be overwritten by ' +
            file.name +
            response;
        this.set({
            error: true,
            message: message,
        });
    },
    handleSuccess: function (file) {
        var result = this.get('result');
        var message = result.plain.metacard.properties.title +
            ' has been overwritten by ' +
            file.name;
        this.set({
            success: true,
            message: message,
        });
        result.refreshDataOverNetwork();
    },
    removeIfUnused: function () {
        if (!this.get('sending')) {
            this.collection.remove(this);
        }
    },
});
//# sourceMappingURL=Overwrite.js.map