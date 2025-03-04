import { __assign } from "tslib";
import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { Drawing } from '../singletons/drawing';
/**
 * Same as ClickAwayListener, but doesn't trigger onClickAway if the click was in a menu.  Also adds using escape to escape.
 * @param props
 */
export var BetterClickAwayListener = function (props) {
    React.useEffect(function () {
        var callback = function (e) {
            if (e.keyCode === 27) {
                props.onClickAway(e);
            }
        };
        document.addEventListener('keyup', callback);
        return function () {
            document.removeEventListener('keyup', callback);
        };
    }, []);
    return (_jsx(ClickAwayListener, __assign({}, props, { onClickAway: function (e) {
            /**
             * Should we be doing a querySelectorAll and seeing if anything on the page contains the element?  I feel like this could fail in certain instances.
             */
            if (Drawing.isFuzzyDrawing()) {
                return;
            }
            var dialog = document.querySelector('.MuiDialog-root');
            var menu = document.querySelector('#menu-');
            var probablyDropdown = document.querySelector('div[style*="transform: translateX(calc((-50%"]') ||
                document.querySelector('div[style*="transform: translateX(calc(-50%"]');
            // needed for regular old selects
            if (document.activeElement &&
                document.activeElement.classList.contains('MuiListItem-root')) {
                return;
            }
            if (dialog && dialog.contains(e.target)) {
                return;
            }
            if (menu && menu.contains(e.target)) {
                return;
            }
            if (probablyDropdown &&
                probablyDropdown.contains(e.target)) {
                return;
            }
            if (props.onClickAway)
                props.onClickAway(e);
        } })));
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmV0dGVyLWNsaWNrLWF3YXktbGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2JldHRlci1jbGljay1hd2F5LWxpc3RlbmVyL2JldHRlci1jbGljay1hd2F5LWxpc3RlbmVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8saUJBRU4sTUFBTSxpQ0FBaUMsQ0FBQTtBQUN4QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFNL0M7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLElBQU0sdUJBQXVCLEdBQUcsVUFDckMsS0FBbUM7SUFFbkMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUNkLElBQU0sUUFBUSxHQUFHLFVBQUMsQ0FBZ0I7WUFDaEMsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUNyQixLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ3RCLENBQUM7UUFDSCxDQUFDLENBQUE7UUFDRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQzVDLE9BQU87WUFDTCxRQUFRLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ2pELENBQUMsQ0FBQTtJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUNOLE9BQU8sQ0FDTCxLQUFDLGlCQUFpQixlQUNaLEtBQUssSUFDVCxXQUFXLEVBQUUsVUFBQyxDQUFDO1lBQ2I7O2VBRUc7WUFDSCxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO2dCQUM3QixPQUFNO1lBQ1IsQ0FBQztZQUNELElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtZQUN4RCxJQUFNLElBQUksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQzdDLElBQU0sZ0JBQWdCLEdBQ3BCLFFBQVEsQ0FBQyxhQUFhLENBQ3BCLGdEQUFnRCxDQUNqRDtnQkFDRCxRQUFRLENBQUMsYUFBYSxDQUNwQiwrQ0FBK0MsQ0FDaEQsQ0FBQTtZQUNILGlDQUFpQztZQUNqQyxJQUNFLFFBQVEsQ0FBQyxhQUFhO2dCQUN0QixRQUFRLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsRUFDN0QsQ0FBQztnQkFDRCxPQUFNO1lBQ1IsQ0FBQztZQUNELElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQXlCLENBQUMsRUFBRSxDQUFDO2dCQUMzRCxPQUFNO1lBQ1IsQ0FBQztZQUNELElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQXlCLENBQUMsRUFBRSxDQUFDO2dCQUN2RCxPQUFNO1lBQ1IsQ0FBQztZQUNELElBQ0UsZ0JBQWdCO2dCQUNoQixnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQXlCLENBQUMsRUFDdEQsQ0FBQztnQkFDRCxPQUFNO1lBQ1IsQ0FBQztZQUNELElBQUksS0FBSyxDQUFDLFdBQVc7Z0JBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QyxDQUFDLElBQ0QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgQ2xpY2tBd2F5TGlzdGVuZXIsIHtcbiAgQ2xpY2tBd2F5TGlzdGVuZXJQcm9wcyxcbn0gZnJvbSAnQG11aS9tYXRlcmlhbC9DbGlja0F3YXlMaXN0ZW5lcidcbmltcG9ydCB7IERyYXdpbmcgfSBmcm9tICcuLi9zaW5nbGV0b25zL2RyYXdpbmcnXG5cbnR5cGUgQmV0dGVyQ2xpY2tBd2F5TGlzdGVuZXJQcm9wcyA9IENsaWNrQXdheUxpc3RlbmVyUHJvcHMgJiB7XG4gIG9uQ2xpY2tBd2F5OiAoZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQ8RG9jdW1lbnQ+IHwgS2V5Ym9hcmRFdmVudCkgPT4gdm9pZFxufVxuXG4vKipcbiAqIFNhbWUgYXMgQ2xpY2tBd2F5TGlzdGVuZXIsIGJ1dCBkb2Vzbid0IHRyaWdnZXIgb25DbGlja0F3YXkgaWYgdGhlIGNsaWNrIHdhcyBpbiBhIG1lbnUuICBBbHNvIGFkZHMgdXNpbmcgZXNjYXBlIHRvIGVzY2FwZS5cbiAqIEBwYXJhbSBwcm9wc1xuICovXG5leHBvcnQgY29uc3QgQmV0dGVyQ2xpY2tBd2F5TGlzdGVuZXIgPSAoXG4gIHByb3BzOiBCZXR0ZXJDbGlja0F3YXlMaXN0ZW5lclByb3BzXG4pID0+IHtcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBjYWxsYmFjayA9IChlOiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZS5rZXlDb2RlID09PSAyNykge1xuICAgICAgICBwcm9wcy5vbkNsaWNrQXdheShlKVxuICAgICAgfVxuICAgIH1cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGNhbGxiYWNrKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXl1cCcsIGNhbGxiYWNrKVxuICAgIH1cbiAgfSwgW10pXG4gIHJldHVybiAoXG4gICAgPENsaWNrQXdheUxpc3RlbmVyXG4gICAgICB7Li4ucHJvcHN9XG4gICAgICBvbkNsaWNrQXdheT17KGUpID0+IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNob3VsZCB3ZSBiZSBkb2luZyBhIHF1ZXJ5U2VsZWN0b3JBbGwgYW5kIHNlZWluZyBpZiBhbnl0aGluZyBvbiB0aGUgcGFnZSBjb250YWlucyB0aGUgZWxlbWVudD8gIEkgZmVlbCBsaWtlIHRoaXMgY291bGQgZmFpbCBpbiBjZXJ0YWluIGluc3RhbmNlcy5cbiAgICAgICAgICovXG4gICAgICAgIGlmIChEcmF3aW5nLmlzRnV6enlEcmF3aW5nKCkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkaWFsb2cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuTXVpRGlhbG9nLXJvb3QnKVxuICAgICAgICBjb25zdCBtZW51ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21lbnUtJylcbiAgICAgICAgY29uc3QgcHJvYmFibHlEcm9wZG93biA9XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICAgICdkaXZbc3R5bGUqPVwidHJhbnNmb3JtOiB0cmFuc2xhdGVYKGNhbGMoKC01MCVcIl0nXG4gICAgICAgICAgKSB8fFxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgICAnZGl2W3N0eWxlKj1cInRyYW5zZm9ybTogdHJhbnNsYXRlWChjYWxjKC01MCVcIl0nXG4gICAgICAgICAgKVxuICAgICAgICAvLyBuZWVkZWQgZm9yIHJlZ3VsYXIgb2xkIHNlbGVjdHNcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiZcbiAgICAgICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmNsYXNzTGlzdC5jb250YWlucygnTXVpTGlzdEl0ZW0tcm9vdCcpXG4gICAgICAgICkge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIGlmIChkaWFsb2cgJiYgZGlhbG9nLmNvbnRhaW5zKGUudGFyZ2V0IGFzIEhUTUxCYXNlRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAobWVudSAmJiBtZW51LmNvbnRhaW5zKGUudGFyZ2V0IGFzIEhUTUxCYXNlRWxlbWVudCkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgcHJvYmFibHlEcm9wZG93biAmJlxuICAgICAgICAgIHByb2JhYmx5RHJvcGRvd24uY29udGFpbnMoZS50YXJnZXQgYXMgSFRNTEJhc2VFbGVtZW50KVxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvcHMub25DbGlja0F3YXkpIHByb3BzLm9uQ2xpY2tBd2F5KGUpXG4gICAgICB9fVxuICAgIC8+XG4gIClcbn1cbiJdfQ==