import { __assign, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { Switch, Route, useLocation, useHistory, } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import $ from 'jquery';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ExpandingButton from '../button/expanding-button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import Drawer from '@mui/material/Drawer';
import queryString from 'query-string';
import { Link } from '../link/link';
import { Memo } from '../memo/memo';
import HelpIcon from '@mui/icons-material/Help';
import NotificationsIcon from '@mui/icons-material/Notifications';
import userInstance from '../singletons/user-instance';
import notifications from '../singletons/user-notifications';
import SystemUsageModal from '../system-usage/system-usage';
import UserView, { RoleDisplay } from '../../react-component/user/user';
import UserSettings from '../../react-component/user-settings/user-settings';
import { GlobalStyles } from './global-styles';
import scrollIntoView from 'scroll-into-view-if-needed';
import { Elevations } from '../theme/theme';
import { useBackbone, useListenTo, } from '../selection-checkbox/useBackbone.hook';
import { AsyncTasks, useRenderOnAsyncTasksAddOrRemove, } from '../../js/model/AsyncTask/async-task';
import useSnack from '../hooks/useSnack';
import LinearProgress from '@mui/material/LinearProgress';
import { useDialogState } from '../hooks/useDialogState';
import SessionTimeout from '../../react-component/session-timeout';
import { AjaxErrorHandling } from './ajax-error-handling';
import { WreqrSnacks } from './wreqr-snacks';
import sessionTimeoutModel from '../singletons/session-timeout';
import Extensions from '../../extension-points';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
export var handleBase64EncodedImages = function (url) {
    if (url && url.startsWith('data:')) {
        return url;
    }
    return "data:image/png;base64,".concat(url);
};
var matchesRoute = function (_a) {
    var routeInfo = _a.routeInfo, pathname = _a.pathname;
    if (routeInfo.routeProps.path &&
        typeof routeInfo.routeProps.path === 'string') {
        return (pathname.startsWith("".concat(routeInfo.routeProps.path, "/")) ||
            pathname.endsWith("".concat(routeInfo.routeProps.path)));
    }
    else if (routeInfo.routeProps.path &&
        routeInfo.routeProps.path.constructor === Array) {
        return routeInfo.routeProps.path.some(function (possibleRoute) {
            return pathname.startsWith("".concat(possibleRoute, "/")) ||
                pathname.endsWith("".concat(possibleRoute));
        });
    }
    return false;
};
function sidebarDataIdTag(name) {
    return "sidebar-".concat(name, "-button");
}
/**
 * If you're not using a custom loading screen,
 * this handles removing the default one for you on first render
 * of the app.
 */
export var useDefaultWelcome = function () {
    React.useEffect(function () {
        var loadingElement = document.querySelector('#loading');
        if (loadingElement) {
            loadingElement.classList.remove('is-open');
            setTimeout(function () {
                loadingElement.remove();
            }, 500);
        }
    }, []);
};
var scrollCurrentRouteIntoView = function () {
    setTimeout(function () {
        var currentroute = document.querySelector('[data-currentroute]');
        if (currentroute) {
            scrollIntoView(currentroute, {
                behavior: 'smooth',
                scrollMode: 'if-needed',
            });
        }
    }, 0);
};
var AsyncTasksComponent = function () {
    var _a = __read(React.useState(false), 2), showBar = _a[0], setShowBar = _a[1];
    useRenderOnAsyncTasksAddOrRemove();
    var addSnack = useSnack();
    var history = useHistory();
    React.useEffect(function () {
        var timeoutid = undefined;
        timeoutid = window.setTimeout(function () {
            setShowBar(false);
        }, 1000);
        return function () {
            clearTimeout(timeoutid);
        };
    }, [showBar]);
    React.useEffect(function () {
        var timeoutid = undefined;
        if (AsyncTasks.hasShowableTasks()) {
            setShowBar(true);
            window.onbeforeunload = function () {
                setShowBar(true);
                return "Are you sure you want to leave? ".concat(AsyncTasks.list.length, " tasks are still running.");
            };
        }
        else {
            setShowBar(false);
        }
        timeoutid = window.setTimeout(function () {
            setShowBar(false);
        }, 1000);
        return function () {
            clearTimeout(timeoutid);
            window.onbeforeunload = null;
        };
    }, [AsyncTasks.list.length]);
    React.useEffect(function () {
        var unsubs = AsyncTasks.list.map(function (task) {
            return task.subscribeTo({
                subscribableThing: 'update',
                callback: function () {
                    AsyncTasks.remove(task);
                    if (AsyncTasks.isRestoreTask(task)) {
                        addSnack("Restore of ".concat(task.lazyResult.plain.metacard.properties.title, " complete."), {
                            timeout: 5000,
                            closeable: true,
                            alertProps: {
                                action: (React.createElement(Button, { component: Link, to: "/search/".concat(task.lazyResult.plain.metacard.properties['metacard.deleted.id']) }, "Go to")),
                            },
                        });
                    }
                    if (AsyncTasks.isDeleteTask(task)) {
                        addSnack("Delete of ".concat(task.lazyResult.plain.metacard.properties.title, " complete."), {
                            undo: function () {
                                history.push({
                                    pathname: "/search/".concat(task.lazyResult.plain.id),
                                    search: '',
                                });
                                AsyncTasks.restore({ lazyResult: task.lazyResult });
                            },
                        });
                    }
                    if (AsyncTasks.isCreateSearchTask(task)) {
                        addSnack("Creation of ".concat(task.data.title, " complete."));
                    }
                },
            });
        });
        return function () {
            unsubs.forEach(function (unsub) {
                unsub();
            });
        };
    });
    if (AsyncTasks.list.length > 0) {
        return (React.createElement("div", { className: "".concat(showBar ? 'translate-y-0' : 'translate-y-full', " absolute left-0 bottom-0 w-full bg-black bg-opacity-75 h-16 z-50 transition transform ease-in-out duration-500 hover:translate-y-0") },
            React.createElement(LinearProgress, { className: "w-full absolute h-2 left-0 top-0 -mt-2", variant: "indeterminate" }),
            React.createElement("div", { className: "flex flex-col overflow-auto h-full w-full items-center justify-center text-white" }, AsyncTasks.list.map(function (asyncTask) {
                if (AsyncTasks.isRestoreTask(asyncTask)) {
                    return (React.createElement("div", { className: "bg-black p-2" },
                        "Restoring '",
                        asyncTask.lazyResult.plain.metacard.properties.title,
                        "'"));
                }
                if (AsyncTasks.isDeleteTask(asyncTask)) {
                    return (React.createElement("div", { className: "bg-black p-2" },
                        "Deleting '",
                        asyncTask.lazyResult.plain.metacard.properties.title,
                        "'"));
                }
                if (AsyncTasks.isCreateSearchTask(asyncTask)) {
                    return (React.createElement("div", { className: "bg-black p-2" },
                        "Creating '",
                        asyncTask.data.title,
                        "'"));
                }
                if (AsyncTasks.isSaveSearchTask(asyncTask)) {
                    return (React.createElement("div", { className: "bg-black p-2" },
                        "Saving '",
                        asyncTask.data.title,
                        "'"));
                }
                if (AsyncTasks.isCreateTask(asyncTask)) {
                    return (React.createElement("div", { className: "bg-black p-2" },
                        "Creating '",
                        asyncTask.data.title,
                        "'"));
                }
                if (AsyncTasks.isSaveTask(asyncTask)) {
                    return (React.createElement("div", { className: "bg-black p-2" },
                        "Saving '",
                        asyncTask.data.title,
                        "'"));
                }
                return null;
            }))));
    }
    return null;
};
/** The song and dance around 'a' vs Link has to do with react router not supporting these outside links */
var HelpButton = function () {
    var getHelpUrl = useConfiguration().getHelpUrl;
    var location = useLocation();
    var queryParams = queryString.parse(location.search);
    var navOpen = useNavContextProvider().navOpen;
    return (React.createElement(ExpandingButton, { component: getHelpUrl() ? 'a' : Link, href: getHelpUrl(), to: getHelpUrl()
            ? getHelpUrl()
            : {
                pathname: "".concat(location.pathname),
                search: "".concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-help': 'Help' }))),
            }, target: getHelpUrl() ? '_blank' : undefined, className: "group-hover:opacity-100 opacity-25  hover:opacity-100 focus-visible:opacity-100 transition-opacity", Icon: HelpIcon, expandedLabel: "Help", unexpandedLabel: "", dataId: sidebarDataIdTag('help'), expanded: navOpen, focusVisibleClassName: "focus-visible" }));
};
var SettingsButton = function () {
    var SettingsComponents = useTopLevelAppContext().SettingsComponents;
    var location = useLocation();
    var history = useHistory();
    var queryParams = queryString.parse(location.search);
    var open = Boolean(queryParams['global-settings']);
    var navOpen = useNavContextProvider().navOpen;
    return (React.createElement(React.Fragment, null,
        React.createElement(ExpandingButton, { component: Link, to: {
                pathname: "".concat(location.pathname),
                search: "".concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-settings': 'Settings' }))),
            }, className: "group-hover:opacity-100 opacity-25 relative hover:opacity-100 focus-visible:opacity-100 transition-opacity", Icon: SettingsIcon, expandedLabel: "Settings", unexpandedLabel: "", dataId: sidebarDataIdTag('settings'), expanded: navOpen, focusVisibleClassName: "focus-visible" }),
        React.createElement(Drawer, { anchor: "left", open: open, onClose: function () {
                delete queryParams['global-settings'];
                history.push("".concat(location.pathname, "?").concat(queryString.stringify(queryParams)));
            }, PaperProps: {
                className: 'min-w-120 max-w-4/5 ',
            } },
            React.createElement(UserSettings, { SettingsComponents: SettingsComponents }))));
};
var NotificationsButton = function () {
    var hasUnseenNotifications = useIndicateHasUnseenNotifications();
    var NotificationsComponent = useTopLevelAppContext().NotificationsComponent;
    var location = useLocation();
    var history = useHistory();
    var queryParams = queryString.parse(location.search);
    var open = Boolean(queryParams['global-notifications']);
    var navOpen = useNavContextProvider().navOpen;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: hasUnseenNotifications ? 'animate-wiggle Mui-text-warning' : '' },
            React.createElement(ExpandingButton, { component: Link, to: {
                    pathname: "".concat(location.pathname),
                    search: "".concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-notifications': 'Notifications' }))),
                }, className: "".concat(!hasUnseenNotifications ? 'opacity-25' : '', " group-hover:opacity-100  relative hover:opacity-100 focus-visible:opacity-100 transition-opacity"), Icon: NotificationsIcon, expandedLabel: "Notifications", unexpandedLabel: "", dataId: sidebarDataIdTag('notifications'), expanded: navOpen, focusVisibleClassName: "focus-visible", orientation: "vertical" })),
        React.createElement(Drawer, { anchor: "left", open: open, onClose: function () {
                delete queryParams['global-notifications'];
                history.push("".concat(location.pathname, "?").concat(queryString.stringify(queryParams)));
                notifications.setSeen();
                userInstance.savePreferences();
            }, PaperProps: {
                className: 'min-w-120 max-w-4/5 ',
            } },
            React.createElement(NotificationsComponent, null))));
};
var UserButton = function () {
    var location = useLocation();
    var history = useHistory();
    var queryParams = queryString.parse(location.search);
    var open = Boolean(queryParams['global-user']);
    var navOpen = useNavContextProvider().navOpen;
    var getLabel = function () {
        return (React.createElement("div", { className: "w-full" },
            React.createElement("div", { className: "w-full truncate" }, userInstance.getUserName()),
            React.createElement("div", { className: "text-xs truncate w-full" },
                React.createElement(RoleDisplay, null))));
    };
    return (React.createElement(React.Fragment, null,
        React.createElement(ExpandingButton, { component: Link, to: {
                pathname: "".concat(location.pathname),
                search: "".concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-user': 'User' }))),
            }, className: "group-hover:opacity-100 opacity-25 relative hover:opacity-100 focus-visible:opacity-100 transition-opacity", Icon: PersonIcon, expandedLabel: getLabel(), unexpandedLabel: getLabel(), dataId: sidebarDataIdTag('user-profile'), expanded: navOpen, focusVisibleClassName: "focus-visible" }),
        React.createElement(Drawer, { anchor: "left", open: open, onClose: function () {
                delete queryParams['global-user'];
                history.push("".concat(location.pathname, "?").concat(queryString.stringify(queryParams)));
            }, PaperProps: {
                className: 'min-w-120 max-w-4/5 ',
            } },
            React.createElement(UserView, null))));
};
var RouteButton = function (_a) {
    var _b;
    var routeInfo = _a.routeInfo;
    var location = useLocation();
    var navOpen = useNavContextProvider().navOpen;
    var isSelected = matchesRoute({
        routeInfo: routeInfo,
        pathname: location.pathname,
    });
    return (React.createElement(ExpandingButton, __assign({ key: routeInfo.linkProps.to.toString(), component: Link, to: routeInfo.linkProps.to, className: "group-hover:opacity-100 ".concat(!isSelected ? 'opacity-25' : '', " focus-visible:opacity-100 hover:opacity-100 transition-opacity"), expanded: navOpen }, routeInfo.navButtonProps, { focusVisibleClassName: "focus-visible", dataId: sidebarDataIdTag(routeInfo.navButtonProps.dataId) }, (isSelected
        ? (_b = {},
            _b['data-currentroute'] = true,
            _b) : {}))));
};
var SideBarRoutes = function () {
    var RouteInformation = useTopLevelAppContext().RouteInformation;
    return (React.createElement(Grid, { item: true, className: "overflow-auto p-0 shrink-0 scrollbars-min", style: {
            maxHeight: "calc(100% - ".concat(7 * 4, "rem)"), //
        } },
        RouteInformation.filter(function (routeInfo) { return routeInfo.showInNav; }).map(function (routeInfo) {
            var _a;
            return (React.createElement(RouteButton, { routeInfo: routeInfo, key: (_a = routeInfo.routeProps.path) === null || _a === void 0 ? void 0 : _a.toString() }));
        }),
        React.createElement(Extensions.extraRoutes, null)));
};
var SideBarNavigationButtons = function () {
    var navOpen = useNavContextProvider().navOpen;
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { item: true, className: "w-full p-2 shrink-0" },
            React.createElement(Grid, { container: true, wrap: "nowrap", alignItems: "center", className: "w-full h-full overflow-hidden" },
                React.createElement(Grid, { item: true, className: "mr-auto" },
                    React.createElement(Button, { onClick: function () { return history.back(); } },
                        React.createElement(ArrowBackIcon, { fontSize: "small" }),
                        navOpen && 'Back')),
                React.createElement(Grid, { item: true, className: "ml-auto" },
                    React.createElement(Button, { onClick: function () { return history.forward(); } },
                        navOpen && 'Forward',
                        React.createElement(ArrowForwardIcon, { fontSize: "small" })))))));
};
var SideBarToggleButton = function () {
    var _a = useNavContextProvider(), navOpen = _a.navOpen, setNavOpen = _a.setNavOpen;
    var _b = useConfiguration(), getTopLeftLogoSrc = _b.getTopLeftLogoSrc, getCustomBranding = _b.getCustomBranding, getProduct = _b.getProduct, getMenuIconSrc = _b.getMenuIconSrc;
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { item: true, className: "w-full h-16 shrink-0" }, navOpen ? (React.createElement(React.Fragment, null,
            React.createElement(Grid, { container: true, wrap: "nowrap", alignItems: "center", className: "w-full h-full overflow-hidden" },
                React.createElement(Grid, { item: true, className: "pl-3 py-1 pr-1 w-full relative h-full" }, getTopLeftLogoSrc() ? (React.createElement("img", { className: "max-h-full max-w-full absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 p-4", src: handleBase64EncodedImages(getTopLeftLogoSrc()) })) : (React.createElement(Grid, { container: true, direction: "column", className: "pl-3", justifyContent: "center" },
                    React.createElement(Grid, { item: true },
                        React.createElement(Typography, null, getCustomBranding())),
                    React.createElement(Grid, { item: true },
                        React.createElement(Typography, null, getProduct()))))),
                React.createElement(Grid, { item: true, className: "ml-auto" },
                    React.createElement(IconButton, { className: "h-auto", onClick: function () {
                            setNavOpen(false);
                        }, size: "large" },
                        React.createElement(ChevronLeftIcon, null)))))) : (React.createElement(Button, { color: "inherit", "aria-label": "open drawer", onClick: function () {
                setNavOpen(true);
            }, className: "w-full h-full p-2" }, getMenuIconSrc() ? (React.createElement(React.Fragment, null,
            React.createElement("img", { src: handleBase64EncodedImages(getMenuIconSrc()), className: "max-h-16 max-w-full" }))) : (React.createElement(MenuIcon, null)))))));
};
var SideBar = function () {
    var navOpen = useNavContextProvider().navOpen;
    return (React.createElement(Grid, { item: true, className: "".concat(navOpen ? 'w-64' : 'w-20', " transition-all duration-200 ease-in-out relative z-10 mr-2 shrink-0 pb-2 pt-2 pl-2 group"), onMouseLeave: function () {
            scrollCurrentRouteIntoView();
        } },
        React.createElement(Paper, { elevation: Elevations.navbar, className: "h-full" },
            React.createElement(Grid, { container: true, direction: "column", className: "h-full w-full", wrap: "nowrap" },
                Extensions.includeNavigationButtons && (React.createElement(React.Fragment, null,
                    React.createElement(SideBarNavigationButtons, null),
                    React.createElement(Divider, null))),
                React.createElement(SideBarToggleButton, null),
                React.createElement(Divider, null),
                React.createElement(SideBarRoutes, null),
                React.createElement(Divider, null),
                React.createElement(SideBarBackground, null),
                React.createElement(Divider, null),
                React.createElement(Grid, { item: true, className: "mt-auto overflow-hidden w-full shrink-0 grow-0" },
                    Extensions.extraSidebarButtons && (React.createElement(Extensions.extraSidebarButtons, null)),
                    React.createElement(HelpButton, null),
                    React.createElement(SettingsButton, null),
                    React.createElement(NotificationsButton, null),
                    React.createElement(UserButton, null))))));
};
var Header = function () {
    var _a = useConfiguration(), getPlatformBackground = _a.getPlatformBackground, getPlatformColor = _a.getPlatformColor, getPlatformHeader = _a.getPlatformHeader;
    return (React.createElement(Grid, { item: true, className: "w-full" }, getPlatformHeader() ? (React.createElement(Typography, { align: "center", style: {
            background: getPlatformBackground(),
            color: getPlatformColor(),
        } }, getPlatformHeader())) : null));
};
var Footer = function () {
    var _a = useConfiguration(), getPlatformBackground = _a.getPlatformBackground, getPlatformColor = _a.getPlatformColor, getPlatformFooter = _a.getPlatformFooter;
    return (React.createElement(Grid, { item: true, className: "w-full" }, getPlatformFooter() ? (React.createElement(Typography, { align: "center", style: {
            background: getPlatformBackground(),
            color: getPlatformColor(),
        } }, getPlatformFooter())) : null));
};
var SideBarBackground = function () {
    var getBottomLeftBackgroundSrc = useConfiguration().getBottomLeftBackgroundSrc;
    return (React.createElement(Grid, { item: true, className: "relative overflow-hidden shrink-1 h-full min-w-full" }, getBottomLeftBackgroundSrc() ? (React.createElement("img", { className: "group-hover:opacity-100 opacity-50 duration-200 ease-in-out transition-all w-auto h-full absolute max-w-none m-auto min-h-80", src: handleBase64EncodedImages(getBottomLeftBackgroundSrc()) })) : null));
};
var RouteContents = function () {
    var RouteInformation = useTopLevelAppContext().RouteInformation;
    /**
     * So this is slightly annoying, but the grid won't properly resize without overflow hidden set.
     *
     * That makes handling padding / margins / spacing more complicated in our app, because with overflow hidden set
     * dropshadows on elements will get cut off.  So we have to let the contents instead dictate their padding, that way
     * their dropshadows can be seen.
     *
     * Folks will probably struggle a bit with it at first, but the css utilities actually make it pretty easy.
     * Just add pb-2 for the correct bottom spacing, pt-2 for correct top spacing, etc. etc.
     */
    return (React.createElement(Grid, { item: true, className: "w-full h-full relative z-0 shrink-1 overflow-x-hidden" // do not remove this overflow hidden, see comment above for more
     },
        React.createElement(Memo, null,
            React.createElement(Switch, null, RouteInformation.map(function (routeInfo) {
                return (React.createElement(Route, __assign({ key: routeInfo.routeProps.path
                        ? routeInfo.routeProps.path.toString()
                        : Math.random() }, routeInfo.routeProps)));
            })))));
};
var NavContextProvider = React.createContext({
    setNavOpen: function (_navOpen) { },
    navOpen: false,
});
export var useNavContextProvider = function () {
    var navContext = React.useContext(NavContextProvider);
    return navContext;
};
/**
 * Keep the current route visible to the user since it's useful info.
 * This also ensures it's visible upon first load of the page.
 */
var useScrollCurrentRouteIntoViewOnLocationChange = function () {
    var location = useLocation();
    React.useEffect(function () {
        scrollCurrentRouteIntoView();
    }, [location]);
};
var useIndicateHasUnseenNotifications = function () {
    var listenTo = useBackbone().listenTo;
    var _a = __read(React.useState(notifications.hasUnseen()), 2), hasUnseenNotifications = _a[0], setHasUnseenNotifications = _a[1];
    React.useEffect(function () {
        listenTo(notifications, 'change add remove reset update', function () {
            setHasUnseenNotifications(notifications.hasUnseen());
        });
    }, []);
    return hasUnseenNotifications;
};
var useFaviconBranding = function () {
    // todo favicon branding
    // $(window.document).ready(() => {
    //   window.document.title = properties.branding + ' ' + properties.product
    //   const favicon = document.querySelector('#favicon') as HTMLAnchorElement
    //   favicon.href = brandingInformation.topLeftLogoSrc
    //   favicon.remove()
    //   document.head.appendChild(favicon)
    // })
};
var useNavOpen = function () {
    var defaultOpen = localStorage.getItem('shell.drawer') === 'true' ? true : false;
    var _a = __read(React.useState(defaultOpen), 2), navOpen = _a[0], setNavOpen = _a[1];
    React.useEffect(function () {
        localStorage.setItem('shell.drawer', navOpen.toString());
        setTimeout(function () {
            $(window).resize(); // needed for golden layout to resize
        }, 250);
    }, [navOpen]);
    return {
        navOpen: navOpen,
        setNavOpen: setNavOpen,
    };
};
var TopLevelAppContext = React.createContext({
    RouteInformation: [],
    NotificationsComponent: function () { return null; },
    SettingsComponents: {},
});
var useTopLevelAppContext = function () {
    var topLevelAppContext = React.useContext(TopLevelAppContext);
    return topLevelAppContext;
};
var SessionTimeoutComponent = function () {
    var sessionTimeoutDialogState = useDialogState();
    useListenTo(sessionTimeoutModel, 'change:showPrompt', function () {
        if (sessionTimeoutModel.get('showPrompt')) {
            sessionTimeoutDialogState.handleClick();
        }
        else {
            sessionTimeoutDialogState.handleClose();
        }
    });
    return (React.createElement(sessionTimeoutDialogState.MuiDialogComponents.Dialog, __assign({}, sessionTimeoutDialogState.MuiDialogProps, { disableEscapeKeyDown: true, onClose: function (event, reason) {
            if (reason === 'backdropClick') {
                return;
            }
            sessionTimeoutDialogState.MuiDialogProps.onClose(event, reason);
        } }),
        React.createElement(SessionTimeout, null)));
};
var App = function (_a) {
    var RouteInformation = _a.RouteInformation, NotificationsComponent = _a.NotificationsComponent, SettingsComponents = _a.SettingsComponents;
    var _b = useNavOpen(), navOpen = _b.navOpen, setNavOpen = _b.setNavOpen;
    useFaviconBranding();
    useScrollCurrentRouteIntoViewOnLocationChange();
    return (React.createElement(TopLevelAppContext.Provider, { value: { RouteInformation: RouteInformation, NotificationsComponent: NotificationsComponent, SettingsComponents: SettingsComponents } },
        React.createElement(NavContextProvider.Provider, { value: { navOpen: navOpen, setNavOpen: setNavOpen } },
            React.createElement("div", { className: "h-full w-full overflow-hidden Mui-bg-default" },
                React.createElement(CssBaseline, null),
                React.createElement(GlobalStyles, null),
                React.createElement(SystemUsageModal, null),
                React.createElement(SessionTimeoutComponent, null),
                React.createElement(AjaxErrorHandling, null),
                React.createElement(WreqrSnacks, null),
                React.createElement(Grid, { container: true, alignItems: "center", className: "h-full w-full overflow-hidden", direction: "column", wrap: "nowrap" },
                    React.createElement(Header, null),
                    React.createElement(Extensions.extraHeader, null),
                    React.createElement(Grid, { item: true, className: "w-full h-full relative overflow-hidden" },
                        React.createElement(AsyncTasksComponent, null),
                        React.createElement(Grid, { container: true, direction: "row", wrap: "nowrap", alignItems: "stretch", className: "w-full h-full" },
                            React.createElement(SideBar, null),
                            React.createElement(RouteContents, null))),
                    React.createElement(Extensions.extraFooter, null),
                    React.createElement(Footer, null))))));
};
export default hot(App);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9hcHAvYXBwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sRUFDTCxNQUFNLEVBQ04sS0FBSyxFQUNMLFdBQVcsRUFDWCxVQUFVLEdBR1gsTUFBTSxrQkFBa0IsQ0FBQTtBQUN6QixPQUFPLFdBQVcsTUFBTSwyQkFBMkIsQ0FBQTtBQUNuRCxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxlQUFlLE1BQU0sNEJBQTRCLENBQUE7QUFDeEQsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxhQUFhLE1BQU0sK0JBQStCLENBQUE7QUFDekQsT0FBTyxnQkFBZ0IsTUFBTSxrQ0FBa0MsQ0FBQTtBQUMvRCxPQUFPLGVBQWUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUM3RCxPQUFPLFFBQVEsTUFBTSwwQkFBMEIsQ0FBQTtBQUMvQyxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQTtBQUN2RCxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLFdBQVcsTUFBTSxjQUFjLENBQUE7QUFDdEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNuQyxPQUFP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NEJBQ1gsb0JBQUMsYUFBYSxPQUFHLENBQ1osQ0FDRjtvQkFDUCxvQkFBQyxVQUFVLENBQUMsV0FBVyxPQUFHO29CQUMxQixvQkFBQyxNQUFNLE9BQUcsQ0FDTCxDQUNILENBQ3NCLENBQ0YsQ0FDL0IsQ0FBQTtBQUNILENBQUMsQ0FBQTtBQUNELGVBQWUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgeyBob3QgfSBmcm9tICdyZWFjdC1ob3QtbG9hZGVyL3Jvb3QnXG5pbXBvcnQge1xuICBTd2l0Y2gsXG4gIFJvdXRlLFxuICB1c2VMb2NhdGlvbixcbiAgdXNlSGlzdG9yeSxcbiAgUm91dGVQcm9wcyxcbiAgTGlua1Byb3BzLFxufSBmcm9tICdyZWFjdC1yb3V0ZXItZG9tJ1xuaW1wb3J0IENzc0Jhc2VsaW5lIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQ3NzQmFzZWxpbmUnXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCBUeXBvZ3JhcGh5IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVHlwb2dyYXBoeSdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgRXhwYW5kaW5nQnV0dG9uIGZyb20gJy4uL2J1dHRvbi9leHBhbmRpbmctYnV0dG9uJ1xuaW1wb3J0IERpdmlkZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9EaXZpZGVyJ1xuaW1wb3J0IEljb25CdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9JY29uQnV0dG9uJ1xuaW1wb3J0IEFycm93QmFja0ljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9BcnJvd0JhY2snXG5pbXBvcnQgQXJyb3dGb3J3YXJkSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0Fycm93Rm9yd2FyZCdcbmltcG9ydCBDaGV2cm9uTGVmdEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9DaGV2cm9uTGVmdCdcbmltcG9ydCBNZW51SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL01lbnUnXG5pbXBvcnQgUGVyc29uSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL1BlcnNvbidcbmltcG9ydCBTZXR0aW5nc0ljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9TZXR0aW5ncydcbmltcG9ydCBEcmF3ZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9EcmF3ZXInXG5pbXBvcnQgcXVlcnlTdHJpbmcgZnJvbSAncXVlcnktc3RyaW5nJ1xuaW1wb3J0IHsgTGluayB9IGZyb20gJy4uL2xpbmsvbGluaydcbmltcG9ydCB7IE1lbW8gfSBmcm9tICcuLi9tZW1vL21lbW8nXG5pbXBvcnQgSGVscEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9IZWxwJ1xuaW1wb3J0IE5vdGlmaWNhdGlvbnNJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvTm90aWZpY2F0aW9ucydcbmltcG9ydCB1c2VySW5zdGFuY2UgZnJvbSAnLi4vc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IG5vdGlmaWNhdGlvbnMgZnJvbSAnLi4vc2luZ2xldG9ucy91c2VyLW5vdGlmaWNhdGlvbnMnXG5pbXBvcnQgU3lzdGVtVXNhZ2VNb2RhbCBmcm9tICcuLi9zeXN0ZW0tdXNhZ2Uvc3lzdGVtLXVzYWdlJ1xuXG5pbXBvcnQgVXNlclZpZXcsIHsgUm9sZURpc3BsYXkgfSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXNlci91c2VyJ1xuaW1wb3J0IFVzZXJTZXR0aW5ncywge1xuICBTZXR0aW5nc0NvbXBvbmVudFR5cGUsXG59IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91c2VyLXNldHRpbmdzL3VzZXItc2V0dGluZ3MnXG5pbXBvcnQgeyBHbG9iYWxTdHlsZXMgfSBmcm9tICcuL2dsb2JhbC1zdHlsZXMnXG5pbXBvcnQgeyBQZXJtaXNzaXZlQ29tcG9uZW50VHlwZSB9IGZyb20gJy4uLy4uL3R5cGVzY3JpcHQnXG5pbXBvcnQgc2Nyb2xsSW50b1ZpZXcgZnJvbSAnc2Nyb2xsLWludG8tdmlldy1pZi1uZWVkZWQnXG5pbXBvcnQgeyBFbGV2YXRpb25zIH0gZnJvbSAnLi4vdGhlbWUvdGhlbWUnXG5pbXBvcnQge1xuICB1c2VCYWNrYm9uZSxcbiAgdXNlTGlzdGVuVG8sXG59IGZyb20gJy4uL3NlbGVjdGlvbi1jaGVja2JveC91c2VCYWNrYm9uZS5ob29rJ1xuaW1wb3J0IHtcbiAgQXN5bmNUYXNrcyxcbiAgdXNlUmVuZGVyT25Bc3luY1Rhc2tzQWRkT3JSZW1vdmUsXG59IGZyb20gJy4uLy4uL2pzL21vZGVsL0FzeW5jVGFzay9hc3luYy10YXNrJ1xuaW1wb3J0IHVzZVNuYWNrIGZyb20gJy4uL2hvb2tzL3VzZVNuYWNrJ1xuaW1wb3J0IExpbmVhclByb2dyZXNzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTGluZWFyUHJvZ3Jlc3MnXG5pbXBvcnQgeyBCYXNlUHJvcHMgfSBmcm9tICcuLi9idXR0b24vZXhwYW5kaW5nLWJ1dHRvbidcbmltcG9ydCB7IHVzZURpYWxvZ1N0YXRlIH0gZnJvbSAnLi4vaG9va3MvdXNlRGlhbG9nU3RhdGUnXG5pbXBvcnQgU2Vzc2lvblRpbWVvdXQgZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3Nlc3Npb24tdGltZW91dCdcbmltcG9ydCB7IEFqYXhFcnJvckhhbmRsaW5nIH0gZnJvbSAnLi9hamF4LWVycm9yLWhhbmRsaW5nJ1xuaW1wb3J0IHsgV3JlcXJTbmFja3MgfSBmcm9tICcuL3dyZXFyLXNuYWNrcydcbmltcG9ydCBzZXNzaW9uVGltZW91dE1vZGVsIGZyb20gJy4uL3NpbmdsZXRvbnMvc2Vzc2lvbi10aW1lb3V0J1xuaW1wb3J0IEV4dGVuc2lvbnMgZnJvbSAnLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCB7IHVzZUNvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL2NvbmZpZ3VyYXRpb24uaG9va3MnXG5cbmV4cG9ydCBjb25zdCBoYW5kbGVCYXNlNjRFbmNvZGVkSW1hZ2VzID0gKHVybDogc3RyaW5nKSA9PiB7XG4gIGlmICh1cmwgJiYgdXJsLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICByZXR1cm4gdXJsXG4gIH1cbiAgcmV0dXJuIGBkYXRhOmltYWdlL3BuZztiYXNlNjQsJHt1cmx9YFxufVxudHlwZSBGb3JOYXZCdXR0b25UeXBlID0gT21pdDxCYXNlUHJvcHMsICdleHBhbmRlZCc+ICZcbiAgUmVxdWlyZWQ8UGljazxCYXNlUHJvcHMsICdkYXRhSWQnPj5cbmV4cG9ydCB0eXBlIFJvdXRlU2hvd25Jbk5hdlR5cGUgPSB7XG4gIHJvdXRlUHJvcHM6IFJvdXRlUHJvcHNcbiAgbGlua1Byb3BzOiBMaW5rUHJvcHNcbiAgc2hvd0luTmF2OiB0cnVlXG4gIG5hdkJ1dHRvblByb3BzOiBGb3JOYXZCdXR0b25UeXBlXG59XG5leHBvcnQgdHlwZSBSb3V0ZU5vdFNob3duSW5OYXZUeXBlID0ge1xuICByb3V0ZVByb3BzOiBSb3V0ZVByb3BzXG4gIHNob3dJbk5hdjogZmFsc2Vcbn1cbmV4cG9ydCB0eXBlIEluZGl2aWR1YWxSb3V0ZVR5cGUgPSBSb3V0ZVNob3duSW5OYXZUeXBlIHwgUm91dGVOb3RTaG93bkluTmF2VHlwZVxuY29uc3QgbWF0Y2hlc1JvdXRlID0gKHtcbiAgcm91dGVJbmZvLFxuICBwYXRobmFtZSxcbn06IHtcbiAgcm91dGVJbmZvOiBJbmRpdmlkdWFsUm91dGVUeXBlXG4gIHBhdGhuYW1lOiBzdHJpbmdcbn0pID0+IHtcbiAgaWYgKFxuICAgIHJvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGggJiZcbiAgICB0eXBlb2Ygcm91dGVJbmZvLnJvdXRlUHJvcHMucGF0aCA9PT0gJ3N0cmluZydcbiAgKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHBhdGhuYW1lLnN0YXJ0c1dpdGgoYCR7cm91dGVJbmZvLnJvdXRlUHJvcHMucGF0aH0vYCkgfHxcbiAgICAgIHBhdGhuYW1lLmVuZHNXaXRoKGAke3JvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGh9YClcbiAgICApXG4gIH0gZWxzZSBpZiAoXG4gICAgcm91dGVJbmZvLnJvdXRlUHJvcHMucGF0aCAmJlxuICAgIHJvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGguY29uc3RydWN0b3IgPT09IEFycmF5XG4gICkge1xuICAgIHJldHVybiByb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoLnNvbWUoXG4gICAgICAocG9zc2libGVSb3V0ZSkgPT5cbiAgICAgICAgcGF0aG5hbWUuc3RhcnRzV2l0aChgJHtwb3NzaWJsZVJvdXRlfS9gKSB8fFxuICAgICAgICBwYXRobmFtZS5lbmRzV2l0aChgJHtwb3NzaWJsZVJvdXRlfWApXG4gICAgKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxudHlwZSBBcHBQcm9wc1R5cGUgPSB7XG4gIFJvdXRlSW5mb3JtYXRpb246IEluZGl2aWR1YWxSb3V0ZVR5cGVbXVxuICBOb3RpZmljYXRpb25zQ29tcG9uZW50OiBQZXJtaXNzaXZlQ29tcG9uZW50VHlwZVxuICBTZXR0aW5nc0NvbXBvbmVudHM6IFNldHRpbmdzQ29tcG9uZW50VHlwZVxufVxuZnVuY3Rpb24gc2lkZWJhckRhdGFJZFRhZyhuYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGBzaWRlYmFyLSR7bmFtZX0tYnV0dG9uYFxufVxuLyoqXG4gKiBJZiB5b3UncmUgbm90IHVzaW5nIGEgY3VzdG9tIGxvYWRpbmcgc2NyZWVuLFxuICogdGhpcyBoYW5kbGVzIHJlbW92aW5nIHRoZSBkZWZhdWx0IG9uZSBmb3IgeW91IG9uIGZpcnN0IHJlbmRlclxuICogb2YgdGhlIGFwcC5cbiAqL1xuZXhwb3J0IGNvbnN0IHVzZURlZmF1bHRXZWxjb21lID0gKCkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGxvYWRpbmdFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvYWRpbmcnKVxuICAgIGlmIChsb2FkaW5nRWxlbWVudCkge1xuICAgICAgbG9hZGluZ0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbG9hZGluZ0VsZW1lbnQucmVtb3ZlKClcbiAgICAgIH0sIDUwMClcbiAgICB9XG4gIH0sIFtdKVxufVxuY29uc3Qgc2Nyb2xsQ3VycmVudFJvdXRlSW50b1ZpZXcgPSAoKSA9PiB7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRyb3V0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWN1cnJlbnRyb3V0ZV0nKVxuICAgIGlmIChjdXJyZW50cm91dGUpIHtcbiAgICAgIHNjcm9sbEludG9WaWV3KGN1cnJlbnRyb3V0ZSwge1xuICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gICAgICAgIHNjcm9sbE1vZGU6ICdpZi1uZWVkZWQnLFxuICAgICAgfSlcbiAgICB9XG4gIH0sIDApXG59XG5jb25zdCBBc3luY1Rhc2tzQ29tcG9uZW50ID0gKCkgPT4ge1xuICBjb25zdCBbc2hvd0Jhciwgc2V0U2hvd0Jhcl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgdXNlUmVuZGVyT25Bc3luY1Rhc2tzQWRkT3JSZW1vdmUoKVxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgY29uc3QgaGlzdG9yeSA9IHVzZUhpc3RvcnkoKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCB0aW1lb3V0aWQgPSB1bmRlZmluZWQgYXMgbnVtYmVyIHwgdW5kZWZpbmVkXG4gICAgdGltZW91dGlkID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2V0U2hvd0JhcihmYWxzZSlcbiAgICB9LCAxMDAwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dGlkKVxuICAgIH1cbiAgfSwgW3Nob3dCYXJdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCB0aW1lb3V0aWQgPSB1bmRlZmluZWQgYXMgbnVtYmVyIHwgdW5kZWZpbmVkXG4gICAgaWYgKEFzeW5jVGFza3MuaGFzU2hvd2FibGVUYXNrcygpKSB7XG4gICAgICBzZXRTaG93QmFyKHRydWUpXG4gICAgICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIHNldFNob3dCYXIodHJ1ZSlcbiAgICAgICAgcmV0dXJuIGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbGVhdmU/ICR7QXN5bmNUYXNrcy5saXN0Lmxlbmd0aH0gdGFza3MgYXJlIHN0aWxsIHJ1bm5pbmcuYFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTaG93QmFyKGZhbHNlKVxuICAgIH1cbiAgICB0aW1lb3V0aWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRTaG93QmFyKGZhbHNlKVxuICAgIH0sIDEwMDApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0aWQpXG4gICAgICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBudWxsXG4gICAgfVxuICB9LCBbQXN5bmNUYXNrcy5saXN0Lmxlbmd0aF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW5zdWJzID0gQXN5bmNUYXNrcy5saXN0Lm1hcCgodGFzaykgPT4ge1xuICAgICAgcmV0dXJuIHRhc2suc3Vic2NyaWJlVG8oe1xuICAgICAgICBzdWJzY3JpYmFibGVUaGluZzogJ3VwZGF0ZScsXG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgQXN5bmNUYXNrcy5yZW1vdmUodGFzaylcbiAgICAgICAgICBpZiAoQXN5bmNUYXNrcy5pc1Jlc3RvcmVUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICBhZGRTbmFjayhcbiAgICAgICAgICAgICAgYFJlc3RvcmUgb2YgJHt0YXNrLmxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX0gY29tcGxldGUuYCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgICAgICAgICAgICAgY2xvc2VhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGFsZXJ0UHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgIGFjdGlvbjogKFxuICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50PXtMaW5rfVxuICAgICAgICAgICAgICAgICAgICAgIHRvPXtgL3NlYXJjaC8ke3Rhc2subGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC5kZWxldGVkLmlkJ119YH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIEdvIHRvXG4gICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzRGVsZXRlVGFzayh0YXNrKSkge1xuICAgICAgICAgICAgYWRkU25hY2soXG4gICAgICAgICAgICAgIGBEZWxldGUgb2YgJHt0YXNrLmxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX0gY29tcGxldGUuYCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHVuZG86ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGhpc3RvcnkucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGhuYW1lOiBgL3NlYXJjaC8ke3Rhc2subGF6eVJlc3VsdC5wbGFpbi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICBzZWFyY2g6ICcnLFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIEFzeW5jVGFza3MucmVzdG9yZSh7IGxhenlSZXN1bHQ6IHRhc2subGF6eVJlc3VsdCB9KVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNDcmVhdGVTZWFyY2hUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICBhZGRTbmFjayhgQ3JlYXRpb24gb2YgJHt0YXNrLmRhdGEudGl0bGV9IGNvbXBsZXRlLmApXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB1bnN1YnMuZm9yRWFjaCgodW5zdWIpID0+IHtcbiAgICAgICAgdW5zdWIoKVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG4gIGlmIChBc3luY1Rhc2tzLmxpc3QubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17YCR7XG4gICAgICAgICAgc2hvd0JhciA/ICd0cmFuc2xhdGUteS0wJyA6ICd0cmFuc2xhdGUteS1mdWxsJ1xuICAgICAgICB9IGFic29sdXRlIGxlZnQtMCBib3R0b20tMCB3LWZ1bGwgYmctYmxhY2sgYmctb3BhY2l0eS03NSBoLTE2IHotNTAgdHJhbnNpdGlvbiB0cmFuc2Zvcm0gZWFzZS1pbi1vdXQgZHVyYXRpb24tNTAwIGhvdmVyOnRyYW5zbGF0ZS15LTBgfVxuICAgICAgPlxuICAgICAgICA8TGluZWFyUHJvZ3Jlc3NcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgYWJzb2x1dGUgaC0yIGxlZnQtMCB0b3AtMCAtbXQtMlwiXG4gICAgICAgICAgdmFyaWFudD1cImluZGV0ZXJtaW5hdGVcIlxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgb3ZlcmZsb3ctYXV0byBoLWZ1bGwgdy1mdWxsIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LXdoaXRlXCI+XG4gICAgICAgICAge0FzeW5jVGFza3MubGlzdC5tYXAoKGFzeW5jVGFzaykgPT4ge1xuICAgICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNSZXN0b3JlVGFzayhhc3luY1Rhc2spKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ibGFjayBwLTJcIj5cbiAgICAgICAgICAgICAgICAgIFJlc3RvcmluZyAnXG4gICAgICAgICAgICAgICAgICB7YXN5bmNUYXNrLmxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX0nXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzRGVsZXRlVGFzayhhc3luY1Rhc2spKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ibGFjayBwLTJcIj5cbiAgICAgICAgICAgICAgICAgIERlbGV0aW5nICdcbiAgICAgICAgICAgICAgICAgIHthc3luY1Rhc2subGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlfSdcbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNDcmVhdGVTZWFyY2hUYXNrKGFzeW5jVGFzaykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWJsYWNrIHAtMlwiPlxuICAgICAgICAgICAgICAgICAgQ3JlYXRpbmcgJ3thc3luY1Rhc2suZGF0YS50aXRsZX0nXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzU2F2ZVNlYXJjaFRhc2soYXN5bmNUYXNrKSkge1xuICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYmxhY2sgcC0yXCI+XG4gICAgICAgICAgICAgICAgICBTYXZpbmcgJ3thc3luY1Rhc2suZGF0YS50aXRsZX0nXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzQ3JlYXRlVGFzayhhc3luY1Rhc2spKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ibGFjayBwLTJcIj5cbiAgICAgICAgICAgICAgICAgIENyZWF0aW5nICd7YXN5bmNUYXNrLmRhdGEudGl0bGV9J1xuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXN5bmNUYXNrcy5pc1NhdmVUYXNrKGFzeW5jVGFzaykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWJsYWNrIHAtMlwiPlxuICAgICAgICAgICAgICAgICAgU2F2aW5nICd7YXN5bmNUYXNrLmRhdGEudGl0bGV9J1xuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuLyoqIFRoZSBzb25nIGFuZCBkYW5jZSBhcm91bmQgJ2EnIHZzIExpbmsgaGFzIHRvIGRvIHdpdGggcmVhY3Qgcm91dGVyIG5vdCBzdXBwb3J0aW5nIHRoZXNlIG91dHNpZGUgbGlua3MgKi9cbmNvbnN0IEhlbHBCdXR0b24gPSAoKSA9PiB7XG4gIGNvbnN0IHsgZ2V0SGVscFVybCB9ID0gdXNlQ29uZmlndXJhdGlvbigpXG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCBxdWVyeVBhcmFtcyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaClcbiAgY29uc3QgeyBuYXZPcGVuIH0gPSB1c2VOYXZDb250ZXh0UHJvdmlkZXIoKVxuICByZXR1cm4gKFxuICAgIDxFeHBhbmRpbmdCdXR0b25cbiAgICAgIGNvbXBvbmVudD17Z2V0SGVscFVybCgpID8gJ2EnIDogKExpbmsgYXMgdW5rbm93biBhcyBhbnkpfVxuICAgICAgaHJlZj17Z2V0SGVscFVybCgpfVxuICAgICAgdG89e1xuICAgICAgICBnZXRIZWxwVXJsKClcbiAgICAgICAgICA/IGdldEhlbHBVcmwoKVxuICAgICAgICAgIDoge1xuICAgICAgICAgICAgICBwYXRobmFtZTogYCR7bG9jYXRpb24ucGF0aG5hbWV9YCxcbiAgICAgICAgICAgICAgc2VhcmNoOiBgJHtxdWVyeVN0cmluZy5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIC4uLnF1ZXJ5UGFyYW1zLFxuICAgICAgICAgICAgICAgICdnbG9iYWwtaGVscCc6ICdIZWxwJyxcbiAgICAgICAgICAgICAgfSl9YCxcbiAgICAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRhcmdldD17Z2V0SGVscFVybCgpID8gJ19ibGFuaycgOiB1bmRlZmluZWR9XG4gICAgICBjbGFzc05hbWU9e2Bncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCBvcGFjaXR5LTI1ICBob3ZlcjpvcGFjaXR5LTEwMCBmb2N1cy12aXNpYmxlOm9wYWNpdHktMTAwIHRyYW5zaXRpb24tb3BhY2l0eWB9XG4gICAgICBJY29uPXtIZWxwSWNvbn1cbiAgICAgIGV4cGFuZGVkTGFiZWw9XCJIZWxwXCJcbiAgICAgIHVuZXhwYW5kZWRMYWJlbD1cIlwiXG4gICAgICBkYXRhSWQ9e3NpZGViYXJEYXRhSWRUYWcoJ2hlbHAnKX1cbiAgICAgIGV4cGFuZGVkPXtuYXZPcGVufVxuICAgICAgZm9jdXNWaXNpYmxlQ2xhc3NOYW1lPVwiZm9jdXMtdmlzaWJsZVwiXG4gICAgLz5cbiAgKVxufVxuY29uc3QgU2V0dGluZ3NCdXR0b24gPSAoKSA9PiB7XG4gIGNvbnN0IHsgU2V0dGluZ3NDb21wb25lbnRzIH0gPSB1c2VUb3BMZXZlbEFwcENvbnRleHQoKVxuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKClcbiAgY29uc3QgaGlzdG9yeSA9IHVzZUhpc3RvcnkoKVxuICBjb25zdCBxdWVyeVBhcmFtcyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaClcbiAgY29uc3Qgb3BlbiA9IEJvb2xlYW4ocXVlcnlQYXJhbXNbJ2dsb2JhbC1zZXR0aW5ncyddKVxuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxFeHBhbmRpbmdCdXR0b25cbiAgICAgICAgY29tcG9uZW50PXtMaW5rIGFzIGFueX1cbiAgICAgICAgdG89e3tcbiAgICAgICAgICBwYXRobmFtZTogYCR7bG9jYXRpb24ucGF0aG5hbWV9YCxcbiAgICAgICAgICBzZWFyY2g6IGAke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAuLi5xdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICdnbG9iYWwtc2V0dGluZ3MnOiAnU2V0dGluZ3MnLFxuICAgICAgICAgIH0pfWAsXG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT17YGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIG9wYWNpdHktMjUgcmVsYXRpdmUgaG92ZXI6b3BhY2l0eS0xMDAgZm9jdXMtdmlzaWJsZTpvcGFjaXR5LTEwMCB0cmFuc2l0aW9uLW9wYWNpdHlgfVxuICAgICAgICBJY29uPXtTZXR0aW5nc0ljb259XG4gICAgICAgIGV4cGFuZGVkTGFiZWw9XCJTZXR0aW5nc1wiXG4gICAgICAgIHVuZXhwYW5kZWRMYWJlbD1cIlwiXG4gICAgICAgIGRhdGFJZD17c2lkZWJhckRhdGFJZFRhZygnc2V0dGluZ3MnKX1cbiAgICAgICAgZXhwYW5kZWQ9e25hdk9wZW59XG4gICAgICAgIGZvY3VzVmlzaWJsZUNsYXNzTmFtZT1cImZvY3VzLXZpc2libGVcIlxuICAgICAgLz5cbiAgICAgIDxEcmF3ZXJcbiAgICAgICAgYW5jaG9yPVwibGVmdFwiXG4gICAgICAgIG9wZW49e29wZW59XG4gICAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgICBkZWxldGUgcXVlcnlQYXJhbXNbJ2dsb2JhbC1zZXR0aW5ncyddXG4gICAgICAgICAgaGlzdG9yeS5wdXNoKFxuICAgICAgICAgICAgYCR7bG9jYXRpb24ucGF0aG5hbWV9PyR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHF1ZXJ5UGFyYW1zKX1gXG4gICAgICAgICAgKVxuICAgICAgICB9fVxuICAgICAgICBQYXBlclByb3BzPXt7XG4gICAgICAgICAgY2xhc3NOYW1lOiAnbWluLXctMTIwIG1heC13LTQvNSAnLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8VXNlclNldHRpbmdzIFNldHRpbmdzQ29tcG9uZW50cz17U2V0dGluZ3NDb21wb25lbnRzfSAvPlxuICAgICAgPC9EcmF3ZXI+XG4gICAgPC8+XG4gIClcbn1cbmNvbnN0IE5vdGlmaWNhdGlvbnNCdXR0b24gPSAoKSA9PiB7XG4gIGNvbnN0IGhhc1Vuc2Vlbk5vdGlmaWNhdGlvbnMgPSB1c2VJbmRpY2F0ZUhhc1Vuc2Vlbk5vdGlmaWNhdGlvbnMoKVxuICBjb25zdCB7IE5vdGlmaWNhdGlvbnNDb21wb25lbnQgfSA9IHVzZVRvcExldmVsQXBwQ29udGV4dCgpXG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCBoaXN0b3J5ID0gdXNlSGlzdG9yeSgpXG4gIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKVxuICBjb25zdCBvcGVuID0gQm9vbGVhbihxdWVyeVBhcmFtc1snZ2xvYmFsLW5vdGlmaWNhdGlvbnMnXSlcbiAgY29uc3QgeyBuYXZPcGVuIH0gPSB1c2VOYXZDb250ZXh0UHJvdmlkZXIoKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17XG4gICAgICAgICAgaGFzVW5zZWVuTm90aWZpY2F0aW9ucyA/ICdhbmltYXRlLXdpZ2dsZSBNdWktdGV4dC13YXJuaW5nJyA6ICcnXG4gICAgICAgIH1cbiAgICAgID5cbiAgICAgICAgPEV4cGFuZGluZ0J1dHRvblxuICAgICAgICAgIGNvbXBvbmVudD17TGluayBhcyBhbnl9XG4gICAgICAgICAgdG89e3tcbiAgICAgICAgICAgIHBhdGhuYW1lOiBgJHtsb2NhdGlvbi5wYXRobmFtZX1gLFxuICAgICAgICAgICAgc2VhcmNoOiBgJHtxdWVyeVN0cmluZy5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAuLi5xdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICAgJ2dsb2JhbC1ub3RpZmljYXRpb25zJzogJ05vdGlmaWNhdGlvbnMnLFxuICAgICAgICAgICAgfSl9YCxcbiAgICAgICAgICB9fVxuICAgICAgICAgIGNsYXNzTmFtZT17YCR7XG4gICAgICAgICAgICAhaGFzVW5zZWVuTm90aWZpY2F0aW9ucyA/ICdvcGFjaXR5LTI1JyA6ICcnXG4gICAgICAgICAgfSBncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCAgcmVsYXRpdmUgaG92ZXI6b3BhY2l0eS0xMDAgZm9jdXMtdmlzaWJsZTpvcGFjaXR5LTEwMCB0cmFuc2l0aW9uLW9wYWNpdHlgfVxuICAgICAgICAgIEljb249e05vdGlmaWNhdGlvbnNJY29ufVxuICAgICAgICAgIGV4cGFuZGVkTGFiZWw9XCJOb3RpZmljYXRpb25zXCJcbiAgICAgICAgICB1bmV4cGFuZGVkTGFiZWw9XCJcIlxuICAgICAgICAgIGRhdGFJZD17c2lkZWJhckRhdGFJZFRhZygnbm90aWZpY2F0aW9ucycpfVxuICAgICAgICAgIGV4cGFuZGVkPXtuYXZPcGVufVxuICAgICAgICAgIGZvY3VzVmlzaWJsZUNsYXNzTmFtZT1cImZvY3VzLXZpc2libGVcIlxuICAgICAgICAgIG9yaWVudGF0aW9uPVwidmVydGljYWxcIlxuICAgICAgICAvPlxuICAgICAgPC9kaXY+XG4gICAgICA8RHJhd2VyXG4gICAgICAgIGFuY2hvcj1cImxlZnRcIlxuICAgICAgICBvcGVuPXtvcGVufVxuICAgICAgICBvbkNsb3NlPXsoKSA9PiB7XG4gICAgICAgICAgZGVsZXRlIHF1ZXJ5UGFyYW1zWydnbG9iYWwtbm90aWZpY2F0aW9ucyddXG4gICAgICAgICAgaGlzdG9yeS5wdXNoKFxuICAgICAgICAgICAgYCR7bG9jYXRpb24ucGF0aG5hbWV9PyR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHF1ZXJ5UGFyYW1zKX1gXG4gICAgICAgICAgKVxuICAgICAgICAgIG5vdGlmaWNhdGlvbnMuc2V0U2VlbigpXG4gICAgICAgICAgdXNlckluc3RhbmNlLnNhdmVQcmVmZXJlbmNlcygpXG4gICAgICAgIH19XG4gICAgICAgIFBhcGVyUHJvcHM9e3tcbiAgICAgICAgICBjbGFzc05hbWU6ICdtaW4tdy0xMjAgbWF4LXctNC81ICcsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxOb3RpZmljYXRpb25zQ29tcG9uZW50IC8+XG4gICAgICA8L0RyYXdlcj5cbiAgICA8Lz5cbiAgKVxufVxuY29uc3QgVXNlckJ1dHRvbiA9ICgpID0+IHtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIGNvbnN0IGhpc3RvcnkgPSB1c2VIaXN0b3J5KClcbiAgY29uc3QgcXVlcnlQYXJhbXMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpXG4gIGNvbnN0IG9wZW4gPSBCb29sZWFuKHF1ZXJ5UGFyYW1zWydnbG9iYWwtdXNlciddKVxuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG5cbiAgY29uc3QgZ2V0TGFiZWwgPSAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIHRydW5jYXRlXCI+e3VzZXJJbnN0YW5jZS5nZXRVc2VyTmFtZSgpfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQteHMgdHJ1bmNhdGUgdy1mdWxsXCI+XG4gICAgICAgICAgPFJvbGVEaXNwbGF5IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEV4cGFuZGluZ0J1dHRvblxuICAgICAgICBjb21wb25lbnQ9e0xpbmsgYXMgYW55fVxuICAgICAgICB0bz17e1xuICAgICAgICAgIHBhdGhuYW1lOiBgJHtsb2NhdGlvbi5wYXRobmFtZX1gLFxuICAgICAgICAgIHNlYXJjaDogYCR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIC4uLnF1ZXJ5UGFyYW1zLFxuICAgICAgICAgICAgJ2dsb2JhbC11c2VyJzogJ1VzZXInLFxuICAgICAgICAgIH0pfWAsXG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT17YGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIG9wYWNpdHktMjUgcmVsYXRpdmUgaG92ZXI6b3BhY2l0eS0xMDAgZm9jdXMtdmlzaWJsZTpvcGFjaXR5LTEwMCB0cmFuc2l0aW9uLW9wYWNpdHlgfVxuICAgICAgICBJY29uPXtQZXJzb25JY29ufVxuICAgICAgICBleHBhbmRlZExhYmVsPXtnZXRMYWJlbCgpfVxuICAgICAgICB1bmV4cGFuZGVkTGFiZWw9e2dldExhYmVsKCl9XG4gICAgICAgIGRhdGFJZD17c2lkZWJhckRhdGFJZFRhZygndXNlci1wcm9maWxlJyl9XG4gICAgICAgIGV4cGFuZGVkPXtuYXZPcGVufVxuICAgICAgICBmb2N1c1Zpc2libGVDbGFzc05hbWU9XCJmb2N1cy12aXNpYmxlXCJcbiAgICAgIC8+XG4gICAgICA8RHJhd2VyXG4gICAgICAgIGFuY2hvcj1cImxlZnRcIlxuICAgICAgICBvcGVuPXtvcGVufVxuICAgICAgICBvbkNsb3NlPXsoKSA9PiB7XG4gICAgICAgICAgZGVsZXRlIHF1ZXJ5UGFyYW1zWydnbG9iYWwtdXNlciddXG4gICAgICAgICAgaGlzdG9yeS5wdXNoKFxuICAgICAgICAgICAgYCR7bG9jYXRpb24ucGF0aG5hbWV9PyR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHF1ZXJ5UGFyYW1zKX1gXG4gICAgICAgICAgKVxuICAgICAgICB9fVxuICAgICAgICBQYXBlclByb3BzPXt7XG4gICAgICAgICAgY2xhc3NOYW1lOiAnbWluLXctMTIwIG1heC13LTQvNSAnLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8VXNlclZpZXcgLz5cbiAgICAgIDwvRHJhd2VyPlxuICAgIDwvPlxuICApXG59XG5jb25zdCBSb3V0ZUJ1dHRvbiA9ICh7IHJvdXRlSW5mbyB9OiB7IHJvdXRlSW5mbzogUm91dGVTaG93bkluTmF2VHlwZSB9KSA9PiB7XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG4gIGNvbnN0IGlzU2VsZWN0ZWQgPSBtYXRjaGVzUm91dGUoe1xuICAgIHJvdXRlSW5mbyxcbiAgICBwYXRobmFtZTogbG9jYXRpb24ucGF0aG5hbWUsXG4gIH0pXG4gIHJldHVybiAoXG4gICAgPEV4cGFuZGluZ0J1dHRvblxuICAgICAga2V5PXtyb3V0ZUluZm8ubGlua1Byb3BzLnRvLnRvU3RyaW5nKCl9XG4gICAgICBjb21wb25lbnQ9e0xpbmsgYXMgYW55fVxuICAgICAgdG89e3JvdXRlSW5mby5saW5rUHJvcHMudG99XG4gICAgICBjbGFzc05hbWU9e2Bncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCAke1xuICAgICAgICAhaXNTZWxlY3RlZCA/ICdvcGFjaXR5LTI1JyA6ICcnXG4gICAgICB9IGZvY3VzLXZpc2libGU6b3BhY2l0eS0xMDAgaG92ZXI6b3BhY2l0eS0xMDAgdHJhbnNpdGlvbi1vcGFjaXR5YH1cbiAgICAgIGV4cGFuZGVkPXtuYXZPcGVufVxuICAgICAgey4uLnJvdXRlSW5mby5uYXZCdXR0b25Qcm9wc31cbiAgICAgIGZvY3VzVmlzaWJsZUNsYXNzTmFtZT1cImZvY3VzLXZpc2libGVcIlxuICAgICAgZGF0YUlkPXtzaWRlYmFyRGF0YUlkVGFnKHJvdXRlSW5mby5uYXZCdXR0b25Qcm9wcy5kYXRhSWQpfVxuICAgICAgey4uLihpc1NlbGVjdGVkXG4gICAgICAgID8ge1xuICAgICAgICAgICAgWydkYXRhLWN1cnJlbnRyb3V0ZSddOiB0cnVlLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB7fSl9XG4gICAgLz5cbiAgKVxufVxuY29uc3QgU2lkZUJhclJvdXRlcyA9ICgpID0+IHtcbiAgY29uc3QgeyBSb3V0ZUluZm9ybWF0aW9uIH0gPSB1c2VUb3BMZXZlbEFwcENvbnRleHQoKVxuICByZXR1cm4gKFxuICAgIDxHcmlkXG4gICAgICBpdGVtXG4gICAgICBjbGFzc05hbWU9XCJvdmVyZmxvdy1hdXRvIHAtMCBzaHJpbmstMCBzY3JvbGxiYXJzLW1pblwiXG4gICAgICBzdHlsZT17e1xuICAgICAgICBtYXhIZWlnaHQ6IGBjYWxjKDEwMCUgLSAkezcgKiA0fXJlbSlgLCAvL1xuICAgICAgfX1cbiAgICA+XG4gICAgICB7Um91dGVJbmZvcm1hdGlvbi5maWx0ZXIoKHJvdXRlSW5mbykgPT4gcm91dGVJbmZvLnNob3dJbk5hdikubWFwKFxuICAgICAgICAocm91dGVJbmZvOiBSb3V0ZVNob3duSW5OYXZUeXBlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSb3V0ZUJ1dHRvblxuICAgICAgICAgICAgICByb3V0ZUluZm89e3JvdXRlSW5mb31cbiAgICAgICAgICAgICAga2V5PXtyb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoPy50b1N0cmluZygpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICl9XG4gICAgICB7PEV4dGVuc2lvbnMuZXh0cmFSb3V0ZXMgLz59XG4gICAgPC9HcmlkPlxuICApXG59XG5jb25zdCBTaWRlQmFyTmF2aWdhdGlvbkJ1dHRvbnMgPSAoKSA9PiB7XG4gIGNvbnN0IHsgbmF2T3BlbiB9ID0gdXNlTmF2Q29udGV4dFByb3ZpZGVyKClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcC0yIHNocmluay0wXCI+XG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICA+XG4gICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJtci1hdXRvXCI+XG4gICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IGhpc3RvcnkuYmFjaygpfT5cbiAgICAgICAgICAgICAgPEFycm93QmFja0ljb24gZm9udFNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICAgIHtuYXZPcGVuICYmICdCYWNrJ31cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cIm1sLWF1dG9cIj5cbiAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gaGlzdG9yeS5mb3J3YXJkKCl9PlxuICAgICAgICAgICAgICB7bmF2T3BlbiAmJiAnRm9yd2FyZCd9XG4gICAgICAgICAgICAgIDxBcnJvd0ZvcndhcmRJY29uIGZvbnRTaXplPVwic21hbGxcIiAvPlxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0dyaWQ+XG4gICAgPC8+XG4gIClcbn1cblxuY29uc3QgU2lkZUJhclRvZ2dsZUJ1dHRvbiA9ICgpID0+IHtcbiAgY29uc3QgeyBuYXZPcGVuLCBzZXROYXZPcGVuIH0gPSB1c2VOYXZDb250ZXh0UHJvdmlkZXIoKVxuICBjb25zdCB7IGdldFRvcExlZnRMb2dvU3JjLCBnZXRDdXN0b21CcmFuZGluZywgZ2V0UHJvZHVjdCwgZ2V0TWVudUljb25TcmMgfSA9XG4gICAgdXNlQ29uZmlndXJhdGlvbigpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIGgtMTYgc2hyaW5rLTBcIj5cbiAgICAgICAge25hdk9wZW4gPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxHcmlkXG4gICAgICAgICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJwbC0zIHB5LTEgcHItMSB3LWZ1bGwgcmVsYXRpdmUgaC1mdWxsXCI+XG4gICAgICAgICAgICAgICAge2dldFRvcExlZnRMb2dvU3JjKCkgPyAoXG4gICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1heC1oLWZ1bGwgbWF4LXctZnVsbCBhYnNvbHV0ZSBsZWZ0LTEvMiB0cmFuc2Zvcm0gLXRyYW5zbGF0ZS14LTEvMiAtdHJhbnNsYXRlLXktMS8yIHRvcC0xLzIgcC00XCJcbiAgICAgICAgICAgICAgICAgICAgc3JjPXtoYW5kbGVCYXNlNjRFbmNvZGVkSW1hZ2VzKGdldFRvcExlZnRMb2dvU3JjKCkpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPEdyaWRcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInBsLTNcIlxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+e2dldEN1c3RvbUJyYW5kaW5nKCl9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+e2dldFByb2R1Y3QoKX08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwibWwtYXV0b1wiPlxuICAgICAgICAgICAgICAgIDxJY29uQnV0dG9uXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJoLWF1dG9cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXROYXZPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgIHNpemU9XCJsYXJnZVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPENoZXZyb25MZWZ0SWNvbiAvPlxuICAgICAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj5cbiAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNvbG9yPVwiaW5oZXJpdFwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPVwib3BlbiBkcmF3ZXJcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXROYXZPcGVuKHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBwLTJcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtnZXRNZW51SWNvblNyYygpID8gKFxuICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgIHNyYz17aGFuZGxlQmFzZTY0RW5jb2RlZEltYWdlcyhnZXRNZW51SWNvblNyYygpKX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1heC1oLTE2IG1heC13LWZ1bGxcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPE1lbnVJY29uIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICApfVxuICAgICAgPC9HcmlkPlxuICAgIDwvPlxuICApXG59XG5jb25zdCBTaWRlQmFyID0gKCkgPT4ge1xuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG4gIHJldHVybiAoXG4gICAgPEdyaWRcbiAgICAgIGl0ZW1cbiAgICAgIGNsYXNzTmFtZT17YCR7XG4gICAgICAgIG5hdk9wZW4gPyAndy02NCcgOiAndy0yMCdcbiAgICAgIH0gdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwIGVhc2UtaW4tb3V0IHJlbGF0aXZlIHotMTAgbXItMiBzaHJpbmstMCBwYi0yIHB0LTIgcGwtMiBncm91cGB9XG4gICAgICBvbk1vdXNlTGVhdmU9eygpID0+IHtcbiAgICAgICAgc2Nyb2xsQ3VycmVudFJvdXRlSW50b1ZpZXcoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLm5hdmJhcn0gY2xhc3NOYW1lPVwiaC1mdWxsXCI+XG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgZGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJoLWZ1bGwgdy1mdWxsXCJcbiAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgPlxuICAgICAgICAgIHtFeHRlbnNpb25zLmluY2x1ZGVOYXZpZ2F0aW9uQnV0dG9ucyAmJiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8U2lkZUJhck5hdmlnYXRpb25CdXR0b25zIC8+XG4gICAgICAgICAgICAgIDxEaXZpZGVyIC8+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxTaWRlQmFyVG9nZ2xlQnV0dG9uIC8+XG4gICAgICAgICAgPERpdmlkZXIgLz5cbiAgICAgICAgICA8U2lkZUJhclJvdXRlcyAvPlxuICAgICAgICAgIDxEaXZpZGVyIC8+XG4gICAgICAgICAgPFNpZGVCYXJCYWNrZ3JvdW5kIC8+XG4gICAgICAgICAgPERpdmlkZXIgLz5cbiAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cIm10LWF1dG8gb3ZlcmZsb3ctaGlkZGVuIHctZnVsbCBzaHJpbmstMCBncm93LTBcIj5cbiAgICAgICAgICAgIHtFeHRlbnNpb25zLmV4dHJhU2lkZWJhckJ1dHRvbnMgJiYgKFxuICAgICAgICAgICAgICA8RXh0ZW5zaW9ucy5leHRyYVNpZGViYXJCdXR0b25zIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPEhlbHBCdXR0b24gLz5cbiAgICAgICAgICAgIDxTZXR0aW5nc0J1dHRvbiAvPlxuICAgICAgICAgICAgPE5vdGlmaWNhdGlvbnNCdXR0b24gLz5cbiAgICAgICAgICAgIDxVc2VyQnV0dG9uIC8+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L1BhcGVyPlxuICAgIDwvR3JpZD5cbiAgKVxufVxuY29uc3QgSGVhZGVyID0gKCkgPT4ge1xuICBjb25zdCB7IGdldFBsYXRmb3JtQmFja2dyb3VuZCwgZ2V0UGxhdGZvcm1Db2xvciwgZ2V0UGxhdGZvcm1IZWFkZXIgfSA9XG4gICAgdXNlQ29uZmlndXJhdGlvbigpXG4gIHJldHVybiAoXG4gICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGxcIj5cbiAgICAgIHtnZXRQbGF0Zm9ybUhlYWRlcigpID8gKFxuICAgICAgICA8VHlwb2dyYXBoeVxuICAgICAgICAgIGFsaWduPVwiY2VudGVyXCJcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgYmFja2dyb3VuZDogZ2V0UGxhdGZvcm1CYWNrZ3JvdW5kKCksXG4gICAgICAgICAgICBjb2xvcjogZ2V0UGxhdGZvcm1Db2xvcigpLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7Z2V0UGxhdGZvcm1IZWFkZXIoKX1cbiAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9HcmlkPlxuICApXG59XG5jb25zdCBGb290ZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZ2V0UGxhdGZvcm1CYWNrZ3JvdW5kLCBnZXRQbGF0Zm9ybUNvbG9yLCBnZXRQbGF0Zm9ybUZvb3RlciB9ID1cbiAgICB1c2VDb25maWd1cmF0aW9uKClcbiAgcmV0dXJuIChcbiAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbFwiPlxuICAgICAge2dldFBsYXRmb3JtRm9vdGVyKCkgPyAoXG4gICAgICAgIDxUeXBvZ3JhcGh5XG4gICAgICAgICAgYWxpZ249XCJjZW50ZXJcIlxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBnZXRQbGF0Zm9ybUJhY2tncm91bmQoKSxcbiAgICAgICAgICAgIGNvbG9yOiBnZXRQbGF0Zm9ybUNvbG9yKCksXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtnZXRQbGF0Zm9ybUZvb3RlcigpfVxuICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICApIDogbnVsbH1cbiAgICA8L0dyaWQ+XG4gIClcbn1cbmNvbnN0IFNpZGVCYXJCYWNrZ3JvdW5kID0gKCkgPT4ge1xuICBjb25zdCB7IGdldEJvdHRvbUxlZnRCYWNrZ3JvdW5kU3JjIH0gPSB1c2VDb25maWd1cmF0aW9uKClcbiAgcmV0dXJuIChcbiAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInJlbGF0aXZlIG92ZXJmbG93LWhpZGRlbiBzaHJpbmstMSBoLWZ1bGwgbWluLXctZnVsbFwiPlxuICAgICAge2dldEJvdHRvbUxlZnRCYWNrZ3JvdW5kU3JjKCkgPyAoXG4gICAgICAgIDxpbWdcbiAgICAgICAgICBjbGFzc05hbWU9e2Bncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCBvcGFjaXR5LTUwIGR1cmF0aW9uLTIwMCBlYXNlLWluLW91dCB0cmFuc2l0aW9uLWFsbCB3LWF1dG8gaC1mdWxsIGFic29sdXRlIG1heC13LW5vbmUgbS1hdXRvIG1pbi1oLTgwYH1cbiAgICAgICAgICBzcmM9e2hhbmRsZUJhc2U2NEVuY29kZWRJbWFnZXMoZ2V0Qm90dG9tTGVmdEJhY2tncm91bmRTcmMoKSl9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8L0dyaWQ+XG4gIClcbn1cbmNvbnN0IFJvdXRlQ29udGVudHMgPSAoKSA9PiB7XG4gIGNvbnN0IHsgUm91dGVJbmZvcm1hdGlvbiB9ID0gdXNlVG9wTGV2ZWxBcHBDb250ZXh0KClcbiAgLyoqXG4gICAqIFNvIHRoaXMgaXMgc2xpZ2h0bHkgYW5ub3lpbmcsIGJ1dCB0aGUgZ3JpZCB3b24ndCBwcm9wZXJseSByZXNpemUgd2l0aG91dCBvdmVyZmxvdyBoaWRkZW4gc2V0LlxuICAgKlxuICAgKiBUaGF0IG1ha2VzIGhhbmRsaW5nIHBhZGRpbmcgLyBtYXJnaW5zIC8gc3BhY2luZyBtb3JlIGNvbXBsaWNhdGVkIGluIG91ciBhcHAsIGJlY2F1c2Ugd2l0aCBvdmVyZmxvdyBoaWRkZW4gc2V0XG4gICAqIGRyb3BzaGFkb3dzIG9uIGVsZW1lbnRzIHdpbGwgZ2V0IGN1dCBvZmYuICBTbyB3ZSBoYXZlIHRvIGxldCB0aGUgY29udGVudHMgaW5zdGVhZCBkaWN0YXRlIHRoZWlyIHBhZGRpbmcsIHRoYXQgd2F5XG4gICAqIHRoZWlyIGRyb3BzaGFkb3dzIGNhbiBiZSBzZWVuLlxuICAgKlxuICAgKiBGb2xrcyB3aWxsIHByb2JhYmx5IHN0cnVnZ2xlIGEgYml0IHdpdGggaXQgYXQgZmlyc3QsIGJ1dCB0aGUgY3NzIHV0aWxpdGllcyBhY3R1YWxseSBtYWtlIGl0IHByZXR0eSBlYXN5LlxuICAgKiBKdXN0IGFkZCBwYi0yIGZvciB0aGUgY29ycmVjdCBib3R0b20gc3BhY2luZywgcHQtMiBmb3IgY29ycmVjdCB0b3Agc3BhY2luZywgZXRjLiBldGMuXG4gICAqL1xuICByZXR1cm4gKFxuICAgIDxHcmlkXG4gICAgICBpdGVtXG4gICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHJlbGF0aXZlIHotMCBzaHJpbmstMSBvdmVyZmxvdy14LWhpZGRlblwiIC8vIGRvIG5vdCByZW1vdmUgdGhpcyBvdmVyZmxvdyBoaWRkZW4sIHNlZSBjb21tZW50IGFib3ZlIGZvciBtb3JlXG4gICAgPlxuICAgICAgPE1lbW8+XG4gICAgICAgIDxTd2l0Y2g+XG4gICAgICAgICAge1JvdXRlSW5mb3JtYXRpb24ubWFwKChyb3V0ZUluZm86IFJvdXRlTm90U2hvd25Jbk5hdlR5cGUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxSb3V0ZVxuICAgICAgICAgICAgICAgIGtleT17XG4gICAgICAgICAgICAgICAgICByb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoXG4gICAgICAgICAgICAgICAgICAgID8gcm91dGVJbmZvLnJvdXRlUHJvcHMucGF0aC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIDogTWF0aC5yYW5kb20oKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB7Li4ucm91dGVJbmZvLnJvdXRlUHJvcHN9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvU3dpdGNoPlxuICAgICAgPC9NZW1vPlxuICAgIDwvR3JpZD5cbiAgKVxufVxuY29uc3QgTmF2Q29udGV4dFByb3ZpZGVyID0gUmVhY3QuY3JlYXRlQ29udGV4dCh7XG4gIHNldE5hdk9wZW46IChfbmF2T3BlbjogYm9vbGVhbikgPT4ge30sXG4gIG5hdk9wZW46IGZhbHNlLFxufSlcbmV4cG9ydCBjb25zdCB1c2VOYXZDb250ZXh0UHJvdmlkZXIgPSAoKSA9PiB7XG4gIGNvbnN0IG5hdkNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KE5hdkNvbnRleHRQcm92aWRlcilcbiAgcmV0dXJuIG5hdkNvbnRleHRcbn1cbi8qKlxuICogS2VlcCB0aGUgY3VycmVudCByb3V0ZSB2aXNpYmxlIHRvIHRoZSB1c2VyIHNpbmNlIGl0J3MgdXNlZnVsIGluZm8uXG4gKiBUaGlzIGFsc28gZW5zdXJlcyBpdCdzIHZpc2libGUgdXBvbiBmaXJzdCBsb2FkIG9mIHRoZSBwYWdlLlxuICovXG5jb25zdCB1c2VTY3JvbGxDdXJyZW50Um91dGVJbnRvVmlld09uTG9jYXRpb25DaGFuZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNjcm9sbEN1cnJlbnRSb3V0ZUludG9WaWV3KClcbiAgfSwgW2xvY2F0aW9uXSlcbn1cbmNvbnN0IHVzZUluZGljYXRlSGFzVW5zZWVuTm90aWZpY2F0aW9ucyA9ICgpID0+IHtcbiAgY29uc3QgeyBsaXN0ZW5UbyB9ID0gdXNlQmFja2JvbmUoKVxuICBjb25zdCBbaGFzVW5zZWVuTm90aWZpY2F0aW9ucywgc2V0SGFzVW5zZWVuTm90aWZpY2F0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBub3RpZmljYXRpb25zLmhhc1Vuc2VlbigpIGFzIGJvb2xlYW5cbiAgKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxpc3RlblRvKG5vdGlmaWNhdGlvbnMsICdjaGFuZ2UgYWRkIHJlbW92ZSByZXNldCB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICBzZXRIYXNVbnNlZW5Ob3RpZmljYXRpb25zKG5vdGlmaWNhdGlvbnMuaGFzVW5zZWVuKCkgYXMgYm9vbGVhbilcbiAgICB9KVxuICB9LCBbXSlcbiAgcmV0dXJuIGhhc1Vuc2Vlbk5vdGlmaWNhdGlvbnNcbn1cblxuY29uc3QgdXNlRmF2aWNvbkJyYW5kaW5nID0gKCkgPT4ge1xuICAvLyB0b2RvIGZhdmljb24gYnJhbmRpbmdcbiAgLy8gJCh3aW5kb3cuZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgLy8gICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSBwcm9wZXJ0aWVzLmJyYW5kaW5nICsgJyAnICsgcHJvcGVydGllcy5wcm9kdWN0XG4gIC8vICAgY29uc3QgZmF2aWNvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmYXZpY29uJykgYXMgSFRNTEFuY2hvckVsZW1lbnRcbiAgLy8gICBmYXZpY29uLmhyZWYgPSBicmFuZGluZ0luZm9ybWF0aW9uLnRvcExlZnRMb2dvU3JjXG4gIC8vICAgZmF2aWNvbi5yZW1vdmUoKVxuICAvLyAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZmF2aWNvbilcbiAgLy8gfSlcbn1cbmNvbnN0IHVzZU5hdk9wZW4gPSAoKSA9PiB7XG4gIGxldCBkZWZhdWx0T3BlbiA9XG4gICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NoZWxsLmRyYXdlcicpID09PSAndHJ1ZScgPyB0cnVlIDogZmFsc2VcbiAgY29uc3QgW25hdk9wZW4sIHNldE5hdk9wZW5dID0gUmVhY3QudXNlU3RhdGUoZGVmYXVsdE9wZW4pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3NoZWxsLmRyYXdlcicsIG5hdk9wZW4udG9TdHJpbmcoKSlcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICQod2luZG93KS5yZXNpemUoKSAvLyBuZWVkZWQgZm9yIGdvbGRlbiBsYXlvdXQgdG8gcmVzaXplXG4gICAgfSwgMjUwKVxuICB9LCBbbmF2T3Blbl0pXG4gIHJldHVybiB7XG4gICAgbmF2T3BlbixcbiAgICBzZXROYXZPcGVuLFxuICB9XG59XG5jb25zdCBUb3BMZXZlbEFwcENvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KHtcbiAgUm91dGVJbmZvcm1hdGlvbjogW10sXG4gIE5vdGlmaWNhdGlvbnNDb21wb25lbnQ6ICgpID0+IG51bGwsXG4gIFNldHRpbmdzQ29tcG9uZW50czoge30sXG59IGFzIEFwcFByb3BzVHlwZSlcbmNvbnN0IHVzZVRvcExldmVsQXBwQ29udGV4dCA9ICgpID0+IHtcbiAgY29uc3QgdG9wTGV2ZWxBcHBDb250ZXh0ID0gUmVhY3QudXNlQ29udGV4dChUb3BMZXZlbEFwcENvbnRleHQpXG4gIHJldHVybiB0b3BMZXZlbEFwcENvbnRleHRcbn1cbmNvbnN0IFNlc3Npb25UaW1lb3V0Q29tcG9uZW50ID0gKCkgPT4ge1xuICBjb25zdCBzZXNzaW9uVGltZW91dERpYWxvZ1N0YXRlID0gdXNlRGlhbG9nU3RhdGUoKVxuICB1c2VMaXN0ZW5UbyhzZXNzaW9uVGltZW91dE1vZGVsLCAnY2hhbmdlOnNob3dQcm9tcHQnLCAoKSA9PiB7XG4gICAgaWYgKHNlc3Npb25UaW1lb3V0TW9kZWwuZ2V0KCdzaG93UHJvbXB0JykpIHtcbiAgICAgIHNlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuaGFuZGxlQ2xpY2soKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXNzaW9uVGltZW91dERpYWxvZ1N0YXRlLmhhbmRsZUNsb3NlKClcbiAgICB9XG4gIH0pXG4gIHJldHVybiAoXG4gICAgPHNlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuTXVpRGlhbG9nQ29tcG9uZW50cy5EaWFsb2dcbiAgICAgIHsuLi5zZXNzaW9uVGltZW91dERpYWxvZ1N0YXRlLk11aURpYWxvZ1Byb3BzfVxuICAgICAgZGlzYWJsZUVzY2FwZUtleURvd25cbiAgICAgIG9uQ2xvc2U9eyhldmVudCwgcmVhc29uKSA9PiB7XG4gICAgICAgIGlmIChyZWFzb24gPT09ICdiYWNrZHJvcENsaWNrJykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHNlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuTXVpRGlhbG9nUHJvcHMub25DbG9zZShldmVudCwgcmVhc29uKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8U2Vzc2lvblRpbWVvdXQgLz5cbiAgICA8L3Nlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuTXVpRGlhbG9nQ29tcG9uZW50cy5EaWFsb2c+XG4gIClcbn1cblxuY29uc3QgQXBwID0gKHtcbiAgUm91dGVJbmZvcm1hdGlvbixcbiAgTm90aWZpY2F0aW9uc0NvbXBvbmVudCxcbiAgU2V0dGluZ3NDb21wb25lbnRzLFxufTogQXBwUHJvcHNUeXBlKSA9PiB7XG4gIGNvbnN0IHsgbmF2T3Blbiwgc2V0TmF2T3BlbiB9ID0gdXNlTmF2T3BlbigpXG4gIHVzZUZhdmljb25CcmFuZGluZygpXG4gIHVzZVNjcm9sbEN1cnJlbnRSb3V0ZUludG9WaWV3T25Mb2NhdGlvbkNoYW5nZSgpXG4gIHJldHVybiAoXG4gICAgPFRvcExldmVsQXBwQ29udGV4dC5Qcm92aWRlclxuICAgICAgdmFsdWU9e3sgUm91dGVJbmZvcm1hdGlvbiwgTm90aWZpY2F0aW9uc0NvbXBvbmVudCwgU2V0dGluZ3NDb21wb25lbnRzIH19XG4gICAgPlxuICAgICAgPE5hdkNvbnRleHRQcm92aWRlci5Qcm92aWRlciB2YWx1ZT17eyBuYXZPcGVuLCBzZXROYXZPcGVuIH19PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtZnVsbCB3LWZ1bGwgb3ZlcmZsb3ctaGlkZGVuIE11aS1iZy1kZWZhdWx0XCI+XG4gICAgICAgICAgey8qIERvbid0IG1vdmUgQ1NTQmFzZWxpbmUgb3IgR2xvYmFsU3R5bGVzIHRvIHByb3ZpZGVycywgc2luY2Ugd2UgaGF2ZSBtdWx0aXBsZSByZWFjdCByb290cy4gICAqL31cbiAgICAgICAgICA8Q3NzQmFzZWxpbmUgLz5cbiAgICAgICAgICA8R2xvYmFsU3R5bGVzIC8+XG4gICAgICAgICAgPFN5c3RlbVVzYWdlTW9kYWwgLz5cbiAgICAgICAgICA8U2Vzc2lvblRpbWVvdXRDb21wb25lbnQgLz5cbiAgICAgICAgICA8QWpheEVycm9ySGFuZGxpbmcgLz5cbiAgICAgICAgICA8V3JlcXJTbmFja3MgLz5cbiAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImgtZnVsbCB3LWZ1bGwgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICAgIGRpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8SGVhZGVyIC8+XG4gICAgICAgICAgICA8RXh0ZW5zaW9ucy5leHRyYUhlYWRlciAvPlxuICAgICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICA8QXN5bmNUYXNrc0NvbXBvbmVudCAvPlxuICAgICAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgICAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtcz1cInN0cmV0Y2hcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFNpZGVCYXIgLz5cbiAgICAgICAgICAgICAgICA8Um91dGVDb250ZW50cyAvPlxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICA8RXh0ZW5zaW9ucy5leHRyYUZvb3RlciAvPlxuICAgICAgICAgICAgPEZvb3RlciAvPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L05hdkNvbnRleHRQcm92aWRlci5Qcm92aWRlcj5cbiAgICA8L1RvcExldmVsQXBwQ29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuZXhwb3J0IGRlZmF1bHQgaG90KEFwcClcbiJdfQ==