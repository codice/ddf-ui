import { __read } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { useLazyResultsSelectedResultsFromSelectionInterface } from '../selection-interface/hooks';
import { useTheme } from '@mui/material/styles';
var SelectionRipple = function (_a) {
    var selectionInterface = _a.selectionInterface;
    var theme = useTheme();
    var selectedResults = useLazyResultsSelectedResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var selectedResultsArray = Object.values(selectedResults);
    var _b = __read(React.useState(selectedResultsArray.length !== 0), 2), hasSelection = _b[0], setHasSelection = _b[1];
    React.useEffect(function () {
        setHasSelection(selectedResultsArray.length !== 0);
    });
    return (_jsx("div", { className: " w-full h-full absolute z-0 left-0 top-0 transition-transform  transform overflow-visible  ease-in-out ".concat(hasSelection ? 'duration-1000' : 'duration-0'), style: {
            transform: hasSelection
                ? 'scale(100) translateX(0%) translateY(0%)'
                : 'scale(1) translateX(0%) translateY(0%)',
            background: theme.palette.secondary.main,
            opacity: hasSelection
                ? theme.palette.mode === 'dark'
                    ? 0.05
                    : 0.05
                : 0,
        } }));
};
export default SelectionRipple;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0aW9uLXJpcHBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvZ29sZGVuLWxheW91dC9zZWxlY3Rpb24tcmlwcGxlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRTlCLE9BQU8sRUFBRSxtREFBbUQsRUFBRSxNQUFNLDhCQUE4QixDQUFBO0FBQ2xHLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUUvQyxJQUFNLGVBQWUsR0FBRyxVQUFDLEVBSXhCO1FBSEMsa0JBQWtCLHdCQUFBO0lBSWxCLElBQU0sS0FBSyxHQUFHLFFBQVEsRUFBRSxDQUFBO0lBQ3hCLElBQU0sZUFBZSxHQUFHLG1EQUFtRCxDQUFDO1FBQzFFLGtCQUFrQixvQkFBQTtLQUNuQixDQUFDLENBQUE7SUFDRixJQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7SUFDckQsSUFBQSxLQUFBLE9BQWtDLEtBQUssQ0FBQyxRQUFRLENBQ3BELG9CQUFvQixDQUFDLE1BQU0sS0FBSyxDQUFDLENBQ2xDLElBQUEsRUFGTSxZQUFZLFFBQUEsRUFBRSxlQUFlLFFBRW5DLENBQUE7SUFDRCxLQUFLLENBQUMsU0FBUyxDQUFDO1FBQ2QsZUFBZSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUNwRCxDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sQ0FDTCxjQUNFLFNBQVMsRUFBRSxpSEFDVCxZQUFZLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUM3QyxFQUNGLEtBQUssRUFBRTtZQUNMLFNBQVMsRUFBRSxZQUFZO2dCQUNyQixDQUFDLENBQUMsMENBQTBDO2dCQUM1QyxDQUFDLENBQUMsd0NBQXdDO1lBQzVDLFVBQVUsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJO1lBQ3hDLE9BQU8sRUFBRSxZQUFZO2dCQUNuQixDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssTUFBTTtvQkFDN0IsQ0FBQyxDQUFDLElBQUk7b0JBQ04sQ0FBQyxDQUFDLElBQUk7Z0JBQ1IsQ0FBQyxDQUFDLENBQUM7U0FDTixHQUNELENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsZUFBZSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5cbmltcG9ydCB7IHVzZUxhenlSZXN1bHRzU2VsZWN0ZWRSZXN1bHRzRnJvbVNlbGVjdGlvbkludGVyZmFjZSB9IGZyb20gJy4uL3NlbGVjdGlvbi1pbnRlcmZhY2UvaG9va3MnXG5pbXBvcnQgeyB1c2VUaGVtZSB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJ1xuXG5jb25zdCBTZWxlY3Rpb25SaXBwbGUgPSAoe1xuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG59OiB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG59KSA9PiB7XG4gIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuICBjb25zdCBzZWxlY3RlZFJlc3VsdHMgPSB1c2VMYXp5UmVzdWx0c1NlbGVjdGVkUmVzdWx0c0Zyb21TZWxlY3Rpb25JbnRlcmZhY2Uoe1xuICAgIHNlbGVjdGlvbkludGVyZmFjZSxcbiAgfSlcbiAgY29uc3Qgc2VsZWN0ZWRSZXN1bHRzQXJyYXkgPSBPYmplY3QudmFsdWVzKHNlbGVjdGVkUmVzdWx0cylcbiAgY29uc3QgW2hhc1NlbGVjdGlvbiwgc2V0SGFzU2VsZWN0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIHNlbGVjdGVkUmVzdWx0c0FycmF5Lmxlbmd0aCAhPT0gMFxuICApXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0SGFzU2VsZWN0aW9uKHNlbGVjdGVkUmVzdWx0c0FycmF5Lmxlbmd0aCAhPT0gMClcbiAgfSlcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2Agdy1mdWxsIGgtZnVsbCBhYnNvbHV0ZSB6LTAgbGVmdC0wIHRvcC0wIHRyYW5zaXRpb24tdHJhbnNmb3JtICB0cmFuc2Zvcm0gb3ZlcmZsb3ctdmlzaWJsZSAgZWFzZS1pbi1vdXQgJHtcbiAgICAgICAgaGFzU2VsZWN0aW9uID8gJ2R1cmF0aW9uLTEwMDAnIDogJ2R1cmF0aW9uLTAnXG4gICAgICB9YH1cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIHRyYW5zZm9ybTogaGFzU2VsZWN0aW9uXG4gICAgICAgICAgPyAnc2NhbGUoMTAwKSB0cmFuc2xhdGVYKDAlKSB0cmFuc2xhdGVZKDAlKSdcbiAgICAgICAgICA6ICdzY2FsZSgxKSB0cmFuc2xhdGVYKDAlKSB0cmFuc2xhdGVZKDAlKScsXG4gICAgICAgIGJhY2tncm91bmQ6IHRoZW1lLnBhbGV0dGUuc2Vjb25kYXJ5Lm1haW4sXG4gICAgICAgIG9wYWNpdHk6IGhhc1NlbGVjdGlvblxuICAgICAgICAgID8gdGhlbWUucGFsZXR0ZS5tb2RlID09PSAnZGFyaydcbiAgICAgICAgICAgID8gMC4wNVxuICAgICAgICAgICAgOiAwLjA1XG4gICAgICAgICAgOiAwLFxuICAgICAgfX1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlbGVjdGlvblJpcHBsZVxuIl19