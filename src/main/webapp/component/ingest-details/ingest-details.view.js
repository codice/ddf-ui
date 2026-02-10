import { __assign, __read } from "tslib";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
                    maxFilesize: 5000000, //MB
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
    return (_jsxs("div", { className: "ingest-details p-2 w-full h-full flex flex-col items-center flex-nowrap overflow-hidden space-y-2", children: [_jsx("div", { className: "details-files w-full overflow-auto ".concat(mode === 'empty' ? '' : 'h-full'), children: uploadBatchModel.model ? (_jsx(UploadItemCollection, { collection: uploadBatchModel.model.get('uploads') })) : null }), mode === 'empty' || mode === 'has-files' ? (_jsx("div", { className: "details-dropzone border border-dashed w-full h-full flex flex-col justify-center items-center cursor-pointer overflow-hidden", ref: setDropzoneElement, children: _jsx("div", { className: "text-4xl cursor-pointer", onClick: function () {
                        if (dropzoneElement) {
                            dropzoneElement.click();
                        }
                    }, children: "Drop files here or click to upload" }) })) : null, mode === 'is-finished' || mode === 'is-uploading' ? (_jsx("div", { className: "details-summary w-full mt-2", children: uploadBatchModel.model ? (_jsx(UploadSummaryViewReact, { model: uploadBatchModel.model })) : null })) : null, _jsxs("div", { className: "details-footer w-full flex flex-row items-center flex-nowrap overflow-hidden shrink-0 mt-2", children: [mode === 'has-files' ? (_jsxs(_Fragment, { children: [_jsx(Button, { onClick: function () {
                                    setGetNewUploadBatchModel(true);
                                }, className: "w-full", children: "Clear" }), _jsx(Button, { variant: "contained", color: "primary", onClick: function () {
                                    if (props.preIngestValidator) {
                                        props.preIngestValidator(_.bind(uploadBatchModel.model.start, uploadBatchModel.model));
                                    }
                                    else {
                                        uploadBatchModel.model.start();
                                    }
                                }, className: "w-full", children: "Start" })] })) : null, mode === 'is-uploading' ? (_jsx(Button, { variant: "contained", color: "primary", onClick: function () {
                            uploadBatchModel.model.cancel();
                        }, className: "w-full", children: "Stop" })) : null, mode === 'is-finished' ? (_jsx(Button, { variant: "contained", color: "primary", "data-id": "new", onClick: function () {
                            setGetNewUploadBatchModel(true);
                        }, className: "w-full", children: "New" })) : null] })] }));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5nZXN0LWRldGFpbHMudmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvaW5nZXN0LWRldGFpbHMvaW5nZXN0LWRldGFpbHMudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQ3pCLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQTtBQUNwRSxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsbUpBQW1KO0FBQ25KLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQTtBQUNqRixPQUFPLGdCQUFnQixNQUFNLDRCQUE0QixDQUFBO0FBQ3pELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFBO0FBQzlFLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBV3pDLElBQU0sV0FBVyxHQUFHLFVBQUMsRUFLa0Q7UUFKckUsZUFBZSxxQkFBQSxFQUNmLFlBQVksa0JBQUEsRUFDWixTQUFTLGVBQUEsRUFDVCxtQkFBbUIseUJBQUE7SUFFYixJQUFBLEtBQUEsT0FBMEIsS0FBSyxDQUFDLFFBQVEsQ0FBTSxJQUFJLENBQUMsSUFBQSxFQUFsRCxRQUFRLFFBQUEsRUFBRSxXQUFXLFFBQTZCLENBQUE7SUFDekQsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQUksUUFBUSxJQUFJLG1CQUFtQixFQUFFLENBQUM7WUFDcEMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQTtRQUM3QyxDQUFDO0lBQ0gsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQTtJQUNkLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJ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cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbi8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSg3MDE2KSBGSVhNRTogQ291bGQgbm90IGZpbmQgYSBkZWNsYXJhdGlvbiBmaWxlIGZvciBtb2R1bGUgJ2Ryb3AuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuaW1wb3J0IERyb3B6b25lIGZyb20gJ2Ryb3B6b25lJ1xuaW1wb3J0IHsgVXBsb2FkSXRlbUNvbGxlY3Rpb24gfSBmcm9tICcuLi91cGxvYWQtaXRlbS91cGxvYWQtaXRlbS5jb2xsZWN0aW9uLnZpZXcnXG5pbXBvcnQgVXBsb2FkQmF0Y2hNb2RlbCBmcm9tICcuLi8uLi9qcy9tb2RlbC9VcGxvYWRCYXRjaCdcbmltcG9ydCB7IFVwbG9hZFN1bW1hcnlWaWV3UmVhY3QgfSBmcm9tICcuLi91cGxvYWQtc3VtbWFyeS91cGxvYWQtc3VtbWFyeS52aWV3J1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcblxudHlwZSBJbmdlc3RNb2RlVHlwZSA9ICdlbXB0eScgfCAnaGFzLWZpbGVzJyB8ICdpcy11cGxvYWRpbmcnIHwgJ2lzLWZpbmlzaGVkJ1xuXG50eXBlIEluZ2VzdERldGFpbHNWaWV3UmVhY3RUeXBlID0ge1xuICBleHRyYUhlYWRlcnM/OiBhbnlcbiAgb3ZlcnJpZGVzPzogYW55XG4gIGhhbmRsZVVwbG9hZFN1Y2Nlc3M/OiBhbnlcbiAgcHJlSW5nZXN0VmFsaWRhdG9yPzogYW55XG59XG5cbmNvbnN0IHVzZURyb3B6b25lID0gKHtcbiAgZHJvcHpvbmVFbGVtZW50LFxuICBleHRyYUhlYWRlcnMsXG4gIG92ZXJyaWRlcyxcbiAgaGFuZGxlVXBsb2FkU3VjY2Vzcyxcbn06IHsgZHJvcHpvbmVFbGVtZW50OiBIVE1MRWxlbWVudCB8IG51bGwgfSAmIEluZ2VzdERldGFpbHNWaWV3UmVhY3RUeXBlKSA9PiB7XG4gIGNvbnN0IFtkcm9wem9uZSwgc2V0RHJvcHpvbmVdID0gUmVhY3QudXNlU3RhdGU8YW55PihudWxsKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkcm9wem9uZSAmJiBoYW5kbGVVcGxvYWRTdWNjZXNzKSB7XG4gICAgICBkcm9wem9uZS5vbignc3VjY2VzcycsIGhhbmRsZVVwbG9hZFN1Y2Nlc3MpXG4gICAgfVxuICB9LCBbZHJvcHpvbmVdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkcm9wem9uZUVsZW1lbnQpIHtcbiAgICAgIGlmICgoZHJvcHpvbmVFbGVtZW50IGFzIHVua25vd24gYXMgYW55KS5kcm9wem9uZSkge1xuICAgICAgICBzZXREcm9wem9uZSgoZHJvcHpvbmVFbGVtZW50IGFzIHVua25vd24gYXMgYW55KS5kcm9wem9uZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldERyb3B6b25lKFxuICAgICAgICAgIG5ldyBEcm9wem9uZShkcm9wem9uZUVsZW1lbnQsIHtcbiAgICAgICAgICAgIHByZXZpZXdzQ29udGFpbmVyOiBmYWxzZSxcbiAgICAgICAgICAgIHBhcmFtTmFtZTogJ3BhcnNlLnJlc291cmNlJyxcbiAgICAgICAgICAgIHVybDogJy4vaW50ZXJuYWwvY2F0YWxvZy8nLFxuICAgICAgICAgICAgbWF4RmlsZXNpemU6IDUwMDAwMDAsIC8vTUJcbiAgICAgICAgICAgIG1ldGhvZDogJ3Bvc3QnLFxuICAgICAgICAgICAgYXV0b1Byb2Nlc3NRdWV1ZTogZmFsc2UsXG4gICAgICAgICAgICBoZWFkZXJzOiBleHRyYUhlYWRlcnMsXG4gICAgICAgICAgICBzZW5kaW5nKF9maWxlOiBhbnksIF94aHI6IGFueSwgZm9ybURhdGE6IGFueSkge1xuICAgICAgICAgICAgICBfLmVhY2gob3ZlcnJpZGVzLCAodmFsdWVzOiBhbnksIGF0dHJpYnV0ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKHZhbHVlcywgKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgncGFyc2UuJyArIGF0dHJpYnV0ZSwgdmFsdWUpXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW2Ryb3B6b25lRWxlbWVudF0pXG4gIHJldHVybiBkcm9wem9uZVxufVxuXG5jb25zdCB1c2VVcGxvYWRCYXRjaE1vZGVsID0gKHtcbiAgZHJvcHpvbmUsXG4gIGdldE5ld1VwbG9hZEJhdGNoTW9kZWwsXG4gIHNldEdldE5ld1VwbG9hZEJhdGNoTW9kZWwsXG59OiB7XG4gIGRyb3B6b25lOiBhbnlcbiAgZ2V0TmV3VXBsb2FkQmF0Y2hNb2RlbDogYm9vbGVhblxuICBzZXRHZXROZXdVcGxvYWRCYXRjaE1vZGVsOiAodmFsOiBib29sZWFuKSA9PiB2b2lkXG59KTogeyBtb2RlbDogYW55OyBqc29uOiBhbnkgfSA9PiB7XG4gIGNvbnN0IFt1cGxvYWRCYXRjaE1vZGVsLCBzZXRVcGxvYWRCYXRjaE1vZGVsXSA9IFJlYWN0LnVzZVN0YXRlPGFueT4oZHJvcHpvbmUpXG4gIGNvbnN0IFt1cGxvYWRCYXRjaE1vZGVsSlNPTiwgc2V0VXBsb2FkQmF0Y2hNb2RlbEpTT05dID1cbiAgICBSZWFjdC51c2VTdGF0ZTxhbnk+KG51bGwpXG4gIGNvbnN0IGNhbGxiYWNrID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHNldFVwbG9hZEJhdGNoTW9kZWxKU09OKHVwbG9hZEJhdGNoTW9kZWwudG9KU09OKCkpXG4gICAgfVxuICB9LCBbdXBsb2FkQmF0Y2hNb2RlbF0pXG4gIHVzZUxpc3RlblRvKFxuICAgIHVwbG9hZEJhdGNoTW9kZWwsXG4gICAgJ2FkZDp1cGxvYWRzIHJlbW92ZTp1cGxvYWRzIHJlc2V0OnVwbG9hZHMgY2hhbmdlOnNlbmRpbmcgY2hhbmdlOmZpbmlzaGVkJyxcbiAgICBjYWxsYmFja1xuICApXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAodXBsb2FkQmF0Y2hNb2RlbCkge1xuICAgICAgc2V0VXBsb2FkQmF0Y2hNb2RlbEpTT04odXBsb2FkQmF0Y2hNb2RlbC50b0pTT04oKSlcbiAgICB9XG4gIH0sIFt1cGxvYWRCYXRjaE1vZGVsXSlcblxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkcm9wem9uZSAmJiBnZXROZXdVcGxvYWRCYXRjaE1vZGVsKSB7XG4gICAgICBzZXRVcGxvYWRCYXRjaE1vZGVsKFxuICAgICAgICBuZXcgVXBsb2FkQmF0Y2hNb2RlbChcbiAgICAgICAgICB7fSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBkcm9wem9uZSxcbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIHNldEdldE5ld1VwbG9hZEJhdGNoTW9kZWwoZmFsc2UpXG4gICAgfVxuICB9LCBbZHJvcHpvbmUsIGdldE5ld1VwbG9hZEJhdGNoTW9kZWxdKVxuXG4gIHJldHVybiB7XG4gICAgbW9kZWw6IHVwbG9hZEJhdGNoTW9kZWwsXG4gICAganNvbjogdXBsb2FkQmF0Y2hNb2RlbEpTT04sXG4gIH1cbn1cblxuZnVuY3Rpb24gdXNlSW5nZXN0TW9kZSh7XG4gIHVwbG9hZEJhdGNoTW9kZWwsXG4gIGRyb3B6b25lLFxufToge1xuICB1cGxvYWRCYXRjaE1vZGVsOiB7XG4gICAgbW9kZWw6IGFueVxuICAgIGpzb246IGFueVxuICB9XG4gIGRyb3B6b25lOiBhbnlcbn0pOiBbSW5nZXN0TW9kZVR5cGUsIFJlYWN0LkRpc3BhdGNoPFJlYWN0LlNldFN0YXRlQWN0aW9uPEluZ2VzdE1vZGVUeXBlPj5dIHtcbiAgY29uc3QgW21vZGUsIHNldE1vZGVdID0gUmVhY3QudXNlU3RhdGU8SW5nZXN0TW9kZVR5cGU+KCdlbXB0eScpXG5cbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXVwbG9hZEJhdGNoTW9kZWwuanNvbikge1xuICAgICAgc2V0TW9kZSgnZW1wdHknKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh1cGxvYWRCYXRjaE1vZGVsLmpzb24uZmluaXNoZWQpIHtcbiAgICAgIHNldE1vZGUoJ2lzLWZpbmlzaGVkJylcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodXBsb2FkQmF0Y2hNb2RlbC5qc29uLnNlbmRpbmcpIHtcbiAgICAgIHNldE1vZGUoJ2lzLXVwbG9hZGluZycpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodXBsb2FkQmF0Y2hNb2RlbC5qc29uLnVwbG9hZHMubGVuZ3RoID4gMCkge1xuICAgICAgc2V0TW9kZSgnaGFzLWZpbGVzJylcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0TW9kZSgnZW1wdHknKVxuICAgIH1cbiAgfSwgW3VwbG9hZEJhdGNoTW9kZWxdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKG1vZGUgPT09ICdlbXB0eScgJiYgZHJvcHpvbmUgJiYgdXBsb2FkQmF0Y2hNb2RlbC5tb2RlbCkge1xuICAgICAgLy8gcmVzZXQgZHJvcHpvbmVcbiAgICAgIHVwbG9hZEJhdGNoTW9kZWwubW9kZWwudW5zZXQoJ2lkJylcbiAgICAgIGRyb3B6b25lLm9wdGlvbnMuYXV0b1Byb2Nlc3NRdWV1ZSA9IGZhbHNlXG4gICAgICBkcm9wem9uZS5yZW1vdmVBbGxGaWxlcyh0cnVlKVxuICAgICAgdXBsb2FkQmF0Y2hNb2RlbC5tb2RlbC5jbGVhcigpXG4gICAgICBjb25zdCBkZWZhdWx0cyA9IHVwbG9hZEJhdGNoTW9kZWwubW9kZWwuZGVmYXVsdHMoKVxuICAgICAgZGVsZXRlIGRlZmF1bHRzLnVwbG9hZHNcbiAgICAgIHVwbG9hZEJhdGNoTW9kZWwubW9kZWwuc2V0KGRlZmF1bHRzKVxuICAgICAgdXBsb2FkQmF0Y2hNb2RlbC5tb2RlbC5nZXQoJ3VwbG9hZHMnKS5yZXNldCgpXG4gICAgICB1cGxvYWRCYXRjaE1vZGVsLm1vZGVsLnVubGlzdGVuVG9Ecm9wem9uZSgpXG4gICAgICB1cGxvYWRCYXRjaE1vZGVsLm1vZGVsLmluaXRpYWxpemUodW5kZWZpbmVkLCB7XG4gICAgICAgIGRyb3B6b25lLFxuICAgICAgfSlcbiAgICB9XG4gIH0sIFttb2RlLCBkcm9wem9uZSwgdXBsb2FkQmF0Y2hNb2RlbC5tb2RlbF0pXG4gIHJldHVybiBbbW9kZSwgc2V0TW9kZV1cbn1cblxuZXhwb3J0IGNvbnN0IEluZ2VzdERldGFpbHNWaWV3UmVhY3QgPSAocHJvcHM6IEluZ2VzdERldGFpbHNWaWV3UmVhY3RUeXBlKSA9PiB7XG4gIGNvbnN0IFtkcm9wem9uZUVsZW1lbnQsIHNldERyb3B6b25lRWxlbWVudF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcbiAgY29uc3QgZHJvcHpvbmUgPSB1c2VEcm9wem9uZSh7XG4gICAgZHJvcHpvbmVFbGVtZW50LFxuICAgIC4uLnByb3BzLFxuICB9KVxuICBjb25zdCBbZ2V0TmV3VXBsb2FkQmF0Y2hNb2RlbCwgc2V0R2V0TmV3VXBsb2FkQmF0Y2hNb2RlbF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IHVwbG9hZEJhdGNoTW9kZWwgPSB1c2VVcGxvYWRCYXRjaE1vZGVsKHtcbiAgICBkcm9wem9uZSxcbiAgICBnZXROZXdVcGxvYWRCYXRjaE1vZGVsLFxuICAgIHNldEdldE5ld1VwbG9hZEJhdGNoTW9kZWwsXG4gIH0pXG4gIGNvbnN0IFttb2RlXSA9IHVzZUluZ2VzdE1vZGUoeyB1cGxvYWRCYXRjaE1vZGVsLCBkcm9wem9uZSB9KVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJpbmdlc3QtZGV0YWlscyBwLTIgdy1mdWxsIGgtZnVsbCBmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBmbGV4LW5vd3JhcCBvdmVyZmxvdy1oaWRkZW4gc3BhY2UteS0yXCI+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17YGRldGFpbHMtZmlsZXMgdy1mdWxsIG92ZXJmbG93LWF1dG8gJHtcbiAgICAgICAgICBtb2RlID09PSAnZW1wdHknID8gJycgOiAnaC1mdWxsJ1xuICAgICAgICB9YH1cbiAgICAgID5cbiAgICAgICAge3VwbG9hZEJhdGNoTW9kZWwubW9kZWwgPyAoXG4gICAgICAgICAgPFVwbG9hZEl0ZW1Db2xsZWN0aW9uXG4gICAgICAgICAgICBjb2xsZWN0aW9uPXt1cGxvYWRCYXRjaE1vZGVsLm1vZGVsLmdldCgndXBsb2FkcycpfVxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG4gICAgICB7bW9kZSA9PT0gJ2VtcHR5JyB8fCBtb2RlID09PSAnaGFzLWZpbGVzJyA/IChcbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT1cImRldGFpbHMtZHJvcHpvbmUgYm9yZGVyIGJvcmRlci1kYXNoZWQgdy1mdWxsIGgtZnVsbCBmbGV4IGZsZXgtY29sIGp1c3RpZnktY2VudGVyIGl0ZW1zLWNlbnRlciBjdXJzb3ItcG9pbnRlciBvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICAgIHJlZj17c2V0RHJvcHpvbmVFbGVtZW50fVxuICAgICAgICA+XG4gICAgICAgICAgPGRpdlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC00eGwgY3Vyc29yLXBvaW50ZXJcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoZHJvcHpvbmVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgZHJvcHpvbmVFbGVtZW50LmNsaWNrKClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBEcm9wIGZpbGVzIGhlcmUgb3IgY2xpY2sgdG8gdXBsb2FkXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKSA6IG51bGx9XG4gICAgICB7bW9kZSA9PT0gJ2lzLWZpbmlzaGVkJyB8fCBtb2RlID09PSAnaXMtdXBsb2FkaW5nJyA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkZXRhaWxzLXN1bW1hcnkgdy1mdWxsIG10LTJcIj5cbiAgICAgICAgICB7dXBsb2FkQmF0Y2hNb2RlbC5tb2RlbCA/IChcbiAgICAgICAgICAgIDxVcGxvYWRTdW1tYXJ5Vmlld1JlYWN0IG1vZGVsPXt1cGxvYWRCYXRjaE1vZGVsLm1vZGVsfSAvPlxuICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiBudWxsfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJkZXRhaWxzLWZvb3RlciB3LWZ1bGwgZmxleCBmbGV4LXJvdyBpdGVtcy1jZW50ZXIgZmxleC1ub3dyYXAgb3ZlcmZsb3ctaGlkZGVuIHNocmluay0wIG10LTJcIj5cbiAgICAgICAge21vZGUgPT09ICdoYXMtZmlsZXMnID8gKFxuICAgICAgICAgIDw+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRHZXROZXdVcGxvYWRCYXRjaE1vZGVsKHRydWUpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIENsZWFyXG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocHJvcHMucHJlSW5nZXN0VmFsaWRhdG9yKSB7XG4gICAgICAgICAgICAgICAgICBwcm9wcy5wcmVJbmdlc3RWYWxpZGF0b3IoXG4gICAgICAgICAgICAgICAgICAgIF8uYmluZCh1cGxvYWRCYXRjaE1vZGVsLm1vZGVsLnN0YXJ0LCB1cGxvYWRCYXRjaE1vZGVsLm1vZGVsKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB1cGxvYWRCYXRjaE1vZGVsLm1vZGVsLnN0YXJ0KClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFN0YXJ0XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIHttb2RlID09PSAnaXMtdXBsb2FkaW5nJyA/IChcbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHVwbG9hZEJhdGNoTW9kZWwubW9kZWwuY2FuY2VsKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGxcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIFN0b3BcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICAgIHttb2RlID09PSAnaXMtZmluaXNoZWQnID8gKFxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIGRhdGEtaWQ9XCJuZXdcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRHZXROZXdVcGxvYWRCYXRjaE1vZGVsKHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICBOZXdcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIl19