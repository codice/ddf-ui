import { __read } from "tslib";
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
import { hot } from 'react-hot-loader';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { useHistory } from 'react-router-dom';
var modelToJSON = function (model) {
    var modelJSON = model.toJSON();
    modelJSON.file = {
        name: modelJSON.file.name,
        size: (modelJSON.file.size / 1000000).toFixed(2) + 'MB, ',
        type: modelJSON.file.type,
    };
    return modelJSON;
};
export var UploadItemViewReact = function (_a) {
    var model = _a.model;
    var history = useHistory();
    var _b = __read(React.useState(modelToJSON(model)), 2), modelJson = _b[0], setModelJson = _b[1];
    var _c = __read(React.useState(false), 2), cancel = _c[0], setCancel = _c[1];
    useListenTo(model, 'change:percentage change:sending change:success change:error change:validating change:issues', function () {
        setModelJson(modelToJSON(model));
    });
    React.useEffect(function () {
        if (cancel && model) {
            model.cancel();
        }
    }, [cancel, model]);
    var isSending = modelJson.sending;
    var hasError = modelJson.error;
    var hasSuccess = modelJson.success;
    var hasIssues = modelJson.issues;
    var isValidating = modelJson.validating;
    return (React.createElement("div", { className: "flex flex-row items-center flex-nowrap w-full p-4 border-gray-600/25 border", onClick: function () {
            if (model.get('success') && !model.hasChildren()) {
                history.push({
                    pathname: "/metacards/".concat(model.get('id')),
                });
            }
        } },
        React.createElement("div", { className: "w-full shrink" },
            React.createElement("div", { className: "text-center" },
                React.createElement("div", null,
                    React.createElement("span", { className: "top-filename" }, modelJson.file.name)),
                React.createElement("div", null,
                    React.createElement("div", null,
                        React.createElement("span", { className: "bottom-filesize" }, modelJson.file.size),
                        React.createElement("span", { className: "bottom-filetype" }, modelJson.file.type)),
                    React.createElement("div", null, Math.floor(modelJson.percentage) + '%'))),
            !hasSuccess && !hasError && isSending ? (React.createElement(LinearProgress, { className: "h-2 w-full", value: modelJson.percentage, variant: "determinate" })) : null,
            hasSuccess ? (React.createElement("div", { className: "info-success text-center" },
                React.createElement("div", { className: "success-message" },
                    hasIssues ? (React.createElement("span", null, "Uploaded, but quality issues were found ")) : (React.createElement(React.Fragment, null)),
                    isValidating ? (React.createElement("span", { className: "success-validate fa fa-refresh fa-spin is-critical-animation" })) : (React.createElement(React.Fragment, null)),
                    hasIssues ? React.createElement("span", { className: "message-text" }) : React.createElement(React.Fragment, null)))) : null,
            hasError ? (React.createElement("div", { className: "info-error text-center" },
                React.createElement("div", { className: "error-message" }, modelJson.message))) : null),
        React.createElement("div", { className: "upload-actions shrink-0" },
            !isSending ? (React.createElement(Button, { onClick: function () {
                    setCancel(true);
                } }, "Remove")) : null,
            hasSuccess ? (React.createElement(Button, { onClick: function () {
                    history.push({
                        pathname: "/metacards/".concat(model.get('id')),
                    });
                } }, "Success")) : (React.createElement(React.Fragment, null)),
            hasError ? (React.createElement(React.Fragment, null,
                React.createElement("div", null, "Failures"))) : (React.createElement(React.Fragment, null)))));
};
export default hot(module)(UploadItemViewReact);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkLWl0ZW0udmlldy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdXBsb2FkLWl0ZW0vdXBsb2FkLWl0ZW0udmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFBO0FBQ3BFLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLGNBQWMsTUFBTSw4QkFBOEIsQ0FBQTtBQUN6RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFJN0MsSUFBTSxXQUFXLEdBQUcsVUFBQyxLQUFVO0lBQzdCLElBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQTtJQUNoQyxTQUFTLENBQUMsSUFBSSxHQUFHO1FBQ2YsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSTtRQUN6QixJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTTtRQUN6RCxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJO0tBQzFCLENBQUE7SUFDRCxPQUFPLFNBQVMsQ0FBQTtBQUNsQixDQUFDLENBQUE7QUFDRCxNQUFNLENBQUMsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLEVBQWtDO1FBQWhDLEtBQUssV0FBQTtJQUN6QyxJQUFNLE9BQU8sR0FBRyxVQUFVLEVBQUUsQ0FBQTtJQUN0QixJQUFBLEtBQUEsT0FBNEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsS0FBSyxD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U0FBUyxFQUFDLGVBQWUsSUFBRSxTQUFTLENBQUMsT0FBTyxDQUFPLENBQ3BELENBQ1AsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNKO1FBRU4sNkJBQUssU0FBUyxFQUFDLHlCQUF5QjtZQUNyQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FDWixvQkFBQyxNQUFNLElBQ0wsT0FBTyxFQUFFO29CQUNQLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDakIsQ0FBQyxhQUdNLENBQ1YsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUVQLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FDWixvQkFBQyxNQUFNLElBQ0wsT0FBTyxFQUFFO29CQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUM7d0JBQ1gsUUFBUSxFQUFFLHFCQUFjLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUU7cUJBQzFDLENBQUMsQ0FBQTtnQkFDSixDQUFDLGNBR00sQ0FDVixDQUFDLENBQUMsQ0FBQyxDQUNGLHlDQUFLLENBQ047WUFFQSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQ1Y7Z0JBQ0UsNENBQW1CLENBQ2xCLENBQ0osQ0FBQyxDQUFDLENBQUMsQ0FDRix5Q0FBSyxDQUNOLENBQ0csQ0FDRixDQUNQLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyB1c2VMaXN0ZW5UbyB9IGZyb20gJy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCB7IHVzZUhpc3RvcnkgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xudHlwZSBVcGxvYWRJdGVtVmlld1JlYWN0VHlwZSA9IHtcbiAgbW9kZWw6IGFueVxufVxuY29uc3QgbW9kZWxUb0pTT04gPSAobW9kZWw6IGFueSkgPT4ge1xuICBjb25zdCBtb2RlbEpTT04gPSBtb2RlbC50b0pTT04oKVxuICBtb2RlbEpTT04uZmlsZSA9IHtcbiAgICBuYW1lOiBtb2RlbEpTT04uZmlsZS5uYW1lLFxuICAgIHNpemU6IChtb2RlbEpTT04uZmlsZS5zaXplIC8gMTAwMDAwMCkudG9GaXhlZCgyKSArICdNQiwgJyxcbiAgICB0eXBlOiBtb2RlbEpTT04uZmlsZS50eXBlLFxuICB9XG4gIHJldHVybiBtb2RlbEpTT05cbn1cbmV4cG9ydCBjb25zdCBVcGxvYWRJdGVtVmlld1JlYWN0ID0gKHsgbW9kZWwgfTogVXBsb2FkSXRlbVZpZXdSZWFjdFR5cGUpID0+IHtcbiAgY29uc3QgaGlzdG9yeSA9IHVzZUhpc3RvcnkoKVxuICBjb25zdCBbbW9kZWxKc29uLCBzZXRNb2RlbEpzb25dID0gUmVhY3QudXNlU3RhdGUobW9kZWxUb0pTT04obW9kZWwpKVxuICBjb25zdCBbY2FuY2VsLCBzZXRDYW5jZWxdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIHVzZUxpc3RlblRvKFxuICAgIG1vZGVsLFxuICAgICdjaGFuZ2U6cGVyY2VudGFnZSBjaGFuZ2U6c2VuZGluZyBjaGFuZ2U6c3VjY2VzcyBjaGFuZ2U6ZXJyb3IgY2hhbmdlOnZhbGlkYXRpbmcgY2hhbmdlOmlzc3VlcycsXG4gICAgKCkgPT4ge1xuICAgICAgc2V0TW9kZWxKc29uKG1vZGVsVG9KU09OKG1vZGVsKSlcbiAgICB9XG4gIClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoY2FuY2VsICYmIG1vZGVsKSB7XG4gICAgICBtb2RlbC5jYW5jZWwoKVxuICAgIH1cbiAgfSwgW2NhbmNlbCwgbW9kZWxdKVxuICBjb25zdCBpc1NlbmRpbmcgPSBtb2RlbEpzb24uc2VuZGluZ1xuICBjb25zdCBoYXNFcnJvciA9IG1vZGVsSnNvbi5lcnJvclxuICBjb25zdCBoYXNTdWNjZXNzID0gbW9kZWxKc29uLnN1Y2Nlc3NcbiAgY29uc3QgaGFzSXNzdWVzID0gbW9kZWxKc29uLmlzc3Vlc1xuICBjb25zdCBpc1ZhbGlkYXRpbmcgPSBtb2RlbEpzb24udmFsaWRhdGluZ1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YGZsZXggZmxleC1yb3cgaXRlbXMtY2VudGVyIGZsZXgtbm93cmFwIHctZnVsbCBwLTQgYm9yZGVyLWdyYXktNjAwLzI1IGJvcmRlcmB9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIGlmIChtb2RlbC5nZXQoJ3N1Y2Nlc3MnKSAmJiAhbW9kZWwuaGFzQ2hpbGRyZW4oKSkge1xuICAgICAgICAgIGhpc3RvcnkucHVzaCh7XG4gICAgICAgICAgICBwYXRobmFtZTogYC9tZXRhY2FyZHMvJHttb2RlbC5nZXQoJ2lkJyl9YCxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9fVxuICAgID5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIHNocmlua1wiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRvcC1maWxlbmFtZVwiPnttb2RlbEpzb24uZmlsZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYm90dG9tLWZpbGVzaXplXCI+e21vZGVsSnNvbi5maWxlLnNpemV9PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJib3R0b20tZmlsZXR5cGVcIj57bW9kZWxKc29uLmZpbGUudHlwZX08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+e01hdGguZmxvb3IobW9kZWxKc29uLnBlcmNlbnRhZ2UpICsgJyUnfTwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgeyFoYXNTdWNjZXNzICYmICFoYXNFcnJvciAmJiBpc1NlbmRpbmcgPyAoXG4gICAgICAgICAgPExpbmVhclByb2dyZXNzXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJoLTIgdy1mdWxsXCJcbiAgICAgICAgICAgIHZhbHVlPXttb2RlbEpzb24ucGVyY2VudGFnZX1cbiAgICAgICAgICAgIHZhcmlhbnQ9XCJkZXRlcm1pbmF0ZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IG51bGx9XG5cbiAgICAgICAge2hhc1N1Y2Nlc3MgPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmZvLXN1Y2Nlc3MgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3VjY2Vzcy1tZXNzYWdlXCI+XG4gICAgICAgICAgICAgIHtoYXNJc3N1ZXMgPyAoXG4gICAgICAgICAgICAgICAgPHNwYW4+VXBsb2FkZWQsIGJ1dCBxdWFsaXR5IGlzc3VlcyB3ZXJlIGZvdW5kIDwvc3Bhbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8PjwvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB7aXNWYWxpZGF0aW5nID8gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInN1Y2Nlc3MtdmFsaWRhdGUgZmEgZmEtcmVmcmVzaCBmYS1zcGluIGlzLWNyaXRpY2FsLWFuaW1hdGlvblwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8PjwvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICB7aGFzSXNzdWVzID8gPHNwYW4gY2xhc3NOYW1lPVwibWVzc2FnZS10ZXh0XCI+PC9zcGFuPiA6IDw+PC8+fVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7aGFzRXJyb3IgPyAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmZvLWVycm9yIHRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVycm9yLW1lc3NhZ2VcIj57bW9kZWxKc29uLm1lc3NhZ2V9PC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidXBsb2FkLWFjdGlvbnMgc2hyaW5rLTBcIj5cbiAgICAgICAgeyFpc1NlbmRpbmcgPyAoXG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXRDYW5jZWwodHJ1ZSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgUmVtb3ZlXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHtoYXNTdWNjZXNzID8gKFxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgaGlzdG9yeS5wdXNoKHtcbiAgICAgICAgICAgICAgICBwYXRobmFtZTogYC9tZXRhY2FyZHMvJHttb2RlbC5nZXQoJ2lkJyl9YCxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgU3VjY2Vzc1xuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDw+PC8+XG4gICAgICAgICl9XG5cbiAgICAgICAge2hhc0Vycm9yID8gKFxuICAgICAgICAgIDw+XG4gICAgICAgICAgICA8ZGl2PkZhaWx1cmVzPC9kaXY+XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPD48Lz5cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShVcGxvYWRJdGVtVmlld1JlYWN0KVxuIl19