import * as React from 'react';
import App, { useDefaultWelcome } from './app';
import Help from '../help/help.view';
import { hot } from 'react-hot-loader/root';
import { IngestDetailsViewReact } from '../ingest-details/ingest-details.view';
import { HomePage } from '../pages/search';
import SourcesPage from '../../react-component/sources/presentation';
import SourcesPageIcon from '@mui/icons-material/Cloud';
import AboutPage from '../../react-component/about';
import AboutPageIcon from '@mui/icons-material/Info';
import FolderIcon from '@mui/icons-material/Folder';
import TrashIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ImageSearch from '@mui/icons-material/ImageSearch';
import UserNotifications from '../../react-component/user-notifications/user-notifications';
import { BaseSettings } from '../../react-component/user-settings/user-settings';
import ExtensionPoints from '../../extension-points/extension-points';
import Paper from '@mui/material/Paper';
import { Elevations } from '../theme/theme';
import { Redirect } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import MetacardNavRoute from '../pages/metacard-nav';
import MetacardRoute from '../pages/metacard';
import SavedSearches from '../pages/browse';
import Open from '../pages/open';
import Restore from '../pages/restore';
import Create from '../pages/create';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import { GoldenLayoutViewReact } from '../golden-layout/golden-layout.view';
import selectionInterfaceModel from '../selection-interface/selection-interface.model';
import { Query } from '../../js/model/TypedQuery';
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
        children: function () {
            var baseQuery = Query();
            return (React.createElement("div", { className: "w-full h-full pb-2 pt-2 pr-2" },
                React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full" },
                    React.createElement(GoldenLayoutViewReact, { selectionInterface: new selectionInterfaceModel({ currentQuery: baseQuery }), setGoldenLayout: function () { }, configName: "goldenLayout" }))));
        },
    },
    showInNav: false,
};
var RouteInformation = [
    {
        showInNav: false,
        routeProps: {
            exact: true,
            path: '/',
            children: function () {
                return React.createElement(Redirect, { to: "/search" });
            },
        },
    },
    {
        showInNav: false,
        routeProps: {
            exact: true,
            path: '/uploads/:uploadId',
            children: function () {
                return (React.createElement(Grid, { container: true, direction: "column", className: "w-full h-full", wrap: "nowrap" },
                    React.createElement(Grid, { item: true, className: "w-full h-full z-0 relative overflow-hidden" },
                        React.createElement(MetacardRoute, null))));
            },
        },
    },
    {
        showInNav: false,
        routeProps: {
            exact: true,
            path: '/metacards/:metacardId',
            children: function () {
                return (React.createElement(Grid, { container: true, direction: "column", className: "w-full h-full", wrap: "nowrap" },
                    React.createElement(Grid, { item: true, className: "w-full h-16 z-1 relative pt-2 pr-2" },
                        React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full px-3" },
                            React.createElement(MetacardNavRoute, null))),
                    React.createElement(Grid, { item: true, className: "w-full h-full z-0 relative overflow-hidden" },
                        React.createElement(MetacardRoute, null))));
            },
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
            exact: false,
            path: ['/search/:id', '/search'],
            children: function () {
                return React.createElement(HomePage, null);
            },
        },
        linkProps: {
            to: '/search',
        },
        showInNav: true,
    },
    {
        navButtonProps: {
            expandedLabel: 'Create',
            unexpandedLabel: 'Create',
            Icon: AddIcon,
            dataId: 'create',
        },
        routeProps: {
            exact: true,
            path: ['/create'],
            children: function () {
                return (React.createElement("div", { className: "py-2 pr-2 w-full h-full" },
                    React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full" },
                        React.createElement(Create, null))));
            },
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
            exact: true,
            path: ['/open'],
            children: function () {
                return (React.createElement("div", { className: "py-2 pr-2 w-full h-full" },
                    React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full" },
                        React.createElement(Open, null))));
            },
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
            exact: true,
            path: ['/browse'],
            children: function () {
                return (React.createElement("div", { className: "w-full h-full" },
                    React.createElement(SavedSearches, null)));
            },
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
            children: function () {
                return (React.createElement("div", { className: "w-full h-full pb-2 pt-2 pr-2" },
                    React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full" },
                        React.createElement(IngestDetailsViewReact, null))));
            },
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
            children: function () {
                return (React.createElement("div", { className: "w-full h-full pb-2 pt-2 pr-2" },
                    React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full" },
                        React.createElement(SourcesPage, null))));
            },
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
            exact: true,
            path: ['/restore'],
            children: function () {
                return (React.createElement("div", { className: "py-2 pr-2 w-full h-full" },
                    React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full" },
                        React.createElement(Restore, null))));
            },
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
            children: function () {
                return (React.createElement("div", { className: "w-full h-full pb-2 pt-2 pr-2" },
                    React.createElement(Paper, { elevation: Elevations.panels, className: "w-full h-full" },
                        React.createElement(AboutPage, null))));
            },
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
    return (React.createElement(React.Fragment, null,
        React.createElement(Help, null),
        React.createElement(App, { RouteInformation: RouteInformation, NotificationsComponent: UserNotifications, SettingsComponents: BaseSettings })));
};
var WrappedWithProviders = function () {
    return (React.createElement(ExtensionPoints.providers, null,
        React.createElement(BaseApp, null)));
};
export default hot(WrappedWithProviders);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1hcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvY29tcG9uZW50L2FwcC9iYXNlLWFwcC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxHQUFHLEVBQUUsRUFBdUIsaUJBQWlCLEVBQUUsTUFBTSxPQUFPLENBQUE7QUFDbkUsT0FBTyxJQUFJLE1BQU0sbUJBQW1CLENBQUE7QUFFcEMsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHVDQUF1QyxDQUFBO0FBQzlFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQTtBQUUxQyxPQUFPLFdBQVcsTUFBTSw0Q0FBNEMsQ0FBQTtBQUNwRSxPQUFPLGVBQWUsTUFBTSwyQkFBMkIsQ0FBQTtBQUN2RCxPQUFPLFNBQVMsTUFBTSw2QkFBNkIsQ0FBQTtBQUNuRCxPQUFPLGFBQWEsTUFBTSwwQkFBMEIsQ0FBQTtBQUNwRCxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLFNBQVMsTUFBTSw0QkFBNEIsQ0FBQTtBQUNsRCxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLFdBQVcsTUFBTSxpQ0FBaUMsQ0FBQTtBQUN6RCxPQUFPLGlCQUFpQixNQUFNLDZEQUE2RCxDQUFBO0FBQzNGLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxtREFBbUQsQ0FBQTtBQUNoRixPQUFPLGVBQWUsTUFBTSx5Q0FBeUMsQ0FBQTtBQUNyRSxPQUFPLEtBQUssTUFBTSxxQkFBcUIsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUE7QUFDM0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQzND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VUFBVTtTQUNmO1FBQ0QsU0FBUyxFQUFFLElBQUk7S0FDaEI7SUFDRDtRQUNFLGNBQWMsRUFBRTtZQUNkLGFBQWEsRUFBRSxPQUFPO1lBQ3RCLGVBQWUsRUFBRSxPQUFPO1lBQ3hCLElBQUksRUFBRSxhQUFhO1lBQ25CLE1BQU0sRUFBRSxPQUFPO1NBQ2hCO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxRQUFRLEVBQUU7Z0JBQ1IsT0FBTyxDQUNMLDZCQUFLLFNBQVMsRUFBQyw4QkFBOEI7b0JBQzNDLG9CQUFDLEtBQUssSUFBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsZUFBZTt3QkFDNUQsb0JBQUMsU0FBUyxPQUFHLENBQ1AsQ0FDSixDQUNQLENBQUE7WUFDSCxDQUFDO1NBQ0Y7UUFDRCxTQUFTLEVBQUU7WUFDVCxFQUFFLEVBQUUsUUFBUTtTQUNiO1FBQ0QsU0FBUyxFQUFFLElBQUk7S0FDaEI7SUFDRCx1QkFBdUI7Q0FDeEIsQ0FBQTtBQUVEOztHQUVHO0FBQ0gsSUFBTSxPQUFPLEdBQUc7SUFDZCxpQkFBaUIsRUFBRSxDQUFBO0lBQ25CLE9BQU8sQ0FDTDtRQUNFLG9CQUFDLElBQUksT0FBRztRQUNSLG9CQUFDLEdBQUcsSUFDRixnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFDbEMsc0JBQXNCLEVBQUUsaUJBQWlCLEVBQ3pDLGtCQUFrQixFQUFFLFlBQVksR0FDaEMsQ0FDRCxDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFFRCxJQUFNLG9CQUFvQixHQUFHO0lBQzNCLE9BQU8sQ0FDTCxvQkFBQyxlQUFlLENBQUMsU0FBUztRQUN4QixvQkFBQyxPQUFPLE9BQUcsQ0FDZSxDQUM3QixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsZUFBZSxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IEFwcCwgeyBJbmRpdmlkdWFsUm91dGVUeXBlLCB1c2VEZWZhdWx0V2VsY29tZSB9IGZyb20gJy4vYXBwJ1xuaW1wb3J0IEhlbHAgZnJvbSAnLi4vaGVscC9oZWxwLnZpZXcnXG5cbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXIvcm9vdCdcbmltcG9ydCB7IEluZ2VzdERldGFpbHNWaWV3UmVhY3QgfSBmcm9tICcuLi9pbmdlc3QtZGV0YWlscy9pbmdlc3QtZGV0YWlscy52aWV3J1xuaW1wb3J0IHsgSG9tZVBhZ2UgfSBmcm9tICcuLi9wYWdlcy9zZWFyY2gnXG5cbmltcG9ydCBTb3VyY2VzUGFnZSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvc291cmNlcy9wcmVzZW50YXRpb24nXG5pbXBvcnQgU291cmNlc1BhZ2VJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2xvdWQnXG5pbXBvcnQgQWJvdXRQYWdlIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9hYm91dCdcbmltcG9ydCBBYm91dFBhZ2VJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvSW5mbydcbmltcG9ydCBGb2xkZXJJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvRm9sZGVyJ1xuaW1wb3J0IFRyYXNoSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0RlbGV0ZSdcbmltcG9ydCBTZWFyY2hJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvU2VhcmNoJ1xuaW1wb3J0IEltYWdlU2VhcmNoIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvSW1hZ2VTZWFyY2gnXG5pbXBvcnQgVXNlck5vdGlmaWNhdGlvbnMgZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3VzZXItbm90aWZpY2F0aW9ucy91c2VyLW5vdGlmaWNhdGlvbnMnXG5pbXBvcnQgeyBCYXNlU2V0dGluZ3MgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXNlci1zZXR0aW5ncy91c2VyLXNldHRpbmdzJ1xuaW1wb3J0IEV4dGVuc2lvblBvaW50cyBmcm9tICcuLi8uLi9leHRlbnNpb24tcG9pbnRzL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcbmltcG9ydCB7IFJlZGlyZWN0IH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSdcbmltcG9ydCBHcmlkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvR3JpZCdcbmltcG9ydCBNZXRhY2FyZE5hdlJvdXRlIGZyb20gJy4uL3BhZ2VzL21ldGFjYXJkLW5hdidcbmltcG9ydCBNZXRhY2FyZFJvdXRlIGZyb20gJy4uL3BhZ2VzL21ldGFjYXJkJ1xuaW1wb3J0IFNhdmVkU2VhcmNoZXMgZnJvbSAnLi4vcGFnZXMvYnJvd3NlJ1xuaW1wb3J0IE9wZW4gZnJvbSAnLi4vcGFnZXMvb3BlbidcbmltcG9ydCBSZXN0b3JlIGZyb20gJy4uL3BhZ2VzL3Jlc3RvcmUnXG5pbXBvcnQgQ3JlYXRlIGZyb20gJy4uL3BhZ2VzL2NyZWF0ZSdcbmltcG9ydCBBZGRJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQWRkJ1xuaW1wb3J0IFZpZXdMaXN0SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL1ZpZXdMaXN0J1xuaW1wb3J0IHsgR29sZGVuTGF5b3V0Vmlld1JlYWN0IH0gZnJvbSAnLi4vZ29sZGVuLWxheW91dC9nb2xkZW4tbGF5b3V0LnZpZXcnXG5pbXBvcnQgc2VsZWN0aW9uSW50ZXJmYWNlTW9kZWwgZnJvbSAnLi4vc2VsZWN0aW9uLWludGVyZmFjZS9zZWxlY3Rpb24taW50ZXJmYWNlLm1vZGVsJ1xuaW1wb3J0IHsgUXVlcnkgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9UeXBlZFF1ZXJ5J1xuXG4vKipcbiAqIFRoZSBpc3N1ZSB3aXRoIHRoZSBvcmlnaW5hbCBnb2xkZW4gbGF5b3V0IGNvZGUgZm9yIHBvcG91dCBpcyB0aGF0IGl0IHdpbGwgZ28gdG8gdGhlIGN1cnJlbnQgcm91dGUgYW5kIHRoZW4gbG9hZCBnbCBhbmQgYWxsIHRoYXQuXG4gKlxuICogSG93ZXZlciwgdXN1YWxseSB0aGVyZSBhcmUgdGhpbmdzIG9uIHRoZSByb3V0ZSB3ZSBkb24ndCB3YW50IHRvIHJ1biAoZm9yIHBlcmZvcm1hbmNlIHNvbWV0aW1lcywgYW5kIGZvciBvdGhlciB0aW1lcyBiZWNhdXNlIHRoZXkgcmVzZXQgcHJlZnMgb3Igd2hhdG5vdCB0byBjbGVhciB0aGluZ3MpXG4gKlxuICogQXMgYSByZXN1bHQsIHdlIGhhdmUgdGhpcyByb3V0ZSB0aGF0IGlzIGp1c3QgZm9yIHRoZSBwb3BvdXQsIGl0IGRvZXNuJ3Qgc2hvdyBpbiB0aGUgbmF2LCBhbmQgaXQgZG9lc24ndCBydW4gdGhlIG90aGVyIHRoaW5ncyBvbiB0aGUgcm91dGVcbiAqXG4gKiBXZSBoYXZlIHRvIGhhdmUgYW4gaW5zdGFuY2Ugb2YgZ29sZGVuIGxheW91dCBmb3IgdGhlIHBvcG91dCB0byBhdHRhY2ggdG8sIHdoaWNoIHRoaXMgcHJvdmlkZXMsIHdpdGggYSBxdWVyeSB0aGF0J3MgYmxhbmsgKGp1c3Qgc28gd2UgY2FuIHRyYW5zZmVyIHJlc3VsdHMgYW5kIHdoYXQgbm90IHRvIGl0KVxuICovXG5leHBvcnQgY29uc3QgR29sZGVuTGF5b3V0UG9wb3V0Um91dGU6IEluZGl2aWR1YWxSb3V0ZVR5cGUgPSB7XG4gIHJvdXRlUHJvcHM6IHtcbiAgICBwYXRoOiAnL19nbF9wb3BvdXQnLFxuICAgIGNoaWxkcmVuOiAoKSA9PiB7XG4gICAgICBjb25zdCBiYXNlUXVlcnkgPSBRdWVyeSgpXG4gICAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcGItMiBwdC0yIHByLTJcIj5cbiAgICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc30gY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgPEdvbGRlbkxheW91dFZpZXdSZWFjdFxuICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e1xuICAgICAgICAgICAgICAgIG5ldyBzZWxlY3Rpb25JbnRlcmZhY2VNb2RlbCh7IGN1cnJlbnRRdWVyeTogYmFzZVF1ZXJ5IH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgc2V0R29sZGVuTGF5b3V0PXsoKSA9PiB7fX1cbiAgICAgICAgICAgICAgY29uZmlnTmFtZT1cImdvbGRlbkxheW91dFwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgIDwvZGl2PlxuICAgICAgKVxuICAgIH0sXG4gIH0sXG4gIHNob3dJbk5hdjogZmFsc2UsXG59XG5cbmNvbnN0IFJvdXRlSW5mb3JtYXRpb246IEluZGl2aWR1YWxSb3V0ZVR5cGVbXSA9IFtcbiAge1xuICAgIHNob3dJbk5hdjogZmFsc2UsXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICBwYXRoOiAnLycsXG4gICAgICBjaGlsZHJlbjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gPFJlZGlyZWN0IHRvPVwiL3NlYXJjaFwiIC8+XG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgcGF0aDogJy91cGxvYWRzLzp1cGxvYWRJZCcsXG4gICAgICBjaGlsZHJlbjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxHcmlkXG4gICAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIGRpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCJcbiAgICAgICAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCB6LTAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgIDxNZXRhY2FyZFJvdXRlIC8+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICApXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBzaG93SW5OYXY6IGZhbHNlLFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIGV4YWN0OiB0cnVlLFxuICAgICAgcGF0aDogJy9tZXRhY2FyZHMvOm1ldGFjYXJkSWQnLFxuICAgICAgY2hpbGRyZW46ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICBkaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiXG4gICAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBoLTE2IHotMSByZWxhdGl2ZSBwdC0yIHByLTJcIj5cbiAgICAgICAgICAgICAgPFBhcGVyXG4gICAgICAgICAgICAgICAgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHB4LTNcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPE1ldGFjYXJkTmF2Um91dGUgLz5cbiAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCB6LTAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgIDxNZXRhY2FyZFJvdXRlIC8+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICApXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHtcbiAgICBuYXZCdXR0b25Qcm9wczoge1xuICAgICAgZXhwYW5kZWRMYWJlbDogJ1NlYXJjaCcsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdTZWFyY2gnLFxuICAgICAgSWNvbjogU2VhcmNoSWNvbixcbiAgICAgIGRhdGFJZDogJ3NlYXJjaCcsXG4gICAgfSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBleGFjdDogZmFsc2UsXG4gICAgICBwYXRoOiBbJy9zZWFyY2gvOmlkJywgJy9zZWFyY2gnXSxcbiAgICAgIGNoaWxkcmVuOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiA8SG9tZVBhZ2UgLz5cbiAgICAgIH0sXG4gICAgfSxcbiAgICBsaW5rUHJvcHM6IHtcbiAgICAgIHRvOiAnL3NlYXJjaCcsXG4gICAgfSxcbiAgICBzaG93SW5OYXY6IHRydWUsXG4gIH0sXG4gIHtcbiAgICBuYXZCdXR0b25Qcm9wczoge1xuICAgICAgZXhwYW5kZWRMYWJlbDogJ0NyZWF0ZScsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdDcmVhdGUnLFxuICAgICAgSWNvbjogQWRkSWNvbixcbiAgICAgIGRhdGFJZDogJ2NyZWF0ZScsXG4gICAgfSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBleGFjdDogdHJ1ZSxcbiAgICAgIHBhdGg6IFsnL2NyZWF0ZSddLFxuICAgICAgY2hpbGRyZW46ICgpID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB5LTIgcHItMiB3LWZ1bGwgaC1mdWxsXCI+XG4gICAgICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc30gY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgICA8Q3JlYXRlIC8+XG4gICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgICB9LFxuICAgIH0sXG4gICAgbGlua1Byb3BzOiB7XG4gICAgICB0bzogJy9jcmVhdGUnLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdPcGVuJyxcbiAgICAgIHVuZXhwYW5kZWRMYWJlbDogJ09wZW4nLFxuICAgICAgSWNvbjogRm9sZGVySWNvbixcbiAgICAgIGRhdGFJZDogJ29wZW4nLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICBwYXRoOiBbJy9vcGVuJ10sXG4gICAgICBjaGlsZHJlbjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHktMiBwci0yIHctZnVsbCBoLWZ1bGxcIj5cbiAgICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFuZWxzfSBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCI+XG4gICAgICAgICAgICAgIDxPcGVuIC8+XG4gICAgICAgICAgICA8L1BhcGVyPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgICB9LFxuICAgIH0sXG4gICAgbGlua1Byb3BzOiB7XG4gICAgICB0bzogJy9vcGVuJyxcbiAgICB9LFxuICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIG5hdkJ1dHRvblByb3BzOiB7XG4gICAgICBleHBhbmRlZExhYmVsOiAnQnJvd3NlJyxcbiAgICAgIHVuZXhwYW5kZWRMYWJlbDogJ0Jyb3dzZScsXG4gICAgICBJY29uOiBWaWV3TGlzdEljb24sXG4gICAgICBkYXRhSWQ6ICdicm93c2UnLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgZXhhY3Q6IHRydWUsXG4gICAgICBwYXRoOiBbJy9icm93c2UnXSxcbiAgICAgIGNoaWxkcmVuOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsXCI+XG4gICAgICAgICAgICA8U2F2ZWRTZWFyY2hlcyAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApXG4gICAgICB9LFxuICAgIH0sXG4gICAgbGlua1Byb3BzOiB7XG4gICAgICB0bzogJy9icm93c2UnLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdVcGxvYWQnLFxuICAgICAgdW5leHBhbmRlZExhYmVsOiAnVXBsb2FkJyxcbiAgICAgIEljb246IEltYWdlU2VhcmNoLFxuICAgICAgZGF0YUlkOiAndXBsb2FkJyxcbiAgICB9LFxuICAgIHJvdXRlUHJvcHM6IHtcbiAgICAgIHBhdGg6ICcvdXBsb2FkJyxcbiAgICAgIGNoaWxkcmVuOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHBiLTIgcHQtMiBwci0yXCI+XG4gICAgICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc30gY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgICA8SW5nZXN0RGV0YWlsc1ZpZXdSZWFjdCAvPlxuICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgICAgfSxcbiAgICB9LFxuICAgIGxpbmtQcm9wczoge1xuICAgICAgdG86ICcvdXBsb2FkJyxcbiAgICB9LFxuICAgIHNob3dJbk5hdjogdHJ1ZSxcbiAgfSxcbiAge1xuICAgIG5hdkJ1dHRvblByb3BzOiB7XG4gICAgICBleHBhbmRlZExhYmVsOiAnU291cmNlcycsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdTb3VyY2VzJyxcbiAgICAgIEljb246IFNvdXJjZXNQYWdlSWNvbixcbiAgICAgIGRhdGFJZDogJ3NvdXJjZXMnLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9zb3VyY2VzJyxcbiAgICAgIGNoaWxkcmVuOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHBiLTIgcHQtMiBwci0yXCI+XG4gICAgICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc30gY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgICA8U291cmNlc1BhZ2UgLz5cbiAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICAgIH0sXG4gICAgfSxcbiAgICBsaW5rUHJvcHM6IHtcbiAgICAgIHRvOiAnL3NvdXJjZXMnLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdSZXN0b3JlJyxcbiAgICAgIHVuZXhwYW5kZWRMYWJlbDogJ1Jlc3RvcmUnLFxuICAgICAgSWNvbjogVHJhc2hJY29uLFxuICAgICAgZGF0YUlkOiAncmVzdG9yZScsXG4gICAgfSxcbiAgICByb3V0ZVByb3BzOiB7XG4gICAgICBleGFjdDogdHJ1ZSxcbiAgICAgIHBhdGg6IFsnL3Jlc3RvcmUnXSxcbiAgICAgIGNoaWxkcmVuOiAoKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweS0yIHByLTIgdy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5wYW5lbHN9IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIj5cbiAgICAgICAgICAgICAgPFJlc3RvcmUgLz5cbiAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIClcbiAgICAgIH0sXG4gICAgfSxcbiAgICBsaW5rUHJvcHM6IHtcbiAgICAgIHRvOiAnL3Jlc3RvcmUnLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICB7XG4gICAgbmF2QnV0dG9uUHJvcHM6IHtcbiAgICAgIGV4cGFuZGVkTGFiZWw6ICdBYm91dCcsXG4gICAgICB1bmV4cGFuZGVkTGFiZWw6ICdBYm91dCcsXG4gICAgICBJY29uOiBBYm91dFBhZ2VJY29uLFxuICAgICAgZGF0YUlkOiAnYWJvdXQnLFxuICAgIH0sXG4gICAgcm91dGVQcm9wczoge1xuICAgICAgcGF0aDogJy9hYm91dCcsXG4gICAgICBjaGlsZHJlbjogKCkgPT4ge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBwYi0yIHB0LTIgcHItMlwiPlxuICAgICAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5wYW5lbHN9IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIj5cbiAgICAgICAgICAgICAgPEFib3V0UGFnZSAvPlxuICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKVxuICAgICAgfSxcbiAgICB9LFxuICAgIGxpbmtQcm9wczoge1xuICAgICAgdG86ICcvYWJvdXQnLFxuICAgIH0sXG4gICAgc2hvd0luTmF2OiB0cnVlLFxuICB9LFxuICBHb2xkZW5MYXlvdXRQb3BvdXRSb3V0ZSxcbl1cblxuLyoqXG4gKiBTaG93cyBob3cgZG93bnN0cmVhbSBhcHBzIHV0aWxpemUgdGhlIHNoZWxsIHRoaXMgYXBwIHByb3ZpZGVzXG4gKi9cbmNvbnN0IEJhc2VBcHAgPSAoKSA9PiB7XG4gIHVzZURlZmF1bHRXZWxjb21lKClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEhlbHAgLz5cbiAgICAgIDxBcHBcbiAgICAgICAgUm91dGVJbmZvcm1hdGlvbj17Um91dGVJbmZvcm1hdGlvbn1cbiAgICAgICAgTm90aWZpY2F0aW9uc0NvbXBvbmVudD17VXNlck5vdGlmaWNhdGlvbnN9XG4gICAgICAgIFNldHRpbmdzQ29tcG9uZW50cz17QmFzZVNldHRpbmdzfVxuICAgICAgLz5cbiAgICA8Lz5cbiAgKVxufVxuXG5jb25zdCBXcmFwcGVkV2l0aFByb3ZpZGVycyA9ICgpID0+IHtcbiAgcmV0dXJuIChcbiAgICA8RXh0ZW5zaW9uUG9pbnRzLnByb3ZpZGVycz5cbiAgICAgIDxCYXNlQXBwIC8+XG4gICAgPC9FeHRlbnNpb25Qb2ludHMucHJvdmlkZXJzPlxuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGhvdChXcmFwcGVkV2l0aFByb3ZpZGVycylcbiJdfQ==