import { __assign, __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { Switch, Route, useLocation, useHistory, } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import properties from '../../js/properties';
import Grid from '@material-ui/core/Grid';
import $ from 'jquery';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ExpandingButton from '../button/expanding-button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import MenuIcon from '@material-ui/icons/Menu';
import PersonIcon from '@material-ui/icons/Person';
import SettingsIcon from '@material-ui/icons/Settings';
import Drawer from '@material-ui/core/Drawer';
import queryString from 'query-string';
import { Link } from '../link/link';
import { Memo } from '../memo/memo';
import HelpIcon from '@material-ui/icons/Help';
import NotificationsIcon from '@material-ui/icons/Notifications';
import userInstance from '../singletons/user-instance';
import notifications from '../singletons/user-notifications';
import SystemUsageModal from '../system-usage/system-usage';
import UserView, { RoleDisplay } from '../../react-component/user/user';
import UserSettings from '../../react-component/user-settings/user-settings';
import wreqr from '../../js/wreqr';
import { GlobalStyles } from './global-styles';
import scrollIntoView from 'scroll-into-view-if-needed';
import { Elevations } from '../theme/theme';
import { useBackbone, useListenTo, } from '../selection-checkbox/useBackbone.hook';
import { AsyncTasks, useRenderOnAsyncTasksAddOrRemove, } from '../../js/model/AsyncTask/async-task';
import useSnack from '../hooks/useSnack';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useDialogState } from '../hooks/useDialogState';
import SessionTimeout from '../../react-component/session-timeout';
import { AjaxErrorHandling } from './ajax-error-handling';
import { WreqrSnacks } from './wreqr-snacks';
import sessionTimeoutModel from '../singletons/session-timeout';
import Extensions from '../../extension-points';
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
                scrollMode: 'if-needed'
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
                                action: (React.createElement(Button, { component: Link, to: "/search/".concat(task.lazyResult.plain.metacard.properties['metacard.deleted.id']) }, "Go to"))
                            }
                        });
                    }
                    if (AsyncTasks.isDeleteTask(task)) {
                        addSnack("Delete of ".concat(task.lazyResult.plain.metacard.properties.title, " complete."), {
                            undo: function () {
                                history.push({
                                    pathname: "/search/".concat(task.lazyResult.plain.id),
                                    search: ''
                                });
                                AsyncTasks.restore({ lazyResult: task.lazyResult });
                            }
                        });
                    }
                    if (AsyncTasks.isCreateSearchTask(task)) {
                        addSnack("Creation of ".concat(task.data.title, " complete."));
                    }
                }
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
    var location = useLocation();
    var queryParams = queryString.parse(location.search);
    var navOpen = useNavContextProvider().navOpen;
    return (React.createElement(ExpandingButton, { component: properties.helpUrl ? 'a' : Link, href: properties.helpUrl, to: properties.helpUrl
            ? properties.helpurl
            : {
                pathname: "".concat(location.pathname),
                search: "".concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-help': 'Help' })))
            }, target: properties.helpUrl ? '_blank' : undefined, className: "group-hover:opacity-100 opacity-25  hover:opacity-100 focus-visible:opacity-100 transition-opacity", Icon: HelpIcon, expandedLabel: "Help", unexpandedLabel: "", dataId: sidebarDataIdTag('help'), expanded: navOpen, focusVisibleClassName: "focus-visible" }));
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
                search: "".concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-settings': 'Settings' })))
            }, className: "group-hover:opacity-100 opacity-25 relative hover:opacity-100 focus-visible:opacity-100 transition-opacity", Icon: SettingsIcon, expandedLabel: "Settings", unexpandedLabel: "", dataId: sidebarDataIdTag('settings'), expanded: navOpen, focusVisibleClassName: "focus-visible" }),
        React.createElement(Drawer, { anchor: "left", open: open, onClose: function () {
                delete queryParams['global-settings'];
                history.push("".concat(location.pathname, "?").concat(queryString.stringify(queryParams)));
            }, PaperProps: {
                className: 'min-w-120 max-w-4/5 '
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
                    search: "".concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-notifications': 'Notifications' })))
                }, className: "".concat(!hasUnseenNotifications ? 'opacity-25' : '', " group-hover:opacity-100  relative hover:opacity-100 focus-visible:opacity-100 transition-opacity"), Icon: NotificationsIcon, expandedLabel: "Notifications", unexpandedLabel: "", dataId: sidebarDataIdTag('notifications'), expanded: navOpen, focusVisibleClassName: "focus-visible", orientation: "vertical" })),
        React.createElement(Drawer, { anchor: "left", open: open, onClose: function () {
                delete queryParams['global-notifications'];
                history.push("".concat(location.pathname, "?").concat(queryString.stringify(queryParams)));
                notifications.setSeen();
                userInstance.savePreferences();
            }, PaperProps: {
                className: 'min-w-120 max-w-4/5 '
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
                search: "".concat(queryString.stringify(__assign(__assign({}, queryParams), { 'global-user': 'User' })))
            }, className: "group-hover:opacity-100 opacity-25 relative hover:opacity-100 focus-visible:opacity-100 transition-opacity", Icon: PersonIcon, expandedLabel: getLabel(), unexpandedLabel: getLabel(), dataId: sidebarDataIdTag('user-profile'), expanded: navOpen, focusVisibleClassName: "focus-visible" }),
        React.createElement(Drawer, { anchor: "left", open: open, onClose: function () {
                delete queryParams['global-user'];
                history.push("".concat(location.pathname, "?").concat(queryString.stringify(queryParams)));
            }, PaperProps: {
                className: 'min-w-120 max-w-4/5 '
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
        pathname: location.pathname
    });
    return (React.createElement(ExpandingButton, __assign({ key: routeInfo.linkProps.to.toString(), component: Link, to: routeInfo.linkProps.to, className: "group-hover:opacity-100 ".concat(!isSelected ? 'opacity-25' : '', " focus-visible:opacity-100 hover:opacity-100 transition-opacity"), expanded: navOpen }, routeInfo.navButtonProps, { focusVisibleClassName: "focus-visible", dataId: sidebarDataIdTag(routeInfo.navButtonProps.dataId) }, (isSelected
        ? (_b = {},
            _b['data-currentroute'] = true,
            _b) : {}))));
};
var SideBarRoutes = function () {
    var RouteInformation = useTopLevelAppContext().RouteInformation;
    return (React.createElement(Grid, { item: true, className: "overflow-auto p-0 shrink-0 scrollbars-min", style: {
            maxHeight: "calc(100% - ".concat(7 * 4, "rem)")
        } },
        RouteInformation.filter(function (routeInfo) { return routeInfo.showInNav; }).map(function (routeInfo) {
            var _a;
            return (React.createElement(RouteButton, { routeInfo: routeInfo, key: (_a = routeInfo.routeProps.path) === null || _a === void 0 ? void 0 : _a.toString() }));
        }),
        React.createElement(Extensions.extraRoutes, null)));
};
var SideBarToggleButton = function () {
    var _a = useNavContextProvider(), navOpen = _a.navOpen, setNavOpen = _a.setNavOpen;
    return (React.createElement(React.Fragment, null,
        React.createElement(Grid, { item: true, className: "w-full h-16 shrink-0" }, navOpen ? (React.createElement(React.Fragment, null,
            React.createElement(Grid, { container: true, wrap: "nowrap", alignItems: "center", className: "w-full h-full overflow-hidden" },
                React.createElement(Grid, { item: true, className: "pl-3 py-1 pr-1 w-full relative h-full" }, properties.topLeftLogoSrc ? (React.createElement("img", { className: "max-h-full max-w-full absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 p-4", src: handleBase64EncodedImages(properties.topLeftLogoSrc) })) : (React.createElement(Grid, { container: true, direction: "column", className: "pl-3", justifyContent: "center" },
                    React.createElement(Grid, { item: true },
                        React.createElement(Typography, null, properties.customBranding)),
                    React.createElement(Grid, { item: true },
                        React.createElement(Typography, null, properties.product))))),
                React.createElement(Grid, { item: true, className: "ml-auto" },
                    React.createElement(IconButton, { className: "h-auto", onClick: function () {
                            setNavOpen(false);
                        } },
                        React.createElement(ChevronLeftIcon, null)))))) : (React.createElement(Button, { color: "inherit", "aria-label": "open drawer", onClick: function () {
                setNavOpen(true);
            }, className: "w-full h-full p-2" }, properties.menuIconSrc ? (React.createElement(React.Fragment, null,
            React.createElement("img", { src: handleBase64EncodedImages(properties.menuIconSrc), className: "max-h-16 max-w-full" }))) : (React.createElement(MenuIcon, null)))))));
};
var SideBar = function () {
    var navOpen = useNavContextProvider().navOpen;
    return (React.createElement(Grid, { item: true, className: "".concat(navOpen ? 'w-64' : 'w-20', " transition-all duration-200 ease-in-out relative z-10 mr-2 shrink-0 pb-2 pt-2 pl-2 group"), onMouseLeave: function () {
            scrollCurrentRouteIntoView();
        } },
        React.createElement(Paper, { elevation: Elevations.navbar, className: "h-full" },
            React.createElement(Grid, { container: true, direction: "column", className: "h-full w-full", wrap: "nowrap" },
                React.createElement(SideBarToggleButton, null),
                React.createElement(Divider, null),
                React.createElement(SideBarRoutes, null),
                React.createElement(Divider, null),
                React.createElement(SideBarBackground, null),
                React.createElement(Divider, null),
                React.createElement(Grid, { item: true, className: "mt-auto overflow-hidden w-full shrink-0 grow-0" },
                    React.createElement(HelpButton, null),
                    React.createElement(SettingsButton, null),
                    React.createElement(NotificationsButton, null),
                    React.createElement(UserButton, null))))));
};
var Header = function () {
    return (React.createElement(Grid, { item: true, className: "w-full" }, properties.ui.header ? (React.createElement(Typography, { align: "center", style: {
            background: properties.ui.background,
            color: properties.ui.color
        } }, properties.ui.header)) : null));
};
var Footer = function () {
    return (React.createElement(Grid, { item: true, className: "w-full" }, properties.ui.footer ? (React.createElement(Typography, { align: "center", style: {
            background: properties.ui.background,
            color: properties.ui.color
        } }, properties.ui.footer)) : null));
};
var SideBarBackground = function () {
    return (React.createElement(Grid, { item: true, className: "relative overflow-hidden shrink-1 h-full min-w-full" }, properties.bottomLeftBackgroundSrc ? (React.createElement("img", { className: "group-hover:opacity-100 opacity-50 duration-200 ease-in-out transition-all w-auto h-full absolute max-w-none m-auto min-h-80", src: handleBase64EncodedImages(properties.bottomLeftBackgroundSrc) })) : null));
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
    navOpen: false
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
var useBackboneRouteReactRouterCompatibility = function () {
    var listenTo = useBackbone().listenTo;
    var history = useHistory();
    React.useEffect(function () {
        listenTo(wreqr.vent, 'router:navigate', function (_a) {
            var fragment = _a.fragment;
            history.push("/".concat(fragment));
        });
    }, []);
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
        setNavOpen: setNavOpen
    };
};
var TopLevelAppContext = React.createContext({
    RouteInformation: [],
    NotificationsComponent: function () { return null; },
    SettingsComponents: {}
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
    useBackboneRouteReactRouterCompatibility();
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
//# sourceMappingURL=app.js.map