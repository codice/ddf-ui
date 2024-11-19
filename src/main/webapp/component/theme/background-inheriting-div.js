import { __assign, __read, __rest } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
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
    return (React.createElement("div", __assign({}, otherProps, { ref: divRef, style: __assign(__assign({}, style), (background ? { background: background } : {})) })));
};
export default hot(module)(BackgroundInheritingDiv);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC1pbmhlcml0aW5nLWRpdi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdGhlbWUvYmFja2dyb3VuZC1pbmhlcml0aW5nLWRpdi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUV0Qzs7R0FFRztBQUNILElBQU0sdUJBQXVCLEdBQUcsVUFBQyxLQUFrQztJQUN6RCxJQUFBLEtBQUssR0FBb0IsS0FBSyxNQUF6QixFQUFLLFVBQVUsVUFBSyxLQUFLLEVBQWhDLFNBQXdCLENBQUYsQ0FBVTtJQUN0QyxJQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFpQixJQUFJLENBQUMsQ0FBQTtJQUMzQyxJQUFBLEtBQUEsT0FBOEIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFxQixDQUFDLElBQUEsRUFBbEUsVUFBVSxRQUFBLEVBQUUsYUFBYSxRQUF5QyxDQUFBO0lBQ3pFLEtBQUssQ0FBQyxTQUFTLENBQUM7UUFDZCxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUU7WUFDbEIsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLE9BQStCLENBQUE7WUFDeEQsT0FDRSxPQUFPLFdBQVcsS0FBSyxRQUFRO2dCQUMvQixDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxFQUNoRDtnQkFDQSxJQUFJLFdBQVcsQ0FBQyxhQUFhO29CQUFFLFdBQVcsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFBO2FBQ3ZFO1lBQ0QsSUFBSSxPQUFPLFdBQVcsS0FBSyxRQUFRLEVBQUU7Z0JBQ25DLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQTthQUM3RDtTQUNGO0lBQ0gsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ04sT0FBTyxDQUNMLHdDQUNNLFVBQVUsSUFDZCxHQUFHLEVBQUUsTUFBTSxFQUNYLEtBQUssd0JBQ0EsS0FBSyxHQUNMLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsWUFBQSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUV2QyxDQUNILENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyJ1xuXG4vKipcbiAqIENTUyBpcyBhIGJpdCBsYWNraW5nIHdoZW4gaXQgY29tZXMgdG8gaW5oZXJpdGluZyBiYWNrZ3JvdW5kcywgc28gdGhpcyBsZXQncyB0aGUgZGV2IGRvIHNvIGEgYml0IGVhc2llclxuICovXG5jb25zdCBCYWNrZ3JvdW5kSW5oZXJpdGluZ0RpdiA9IChwcm9wczogUmVhY3QuQ29tcG9uZW50UHJvcHM8J2Rpdic+KSA9PiB7XG4gIGNvbnN0IHsgc3R5bGUsIC4uLm90aGVyUHJvcHMgfSA9IHByb3BzXG4gIGNvbnN0IGRpdlJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbClcbiAgY29uc3QgW2JhY2tncm91bmQsIHNldEJhY2tncm91bmRdID0gUmVhY3QudXNlU3RhdGUobnVsbCBhcyBudWxsIHwgc3RyaW5nKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChkaXZSZWYuY3VycmVudCkge1xuICAgICAgbGV0IHBhcmVudENvbG9yID0gZGl2UmVmLmN1cnJlbnQgYXMgc3RyaW5nIHwgSFRNTEVsZW1lbnRcbiAgICAgIHdoaWxlIChcbiAgICAgICAgdHlwZW9mIHBhcmVudENvbG9yICE9PSAnc3RyaW5nJyAmJlxuICAgICAgICAhcGFyZW50Q29sb3IuY2xhc3NMaXN0LmNvbnRhaW5zKCdNdWlQYXBlci1yb290JylcbiAgICAgICkge1xuICAgICAgICBpZiAocGFyZW50Q29sb3IucGFyZW50RWxlbWVudCkgcGFyZW50Q29sb3IgPSBwYXJlbnRDb2xvci5wYXJlbnRFbGVtZW50XG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHBhcmVudENvbG9yICE9PSAnc3RyaW5nJykge1xuICAgICAgICBzZXRCYWNrZ3JvdW5kKGdldENvbXB1dGVkU3R5bGUocGFyZW50Q29sb3IpLmJhY2tncm91bmRDb2xvcilcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtdKVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIHsuLi5vdGhlclByb3BzfVxuICAgICAgcmVmPXtkaXZSZWZ9XG4gICAgICBzdHlsZT17e1xuICAgICAgICAuLi5zdHlsZSxcbiAgICAgICAgLi4uKGJhY2tncm91bmQgPyB7IGJhY2tncm91bmQgfSA6IHt9KSxcbiAgICAgIH19XG4gICAgLz5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShCYWNrZ3JvdW5kSW5oZXJpdGluZ0RpdilcbiJdfQ==