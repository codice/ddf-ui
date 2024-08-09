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
function DrawerWrapperComponent(_a) {
    var children = _a.children;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "w-full h-full flex flex-col flex-nowrap overflow-hidden" },
            Extensions.includeNavigationButtons ? (React.createElement("div", { className: "w-full shrink-0 grow-0 overflow-hidden" },
                React.createElement(SideBarNavigationButtons, { showText: true }),
                React.createElement(Divider, null))) : null,
            React.createElement("div", { className: "w-full h-full grow shrink overflow-auto" }, children))));
}
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
            React.createElement(DrawerWrapperComponent, null,
                React.createElement(UserSettings, { SettingsComponents: SettingsComponents })))));
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
            React.createElement(DrawerWrapperComponent, null,
                React.createElement(NotificationsComponent, null)))));
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
            React.createElement(DrawerWrapperComponent, null,
                React.createElement(UserView, null)))));
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
var SideBarNavigationButtons = function (_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.showText, showText = _c === void 0 ? false : _c;
    var navOpen = useNavContextProvider().navOpen;
    var showExpandedText = navOpen || showText;
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { item: true, className: "w-full p-2 shrink-0" },
            React.createElement(Grid, { container: true, wrap: "nowrap", alignItems: "center", className: "w-full h-full overflow-hidden" },
                React.createElement(Grid, { item: true, className: "mr-auto" },
                    React.createElement(Button, { onClick: function () { return history.back(); } },
                        React.createElement(ArrowBackIcon, { fontSize: "small" }),
                        showExpandedText && 'Back')),
                React.createElement(Grid, { item: true, className: "ml-auto" },
                    React.createElement(Button, { onClick: function () { return history.forward(); } },
                        showExpandedText && 'Forward',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9hcHAvYXBwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sRUFDTCxNQUFNLEVBQ04sS0FBSyxFQUNMLFdBQVcsRUFDWCxVQUFVLEdBR1gsTUFBTSxrQkFBa0IsQ0FBQTtBQUN6QixPQUFPLFdBQVcsTUFBTSwyQkFBMkIsQ0FBQTtBQUNuRCxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxlQUFlLE1BQU0sNEJBQTRCLENBQUE7QUFDeEQsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxhQUFhLE1BQU0sK0JBQStCLENBQUE7QUFDekQsT0FBTyxnQkFBZ0IsTUFBTSxrQ0FBa0MsQ0FBQTtBQUMvRCxPQUFPLGVBQWUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUM3RCxPQUFPLFFBQVEsTUFBTSwwQkFBMEIsQ0FBQTtBQUMvQyxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQTtBQUN2RCxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLFdBQVcsTUFBTSxjQUFjLENBQUE7QUFDdEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNuQyxPQUFP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M0Qsb0JBQUMsV0FBVyxPQUFHO2dCQUNmLG9CQUFDLFlBQVksT0FBRztnQkFDaEIsb0JBQUMsZ0JBQWdCLE9BQUc7Z0JBQ3BCLG9CQUFDLHVCQUF1QixPQUFHO2dCQUMzQixvQkFBQyxpQkFBaUIsT0FBRztnQkFDckIsb0JBQUMsV0FBVyxPQUFHO2dCQUNmLG9CQUFDLElBQUksSUFDSCxTQUFTLFFBQ1QsVUFBVSxFQUFDLFFBQVEsRUFDbkIsU0FBUyxFQUFDLCtCQUErQixFQUN6QyxTQUFTLEVBQUMsUUFBUSxFQUNsQixJQUFJLEVBQUMsUUFBUTtvQkFFYixvQkFBQyxNQUFNLE9BQUc7b0JBQ1Ysb0JBQUMsVUFBVSxDQUFDLFdBQVcsT0FBRztvQkFDMUIsb0JBQUMsSUFBSSxJQUFDLElBQUksUUFBQyxTQUFTLEVBQUMsd0NBQXdDO3dCQUMzRCxvQkFBQyxtQkFBbUIsT0FBRzt3QkFDdkIsb0JBQUMsSUFBSSxJQUNILFNBQVMsUUFDVCxTQUFTLEVBQUMsS0FBSyxFQUNmLElBQUksRUFBQyxRQUFRLEVBQ2IsVUFBVSxFQUFDLFNBQVMsRUFDcEIsU0FBUyxFQUFDLGVBQWU7NEJBRXpCLG9CQUFDLE9BQU8sT0FBRzs0QkFDWCxvQkFBQyxhQUFhLE9BQUcsQ0FDWixDQUNGO29CQUNQLG9CQUFDLFVBQVUsQ0FBQyxXQUFXLE9BQUc7b0JBQzFCLG9CQUFDLE1BQU0sT0FBRyxDQUNMLENBQ0gsQ0FDc0IsQ0FDRixDQUMvQixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXIvcm9vdCdcbmltcG9ydCB7XG4gIFN3aXRjaCxcbiAgUm91dGUsXG4gIHVzZUxvY2F0aW9uLFxuICB1c2VIaXN0b3J5LFxuICBSb3V0ZVByb3BzLFxuICBMaW5rUHJvcHMsXG59IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXG5pbXBvcnQgQ3NzQmFzZWxpbmUgZnJvbSAnQG11aS9tYXRlcmlhbC9Dc3NCYXNlbGluZSdcbmltcG9ydCBHcmlkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvR3JpZCdcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBQYXBlciBmcm9tICdAbXVpL21hdGVyaWFsL1BhcGVyJ1xuaW1wb3J0IFR5cG9ncmFwaHkgZnJvbSAnQG11aS9tYXRlcmlhbC9UeXBvZ3JhcGh5J1xuaW1wb3J0IEJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0J1dHRvbidcbmltcG9ydCBFeHBhbmRpbmdCdXR0b24gZnJvbSAnLi4vYnV0dG9uL2V4cGFuZGluZy1idXR0b24nXG5pbXBvcnQgRGl2aWRlciBmcm9tICdAbXVpL21hdGVyaWFsL0RpdmlkZXInXG5pbXBvcnQgSWNvbkJ1dHRvbiBmcm9tICdAbXVpL21hdGVyaWFsL0ljb25CdXR0b24nXG5pbXBvcnQgQXJyb3dCYWNrSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0Fycm93QmFjaydcbmltcG9ydCBBcnJvd0ZvcndhcmRJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQXJyb3dGb3J3YXJkJ1xuaW1wb3J0IENoZXZyb25MZWZ0SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0NoZXZyb25MZWZ0J1xuaW1wb3J0IE1lbnVJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvTWVudSdcbmltcG9ydCBQZXJzb25JY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvUGVyc29uJ1xuaW1wb3J0IFNldHRpbmdzSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL1NldHRpbmdzJ1xuaW1wb3J0IERyYXdlciBmcm9tICdAbXVpL21hdGVyaWFsL0RyYXdlcidcbmltcG9ydCBxdWVyeVN0cmluZyBmcm9tICdxdWVyeS1zdHJpbmcnXG5pbXBvcnQgeyBMaW5rIH0gZnJvbSAnLi4vbGluay9saW5rJ1xuaW1wb3J0IHsgTWVtbyB9IGZyb20gJy4uL21lbW8vbWVtbydcbmltcG9ydCBIZWxwSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0hlbHAnXG5pbXBvcnQgTm90aWZpY2F0aW9uc0ljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9Ob3RpZmljYXRpb25zJ1xuaW1wb3J0IHVzZXJJbnN0YW5jZSBmcm9tICcuLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgbm90aWZpY2F0aW9ucyBmcm9tICcuLi9zaW5nbGV0b25zL3VzZXItbm90aWZpY2F0aW9ucydcbmltcG9ydCBTeXN0ZW1Vc2FnZU1vZGFsIGZyb20gJy4uL3N5c3RlbS11c2FnZS9zeXN0ZW0tdXNhZ2UnXG5cbmltcG9ydCBVc2VyVmlldywgeyBSb2xlRGlzcGxheSB9IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91c2VyL3VzZXInXG5pbXBvcnQgVXNlclNldHRpbmdzLCB7XG4gIFNldHRpbmdzQ29tcG9uZW50VHlwZSxcbn0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3VzZXItc2V0dGluZ3MvdXNlci1zZXR0aW5ncydcbmltcG9ydCB7IEdsb2JhbFN0eWxlcyB9IGZyb20gJy4vZ2xvYmFsLXN0eWxlcydcbmltcG9ydCB7IFBlcm1pc3NpdmVDb21wb25lbnRUeXBlIH0gZnJvbSAnLi4vLi4vdHlwZXNjcmlwdCdcbmltcG9ydCBzY3JvbGxJbnRvVmlldyBmcm9tICdzY3JvbGwtaW50by12aWV3LWlmLW5lZWRlZCdcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcbmltcG9ydCB7XG4gIHVzZUJhY2tib25lLFxuICB1c2VMaXN0ZW5Ubyxcbn0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQge1xuICBBc3luY1Rhc2tzLFxuICB1c2VSZW5kZXJPbkFzeW5jVGFza3NBZGRPclJlbW92ZSxcbn0gZnJvbSAnLi4vLi4vanMvbW9kZWwvQXN5bmNUYXNrL2FzeW5jLXRhc2snXG5pbXBvcnQgdXNlU25hY2sgZnJvbSAnLi4vaG9va3MvdXNlU25hY2snXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCB7IEJhc2VQcm9wcyB9IGZyb20gJy4uL2J1dHRvbi9leHBhbmRpbmctYnV0dG9uJ1xuaW1wb3J0IHsgdXNlRGlhbG9nU3RhdGUgfSBmcm9tICcuLi9ob29rcy91c2VEaWFsb2dTdGF0ZSdcbmltcG9ydCBTZXNzaW9uVGltZW91dCBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvc2Vzc2lvbi10aW1lb3V0J1xuaW1wb3J0IHsgQWpheEVycm9ySGFuZGxpbmcgfSBmcm9tICcuL2FqYXgtZXJyb3ItaGFuZGxpbmcnXG5pbXBvcnQgeyBXcmVxclNuYWNrcyB9IGZyb20gJy4vd3JlcXItc25hY2tzJ1xuaW1wb3J0IHNlc3Npb25UaW1lb3V0TW9kZWwgZnJvbSAnLi4vc2luZ2xldG9ucy9zZXNzaW9uLXRpbWVvdXQnXG5pbXBvcnQgRXh0ZW5zaW9ucyBmcm9tICcuLi8uLi9leHRlbnNpb24tcG9pbnRzJ1xuaW1wb3J0IHsgdXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvY29uZmlndXJhdGlvbi5ob29rcydcblxuZXhwb3J0IGNvbnN0IGhhbmRsZUJhc2U2NEVuY29kZWRJbWFnZXMgPSAodXJsOiBzdHJpbmcpID0+IHtcbiAgaWYgKHVybCAmJiB1cmwuc3RhcnRzV2l0aCgnZGF0YTonKSkge1xuICAgIHJldHVybiB1cmxcbiAgfVxuICByZXR1cm4gYGRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwke3VybH1gXG59XG50eXBlIEZvck5hdkJ1dHRvblR5cGUgPSBPbWl0PEJhc2VQcm9wcywgJ2V4cGFuZGVkJz4gJlxuICBSZXF1aXJlZDxQaWNrPEJhc2VQcm9wcywgJ2RhdGFJZCc+PlxuZXhwb3J0IHR5cGUgUm91dGVTaG93bkluTmF2VHlwZSA9IHtcbiAgcm91dGVQcm9wczogUm91dGVQcm9wc1xuICBsaW5rUHJvcHM6IExpbmtQcm9wc1xuICBzaG93SW5OYXY6IHRydWVcbiAgbmF2QnV0dG9uUHJvcHM6IEZvck5hdkJ1dHRvblR5cGVcbn1cbmV4cG9ydCB0eXBlIFJvdXRlTm90U2hvd25Jbk5hdlR5cGUgPSB7XG4gIHJvdXRlUHJvcHM6IFJvdXRlUHJvcHNcbiAgc2hvd0luTmF2OiBmYWxzZVxufVxuZXhwb3J0IHR5cGUgSW5kaXZpZHVhbFJvdXRlVHlwZSA9IFJvdXRlU2hvd25Jbk5hdlR5cGUgfCBSb3V0ZU5vdFNob3duSW5OYXZUeXBlXG5jb25zdCBtYXRjaGVzUm91dGUgPSAoe1xuICByb3V0ZUluZm8sXG4gIHBhdGhuYW1lLFxufToge1xuICByb3V0ZUluZm86IEluZGl2aWR1YWxSb3V0ZVR5cGVcbiAgcGF0aG5hbWU6IHN0cmluZ1xufSkgPT4ge1xuICBpZiAoXG4gICAgcm91dGVJbmZvLnJvdXRlUHJvcHMucGF0aCAmJlxuICAgIHR5cGVvZiByb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoID09PSAnc3RyaW5nJ1xuICApIHtcbiAgICByZXR1cm4gKFxuICAgICAgcGF0aG5hbWUuc3RhcnRzV2l0aChgJHtyb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRofS9gKSB8fFxuICAgICAgcGF0aG5hbWUuZW5kc1dpdGgoYCR7cm91dGVJbmZvLnJvdXRlUHJvcHMucGF0aH1gKVxuICAgIClcbiAgfSBlbHNlIGlmIChcbiAgICByb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoICYmXG4gICAgcm91dGVJbmZvLnJvdXRlUHJvcHMucGF0aC5jb25zdHJ1Y3RvciA9PT0gQXJyYXlcbiAgKSB7XG4gICAgcmV0dXJuIHJvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGguc29tZShcbiAgICAgIChwb3NzaWJsZVJvdXRlKSA9PlxuICAgICAgICBwYXRobmFtZS5zdGFydHNXaXRoKGAke3Bvc3NpYmxlUm91dGV9L2ApIHx8XG4gICAgICAgIHBhdGhuYW1lLmVuZHNXaXRoKGAke3Bvc3NpYmxlUm91dGV9YClcbiAgICApXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG50eXBlIEFwcFByb3BzVHlwZSA9IHtcbiAgUm91dGVJbmZvcm1hdGlvbjogSW5kaXZpZHVhbFJvdXRlVHlwZVtdXG4gIE5vdGlmaWNhdGlvbnNDb21wb25lbnQ6IFBlcm1pc3NpdmVDb21wb25lbnRUeXBlXG4gIFNldHRpbmdzQ29tcG9uZW50czogU2V0dGluZ3NDb21wb25lbnRUeXBlXG59XG5mdW5jdGlvbiBzaWRlYmFyRGF0YUlkVGFnKG5hbWU6IHN0cmluZykge1xuICByZXR1cm4gYHNpZGViYXItJHtuYW1lfS1idXR0b25gXG59XG4vKipcbiAqIElmIHlvdSdyZSBub3QgdXNpbmcgYSBjdXN0b20gbG9hZGluZyBzY3JlZW4sXG4gKiB0aGlzIGhhbmRsZXMgcmVtb3ZpbmcgdGhlIGRlZmF1bHQgb25lIGZvciB5b3Ugb24gZmlyc3QgcmVuZGVyXG4gKiBvZiB0aGUgYXBwLlxuICovXG5leHBvcnQgY29uc3QgdXNlRGVmYXVsdFdlbGNvbWUgPSAoKSA9PiB7XG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgbG9hZGluZ0VsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbG9hZGluZycpXG4gICAgaWYgKGxvYWRpbmdFbGVtZW50KSB7XG4gICAgICBsb2FkaW5nRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBsb2FkaW5nRWxlbWVudC5yZW1vdmUoKVxuICAgICAgfSwgNTAwKVxuICAgIH1cbiAgfSwgW10pXG59XG5jb25zdCBzY3JvbGxDdXJyZW50Um91dGVJbnRvVmlldyA9ICgpID0+IHtcbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgY29uc3QgY3VycmVudHJvdXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignW2RhdGEtY3VycmVudHJvdXRlXScpXG4gICAgaWYgKGN1cnJlbnRyb3V0ZSkge1xuICAgICAgc2Nyb2xsSW50b1ZpZXcoY3VycmVudHJvdXRlLCB7XG4gICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJyxcbiAgICAgICAgc2Nyb2xsTW9kZTogJ2lmLW5lZWRlZCcsXG4gICAgICB9KVxuICAgIH1cbiAgfSwgMClcbn1cbmNvbnN0IEFzeW5jVGFza3NDb21wb25lbnQgPSAoKSA9PiB7XG4gIGNvbnN0IFtzaG93QmFyLCBzZXRTaG93QmFyXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICB1c2VSZW5kZXJPbkFzeW5jVGFza3NBZGRPclJlbW92ZSgpXG4gIGNvbnN0IGFkZFNuYWNrID0gdXNlU25hY2soKVxuICBjb25zdCBoaXN0b3J5ID0gdXNlSGlzdG9yeSgpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IHRpbWVvdXRpZCA9IHVuZGVmaW5lZCBhcyBudW1iZXIgfCB1bmRlZmluZWRcbiAgICB0aW1lb3V0aWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRTaG93QmFyKGZhbHNlKVxuICAgIH0sIDEwMDApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0aWQpXG4gICAgfVxuICB9LCBbc2hvd0Jhcl0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IHRpbWVvdXRpZCA9IHVuZGVmaW5lZCBhcyBudW1iZXIgfCB1bmRlZmluZWRcbiAgICBpZiAoQXN5bmNUYXNrcy5oYXNTaG93YWJsZVRhc2tzKCkpIHtcbiAgICAgIHNldFNob3dCYXIodHJ1ZSlcbiAgICAgIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9ICgpID0+IHtcbiAgICAgICAgc2V0U2hvd0Jhcih0cnVlKVxuICAgICAgICByZXR1cm4gYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBsZWF2ZT8gJHtBc3luY1Rhc2tzLmxpc3QubGVuZ3RofSB0YXNrcyBhcmUgc3RpbGwgcnVubmluZy5gXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFNob3dCYXIoZmFsc2UpXG4gICAgfVxuICAgIHRpbWVvdXRpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldFNob3dCYXIoZmFsc2UpXG4gICAgfSwgMTAwMClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRpZClcbiAgICAgIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9IG51bGxcbiAgICB9XG4gIH0sIFtBc3luY1Rhc2tzLmxpc3QubGVuZ3RoXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCB1bnN1YnMgPSBBc3luY1Rhc2tzLmxpc3QubWFwKCh0YXNrKSA9PiB7XG4gICAgICByZXR1cm4gdGFzay5zdWJzY3JpYmVUbyh7XG4gICAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAndXBkYXRlJyxcbiAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICBBc3luY1Rhc2tzLnJlbW92ZSh0YXNrKVxuICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzUmVzdG9yZVRhc2sodGFzaykpIHtcbiAgICAgICAgICAgIGFkZFNuYWNrKFxuICAgICAgICAgICAgICBgUmVzdG9yZSBvZiAke3Rhc2subGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlfSBjb21wbGV0ZS5gLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGltZW91dDogNTAwMCxcbiAgICAgICAgICAgICAgICBjbG9zZWFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICAgICAgICAgICAgYWN0aW9uOiAoXG4gICAgICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnQ9e0xpbmt9XG4gICAgICAgICAgICAgICAgICAgICAgdG89e2Avc2VhcmNoLyR7dGFzay5sYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLmRlbGV0ZWQuaWQnXX1gfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgR28gdG9cbiAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNEZWxldGVUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICBhZGRTbmFjayhcbiAgICAgICAgICAgICAgYERlbGV0ZSBvZiAke3Rhc2subGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlfSBjb21wbGV0ZS5gLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdW5kbzogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgaGlzdG9yeS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aG5hbWU6IGAvc2VhcmNoLyR7dGFzay5sYXp5UmVzdWx0LnBsYWluLmlkfWAsXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaDogJycsXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgQXN5bmNUYXNrcy5yZXN0b3JlKHsgbGF6eVJlc3VsdDogdGFzay5sYXp5UmVzdWx0IH0pXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoQXN5bmNUYXNrcy5pc0NyZWF0ZVNlYXJjaFRhc2sodGFzaykpIHtcbiAgICAgICAgICAgIGFkZFNuYWNrKGBDcmVhdGlvbiBvZiAke3Rhc2suZGF0YS50aXRsZX0gY29tcGxldGUuYClcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHVuc3Vicy5mb3JFYWNoKCh1bnN1YikgPT4ge1xuICAgICAgICB1bnN1YigpXG4gICAgICB9KVxuICAgIH1cbiAgfSlcbiAgaWYgKEFzeW5jVGFza3MubGlzdC5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtgJHtcbiAgICAgICAgICBzaG93QmFyID8gJ3RyYW5zbGF0ZS15LTAnIDogJ3RyYW5zbGF0ZS15LWZ1bGwnXG4gICAgICAgIH0gYWJzb2x1dGUgbGVmdC0wIGJvdHRvbS0wIHctZnVsbCBiZy1ibGFjayBiZy1vcGFjaXR5LTc1IGgtMTYgei01MCB0cmFuc2l0aW9uIHRyYW5zZm9ybSBlYXNlLWluLW91dCBkdXJhdGlvbi01MDAgaG92ZXI6dHJhbnNsYXRlLXktMGB9XG4gICAgICA+XG4gICAgICAgIDxMaW5lYXJQcm9ncmVzc1xuICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBhYnNvbHV0ZSBoLTIgbGVmdC0wIHRvcC0wIC1tdC0yXCJcbiAgICAgICAgICB2YXJpYW50PVwiaW5kZXRlcm1pbmF0ZVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBvdmVyZmxvdy1hdXRvIGgtZnVsbCB3LWZ1bGwgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQtd2hpdGVcIj5cbiAgICAgICAgICB7QXN5bmNUYXNrcy5saXN0Lm1hcCgoYXN5bmNUYXNrKSA9PiB7XG4gICAgICAgICAgICBpZiAoQXN5bmNUYXNrcy5pc1Jlc3RvcmVUYXNrKGFzeW5jVGFzaykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWJsYWNrIHAtMlwiPlxuICAgICAgICAgICAgICAgICAgUmVzdG9yaW5nICdcbiAgICAgICAgICAgICAgICAgIHthc3luY1Rhc2subGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlfSdcbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNEZWxldGVUYXNrKGFzeW5jVGFzaykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWJsYWNrIHAtMlwiPlxuICAgICAgICAgICAgICAgICAgRGVsZXRpbmcgJ1xuICAgICAgICAgICAgICAgICAge2FzeW5jVGFzay5sYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGV9J1xuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXN5bmNUYXNrcy5pc0NyZWF0ZVNlYXJjaFRhc2soYXN5bmNUYXNrKSkge1xuICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYmxhY2sgcC0yXCI+XG4gICAgICAgICAgICAgICAgICBDcmVhdGluZyAne2FzeW5jVGFzay5kYXRhLnRpdGxlfSdcbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNTYXZlU2VhcmNoVGFzayhhc3luY1Rhc2spKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ibGFjayBwLTJcIj5cbiAgICAgICAgICAgICAgICAgIFNhdmluZyAne2FzeW5jVGFzay5kYXRhLnRpdGxlfSdcbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNDcmVhdGVUYXNrKGFzeW5jVGFzaykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWJsYWNrIHAtMlwiPlxuICAgICAgICAgICAgICAgICAgQ3JlYXRpbmcgJ3thc3luY1Rhc2suZGF0YS50aXRsZX0nXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzU2F2ZVRhc2soYXN5bmNUYXNrKSkge1xuICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYmxhY2sgcC0yXCI+XG4gICAgICAgICAgICAgICAgICBTYXZpbmcgJ3thc3luY1Rhc2suZGF0YS50aXRsZX0nXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG4gIHJldHVybiBudWxsXG59XG4vKiogVGhlIHNvbmcgYW5kIGRhbmNlIGFyb3VuZCAnYScgdnMgTGluayBoYXMgdG8gZG8gd2l0aCByZWFjdCByb3V0ZXIgbm90IHN1cHBvcnRpbmcgdGhlc2Ugb3V0c2lkZSBsaW5rcyAqL1xuY29uc3QgSGVscEJ1dHRvbiA9ICgpID0+IHtcbiAgY29uc3QgeyBnZXRIZWxwVXJsIH0gPSB1c2VDb25maWd1cmF0aW9uKClcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKVxuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG4gIHJldHVybiAoXG4gICAgPEV4cGFuZGluZ0J1dHRvblxuICAgICAgY29tcG9uZW50PXtnZXRIZWxwVXJsKCkgPyAnYScgOiAoTGluayBhcyB1bmtub3duIGFzIGFueSl9XG4gICAgICBocmVmPXtnZXRIZWxwVXJsKCl9XG4gICAgICB0bz17XG4gICAgICAgIGdldEhlbHBVcmwoKVxuICAgICAgICAgID8gZ2V0SGVscFVybCgpXG4gICAgICAgICAgOiB7XG4gICAgICAgICAgICAgIHBhdGhuYW1lOiBgJHtsb2NhdGlvbi5wYXRobmFtZX1gLFxuICAgICAgICAgICAgICBzZWFyY2g6IGAke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgLi4ucXVlcnlQYXJhbXMsXG4gICAgICAgICAgICAgICAgJ2dsb2JhbC1oZWxwJzogJ0hlbHAnLFxuICAgICAgICAgICAgICB9KX1gLFxuICAgICAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGFyZ2V0PXtnZXRIZWxwVXJsKCkgPyAnX2JsYW5rJyA6IHVuZGVmaW5lZH1cbiAgICAgIGNsYXNzTmFtZT17YGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIG9wYWNpdHktMjUgIGhvdmVyOm9wYWNpdHktMTAwIGZvY3VzLXZpc2libGU6b3BhY2l0eS0xMDAgdHJhbnNpdGlvbi1vcGFjaXR5YH1cbiAgICAgIEljb249e0hlbHBJY29ufVxuICAgICAgZXhwYW5kZWRMYWJlbD1cIkhlbHBcIlxuICAgICAgdW5leHBhbmRlZExhYmVsPVwiXCJcbiAgICAgIGRhdGFJZD17c2lkZWJhckRhdGFJZFRhZygnaGVscCcpfVxuICAgICAgZXhwYW5kZWQ9e25hdk9wZW59XG4gICAgICBmb2N1c1Zpc2libGVDbGFzc05hbWU9XCJmb2N1cy12aXNpYmxlXCJcbiAgICAvPlxuICApXG59XG5cbmZ1bmN0aW9uIERyYXdlcldyYXBwZXJDb21wb25lbnQoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGUgfSkge1xuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgZmxleCBmbGV4LWNvbCBmbGV4LW5vd3JhcCBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAge0V4dGVuc2lvbnMuaW5jbHVkZU5hdmlnYXRpb25CdXR0b25zID8gKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIHNocmluay0wIGdyb3ctMCBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICAgIDxTaWRlQmFyTmF2aWdhdGlvbkJ1dHRvbnMgc2hvd1RleHQgLz5cbiAgICAgICAgICAgIDxEaXZpZGVyIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgZ3JvdyBzaHJpbmsgb3ZlcmZsb3ctYXV0b1wiPlxuICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8Lz5cbiAgKVxufVxuXG5jb25zdCBTZXR0aW5nc0J1dHRvbiA9ICgpID0+IHtcbiAgY29uc3QgeyBTZXR0aW5nc0NvbXBvbmVudHMgfSA9IHVzZVRvcExldmVsQXBwQ29udGV4dCgpXG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCBoaXN0b3J5ID0gdXNlSGlzdG9yeSgpXG4gIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKVxuICBjb25zdCBvcGVuID0gQm9vbGVhbihxdWVyeVBhcmFtc1snZ2xvYmFsLXNldHRpbmdzJ10pXG4gIGNvbnN0IHsgbmF2T3BlbiB9ID0gdXNlTmF2Q29udGV4dFByb3ZpZGVyKClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEV4cGFuZGluZ0J1dHRvblxuICAgICAgICBjb21wb25lbnQ9e0xpbmsgYXMgYW55fVxuICAgICAgICB0bz17e1xuICAgICAgICAgIHBhdGhuYW1lOiBgJHtsb2NhdGlvbi5wYXRobmFtZX1gLFxuICAgICAgICAgIHNlYXJjaDogYCR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIC4uLnF1ZXJ5UGFyYW1zLFxuICAgICAgICAgICAgJ2dsb2JhbC1zZXR0aW5ncyc6ICdTZXR0aW5ncycsXG4gICAgICAgICAgfSl9YCxcbiAgICAgICAgfX1cbiAgICAgICAgY2xhc3NOYW1lPXtgZ3JvdXAtaG92ZXI6b3BhY2l0eS0xMDAgb3BhY2l0eS0yNSByZWxhdGl2ZSBob3ZlcjpvcGFjaXR5LTEwMCBmb2N1cy12aXNpYmxlOm9wYWNpdHktMTAwIHRyYW5zaXRpb24tb3BhY2l0eWB9XG4gICAgICAgIEljb249e1NldHRpbmdzSWNvbn1cbiAgICAgICAgZXhwYW5kZWRMYWJlbD1cIlNldHRpbmdzXCJcbiAgICAgICAgdW5leHBhbmRlZExhYmVsPVwiXCJcbiAgICAgICAgZGF0YUlkPXtzaWRlYmFyRGF0YUlkVGFnKCdzZXR0aW5ncycpfVxuICAgICAgICBleHBhbmRlZD17bmF2T3Blbn1cbiAgICAgICAgZm9jdXNWaXNpYmxlQ2xhc3NOYW1lPVwiZm9jdXMtdmlzaWJsZVwiXG4gICAgICAvPlxuICAgICAgPERyYXdlclxuICAgICAgICBhbmNob3I9XCJsZWZ0XCJcbiAgICAgICAgb3Blbj17b3Blbn1cbiAgICAgICAgb25DbG9zZT17KCkgPT4ge1xuICAgICAgICAgIGRlbGV0ZSBxdWVyeVBhcmFtc1snZ2xvYmFsLXNldHRpbmdzJ11cbiAgICAgICAgICBoaXN0b3J5LnB1c2goXG4gICAgICAgICAgICBgJHtsb2NhdGlvbi5wYXRobmFtZX0/JHtxdWVyeVN0cmluZy5zdHJpbmdpZnkocXVlcnlQYXJhbXMpfWBcbiAgICAgICAgICApXG4gICAgICAgIH19XG4gICAgICAgIFBhcGVyUHJvcHM9e3tcbiAgICAgICAgICBjbGFzc05hbWU6ICdtaW4tdy0xMjAgbWF4LXctNC81ICcsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDxEcmF3ZXJXcmFwcGVyQ29tcG9uZW50PlxuICAgICAgICAgIDxVc2VyU2V0dGluZ3MgU2V0dGluZ3NDb21wb25lbnRzPXtTZXR0aW5nc0NvbXBvbmVudHN9IC8+XG4gICAgICAgIDwvRHJhd2VyV3JhcHBlckNvbXBvbmVudD5cbiAgICAgIDwvRHJhd2VyPlxuICAgIDwvPlxuICApXG59XG5jb25zdCBOb3RpZmljYXRpb25zQnV0dG9uID0gKCkgPT4ge1xuICBjb25zdCBoYXNVbnNlZW5Ob3RpZmljYXRpb25zID0gdXNlSW5kaWNhdGVIYXNVbnNlZW5Ob3RpZmljYXRpb25zKClcbiAgY29uc3QgeyBOb3RpZmljYXRpb25zQ29tcG9uZW50IH0gPSB1c2VUb3BMZXZlbEFwcENvbnRleHQoKVxuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKClcbiAgY29uc3QgaGlzdG9yeSA9IHVzZUhpc3RvcnkoKVxuICBjb25zdCBxdWVyeVBhcmFtcyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaClcbiAgY29uc3Qgb3BlbiA9IEJvb2xlYW4ocXVlcnlQYXJhbXNbJ2dsb2JhbC1ub3RpZmljYXRpb25zJ10pXG4gIGNvbnN0IHsgbmF2T3BlbiB9ID0gdXNlTmF2Q29udGV4dFByb3ZpZGVyKClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9e1xuICAgICAgICAgIGhhc1Vuc2Vlbk5vdGlmaWNhdGlvbnMgPyAnYW5pbWF0ZS13aWdnbGUgTXVpLXRleHQtd2FybmluZycgOiAnJ1xuICAgICAgICB9XG4gICAgICA+XG4gICAgICAgIDxFeHBhbmRpbmdCdXR0b25cbiAgICAgICAgICBjb21wb25lbnQ9e0xpbmsgYXMgYW55fVxuICAgICAgICAgIHRvPXt7XG4gICAgICAgICAgICBwYXRobmFtZTogYCR7bG9jYXRpb24ucGF0aG5hbWV9YCxcbiAgICAgICAgICAgIHNlYXJjaDogYCR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgLi4ucXVlcnlQYXJhbXMsXG4gICAgICAgICAgICAgICdnbG9iYWwtbm90aWZpY2F0aW9ucyc6ICdOb3RpZmljYXRpb25zJyxcbiAgICAgICAgICAgIH0pfWAsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBjbGFzc05hbWU9e2Ake1xuICAgICAgICAgICAgIWhhc1Vuc2Vlbk5vdGlmaWNhdGlvbnMgPyAnb3BhY2l0eS0yNScgOiAnJ1xuICAgICAgICAgIH0gZ3JvdXAtaG92ZXI6b3BhY2l0eS0xMDAgIHJlbGF0aXZlIGhvdmVyOm9wYWNpdHktMTAwIGZvY3VzLXZpc2libGU6b3BhY2l0eS0xMDAgdHJhbnNpdGlvbi1vcGFjaXR5YH1cbiAgICAgICAgICBJY29uPXtOb3RpZmljYXRpb25zSWNvbn1cbiAgICAgICAgICBleHBhbmRlZExhYmVsPVwiTm90aWZpY2F0aW9uc1wiXG4gICAgICAgICAgdW5leHBhbmRlZExhYmVsPVwiXCJcbiAgICAgICAgICBkYXRhSWQ9e3NpZGViYXJEYXRhSWRUYWcoJ25vdGlmaWNhdGlvbnMnKX1cbiAgICAgICAgICBleHBhbmRlZD17bmF2T3Blbn1cbiAgICAgICAgICBmb2N1c1Zpc2libGVDbGFzc05hbWU9XCJmb2N1cy12aXNpYmxlXCJcbiAgICAgICAgICBvcmllbnRhdGlvbj1cInZlcnRpY2FsXCJcbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPERyYXdlclxuICAgICAgICBhbmNob3I9XCJsZWZ0XCJcbiAgICAgICAgb3Blbj17b3Blbn1cbiAgICAgICAgb25DbG9zZT17KCkgPT4ge1xuICAgICAgICAgIGRlbGV0ZSBxdWVyeVBhcmFtc1snZ2xvYmFsLW5vdGlmaWNhdGlvbnMnXVxuICAgICAgICAgIGhpc3RvcnkucHVzaChcbiAgICAgICAgICAgIGAke2xvY2F0aW9uLnBhdGhuYW1lfT8ke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeShxdWVyeVBhcmFtcyl9YFxuICAgICAgICAgIClcbiAgICAgICAgICBub3RpZmljYXRpb25zLnNldFNlZW4oKVxuICAgICAgICAgIHVzZXJJbnN0YW5jZS5zYXZlUHJlZmVyZW5jZXMoKVxuICAgICAgICB9fVxuICAgICAgICBQYXBlclByb3BzPXt7XG4gICAgICAgICAgY2xhc3NOYW1lOiAnbWluLXctMTIwIG1heC13LTQvNSAnLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8RHJhd2VyV3JhcHBlckNvbXBvbmVudD5cbiAgICAgICAgICA8Tm90aWZpY2F0aW9uc0NvbXBvbmVudCAvPlxuICAgICAgICA8L0RyYXdlcldyYXBwZXJDb21wb25lbnQ+XG4gICAgICA8L0RyYXdlcj5cbiAgICA8Lz5cbiAgKVxufVxuY29uc3QgVXNlckJ1dHRvbiA9ICgpID0+IHtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIGNvbnN0IGhpc3RvcnkgPSB1c2VIaXN0b3J5KClcbiAgY29uc3QgcXVlcnlQYXJhbXMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpXG4gIGNvbnN0IG9wZW4gPSBCb29sZWFuKHF1ZXJ5UGFyYW1zWydnbG9iYWwtdXNlciddKVxuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG5cbiAgY29uc3QgZ2V0TGFiZWwgPSAoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIHRydW5jYXRlXCI+e3VzZXJJbnN0YW5jZS5nZXRVc2VyTmFtZSgpfTwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQteHMgdHJ1bmNhdGUgdy1mdWxsXCI+XG4gICAgICAgICAgPFJvbGVEaXNwbGF5IC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEV4cGFuZGluZ0J1dHRvblxuICAgICAgICBjb21wb25lbnQ9e0xpbmsgYXMgYW55fVxuICAgICAgICB0bz17e1xuICAgICAgICAgIHBhdGhuYW1lOiBgJHtsb2NhdGlvbi5wYXRobmFtZX1gLFxuICAgICAgICAgIHNlYXJjaDogYCR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIC4uLnF1ZXJ5UGFyYW1zLFxuICAgICAgICAgICAgJ2dsb2JhbC11c2VyJzogJ1VzZXInLFxuICAgICAgICAgIH0pfWAsXG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT17YGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIG9wYWNpdHktMjUgcmVsYXRpdmUgaG92ZXI6b3BhY2l0eS0xMDAgZm9jdXMtdmlzaWJsZTpvcGFjaXR5LTEwMCB0cmFuc2l0aW9uLW9wYWNpdHlgfVxuICAgICAgICBJY29uPXtQZXJzb25JY29ufVxuICAgICAgICBleHBhbmRlZExhYmVsPXtnZXRMYWJlbCgpfVxuICAgICAgICB1bmV4cGFuZGVkTGFiZWw9e2dldExhYmVsKCl9XG4gICAgICAgIGRhdGFJZD17c2lkZWJhckRhdGFJZFRhZygndXNlci1wcm9maWxlJyl9XG4gICAgICAgIGV4cGFuZGVkPXtuYXZPcGVufVxuICAgICAgICBmb2N1c1Zpc2libGVDbGFzc05hbWU9XCJmb2N1cy12aXNpYmxlXCJcbiAgICAgIC8+XG4gICAgICA8RHJhd2VyXG4gICAgICAgIGFuY2hvcj1cImxlZnRcIlxuICAgICAgICBvcGVuPXtvcGVufVxuICAgICAgICBvbkNsb3NlPXsoKSA9PiB7XG4gICAgICAgICAgZGVsZXRlIHF1ZXJ5UGFyYW1zWydnbG9iYWwtdXNlciddXG4gICAgICAgICAgaGlzdG9yeS5wdXNoKFxuICAgICAgICAgICAgYCR7bG9jYXRpb24ucGF0aG5hbWV9PyR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHF1ZXJ5UGFyYW1zKX1gXG4gICAgICAgICAgKVxuICAgICAgICB9fVxuICAgICAgICBQYXBlclByb3BzPXt7XG4gICAgICAgICAgY2xhc3NOYW1lOiAnbWluLXctMTIwIG1heC13LTQvNSAnLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8RHJhd2VyV3JhcHBlckNvbXBvbmVudD5cbiAgICAgICAgICA8VXNlclZpZXcgLz5cbiAgICAgICAgPC9EcmF3ZXJXcmFwcGVyQ29tcG9uZW50PlxuICAgICAgPC9EcmF3ZXI+XG4gICAgPC8+XG4gIClcbn1cbmNvbnN0IFJvdXRlQnV0dG9uID0gKHsgcm91dGVJbmZvIH06IHsgcm91dGVJbmZvOiBSb3V0ZVNob3duSW5OYXZUeXBlIH0pID0+IHtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIGNvbnN0IHsgbmF2T3BlbiB9ID0gdXNlTmF2Q29udGV4dFByb3ZpZGVyKClcbiAgY29uc3QgaXNTZWxlY3RlZCA9IG1hdGNoZXNSb3V0ZSh7XG4gICAgcm91dGVJbmZvLFxuICAgIHBhdGhuYW1lOiBsb2NhdGlvbi5wYXRobmFtZSxcbiAgfSlcbiAgcmV0dXJuIChcbiAgICA8RXhwYW5kaW5nQnV0dG9uXG4gICAgICBrZXk9e3JvdXRlSW5mby5saW5rUHJvcHMudG8udG9TdHJpbmcoKX1cbiAgICAgIGNvbXBvbmVudD17TGluayBhcyBhbnl9XG4gICAgICB0bz17cm91dGVJbmZvLmxpbmtQcm9wcy50b31cbiAgICAgIGNsYXNzTmFtZT17YGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwICR7XG4gICAgICAgICFpc1NlbGVjdGVkID8gJ29wYWNpdHktMjUnIDogJydcbiAgICAgIH0gZm9jdXMtdmlzaWJsZTpvcGFjaXR5LTEwMCBob3ZlcjpvcGFjaXR5LTEwMCB0cmFuc2l0aW9uLW9wYWNpdHlgfVxuICAgICAgZXhwYW5kZWQ9e25hdk9wZW59XG4gICAgICB7Li4ucm91dGVJbmZvLm5hdkJ1dHRvblByb3BzfVxuICAgICAgZm9jdXNWaXNpYmxlQ2xhc3NOYW1lPVwiZm9jdXMtdmlzaWJsZVwiXG4gICAgICBkYXRhSWQ9e3NpZGViYXJEYXRhSWRUYWcocm91dGVJbmZvLm5hdkJ1dHRvblByb3BzLmRhdGFJZCl9XG4gICAgICB7Li4uKGlzU2VsZWN0ZWRcbiAgICAgICAgPyB7XG4gICAgICAgICAgICBbJ2RhdGEtY3VycmVudHJvdXRlJ106IHRydWUsXG4gICAgICAgICAgfVxuICAgICAgICA6IHt9KX1cbiAgICAvPlxuICApXG59XG5jb25zdCBTaWRlQmFyUm91dGVzID0gKCkgPT4ge1xuICBjb25zdCB7IFJvdXRlSW5mb3JtYXRpb24gfSA9IHVzZVRvcExldmVsQXBwQ29udGV4dCgpXG4gIHJldHVybiAoXG4gICAgPEdyaWRcbiAgICAgIGl0ZW1cbiAgICAgIGNsYXNzTmFtZT1cIm92ZXJmbG93LWF1dG8gcC0wIHNocmluay0wIHNjcm9sbGJhcnMtbWluXCJcbiAgICAgIHN0eWxlPXt7XG4gICAgICAgIG1heEhlaWdodDogYGNhbGMoMTAwJSAtICR7NyAqIDR9cmVtKWAsIC8vXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtSb3V0ZUluZm9ybWF0aW9uLmZpbHRlcigocm91dGVJbmZvKSA9PiByb3V0ZUluZm8uc2hvd0luTmF2KS5tYXAoXG4gICAgICAgIChyb3V0ZUluZm86IFJvdXRlU2hvd25Jbk5hdlR5cGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFJvdXRlQnV0dG9uXG4gICAgICAgICAgICAgIHJvdXRlSW5mbz17cm91dGVJbmZvfVxuICAgICAgICAgICAgICBrZXk9e3JvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGg/LnRvU3RyaW5nKCl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgKX1cbiAgICAgIHs8RXh0ZW5zaW9ucy5leHRyYVJvdXRlcyAvPn1cbiAgICA8L0dyaWQ+XG4gIClcbn1cbmNvbnN0IFNpZGVCYXJOYXZpZ2F0aW9uQnV0dG9ucyA9ICh7XG4gIHNob3dUZXh0ID0gZmFsc2UsXG59OiB7IHNob3dUZXh0PzogYm9vbGVhbiB9ID0ge30pID0+IHtcbiAgY29uc3QgeyBuYXZPcGVuIH0gPSB1c2VOYXZDb250ZXh0UHJvdmlkZXIoKVxuICBjb25zdCBzaG93RXhwYW5kZWRUZXh0ID0gbmF2T3BlbiB8fCBzaG93VGV4dFxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBwLTIgc2hyaW5rLTBcIj5cbiAgICAgICAgPEdyaWRcbiAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIG92ZXJmbG93LWhpZGRlblwiXG4gICAgICAgID5cbiAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cIm1yLWF1dG9cIj5cbiAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gaGlzdG9yeS5iYWNrKCl9PlxuICAgICAgICAgICAgICA8QXJyb3dCYWNrSWNvbiBmb250U2l6ZT1cInNtYWxsXCIgLz5cbiAgICAgICAgICAgICAge3Nob3dFeHBhbmRlZFRleHQgJiYgJ0JhY2snfVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwibWwtYXV0b1wiPlxuICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBoaXN0b3J5LmZvcndhcmQoKX0+XG4gICAgICAgICAgICAgIHtzaG93RXhwYW5kZWRUZXh0ICYmICdGb3J3YXJkJ31cbiAgICAgICAgICAgICAgPEFycm93Rm9yd2FyZEljb24gZm9udFNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgIDwvR3JpZD5cbiAgICA8Lz5cbiAgKVxufVxuXG5jb25zdCBTaWRlQmFyVG9nZ2xlQnV0dG9uID0gKCkgPT4ge1xuICBjb25zdCB7IG5hdk9wZW4sIHNldE5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG4gIGNvbnN0IHsgZ2V0VG9wTGVmdExvZ29TcmMsIGdldEN1c3RvbUJyYW5kaW5nLCBnZXRQcm9kdWN0LCBnZXRNZW51SWNvblNyYyB9ID1cbiAgICB1c2VDb25maWd1cmF0aW9uKClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0xNiBzaHJpbmstMFwiPlxuICAgICAgICB7bmF2T3BlbiA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPEdyaWRcbiAgICAgICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInBsLTMgcHktMSBwci0xIHctZnVsbCByZWxhdGl2ZSBoLWZ1bGxcIj5cbiAgICAgICAgICAgICAgICB7Z2V0VG9wTGVmdExvZ29TcmMoKSA/IChcbiAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibWF4LWgtZnVsbCBtYXgtdy1mdWxsIGFic29sdXRlIGxlZnQtMS8yIHRyYW5zZm9ybSAtdHJhbnNsYXRlLXgtMS8yIC10cmFuc2xhdGUteS0xLzIgdG9wLTEvMiBwLTRcIlxuICAgICAgICAgICAgICAgICAgICBzcmM9e2hhbmRsZUJhc2U2NEVuY29kZWRJbWFnZXMoZ2V0VG9wTGVmdExvZ29TcmMoKSl9XG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicGwtM1wiXG4gICAgICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50PVwiY2VudGVyXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeT57Z2V0Q3VzdG9tQnJhbmRpbmcoKX08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeT57Z2V0UHJvZHVjdCgpfTwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJtbC1hdXRvXCI+XG4gICAgICAgICAgICAgICAgPEljb25CdXR0b25cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImgtYXV0b1wiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldE5hdk9wZW4oZmFsc2UpXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgc2l6ZT1cImxhcmdlXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8Q2hldnJvbkxlZnRJY29uIC8+XG4gICAgICAgICAgICAgICAgPC9JY29uQnV0dG9uPlxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgY29sb3I9XCJpbmhlcml0XCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJvcGVuIGRyYXdlclwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldE5hdk9wZW4odHJ1ZSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHAtMlwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAge2dldE1lbnVJY29uU3JjKCkgPyAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgc3JjPXtoYW5kbGVCYXNlNjRFbmNvZGVkSW1hZ2VzKGdldE1lbnVJY29uU3JjKCkpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibWF4LWgtMTYgbWF4LXctZnVsbFwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8TWVudUljb24gLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICl9XG4gICAgICA8L0dyaWQ+XG4gICAgPC8+XG4gIClcbn1cbmNvbnN0IFNpZGVCYXIgPSAoKSA9PiB7XG4gIGNvbnN0IHsgbmF2T3BlbiB9ID0gdXNlTmF2Q29udGV4dFByb3ZpZGVyKClcbiAgcmV0dXJuIChcbiAgICA8R3JpZFxuICAgICAgaXRlbVxuICAgICAgY2xhc3NOYW1lPXtgJHtcbiAgICAgICAgbmF2T3BlbiA/ICd3LTY0JyA6ICd3LTIwJ1xuICAgICAgfSB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAgZWFzZS1pbi1vdXQgcmVsYXRpdmUgei0xMCBtci0yIHNocmluay0wIHBiLTIgcHQtMiBwbC0yIGdyb3VwYH1cbiAgICAgIG9uTW91c2VMZWF2ZT17KCkgPT4ge1xuICAgICAgICBzY3JvbGxDdXJyZW50Um91dGVJbnRvVmlldygpXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMubmF2YmFyfSBjbGFzc05hbWU9XCJoLWZ1bGxcIj5cbiAgICAgICAgPEdyaWRcbiAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICBkaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImgtZnVsbCB3LWZ1bGxcIlxuICAgICAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgICA+XG4gICAgICAgICAge0V4dGVuc2lvbnMuaW5jbHVkZU5hdmlnYXRpb25CdXR0b25zICYmIChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxTaWRlQmFyTmF2aWdhdGlvbkJ1dHRvbnMgLz5cbiAgICAgICAgICAgICAgPERpdmlkZXIgLz5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgICAgPFNpZGVCYXJUb2dnbGVCdXR0b24gLz5cbiAgICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgICAgIDxTaWRlQmFyUm91dGVzIC8+XG4gICAgICAgICAgPERpdmlkZXIgLz5cbiAgICAgICAgICA8U2lkZUJhckJhY2tncm91bmQgLz5cbiAgICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwibXQtYXV0byBvdmVyZmxvdy1oaWRkZW4gdy1mdWxsIHNocmluay0wIGdyb3ctMFwiPlxuICAgICAgICAgICAge0V4dGVuc2lvbnMuZXh0cmFTaWRlYmFyQnV0dG9ucyAmJiAoXG4gICAgICAgICAgICAgIDxFeHRlbnNpb25zLmV4dHJhU2lkZWJhckJ1dHRvbnMgLz5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8SGVscEJ1dHRvbiAvPlxuICAgICAgICAgICAgPFNldHRpbmdzQnV0dG9uIC8+XG4gICAgICAgICAgICA8Tm90aWZpY2F0aW9uc0J1dHRvbiAvPlxuICAgICAgICAgICAgPFVzZXJCdXR0b24gLz5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgIDwvUGFwZXI+XG4gICAgPC9HcmlkPlxuICApXG59XG5jb25zdCBIZWFkZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZ2V0UGxhdGZvcm1CYWNrZ3JvdW5kLCBnZXRQbGF0Zm9ybUNvbG9yLCBnZXRQbGF0Zm9ybUhlYWRlciB9ID1cbiAgICB1c2VDb25maWd1cmF0aW9uKClcbiAgcmV0dXJuIChcbiAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbFwiPlxuICAgICAge2dldFBsYXRmb3JtSGVhZGVyKCkgPyAoXG4gICAgICAgIDxUeXBvZ3JhcGh5XG4gICAgICAgICAgYWxpZ249XCJjZW50ZXJcIlxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBnZXRQbGF0Zm9ybUJhY2tncm91bmQoKSxcbiAgICAgICAgICAgIGNvbG9yOiBnZXRQbGF0Zm9ybUNvbG9yKCksXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtnZXRQbGF0Zm9ybUhlYWRlcigpfVxuICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICApIDogbnVsbH1cbiAgICA8L0dyaWQ+XG4gIClcbn1cbmNvbnN0IEZvb3RlciA9ICgpID0+IHtcbiAgY29uc3QgeyBnZXRQbGF0Zm9ybUJhY2tncm91bmQsIGdldFBsYXRmb3JtQ29sb3IsIGdldFBsYXRmb3JtRm9vdGVyIH0gPVxuICAgIHVzZUNvbmZpZ3VyYXRpb24oKVxuICByZXR1cm4gKFxuICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsXCI+XG4gICAgICB7Z2V0UGxhdGZvcm1Gb290ZXIoKSA/IChcbiAgICAgICAgPFR5cG9ncmFwaHlcbiAgICAgICAgICBhbGlnbj1cImNlbnRlclwiXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIGJhY2tncm91bmQ6IGdldFBsYXRmb3JtQmFja2dyb3VuZCgpLFxuICAgICAgICAgICAgY29sb3I6IGdldFBsYXRmb3JtQ29sb3IoKSxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAge2dldFBsYXRmb3JtRm9vdGVyKCl9XG4gICAgICAgIDwvVHlwb2dyYXBoeT5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvR3JpZD5cbiAgKVxufVxuY29uc3QgU2lkZUJhckJhY2tncm91bmQgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZ2V0Qm90dG9tTGVmdEJhY2tncm91bmRTcmMgfSA9IHVzZUNvbmZpZ3VyYXRpb24oKVxuICByZXR1cm4gKFxuICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwicmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIHNocmluay0xIGgtZnVsbCBtaW4tdy1mdWxsXCI+XG4gICAgICB7Z2V0Qm90dG9tTGVmdEJhY2tncm91bmRTcmMoKSA/IChcbiAgICAgICAgPGltZ1xuICAgICAgICAgIGNsYXNzTmFtZT17YGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIG9wYWNpdHktNTAgZHVyYXRpb24tMjAwIGVhc2UtaW4tb3V0IHRyYW5zaXRpb24tYWxsIHctYXV0byBoLWZ1bGwgYWJzb2x1dGUgbWF4LXctbm9uZSBtLWF1dG8gbWluLWgtODBgfVxuICAgICAgICAgIHNyYz17aGFuZGxlQmFzZTY0RW5jb2RlZEltYWdlcyhnZXRCb3R0b21MZWZ0QmFja2dyb3VuZFNyYygpKX1cbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvR3JpZD5cbiAgKVxufVxuY29uc3QgUm91dGVDb250ZW50cyA9ICgpID0+IHtcbiAgY29uc3QgeyBSb3V0ZUluZm9ybWF0aW9uIH0gPSB1c2VUb3BMZXZlbEFwcENvbnRleHQoKVxuICAvKipcbiAgICogU28gdGhpcyBpcyBzbGlnaHRseSBhbm5veWluZywgYnV0IHRoZSBncmlkIHdvbid0IHByb3Blcmx5IHJlc2l6ZSB3aXRob3V0IG92ZXJmbG93IGhpZGRlbiBzZXQuXG4gICAqXG4gICAqIFRoYXQgbWFrZXMgaGFuZGxpbmcgcGFkZGluZyAvIG1hcmdpbnMgLyBzcGFjaW5nIG1vcmUgY29tcGxpY2F0ZWQgaW4gb3VyIGFwcCwgYmVjYXVzZSB3aXRoIG92ZXJmbG93IGhpZGRlbiBzZXRcbiAgICogZHJvcHNoYWRvd3Mgb24gZWxlbWVudHMgd2lsbCBnZXQgY3V0IG9mZi4gIFNvIHdlIGhhdmUgdG8gbGV0IHRoZSBjb250ZW50cyBpbnN0ZWFkIGRpY3RhdGUgdGhlaXIgcGFkZGluZywgdGhhdCB3YXlcbiAgICogdGhlaXIgZHJvcHNoYWRvd3MgY2FuIGJlIHNlZW4uXG4gICAqXG4gICAqIEZvbGtzIHdpbGwgcHJvYmFibHkgc3RydWdnbGUgYSBiaXQgd2l0aCBpdCBhdCBmaXJzdCwgYnV0IHRoZSBjc3MgdXRpbGl0aWVzIGFjdHVhbGx5IG1ha2UgaXQgcHJldHR5IGVhc3kuXG4gICAqIEp1c3QgYWRkIHBiLTIgZm9yIHRoZSBjb3JyZWN0IGJvdHRvbSBzcGFjaW5nLCBwdC0yIGZvciBjb3JyZWN0IHRvcCBzcGFjaW5nLCBldGMuIGV0Yy5cbiAgICovXG4gIHJldHVybiAoXG4gICAgPEdyaWRcbiAgICAgIGl0ZW1cbiAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcmVsYXRpdmUgei0wIHNocmluay0xIG92ZXJmbG93LXgtaGlkZGVuXCIgLy8gZG8gbm90IHJlbW92ZSB0aGlzIG92ZXJmbG93IGhpZGRlbiwgc2VlIGNvbW1lbnQgYWJvdmUgZm9yIG1vcmVcbiAgICA+XG4gICAgICA8TWVtbz5cbiAgICAgICAgPFN3aXRjaD5cbiAgICAgICAgICB7Um91dGVJbmZvcm1hdGlvbi5tYXAoKHJvdXRlSW5mbzogUm91dGVOb3RTaG93bkluTmF2VHlwZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPFJvdXRlXG4gICAgICAgICAgICAgICAga2V5PXtcbiAgICAgICAgICAgICAgICAgIHJvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGhcbiAgICAgICAgICAgICAgICAgICAgPyByb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoLnRvU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgOiBNYXRoLnJhbmRvbSgpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHsuLi5yb3V0ZUluZm8ucm91dGVQcm9wc31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9Td2l0Y2g+XG4gICAgICA8L01lbW8+XG4gICAgPC9HcmlkPlxuICApXG59XG5jb25zdCBOYXZDb250ZXh0UHJvdmlkZXIgPSBSZWFjdC5jcmVhdGVDb250ZXh0KHtcbiAgc2V0TmF2T3BlbjogKF9uYXZPcGVuOiBib29sZWFuKSA9PiB7fSxcbiAgbmF2T3BlbjogZmFsc2UsXG59KVxuZXhwb3J0IGNvbnN0IHVzZU5hdkNvbnRleHRQcm92aWRlciA9ICgpID0+IHtcbiAgY29uc3QgbmF2Q29udGV4dCA9IFJlYWN0LnVzZUNvbnRleHQoTmF2Q29udGV4dFByb3ZpZGVyKVxuICByZXR1cm4gbmF2Q29udGV4dFxufVxuLyoqXG4gKiBLZWVwIHRoZSBjdXJyZW50IHJvdXRlIHZpc2libGUgdG8gdGhlIHVzZXIgc2luY2UgaXQncyB1c2VmdWwgaW5mby5cbiAqIFRoaXMgYWxzbyBlbnN1cmVzIGl0J3MgdmlzaWJsZSB1cG9uIGZpcnN0IGxvYWQgb2YgdGhlIHBhZ2UuXG4gKi9cbmNvbnN0IHVzZVNjcm9sbEN1cnJlbnRSb3V0ZUludG9WaWV3T25Mb2NhdGlvbkNoYW5nZSA9ICgpID0+IHtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2Nyb2xsQ3VycmVudFJvdXRlSW50b1ZpZXcoKVxuICB9LCBbbG9jYXRpb25dKVxufVxuY29uc3QgdXNlSW5kaWNhdGVIYXNVbnNlZW5Ob3RpZmljYXRpb25zID0gKCkgPT4ge1xuICBjb25zdCB7IGxpc3RlblRvIH0gPSB1c2VCYWNrYm9uZSgpXG4gIGNvbnN0IFtoYXNVbnNlZW5Ob3RpZmljYXRpb25zLCBzZXRIYXNVbnNlZW5Ob3RpZmljYXRpb25zXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIG5vdGlmaWNhdGlvbnMuaGFzVW5zZWVuKCkgYXMgYm9vbGVhblxuICApXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGlzdGVuVG8obm90aWZpY2F0aW9ucywgJ2NoYW5nZSBhZGQgcmVtb3ZlIHJlc2V0IHVwZGF0ZScsICgpID0+IHtcbiAgICAgIHNldEhhc1Vuc2Vlbk5vdGlmaWNhdGlvbnMobm90aWZpY2F0aW9ucy5oYXNVbnNlZW4oKSBhcyBib29sZWFuKVxuICAgIH0pXG4gIH0sIFtdKVxuICByZXR1cm4gaGFzVW5zZWVuTm90aWZpY2F0aW9uc1xufVxuXG5jb25zdCB1c2VGYXZpY29uQnJhbmRpbmcgPSAoKSA9PiB7XG4gIC8vIHRvZG8gZmF2aWNvbiBicmFuZGluZ1xuICAvLyAkKHdpbmRvdy5kb2N1bWVudCkucmVhZHkoKCkgPT4ge1xuICAvLyAgIHdpbmRvdy5kb2N1bWVudC50aXRsZSA9IHByb3BlcnRpZXMuYnJhbmRpbmcgKyAnICcgKyBwcm9wZXJ0aWVzLnByb2R1Y3RcbiAgLy8gICBjb25zdCBmYXZpY29uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Zhdmljb24nKSBhcyBIVE1MQW5jaG9yRWxlbWVudFxuICAvLyAgIGZhdmljb24uaHJlZiA9IGJyYW5kaW5nSW5mb3JtYXRpb24udG9wTGVmdExvZ29TcmNcbiAgLy8gICBmYXZpY29uLnJlbW92ZSgpXG4gIC8vICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChmYXZpY29uKVxuICAvLyB9KVxufVxuY29uc3QgdXNlTmF2T3BlbiA9ICgpID0+IHtcbiAgbGV0IGRlZmF1bHRPcGVuID1cbiAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc2hlbGwuZHJhd2VyJykgPT09ICd0cnVlJyA/IHRydWUgOiBmYWxzZVxuICBjb25zdCBbbmF2T3Blbiwgc2V0TmF2T3Blbl0gPSBSZWFjdC51c2VTdGF0ZShkZWZhdWx0T3BlbilcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2hlbGwuZHJhd2VyJywgbmF2T3Blbi50b1N0cmluZygpKVxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgJCh3aW5kb3cpLnJlc2l6ZSgpIC8vIG5lZWRlZCBmb3IgZ29sZGVuIGxheW91dCB0byByZXNpemVcbiAgICB9LCAyNTApXG4gIH0sIFtuYXZPcGVuXSlcbiAgcmV0dXJuIHtcbiAgICBuYXZPcGVuLFxuICAgIHNldE5hdk9wZW4sXG4gIH1cbn1cbmNvbnN0IFRvcExldmVsQXBwQ29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQoe1xuICBSb3V0ZUluZm9ybWF0aW9uOiBbXSxcbiAgTm90aWZpY2F0aW9uc0NvbXBvbmVudDogKCkgPT4gbnVsbCxcbiAgU2V0dGluZ3NDb21wb25lbnRzOiB7fSxcbn0gYXMgQXBwUHJvcHNUeXBlKVxuY29uc3QgdXNlVG9wTGV2ZWxBcHBDb250ZXh0ID0gKCkgPT4ge1xuICBjb25zdCB0b3BMZXZlbEFwcENvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KFRvcExldmVsQXBwQ29udGV4dClcbiAgcmV0dXJuIHRvcExldmVsQXBwQ29udGV4dFxufVxuY29uc3QgU2Vzc2lvblRpbWVvdXRDb21wb25lbnQgPSAoKSA9PiB7XG4gIGNvbnN0IHNlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUgPSB1c2VEaWFsb2dTdGF0ZSgpXG4gIHVzZUxpc3RlblRvKHNlc3Npb25UaW1lb3V0TW9kZWwsICdjaGFuZ2U6c2hvd1Byb21wdCcsICgpID0+IHtcbiAgICBpZiAoc2Vzc2lvblRpbWVvdXRNb2RlbC5nZXQoJ3Nob3dQcm9tcHQnKSkge1xuICAgICAgc2Vzc2lvblRpbWVvdXREaWFsb2dTdGF0ZS5oYW5kbGVDbGljaygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIChcbiAgICA8c2Vzc2lvblRpbWVvdXREaWFsb2dTdGF0ZS5NdWlEaWFsb2dDb21wb25lbnRzLkRpYWxvZ1xuICAgICAgey4uLnNlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuTXVpRGlhbG9nUHJvcHN9XG4gICAgICBkaXNhYmxlRXNjYXBlS2V5RG93blxuICAgICAgb25DbG9zZT17KGV2ZW50LCByZWFzb24pID0+IHtcbiAgICAgICAgaWYgKHJlYXNvbiA9PT0gJ2JhY2tkcm9wQ2xpY2snKSB7XG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgc2Vzc2lvblRpbWVvdXREaWFsb2dTdGF0ZS5NdWlEaWFsb2dQcm9wcy5vbkNsb3NlKGV2ZW50LCByZWFzb24pXG4gICAgICB9fVxuICAgID5cbiAgICAgIDxTZXNzaW9uVGltZW91dCAvPlxuICAgIDwvc2Vzc2lvblRpbWVvdXREaWFsb2dTdGF0ZS5NdWlEaWFsb2dDb21wb25lbnRzLkRpYWxvZz5cbiAgKVxufVxuXG5jb25zdCBBcHAgPSAoe1xuICBSb3V0ZUluZm9ybWF0aW9uLFxuICBOb3RpZmljYXRpb25zQ29tcG9uZW50LFxuICBTZXR0aW5nc0NvbXBvbmVudHMsXG59OiBBcHBQcm9wc1R5cGUpID0+IHtcbiAgY29uc3QgeyBuYXZPcGVuLCBzZXROYXZPcGVuIH0gPSB1c2VOYXZPcGVuKClcbiAgdXNlRmF2aWNvbkJyYW5kaW5nKClcbiAgdXNlU2Nyb2xsQ3VycmVudFJvdXRlSW50b1ZpZXdPbkxvY2F0aW9uQ2hhbmdlKClcbiAgcmV0dXJuIChcbiAgICA8VG9wTGV2ZWxBcHBDb250ZXh0LlByb3ZpZGVyXG4gICAgICB2YWx1ZT17eyBSb3V0ZUluZm9ybWF0aW9uLCBOb3RpZmljYXRpb25zQ29tcG9uZW50LCBTZXR0aW5nc0NvbXBvbmVudHMgfX1cbiAgICA+XG4gICAgICA8TmF2Q29udGV4dFByb3ZpZGVyLlByb3ZpZGVyIHZhbHVlPXt7IG5hdk9wZW4sIHNldE5hdk9wZW4gfX0+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC1mdWxsIHctZnVsbCBvdmVyZmxvdy1oaWRkZW4gTXVpLWJnLWRlZmF1bHRcIj5cbiAgICAgICAgICB7LyogRG9uJ3QgbW92ZSBDU1NCYXNlbGluZSBvciBHbG9iYWxTdHlsZXMgdG8gcHJvdmlkZXJzLCBzaW5jZSB3ZSBoYXZlIG11bHRpcGxlIHJlYWN0IHJvb3RzLiAgICovfVxuICAgICAgICAgIDxDc3NCYXNlbGluZSAvPlxuICAgICAgICAgIDxHbG9iYWxTdHlsZXMgLz5cbiAgICAgICAgICA8U3lzdGVtVXNhZ2VNb2RhbCAvPlxuICAgICAgICAgIDxTZXNzaW9uVGltZW91dENvbXBvbmVudCAvPlxuICAgICAgICAgIDxBamF4RXJyb3JIYW5kbGluZyAvPlxuICAgICAgICAgIDxXcmVxclNuYWNrcyAvPlxuICAgICAgICAgIDxHcmlkXG4gICAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaC1mdWxsIHctZnVsbCBvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICAgICAgZGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxIZWFkZXIgLz5cbiAgICAgICAgICAgIDxFeHRlbnNpb25zLmV4dHJhSGVhZGVyIC8+XG4gICAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgIDxBc3luY1Rhc2tzQ29tcG9uZW50IC8+XG4gICAgICAgICAgICAgIDxHcmlkXG4gICAgICAgICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uPVwicm93XCJcbiAgICAgICAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zPVwic3RyZXRjaFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8U2lkZUJhciAvPlxuICAgICAgICAgICAgICAgIDxSb3V0ZUNvbnRlbnRzIC8+XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIDxFeHRlbnNpb25zLmV4dHJhRm9vdGVyIC8+XG4gICAgICAgICAgICA8Rm9vdGVyIC8+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvTmF2Q29udGV4dFByb3ZpZGVyLlByb3ZpZGVyPlxuICAgIDwvVG9wTGV2ZWxBcHBDb250ZXh0LlByb3ZpZGVyPlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBob3QoQXBwKVxuIl19