import { __assign, __read, __rest } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
/**
 * CSS is a bit lacking when it comes to inheriting backgrounds, so this let's the dev do so a bit easier
 */
var BackgroundInheritingDiv = function (props) {
    var style = props.style, otherProps = __rest(props, ["style"]);
    var divRef = React.useRef(null);
    var _a = __read(React.useState(null), 2), background = _a[0], setBackground = _a[1];
    React.useEffect(function () {
        if (divRef.current) {
            var parentColor = divRef.current;
            while (typeof parentColor !== 'string' &&
                !parentColor.classList.contains('MuiPaper-root')) {
                if (parentColor.parentElement)
                    parentColor = parentColor.parentElement;
            }
            if (typeof parentColor !== 'string') {
                setBackground(getComputedStyle(parentColor).backgroundColor);
            }
        }
    }, []);
    return (_jsx("div", __assign({}, otherProps, { ref: divRef, style: __assign(__assign({}, style), (background ? { background: background } : {})) })));
};
export default BackgroundInheritingDiv;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC1pbmhlcml0aW5nLWRpdi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdGhlbWUvYmFja2dyb3VuZC1pbmhlcml0aW5nLWRpdi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUU5Qjs7R0FFRztBQUNILElBQU0sdUJBQXVCLEdBQUcsVUFBQyxLQUFrQztJQUN6RCxJQUFBLEtBQUssR0FBb0IsS0FBSyxNQUF6QixFQUFLLFVBQVUsVUFBSyxLQUFLLEVBQWhDLFNBQXdCLENBQUYsQ0FBVTtJQUN0QyxJQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFpQixJQUFJLENBQUMsQ0FBQTtJQUMzQyxJQUFBLEtBQUEsT0FBOEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFxQixDQUFDLElBQUEsRUFBbEUsVUFBVSxRQUFBLEVBQUUsYUFBYSxRQUF5QyxDQUFBO0lBQ3pFLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUNuQixJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsT0FBK0IsQ0FBQTtZQUN4RCxPQUNFLE9BQU8sV0FBVyxLQUFLLFFBQVE7Z0JBQy9CLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLEVBQ2hELENBQUM7Z0JBQ0QsSUFBSSxXQUFXLENBQUMsYUFBYTtvQkFBRSxXQUFXLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQTtZQUN4RSxDQUFDO1lBQ0QsSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDcEMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1lBQzlELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sT0FBTyxDQUNMLHlCQUNNLFVBQVUsSUFDZCxHQUFHLEVBQUUsTUFBTSxFQUNYLEtBQUssd0JBQ0EsS0FBSyxHQUNMLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUV2QyxDQUNILENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLHVCQUF1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5cbi8qKlxuICogQ1NTIGlzIGEgYml0IGxhY2tpbmcgd2hlbiBpdCBjb21lcyB0byBpbmhlcml0aW5nIGJhY2tncm91bmRzLCBzbyB0aGlzIGxldCdzIHRoZSBkZXYgZG8gc28gYSBiaXQgZWFzaWVyXG4gKi9cbmNvbnN0IEJhY2tncm91bmRJbmhlcml0aW5nRGl2ID0gKHByb3BzOiBSZWFjdC5Db21wb25lbnRQcm9wczwnZGl2Jz4pID0+IHtcbiAgY29uc3QgeyBzdHlsZSwgLi4ub3RoZXJQcm9wcyB9ID0gcHJvcHNcbiAgY29uc3QgZGl2UmVmID0gUmVhY3QudXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKVxuICBjb25zdCBbYmFja2dyb3VuZCwgc2V0QmFja2dyb3VuZF0gPSBSZWFjdC51c2VTdGF0ZShudWxsIGFzIG51bGwgfCBzdHJpbmcpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGRpdlJlZi5jdXJyZW50KSB7XG4gICAgICBsZXQgcGFyZW50Q29sb3IgPSBkaXZSZWYuY3VycmVudCBhcyBzdHJpbmcgfCBIVE1MRWxlbWVudFxuICAgICAgd2hpbGUgKFxuICAgICAgICB0eXBlb2YgcGFyZW50Q29sb3IgIT09ICdzdHJpbmcnICYmXG4gICAgICAgICFwYXJlbnRDb2xvci5jbGFzc0xpc3QuY29udGFpbnMoJ011aVBhcGVyLXJvb3QnKVxuICAgICAgKSB7XG4gICAgICAgIGlmIChwYXJlbnRDb2xvci5wYXJlbnRFbGVtZW50KSBwYXJlbnRDb2xvciA9IHBhcmVudENvbG9yLnBhcmVudEVsZW1lbnRcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgcGFyZW50Q29sb3IgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNldEJhY2tncm91bmQoZ2V0Q29tcHV0ZWRTdHlsZShwYXJlbnRDb2xvcikuYmFja2dyb3VuZENvbG9yKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW10pXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgey4uLm90aGVyUHJvcHN9XG4gICAgICByZWY9e2RpdlJlZn1cbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIC4uLnN0eWxlLFxuICAgICAgICAuLi4oYmFja2dyb3VuZCA/IHsgYmFja2dyb3VuZCB9IDoge30pLFxuICAgICAgfX1cbiAgICAvPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhY2tncm91bmRJbmhlcml0aW5nRGl2XG4iXX0=