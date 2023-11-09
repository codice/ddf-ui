import { __assign, __read } from "tslib";
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
import React from 'react';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import _ from 'underscore';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'drop... Remove this comment to see the full error message
import Dropzone from 'dropzone';
import { UploadItemCollection } from '../upload-item/upload-item.collection.view';
import UploadBatchModel from '../../js/model/UploadBatch';
import { UploadSummaryViewReact } from '../upload-summary/upload-summary.view';
import Button from '@mui/material/Button';
var useDropzone = function (_a) {
    var dropzoneElement = _a.dropzoneElement, extraHeaders = _a.extraHeaders, overrides = _a.overrides, handleUploadSuccess = _a.handleUploadSuccess;
    var _b = __read(React.useState(null), 2), dropzone = _b[0], setDropzone = _b[1];
    React.useEffect(function () {
        if (dropzone && handleUploadSuccess) {
            dropzone.on('success', handleUploadSuccess);
        }
    }, [dropzone]);
    React.useEffect(function () {
        if (dropzoneElement) {
            if (dropzoneElement.dropzone) {
                setDropzone(dropzoneElement.dropzone);
            }
            else {
                setDropzone(new Dropzone(dropzoneElement, {
                    previewsContainer: false,
                    paramName: 'parse.resource',
                    url: './internal/catalog/',
                    maxFilesize: 5000000,
                    method: 'post',
                    autoProcessQueue: false,
                    headers: extraHeaders,
                    sending: function (_file, _xhr, formData) {
                        _.each(overrides, function (values, attribute) {
                            _.each(values, function (value) {
                                formData.append('parse.' + attribute, value);
                            });
                        });
                    },
                }));
            }
        }
    }, [dropzoneElement]);
    return dropzone;
};
var useUploadBatchModel = function (_a) {
    var dropzone = _a.dropzone, getNewUploadBatchModel = _a.getNewUploadBatchModel, setGetNewUploadBatchModel = _a.setGetNewUploadBatchModel;
    var _b = __read(React.useState(dropzone), 2), uploadBatchModel = _b[0], setUploadBatchModel = _b[1];
    var _c = __read(React.useState(null), 2), uploadBatchModelJSON = _c[0], setUploadBatchModelJSON = _c[1];
    var callback = React.useMemo(function () {
        return function () {
            setUploadBatchModelJSON(uploadBatchModel.toJSON());
        };
    }, [uploadBatchModel]);
    useListenTo(uploadBatchModel, 'add:uploads remove:uploads reset:uploads change:sending change:finished', callback);
    React.useEffect(function () {
        if (uploadBatchModel) {
            setUploadBatchModelJSON(uploadBatchModel.toJSON());
        }
    }, [uploadBatchModel]);
    React.useEffect(function () {
        if (dropzone && getNewUploadBatchModel) {
            setUploadBatchModel(new UploadBatchModel({}, {
                dropzone: dropzone,
            }));
            setGetNewUploadBatchModel(false);
        }
    }, [dropzone, getNewUploadBatchModel]);
    return {
        model: uploadBatchModel,
        json: uploadBatchModelJSON,
    };
};
function useIngestMode(_a) {
    var uploadBatchModel = _a.uploadBatchModel, dropzone = _a.dropzone;
    var _b = __read(React.useState('empty'), 2), mode = _b[0], setMode = _b[1];
    React.useEffect(function () {
        if (!uploadBatchModel.json) {
            setMode('empty');
            return;
        }
        if (uploadBatchModel.json.finished) {
            setMode('is-finished');
            return;
        }
        if (uploadBatchModel.json.sending) {
            setMode('is-uploading');
            return;
        }
        if (uploadBatchModel.json.uploads.length > 0) {
            setMode('has-files');
        }
        else {
            setMode('empty');
        }
    }, [uploadBatchModel]);
    React.useEffect(function () {
        if (mode === 'empty' && dropzone && uploadBatchModel.model) {
            // reset dropzone
            uploadBatchModel.model.unset('id');
            dropzone.options.autoProcessQueue = false;
            dropzone.removeAllFiles(true);
            uploadBatchModel.model.clear();
            var defaults = uploadBatchModel.model.defaults();
            delete defaults.uploads;
            uploadBatchModel.model.set(defaults);
            uploadBatchModel.model.get('uploads').reset();
            uploadBatchModel.model.unlistenToDropzone();
            uploadBatchModel.model.initialize(undefined, {
                dropzone: dropzone,
            });
        }
    }, [mode, dropzone, uploadBatchModel.model]);
    return [mode, setMode];
}
export var IngestDetailsViewReact = function (props) {
    var _a = __read(React.useState(null), 2), dropzoneElement = _a[0], setDropzoneElement = _a[1];
    var dropzone = useDropzone(__assign({ dropzoneElement: dropzoneElement }, props));
    var _b = __read(React.useState(true), 2), getNewUploadBatchModel = _b[0], setGetNewUploadBatchModel = _b[1];
    var uploadBatchModel = useUploadBatchModel({
        dropzone: dropzone,
        getNewUploadBatchModel: getNewUploadBatchModel,
        setGetNewUploadBatchModel: setGetNewUploadBatchModel,
    });
    var _c = __read(useIngestMode({ uploadBatchModel: uploadBatchModel, dropzone: dropzone }), 1), mode = _c[0];
    return (React.createElement("div", { className: "ingest-details p-2 w-full h-full flex flex-col items-center flex-nowrap overflow-hidden space-y-2" },
        React.createElement("div", { className: "details-files w-full overflow-auto ".concat(mode === 'empty' ? '' : 'h-full') }, uploadBatchModel.model ? (React.createElement(UploadItemCollection, { collection: uploadBatchModel.model.get('uploads') })) : null),
        mode === 'empty' || mode === 'has-files' ? (React.createElement("div", { className: "details-dropzone border border-dashed w-full h-full flex flex-col justify-center items-center cursor-pointer overflow-hidden", ref: setDropzoneElement },
            React.createElement("div", { className: "text-4xl cursor-pointer", onClick: function () {
                    if (dropzoneElement) {
                        dropzoneElement.click();
                    }
                } }, "Drop files here or click to upload"))) : null,
        mode === 'is-finished' || mode === 'is-uploading' ? (React.createElement("div", { className: "details-summary w-full mt-2" }, uploadBatchModel.model ? (React.createElement(UploadSummaryViewReact, { model: uploadBatchModel.model })) : null)) : null,
        React.createElement("div", { className: "details-footer w-full flex flex-row items-center flex-nowrap overflow-hidden shrink-0 mt-2" },
            mode === 'has-files' ? (React.createElement(React.Fragment, null,
                React.createElement(Button, { onClick: function () {
                        setGetNewUploadBatchModel(true);
                    }, className: "w-full" }, "Clear"),
                React.createElement(Button, { variant: "contained", color: "primary", onClick: function () {
                        if (props.preIngestValidator) {
                            props.preIngestValidator(_.bind(uploadBatchModel.model.start, uploadBatchModel.model));
                        }
                        else {
                            uploadBatchModel.model.start();
                        }
                    }, className: "w-full" }, "Start"))) : null,
            mode === 'is-uploading' ? (React.createElement(Button, { variant: "contained", color: "primary", onClick: function () {
                    uploadBatchModel.model.cancel();
                }, className: "w-full" }, "Stop")) : null,
            mode === 'is-finished' ? (React.createElement(Button, { variant: "contained", color: "primary", "data-id": "new", onClick: function () {
                    setGetNewUploadBatchModel(true);
                }, className: "w-full" }, "New")) : null)));
};
//# sourceMappingURL=ingest-details.view.js.map