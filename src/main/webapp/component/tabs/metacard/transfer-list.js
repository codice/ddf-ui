import { __assign, __awaiter, __generator, __read } from "tslib";
/* https://material-ui.com/components/transfer-list/ */
import { hot } from 'react-hot-loader';
import React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { useDialog } from '../../dialog';
import EditIcon from '@mui/icons-material/Edit';
import { Editor } from './summary';
import { DragDropContext, Droppable, Draggable, } from 'react-beautiful-dnd';
import extension from '../../../extension-points';
import { Elevations } from '../../theme/theme';
import { DarkDivider } from '../../dark-divider/dark-divider';
import LeftArrowIcon from '@mui/icons-material/ChevronLeft';
import RightArrowIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { AutoVariableSizeList } from 'react-window-components';
import debounce from 'lodash.debounce';
import { Memo } from '../../memo/memo';
import { TypedUserInstance } from '../../singletons/TypedUser';
import user from '../../singletons/user-instance';
import ExtensionPoints from '../../../extension-points/extension-points';
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks';
import { StartupDataStore } from '../../../js/model/Startup/startup';
import { useConfiguration } from '../../../js/model/Startup/configuration.hooks';
var getAmountChecked = function (items) {
    return Object.values(items).filter(function (a) { return a; }).length;
};
var handleShiftClick = function (_a) {
    var _b;
    var items = _a.items, filteredItemArray = _a.filteredItemArray, setItems = _a.setItems, item = _a.item;
    var defaultMin = filteredItemArray.length;
    var defaultMax = -1;
    var firstIndex = filteredItemArray.reduce(function (min, filteredItem, index) {
        if (items[filteredItem]) {
            return Math.min(min, index);
        }
        return min;
    }, defaultMin);
    var lastIndex = filteredItemArray.reduce(function (max, filteredItem, index) {
        if (items[filteredItem]) {
            return Math.max(max, index);
        }
        return max;
    }, defaultMax);
    var indexClicked = filteredItemArray.indexOf(item);
    if (firstIndex === defaultMin && lastIndex === defaultMax) {
        setItems(__assign(__assign({}, items), (_b = {}, _b[item] = true, _b)));
    }
    else if (indexClicked <= firstIndex) {
        // traverse from target to next until firstIndex
        var updates = filteredItemArray.slice(indexClicked, firstIndex + 1);
        setItems(__assign(__assign({}, items), updates.reduce(function (blob, filteredItem) {
            blob[filteredItem] = true;
            return blob;
        }, {})));
    }
    else if (indexClicked >= lastIndex) {
        // traverse from target to prev until lastIndex
        var updates = filteredItemArray.slice(lastIndex, indexClicked + 1);
        setItems(__assign(__assign({}, items), updates.reduce(function (blob, filteredItem) {
            blob[filteredItem] = true;
            return blob;
        }, {})));
    }
    else {
        // traverse from target to prev until something doesn't change
        var closestPreviousIndex = filteredItemArray
            .slice(0, indexClicked - 1)
            .reduce(function (max, filteredItem, index) {
            if (items[filteredItem]) {
                return Math.max(max, index);
            }
            return max;
        }, defaultMax);
        var updates = filteredItemArray.slice(closestPreviousIndex, indexClicked + 1);
        setItems(__assign(__assign({}, items), updates.reduce(function (blob, filteredItem) {
            blob[filteredItem] = true;
            return blob;
        }, {})));
    }
};
var ItemRow = function (_a) {
    var value = _a.value, required = _a.required, lazyResult = _a.lazyResult, startOver = _a.startOver, measure = _a.measure, filter = _a.filter;
    var _b = __read(React.useState(false), 2), show = _b[0], setShow = _b[1];
    var MetacardDefinitions = useMetacardDefinitions();
    var dialogContext = useDialog();
    var _c = React.useContext(CustomListContext), setItems = _c.setItems, items = _c.items, filteredItemArray = _c.filteredItemArray;
    var isNotWritable = useCustomReadOnlyCheck().isNotWritable;
    React.useEffect(function () {
        if (measure)
            measure();
    }, []);
    var alias = MetacardDefinitions.getAlias(value);
    var isReadonly = lazyResult
        ? isNotWritable({
            attribute: value,
            lazyResult: lazyResult,
        })
        : true;
    if (filter && !alias.toLowerCase().includes(filter.toLowerCase())) {
        return null;
    }
    var CustomAttributeEditor = lazyResult
        ? ExtensionPoints.attributeEditor(lazyResult, value)
        : null;
    return (React.createElement("div", { "data-id": "attribute-container", role: "listitem", className: "p-0 flex w-full" },
        React.createElement(Tooltip, { title: "Attributes required by admin must remain 'Active'.", open: show },
            React.createElement("div", { onMouseEnter: function () { return required && setShow(true); }, onMouseLeave: function () { return setShow(false); } },
                React.createElement(Button, { disabled: required, onClick: function (event) {
                        var _a, _b;
                        if (event.shiftKey) {
                            handleShiftClick({
                                items: items,
                                item: value,
                                setItems: setItems,
                                filteredItemArray: filteredItemArray,
                            });
                        }
                        else if (event.ctrlKey || event.metaKey) {
                            setItems(__assign(__assign({}, items), (_a = {}, _a[value] = !items[value], _a)));
                        }
                        else {
                            setItems(__assign(__assign({}, items), (_b = {}, _b[value] = !items[value], _b)));
                        }
                    }, size: "medium" }, items[value] ? React.createElement(CheckBoxIcon, null) : React.createElement(CheckBoxOutlineBlankIcon, null)))),
        React.createElement(Button, { disabled: required, fullWidth: true, size: "medium", className: "justify-start", onClick: function (event) {
                var _a, _b;
                if (event.shiftKey) {
                    handleShiftClick({
                        items: items,
                        item: value,
                        setItems: setItems,
                        filteredItemArray: filteredItemArray,
                    });
                }
                else if (event.ctrlKey || event.metaKey) {
                    setItems(__assign(__assign({}, items), (_a = {}, _a[value] = !items[value], _a)));
                }
                else {
                    // really the only difference from the checkbox click event, where we turn off everything but this one
                    setItems(__assign(__assign({}, Object.keys(items).reduce(function (blob, val) {
                        blob[val] = false;
                        return blob;
                    }, {})), (_b = {}, _b[value] = !items[value], _b)));
                }
            } }, alias),
        !isReadonly && lazyResult && (React.createElement(Button, { "data-id": "edit-button", style: {
                pointerEvents: 'all',
                height: '100%',
            }, onClick: function () {
                dialogContext.setProps({
                    PaperProps: {
                        style: {
                            minWidth: 'none',
                        },
                    },
                    open: true,
                    children: CustomAttributeEditor ? (React.createElement(CustomAttributeEditor, { attribute: value, result: lazyResult, onCancel: startOver, onSave: startOver, goBack: startOver })) : (React.createElement("div", { style: {
                            padding: '10px',
                            minHeight: '30em',
                            minWidth: '60vh',
                        } },
                        React.createElement(Editor, { attr: value, lazyResult: lazyResult, 
                            /* Re-open this modal again but with the current state
                      This maintains the state so that if we haven't saved,
                      we can come back to where we were working */
                            goBack: startOver, onCancel: startOver, onSave: startOver }))),
                });
            } },
            React.createElement(EditIcon, null)))));
};
var CustomListContext = React.createContext({
    items: {},
    setItems: (function () { }),
    filteredItemArray: [],
});
var filterUpdate = function (_a) {
    var filter = _a.filter, setItemArray = _a.setItemArray, items = _a.items;
    setItemArray(Object.keys(items).filter(function (attr) {
        var alias = StartupDataStore.MetacardDefinitions.getAlias(attr);
        var isFiltered = filter !== ''
            ? !alias.toLowerCase().includes(filter.toLowerCase())
            : false;
        return !isFiltered;
    }));
};
var generateDebouncedFilterUpdate = function () {
    return debounce(filterUpdate, 500);
};
/**
 * At the moment, we only virtualize the right side since that's likely to be huge whereas the left isn't (it also has DND on left, which makes things diff to virtualize)
 */
var CustomList = function (_a) {
    var title = _a.title, items = _a.items, requiredAttributes = _a.requiredAttributes, lazyResult = _a.lazyResult, updateItems = _a.updateItems, isDnD = _a.isDnD, handleToggleAll = _a.handleToggleAll, mode = _a.mode, startOver = _a.startOver, totalPossible = _a.totalPossible;
    var itemsRef = React.useRef(items);
    itemsRef.current = items; // don't see a performant way besides this to allow us to avoid rerendering DnD but allow it to update the item orders correctly
    var _b = __read(React.useState(''), 2), filter = _b[0], setFilter = _b[1];
    var _c = __read(React.useState(Object.keys(items)), 2), unfilteredItemArray = _c[0], setUnfilteredItemArray = _c[1];
    var _d = __read(React.useState(Object.keys(items)), 2), filteredItemArray = _d[0], setFilteredItemArray = _d[1];
    var _e = __read(React.useState(false), 2), isFiltering = _e[0], setIsFiltering = _e[1];
    var debouncedFilterUpdate = React.useRef(generateDebouncedFilterUpdate());
    var numberChecked = getAmountChecked(items);
    var total = Object.keys(items).length;
    var totalCheckable = requiredAttributes
        ? total - requiredAttributes.length
        : total;
    var isIndeterminate = numberChecked !== totalCheckable && numberChecked !== 0;
    var isCompletelySelected = numberChecked === totalCheckable && totalCheckable !== 0;
    React.useEffect(function () {
        setUnfilteredItemArray(Object.keys(items));
    }, [Object.keys(items).toString()]);
    React.useEffect(function () {
        setIsFiltering(true);
        debouncedFilterUpdate.current({
            items: items,
            filter: filter,
            setItemArray: setFilteredItemArray,
        });
    }, [Object.keys(items).toString(), filter]);
    React.useEffect(function () {
        setIsFiltering(false);
    }, [filteredItemArray]);
    // memo this, other wise the creation of the new object each time is seen as a "change"
    var memoProviderValue = React.useMemo(function () {
        return { items: items, setItems: updateItems, filteredItemArray: filteredItemArray };
    }, [items, updateItems]);
    return (React.createElement(CustomListContext.Provider, { value: memoProviderValue },
        React.createElement(Paper, { "data-id": "".concat(title.toLowerCase(), "-container"), elevation: Elevations.paper },
            React.createElement(Grid, { container: true, className: "p-2 text-xl font-normal relative", direction: "row", wrap: "nowrap", alignItems: "center" },
                React.createElement(Grid, { item: true, className: "absolute left-0 top-0 ml-2 mt-min" },
                    React.createElement(Button, { "data-id": "".concat(title.toLowerCase(), "-select-all-checkbox"), disabled: Object.keys(items).length === 0, onClick: handleToggleAll(items), color: "primary" }, (function () {
                        if (isCompletelySelected) {
                            return (React.createElement(React.Fragment, null,
                                React.createElement(CheckBoxIcon, null),
                                numberChecked,
                                ' '));
                        }
                        else if (isIndeterminate) {
                            return (React.createElement(React.Fragment, null,
                                React.createElement(IndeterminateCheckBoxIcon, null),
                                numberChecked,
                                ' '));
                        }
                        else {
                            return React.createElement(CheckBoxOutlineBlankIcon, null);
                        }
                    })())),
                React.createElement(Grid, { item: true, className: "m-auto " },
                    title,
                    " (",
                    total,
                    "/",
                    totalPossible,
                    ")")),
            React.createElement(DarkDivider, { className: "w-full h-min" }),
            React.createElement("div", { className: "p-2" },
                React.createElement(TextField, { "data-id": "filter-input", size: "small", variant: "outlined", label: "Filter by keyword", fullWidth: true, value: filter, onChange: function (e) {
                        setFilter(e.target.value);
                    } })),
            React.createElement(DarkDivider, { className: "w-full h-min" }),
            mode === 'loading' ? (React.createElement(CircularProgress, null)) : (React.createElement(List, { className: "w-common h-common overflow-hidden relative", dense: true, component: "div", role: "list" },
                isFiltering ? (React.createElement(LinearProgress, { className: "w-full h-1 absolute left-0 top-0", variant: "indeterminate" })) : null,
                isDnD ? (React.createElement(Memo, { dependencies: [filteredItemArray] },
                    React.createElement("div", { className: "flex flex-col flex-nowrap h-full w-full overflow-hidden" },
                        React.createElement("div", { className: "italic px-4 text-xs font-normal" }, "Click and drag attributes to reorder."),
                        React.createElement("div", { className: "w-full h-full" },
                            React.createElement(DragDropContext, { onDragEnd: function (result) {
                                    //Put these NO-OPs up front for performance reasons:
                                    //1. If the item is dropped outside the list, do nothing
                                    //2. If the item is moved into the same place, do nothing
                                    if (!result.destination) {
                                        return;
                                    }
                                    if (result.source.index === result.destination.index) {
                                        return;
                                    }
                                    // complicated by the fact that we filter, so we need to find the original and dest index ourselves :(
                                    if (result.reason === 'DROP' && result.destination) {
                                        var shiftedOriginalIndex = unfilteredItemArray.indexOf(result.draggableId);
                                        var shiftedDestIndex = unfilteredItemArray.indexOf(filteredItemArray[result.destination.index]);
                                        var clonedList = unfilteredItemArray.slice(0);
                                        clonedList.splice(shiftedOriginalIndex, 1);
                                        clonedList.splice(shiftedDestIndex, 0, // insert WITHOUT removing anything
                                        result.draggableId);
                                        var newList = clonedList.reduce(function (blob, attr) {
                                            blob[attr] = itemsRef.current[attr];
                                            return blob;
                                        }, {});
                                        updateItems(newList);
                                        filterUpdate({
                                            filter: filter,
                                            setItemArray: setFilteredItemArray,
                                            items: newList,
                                        }); // in this case, we eagerly set in order to avoid flickering
                                    }
                                } },
                                React.createElement("div", { className: "children-h-full children-w-full h-full w-full overflow-hidden" },
                                    React.createElement(Droppable, { droppableId: "test", mode: "virtual", renderClone: function (provided, _snapshot, rubric) {
                                            return (React.createElement("div", __assign({}, provided.draggableProps, provided.dragHandleProps, { ref: provided.innerRef }),
                                                React.createElement(ItemRow, { value: filteredItemArray[rubric.source.index], required: requiredAttributes === null || requiredAttributes === void 0 ? void 0 : requiredAttributes.includes(filteredItemArray[rubric.source.index]), startOver: startOver, lazyResult: lazyResult, filter: filter })));
                                        } }, function (provided) {
                                        return (React.createElement(AutoVariableSizeList, { items: filteredItemArray, defaultSize: 39.42, controlledMeasuring: true, overscanCount: 10, outerRef: provided.innerRef, Item: function (_a) {
                                                var itemRef = _a.itemRef, item = _a.item, measure = _a.measure, index = _a.index;
                                                return (React.createElement("div", { ref: itemRef, className: "relative" },
                                                    React.createElement(Draggable, { draggableId: item, index: index, key: item, isDragDisabled: !isDnD, disableInteractiveElementBlocking: true }, function (provided) {
                                                        return (React.createElement("div", __assign({ ref: provided.innerRef }, provided.draggableProps, provided.dragHandleProps),
                                                            React.createElement(ItemRow, { value: item, required: requiredAttributes === null || requiredAttributes === void 0 ? void 0 : requiredAttributes.includes(item), startOver: startOver, lazyResult: lazyResult, 
                                                                // filter={filter}
                                                                measure: measure })));
                                                    })));
                                            }, Empty: function () {
                                                return React.createElement("div", null);
                                            } }));
                                    }))))))) : (React.createElement(React.Fragment, null,
                    React.createElement(AutoVariableSizeList, { items: filteredItemArray, defaultSize: 39.42, controlledMeasuring: true, overscanCount: 10, Item: function (_a) {
                            var itemRef = _a.itemRef, item = _a.item, measure = _a.measure;
                            return (React.createElement("div", { ref: itemRef, className: "relative" },
                                React.createElement(ItemRow, { value: item, required: requiredAttributes === null || requiredAttributes === void 0 ? void 0 : requiredAttributes.includes(item), startOver: startOver, lazyResult: lazyResult, measure: measure })));
                        }, Empty: function () {
                            return React.createElement("div", null);
                        } }))))))));
};
export var useCustomReadOnlyCheck = function () {
    var Configuration = useConfiguration();
    var _a = __read(React.useState([]), 2), customEditableAttributes = _a[0], setCustomEditableAttributes = _a[1];
    var isMounted = React.useRef(true);
    var _b = __read(React.useState(true), 2), loading = _b[0], setLoading = _b[1];
    var initializeCustomEditableAttributes = function () { return __awaiter(void 0, void 0, void 0, function () {
        var attrs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, extension.customEditableAttributes()];
                case 1:
                    attrs = _a.sent();
                    if (isMounted.current) {
                        if (attrs !== undefined) {
                            setCustomEditableAttributes(attrs);
                        }
                        setLoading(false);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    React.useEffect(function () {
        initializeCustomEditableAttributes();
        return function () {
            isMounted.current = false;
        };
    }, []);
    return {
        loading: loading,
        isNotWritable: function (_a) {
            var attribute = _a.attribute, lazyResult = _a.lazyResult;
            var perm = extension.customCanWritePermission({
                attribute: attribute,
                lazyResult: lazyResult,
                user: user,
                editableAttributes: customEditableAttributes,
            });
            if (perm !== undefined) {
                return !perm;
            }
            var determination = lazyResult.isRemote() ||
                !TypedUserInstance.canWrite(lazyResult) ||
                Configuration.isReadOnly(attribute);
            return determination;
        },
    };
};
var convertAttrListToMap = function (attrs) {
    return attrs.reduce(function (blob, attr) {
        blob[attr] = false;
        return blob;
    }, {});
};
var TransferList = function (_a) {
    var startingLeft = _a.startingLeft, requiredAttributes = _a.requiredAttributes, startingRight = _a.startingRight, startingHideEmpty = _a.startingHideEmpty, lazyResult = _a.lazyResult, onSave = _a.onSave;
    var dialogContext = useDialog();
    var _b = __read(React.useState('loading'), 2), mode = _b[0], setMode = _b[1];
    var _c = __read(React.useState(convertAttrListToMap(startingLeft)), 2), left = _c[0], setLeft = _c[1];
    var _d = __read(React.useState(convertAttrListToMap(startingRight)), 2), right = _d[0], setRight = _d[1];
    var _e = __read(React.useState(startingHideEmpty), 2), hideEmpty = _e[0], setHideEmpty = _e[1];
    var loading = useCustomReadOnlyCheck().loading;
    React.useEffect(function () {
        if (!loading) {
            setMode('normal');
        }
    }, [loading]);
    var generateHandleToggleAll = function (_a) {
        var setState = _a.setState, state = _a.state, _b = _a.disabledAttributes, disabledAttributes = _b === void 0 ? [] : _b;
        return function () { return function () {
            var allValues = Object.values(state);
            var totalCheckable = allValues.length - disabledAttributes.length;
            var numberChecked = allValues.filter(function (checked) { return checked; }).length;
            var allSelected = numberChecked === totalCheckable && totalCheckable !== 0;
            if (!allSelected) {
                setState(Object.keys(state).reduce(function (blob, attr) {
                    if (disabledAttributes.includes(attr))
                        blob[attr] = false;
                    else
                        blob[attr] = true;
                    return blob;
                }, {}));
            }
            else {
                setState(Object.keys(state).reduce(function (blob, attr) {
                    blob[attr] = false;
                    return blob;
                }, {}));
            }
        }; };
    };
    var moveRight = function () {
        var checkedLeft = Object.entries(left)
            .filter(function (a) { return a[1]; })
            .reduce(function (blob, a) {
            blob[a[0]] = false;
            return blob;
        }, {});
        var nonCheckedLeft = Object.entries(left)
            .filter(function (a) { return !a[1]; })
            .reduce(function (blob, a) {
            blob[a[0]] = a[1];
            return blob;
        }, {});
        setRight(__assign(__assign({}, right), checkedLeft));
        setLeft(nonCheckedLeft);
    };
    var moveLeft = function () {
        var checkedRight = Object.entries(right)
            .filter(function (a) { return a[1]; })
            .reduce(function (blob, a) {
            blob[a[0]] = false;
            return blob;
        }, {});
        var nonCheckedRight = Object.entries(right)
            .filter(function (a) { return !a[1]; })
            .reduce(function (blob, a) {
            blob[a[0]] = a[1];
            return blob;
        }, {});
        setLeft(__assign(__assign({}, left), checkedRight));
        setRight(nonCheckedRight);
    };
    var hasLeftChecked = Object.entries(left).find(function (a) { return a[1]; }) !== undefined;
    var hasRightChecked = Object.entries(right).find(function (a) { return a[1]; }) !== undefined;
    var startOver = function () {
        dialogContext.setProps({
            open: true,
            children: (React.createElement(TransferList, { startingLeft: Object.keys(left), startingRight: Object.keys(right), startingHideEmpty: hideEmpty, lazyResult: lazyResult, onSave: onSave })),
        });
    };
    var totalPossible = startingLeft.length + startingRight.length;
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "text-2xl text-center px-2 pb-2 pt-4 font-normal relative" },
            "Manage Attributes",
            React.createElement(Button, { "data-id": "close-button", className: "absolute right-0 top-0 mr-1 mt-1", variant: "text", size: "small", onClick: function () {
                    dialogContext.setProps({
                        open: false,
                        children: null,
                    });
                } },
                React.createElement(CloseIcon, null))),
        React.createElement(DarkDivider, { className: "w-full h-min" }),
        React.createElement(DialogContent, null,
            React.createElement(Grid, { container: true, spacing: 2, justifyContent: "center", alignItems: "center", className: "m-auto" },
                React.createElement(Grid, { item: true },
                    React.createElement(CustomList, { title: "Active", items: left, requiredAttributes: requiredAttributes, lazyResult: lazyResult, updateItems: setLeft, isDnD: true, startOver: startOver, handleToggleAll: generateHandleToggleAll({
                            setState: setLeft,
                            state: left,
                            disabledAttributes: requiredAttributes,
                        }), totalPossible: totalPossible, mode: mode })),
                React.createElement(Grid, { item: true },
                    React.createElement(Grid, { container: true, direction: "column", alignItems: "center" },
                        React.createElement(Button, { "data-id": "move-right-button", variant: "outlined", className: "m-1", onClick: moveRight, disabled: !hasLeftChecked, "aria-label": "move selected right" },
                            React.createElement(RightArrowIcon, null)),
                        React.createElement(Button, { "data-id": "move-left-button", variant: "outlined", className: "m-1", onClick: moveLeft, disabled: !hasRightChecked, "aria-label": "move selected left" },
                            React.createElement(LeftArrowIcon, null)))),
                React.createElement(Grid, { item: true },
                    React.createElement(CustomList, { title: "Hidden", items: right, lazyResult: lazyResult, updateItems: setRight, isDnD: false, startOver: startOver, handleToggleAll: generateHandleToggleAll({
                            setState: setRight,
                            state: right,
                        }), mode: mode, totalPossible: totalPossible })))),
        React.createElement(DarkDivider, { className: "w-full h-min" }),
        React.createElement(DialogActions, null,
            hideEmpty !== undefined && (React.createElement(React.Fragment, null,
                React.createElement(FormControlLabel, { control: React.createElement(Switch, { checked: hideEmpty, onChange: function (e) { return setHideEmpty(e.target.checked); } }), label: "Hide empty attributes in inspector", style: { paddingLeft: '10px' } }),
                React.createElement("div", { style: { flex: '1 0 0' } }))),
            React.createElement(Button, { "data-id": "dialog-save-button", disabled: mode === 'saving', onClick: function () {
                    dialogContext.setProps({
                        open: false,
                        children: null,
                    });
                }, variant: "text", color: "secondary", className: "mr-2" }, "Cancel"),
            React.createElement(Button, { className: "ml-2", disabled: mode === 'saving', onClick: function () {
                    setMode('saving');
                    onSave(Object.keys(left), hideEmpty);
                    dialogContext.setProps({
                        open: false,
                        children: null,
                    });
                }, variant: "contained", color: "primary" }, "Save")),
        mode === 'saving' ? (React.createElement(LinearProgress, { style: {
                width: '100%',
                height: '10px',
                position: 'absolute',
                left: '0px',
                bottom: '0%',
            }, variant: "indeterminate" })) : null));
};
export default hot(module)(TransferList);
//# sourceMappingURL=transfer-list.js.map