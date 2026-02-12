import { __assign, __read, __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import Button from '@mui/material/Button';
/**
 * Allows a button that displays different components when hovering.
 * Otherwise everything else is the same.
 */
export var HoverButton = function (props) {
    var _a = __read(React.useState(false), 2), hover = _a[0], setHover = _a[1];
    var Children = props.children, buttonProps = __rest(props, ["children"]);
    return (_jsx(Button, __assign({ "data-id": "hover-button", onMouseEnter: function () {
            setHover(true);
        }, onMouseOver: function () {
            setHover(true);
        }, onMouseOut: function () {
            setHover(false);
        }, onMouseLeave: function () {
            setHover(false);
        } }, buttonProps, { children: _jsx(Children, { hover: hover }) })));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2J1dHRvbi9ob3Zlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLE1BQXVCLE1BQU0sc0JBQXNCLENBQUE7QUFFMUQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLElBQU0sV0FBVyxHQUFHLFVBQ3pCLEtBRUM7SUFFSyxJQUFBLEtBQUEsT0FBb0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBQSxFQUF4QyxLQUFLLFFBQUEsRUFBRSxRQUFRLFFBQXlCLENBQUE7SUFDdkMsSUFBVSxRQUFRLEdBQXFCLEtBQUssU0FBMUIsRUFBSyxXQUFXLFVBQUssS0FBSyxFQUE5QyxZQUFzQyxDQUFGLENBQVU7SUFDcEQsT0FBTyxDQUNMLEtBQUMsTUFBTSx3QkFDRyxjQUFjLEVBQ3RCLFlBQVksRUFBRTtZQUNaLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNoQixDQUFDLEVBQ0QsV0FBVyxFQUFFO1lBQ1gsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2hCLENBQUMsRUFDRCxVQUFVLEVBQUU7WUFDVixRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDakIsQ0FBQyxFQUNELFlBQVksRUFBRTtZQUNaLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNqQixDQUFDLElBQ0csV0FBVyxjQUVmLEtBQUMsUUFBUSxJQUFDLEtBQUssRUFBRSxLQUFLLEdBQUksSUFDbkIsQ0FDVixDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgQnV0dG9uLCB7IEJ1dHRvblByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5cbi8qKlxuICogQWxsb3dzIGEgYnV0dG9uIHRoYXQgZGlzcGxheXMgZGlmZmVyZW50IGNvbXBvbmVudHMgd2hlbiBob3ZlcmluZy5cbiAqIE90aGVyd2lzZSBldmVyeXRoaW5nIGVsc2UgaXMgdGhlIHNhbWUuXG4gKi9cbmV4cG9ydCBjb25zdCBIb3ZlckJ1dHRvbiA9IChcbiAgcHJvcHM6IE9taXQ8QnV0dG9uUHJvcHMsICdjaGlsZHJlbic+ICYge1xuICAgIGNoaWxkcmVuOiAoeyBob3ZlciB9OiB7IGhvdmVyOiBib29sZWFuIH0pID0+IFJlYWN0LlJlYWN0Tm9kZVxuICB9XG4pID0+IHtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgeyBjaGlsZHJlbjogQ2hpbGRyZW4sIC4uLmJ1dHRvblByb3BzIH0gPSBwcm9wc1xuICByZXR1cm4gKFxuICAgIDxCdXR0b25cbiAgICAgIGRhdGEtaWQ9XCJob3Zlci1idXR0b25cIlxuICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiB7XG4gICAgICAgIHNldEhvdmVyKHRydWUpXG4gICAgICB9fVxuICAgICAgb25Nb3VzZU92ZXI9eygpID0+IHtcbiAgICAgICAgc2V0SG92ZXIodHJ1ZSlcbiAgICAgIH19XG4gICAgICBvbk1vdXNlT3V0PXsoKSA9PiB7XG4gICAgICAgIHNldEhvdmVyKGZhbHNlKVxuICAgICAgfX1cbiAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4ge1xuICAgICAgICBzZXRIb3ZlcihmYWxzZSlcbiAgICAgIH19XG4gICAgICB7Li4uYnV0dG9uUHJvcHN9XG4gICAgPlxuICAgICAgPENoaWxkcmVuIGhvdmVyPXtob3Zlcn0gLz5cbiAgICA8L0J1dHRvbj5cbiAgKVxufVxuIl19