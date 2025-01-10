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
        Array.isArray(routeInfo.routeProps.path)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9hcHAvYXBwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sRUFDTCxNQUFNLEVBQ04sS0FBSyxFQUNMLFdBQVcsRUFDWCxVQUFVLEdBR1gsTUFBTSxrQkFBa0IsQ0FBQTtBQUN6QixPQUFPLFdBQVcsTUFBTSwyQkFBMkIsQ0FBQTtBQUNuRCxPQUFPLElBQUksTUFBTSxvQkFBb0IsQ0FBQTtBQUNyQyxPQUFPLENBQUMsTUFBTSxRQUFRLENBQUE7QUFDdEIsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxlQUFlLE1BQU0sNEJBQTRCLENBQUE7QUFDeEQsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxVQUFVLE1BQU0sMEJBQTBCLENBQUE7QUFDakQsT0FBTyxhQUFhLE1BQU0sK0JBQStCLENBQUE7QUFDekQsT0FBTyxnQkFBZ0IsTUFBTSxrQ0FBa0MsQ0FBQTtBQUMvRCxPQUFPLGVBQWUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUM3RCxPQUFPLFFBQVEsTUFBTSwwQkFBMEIsQ0FBQTtBQUMvQyxPQUFPLFVBQVUsTUFBTSw0QkFBNEIsQ0FBQTtBQUNuRCxPQUFPLFlBQVksTUFBTSw4QkFBOEIsQ0FBQTtBQUN2RCxPQUFPLE1BQU0sTUFBTSxzQkFBc0IsQ0FBQTtBQUN6QyxPQUFPLFdBQVcsTUFBTSxjQUFjLENBQUE7QUFDdEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGNBQWMsQ0FBQTtBQUNuQyxPQUFP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O2dCQUUzRCxvQkFBQyxXQUFXLE9BQUc7Z0JBQ2Ysb0JBQUMsWUFBWSxPQUFHO2dCQUNoQixvQkFBQyxnQkFBZ0IsT0FBRztnQkFDcEIsb0JBQUMsdUJBQXVCLE9BQUc7Z0JBQzNCLG9CQUFDLGlCQUFpQixPQUFHO2dCQUNyQixvQkFBQyxXQUFXLE9BQUc7Z0JBQ2Ysb0JBQUMsSUFBSSxJQUNILFNBQVMsUUFDVCxVQUFVLEVBQUMsUUFBUSxFQUNuQixTQUFTLEVBQUMsK0JBQStCLEVBQ3pDLFNBQVMsRUFBQyxRQUFRLEVBQ2xCLElBQUksRUFBQyxRQUFRO29CQUViLG9CQUFDLE1BQU0sT0FBRztvQkFDVixvQkFBQyxVQUFVLENBQUMsV0FBVyxPQUFHO29CQUMxQixvQkFBQyxJQUFJLElBQUMsSUFBSSxRQUFDLFNBQVMsRUFBQyx3Q0FBd0M7d0JBQzNELG9CQUFDLG1CQUFtQixPQUFHO3dCQUN2QixvQkFBQyxJQUFJLElBQ0gsU0FBUyxRQUNULFNBQVMsRUFBQyxLQUFLLEVBQ2YsSUFBSSxFQUFDLFFBQVEsRUFDYixVQUFVLEVBQUMsU0FBUyxFQUNwQixTQUFTLEVBQUMsZUFBZTs0QkFFekIsb0JBQUMsT0FBTyxPQUFHOzRCQUNYLG9CQUFDLGFBQWEsT0FBRyxDQUNaLENBQ0Y7b0JBQ1Asb0JBQUMsVUFBVSxDQUFDLFdBQVcsT0FBRztvQkFDMUIsb0JBQUMsTUFBTSxPQUFHLENBQ0wsQ0FDSCxDQUNzQixDQUNGLENBQy9CLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxlQUFlLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlci9yb290J1xuaW1wb3J0IHtcbiAgU3dpdGNoLFxuICBSb3V0ZSxcbiAgdXNlTG9jYXRpb24sXG4gIHVzZUhpc3RvcnksXG4gIFJvdXRlUHJvcHMsXG4gIExpbmtQcm9wcyxcbn0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSdcbmltcG9ydCBDc3NCYXNlbGluZSBmcm9tICdAbXVpL21hdGVyaWFsL0Nzc0Jhc2VsaW5lJ1xuaW1wb3J0IEdyaWQgZnJvbSAnQG11aS9tYXRlcmlhbC9HcmlkJ1xuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5J1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgVHlwb2dyYXBoeSBmcm9tICdAbXVpL21hdGVyaWFsL1R5cG9ncmFwaHknXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IEV4cGFuZGluZ0J1dHRvbiBmcm9tICcuLi9idXR0b24vZXhwYW5kaW5nLWJ1dHRvbidcbmltcG9ydCBEaXZpZGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRGl2aWRlcidcbmltcG9ydCBJY29uQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvSWNvbkJ1dHRvbidcbmltcG9ydCBBcnJvd0JhY2tJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQXJyb3dCYWNrJ1xuaW1wb3J0IEFycm93Rm9yd2FyZEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9BcnJvd0ZvcndhcmQnXG5pbXBvcnQgQ2hldnJvbkxlZnRJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2hldnJvbkxlZnQnXG5pbXBvcnQgTWVudUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9NZW51J1xuaW1wb3J0IFBlcnNvbkljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9QZXJzb24nXG5pbXBvcnQgU2V0dGluZ3NJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvU2V0dGluZ3MnXG5pbXBvcnQgRHJhd2VyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvRHJhd2VyJ1xuaW1wb3J0IHF1ZXJ5U3RyaW5nIGZyb20gJ3F1ZXJ5LXN0cmluZydcbmltcG9ydCB7IExpbmsgfSBmcm9tICcuLi9saW5rL2xpbmsnXG5pbXBvcnQgeyBNZW1vIH0gZnJvbSAnLi4vbWVtby9tZW1vJ1xuaW1wb3J0IEhlbHBJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvSGVscCdcbmltcG9ydCBOb3RpZmljYXRpb25zSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL05vdGlmaWNhdGlvbnMnXG5pbXBvcnQgdXNlckluc3RhbmNlIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCBub3RpZmljYXRpb25zIGZyb20gJy4uL3NpbmdsZXRvbnMvdXNlci1ub3RpZmljYXRpb25zJ1xuaW1wb3J0IFN5c3RlbVVzYWdlTW9kYWwgZnJvbSAnLi4vc3lzdGVtLXVzYWdlL3N5c3RlbS11c2FnZSdcblxuaW1wb3J0IFVzZXJWaWV3LCB7IFJvbGVEaXNwbGF5IH0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3VzZXIvdXNlcidcbmltcG9ydCBVc2VyU2V0dGluZ3MsIHtcbiAgU2V0dGluZ3NDb21wb25lbnRUeXBlLFxufSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXNlci1zZXR0aW5ncy91c2VyLXNldHRpbmdzJ1xuaW1wb3J0IHsgR2xvYmFsU3R5bGVzIH0gZnJvbSAnLi9nbG9iYWwtc3R5bGVzJ1xuaW1wb3J0IHsgUGVybWlzc2l2ZUNvbXBvbmVudFR5cGUgfSBmcm9tICcuLi8uLi90eXBlc2NyaXB0J1xuaW1wb3J0IHNjcm9sbEludG9WaWV3IGZyb20gJ3Njcm9sbC1pbnRvLXZpZXctaWYtbmVlZGVkJ1xuaW1wb3J0IHsgRWxldmF0aW9ucyB9IGZyb20gJy4uL3RoZW1lL3RoZW1lJ1xuaW1wb3J0IHtcbiAgdXNlQmFja2JvbmUsXG4gIHVzZUxpc3RlblRvLFxufSBmcm9tICcuLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7XG4gIEFzeW5jVGFza3MsXG4gIHVzZVJlbmRlck9uQXN5bmNUYXNrc0FkZE9yUmVtb3ZlLFxufSBmcm9tICcuLi8uLi9qcy9tb2RlbC9Bc3luY1Rhc2svYXN5bmMtdGFzaydcbmltcG9ydCB1c2VTbmFjayBmcm9tICcuLi9ob29rcy91c2VTbmFjaydcbmltcG9ydCBMaW5lYXJQcm9ncmVzcyBmcm9tICdAbXVpL21hdGVyaWFsL0xpbmVhclByb2dyZXNzJ1xuaW1wb3J0IHsgQmFzZVByb3BzIH0gZnJvbSAnLi4vYnV0dG9uL2V4cGFuZGluZy1idXR0b24nXG5pbXBvcnQgeyB1c2VEaWFsb2dTdGF0ZSB9IGZyb20gJy4uL2hvb2tzL3VzZURpYWxvZ1N0YXRlJ1xuaW1wb3J0IFNlc3Npb25UaW1lb3V0IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC9zZXNzaW9uLXRpbWVvdXQnXG5pbXBvcnQgeyBBamF4RXJyb3JIYW5kbGluZyB9IGZyb20gJy4vYWpheC1lcnJvci1oYW5kbGluZydcbmltcG9ydCB7IFdyZXFyU25hY2tzIH0gZnJvbSAnLi93cmVxci1zbmFja3MnXG5pbXBvcnQgc2Vzc2lvblRpbWVvdXRNb2RlbCBmcm9tICcuLi9zaW5nbGV0b25zL3Nlc3Npb24tdGltZW91dCdcbmltcG9ydCBFeHRlbnNpb25zIGZyb20gJy4uLy4uL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgeyB1c2VDb25maWd1cmF0aW9uIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9jb25maWd1cmF0aW9uLmhvb2tzJ1xuXG5leHBvcnQgY29uc3QgaGFuZGxlQmFzZTY0RW5jb2RlZEltYWdlcyA9ICh1cmw6IHN0cmluZykgPT4ge1xuICBpZiAodXJsICYmIHVybC5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgcmV0dXJuIHVybFxuICB9XG4gIHJldHVybiBgZGF0YTppbWFnZS9wbmc7YmFzZTY0LCR7dXJsfWBcbn1cbnR5cGUgRm9yTmF2QnV0dG9uVHlwZSA9IE9taXQ8QmFzZVByb3BzLCAnZXhwYW5kZWQnPiAmXG4gIFJlcXVpcmVkPFBpY2s8QmFzZVByb3BzLCAnZGF0YUlkJz4+XG5leHBvcnQgdHlwZSBSb3V0ZVNob3duSW5OYXZUeXBlID0ge1xuICByb3V0ZVByb3BzOiBSb3V0ZVByb3BzXG4gIGxpbmtQcm9wczogTGlua1Byb3BzXG4gIHNob3dJbk5hdjogdHJ1ZVxuICBuYXZCdXR0b25Qcm9wczogRm9yTmF2QnV0dG9uVHlwZVxufVxuZXhwb3J0IHR5cGUgUm91dGVOb3RTaG93bkluTmF2VHlwZSA9IHtcbiAgcm91dGVQcm9wczogUm91dGVQcm9wc1xuICBzaG93SW5OYXY6IGZhbHNlXG59XG5leHBvcnQgdHlwZSBJbmRpdmlkdWFsUm91dGVUeXBlID0gUm91dGVTaG93bkluTmF2VHlwZSB8IFJvdXRlTm90U2hvd25Jbk5hdlR5cGVcbmNvbnN0IG1hdGNoZXNSb3V0ZSA9ICh7XG4gIHJvdXRlSW5mbyxcbiAgcGF0aG5hbWUsXG59OiB7XG4gIHJvdXRlSW5mbzogSW5kaXZpZHVhbFJvdXRlVHlwZVxuICBwYXRobmFtZTogc3RyaW5nXG59KSA9PiB7XG4gIGlmIChcbiAgICByb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoICYmXG4gICAgdHlwZW9mIHJvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGggPT09ICdzdHJpbmcnXG4gICkge1xuICAgIHJldHVybiAoXG4gICAgICBwYXRobmFtZS5zdGFydHNXaXRoKGAke3JvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGh9L2ApIHx8XG4gICAgICBwYXRobmFtZS5lbmRzV2l0aChgJHtyb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRofWApXG4gICAgKVxuICB9IGVsc2UgaWYgKFxuICAgIHJvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGggJiZcbiAgICBBcnJheS5pc0FycmF5KHJvdXRlSW5mby5yb3V0ZVByb3BzLnBhdGgpXG4gICkge1xuICAgIHJldHVybiByb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoLnNvbWUoXG4gICAgICAocG9zc2libGVSb3V0ZSkgPT5cbiAgICAgICAgcGF0aG5hbWUuc3RhcnRzV2l0aChgJHtwb3NzaWJsZVJvdXRlfS9gKSB8fFxuICAgICAgICBwYXRobmFtZS5lbmRzV2l0aChgJHtwb3NzaWJsZVJvdXRlfWApXG4gICAgKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxudHlwZSBBcHBQcm9wc1R5cGUgPSB7XG4gIFJvdXRlSW5mb3JtYXRpb246IEluZGl2aWR1YWxSb3V0ZVR5cGVbXVxuICBOb3RpZmljYXRpb25zQ29tcG9uZW50OiBQZXJtaXNzaXZlQ29tcG9uZW50VHlwZVxuICBTZXR0aW5nc0NvbXBvbmVudHM6IFNldHRpbmdzQ29tcG9uZW50VHlwZVxufVxuZnVuY3Rpb24gc2lkZWJhckRhdGFJZFRhZyhuYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGBzaWRlYmFyLSR7bmFtZX0tYnV0dG9uYFxufVxuLyoqXG4gKiBJZiB5b3UncmUgbm90IHVzaW5nIGEgY3VzdG9tIGxvYWRpbmcgc2NyZWVuLFxuICogdGhpcyBoYW5kbGVzIHJlbW92aW5nIHRoZSBkZWZhdWx0IG9uZSBmb3IgeW91IG9uIGZpcnN0IHJlbmRlclxuICogb2YgdGhlIGFwcC5cbiAqL1xuZXhwb3J0IGNvbnN0IHVzZURlZmF1bHRXZWxjb21lID0gKCkgPT4ge1xuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGxvYWRpbmdFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvYWRpbmcnKVxuICAgIGlmIChsb2FkaW5nRWxlbWVudCkge1xuICAgICAgbG9hZGluZ0VsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtb3BlbicpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbG9hZGluZ0VsZW1lbnQucmVtb3ZlKClcbiAgICAgIH0sIDUwMClcbiAgICB9XG4gIH0sIFtdKVxufVxuY29uc3Qgc2Nyb2xsQ3VycmVudFJvdXRlSW50b1ZpZXcgPSAoKSA9PiB7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRyb3V0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLWN1cnJlbnRyb3V0ZV0nKVxuICAgIGlmIChjdXJyZW50cm91dGUpIHtcbiAgICAgIHNjcm9sbEludG9WaWV3KGN1cnJlbnRyb3V0ZSwge1xuICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gICAgICAgIHNjcm9sbE1vZGU6ICdpZi1uZWVkZWQnLFxuICAgICAgfSlcbiAgICB9XG4gIH0sIDApXG59XG5jb25zdCBBc3luY1Rhc2tzQ29tcG9uZW50ID0gKCkgPT4ge1xuICBjb25zdCBbc2hvd0Jhciwgc2V0U2hvd0Jhcl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgdXNlUmVuZGVyT25Bc3luY1Rhc2tzQWRkT3JSZW1vdmUoKVxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgY29uc3QgaGlzdG9yeSA9IHVzZUhpc3RvcnkoKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCB0aW1lb3V0aWQgPSB1bmRlZmluZWQgYXMgbnVtYmVyIHwgdW5kZWZpbmVkXG4gICAgdGltZW91dGlkID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2V0U2hvd0JhcihmYWxzZSlcbiAgICB9LCAxMDAwKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dGlkKVxuICAgIH1cbiAgfSwgW3Nob3dCYXJdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCB0aW1lb3V0aWQgPSB1bmRlZmluZWQgYXMgbnVtYmVyIHwgdW5kZWZpbmVkXG4gICAgaWYgKEFzeW5jVGFza3MuaGFzU2hvd2FibGVUYXNrcygpKSB7XG4gICAgICBzZXRTaG93QmFyKHRydWUpXG4gICAgICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIHNldFNob3dCYXIodHJ1ZSlcbiAgICAgICAgcmV0dXJuIGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gbGVhdmU/ICR7QXN5bmNUYXNrcy5saXN0Lmxlbmd0aH0gdGFza3MgYXJlIHN0aWxsIHJ1bm5pbmcuYFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTaG93QmFyKGZhbHNlKVxuICAgIH1cbiAgICB0aW1lb3V0aWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBzZXRTaG93QmFyKGZhbHNlKVxuICAgIH0sIDEwMDApXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0aWQpXG4gICAgICB3aW5kb3cub25iZWZvcmV1bmxvYWQgPSBudWxsXG4gICAgfVxuICB9LCBbQXN5bmNUYXNrcy5saXN0Lmxlbmd0aF0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgdW5zdWJzID0gQXN5bmNUYXNrcy5saXN0Lm1hcCgodGFzaykgPT4ge1xuICAgICAgcmV0dXJuIHRhc2suc3Vic2NyaWJlVG8oe1xuICAgICAgICBzdWJzY3JpYmFibGVUaGluZzogJ3VwZGF0ZScsXG4gICAgICAgIGNhbGxiYWNrOiAoKSA9PiB7XG4gICAgICAgICAgQXN5bmNUYXNrcy5yZW1vdmUodGFzaylcbiAgICAgICAgICBpZiAoQXN5bmNUYXNrcy5pc1Jlc3RvcmVUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICBhZGRTbmFjayhcbiAgICAgICAgICAgICAgYFJlc3RvcmUgb2YgJHt0YXNrLmxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX0gY29tcGxldGUuYCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IDUwMDAsXG4gICAgICAgICAgICAgICAgY2xvc2VhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGFsZXJ0UHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgIGFjdGlvbjogKFxuICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50PXtMaW5rfVxuICAgICAgICAgICAgICAgICAgICAgIHRvPXtgL3NlYXJjaC8ke3Rhc2subGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzWydtZXRhY2FyZC5kZWxldGVkLmlkJ119YH1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIEdvIHRvXG4gICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzRGVsZXRlVGFzayh0YXNrKSkge1xuICAgICAgICAgICAgYWRkU25hY2soXG4gICAgICAgICAgICAgIGBEZWxldGUgb2YgJHt0YXNrLmxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX0gY29tcGxldGUuYCxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHVuZG86ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGhpc3RvcnkucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGhuYW1lOiBgL3NlYXJjaC8ke3Rhc2subGF6eVJlc3VsdC5wbGFpbi5pZH1gLFxuICAgICAgICAgICAgICAgICAgICBzZWFyY2g6ICcnLFxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIEFzeW5jVGFza3MucmVzdG9yZSh7IGxhenlSZXN1bHQ6IHRhc2subGF6eVJlc3VsdCB9KVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNDcmVhdGVTZWFyY2hUYXNrKHRhc2spKSB7XG4gICAgICAgICAgICBhZGRTbmFjayhgQ3JlYXRpb24gb2YgJHt0YXNrLmRhdGEudGl0bGV9IGNvbXBsZXRlLmApXG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICB1bnN1YnMuZm9yRWFjaCgodW5zdWIpID0+IHtcbiAgICAgICAgdW5zdWIoKVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG4gIGlmIChBc3luY1Rhc2tzLmxpc3QubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17YCR7XG4gICAgICAgICAgc2hvd0JhciA/ICd0cmFuc2xhdGUteS0wJyA6ICd0cmFuc2xhdGUteS1mdWxsJ1xuICAgICAgICB9IGFic29sdXRlIGxlZnQtMCBib3R0b20tMCB3LWZ1bGwgYmctYmxhY2sgYmctb3BhY2l0eS03NSBoLTE2IHotNTAgdHJhbnNpdGlvbiB0cmFuc2Zvcm0gZWFzZS1pbi1vdXQgZHVyYXRpb24tNTAwIGhvdmVyOnRyYW5zbGF0ZS15LTBgfVxuICAgICAgPlxuICAgICAgICA8TGluZWFyUHJvZ3Jlc3NcbiAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgYWJzb2x1dGUgaC0yIGxlZnQtMCB0b3AtMCAtbXQtMlwiXG4gICAgICAgICAgdmFyaWFudD1cImluZGV0ZXJtaW5hdGVcIlxuICAgICAgICAvPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgb3ZlcmZsb3ctYXV0byBoLWZ1bGwgdy1mdWxsIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LXdoaXRlXCI+XG4gICAgICAgICAge0FzeW5jVGFza3MubGlzdC5tYXAoKGFzeW5jVGFzaykgPT4ge1xuICAgICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNSZXN0b3JlVGFzayhhc3luY1Rhc2spKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ibGFjayBwLTJcIj5cbiAgICAgICAgICAgICAgICAgIFJlc3RvcmluZyAnXG4gICAgICAgICAgICAgICAgICB7YXN5bmNUYXNrLmxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX0nXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzRGVsZXRlVGFzayhhc3luY1Rhc2spKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ibGFjayBwLTJcIj5cbiAgICAgICAgICAgICAgICAgIERlbGV0aW5nICdcbiAgICAgICAgICAgICAgICAgIHthc3luY1Rhc2subGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlfSdcbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKEFzeW5jVGFza3MuaXNDcmVhdGVTZWFyY2hUYXNrKGFzeW5jVGFzaykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWJsYWNrIHAtMlwiPlxuICAgICAgICAgICAgICAgICAgQ3JlYXRpbmcgJ3thc3luY1Rhc2suZGF0YS50aXRsZX0nXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzU2F2ZVNlYXJjaFRhc2soYXN5bmNUYXNrKSkge1xuICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctYmxhY2sgcC0yXCI+XG4gICAgICAgICAgICAgICAgICBTYXZpbmcgJ3thc3luY1Rhc2suZGF0YS50aXRsZX0nXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChBc3luY1Rhc2tzLmlzQ3JlYXRlVGFzayhhc3luY1Rhc2spKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy1ibGFjayBwLTJcIj5cbiAgICAgICAgICAgICAgICAgIENyZWF0aW5nICd7YXN5bmNUYXNrLmRhdGEudGl0bGV9J1xuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoQXN5bmNUYXNrcy5pc1NhdmVUYXNrKGFzeW5jVGFzaykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWJsYWNrIHAtMlwiPlxuICAgICAgICAgICAgICAgICAgU2F2aW5nICd7YXN5bmNUYXNrLmRhdGEudGl0bGV9J1xuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuICByZXR1cm4gbnVsbFxufVxuLyoqIFRoZSBzb25nIGFuZCBkYW5jZSBhcm91bmQgJ2EnIHZzIExpbmsgaGFzIHRvIGRvIHdpdGggcmVhY3Qgcm91dGVyIG5vdCBzdXBwb3J0aW5nIHRoZXNlIG91dHNpZGUgbGlua3MgKi9cbmNvbnN0IEhlbHBCdXR0b24gPSAoKSA9PiB7XG4gIGNvbnN0IHsgZ2V0SGVscFVybCB9ID0gdXNlQ29uZmlndXJhdGlvbigpXG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCBxdWVyeVBhcmFtcyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaClcbiAgY29uc3QgeyBuYXZPcGVuIH0gPSB1c2VOYXZDb250ZXh0UHJvdmlkZXIoKVxuICByZXR1cm4gKFxuICAgIDxFeHBhbmRpbmdCdXR0b25cbiAgICAgIGNvbXBvbmVudD17Z2V0SGVscFVybCgpID8gJ2EnIDogKExpbmsgYXMgdW5rbm93biBhcyBhbnkpfVxuICAgICAgaHJlZj17Z2V0SGVscFVybCgpfVxuICAgICAgdG89e1xuICAgICAgICBnZXRIZWxwVXJsKClcbiAgICAgICAgICA/IGdldEhlbHBVcmwoKVxuICAgICAgICAgIDoge1xuICAgICAgICAgICAgICBwYXRobmFtZTogYCR7bG9jYXRpb24ucGF0aG5hbWV9YCxcbiAgICAgICAgICAgICAgc2VhcmNoOiBgJHtxdWVyeVN0cmluZy5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIC4uLnF1ZXJ5UGFyYW1zLFxuICAgICAgICAgICAgICAgICdnbG9iYWwtaGVscCc6ICdIZWxwJyxcbiAgICAgICAgICAgICAgfSl9YCxcbiAgICAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRhcmdldD17Z2V0SGVscFVybCgpID8gJ19ibGFuaycgOiB1bmRlZmluZWR9XG4gICAgICBjbGFzc05hbWU9e2Bncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCBvcGFjaXR5LTI1ICBob3ZlcjpvcGFjaXR5LTEwMCBmb2N1cy12aXNpYmxlOm9wYWNpdHktMTAwIHRyYW5zaXRpb24tb3BhY2l0eWB9XG4gICAgICBJY29uPXtIZWxwSWNvbn1cbiAgICAgIGV4cGFuZGVkTGFiZWw9XCJIZWxwXCJcbiAgICAgIHVuZXhwYW5kZWRMYWJlbD1cIlwiXG4gICAgICBkYXRhSWQ9e3NpZGViYXJEYXRhSWRUYWcoJ2hlbHAnKX1cbiAgICAgIGV4cGFuZGVkPXtuYXZPcGVufVxuICAgICAgZm9jdXNWaXNpYmxlQ2xhc3NOYW1lPVwiZm9jdXMtdmlzaWJsZVwiXG4gICAgLz5cbiAgKVxufVxuXG5mdW5jdGlvbiBEcmF3ZXJXcmFwcGVyQ29tcG9uZW50KHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3QuUmVhY3ROb2RlIH0pIHtcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIGZsZXggZmxleC1jb2wgZmxleC1ub3dyYXAgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgIHtFeHRlbnNpb25zLmluY2x1ZGVOYXZpZ2F0aW9uQnV0dG9ucyA/IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBzaHJpbmstMCBncm93LTAgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICA8U2lkZUJhck5hdmlnYXRpb25CdXR0b25zIHNob3dUZXh0IC8+XG4gICAgICAgICAgICA8RGl2aWRlciAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIGdyb3cgc2hyaW5rIG92ZXJmbG93LWF1dG9cIj5cbiAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC8+XG4gIClcbn1cblxuY29uc3QgU2V0dGluZ3NCdXR0b24gPSAoKSA9PiB7XG4gIGNvbnN0IHsgU2V0dGluZ3NDb21wb25lbnRzIH0gPSB1c2VUb3BMZXZlbEFwcENvbnRleHQoKVxuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKClcbiAgY29uc3QgaGlzdG9yeSA9IHVzZUhpc3RvcnkoKVxuICBjb25zdCBxdWVyeVBhcmFtcyA9IHF1ZXJ5U3RyaW5nLnBhcnNlKGxvY2F0aW9uLnNlYXJjaClcbiAgY29uc3Qgb3BlbiA9IEJvb2xlYW4ocXVlcnlQYXJhbXNbJ2dsb2JhbC1zZXR0aW5ncyddKVxuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxFeHBhbmRpbmdCdXR0b25cbiAgICAgICAgY29tcG9uZW50PXtMaW5rIGFzIGFueX1cbiAgICAgICAgdG89e3tcbiAgICAgICAgICBwYXRobmFtZTogYCR7bG9jYXRpb24ucGF0aG5hbWV9YCxcbiAgICAgICAgICBzZWFyY2g6IGAke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAuLi5xdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICdnbG9iYWwtc2V0dGluZ3MnOiAnU2V0dGluZ3MnLFxuICAgICAgICAgIH0pfWAsXG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT17YGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwIG9wYWNpdHktMjUgcmVsYXRpdmUgaG92ZXI6b3BhY2l0eS0xMDAgZm9jdXMtdmlzaWJsZTpvcGFjaXR5LTEwMCB0cmFuc2l0aW9uLW9wYWNpdHlgfVxuICAgICAgICBJY29uPXtTZXR0aW5nc0ljb259XG4gICAgICAgIGV4cGFuZGVkTGFiZWw9XCJTZXR0aW5nc1wiXG4gICAgICAgIHVuZXhwYW5kZWRMYWJlbD1cIlwiXG4gICAgICAgIGRhdGFJZD17c2lkZWJhckRhdGFJZFRhZygnc2V0dGluZ3MnKX1cbiAgICAgICAgZXhwYW5kZWQ9e25hdk9wZW59XG4gICAgICAgIGZvY3VzVmlzaWJsZUNsYXNzTmFtZT1cImZvY3VzLXZpc2libGVcIlxuICAgICAgLz5cbiAgICAgIDxEcmF3ZXJcbiAgICAgICAgYW5jaG9yPVwibGVmdFwiXG4gICAgICAgIG9wZW49e29wZW59XG4gICAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgICBkZWxldGUgcXVlcnlQYXJhbXNbJ2dsb2JhbC1zZXR0aW5ncyddXG4gICAgICAgICAgaGlzdG9yeS5wdXNoKFxuICAgICAgICAgICAgYCR7bG9jYXRpb24ucGF0aG5hbWV9PyR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHF1ZXJ5UGFyYW1zKX1gXG4gICAgICAgICAgKVxuICAgICAgICB9fVxuICAgICAgICBQYXBlclByb3BzPXt7XG4gICAgICAgICAgY2xhc3NOYW1lOiAnbWluLXctMTIwIG1heC13LTQvNSAnLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8RHJhd2VyV3JhcHBlckNvbXBvbmVudD5cbiAgICAgICAgICA8VXNlclNldHRpbmdzIFNldHRpbmdzQ29tcG9uZW50cz17U2V0dGluZ3NDb21wb25lbnRzfSAvPlxuICAgICAgICA8L0RyYXdlcldyYXBwZXJDb21wb25lbnQ+XG4gICAgICA8L0RyYXdlcj5cbiAgICA8Lz5cbiAgKVxufVxuY29uc3QgTm90aWZpY2F0aW9uc0J1dHRvbiA9ICgpID0+IHtcbiAgY29uc3QgaGFzVW5zZWVuTm90aWZpY2F0aW9ucyA9IHVzZUluZGljYXRlSGFzVW5zZWVuTm90aWZpY2F0aW9ucygpXG4gIGNvbnN0IHsgTm90aWZpY2F0aW9uc0NvbXBvbmVudCB9ID0gdXNlVG9wTGV2ZWxBcHBDb250ZXh0KClcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpXG4gIGNvbnN0IGhpc3RvcnkgPSB1c2VIaXN0b3J5KClcbiAgY29uc3QgcXVlcnlQYXJhbXMgPSBxdWVyeVN0cmluZy5wYXJzZShsb2NhdGlvbi5zZWFyY2gpXG4gIGNvbnN0IG9wZW4gPSBCb29sZWFuKHF1ZXJ5UGFyYW1zWydnbG9iYWwtbm90aWZpY2F0aW9ucyddKVxuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtcbiAgICAgICAgICBoYXNVbnNlZW5Ob3RpZmljYXRpb25zID8gJ2FuaW1hdGUtd2lnZ2xlIE11aS10ZXh0LXdhcm5pbmcnIDogJydcbiAgICAgICAgfVxuICAgICAgPlxuICAgICAgICA8RXhwYW5kaW5nQnV0dG9uXG4gICAgICAgICAgY29tcG9uZW50PXtMaW5rIGFzIGFueX1cbiAgICAgICAgICB0bz17e1xuICAgICAgICAgICAgcGF0aG5hbWU6IGAke2xvY2F0aW9uLnBhdGhuYW1lfWAsXG4gICAgICAgICAgICBzZWFyY2g6IGAke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIC4uLnF1ZXJ5UGFyYW1zLFxuICAgICAgICAgICAgICAnZ2xvYmFsLW5vdGlmaWNhdGlvbnMnOiAnTm90aWZpY2F0aW9ucycsXG4gICAgICAgICAgICB9KX1gLFxuICAgICAgICAgIH19XG4gICAgICAgICAgY2xhc3NOYW1lPXtgJHtcbiAgICAgICAgICAgICFoYXNVbnNlZW5Ob3RpZmljYXRpb25zID8gJ29wYWNpdHktMjUnIDogJydcbiAgICAgICAgICB9IGdyb3VwLWhvdmVyOm9wYWNpdHktMTAwICByZWxhdGl2ZSBob3ZlcjpvcGFjaXR5LTEwMCBmb2N1cy12aXNpYmxlOm9wYWNpdHktMTAwIHRyYW5zaXRpb24tb3BhY2l0eWB9XG4gICAgICAgICAgSWNvbj17Tm90aWZpY2F0aW9uc0ljb259XG4gICAgICAgICAgZXhwYW5kZWRMYWJlbD1cIk5vdGlmaWNhdGlvbnNcIlxuICAgICAgICAgIHVuZXhwYW5kZWRMYWJlbD1cIlwiXG4gICAgICAgICAgZGF0YUlkPXtzaWRlYmFyRGF0YUlkVGFnKCdub3RpZmljYXRpb25zJyl9XG4gICAgICAgICAgZXhwYW5kZWQ9e25hdk9wZW59XG4gICAgICAgICAgZm9jdXNWaXNpYmxlQ2xhc3NOYW1lPVwiZm9jdXMtdmlzaWJsZVwiXG4gICAgICAgICAgb3JpZW50YXRpb249XCJ2ZXJ0aWNhbFwiXG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxEcmF3ZXJcbiAgICAgICAgYW5jaG9yPVwibGVmdFwiXG4gICAgICAgIG9wZW49e29wZW59XG4gICAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgICBkZWxldGUgcXVlcnlQYXJhbXNbJ2dsb2JhbC1ub3RpZmljYXRpb25zJ11cbiAgICAgICAgICBoaXN0b3J5LnB1c2goXG4gICAgICAgICAgICBgJHtsb2NhdGlvbi5wYXRobmFtZX0/JHtxdWVyeVN0cmluZy5zdHJpbmdpZnkocXVlcnlQYXJhbXMpfWBcbiAgICAgICAgICApXG4gICAgICAgICAgbm90aWZpY2F0aW9ucy5zZXRTZWVuKClcbiAgICAgICAgICB1c2VySW5zdGFuY2Uuc2F2ZVByZWZlcmVuY2VzKClcbiAgICAgICAgfX1cbiAgICAgICAgUGFwZXJQcm9wcz17e1xuICAgICAgICAgIGNsYXNzTmFtZTogJ21pbi13LTEyMCBtYXgtdy00LzUgJyxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPERyYXdlcldyYXBwZXJDb21wb25lbnQ+XG4gICAgICAgICAgPE5vdGlmaWNhdGlvbnNDb21wb25lbnQgLz5cbiAgICAgICAgPC9EcmF3ZXJXcmFwcGVyQ29tcG9uZW50PlxuICAgICAgPC9EcmF3ZXI+XG4gICAgPC8+XG4gIClcbn1cbmNvbnN0IFVzZXJCdXR0b24gPSAoKSA9PiB7XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCBoaXN0b3J5ID0gdXNlSGlzdG9yeSgpXG4gIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcXVlcnlTdHJpbmcucGFyc2UobG9jYXRpb24uc2VhcmNoKVxuICBjb25zdCBvcGVuID0gQm9vbGVhbihxdWVyeVBhcmFtc1snZ2xvYmFsLXVzZXInXSlcbiAgY29uc3QgeyBuYXZPcGVuIH0gPSB1c2VOYXZDb250ZXh0UHJvdmlkZXIoKVxuXG4gIGNvbnN0IGdldExhYmVsID0gKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCB0cnVuY2F0ZVwiPnt1c2VySW5zdGFuY2UuZ2V0VXNlck5hbWUoKX08L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRydW5jYXRlIHctZnVsbFwiPlxuICAgICAgICAgIDxSb2xlRGlzcGxheSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxFeHBhbmRpbmdCdXR0b25cbiAgICAgICAgY29tcG9uZW50PXtMaW5rIGFzIGFueX1cbiAgICAgICAgdG89e3tcbiAgICAgICAgICBwYXRobmFtZTogYCR7bG9jYXRpb24ucGF0aG5hbWV9YCxcbiAgICAgICAgICBzZWFyY2g6IGAke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAuLi5xdWVyeVBhcmFtcyxcbiAgICAgICAgICAgICdnbG9iYWwtdXNlcic6ICdVc2VyJyxcbiAgICAgICAgICB9KX1gLFxuICAgICAgICB9fVxuICAgICAgICBjbGFzc05hbWU9e2Bncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCBvcGFjaXR5LTI1IHJlbGF0aXZlIGhvdmVyOm9wYWNpdHktMTAwIGZvY3VzLXZpc2libGU6b3BhY2l0eS0xMDAgdHJhbnNpdGlvbi1vcGFjaXR5YH1cbiAgICAgICAgSWNvbj17UGVyc29uSWNvbn1cbiAgICAgICAgZXhwYW5kZWRMYWJlbD17Z2V0TGFiZWwoKX1cbiAgICAgICAgdW5leHBhbmRlZExhYmVsPXtnZXRMYWJlbCgpfVxuICAgICAgICBkYXRhSWQ9e3NpZGViYXJEYXRhSWRUYWcoJ3VzZXItcHJvZmlsZScpfVxuICAgICAgICBleHBhbmRlZD17bmF2T3Blbn1cbiAgICAgICAgZm9jdXNWaXNpYmxlQ2xhc3NOYW1lPVwiZm9jdXMtdmlzaWJsZVwiXG4gICAgICAvPlxuICAgICAgPERyYXdlclxuICAgICAgICBhbmNob3I9XCJsZWZ0XCJcbiAgICAgICAgb3Blbj17b3Blbn1cbiAgICAgICAgb25DbG9zZT17KCkgPT4ge1xuICAgICAgICAgIGRlbGV0ZSBxdWVyeVBhcmFtc1snZ2xvYmFsLXVzZXInXVxuICAgICAgICAgIGhpc3RvcnkucHVzaChcbiAgICAgICAgICAgIGAke2xvY2F0aW9uLnBhdGhuYW1lfT8ke3F1ZXJ5U3RyaW5nLnN0cmluZ2lmeShxdWVyeVBhcmFtcyl9YFxuICAgICAgICAgIClcbiAgICAgICAgfX1cbiAgICAgICAgUGFwZXJQcm9wcz17e1xuICAgICAgICAgIGNsYXNzTmFtZTogJ21pbi13LTEyMCBtYXgtdy00LzUgJyxcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgPERyYXdlcldyYXBwZXJDb21wb25lbnQ+XG4gICAgICAgICAgPFVzZXJWaWV3IC8+XG4gICAgICAgIDwvRHJhd2VyV3JhcHBlckNvbXBvbmVudD5cbiAgICAgIDwvRHJhd2VyPlxuICAgIDwvPlxuICApXG59XG5jb25zdCBSb3V0ZUJ1dHRvbiA9ICh7IHJvdXRlSW5mbyB9OiB7IHJvdXRlSW5mbzogUm91dGVTaG93bkluTmF2VHlwZSB9KSA9PiB7XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG4gIGNvbnN0IGlzU2VsZWN0ZWQgPSBtYXRjaGVzUm91dGUoe1xuICAgIHJvdXRlSW5mbyxcbiAgICBwYXRobmFtZTogbG9jYXRpb24ucGF0aG5hbWUsXG4gIH0pXG4gIHJldHVybiAoXG4gICAgPEV4cGFuZGluZ0J1dHRvblxuICAgICAga2V5PXtyb3V0ZUluZm8ubGlua1Byb3BzLnRvLnRvU3RyaW5nKCl9XG4gICAgICBjb21wb25lbnQ9e0xpbmsgYXMgYW55fVxuICAgICAgdG89e3JvdXRlSW5mby5saW5rUHJvcHMudG99XG4gICAgICBjbGFzc05hbWU9e2Bncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCAke1xuICAgICAgICAhaXNTZWxlY3RlZCA/ICdvcGFjaXR5LTI1JyA6ICcnXG4gICAgICB9IGZvY3VzLXZpc2libGU6b3BhY2l0eS0xMDAgaG92ZXI6b3BhY2l0eS0xMDAgdHJhbnNpdGlvbi1vcGFjaXR5YH1cbiAgICAgIGV4cGFuZGVkPXtuYXZPcGVufVxuICAgICAgey4uLnJvdXRlSW5mby5uYXZCdXR0b25Qcm9wc31cbiAgICAgIGZvY3VzVmlzaWJsZUNsYXNzTmFtZT1cImZvY3VzLXZpc2libGVcIlxuICAgICAgZGF0YUlkPXtzaWRlYmFyRGF0YUlkVGFnKHJvdXRlSW5mby5uYXZCdXR0b25Qcm9wcy5kYXRhSWQpfVxuICAgICAgey4uLihpc1NlbGVjdGVkXG4gICAgICAgID8ge1xuICAgICAgICAgICAgWydkYXRhLWN1cnJlbnRyb3V0ZSddOiB0cnVlLFxuICAgICAgICAgIH1cbiAgICAgICAgOiB7fSl9XG4gICAgLz5cbiAgKVxufVxuY29uc3QgU2lkZUJhclJvdXRlcyA9ICgpID0+IHtcbiAgY29uc3QgeyBSb3V0ZUluZm9ybWF0aW9uIH0gPSB1c2VUb3BMZXZlbEFwcENvbnRleHQoKVxuICByZXR1cm4gKFxuICAgIDxHcmlkXG4gICAgICBpdGVtXG4gICAgICBjbGFzc05hbWU9XCJvdmVyZmxvdy1hdXRvIHAtMCBzaHJpbmstMCBzY3JvbGxiYXJzLW1pblwiXG4gICAgICBzdHlsZT17e1xuICAgICAgICBtYXhIZWlnaHQ6IGBjYWxjKDEwMCUgLSAkezcgKiA0fXJlbSlgLCAvL1xuICAgICAgfX1cbiAgICA+XG4gICAgICB7Um91dGVJbmZvcm1hdGlvbi5maWx0ZXIoKHJvdXRlSW5mbykgPT4gcm91dGVJbmZvLnNob3dJbk5hdikubWFwKFxuICAgICAgICAocm91dGVJbmZvOiBSb3V0ZVNob3duSW5OYXZUeXBlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSb3V0ZUJ1dHRvblxuICAgICAgICAgICAgICByb3V0ZUluZm89e3JvdXRlSW5mb31cbiAgICAgICAgICAgICAga2V5PXtyb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoPy50b1N0cmluZygpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICl9XG4gICAgICB7PEV4dGVuc2lvbnMuZXh0cmFSb3V0ZXMgLz59XG4gICAgPC9HcmlkPlxuICApXG59XG5jb25zdCBTaWRlQmFyTmF2aWdhdGlvbkJ1dHRvbnMgPSAoe1xuICBzaG93VGV4dCA9IGZhbHNlLFxufTogeyBzaG93VGV4dD86IGJvb2xlYW4gfSA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgbmF2T3BlbiB9ID0gdXNlTmF2Q29udGV4dFByb3ZpZGVyKClcbiAgY29uc3Qgc2hvd0V4cGFuZGVkVGV4dCA9IG5hdk9wZW4gfHwgc2hvd1RleHRcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgcC0yIHNocmluay0wXCI+XG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICA+XG4gICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJtci1hdXRvXCI+XG4gICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9eygpID0+IGhpc3RvcnkuYmFjaygpfT5cbiAgICAgICAgICAgICAgPEFycm93QmFja0ljb24gZm9udFNpemU9XCJzbWFsbFwiIC8+XG4gICAgICAgICAgICAgIHtzaG93RXhwYW5kZWRUZXh0ICYmICdCYWNrJ31cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cIm1sLWF1dG9cIj5cbiAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17KCkgPT4gaGlzdG9yeS5mb3J3YXJkKCl9PlxuICAgICAgICAgICAgICB7c2hvd0V4cGFuZGVkVGV4dCAmJiAnRm9yd2FyZCd9XG4gICAgICAgICAgICAgIDxBcnJvd0ZvcndhcmRJY29uIGZvbnRTaXplPVwic21hbGxcIiAvPlxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0dyaWQ+XG4gICAgPC8+XG4gIClcbn1cblxuY29uc3QgU2lkZUJhclRvZ2dsZUJ1dHRvbiA9ICgpID0+IHtcbiAgY29uc3QgeyBuYXZPcGVuLCBzZXROYXZPcGVuIH0gPSB1c2VOYXZDb250ZXh0UHJvdmlkZXIoKVxuICBjb25zdCB7IGdldFRvcExlZnRMb2dvU3JjLCBnZXRDdXN0b21CcmFuZGluZywgZ2V0UHJvZHVjdCwgZ2V0TWVudUljb25TcmMgfSA9XG4gICAgdXNlQ29uZmlndXJhdGlvbigpXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwidy1mdWxsIGgtMTYgc2hyaW5rLTBcIj5cbiAgICAgICAge25hdk9wZW4gPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxHcmlkXG4gICAgICAgICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJwbC0zIHB5LTEgcHItMSB3LWZ1bGwgcmVsYXRpdmUgaC1mdWxsXCI+XG4gICAgICAgICAgICAgICAge2dldFRvcExlZnRMb2dvU3JjKCkgPyAoXG4gICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1heC1oLWZ1bGwgbWF4LXctZnVsbCBhYnNvbHV0ZSBsZWZ0LTEvMiB0cmFuc2Zvcm0gLXRyYW5zbGF0ZS14LTEvMiAtdHJhbnNsYXRlLXktMS8yIHRvcC0xLzIgcC00XCJcbiAgICAgICAgICAgICAgICAgICAgc3JjPXtoYW5kbGVCYXNlNjRFbmNvZGVkSW1hZ2VzKGdldFRvcExlZnRMb2dvU3JjKCkpfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPEdyaWRcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInBsLTNcIlxuICAgICAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudD1cImNlbnRlclwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+e2dldEN1c3RvbUJyYW5kaW5nKCl9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+e2dldFByb2R1Y3QoKX08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwibWwtYXV0b1wiPlxuICAgICAgICAgICAgICAgIDxJY29uQnV0dG9uXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJoLWF1dG9cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXROYXZPcGVuKGZhbHNlKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgIHNpemU9XCJsYXJnZVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPENoZXZyb25MZWZ0SWNvbiAvPlxuICAgICAgICAgICAgICAgIDwvSWNvbkJ1dHRvbj5cbiAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNvbG9yPVwiaW5oZXJpdFwiXG4gICAgICAgICAgICBhcmlhLWxhYmVsPVwib3BlbiBkcmF3ZXJcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZXROYXZPcGVuKHRydWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBwLTJcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtnZXRNZW51SWNvblNyYygpID8gKFxuICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgIHNyYz17aGFuZGxlQmFzZTY0RW5jb2RlZEltYWdlcyhnZXRNZW51SWNvblNyYygpKX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1heC1oLTE2IG1heC13LWZ1bGxcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPE1lbnVJY29uIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICApfVxuICAgICAgPC9HcmlkPlxuICAgIDwvPlxuICApXG59XG5jb25zdCBTaWRlQmFyID0gKCkgPT4ge1xuICBjb25zdCB7IG5hdk9wZW4gfSA9IHVzZU5hdkNvbnRleHRQcm92aWRlcigpXG4gIHJldHVybiAoXG4gICAgPEdyaWRcbiAgICAgIGl0ZW1cbiAgICAgIGNsYXNzTmFtZT17YCR7XG4gICAgICAgIG5hdk9wZW4gPyAndy02NCcgOiAndy0yMCdcbiAgICAgIH0gdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwIGVhc2UtaW4tb3V0IHJlbGF0aXZlIHotMTAgbXItMiBzaHJpbmstMCBwYi0yIHB0LTIgcGwtMiBncm91cGB9XG4gICAgICBvbk1vdXNlTGVhdmU9eygpID0+IHtcbiAgICAgICAgc2Nyb2xsQ3VycmVudFJvdXRlSW50b1ZpZXcoKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLm5hdmJhcn0gY2xhc3NOYW1lPVwiaC1mdWxsXCI+XG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgZGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJoLWZ1bGwgdy1mdWxsXCJcbiAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgPlxuICAgICAgICAgIHtFeHRlbnNpb25zLmluY2x1ZGVOYXZpZ2F0aW9uQnV0dG9ucyAmJiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8U2lkZUJhck5hdmlnYXRpb25CdXR0b25zIC8+XG4gICAgICAgICAgICAgIDxEaXZpZGVyIC8+XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuICAgICAgICAgIDxTaWRlQmFyVG9nZ2xlQnV0dG9uIC8+XG4gICAgICAgICAgPERpdmlkZXIgLz5cbiAgICAgICAgICA8U2lkZUJhclJvdXRlcyAvPlxuICAgICAgICAgIDxEaXZpZGVyIC8+XG4gICAgICAgICAgPFNpZGVCYXJCYWNrZ3JvdW5kIC8+XG4gICAgICAgICAgPERpdmlkZXIgLz5cbiAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cIm10LWF1dG8gb3ZlcmZsb3ctaGlkZGVuIHctZnVsbCBzaHJpbmstMCBncm93LTBcIj5cbiAgICAgICAgICAgIHtFeHRlbnNpb25zLmV4dHJhU2lkZWJhckJ1dHRvbnMgJiYgKFxuICAgICAgICAgICAgICA8RXh0ZW5zaW9ucy5leHRyYVNpZGViYXJCdXR0b25zIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPEhlbHBCdXR0b24gLz5cbiAgICAgICAgICAgIDxTZXR0aW5nc0J1dHRvbiAvPlxuICAgICAgICAgICAgPE5vdGlmaWNhdGlvbnNCdXR0b24gLz5cbiAgICAgICAgICAgIDxVc2VyQnV0dG9uIC8+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L1BhcGVyPlxuICAgIDwvR3JpZD5cbiAgKVxufVxuY29uc3QgSGVhZGVyID0gKCkgPT4ge1xuICBjb25zdCB7IGdldFBsYXRmb3JtQmFja2dyb3VuZCwgZ2V0UGxhdGZvcm1Db2xvciwgZ2V0UGxhdGZvcm1IZWFkZXIgfSA9XG4gICAgdXNlQ29uZmlndXJhdGlvbigpXG4gIHJldHVybiAoXG4gICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGxcIj5cbiAgICAgIHtnZXRQbGF0Zm9ybUhlYWRlcigpID8gKFxuICAgICAgICA8VHlwb2dyYXBoeVxuICAgICAgICAgIGFsaWduPVwiY2VudGVyXCJcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgYmFja2dyb3VuZDogZ2V0UGxhdGZvcm1CYWNrZ3JvdW5kKCksXG4gICAgICAgICAgICBjb2xvcjogZ2V0UGxhdGZvcm1Db2xvcigpLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7Z2V0UGxhdGZvcm1IZWFkZXIoKX1cbiAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgKSA6IG51bGx9XG4gICAgPC9HcmlkPlxuICApXG59XG5jb25zdCBGb290ZXIgPSAoKSA9PiB7XG4gIGNvbnN0IHsgZ2V0UGxhdGZvcm1CYWNrZ3JvdW5kLCBnZXRQbGF0Zm9ybUNvbG9yLCBnZXRQbGF0Zm9ybUZvb3RlciB9ID1cbiAgICB1c2VDb25maWd1cmF0aW9uKClcbiAgcmV0dXJuIChcbiAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInctZnVsbFwiPlxuICAgICAge2dldFBsYXRmb3JtRm9vdGVyKCkgPyAoXG4gICAgICAgIDxUeXBvZ3JhcGh5XG4gICAgICAgICAgYWxpZ249XCJjZW50ZXJcIlxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiBnZXRQbGF0Zm9ybUJhY2tncm91bmQoKSxcbiAgICAgICAgICAgIGNvbG9yOiBnZXRQbGF0Zm9ybUNvbG9yKCksXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtnZXRQbGF0Zm9ybUZvb3RlcigpfVxuICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICApIDogbnVsbH1cbiAgICA8L0dyaWQ+XG4gIClcbn1cbmNvbnN0IFNpZGVCYXJCYWNrZ3JvdW5kID0gKCkgPT4ge1xuICBjb25zdCB7IGdldEJvdHRvbUxlZnRCYWNrZ3JvdW5kU3JjIH0gPSB1c2VDb25maWd1cmF0aW9uKClcbiAgcmV0dXJuIChcbiAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInJlbGF0aXZlIG92ZXJmbG93LWhpZGRlbiBzaHJpbmstMSBoLWZ1bGwgbWluLXctZnVsbFwiPlxuICAgICAge2dldEJvdHRvbUxlZnRCYWNrZ3JvdW5kU3JjKCkgPyAoXG4gICAgICAgIDxpbWdcbiAgICAgICAgICBjbGFzc05hbWU9e2Bncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCBvcGFjaXR5LTUwIGR1cmF0aW9uLTIwMCBlYXNlLWluLW91dCB0cmFuc2l0aW9uLWFsbCB3LWF1dG8gaC1mdWxsIGFic29sdXRlIG1heC13LW5vbmUgbS1hdXRvIG1pbi1oLTgwYH1cbiAgICAgICAgICBzcmM9e2hhbmRsZUJhc2U2NEVuY29kZWRJbWFnZXMoZ2V0Qm90dG9tTGVmdEJhY2tncm91bmRTcmMoKSl9XG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8L0dyaWQ+XG4gIClcbn1cbmNvbnN0IFJvdXRlQ29udGVudHMgPSAoKSA9PiB7XG4gIGNvbnN0IHsgUm91dGVJbmZvcm1hdGlvbiB9ID0gdXNlVG9wTGV2ZWxBcHBDb250ZXh0KClcbiAgLyoqXG4gICAqIFNvIHRoaXMgaXMgc2xpZ2h0bHkgYW5ub3lpbmcsIGJ1dCB0aGUgZ3JpZCB3b24ndCBwcm9wZXJseSByZXNpemUgd2l0aG91dCBvdmVyZmxvdyBoaWRkZW4gc2V0LlxuICAgKlxuICAgKiBUaGF0IG1ha2VzIGhhbmRsaW5nIHBhZGRpbmcgLyBtYXJnaW5zIC8gc3BhY2luZyBtb3JlIGNvbXBsaWNhdGVkIGluIG91ciBhcHAsIGJlY2F1c2Ugd2l0aCBvdmVyZmxvdyBoaWRkZW4gc2V0XG4gICAqIGRyb3BzaGFkb3dzIG9uIGVsZW1lbnRzIHdpbGwgZ2V0IGN1dCBvZmYuICBTbyB3ZSBoYXZlIHRvIGxldCB0aGUgY29udGVudHMgaW5zdGVhZCBkaWN0YXRlIHRoZWlyIHBhZGRpbmcsIHRoYXQgd2F5XG4gICAqIHRoZWlyIGRyb3BzaGFkb3dzIGNhbiBiZSBzZWVuLlxuICAgKlxuICAgKiBGb2xrcyB3aWxsIHByb2JhYmx5IHN0cnVnZ2xlIGEgYml0IHdpdGggaXQgYXQgZmlyc3QsIGJ1dCB0aGUgY3NzIHV0aWxpdGllcyBhY3R1YWxseSBtYWtlIGl0IHByZXR0eSBlYXN5LlxuICAgKiBKdXN0IGFkZCBwYi0yIGZvciB0aGUgY29ycmVjdCBib3R0b20gc3BhY2luZywgcHQtMiBmb3IgY29ycmVjdCB0b3Agc3BhY2luZywgZXRjLiBldGMuXG4gICAqL1xuICByZXR1cm4gKFxuICAgIDxHcmlkXG4gICAgICBpdGVtXG4gICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHJlbGF0aXZlIHotMCBzaHJpbmstMSBvdmVyZmxvdy14LWhpZGRlblwiIC8vIGRvIG5vdCByZW1vdmUgdGhpcyBvdmVyZmxvdyBoaWRkZW4sIHNlZSBjb21tZW50IGFib3ZlIGZvciBtb3JlXG4gICAgPlxuICAgICAgPE1lbW8+XG4gICAgICAgIDxTd2l0Y2g+XG4gICAgICAgICAge1JvdXRlSW5mb3JtYXRpb24ubWFwKChyb3V0ZUluZm86IFJvdXRlTm90U2hvd25Jbk5hdlR5cGUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxSb3V0ZVxuICAgICAgICAgICAgICAgIGtleT17XG4gICAgICAgICAgICAgICAgICByb3V0ZUluZm8ucm91dGVQcm9wcy5wYXRoXG4gICAgICAgICAgICAgICAgICAgID8gcm91dGVJbmZvLnJvdXRlUHJvcHMucGF0aC50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgICAgIDogTWF0aC5yYW5kb20oKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB7Li4ucm91dGVJbmZvLnJvdXRlUHJvcHN9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvU3dpdGNoPlxuICAgICAgPC9NZW1vPlxuICAgIDwvR3JpZD5cbiAgKVxufVxuY29uc3QgTmF2Q29udGV4dFByb3ZpZGVyID0gUmVhY3QuY3JlYXRlQ29udGV4dCh7XG4gIHNldE5hdk9wZW46IChfbmF2T3BlbjogYm9vbGVhbikgPT4ge30sXG4gIG5hdk9wZW46IGZhbHNlLFxufSlcbmV4cG9ydCBjb25zdCB1c2VOYXZDb250ZXh0UHJvdmlkZXIgPSAoKSA9PiB7XG4gIGNvbnN0IG5hdkNvbnRleHQgPSBSZWFjdC51c2VDb250ZXh0KE5hdkNvbnRleHRQcm92aWRlcilcbiAgcmV0dXJuIG5hdkNvbnRleHRcbn1cbi8qKlxuICogS2VlcCB0aGUgY3VycmVudCByb3V0ZSB2aXNpYmxlIHRvIHRoZSB1c2VyIHNpbmNlIGl0J3MgdXNlZnVsIGluZm8uXG4gKiBUaGlzIGFsc28gZW5zdXJlcyBpdCdzIHZpc2libGUgdXBvbiBmaXJzdCBsb2FkIG9mIHRoZSBwYWdlLlxuICovXG5jb25zdCB1c2VTY3JvbGxDdXJyZW50Um91dGVJbnRvVmlld09uTG9jYXRpb25DaGFuZ2UgPSAoKSA9PiB7XG4gIGNvbnN0IGxvY2F0aW9uID0gdXNlTG9jYXRpb24oKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNjcm9sbEN1cnJlbnRSb3V0ZUludG9WaWV3KClcbiAgfSwgW2xvY2F0aW9uXSlcbn1cbmNvbnN0IHVzZUluZGljYXRlSGFzVW5zZWVuTm90aWZpY2F0aW9ucyA9ICgpID0+IHtcbiAgY29uc3QgeyBsaXN0ZW5UbyB9ID0gdXNlQmFja2JvbmUoKVxuICBjb25zdCBbaGFzVW5zZWVuTm90aWZpY2F0aW9ucywgc2V0SGFzVW5zZWVuTm90aWZpY2F0aW9uc10gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBub3RpZmljYXRpb25zLmhhc1Vuc2VlbigpIGFzIGJvb2xlYW5cbiAgKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxpc3RlblRvKG5vdGlmaWNhdGlvbnMsICdjaGFuZ2UgYWRkIHJlbW92ZSByZXNldCB1cGRhdGUnLCAoKSA9PiB7XG4gICAgICBzZXRIYXNVbnNlZW5Ob3RpZmljYXRpb25zKG5vdGlmaWNhdGlvbnMuaGFzVW5zZWVuKCkgYXMgYm9vbGVhbilcbiAgICB9KVxuICB9LCBbXSlcbiAgcmV0dXJuIGhhc1Vuc2Vlbk5vdGlmaWNhdGlvbnNcbn1cblxuY29uc3QgdXNlRmF2aWNvbkJyYW5kaW5nID0gKCkgPT4ge1xuICAvLyB0b2RvIGZhdmljb24gYnJhbmRpbmdcbiAgLy8gJCh3aW5kb3cuZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcbiAgLy8gICB3aW5kb3cuZG9jdW1lbnQudGl0bGUgPSBwcm9wZXJ0aWVzLmJyYW5kaW5nICsgJyAnICsgcHJvcGVydGllcy5wcm9kdWN0XG4gIC8vICAgY29uc3QgZmF2aWNvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmYXZpY29uJykgYXMgSFRNTEFuY2hvckVsZW1lbnRcbiAgLy8gICBmYXZpY29uLmhyZWYgPSBicmFuZGluZ0luZm9ybWF0aW9uLnRvcExlZnRMb2dvU3JjXG4gIC8vICAgZmF2aWNvbi5yZW1vdmUoKVxuICAvLyAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoZmF2aWNvbilcbiAgLy8gfSlcbn1cbmNvbnN0IHVzZU5hdk9wZW4gPSAoKSA9PiB7XG4gIGxldCBkZWZhdWx0T3BlbiA9XG4gICAgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NoZWxsLmRyYXdlcicpID09PSAndHJ1ZScgPyB0cnVlIDogZmFsc2VcbiAgY29uc3QgW25hdk9wZW4sIHNldE5hdk9wZW5dID0gUmVhY3QudXNlU3RhdGUoZGVmYXVsdE9wZW4pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3NoZWxsLmRyYXdlcicsIG5hdk9wZW4udG9TdHJpbmcoKSlcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICQod2luZG93KS5yZXNpemUoKSAvLyBuZWVkZWQgZm9yIGdvbGRlbiBsYXlvdXQgdG8gcmVzaXplXG4gICAgfSwgMjUwKVxuICB9LCBbbmF2T3Blbl0pXG4gIHJldHVybiB7XG4gICAgbmF2T3BlbixcbiAgICBzZXROYXZPcGVuLFxuICB9XG59XG5jb25zdCBUb3BMZXZlbEFwcENvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KHtcbiAgUm91dGVJbmZvcm1hdGlvbjogW10sXG4gIE5vdGlmaWNhdGlvbnNDb21wb25lbnQ6ICgpID0+IG51bGwsXG4gIFNldHRpbmdzQ29tcG9uZW50czoge30sXG59IGFzIEFwcFByb3BzVHlwZSlcbmNvbnN0IHVzZVRvcExldmVsQXBwQ29udGV4dCA9ICgpID0+IHtcbiAgY29uc3QgdG9wTGV2ZWxBcHBDb250ZXh0ID0gUmVhY3QudXNlQ29udGV4dChUb3BMZXZlbEFwcENvbnRleHQpXG4gIHJldHVybiB0b3BMZXZlbEFwcENvbnRleHRcbn1cbmNvbnN0IFNlc3Npb25UaW1lb3V0Q29tcG9uZW50ID0gKCkgPT4ge1xuICBjb25zdCBzZXNzaW9uVGltZW91dERpYWxvZ1N0YXRlID0gdXNlRGlhbG9nU3RhdGUoKVxuICB1c2VMaXN0ZW5UbyhzZXNzaW9uVGltZW91dE1vZGVsLCAnY2hhbmdlOnNob3dQcm9tcHQnLCAoKSA9PiB7XG4gICAgaWYgKHNlc3Npb25UaW1lb3V0TW9kZWwuZ2V0KCdzaG93UHJvbXB0JykpIHtcbiAgICAgIHNlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuaGFuZGxlQ2xpY2soKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXNzaW9uVGltZW91dERpYWxvZ1N0YXRlLmhhbmRsZUNsb3NlKClcbiAgICB9XG4gIH0pXG4gIHJldHVybiAoXG4gICAgPHNlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuTXVpRGlhbG9nQ29tcG9uZW50cy5EaWFsb2dcbiAgICAgIHsuLi5zZXNzaW9uVGltZW91dERpYWxvZ1N0YXRlLk11aURpYWxvZ1Byb3BzfVxuICAgICAgZGlzYWJsZUVzY2FwZUtleURvd25cbiAgICAgIG9uQ2xvc2U9eyhldmVudCwgcmVhc29uKSA9PiB7XG4gICAgICAgIGlmIChyZWFzb24gPT09ICdiYWNrZHJvcENsaWNrJykge1xuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHNlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuTXVpRGlhbG9nUHJvcHMub25DbG9zZShldmVudCwgcmVhc29uKVxuICAgICAgfX1cbiAgICA+XG4gICAgICA8U2Vzc2lvblRpbWVvdXQgLz5cbiAgICA8L3Nlc3Npb25UaW1lb3V0RGlhbG9nU3RhdGUuTXVpRGlhbG9nQ29tcG9uZW50cy5EaWFsb2c+XG4gIClcbn1cblxuY29uc3QgQXBwID0gKHtcbiAgUm91dGVJbmZvcm1hdGlvbixcbiAgTm90aWZpY2F0aW9uc0NvbXBvbmVudCxcbiAgU2V0dGluZ3NDb21wb25lbnRzLFxufTogQXBwUHJvcHNUeXBlKSA9PiB7XG4gIGNvbnN0IHsgbmF2T3Blbiwgc2V0TmF2T3BlbiB9ID0gdXNlTmF2T3BlbigpXG4gIHVzZUZhdmljb25CcmFuZGluZygpXG4gIHVzZVNjcm9sbEN1cnJlbnRSb3V0ZUludG9WaWV3T25Mb2NhdGlvbkNoYW5nZSgpXG4gIHJldHVybiAoXG4gICAgPFRvcExldmVsQXBwQ29udGV4dC5Qcm92aWRlclxuICAgICAgdmFsdWU9e3sgUm91dGVJbmZvcm1hdGlvbiwgTm90aWZpY2F0aW9uc0NvbXBvbmVudCwgU2V0dGluZ3NDb21wb25lbnRzIH19XG4gICAgPlxuICAgICAgPE5hdkNvbnRleHRQcm92aWRlci5Qcm92aWRlciB2YWx1ZT17eyBuYXZPcGVuLCBzZXROYXZPcGVuIH19PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtZnVsbCB3LWZ1bGwgb3ZlcmZsb3ctaGlkZGVuIE11aS1iZy1kZWZhdWx0XCI+XG4gICAgICAgICAgey8qIERvbid0IG1vdmUgQ1NTQmFzZWxpbmUgb3IgR2xvYmFsU3R5bGVzIHRvIHByb3ZpZGVycywgc2luY2Ugd2UgaGF2ZSBtdWx0aXBsZSByZWFjdCByb290cy4gICAqL31cbiAgICAgICAgICA8Q3NzQmFzZWxpbmUgLz5cbiAgICAgICAgICA8R2xvYmFsU3R5bGVzIC8+XG4gICAgICAgICAgPFN5c3RlbVVzYWdlTW9kYWwgLz5cbiAgICAgICAgICA8U2Vzc2lvblRpbWVvdXRDb21wb25lbnQgLz5cbiAgICAgICAgICA8QWpheEVycm9ySGFuZGxpbmcgLz5cbiAgICAgICAgICA8V3JlcXJTbmFja3MgLz5cbiAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImgtZnVsbCB3LWZ1bGwgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICAgIGRpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8SGVhZGVyIC8+XG4gICAgICAgICAgICA8RXh0ZW5zaW9ucy5leHRyYUhlYWRlciAvPlxuICAgICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICA8QXN5bmNUYXNrc0NvbXBvbmVudCAvPlxuICAgICAgICAgICAgICA8R3JpZFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgICAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICAgICAgICAgICAgYWxpZ25JdGVtcz1cInN0cmV0Y2hcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPFNpZGVCYXIgLz5cbiAgICAgICAgICAgICAgICA8Um91dGVDb250ZW50cyAvPlxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICA8RXh0ZW5zaW9ucy5leHRyYUZvb3RlciAvPlxuICAgICAgICAgICAgPEZvb3RlciAvPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L05hdkNvbnRleHRQcm92aWRlci5Qcm92aWRlcj5cbiAgICA8L1RvcExldmVsQXBwQ29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuZXhwb3J0IGRlZmF1bHQgaG90KEFwcClcbiJdfQ==