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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5nZXN0LWRldGFpbHMudmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvaW5nZXN0LWRldGFpbHMvaW5nZXN0LWRldGFpbHMudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFBO0FBQ3BFLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixtSkFBbUo7QUFDbkosT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBQy9CLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDRDQUE0QyxDQUFBO0FBQ2pGLE9BQU8sZ0JBQWdCLE1BQU0sNEJBQTRCLENBQUE7QUFDekQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sdUNBQXVDLENBQUE7QUFDOUUsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFXekMsSUFBTSxXQUFXLEdBQUcsVUFBQyxFQUtrRDtRQUpyRSxlQUFlLHFCQUFBLEVBQ2YsWUFBWSxrQkFBQSxFQUNaLFNBQVMsZUFBQSxFQUNULG1CQUFtQix5QkFBQTtJQUViLElBQUEsS0FBQSxPQUEwQixLQUFLLENBQUMsUUFBUSxDQUFNLElBQUksQ0FBQyxJQUFBLEVBQWxELFFBQVEsUUFBQSxFQUFFLFdBQVcsUUFBNkIsQ0FBQTtJQUN6RCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSxRQUFRLElBQUksbUJBQW1CLEVBQUU7WUFDbkMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtTQUM1QztJQUNILENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7SUFDZCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSxlQUFlLEVB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LEVBQUU7d0JBQ1AsSUFBSSxLQUFLLENBQUMsa0JBQWtCLEVBQUU7NEJBQzVCLEtBQUssQ0FBQyxrQkFBa0IsQ0FDdEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUM3RCxDQUFBO3lCQUNGOzZCQUFNOzRCQUNMLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQTt5QkFDL0I7b0JBQ0gsQ0FBQyxFQUNELFNBQVMsRUFBQyxRQUFRLFlBR1gsQ0FDUixDQUNKLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDUCxJQUFJLEtBQUssY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUN6QixvQkFBQyxNQUFNLElBQ0wsT0FBTyxFQUFDLFdBQVcsRUFDbkIsS0FBSyxFQUFDLFNBQVMsRUFDZixPQUFPLEVBQUU7b0JBQ1AsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFBO2dCQUNqQyxDQUFDLEVBQ0QsU0FBUyxFQUFDLFFBQVEsV0FHWCxDQUNWLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDUCxJQUFJLEtBQUssYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUN4QixvQkFBQyxNQUFNLElBQ0wsT0FBTyxFQUFDLFdBQVcsRUFDbkIsS0FBSyxFQUFDLFNBQVMsYUFDUCxLQUFLLEVBQ2IsT0FBTyxFQUFFO29CQUNQLHlCQUF5QixDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUNqQyxDQUFDLEVBQ0QsU0FBUyxFQUFDLFFBQVEsVUFHWCxDQUNWLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDSixDQUNGLENBQ1AsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgdXNlTGlzdGVuVG8gfSBmcm9tICcuLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdkcm9wLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBEcm9wem9uZSBmcm9tICdkcm9wem9uZSdcbmltcG9ydCB7IFVwbG9hZEl0ZW1Db2xsZWN0aW9uIH0gZnJvbSAnLi4vdXBsb2FkLWl0ZW0vdXBsb2FkLWl0ZW0uY29sbGVjdGlvbi52aWV3J1xuaW1wb3J0IFVwbG9hZEJhdGNoTW9kZWwgZnJvbSAnLi4vLi4vanMvbW9kZWwvVXBsb2FkQmF0Y2gnXG5pbXBvcnQgeyBVcGxvYWRTdW1tYXJ5Vmlld1JlYWN0IH0gZnJvbSAnLi4vdXBsb2FkLXN1bW1hcnkvdXBsb2FkLXN1bW1hcnkudmlldydcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5cbnR5cGUgSW5nZXN0TW9kZVR5cGUgPSAnZW1wdHknIHwgJ2hhcy1maWxlcycgfCAnaXMtdXBsb2FkaW5nJyB8ICdpcy1maW5pc2hlZCdcblxudHlwZSBJbmdlc3REZXRhaWxzVmlld1JlYWN0VHlwZSA9IHtcbiAgZXh0cmFIZWFkZXJzPzogYW55XG4gIG92ZXJyaWRlcz86IGFueVxuICBoYW5kbGVVcGxvYWRTdWNjZXNzPzogYW55XG4gIHByZUluZ2VzdFZhbGlkYXRvcj86IGFueVxufVxuXG5jb25zdCB1c2VEcm9wem9uZSA9ICh7XG4gIGRyb3B6b25lRWxlbWVudCxcbiAgZXh0cmFIZWFkZXJzLFxuICBvdmVycmlkZXMsXG4gIGhhbmRsZVVwbG9hZFN1Y2Nlc3MsXG59OiB7IGRyb3B6b25lRWxlbWVudDogSFRNTEVsZW1lbnQgfCBudWxsIH0gJiBJbmdlc3REZXRhaWxzVmlld1JlYWN0VHlwZSkgPT4ge1xuICBjb25zdCBbZHJvcHpvbmUsIHNldERyb3B6b25lXSA9IFJlYWN0LnVzZVN0YXRlPGFueT4obnVsbClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZHJvcHpvbmUgJiYgaGFuZGxlVXBsb2FkU3VjY2Vzcykge1xuICAgICAgZHJvcHpvbmUub24oJ3N1Y2Nlc3MnLCBoYW5kbGVVcGxvYWRTdWNjZXNzKVxuICAgIH1cbiAgfSwgW2Ryb3B6b25lXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZHJvcHpvbmVFbGVtZW50KSB7XG4gICAgICBpZiAoKGRyb3B6b25lRWxlbWVudCBhcyB1bmtub3duIGFzIGFueSkuZHJvcHpvbmUpIHtcbiAgICAgICAgc2V0RHJvcHpvbmUoKGRyb3B6b25lRWxlbWVudCBhcyB1bmtub3duIGFzIGFueSkuZHJvcHpvbmUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXREcm9wem9uZShcbiAgICAgICAgICBuZXcgRHJvcHpvbmUoZHJvcHpvbmVFbGVtZW50LCB7XG4gICAgICAgICAgICBwcmV2aWV3c0NvbnRhaW5lcjogZmFsc2UsXG4gICAgICAgICAgICBwYXJhbU5hbWU6ICdwYXJzZS5yZXNvdXJjZScsXG4gICAgICAgICAgICB1cmw6ICcuL2ludGVybmFsL2NhdGFsb2cvJyxcbiAgICAgICAgICAgIG1heEZpbGVzaXplOiA1MDAwMDAwLCAvL01CXG4gICAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICAgIGF1dG9Qcm9jZXNzUXVldWU6IGZhbHNlLFxuICAgICAgICAgICAgaGVhZGVyczogZXh0cmFIZWFkZXJzLFxuICAgICAgICAgICAgc2VuZGluZyhfZmlsZTogYW55LCBfeGhyOiBhbnksIGZvcm1EYXRhOiBhbnkpIHtcbiAgICAgICAgICAgICAgXy5lYWNoKG92ZXJyaWRlcywgKHZhbHVlczogYW55LCBhdHRyaWJ1dGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIF8uZWFjaCh2YWx1ZXMsICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ3BhcnNlLicgKyBhdHRyaWJ1dGUsIHZhbHVlKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtkcm9wem9uZUVsZW1lbnRdKVxuICByZXR1cm4gZHJvcHpvbmVcbn1cblxuY29uc3QgdXNlVXBsb2FkQmF0Y2hNb2RlbCA9ICh7XG4gIGRyb3B6b25lLFxuICBnZXROZXdVcGxvYWRCYXRjaE1vZGVsLFxuICBzZXRHZXROZXdVcGxvYWRCYXRjaE1vZGVsLFxufToge1xuICBkcm9wem9uZTogYW55XG4gIGdldE5ld1VwbG9hZEJhdGNoTW9kZWw6IGJvb2xlYW5cbiAgc2V0R2V0TmV3VXBsb2FkQmF0Y2hNb2RlbDogKHZhbDogYm9vbGVhbikgPT4gdm9pZFxufSk6IHsgbW9kZWw6IGFueTsganNvbjogYW55IH0gPT4ge1xuICBjb25zdCBbdXBsb2FkQmF0Y2hNb2RlbCwgc2V0VXBsb2FkQmF0Y2hNb2RlbF0gPSBSZWFjdC51c2VTdGF0ZTxhbnk+KGRyb3B6b25lKVxuICBjb25zdCBbdXBsb2FkQmF0Y2hNb2RlbEpTT04sIHNldFVwbG9hZEJhdGNoTW9kZWxKU09OXSA9XG4gICAgUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuICBjb25zdCBjYWxsYmFjayA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBzZXRVcGxvYWRCYXRjaE1vZGVsSlNPTih1cGxvYWRCYXRjaE1vZGVsLnRvSlNPTigpKVxuICAgIH1cbiAgfSwgW3VwbG9hZEJhdGNoTW9kZWxdKVxuICB1c2VMaXN0ZW5UbyhcbiAgICB1cGxvYWRCYXRjaE1vZGVsLFxuICAgICdhZGQ6dXBsb2FkcyByZW1vdmU6dXBsb2FkcyByZXNldDp1cGxvYWRzIGNoYW5nZTpzZW5kaW5nIGNoYW5nZTpmaW5pc2hlZCcsXG4gICAgY2FsbGJhY2tcbiAgKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHVwbG9hZEJhdGNoTW9kZWwpIHtcbiAgICAgIHNldFVwbG9hZEJhdGNoTW9kZWxKU09OKHVwbG9hZEJhdGNoTW9kZWwudG9KU09OKCkpXG4gICAgfVxuICB9LCBbdXBsb2FkQmF0Y2hNb2RlbF0pXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoZHJvcHpvbmUgJiYgZ2V0TmV3VXBsb2FkQmF0Y2hNb2RlbCkge1xuICAgICAgc2V0VXBsb2FkQmF0Y2hNb2RlbChcbiAgICAgICAgbmV3IFVwbG9hZEJhdGNoTW9kZWwoXG4gICAgICAgICAge30sXG4gICAgICAgICAge1xuICAgICAgICAgICAgZHJvcHpvbmUsXG4gICAgICAgICAgfVxuICAgICAgICApXG4gICAgICApXG4gICAgICBzZXRHZXROZXdVcGxvYWRCYXRjaE1vZGVsKGZhbHNlKVxuICAgIH1cbiAgfSwgW2Ryb3B6b25lLCBnZXROZXdVcGxvYWRCYXRjaE1vZGVsXSlcblxuICByZXR1cm4ge1xuICAgIG1vZGVsOiB1cGxvYWRCYXRjaE1vZGVsLFxuICAgIGpzb246IHVwbG9hZEJhdGNoTW9kZWxKU09OLFxuICB9XG59XG5cbmZ1bmN0aW9uIHVzZUluZ2VzdE1vZGUoe1xuICB1cGxvYWRCYXRjaE1vZGVsLFxuICBkcm9wem9uZSxcbn06IHtcbiAgdXBsb2FkQmF0Y2hNb2RlbDoge1xuICAgIG1vZGVsOiBhbnlcbiAgICBqc29uOiBhbnlcbiAgfVxuICBkcm9wem9uZTogYW55XG59KTogW0luZ2VzdE1vZGVUeXBlLCBSZWFjdC5EaXNwYXRjaDxSZWFjdC5TZXRTdGF0ZUFjdGlvbjxJbmdlc3RNb2RlVHlwZT4+XSB7XG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IFJlYWN0LnVzZVN0YXRlPEluZ2VzdE1vZGVUeXBlPignZW1wdHknKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCF1cGxvYWRCYXRjaE1vZGVsLmpzb24pIHtcbiAgICAgIHNldE1vZGUoJ2VtcHR5JylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodXBsb2FkQmF0Y2hNb2RlbC5qc29uLmZpbmlzaGVkKSB7XG4gICAgICBzZXRNb2RlKCdpcy1maW5pc2hlZCcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaWYgKHVwbG9hZEJhdGNoTW9kZWwuanNvbi5zZW5kaW5nKSB7XG4gICAgICBzZXRNb2RlKCdpcy11cGxvYWRpbmcnKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHVwbG9hZEJhdGNoTW9kZWwuanNvbi51cGxvYWRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHNldE1vZGUoJ2hhcy1maWxlcycpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldE1vZGUoJ2VtcHR5JylcbiAgICB9XG4gIH0sIFt1cGxvYWRCYXRjaE1vZGVsXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtb2RlID09PSAnZW1wdHknICYmIGRyb3B6b25lICYmIHVwbG9hZEJhdGNoTW9kZWwubW9kZWwpIHtcbiAgICAgIC8vIHJlc2V0IGRyb3B6b25lXG4gICAgICB1cGxvYWRCYXRjaE1vZGVsLm1vZGVsLnVuc2V0KCdpZCcpXG4gICAgICBkcm9wem9uZS5vcHRpb25zLmF1dG9Qcm9jZXNzUXVldWUgPSBmYWxzZVxuICAgICAgZHJvcHpvbmUucmVtb3ZlQWxsRmlsZXModHJ1ZSlcbiAgICAgIHVwbG9hZEJhdGNoTW9kZWwubW9kZWwuY2xlYXIoKVxuICAgICAgY29uc3QgZGVmYXVsdHMgPSB1cGxvYWRCYXRjaE1vZGVsLm1vZGVsLmRlZmF1bHRzKClcbiAgICAgIGRlbGV0ZSBkZWZhdWx0cy51cGxvYWRzXG4gICAgICB1cGxvYWRCYXRjaE1vZGVsLm1vZGVsLnNldChkZWZhdWx0cylcbiAgICAgIHVwbG9hZEJhdGNoTW9kZWwubW9kZWwuZ2V0KCd1cGxvYWRzJykucmVzZXQoKVxuICAgICAgdXBsb2FkQmF0Y2hNb2RlbC5tb2RlbC51bmxpc3RlblRvRHJvcHpvbmUoKVxuICAgICAgdXBsb2FkQmF0Y2hNb2RlbC5tb2RlbC5pbml0aWFsaXplKHVuZGVmaW5lZCwge1xuICAgICAgICBkcm9wem9uZSxcbiAgICAgIH0pXG4gICAgfVxuICB9LCBbbW9kZSwgZHJvcHpvbmUsIHVwbG9hZEJhdGNoTW9kZWwubW9kZWxdKVxuICByZXR1cm4gW21vZGUsIHNldE1vZGVdXG59XG5cbmV4cG9ydCBjb25zdCBJbmdlc3REZXRhaWxzVmlld1JlYWN0ID0gKHByb3BzOiBJbmdlc3REZXRhaWxzVmlld1JlYWN0VHlwZSkgPT4ge1xuICBjb25zdCBbZHJvcHpvbmVFbGVtZW50LCBzZXREcm9wem9uZUVsZW1lbnRdID1cbiAgICBSZWFjdC51c2VTdGF0ZTxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXG4gIGNvbnN0IGRyb3B6b25lID0gdXNlRHJvcHpvbmUoe1xuICAgIGRyb3B6b25lRWxlbWVudCxcbiAgICAuLi5wcm9wcyxcbiAgfSlcbiAgY29uc3QgW2dldE5ld1VwbG9hZEJhdGNoTW9kZWwsIHNldEdldE5ld1VwbG9hZEJhdGNoTW9kZWxdID1cbiAgICBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCB1cGxvYWRCYXRjaE1vZGVsID0gdXNlVXBsb2FkQmF0Y2hNb2RlbCh7XG4gICAgZHJvcHpvbmUsXG4gICAgZ2V0TmV3VXBsb2FkQmF0Y2hNb2RlbCxcbiAgICBzZXRHZXROZXdVcGxvYWRCYXRjaE1vZGVsLFxuICB9KVxuICBjb25zdCBbbW9kZV0gPSB1c2VJbmdlc3RNb2RlKHsgdXBsb2FkQmF0Y2hNb2RlbCwgZHJvcHpvbmUgfSlcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5nZXN0LWRldGFpbHMgcC0yIHctZnVsbCBoLWZ1bGwgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgZmxleC1ub3dyYXAgb3ZlcmZsb3ctaGlkZGVuIHNwYWNlLXktMlwiPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e2BkZXRhaWxzLWZpbGVzIHctZnVsbCBvdmVyZmxvdy1hdXRvICR7XG4gICAgICAgICAgbW9kZSA9PT0gJ2VtcHR5JyA/ICcnIDogJ2gtZnVsbCdcbiAgICAgICAgfWB9XG4gICAgICA+XG4gICAgICAgIHt1cGxvYWRCYXRjaE1vZGVsLm1vZGVsID8gKFxuICAgICAgICAgIDxVcGxvYWRJdGVtQ29sbGVjdGlvblxuICAgICAgICAgICAgY29sbGVjdGlvbj17dXBsb2FkQmF0Y2hNb2RlbC5tb2RlbC5nZXQoJ3VwbG9hZHMnKX1cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICAge21vZGUgPT09ICdlbXB0eScgfHwgbW9kZSA9PT0gJ2hhcy1maWxlcycgPyAoXG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJkZXRhaWxzLWRyb3B6b25lIGJvcmRlciBib3JkZXItZGFzaGVkIHctZnVsbCBoLWZ1bGwgZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWNlbnRlciBpdGVtcy1jZW50ZXIgY3Vyc29yLXBvaW50ZXIgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICByZWY9e3NldERyb3B6b25lRWxlbWVudH1cbiAgICAgICAgPlxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtNHhsIGN1cnNvci1wb2ludGVyXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGRyb3B6b25lRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGRyb3B6b25lRWxlbWVudC5jbGljaygpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgRHJvcCBmaWxlcyBoZXJlIG9yIGNsaWNrIHRvIHVwbG9hZFxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgICAge21vZGUgPT09ICdpcy1maW5pc2hlZCcgfHwgbW9kZSA9PT0gJ2lzLXVwbG9hZGluZycgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGV0YWlscy1zdW1tYXJ5IHctZnVsbCBtdC0yXCI+XG4gICAgICAgICAge3VwbG9hZEJhdGNoTW9kZWwubW9kZWwgPyAoXG4gICAgICAgICAgICA8VXBsb2FkU3VtbWFyeVZpZXdSZWFjdCBtb2RlbD17dXBsb2FkQmF0Y2hNb2RlbC5tb2RlbH0gLz5cbiAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbnVsbH1cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGV0YWlscy1mb290ZXIgdy1mdWxsIGZsZXggZmxleC1yb3cgaXRlbXMtY2VudGVyIGZsZXgtbm93cmFwIG92ZXJmbG93LWhpZGRlbiBzaHJpbmstMCBtdC0yXCI+XG4gICAgICAgIHttb2RlID09PSAnaGFzLWZpbGVzJyA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0R2V0TmV3VXBsb2FkQmF0Y2hNb2RlbCh0cnVlKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGxcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBDbGVhclxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BzLnByZUluZ2VzdFZhbGlkYXRvcikge1xuICAgICAgICAgICAgICAgICAgcHJvcHMucHJlSW5nZXN0VmFsaWRhdG9yKFxuICAgICAgICAgICAgICAgICAgICBfLmJpbmQodXBsb2FkQmF0Y2hNb2RlbC5tb2RlbC5zdGFydCwgdXBsb2FkQmF0Y2hNb2RlbC5tb2RlbClcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdXBsb2FkQmF0Y2hNb2RlbC5tb2RlbC5zdGFydCgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGxcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBTdGFydFxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7bW9kZSA9PT0gJ2lzLXVwbG9hZGluZycgPyAoXG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICB1cGxvYWRCYXRjaE1vZGVsLm1vZGVsLmNhbmNlbCgpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBTdG9wXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7bW9kZSA9PT0gJ2lzLWZpbmlzaGVkJyA/IChcbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICBkYXRhLWlkPVwibmV3XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2V0R2V0TmV3VXBsb2FkQmF0Y2hNb2RlbCh0cnVlKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbFwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgTmV3XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cbiJdfQ==