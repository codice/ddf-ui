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
import MetacardArchive from '../metacard-archive';
import { MetacardInteraction } from './metacard-interactions';
import { useDialog } from '../../component/dialog';
import { Divider } from './metacard-interactions';
import { TypedUserInstance } from '../../component/singletons/TypedUser';
export var ArchiveAction = function (props) {
    if (!props.model || props.model.length <= 0) {
        return null;
    }
    var isDeleteAction = props.model.some(function (result) {
        return !result.isDeleted();
    });
    var canPerformOnAll = props.model.every(function (result) {
        return (TypedUserInstance.isAdmin(result) &&
            !result.isRemote() &&
            result.isDeleted() !== isDeleteAction);
    });
    if (!canPerformOnAll) {
        return null;
    }
    var dialogContext = useDialog();
    return (_jsxs(_Fragment, { children: [_jsx(Divider, {}), _jsx(MetacardInteraction, { onClick: function () {
                    props.onClose();
                    if (props.model) {
                        dialogContext.setProps({
                            children: _jsx(MetacardArchive, { results: props.model }),
                            open: true,
                        });
                    }
                }, icon: isDeleteAction ? 'fa fa-trash' : 'fa fa-undo', text: isDeleteAction ? 'Delete' : 'Restore', help: isDeleteAction ? 'Move item(s) to trash' : 'Move item(s) from trash' })] }));
};
export default ArchiveAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJjaGl2ZS1pbnRlcmFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbWV0YWNhcmQtaW50ZXJhY3Rpb25zL2FyY2hpdmUtaW50ZXJhY3Rpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBRUosT0FBTyxlQUFlLE1BQU0scUJBQXFCLENBQUE7QUFFakQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFFN0QsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2xELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUV4RSxNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUcsVUFBQyxLQUErQjtJQUMzRCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUM1QyxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFFRCxJQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU07UUFDN0MsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQTtJQUM1QixDQUFDLENBQUMsQ0FBQTtJQUVGLElBQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTTtRQUMvQyxPQUFPLENBQ0wsaUJBQWlCLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUNqQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDbEIsTUFBTSxDQUFDLFNBQVMsRUFBRSxLQUFLLGNBQWMsQ0FDdEMsQ0FBQTtJQUNILENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JCLE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztJQUVELElBQU0sYUFBYSxHQUFHLFNBQVMsRUFBRSxDQUFBO0lBQ2pDLE9BQU8sQ0FDTCw4QkFDRSxLQUFDLE9BQU8sS0FBRyxFQUNYLEtBQUMsbUJBQW1CLElBQ2xCLE9BQU8sRUFBRTtvQkFDUCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7b0JBQ2YsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQ2hCLGFBQWEsQ0FBQyxRQUFRLENBQUM7NEJBQ3JCLFFBQVEsRUFBRSxLQUFDLGVBQWUsSUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssR0FBSTs0QkFDbkQsSUFBSSxFQUFFLElBQUk7eUJBQ1gsQ0FBQyxDQUFBO29CQUNKLENBQUM7Z0JBQ0gsQ0FBQyxFQUNELElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUNuRCxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFDM0MsSUFBSSxFQUNGLGNBQWMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixHQUV0RSxJQUNELENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsYUFBYSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCBNZXRhY2FyZEFyY2hpdmUgZnJvbSAnLi4vbWV0YWNhcmQtYXJjaGl2ZSdcbmltcG9ydCB7IE1ldGFjYXJkSW50ZXJhY3Rpb25Qcm9wcyB9IGZyb20gJy4nXG5pbXBvcnQgeyBNZXRhY2FyZEludGVyYWN0aW9uIH0gZnJvbSAnLi9tZXRhY2FyZC1pbnRlcmFjdGlvbnMnXG5cbmltcG9ydCB7IHVzZURpYWxvZyB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9kaWFsb2cnXG5pbXBvcnQgeyBEaXZpZGVyIH0gZnJvbSAnLi9tZXRhY2FyZC1pbnRlcmFjdGlvbnMnXG5pbXBvcnQgeyBUeXBlZFVzZXJJbnN0YW5jZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL1R5cGVkVXNlcidcblxuZXhwb3J0IGNvbnN0IEFyY2hpdmVBY3Rpb24gPSAocHJvcHM6IE1ldGFjYXJkSW50ZXJhY3Rpb25Qcm9wcykgPT4ge1xuICBpZiAoIXByb3BzLm1vZGVsIHx8IHByb3BzLm1vZGVsLmxlbmd0aCA8PSAwKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGlzRGVsZXRlQWN0aW9uID0gcHJvcHMubW9kZWwuc29tZSgocmVzdWx0KSA9PiB7XG4gICAgcmV0dXJuICFyZXN1bHQuaXNEZWxldGVkKClcbiAgfSlcblxuICBjb25zdCBjYW5QZXJmb3JtT25BbGwgPSBwcm9wcy5tb2RlbC5ldmVyeSgocmVzdWx0KSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIFR5cGVkVXNlckluc3RhbmNlLmlzQWRtaW4ocmVzdWx0KSAmJlxuICAgICAgIXJlc3VsdC5pc1JlbW90ZSgpICYmXG4gICAgICByZXN1bHQuaXNEZWxldGVkKCkgIT09IGlzRGVsZXRlQWN0aW9uXG4gICAgKVxuICB9KVxuXG4gIGlmICghY2FuUGVyZm9ybU9uQWxsKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGRpYWxvZ0NvbnRleHQgPSB1c2VEaWFsb2coKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8RGl2aWRlciAvPlxuICAgICAgPE1ldGFjYXJkSW50ZXJhY3Rpb25cbiAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgIHByb3BzLm9uQ2xvc2UoKVxuICAgICAgICAgIGlmIChwcm9wcy5tb2RlbCkge1xuICAgICAgICAgICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7XG4gICAgICAgICAgICAgIGNoaWxkcmVuOiA8TWV0YWNhcmRBcmNoaXZlIHJlc3VsdHM9e3Byb3BzLm1vZGVsfSAvPixcbiAgICAgICAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9fVxuICAgICAgICBpY29uPXtpc0RlbGV0ZUFjdGlvbiA/ICdmYSBmYS10cmFzaCcgOiAnZmEgZmEtdW5kbyd9XG4gICAgICAgIHRleHQ9e2lzRGVsZXRlQWN0aW9uID8gJ0RlbGV0ZScgOiAnUmVzdG9yZSd9XG4gICAgICAgIGhlbHA9e1xuICAgICAgICAgIGlzRGVsZXRlQWN0aW9uID8gJ01vdmUgaXRlbShzKSB0byB0cmFzaCcgOiAnTW92ZSBpdGVtKHMpIGZyb20gdHJhc2gnXG4gICAgICAgIH1cbiAgICAgIC8+XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgQXJjaGl2ZUFjdGlvblxuIl19