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
import { HashRouter, Navigate } from 'react-router-dom';
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
    return (_jsx(HashRouter, { future: {
            v7_startTransition: true,
        }, children: _jsx(ExtensionPoints.providers, { children: _jsx(BaseApp, {}) }) }));
};
export default WrappedWithProviders;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1hcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2FwcC9iYXNlLWFwcC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFjLEVBQUUsSUFBSSxFQUFpQixNQUFNLE9BQU8sQ0FBQTtBQUNsRCxPQUFPLEdBQUcsRUFBRSxFQUF1QixpQkFBaUIsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUVuRSxPQUFPLGVBQWUsTUFBTSwyQkFBMkIsQ0FBQTtBQUN2RCxPQUFPLGFBQWEsTUFBTSwwQkFBMEIsQ0FBQTtBQUNwRCxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLFNBQVMsTUFBTSw0QkFBNEIsQ0FBQTtBQUNsRCxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLFdBQVcsTUFBTSxpQ0FBaUMsQ0FBQTtBQUN6RCxPQUFPLGVBQWUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNyRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sbURBQW1ELENBQUE7QUFDaEYsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFBO0FBQzNDLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sa0JBQWtCLENBQUE7QUFDdkQsT0FBTyxPQUFPLE1BQU0seUJBQXlCLENBQUE7QUFDN0MsT0FBTyxZQUFZLE1BQU0sOEJBQThCLENBQUE7QUFDdkQsT0FBTyx1QkFBdUIsTUFBTSxrREFBa0QsQ0FBQTtBQUN0RixPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFDakQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFlBQVksQ0FBQTtBQUM1QyxPQUFPLFFBQVEsTUFBTSx3QkFBd0IsQ0FBQTtBQUU3QyxJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FDNUIs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QUFJO1NBQ3pCLFlBRUQsS0FBQyxlQUFlLENBQUMsU0FBUyxjQUN4QixLQUFDLE9BQU8sS0FBRyxHQUNlLEdBQ2pCLENBQ2QsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUVELGVBQWUsb0JBQW9CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgbGF6eSwgU3VzcGVuc2VQcm9wcyB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEFwcCwgeyBJbmRpdmlkdWFsUm91dGVUeXBlLCB1c2VEZWZhdWx0V2VsY29tZSB9IGZyb20gJy4vYXBwJ1xuXG5pbXBvcnQgU291cmNlc1BhZ2VJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2xvdWQnXG5pbXBvcnQgQWJvdXRQYWdlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0luZm8nXG5pbXBvcnQgRm9sZGVySWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0ZvbGRlcidcbmltcG9ydCBUcmFzaEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9EZWxldGUnXG5pbXBvcnQgU2VhcmNoSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL1NlYXJjaCdcbmltcG9ydCBJbWFnZVNlYXJjaCBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0ltYWdlU2VhcmNoJ1xuaW1wb3J0IEV4dGVuc2lvblBvaW50cyBmcm9tICcuLi8uLi9leHRlbnNpb24tcG9pbnRzL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgeyBCYXNlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXNlci1zZXR0aW5ncy91c2VyLXNldHRpbmdzJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyBFbGV2YXRpb25zIH0gZnJvbSAnLi4vdGhlbWUvdGhlbWUnXG5pbXBvcnQgeyBIYXNoUm91dGVyLCBOYXZpZ2F0ZSB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXG5pbXBvcnQgQWRkSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0FkZCdcbmltcG9ydCBWaWV3TGlzdEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9WaWV3TGlzdCdcbmltcG9ydCBzZWxlY3Rpb25JbnRlcmZhY2VNb2RlbCBmcm9tICcuLi9zZWxlY3Rpb24taW50ZXJmYWNlL3NlbGVjdGlvbi1pbnRlcmZhY2UubW9kZWwnXG5pbXBvcnQgeyBRdWVyeSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1R5cGVkUXVlcnknXG5pbXBvcnQgeyBTdXNwZW5zZVdyYXBwZXIgfSBmcm9tICcuL3N1c3BlbnNlJ1xuaW1wb3J0IFNrZWxldG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvU2tlbGV0b24nXG5cbmNvbnN0IFVzZXJOb3RpZmljYXRpb25zID0gbGF6eShcbiAgKCkgPT4gaW1wb3J0KCcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXNlci1ub3RpZmljYXRpb25zL3VzZXItbm90aWZpY2F0aW9ucycpXG4pXG5jb25zdCBIZWxwID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL2hlbHAvaGVscC52aWV3JykpXG5jb25zdCBIb21lUGFnZSA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9wYWdlcy9zZWFyY2gnKSlcbmNvbnN0IEluZ2VzdERldGFpbHNWaWV3UmVhY3QgPSBsYXp5KCgpID0+XG4gIGltcG9ydCgnLi4vaW5nZXN0LWRldGFpbHMvaW5nZXN0LWRldGFpbHMudmlldycpLnRoZW4oKG0pID0+ICh7XG4gICAgZGVmYXVsdDogbS5Jbmdlc3REZXRhaWxzVmlld1JlYWN0LFxuICB9KSlcbilcbmNvbnN0IFNvdXJjZXNQYWdlID0gbGF6eShcbiAgKCkgPT4gaW1wb3J0KCcuLi8uLi9yZWFjdC1jb21wb25lbnQvc291cmNlcy9wcmVzZW50YXRpb24nKVxuKVxuY29uc3QgQWJvdXRQYWdlID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9hYm91dCcpKVxuY29uc3QgTWV0YWNhcmROYXZSb3V0ZSA9IGxhenkoKCkgPT4gaW1wb3J0KCcuLi9wYWdlcy9tZXRhY2FyZC1uYXYnKSlcbmNvbnN0IE1ldGFjYXJkUm91dGUgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vcGFnZXMvbWV0YWNhcmQnKSlcbmNvbnN0IFNhdmVkU2VhcmNoZXMgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vcGFnZXMvYnJvd3NlJykpXG5jb25zdCBPcGVuID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL3BhZ2VzL29wZW4nKSlcbmNvbnN0IFJlc3RvcmUgPSBsYXp5KCgpID0+IGltcG9ydCgnLi4vcGFnZXMvcmVzdG9yZScpKVxuY29uc3QgQ3JlYXRlID0gbGF6eSgoKSA9PiBpbXBvcnQoJy4uL3BhZ2VzL2NyZWF0ZScpKVxuY29uc3QgR29sZGVuTGF5b3V0Vmlld1JlYWN0ID0gbGF6eShcbiAgKCkgPT4gaW1wb3J0KCcuLi9nb2xkZW4tbGF5b3V0L2dvbGRlbi1sYXlvdXQudmlldycpXG4pXG5cbi8qKlxuICogIFdyYXBzIGVhY2ggcm91dGUgaW4gc3VzcGVuc2UgYW5kIHByb3ZpZGVzIGEgbG9hZGluZyBmYWxsYmFjayAtIHVzZSB0aGUgcHJvdmlkZWQgY29tcG9uZW50cyB0aGF0IHdyYXAgdGhpcyAoQ29tbW9uUm91dGVDb250YWluZXIsIENvbXBsZXhSb3V0ZUNvbnRhaW5lcilcbiAqL1xuY29uc3QgUm91dGVDb250YWluZXIgPSAoe1xuICBjaGlsZHJlbixcbiAgY2xhc3NOYW1lLFxuICBpc1NpbmdsZUNvbnRhaW5lciA9IHRydWUsXG4gIHN1c3BlbnNlUHJvcHMsXG59OiB7XG4gIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGVcbiAgY2xhc3NOYW1lPzogc3RyaW5nXG4gIGlzU2luZ2xlQ29udGFpbmVyPzogYm9vbGVhblxuICBzdXNwZW5zZVByb3BzPzogU3VzcGVuc2VQcm9wc1xufSkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBoLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuICR7XG4gICAgICAgIGlzU2luZ2xlQ29udGFpbmVyID8gJ3BiLTIgcHQtMiBwci0yJyA6ICcnXG4gICAgICB9ICR7Y2xhc3NOYW1lfWB9XG4gICAgPlxuICAgICAgPFN1c3BlbnNlV3JhcHBlclxuICAgICAgICB7Li4uc3VzcGVuc2VQcm9wc31cbiAgICAgICAgZmFsbGJhY2s9e1xuICAgICAgICAgIHN1c3BlbnNlUHJvcHM/LmZhbGxiYWNrIHx8IChcbiAgICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFuZWxzfSBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCI+XG4gICAgICAgICAgICAgIDxTa2VsZXRvbiB2YXJpYW50PVwicmVjdGFuZ3VsYXJcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgLz5cbiAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICA+XG4gICAgICAgIHtpc1NpbmdsZUNvbnRhaW5lciA/IChcbiAgICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc30gY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAge2NoaWxkcmVufVxuICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgY2hpbGRyZW5cbiAgICAgICAgKX1cbiAgICAgIDwvU3VzcGVuc2VXcmFwcGVyPlxuICAgIDwvZGl2PlxuICApXG59XG5cbi8vIGZvciByb3V0ZXMgdGhhdCBhcmUganVzdCBhIHNpbmdsZSBwYXBlciBlbGVtZW50XG5leHBvcnQgY29uc3QgQ29tbW9uUm91dGVDb250YWluZXIgPSAoe1xuICBjaGlsZHJlbixcbiAgY2xhc3NOYW1lLFxuICBzdXNwZW5zZVByb3BzLFxufToge1xuICBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlXG4gIGNsYXNzTmFtZT86IHN0cmluZ1xuICBzdXNwZW5zZVByb3BzPzogU3VzcGVuc2VQcm9wc1xufSkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxSb3V0ZUNvbnRhaW5lclxuICAgICAgaXNTaW5nbGVDb250YWluZXI9e3RydWV9XG4gICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgIHN1c3BlbnNlUHJvcHM9e3N1c3BlbnNlUHJvcHN9XG4gICAgPlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvUm91dGVDb250YWluZXI+XG4gIClcbn1cblxuLy8gZm9yIHJvdXRlcyB0aGF0IG5lZWQgZmluZXIgY29udHJvbCBvdmVyIHRoZSBsYXlvdXQgKHNlcGFyYXRlIGhlYWRlciBhbmQgY29udGVudCBmb3IgZXhhbXBsZSlcbmV4cG9ydCBjb25zdCBDb21wbGV4Um91dGVDb250YWluZXIgPSAoe1xuICBjaGlsZHJlbixcbiAgc3VzcGVuc2VQcm9wcyxcbn06IHtcbiAgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZVxuICBzdXNwZW5zZVByb3BzPzogU3VzcGVuc2VQcm9wc1xufSkgPT4ge1xuICByZXR1cm4gKFxuICAgIDxSb3V0ZUNvbnRhaW5lciBpc1NpbmdsZUNvbnRhaW5lcj17ZmFsc2V9IHN1c3BlbnNlUHJvcHM9e3N1c3BlbnNlUHJvcHN9PlxuICAgICAge2NoaWxkcmVufVxuICAgIDwvUm91dGVDb250YWluZXI+XG4gIClcbn1cblxuLyoqXG4gKiBUaGUgaXNzdWUgd2l0aCB0aGUgb3JpZ2luYWwgZ29sZGVuIGxheW91dCBjb2RlIGZvciBwb3BvdXQgaXMgdGhhdCBpdCB3aWxsIGdvIHRvIHRoZSBjdXJyZW50IHJvdXRlIGFuZCB0aGVuIGxvYWQgZ2wgYW5kIGFsbCB0aGF0LlxuICpcbiAqIEhvd2V2ZXIsIHVzdWFsbHkgdGhlcmUgYXJlIHRoaW5ncyBvbiB0aGUgcm91dGUgd2UgZG9uJ3Qgd2FudCB0byBydW4gKGZvciBwZXJmb3JtYW5jZSBzb21ldGltZXMsIGFuZCBmb3Igb3RoZXIgdGltZXMgYmVjYXVzZSB0aGV5IHJlc2V0IHByZWZzIG9yIHdoYXRub3QgdG8gY2xlYXIgdGhpbmdzKVxuICpcbiAqIEFzIGEgcmVzdWx0LCB3ZSBoYXZlIHRoaXMgcm91dGUgdGhhdCBpcyBqdXN0IGZvciB0aGUgcG9wb3V0LCBpdCBkb2Vzbid0IHNob3cgaW4gdGhlIG5hdiwgYW5kIGl0IGRvZXNuJ3QgcnVuIHRoZSBvdGhlciB0aGluZ3Mgb24gdGhlIHJvdXRlXG4gKlxuICogV2UgaGF2ZSB0byBoYXZlIGFuIGluc3RhbmNlIG9mIGdvbGRlbiBsYXlvdXQgZm9yIHRoZSBwb3BvdXQgdG8gYXR0YWNoIHRvLCB3aGljaCB0aGlzIHByb3ZpZGVzLCB3aXRoIGEgcXVlcnkgdGhhdCdzIGJsYW5rIChqdXN0IHNvIHdlIGNhbiB0cmFuc2ZlciByZXN1bHRzIGFuZCB3aGF0IG5vdCB0byBpdClcbiAqL1xuZXhwb3J0IGNvbnN0IEdvbGRlbkxheW91dFBvcG91dFJvdXRlOiBJbmRpdmlkdWFsUm91dGVUeXBlID0ge1xuICByb3V0ZVByb3BzOiB7XG4gICAgcGF0aDogJy9fZ2xfcG9wb3V0JyxcbiAgICBDb21wb25lbnQ6ICgpID0+IHtcbiAgICAgIGNvbnN0IGJhc2VRdWVyeSA9IFF1ZXJ5KClcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxDb21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICAgICA8R29sZGVuTGF5b3V0Vmlld1JlYWN0XG4gICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e1xuICAgICAgICAgICAgICBuZXcgc2VsZWN0aW9uSW50ZXJmYWNlTW9kZWwoeyBjdXJyZW50UXVlcnk6IGJhc2VRdWVyeSB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0R29sZGVuTGF5b3V0PXsoKSA9PiB7fX1cbiAgICAgICAgICAgIGNvbmZpZ05hbWU9XCJnb2xkZW5MYXlvdXRcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvQ29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICApXG4gICAgfSxcbiAgfSxcbiAgc2hvd0luTmF2OiBmYWxzZSxcbn1cblxuY29uc3QgUm91dGVJbmZvcm1hdGlvbjogSW5kaXZpZHVhbFJvdXRlVHlwZVtdID0gW1xuICB7XG4gICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBwYXRoOiAnLycsXG4gICAgICBDb21wb25lbnQ6ICgpID0+IDxOYXZpZ2F0ZSB0bz1cIi9zZWFyY2hcIiByZXBsYWNlIC8+LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIHBhdGg6ICcvdXBsb2Fkcy86dXBsb2FkSWQnLFxuICAgICAgQ29tcG9uZW50OiAoKSA9PiAoXG4gICAgICAgIDxDb21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICAgICA8TWV0YWNhcmRSb3V0ZSAvPlxuICAgICAgICA8L0NvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgKSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBwYXRoOiAnL21ldGFjYXJkcy86bWV0YWNhcmRJZCcsXG4gICAgICBDb21wb25lbnQ6ICgpID0+IChcbiAgICAgICAgPENvbXBsZXhSb3V0ZUNvbnRhaW5lcj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgdy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0xNiB6LTEgcmVsYXRpdmUgcHQtMiBwci0yXCI+XG4gICAgICAgICAgICAgIDxQYXBlclxuICAgICAgICAgICAgICAgIGVsZXZhdGlvbj17RWxldmF0aW9ucy5wYW5lbHN9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBweC0zXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxTdXNwZW5zZVdyYXBwZXI+XG4gICAgICAgICAgICAgICAgICA8TWV0YWNhcmROYXZSb3V0ZSAvPlxuICAgICAgICAgICAgICAgIDwvU3VzcGVuc2VXcmFwcGVyPlxuICAgICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgei0wIHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICA8U3VzcGVuc2VXcmFwcGVyPlxuICAgICAgICAgICAgICAgIDxNZXRhY2FyZFJvdXRlIC8+XG4gICAgICAgICAgICAgIDwvU3VzcGVuc2VXcmFwcGVyPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQ29tcGxleFJvdXRlQ29udGFpbmVyPlxuICAgICAgKSxcbiAgICB9LFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdTZWFyY2gnLFxuICAgICAgdW5leHBhbmRlZExhYmVsOiAnU2VhcmNoJyxcbiAgICAgIEljb246IFNlYXJjaEljb24sXG4gICAgICBkYXRhSWQ6ICdzZWFyY2gnLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9zZWFyY2gnLFxuICAgICAgQ29tcG9uZW50OiAoKSA9PiAoXG4gICAgICAgIDxDb21wbGV4Um91dGVDb250YWluZXJcbiAgICAgICAgICBzdXNwZW5zZVByb3BzPXt7XG4gICAgICAgICAgICBmYWxsYmFjazogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgZmxleCBmbGV4LXJvdyBmbGV4LW5vd3JhcFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1bNTUwcHhdIGgtZnVsbCBweS0yIHNocmluay0wIGdyb3ctMFwiPlxuICAgICAgICAgICAgICAgICAgPFBhcGVyXG4gICAgICAgICAgICAgICAgICAgIGVsZXZhdGlvbj17RWxldmF0aW9ucy5wYW5lbHN9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8U2tlbGV0b25cbiAgICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwicmVjdGFuZ3VsYXJcIlxuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PVwiMTAwJVwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBzaHJpbmsgZ3JvdyBweS0yIHB4LTJcIj5cbiAgICAgICAgICAgICAgICAgIDxQYXBlclxuICAgICAgICAgICAgICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFuZWxzfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPFNrZWxldG9uXG4gICAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cInJlY3Rhbmd1bGFyXCJcbiAgICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjEwMCVcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8SG9tZVBhZ2UgLz5cbiAgICAgICAgPC9Db21wbGV4Um91dGVDb250YWluZXI+XG4gICAgICApLFxuICAgIH0sXG4gICAgbGlua1Byb3BzOiB7XG4gICAgICB0bzogJy9zZWFyY2gnLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICB7XG4gICAgc2hvd0luTmF2OiBmYWxzZSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBwYXRoOiAnL3NlYXJjaC86aWQnLFxuICAgICAgQ29tcG9uZW50OiAoKSA9PiAoXG4gICAgICAgIDxDb21wbGV4Um91dGVDb250YWluZXJcbiAgICAgICAgICBzdXNwZW5zZVByb3BzPXt7XG4gICAgICAgICAgICBmYWxsYmFjazogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgZmxleCBmbGV4LXJvdyBmbGV4LW5vd3JhcFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1bNTUwcHhdIGgtZnVsbCBweS0yIHNocmluay0wIGdyb3ctMFwiPlxuICAgICAgICAgICAgICAgICAgPFBhcGVyXG4gICAgICAgICAgICAgICAgICAgIGVsZXZhdGlvbj17RWxldmF0aW9ucy5wYW5lbHN9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8U2tlbGV0b25cbiAgICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwicmVjdGFuZ3VsYXJcIlxuICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PVwiMTAwJVwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBzaHJpbmsgZ3JvdyBweS0yIHB4LTJcIj5cbiAgICAgICAgICAgICAgICAgIDxQYXBlclxuICAgICAgICAgICAgICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFuZWxzfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPFNrZWxldG9uXG4gICAgICAgICAgICAgICAgICAgICAgdmFyaWFudD1cInJlY3Rhbmd1bGFyXCJcbiAgICAgICAgICAgICAgICAgICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjEwMCVcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8SG9tZVBhZ2UgLz5cbiAgICAgICAgPC9Db21wbGV4Um91dGVDb250YWluZXI+XG4gICAgICApLFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBuYXZCdXR0b25Qcm9wczoge1xuICAgICAgZXhwYW5kZWRMYWJlbDogJ0NyZWF0ZScsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdDcmVhdGUnLFxuICAgICAgSWNvbjogQWRkSWNvbixcbiAgICAgIGRhdGFJZDogJ2NyZWF0ZScsXG4gICAgfSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBwYXRoOiAnL2NyZWF0ZScsXG4gICAgICBDb21wb25lbnQ6ICgpID0+IChcbiAgICAgICAgPENvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgICAgIDxDcmVhdGUgLz5cbiAgICAgICAgPC9Db21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICksXG4gICAgfSxcbiAgICBsaW5rUHJvcHM6IHtcbiAgICAgIHRvOiAnL2NyZWF0ZScsXG4gICAgfSxcbiAgICBzaG93SW5OYXY6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBuYXZCdXR0b25Qcm9wczoge1xuICAgICAgZXhwYW5kZWRMYWJlbDogJ09wZW4nLFxuICAgICAgdW5leHBhbmRlZExhYmVsOiAnT3BlbicsXG4gICAgICBJY29uOiBGb2xkZXJJY29uLFxuICAgICAgZGF0YUlkOiAnb3BlbicsXG4gICAgfSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBwYXRoOiAnL29wZW4nLFxuICAgICAgQ29tcG9uZW50OiAoKSA9PiAoXG4gICAgICAgIDxDb21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICAgICA8T3BlbiAvPlxuICAgICAgICA8L0NvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgKSxcbiAgICB9LFxuICAgIGxpbmtQcm9wczoge1xuICAgICAgdG86ICcvb3BlbicsXG4gICAgfSxcbiAgICBzaG93SW5OYXY6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBuYXZCdXR0b25Qcm9wczoge1xuICAgICAgZXhwYW5kZWRMYWJlbDogJ0Jyb3dzZScsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdCcm93c2UnLFxuICAgICAgSWNvbjogVmlld0xpc3RJY29uLFxuICAgICAgZGF0YUlkOiAnYnJvd3NlJyxcbiAgICB9LFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIHBhdGg6ICcvYnJvd3NlJyxcbiAgICAgIENvbXBvbmVudDogKCkgPT4gKFxuICAgICAgICA8Q29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICAgICAgPFNhdmVkU2VhcmNoZXMgLz5cbiAgICAgICAgPC9Db21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICksXG4gICAgfSxcbiAgICBsaW5rUHJvcHM6IHtcbiAgICAgIHRvOiAnL2Jyb3dzZScsXG4gICAgfSxcbiAgICBzaG93SW5OYXY6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBuYXZCdXR0b25Qcm9wczoge1xuICAgICAgZXhwYW5kZWRMYWJlbDogJ1VwbG9hZCcsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdVcGxvYWQnLFxuICAgICAgSWNvbjogSW1hZ2VTZWFyY2gsXG4gICAgICBkYXRhSWQ6ICd1cGxvYWQnLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy91cGxvYWQnLFxuICAgICAgQ29tcG9uZW50OiAoKSA9PiAoXG4gICAgICAgIDxDb21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICAgICA8SW5nZXN0RGV0YWlsc1ZpZXdSZWFjdCAvPlxuICAgICAgICA8L0NvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgKSxcbiAgICB9LFxuICAgIGxpbmtQcm9wczoge1xuICAgICAgdG86ICcvdXBsb2FkJyxcbiAgICB9LFxuICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIG5hdkJ1dHRvblByb3BzOiB7XG4gICAgICBleHBhbmRlZExhYmVsOiAnU291cmNlcycsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdTb3VyY2VzJyxcbiAgICAgIEljb246IFNvdXJjZXNQYWdlSWNvbixcbiAgICAgIGRhdGFJZDogJ3NvdXJjZXMnLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9zb3VyY2VzJyxcbiAgICAgIENvbXBvbmVudDogKCkgPT4gKFxuICAgICAgICA8Q29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICAgICAgPFNvdXJjZXNQYWdlIC8+XG4gICAgICAgIDwvQ29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICApLFxuICAgIH0sXG4gICAgbGlua1Byb3BzOiB7XG4gICAgICB0bzogJy9zb3VyY2VzJyxcbiAgICB9LFxuICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIG5hdkJ1dHRvblByb3BzOiB7XG4gICAgICBleHBhbmRlZExhYmVsOiAnUmVzdG9yZScsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdSZXN0b3JlJyxcbiAgICAgIEljb246IFRyYXNoSWNvbixcbiAgICAgIGRhdGFJZDogJ3Jlc3RvcmUnLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9yZXN0b3JlJyxcbiAgICAgIENvbXBvbmVudDogKCkgPT4gKFxuICAgICAgICA8Q29tbW9uUm91dGVDb250YWluZXI+XG4gICAgICAgICAgPFJlc3RvcmUgLz5cbiAgICAgICAgPC9Db21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICksXG4gICAgfSxcbiAgICBsaW5rUHJvcHM6IHtcbiAgICAgIHRvOiAnL3Jlc3RvcmUnLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdBYm91dCcsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdBYm91dCcsXG4gICAgICBJY29uOiBBYm91dFBhZ2VJY29uLFxuICAgICAgZGF0YUlkOiAnYWJvdXQnLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9hYm91dCcsXG4gICAgICBDb21wb25lbnQ6ICgpID0+IChcbiAgICAgICAgPENvbW1vblJvdXRlQ29udGFpbmVyPlxuICAgICAgICAgIDxBYm91dFBhZ2UgLz5cbiAgICAgICAgPC9Db21tb25Sb3V0ZUNvbnRhaW5lcj5cbiAgICAgICksXG4gICAgfSxcbiAgICBsaW5rUHJvcHM6IHtcbiAgICAgIHRvOiAnL2Fib3V0JyxcbiAgICB9LFxuICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgfSxcbiAgR29sZGVuTGF5b3V0UG9wb3V0Um91dGUsXG5dXG5cbi8qKlxuICogU2hvd3MgaG93IGRvd25zdHJlYW0gYXBwcyB1dGlsaXplIHRoZSBzaGVsbCB0aGlzIGFwcCBwcm92aWRlc1xuICovXG5jb25zdCBCYXNlQXBwID0gKCkgPT4ge1xuICB1c2VEZWZhdWx0V2VsY29tZSgpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxTdXNwZW5zZVdyYXBwZXI+XG4gICAgICAgIDxIZWxwIC8+XG4gICAgICA8L1N1c3BlbnNlV3JhcHBlcj5cbiAgICAgIDxBcHBcbiAgICAgICAgUm91dGVJbmZvcm1hdGlvbj17Um91dGVJbmZvcm1hdGlvbn1cbiAgICAgICAgTm90aWZpY2F0aW9uc0NvbXBvbmVudD17KCkgPT4gPFVzZXJOb3RpZmljYXRpb25zIC8+fVxuICAgICAgICBTZXR0aW5nc0NvbXBvbmVudHM9e0Jhc2VTZXR0aW5nc31cbiAgICAgIC8+XG4gICAgPC8+XG4gIClcbn1cblxuY29uc3QgV3JhcHBlZFdpdGhQcm92aWRlcnMgPSAoKSA9PiB7XG4gIHJldHVybiAoXG4gICAgPEhhc2hSb3V0ZXJcbiAgICAgIGZ1dHVyZT17e1xuICAgICAgICB2N19zdGFydFRyYW5zaXRpb246IHRydWUsXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxFeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICAgICAgICA8QmFzZUFwcCAvPlxuICAgICAgPC9FeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICAgIDwvSGFzaFJvdXRlcj5cbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBXcmFwcGVkV2l0aFByb3ZpZGVyc1xuIl19