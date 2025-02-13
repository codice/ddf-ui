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
import * as React from 'react';
import MetacardArchive from '../metacard-archive';
import { MetacardInteraction } from './metacard-interactions';
import { hot } from 'react-hot-loader';
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
    return (React.createElement(React.Fragment, null,
        React.createElement(Divider, null),
        React.createElement(MetacardInteraction, { onClick: function () {
                props.onClose();
                if (props.model) {
                    dialogContext.setProps({
                        children: React.createElement(MetacardArchive, { results: props.model }),
                        open: true,
                    });
                }
            }, icon: isDeleteAction ? 'fa fa-trash' : 'fa fa-undo', text: isDeleteAction ? 'Delete' : 'Restore', help: isDeleteAction ? 'Move item(s) to trash' : 'Move item(s) from trash' })));
};
export default hot(module)(ArchiveAction);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJjaGl2ZS1pbnRlcmFjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbWV0YWNhcmQtaW50ZXJhY3Rpb25zL2FyY2hpdmUtaW50ZXJhY3Rpb24udHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLGVBQWUsTUFBTSxxQkFBcUIsQ0FBQTtBQUVqRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUM3RCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ2xELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUV4RSxNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUcsVUFBQyxLQUErQjtJQUMzRCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7UUFDM0MsT0FBTyxJQUFJLENBQUE7S0FDWjtJQUVELElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQUMsTUFBTTtRQUM3QyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFBO0lBQzVCLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsVUFBQyxNQUFNO1FBQy9DLE9BQU8sQ0FDTCxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ2pDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNsQixNQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssY0FBYyxDQUN0QyxDQUFBO0lBQ0gsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsZUFBZSxFQUFFO1FBQ3BCLE9BQU8sSUFBSSxDQUFBO0tBQ1o7SUFFRCxJQUFNLGFBQWEsR0FBRyxTQUFTLEVBQUUsQ0FBQTtJQUNqQyxPQUFPLENBQ0w7UUFDRSxvQkFBQyxPQUFPLE9BQUc7UUFDWCxvQkFBQyxtQkFBbUIsSUFDbEIsT0FBTyxFQUFFO2dCQUNQLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQTtnQkFDZixJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7b0JBQ2YsYUFBYSxDQUFDLFFBQVEsQ0FBQzt3QkFDckIsUUFBUSxFQUFFLG9CQUFDLGVBQWUsSUFBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLEtBQUssR0FBSTt3QkFDbkQsSUFBSSxFQUFFLElBQUk7cUJBQ1gsQ0FBQyxDQUFBO2lCQUNIO1lBQ0gsQ0FBQyxFQUNELElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsWUFBWSxFQUNuRCxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFDM0MsSUFBSSxFQUNGLGNBQWMsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLHlCQUF5QixHQUV0RSxDQUNELENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBNZXRhY2FyZEFyY2hpdmUgZnJvbSAnLi4vbWV0YWNhcmQtYXJjaGl2ZSdcbmltcG9ydCB7IE1ldGFjYXJkSW50ZXJhY3Rpb25Qcm9wcyB9IGZyb20gJy4nXG5pbXBvcnQgeyBNZXRhY2FyZEludGVyYWN0aW9uIH0gZnJvbSAnLi9tZXRhY2FyZC1pbnRlcmFjdGlvbnMnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgdXNlRGlhbG9nIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2RpYWxvZydcbmltcG9ydCB7IERpdmlkZXIgfSBmcm9tICcuL21ldGFjYXJkLWludGVyYWN0aW9ucydcbmltcG9ydCB7IFR5cGVkVXNlckluc3RhbmNlIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvVHlwZWRVc2VyJ1xuXG5leHBvcnQgY29uc3QgQXJjaGl2ZUFjdGlvbiA9IChwcm9wczogTWV0YWNhcmRJbnRlcmFjdGlvblByb3BzKSA9PiB7XG4gIGlmICghcHJvcHMubW9kZWwgfHwgcHJvcHMubW9kZWwubGVuZ3RoIDw9IDApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgaXNEZWxldGVBY3Rpb24gPSBwcm9wcy5tb2RlbC5zb21lKChyZXN1bHQpID0+IHtcbiAgICByZXR1cm4gIXJlc3VsdC5pc0RlbGV0ZWQoKVxuICB9KVxuXG4gIGNvbnN0IGNhblBlcmZvcm1PbkFsbCA9IHByb3BzLm1vZGVsLmV2ZXJ5KChyZXN1bHQpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgVHlwZWRVc2VySW5zdGFuY2UuaXNBZG1pbihyZXN1bHQpICYmXG4gICAgICAhcmVzdWx0LmlzUmVtb3RlKCkgJiZcbiAgICAgIHJlc3VsdC5pc0RlbGV0ZWQoKSAhPT0gaXNEZWxldGVBY3Rpb25cbiAgICApXG4gIH0pXG5cbiAgaWYgKCFjYW5QZXJmb3JtT25BbGwpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgZGlhbG9nQ29udGV4dCA9IHVzZURpYWxvZygpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxEaXZpZGVyIC8+XG4gICAgICA8TWV0YWNhcmRJbnRlcmFjdGlvblxuICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgcHJvcHMub25DbG9zZSgpXG4gICAgICAgICAgaWYgKHByb3BzLm1vZGVsKSB7XG4gICAgICAgICAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgICAgICAgICAgY2hpbGRyZW46IDxNZXRhY2FyZEFyY2hpdmUgcmVzdWx0cz17cHJvcHMubW9kZWx9IC8+LFxuICAgICAgICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH19XG4gICAgICAgIGljb249e2lzRGVsZXRlQWN0aW9uID8gJ2ZhIGZhLXRyYXNoJyA6ICdmYSBmYS11bmRvJ31cbiAgICAgICAgdGV4dD17aXNEZWxldGVBY3Rpb24gPyAnRGVsZXRlJyA6ICdSZXN0b3JlJ31cbiAgICAgICAgaGVscD17XG4gICAgICAgICAgaXNEZWxldGVBY3Rpb24gPyAnTW92ZSBpdGVtKHMpIHRvIHRyYXNoJyA6ICdNb3ZlIGl0ZW0ocykgZnJvbSB0cmFzaCdcbiAgICAgICAgfVxuICAgICAgLz5cbiAgICA8Lz5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShBcmNoaXZlQWN0aW9uKVxuIl19