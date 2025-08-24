import { jsx as _jsx } from "react/jsx-runtime";
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
import Button from '@mui/material/Button';
import user from '../../component/singletons/user-instance';
import TransferList from '../../component/tabs/metacard/transfer-list';
import { useDialog } from '../../component/dialog';
import { TypedUserInstance } from '../../component/singletons/TypedUser';
import { StartupDataStore } from '../../js/model/Startup/startup';
export default (function (_a) {
    var _b = _a.isExport, isExport = _b === void 0 ? false : _b;
    var requiredAttributes = StartupDataStore.Configuration.getRequiredExportAttributes();
    var dialogContext = useDialog();
    return (_jsx(Button, { "data-id": "manage-attributes-button", onClick: function () {
            dialogContext.setProps({
                open: true,
                disableEnforceFocus: true,
                children: (_jsx("div", { style: {
                        minHeight: '60vh',
                    }, children: _jsx(TransferList, { startingLeft: TypedUserInstance.getResultsAttributesSummaryShown(), requiredAttributes: requiredAttributes, startingRight: TypedUserInstance.getResultsAttributesPossibleSummaryShown(), startingHideEmpty: user
                            .get('user')
                            .get('preferences')
                            .get('inspector-hideEmpty'), onSave: function (active, newHideEmpty) {
                            user.get('user').get('preferences').set({
                                'inspector-summaryShown': active,
                                'inspector-hideEmpty': newHideEmpty,
                            });
                            user.savePreferences();
                        } }) })),
            });
        }, color: "primary", size: "small", style: { height: 'auto' }, children: isExport ? 'Select Attributes to Export' : 'Manage Attributes' }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeS1tYW5hZ2UtYXR0cmlidXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvc3VtbWFyeS1tYW5hZ2UtYXR0cmlidXRlcy9zdW1tYXJ5LW1hbmFnZS1hdHRyaWJ1dGVzLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUVKLE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLDBDQUEwQyxDQUFBO0FBQzNELE9BQU8sWUFBWSxNQUFNLDZDQUE2QyxDQUFBO0FBQ3RFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUN4RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUVqRSxnQkFBZSxVQUFDLEVBQTRDO1FBQTFDLGdCQUFnQixFQUFoQixRQUFRLG1CQUFHLEtBQUssS0FBQTtJQUNoQyxJQUFNLGtCQUFrQixHQUN0QixnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsMkJBQTJCLEVBQUUsQ0FBQTtJQUM5RCxJQUFNLGFBQWEsR0FBRyxTQUFTLEVBQUUsQ0FBQTtJQUNqQyxPQUFPLENBQ0wsS0FBQyxNQUFNLGVBQ0csMEJBQTBCLEVBQ2xDLE9BQU8sRUFBRTtZQUNQLGFBQWEsQ0FBQyxRQUFRLENBQUM7Z0JBQ3JCLElBQUksRUFBRSxJQUFJO2dCQUNWLG1CQUFtQixFQUFFLElBQUk7Z0JBQ3pCLFFBQVEsRUFBRSxDQUNSLGNBQ0UsS0FBSyxFQUFFO3dCQUNMLFNBQVMsRUFBRSxNQUFNO3FCQUNsQixZQUVELEtBQUMsWUFBWSxJQUNYLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxnQ0FBZ0MsRUFBRSxFQUNsRSxrQkFBa0IsRUFBRSxrQkFBa0IsRUFDdEMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLHdDQUF3QyxFQUFFLEVBQzNFLGlCQUFpQixFQUFFLElBQUk7NkJBQ3BCLEdBQUcsQ0FBQyxNQUFNLENBQUM7NkJBQ1gsR0FBRyxDQUFDLGFBQWEsQ0FBQzs2QkFDbEIsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEVBQzdCLE1BQU0sRUFBRSxVQUFDLE1BQVcsRUFBRSxZQUFpQjs0QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDO2dDQUN0Qyx3QkFBd0IsRUFBRSxNQUFNO2dDQUNoQyxxQkFBcUIsRUFBRSxZQUFZOzZCQUNwQyxDQUFDLENBQUE7NEJBQ0YsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO3dCQUN4QixDQUFDLEdBQ0QsR0FDRSxDQUNQO2FBQ0YsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxFQUNELEtBQUssRUFBQyxTQUFTLEVBQ2YsSUFBSSxFQUFDLE9BQU8sRUFDWixLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBRXhCLFFBQVEsQ0FBQyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixHQUN4RCxDQUNWLENBQUE7QUFDSCxDQUFDLEVBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL2NvbXBvbmVudC9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgVHJhbnNmZXJMaXN0IGZyb20gJy4uLy4uL2NvbXBvbmVudC90YWJzL21ldGFjYXJkL3RyYW5zZmVyLWxpc3QnXG5pbXBvcnQgeyB1c2VEaWFsb2cgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvZGlhbG9nJ1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy9UeXBlZFVzZXInXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuXG5leHBvcnQgZGVmYXVsdCAoeyBpc0V4cG9ydCA9IGZhbHNlIH06IHsgaXNFeHBvcnQ/OiBib29sZWFuIH0pID0+IHtcbiAgY29uc3QgcmVxdWlyZWRBdHRyaWJ1dGVzID1cbiAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UmVxdWlyZWRFeHBvcnRBdHRyaWJ1dGVzKClcbiAgY29uc3QgZGlhbG9nQ29udGV4dCA9IHVzZURpYWxvZygpXG4gIHJldHVybiAoXG4gICAgPEJ1dHRvblxuICAgICAgZGF0YS1pZD1cIm1hbmFnZS1hdHRyaWJ1dGVzLWJ1dHRvblwiXG4gICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgZGlzYWJsZUVuZm9yY2VGb2N1czogdHJ1ZSxcbiAgICAgICAgICBjaGlsZHJlbjogKFxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIG1pbkhlaWdodDogJzYwdmgnLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8VHJhbnNmZXJMaXN0XG4gICAgICAgICAgICAgICAgc3RhcnRpbmdMZWZ0PXtUeXBlZFVzZXJJbnN0YW5jZS5nZXRSZXN1bHRzQXR0cmlidXRlc1N1bW1hcnlTaG93bigpfVxuICAgICAgICAgICAgICAgIHJlcXVpcmVkQXR0cmlidXRlcz17cmVxdWlyZWRBdHRyaWJ1dGVzfVxuICAgICAgICAgICAgICAgIHN0YXJ0aW5nUmlnaHQ9e1R5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzUG9zc2libGVTdW1tYXJ5U2hvd24oKX1cbiAgICAgICAgICAgICAgICBzdGFydGluZ0hpZGVFbXB0eT17dXNlclxuICAgICAgICAgICAgICAgICAgLmdldCgndXNlcicpXG4gICAgICAgICAgICAgICAgICAuZ2V0KCdwcmVmZXJlbmNlcycpXG4gICAgICAgICAgICAgICAgICAuZ2V0KCdpbnNwZWN0b3ItaGlkZUVtcHR5Jyl9XG4gICAgICAgICAgICAgICAgb25TYXZlPXsoYWN0aXZlOiBhbnksIG5ld0hpZGVFbXB0eTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5zZXQoe1xuICAgICAgICAgICAgICAgICAgICAnaW5zcGVjdG9yLXN1bW1hcnlTaG93bic6IGFjdGl2ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2luc3BlY3Rvci1oaWRlRW1wdHknOiBuZXdIaWRlRW1wdHksXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgdXNlci5zYXZlUHJlZmVyZW5jZXMoKVxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApLFxuICAgICAgICB9KVxuICAgICAgfX1cbiAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICBzaXplPVwic21hbGxcIlxuICAgICAgc3R5bGU9e3sgaGVpZ2h0OiAnYXV0bycgfX1cbiAgICA+XG4gICAgICB7aXNFeHBvcnQgPyAnU2VsZWN0IEF0dHJpYnV0ZXMgdG8gRXhwb3J0JyA6ICdNYW5hZ2UgQXR0cmlidXRlcyd9XG4gICAgPC9CdXR0b24+XG4gIClcbn1cbiJdfQ==