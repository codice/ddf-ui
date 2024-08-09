import { __assign, __read, __spreadArray } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import user from '../../singletons/user-instance';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import { useDialog } from '../../dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import useSnack from '../../hooks/useSnack';
import LinearProgress from '@mui/material/LinearProgress';
import $ from 'jquery';
import PublishIcon from '@mui/icons-material/Publish';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import { useBackbone } from '../../selection-checkbox/useBackbone.hook';
import { useCustomReadOnlyCheck } from './transfer-list';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import { Elevations } from '../../theme/theme';
import { DarkDivider } from '../../dark-divider/dark-divider';
import { displayHighlightedAttrInFull } from './highlightUtil';
import DateTimePicker from '../../fields/date-time-picker';
import { useRerenderOnBackboneSync } from '../../../js/model/LazyQueryResult/hooks';
import useCoordinateFormat from './useCoordinateFormat';
import ExtensionPoints from '../../../extension-points';
import LocationInputReact from '../../location-new/location-new.view';
import { TypedUserInstance } from '../../singletons/TypedUser';
import { StartupDataStore } from '../../../js/model/Startup/startup';
import { useMetacardDefinitions } from '../../../js/model/Startup/metacard-definitions.hooks';
import Common from '../../../js/Common';
import SummaryManageAttributes from '../../../react-component/summary-manage-attributes/summary-manage-attributes';
import moment from 'moment-timezone';
var ThumbnailInput = function (_a) {
    var value = _a.value, _b = _a.onChange, onChange = _b === void 0 ? function () { } : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c;
    var fileRef = React.useRef(null);
    var imgRef = React.useRef(null);
    return (React.createElement(Grid, { container: true, direction: "row", alignItems: "stretch", alignContent: "stretch", wrap: "nowrap" },
        React.createElement(Grid, { item: true, style: { overflow: 'hidden' } },
            React.createElement("input", { type: "file", ref: fileRef, style: { display: 'none' }, onChange: function (e) {
                    if (imgRef.current === null) {
                        return;
                    }
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        try {
                            // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                            onChange(event.target.result);
                        }
                        catch (err) {
                            console.error('there is something wrong with file type');
                        }
                    };
                    reader.onerror = function () {
                        console.error('error');
                    };
                    // @ts-expect-error ts-migrate(2531) FIXME: Object is possibly 'null'.
                    reader.readAsDataURL(e.target.files[0]);
                } }),
            React.createElement("img", { src: Common.getImageSrc(value), ref: imgRef, style: { maxWidth: '100%', maxHeight: '50vh' } })),
        React.createElement(Grid, { item: true },
            React.createElement(Button, { style: { height: '100%' }, variant: "outlined", disabled: disabled, onClick: function () {
                    if (fileRef.current !== null) {
                        fileRef.current.click();
                    }
                } },
                React.createElement(PublishIcon, null)))));
};
var Mode;
(function (Mode) {
    Mode["Normal"] = "normal";
    Mode["Saving"] = "saving";
    Mode["BadInput"] = "bad-input";
})(Mode || (Mode = {}));
var handleMetacardUpdate = function (_a) {
    var lazyResult = _a.lazyResult, attributes = _a.attributes, onSuccess = _a.onSuccess, onFailure = _a.onFailure;
    var payload = [
        {
            ids: [lazyResult.plain.metacard.properties.id],
            attributes: attributes,
        },
    ];
    setTimeout(function () {
        $.ajax({
            url: "./internal/metacards?storeId=".concat(lazyResult.plain.metacard.properties['source-id']),
            type: 'PATCH',
            data: JSON.stringify(payload),
            contentType: 'application/json',
        }).then(function (response) {
            lazyResult.refreshFromEditResponse(response);
            onSuccess();
        }, function () { return onFailure(); });
    }, 1000);
};
export var Editor = function (_a) {
    var attr = _a.attr, lazyResult = _a.lazyResult, _b = _a.onCancel, onCancel = _b === void 0 ? function () { } : _b, _c = _a.onSave, onSave = _c === void 0 ? function () { } : _c, goBack = _a.goBack;
    var _d = __read(React.useState(Mode.Normal), 2), mode = _d[0], setMode = _d[1];
    var _f = __read(React.useState(Array.isArray(lazyResult.plain.metacard.properties[attr])
        ? lazyResult.plain.metacard.properties[attr].slice(0)
        : [lazyResult.plain.metacard.properties[attr]]), 2), values = _f[0], setValues = _f[1];
    var _g = __read(React.useState(-1), 2), dirtyIndex = _g[0], setDirtyIndex = _g[1];
    var _h = useMetacardDefinitions(), getAlias = _h.getAlias, isMulti = _h.isMulti, getType = _h.getType, getEnum = _h.getEnum;
    var label = getAlias(attr);
    var isMultiValued = isMulti(attr);
    var attrType = getType(attr);
    var enumForAttr = getEnum(attr);
    var addSnack = useSnack();
    return (React.createElement(React.Fragment, null,
        goBack && (React.createElement(Button, { variant: "text", color: "primary", startIcon: React.createElement(KeyboardBackspaceIcon, null), onClick: goBack }, "Cancel and return to manage")),
        React.createElement("div", { className: "text-2xl text-center px-2 pb-2 pt-4 font-normal truncate" },
            "Editing ",
            label,
            " of \"",
            lazyResult.plain.metacard.properties.title,
            "\""),
        React.createElement(Divider, null),
        React.createElement(DialogContent, { style: { minHeight: '30em', minWidth: '60vh' } },
            values.map(function (val, index) {
                return (React.createElement(Grid, { container: true, direction: "row", className: "my-2" },
                    index !== 0 ? React.createElement(Divider, { style: { margin: '5px 0px' } }) : null,
                    React.createElement(Grid, { item: true, md: 11 }, (function () {
                        if (enumForAttr.length > 0) {
                            return (React.createElement(Autocomplete, { disabled: mode === 'saving', value: val, onChange: function (_e, newValue) {
                                    values[index] = newValue;
                                    setValues(__spreadArray([], __read(values), false));
                                }, fullWidth: true, disableClearable: true, size: "small", options: enumForAttr, renderInput: function (params) { return (React.createElement(TextField, __assign({}, params, { variant: "outlined" }))); } }));
                        }
                        switch (attrType) {
                            case 'DATE':
                                return (React.createElement(DateTimePicker, { value: val, onChange: function (value) {
                                        values[index] = value;
                                        setValues(__spreadArray([], __read(values), false));
                                    }, TextFieldProps: {
                                        disabled: mode !== Mode.Normal,
                                        label: label,
                                        variant: 'outlined',
                                    }, BPDateProps: {
                                        disabled: mode !== Mode.Normal,
                                    } }));
                            case 'BINARY':
                                return (React.createElement(ThumbnailInput, { disabled: mode !== Mode.Normal, value: val, onChange: function (update) {
                                        values[index] = update;
                                        setValues(__spreadArray([], __read(values), false));
                                    } }));
                            case 'BOOLEAN':
                                return (React.createElement(Checkbox, { disabled: mode !== Mode.Normal, checked: val, onChange: function (e) {
                                        values[index] = e.target.checked;
                                        setValues(__spreadArray([], __read(values), false));
                                    }, color: "primary" }));
                            case 'LONG':
                            case 'DOUBLE':
                            case 'FLOAT':
                            case 'INTEGER':
                            case 'SHORT':
                                return (React.createElement(TextField, { disabled: mode !== Mode.Normal, value: val, onChange: function (e) {
                                        values[index] = e.target.value;
                                        setValues(__spreadArray([], __read(values), false));
                                    }, type: "number", fullWidth: true }));
                            case 'GEOMETRY':
                                return (React.createElement(LocationInputReact, { onChange: function (location) {
                                        if (location === null || location === 'INVALID') {
                                            setMode(Mode.BadInput);
                                        }
                                        else {
                                            setMode(Mode.Normal);
                                        }
                                        values[index] = location;
                                        setValues(__spreadArray([], __read(values), false));
                                    }, isStateDirty: dirtyIndex === index, resetIsStateDirty: function () { return setDirtyIndex(-1); }, value: val }));
                            default:
                                return (React.createElement(TextField, { disabled: mode !== Mode.Normal, value: val, onChange: function (e) {
                                        values[index] = e.target.value;
                                        setValues(__spreadArray([], __read(values), false));
                                    }, style: { whiteSpace: 'pre-line', flexGrow: 50 }, fullWidth: true, multiline: true, maxRows: 1000 }));
                        }
                    })()),
                    isMultiValued ? (React.createElement(Grid, { item: true, md: 1 },
                        React.createElement(Button, { disabled: mode === Mode.Saving, onClick: function () {
                                values.splice(index, 1);
                                setDirtyIndex(index);
                                setValues(__spreadArray([], __read(values), false));
                            } },
                            React.createElement(DeleteIcon, null)))) : null));
            }),
            isMultiValued && (React.createElement(Button, { disabled: mode === Mode.Saving, variant: "text", color: "primary", onClick: function () {
                    var defaultValue = '';
                    switch (attrType) {
                        case 'DATE':
                            defaultValue = new Date().toISOString();
                            break;
                    }
                    setValues(__spreadArray(__spreadArray([], __read(values), false), [defaultValue], false));
                } },
                React.createElement(Box, { color: "text.primary" },
                    React.createElement(AddIcon, null)),
                "Add New Value"))),
        React.createElement(Divider, null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { disabled: mode === Mode.Saving, variant: "text", onClick: function () {
                    onCancel();
                } }, "Cancel"),
            React.createElement(Button, { disabled: mode !== Mode.Normal, variant: "contained", color: "primary", onClick: function () {
                    setMode(Mode.Saving);
                    var transformedValues;
                    if (isMultiValued && values && values.length > 1) {
                        transformedValues = values.filter(function (val) { return val != null && val !== ''; });
                    }
                    else {
                        transformedValues = values;
                    }
                    try {
                        switch (attrType) {
                            case 'BINARY':
                                transformedValues = transformedValues.map(function (subval) { return subval.split(',')[1]; });
                                break;
                            case 'DATE':
                                transformedValues = transformedValues.map(function (subval) {
                                    return moment(subval).toISOString();
                                });
                                break;
                            case 'GEOMETRY':
                                transformedValues = values.filter(function (val) { return val != null && val !== ''; });
                                break;
                        }
                    }
                    catch (err) {
                        console.error(err);
                    }
                    var attributes = [{ attribute: attr, values: transformedValues }];
                    var onSuccess = function () {
                        return setTimeout(function () {
                            addSnack('Successfully updated.');
                            onSave();
                        }, 1000);
                    };
                    var onFailure = function () {
                        return setTimeout(function () {
                            addSnack('Failed to update.', { status: 'error' });
                            onSave();
                        }, 1000);
                    };
                    if (ExtensionPoints.handleMetacardUpdate) {
                        ExtensionPoints.handleMetacardUpdate({
                            lazyResult: lazyResult,
                            attributesToUpdate: attributes,
                        }).then(onSuccess, onFailure);
                    }
                    else {
                        handleMetacardUpdate({
                            lazyResult: lazyResult,
                            attributes: attributes,
                            onSuccess: onSuccess,
                            onFailure: onFailure,
                        });
                    }
                } }, "Save")),
        mode === Mode.Saving ? (React.createElement(LinearProgress, { style: {
                width: '100%',
                height: '10px',
                position: 'absolute',
                left: '0px',
                bottom: '0%',
            }, variant: "indeterminate" })) : null));
};
var AttributeComponent = function (_a) {
    var lazyResult = _a.lazyResult, attr = _a.attr, hideEmpty = _a.hideEmpty, _b = _a.summaryShown, summaryShown = _b === void 0 ? [] : _b, _c = _a.decimalPrecision, decimalPrecision = _c === void 0 ? undefined : _c, _d = _a.filter, filter = _d === void 0 ? '' : _d, forceRender = _a.forceRender;
    var value = lazyResult.plain.metacard.properties[attr];
    if (hideEmpty) {
        if (value === undefined || value === null) {
            return null;
        }
        else if (typeof value === 'string' && !value.trim()) {
            return null;
        }
        else if (Array.isArray(value) && value.length === 0) {
            return null;
        }
    }
    if (value === undefined || value === null) {
        value = [];
    }
    if (value.constructor !== Array) {
        value = [value];
    }
    var _f = useMetacardDefinitions(), getAlias = _f.getAlias, getType = _f.getType;
    var label = getAlias(attr);
    var isNotWritable = useCustomReadOnlyCheck().isNotWritable;
    var dialogContext = useDialog();
    var convertToFormat = useCoordinateFormat();
    var convertToPrecision = function (value) {
        return value && decimalPrecision
            ? Number(value).toFixed(decimalPrecision)
            : value;
    };
    var isUrl = function (value) {
        if (value && typeof value === 'string') {
            var protocol = value.toLowerCase().split('/')[0];
            return protocol && (protocol === 'http:' || protocol === 'https:');
        }
        return false;
    };
    var isFiltered = filter !== '' ? !label.toLowerCase().includes(filter.toLowerCase()) : false;
    var onCancel = function () {
        dialogContext.setProps({
            open: false,
            children: null,
        });
    };
    var onSave = function () {
        dialogContext.setProps({
            open: false,
            children: null,
        });
    };
    var CustomAttributeEditor = ExtensionPoints.attributeEditor(lazyResult, attr);
    var MemoItem = React.useMemo(function () {
        return (React.createElement(Grid, { container: true, direction: "row", wrap: 'nowrap', className: "group relative" },
            isNotWritable({ attribute: attr, lazyResult: lazyResult }) ? null : (React.createElement("div", { className: "p-1 hidden group-hover:block absolute right-0 top-0" },
                React.createElement(Button, { onClick: function () {
                        dialogContext.setProps({
                            open: true,
                            disableEnforceFocus: true,
                            children: CustomAttributeEditor ? (React.createElement(CustomAttributeEditor, { result: lazyResult, attribute: attr, onCancel: onCancel, onSave: onSave })) : (React.createElement(Editor, { attr: attr, lazyResult: lazyResult, onCancel: onCancel, onSave: onSave })),
                        });
                    } },
                    React.createElement(EditIcon, null)))),
            React.createElement(Grid, { item: true, xs: 4, style: {
                    wordBreak: 'break-word',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    padding: '10px',
                }, className: "relative" },
                React.createElement(Typography, null, label),
                React.createElement(Divider, { orientation: "vertical", className: "absolute right-0 top-0 w-min h-full" })),
            React.createElement(Grid, { item: true, md: 8, style: {
                    wordBreak: 'break-word',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    padding: '10px',
                } },
                React.createElement(Grid, { container: true, direction: "row" },
                    React.createElement(Grid, { "data-id": "".concat(attr, "-value"), item: true }, value.map(function (val, index) {
                        return (React.createElement(React.Fragment, { key: index },
                            index !== 0 ? (React.createElement(Divider, { style: { margin: '5px 0px' } })) : null,
                            React.createElement("div", null, (function () {
                                if (attr === 'ext.audio-snippet') {
                                    var mimetype = lazyResult.plain.metacard.properties['ext.audio-snippet-mimetype'];
                                    var src = "data:".concat(mimetype, ";base64,").concat(val);
                                    return React.createElement("audio", { controls: true, src: src });
                                }
                                switch (getType(attr)) {
                                    case 'DATE':
                                        return (React.createElement(Typography, { title: TypedUserInstance.getMomentDate(val) }, user.getUserReadableDateTime(val)));
                                    case 'BINARY':
                                        return (React.createElement("img", { src: Common.getImageSrc(val), style: {
                                                maxWidth: '100%',
                                                maxHeight: '50vh',
                                            } }));
                                    case 'BOOLEAN':
                                        return (React.createElement(Typography, null, val ? 'true' : 'false'));
                                    case 'GEOMETRY':
                                        return (React.createElement(Typography, null, convertToFormat(val)));
                                    case 'LONG':
                                    case 'DOUBLE':
                                    case 'FLOAT':
                                        return (React.createElement(Typography, null, convertToPrecision(val)));
                                    default:
                                        if (lazyResult.highlights[attr]) {
                                            if (attr === 'title') {
                                                //Special case, title highlights don't get truncated
                                                return (React.createElement(Typography, null,
                                                    React.createElement("span", { dangerouslySetInnerHTML: {
                                                            __html: lazyResult.highlights[attr][0]
                                                                .highlight,
                                                        } })));
                                            }
                                            {
                                                return isUrl(val) ? (React.createElement(Typography, null,
                                                    React.createElement("span", { className: "highlight" },
                                                        React.createElement("a", { href: val, target: "_blank" }, val)))) : (displayHighlightedAttrInFull(lazyResult.highlights[attr], val, index));
                                            }
                                        }
                                        else if (isUrl(val)) {
                                            return (React.createElement(Typography, null,
                                                React.createElement("a", { href: val, target: "_blank" }, val)));
                                        }
                                        else {
                                            return React.createElement(Typography, null, val);
                                        }
                                }
                            })())));
                    }))))));
    }, [summaryShown, forceRender, isNotWritable]);
    return (React.createElement("div", { style: { display: isFiltered ? 'none' : 'block' } }, MemoItem));
};
var persistantFilter = '';
/* Hidden attributes are simply the opposite of active */
/* They do not currently exist on the metacard OR are not shown in the summary */
var getHiddenAttributes = function (selection, activeAttributes) {
    return Object.values(StartupDataStore.MetacardDefinitions.getMetacardDefinition(selection.plain.metacardType))
        .filter(function (val) {
        if (activeAttributes.includes(val.id)) {
            return false;
        }
        return true;
    })
        .filter(function (val) {
        return !StartupDataStore.MetacardDefinitions.isHiddenAttribute(val.id);
    });
};
var globalExpanded = false; // globally track if users want this since they may be clicking between results
var Summary = function (_a) {
    var selection = _a.result;
    var theme = useTheme();
    var _b = __read(React.useState(false), 2), forceRender = _b[0], setForceRender = _b[1];
    var _c = __read(React.useState(globalExpanded), 2), expanded = _c[0], setExpanded = _c[1];
    /* Special case for when all the attributes are displayed */
    var _d = __read(React.useState(false), 2), fullyExpanded = _d[0], setFullyExpanded = _d[1];
    var _f = __read(React.useState(persistantFilter), 2), filter = _f[0], setFilter = _f[1];
    var _g = __read(React.useState(TypedUserInstance.getDecimalPrecision()), 2), decimalPrecision = _g[0], setDecimalPrecision = _g[1];
    var _h = __read(React.useState(TypedUserInstance.getResultsAttributesSummaryShown()), 2), summaryShown = _h[0], setSummaryShown = _h[1];
    useRerenderOnBackboneSync({ lazyResult: selection });
    var listenTo = useBackbone().listenTo;
    var _j = useMetacardDefinitions(), isHiddenAttribute = _j.isHiddenAttribute, getMetacardDefinition = _j.getMetacardDefinition;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:inspector-summaryShown change:dateTimeFormat change:timeZone change:inspector-hideEmpty', function () {
            setSummaryShown(__spreadArray([], __read(TypedUserInstance.getResultsAttributesSummaryShown()), false));
            setForceRender(true);
        });
        listenTo(user.get('user').get('preferences'), 'change:decimalPrecision', function () {
            setDecimalPrecision(TypedUserInstance.getDecimalPrecision());
        });
    }, []);
    React.useEffect(function () {
        if (selection) {
            if (getHiddenAttributes(selection, summaryShown).length === 0) {
                setFullyExpanded(true);
            }
            else {
                setFullyExpanded(false);
            }
        }
    }, [summaryShown]);
    var everythingElse = React.useMemo(function () {
        return selection && expanded
            ? Object.keys(selection.plain.metacard.properties)
                .filter(function (attr) {
                return !isHiddenAttribute(attr);
            })
                .filter(function (attr) {
                return !summaryShown.includes(attr);
            })
            : [];
    }, [expanded, summaryShown, isHiddenAttribute]);
    var blankEverythingElse = React.useMemo(function () {
        return selection
            ? Object.values(getMetacardDefinition(selection.plain.metacardType))
                .filter(function (val) {
                if (summaryShown.includes(val.id)) {
                    return false;
                }
                if (everythingElse.includes(val.id)) {
                    return false;
                }
                return true;
            })
                .filter(function (val) {
                return !isHiddenAttribute(val.id);
            })
            : [];
    }, [expanded, summaryShown, isHiddenAttribute]);
    React.useEffect(function () {
        globalExpanded = expanded;
    }, [expanded]);
    if (!selection) {
        return React.createElement("div", null, "No result selected");
    }
    var hideEmpty = user
        .get('user')
        .get('preferences')
        .get('inspector-hideEmpty');
    return (React.createElement(Grid, { container: true, direction: "column", wrap: "nowrap", className: "overflow-hidden w-full h-full" },
        React.createElement(Grid, { item: true, className: "shrink-0" },
            React.createElement(Grid, { container: true, direction: "row", alignItems: "center", wrap: "nowrap", justifyContent: "space-between", className: "p-2" },
                React.createElement(Grid, { item: true },
                    React.createElement(SummaryManageAttributes, null)),
                React.createElement(Grid, { item: true },
                    React.createElement(TextField, { "data-id": "summary-filter-input", size: "small", variant: "outlined", label: "Filter", value: filter, inputProps: {
                            style: filter !== ''
                                ? {
                                    borderBottom: "1px solid ".concat(theme.palette.warning.main),
                                }
                                : {},
                        }, onChange: function (e) {
                            persistantFilter = e.target.value;
                            setFilter(e.target.value);
                        } })))),
        React.createElement(DarkDivider, { className: "w-full h-min" }),
        React.createElement(Grid, { item: true, className: "shrink-1 overflow-auto p-2" },
            React.createElement(Paper, { elevation: Elevations.paper },
                summaryShown.map(function (attr, index) {
                    return (React.createElement("div", { className: "relative", key: attr },
                        React.createElement(AttributeComponent, { lazyResult: selection, attr: attr, hideEmpty: hideEmpty, summaryShown: summaryShown, decimalPrecision: decimalPrecision, filter: filter, forceRender: forceRender }),
                        index !== 0 ? (React.createElement(Divider, { orientation: "horizontal", className: "absolute top-0 w-full h-min" })) : null));
                }),
                expanded ? (React.createElement(React.Fragment, null,
                    everythingElse.map(function (attr) {
                        return (React.createElement("div", { key: attr, className: "relative" },
                            React.createElement(AttributeComponent, { lazyResult: selection, attr: attr, hideEmpty: hideEmpty, summaryShown: summaryShown, decimalPrecision: decimalPrecision, filter: filter, forceRender: forceRender }),
                            React.createElement(Divider, { orientation: "horizontal", className: "absolute top-0 w-full h-min" })));
                    }),
                    blankEverythingElse.map(function (attr) {
                        return (React.createElement("div", { key: attr.id, className: "relative" },
                            React.createElement(AttributeComponent, { lazyResult: selection, attr: attr.id, hideEmpty: hideEmpty, summaryShown: summaryShown, decimalPrecision: decimalPrecision, filter: filter, forceRender: forceRender }),
                            React.createElement(Divider, { orientation: "horizontal", className: "absolute top-0 w-full h-min" })));
                    }))) : (React.createElement(React.Fragment, null)))),
        !fullyExpanded && (React.createElement(React.Fragment, null,
            React.createElement(DarkDivider, { className: "w-full h-min" }),
            React.createElement(Grid, { item: true, className: "shrink-0 p-2" },
                React.createElement(Button, { "data-id": "see-all-collapse-button", onClick: function () {
                        setExpanded(!expanded);
                    }, size: "small", color: "primary" }, expanded ? 'Collapse' : 'See all'))))));
};
export default hot(module)(Summary);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdGFicy9tZXRhY2FyZC9zdW1tYXJ5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pELE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sUUFBUSxNQUFNLHdCQUF3QixDQUFBO0FBQzdDLE9BQU8sT0FBTyxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLDRCQUE0QixDQUFBO0FBQ25ELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDeEMsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxRQUFRLE1BQU0sc0JBQXNCLENBQUE7QUFDM0MsT0FBTyxjQUFjLE1BQU0sOEJBQThCLENBQUE7QUFDekQsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sV0FBVyxNQUFNLDZCQUE2QixDQUFBO0FBQ3JELE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUUvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkNBQTJDLENBQUE7QUFDdkUsT0FB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LENBQ0g7UUFFTixDQUFDLGFBQWEsSUFBSSxDQUNqQjtZQUNFLG9CQUFDLFdBQVcsSUFBQyxTQUFTLEVBQUMsY0FBYyxHQUFHO1lBQ3hDLG9CQUFDLElBQUksSUFBQyxJQUFJLFFBQUMsU0FBUyxFQUFDLGNBQWM7Z0JBQ2pDLG9CQUFDLE1BQU0sZUFDRyx5QkFBeUIsRUFDakMsT0FBTyxFQUFFO3dCQUNQLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFBO29CQUN4QixDQUFDLEVBQ0QsSUFBSSxFQUFDLE9BQU8sRUFDWixLQUFLLEVBQUMsU0FBUyxJQUVkLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQzNCLENBQ0osQ0FDTixDQUNKLENBQ0ksQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgVHlwb2dyYXBoeSBmcm9tICdAbXVpL21hdGVyaWFsL1R5cG9ncmFwaHknXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBDaGVja2JveCBmcm9tICdAbXVpL21hdGVyaWFsL0NoZWNrYm94J1xuaW1wb3J0IERpdmlkZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9EaXZpZGVyJ1xuaW1wb3J0IERlbGV0ZUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9EZWxldGUnXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IHsgdXNlRGlhbG9nIH0gZnJvbSAnLi4vLi4vZGlhbG9nJ1xuaW1wb3J0IERpYWxvZ0FjdGlvbnMgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dBY3Rpb25zJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnQgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dDb250ZW50J1xuaW1wb3J0IHVzZVNuYWNrIGZyb20gJy4uLy4uL2hvb2tzL3VzZVNuYWNrJ1xuaW1wb3J0IExpbmVhclByb2dyZXNzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTGluZWFyUHJvZ3Jlc3MnXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgUHVibGlzaEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9QdWJsaXNoJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyB1c2VUaGVtZSB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IHVzZUJhY2tib25lIH0gZnJvbSAnLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyB1c2VDdXN0b21SZWFkT25seUNoZWNrIH0gZnJvbSAnLi90cmFuc2Zlci1saXN0J1xuaW1wb3J0IEtleWJvYXJkQmFja3NwYWNlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0tleWJvYXJkQmFja3NwYWNlJ1xuaW1wb3J0IEFkZEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9BZGQnXG5pbXBvcnQgRWRpdEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9FZGl0J1xuaW1wb3J0IEJveCBmcm9tICdAbXVpL21hdGVyaWFsL0JveCdcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi8uLi90aGVtZS90aGVtZSdcbmltcG9ydCB7IERhcmtEaXZpZGVyIH0gZnJvbSAnLi4vLi4vZGFyay1kaXZpZGVyL2RhcmstZGl2aWRlcidcbmltcG9ydCB7IGRpc3BsYXlIaWdobGlnaHRlZEF0dHJJbkZ1bGwgfSBmcm9tICcuL2hpZ2hsaWdodFV0aWwnXG5pbXBvcnQgRGF0ZVRpbWVQaWNrZXIgZnJvbSAnLi4vLi4vZmllbGRzL2RhdGUtdGltZS1waWNrZXInXG5pbXBvcnQgeyB1c2VSZXJlbmRlck9uQmFja2JvbmVTeW5jIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L2hvb2tzJ1xuaW1wb3J0IHVzZUNvb3JkaW5hdGVGb3JtYXQgZnJvbSAnLi91c2VDb29yZGluYXRlRm9ybWF0J1xuaW1wb3J0IHsgTWV0YWNhcmRBdHRyaWJ1dGUgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9UeXBlcydcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCBMb2NhdGlvbklucHV0UmVhY3QgZnJvbSAnLi4vLi4vbG9jYXRpb24tbmV3L2xvY2F0aW9uLW5ldy52aWV3J1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi9zaW5nbGV0b25zL1R5cGVkVXNlcidcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyB1c2VNZXRhY2FyZERlZmluaXRpb25zIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9tZXRhY2FyZC1kZWZpbml0aW9ucy5ob29rcydcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vLi4vLi4vanMvQ29tbW9uJ1xuaW1wb3J0IFN1bW1hcnlNYW5hZ2VBdHRyaWJ1dGVzIGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9zdW1tYXJ5LW1hbmFnZS1hdHRyaWJ1dGVzL3N1bW1hcnktbWFuYWdlLWF0dHJpYnV0ZXMnXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudC10aW1lem9uZSdcblxudHlwZSBQcm9wcyA9IHtcbiAgcmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbn1cbmNvbnN0IFRodW1ibmFpbElucHV0ID0gKHtcbiAgdmFsdWUsXG4gIG9uQ2hhbmdlID0gKCkgPT4ge30sXG4gIGRpc2FibGVkID0gZmFsc2UsXG59OiB7XG4gIHZhbHVlOiBzdHJpbmdcbiAgZGlzYWJsZWQ6IGJvb2xlYW5cbiAgb25DaGFuZ2U/OiAodmFsOiBzdHJpbmcpID0+IHZvaWRcbn0pID0+IHtcbiAgY29uc3QgZmlsZVJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MSW5wdXRFbGVtZW50PihudWxsKVxuICBjb25zdCBpbWdSZWYgPSBSZWFjdC51c2VSZWY8SFRNTEltYWdlRWxlbWVudD4obnVsbClcbiAgcmV0dXJuIChcbiAgICA8R3JpZFxuICAgICAgY29udGFpbmVyXG4gICAgICBkaXJlY3Rpb249XCJyb3dcIlxuICAgICAgYWxpZ25JdGVtcz1cInN0cmV0Y2hcIlxuICAgICAgYWxpZ25Db250ZW50PVwic3RyZXRjaFwiXG4gICAgICB3cmFwPVwibm93cmFwXCJcbiAgICA+XG4gICAgICA8R3JpZCBpdGVtIHN0eWxlPXt7IG92ZXJmbG93OiAnaGlkZGVuJyB9fT5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgIHJlZj17ZmlsZVJlZn1cbiAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX1cbiAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgIGlmIChpbWdSZWYuY3VycmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoZXZlbnQudGFyZ2V0LnJlc3VsdClcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigndGhlcmUgaXMgc29tZXRoaW5nIHdyb25nIHdpdGggZmlsZSB0eXBlJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2Vycm9yJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGUudGFyZ2V0LmZpbGVzWzBdKVxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICAgIDxpbWdcbiAgICAgICAgICBzcmM9e0NvbW1vbi5nZXRJbWFnZVNyYyh2YWx1ZSl9XG4gICAgICAgICAgcmVmPXtpbWdSZWZ9XG4gICAgICAgICAgc3R5bGU9e3sgbWF4V2lkdGg6ICcxMDAlJywgbWF4SGVpZ2h0OiAnNTB2aCcgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBzdHlsZT17eyBoZWlnaHQ6ICcxMDAlJyB9fVxuICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGlmIChmaWxlUmVmLmN1cnJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgZmlsZVJlZi5jdXJyZW50LmNsaWNrKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFB1Ymxpc2hJY29uIC8+XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9HcmlkPlxuICAgIDwvR3JpZD5cbiAgKVxufVxuZW51bSBNb2RlIHtcbiAgTm9ybWFsID0gJ25vcm1hbCcsXG4gIFNhdmluZyA9ICdzYXZpbmcnLFxuICBCYWRJbnB1dCA9ICdiYWQtaW5wdXQnLFxufVxuY29uc3QgaGFuZGxlTWV0YWNhcmRVcGRhdGUgPSAoe1xuICBsYXp5UmVzdWx0LFxuICBhdHRyaWJ1dGVzLFxuICBvblN1Y2Nlc3MsXG4gIG9uRmFpbHVyZSxcbn06IHtcbiAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gIGF0dHJpYnV0ZXM6IE1ldGFjYXJkQXR0cmlidXRlW11cbiAgb25TdWNjZXNzOiAoKSA9PiB2b2lkXG4gIG9uRmFpbHVyZTogKCkgPT4gdm9pZFxufSkgPT4ge1xuICBjb25zdCBwYXlsb2FkID0gW1xuICAgIHtcbiAgICAgIGlkczogW2xhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5pZF0sXG4gICAgICBhdHRyaWJ1dGVzLFxuICAgIH0sXG4gIF1cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogYC4vaW50ZXJuYWwvbWV0YWNhcmRzP3N0b3JlSWQ9JHtsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3NvdXJjZS1pZCddfWAsXG4gICAgICB0eXBlOiAnUEFUQ0gnLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pLnRoZW4oXG4gICAgICAocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICBsYXp5UmVzdWx0LnJlZnJlc2hGcm9tRWRpdFJlc3BvbnNlKHJlc3BvbnNlKVxuICAgICAgICBvblN1Y2Nlc3MoKVxuICAgICAgfSxcbiAgICAgICgpID0+IG9uRmFpbHVyZSgpXG4gICAgKVxuICB9LCAxMDAwKVxufVxuZXhwb3J0IGNvbnN0IEVkaXRvciA9ICh7XG4gIGF0dHIsXG4gIGxhenlSZXN1bHQsXG4gIG9uQ2FuY2VsID0gKCkgPT4ge30sXG4gIG9uU2F2ZSA9ICgpID0+IHt9LFxuICBnb0JhY2ssXG59OiB7XG4gIGF0dHI6IHN0cmluZ1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbiAgb25DYW5jZWw/OiAoKSA9PiB2b2lkXG4gIG9uU2F2ZT86ICgpID0+IHZvaWRcbiAgZ29CYWNrPzogKCkgPT4gdm9pZFxufSkgPT4ge1xuICBjb25zdCBbbW9kZSwgc2V0TW9kZV0gPSBSZWFjdC51c2VTdGF0ZShNb2RlLk5vcm1hbClcbiAgY29uc3QgW3ZhbHVlcywgc2V0VmFsdWVzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIEFycmF5LmlzQXJyYXkobGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW2F0dHJdKVxuICAgICAgPyBsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cl0uc2xpY2UoMClcbiAgICAgIDogW2xhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyXV1cbiAgKVxuICBjb25zdCBbZGlydHlJbmRleCwgc2V0RGlydHlJbmRleF0gPSBSZWFjdC51c2VTdGF0ZSgtMSlcbiAgY29uc3QgeyBnZXRBbGlhcywgaXNNdWx0aSwgZ2V0VHlwZSwgZ2V0RW51bSB9ID0gdXNlTWV0YWNhcmREZWZpbml0aW9ucygpXG4gIGNvbnN0IGxhYmVsID0gZ2V0QWxpYXMoYXR0cilcbiAgY29uc3QgaXNNdWx0aVZhbHVlZCA9IGlzTXVsdGkoYXR0cilcbiAgY29uc3QgYXR0clR5cGUgPSBnZXRUeXBlKGF0dHIpXG4gIGNvbnN0IGVudW1Gb3JBdHRyID0gZ2V0RW51bShhdHRyKVxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAge2dvQmFjayAmJiAoXG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICB2YXJpYW50PVwidGV4dFwiXG4gICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICBzdGFydEljb249ezxLZXlib2FyZEJhY2tzcGFjZUljb24gLz59XG4gICAgICAgICAgb25DbGljaz17Z29CYWNrfVxuICAgICAgICA+XG4gICAgICAgICAgQ2FuY2VsIGFuZCByZXR1cm4gdG8gbWFuYWdlXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgKX1cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC0yeGwgdGV4dC1jZW50ZXIgcHgtMiBwYi0yIHB0LTQgZm9udC1ub3JtYWwgdHJ1bmNhdGVcIj5cbiAgICAgICAgRWRpdGluZyB7bGFiZWx9IG9mIFwie2xhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy50aXRsZX1cIlxuICAgICAgPC9kaXY+XG4gICAgICA8RGl2aWRlciAvPlxuICAgICAgPERpYWxvZ0NvbnRlbnQgc3R5bGU9e3sgbWluSGVpZ2h0OiAnMzBlbScsIG1pbldpZHRoOiAnNjB2aCcgfX0+XG4gICAgICAgIHt2YWx1ZXMubWFwKCh2YWw6IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8R3JpZCBjb250YWluZXIgZGlyZWN0aW9uPVwicm93XCIgY2xhc3NOYW1lPVwibXktMlwiPlxuICAgICAgICAgICAgICB7aW5kZXggIT09IDAgPyA8RGl2aWRlciBzdHlsZT17eyBtYXJnaW46ICc1cHggMHB4JyB9fSAvPiA6IG51bGx9XG4gICAgICAgICAgICAgIDxHcmlkIGl0ZW0gbWQ9ezExfT5cbiAgICAgICAgICAgICAgICB7KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChlbnVtRm9yQXR0ci5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e21vZGUgPT09ICdzYXZpbmcnfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoX2U6IGFueSwgbmV3VmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gbmV3VmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXNdKVxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnM9e2VudW1Gb3JBdHRyfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZCB7Li4ucGFyYW1zfSB2YXJpYW50PVwib3V0bGluZWRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzd2l0Y2ggKGF0dHJUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RBVEUnOlxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8RGF0ZVRpbWVQaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgVGV4dEZpZWxkUHJvcHM9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogbW9kZSAhPT0gTW9kZS5Ob3JtYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ6ICdvdXRsaW5lZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIEJQRGF0ZVByb3BzPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IG1vZGUgIT09IE1vZGUuTm9ybWFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0JJTkFSWSc6XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxUaHVtYm5haWxJbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSAhPT0gTW9kZS5Ob3JtYWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodXBkYXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBjYXNlICdCT09MRUFOJzpcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPENoZWNrYm94XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlICE9PSBNb2RlLk5vcm1hbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gZS50YXJnZXQuY2hlY2tlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBjYXNlICdMT05HJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnRE9VQkxFJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnRkxPQVQnOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdJTlRFR0VSJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnU0hPUlQnOlxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlICE9PSBNb2RlLk5vcm1hbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IGUudGFyZ2V0LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXNdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8TG9jYXRpb25JbnB1dFJlYWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsobG9jYXRpb246IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbiA9PT0gbnVsbCB8fCBsb2NhdGlvbiA9PT0gJ0lOVkFMSUQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRNb2RlKE1vZGUuQmFkSW5wdXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE1vZGUoTW9kZS5Ob3JtYWwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSBsb2NhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdGF0ZURpcnR5PXtkaXJ0eUluZGV4ID09PSBpbmRleH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRJc1N0YXRlRGlydHk9eygpID0+IHNldERpcnR5SW5kZXgoLTEpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e21vZGUgIT09IE1vZGUuTm9ybWFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSBlLnRhcmdldC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgd2hpdGVTcGFjZTogJ3ByZS1saW5lJywgZmxleEdyb3c6IDUwIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aWxpbmU9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJvd3M9ezEwMDB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSgpfVxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgIHtpc011bHRpVmFsdWVkID8gKFxuICAgICAgICAgICAgICAgIDxHcmlkIGl0ZW0gbWQ9ezF9PlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSA9PT0gTW9kZS5TYXZpbmd9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICAgIHNldERpcnR5SW5kZXgoaW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXNdKVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8RGVsZXRlSWNvbiAvPlxuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgICB7aXNNdWx0aVZhbHVlZCAmJiAoXG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgZGlzYWJsZWQ9e21vZGUgPT09IE1vZGUuU2F2aW5nfVxuICAgICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgbGV0IGRlZmF1bHRWYWx1ZSA9ICcnXG4gICAgICAgICAgICAgIHN3aXRjaCAoYXR0clR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlcywgZGVmYXVsdFZhbHVlXSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPEJveCBjb2xvcj1cInRleHQucHJpbWFyeVwiPlxuICAgICAgICAgICAgICA8QWRkSWNvbiAvPlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICBBZGQgTmV3IFZhbHVlXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICl9XG4gICAgICA8L0RpYWxvZ0NvbnRlbnQ+XG4gICAgICA8RGl2aWRlciAvPlxuICAgICAgPERpYWxvZ0FjdGlvbnM+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBkaXNhYmxlZD17bW9kZSA9PT0gTW9kZS5TYXZpbmd9XG4gICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIG9uQ2FuY2VsKClcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgQ2FuY2VsXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgZGlzYWJsZWQ9e21vZGUgIT09IE1vZGUuTm9ybWFsfVxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgc2V0TW9kZShNb2RlLlNhdmluZylcbiAgICAgICAgICAgIGxldCB0cmFuc2Zvcm1lZFZhbHVlc1xuICAgICAgICAgICAgaWYgKGlzTXVsdGlWYWx1ZWQgJiYgdmFsdWVzICYmIHZhbHVlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgIHRyYW5zZm9ybWVkVmFsdWVzID0gdmFsdWVzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAodmFsOiBhbnkpID0+IHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJydcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtZWRWYWx1ZXMgPSB2YWx1ZXNcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgc3dpdGNoIChhdHRyVHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ0JJTkFSWSc6XG4gICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFZhbHVlcyA9IHRyYW5zZm9ybWVkVmFsdWVzLm1hcChcbiAgICAgICAgICAgICAgICAgICAgKHN1YnZhbDogYW55KSA9PiBzdWJ2YWwuc3BsaXQoJywnKVsxXVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkVmFsdWVzID0gdHJhbnNmb3JtZWRWYWx1ZXMubWFwKChzdWJ2YWw6IGFueSkgPT5cbiAgICAgICAgICAgICAgICAgICAgbW9tZW50KHN1YnZhbCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlICdHRU9NRVRSWSc6XG4gICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFZhbHVlcyA9IHZhbHVlcy5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgICh2YWw6IGFueSkgPT4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJ1xuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IFt7IGF0dHJpYnV0ZTogYXR0ciwgdmFsdWVzOiB0cmFuc2Zvcm1lZFZhbHVlcyB9XVxuICAgICAgICAgICAgY29uc3Qgb25TdWNjZXNzID0gKCkgPT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWRkU25hY2soJ1N1Y2Nlc3NmdWxseSB1cGRhdGVkLicpXG4gICAgICAgICAgICAgICAgb25TYXZlKClcbiAgICAgICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgICAgIGNvbnN0IG9uRmFpbHVyZSA9ICgpID0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFkZFNuYWNrKCdGYWlsZWQgdG8gdXBkYXRlLicsIHsgc3RhdHVzOiAnZXJyb3InIH0pXG4gICAgICAgICAgICAgICAgb25TYXZlKClcbiAgICAgICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgICAgIGlmIChFeHRlbnNpb25Qb2ludHMuaGFuZGxlTWV0YWNhcmRVcGRhdGUpIHtcbiAgICAgICAgICAgICAgRXh0ZW5zaW9uUG9pbnRzLmhhbmRsZU1ldGFjYXJkVXBkYXRlKHtcbiAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNUb1VwZGF0ZTogYXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgfSkudGhlbihvblN1Y2Nlc3MsIG9uRmFpbHVyZSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGhhbmRsZU1ldGFjYXJkVXBkYXRlKHtcbiAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgb25TdWNjZXNzLFxuICAgICAgICAgICAgICAgIG9uRmFpbHVyZSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgU2F2ZVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvRGlhbG9nQWN0aW9ucz5cbiAgICAgIHttb2RlID09PSBNb2RlLlNhdmluZyA/IChcbiAgICAgICAgPExpbmVhclByb2dyZXNzXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMHB4JyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgbGVmdDogJzBweCcsXG4gICAgICAgICAgICBib3R0b206ICcwJScsXG4gICAgICAgICAgfX1cbiAgICAgICAgICB2YXJpYW50PVwiaW5kZXRlcm1pbmF0ZVwiXG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8Lz5cbiAgKVxufVxuY29uc3QgQXR0cmlidXRlQ29tcG9uZW50ID0gKHtcbiAgbGF6eVJlc3VsdCxcbiAgYXR0cixcbiAgaGlkZUVtcHR5LFxuICBzdW1tYXJ5U2hvd24gPSBbXSxcbiAgZGVjaW1hbFByZWNpc2lvbiA9IHVuZGVmaW5lZCxcbiAgZmlsdGVyID0gJycsXG4gIGZvcmNlUmVuZGVyLFxufToge1xuICBhdHRyOiBzdHJpbmdcbiAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gIGhpZGVFbXB0eTogYm9vbGVhblxuICBzdW1tYXJ5U2hvd24/OiBzdHJpbmdbXVxuICBkZWNpbWFsUHJlY2lzaW9uOiBudW1iZXIgfCB1bmRlZmluZWRcbiAgZmlsdGVyPzogc3RyaW5nXG4gIGZvcmNlUmVuZGVyOiBib29sZWFuXG59KSA9PiB7XG4gIGxldCB2YWx1ZSA9IGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyXVxuICBpZiAoaGlkZUVtcHR5KSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICF2YWx1ZS50cmltKCkpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgdmFsdWUgPSBbXVxuICB9XG4gIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciAhPT0gQXJyYXkpIHtcbiAgICB2YWx1ZSA9IFt2YWx1ZV1cbiAgfVxuICBjb25zdCB7IGdldEFsaWFzLCBnZXRUeXBlIH0gPSB1c2VNZXRhY2FyZERlZmluaXRpb25zKClcbiAgbGV0IGxhYmVsID0gZ2V0QWxpYXMoYXR0cilcbiAgY29uc3QgeyBpc05vdFdyaXRhYmxlIH0gPSB1c2VDdXN0b21SZWFkT25seUNoZWNrKClcbiAgY29uc3QgZGlhbG9nQ29udGV4dCA9IHVzZURpYWxvZygpXG4gIGNvbnN0IGNvbnZlcnRUb0Zvcm1hdCA9IHVzZUNvb3JkaW5hdGVGb3JtYXQoKVxuICBjb25zdCBjb252ZXJ0VG9QcmVjaXNpb24gPSAodmFsdWU6IGFueSkgPT4ge1xuICAgIHJldHVybiB2YWx1ZSAmJiBkZWNpbWFsUHJlY2lzaW9uXG4gICAgICA/IE51bWJlcih2YWx1ZSkudG9GaXhlZChkZWNpbWFsUHJlY2lzaW9uKVxuICAgICAgOiB2YWx1ZVxuICB9XG4gIGNvbnN0IGlzVXJsID0gKHZhbHVlOiBhbnkpID0+IHtcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgcHJvdG9jb2wgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcvJylbMF1cbiAgICAgIHJldHVybiBwcm90b2NvbCAmJiAocHJvdG9jb2wgPT09ICdodHRwOicgfHwgcHJvdG9jb2wgPT09ICdodHRwczonKVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBjb25zdCBpc0ZpbHRlcmVkID1cbiAgICBmaWx0ZXIgIT09ICcnID8gIWxhYmVsLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVyLnRvTG93ZXJDYXNlKCkpIDogZmFsc2VcbiAgY29uc3Qgb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7XG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICAgIGNoaWxkcmVuOiBudWxsLFxuICAgIH0pXG4gIH1cbiAgY29uc3Qgb25TYXZlID0gKCkgPT4ge1xuICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICBjaGlsZHJlbjogbnVsbCxcbiAgICB9KVxuICB9XG4gIGNvbnN0IEN1c3RvbUF0dHJpYnV0ZUVkaXRvciA9IEV4dGVuc2lvblBvaW50cy5hdHRyaWJ1dGVFZGl0b3IoXG4gICAgbGF6eVJlc3VsdCxcbiAgICBhdHRyXG4gIClcbiAgY29uc3QgTWVtb0l0ZW0gPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgPEdyaWRcbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgIHdyYXA9eydub3dyYXAnfVxuICAgICAgICBjbGFzc05hbWU9XCJncm91cCByZWxhdGl2ZVwiXG4gICAgICA+XG4gICAgICAgIHtpc05vdFdyaXRhYmxlKHsgYXR0cmlidXRlOiBhdHRyLCBsYXp5UmVzdWx0IH0pID8gbnVsbCA6IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMSBoaWRkZW4gZ3JvdXAtaG92ZXI6YmxvY2sgYWJzb2x1dGUgcmlnaHQtMCB0b3AtMFwiPlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7XG4gICAgICAgICAgICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgZGlzYWJsZUVuZm9yY2VGb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBDdXN0b21BdHRyaWJ1dGVFZGl0b3IgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxDdXN0b21BdHRyaWJ1dGVFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ9e2xhenlSZXN1bHR9XG4gICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlPXthdHRyfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXtvbkNhbmNlbH1cbiAgICAgICAgICAgICAgICAgICAgICBvblNhdmU9e29uU2F2ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgIDxFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICBhdHRyPXthdHRyfVxuICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQ9e2xhenlSZXN1bHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e29uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZT17b25TYXZlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8RWRpdEljb24gLz5cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgaXRlbVxuICAgICAgICAgIHhzPXs0fVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3b3JkQnJlYWs6ICdicmVhay13b3JkJyxcbiAgICAgICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyxcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cInJlbGF0aXZlXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxUeXBvZ3JhcGh5PntsYWJlbH08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgPERpdmlkZXJcbiAgICAgICAgICAgIG9yaWVudGF0aW9uPVwidmVydGljYWxcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgcmlnaHQtMCB0b3AtMCB3LW1pbiBoLWZ1bGxcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgICAgPEdyaWRcbiAgICAgICAgICBpdGVtXG4gICAgICAgICAgbWQ9ezh9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdvcmRCcmVhazogJ2JyZWFrLXdvcmQnLFxuICAgICAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8R3JpZCBjb250YWluZXIgZGlyZWN0aW9uPVwicm93XCI+XG4gICAgICAgICAgICA8R3JpZCBkYXRhLWlkPXtgJHthdHRyfS12YWx1ZWB9IGl0ZW0+XG4gICAgICAgICAgICAgIHt2YWx1ZS5tYXAoKHZhbDogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2luZGV4fT5cbiAgICAgICAgICAgICAgICAgICAge2luZGV4ICE9PSAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxEaXZpZGVyIHN0eWxlPXt7IG1hcmdpbjogJzVweCAwcHgnIH19IC8+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHIgPT09ICdleHQuYXVkaW8tc25pcHBldCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWltZXR5cGUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdleHQuYXVkaW8tc25pcHBldC1taW1ldHlwZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNyYyA9IGBkYXRhOiR7bWltZXR5cGV9O2Jhc2U2NCwke3ZhbH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YXVkaW8gY29udHJvbHMgc3JjPXtzcmN9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGdldFR5cGUoYXR0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtUeXBlZFVzZXJJbnN0YW5jZS5nZXRNb21lbnREYXRlKHZhbCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLmdldFVzZXJSZWFkYWJsZURhdGVUaW1lKHZhbCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdCSU5BUlknOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17Q29tbW9uLmdldEltYWdlU3JjKHZhbCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6ICc1MHZoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdCT09MRUFOJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+e3ZhbCA/ICd0cnVlJyA6ICdmYWxzZSd9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeT57Y29udmVydFRvRm9ybWF0KHZhbCl9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnTE9ORyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RPVUJMRSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0ZMT0FUJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+e2NvbnZlcnRUb1ByZWNpc2lvbih2YWwpfTwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhenlSZXN1bHQuaGlnaGxpZ2h0c1thdHRyXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHIgPT09ICd0aXRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TcGVjaWFsIGNhc2UsIHRpdGxlIGhpZ2hsaWdodHMgZG9uJ3QgZ2V0IHRydW5jYXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfX2h0bWw6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LmhpZ2hsaWdodHNbYXR0cl1bMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhpZ2hsaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1VybCh2YWwpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaGlnaGxpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e3ZhbH0gdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5SGlnaGxpZ2h0ZWRBdHRySW5GdWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdC5oaWdobGlnaHRzW2F0dHJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzVXJsKHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e3ZhbH0gdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPFR5cG9ncmFwaHk+e3ZhbH08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH0pKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgPC9HcmlkPlxuICAgICAgPC9HcmlkPlxuICAgIClcbiAgfSwgW3N1bW1hcnlTaG93biwgZm9yY2VSZW5kZXIsIGlzTm90V3JpdGFibGVdKVxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogaXNGaWx0ZXJlZCA/ICdub25lJyA6ICdibG9jaycgfX0+e01lbW9JdGVtfTwvZGl2PlxuICApXG59XG5sZXQgcGVyc2lzdGFudEZpbHRlciA9ICcnXG4vKiBIaWRkZW4gYXR0cmlidXRlcyBhcmUgc2ltcGx5IHRoZSBvcHBvc2l0ZSBvZiBhY3RpdmUgKi9cbi8qIFRoZXkgZG8gbm90IGN1cnJlbnRseSBleGlzdCBvbiB0aGUgbWV0YWNhcmQgT1IgYXJlIG5vdCBzaG93biBpbiB0aGUgc3VtbWFyeSAqL1xuY29uc3QgZ2V0SGlkZGVuQXR0cmlidXRlcyA9IChcbiAgc2VsZWN0aW9uOiBMYXp5UXVlcnlSZXN1bHQsXG4gIGFjdGl2ZUF0dHJpYnV0ZXM6IHN0cmluZ1tdXG4pID0+IHtcbiAgcmV0dXJuIE9iamVjdC52YWx1ZXMoXG4gICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldE1ldGFjYXJkRGVmaW5pdGlvbihcbiAgICAgIHNlbGVjdGlvbi5wbGFpbi5tZXRhY2FyZFR5cGVcbiAgICApXG4gIClcbiAgICAuZmlsdGVyKCh2YWwpID0+IHtcbiAgICAgIGlmIChhY3RpdmVBdHRyaWJ1dGVzLmluY2x1ZGVzKHZhbC5pZCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG4gICAgLmZpbHRlcigodmFsKSA9PiB7XG4gICAgICByZXR1cm4gIVN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5pc0hpZGRlbkF0dHJpYnV0ZSh2YWwuaWQpXG4gICAgfSlcbn1cbmxldCBnbG9iYWxFeHBhbmRlZCA9IGZhbHNlIC8vIGdsb2JhbGx5IHRyYWNrIGlmIHVzZXJzIHdhbnQgdGhpcyBzaW5jZSB0aGV5IG1heSBiZSBjbGlja2luZyBiZXR3ZWVuIHJlc3VsdHNcbmNvbnN0IFN1bW1hcnkgPSAoeyByZXN1bHQ6IHNlbGVjdGlvbiB9OiBQcm9wcykgPT4ge1xuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKClcbiAgY29uc3QgW2ZvcmNlUmVuZGVyLCBzZXRGb3JjZVJlbmRlcl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkLCBzZXRFeHBhbmRlZF0gPSBSZWFjdC51c2VTdGF0ZShnbG9iYWxFeHBhbmRlZClcbiAgLyogU3BlY2lhbCBjYXNlIGZvciB3aGVuIGFsbCB0aGUgYXR0cmlidXRlcyBhcmUgZGlzcGxheWVkICovXG4gIGNvbnN0IFtmdWxseUV4cGFuZGVkLCBzZXRGdWxseUV4cGFuZGVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZmlsdGVyLCBzZXRGaWx0ZXJdID0gUmVhY3QudXNlU3RhdGUocGVyc2lzdGFudEZpbHRlcilcbiAgY29uc3QgW2RlY2ltYWxQcmVjaXNpb24sIHNldERlY2ltYWxQcmVjaXNpb25dID0gUmVhY3QudXNlU3RhdGUoXG4gICAgVHlwZWRVc2VySW5zdGFuY2UuZ2V0RGVjaW1hbFByZWNpc2lvbigpXG4gIClcbiAgY29uc3QgW3N1bW1hcnlTaG93biwgc2V0U3VtbWFyeVNob3duXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIFR5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzU3VtbWFyeVNob3duKClcbiAgKVxuICB1c2VSZXJlbmRlck9uQmFja2JvbmVTeW5jKHsgbGF6eVJlc3VsdDogc2VsZWN0aW9uIH0pXG4gIGNvbnN0IHsgbGlzdGVuVG8gfSA9IHVzZUJhY2tib25lKClcbiAgY29uc3QgeyBpc0hpZGRlbkF0dHJpYnV0ZSwgZ2V0TWV0YWNhcmREZWZpbml0aW9uIH0gPSB1c2VNZXRhY2FyZERlZmluaXRpb25zKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsaXN0ZW5UbyhcbiAgICAgIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLFxuICAgICAgJ2NoYW5nZTppbnNwZWN0b3Itc3VtbWFyeVNob3duIGNoYW5nZTpkYXRlVGltZUZvcm1hdCBjaGFuZ2U6dGltZVpvbmUgY2hhbmdlOmluc3BlY3Rvci1oaWRlRW1wdHknLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBzZXRTdW1tYXJ5U2hvd24oW1xuICAgICAgICAgIC4uLlR5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzU3VtbWFyeVNob3duKCksXG4gICAgICAgIF0pXG4gICAgICAgIHNldEZvcmNlUmVuZGVyKHRydWUpXG4gICAgICB9XG4gICAgKVxuICAgIGxpc3RlblRvKFxuICAgICAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJyksXG4gICAgICAnY2hhbmdlOmRlY2ltYWxQcmVjaXNpb24nLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBzZXREZWNpbWFsUHJlY2lzaW9uKFR5cGVkVXNlckluc3RhbmNlLmdldERlY2ltYWxQcmVjaXNpb24oKSlcbiAgICAgIH1cbiAgICApXG4gIH0sIFtdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgIGlmIChnZXRIaWRkZW5BdHRyaWJ1dGVzKHNlbGVjdGlvbiwgc3VtbWFyeVNob3duKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc2V0RnVsbHlFeHBhbmRlZCh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0RnVsbHlFeHBhbmRlZChmYWxzZSlcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtzdW1tYXJ5U2hvd25dKVxuICBjb25zdCBldmVyeXRoaW5nRWxzZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBzZWxlY3Rpb24gJiYgZXhwYW5kZWRcbiAgICAgID8gT2JqZWN0LmtleXMoc2VsZWN0aW9uLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMpXG4gICAgICAgICAgLmZpbHRlcigoYXR0cikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICFpc0hpZGRlbkF0dHJpYnV0ZShhdHRyKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbHRlcigoYXR0cikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICFzdW1tYXJ5U2hvd24uaW5jbHVkZXMoYXR0cilcbiAgICAgICAgICB9KVxuICAgICAgOiBbXVxuICB9LCBbZXhwYW5kZWQsIHN1bW1hcnlTaG93biwgaXNIaWRkZW5BdHRyaWJ1dGVdKVxuICBjb25zdCBibGFua0V2ZXJ5dGhpbmdFbHNlID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIHNlbGVjdGlvblxuICAgICAgPyBPYmplY3QudmFsdWVzKGdldE1ldGFjYXJkRGVmaW5pdGlvbihzZWxlY3Rpb24ucGxhaW4ubWV0YWNhcmRUeXBlKSlcbiAgICAgICAgICAuZmlsdGVyKCh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmIChzdW1tYXJ5U2hvd24uaW5jbHVkZXModmFsLmlkKSkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVyeXRoaW5nRWxzZS5pbmNsdWRlcyh2YWwuaWQpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maWx0ZXIoKHZhbCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICFpc0hpZGRlbkF0dHJpYnV0ZSh2YWwuaWQpXG4gICAgICAgICAgfSlcbiAgICAgIDogW11cbiAgfSwgW2V4cGFuZGVkLCBzdW1tYXJ5U2hvd24sIGlzSGlkZGVuQXR0cmlidXRlXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBnbG9iYWxFeHBhbmRlZCA9IGV4cGFuZGVkXG4gIH0sIFtleHBhbmRlZF0pXG4gIGlmICghc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIDxkaXY+Tm8gcmVzdWx0IHNlbGVjdGVkPC9kaXY+XG4gIH1cbiAgY29uc3QgaGlkZUVtcHR5OiBib29sZWFuID0gdXNlclxuICAgIC5nZXQoJ3VzZXInKVxuICAgIC5nZXQoJ3ByZWZlcmVuY2VzJylcbiAgICAuZ2V0KCdpbnNwZWN0b3ItaGlkZUVtcHR5JylcbiAgcmV0dXJuIChcbiAgICA8R3JpZFxuICAgICAgY29udGFpbmVyXG4gICAgICBkaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICBjbGFzc05hbWU9XCJvdmVyZmxvdy1oaWRkZW4gdy1mdWxsIGgtZnVsbFwiXG4gICAgPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJzaHJpbmstMFwiPlxuICAgICAgICA8R3JpZFxuICAgICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJwLTJcIlxuICAgICAgICA+XG4gICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgIDxTdW1tYXJ5TWFuYWdlQXR0cmlidXRlcyAvPlxuICAgICAgICAgIDwvR3JpZD5cblxuICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgIGRhdGEtaWQ9XCJzdW1tYXJ5LWZpbHRlci1pbnB1dFwiXG4gICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgIGxhYmVsPVwiRmlsdGVyXCJcbiAgICAgICAgICAgICAgdmFsdWU9e2ZpbHRlcn1cbiAgICAgICAgICAgICAgaW5wdXRQcm9wcz17e1xuICAgICAgICAgICAgICAgIHN0eWxlOlxuICAgICAgICAgICAgICAgICAgZmlsdGVyICE9PSAnJ1xuICAgICAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogYDFweCBzb2xpZCAke3RoZW1lLnBhbGV0dGUud2FybmluZy5tYWlufWAsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IHt9LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgICBwZXJzaXN0YW50RmlsdGVyID0gZS50YXJnZXQudmFsdWVcbiAgICAgICAgICAgICAgICBzZXRGaWx0ZXIoZS50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgPC9HcmlkPlxuICAgICAgPC9HcmlkPlxuICAgICAgPERhcmtEaXZpZGVyIGNsYXNzTmFtZT1cInctZnVsbCBoLW1pblwiIC8+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInNocmluay0xIG92ZXJmbG93LWF1dG8gcC0yXCI+XG4gICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFwZXJ9PlxuICAgICAgICAgIHtzdW1tYXJ5U2hvd24ubWFwKChhdHRyLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiIGtleT17YXR0cn0+XG4gICAgICAgICAgICAgICAgPEF0dHJpYnV0ZUNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17c2VsZWN0aW9ufVxuICAgICAgICAgICAgICAgICAgYXR0cj17YXR0cn1cbiAgICAgICAgICAgICAgICAgIGhpZGVFbXB0eT17aGlkZUVtcHR5fVxuICAgICAgICAgICAgICAgICAgc3VtbWFyeVNob3duPXtzdW1tYXJ5U2hvd259XG4gICAgICAgICAgICAgICAgICBkZWNpbWFsUHJlY2lzaW9uPXtkZWNpbWFsUHJlY2lzaW9ufVxuICAgICAgICAgICAgICAgICAgZmlsdGVyPXtmaWx0ZXJ9XG4gICAgICAgICAgICAgICAgICBmb3JjZVJlbmRlcj17Zm9yY2VSZW5kZXJ9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7aW5kZXggIT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8RGl2aWRlclxuICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbj1cImhvcml6b250YWxcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCB3LWZ1bGwgaC1taW5cIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG5cbiAgICAgICAgICB7ZXhwYW5kZWQgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICB7ZXZlcnl0aGluZ0Vsc2UubWFwKChhdHRyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXthdHRyfSBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8QXR0cmlidXRlQ29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17c2VsZWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIGF0dHI9e2F0dHJ9XG4gICAgICAgICAgICAgICAgICAgICAgaGlkZUVtcHR5PXtoaWRlRW1wdHl9XG4gICAgICAgICAgICAgICAgICAgICAgc3VtbWFyeVNob3duPXtzdW1tYXJ5U2hvd259XG4gICAgICAgICAgICAgICAgICAgICAgZGVjaW1hbFByZWNpc2lvbj17ZGVjaW1hbFByZWNpc2lvbn1cbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXI9e2ZpbHRlcn1cbiAgICAgICAgICAgICAgICAgICAgICBmb3JjZVJlbmRlcj17Zm9yY2VSZW5kZXJ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxEaXZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb249XCJob3Jpem9udGFsXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCB3LWZ1bGwgaC1taW5cIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAge2JsYW5rRXZlcnl0aGluZ0Vsc2UubWFwKChhdHRyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXthdHRyLmlkfSBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8QXR0cmlidXRlQ29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17c2VsZWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIGF0dHI9e2F0dHIuaWR9XG4gICAgICAgICAgICAgICAgICAgICAgaGlkZUVtcHR5PXtoaWRlRW1wdHl9XG4gICAgICAgICAgICAgICAgICAgICAgc3VtbWFyeVNob3duPXtzdW1tYXJ5U2hvd259XG4gICAgICAgICAgICAgICAgICAgICAgZGVjaW1hbFByZWNpc2lvbj17ZGVjaW1hbFByZWNpc2lvbn1cbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXI9e2ZpbHRlcn1cbiAgICAgICAgICAgICAgICAgICAgICBmb3JjZVJlbmRlcj17Zm9yY2VSZW5kZXJ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxEaXZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb249XCJob3Jpem9udGFsXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCB3LWZ1bGwgaC1taW5cIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PjwvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvUGFwZXI+XG4gICAgICA8L0dyaWQ+XG4gICAgICB7LyogSWYgaGlkZGVuIGF0dHJpYnV0ZXMgPT09IDAsIGRvbid0IHNob3cgdGhpcyBidXR0b24gKi99XG4gICAgICB7IWZ1bGx5RXhwYW5kZWQgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxEYXJrRGl2aWRlciBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1taW5cIiAvPlxuICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwic2hyaW5rLTAgcC0yXCI+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGRhdGEtaWQ9XCJzZWUtYWxsLWNvbGxhcHNlLWJ1dHRvblwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRFeHBhbmRlZCghZXhwYW5kZWQpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtleHBhbmRlZCA/ICdDb2xsYXBzZScgOiAnU2VlIGFsbCd9XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8L0dyaWQ+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFN1bW1hcnkpXG4iXX0=