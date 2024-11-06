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
import { __read } from "tslib";
import user from '../singletons/user-instance';
import { UploadSummaryViewReact } from '../upload-summary/upload-summary.view';
import { Link } from 'react-router-dom';
import * as React from 'react';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CloseIcon from '@mui/icons-material/Close';
import Common from '../../js/Common';
import { TypedUserInstance } from '../singletons/TypedUser';
export var UploadBatchItemViewReact = function (_a) {
    var model = _a.model;
    var _b = __read(React.useState(model.toJSON()), 2), modelJson = _b[0], setModelJson = _b[1];
    useListenTo(model, 'change:finished', function () {
        setModelJson(model.toJSON());
    });
    var id = modelJson.id, finished = modelJson.finished, sentAt = modelJson.sentAt, interrupted = modelJson.interrupted;
    var when = Common.getRelativeDate(sentAt);
    var specificWhen = TypedUserInstance.getMomentDate(sentAt);
    return (React.createElement(Paper, { className: "".concat(finished ? 'is-finished' : '', "  flex flex-row items-stretch flex-nowrap w-full justify-between p-2") },
        React.createElement(Link, { to: "/uploads/".concat(id), style: { display: 'block', padding: '0px' }, className: "w-full shrink no-underline", title: specificWhen },
            React.createElement("div", { className: "upload-details" },
                React.createElement("div", { className: "details-date is-medium-font" },
                    React.createElement("span", { className: "fa fa-upload p-2" }),
                    React.createElement("span", null, when)),
                React.createElement("div", { className: "details-summary mt-2" },
                    React.createElement(UploadSummaryViewReact, { model: model })))),
        React.createElement("div", { className: "upload-actions shrink-0 " }, finished || interrupted ? (React.createElement(React.Fragment, null,
            React.createElement(Button, { className: " h-full w-12", onClick: function () {
                    model.collection.remove(model);
                    user.get('user').get('preferences').savePreferences();
                } },
                React.createElement(CloseIcon, null)))) : (React.createElement(React.Fragment, null,
            React.createElement(Button, { className: " h-full w-12", onClick: function () {
                    model.cancel();
                } },
                React.createElement("span", { className: "fa fa-stop" })))))));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkLWJhdGNoLWl0ZW0udmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdXBsb2FkLWJhdGNoLWl0ZW0vdXBsb2FkLWJhdGNoLWl0ZW0udmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTs7QUFFSixPQUFPLElBQUksTUFBTSw2QkFBNkIsQ0FBQTtBQUM5QyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQTtBQUM5RSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdkMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFBO0FBQ3BFLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sU0FBUyxNQUFNLDJCQUEyQixDQUFBO0FBQ2pELE9BQU8sTUFBTSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHlCQUF5QixDQUFBO0FBRTNELE1BQU0sQ0FBQyxJQUFNLHdCQUF3QixHQUFHLFVBQUMsRUFBeUI7UUFBdkIsS0FBSyxXQUFBO0lBQ3hDLElBQUEsS0FBQSxPQUE0QixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFBLEVBQXpELFNBQVMsUUFBQSxFQUFFLFlBQVksUUFBa0MsQ0FBQTtJQUNoRSxXQUFXLENBQUMsS0FBSyxFQUFFLGlCQUFpQixFQUFFO1FBQ3BDLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtJQUM5QixDQUFDLENBQUMsQ0FBQTtJQUNNLElBQUEsRUFBRSxHQUFvQyxTQUFTLEdBQTdDLEVBQUUsUUFBUSxHQUEwQixTQUFTLFNBQW5DLEVBQUUsTUFBTSxHQUFrQixTQUFTLE9BQTNCLEVBQUUsV0FBVyxHQUFLLFNBQVMsWUFBZCxDQUFjO0lBQ3ZELElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDM0MsSUFBTSxZQUFZLEdBQUcsaUJBQWlCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRTVELE9BQU8sQ0FDTCxvQkFBQyxLQUFLLElBQ0osU0FBUyxFQUFFLFVBQ1QsUUFBUSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUseUVBQ3VDO1FBRXRFLG9CQUFDLElBQUksSUFDSCxFQUFFLEVBQUUsbUJBQVksRUFBRSxDQUFFLEVBQ3BCLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUMzQyxTQUFTLEVBQUMsNEJBQTRCLEVBQ3RDLEtBQUssRUFBRSxZQUFZO1lBRW5CLDZCQUFLLFNBQVMsRUFBQyxnQkFBZ0I7Z0JBQzdCLDZCQUFLLFNBQVMsRUFBQyw2QkFBNkI7b0JBQzFDLDhCQUFNLFNBQVMsRUFBQyxrQkFBa0IsR0FBRztvQkFDckMsa0NBQU8sSUFBSSxDQUFRLENBQ2Y7Z0JBQ04sNkJBQUssU0FBUyxFQUFDLHNCQUFzQjtvQkFDbkMsb0JBQUMsc0JBQXNCLElBQUMsS0FBSyxFQUFFLEtBQUssR0FBSSxDQUNwQyxDQUNGLENBQ0Q7UUFDUCw2QkFBSyxTQUFTLEVBQUMsMEJBQTBCLElBQ3RDLFFBQVEsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQ3pCO1lBQ0Usb0JBQUMsTUFBTSxJQUNMLFNBQVMsRUFBQyxjQUFjLEVBQ3hCLE9BQU8sRUFBRTtvQkFDUCxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtvQkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsZUFBZSxFQUFFLENBQUE7Z0JBQ3ZELENBQUM7Z0JBRUQsb0JBQUMsU0FBUyxPQUFHLENBQ04sQ0FDUixDQUNKLENBQUMsQ0FBQyxDQUFDLENBQ0Y7WUFDRSxvQkFBQyxNQUFNLElBQ0wsU0FBUyxFQUFDLGNBQWMsRUFDeEIsT0FBTyxFQUFFO29CQUNQLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtnQkFDaEIsQ0FBQztnQkFFRCw4QkFBTSxTQUFTLEVBQUMsWUFBWSxHQUFHLENBQ3hCLENBQ1IsQ0FDSixDQUNHLENBQ0EsQ0FDVCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCB1c2VyIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCB7IFVwbG9hZFN1bW1hcnlWaWV3UmVhY3QgfSBmcm9tICcuLi91cGxvYWQtc3VtbWFyeS91cGxvYWQtc3VtbWFyeS52aWV3J1xuaW1wb3J0IHsgTGluayB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgQ2xvc2VJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2xvc2UnXG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uLy4uL2pzL0NvbW1vbidcbmltcG9ydCB7IFR5cGVkVXNlckluc3RhbmNlIH0gZnJvbSAnLi4vc2luZ2xldG9ucy9UeXBlZFVzZXInXG5cbmV4cG9ydCBjb25zdCBVcGxvYWRCYXRjaEl0ZW1WaWV3UmVhY3QgPSAoeyBtb2RlbCB9OiB7IG1vZGVsOiBhbnkgfSkgPT4ge1xuICBjb25zdCBbbW9kZWxKc29uLCBzZXRNb2RlbEpzb25dID0gUmVhY3QudXNlU3RhdGUobW9kZWwudG9KU09OKCkpXG4gIHVzZUxpc3RlblRvKG1vZGVsLCAnY2hhbmdlOmZpbmlzaGVkJywgKCkgPT4ge1xuICAgIHNldE1vZGVsSnNvbihtb2RlbC50b0pTT04oKSlcbiAgfSlcbiAgY29uc3QgeyBpZCwgZmluaXNoZWQsIHNlbnRBdCwgaW50ZXJydXB0ZWQgfSA9IG1vZGVsSnNvblxuICBjb25zdCB3aGVuID0gQ29tbW9uLmdldFJlbGF0aXZlRGF0ZShzZW50QXQpXG4gIGNvbnN0IHNwZWNpZmljV2hlbiA9IFR5cGVkVXNlckluc3RhbmNlLmdldE1vbWVudERhdGUoc2VudEF0KVxuXG4gIHJldHVybiAoXG4gICAgPFBhcGVyXG4gICAgICBjbGFzc05hbWU9e2Ake1xuICAgICAgICBmaW5pc2hlZCA/ICdpcy1maW5pc2hlZCcgOiAnJ1xuICAgICAgfSAgZmxleCBmbGV4LXJvdyBpdGVtcy1zdHJldGNoIGZsZXgtbm93cmFwIHctZnVsbCBqdXN0aWZ5LWJldHdlZW4gcC0yYH1cbiAgICA+XG4gICAgICA8TGlua1xuICAgICAgICB0bz17YC91cGxvYWRzLyR7aWR9YH1cbiAgICAgICAgc3R5bGU9e3sgZGlzcGxheTogJ2Jsb2NrJywgcGFkZGluZzogJzBweCcgfX1cbiAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHNocmluayBuby11bmRlcmxpbmVcIlxuICAgICAgICB0aXRsZT17c3BlY2lmaWNXaGVufVxuICAgICAgPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInVwbG9hZC1kZXRhaWxzXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkZXRhaWxzLWRhdGUgaXMtbWVkaXVtLWZvbnRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZhIGZhLXVwbG9hZCBwLTJcIiAvPlxuICAgICAgICAgICAgPHNwYW4+e3doZW59PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZGV0YWlscy1zdW1tYXJ5IG10LTJcIj5cbiAgICAgICAgICAgIDxVcGxvYWRTdW1tYXJ5Vmlld1JlYWN0IG1vZGVsPXttb2RlbH0gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L0xpbms+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInVwbG9hZC1hY3Rpb25zIHNocmluay0wIFwiPlxuICAgICAgICB7ZmluaXNoZWQgfHwgaW50ZXJydXB0ZWQgPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiIGgtZnVsbCB3LTEyXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIG1vZGVsLmNvbGxlY3Rpb24ucmVtb3ZlKG1vZGVsKVxuICAgICAgICAgICAgICAgIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLnNhdmVQcmVmZXJlbmNlcygpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxDbG9zZUljb24gLz5cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDw+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIiBoLWZ1bGwgdy0xMlwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBtb2RlbC5jYW5jZWwoKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmYSBmYS1zdG9wXCIgLz5cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvPlxuICAgICAgICApfVxuICAgICAgPC9kaXY+XG4gICAgPC9QYXBlcj5cbiAgKVxufVxuIl19