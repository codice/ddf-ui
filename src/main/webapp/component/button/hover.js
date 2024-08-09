import { __assign, __read, __rest } from "tslib";
import * as React from 'react';
import Button from '@mui/material/Button';
/**
 * Allows a button that displays different components when hovering.
 * Otherwise everything else is the same.
 */
export var HoverButton = function (props) {
    var _a = __read(React.useState(false), 2), hover = _a[0], setHover = _a[1];
    var Children = props.children, buttonProps = __rest(props, ["children"]);
    return (React.createElement(Button, __assign({ "data-id": "hover-button", onMouseEnter: function () {
            setHover(true);
        }, onMouseOver: function () {
            setHover(true);
        }, onMouseOut: function () {
            setHover(false);
        }, onMouseLeave: function () {
            setHover(false);
        } }, buttonProps),
        React.createElement(Children, { hover: hover })));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG92ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2J1dHRvbi9ob3Zlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sTUFBdUIsTUFBTSxzQkFBc0IsQ0FBQTtBQUUxRDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUcsVUFDekIsS0FFQztJQUVLLElBQUEsS0FBQSxPQUFvQixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFBLEVBQXhDLEtBQUssUUFBQSxFQUFFLFFBQVEsUUFBeUIsQ0FBQTtJQUN2QyxJQUFVLFFBQVEsR0FBcUIsS0FBSyxTQUExQixFQUFLLFdBQVcsVUFBSyxLQUFLLEVBQTlDLFlBQXNDLENBQUYsQ0FBVTtJQUNwRCxPQUFPLENBQ0wsb0JBQUMsTUFBTSx3QkFDRyxjQUFjLEVBQ3RCLFlBQVksRUFBRTtZQUNaLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNoQixDQUFDLEVBQ0QsV0FBVyxFQUFFO1lBQ1gsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ2hCLENBQUMsRUFDRCxVQUFVLEVBQUU7WUFDVixRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDakIsQ0FBQyxFQUNELFlBQVksRUFBRTtZQUNaLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNqQixDQUFDLElBQ0csV0FBVztRQUVmLG9CQUFDLFFBQVEsSUFBQyxLQUFLLEVBQUUsS0FBSyxHQUFJLENBQ25CLENBQ1YsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEJ1dHRvbiwgeyBCdXR0b25Qcm9wcyB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuXG4vKipcbiAqIEFsbG93cyBhIGJ1dHRvbiB0aGF0IGRpc3BsYXlzIGRpZmZlcmVudCBjb21wb25lbnRzIHdoZW4gaG92ZXJpbmcuXG4gKiBPdGhlcndpc2UgZXZlcnl0aGluZyBlbHNlIGlzIHRoZSBzYW1lLlxuICovXG5leHBvcnQgY29uc3QgSG92ZXJCdXR0b24gPSAoXG4gIHByb3BzOiBPbWl0PEJ1dHRvblByb3BzLCAnY2hpbGRyZW4nPiAmIHtcbiAgICBjaGlsZHJlbjogKHsgaG92ZXIgfTogeyBob3ZlcjogYm9vbGVhbiB9KSA9PiBKU1guRWxlbWVudFxuICB9XG4pID0+IHtcbiAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgeyBjaGlsZHJlbjogQ2hpbGRyZW4sIC4uLmJ1dHRvblByb3BzIH0gPSBwcm9wc1xuICByZXR1cm4gKFxuICAgIDxCdXR0b25cbiAgICAgIGRhdGEtaWQ9XCJob3Zlci1idXR0b25cIlxuICAgICAgb25Nb3VzZUVudGVyPXsoKSA9PiB7XG4gICAgICAgIHNldEhvdmVyKHRydWUpXG4gICAgICB9fVxuICAgICAgb25Nb3VzZU92ZXI9eygpID0+IHtcbiAgICAgICAgc2V0SG92ZXIodHJ1ZSlcbiAgICAgIH19XG4gICAgICBvbk1vdXNlT3V0PXsoKSA9PiB7XG4gICAgICAgIHNldEhvdmVyKGZhbHNlKVxuICAgICAgfX1cbiAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4ge1xuICAgICAgICBzZXRIb3ZlcihmYWxzZSlcbiAgICAgIH19XG4gICAgICB7Li4uYnV0dG9uUHJvcHN9XG4gICAgPlxuICAgICAgPENoaWxkcmVuIGhvdmVyPXtob3Zlcn0gLz5cbiAgICA8L0J1dHRvbj5cbiAgKVxufVxuIl19