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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXItbGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdGFicy9tZXRhY2FyZC90cmFuc2Zlci1saXN0LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsdURBQXVEO0FBQ3ZELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQTtBQUN0QyxPQUFPLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDekIsT0FBTyxJQUFJLE1BQU0sb0JBQW9CLENBQUE7QUFDckMsT0FBTyxJQUFJLE1BQU0sb0JBQW9CLENBQUE7QUFDckMsT0FBTyxNQUFNLE1BQU0sc0JBQXNCLENBQUE7QUFDekMsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxTQUFTLE1BQU0seUJBQXlCLENBQUE7QUFDL0MsT0FBTyxPQUFPLE1BQU0sdUJBQXVCLENBQUE7QUFDM0MsT0FBTyxjQUFjLE1BQU0sOEJBQThCLENBQUE7QUFDekQsT0FBTyxnQkFBZ0IsTUFBTSxnQ0FBZ0MsQ0FBQTtBQUM3RCxPQUFPLEtBQUssTUFBTSxxQkFBcUIsQ0FBQTtBQUN2QyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sY0FBYyxDQUFBO0FBQ3hDLE9BQU8sUUFBUSxNQUFNLDBCQUEwQixDQUFBO0FBQy9DLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxXQUFXLENBQUE7QUFFbEMsT0FBTyxFQUVMLGVBQWUsRUFDZixTQUFTLEVBQ1QsU0FBUyxHQUNWLE1BQU0scUJBQXFCLENBQUE7QUFDNUIsT0FBTyxTQUFTLE1BQU0sMkJBQTJCLENBQUE7QUFDakQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1CQUFtQixDQUFBO0FBQzlDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQTtBQUM3RCxPQUFPLGFB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ZUFBZSxHQUN2QixDQUNILENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDUCxDQUNKLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qIGh0dHBzOi8vbWF0ZXJpYWwtdWkuY29tL2NvbXBvbmVudHMvdHJhbnNmZXItbGlzdC8gKi9cbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgTGlzdCBmcm9tICdAbXVpL21hdGVyaWFsL0xpc3QnXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnQgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dDb250ZW50J1xuaW1wb3J0IERpYWxvZ0FjdGlvbnMgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dBY3Rpb25zJ1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICdAbXVpL21hdGVyaWFsL1RleHRGaWVsZCdcbmltcG9ydCBUb29sdGlwIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVG9vbHRpcCdcbmltcG9ydCBMaW5lYXJQcm9ncmVzcyBmcm9tICdAbXVpL21hdGVyaWFsL0xpbmVhclByb2dyZXNzJ1xuaW1wb3J0IENpcmN1bGFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9DaXJjdWxhclByb2dyZXNzJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyB1c2VEaWFsb2cgfSBmcm9tICcuLi8uLi9kaWFsb2cnXG5pbXBvcnQgRWRpdEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9FZGl0J1xuaW1wb3J0IHsgRWRpdG9yIH0gZnJvbSAnLi9zdW1tYXJ5J1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7XG4gIERyb3BSZXN1bHQsXG4gIERyYWdEcm9wQ29udGV4dCxcbiAgRHJvcHBhYmxlLFxuICBEcmFnZ2FibGUsXG59IGZyb20gJ3JlYWN0LWJlYXV0aWZ1bC1kbmQnXG5pbXBvcnQgZXh0ZW5zaW9uIGZyb20gJy4uLy4uLy4uL2V4dGVuc2lvbi1wb2ludHMnXG5pbXBvcnQgeyBFbGV2YXRpb25zIH0gZnJvbSAnLi4vLi4vdGhlbWUvdGhlbWUnXG5pbXBvcnQgeyBEYXJrRGl2aWRlciB9IGZyb20gJy4uLy4uL2RhcmstZGl2aWRlci9kYXJrLWRpdmlkZXInXG5pbXBvcnQgTGVmdEFycm93SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0NoZXZyb25MZWZ0J1xuaW1wb3J0IFJpZ2h0QXJyb3dJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvQ2hldnJvblJpZ2h0J1xuaW1wb3J0IENsb3NlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0Nsb3NlJ1xuaW1wb3J0IENoZWNrQm94SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0NoZWNrQm94J1xuaW1wb3J0IENoZWNrQm94T3V0bGluZUJsYW5rSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0NoZWNrQm94T3V0bGluZUJsYW5rJ1xuaW1wb3J0IEluZGV0ZXJtaW5hdGVDaGVja0JveEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9JbmRldGVybWluYXRlQ2hlY2tCb3gnXG5pbXBvcnQgRm9ybUNvbnRyb2xMYWJlbCBmcm9tICdAbXVpL21hdGVyaWFsL0Zvcm1Db250cm9sTGFiZWwnXG5pbXBvcnQgU3dpdGNoIGZyb20gJ0BtdWkvbWF0ZXJpYWwvU3dpdGNoJ1xuaW1wb3J0IHsgQXV0b1ZhcmlhYmxlU2l6ZUxpc3QgfSBmcm9tICdyZWFjdC13aW5kb3ctY29tcG9uZW50cydcbmltcG9ydCBkZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5pbXBvcnQgeyBNZW1vIH0gZnJvbSAnLi4vLi4vbWVtby9tZW1vJ1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi9zaW5nbGV0b25zL1R5cGVkVXNlcidcbmltcG9ydCB1c2VyIGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vLi4vZXh0ZW5zaW9uLXBvaW50cy9leHRlbnNpb24tcG9pbnRzJ1xuaW1wb3J0IHsgdXNlTWV0YWNhcmREZWZpbml0aW9ucyB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvbWV0YWNhcmQtZGVmaW5pdGlvbnMuaG9va3MnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IHsgdXNlQ29uZmlndXJhdGlvbiB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvY29uZmlndXJhdGlvbi5ob29rcydcbmNvbnN0IGdldEFtb3VudENoZWNrZWQgPSAoaXRlbXM6IENoZWNrZWRUeXBlKSA9PiB7XG4gIHJldHVybiBPYmplY3QudmFsdWVzKGl0ZW1zKS5maWx0ZXIoKGEpID0+IGEpLmxlbmd0aFxufVxuY29uc3QgaGFuZGxlU2hpZnRDbGljayA9ICh7XG4gIGl0ZW1zLFxuICBmaWx0ZXJlZEl0ZW1BcnJheSxcbiAgc2V0SXRlbXMsXG4gIGl0ZW0sXG59OiB7XG4gIGl0ZW1zOiBDaGVja2VkVHlwZVxuICBpdGVtOiBzdHJpbmdcbiAgZmlsdGVyZWRJdGVtQXJyYXk6IHN0cmluZ1tdXG4gIHNldEl0ZW1zOiBTZXRDaGVja2VkVHlwZVxufSkgPT4ge1xuICBjb25zdCBkZWZhdWx0TWluID0gZmlsdGVyZWRJdGVtQXJyYXkubGVuZ3RoXG4gIGNvbnN0IGRlZmF1bHRNYXggPSAtMVxuICBjb25zdCBmaXJzdEluZGV4ID0gZmlsdGVyZWRJdGVtQXJyYXkucmVkdWNlKChtaW4sIGZpbHRlcmVkSXRlbSwgaW5kZXgpID0+IHtcbiAgICBpZiAoaXRlbXNbZmlsdGVyZWRJdGVtXSkge1xuICAgICAgcmV0dXJuIE1hdGgubWluKG1pbiwgaW5kZXgpXG4gICAgfVxuICAgIHJldHVybiBtaW5cbiAgfSwgZGVmYXVsdE1pbilcbiAgY29uc3QgbGFzdEluZGV4ID0gZmlsdGVyZWRJdGVtQXJyYXkucmVkdWNlKChtYXgsIGZpbHRlcmVkSXRlbSwgaW5kZXgpID0+IHtcbiAgICBpZiAoaXRlbXNbZmlsdGVyZWRJdGVtXSkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4KG1heCwgaW5kZXgpXG4gICAgfVxuICAgIHJldHVybiBtYXhcbiAgfSwgZGVmYXVsdE1heClcbiAgY29uc3QgaW5kZXhDbGlja2VkID0gZmlsdGVyZWRJdGVtQXJyYXkuaW5kZXhPZihpdGVtKVxuICBpZiAoZmlyc3RJbmRleCA9PT0gZGVmYXVsdE1pbiAmJiBsYXN0SW5kZXggPT09IGRlZmF1bHRNYXgpIHtcbiAgICBzZXRJdGVtcyh7XG4gICAgICAuLi5pdGVtcyxcbiAgICAgIFtpdGVtXTogdHJ1ZSxcbiAgICB9KVxuICB9IGVsc2UgaWYgKGluZGV4Q2xpY2tlZCA8PSBmaXJzdEluZGV4KSB7XG4gICAgLy8gdHJhdmVyc2UgZnJvbSB0YXJnZXQgdG8gbmV4dCB1bnRpbCBmaXJzdEluZGV4XG4gICAgY29uc3QgdXBkYXRlcyA9IGZpbHRlcmVkSXRlbUFycmF5LnNsaWNlKGluZGV4Q2xpY2tlZCwgZmlyc3RJbmRleCArIDEpXG4gICAgc2V0SXRlbXMoe1xuICAgICAgLi4uaXRlbXMsXG4gICAgICAuLi51cGRhdGVzLnJlZHVjZSgoYmxvYiwgZmlsdGVyZWRJdGVtKSA9PiB7XG4gICAgICAgIGJsb2JbZmlsdGVyZWRJdGVtXSA9IHRydWVcbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sIHt9IGFzIENoZWNrZWRUeXBlKSxcbiAgICB9KVxuICB9IGVsc2UgaWYgKGluZGV4Q2xpY2tlZCA+PSBsYXN0SW5kZXgpIHtcbiAgICAvLyB0cmF2ZXJzZSBmcm9tIHRhcmdldCB0byBwcmV2IHVudGlsIGxhc3RJbmRleFxuICAgIGNvbnN0IHVwZGF0ZXMgPSBmaWx0ZXJlZEl0ZW1BcnJheS5zbGljZShsYXN0SW5kZXgsIGluZGV4Q2xpY2tlZCArIDEpXG4gICAgc2V0SXRlbXMoe1xuICAgICAgLi4uaXRlbXMsXG4gICAgICAuLi51cGRhdGVzLnJlZHVjZSgoYmxvYiwgZmlsdGVyZWRJdGVtKSA9PiB7XG4gICAgICAgIGJsb2JbZmlsdGVyZWRJdGVtXSA9IHRydWVcbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sIHt9IGFzIENoZWNrZWRUeXBlKSxcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIC8vIHRyYXZlcnNlIGZyb20gdGFyZ2V0IHRvIHByZXYgdW50aWwgc29tZXRoaW5nIGRvZXNuJ3QgY2hhbmdlXG4gICAgY29uc3QgY2xvc2VzdFByZXZpb3VzSW5kZXggPSBmaWx0ZXJlZEl0ZW1BcnJheVxuICAgICAgLnNsaWNlKDAsIGluZGV4Q2xpY2tlZCAtIDEpXG4gICAgICAucmVkdWNlKChtYXgsIGZpbHRlcmVkSXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgaWYgKGl0ZW1zW2ZpbHRlcmVkSXRlbV0pIHtcbiAgICAgICAgICByZXR1cm4gTWF0aC5tYXgobWF4LCBpbmRleClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF4XG4gICAgICB9LCBkZWZhdWx0TWF4KVxuICAgIGNvbnN0IHVwZGF0ZXMgPSBmaWx0ZXJlZEl0ZW1BcnJheS5zbGljZShcbiAgICAgIGNsb3Nlc3RQcmV2aW91c0luZGV4LFxuICAgICAgaW5kZXhDbGlja2VkICsgMVxuICAgIClcbiAgICBzZXRJdGVtcyh7XG4gICAgICAuLi5pdGVtcyxcbiAgICAgIC4uLnVwZGF0ZXMucmVkdWNlKChibG9iLCBmaWx0ZXJlZEl0ZW0pID0+IHtcbiAgICAgICAgYmxvYltmaWx0ZXJlZEl0ZW1dID0gdHJ1ZVxuICAgICAgICByZXR1cm4gYmxvYlxuICAgICAgfSwge30gYXMgQ2hlY2tlZFR5cGUpLFxuICAgIH0pXG4gIH1cbn1cbmNvbnN0IEl0ZW1Sb3cgPSAoe1xuICB2YWx1ZSxcbiAgcmVxdWlyZWQsXG4gIGxhenlSZXN1bHQsXG4gIHN0YXJ0T3ZlcixcbiAgbWVhc3VyZSxcbiAgZmlsdGVyLFxufToge1xuICB2YWx1ZTogc3RyaW5nXG4gIHJlcXVpcmVkPzogYm9vbGVhblxuICBsYXp5UmVzdWx0PzogTGF6eVF1ZXJ5UmVzdWx0XG4gIHN0YXJ0T3ZlcjogKCkgPT4gdm9pZFxuICBtZWFzdXJlPzogKCkgPT4gdm9pZFxuICBmaWx0ZXI/OiBzdHJpbmdcbn0pID0+IHtcbiAgY29uc3QgW3Nob3csIHNldFNob3ddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IE1ldGFjYXJkRGVmaW5pdGlvbnMgPSB1c2VNZXRhY2FyZERlZmluaXRpb25zKClcbiAgY29uc3QgZGlhbG9nQ29udGV4dCA9IHVzZURpYWxvZygpXG4gIGNvbnN0IHsgc2V0SXRlbXMsIGl0ZW1zLCBmaWx0ZXJlZEl0ZW1BcnJheSB9ID1cbiAgICBSZWFjdC51c2VDb250ZXh0KEN1c3RvbUxpc3RDb250ZXh0KVxuICBjb25zdCB7IGlzTm90V3JpdGFibGUgfSA9IHVzZUN1c3RvbVJlYWRPbmx5Q2hlY2soKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChtZWFzdXJlKSBtZWFzdXJlKClcbiAgfSwgW10pXG4gIGNvbnN0IGFsaWFzID0gTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBbGlhcyh2YWx1ZSlcbiAgY29uc3QgaXNSZWFkb25seSA9IGxhenlSZXN1bHRcbiAgICA/IGlzTm90V3JpdGFibGUoe1xuICAgICAgICBhdHRyaWJ1dGU6IHZhbHVlLFxuICAgICAgICBsYXp5UmVzdWx0LFxuICAgICAgfSlcbiAgICA6IHRydWVcbiAgaWYgKGZpbHRlciAmJiAhYWxpYXMudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXIudG9Mb3dlckNhc2UoKSkpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIGNvbnN0IEN1c3RvbUF0dHJpYnV0ZUVkaXRvciA9IGxhenlSZXN1bHRcbiAgICA/IEV4dGVuc2lvblBvaW50cy5hdHRyaWJ1dGVFZGl0b3IobGF6eVJlc3VsdCwgdmFsdWUpXG4gICAgOiBudWxsXG4gIHJldHVybiAoXG4gICAgPGRpdlxuICAgICAgZGF0YS1pZD1cImF0dHJpYnV0ZS1jb250YWluZXJcIlxuICAgICAgcm9sZT1cImxpc3RpdGVtXCJcbiAgICAgIGNsYXNzTmFtZT1cInAtMCBmbGV4IHctZnVsbFwiXG4gICAgPlxuICAgICAgPFRvb2x0aXBcbiAgICAgICAgdGl0bGU9XCJBdHRyaWJ1dGVzIHJlcXVpcmVkIGJ5IGFkbWluIG11c3QgcmVtYWluICdBY3RpdmUnLlwiXG4gICAgICAgIG9wZW49e3Nob3d9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBvbk1vdXNlRW50ZXI9eygpID0+IHJlcXVpcmVkICYmIHNldFNob3codHJ1ZSl9XG4gICAgICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBzZXRTaG93KGZhbHNlKX1cbiAgICAgICAgPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGRpc2FibGVkPXtyZXF1aXJlZH1cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVTaGlmdENsaWNrKHtcbiAgICAgICAgICAgICAgICAgIGl0ZW1zLFxuICAgICAgICAgICAgICAgICAgaXRlbTogdmFsdWUsXG4gICAgICAgICAgICAgICAgICBzZXRJdGVtcyxcbiAgICAgICAgICAgICAgICAgIGZpbHRlcmVkSXRlbUFycmF5LFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5KSB7XG4gICAgICAgICAgICAgICAgc2V0SXRlbXMoe1xuICAgICAgICAgICAgICAgICAgLi4uaXRlbXMsXG4gICAgICAgICAgICAgICAgICBbdmFsdWVdOiAhaXRlbXNbdmFsdWVdLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0SXRlbXMoe1xuICAgICAgICAgICAgICAgICAgLi4uaXRlbXMsXG4gICAgICAgICAgICAgICAgICBbdmFsdWVdOiAhaXRlbXNbdmFsdWVdLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBzaXplPVwibWVkaXVtXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICB7aXRlbXNbdmFsdWVdID8gPENoZWNrQm94SWNvbiAvPiA6IDxDaGVja0JveE91dGxpbmVCbGFua0ljb24gLz59XG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9Ub29sdGlwPlxuICAgICAgPEJ1dHRvblxuICAgICAgICBkaXNhYmxlZD17cmVxdWlyZWR9XG4gICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICBzaXplPVwibWVkaXVtXCJcbiAgICAgICAgY2xhc3NOYW1lPVwianVzdGlmeS1zdGFydFwiXG4gICAgICAgIG9uQ2xpY2s9eyhldmVudCkgPT4ge1xuICAgICAgICAgIGlmIChldmVudC5zaGlmdEtleSkge1xuICAgICAgICAgICAgaGFuZGxlU2hpZnRDbGljayh7XG4gICAgICAgICAgICAgIGl0ZW1zLFxuICAgICAgICAgICAgICBpdGVtOiB2YWx1ZSxcbiAgICAgICAgICAgICAgc2V0SXRlbXMsXG4gICAgICAgICAgICAgIGZpbHRlcmVkSXRlbUFycmF5LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSkge1xuICAgICAgICAgICAgc2V0SXRlbXMoe1xuICAgICAgICAgICAgICAuLi5pdGVtcyxcbiAgICAgICAgICAgICAgW3ZhbHVlXTogIWl0ZW1zW3ZhbHVlXSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHJlYWxseSB0aGUgb25seSBkaWZmZXJlbmNlIGZyb20gdGhlIGNoZWNrYm94IGNsaWNrIGV2ZW50LCB3aGVyZSB3ZSB0dXJuIG9mZiBldmVyeXRoaW5nIGJ1dCB0aGlzIG9uZVxuICAgICAgICAgICAgc2V0SXRlbXMoe1xuICAgICAgICAgICAgICAuLi5PYmplY3Qua2V5cyhpdGVtcykucmVkdWNlKChibG9iLCB2YWwpID0+IHtcbiAgICAgICAgICAgICAgICBibG9iW3ZhbF0gPSBmYWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBibG9iXG4gICAgICAgICAgICAgIH0sIHt9IGFzIENoZWNrZWRUeXBlKSxcbiAgICAgICAgICAgICAgW3ZhbHVlXTogIWl0ZW1zW3ZhbHVlXSxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICB7YWxpYXN9XG4gICAgICA8L0J1dHRvbj5cbiAgICAgIHshaXNSZWFkb25seSAmJiBsYXp5UmVzdWx0ICYmIChcbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGRhdGEtaWQ9XCJlZGl0LWJ1dHRvblwiXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvaW50ZXJFdmVudHM6ICdhbGwnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgICAgICAgICAgUGFwZXJQcm9wczoge1xuICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICBtaW5XaWR0aDogJ25vbmUnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBDdXN0b21BdHRyaWJ1dGVFZGl0b3IgPyAoXG4gICAgICAgICAgICAgICAgPEN1c3RvbUF0dHJpYnV0ZUVkaXRvclxuICAgICAgICAgICAgICAgICAgYXR0cmlidXRlPXt2YWx1ZX1cbiAgICAgICAgICAgICAgICAgIHJlc3VsdD17bGF6eVJlc3VsdH1cbiAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXtzdGFydE92ZXJ9XG4gICAgICAgICAgICAgICAgICBvblNhdmU9e3N0YXJ0T3Zlcn1cbiAgICAgICAgICAgICAgICAgIGdvQmFjaz17c3RhcnRPdmVyfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgICAgICAgICAgICBtaW5IZWlnaHQ6ICczMGVtJyxcbiAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICc2MHZoJyxcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPEVkaXRvclxuICAgICAgICAgICAgICAgICAgICBhdHRyPXt2YWx1ZX1cbiAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17bGF6eVJlc3VsdH1cbiAgICAgICAgICAgICAgICAgICAgLyogUmUtb3BlbiB0aGlzIG1vZGFsIGFnYWluIGJ1dCB3aXRoIHRoZSBjdXJyZW50IHN0YXRlXG4gICAgICAgICAgICAgIFRoaXMgbWFpbnRhaW5zIHRoZSBzdGF0ZSBzbyB0aGF0IGlmIHdlIGhhdmVuJ3Qgc2F2ZWQsXG4gICAgICAgICAgICAgIHdlIGNhbiBjb21lIGJhY2sgdG8gd2hlcmUgd2Ugd2VyZSB3b3JraW5nICovXG4gICAgICAgICAgICAgICAgICAgIGdvQmFjaz17c3RhcnRPdmVyfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17c3RhcnRPdmVyfVxuICAgICAgICAgICAgICAgICAgICBvblNhdmU9e3N0YXJ0T3Zlcn1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8RWRpdEljb24gLz5cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApXG59XG5jb25zdCBDdXN0b21MaXN0Q29udGV4dCA9IFJlYWN0LmNyZWF0ZUNvbnRleHQoe1xuICBpdGVtczoge30gYXMgQ2hlY2tlZFR5cGUsXG4gIHNldEl0ZW1zOiAoKCkgPT4ge30pIGFzIFNldENoZWNrZWRUeXBlLFxuICBmaWx0ZXJlZEl0ZW1BcnJheTogW10gYXMgc3RyaW5nW10sXG59KVxuY29uc3QgZmlsdGVyVXBkYXRlID0gKHtcbiAgZmlsdGVyLFxuICBzZXRJdGVtQXJyYXksXG4gIGl0ZW1zLFxufToge1xuICBpdGVtczoge1xuICAgIFtrZXk6IHN0cmluZ106IGJvb2xlYW5cbiAgfVxuICBmaWx0ZXI6IHN0cmluZ1xuICBzZXRJdGVtQXJyYXk6ICh2YWw6IHN0cmluZ1tdKSA9PiB2b2lkXG59KSA9PiB7XG4gIHNldEl0ZW1BcnJheShcbiAgICBPYmplY3Qua2V5cyhpdGVtcykuZmlsdGVyKChhdHRyKSA9PiB7XG4gICAgICBjb25zdCBhbGlhcyA9IFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBbGlhcyhhdHRyKVxuICAgICAgY29uc3QgaXNGaWx0ZXJlZCA9XG4gICAgICAgIGZpbHRlciAhPT0gJydcbiAgICAgICAgICA/ICFhbGlhcy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlci50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgIDogZmFsc2VcbiAgICAgIHJldHVybiAhaXNGaWx0ZXJlZFxuICAgIH0pXG4gIClcbn1cbmNvbnN0IGdlbmVyYXRlRGVib3VuY2VkRmlsdGVyVXBkYXRlID0gKCkgPT4ge1xuICByZXR1cm4gZGVib3VuY2UoZmlsdGVyVXBkYXRlLCA1MDApXG59XG4vKipcbiAqIEF0IHRoZSBtb21lbnQsIHdlIG9ubHkgdmlydHVhbGl6ZSB0aGUgcmlnaHQgc2lkZSBzaW5jZSB0aGF0J3MgbGlrZWx5IHRvIGJlIGh1Z2Ugd2hlcmVhcyB0aGUgbGVmdCBpc24ndCAoaXQgYWxzbyBoYXMgRE5EIG9uIGxlZnQsIHdoaWNoIG1ha2VzIHRoaW5ncyBkaWZmIHRvIHZpcnR1YWxpemUpXG4gKi9cbmNvbnN0IEN1c3RvbUxpc3QgPSAoe1xuICB0aXRsZSxcbiAgaXRlbXMsXG4gIHJlcXVpcmVkQXR0cmlidXRlcyxcbiAgbGF6eVJlc3VsdCxcbiAgdXBkYXRlSXRlbXMsXG4gIGlzRG5ELFxuICBoYW5kbGVUb2dnbGVBbGwsXG4gIG1vZGUsXG4gIHN0YXJ0T3ZlcixcbiAgdG90YWxQb3NzaWJsZSxcbn06IHtcbiAgdGl0bGU6IFJlYWN0LlJlYWN0Tm9kZVxuICBpdGVtczogQ2hlY2tlZFR5cGVcbiAgcmVxdWlyZWRBdHRyaWJ1dGVzPzogc3RyaW5nW11cbiAgbGF6eVJlc3VsdD86IExhenlRdWVyeVJlc3VsdFxuICB1cGRhdGVJdGVtczogU2V0Q2hlY2tlZFR5cGVcbiAgaXNEbkQ6IGJvb2xlYW4gLy8gZHJhZyBhbmQgZHJvcCBhbGxvd2VkP1xuICBoYW5kbGVUb2dnbGVBbGw6IChwcm9wczogYW55KSA9PiAoKSA9PiB2b2lkXG4gIG1vZGU6ICdsb2FkaW5nJyB8IHN0cmluZ1xuICBzdGFydE92ZXI6ICgpID0+IHZvaWRcbiAgdG90YWxQb3NzaWJsZTogbnVtYmVyXG59KSA9PiB7XG4gIGNvbnN0IGl0ZW1zUmVmID0gUmVhY3QudXNlUmVmKGl0ZW1zKVxuICBpdGVtc1JlZi5jdXJyZW50ID0gaXRlbXMgLy8gZG9uJ3Qgc2VlIGEgcGVyZm9ybWFudCB3YXkgYmVzaWRlcyB0aGlzIHRvIGFsbG93IHVzIHRvIGF2b2lkIHJlcmVuZGVyaW5nIERuRCBidXQgYWxsb3cgaXQgdG8gdXBkYXRlIHRoZSBpdGVtIG9yZGVycyBjb3JyZWN0bHlcbiAgY29uc3QgW2ZpbHRlciwgc2V0RmlsdGVyXSA9IFJlYWN0LnVzZVN0YXRlKCcnKVxuICBjb25zdCBbdW5maWx0ZXJlZEl0ZW1BcnJheSwgc2V0VW5maWx0ZXJlZEl0ZW1BcnJheV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBPYmplY3Qua2V5cyhpdGVtcylcbiAgKVxuICBjb25zdCBbZmlsdGVyZWRJdGVtQXJyYXksIHNldEZpbHRlcmVkSXRlbUFycmF5XSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIE9iamVjdC5rZXlzKGl0ZW1zKVxuICApXG4gIGNvbnN0IFtpc0ZpbHRlcmluZywgc2V0SXNGaWx0ZXJpbmddID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IGRlYm91bmNlZEZpbHRlclVwZGF0ZSA9IFJlYWN0LnVzZVJlZihnZW5lcmF0ZURlYm91bmNlZEZpbHRlclVwZGF0ZSgpKVxuICBjb25zdCBudW1iZXJDaGVja2VkID0gZ2V0QW1vdW50Q2hlY2tlZChpdGVtcylcbiAgY29uc3QgdG90YWwgPSBPYmplY3Qua2V5cyhpdGVtcykubGVuZ3RoXG4gIGNvbnN0IHRvdGFsQ2hlY2thYmxlID0gcmVxdWlyZWRBdHRyaWJ1dGVzXG4gICAgPyB0b3RhbCAtIHJlcXVpcmVkQXR0cmlidXRlcy5sZW5ndGhcbiAgICA6IHRvdGFsXG4gIGNvbnN0IGlzSW5kZXRlcm1pbmF0ZSA9XG4gICAgbnVtYmVyQ2hlY2tlZCAhPT0gdG90YWxDaGVja2FibGUgJiYgbnVtYmVyQ2hlY2tlZCAhPT0gMFxuICBjb25zdCBpc0NvbXBsZXRlbHlTZWxlY3RlZCA9XG4gICAgbnVtYmVyQ2hlY2tlZCA9PT0gdG90YWxDaGVja2FibGUgJiYgdG90YWxDaGVja2FibGUgIT09IDBcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRVbmZpbHRlcmVkSXRlbUFycmF5KE9iamVjdC5rZXlzKGl0ZW1zKSlcbiAgfSwgW09iamVjdC5rZXlzKGl0ZW1zKS50b1N0cmluZygpXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRJc0ZpbHRlcmluZyh0cnVlKVxuICAgIGRlYm91bmNlZEZpbHRlclVwZGF0ZS5jdXJyZW50KHtcbiAgICAgIGl0ZW1zLFxuICAgICAgZmlsdGVyLFxuICAgICAgc2V0SXRlbUFycmF5OiBzZXRGaWx0ZXJlZEl0ZW1BcnJheSxcbiAgICB9KVxuICB9LCBbT2JqZWN0LmtleXMoaXRlbXMpLnRvU3RyaW5nKCksIGZpbHRlcl0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgc2V0SXNGaWx0ZXJpbmcoZmFsc2UpXG4gIH0sIFtmaWx0ZXJlZEl0ZW1BcnJheV0pXG4gIC8vIG1lbW8gdGhpcywgb3RoZXIgd2lzZSB0aGUgY3JlYXRpb24gb2YgdGhlIG5ldyBvYmplY3QgZWFjaCB0aW1lIGlzIHNlZW4gYXMgYSBcImNoYW5nZVwiXG4gIGNvbnN0IG1lbW9Qcm92aWRlclZhbHVlID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIHsgaXRlbXMsIHNldEl0ZW1zOiB1cGRhdGVJdGVtcywgZmlsdGVyZWRJdGVtQXJyYXkgfVxuICB9LCBbaXRlbXMsIHVwZGF0ZUl0ZW1zXSlcbiAgcmV0dXJuIChcbiAgICA8Q3VzdG9tTGlzdENvbnRleHQuUHJvdmlkZXIgdmFsdWU9e21lbW9Qcm92aWRlclZhbHVlfT5cbiAgICAgIDxQYXBlclxuICAgICAgICBkYXRhLWlkPXtgJHsodGl0bGUgYXMgYW55KS50b0xvd2VyQ2FzZSgpfS1jb250YWluZXJgfVxuICAgICAgICBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFwZXJ9XG4gICAgICA+XG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgY2xhc3NOYW1lPVwicC0yIHRleHQteGwgZm9udC1ub3JtYWwgcmVsYXRpdmVcIlxuICAgICAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgID5cbiAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMCB0b3AtMCBtbC0yIG10LW1pblwiPlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBkYXRhLWlkPXtgJHsodGl0bGUgYXMgYW55KS50b0xvd2VyQ2FzZSgpfS1zZWxlY3QtYWxsLWNoZWNrYm94YH1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e09iamVjdC5rZXlzKGl0ZW1zKS5sZW5ndGggPT09IDB9XG4gICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZVRvZ2dsZUFsbChpdGVtcyl9XG4gICAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlbHlTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8Q2hlY2tCb3hJY29uIC8+XG4gICAgICAgICAgICAgICAgICAgICAge251bWJlckNoZWNrZWR9eycgJ31cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc0luZGV0ZXJtaW5hdGUpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPEluZGV0ZXJtaW5hdGVDaGVja0JveEljb24gLz5cbiAgICAgICAgICAgICAgICAgICAgICB7bnVtYmVyQ2hlY2tlZH17JyAnfVxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIDxDaGVja0JveE91dGxpbmVCbGFua0ljb24gLz5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKCl9XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJtLWF1dG8gXCI+XG4gICAgICAgICAgICB7dGl0bGV9ICh7dG90YWx9L3t0b3RhbFBvc3NpYmxlfSlcbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgICAgPERhcmtEaXZpZGVyIGNsYXNzTmFtZT1cInctZnVsbCBoLW1pblwiIC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0yXCI+XG4gICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgZGF0YS1pZD1cImZpbHRlci1pbnB1dFwiXG4gICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICAgIGxhYmVsPVwiRmlsdGVyIGJ5IGtleXdvcmRcIlxuICAgICAgICAgICAgZnVsbFdpZHRoPXt0cnVlfVxuICAgICAgICAgICAgdmFsdWU9e2ZpbHRlcn1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICBzZXRGaWx0ZXIoZS50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICB9fVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8RGFya0RpdmlkZXIgY2xhc3NOYW1lPVwidy1mdWxsIGgtbWluXCIgLz5cbiAgICAgICAge21vZGUgPT09ICdsb2FkaW5nJyA/IChcbiAgICAgICAgICA8Q2lyY3VsYXJQcm9ncmVzcyAvPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxMaXN0XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWNvbW1vbiBoLWNvbW1vbiBvdmVyZmxvdy1oaWRkZW4gcmVsYXRpdmVcIlxuICAgICAgICAgICAgZGVuc2VcbiAgICAgICAgICAgIGNvbXBvbmVudD1cImRpdlwiXG4gICAgICAgICAgICByb2xlPVwibGlzdFwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAge2lzRmlsdGVyaW5nID8gKFxuICAgICAgICAgICAgICA8TGluZWFyUHJvZ3Jlc3NcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0xIGFic29sdXRlIGxlZnQtMCB0b3AtMFwiXG4gICAgICAgICAgICAgICAgdmFyaWFudD1cImluZGV0ZXJtaW5hdGVcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICB7aXNEbkQgPyAoXG4gICAgICAgICAgICAgIDxNZW1vIGRlcGVuZGVuY2llcz17W2ZpbHRlcmVkSXRlbUFycmF5XX0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGZsZXgtbm93cmFwIGgtZnVsbCB3LWZ1bGwgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIml0YWxpYyBweC00IHRleHQteHMgZm9udC1ub3JtYWxcIj5cbiAgICAgICAgICAgICAgICAgICAgQ2xpY2sgYW5kIGRyYWcgYXR0cmlidXRlcyB0byByZW9yZGVyLlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGxcIj5cbiAgICAgICAgICAgICAgICAgICAgPERyYWdEcm9wQ29udGV4dFxuICAgICAgICAgICAgICAgICAgICAgIG9uRHJhZ0VuZD17KHJlc3VsdDogRHJvcFJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9QdXQgdGhlc2UgTk8tT1BzIHVwIGZyb250IGZvciBwZXJmb3JtYW5jZSByZWFzb25zOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8xLiBJZiB0aGUgaXRlbSBpcyBkcm9wcGVkIG91dHNpZGUgdGhlIGxpc3QsIGRvIG5vdGhpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vMi4gSWYgdGhlIGl0ZW0gaXMgbW92ZWQgaW50byB0aGUgc2FtZSBwbGFjZSwgZG8gbm90aGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHQuZGVzdGluYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnNvdXJjZS5pbmRleCA9PT0gcmVzdWx0LmRlc3RpbmF0aW9uLmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29tcGxpY2F0ZWQgYnkgdGhlIGZhY3QgdGhhdCB3ZSBmaWx0ZXIsIHNvIHdlIG5lZWQgdG8gZmluZCB0aGUgb3JpZ2luYWwgYW5kIGRlc3QgaW5kZXggb3Vyc2VsdmVzIDooXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0LnJlYXNvbiA9PT0gJ0RST1AnICYmIHJlc3VsdC5kZXN0aW5hdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaGlmdGVkT3JpZ2luYWxJbmRleCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5maWx0ZXJlZEl0ZW1BcnJheS5pbmRleE9mKHJlc3VsdC5kcmFnZ2FibGVJZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hpZnRlZERlc3RJbmRleCA9IHVuZmlsdGVyZWRJdGVtQXJyYXkuaW5kZXhPZihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEl0ZW1BcnJheVtyZXN1bHQuZGVzdGluYXRpb24uaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvbmVkTGlzdCA9IHVuZmlsdGVyZWRJdGVtQXJyYXkuc2xpY2UoMClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmVkTGlzdC5zcGxpY2Uoc2hpZnRlZE9yaWdpbmFsSW5kZXgsIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lZExpc3Quc3BsaWNlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNoaWZ0ZWREZXN0SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCwgLy8gaW5zZXJ0IFdJVEhPVVQgcmVtb3ZpbmcgYW55dGhpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQuZHJhZ2dhYmxlSWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdMaXN0ID0gY2xvbmVkTGlzdC5yZWR1Y2UoKGJsb2IsIGF0dHIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBibG9iW2F0dHJdID0gaXRlbXNSZWYuY3VycmVudFthdHRyXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBibG9iXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sIHt9IGFzIENoZWNrZWRUeXBlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVJdGVtcyhuZXdMaXN0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJVcGRhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRJdGVtQXJyYXk6IHNldEZpbHRlcmVkSXRlbUFycmF5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zOiBuZXdMaXN0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9KSAvLyBpbiB0aGlzIGNhc2UsIHdlIGVhZ2VybHkgc2V0IGluIG9yZGVyIHRvIGF2b2lkIGZsaWNrZXJpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGlsZHJlbi1oLWZ1bGwgY2hpbGRyZW4tdy1mdWxsIGgtZnVsbCB3LWZ1bGwgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RHJvcHBhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRyb3BwYWJsZUlkPVwidGVzdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1vZGU9XCJ2aXJ0dWFsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyQ2xvbmU9eyhwcm92aWRlZCwgX3NuYXBzaG90LCBydWJyaWMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Li4uKHByb3ZpZGVkLmRyYWdnYWJsZVByb3BzIGFzIGFueSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsuLi4ocHJvdmlkZWQuZHJhZ0hhbmRsZVByb3BzIGFzIGFueSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17cHJvdmlkZWQuaW5uZXJSZWYgYXMgYW55fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8SXRlbVJvd1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtmaWx0ZXJlZEl0ZW1BcnJheVtydWJyaWMuc291cmNlLmluZGV4XX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZD17cmVxdWlyZWRBdHRyaWJ1dGVzPy5pbmNsdWRlcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcmVkSXRlbUFycmF5W3J1YnJpYy5zb3VyY2UuaW5kZXhdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydE92ZXI9e3N0YXJ0T3Zlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0PXtsYXp5UmVzdWx0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcj17ZmlsdGVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7KHByb3ZpZGVkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBdXRvVmFyaWFibGVTaXplTGlzdDxzdHJpbmcsIEhUTUxEaXZFbGVtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcz17ZmlsdGVyZWRJdGVtQXJyYXl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRTaXplPXszOS40Mn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlZE1lYXN1cmluZz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3ZlcnNjYW5Db3VudD17MTB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyUmVmPXtwcm92aWRlZC5pbm5lclJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSXRlbT17KHsgaXRlbVJlZiwgaXRlbSwgbWVhc3VyZSwgaW5kZXggfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHJlZj17aXRlbVJlZn0gY2xhc3NOYW1lPVwicmVsYXRpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPERyYWdnYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnYWJsZUlkPXtpdGVtfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4PXtpbmRleH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2l0ZW19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNEcmFnRGlzYWJsZWQ9eyFpc0RuRH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlSW50ZXJhY3RpdmVFbGVtZW50QmxvY2tpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsocHJvdmlkZWQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3Byb3ZpZGVkLmlubmVyUmVmIGFzIGFueX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Li4uKHByb3ZpZGVkLmRyYWdnYWJsZVByb3BzIGFzIGFueSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgey4uLihwcm92aWRlZC5kcmFnSGFuZGxlUHJvcHMgYXMgYW55KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxJdGVtUm93XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17aXRlbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkPXtyZXF1aXJlZEF0dHJpYnV0ZXM/LmluY2x1ZGVzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnRPdmVyPXtzdGFydE92ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0PXtsYXp5UmVzdWx0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmlsdGVyPXtmaWx0ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZWFzdXJlPXttZWFzdXJlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRHJhZ2dhYmxlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFbXB0eT17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2PjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0Ryb3BwYWJsZT5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9EcmFnRHJvcENvbnRleHQ+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9NZW1vPlxuICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICA8QXV0b1ZhcmlhYmxlU2l6ZUxpc3Q8c3RyaW5nLCBIVE1MRGl2RWxlbWVudD5cbiAgICAgICAgICAgICAgICAgIGl0ZW1zPXtmaWx0ZXJlZEl0ZW1BcnJheX1cbiAgICAgICAgICAgICAgICAgIGRlZmF1bHRTaXplPXszOS40Mn1cbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZWRNZWFzdXJpbmc9e3RydWV9XG4gICAgICAgICAgICAgICAgICBvdmVyc2NhbkNvdW50PXsxMH1cbiAgICAgICAgICAgICAgICAgIEl0ZW09eyh7IGl0ZW1SZWYsIGl0ZW0sIG1lYXN1cmUgfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgcmVmPXtpdGVtUmVmfSBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEl0ZW1Sb3dcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2l0ZW19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkPXtyZXF1aXJlZEF0dHJpYnV0ZXM/LmluY2x1ZGVzKGl0ZW0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdGFydE92ZXI9e3N0YXJ0T3Zlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17bGF6eVJlc3VsdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZT17bWVhc3VyZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICBFbXB0eT17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGRpdj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvTGlzdD5cbiAgICAgICAgKX1cbiAgICAgIDwvUGFwZXI+XG4gICAgPC9DdXN0b21MaXN0Q29udGV4dC5Qcm92aWRlcj5cbiAgKVxufVxuZXhwb3J0IGNvbnN0IHVzZUN1c3RvbVJlYWRPbmx5Q2hlY2sgPSAoKSA9PiB7XG4gIGNvbnN0IENvbmZpZ3VyYXRpb24gPSB1c2VDb25maWd1cmF0aW9uKClcbiAgY29uc3QgW2N1c3RvbUVkaXRhYmxlQXR0cmlidXRlcywgc2V0Q3VzdG9tRWRpdGFibGVBdHRyaWJ1dGVzXSA9XG4gICAgUmVhY3QudXNlU3RhdGUoW10gYXMgc3RyaW5nW10pXG4gIGNvbnN0IGlzTW91bnRlZCA9IFJlYWN0LnVzZVJlZjxib29sZWFuPih0cnVlKVxuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSBSZWFjdC51c2VTdGF0ZSh0cnVlKVxuICBjb25zdCBpbml0aWFsaXplQ3VzdG9tRWRpdGFibGVBdHRyaWJ1dGVzID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGF0dHJzID0gYXdhaXQgZXh0ZW5zaW9uLmN1c3RvbUVkaXRhYmxlQXR0cmlidXRlcygpXG4gICAgaWYgKGlzTW91bnRlZC5jdXJyZW50KSB7XG4gICAgICBpZiAoYXR0cnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZXRDdXN0b21FZGl0YWJsZUF0dHJpYnV0ZXMoYXR0cnMpXG4gICAgICB9XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxuICAgIH1cbiAgfVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGluaXRpYWxpemVDdXN0b21FZGl0YWJsZUF0dHJpYnV0ZXMoKVxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBpc01vdW50ZWQuY3VycmVudCA9IGZhbHNlXG4gICAgfVxuICB9LCBbXSlcbiAgcmV0dXJuIHtcbiAgICBsb2FkaW5nLFxuICAgIGlzTm90V3JpdGFibGU6ICh7XG4gICAgICBhdHRyaWJ1dGUsXG4gICAgICBsYXp5UmVzdWx0LFxuICAgIH06IHtcbiAgICAgIGF0dHJpYnV0ZTogc3RyaW5nXG4gICAgICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbiAgICB9KSA9PiB7XG4gICAgICBjb25zdCBwZXJtID0gZXh0ZW5zaW9uLmN1c3RvbUNhbldyaXRlUGVybWlzc2lvbih7XG4gICAgICAgIGF0dHJpYnV0ZSxcbiAgICAgICAgbGF6eVJlc3VsdCxcbiAgICAgICAgdXNlcixcbiAgICAgICAgZWRpdGFibGVBdHRyaWJ1dGVzOiBjdXN0b21FZGl0YWJsZUF0dHJpYnV0ZXMsXG4gICAgICB9KVxuICAgICAgaWYgKHBlcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gIXBlcm1cbiAgICAgIH1cbiAgICAgIGNvbnN0IGRldGVybWluYXRpb24gPVxuICAgICAgICBsYXp5UmVzdWx0LmlzUmVtb3RlKCkgfHxcbiAgICAgICAgIVR5cGVkVXNlckluc3RhbmNlLmNhbldyaXRlKGxhenlSZXN1bHQpIHx8XG4gICAgICAgIENvbmZpZ3VyYXRpb24uaXNSZWFkT25seShhdHRyaWJ1dGUpXG4gICAgICByZXR1cm4gZGV0ZXJtaW5hdGlvblxuICAgIH0sXG4gIH1cbn1cbmNvbnN0IGNvbnZlcnRBdHRyTGlzdFRvTWFwID0gKGF0dHJzOiBzdHJpbmdbXSkgPT4ge1xuICByZXR1cm4gYXR0cnMucmVkdWNlKFxuICAgIChibG9iLCBhdHRyKSA9PiB7XG4gICAgICBibG9iW2F0dHJdID0gZmFsc2VcbiAgICAgIHJldHVybiBibG9iXG4gICAgfSxcbiAgICB7fSBhcyB7XG4gICAgICBba2V5OiBzdHJpbmddOiBib29sZWFuXG4gICAgfVxuICApXG59XG50eXBlIENoZWNrZWRUeXBlID0ge1xuICBba2V5OiBzdHJpbmddOiBib29sZWFuXG59XG50eXBlIFNldENoZWNrZWRUeXBlID0gUmVhY3QuRGlzcGF0Y2g8UmVhY3QuU2V0U3RhdGVBY3Rpb248Q2hlY2tlZFR5cGU+PlxuY29uc3QgVHJhbnNmZXJMaXN0ID0gKHtcbiAgc3RhcnRpbmdMZWZ0LFxuICByZXF1aXJlZEF0dHJpYnV0ZXMsXG4gIHN0YXJ0aW5nUmlnaHQsXG4gIHN0YXJ0aW5nSGlkZUVtcHR5LFxuICBsYXp5UmVzdWx0LFxuICBvblNhdmUsXG59OiB7XG4gIHN0YXJ0aW5nTGVmdDogc3RyaW5nW11cbiAgcmVxdWlyZWRBdHRyaWJ1dGVzPzogc3RyaW5nW11cbiAgc3RhcnRpbmdSaWdodDogc3RyaW5nW11cbiAgc3RhcnRpbmdIaWRlRW1wdHk/OiBib29sZWFuXG4gIGxhenlSZXN1bHQ/OiBMYXp5UXVlcnlSZXN1bHRcbiAgb25TYXZlOiAoYXJnOiBzdHJpbmdbXSwgaGlkZUVtcHR5OiBib29sZWFuIHwgdW5kZWZpbmVkKSA9PiB2b2lkXG59KSA9PiB7XG4gIGNvbnN0IGRpYWxvZ0NvbnRleHQgPSB1c2VEaWFsb2coKVxuICBjb25zdCBbbW9kZSwgc2V0TW9kZV0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICAnbG9hZGluZycgYXMgJ25vcm1hbCcgfCAnc2F2aW5nJyB8ICdsb2FkaW5nJ1xuICApXG4gIGNvbnN0IFtsZWZ0LCBzZXRMZWZ0XSA9IFJlYWN0LnVzZVN0YXRlKGNvbnZlcnRBdHRyTGlzdFRvTWFwKHN0YXJ0aW5nTGVmdCkpXG4gIGNvbnN0IFtyaWdodCwgc2V0UmlnaHRdID0gUmVhY3QudXNlU3RhdGUoY29udmVydEF0dHJMaXN0VG9NYXAoc3RhcnRpbmdSaWdodCkpXG4gIGNvbnN0IFtoaWRlRW1wdHksIHNldEhpZGVFbXB0eV0gPSBSZWFjdC51c2VTdGF0ZShzdGFydGluZ0hpZGVFbXB0eSlcbiAgY29uc3QgeyBsb2FkaW5nIH0gPSB1c2VDdXN0b21SZWFkT25seUNoZWNrKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWxvYWRpbmcpIHtcbiAgICAgIHNldE1vZGUoJ25vcm1hbCcpXG4gICAgfVxuICB9LCBbbG9hZGluZ10pXG4gIGNvbnN0IGdlbmVyYXRlSGFuZGxlVG9nZ2xlQWxsID0gKHtcbiAgICBzZXRTdGF0ZSxcbiAgICBzdGF0ZSxcbiAgICBkaXNhYmxlZEF0dHJpYnV0ZXMgPSBbXSxcbiAgfToge1xuICAgIHNldFN0YXRlOiBTZXRDaGVja2VkVHlwZVxuICAgIHN0YXRlOiBDaGVja2VkVHlwZVxuICAgIGRpc2FibGVkQXR0cmlidXRlcz86IHN0cmluZ1tdXG4gIH0pID0+IHtcbiAgICByZXR1cm4gKCkgPT4gKCkgPT4ge1xuICAgICAgY29uc3QgYWxsVmFsdWVzID0gT2JqZWN0LnZhbHVlcyhzdGF0ZSlcbiAgICAgIGNvbnN0IHRvdGFsQ2hlY2thYmxlID0gYWxsVmFsdWVzLmxlbmd0aCAtIGRpc2FibGVkQXR0cmlidXRlcy5sZW5ndGhcbiAgICAgIGNvbnN0IG51bWJlckNoZWNrZWQgPSBhbGxWYWx1ZXMuZmlsdGVyKChjaGVja2VkKSA9PiBjaGVja2VkKS5sZW5ndGhcbiAgICAgIGNvbnN0IGFsbFNlbGVjdGVkID1cbiAgICAgICAgbnVtYmVyQ2hlY2tlZCA9PT0gdG90YWxDaGVja2FibGUgJiYgdG90YWxDaGVja2FibGUgIT09IDBcblxuICAgICAgaWYgKCFhbGxTZWxlY3RlZCkge1xuICAgICAgICBzZXRTdGF0ZShcbiAgICAgICAgICBPYmplY3Qua2V5cyhzdGF0ZSkucmVkdWNlKChibG9iLCBhdHRyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGlzYWJsZWRBdHRyaWJ1dGVzLmluY2x1ZGVzKGF0dHIpKSBibG9iW2F0dHJdID0gZmFsc2VcbiAgICAgICAgICAgIGVsc2UgYmxvYlthdHRyXSA9IHRydWVcbiAgICAgICAgICAgIHJldHVybiBibG9iXG4gICAgICAgICAgfSwge30gYXMgQ2hlY2tlZFR5cGUpXG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFN0YXRlKFxuICAgICAgICAgIE9iamVjdC5rZXlzKHN0YXRlKS5yZWR1Y2UoKGJsb2IsIGF0dHIpID0+IHtcbiAgICAgICAgICAgIGJsb2JbYXR0cl0gPSBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgICAgICB9LCB7fSBhcyBDaGVja2VkVHlwZSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBjb25zdCBtb3ZlUmlnaHQgPSAoKSA9PiB7XG4gICAgY29uc3QgY2hlY2tlZExlZnQgPSBPYmplY3QuZW50cmllcyhsZWZ0KVxuICAgICAgLmZpbHRlcigoYSkgPT4gYVsxXSlcbiAgICAgIC5yZWR1Y2UoKGJsb2IsIGEpID0+IHtcbiAgICAgICAgYmxvYlthWzBdXSA9IGZhbHNlXG4gICAgICAgIHJldHVybiBibG9iXG4gICAgICB9LCB7fSBhcyBDaGVja2VkVHlwZSlcbiAgICBjb25zdCBub25DaGVja2VkTGVmdCA9IE9iamVjdC5lbnRyaWVzKGxlZnQpXG4gICAgICAuZmlsdGVyKChhKSA9PiAhYVsxXSlcbiAgICAgIC5yZWR1Y2UoKGJsb2IsIGEpID0+IHtcbiAgICAgICAgYmxvYlthWzBdXSA9IGFbMV1cbiAgICAgICAgcmV0dXJuIGJsb2JcbiAgICAgIH0sIHt9IGFzIENoZWNrZWRUeXBlKVxuICAgIHNldFJpZ2h0KHtcbiAgICAgIC4uLnJpZ2h0LFxuICAgICAgLi4uY2hlY2tlZExlZnQsXG4gICAgfSlcbiAgICBzZXRMZWZ0KG5vbkNoZWNrZWRMZWZ0KVxuICB9XG4gIGNvbnN0IG1vdmVMZWZ0ID0gKCkgPT4ge1xuICAgIGNvbnN0IGNoZWNrZWRSaWdodCA9IE9iamVjdC5lbnRyaWVzKHJpZ2h0KVxuICAgICAgLmZpbHRlcigoYSkgPT4gYVsxXSlcbiAgICAgIC5yZWR1Y2UoKGJsb2IsIGEpID0+IHtcbiAgICAgICAgYmxvYlthWzBdXSA9IGZhbHNlXG4gICAgICAgIHJldHVybiBibG9iXG4gICAgICB9LCB7fSBhcyBDaGVja2VkVHlwZSlcbiAgICBjb25zdCBub25DaGVja2VkUmlnaHQgPSBPYmplY3QuZW50cmllcyhyaWdodClcbiAgICAgIC5maWx0ZXIoKGEpID0+ICFhWzFdKVxuICAgICAgLnJlZHVjZSgoYmxvYiwgYSkgPT4ge1xuICAgICAgICBibG9iW2FbMF1dID0gYVsxXVxuICAgICAgICByZXR1cm4gYmxvYlxuICAgICAgfSwge30gYXMgQ2hlY2tlZFR5cGUpXG4gICAgc2V0TGVmdCh7XG4gICAgICAuLi5sZWZ0LFxuICAgICAgLi4uY2hlY2tlZFJpZ2h0LFxuICAgIH0pXG4gICAgc2V0UmlnaHQobm9uQ2hlY2tlZFJpZ2h0KVxuICB9XG4gIGNvbnN0IGhhc0xlZnRDaGVja2VkID0gT2JqZWN0LmVudHJpZXMobGVmdCkuZmluZCgoYSkgPT4gYVsxXSkgIT09IHVuZGVmaW5lZFxuICBjb25zdCBoYXNSaWdodENoZWNrZWQgPSBPYmplY3QuZW50cmllcyhyaWdodCkuZmluZCgoYSkgPT4gYVsxXSkgIT09IHVuZGVmaW5lZFxuICBjb25zdCBzdGFydE92ZXIgPSAoKSA9PiB7XG4gICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7XG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgY2hpbGRyZW46IChcbiAgICAgICAgPFRyYW5zZmVyTGlzdFxuICAgICAgICAgIHN0YXJ0aW5nTGVmdD17T2JqZWN0LmtleXMobGVmdCl9XG4gICAgICAgICAgc3RhcnRpbmdSaWdodD17T2JqZWN0LmtleXMocmlnaHQpfVxuICAgICAgICAgIHN0YXJ0aW5nSGlkZUVtcHR5PXtoaWRlRW1wdHl9XG4gICAgICAgICAgbGF6eVJlc3VsdD17bGF6eVJlc3VsdH1cbiAgICAgICAgICBvblNhdmU9e29uU2F2ZX1cbiAgICAgICAgLz5cbiAgICAgICksXG4gICAgfSlcbiAgfVxuICBjb25zdCB0b3RhbFBvc3NpYmxlID0gc3RhcnRpbmdMZWZ0Lmxlbmd0aCArIHN0YXJ0aW5nUmlnaHQubGVuZ3RoXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC0yeGwgdGV4dC1jZW50ZXIgcHgtMiBwYi0yIHB0LTQgZm9udC1ub3JtYWwgcmVsYXRpdmVcIj5cbiAgICAgICAgTWFuYWdlIEF0dHJpYnV0ZXNcbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGRhdGEtaWQ9XCJjbG9zZS1idXR0b25cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIHJpZ2h0LTAgdG9wLTAgbXItMSBtdC0xXCJcbiAgICAgICAgICB2YXJpYW50PVwidGV4dFwiXG4gICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBudWxsLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPENsb3NlSWNvbiAvPlxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICAgPERhcmtEaXZpZGVyIGNsYXNzTmFtZT1cInctZnVsbCBoLW1pblwiIC8+XG4gICAgICA8RGlhbG9nQ29udGVudD5cbiAgICAgICAgPEdyaWRcbiAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICBzcGFjaW5nPXsyfVxuICAgICAgICAgIGp1c3RpZnlDb250ZW50PVwiY2VudGVyXCJcbiAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJtLWF1dG9cIlxuICAgICAgICA+XG4gICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgIDxDdXN0b21MaXN0XG4gICAgICAgICAgICAgIHRpdGxlPVwiQWN0aXZlXCJcbiAgICAgICAgICAgICAgaXRlbXM9e2xlZnR9XG4gICAgICAgICAgICAgIHJlcXVpcmVkQXR0cmlidXRlcz17cmVxdWlyZWRBdHRyaWJ1dGVzfVxuICAgICAgICAgICAgICBsYXp5UmVzdWx0PXtsYXp5UmVzdWx0fVxuICAgICAgICAgICAgICB1cGRhdGVJdGVtcz17c2V0TGVmdH1cbiAgICAgICAgICAgICAgaXNEbkQ9e3RydWV9XG4gICAgICAgICAgICAgIHN0YXJ0T3Zlcj17c3RhcnRPdmVyfVxuICAgICAgICAgICAgICBoYW5kbGVUb2dnbGVBbGw9e2dlbmVyYXRlSGFuZGxlVG9nZ2xlQWxsKHtcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZTogc2V0TGVmdCxcbiAgICAgICAgICAgICAgICBzdGF0ZTogbGVmdCxcbiAgICAgICAgICAgICAgICBkaXNhYmxlZEF0dHJpYnV0ZXM6IHJlcXVpcmVkQXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIHRvdGFsUG9zc2libGU9e3RvdGFsUG9zc2libGV9XG4gICAgICAgICAgICAgIG1vZGU9e21vZGV9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICA8R3JpZCBpdGVtPlxuICAgICAgICAgICAgPEdyaWQgY29udGFpbmVyIGRpcmVjdGlvbj1cImNvbHVtblwiIGFsaWduSXRlbXM9XCJjZW50ZXJcIj5cbiAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgIGRhdGEtaWQ9XCJtb3ZlLXJpZ2h0LWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtLTFcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e21vdmVSaWdodH1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWhhc0xlZnRDaGVja2VkfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJtb3ZlIHNlbGVjdGVkIHJpZ2h0XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxSaWdodEFycm93SWNvbiAvPlxuICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgIGRhdGEtaWQ9XCJtb3ZlLWxlZnQtYnV0dG9uXCJcbiAgICAgICAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm0tMVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17bW92ZUxlZnR9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFoYXNSaWdodENoZWNrZWR9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIm1vdmUgc2VsZWN0ZWQgbGVmdFwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8TGVmdEFycm93SWNvbiAvPlxuICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgIDxDdXN0b21MaXN0XG4gICAgICAgICAgICAgIHRpdGxlPVwiSGlkZGVuXCJcbiAgICAgICAgICAgICAgaXRlbXM9e3JpZ2h0fVxuICAgICAgICAgICAgICBsYXp5UmVzdWx0PXtsYXp5UmVzdWx0fVxuICAgICAgICAgICAgICB1cGRhdGVJdGVtcz17c2V0UmlnaHR9XG4gICAgICAgICAgICAgIGlzRG5EPXtmYWxzZX1cbiAgICAgICAgICAgICAgc3RhcnRPdmVyPXtzdGFydE92ZXJ9XG4gICAgICAgICAgICAgIGhhbmRsZVRvZ2dsZUFsbD17Z2VuZXJhdGVIYW5kbGVUb2dnbGVBbGwoe1xuICAgICAgICAgICAgICAgIHNldFN0YXRlOiBzZXRSaWdodCxcbiAgICAgICAgICAgICAgICBzdGF0ZTogcmlnaHQsXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICBtb2RlPXttb2RlfVxuICAgICAgICAgICAgICB0b3RhbFBvc3NpYmxlPXt0b3RhbFBvc3NpYmxlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgIDwvRGlhbG9nQ29udGVudD5cbiAgICAgIDxEYXJrRGl2aWRlciBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1taW5cIiAvPlxuICAgICAgPERpYWxvZ0FjdGlvbnM+XG4gICAgICAgIHtoaWRlRW1wdHkgIT09IHVuZGVmaW5lZCAmJiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxGb3JtQ29udHJvbExhYmVsXG4gICAgICAgICAgICAgIGNvbnRyb2w9e1xuICAgICAgICAgICAgICAgIDxTd2l0Y2hcbiAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2hpZGVFbXB0eX1cbiAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0SGlkZUVtcHR5KGUudGFyZ2V0LmNoZWNrZWQpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGFiZWw9XCJIaWRlIGVtcHR5IGF0dHJpYnV0ZXMgaW4gaW5zcGVjdG9yXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgcGFkZGluZ0xlZnQ6ICcxMHB4JyB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZmxleDogJzEgMCAwJyB9fSAvPlxuICAgICAgICAgIDwvPlxuICAgICAgICApfVxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgZGF0YS1pZD1cImRpYWxvZy1zYXZlLWJ1dHRvblwiXG4gICAgICAgICAgZGlzYWJsZWQ9e21vZGUgPT09ICdzYXZpbmcnfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgICAgICAgICBvcGVuOiBmYWxzZSxcbiAgICAgICAgICAgICAgY2hpbGRyZW46IG51bGwsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH19XG4gICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgIGNvbG9yPVwic2Vjb25kYXJ5XCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJtci0yXCJcbiAgICAgICAgPlxuICAgICAgICAgIENhbmNlbFxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT1cIm1sLTJcIlxuICAgICAgICAgIGRpc2FibGVkPXttb2RlID09PSAnc2F2aW5nJ31cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBzZXRNb2RlKCdzYXZpbmcnKVxuICAgICAgICAgICAgb25TYXZlKE9iamVjdC5rZXlzKGxlZnQpLCBoaWRlRW1wdHkpXG4gICAgICAgICAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgICAgICAgICAgb3BlbjogZmFsc2UsXG4gICAgICAgICAgICAgIGNoaWxkcmVuOiBudWxsLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9fVxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgID5cbiAgICAgICAgICBTYXZlXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgICAge21vZGUgPT09ICdzYXZpbmcnID8gKFxuICAgICAgICA8TGluZWFyUHJvZ3Jlc3NcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwcHgnLFxuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICBsZWZ0OiAnMHB4JyxcbiAgICAgICAgICAgIGJvdHRvbTogJzAlJyxcbiAgICAgICAgICB9fVxuICAgICAgICAgIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvPlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShUcmFuc2Zlckxpc3QpXG4iXX0=