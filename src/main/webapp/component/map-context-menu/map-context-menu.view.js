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
import * as React from 'react';
import { useMenuState } from '../menu-state/menu-state';
import Popover from '@mui/material/Popover';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import CopyCoordinates from '../../react-component/copy-coordinates';
var MapContextDropdown = function (_a) {
    var mapModel = _a.mapModel;
    var _b = __read(React.useState(mapModel.toJSON().coordinateValues), 2), coordinates = _b[0], setCoordinates = _b[1];
    var menuState = useMenuState();
    var _c = mapModel.toJSON(), mouseX = _c.mouseX, mouseY = _c.mouseY, mouseLat = _c.mouseLat;
    useListenTo(mapModel, 'change:open', function () {
        if (mapModel.get('open')) {
            menuState.handleClick();
        }
        else {
            menuState.handleClose();
        }
    });
    useListenTo(mapModel, 'change:coordinateValues', function () {
        setCoordinates(mapModel.toJSON().coordinateValues);
    });
    React.useEffect(function () {
        if (menuState.open && mouseLat === undefined) {
            menuState.handleClose();
        }
        if (!menuState.open) {
            mapModel.set('open', false);
        }
    }, [menuState.open]);
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "absolute", ref: menuState.anchorRef, style: {
                    left: mouseX,
                    top: mouseY,
                } }), _jsx(Popover, __assign({}, menuState.MuiPopoverProps, { children: _jsx(Paper, { elevation: Elevations.overlays, children: _jsx(CopyCoordinates, { coordinateValues: coordinates, closeParent: function () {
                            menuState.handleClose();
                        } }, JSON.stringify(coordinates)) }) }))] }));
};
export default MapContextDropdown;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLWNvbnRleHQtbWVudS52aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9tYXAtY29udGV4dC1tZW51L21hcC1jb250ZXh0LW1lbnUudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBRUosT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ3ZELE9BQU8sT0FBTyxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDcEUsT0FBTyxlQUFlLE1BQU0sd0NBQXdDLENBQUE7QUFFcEUsSUFBTSxrQkFBa0IsR0FBRyxVQUFDLEVBQStCO1FBQTdCLFFBQVEsY0FBQTtJQUM5QixJQUFBLEtBQUEsT0FBZ0MsS0FBSyxDQUFDLFFBQVEsQ0FDbEQsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLGdCQUFnQixDQUNuQyxJQUFBLEVBRk0sV0FBVyxRQUFBLEVBQUUsY0FBYyxRQUVqQyxDQUFBO0lBQ0QsSUFBTSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUE7SUFDMUIsSUFBQSxLQUErQixRQUFRLENBQUMsTUFBTSxFQUFFLEVBQTlDLE1BQU0sWUFBQSxFQUFFLE1BQU0sWUFBQSxFQUFFLFFBQVEsY0FBc0IsQ0FBQTtJQUV0RCxXQUFXLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRTtRQUNuQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUN6QixTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDekIsQ0FBQzthQUFNLENBQUM7WUFDTixTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDekIsQ0FBQztJQUNILENBQUMsQ0FBQyxDQUFBO0lBQ0YsV0FBVyxDQUFDLFFBQVEsRUFBRSx5QkFBeUIsRUFBRTtRQUMvQyxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLGdCQUFnQixDQUFDLENBQUE7SUFDcEQsQ0FBQyxDQUFDLENBQUE7SUFDRixLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsSUFBSSxTQUFTLENBQUMsSUFBSSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUUsQ0FBQztZQUM3QyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7UUFDekIsQ0FBQztRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDcEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDN0IsQ0FBQztJQUNILENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0lBQ3BCLE9BQU8sQ0FDTCw4QkFDRSxjQUNFLFNBQVMsRUFBQyxVQUFVLEVBQ3BCLEdBQUcsRUFBRSxTQUFTLENBQUMsU0FBUyxFQUN4QixLQUFLLEVBQUU7b0JBQ0wsSUFBSSxFQUFFLE1BQU07b0JBQ1osR0FBRyxFQUFFLE1BQU07aUJBQ1osR0FDSSxFQUNQLEtBQUMsT0FBTyxlQUFLLFNBQVMsQ0FBQyxlQUFlLGNBQ3BDLEtBQUMsS0FBSyxJQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsUUFBUSxZQUNuQyxLQUFDLGVBQWUsSUFFZCxnQkFBZ0IsRUFBRSxXQUFXLEVBQzdCLFdBQVcsRUFBRTs0QkFDWCxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7d0JBQ3pCLENBQUMsSUFKSSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUtoQyxHQUNJLElBQ0EsSUFDVCxDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLGtCQUFrQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuXG5pbXBvcnQgeyB1c2VNZW51U3RhdGUgfSBmcm9tICcuLi9tZW51LXN0YXRlL21lbnUtc3RhdGUnXG5pbXBvcnQgUG9wb3ZlciBmcm9tICdAbXVpL21hdGVyaWFsL1BvcG92ZXInXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcbmltcG9ydCB7IHVzZUxpc3RlblRvIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgQ29weUNvb3JkaW5hdGVzIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9jb3B5LWNvb3JkaW5hdGVzJ1xuXG5jb25zdCBNYXBDb250ZXh0RHJvcGRvd24gPSAoeyBtYXBNb2RlbCB9OiB7IG1hcE1vZGVsOiBhbnkgfSkgPT4ge1xuICBjb25zdCBbY29vcmRpbmF0ZXMsIHNldENvb3JkaW5hdGVzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIG1hcE1vZGVsLnRvSlNPTigpLmNvb3JkaW5hdGVWYWx1ZXNcbiAgKVxuICBjb25zdCBtZW51U3RhdGUgPSB1c2VNZW51U3RhdGUoKVxuICBjb25zdCB7IG1vdXNlWCwgbW91c2VZLCBtb3VzZUxhdCB9ID0gbWFwTW9kZWwudG9KU09OKClcblxuICB1c2VMaXN0ZW5UbyhtYXBNb2RlbCwgJ2NoYW5nZTpvcGVuJywgKCkgPT4ge1xuICAgIGlmIChtYXBNb2RlbC5nZXQoJ29wZW4nKSkge1xuICAgICAgbWVudVN0YXRlLmhhbmRsZUNsaWNrKClcbiAgICB9IGVsc2Uge1xuICAgICAgbWVudVN0YXRlLmhhbmRsZUNsb3NlKClcbiAgICB9XG4gIH0pXG4gIHVzZUxpc3RlblRvKG1hcE1vZGVsLCAnY2hhbmdlOmNvb3JkaW5hdGVWYWx1ZXMnLCAoKSA9PiB7XG4gICAgc2V0Q29vcmRpbmF0ZXMobWFwTW9kZWwudG9KU09OKCkuY29vcmRpbmF0ZVZhbHVlcylcbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAobWVudVN0YXRlLm9wZW4gJiYgbW91c2VMYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbWVudVN0YXRlLmhhbmRsZUNsb3NlKClcbiAgICB9XG4gICAgaWYgKCFtZW51U3RhdGUub3Blbikge1xuICAgICAgbWFwTW9kZWwuc2V0KCdvcGVuJywgZmFsc2UpXG4gICAgfVxuICB9LCBbbWVudVN0YXRlLm9wZW5dKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlXCJcbiAgICAgICAgcmVmPXttZW51U3RhdGUuYW5jaG9yUmVmfVxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIGxlZnQ6IG1vdXNlWCxcbiAgICAgICAgICB0b3A6IG1vdXNlWSxcbiAgICAgICAgfX1cbiAgICAgID48L2Rpdj5cbiAgICAgIDxQb3BvdmVyIHsuLi5tZW51U3RhdGUuTXVpUG9wb3ZlclByb3BzfT5cbiAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c30+XG4gICAgICAgICAgPENvcHlDb29yZGluYXRlc1xuICAgICAgICAgICAga2V5PXtKU09OLnN0cmluZ2lmeShjb29yZGluYXRlcyl9XG4gICAgICAgICAgICBjb29yZGluYXRlVmFsdWVzPXtjb29yZGluYXRlc31cbiAgICAgICAgICAgIGNsb3NlUGFyZW50PXsoKSA9PiB7XG4gICAgICAgICAgICAgIG1lbnVTdGF0ZS5oYW5kbGVDbG9zZSgpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvUGFwZXI+XG4gICAgICA8L1BvcG92ZXI+XG4gICAgPC8+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgTWFwQ29udGV4dERyb3Bkb3duXG4iXX0=