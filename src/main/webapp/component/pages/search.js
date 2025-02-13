import { __assign, __read, __rest, __spreadArray } from "tslib";
import * as React from 'react';
import { GoldenLayout } from '../golden-layout/golden-layout';
import { SplitPane, useResizableGridContext, } from '../resizable-grid/resizable-grid';
import SelectionInterfaceModel from '../selection-interface/selection-interface.model';
import { useQuery, useUserQuery } from '../../js/model/TypedQuery';
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
    return (React.createElement("div", { className: "w-full min-h-16 py-1 px-2 flex flex-row flex-nowrap items-center" },
        React.createElement(Button, { variant: "text", color: "primary", size: "small", onClick: function () {
                setClosed(true);
            } },
            "Collapse",
            React.createElement(KeyboardArrowLeftIcon, { color: "inherit", className: "Mui-text-text-primary Mui-icon-size-small" }),
            React.createElement(KeyboardArrowLeftIcon, { color: "inherit", className: "-ml-3 Mui-text-text-primary Mui-icon-size-small" })),
        React.createElement(Button, { className: "ml-auto", disabled: typeof data === 'boolean' && searchPageMode === 'saved', variant: "contained", color: "primary", size: "small", onClick: function () {
                selectionInterface.getCurrentQuery().startSearchFromFirstPage();
            } }, "Search")));
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
            var lazyResults_1 = queryModel.getLazyResults();
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
            selectionInterface.getCurrentQuery().refetchOrStartSearchFromFirstPage();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9wYWdlcy9zZWFyY2gudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0NBQWdDLENBQUE7QUFDN0QsT0FBTyxFQUNMLFNBQVMsRUFDVCx1QkFBdUIsR0FDeEIsTUFBTSxrQ0FBa0MsQ0FBQTtBQUN6QyxPQUFPLHVCQUF1QixNQUFNLGtEQUFrRCxDQUFBO0FBQ3RGLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUE7QUFDbEUsT0FBTyxLQUFLLE1BQU0scUJBQXFCLENBQUE7QUFDdkMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFBO0FBQ3RELE9BQU8scUJBQXFCLE1BQU0sdUNBQXVDLENBQUE7QUFDekUsT0FBTyxzQkFBc0IsTUFBTSx3Q0FBd0MsQ0FBQTtBQUMzRSxPQUFPLFdBQVcsTUFBTSxjQUFjLENBQUE7QUFFdEMsT0FBTyxNQUF1QixNQUFNLHNCQUFzQixDQUFBO0FBQzFELE9BQU8sUUFBUSxNQUFNLDhCQUE4QixDQUFBO0FBQ25ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUMzQyxPQUFPLFVBQVUsTUFBTSxtQ0FBbUMsQ0FBQTtBQUMxRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUE7QUFDcEUsT0FBTyxFQUNMLElBQUksRUFFSixVQUFVLEVBQ1YsV0FBVyxFQUNYLFNBQVMsR0FDVixNQUFNLGtCQUFrQixDQUFBO0FBQ3pCLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLFNBQVMsTUFBTSx5QkFBeUIsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0s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QUFBO1lBQ0osY0FBYyxnQkFBQTtZQUNkLFFBQVEsVUFBQTtZQUNSLGtCQUFrQixvQkFBQTtTQUNuQjtRQUVELG9CQUFDLElBQUksSUFBQyxZQUFZLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztZQUN0QyxvQkFBQyxRQUFRLE9BQUc7WUFDWiw2QkFBSyxTQUFTLEVBQUMsZUFBZTtnQkFDNUIsb0JBQUMsU0FBUyxJQUNSLE9BQU8sRUFBQyxZQUFZLEVBQ3BCLGVBQWUsRUFBRSxFQUFFO29CQUduQiw2QkFBSyxTQUFTLEVBQUMsb0JBQW9CO3dCQUNqQyxvQkFBQyxLQUFLLElBQ0osU0FBUyxFQUFFLFVBQVUsQ0FBQyxNQUFNLEVBQzVCLFNBQVMsRUFBQywrQkFBK0I7NEJBRXpDLDZCQUNFLFNBQVMsRUFBQyx5Q0FBeUMsRUFDbkQsR0FBRyxFQUFFLFVBQVU7Z0NBRWYsb0JBQUMsT0FBTyxPQUFHO2dDQUVYLG9CQUFDLFVBQVUsT0FBRztnQ0FDZCxvQkFBQyxXQUFXLElBQUMsU0FBUyxFQUFDLGNBQWMsR0FBRztnQ0FDeEMsb0JBQUMsVUFBVSxPQUFHLENBQ1YsQ0FDQSxDQUNKO29CQUNOLDZCQUFLLFNBQVMsRUFBQyxlQUFlO3dCQUM1QixvQkFBQyxZQUFZLElBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLEdBQUksQ0FDcEQsQ0FDSSxDQUNSLENBQ0QsQ0FDeUIsQ0FDbkMsQ0FBQTtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgR29sZGVuTGF5b3V0IH0gZnJvbSAnLi4vZ29sZGVuLWxheW91dC9nb2xkZW4tbGF5b3V0J1xuaW1wb3J0IHtcbiAgU3BsaXRQYW5lLFxuICB1c2VSZXNpemFibGVHcmlkQ29udGV4dCxcbn0gZnJvbSAnLi4vcmVzaXphYmxlLWdyaWQvcmVzaXphYmxlLWdyaWQnXG5pbXBvcnQgU2VsZWN0aW9uSW50ZXJmYWNlTW9kZWwgZnJvbSAnLi4vc2VsZWN0aW9uLWludGVyZmFjZS9zZWxlY3Rpb24taW50ZXJmYWNlLm1vZGVsJ1xuaW1wb3J0IHsgdXNlUXVlcnksIHVzZVVzZXJRdWVyeSB9IGZyb20gJy4uLy4uL2pzL21vZGVsL1R5cGVkUXVlcnknXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IFF1ZXJ5QWRkUmVhY3QgfSBmcm9tICcuLi9xdWVyeS1hZGQvcXVlcnktYWRkJ1xuaW1wb3J0IEtleWJvYXJkQXJyb3dMZWZ0SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0tleWJvYXJkQXJyb3dMZWZ0J1xuaW1wb3J0IEtleWJvYXJkQXJyb3dSaWdodEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9LZXlib2FyZEFycm93UmlnaHQnXG5pbXBvcnQgcXVlcnlTdHJpbmcgZnJvbSAncXVlcnktc3RyaW5nJ1xuXG5pbXBvcnQgQnV0dG9uLCB7IEJ1dHRvblByb3BzIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgTW9yZVZlcnQgZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9Nb3JlVmVydCdcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi90aGVtZS90aGVtZSdcbmltcG9ydCBTZWFyY2hJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvU2VhcmNoVHdvVG9uZSdcbmltcG9ydCB7IHVzZUJhY2tib25lIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQge1xuICBMaW5rLFxuICBMaW5rUHJvcHMsXG4gIHVzZUhpc3RvcnksXG4gIHVzZUxvY2F0aW9uLFxuICB1c2VQYXJhbXMsXG59IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IHsgRGFya0RpdmlkZXIgfSBmcm9tICcuLi9kYXJrLWRpdmlkZXIvZGFyay1kaXZpZGVyJ1xuaW1wb3J0IExpbmVhclByb2dyZXNzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTGluZWFyUHJvZ3Jlc3MnXG5pbXBvcnQgeyB1c2VVcGRhdGVFZmZlY3QgfSBmcm9tICdyZWFjdC11c2UnXG5pbXBvcnQge1xuICBGaWx0ZXJCdWlsZGVyQ2xhc3MsXG4gIEZpbHRlckNsYXNzLFxufSBmcm9tICcuLi9maWx0ZXItYnVpbGRlci9maWx0ZXIuc3RydWN0dXJlJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCBTa2VsZXRvbiBmcm9tICdAbXVpL21hdGVyaWFsL1NrZWxldG9uJ1xuaW1wb3J0IENpcmN1bGFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9DaXJjdWxhclByb2dyZXNzJ1xuaW1wb3J0IHtcbiAgdXNlUmVyZW5kZXJPbkJhY2tib25lU3luYyxcbiAgdXNlU3RhdHVzT2ZMYXp5UmVzdWx0cyxcbn0gZnJvbSAnLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L2hvb2tzJ1xuaW1wb3J0IENsb3VkRG9uZUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9DbG91ZERvbmUnXG5pbXBvcnQgU2F2ZUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9TYXZlJ1xuaW1wb3J0IHsgdXNlTWVudVN0YXRlIH0gZnJvbSAnLi4vbWVudS1zdGF0ZS9tZW51LXN0YXRlJ1xuaW1wb3J0IE1lbnVJdGVtIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTWVudUl0ZW0nXG5pbXBvcnQgTWVudSBmcm9tICdAbXVpL21hdGVyaWFsL01lbnUnXG5pbXBvcnQgeyBUeXBlZFVzZXJJbnN0YW5jZSB9IGZyb20gJy4uL3NpbmdsZXRvbnMvVHlwZWRVc2VyJ1xuaW1wb3J0IHVzZVNuYWNrIGZyb20gJy4uL2hvb2tzL3VzZVNuYWNrJ1xuaW1wb3J0IFBvcG92ZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9Qb3BvdmVyJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSwgeyBBdXRvY29tcGxldGVQcm9wcyB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQXV0b2NvbXBsZXRlJ1xuaW1wb3J0IHsgdXNlTGF6eVJlc3VsdHNGcm9tU2VsZWN0aW9uSW50ZXJmYWNlIH0gZnJvbSAnLi4vc2VsZWN0aW9uLWludGVyZmFjZS9ob29rcydcbmltcG9ydCBPdmVyZmxvd1Rvb2x0aXAsIHtcbiAgT3ZlcmZsb3dUb29sdGlwSFRNTEVsZW1lbnQsXG59IGZyb20gJy4uL292ZXJmbG93LXRvb2x0aXAvb3ZlcmZsb3ctdG9vbHRpcCdcbmltcG9ydCB7XG4gIEFzeW5jVGFza3MsXG4gIHVzZUNyZWF0ZVNlYXJjaFRhc2ssXG4gIHVzZVJlc3RvcmVTZWFyY2hUYXNrLFxuICB1c2VTYXZlU2VhcmNoVGFza0Jhc2VkT25QYXJhbXMsXG59IGZyb20gJy4uLy4uL2pzL21vZGVsL0FzeW5jVGFzay9hc3luYy10YXNrJ1xuaW1wb3J0IHsgTWVtbyB9IGZyb20gJy4uL21lbW8vbWVtbydcbmltcG9ydCB7IHVzZUxpc3RlblRvRW50ZXJLZXlTdWJtaXRFdmVudCB9IGZyb20gJy4uL2N1c3RvbS1ldmVudHMvZW50ZXIta2V5LXN1Ym1pdCdcblxudHlwZSBTYXZlRm9ybVR5cGUgPSB7XG4gIHNlbGVjdGlvbkludGVyZmFjZTogYW55XG4gIG9uU2F2ZTogKHRpdGxlOiBzdHJpbmcpID0+IHZvaWRcbiAgb25DbG9zZTogKCkgPT4gdm9pZFxufVxuXG5leHBvcnQgY29uc3QgU2F2ZUZvcm0gPSAoe1xuICBvbkNsb3NlLFxuICBzZWxlY3Rpb25JbnRlcmZhY2UsXG4gIG9uU2F2ZSxcbn06IFNhdmVGb3JtVHlwZSkgPT4ge1xuICBjb25zdCBjdXJyZW50UXVlcnkgPSBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KClcblxuICBjb25zdCBbdGl0bGUsIHNldFRpdGxlXSA9IFJlYWN0LnVzZVN0YXRlKGN1cnJlbnRRdWVyeS5nZXQoJ3RpdGxlJykgfHwgJycpXG4gIGNvbnN0IFt2YWxpZGF0aW9uLCBzZXRWYWxpZGF0aW9uXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIHt9IGFzIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH1cbiAgKVxuICB1c2VVcGRhdGVFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghdGl0bGUpIHtcbiAgICAgIHNldFZhbGlkYXRpb24oe1xuICAgICAgICB0aXRsZTogJ0Nhbm5vdCBiZSBibGFuaycsXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRWYWxpZGF0aW9uKHt9KVxuICAgIH1cbiAgfSwgW3RpdGxlXSlcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8Zm9ybVxuICAgICAgICBhY3Rpb249XCIuL2JsYW5rLmh0bWxcIlxuICAgICAgICBtZXRob2Q9XCJQT1NUXCJcbiAgICAgICAgb25TdWJtaXQ9eyhlKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aXRsZSkge1xuICAgICAgICAgICAgc2V0VmFsaWRhdGlvbih7XG4gICAgICAgICAgICAgIHRpdGxlOiAnQ2Fubm90IGJlIGJsYW5rJyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50UXVlcnkuc2V0KCd0aXRsZScsIHRpdGxlKVxuICAgICAgICAgICAgb25TYXZlKHRpdGxlKVxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICAgICAgICBvbkNsb3NlKClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfX1cbiAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiXG4gICAgICA+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0yXCI+XG4gICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICBsYWJlbD1cIk5hbWVcIlxuICAgICAgICAgICAgdmFsdWU9e3RpdGxlfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgIHNldFRpdGxlKGUudGFyZ2V0LnZhbHVlKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGVycm9yPXtCb29sZWFuKHZhbGlkYXRpb24udGl0bGUpfVxuICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgICBvbkZvY3VzPXsoZSkgPT4ge1xuICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3QoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGhlbHBlclRleHQ9e3ZhbGlkYXRpb24udGl0bGV9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPERhcmtEaXZpZGVyIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXJvdyBmbGV4LW5vd3JhcCBhbGlnbiBqdXN0aWZ5LWVuZCBwLTJcIj5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIG9uQ2xvc2UoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICBDYW5jZWxcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBkaXNhYmxlZD17T2JqZWN0LmtleXModmFsaWRhdGlvbikubGVuZ3RoID4gMH1cbiAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibWwtM1wiXG4gICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgU2F2ZVxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZm9ybT5cbiAgICA8Lz5cbiAgKVxufVxuXG50eXBlIEJ1dHRvbldpdGhNdWx0aXBsZVN0YXRlc1R5cGUgPSB7XG4gIHN0YXRlczogeyBzdGF0ZTogc3RyaW5nOyBsb2FkaW5nOiBib29sZWFuIH1bXVxuICBzdGF0ZTogc3RyaW5nXG4gIGxhYmVsQ2xhc3NOYW1lPzogc3RyaW5nXG59ICYgT21pdDxCdXR0b25Qcm9wcywgJ2NoaWxkcmVuJz5cbmNvbnN0IEJ1dHRvbldpdGhUd29TdGF0ZXMgPSAocHJvcHM6IEJ1dHRvbldpdGhNdWx0aXBsZVN0YXRlc1R5cGUpID0+IHtcbiAgY29uc3QgeyBzdGF0ZXMsIHN0YXRlLCAuLi5idXR0b25Qcm9wcyB9ID0gcHJvcHNcbiAgaWYgKHN0YXRlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gPGRpdj5Zb3UgbXVzdCBzcGVjaWZ5IGF0IGxlYXN0IG9uZSBzdGF0ZTwvZGl2PlxuICB9XG4gIGNvbnN0IGxvbmdlc3RTdGF0ZSA9IHN0YXRlcy5yZWR1Y2UoKGxvbmdlc3QsIGN1cnJlbnQpID0+IHtcbiAgICBpZiAoY3VycmVudC5zdGF0ZS5sZW5ndGggPiBsb25nZXN0Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGN1cnJlbnQuc3RhdGVcbiAgICB9XG4gICAgcmV0dXJuIGxvbmdlc3RcbiAgfSwgc3RhdGVzWzBdLnN0YXRlKVxuICBjb25zdCBjdXJyZW50U3RhdGUgPSBzdGF0ZXMuZmluZCgoc3RhdGVJbmZvKSA9PiBzdGF0ZUluZm8uc3RhdGUgPT09IHN0YXRlKVxuICBpZiAoY3VycmVudFN0YXRlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gPGRpdj5Zb3UgbXVzdCBzcGVjaWZ5IGEgdmFsaWQgc3RhdGU8L2Rpdj5cbiAgfVxuICBjb25zdCBpc0xvYWRpbmcgPSBjdXJyZW50U3RhdGU/LmxvYWRpbmdcbiAgcmV0dXJuIChcbiAgICA8QnV0dG9uIGRpc2FibGVkPXtpc0xvYWRpbmd9IHsuLi5idXR0b25Qcm9wc30+XG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2BpbnZpc2libGUgJHtwcm9wcy5sYWJlbENsYXNzTmFtZX1gfT5cbiAgICAgICAge2xvbmdlc3RTdGF0ZX1cbiAgICAgIDwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGFic29sdXRlICR7cHJvcHMubGFiZWxDbGFzc05hbWV9YH0+e3N0YXRlfTwvc3Bhbj5cbiAgICAgIHtpc0xvYWRpbmcgPyAoXG4gICAgICAgIDxMaW5lYXJQcm9ncmVzc1xuICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMCB0b3AtMCB3LWZ1bGwgaC1mdWxsIG9wYWNpdHktNTBcIlxuICAgICAgICAgIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvQnV0dG9uPlxuICApXG59XG5cbmNvbnN0IHVzZVNlYXJjaFJlc3VsdHMgPSAoe1xuICBzZWFyY2hUZXh0LFxuICBhcmNoaXZlZCA9IGZhbHNlLFxufToge1xuICBzZWFyY2hUZXh0OiBzdHJpbmdcbiAgYXJjaGl2ZWQ/OiBib29sZWFuXG59KSA9PiB7XG4gIGNvbnN0IFtzdGF0ZSwgc2V0U3RhdGVdID0gUmVhY3QudXNlU3RhdGUoe1xuICAgIGxhenlSZXN1bHRzOiBbXSxcbiAgICBsb2FkaW5nOiB0cnVlLFxuICB9IGFzIHsgbGF6eVJlc3VsdHM6IExhenlRdWVyeVJlc3VsdFtdOyBsb2FkaW5nOiBib29sZWFuIH0pXG4gIGNvbnN0IFtoYXNTZWFyY2hlZCwgc2V0SGFzU2VhcmNoZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtxdWVyeU1vZGVsXSA9IHVzZVF1ZXJ5KHtcbiAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICBzb3J0czogW3sgYXR0cmlidXRlOiAnbWV0YWNhcmQubW9kaWZpZWQnLCBkaXJlY3Rpb246ICdkZXNjZW5kaW5nJyB9XSxcbiAgICAgIGZpbHRlclRyZWU6IG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICBwcm9wZXJ0eTogJ3RpdGxlJyxcbiAgICAgICAgICAgIHZhbHVlOiBgKiR7c2VhcmNoVGV4dH0qYCxcbiAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHByb3BlcnR5OiBhcmNoaXZlZCA/ICdtZXRhY2FyZC5kZWxldGVkLnRhZ3MnIDogJ21ldGFjYXJkLXRhZ3MnLFxuICAgICAgICAgICAgdmFsdWU6ICdxdWVyeScsXG4gICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIC4uLihhcmNoaXZlZFxuICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnbWV0YWNhcmQtdGFncycsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogJyonLFxuICAgICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgOiBbXSksXG4gICAgICAgIF0sXG4gICAgICB9KSxcbiAgICB9LFxuICB9KVxuXG4gIGNvbnN0IFtzZWxlY3Rpb25JbnRlcmZhY2VdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgbmV3IFNlbGVjdGlvbkludGVyZmFjZU1vZGVsKHtcbiAgICAgIGN1cnJlbnRRdWVyeTogcXVlcnlNb2RlbCxcbiAgICB9KVxuICApXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpLnNldChcbiAgICAgICdmaWx0ZXJUcmVlJyxcbiAgICAgIG5ldyBGaWx0ZXJCdWlsZGVyQ2xhc3Moe1xuICAgICAgICB0eXBlOiAnQU5EJyxcbiAgICAgICAgZmlsdGVyczogW1xuICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICBwcm9wZXJ0eTogJ3RpdGxlJyxcbiAgICAgICAgICAgIHZhbHVlOiBgKiR7c2VhcmNoVGV4dH0qYCxcbiAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgfSksXG4gICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgIHByb3BlcnR5OiBhcmNoaXZlZCA/ICdtZXRhY2FyZC5kZWxldGVkLnRhZ3MnIDogJ21ldGFjYXJkLXRhZ3MnLFxuICAgICAgICAgICAgdmFsdWU6ICdxdWVyeScsXG4gICAgICAgICAgICB0eXBlOiAnSUxJS0UnLFxuICAgICAgICAgIH0pLFxuICAgICAgICAgIC4uLihhcmNoaXZlZFxuICAgICAgICAgICAgPyBbXG4gICAgICAgICAgICAgICAgbmV3IEZpbHRlckNsYXNzKHtcbiAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnbWV0YWNhcmQtdGFncycsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogJyonLFxuICAgICAgICAgICAgICAgICAgdHlwZTogJ0lMSUtFJyxcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgOiBbXSksXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgIClcbiAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuY2FuY2VsQ3VycmVudFNlYXJjaGVzKClcbiAgICBzZXRTdGF0ZSh7XG4gICAgICBsYXp5UmVzdWx0czogW10sXG4gICAgICBsb2FkaW5nOiB0cnVlLFxuICAgIH0pXG4gICAgY29uc3QgdGltZW91dElkID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKHNlYXJjaFRleHQubGVuZ3RoID49IDApIHtcbiAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpLnN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZSgpXG4gICAgICAgIHNldEhhc1NlYXJjaGVkKHRydWUpXG4gICAgICB9XG4gICAgfSwgNTAwKVxuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dElkKVxuICAgIH1cbiAgfSwgW3NlYXJjaFRleHRdKVxuICBjb25zdCBsYXp5UmVzdWx0cyA9IHVzZUxhenlSZXN1bHRzRnJvbVNlbGVjdGlvbkludGVyZmFjZSh7XG4gICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICB9KVxuICBjb25zdCB7IGlzU2VhcmNoaW5nIH0gPSB1c2VTdGF0dXNPZkxhenlSZXN1bHRzKHsgbGF6eVJlc3VsdHMgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRTdGF0ZSh7XG4gICAgICBsYXp5UmVzdWx0czogT2JqZWN0LnZhbHVlcyhsYXp5UmVzdWx0cy5yZXN1bHRzKSxcbiAgICAgIGxvYWRpbmc6IGhhc1NlYXJjaGVkID8gaXNTZWFyY2hpbmcgOiB0cnVlLFxuICAgIH0pXG4gIH0sIFtsYXp5UmVzdWx0cywgaXNTZWFyY2hpbmddKVxuICByZXR1cm4gc3RhdGVcbn1cblxuZXhwb3J0IGNvbnN0IE9wZW5TZWFyY2ggPSAoe1xuICBvbkZpbmlzaCxcbiAgY29uc3RydWN0TGluayxcbiAgbGFiZWwsXG4gIGFyY2hpdmVkID0gZmFsc2UsXG4gIGF1dG9jb21wbGV0ZVByb3BzLFxufToge1xuICBvbkZpbmlzaDogKHNlbGVjdGlvbjogTGF6eVF1ZXJ5UmVzdWx0KSA9PiB2b2lkXG4gIGNvbnN0cnVjdExpbms6IChyZXN1bHQ6IExhenlRdWVyeVJlc3VsdCkgPT4gTGlua1Byb3BzWyd0byddXG4gIGxhYmVsOiBzdHJpbmdcbiAgYXJjaGl2ZWQ/OiBib29sZWFuXG4gIGF1dG9jb21wbGV0ZVByb3BzPzogUGFydGlhbDxcbiAgICBBdXRvY29tcGxldGVQcm9wczxMYXp5UXVlcnlSZXN1bHQsIGZhbHNlLCB0cnVlLCBmYWxzZT5cbiAgPlxufSkgPT4ge1xuICBjb25zdCBbcG9zaXRpb25pbmdEb25lLCBzZXRQb3NpdGlvbmluZ0RvbmVdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFt2YWx1ZSwgc2V0VmFsdWVdID0gUmVhY3QudXNlU3RhdGUoJycpXG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IFJlYWN0LnVzZVN0YXRlKHRydWUpXG4gIGNvbnN0IGlucHV0UmVmID0gUmVhY3QudXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKVxuICBjb25zdCBbY3VycmVudEhpZ2hsaWdodCwgc2V0Q3VycmVudEhpZ2hsaWdodF0gPVxuICAgIFJlYWN0LnVzZVN0YXRlPE92ZXJmbG93VG9vbHRpcEhUTUxFbGVtZW50IHwgbnVsbD4obnVsbClcbiAgY29uc3QgW29wdGlvbnMsIHNldE9wdGlvbnNdID0gUmVhY3QudXNlU3RhdGU8TGF6eVF1ZXJ5UmVzdWx0W10+KFtdKVxuICBjb25zdCB7IGxhenlSZXN1bHRzLCBsb2FkaW5nIH0gPSB1c2VTZWFyY2hSZXN1bHRzKHtcbiAgICBzZWFyY2hUZXh0OiB2YWx1ZSxcbiAgICBhcmNoaXZlZCxcbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRPcHRpb25zKGxhenlSZXN1bHRzKVxuICB9LCBbbGF6eVJlc3VsdHNdKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGN1cnJlbnRIaWdobGlnaHQgJiYgY3VycmVudEhpZ2hsaWdodC5vdmVyZmxvd1Rvb2x0aXApIHtcbiAgICAgIGN1cnJlbnRIaWdobGlnaHQub3ZlcmZsb3dUb29sdGlwLnNldE9wZW4odHJ1ZSlcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGlmIChjdXJyZW50SGlnaGxpZ2h0ICYmIGN1cnJlbnRIaWdobGlnaHQub3ZlcmZsb3dUb29sdGlwKVxuICAgICAgICBjdXJyZW50SGlnaGxpZ2h0Lm92ZXJmbG93VG9vbHRpcC5zZXRPcGVuKGZhbHNlKVxuICAgIH1cbiAgfSwgW2N1cnJlbnRIaWdobGlnaHRdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHRpbWVvdXRpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHNldFBvc2l0aW9uaW5nRG9uZSh0cnVlKVxuICAgIH0sIDUwMClcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0aWQpXG4gICAgfVxuICB9LCBbXSlcbiAgcmV0dXJuIChcbiAgICA8QXV0b2NvbXBsZXRlXG4gICAgICBjbGFzc05hbWU9XCJ3LTY0XCJcbiAgICAgIGlzT3B0aW9uRXF1YWxUb1ZhbHVlPXsob3B0aW9uKSA9PiBvcHRpb24ucGxhaW4uaWQgPT09IG9wdGlvbi5wbGFpbi5pZH1cbiAgICAgIGdldE9wdGlvbkxhYmVsPXsob3B0aW9uKSA9PiBvcHRpb24ucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX1cbiAgICAgIG9wdGlvbnM9e29wdGlvbnN9XG4gICAgICByZWY9e2lucHV0UmVmfVxuICAgICAgb3Blbj17b3BlbiAmJiBwb3NpdGlvbmluZ0RvbmV9XG4gICAgICBvbk9wZW49eygpID0+IHtcbiAgICAgICAgc2V0T3Blbih0cnVlKVxuICAgICAgfX1cbiAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgc2V0T3BlbihmYWxzZSlcbiAgICAgIH19XG4gICAgICBsb2FkaW5nPXtsb2FkaW5nfVxuICAgICAgYXV0b0hpZ2hsaWdodFxuICAgICAgb25IaWdobGlnaHRDaGFuZ2U9eygpID0+IHtcbiAgICAgICAgaWYgKGlucHV0UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICBjb25zdCBoaWdobGlnaHRlZEVsZW1lbnRTdHJpbmcgPSAoXG4gICAgICAgICAgICBpbnB1dFJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykgYXMgSFRNTElucHV0RWxlbWVudFxuICAgICAgICAgICkuZ2V0QXR0cmlidXRlKCdhcmlhLWFjdGl2ZWRlc2NlbmRhbnQnKVxuICAgICAgICAgIGlmIChoaWdobGlnaHRlZEVsZW1lbnRTdHJpbmcpIHtcbiAgICAgICAgICAgIHNldEN1cnJlbnRIaWdobGlnaHQoXG4gICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkRWxlbWVudFN0cmluZ1xuICAgICAgICAgICAgICAgICkgYXMgSFRNTExJRWxlbWVudFxuICAgICAgICAgICAgICApLnF1ZXJ5U2VsZWN0b3IoJ2RpdicpIGFzIE92ZXJmbG93VG9vbHRpcEhUTUxFbGVtZW50XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldEN1cnJlbnRIaWdobGlnaHQobnVsbClcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2V0Q3VycmVudEhpZ2hsaWdodChudWxsKVxuICAgICAgICB9XG4gICAgICB9fVxuICAgICAgbm9PcHRpb25zVGV4dD1cIk5vdGhpbmcgZm91bmQuXCJcbiAgICAgIHJlbmRlck9wdGlvbj17KHByb3BzLCBvcHRpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8bGkgey4uLnByb3BzfT5cbiAgICAgICAgICAgIDxMaW5rXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwLTAgZm9udC1ub3JtYWwgbm8tdW5kZXJsaW5lIGhvdmVyOmZvbnQtbm9ybWFsIGhvdmVyOm5vLXVuZGVybGluZVwiXG4gICAgICAgICAgICAgIHRvPXtjb25zdHJ1Y3RMaW5rKG9wdGlvbil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxPdmVyZmxvd1Rvb2x0aXBcbiAgICAgICAgICAgICAgICB0b29sdGlwUHJvcHM9e3tcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIHAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtvcHRpb24ucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRydW5jYXRlIHctZnVsbCBwLTJcIj5cbiAgICAgICAgICAgICAgICAgIHtvcHRpb24ucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9PdmVyZmxvd1Rvb2x0aXA+XG4gICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgKVxuICAgICAgfX1cbiAgICAgIExpc3Rib3hQcm9wcz17e1xuICAgICAgICBjbGFzc05hbWU6ICdjaGlsZHJlbi1wLTAgTXVpQXV0b2NvbXBsZXRlLWxpc3Rib3gnLCAvLyB3ZSBoYXZlIHRvIGFkZCB0aGUgb3JpZ2luYWwgY2xhc3MgKE11aUF1dG9jb21wbGV0ZS1saXN0Ym94KSBiYWNrIG9uIHVuZm9ydHVuYXRlbHlcbiAgICAgIH19XG4gICAgICBvbkNoYW5nZT17KF9lLCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICBvbkZpbmlzaCh2YWx1ZSlcbiAgICAgICAgfVxuICAgICAgfX1cbiAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgey4uLnBhcmFtc31cbiAgICAgICAgICAgIHZhbHVlPXt2YWx1ZX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICBzZXRWYWx1ZShlLnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBsYWJlbD17bGFiZWx9XG4gICAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgICBJbnB1dFByb3BzPXt7XG4gICAgICAgICAgICAgIC4uLnBhcmFtcy5JbnB1dFByb3BzLFxuICAgICAgICAgICAgICBlbmRBZG9ybm1lbnQ6IChcbiAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgICB7bG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgICAgPENpcmN1bGFyUHJvZ3Jlc3MgY29sb3I9XCJpbmhlcml0XCIgc2l6ZT17MjB9IC8+XG4gICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgIHtwYXJhbXMuSW5wdXRQcm9wcy5lbmRBZG9ybm1lbnR9XG4gICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgKVxuICAgICAgfX1cbiAgICAgIHsuLi5hdXRvY29tcGxldGVQcm9wc31cbiAgICAvPlxuICApXG59XG5cbmNvbnN0IE9wdGlvbnNCdXR0b24gPSAoKSA9PiB7XG4gIGNvbnN0IHsgc2VhcmNoUGFnZU1vZGUsIGRhdGEsIHNlbGVjdGlvbkludGVyZmFjZSB9ID0gUmVhY3QudXNlQ29udGV4dChcbiAgICBTYXZlZFNlYXJjaE1vZGVDb250ZXh0XG4gIClcbiAgY29uc3QgeyBjbG9zZWQgfSA9IHVzZVJlc2l6YWJsZUdyaWRDb250ZXh0KClcbiAgY29uc3QgbWVudVN0YXRlID0gdXNlTWVudVN0YXRlKClcbiAgY29uc3QgbWVudVN0YXRlT3BlblNlYXJjaCA9IHVzZU1lbnVTdGF0ZSgpXG4gIGNvbnN0IG1lbnVTdGF0ZU5ld0Zyb21FeGlzdGluZyA9IHVzZU1lbnVTdGF0ZSgpXG4gIGNvbnN0IG1lbnVTdGF0ZUNvcHkgPSB1c2VNZW51U3RhdGUoKVxuICBjb25zdCBtZW51U3RhdGVSZW5hbWUgPSB1c2VNZW51U3RhdGUoKVxuICBjb25zdCBtZW51U3RhdGVSZXN0b3JlID0gdXNlTWVudVN0YXRlKClcbiAgY29uc3QgYWRkU25hY2sgPSB1c2VTbmFjaygpXG4gIGNvbnN0IGhpc3RvcnkgPSB1c2VIaXN0b3J5KClcbiAgY29uc3QgW2VuY29kZWRRdWVyeU1vZGVsSlNPTiwgc2V0RW5jb2RlZFF1ZXJ5TW9kZWxKU09OXSA9IFJlYWN0LnVzZVN0YXRlKCcnKVxuXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0RW5jb2RlZFF1ZXJ5TW9kZWxKU09OKFxuICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KFxuICAgICAgICBKU09OLnN0cmluZ2lmeShzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkudG9KU09OKCkpXG4gICAgICApXG4gICAgKVxuICB9LCBbbWVudVN0YXRlLm9wZW5dKVxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8QnV0dG9uXG4gICAgICAgIGNvbXBvbmVudD1cImRpdlwiXG4gICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICByZWY9e21lbnVTdGF0ZS5hbmNob3JSZWZ9XG4gICAgICAgIG9uQ2xpY2s9e21lbnVTdGF0ZS5oYW5kbGVDbGlja31cbiAgICAgID5cbiAgICAgICAge2Nsb3NlZCA/IG51bGwgOiA8c3BhbiBjbGFzc05hbWU9XCJNdWktdGV4dC1wcmltYXJ5XCI+T3B0aW9uczwvc3Bhbj59XG4gICAgICAgIDxNb3JlVmVydCAvPlxuICAgICAgPC9CdXR0b24+XG4gICAgICA8UG9wb3ZlclxuICAgICAgICBvcGVuPXttZW51U3RhdGVSZXN0b3JlLm9wZW59XG4gICAgICAgIGFuY2hvckVsPXttZW51U3RhdGUuYW5jaG9yUmVmLmN1cnJlbnR9XG4gICAgICAgIG9uQ2xvc2U9e21lbnVTdGF0ZVJlc3RvcmUuaGFuZGxlQ2xvc2V9XG4gICAgICAgIGFuY2hvck9yaWdpbj17eyB2ZXJ0aWNhbDogJ2JvdHRvbScsIGhvcml6b250YWw6ICdsZWZ0JyB9fVxuICAgICAgPlxuICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLm92ZXJsYXlzfSBjbGFzc05hbWU9XCJwLTJcIj5cbiAgICAgICAgICA8T3BlblNlYXJjaFxuICAgICAgICAgICAgbGFiZWw9XCJSZXN0b3JlIGEgc2VhcmNoIGZyb20gdGhlIHRyYXNoXCJcbiAgICAgICAgICAgIGFyY2hpdmVkXG4gICAgICAgICAgICBjb25zdHJ1Y3RMaW5rPXsocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvcHkgPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIGRlbGV0ZSBjb3B5LmlkXG4gICAgICAgICAgICAgIGRlbGV0ZSBjb3B5LnRpdGxlXG4gICAgICAgICAgICAgIGRlbGV0ZSBjb3B5WydtZXRhY2FyZC5kZWxldGVkLmRhdGUnXVxuICAgICAgICAgICAgICBkZWxldGUgY29weVsnbWV0YWNhcmQuZGVsZXRlZC5pZCddXG4gICAgICAgICAgICAgIGRlbGV0ZSBjb3B5WydtZXRhY2FyZC5kZWxldGVkLnRhZ3MnXVxuICAgICAgICAgICAgICBkZWxldGUgY29weVsnbWV0YWNhcmQuZGVsZXRlZC52ZXJzaW9uJ11cbiAgICAgICAgICAgICAgZGVsZXRlIGNvcHlbJ21ldGFjYXJkLXRhZ3MnXVxuICAgICAgICAgICAgICBkZWxldGUgY29weVsnbWV0YWNhcmQtdHlwZSddXG5cbiAgICAgICAgICAgICAgY29uc3QgZW5jb2RlZFF1ZXJ5TW9kZWwgPSBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY29weSkpXG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcGF0aG5hbWU6ICcvc2VhcmNoJyxcbiAgICAgICAgICAgICAgICBzZWFyY2g6IGA/ZGVmYXVsdFF1ZXJ5PSR7ZW5jb2RlZFF1ZXJ5TW9kZWx9YCxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uRmluaXNoPXsocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgIEFzeW5jVGFza3MucmVzdG9yZSh7IGxhenlSZXN1bHQ6IHJlc3VsdCB9KVxuICAgICAgICAgICAgICAvLyByZXBsYWNlIGJlY2F1c2UgdGVjaG5pY2FsbHkgdGhleSBnZXQgdGhlIGxpbmsgaW4gY29uc3RydWN0TGluayBwdXQgaW50byBoaXN0b3J5IGFzIHdlbGwgdW5mb3J0dW5hdGVseSwgd2lsbCBuZWVkIHRvIGZpeCB0aGlzIG1vcmUgZ2VuZXJhbGx5XG4gICAgICAgICAgICAgIGhpc3RvcnkucmVwbGFjZSh7XG4gICAgICAgICAgICAgICAgcGF0aG5hbWU6IGAvc2VhcmNoLyR7cmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ21ldGFjYXJkLmRlbGV0ZWQuaWQnXX1gLFxuICAgICAgICAgICAgICAgIHNlYXJjaDogJycsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIG1lbnVTdGF0ZVJlc3RvcmUuaGFuZGxlQ2xvc2UoKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhcGVyPlxuICAgICAgPC9Qb3BvdmVyPlxuICAgICAgPFBvcG92ZXJcbiAgICAgICAgb3Blbj17bWVudVN0YXRlQ29weS5vcGVufVxuICAgICAgICBhbmNob3JFbD17bWVudVN0YXRlLmFuY2hvclJlZi5jdXJyZW50fVxuICAgICAgICBvbkNsb3NlPXttZW51U3RhdGVDb3B5LmhhbmRsZUNsb3NlfVxuICAgICAgICBhbmNob3JPcmlnaW49e3tcbiAgICAgICAgICB2ZXJ0aWNhbDogJ2JvdHRvbScsXG4gICAgICAgICAgaG9yaXpvbnRhbDogJ2xlZnQnLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLm92ZXJsYXlzfSBjbGFzc05hbWU9XCJwLTJcIj5cbiAgICAgICAgICA8U2F2ZUZvcm1cbiAgICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgICAgICAgbWVudVN0YXRlQ29weS5oYW5kbGVDbG9zZSgpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25TYXZlPXsodGl0bGUpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgY3VycmVudFF1ZXJ5SlNPTiA9IHNlbGVjdGlvbkludGVyZmFjZVxuICAgICAgICAgICAgICAgIC5nZXRDdXJyZW50UXVlcnkoKVxuICAgICAgICAgICAgICAgIC50b0pTT04oKVxuICAgICAgICAgICAgICBjdXJyZW50UXVlcnlKU09OLnRpdGxlID0gdGl0bGVcbiAgICAgICAgICAgICAgY29uc3QgdGFzayA9IEFzeW5jVGFza3MuY3JlYXRlU2VhcmNoKHsgZGF0YTogY3VycmVudFF1ZXJ5SlNPTiB9KVxuICAgICAgICAgICAgICBoaXN0b3J5LnB1c2goe1xuICAgICAgICAgICAgICAgIHBhdGhuYW1lOiBgL3NlYXJjaC8ke3Rhc2suZGF0YS5pZH1gLFxuICAgICAgICAgICAgICAgIHNlYXJjaDogJycsXG4gICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgYWRkU25hY2soYE1ha2luZyBhIGNvcHkgb2YgJHt0aXRsZX1gLCB7XG4gICAgICAgICAgICAgICAgYWxlcnRQcm9wczogeyBzZXZlcml0eTogJ2luZm8nIH0sXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlPXtzZWxlY3Rpb25JbnRlcmZhY2V9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9QYXBlcj5cbiAgICAgIDwvUG9wb3Zlcj5cbiAgICAgIDxQb3BvdmVyXG4gICAgICAgIG9wZW49e21lbnVTdGF0ZVJlbmFtZS5vcGVufVxuICAgICAgICBhbmNob3JFbD17bWVudVN0YXRlLmFuY2hvclJlZi5jdXJyZW50fVxuICAgICAgICBvbkNsb3NlPXttZW51U3RhdGVSZW5hbWUuaGFuZGxlQ2xvc2V9XG4gICAgICAgIGFuY2hvck9yaWdpbj17eyB2ZXJ0aWNhbDogJ2JvdHRvbScsIGhvcml6b250YWw6ICdsZWZ0JyB9fVxuICAgICAgPlxuICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLm92ZXJsYXlzfSBjbGFzc05hbWU9XCJwLTJcIj5cbiAgICAgICAgICA8U2F2ZUZvcm1cbiAgICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgICAgICAgbWVudVN0YXRlUmVuYW1lLmhhbmRsZUNsb3NlKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvblNhdmU9eyh0aXRsZSkgPT4ge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRRdWVyeUpTT04gPSBzZWxlY3Rpb25JbnRlcmZhY2VcbiAgICAgICAgICAgICAgICAgIC5nZXRDdXJyZW50UXVlcnkoKVxuICAgICAgICAgICAgICAgICAgLnRvSlNPTigpXG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXJ5SlNPTi50aXRsZSA9IHRpdGxlXG4gICAgICAgICAgICAgICAgQXN5bmNUYXNrcy5zYXZlU2VhcmNoKHtcbiAgICAgICAgICAgICAgICAgIGRhdGE6IGN1cnJlbnRRdWVyeUpTT04sXG4gICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0OiBkYXRhLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e3NlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICAvPlxuICAgICAgICA8L1BhcGVyPlxuICAgICAgPC9Qb3BvdmVyPlxuICAgICAgPFBvcG92ZXJcbiAgICAgICAgb3Blbj17bWVudVN0YXRlTmV3RnJvbUV4aXN0aW5nLm9wZW59XG4gICAgICAgIGFuY2hvckVsPXttZW51U3RhdGUuYW5jaG9yUmVmLmN1cnJlbnR9XG4gICAgICAgIG9uQ2xvc2U9e21lbnVTdGF0ZU5ld0Zyb21FeGlzdGluZy5oYW5kbGVDbG9zZX1cbiAgICAgICAgYW5jaG9yT3JpZ2luPXt7IHZlcnRpY2FsOiAnYm90dG9tJywgaG9yaXpvbnRhbDogJ2xlZnQnIH19XG4gICAgICA+XG4gICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9IGNsYXNzTmFtZT1cInAtMlwiPlxuICAgICAgICAgIDxPcGVuU2VhcmNoXG4gICAgICAgICAgICBsYWJlbD1cIlN0YXJ0IGEgbmV3IHNlYXJjaCBmcm9tIGFuIGV4aXN0aW5nIHNhdmVkIHNlYXJjaFwiXG4gICAgICAgICAgICBjb25zdHJ1Y3RMaW5rPXsocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGNvcHkgPSBKU09OLnBhcnNlKFxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzKVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIGRlbGV0ZSBjb3B5LmlkXG4gICAgICAgICAgICAgIGRlbGV0ZSBjb3B5LnRpdGxlXG4gICAgICAgICAgICAgIGNvbnN0IGVuY29kZWRRdWVyeU1vZGVsID0gZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KGNvcHkpKVxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHBhdGhuYW1lOiAnL3NlYXJjaCcsXG4gICAgICAgICAgICAgICAgc2VhcmNoOiBgP2RlZmF1bHRRdWVyeT0ke2VuY29kZWRRdWVyeU1vZGVsfWAsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkZpbmlzaD17KHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBjb3B5ID0gSlNPTi5wYXJzZShcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICBkZWxldGUgY29weS5pZFxuICAgICAgICAgICAgICBkZWxldGUgY29weS50aXRsZVxuICAgICAgICAgICAgICBjb25zdCBlbmNvZGVkUXVlcnlNb2RlbCA9IGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShjb3B5KSlcbiAgICAgICAgICAgICAgLy8gcmVwbGFjZSBiZWNhdXNlIHRlY2huaWNhbGx5IHRoZXkgZ2V0IHRoZSBsaW5rIGluIGNvbnN0cnVjdExpbmsgcHV0IGludG8gaGlzdG9yeSBhcyB3ZWxsIHVuZm9ydHVuYXRlbHksIHdpbGwgbmVlZCB0byBmaXggdGhpcyBtb3JlIGdlbmVyYWxseVxuICAgICAgICAgICAgICBoaXN0b3J5LnJlcGxhY2Uoe1xuICAgICAgICAgICAgICAgIHBhdGhuYW1lOiAnL3NlYXJjaCcsXG4gICAgICAgICAgICAgICAgc2VhcmNoOiBgP2RlZmF1bHRRdWVyeT0ke2VuY29kZWRRdWVyeU1vZGVsfWAsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5zZXQoe1xuICAgICAgICAgICAgICAgIC4uLmNvcHksXG4gICAgICAgICAgICAgICAgaWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBhZGRTbmFjayhcbiAgICAgICAgICAgICAgICBgTmV3IHNlYXJjaCBiYXNlZCBvbiAnJHtyZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX0nYCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBhbGVydFByb3BzOiB7IHNldmVyaXR5OiAnaW5mbycgfSxcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgbWVudVN0YXRlTmV3RnJvbUV4aXN0aW5nLmhhbmRsZUNsb3NlKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9QYXBlcj5cbiAgICAgIDwvUG9wb3Zlcj5cbiAgICAgIDxQb3BvdmVyXG4gICAgICAgIG9wZW49e21lbnVTdGF0ZU9wZW5TZWFyY2gub3Blbn1cbiAgICAgICAgYW5jaG9yRWw9e21lbnVTdGF0ZS5hbmNob3JSZWYuY3VycmVudH1cbiAgICAgICAgb25DbG9zZT17bWVudVN0YXRlT3BlblNlYXJjaC5oYW5kbGVDbG9zZX1cbiAgICAgICAgYW5jaG9yT3JpZ2luPXt7IHZlcnRpY2FsOiAnYm90dG9tJywgaG9yaXpvbnRhbDogJ2xlZnQnIH19XG4gICAgICA+XG4gICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9IGNsYXNzTmFtZT1cInAtMlwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXJvdyBmbGV4LW5vd3JhcFwiPlxuICAgICAgICAgICAgPE9wZW5TZWFyY2hcbiAgICAgICAgICAgICAgbGFiZWw9XCJPcGVuIGEgc2F2ZWQgc2VhcmNoXCJcbiAgICAgICAgICAgICAgY29uc3RydWN0TGluaz17KHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBgL3NlYXJjaC8ke3Jlc3VsdC5wbGFpbi5pZH1gXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIG9uRmluaXNoPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyByZXBsYWNlIGJlY2F1c2UgdGVjaG5pY2FsbHkgdGhleSBnZXQgdGhlIGxpbmsgaW4gY29uc3RydWN0TGluayBwdXQgaW50byBoaXN0b3J5IGFzIHdlbGwgdW5mb3J0dW5hdGVseSwgd2lsbCBuZWVkIHRvIGZpeCB0aGlzIG1vcmUgZ2VuZXJhbGx5XG4gICAgICAgICAgICAgICAgaGlzdG9yeS5yZXBsYWNlKHtcbiAgICAgICAgICAgICAgICAgIHBhdGhuYW1lOiBgL3NlYXJjaC8ke3ZhbHVlLnBsYWluLmlkfWAsXG4gICAgICAgICAgICAgICAgICBzZWFyY2g6ICcnLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgYWRkU25hY2soXG4gICAgICAgICAgICAgICAgICBgU2VhcmNoICcke3ZhbHVlLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGV9JyBvcGVuZWRgLFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBhbGVydFByb3BzOiB7IHNldmVyaXR5OiAnaW5mbycgfSxcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgbWVudVN0YXRlT3BlblNlYXJjaC5oYW5kbGVDbG9zZSgpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgbWVudVN0YXRlT3BlblNlYXJjaC5oYW5kbGVDbG9zZSgpXG4gICAgICAgICAgICAgICAgbWVudVN0YXRlUmVzdG9yZS5oYW5kbGVDbGljaygpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIENoZWNrIFRyYXNoP1xuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvUGFwZXI+XG4gICAgICA8L1BvcG92ZXI+XG4gICAgICA8TWVudVxuICAgICAgICBhbmNob3JFbD17bWVudVN0YXRlLmFuY2hvclJlZi5jdXJyZW50fVxuICAgICAgICBvcGVuPXttZW51U3RhdGUub3Blbn1cbiAgICAgICAgb25DbG9zZT17bWVudVN0YXRlLmhhbmRsZUNsb3NlfVxuICAgICAgICBrZWVwTW91bnRlZD17dHJ1ZX1cbiAgICAgICAgZGlzYWJsZUVuZm9yY2VGb2N1c1xuICAgICAgICBkaXNhYmxlQXV0b0ZvY3VzXG4gICAgICAgIGFuY2hvck9yaWdpbj17eyB2ZXJ0aWNhbDogJ2JvdHRvbScsIGhvcml6b250YWw6ICdsZWZ0JyB9fVxuICAgICAgPlxuICAgICAgICA8TWVudUl0ZW1cbiAgICAgICAgICBjb21wb25lbnQ9e0xpbmt9XG4gICAgICAgICAgdG89XCIvc2VhcmNoXCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBtZW51U3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlXG4gICAgICAgICAgICAgIC5nZXRDdXJyZW50UXVlcnkoKVxuICAgICAgICAgICAgICAuc2V0KCdpZCcsIG51bGwpXG4gICAgICAgICAgICAgIC5yZXNldFRvRGVmYXVsdHMoKVxuICAgICAgICAgICAgYWRkU25hY2soJ1N0YXJ0aW5nIGEgbmV3IHNlYXJjaCcsIHtcbiAgICAgICAgICAgICAgYWxlcnRQcm9wczogeyBzZXZlcml0eTogJ2luZm8nIH0sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBOZXdcbiAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgPE1lbnVJdGVtXG4gICAgICAgICAgY29tcG9uZW50PVwiZGl2XCJcbiAgICAgICAgICByZWY9e21lbnVTdGF0ZU5ld0Zyb21FeGlzdGluZy5hbmNob3JSZWZ9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgbWVudVN0YXRlLmhhbmRsZUNsb3NlKClcbiAgICAgICAgICAgIG1lbnVTdGF0ZU5ld0Zyb21FeGlzdGluZy5oYW5kbGVDbGljaygpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIE5ldyBmcm9tIGV4aXN0aW5nXG4gICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgIDxNZW51SXRlbVxuICAgICAgICAgIGNvbXBvbmVudD1cImRpdlwiXG4gICAgICAgICAgcmVmPXttZW51U3RhdGVPcGVuU2VhcmNoLmFuY2hvclJlZn1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBtZW51U3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgICAgICAgICAgbWVudVN0YXRlT3BlblNlYXJjaC5oYW5kbGVDbGljaygpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIE9wZW5cbiAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgey8qIDxNZW51SXRlbVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIG1lbnVTdGF0ZVJlc3RvcmUuaGFuZGxlQ2xpY2soKVxuICAgICAgICAgICAgbWVudVN0YXRlLmhhbmRsZUNsb3NlKClcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgUmVzdG9yZSBmcm9tIHRyYXNoXG4gICAgICAgIDwvTWVudUl0ZW0+ICovfVxuICAgICAgICA8TWVudUl0ZW1cbiAgICAgICAgICBjb21wb25lbnQ9e0xpbmt9XG4gICAgICAgICAgZGlzYWJsZWQ9e3NlYXJjaFBhZ2VNb2RlID09PSAnYWRob2MnIHx8IHR5cGVvZiBkYXRhID09PSAnYm9vbGVhbid9XG4gICAgICAgICAgdG89e2Avc2VhcmNoP2RlZmF1bHRRdWVyeT0ke2VuY29kZWRRdWVyeU1vZGVsSlNPTn1gfVxuICAgICAgICAgIG9uQ2xpY2s9eyhlOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgbWVudVN0YXRlLmhhbmRsZUNsb3NlKClcbiAgICAgICAgICAgIG1lbnVTdGF0ZUNvcHkuaGFuZGxlQ2xpY2soKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIE1ha2UgYSBjb3B5XG4gICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgIDxEYXJrRGl2aWRlciBjbGFzc05hbWU9XCJtLTJcIiAvPlxuICAgICAgICB7LyogPE1lbnVJdGVtIGRpc2FibGVkPXtzZWFyY2hQYWdlTW9kZSA9PT0gJ2FkaG9jJ30+U2F2ZTwvTWVudUl0ZW0+XG4gICAgICAgIDxNZW51SXRlbSBkaXNhYmxlZD17c2VhcmNoUGFnZU1vZGUgPT09ICdhZGhvYyd9PlNhdmUgYXM8L01lbnVJdGVtPiAqL31cbiAgICAgICAgPE1lbnVJdGVtXG4gICAgICAgICAgZGlzYWJsZWQ9e3NlYXJjaFBhZ2VNb2RlID09PSAnYWRob2MnIHx8IHR5cGVvZiBkYXRhID09PSAnYm9vbGVhbid9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgbWVudVN0YXRlUmVuYW1lLmhhbmRsZUNsaWNrKClcbiAgICAgICAgICAgIG1lbnVTdGF0ZS5oYW5kbGVDbG9zZSgpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIFJlbmFtZVxuICAgICAgICA8L01lbnVJdGVtPlxuICAgICAgICA8TWVudUl0ZW1cbiAgICAgICAgICBkaXNhYmxlZD17c2VhcmNoUGFnZU1vZGUgPT09ICdhZGhvYycgfHwgdHlwZW9mIGRhdGEgPT09ICdib29sZWFuJ31cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgIT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICBBc3luY1Rhc2tzLmRlbGV0ZSh7IGxhenlSZXN1bHQ6IGRhdGEgfSlcbiAgICAgICAgICAgICAgaGlzdG9yeS5wdXNoKHtcbiAgICAgICAgICAgICAgICBwYXRobmFtZTogYC9zZWFyY2hgLFxuICAgICAgICAgICAgICAgIHNlYXJjaDogJycsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZW51U3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBNb3ZlIHRvIHRyYXNoXG4gICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgIDxEYXJrRGl2aWRlciBjbGFzc05hbWU9XCJtLTJcIiAvPlxuICAgICAgICA8TWVudUl0ZW1cbiAgICAgICAgICBkaXNhYmxlZD17c2VhcmNoUGFnZU1vZGUgPT09ICdzYXZlZCcgJiYgdHlwZW9mIGRhdGEgPT09ICdib29sZWFuJ31cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuc2V0KCd0eXBlJywgJ2FkdmFuY2VkJylcbiAgICAgICAgICAgIGlmIChzZWFyY2hQYWdlTW9kZSA9PT0gJ2FkaG9jJykge1xuICAgICAgICAgICAgICAvLyBzZXQgdGhpcyBhcyB0aGVpciBwcmVmZXJlbmNlXG4gICAgICAgICAgICAgIFR5cGVkVXNlckluc3RhbmNlLnVwZGF0ZVF1ZXJ5U2V0dGluZ3Moe1xuICAgICAgICAgICAgICAgIHR5cGU6ICdhZHZhbmNlZCcsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZW51U3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBBZHZhbmNlZCBWaWV3XG4gICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgIDxNZW51SXRlbVxuICAgICAgICAgIGRpc2FibGVkPXtzZWFyY2hQYWdlTW9kZSA9PT0gJ3NhdmVkJyAmJiB0eXBlb2YgZGF0YSA9PT0gJ2Jvb2xlYW4nfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5zZXQoJ3R5cGUnLCAnYmFzaWMnKVxuICAgICAgICAgICAgaWYgKHNlYXJjaFBhZ2VNb2RlID09PSAnYWRob2MnKSB7XG4gICAgICAgICAgICAgIC8vIHNldCB0aGlzIGFzIHRoZWlyIHByZWZlcmVuY2VcbiAgICAgICAgICAgICAgVHlwZWRVc2VySW5zdGFuY2UudXBkYXRlUXVlcnlTZXR0aW5ncyh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jhc2ljJyxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lbnVTdGF0ZS5oYW5kbGVDbG9zZSgpXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIEJhc2ljIFZpZXdcbiAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgIDwvTWVudT5cbiAgICA8Lz5cbiAgKVxufVxuXG5jb25zdCBTYXZlQnV0dG9uID0gKCkgPT4ge1xuICBjb25zdCB7IGNsb3NlZCB9ID0gdXNlUmVzaXphYmxlR3JpZENvbnRleHQoKVxuICBjb25zdCB7IGRhdGEsIHNlYXJjaFBhZ2VNb2RlLCBpc1NhdmluZyB9ID0gUmVhY3QudXNlQ29udGV4dChcbiAgICBTYXZlZFNlYXJjaE1vZGVDb250ZXh0XG4gIClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge2Nsb3NlZCA/IChcbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGRpc2FibGVkPXtkYXRhID09PSB0cnVlfVxuICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICA+XG4gICAgICAgICAgPFNhdmVJY29uIC8+XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgKSA6IChcbiAgICAgICAgPEJ1dHRvbldpdGhUd29TdGF0ZXNcbiAgICAgICAgICBkaXNhYmxlZD17ZGF0YSA9PT0gdHJ1ZX1cbiAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICBzdGF0ZXM9e1tcbiAgICAgICAgICAgIHsgc3RhdGU6ICdTYXZpbmcnLCBsb2FkaW5nOiB0cnVlIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHN0YXRlOiBzZWFyY2hQYWdlTW9kZSA9PT0gJ2FkaG9jJyA/ICdTYXZlJyA6ICdTYXZlIGFzJyxcbiAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF19XG4gICAgICAgICAgc3RhdGU9eygoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNTYXZpbmcpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICdTYXZpbmcnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2VhcmNoUGFnZU1vZGUgPT09ICdhZGhvYycgPyAnU2F2ZScgOiAnU2F2ZSBhcydcbiAgICAgICAgICB9KSgpfVxuICAgICAgICAvPlxuICAgICAgKX1cbiAgICA8Lz5cbiAgKVxufVxuXG5jb25zdCBMZWZ0Qm90dG9tID0gKCkgPT4ge1xuICBjb25zdCB7IGNsb3NlZCwgc2V0Q2xvc2VkLCBsYXN0TGVuZ3RoLCBzZXRMZW5ndGggfSA9IHVzZVJlc2l6YWJsZUdyaWRDb250ZXh0KClcbiAgY29uc3QgeyBkYXRhLCBzZWFyY2hQYWdlTW9kZSwgc2VsZWN0aW9uSW50ZXJmYWNlIH0gPSBSZWFjdC51c2VDb250ZXh0KFxuICAgIFNhdmVkU2VhcmNoTW9kZUNvbnRleHRcbiAgKVxuXG4gIGlmIChjbG9zZWQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciB3LWZ1bGwgcHktNCAgZmxleC1ub3dyYXAgc2hyaW5rLTAgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtMlwiPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldENsb3NlZChmYWxzZSlcbiAgICAgICAgICAgICAgc2V0TGVuZ3RoKGxhc3RMZW5ndGgpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxLZXlib2FyZEFycm93UmlnaHRJY29uXG4gICAgICAgICAgICAgIGNvbG9yPVwiaW5oZXJpdFwiXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cIk11aS10ZXh0LXRleHQtcHJpbWFyeVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPEtleWJvYXJkQXJyb3dSaWdodEljb25cbiAgICAgICAgICAgICAgY29sb3I9XCJpbmhlcml0XCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiLW1sLTUgTXVpLXRleHQtdGV4dC1wcmltYXJ5XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9CdXR0b24+XG5cbiAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICBkaXNhYmxlZD17dHlwZW9mIGRhdGEgPT09ICdib29sZWFuJyAmJiBzZWFyY2hQYWdlTW9kZSA9PT0gJ3NhdmVkJ31cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm10LTNcIlxuICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICB2YXJpYW50PVwiY29udGFpbmVkXCJcbiAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuc3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlKClcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFNlYXJjaEljb24gLz5cbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBtaW4taC0xNiBweS0xIHB4LTIgZmxleCBmbGV4LXJvdyBmbGV4LW5vd3JhcCBpdGVtcy1jZW50ZXJcIj5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgc2V0Q2xvc2VkKHRydWUpXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIENvbGxhcHNlXG4gICAgICAgIDxLZXlib2FyZEFycm93TGVmdEljb25cbiAgICAgICAgICBjb2xvcj1cImluaGVyaXRcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIk11aS10ZXh0LXRleHQtcHJpbWFyeSBNdWktaWNvbi1zaXplLXNtYWxsXCJcbiAgICAgICAgLz5cbiAgICAgICAgPEtleWJvYXJkQXJyb3dMZWZ0SWNvblxuICAgICAgICAgIGNvbG9yPVwiaW5oZXJpdFwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwiLW1sLTMgTXVpLXRleHQtdGV4dC1wcmltYXJ5IE11aS1pY29uLXNpemUtc21hbGxcIlxuICAgICAgICAvPlxuICAgICAgPC9CdXR0b24+XG4gICAgICA8QnV0dG9uXG4gICAgICAgIGNsYXNzTmFtZT1cIm1sLWF1dG9cIlxuICAgICAgICBkaXNhYmxlZD17dHlwZW9mIGRhdGEgPT09ICdib29sZWFuJyAmJiBzZWFyY2hQYWdlTW9kZSA9PT0gJ3NhdmVkJ31cbiAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuc3RhcnRTZWFyY2hGcm9tRmlyc3RQYWdlKClcbiAgICAgICAgfX1cbiAgICAgID5cbiAgICAgICAgU2VhcmNoXG4gICAgICA8L0J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBTYXZlSW5kaWNhdG9yID0gKCkgPT4ge1xuICBjb25zdCB7IGlzU2F2aW5nIH0gPSBSZWFjdC51c2VDb250ZXh0KFNhdmVkU2VhcmNoTW9kZUNvbnRleHQpXG4gIGNvbnN0IHsgY2xvc2VkIH0gPSB1c2VSZXNpemFibGVHcmlkQ29udGV4dCgpXG4gIGNvbnN0IFtzaG93VGVtcE1lc3NhZ2UsIHNldFNob3dUZW1wTWVzc2FnZV0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgcG9wdXBTdGF0ZSA9IHVzZU1lbnVTdGF0ZSgpXG4gIHVzZVVwZGF0ZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IHRpbWVvdXRpZCA9IHVuZGVmaW5lZCBhcyBudW1iZXIgfCB1bmRlZmluZWRcbiAgICBpZiAoaXNTYXZpbmcgPT09IGZhbHNlKSB7XG4gICAgICBzZXRTaG93VGVtcE1lc3NhZ2UodHJ1ZSlcbiAgICAgIHRpbWVvdXRpZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc2V0U2hvd1RlbXBNZXNzYWdlKGZhbHNlKVxuICAgICAgfSwgNDAwMClcbiAgICB9XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dGlkKVxuICAgIH1cbiAgfSwgW2lzU2F2aW5nXSlcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPFBvcG92ZXJcbiAgICAgICAgYW5jaG9yRWw9e3BvcHVwU3RhdGUuYW5jaG9yUmVmLmN1cnJlbnR9XG4gICAgICAgIG9wZW49e3BvcHVwU3RhdGUub3Blbn1cbiAgICAgICAgb25DbG9zZT17cG9wdXBTdGF0ZS5oYW5kbGVDbG9zZX1cbiAgICAgICAgb25Nb3VzZURvd249eyhlKSA9PiB7XG4gICAgICAgICAgLy8gb3RoZXJ3aXNlIHNpbmNlIHdlJ3JlIHRlY2huaWNhbGx5IGluIGEgYnV0dG9uIHRoaXMgd2lsbCB0cmlnZ2VyIGl0XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgICB9fVxuICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgIC8vIG90aGVyd2lzZSBzaW5jZSB3ZSdyZSB0ZWNobmljYWxseSBpbiBhIGJ1dHRvbiB0aGlzIHdpbGwgdHJpZ2dlciBpdFxuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgfX1cbiAgICAgICAgYW5jaG9yT3JpZ2luPXt7IHZlcnRpY2FsOiAnYm90dG9tJywgaG9yaXpvbnRhbDogJ2xlZnQnIH19XG4gICAgICA+XG4gICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXJvdyBmbGV4LW5vd3JhcCBpdGVtcy1jZW50ZXIgcC00IHRleHQtMnhsIE11aS10ZXh0LXByaW1hcnlcIj5cbiAgICAgICAgICAgIHtpc1NhdmluZyA/IChcbiAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICA8Q2lyY3VsYXJQcm9ncmVzc1xuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXItMlwiXG4gICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogJzFyZW0nLCBoZWlnaHQ6ICcxcmVtJyB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgU2F2aW5nIC4uLlxuICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgPENsb3VkRG9uZUljb24gY2xhc3NOYW1lPVwibXItMlwiIC8+IEFsbCBjaGFuZ2VzIHNhdmVkIHRvIHRoZVxuICAgICAgICAgICAgICAgIHN5c3RlbS5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxEYXJrRGl2aWRlciAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC00XCI+XG4gICAgICAgICAgICBFdmVyeSBjaGFuZ2UgeW91IG1ha2UgaXMgYXV0b21hdGljYWxseSBzYXZlZC5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9QYXBlcj5cbiAgICAgIDwvUG9wb3Zlcj5cbiAgICAgIDxCdXR0b25cbiAgICAgICAgY29tcG9uZW50PVwiZGl2XCJcbiAgICAgICAgY2xhc3NOYW1lPVwic2hyaW5rLTBcIlxuICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAgICAgICBwb3B1cFN0YXRlLmhhbmRsZUNsaWNrKClcbiAgICAgICAgfX1cbiAgICAgICAgcmVmPXtwb3B1cFN0YXRlLmFuY2hvclJlZn1cbiAgICAgID5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9e2BvcGFjaXR5LTc1IHRleHQtc20gc2hyaW5rLTAgZmxleCBpdGVtcy1jZW50ZXIgZmxleC1ub3dyYXAgJHtcbiAgICAgICAgICAgIGNsb3NlZCA/ICdtci1taW4gZmxleC1jb2wnIDogJ210LW1pbiBmbGV4LXJvdydcbiAgICAgICAgICB9YH1cbiAgICAgICAgPlxuICAgICAgICAgIHtpc1NhdmluZyA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIDxDaXJjdWxhclByb2dyZXNzXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1jdXJyZW50IHRleHQtYmFzZVwiXG4gICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6ICcxcmVtJywgaGVpZ2h0OiAnMXJlbScgfX1cbiAgICAgICAgICAgICAgLz57JyAnfVxuICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YCR7XG4gICAgICAgICAgICAgICAgICBjbG9zZWQgPyAnd3JpdGluZy1tb2RlLXZlcnRpY2FsLWxyIG10LTEnIDogJ21sLTEnXG4gICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBTYXZpbmcgLi4uXG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICA8Q2xvdWREb25lSWNvbiBjbGFzc05hbWU9XCJ0ZXh0LWJhc2VcIiAvPnsnICd9XG4gICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgJHtcbiAgICAgICAgICAgICAgICAgIGNsb3NlZCA/ICd3cml0aW5nLW1vZGUtdmVydGljYWwtbHIgbXQtMScgOiAnbWwtMSdcbiAgICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHtzaG93VGVtcE1lc3NhZ2UgPyAnU2F2ZWQnIDogJyd9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvQnV0dG9uPlxuICAgIDwvPlxuICApXG59XG5cbmNvbnN0IExlZnRUb3AgPSAoKSA9PiB7XG4gIGNvbnN0IHsgY2xvc2VkIH0gPSB1c2VSZXNpemFibGVHcmlkQ29udGV4dCgpXG4gIGNvbnN0IHsgZGF0YSwgc2VhcmNoUGFnZU1vZGUsIHNlbGVjdGlvbkludGVyZmFjZSB9ID0gUmVhY3QudXNlQ29udGV4dChcbiAgICBTYXZlZFNlYXJjaE1vZGVDb250ZXh0XG4gIClcbiAgdXNlUmVyZW5kZXJPbkJhY2tib25lU3luYyh7XG4gICAgbGF6eVJlc3VsdDogdHlwZW9mIGRhdGEgIT09ICdib29sZWFuJyA/IGRhdGEgOiB1bmRlZmluZWQsXG4gIH0pXG4gIGNvbnN0IGhpc3RvcnkgPSB1c2VIaXN0b3J5KClcbiAgY29uc3QgYWRob2NNZW51U3RhdGUgPSB1c2VNZW51U3RhdGUoKVxuICBjb25zdCBzYXZlZE1lbnVTdGF0ZSA9IHVzZU1lbnVTdGF0ZSgpXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPXtgbWluLWgtMTYgJHtjbG9zZWQgPyAnaC1mdWxsIHNocmluayBvdmVyZmxvdy1oaWRkZW4nIDogJyd9YH1cbiAgICA+XG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT17YGgtZnVsbCB3LWZ1bGwgcmVsYXRpdmUgcC0yICR7XG4gICAgICAgICAgY2xvc2VkXG4gICAgICAgICAgICA/ICdmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIGl0ZW1zLWNlbnRlcidcbiAgICAgICAgICAgIDogJ2ZsZXggZmxleC1yb3cgZmxleC1ub3dyYXAgaXRlbXMtY2VudGVyJ1xuICAgICAgICB9YH1cbiAgICAgID5cbiAgICAgICAge3NlYXJjaFBhZ2VNb2RlID09PSAnYWRob2MnID8gKFxuICAgICAgICAgIDw+XG4gICAgICAgICAgICA8UG9wb3ZlclxuICAgICAgICAgICAgICBhbmNob3JFbD17YWRob2NNZW51U3RhdGUuYW5jaG9yUmVmLmN1cnJlbnR9XG4gICAgICAgICAgICAgIG9wZW49e2FkaG9jTWVudVN0YXRlLm9wZW59XG4gICAgICAgICAgICAgIG9uQ2xvc2U9e2FkaG9jTWVudVN0YXRlLmhhbmRsZUNsb3NlfVxuICAgICAgICAgICAgICBhbmNob3JPcmlnaW49e3tcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbDogY2xvc2VkID8gJ3RvcCcgOiAnYm90dG9tJyxcbiAgICAgICAgICAgICAgICBob3Jpem9udGFsOiBjbG9zZWQgPyAncmlnaHQnIDogJ2xlZnQnLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLm92ZXJsYXlzfT5cbiAgICAgICAgICAgICAgICA8U2F2ZUZvcm1cbiAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWRob2NNZW51U3RhdGUuaGFuZGxlQ2xvc2UoKVxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZT17c2VsZWN0aW9uSW50ZXJmYWNlfVxuICAgICAgICAgICAgICAgICAgb25TYXZlPXsodGl0bGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpLnNldCgndGl0bGUnLCB0aXRsZSlcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VhcmNoRGF0YSA9IHNlbGVjdGlvbkludGVyZmFjZVxuICAgICAgICAgICAgICAgICAgICAgIC5nZXRDdXJyZW50UXVlcnkoKVxuICAgICAgICAgICAgICAgICAgICAgIC50b0pTT04oKVxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VhcmNoUGFnZU1vZGUgPT09ICdhZGhvYycpIHtcbiAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXNrID0gQXN5bmNUYXNrcy5jcmVhdGVTZWFyY2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogc2VhcmNoRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgIGhpc3RvcnkucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRobmFtZTogYC9zZWFyY2gvJHt0YXNrLmRhdGEuaWR9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgQXN5bmNUYXNrcy5zYXZlU2VhcmNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQ6IGRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBzZWFyY2hEYXRhLFxuICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC9QYXBlcj5cbiAgICAgICAgICAgIDwvUG9wb3Zlcj5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgY29sb3I9XCJpbmhlcml0XCJcbiAgICAgICAgICAgICAgY29tcG9uZW50PVwiZGl2XCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdGV4dC1sZWZ0IHRleHQtMnhsIHNocmluayB0cnVuY2F0ZSAke1xuICAgICAgICAgICAgICAgIGNsb3NlZCA/ICdoLWZ1bGwnIDogJydcbiAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e2FkaG9jTWVudVN0YXRlLmhhbmRsZUNsaWNrfVxuICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICByZWY9e2FkaG9jTWVudVN0YXRlLmFuY2hvclJlZn1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXggaXRlbXMtY2VudGVyIGZsZXgtbm93cmFwICR7XG4gICAgICAgICAgICAgICAgICBjbG9zZWQgPyAnZmxleC1jb2wgaC1mdWxsJyA6ICdmbGV4LXJvdyB3LWZ1bGwnXG4gICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgb3BhY2l0eS01MCBzaHJpbmsgdHJ1bmNhdGUgJHtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VkID8gJ3dyaXRpbmctbW9kZS12ZXJ0aWNhbC1sciBtYi0yJyA6ICdtci0yJ1xuICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgVW5zYXZlZCBzZWFyY2h7JyAnfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8U2F2ZUJ1dHRvbiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge2RhdGEgPT09IGZhbHNlICYmIHNlYXJjaFBhZ2VNb2RlID09PSAnc2F2ZWQnID8gKFxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT17YHRleHQtMnhsIG9wYWNpdHktNTAgJHtcbiAgICAgICAgICAgICAgY2xvc2VkID8gJ3dyaXRpbmctbW9kZS12ZXJ0aWNhbC1scicgOiAnJ1xuICAgICAgICAgICAgfWB9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgQ291bGQgbm90IGZpbmQgc2VhcmNoXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICkgOiBudWxsfVxuICAgICAgICB7ZGF0YSA9PT0gdHJ1ZSA/IChcbiAgICAgICAgICA8PlxuICAgICAgICAgICAgPFNrZWxldG9uIHZhcmlhbnQ9XCJyZWN0YW5ndWxhclwiIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIiAvPlxuICAgICAgICAgIDwvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgICAge3R5cGVvZiBkYXRhICE9PSAnYm9vbGVhbicgPyAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxQb3BvdmVyXG4gICAgICAgICAgICAgIGFuY2hvckVsPXtzYXZlZE1lbnVTdGF0ZS5hbmNob3JSZWYuY3VycmVudH1cbiAgICAgICAgICAgICAgb3Blbj17c2F2ZWRNZW51U3RhdGUub3Blbn1cbiAgICAgICAgICAgICAgb25DbG9zZT17c2F2ZWRNZW51U3RhdGUuaGFuZGxlQ2xvc2V9XG4gICAgICAgICAgICAgIGFuY2hvck9yaWdpbj17e1xuICAgICAgICAgICAgICAgIHZlcnRpY2FsOiBjbG9zZWQgPyAndG9wJyA6ICdib3R0b20nLFxuICAgICAgICAgICAgICAgIGhvcml6b250YWw6IGNsb3NlZCA/ICdyaWdodCcgOiAnbGVmdCcsXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMub3ZlcmxheXN9PlxuICAgICAgICAgICAgICAgIDxTYXZlRm9ybVxuICAgICAgICAgICAgICAgICAgb25DbG9zZT17c2F2ZWRNZW51U3RhdGUuaGFuZGxlQ2xvc2V9XG4gICAgICAgICAgICAgICAgICBzZWxlY3Rpb25JbnRlcmZhY2U9e3NlbGVjdGlvbkludGVyZmFjZX1cbiAgICAgICAgICAgICAgICAgIG9uU2F2ZT17KHRpdGxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS5zZXQoJ3RpdGxlJywgdGl0bGUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaERhdGEgPSBzZWxlY3Rpb25JbnRlcmZhY2VcbiAgICAgICAgICAgICAgICAgICAgICAuZ2V0Q3VycmVudFF1ZXJ5KClcbiAgICAgICAgICAgICAgICAgICAgICAudG9KU09OKClcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlYXJjaFBhZ2VNb2RlID09PSAnYWRob2MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgQXN5bmNUYXNrcy5jcmVhdGVTZWFyY2goeyBkYXRhOiBzZWFyY2hEYXRhIH0pXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRhdGEgIT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICAgICAgICAgIEFzeW5jVGFza3Muc2F2ZVNlYXJjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0OiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogc2VhcmNoRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgICA8L1BvcG92ZXI+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGNvbXBvbmVudD1cImRpdlwiXG4gICAgICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2B0ZXh0LWxlZnQgdGV4dC0yeGwgc2hyaW5rIG92ZXJmbG93LWhpZGRlbiAke1xuICAgICAgICAgICAgICAgIGNsb3NlZCA/ICdoLWZ1bGwnIDogJydcbiAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3NhdmVkTWVudVN0YXRlLmhhbmRsZUNsaWNrfVxuICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICByZWY9e3NhdmVkTWVudVN0YXRlLmFuY2hvclJlZn1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXggaXRlbXMtY2VudGVyIGZsZXgtbm93cmFwICR7XG4gICAgICAgICAgICAgICAgICBjbG9zZWQgPyAnZmxleC1jb2wgaC1mdWxsJyA6ICd3LWZ1bGwgZmxleC1yb3cnXG4gICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdHJ1bmNhdGUgJHtcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VkID8gJ3dyaXRpbmctbW9kZS12ZXJ0aWNhbC1sciBtYi0yIHNocmluaycgOiAnbXItMidcbiAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtkYXRhLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGV9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxTYXZlSW5kaWNhdG9yIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC8+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgPD48Lz5cbiAgICAgICAgKX1cbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT17YG1sLWF1dG8gc2hyaW5rLTAgJHtcbiAgICAgICAgICAgIGNsb3NlZCA/ICd3LWZ1bGwgb3JkZXItZmlyc3QgcHQtMSBoLTE2JyA6ICcnXG4gICAgICAgICAgfWB9XG4gICAgICAgID5cbiAgICAgICAgICA8T3B0aW9uc0J1dHRvbiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICAge2Nsb3NlZCA/IG51bGwgOiA8RGFya0RpdmlkZXIgY2xhc3NOYW1lPVwiaC1taW4gdy1mdWxsXCIgLz59XG4gICAgPC9kaXY+XG4gIClcbn1cblxuY29uc3QgTGVmdE1pZGRsZSA9ICgpID0+IHtcbiAgY29uc3QgeyBjbG9zZWQgfSA9IHVzZVJlc2l6YWJsZUdyaWRDb250ZXh0KClcbiAgY29uc3QgeyBkYXRhLCBzZWFyY2hQYWdlTW9kZSwgc2VsZWN0aW9uSW50ZXJmYWNlIH0gPSBSZWFjdC51c2VDb250ZXh0KFxuICAgIFNhdmVkU2VhcmNoTW9kZUNvbnRleHRcbiAgKVxuXG4gIGlmIChkYXRhID09PSBmYWxzZSAmJiBzZWFyY2hQYWdlTW9kZSA9PT0gJ3NhdmVkJykge1xuICAgIC8vIGV2ZW50dWFsbHkgYWRkIHNvbWV0aGluZz9cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJvdmVyZmxvdy1oaWRkZW4gdy1mdWxsIGgtZnVsbCBzaHJpbmtcIj48L2Rpdj5cbiAgfVxuICByZXR1cm4gKFxuICAgIDxkaXZcbiAgICAgIGNsYXNzTmFtZT17YG92ZXJmbG93LWhpZGRlbiB3LWZ1bGwgJHtcbiAgICAgICAgY2xvc2VkID8gJ3NocmluayBoaWRkZW4nIDogJ2gtZnVsbCdcbiAgICAgIH1gfVxuICAgID5cbiAgICAgIHtkYXRhID09PSB0cnVlID8gKFxuICAgICAgICA8U2tlbGV0b25cbiAgICAgICAgICB2YXJpYW50PVwicmVjdGFuZ3VsYXJcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcC0xMFwiXG4gICAgICAgID48L1NrZWxldG9uPlxuICAgICAgKSA6IChcbiAgICAgICAgPGRpdlxuICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBoLWZ1bGwgb3ZlcmZsb3ctYXV0byBwYi02NCAke1xuICAgICAgICAgICAgY2xvc2VkID8gJ2hpZGRlbicgOiAnJ1xuICAgICAgICAgIH1gfVxuICAgICAgICA+XG4gICAgICAgICAgPFF1ZXJ5QWRkUmVhY3QgbW9kZWw9e3NlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmNvbnN0IHVzZUtlZXBTZWFyY2hJblVybCA9ICh7XG4gIHF1ZXJ5TW9kZWwsXG4gIG9uLFxufToge1xuICBxdWVyeU1vZGVsOiBhbnlcbiAgb246IGJvb2xlYW5cbn0pID0+IHtcbiAgY29uc3QgaGlzdG9yeSA9IHVzZUhpc3RvcnkoKVxuICBjb25zdCB7IGxpc3RlblRvLCBzdG9wTGlzdGVuaW5nIH0gPSB1c2VCYWNrYm9uZSgpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gdGhpcyBpcyBmYWlybHkgZXhwZW5zaXZlLCBzbyBrZWVwIGl0IGhlYXZpbHkgZGVib3VuY2VkXG4gICAgY29uc3QgZGVib3VuY2VkVXBkYXRlID0gXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICBpZiAob24pIHtcbiAgICAgICAgY29uc3QgZW5jb2RlZFF1ZXJ5TW9kZWwgPSBlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkocXVlcnlNb2RlbC50b0pTT04oKSlcbiAgICAgICAgKVxuICAgICAgICBoaXN0b3J5LnJlcGxhY2Uoe1xuICAgICAgICAgIHNlYXJjaDogYCR7cXVlcnlTdHJpbmcuc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGRlZmF1bHRRdWVyeTogZW5jb2RlZFF1ZXJ5TW9kZWwsXG4gICAgICAgICAgfSl9YCxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LCAyMDAwKVxuICAgIGxpc3RlblRvKHF1ZXJ5TW9kZWwsICdjaGFuZ2UnLCBkZWJvdW5jZWRVcGRhdGUpXG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgZGVib3VuY2VkVXBkYXRlLmNhbmNlbCgpXG4gICAgICBzdG9wTGlzdGVuaW5nKHF1ZXJ5TW9kZWwsICdjaGFuZ2UnLCBkZWJvdW5jZWRVcGRhdGUpXG4gICAgfVxuICB9LCBbb24sIHF1ZXJ5TW9kZWxdKVxufVxuXG50eXBlIFNlYXJjaFBhZ2VNb2RlID0gJ3NhdmVkJyB8ICdhZGhvYydcblxuY29uc3QgdXNlU2VhcmNoUGFnZU1vZGUgPSAoeyBpZCB9OiB7IGlkPzogc3RyaW5nIH0pOiBTZWFyY2hQYWdlTW9kZSA9PiB7XG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IFJlYWN0LnVzZVN0YXRlPFNlYXJjaFBhZ2VNb2RlPihpZCA/ICdzYXZlZCcgOiAnYWRob2MnKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpZCkge1xuICAgICAgcmV0dXJuIHNldE1vZGUoJ3NhdmVkJylcbiAgICB9XG4gICAgcmV0dXJuIHNldE1vZGUoJ2FkaG9jJylcbiAgfSwgW2lkXSlcbiAgcmV0dXJuIG1vZGVcbn1cblxudHlwZSBTYXZlZFNlYXJjaFBhZ2VNb2RlID0gYm9vbGVhbiB8IExhenlRdWVyeVJlc3VsdFxuY29uc3QgdXNlU2F2ZWRTZWFyY2hQYWdlTW9kZSA9ICh7XG4gIGlkLFxufToge1xuICBpZD86IHN0cmluZ1xufSk6IFNhdmVkU2VhcmNoUGFnZU1vZGUgPT4ge1xuICAvLyBoYW5kbGUgYWxsIGxvYWRpbmcgLyBkYXRhIGluIGhlcmVcbiAgY29uc3QgW2RhdGEsIHNldERhdGFdID0gUmVhY3QudXNlU3RhdGU8U2F2ZWRTZWFyY2hQYWdlTW9kZT4oZmFsc2UpXG4gIGNvbnN0IHRhc2sgPSB1c2VDcmVhdGVTZWFyY2hUYXNrKHsgaWQgfSlcbiAgY29uc3QgcmVzdG9yZVRhc2sgPSB1c2VSZXN0b3JlU2VhcmNoVGFzayh7IGlkIH0pXG4gIGNvbnN0IFtxdWVyeU1vZGVsXSA9IHVzZVF1ZXJ5KHtcbiAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICBzb3VyY2VzOiBbJ2xvY2FsJ10sXG4gICAgfSxcbiAgfSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAodGFzayB8fCByZXN0b3JlVGFzaykge1xuICAgICAgc2V0RGF0YSh0cnVlKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGxldCBzdWJzY3JpcHRpb25DYW5jZWwgPSAoKSA9PiB7fVxuXG4gICAgaWYgKGlkKSB7XG4gICAgICBzZXREYXRhKHRydWUpXG4gICAgICBxdWVyeU1vZGVsLnNldChcbiAgICAgICAgJ2ZpbHRlclRyZWUnLFxuICAgICAgICBuZXcgRmlsdGVyQnVpbGRlckNsYXNzKHtcbiAgICAgICAgICBmaWx0ZXJzOiBbXG4gICAgICAgICAgICBuZXcgRmlsdGVyQ2xhc3Moe1xuICAgICAgICAgICAgICB0eXBlOiAnPScsXG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnaWQnLFxuICAgICAgICAgICAgICB2YWx1ZTogaWQsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIG5ldyBGaWx0ZXJDbGFzcyh7XG4gICAgICAgICAgICAgIHR5cGU6ICdJTElLRScsXG4gICAgICAgICAgICAgIHByb3BlcnR5OiAnbWV0YWNhcmQtdGFncycsXG4gICAgICAgICAgICAgIHZhbHVlOiAnKicsXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICBdLFxuICAgICAgICB9KVxuICAgICAgKVxuICAgICAgcXVlcnlNb2RlbC5pbml0aWFsaXplUmVzdWx0KClcbiAgICAgIGNvbnN0IGxhenlSZXN1bHRzID0gcXVlcnlNb2RlbC5nZXRMYXp5UmVzdWx0cygpXG4gICAgICBzdWJzY3JpcHRpb25DYW5jZWwgPSBsYXp5UmVzdWx0cy5zdWJzY3JpYmVUbyh7XG4gICAgICAgIHN1YnNjcmliYWJsZVRoaW5nOiAnZmlsdGVyZWRSZXN1bHRzJyxcbiAgICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gT2JqZWN0LnZhbHVlcyhsYXp5UmVzdWx0cy5yZXN1bHRzKVxuICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNldERhdGEocmVzdWx0c1swXSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0RGF0YShmYWxzZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgICAgcXVlcnlNb2RlbC5zdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UoKVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXREYXRhKGZhbHNlKVxuICAgIH1cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgc3Vic2NyaXB0aW9uQ2FuY2VsKClcbiAgICAgIHF1ZXJ5TW9kZWwuY2FuY2VsQ3VycmVudFNlYXJjaGVzKClcbiAgICB9XG4gIH0sIFtpZCwgdGFzaywgcmVzdG9yZVRhc2tdKVxuICByZXR1cm4gZGF0YVxufVxuXG5jb25zdCBBdXRvU2F2ZSA9ICgpID0+IHtcbiAgY29uc3QgeyBzZWFyY2hQYWdlTW9kZSwgc2VsZWN0aW9uSW50ZXJmYWNlLCBkYXRhIH0gPSBSZWFjdC51c2VDb250ZXh0KFxuICAgIFNhdmVkU2VhcmNoTW9kZUNvbnRleHRcbiAgKVxuICBjb25zdCBxdWVyeU1vZGVsID0gc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpXG4gIGNvbnN0IG9uID0gc2VhcmNoUGFnZU1vZGUgPT09ICdzYXZlZCdcblxuICBjb25zdCB7IGxpc3RlblRvLCBzdG9wTGlzdGVuaW5nIH0gPSB1c2VCYWNrYm9uZSgpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCBjaGFuZ2VkQXR0cmlidXRlcyA9IE9iamVjdC5rZXlzKHF1ZXJ5TW9kZWwuY2hhbmdlZEF0dHJpYnV0ZXMoKSlcbiAgICAgIGNvbnN0IGlzRnJvbVN3YXBwaW5nVG9TYXZlZFNlYXJjaCA9IGNoYW5nZWRBdHRyaWJ1dGVzLmluY2x1ZGVzKCdpZCcpXG4gICAgICBjb25zdCBpc0F0dHJpYnV0ZVRoYXRNYXR0ZXJzID1cbiAgICAgICAgY2hhbmdlZEF0dHJpYnV0ZXMuaW5jbHVkZXMoJ2ZpbHRlclRyZWUnKSB8fFxuICAgICAgICBjaGFuZ2VkQXR0cmlidXRlcy5pbmNsdWRlcygnc29ydHMnKSB8fFxuICAgICAgICBjaGFuZ2VkQXR0cmlidXRlcy5pbmNsdWRlcygnc291cmNlcycpXG4gICAgICBpZiAoXG4gICAgICAgIG9uICYmXG4gICAgICAgIHF1ZXJ5TW9kZWwuZ2V0KCdpZCcpICYmXG4gICAgICAgICFpc0Zyb21Td2FwcGluZ1RvU2F2ZWRTZWFyY2ggJiZcbiAgICAgICAgaXNBdHRyaWJ1dGVUaGF0TWF0dGVycyAmJlxuICAgICAgICB0eXBlb2YgZGF0YSAhPT0gJ2Jvb2xlYW4nXG4gICAgICApIHtcbiAgICAgICAgQXN5bmNUYXNrcy5zYXZlU2VhcmNoKHtcbiAgICAgICAgICBsYXp5UmVzdWx0OiBkYXRhLFxuICAgICAgICAgIGRhdGE6IHF1ZXJ5TW9kZWwudG9KU09OKCksXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIGxpc3RlblRvKHF1ZXJ5TW9kZWwsICdjaGFuZ2UnLCBjYWxsYmFjaylcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBzdG9wTGlzdGVuaW5nKHF1ZXJ5TW9kZWwsICdjaGFuZ2UnLCBjYWxsYmFjaylcbiAgICB9XG4gIH0sIFtvbiwgcXVlcnlNb2RlbCwgZGF0YV0pXG4gIHJldHVybiBudWxsXG59XG5cbmNvbnN0IFNhdmVkU2VhcmNoTW9kZUNvbnRleHQgPSBSZWFjdC5jcmVhdGVDb250ZXh0KHtcbiAgZGF0YTogZmFsc2UgYXMgU2F2ZWRTZWFyY2hQYWdlTW9kZSxcbiAgc2VhcmNoUGFnZU1vZGU6ICdhZGhvYycgYXMgU2VhcmNoUGFnZU1vZGUsXG4gIGlzU2F2aW5nOiBmYWxzZSBhcyBib29sZWFuLFxuICBzZWxlY3Rpb25JbnRlcmZhY2U6IHt9IGFzIGFueSxcbn0pXG5cbmNvbnN0IGRlY29kZVVybElmVmFsaWQgPSAoc2VhcmNoOiBzdHJpbmcpID0+IHtcbiAgaWYgKGxvY2F0aW9uKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcXVlcnlTdHJpbmcucGFyc2Uoc2VhcmNoKVxuICAgICAgY29uc3QgZGVmYXVsdFF1ZXJ5U3RyaW5nID0gKHF1ZXJ5UGFyYW1zWydkZWZhdWx0UXVlcnknXSB8fCAnJykudG9TdHJpbmcoKVxuICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlVVJJQ29tcG9uZW50KGRlZmF1bHRRdWVyeVN0cmluZykpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4ge31cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHt9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IEhvbWVQYWdlID0gKCkgPT4ge1xuICBjb25zdCBsb2NhdGlvbiA9IHVzZUxvY2F0aW9uKClcbiAgY29uc3QgW3F1ZXJ5TW9kZWxdID0gdXNlVXNlclF1ZXJ5KHtcbiAgICBhdHRyaWJ1dGVzOiBkZWNvZGVVcmxJZlZhbGlkKGxvY2F0aW9uLnNlYXJjaCksXG4gIH0pXG4gIGNvbnN0IHsgaWQgfSA9IHVzZVBhcmFtczx7IGlkPzogc3RyaW5nIH0+KClcbiAgY29uc3Qgc2VhcmNoUGFnZU1vZGUgPSB1c2VTZWFyY2hQYWdlTW9kZSh7IGlkIH0pXG4gIGNvbnN0IGRhdGEgPSB1c2VTYXZlZFNlYXJjaFBhZ2VNb2RlKHsgaWQgfSlcbiAgY29uc3Qgc2F2ZVNlYXJjaFRhc2sgPSB1c2VTYXZlU2VhcmNoVGFza0Jhc2VkT25QYXJhbXMoKVxuICBjb25zdCBpc1NhdmluZyA9IHNhdmVTZWFyY2hUYXNrICE9PSBudWxsXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGV0IHVybEJhc2VkUXVlcnkgPSBsb2NhdGlvbi5zZWFyY2guc3BsaXQoJz9kZWZhdWx0UXVlcnk9JylbMV1cbiAgICBpZiAodXJsQmFzZWRRdWVyeSkge1xuICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpLnJlZmV0Y2hPclN0YXJ0U2VhcmNoRnJvbUZpcnN0UGFnZSgpXG4gICAgfVxuICB9LCBbXSlcbiAgY29uc3QgW3NlbGVjdGlvbkludGVyZmFjZV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBuZXcgU2VsZWN0aW9uSW50ZXJmYWNlTW9kZWwoe1xuICAgICAgY3VycmVudFF1ZXJ5OiBxdWVyeU1vZGVsLFxuICAgIH0pXG4gIClcbiAgdXNlS2VlcFNlYXJjaEluVXJsKHtcbiAgICBxdWVyeU1vZGVsOiBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCksXG4gICAgb246IHNlYXJjaFBhZ2VNb2RlID09PSAnYWRob2MnLFxuICB9KVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICh0eXBlb2YgZGF0YSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICBzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkuc2V0KGRhdGEucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgICB9XG4gIH0sIFtkYXRhXSlcbiAgdXNlVXBkYXRlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VhcmNoUGFnZU1vZGUgPT09ICdhZGhvYycpIHtcbiAgICAgIHNlbGVjdGlvbkludGVyZmFjZS5nZXRDdXJyZW50UXVlcnkoKS51bnNldCgnaWQnKVxuICAgICAgaWYgKGxvY2F0aW9uLnNlYXJjaCA9PT0gJycpIHtcbiAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLmdldEN1cnJlbnRRdWVyeSgpLnJlc2V0VG9EZWZhdWx0cygpXG4gICAgICB9XG4gICAgfVxuICB9LCBbc2VhcmNoUGFnZU1vZGUsIGxvY2F0aW9uLnNlYXJjaF0pXG4gIGNvbnN0IHsgc2V0RWxlbWVudCB9ID0gdXNlTGlzdGVuVG9FbnRlcktleVN1Ym1pdEV2ZW50KHtcbiAgICBjYWxsYmFjazogKCkgPT4ge1xuICAgICAgOyhzZWxlY3Rpb25JbnRlcmZhY2UuZ2V0Q3VycmVudFF1ZXJ5KCkgYXMgYW55KS5zdGFydFNlYXJjaEZyb21GaXJzdFBhZ2UoKVxuICAgIH0sXG4gIH0pXG4gIHJldHVybiAoXG4gICAgPFNhdmVkU2VhcmNoTW9kZUNvbnRleHQuUHJvdmlkZXJcbiAgICAgIHZhbHVlPXt7XG4gICAgICAgIGRhdGEsXG4gICAgICAgIHNlYXJjaFBhZ2VNb2RlLFxuICAgICAgICBpc1NhdmluZyxcbiAgICAgICAgc2VsZWN0aW9uSW50ZXJmYWNlLFxuICAgICAgfX1cbiAgICA+XG4gICAgICA8TWVtbyBkZXBlbmRlbmNpZXM9e1tzZWxlY3Rpb25JbnRlcmZhY2VdfT5cbiAgICAgICAgPEF1dG9TYXZlIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgIDxTcGxpdFBhbmVcbiAgICAgICAgICAgIHZhcmlhbnQ9XCJob3Jpem9udGFsXCJcbiAgICAgICAgICAgIGNvbGxhcHNlZExlbmd0aD17ODB9XG4gICAgICAgICAgICAvLyBzdGFydGluZ0xlbmd0aD17NDB9IC8vIGdvb2QgZm9yIHJhcGlkbHkgdGVzdGluZyBjb2xsYXBzZWQgbW9kZSBpbiBkZXYgc2VydmVyXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLWZ1bGwgdy1mdWxsIHB5LTJcIj5cbiAgICAgICAgICAgICAgPFBhcGVyXG4gICAgICAgICAgICAgICAgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhbmVsc31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJoLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuIHctZnVsbFwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIHctZnVsbCBoLWZ1bGxcIlxuICAgICAgICAgICAgICAgICAgcmVmPXtzZXRFbGVtZW50fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxMZWZ0VG9wIC8+XG5cbiAgICAgICAgICAgICAgICAgIDxMZWZ0TWlkZGxlIC8+XG4gICAgICAgICAgICAgICAgICA8RGFya0RpdmlkZXIgY2xhc3NOYW1lPVwiaC1taW4gdy1mdWxsXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxMZWZ0Qm90dG9tIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvUGFwZXI+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbFwiPlxuICAgICAgICAgICAgICA8R29sZGVuTGF5b3V0IHNlbGVjdGlvbkludGVyZmFjZT17c2VsZWN0aW9uSW50ZXJmYWNlfSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9TcGxpdFBhbmU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9NZW1vPlxuICAgIDwvU2F2ZWRTZWFyY2hNb2RlQ29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuIl19