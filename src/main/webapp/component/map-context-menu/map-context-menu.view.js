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
import { __assign, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
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
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "absolute", ref: menuState.anchorRef, style: {
                left: mouseX,
                top: mouseY,
            } }),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps),
            React.createElement(Paper, { elevation: Elevations.overlays },
                React.createElement(CopyCoordinates, { key: JSON.stringify(coordinates), coordinateValues: coordinates, closeParent: function () {
                        menuState.handleClose();
                    } })))));
};
export default hot(module)(MapContextDropdown);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLWNvbnRleHQtbWVudS52aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9tYXAtY29udGV4dC1tZW51L21hcC1jb250ZXh0LW1lbnUudmlldy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTs7QUFFSixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ3ZELE9BQU8sT0FBTyxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUMzQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDcEUsT0FBTyxlQUFlLE1BQU0sd0NBQXdDLENBQUE7QUFFcEUsSUFBTSxrQkFBa0IsR0FBRyxVQUFDLEVBQStCO1FBQTdCLFFBQVEsY0FBQTtJQUM5QixJQUFBLEtBQUEsT0FBZ0MsS0FBSyxDQUFDLFFBQVEsQ0FDbEQsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLGdCQUFnQixDQUNuQyxJQUFBLEVBRk0sV0FBVyxRQUFBLEVBQUUsY0FBYyxRQUVqQyxDQUFBO0lBQ0QsSUFBTSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUE7SUFDMUIsSUFBQSxLQUErQixRQUFRLENBQUMsTUFBTSxFQUFFLEVBQTlDLE1BQU0sWUFBQSxFQUFFLE1BQU0sWUFBQSxFQUFFLFFBQVEsY0FBc0IsQ0FBQTtJQUV0RCxXQUFXLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRTtRQUNuQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDeEIsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFBO1NBQ3hCO2FBQU07WUFDTCxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7U0FDeEI7SUFDSCxDQUFDLENBQUMsQ0FBQTtJQUNGLFdBQVcsQ0FBQyxRQUFRLEVBQUUseUJBQXlCLEVBQUU7UUFDL0MsY0FBYyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQ3BELENBQUMsQ0FBQyxDQUFBO0lBQ0YsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQzVDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtTQUN4QjtRQUNELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFO1lBQ25CLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFBO1NBQzVCO0lBQ0gsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDcEIsT0FBTyxDQUNMO1FBQ0UsNkJBQ0UsU0FBUyxFQUFDLFVBQVUsRUFDcEIsR0FBRyxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQ3hCLEtBQUssRUFBRTtnQkFDTCxJQUFJLEVBQUUsTUFBTTtnQkFDWixHQUFHLEVBQUUsTUFBTTthQUNaLEdBQ0k7UUFDUCxvQkFBQyxPQUFPLGVBQUssU0FBUyxDQUFDLGVBQWU7WUFDcEMsb0JBQUMsS0FBSyxJQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsUUFBUTtnQkFDbkMsb0JBQUMsZUFBZSxJQUNkLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxFQUNoQyxnQkFBZ0IsRUFBRSxXQUFXLEVBQzdCLFdBQVcsRUFBRTt3QkFDWCxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUE7b0JBQ3pCLENBQUMsR0FDRCxDQUNJLENBQ0EsQ0FDVCxDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCB7IHVzZU1lbnVTdGF0ZSB9IGZyb20gJy4uL21lbnUtc3RhdGUvbWVudS1zdGF0ZSdcbmltcG9ydCBQb3BvdmVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUG9wb3ZlcidcbmltcG9ydCBQYXBlciBmcm9tICdAbXVpL21hdGVyaWFsL1BhcGVyJ1xuaW1wb3J0IHsgRWxldmF0aW9ucyB9IGZyb20gJy4uL3RoZW1lL3RoZW1lJ1xuaW1wb3J0IHsgdXNlTGlzdGVuVG8gfSBmcm9tICcuLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCBDb3B5Q29vcmRpbmF0ZXMgZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L2NvcHktY29vcmRpbmF0ZXMnXG5cbmNvbnN0IE1hcENvbnRleHREcm9wZG93biA9ICh7IG1hcE1vZGVsIH06IHsgbWFwTW9kZWw6IGFueSB9KSA9PiB7XG4gIGNvbnN0IFtjb29yZGluYXRlcywgc2V0Q29vcmRpbmF0ZXNdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgbWFwTW9kZWwudG9KU09OKCkuY29vcmRpbmF0ZVZhbHVlc1xuICApXG4gIGNvbnN0IG1lbnVTdGF0ZSA9IHVzZU1lbnVTdGF0ZSgpXG4gIGNvbnN0IHsgbW91c2VYLCBtb3VzZVksIG1vdXNlTGF0IH0gPSBtYXBNb2RlbC50b0pTT04oKVxuXG4gIHVzZUxpc3RlblRvKG1hcE1vZGVsLCAnY2hhbmdlOm9wZW4nLCAoKSA9PiB7XG4gICAgaWYgKG1hcE1vZGVsLmdldCgnb3BlbicpKSB7XG4gICAgICBtZW51U3RhdGUuaGFuZGxlQ2xpY2soKVxuICAgIH0gZWxzZSB7XG4gICAgICBtZW51U3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgIH1cbiAgfSlcbiAgdXNlTGlzdGVuVG8obWFwTW9kZWwsICdjaGFuZ2U6Y29vcmRpbmF0ZVZhbHVlcycsICgpID0+IHtcbiAgICBzZXRDb29yZGluYXRlcyhtYXBNb2RlbC50b0pTT04oKS5jb29yZGluYXRlVmFsdWVzKVxuICB9KVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtZW51U3RhdGUub3BlbiAmJiBtb3VzZUxhdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBtZW51U3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgIH1cbiAgICBpZiAoIW1lbnVTdGF0ZS5vcGVuKSB7XG4gICAgICBtYXBNb2RlbC5zZXQoJ29wZW4nLCBmYWxzZSlcbiAgICB9XG4gIH0sIFttZW51U3RhdGUub3Blbl0pXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGVcIlxuICAgICAgICByZWY9e21lbnVTdGF0ZS5hbmNob3JSZWZ9XG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgbGVmdDogbW91c2VYLFxuICAgICAgICAgIHRvcDogbW91c2VZLFxuICAgICAgICB9fVxuICAgICAgPjwvZGl2PlxuICAgICAgPFBvcG92ZXIgey4uLm1lbnVTdGF0ZS5NdWlQb3BvdmVyUHJvcHN9PlxuICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLm92ZXJsYXlzfT5cbiAgICAgICAgICA8Q29weUNvb3JkaW5hdGVzXG4gICAgICAgICAgICBrZXk9e0pTT04uc3RyaW5naWZ5KGNvb3JkaW5hdGVzKX1cbiAgICAgICAgICAgIGNvb3JkaW5hdGVWYWx1ZXM9e2Nvb3JkaW5hdGVzfVxuICAgICAgICAgICAgY2xvc2VQYXJlbnQ9eygpID0+IHtcbiAgICAgICAgICAgICAgbWVudVN0YXRlLmhhbmRsZUNsb3NlKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9QYXBlcj5cbiAgICAgIDwvUG9wb3Zlcj5cbiAgICA8Lz5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShNYXBDb250ZXh0RHJvcGRvd24pXG4iXX0=