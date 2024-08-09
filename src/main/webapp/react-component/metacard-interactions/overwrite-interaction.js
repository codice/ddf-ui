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
import { MetacardInteraction } from './metacard-interactions';
import { hot } from 'react-hot-loader';
import { useDialog } from '../../component/dialog';
import { TypedUserInstance } from '../../component/singletons/TypedUser';
import { MetacardOverwrite } from '../../component/metacard-overwrite/metacard-overwrite.view';
export var OverwriteAction = function (props) {
    if (!props.model || props.model.length !== 1) {
        return null;
    }
    var result = props.model[0];
    if (result.isDeleted() ||
        result.isRevision() ||
        result.isRemote() ||
        !TypedUserInstance.canWrite(result)) {
        return null;
    }
    var dialogContext = useDialog();
    return (React.createElement(MetacardInteraction, { onClick: function () {
            props.onClose();
            if (props.model) {
                dialogContext.setProps({
                    children: (React.createElement(MetacardOverwrite, { title: 'Overwrite', lazyResult: result })),
                    open: true,
                });
            }
        }, icon: "fa fa-files-o", text: 'Overwrite', help: "This will overwrite the item content. To restore a previous content, you can click on 'File' in the toolbar, and then click 'Restore Archived Items'." }));
};
export default hot(module)(OverwriteAction);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3ZlcndyaXRlLWludGVyYWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC9tZXRhY2FyZC1pbnRlcmFjdGlvbnMvb3ZlcndyaXRlLWludGVyYWN0aW9uLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0seUJBQXlCLENBQUE7QUFDN0QsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUNsRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQTtBQUN4RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0REFBNEQsQ0FBQTtBQUU5RixNQUFNLENBQUMsSUFBTSxlQUFlLEdBQUcsVUFBQyxLQUErQjtJQUM3RCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDNUMsT0FBTyxJQUFJLENBQUE7S0FDWjtJQUVELElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFN0IsSUFDRSxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQ2xCLE1BQU0sQ0FBQyxVQUFVLEVBQUU7UUFDbkIsTUFBTSxDQUFDLFFBQVEsRUFBRTtRQUNqQixDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFDbkM7UUFDQSxPQUFPLElBQUksQ0FBQTtLQUNaO0lBRUQsSUFBTSxhQUFhLEdBQUcsU0FBUyxFQUFFLENBQUE7SUFDakMsT0FBTyxDQUNMLG9CQUFDLG1CQUFtQixJQUNsQixPQUFPLEVBQUU7WUFDUCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDZixJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7Z0JBQ2YsYUFBYSxDQUFDLFFBQVEsQ0FBQztvQkFDckIsUUFBUSxFQUFFLENBQ1Isb0JBQUMsaUJBQWlCLElBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsTUFBTSxHQUFJLENBQzlEO29CQUNELElBQUksRUFBRSxJQUFJO2lCQUNYLENBQUMsQ0FBQTthQUNIO1FBQ0gsQ0FBQyxFQUNELElBQUksRUFBQyxlQUFlLEVBQ3BCLElBQUksRUFBRSxXQUFXLEVBQ2pCLElBQUksRUFBQyx1SkFBdUosR0FDNUosQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgTWV0YWNhcmRJbnRlcmFjdGlvblByb3BzIH0gZnJvbSAnLidcbmltcG9ydCB7IE1ldGFjYXJkSW50ZXJhY3Rpb24gfSBmcm9tICcuL21ldGFjYXJkLWludGVyYWN0aW9ucydcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgeyB1c2VEaWFsb2cgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvZGlhbG9nJ1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy9UeXBlZFVzZXInXG5pbXBvcnQgeyBNZXRhY2FyZE92ZXJ3cml0ZSB9IGZyb20gJy4uLy4uL2NvbXBvbmVudC9tZXRhY2FyZC1vdmVyd3JpdGUvbWV0YWNhcmQtb3ZlcndyaXRlLnZpZXcnXG5cbmV4cG9ydCBjb25zdCBPdmVyd3JpdGVBY3Rpb24gPSAocHJvcHM6IE1ldGFjYXJkSW50ZXJhY3Rpb25Qcm9wcykgPT4ge1xuICBpZiAoIXByb3BzLm1vZGVsIHx8IHByb3BzLm1vZGVsLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBjb25zdCByZXN1bHQgPSBwcm9wcy5tb2RlbFswXVxuXG4gIGlmIChcbiAgICByZXN1bHQuaXNEZWxldGVkKCkgfHxcbiAgICByZXN1bHQuaXNSZXZpc2lvbigpIHx8XG4gICAgcmVzdWx0LmlzUmVtb3RlKCkgfHxcbiAgICAhVHlwZWRVc2VySW5zdGFuY2UuY2FuV3JpdGUocmVzdWx0KVxuICApIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgZGlhbG9nQ29udGV4dCA9IHVzZURpYWxvZygpXG4gIHJldHVybiAoXG4gICAgPE1ldGFjYXJkSW50ZXJhY3Rpb25cbiAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgcHJvcHMub25DbG9zZSgpXG4gICAgICAgIGlmIChwcm9wcy5tb2RlbCkge1xuICAgICAgICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgICAgICAgY2hpbGRyZW46IChcbiAgICAgICAgICAgICAgPE1ldGFjYXJkT3ZlcndyaXRlIHRpdGxlPXsnT3ZlcndyaXRlJ30gbGF6eVJlc3VsdD17cmVzdWx0fSAvPlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfX1cbiAgICAgIGljb249XCJmYSBmYS1maWxlcy1vXCJcbiAgICAgIHRleHQ9eydPdmVyd3JpdGUnfVxuICAgICAgaGVscD1cIlRoaXMgd2lsbCBvdmVyd3JpdGUgdGhlIGl0ZW0gY29udGVudC4gVG8gcmVzdG9yZSBhIHByZXZpb3VzIGNvbnRlbnQsIHlvdSBjYW4gY2xpY2sgb24gJ0ZpbGUnIGluIHRoZSB0b29sYmFyLCBhbmQgdGhlbiBjbGljayAnUmVzdG9yZSBBcmNoaXZlZCBJdGVtcycuXCJcbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKE92ZXJ3cml0ZUFjdGlvbilcbiJdfQ==