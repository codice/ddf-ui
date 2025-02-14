import { __assign } from "tslib";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { lazy } from 'react';
import App, { useDefaultWelcome } from './app';
import SourcesPageIcon from '@mui/icons-material/Cloud';
import AboutPageIcon from '@mui/icons-material/Info';
import FolderIcon from '@mui/icons-material/Folder';
import TrashIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ImageSearch from '@mui/icons-material/ImageSearch';
import ExtensionPoints from '../../extension-points/extension-points';
import { BaseSettings } from '../../react-component/user-settings/user-settings';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import { Navigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import selectionInterfaceModel from '../selection-interface/selection-interface.model';
import { Query } from '../../js/model/TypedQuery';
import { SuspenseWrapper } from './suspense';
import Skeleton from '@mui/material/Skeleton';
var UserNotifications = lazy(function () { return import('../../react-component/user-notifications/user-notifications'); });
var Help = lazy(function () { return import('../help/help.view'); });
var HomePage = lazy(function () { return import('../pages/search'); });
var IngestDetailsViewReact = lazy(function () {
    return import('../ingest-details/ingest-details.view').then(function (m) { return ({
        default: m.IngestDetailsViewReact,
    }); });
});
var SourcesPage = lazy(function () { return import('../../react-component/sources/presentation'); });
var AboutPage = lazy(function () { return import('../../react-component/about'); });
var MetacardNavRoute = lazy(function () { return import('../pages/metacard-nav'); });
var MetacardRoute = lazy(function () { return import('../pages/metacard'); });
var SavedSearches = lazy(function () { return import('../pages/browse'); });
var Open = lazy(function () { return import('../pages/open'); });
var Restore = lazy(function () { return import('../pages/restore'); });
var Create = lazy(function () { return import('../pages/create'); });
var GoldenLayoutViewReact = lazy(function () { return import('../golden-layout/golden-layout.view'); });
/**
 *  Wraps each route in suspense and provides a loading fallback - use the provided components that wrap this (CommonRouteContainer, ComplexRouteContainer)
 */
var RouteContainer = function (_a) {
    var children = _a.children, className = _a.className, _b = _a.isSingleContainer, isSingleContainer = _b === void 0 ? true : _b, suspenseProps = _a.suspenseProps;
    return (_jsx("div", { className: "w-full h-full overflow-hidden ".concat(isSingleContainer ? 'pb-2 pt-2 pr-2' : '', " ").concat(className), children: _jsx(SuspenseWrapper, __assign({}, suspenseProps, { fallback: (suspenseProps === null || suspenseProps === void 0 ? void 0 : suspenseProps.fallback) || (_jsx(Paper, { elevation: Elevations.panels, className: "w-full h-full", children: _jsx(Skeleton, { variant: "rectangular", width: "100%", height: "100%" }) })), children: isSingleContainer ? (_jsx(Paper, { elevation: Elevations.panels, className: "w-full h-full", children: children })) : (children) })) }));
};
// for routes that are just a single paper element
export var CommonRouteContainer = function (_a) {
    var children = _a.children, className = _a.className, suspenseProps = _a.suspenseProps;
    return (_jsx(RouteContainer, { isSingleContainer: true, className: className, suspenseProps: suspenseProps, children: children }));
};
// for routes that need finer control over the layout (separate header and content for example)
export var ComplexRouteContainer = function (_a) {
    var children = _a.children, suspenseProps = _a.suspenseProps;
    return (_jsx(RouteContainer, { isSingleContainer: false, suspenseProps: suspenseProps, children: children }));
};
/**
 * The issue with the original golden layout code for popout is that it will go to the current route and then load gl and all that.
 *
 * However, usually there are things on the route we don't want to run (for performance sometimes, and for other times because they reset prefs or whatnot to clear things)
 *
 * As a result, we have this route that is just for the popout, it doesn't show in the nav, and it doesn't run the other things on the route
 *
 * We have to have an instance of golden layout for the popout to attach to, which this provides, with a query that's blank (just so we can transfer results and what not to it)
 */
export var GoldenLayoutPopoutRoute = {
    routeProps: {
        path: '/_gl_popout',
        Component: function () {
            var baseQuery = Query();
            return (_jsx(CommonRouteContainer, { children: _jsx(GoldenLayoutViewReact, { selectionInterface: new selectionInterfaceModel({ currentQuery: baseQuery }), setGoldenLayout: function () { }, configName: "goldenLayout" }) }));
        },
    },
    showInNav: false,
};
var RouteInformation = [
    {
        showInNav: false,
        routeProps: {
            path: '/',
            Component: function () { return _jsx(Navigate, { to: "/search", replace: true }); },
        },
    },
    {
        showInNav: false,
        routeProps: {
            path: '/uploads/:uploadId',
            Component: function () { return (_jsx(CommonRouteContainer, { children: _jsx(MetacardRoute, {}) })); },
        },
    },
    {
        showInNav: false,
        routeProps: {
            path: '/metacards/:metacardId',
            Component: function () { return (_jsx(ComplexRouteContainer, { children: _jsxs("div", { className: "flex flex-col w-full h-full", children: [_jsx("div", { className: "w-full h-16 z-1 relative pt-2 pr-2", children: _jsx(Paper, { elevation: Elevations.panels, className: "w-full h-full px-3", children: _jsx(SuspenseWrapper, { children: _jsx(MetacardNavRoute, {}) }) }) }), _jsx("div", { className: "w-full h-full z-0 relative overflow-hidden", children: _jsx(SuspenseWrapper, { children: _jsx(MetacardRoute, {}) }) })] }) })); },
        },
    },
    {
        navButtonProps: {
            expandedLabel: 'Search',
            unexpandedLabel: 'Search',
            Icon: SearchIcon,
            dataId: 'search',
        },
        routeProps: {
            path: '/search',
            Component: function () { return (_jsx(ComplexRouteContainer, { suspenseProps: {
                    fallback: (_jsxs("div", { className: "w-full h-full flex flex-row flex-nowrap", children: [_jsx("div", { className: "w-[550px] h-full py-2 shrink-0 grow-0", children: _jsx(Paper, { elevation: Elevations.panels, className: "w-full h-full", children: _jsx(Skeleton, { variant: "rectangular", width: "100%", height: "100%" }) }) }), _jsx("div", { className: "w-full h-full shrink grow py-2 px-2", children: _jsx(Paper, { elevation: Elevations.panels, className: "w-full h-full", children: _jsx(Skeleton, { variant: "rectangular", width: "100%", height: "100%" }) }) })] })),
                }, children: _jsx(HomePage, {}) })); },
        },
        linkProps: {
            to: '/search',
        },
        showInNav: true,
    },
    {
        showInNav: false,
        routeProps: {
            path: '/search/:id',
            Component: function () { return (_jsx(ComplexRouteContainer, { suspenseProps: {
                    fallback: (_jsxs("div", { className: "w-full h-full flex flex-row flex-nowrap", children: [_jsx("div", { className: "w-[550px] h-full py-2 shrink-0 grow-0", children: _jsx(Paper, { elevation: Elevations.panels, className: "w-full h-full", children: _jsx(Skeleton, { variant: "rectangular", width: "100%", height: "100%" }) }) }), _jsx("div", { className: "w-full h-full shrink grow py-2 px-2", children: _jsx(Paper, { elevation: Elevations.panels, className: "w-full h-full", children: _jsx(Skeleton, { variant: "rectangular", width: "100%", height: "100%" }) }) })] })),
                }, children: _jsx(HomePage, {}) })); },
        },
    },
    {
        navButtonProps: {
            expandedLabel: 'Create',
            unexpandedLabel: 'Create',
            Icon: AddIcon,
            dataId: 'create',
        },
        routeProps: {
            path: '/create',
            Component: function () { return (_jsx(CommonRouteContainer, { children: _jsx(Create, {}) })); },
        },
        linkProps: {
            to: '/create',
        },
        showInNav: true,
    },
    {
        navButtonProps: {
            expandedLabel: 'Open',
            unexpandedLabel: 'Open',
            Icon: FolderIcon,
            dataId: 'open',
        },
        routeProps: {
            path: '/open',
            Component: function () { return (_jsx(CommonRouteContainer, { children: _jsx(Open, {}) })); },
        },
        linkProps: {
            to: '/open',
        },
        showInNav: true,
    },
    {
        navButtonProps: {
            expandedLabel: 'Browse',
            unexpandedLabel: 'Browse',
            Icon: ViewListIcon,
            dataId: 'browse',
        },
        routeProps: {
            path: '/browse',
            Component: function () { return (_jsx(CommonRouteContainer, { children: _jsx(SavedSearches, {}) })); },
        },
        linkProps: {
            to: '/browse',
        },
        showInNav: true,
    },
    {
        navButtonProps: {
            expandedLabel: 'Upload',
            unexpandedLabel: 'Upload',
            Icon: ImageSearch,
            dataId: 'upload',
        },
        routeProps: {
            path: '/upload',
            Component: function () { return (_jsx(CommonRouteContainer, { children: _jsx(IngestDetailsViewReact, {}) })); },
        },
        linkProps: {
            to: '/upload',
        },
        showInNav: true,
    },
    {
        navButtonProps: {
            expandedLabel: 'Sources',
            unexpandedLabel: 'Sources',
            Icon: SourcesPageIcon,
            dataId: 'sources',
        },
        routeProps: {
            path: '/sources',
            Component: function () { return (_jsx(CommonRouteContainer, { children: _jsx(SourcesPage, {}) })); },
        },
        linkProps: {
            to: '/sources',
        },
        showInNav: true,
    },
    {
        navButtonProps: {
            expandedLabel: 'Restore',
            unexpandedLabel: 'Restore',
            Icon: TrashIcon,
            dataId: 'restore',
        },
        routeProps: {
            path: '/restore',
            Component: function () { return (_jsx(CommonRouteContainer, { children: _jsx(Restore, {}) })); },
        },
        linkProps: {
            to: '/restore',
        },
        showInNav: true,
    },
    {
        navButtonProps: {
            expandedLabel: 'About',
            unexpandedLabel: 'About',
            Icon: AboutPageIcon,
            dataId: 'about',
        },
        routeProps: {
            path: '/about',
            Component: function () { return (_jsx(CommonRouteContainer, { children: _jsx(AboutPage, {}) })); },
        },
        linkProps: {
            to: '/about',
        },
        showInNav: true,
    },
    GoldenLayoutPopoutRoute,
];
/**
 * Shows how downstream apps utilize the shell this app provides
 */
var BaseApp = function () {
    useDefaultWelcome();
    return (_jsxs(_Fragment, { children: [_jsx(SuspenseWrapper, { children: _jsx(Help, {}) }), _jsx(App, { RouteInformation: RouteInformation, NotificationsComponent: function () { return _jsx(UserNotifications, {}); }, SettingsComponents: BaseSettings })] }));
};
var WrappedWithProviders = function () {
    return (_jsx(ExtensionPoints.providers, { children: _jsx(BaseApp, {}) }));
};
export default WrappedWithProviders;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1hcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2FwcC9iYXNlLWFwcC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixNQUFNLE9BQU8sQ0FBQTtBQUMzQyxPQUFPLEdBQUcsRUFBRSxFQUF1QixpQkFBaUIsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUVuRSxPQUFPLGVBQWUsTUFBTSwyQkFBMkIsQ0FBQTtBQUN2RCxPQUFPLGFBQWEsTUFBTSwwQkFBMEIsQ0FBQTtBQUNwRCxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLFNBQVMsTUFBTSw0QkFBNEIsQ0FBQTtBQUNsRCxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLFdBQVcsTUFBTSxpQ0FBaUMsQ0FBQTtBQUN6RCxPQUFPLGVBQWUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNyRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sbURBQW1ELENBQUE7QUFDaEYsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQzNDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUMzQyxPQUFPLE9BQU8sTUFBTSx5QkFBeUIsQ0FBQTtBQUM3QyxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQTtBQUN2RCxPQUFPLHVCQUF1QixNQUFNLGtEQUFrRCxDQUFBO0FBQ3RGLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQTtBQUNqRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFBO0FBQzVDLE9BQU8sUUFBUSxNQUFNLHdCQUF3QixDQUFBO0FBRTdDLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUM1QixjQUFNLE9BQUEs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QUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxvQkFBb0IsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGxhenksIFN1c3BlbnNlUHJvcHMgfSBmcm9tICdyZWFjdCdcbmltcG9ydCBBcHAsIHsgSW5kaXZpZHVhbFJvdXRlVHlwZSwgdXNlRGVmYXVsdFdlbGNvbWUgfSBmcm9tICcuL2FwcCdcblxuaW1wb3J0IFNvdXJjZXNQYWdlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0Nsb3VkJ1xuaW1wb3J0IEFib3V0UGFnZUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9JbmZvJ1xuaW1wb3J0IEZvbGRlckljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9Gb2xkZXInXG5pbXBvcnQgVHJhc2hJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvRGVsZXRlJ1xuaW1wb3J0IFNlYXJjaEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9TZWFyY2gnXG5pbXBvcnQgSW1hZ2VTZWFyY2ggZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9JbWFnZVNlYXJjaCdcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vZXh0ZW5zaW9uLXBvaW50cy9leHRlbnNpb24tcG9pbnRzJ1xuaW1wb3J0IHsgQmFzZVNldHRpbmdzIH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3VzZXItc2V0dGluZ3MvdXNlci1zZXR0aW5ncydcbmltcG9ydCBQYXBlciBmcm9tICdAbXVpL21hdGVyaWFsL1BhcGVyJ1xuaW1wb3J0IHsgRWxldmF0aW9ucyB9IGZyb20gJy4uL3RoZW1lL3RoZW1lJ1xuaW1wb3J0IHsgTmF2aWdhdGUgfSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xuaW1wb3J0IEFkZEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9BZGQnXG5pbXBvcnQgVmlld0xpc3RJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvVmlld0xpc3QnXG5pbXBvcnQgc2VsZWN0aW9uSW50ZXJmYWNlTW9kZWwgZnJvbSAnLi4vc2VsZWN0aW9uLWludGVyZmFjZS9zZWxlY3Rpb24taW50ZXJmYWNlLm1vZGVsJ1xuaW1wb3J0IHsgUXVlcnkgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9UeXBlZFF1ZXJ5J1xuaW1wb3J0IHsgU3VzcGVuc2VXcmFwcGVyIH0gZnJvbSAnLi9zdXNwZW5zZSdcbmltcG9ydCBTa2VsZXRvbiBmcm9tICdAbXVpL21hdGVyaWFsL1NrZWxldG9uJ1xuXG5jb25zdCBVc2VyTm90aWZpY2F0aW9ucyA9IGxhenkoXG4gICgpID0+IGltcG9ydCgnLi4vLi4vcmVhY3QtY29tcG9uZW50L3VzZXItbm90aWZpY2F0aW9ucy91c2VyLW5vdGlmaWNhdGlvbnMnKVxuKVxuY29uc3QgSGVscCA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9oZWxwL2hlbHAudmlldycpKVxuY29uc3QgSG9tZVBhZ2UgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vcGFnZXMvc2VhcmNoJykpXG5jb25zdCBJbmdlc3REZXRhaWxzVmlld1JlYWN0ID0gbGF6eSgoKSA9PlxuICBpbXBvcnQoJy4uL2luZ2VzdC1kZXRhaWxzL2luZ2VzdC1kZXRhaWxzLnZpZXcnKS50aGVuKChtKSA9PiAoe1xuICAgIGRlZmF1bHQ6IG0uSW5nZXN0RGV0YWlsc1ZpZXdSZWFjdCxcbiAgfSkpXG4pXG5jb25zdCBTb3VyY2VzUGFnZSA9IGxhenkoXG4gICgpID0+IGltcG9ydCgnLi4vLi4vcmVhY3QtY29tcG9uZW50L3NvdXJjZXMvcHJlc2VudGF0aW9uJylcbilcbmNvbnN0IEFib3V0UGFnZSA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi8uLi9yZWFjdC1jb21wb25lbnQvYWJvdXQnKSlcbmNvbnN0IE1ldGFjYXJkTmF2Um91dGUgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vcGFnZXMvbWV0YWNhcmQtbmF2JykpXG5jb25zdCBNZXRhY2FyZFJvdXRlID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL3BhZ2VzL21ldGFjYXJkJykpXG5jb25zdCBTYXZlZFNlYXJjaGVzID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL3BhZ2VzL2Jyb3dzZScpKVxuY29uc3QgT3BlbiA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9wYWdlcy9vcGVuJykpXG5jb25zdCBSZXN0b3JlID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL3BhZ2VzL3Jlc3RvcmUnKSlcbmNvbnN0IENyZWF0ZSA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9wYWdlcy9jcmVhdGUnKSlcbmNvbnN0IEdvbGRlbkxheW91dFZpZXdSZWFjdCA9IGxhenkoXG4gICgpID0+IGltcG9ydCgnLi4vZ29sZGVuLWxheW91dC9nb2xkZW4tbGF5b3V0LnZpZXcnKVxuKVxuXG4vKipcbiAqICBXcmFwcyBlYWNoIHJvdXRlIGluIHN1c3BlbnNlIGFuZCBwcm92aWRlcyBhIGxvYWRpbmcgZmFsbGJhY2sgLSB1c2UgdGhlIHByb3ZpZGVkIGNvbXBvbmVudHMgdGhhdCB3cmFwIHRoaXMgKENvbW1vblJvdXRlQ29udGFpbmVyLCBDb21wbGV4Um91dGVDb250YWluZXIpXG4gKi9cbmNvbnN0IFJvdXRlQ29udGFpbmVyID0gKHtcbiAgY2hpbGRyZW4sXG4gIGNsYXNzTmFtZSxcbiAgaXNTaW5nbGVDb250YWluZXIgPSB0cnVlLFxuICBzdXNwZW5zZVByb3BzLFxufToge1xuICBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlXG4gIGNsYXNzTmFtZT86IHN0cmluZ1xuICBpc1NpbmdsZUNvbnRhaW5lcj86IGJvb2xlYW5cbiAgc3VzcGVuc2VQcm9wcz86IFN1c3BlbnNlUHJvcHNcbn0pID0+IHtcbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgaC1mdWxsIG92ZXJmbG93LWhpZGRlbiAke1xuICAgICAgICBpc1NpbmdsZUNvbnRhaW5lciA/ICdwYi0yIHB0LTIgcHItMicgOiAnJ1xuICAgICAgfSAke2NsYXNzTmFtZX1gfVxuICAgID5cbiAgICAgIDxTdXNwZW5zZVdyYXBwZXJcbiAgICAgICAgey4uLnN1c3BlbnNlUHJvcHN9XG4gICAgICAgIGZhbGxiYWNrPXtcbiAgICAgICAgICBzdXNwZW5zZVByb3BzPy5mYWxsYmFjayB8fCAoXG4gICAgICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc30gY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgICA8U2tlbGV0b24gdmFyaWFudD1cInJlY3Rhbmd1bGFyXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIC8+XG4gICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgPlxuICAgICAgICB7aXNTaW5nbGVDb250YWluZXIgPyAoXG4gICAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5wYW5lbHN9IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIj5cbiAgICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICApIDogKFxuICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICl9XG4gICAgICA8L1N1c3BlbnNlV3JhcHBlcj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG4vLyBmb3Igcm91dGVzIHRoYXQgYXJlIGp1c3QgYSBzaW5nbGUgcGFwZXIgZWxlbWVudFxuZXhwb3J0IGNvbnN0IENvbW1vblJvdXRlQ29udGFpbmVyID0gKHtcbiAgY2hpbGRyZW4sXG4gIGNsYXNzTmFtZSxcbiAgc3VzcGVuc2VQcm9wcyxcbn06IHtcbiAgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZVxuICBjbGFzc05hbWU/OiBzdHJpbmdcbiAgc3VzcGVuc2VQcm9wcz86IFN1c3BlbnNlUHJvcHNcbn0pID0+IHtcbiAgcmV0dXJuIChcbiAgICA8Um91dGVDb250YWluZXJcbiAgICAgIGlzU2luZ2xlQ29udGFpbmVyPXt0cnVlfVxuICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICBzdXNwZW5zZVByb3BzPXtzdXNwZW5zZVByb3BzfVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L1JvdXRlQ29udGFpbmVyPlxuICApXG59XG5cbi8vIGZvciByb3V0ZXMgdGhhdCBuZWVkIGZpbmVyIGNvbnRyb2wgb3ZlciB0aGUgbGF5b3V0IChzZXBhcmF0ZSBoZWFkZXIgYW5kIGNvbnRlbnQgZm9yIGV4YW1wbGUpXG5leHBvcnQgY29uc3QgQ29tcGxleFJvdXRlQ29udGFpbmVyID0gKHtcbiAgY2hpbGRyZW4sXG4gIHN1c3BlbnNlUHJvcHMsXG59OiB7XG4gIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGVcbiAgc3VzcGVuc2VQcm9wcz86IFN1c3BlbnNlUHJvcHNcbn0pID0+IHtcbiAgcmV0dXJuIChcbiAgICA8Um91dGVDb250YWluZXIgaXNTaW5nbGVDb250YWluZXI9e2ZhbHNlfSBzdXNwZW5zZVByb3BzPXtzdXNwZW5zZVByb3BzfT5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L1JvdXRlQ29udGFpbmVyPlxuICApXG59XG5cbi8qKlxuICogVGhlIGlzc3VlIHdpdGggdGhlIG9yaWdpbmFsIGdvbGRlbiBsYXlvdXQgY29kZSBmb3IgcG9wb3V0IGlzIHRoYXQgaXQgd2lsbCBnbyB0byB0aGUgY3VycmVudCByb3V0ZSBhbmQgdGhlbiBsb2FkIGdsIGFuZCBhbGwgdGhhdC5cbiAqXG4gKiBIb3dldmVyLCB1c3VhbGx5IHRoZXJlIGFyZSB0aGluZ3Mgb24gdGhlIHJvdXRlIHdlIGRvbid0IHdhbnQgdG8gcnVuIChmb3IgcGVyZm9ybWFuY2Ugc29tZXRpbWVzLCBhbmQgZm9yIG90aGVyIHRpbWVzIGJlY2F1c2UgdGhleSByZXNldCBwcmVmcyBvciB3aGF0bm90IHRvIGNsZWFyIHRoaW5ncylcbiAqXG4gKiBBcyBhIHJlc3VsdCwgd2UgaGF2ZSB0aGlzIHJvdXRlIHRoYXQgaXMganVzdCBmb3IgdGhlIHBvcG91dCwgaXQgZG9lc24ndCBzaG93IGluIHRoZSBuYXYsIGFuZCBpdCBkb2Vzbid0IHJ1biB0aGUgb3RoZXIgdGhpbmdzIG9uIHRoZSByb3V0ZVxuICpcbiAqIFdlIGhhdmUgdG8gaGF2ZSBhbiBpbnN0YW5jZSBvZiBnb2xkZW4gbGF5b3V0IGZvciB0aGUgcG9wb3V0IHRvIGF0dGFjaCB0bywgd2hpY2ggdGhpcyBwcm92aWRlcywgd2l0aCBhIHF1ZXJ5IHRoYXQncyBibGFuayAoanVzdCBzbyB3ZSBjYW4gdHJhbnNmZXIgcmVzdWx0cyBhbmQgd2hhdCBub3QgdG8gaXQpXG4gKi9cbmV4cG9ydCBjb25zdCBHb2xkZW5MYXlvdXRQb3BvdXRSb3V0ZTogSW5kaXZpZHVhbFJvdXRlVHlwZSA9IHtcbiAgcm91dGVQcm9wczoge1xuICAgIHBhdGg6ICcvX2dsX3BvcG91dCcsXG4gICAgQ29tcG9uZW50OiAoKSA9PiB7XG4gICAgICBjb25zdCBiYXNlUXVlcnkgPSBRdWVyeSgpXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8Q29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICAgICAgPEdvbGRlbkxheW91dFZpZXdSZWFjdFxuICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlPXtcbiAgICAgICAgICAgICAgbmV3IHNlbGVjdGlvbkludGVyZmFjZU1vZGVsKHsgY3VycmVudFF1ZXJ5OiBiYXNlUXVlcnkgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldEdvbGRlbkxheW91dD17KCkgPT4ge319XG4gICAgICAgICAgICBjb25maWdOYW1lPVwiZ29sZGVuTGF5b3V0XCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L0NvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgKVxuICAgIH0sXG4gIH0sXG4gIHNob3dJbk5hdjogZmFsc2UsXG59XG5cbmNvbnN0IFJvdXRlSW5mb3JtYXRpb246IEluZGl2aWR1YWxSb3V0ZVR5cGVbXSA9IFtcbiAge1xuICAgIHNob3dJbk5hdjogZmFsc2UsXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy8nLFxuICAgICAgQ29tcG9uZW50OiAoKSA9PiA8TmF2aWdhdGUgdG89XCIvc2VhcmNoXCIgcmVwbGFjZSAvPixcbiAgICB9LFxuICB9LFxuICB7XG4gICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBwYXRoOiAnL3VwbG9hZHMvOnVwbG9hZElkJyxcbiAgICAgIENvbXBvbmVudDogKCkgPT4gKFxuICAgICAgICA8Q29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICAgICAgPE1ldGFjYXJkUm91dGUgLz5cbiAgICAgICAgPC9Db21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICksXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIHNob3dJbk5hdjogZmFsc2UsXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9tZXRhY2FyZHMvOm1ldGFjYXJkSWQnLFxuICAgICAgQ29tcG9uZW50OiAoKSA9PiAoXG4gICAgICAgIDxDb21wbGV4Um91dGVDb250YWluZXI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIHctZnVsbCBoLWZ1bGxcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtMTYgei0xIHJlbGF0aXZlIHB0LTIgcHItMlwiPlxuICAgICAgICAgICAgICA8UGFwZXJcbiAgICAgICAgICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFuZWxzfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcHgtM1wiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8U3VzcGVuc2VXcmFwcGVyPlxuICAgICAgICAgICAgICAgICAgPE1ldGFjYXJkTmF2Um91dGUgLz5cbiAgICAgICAgICAgICAgICA8L1N1c3BlbnNlV3JhcHBlcj5cbiAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHotMCByZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICAgICAgPFN1c3BlbnNlV3JhcHBlcj5cbiAgICAgICAgICAgICAgICA8TWV0YWNhcmRSb3V0ZSAvPlxuICAgICAgICAgICAgICA8L1N1c3BlbnNlV3JhcHBlcj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0NvbXBsZXhSb3V0ZUNvbnRhaW5lcj5cbiAgICAgICksXG4gICAgfSxcbiAgfSxcbiAge1xuICAgIG5hdkJ1dHRvblByb3BzOiB7XG4gICAgICBleHBhbmRlZExhYmVsOiAnU2VhcmNoJyxcbiAgICAgIHVuZXhwYW5kZWRMYWJlbDogJ1NlYXJjaCcsXG4gICAgICBJY29uOiBTZWFyY2hJY29uLFxuICAgICAgZGF0YUlkOiAnc2VhcmNoJyxcbiAgICB9LFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIHBhdGg6ICcvc2VhcmNoJyxcbiAgICAgIENvbXBvbmVudDogKCkgPT4gKFxuICAgICAgICA8Q29tcGxleFJvdXRlQ29udGFpbmVyXG4gICAgICAgICAgc3VzcGVuc2VQcm9wcz17e1xuICAgICAgICAgICAgZmFsbGJhY2s6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIGZsZXggZmxleC1yb3cgZmxleC1ub3dyYXBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctWzU1MHB4XSBoLWZ1bGwgcHktMiBzaHJpbmstMCBncm93LTBcIj5cbiAgICAgICAgICAgICAgICAgIDxQYXBlclxuICAgICAgICAgICAgICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFuZWxzfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPFNrZWxldG9uXG4gICAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cInJlY3Rhbmd1bGFyXCJcbiAgICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjEwMCVcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgc2hyaW5rIGdyb3cgcHktMiBweC0yXCI+XG4gICAgICAgICAgICAgICAgICA8UGFwZXJcbiAgICAgICAgICAgICAgICAgICAgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc31cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxTa2VsZXRvblxuICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJyZWN0YW5ndWxhclwiXG4gICAgICAgICAgICAgICAgICAgICAgd2lkdGg9XCIxMDAlXCJcbiAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIxMDAlXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEhvbWVQYWdlIC8+XG4gICAgICAgIDwvQ29tcGxleFJvdXRlQ29udGFpbmVyPlxuICAgICAgKSxcbiAgICB9LFxuICAgIGxpbmtQcm9wczoge1xuICAgICAgdG86ICcvc2VhcmNoJyxcbiAgICB9LFxuICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIHNob3dJbk5hdjogZmFsc2UsXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9zZWFyY2gvOmlkJyxcbiAgICAgIENvbXBvbmVudDogKCkgPT4gKFxuICAgICAgICA8Q29tcGxleFJvdXRlQ29udGFpbmVyXG4gICAgICAgICAgc3VzcGVuc2VQcm9wcz17e1xuICAgICAgICAgICAgZmFsbGJhY2s6IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIGZsZXggZmxleC1yb3cgZmxleC1ub3dyYXBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctWzU1MHB4XSBoLWZ1bGwgcHktMiBzaHJpbmstMCBncm93LTBcIj5cbiAgICAgICAgICAgICAgICAgIDxQYXBlclxuICAgICAgICAgICAgICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFuZWxzfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPFNrZWxldG9uXG4gICAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cInJlY3Rhbmd1bGFyXCJcbiAgICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjEwMCVcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgc2hyaW5rIGdyb3cgcHktMiBweC0yXCI+XG4gICAgICAgICAgICAgICAgICA8UGFwZXJcbiAgICAgICAgICAgICAgICAgICAgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc31cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxTa2VsZXRvblxuICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJyZWN0YW5ndWxhclwiXG4gICAgICAgICAgICAgICAgICAgICAgd2lkdGg9XCIxMDAlXCJcbiAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9XCIxMDAlXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEhvbWVQYWdlIC8+XG4gICAgICAgIDwvQ29tcGxleFJvdXRlQ29udGFpbmVyPlxuICAgICAgKSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdDcmVhdGUnLFxuICAgICAgdW5leHBhbmRlZExhYmVsOiAnQ3JlYXRlJyxcbiAgICAgIEljb246IEFkZEljb24sXG4gICAgICBkYXRhSWQ6ICdjcmVhdGUnLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9jcmVhdGUnLFxuICAgICAgQ29tcG9uZW50OiAoKSA9PiAoXG4gICAgICAgIDxDb21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICAgICA8Q3JlYXRlIC8+XG4gICAgICAgIDwvQ29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICApLFxuICAgIH0sXG4gICAgbGlua1Byb3BzOiB7XG4gICAgICB0bzogJy9jcmVhdGUnLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdPcGVuJyxcbiAgICAgIHVuZXhwYW5kZWRMYWJlbDogJ09wZW4nLFxuICAgICAgSWNvbjogRm9sZGVySWNvbixcbiAgICAgIGRhdGFJZDogJ29wZW4nLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9vcGVuJyxcbiAgICAgIENvbXBvbmVudDogKCkgPT4gKFxuICAgICAgICA8Q29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICAgICAgPE9wZW4gLz5cbiAgICAgICAgPC9Db21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICksXG4gICAgfSxcbiAgICBsaW5rUHJvcHM6IHtcbiAgICAgIHRvOiAnL29wZW4nLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdCcm93c2UnLFxuICAgICAgdW5leHBhbmRlZExhYmVsOiAnQnJvd3NlJyxcbiAgICAgIEljb246IFZpZXdMaXN0SWNvbixcbiAgICAgIGRhdGFJZDogJ2Jyb3dzZScsXG4gICAgfSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBwYXRoOiAnL2Jyb3dzZScsXG4gICAgICBDb21wb25lbnQ6ICgpID0+IChcbiAgICAgICAgPENvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgICAgIDxTYXZlZFNlYXJjaGVzIC8+XG4gICAgICAgIDwvQ29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICApLFxuICAgIH0sXG4gICAgbGlua1Byb3BzOiB7XG4gICAgICB0bzogJy9icm93c2UnLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdVcGxvYWQnLFxuICAgICAgdW5leHBhbmRlZExhYmVsOiAnVXBsb2FkJyxcbiAgICAgIEljb246IEltYWdlU2VhcmNoLFxuICAgICAgZGF0YUlkOiAndXBsb2FkJyxcbiAgICB9LFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIHBhdGg6ICcvdXBsb2FkJyxcbiAgICAgIENvbXBvbmVudDogKCkgPT4gKFxuICAgICAgICA8Q29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICAgICAgPEluZ2VzdERldGFpbHNWaWV3UmVhY3QgLz5cbiAgICAgICAgPC9Db21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICksXG4gICAgfSxcbiAgICBsaW5rUHJvcHM6IHtcbiAgICAgIHRvOiAnL3VwbG9hZCcsXG4gICAgfSxcbiAgICBzaG93SW5OYXY6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBuYXZCdXR0b25Qcm9wczoge1xuICAgICAgZXhwYW5kZWRMYWJlbDogJ1NvdXJjZXMnLFxuICAgICAgdW5leHBhbmRlZExhYmVsOiAnU291cmNlcycsXG4gICAgICBJY29uOiBTb3VyY2VzUGFnZUljb24sXG4gICAgICBkYXRhSWQ6ICdzb3VyY2VzJyxcbiAgICB9LFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIHBhdGg6ICcvc291cmNlcycsXG4gICAgICBDb21wb25lbnQ6ICgpID0+IChcbiAgICAgICAgPENvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgICAgIDxTb3VyY2VzUGFnZSAvPlxuICAgICAgICA8L0NvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgKSxcbiAgICB9LFxuICAgIGxpbmtQcm9wczoge1xuICAgICAgdG86ICcvc291cmNlcycsXG4gICAgfSxcbiAgICBzaG93SW5OYXY6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBuYXZCdXR0b25Qcm9wczoge1xuICAgICAgZXhwYW5kZWRMYWJlbDogJ1Jlc3RvcmUnLFxuICAgICAgdW5leHBhbmRlZExhYmVsOiAnUmVzdG9yZScsXG4gICAgICBJY29uOiBUcmFzaEljb24sXG4gICAgICBkYXRhSWQ6ICdyZXN0b3JlJyxcbiAgICB9LFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIHBhdGg6ICcvcmVzdG9yZScsXG4gICAgICBDb21wb25lbnQ6ICgpID0+IChcbiAgICAgICAgPENvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgICAgIDxSZXN0b3JlIC8+XG4gICAgICAgIDwvQ29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICApLFxuICAgIH0sXG4gICAgbGlua1Byb3BzOiB7XG4gICAgICB0bzogJy9yZXN0b3JlJyxcbiAgICB9LFxuICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIG5hdkJ1dHRvblByb3BzOiB7XG4gICAgICBleHBhbmRlZExhYmVsOiAnQWJvdXQnLFxuICAgICAgdW5leHBhbmRlZExhYmVsOiAnQWJvdXQnLFxuICAgICAgSWNvbjogQWJvdXRQYWdlSWNvbixcbiAgICAgIGRhdGFJZDogJ2Fib3V0JyxcbiAgICB9LFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIHBhdGg6ICcvYWJvdXQnLFxuICAgICAgQ29tcG9uZW50OiAoKSA9PiAoXG4gICAgICAgIDxDb21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICAgICA8QWJvdXRQYWdlIC8+XG4gICAgICAgIDwvQ29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICApLFxuICAgIH0sXG4gICAgbGlua1Byb3BzOiB7XG4gICAgICB0bzogJy9hYm91dCcsXG4gICAgfSxcbiAgICBzaG93SW5OYXY6IHRydWUsXG4gIH0sXG4gIEdvbGRlbkxheW91dFBvcG91dFJvdXRlLFxuXVxuXG4vKipcbiAqIFNob3dzIGhvdyBkb3duc3RyZWFtIGFwcHMgdXRpbGl6ZSB0aGUgc2hlbGwgdGhpcyBhcHAgcHJvdmlkZXNcbiAqL1xuY29uc3QgQmFzZUFwcCA9ICgpID0+IHtcbiAgdXNlRGVmYXVsdFdlbGNvbWUoKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8U3VzcGVuc2VXcmFwcGVyPlxuICAgICAgICA8SGVscCAvPlxuICAgICAgPC9TdXNwZW5zZVdyYXBwZXI+XG4gICAgICA8QXBwXG4gICAgICAgIFJvdXRlSW5mb3JtYXRpb249e1JvdXRlSW5mb3JtYXRpb259XG4gICAgICAgIE5vdGlmaWNhdGlvbnNDb21wb25lbnQ9eygpID0+IDxVc2VyTm90aWZpY2F0aW9ucyAvPn1cbiAgICAgICAgU2V0dGluZ3NDb21wb25lbnRzPXtCYXNlU2V0dGluZ3N9XG4gICAgICAvPlxuICAgIDwvPlxuICApXG59XG5cbmNvbnN0IFdyYXBwZWRXaXRoUHJvdmlkZXJzID0gKCkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxFeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICAgICAgPEJhc2VBcHAgLz5cbiAgICA8L0V4dGVuc2lvblBvaW50cy5wcm92aWRlcnM+XG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgV3JhcHBlZFdpdGhQcm92aWRlcnNcbiJdfQ==