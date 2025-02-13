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
import user from '../../component/singletons/user-instance';
import TransferList from '../../component/tabs/metacard/transfer-list';
import { Elevations } from '../../component/theme/theme';
import { useDialog } from '../../component/dialog';
import { TypedUserInstance } from '../../component/singletons/TypedUser';
import { StartupDataStore } from '../../js/model/Startup/startup';
export default (function (_a) {
    var _b = _a.isExport, isExport = _b === void 0 ? false : _b;
    var requiredAttributes = StartupDataStore.Configuration.getRequiredExportAttributes();
    var dialogContext = useDialog();
    return (React.createElement(Button, { "data-id": "manage-attributes-button", onClick: function () {
            dialogContext.setProps({
                PaperProps: {
                    style: {
                        minWidth: 'none',
                    },
                    elevation: Elevations.panels,
                },
                open: true,
                disableEnforceFocus: true,
                children: (React.createElement("div", { style: {
                        minHeight: '60vh',
                    } },
                    React.createElement(TransferList, { startingLeft: TypedUserInstance.getResultsAttributesSummaryShown(), requiredAttributes: requiredAttributes, startingRight: TypedUserInstance.getResultsAttributesPossibleSummaryShown(), startingHideEmpty: user
                            .get('user')
                            .get('preferences')
                            .get('inspector-hideEmpty'), onSave: function (active, newHideEmpty) {
                            user.get('user').get('preferences').set({
                                'inspector-summaryShown': active,
                                'inspector-hideEmpty': newHideEmpty,
                            });
                            user.savePreferences();
                        } }))),
            });
        }, color: "primary", size: "small", style: { height: 'auto' } }, isExport ? 'Select Attributes to Export' : 'Manage Attributes'));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeS1tYW5hZ2UtYXR0cmlidXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvc3VtbWFyeS1tYW5hZ2UtYXR0cmlidXRlcy9zdW1tYXJ5LW1hbmFnZS1hdHRyaWJ1dGVzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxJQUFJLE1BQU0sMENBQTBDLENBQUE7QUFDM0QsT0FBTyxZQUFZLE1BQU0sNkNBQTZDLENBQUE7QUFDdEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDZCQUE2QixDQUFBO0FBQ3hELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUN4RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUVqRSxnQkFBZSxVQUFDLEVBQTRDO1FBQTFDLGdCQUFnQixFQUFoQixRQUFRLG1CQUFHLEtBQUssS0FBQTtJQUNoQyxJQUFNLGtCQUFrQixHQUN0QixnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsMkJBQTJCLEVBQUUsQ0FBQTtJQUM5RCxJQUFNLGFBQWEsR0FBRyxTQUFTLEVBQUUsQ0FBQTtJQUNqQyxPQUFPLENBQ0wsb0JBQUMsTUFBTSxlQUNHLDBCQUEwQixFQUNsQyxPQUFPLEVBQUU7WUFDUCxhQUFhLENBQUMsUUFBUSxDQUFDO2dCQUNyQixVQUFVLEVBQUU7b0JBQ1YsS0FBSyxFQUFFO3dCQUNMLFFBQVEsRUFBRSxNQUFNO3FCQUNqQjtvQkFDRCxTQUFTLEVBQUUsVUFBVSxDQUFDLE1BQU07aUJBQzdCO2dCQUNELElBQUksRUFBRSxJQUFJO2dCQUNWLG1CQUFtQixFQUFFLElBQUk7Z0JBQ3pCLFFBQVEsRUFBRSxDQUNSLDZCQUNFLEtBQUssRUFBRTt3QkFDTCxTQUFTLEVBQUUsTUFBTTtxQkFDbEI7b0JBRUQsb0JBQUMsWUFBWSxJQUNYLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxnQ0FBZ0MsRUFBRSxFQUNsRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFDdEMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLHdDQUF3QyxFQUFFLEVBQzNFLGlCQUFpQixFQUFFLElBQUk7NkJBQ3BCLEdBQUcsQ0FBQyxNQUFNLENBQUM7NkJBQ1gsR0FBRyxDQUFDLGFBQWEsQ0FBQzs2QkFDbEIsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEVBQzdCLE1BQU0sRUFBRSxVQUFDLE1BQVcsRUFBRSxZQUFpQjs0QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDO2dDQUN0Qyx3QkFBd0IsRUFBRSxNQUFNO2dDQUNoQyxxQkFBcUIsRUFBRSxZQUFZOzZCQUNwQyxDQUFDLENBQUE7NEJBQ0YsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO3dCQUN4QixDQUFDLEdBQ0QsQ0FDRSxDQUNQO2FBQ0YsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxFQUNELEtBQUssRUFBQyxTQUFTLEVBQ2YsSUFBSSxFQUFDLE9BQU8sRUFDWixLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBRXhCLFFBQVEsQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUN4RCxDQUNWLENBQUE7QUFDSCxDQUFDLEVBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgVHJhbnNmZXJMaXN0IGZyb20gJy4uLy4uL2NvbXBvbmVudC90YWJzL21ldGFjYXJkL3RyYW5zZmVyLWxpc3QnXG5pbXBvcnQgeyBFbGV2YXRpb25zIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3RoZW1lL3RoZW1lJ1xuaW1wb3J0IHsgdXNlRGlhbG9nIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L2RpYWxvZydcbmltcG9ydCB7IFR5cGVkVXNlckluc3RhbmNlIH0gZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvVHlwZWRVc2VyJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcblxuZXhwb3J0IGRlZmF1bHQgKHsgaXNFeHBvcnQgPSBmYWxzZSB9OiB7IGlzRXhwb3J0PzogYm9vbGVhbiB9KSA9PiB7XG4gIGNvbnN0IHJlcXVpcmVkQXR0cmlidXRlcyA9XG4gICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFJlcXVpcmVkRXhwb3J0QXR0cmlidXRlcygpXG4gIGNvbnN0IGRpYWxvZ0NvbnRleHQgPSB1c2VEaWFsb2coKVxuICByZXR1cm4gKFxuICAgIDxCdXR0b25cbiAgICAgIGRhdGEtaWQ9XCJtYW5hZ2UtYXR0cmlidXRlcy1idXR0b25cIlxuICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgICAgICBQYXBlclByb3BzOiB7XG4gICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICBtaW5XaWR0aDogJ25vbmUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVsZXZhdGlvbjogRWxldmF0aW9ucy5wYW5lbHMsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICAgIGRpc2FibGVFbmZvcmNlRm9jdXM6IHRydWUsXG4gICAgICAgICAgY2hpbGRyZW46IChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBtaW5IZWlnaHQ6ICc2MHZoJyxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPFRyYW5zZmVyTGlzdFxuICAgICAgICAgICAgICAgIHN0YXJ0aW5nTGVmdD17VHlwZWRVc2VySW5zdGFuY2UuZ2V0UmVzdWx0c0F0dHJpYnV0ZXNTdW1tYXJ5U2hvd24oKX1cbiAgICAgICAgICAgICAgICByZXF1aXJlZEF0dHJpYnV0ZXM9e3JlcXVpcmVkQXR0cmlidXRlc31cbiAgICAgICAgICAgICAgICBzdGFydGluZ1JpZ2h0PXtUeXBlZFVzZXJJbnN0YW5jZS5nZXRSZXN1bHRzQXR0cmlidXRlc1Bvc3NpYmxlU3VtbWFyeVNob3duKCl9XG4gICAgICAgICAgICAgICAgc3RhcnRpbmdIaWRlRW1wdHk9e3VzZXJcbiAgICAgICAgICAgICAgICAgIC5nZXQoJ3VzZXInKVxuICAgICAgICAgICAgICAgICAgLmdldCgncHJlZmVyZW5jZXMnKVxuICAgICAgICAgICAgICAgICAgLmdldCgnaW5zcGVjdG9yLWhpZGVFbXB0eScpfVxuICAgICAgICAgICAgICAgIG9uU2F2ZT17KGFjdGl2ZTogYW55LCBuZXdIaWRlRW1wdHk6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuc2V0KHtcbiAgICAgICAgICAgICAgICAgICAgJ2luc3BlY3Rvci1zdW1tYXJ5U2hvd24nOiBhY3RpdmUsXG4gICAgICAgICAgICAgICAgICAgICdpbnNwZWN0b3ItaGlkZUVtcHR5JzogbmV3SGlkZUVtcHR5LFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIHVzZXIuc2F2ZVByZWZlcmVuY2VzKClcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSxcbiAgICAgICAgfSlcbiAgICAgIH19XG4gICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgIHN0eWxlPXt7IGhlaWdodDogJ2F1dG8nIH19XG4gICAgPlxuICAgICAge2lzRXhwb3J0ID8gJ1NlbGVjdCBBdHRyaWJ1dGVzIHRvIEV4cG9ydCcgOiAnTWFuYWdlIEF0dHJpYnV0ZXMnfVxuICAgIDwvQnV0dG9uPlxuICApXG59XG4iXX0=