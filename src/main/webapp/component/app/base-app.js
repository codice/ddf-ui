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
//# sourceMappingURL=base-app.js.map