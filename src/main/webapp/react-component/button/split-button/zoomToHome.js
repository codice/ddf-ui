import { __assign } from "tslib";
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
import Button from '@mui/material/Button';
import { hot } from 'react-hot-loader';
import { useMenuState } from '../../../component/menu-state/menu-state';
import HomeIcon from '@mui/icons-material/Home';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Popover from '@mui/material/Popover';
import RoomIcon from '@mui/icons-material/Room';
import Paper from '@mui/material/Paper';
import { Elevations } from '../../../component/theme/theme';
var ZoomToHome = function (props) {
    var saveHome = props.saveHome, goHome = props.goHome;
    var menuState = useMenuState();
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "flex flex-row items-stretch" },
            React.createElement(Button, __assign({ size: "small", "data-id": "home-button" }, menuState.MuiButtonProps, { className: "border border-r-2 Mui-border-divider", onClick: goHome }),
                React.createElement("div", { className: "flex flex-row items-center" },
                    React.createElement(HomeIcon, null))),
            React.createElement("div", { className: "Mui-bg-default w-min my-2" }),
            React.createElement(Button, __assign({ size: "small", "data-id": "home-dropdown" }, menuState.MuiButtonProps),
                React.createElement(KeyboardArrowDownIcon, null))),
        React.createElement(Popover, __assign({}, menuState.MuiPopoverProps),
            React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" },
                React.createElement(Button, { size: "small", "data-id": "set-home-button", className: "p-2", onClick: function () {
                        saveHome();
                        menuState.handleClose();
                    }, title: "Save Current View as Home Location" },
                    React.createElement("span", null,
                        "Set Home",
                        React.createElement(RoomIcon, null)))))));
};
export default hot(module)(ZoomToHome);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiem9vbVRvSG9tZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvYnV0dG9uL3NwbGl0LWJ1dHRvbi96b29tVG9Ib21lLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMENBQTBDLENBQUE7QUFDdkUsT0FBTyxRQUFRLE1BQU0sMEJBQTBCLENBQUE7QUFDL0MsT0FBTyxxQkFBcUIsTUFBTSx1Q0FBdUMsQ0FBQTtBQUN6RSxPQUFPLE9BQU8sTUFBTSx1QkFBdUIsQ0FBQTtBQUMzQyxPQUFPLFFBQVEsTUFBTSwwQkFBMEIsQ0FBQTtBQUMvQyxPQUFPLEtBQUssTUFBTSxxQkFBcUIsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFRM0QsSUFBTSxVQUFVLEdBQUcsVUFBQyxLQUFZO0lBQ3RCLElBQUEsUUFBUSxHQUFhLEtBQUssU0FBbEIsRUFBRSxNQUFNLEdBQUssS0FBSyxPQUFWLENBQVU7SUFDbEMsSUFBTSxTQUFTLEdBQUcsWUFBWSxFQUFFLENBQUE7SUFDaEMsT0FBTyxDQUNMO1FBQ0UsNkJBQUssU0FBUyxFQUFDLDZCQUE2QjtZQUMxQyxvQkFBQyxNQUFNLGFBQ0wsSUFBSSxFQUFDLE9BQU8sYUFDSixhQUFhLElBQ2pCLFNBQVMsQ0FBQyxjQUFjLElBQzVCLFNBQVMsRUFBQyxzQ0FBc0MsRUFDaEQsT0FBTyxFQUFFLE1BQU07Z0JBRWYsNkJBQUssU0FBUyxFQUFDLDRCQUE0QjtvQkFDekMsb0JBQUMsUUFBUSxPQUFHLENBQ1IsQ0FDQztZQUNULDZCQUFLLFNBQVMsRUFBQywyQkFBMkIsR0FBTztZQUNqRCxvQkFBQyxNQUFNLGFBQ0wsSUFBSSxFQUFDLE9BQU8sYUFDSixlQUFlLElBQ25CLFNBQVMsQ0FBQyxjQUFjO2dCQUU1QixvQkFBQyxxQkFBcUIsT0FBRyxDQUNsQixDQUNMO1FBQ04sb0JBQUMsT0FBTyxlQUFLLFNBQVMsQ0FBQyxlQUFlO1lBQ3BDLG9CQUFDLEtBQUssSUFBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUMsS0FBSztnQkFDcEQsb0JBQUMsTUFBTSxJQUNMLElBQUksRUFBQyxPQUFPLGFBQ0osaUJBQWlCLEVBQ3pCLFNBQVMsRUFBQyxLQUFLLEVBQ2YsT0FBTyxFQUFFO3dCQUNQLFFBQVEsRUFBRSxDQUFBO3dCQUNWLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtvQkFDekIsQ0FBQyxFQUNELEtBQUssRUFBQyxvQ0FBb0M7b0JBRTFDOzt3QkFFRSxvQkFBQyxRQUFRLE9BQUcsQ0FDUCxDQUNBLENBQ0gsQ0FDQSxDQUNULENBQ0osQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuaW1wb3J0IHsgdXNlTWVudVN0YXRlIH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L21lbnUtc3RhdGUvbWVudS1zdGF0ZSdcbmltcG9ydCBIb21lSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0hvbWUnXG5pbXBvcnQgS2V5Ym9hcmRBcnJvd0Rvd25JY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvS2V5Ym9hcmRBcnJvd0Rvd24nXG5pbXBvcnQgUG9wb3ZlciBmcm9tICdAbXVpL21hdGVyaWFsL1BvcG92ZXInXG5pbXBvcnQgUm9vbUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9Sb29tJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyBFbGV2YXRpb25zIH0gZnJvbSAnLi4vLi4vLi4vY29tcG9uZW50L3RoZW1lL3RoZW1lJ1xudHlwZSB2b2lkRnVuYyA9ICgpID0+IHZvaWRcblxudHlwZSBQcm9wcyA9IHtcbiAgZ29Ib21lOiB2b2lkRnVuY1xuICBzYXZlSG9tZTogdm9pZEZ1bmNcbn1cblxuY29uc3QgWm9vbVRvSG9tZSA9IChwcm9wczogUHJvcHMpID0+IHtcbiAgY29uc3QgeyBzYXZlSG9tZSwgZ29Ib21lIH0gPSBwcm9wc1xuICBjb25zdCBtZW51U3RhdGUgPSB1c2VNZW51U3RhdGUoKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1yb3cgaXRlbXMtc3RyZXRjaFwiPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICBkYXRhLWlkPVwiaG9tZS1idXR0b25cIlxuICAgICAgICAgIHsuLi5tZW51U3RhdGUuTXVpQnV0dG9uUHJvcHN9XG4gICAgICAgICAgY2xhc3NOYW1lPVwiYm9yZGVyIGJvcmRlci1yLTIgTXVpLWJvcmRlci1kaXZpZGVyXCJcbiAgICAgICAgICBvbkNsaWNrPXtnb0hvbWV9XG4gICAgICAgID5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1yb3cgaXRlbXMtY2VudGVyXCI+XG4gICAgICAgICAgICA8SG9tZUljb24gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiTXVpLWJnLWRlZmF1bHQgdy1taW4gbXktMlwiPjwvZGl2PlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICBkYXRhLWlkPVwiaG9tZS1kcm9wZG93blwiXG4gICAgICAgICAgey4uLm1lbnVTdGF0ZS5NdWlCdXR0b25Qcm9wc31cbiAgICAgICAgPlxuICAgICAgICAgIDxLZXlib2FyZEFycm93RG93bkljb24gLz5cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxQb3BvdmVyIHsuLi5tZW51U3RhdGUuTXVpUG9wb3ZlclByb3BzfT5cbiAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5vdmVybGF5c30gY2xhc3NOYW1lPVwicC0yXCI+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgIGRhdGEtaWQ9XCJzZXQtaG9tZS1idXR0b25cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicC0yXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgc2F2ZUhvbWUoKVxuICAgICAgICAgICAgICBtZW51U3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIHRpdGxlPVwiU2F2ZSBDdXJyZW50IFZpZXcgYXMgSG9tZSBMb2NhdGlvblwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgIFNldCBIb21lXG4gICAgICAgICAgICAgIDxSb29tSWNvbiAvPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L1BhcGVyPlxuICAgICAgPC9Qb3BvdmVyPlxuICAgIDwvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFpvb21Ub0hvbWUpXG4iXX0=