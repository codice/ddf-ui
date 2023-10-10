import { __assign, __read, __rest, __spreadArray } from "tslib";
import * as React from 'react';
import { GoldenLayout } from '../golden-layout/golden-layout';
import { SplitPane, useResizableGridContext, } from '../resizable-grid/resizable-grid';
import SelectionInterfaceModel from '../selection-interface/selection-interface.model';
import { useQuery, useUserQuery } from '../../js/model/TypedQuery';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { QueryAddReact } from '../query-add/query-add';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import queryString from 'query-string';
import Button from '@mui/material/Button';
import MoreVert from '@mui/icons-material/MoreVert';
import { Elevations } from '../theme/theme';
import SearchIcon from '@mui/icons-material/SearchTwoTone';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import { Link, useHistory, useLocation, useParams, } from 'react-router-dom';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import { DarkDivider } from '../dark-divider/dark-divider';
import LinearProgress from '@mui/material/LinearProgress';
import { useUpdateEffect } from 'react-use';
import { FilterBuilderClass, FilterClass, } from '../filter-builder/filter.structure';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import { useRerenderOnBackboneSync, useStatusOfLazyResults, } from '../../js/model/LazyQueryResult/hooks';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SaveIcon from '@mui/icons-material/Save';
import { useMenuState } from '../menu-state/menu-state';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { TypedUserInstance } from '../singletons/TypedUser';
import useSnack from '../hooks/useSnack';
import Popover from '@mui/material/Popover';
import Autocomplete from '@mui/material/Autocomplete';
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks';
import OverflowTooltip from '../overflow-tooltip/overflow-tooltip';
import { AsyncTasks, useCreateSearchTask, useRestoreSearchTask, useSaveSearchTaskBasedOnParams, } from '../../js/model/AsyncTask/async-task';
import { Memo } from '../memo/memo';
import { useListenToEnterKeySubmitEvent } from '../custom-events/enter-key-submit';
export var SaveForm = function (_a) {
    var onClose = _a.onClose, selectionInterface = _a.selectionInterface, onSave = _a.onSave;
    var currentQuery = selectionInterface.getCurrentQuery();
    var _b = __read(React.useState(currentQuery.get('title') || ''), 2), title = _b[0], setTitle = _b[1];
    var _c = __read(React.useState({}), 2), validation = _c[0], setValidation = _c[1];
    useUpdateEffect(function () {
        if (!title) {
            setValidation({
                title: 'Cannot be blank',
            });
        }
        else {
            setValidation({});
        }
    }, [title]);
    return (React.createElement(React.Fragment, null,
        React.createElement("form", { action: "./blank.html", method: "POST", onSubmit: function (e) {
                if (!title) {
                    setValidation({
                        title: 'Cannot be blank',
                    });
                    e.preventDefault();
                    return false;
                }
                else {
                    currentQuery.set('title', title);
                    onSave(title);
                    e.preventDefault();
                    onClose();
                    return false;
                }
            }, className: "w-full h-full" },
            React.createElement("div", { className: "p-2" },
                React.createElement(TextField, { variant: "outlined", size: "small", label: "Name", value: title, onChange: function (e) {
                        setTitle(e.target.value);
                    }, error: Boolean(validation.title), autoFocus: true, onFocus: function (e) {
                        e.target.select();
                    }, helperText: validation.title })),
            React.createElement(DarkDivider, null),
            React.createElement("div", { className: "flex flex-row flex-nowrap align justify-end p-2" },
                React.createElement(Button, { type: "button", variant: "text", color: "primary", onClick: function () {
                        onClose();
                    } }, "Cancel"),
                React.createElement(Button, { disabled: Object.keys(validation).length > 0, type: "submit", className: "ml-3", variant: "contained", color: "primary" }, "Save")))));
};
var ButtonWithTwoStates = function (props) {
    var states = props.states, state = props.state, buttonProps = __rest(props, ["states", "state"]);
    if (states.length === 0) {
        return React.createElement("div", null, "You must specify at least one state");
    }
    var longestState = states.reduce(function (longest, current) {
        if (current.state.length > longest.length) {
            return current.state;
        }
        return longest;
    }, states[0].state);
    var currentState = states.find(function (stateInfo) { return stateInfo.state === state; });
    if (currentState === undefined) {
        return React.createElement("div", null, "You must specify a valid state");
    }
    var isLoading = currentState === null || currentState === void 0 ? void 0 : currentState.loading;
    return (React.createElement(Button, __assign({ disabled: isLoading }, buttonProps),
        React.createElement("span", { className: "invisible ".concat(props.labelClassName) }, longestState),
        React.createElement("span", { className: "absolute ".concat(props.labelClassName) }, state),
        isLoading ? (React.createElement(LinearProgress, { className: "absolute left-0 top-0 w-full h-full opacity-50", variant: "indeterminate" })) : null));
};
var useSearchResults = function (_a) {
    var searchText = _a.searchText, _b = _a.archived, archived = _b === void 0 ? false : _b;
    var _c = __read(React.useState({
        lazyResults: [],
        loading: true,
    }), 2), state = _c[0], setState = _c[1];
    var _d = __read(React.useState(false), 2), hasSearched = _d[0], setHasSearched = _d[1];
    var _f = __read(useQuery({
        attributes: {
            sorts: [{ attribute: 'metacard.modified', direction: 'descending' }],
            filterTree: new FilterBuilderClass({
                type: 'AND',
                filters: __spreadArray([
                    new FilterClass({
                        property: 'title',
                        value: "*".concat(searchText, "*"),
                        type: 'ILIKE',
                    }),
                    new FilterClass({
                        property: archived ? 'metacard.deleted.tags' : 'metacard-tags',
                        value: 'query',
                        type: 'ILIKE',
                    })
                ], __read((archived
                    ? [
                        new FilterClass({
                            property: 'metacard-tags',
                            value: '*',
                            type: 'ILIKE',
                        }),
                    ]
                    : [])), false),
            }),
        },
    }), 1), queryModel = _f[0];
    var _g = __read(React.useState(new SelectionInterfaceModel({
        currentQuery: queryModel,
    })), 1), selectionInterface = _g[0];
    React.useEffect(function () {
        selectionInterface.getCurrentQuery().set('filterTree', new FilterBuilderClass({
            type: 'AND',
            filters: __spreadArray([
                new FilterClass({
                    property: 'title',
                    value: "*".concat(searchText, "*"),
                    type: 'ILIKE',
                }),
                new FilterClass({
                    property: archived ? 'metacard.deleted.tags' : 'metacard-tags',
                    value: 'query',
                    type: 'ILIKE',
                })
            ], __read((archived
                ? [
                    new FilterClass({
                        property: 'metacard-tags',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ]
                : [])), false),
        }));
        selectionInterface.getCurrentQuery().cancelCurrentSearches();
        setState({
            lazyResults: [],
            loading: true,
        });
        var timeoutId = window.setTimeout(function () {
            if (searchText.length >= 0) {
                selectionInterface.getCurrentQuery().startSearchFromFirstPage();
                setHasSearched(true);
            }
        }, 500);
        return function () {
            window.clearTimeout(timeoutId);
        };
    }, [searchText]);
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var isSearching = useStatusOfLazyResults({ lazyResults: lazyResults }).isSearching;
    React.useEffect(function () {
        setState({
            lazyResults: Object.values(lazyResults.results),
            loading: hasSearched ? isSearching : true,
        });
    }, [lazyResults, isSearching]);
    return state;
};
export var OpenSearch = function (_a) {
    var onFinish = _a.onFinish, constructLink = _a.constructLink, label = _a.label, _b = _a.archived, archived = _b === void 0 ? false : _b, autocompleteProps = _a.autocompleteProps;
    var _c = __read(React.useState(false), 2), positioningDone = _c[0], setPositioningDone = _c[1];
    var _d = __read(React.useState(''), 2), value = _d[0], setValue = _d[1];
    var _f = __read(React.useState(true), 2), open = _f[0], setOpen = _f[1];
    var inputRef = React.useRef(null);
    var _g = __read(React.useState(null), 2), currentHighlight = _g[0], setCurrentHighlight = _g[1];
    var _h = __read(React.useState([]), 2), options = _h[0], setOptions = _h[1];
    var _j = useSearchResults({
        searchText: value,
        archived: archived,
    }), lazyResults = _j.lazyResults, loading = _j.loading;
    React.useEffect(function () {
        setOptions(lazyResults);
    }, [lazyResults]);
    React.useEffect(function () {
        if (currentHighlight && currentHighlight.overflowTooltip) {
            currentHighlight.overflowTooltip.setOpen(true);
        }
        return function () {
            if (currentHighlight && currentHighlight.overflowTooltip)
                currentHighlight.overflowTooltip.setOpen(false);
        };
    }, [currentHighlight]);
    React.useEffect(function () {
        var timeoutid = window.setTimeout(function () {
            setPositioningDone(true);
        }, 500);
        return function () {
            window.clearTimeout(timeoutid);
        };
    }, []);
    return (React.createElement(Autocomplete, __assign({ className: "w-64", isOptionEqualToValue: function (option) { return option.plain.id === option.plain.id; }, getOptionLabel: function (option) { return option.plain.metacard.properties.title; }, options: options, ref: inputRef, open: open && positioningDone, onOpen: function () {
            setOpen(true);
        }, onClose: function () {
            setOpen(false);
        }, loading: loading, autoHighlight: true, onHighlightChange: function () {
            if (inputRef.current) {
                var highlightedElementString = inputRef.current.querySelector('input').getAttribute('aria-activedescendant');
                if (highlightedElementString) {
                    setCurrentHighlight(document.getElementById(highlightedElementString).querySelector('div'));
                }
                else {
                    setCurrentHighlight(null);
                }
            }
            else {
                setCurrentHighlight(null);
            }
        }, noOptionsText: "Nothing found.", renderOption: function (props, option) {
            return (React.createElement("li", __assign({}, props),
                React.createElement(Link, { className: "w-full p-0 font-normal no-underline hover:font-normal hover:no-underline", to: constructLink(option) },
                    React.createElement(OverflowTooltip, { tooltipProps: {
                            title: (React.createElement("div", { className: "w-full p-2" }, option.plain.metacard.properties.title)),
                        } },
                        React.createElement("div", { className: "truncate w-full p-2" }, option.plain.metacard.properties.title)))));
        }, ListboxProps: {
            className: 'children-p-0 MuiAutocomplete-listbox', // we have to add the original class (MuiAutocomplete-listbox) back on unfortunately
        }, onChange: function (_e, value) {
            if (value) {
                onFinish(value);
            }
        }, renderInput: function (params) {
            return (React.createElement(TextField, __assign({}, params, { value: value, onChange: function (e) {
                    setValue(e.target.value);
                }, label: label, variant: "outlined", autoFocus: true, InputProps: __assign(__assign({}, params.InputProps), { endAdornment: (React.createElement(React.Fragment, null,
                        loading ? (React.createElement(CircularProgress, { color: "inherit", size: 20 })) : null,
                        params.InputProps.endAdornment)) }) })));
        } }, autocompleteProps)));
};
var OptionsButton = function () {
    var _a = React.useContext(SavedSearchModeContext), searchPageMode = _a.searchPageMode, data = _a.data, selectionInterface = _a.selectionInterface;
    var closed = useResizableGridContext().closed;
    var menuState = useMenuState();
    var menuStateOpenSearch = useMenuState();
    var menuStateNewFromExisting = useMenuState();
    var menuStateCopy = useMenuState();
    var menuStateRename = useMenuState();
    var menuStateRestore = useMenuState();
    var addSnack = useSnack();
    var history = useHistory();
    var _b = __read(React.useState(''), 2), encodedQueryModelJSON = _b[0], setEncodedQueryModelJSON = _b[1];
    React.useEffect(function () {
        setEncodedQueryModelJSON(encodeURIComponent(JSON.stringify(selectionInterface.getCurrentQuery().toJSON())));
    }, [menuState.open]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Button, { component: "div", fullWidth: true, ref: menuState.anchorRef, onClick: menuState.handleClick },
            closed ? null : React.createElement("span", { className: "Mui-text-primary" }, "Options"),
            React.createElement(MoreVert, null)),
        React.createElement(Popover, { open: menuStateRestore.open, anchorEl: menuState.anchorRef.current, onClose: menuStateRestore.handleClose, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } },
            React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" },
                React.createElement(OpenSearch, { label: "Restore a search from the trash", archived: true, constructLink: function (result) {
                        var copy = JSON.parse(JSON.stringify(result.plain.metacard.properties));
                        delete copy.id;
                        delete copy.title;
                        delete copy['metacard.deleted.date'];
                        delete copy['metacard.deleted.id'];
                        delete copy['metacard.deleted.tags'];
                        delete copy['metacard.deleted.version'];
                        delete copy['metacard-tags'];
                        delete copy['metacard-type'];
                        var encodedQueryModel = encodeURIComponent(JSON.stringify(copy));
                        return {
                            pathname: '/search',
                            search: "?defaultQuery=".concat(encodedQueryModel),
                        };
                    }, onFinish: function (result) {
                        AsyncTasks.restore({ lazyResult: result });
                        // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                        history.replace({
                            pathname: "/search/".concat(result.plain.metacard.properties['metacard.deleted.id']),
                            search: '',
                        });
                        menuStateRestore.handleClose();
                    } }))),
        React.createElement(Popover, { open: menuStateCopy.open, anchorEl: menuState.anchorRef.current, onClose: menuStateCopy.handleClose, anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
            } },
            React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" },
                React.createElement(SaveForm, { onClose: function () {
                        menuStateCopy.handleClose();
                    }, onSave: function (title) {
                        var currentQueryJSON = selectionInterface
                            .getCurrentQuery()
                            .toJSON();
                        currentQueryJSON.title = title;
                        var task = AsyncTasks.createSearch({ data: currentQueryJSON });
                        history.push({
                            pathname: "/search/".concat(task.data.id),
                            search: '',
                        });
                        addSnack("Making a copy of ".concat(title), {
                            alertProps: { severity: 'info' },
                        });
                    }, selectionInterface: selectionInterface }))),
        React.createElement(Popover, { open: menuStateRename.open, anchorEl: menuState.anchorRef.current, onClose: menuStateRename.handleClose, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } },
            React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" },
                React.createElement(SaveForm, { onClose: function () {
                        menuStateRename.handleClose();
                    }, onSave: function (title) {
                        if (typeof data !== 'boolean') {
                            var currentQueryJSON = selectionInterface
                                .getCurrentQuery()
                                .toJSON();
                            currentQueryJSON.title = title;
                            AsyncTasks.saveSearch({
                                data: currentQueryJSON,
                                lazyResult: data,
                            });
                        }
                    }, selectionInterface: selectionInterface }))),
        React.createElement(Popover, { open: menuStateNewFromExisting.open, anchorEl: menuState.anchorRef.current, onClose: menuStateNewFromExisting.handleClose, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } },
            React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" },
                React.createElement(OpenSearch, { label: "Start a new search from an existing saved search", constructLink: function (result) {
                        var copy = JSON.parse(JSON.stringify(result.plain.metacard.properties));
                        delete copy.id;
                        delete copy.title;
                        var encodedQueryModel = encodeURIComponent(JSON.stringify(copy));
                        return {
                            pathname: '/search',
                            search: "?defaultQuery=".concat(encodedQueryModel),
                        };
                    }, onFinish: function (result) {
                        var copy = JSON.parse(JSON.stringify(result.plain.metacard.properties));
                        delete copy.id;
                        delete copy.title;
                        var encodedQueryModel = encodeURIComponent(JSON.stringify(copy));
                        // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                        history.replace({
                            pathname: '/search',
                            search: "?defaultQuery=".concat(encodedQueryModel),
                        });
                        selectionInterface.getCurrentQuery().set(__assign(__assign({}, copy), { id: null, title: '' }));
                        addSnack("New search based on '".concat(result.plain.metacard.properties.title, "'"), {
                            alertProps: { severity: 'info' },
                        });
                        menuStateNewFromExisting.handleClose();
                    } }))),
        React.createElement(Popover, { open: menuStateOpenSearch.open, anchorEl: menuState.anchorRef.current, onClose: menuStateOpenSearch.handleClose, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } },
            React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" },
                React.createElement("div", { className: "flex flex-row flex-nowrap" },
                    React.createElement(OpenSearch, { label: "Open a saved search", constructLink: function (result) {
                            return "/search/".concat(result.plain.id);
                        }, onFinish: function (value) {
                            // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                            history.replace({
                                pathname: "/search/".concat(value.plain.id),
                                search: '',
                            });
                            addSnack("Search '".concat(value.plain.metacard.properties.title, "' opened"), {
                                alertProps: { severity: 'info' },
                            });
                            menuStateOpenSearch.handleClose();
                        } }),
                    React.createElement(Button, { color: "primary", onClick: function () {
                            menuStateOpenSearch.handleClose();
                            menuStateRestore.handleClick();
                        } }, "Check Trash?")))),
        React.createElement(Menu, { anchorEl: menuState.anchorRef.current, open: menuState.open, onClose: menuState.handleClose, keepMounted: true, disableEnforceFocus: true, disableAutoFocus: true, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } },
            React.createElement(MenuItem, { component: Link, to: "/search", onClick: function () {
                    menuState.handleClose();
                    selectionInterface
                        .getCurrentQuery()
                        .set('id', null)
                        .resetToDefaults();
                    addSnack('Starting a new search', {
                        alertProps: { severity: 'info' },
                    });
                } }, "New"),
            React.createElement(MenuItem, { component: "div", ref: menuStateNewFromExisting.anchorRef, onClick: function () {
                    menuState.handleClose();
                    menuStateNewFromExisting.handleClick();
                } }, "New from existing"),
            React.createElement(MenuItem, { component: "div", ref: menuStateOpenSearch.anchorRef, onClick: function () {
                    menuState.handleClose();
                    menuStateOpenSearch.handleClick();
                } }, "Open"),
            React.createElement(MenuItem, { component: Link, disabled: searchPageMode === 'adhoc' || typeof data === 'boolean', to: "/search?defaultQuery=".concat(encodedQueryModelJSON), onClick: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    menuState.handleClose();
                    menuStateCopy.handleClick();
                    return;
                } }, "Make a copy"),
            React.createElement(DarkDivider, { className: "m-2" }),
            React.createElement(MenuItem, { disabled: searchPageMode === 'adhoc' || typeof data === 'boolean', onClick: function () {
                    menuStateRename.handleClick();
                    menuState.handleClose();
                } }, "Rename"),
            React.createElement(MenuItem, { disabled: searchPageMode === 'adhoc' || typeof data === 'boolean', onClick: function () {
                    if (typeof data !== 'boolean') {
                        AsyncTasks.delete({ lazyResult: data });
                        history.push({
                            pathname: "/search",
                            search: '',
                        });
                    }
                    menuState.handleClose();
                } }, "Move to trash"),
            React.createElement(DarkDivider, { className: "m-2" }),
            React.createElement(MenuItem, { disabled: searchPageMode === 'saved' && typeof data === 'boolean', onClick: function () {
                    selectionInterface.getCurrentQuery().set('type', 'advanced');
                    if (searchPageMode === 'adhoc') {
                        // set this as their preference
                        TypedUserInstance.updateQuerySettings({
                            type: 'advanced',
                        });
                    }
                    menuState.handleClose();
                } }, "Advanced View"),
            React.createElement(MenuItem, { disabled: searchPageMode === 'saved' && typeof data === 'boolean', onClick: function () {
                    selectionInterface.getCurrentQuery().set('type', 'basic');
                    if (searchPageMode === 'adhoc') {
                        // set this as their preference
                        TypedUserInstance.updateQuerySettings({
                            type: 'basic',
                        });
                    }
                    menuState.handleClose();
                } }, "Basic View"))));
};
var SaveButton = function () {
    var closed = useResizableGridContext().closed;
    var _a = React.useContext(SavedSearchModeContext), data = _a.data, searchPageMode = _a.searchPageMode, isSaving = _a.isSaving;
    return (React.createElement(React.Fragment, null, closed ? (React.createElement(Button, { disabled: data === true, variant: "outlined", color: "primary", size: "small" },
        React.createElement(SaveIcon, null))) : (React.createElement(ButtonWithTwoStates, { disabled: data === true, variant: "outlined", color: "primary", size: "small", states: [
            { state: 'Saving', loading: true },
            {
                state: searchPageMode === 'adhoc' ? 'Save' : 'Save as',
                loading: false,
            },
        ], state: (function () {
            if (isSaving) {
                return 'Saving';
            }
            return searchPageMode === 'adhoc' ? 'Save' : 'Save as';
        })() }))));
};
var LeftBottom = function () {
    var _a = useResizableGridContext(), closed = _a.closed, setClosed = _a.setClosed, lastLength = _a.lastLength, setLength = _a.setLength;
    var _b = React.useContext(SavedSearchModeContext), data = _b.data, searchPageMode = _b.searchPageMode, selectionInterface = _b.selectionInterface;
    if (closed) {
        return (React.createElement("div", { className: "flex flex-col items-center w-full py-4  flex-nowrap shrink-0 overflow-hidden" },
            React.createElement("div", { className: "px-2" },
                React.createElement(Button, { fullWidth: true, variant: "text", color: "primary", size: "small", onClick: function () {
                        setClosed(false);
                        setLength(lastLength);
                    } },
                    React.createElement(KeyboardArrowRightIcon, { color: "inherit", className: "Mui-text-text-primary" }),
                    React.createElement(KeyboardArrowRightIcon, { color: "inherit", className: "-ml-5 Mui-text-text-primary" })),
                React.createElement(Button, { disabled: typeof data === 'boolean' && searchPageMode === 'saved', className: "mt-3", fullWidth: true, variant: "contained", color: "primary", size: "small", onClick: function () {
                        selectionInterface.getCurrentQuery().startSearchFromFirstPage();
                    } },
                    React.createElement(SearchIcon, null)))));
    }
    return (React.createElement(Grid, { container: true, direction: "row", alignItems: "center", className: "w-full min-h-16 py-1 px-2" },
        React.createElement(Grid, { item: true },
            React.createElement(Button, { variant: "text", color: "primary", size: "small", onClick: function () {
                    setClosed(true);
                } },
                "Collapse",
                React.createElement(KeyboardArrowLeftIcon, { color: "inherit", className: "Mui-text-text-primary Mui-icon-size-small" }),
                React.createElement(KeyboardArrowLeftIcon, { color: "inherit", className: "-ml-3 Mui-text-text-primary Mui-icon-size-small" }))),
        React.createElement(Grid, { item: true, className: "ml-auto" },
            React.createElement(Button, { disabled: typeof data === 'boolean' && searchPageMode === 'saved', variant: "contained", color: "primary", size: "small", onClick: function () {
                    selectionInterface.getCurrentQuery().startSearchFromFirstPage();
                } }, "Search"))));
};
var SaveIndicator = function () {
    var isSaving = React.useContext(SavedSearchModeContext).isSaving;
    var closed = useResizableGridContext().closed;
    var _a = __read(React.useState(false), 2), showTempMessage = _a[0], setShowTempMessage = _a[1];
    var popupState = useMenuState();
    useUpdateEffect(function () {
        var timeoutid = undefined;
        if (isSaving === false) {
            setShowTempMessage(true);
            timeoutid = window.setTimeout(function () {
                setShowTempMessage(false);
            }, 4000);
        }
        return function () {
            window.clearTimeout(timeoutid);
        };
    }, [isSaving]);
    return (React.createElement(React.Fragment, null,
        React.createElement(Popover, { anchorEl: popupState.anchorRef.current, open: popupState.open, onClose: popupState.handleClose, onMouseDown: function (e) {
                // otherwise since we're technically in a button this will trigger it
                e.stopPropagation();
            }, onClick: function (e) {
                // otherwise since we're technically in a button this will trigger it
                e.stopPropagation();
            }, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } },
            React.createElement(Paper, { elevation: Elevations.overlays },
                React.createElement("div", { className: "flex flex-row flex-nowrap items-center p-4 text-2xl Mui-text-primary" }, isSaving ? (React.createElement(React.Fragment, null,
                    React.createElement(CircularProgress, { className: "mr-2", style: { width: '1rem', height: '1rem' } }),
                    "Saving ...")) : (React.createElement(React.Fragment, null,
                    React.createElement(CloudDoneIcon, { className: "mr-2" }),
                    " All changes saved to the system."))),
                React.createElement(DarkDivider, null),
                React.createElement("div", { className: "p-4" }, "Every change you make is automatically saved."))),
        React.createElement(Button, { component: "div", className: "shrink-0", onClick: function (e) {
                e.stopPropagation();
                popupState.handleClick();
            }, ref: popupState.anchorRef },
            React.createElement("span", { className: "opacity-75 text-sm shrink-0 flex items-center flex-nowrap ".concat(closed ? 'mr-min flex-col' : 'mt-min flex-row') }, isSaving ? (React.createElement(React.Fragment, null,
                React.createElement(CircularProgress, { className: "text-current text-base", style: { width: '1rem', height: '1rem' } }),
                ' ',
                React.createElement("span", { className: "".concat(closed ? 'writing-mode-vertical-lr mt-1' : 'ml-1') }, "Saving ..."))) : (React.createElement(React.Fragment, null,
                React.createElement(CloudDoneIcon, { className: "text-base" }),
                ' ',
                React.createElement("span", { className: "".concat(closed ? 'writing-mode-vertical-lr mt-1' : 'ml-1') }, showTempMessage ? 'Saved' : '')))))));
};
var LeftTop = function () {
    var closed = useResizableGridContext().closed;
    var _a = React.useContext(SavedSearchModeContext), data = _a.data, searchPageMode = _a.searchPageMode, selectionInterface = _a.selectionInterface;
    useRerenderOnBackboneSync({
        lazyResult: typeof data !== 'boolean' ? data : undefined,
    });
    var history = useHistory();
    var adhocMenuState = useMenuState();
    var savedMenuState = useMenuState();
    return (React.createElement("div", { className: "min-h-16 ".concat(closed ? 'h-full shrink overflow-hidden' : '') },
        React.createElement("div", { className: "h-full w-full relative p-2 ".concat(closed
                ? 'flex flex-col flex-nowrap items-center'
                : 'flex flex-row flex-nowrap items-center') },
            searchPageMode === 'adhoc' ? (React.createElement(React.Fragment, null,
                React.createElement(Popover, { anchorEl: adhocMenuState.anchorRef.current, open: adhocMenuState.open, onClose: adhocMenuState.handleClose, anchorOrigin: {
                        vertical: closed ? 'top' : 'bottom',
                        horizontal: closed ? 'right' : 'left',
                    } },
                    React.createElement(Paper, { elevation: Elevations.overlays },
                        React.createElement(SaveForm, { onClose: function () {
                                adhocMenuState.handleClose();
                            }, selectionInterface: selectionInterface, onSave: function (title) {
                                selectionInterface.getCurrentQuery().set('title', title);
                                var searchData = selectionInterface
                                    .getCurrentQuery()
                                    .toJSON();
                                if (searchPageMode === 'adhoc') {
                                    var task = AsyncTasks.createSearch({
                                        data: searchData,
                                    });
                                    history.push({
                                        pathname: "/search/".concat(task.data.id),
                                        search: '',
                                    });
                                }
                                else if (typeof data !== 'boolean') {
                                    AsyncTasks.saveSearch({
                                        lazyResult: data,
                                        data: searchData,
                                    });
                                }
                            } }))),
                React.createElement(Button, { color: "inherit", component: "div", className: "text-left text-2xl shrink truncate ".concat(closed ? 'h-full' : ''), onClick: adhocMenuState.handleClick, size: "small", ref: adhocMenuState.anchorRef },
                    React.createElement("div", { className: "flex items-center flex-nowrap ".concat(closed ? 'flex-col h-full' : 'flex-row w-full') },
                        React.createElement("span", { className: "opacity-50 shrink truncate ".concat(closed ? 'writing-mode-vertical-lr mb-2' : 'mr-2') },
                            "Unsaved search",
                            ' '),
                        React.createElement(SaveButton, null))))) : null,
            data === false && searchPageMode === 'saved' ? (React.createElement("div", { className: "text-2xl opacity-50 ".concat(closed ? 'writing-mode-vertical-lr' : '') }, "Could not find search")) : null,
            data === true ? (React.createElement(React.Fragment, null,
                React.createElement(Skeleton, { variant: "rectangular", className: "w-full h-full" }))) : null,
            typeof data !== 'boolean' ? (React.createElement(React.Fragment, null,
                React.createElement(Popover, { anchorEl: savedMenuState.anchorRef.current, open: savedMenuState.open, onClose: savedMenuState.handleClose, anchorOrigin: {
                        vertical: closed ? 'top' : 'bottom',
                        horizontal: closed ? 'right' : 'left',
                    } },
                    React.createElement(Paper, { elevation: Elevations.overlays },
                        React.createElement(SaveForm, { onClose: savedMenuState.handleClose, selectionInterface: selectionInterface, onSave: function (title) {
                                selectionInterface.getCurrentQuery().set('title', title);
                                var searchData = selectionInterface
                                    .getCurrentQuery()
                                    .toJSON();
                                if (searchPageMode === 'adhoc') {
                                    AsyncTasks.createSearch({ data: searchData });
                                }
                                else if (typeof data !== 'boolean') {
                                    AsyncTasks.saveSearch({
                                        lazyResult: data,
                                        data: searchData,
                                    });
                                }
                            } }))),
                React.createElement(Button, { component: "div", fullWidth: true, className: "text-left text-2xl shrink overflow-hidden ".concat(closed ? 'h-full' : ''), onClick: savedMenuState.handleClick, size: "small", ref: savedMenuState.anchorRef },
                    React.createElement("div", { className: "flex items-center flex-nowrap ".concat(closed ? 'flex-col h-full' : 'w-full flex-row') },
                        React.createElement("span", { className: "truncate ".concat(closed ? 'writing-mode-vertical-lr mb-2 shrink' : 'mr-2') }, data.plain.metacard.properties.title),
                        React.createElement(SaveIndicator, null))))) : (React.createElement(React.Fragment, null)),
            React.createElement("div", { className: "ml-auto shrink-0 ".concat(closed ? 'w-full order-first pt-1 h-16' : '') },
                React.createElement(OptionsButton, null))),
        closed ? null : React.createElement(DarkDivider, { className: "h-min w-full" })));
};
var LeftMiddle = function () {
    var closed = useResizableGridContext().closed;
    var _a = React.useContext(SavedSearchModeContext), data = _a.data, searchPageMode = _a.searchPageMode, selectionInterface = _a.selectionInterface;
    if (data === false && searchPageMode === 'saved') {
        // eventually add something?
        return React.createElement("div", { className: "overflow-hidden w-full h-full shrink" });
    }
    return (React.createElement("div", { className: "overflow-hidden w-full ".concat(closed ? 'shrink hidden' : 'h-full') }, data === true ? (React.createElement(Skeleton, { variant: "rectangular", className: "w-full h-full p-10" })) : (React.createElement("div", { className: "w-full h-full overflow-auto pb-64 ".concat(closed ? 'hidden' : '') },
        React.createElement(QueryAddReact, { model: selectionInterface.getCurrentQuery() })))));
};
var useKeepSearchInUrl = function (_a) {
    var queryModel = _a.queryModel, on = _a.on;
    var history = useHistory();
    var _b = useBackbone(), listenTo = _b.listenTo, stopListening = _b.stopListening;
    React.useEffect(function () {
        // this is fairly expensive, so keep it heavily debounced
        var debouncedUpdate = _.debounce(function () {
            if (on) {
                var encodedQueryModel = encodeURIComponent(JSON.stringify(queryModel.toJSON()));
                history.replace({
                    search: "".concat(queryString.stringify({
                        defaultQuery: encodedQueryModel,
                    })),
                });
            }
        }, 2000);
        listenTo(queryModel, 'change', debouncedUpdate);
        return function () {
            debouncedUpdate.cancel();
            stopListening(queryModel, 'change', debouncedUpdate);
        };
    }, [on, queryModel]);
};
var useSearchPageMode = function (_a) {
    var id = _a.id;
    var _b = __read(React.useState(id ? 'saved' : 'adhoc'), 2), mode = _b[0], setMode = _b[1];
    React.useEffect(function () {
        if (id) {
            return setMode('saved');
        }
        return setMode('adhoc');
    }, [id]);
    return mode;
};
var useSavedSearchPageMode = function (_a) {
    var id = _a.id;
    // handle all loading / data in here
    var _b = __read(React.useState(false), 2), data = _b[0], setData = _b[1];
    var task = useCreateSearchTask({ id: id });
    var restoreTask = useRestoreSearchTask({ id: id });
    var _c = __read(useQuery({
        attributes: {
            sources: ['local'],
        },
    }), 1), queryModel = _c[0];
    React.useEffect(function () {
        if (task || restoreTask) {
            setData(true);
            return;
        }
        var subscriptionCancel = function () { };
        if (id) {
            setData(true);
            queryModel.set('filterTree', new FilterBuilderClass({
                filters: [
                    new FilterClass({
                        type: '=',
                        property: 'id',
                        value: id,
                    }),
                    new FilterClass({
                        type: 'ILIKE',
                        property: 'metacard-tags',
                        value: '*',
                    }),
                ],
            }));
            queryModel.initializeResult();
            var lazyResults_1 = queryModel
                .get('result')
                .get('lazyResults');
            subscriptionCancel = lazyResults_1.subscribeTo({
                subscribableThing: 'filteredResults',
                callback: function () {
                    var results = Object.values(lazyResults_1.results);
                    if (results.length > 0) {
                        setData(results[0]);
                    }
                    else {
                        setData(false);
                    }
                },
            });
            queryModel.startSearchFromFirstPage();
        }
        else {
            setData(false);
        }
        return function () {
            subscriptionCancel();
            queryModel.cancelCurrentSearches();
        };
    }, [id, task, restoreTask]);
    return data;
};
var AutoSave = function () {
    var _a = React.useContext(SavedSearchModeContext), searchPageMode = _a.searchPageMode, selectionInterface = _a.selectionInterface, data = _a.data;
    var queryModel = selectionInterface.getCurrentQuery();
    var on = searchPageMode === 'saved';
    var _b = useBackbone(), listenTo = _b.listenTo, stopListening = _b.stopListening;
    React.useEffect(function () {
        var callback = function () {
            var changedAttributes = Object.keys(queryModel.changedAttributes());
            var isFromSwappingToSavedSearch = changedAttributes.includes('id');
            var isAttributeThatMatters = changedAttributes.includes('filterTree') ||
                changedAttributes.includes('sorts') ||
                changedAttributes.includes('sources');
            if (on &&
                queryModel.get('id') &&
                !isFromSwappingToSavedSearch &&
                isAttributeThatMatters &&
                typeof data !== 'boolean') {
                AsyncTasks.saveSearch({
                    lazyResult: data,
                    data: queryModel.toJSON(),
                });
            }
        };
        listenTo(queryModel, 'change', callback);
        return function () {
            stopListening(queryModel, 'change', callback);
        };
    }, [on, queryModel, data]);
    return null;
};
var SavedSearchModeContext = React.createContext({
    data: false,
    searchPageMode: 'adhoc',
    isSaving: false,
    selectionInterface: {},
});
var decodeUrlIfValid = function (search) {
    if (location) {
        try {
            var queryParams = queryString.parse(search);
            var defaultQueryString = (queryParams['defaultQuery'] || '').toString();
            return JSON.parse(decodeURIComponent(defaultQueryString));
        }
        catch (err) {
            return {};
        }
    }
    else {
        return {};
    }
};
export var HomePage = function () {
    var location = useLocation();
    var _a = __read(useUserQuery({
        attributes: decodeUrlIfValid(location.search),
    }), 1), queryModel = _a[0];
    var id = useParams().id;
    var searchPageMode = useSearchPageMode({ id: id });
    var data = useSavedSearchPageMode({ id: id });
    var saveSearchTask = useSaveSearchTaskBasedOnParams();
    var isSaving = saveSearchTask !== null;
    React.useEffect(function () {
        var urlBasedQuery = location.search.split('?defaultQuery=')[1];
        if (urlBasedQuery) {
            ;
            selectionInterface.getCurrentQuery().startSearchFromFirstPage();
        }
    }, []);
    var _b = __read(React.useState(new SelectionInterfaceModel({
        currentQuery: queryModel,
    })), 1), selectionInterface = _b[0];
    useKeepSearchInUrl({
        queryModel: selectionInterface.getCurrentQuery(),
        on: searchPageMode === 'adhoc',
    });
    React.useEffect(function () {
        if (typeof data !== 'boolean') {
            selectionInterface.getCurrentQuery().set(data.plain.metacard.properties);
        }
    }, [data]);
    useUpdateEffect(function () {
        if (searchPageMode === 'adhoc') {
            selectionInterface.getCurrentQuery().unset('id');
            if (location.search === '') {
                selectionInterface.getCurrentQuery().resetToDefaults();
            }
        }
    }, [searchPageMode, location.search]);
    var setElement = useListenToEnterKeySubmitEvent({
        callback: function () {
            ;
            selectionInterface.getCurrentQuery().startSearchFromFirstPage();
        },
    }).setElement;
    return (React.createElement(SavedSearchModeContext.Provider, { value: {
            data: data,
            searchPageMode: searchPageMode,
            isSaving: isSaving,
            selectionInterface: selectionInterface,
        } },
        React.createElement(Memo, { dependencies: [selectionInterface] },
            React.createElement(AutoSave, null),
            React.createElement("div", { className: "w-full h-full" },
                React.createElement(SplitPane, { variant: "horizontal", collapsedLength: 80 },
                    React.createElement("div", { className: "h-full w-full py-2" },
                        React.createElement(Paper, { elevation: Elevations.panels, className: "h-full overflow-hidden w-full" },
                            React.createElement("div", { className: "flex flex-col flex-nowrap w-full h-full", ref: setElement },
                                React.createElement(LeftTop, null),
                                React.createElement(LeftMiddle, null),
                                React.createElement(DarkDivider, { className: "h-min w-full" }),
                                React.createElement(LeftBottom, null)))),
                    React.createElement("div", { className: "w-full h-full" },
                        React.createElement(GoldenLayout, { selectionInterface: selectionInterface })))))));
};
//# sourceMappingURL=search.js.map