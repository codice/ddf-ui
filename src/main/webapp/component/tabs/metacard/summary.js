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
//# sourceMappingURL=summary.js.map