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
    var _h = useMetacardDefinitions(), getAlias = _h.getAlias, isMulti = _h.isMulti, getType = _h.getType, getEnum = _h.getEnum, getRequired = _h.getRequired;
    var label = getAlias(attr);
    var isMultiValued = isMulti(attr);
    var attrType = getType(attr);
    var enumForAttr = getEnum(attr);
    var addSnack = useSnack();
    var isRequired = getRequired(lazyResult.plain.metacardType, attr);
    function getErrorMessage() {
        if (isRequired || attr === 'title') {
            var invalidField = !values || values.length < 1 || !values[0];
            return invalidField ? label + ' is required.' : '';
        }
        return '';
    }
    var errmsg = getErrorMessage();
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
                                    }, style: { whiteSpace: 'pre-line', flexGrow: 50 }, fullWidth: true, multiline: true, maxRows: 1000, error: errmsg.length != 0, helperText: errmsg }));
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
                    if (isRequired && (!values || values.length < 1 || !values[0])) {
                        setTimeout(function () {
                            addSnack('This attribute is required.', {
                                status: 'error',
                            });
                        }, 1000);
                        return;
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdGFicy9tZXRhY2FyZC9zdW1tYXJ5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pELE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sUUFBUSxNQUFNLHdCQUF3QixDQUFBO0FBQzdDLE9BQU8sT0FBTyxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLDRCQUE0QixDQUFBO0FBQ25ELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDeEMsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxRQUFRLE1BQU0sc0JBQXNCLENBQUE7QUFDM0MsT0FBTyxjQUFjLE1BQU0sOEJBQThCLENBQUE7QUFDekQsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sV0FBVyxNQUFNLDZCQUE2QixDQUFBO0FBQ3JELE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUUvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkNBQTJDLENBQUE7QUFDdkUsT0FB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RUFDRCxJQUFJLEVBQUMsT0FBTyxFQUNaLEtBQUssRUFBQyxTQUFTLElBRWQsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FDM0IsQ0FDSixDQUNOLENBQ0osQ0FDSSxDQUNSLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBHcmlkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvR3JpZCdcbmltcG9ydCBUeXBvZ3JhcGh5IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVHlwb2dyYXBoeSdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQXV0b2NvbXBsZXRlJ1xuaW1wb3J0IENoZWNrYm94IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQ2hlY2tib3gnXG5pbXBvcnQgRGl2aWRlciBmcm9tICdAbXVpL21hdGVyaWFsL0RpdmlkZXInXG5pbXBvcnQgRGVsZXRlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0RlbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgeyB1c2VEaWFsb2cgfSBmcm9tICcuLi8uLi9kaWFsb2cnXG5pbXBvcnQgRGlhbG9nQWN0aW9ucyBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0FjdGlvbnMnXG5pbXBvcnQgRGlhbG9nQ29udGVudCBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0NvbnRlbnQnXG5pbXBvcnQgdXNlU25hY2sgZnJvbSAnLi4vLi4vaG9va3MvdXNlU25hY2snXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBQdWJsaXNoSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL1B1Ymxpc2gnXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IHVzZVRoZW1lIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9zdHlsZXMnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IHVzZUN1c3RvbVJlYWRPbmx5Q2hlY2sgfSBmcm9tICcuL3RyYW5zZmVyLWxpc3QnXG5pbXBvcnQgS2V5Ym9hcmRCYWNrc3BhY2VJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvS2V5Ym9hcmRCYWNrc3BhY2UnXG5pbXBvcnQgQWRkSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0FkZCdcbmltcG9ydCBFZGl0SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0VkaXQnXG5pbXBvcnQgQm94IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQm94J1xuaW1wb3J0IHsgRWxldmF0aW9ucyB9IGZyb20gJy4uLy4uL3RoZW1lL3RoZW1lJ1xuaW1wb3J0IHsgRGFya0RpdmlkZXIgfSBmcm9tICcuLi8uLi9kYXJrLWRpdmlkZXIvZGFyay1kaXZpZGVyJ1xuaW1wb3J0IHsgZGlzcGxheUhpZ2hsaWdodGVkQXR0ckluRnVsbCB9IGZyb20gJy4vaGlnaGxpZ2h0VXRpbCdcbmltcG9ydCBEYXRlVGltZVBpY2tlciBmcm9tICcuLi8uLi9maWVsZHMvZGF0ZS10aW1lLXBpY2tlcidcbmltcG9ydCB7IHVzZVJlcmVuZGVyT25CYWNrYm9uZVN5bmMgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvaG9va3MnXG5pbXBvcnQgdXNlQ29vcmRpbmF0ZUZvcm1hdCBmcm9tICcuL3VzZUNvb3JkaW5hdGVGb3JtYXQnXG5pbXBvcnQgeyBNZXRhY2FyZEF0dHJpYnV0ZSB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1R5cGVzJ1xuaW1wb3J0IEV4dGVuc2lvblBvaW50cyBmcm9tICcuLi8uLi8uLi9leHRlbnNpb24tcG9pbnRzJ1xuaW1wb3J0IExvY2F0aW9uSW5wdXRSZWFjdCBmcm9tICcuLi8uLi9sb2NhdGlvbi1uZXcvbG9jYXRpb24tbmV3LnZpZXcnXG5pbXBvcnQgeyBUeXBlZFVzZXJJbnN0YW5jZSB9IGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvVHlwZWRVc2VyJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL21ldGFjYXJkLWRlZmluaXRpb25zLmhvb2tzJ1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi8uLi8uLi9qcy9Db21tb24nXG5pbXBvcnQgU3VtbWFyeU1hbmFnZUF0dHJpYnV0ZXMgZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3N1bW1hcnktbWFuYWdlLWF0dHJpYnV0ZXMvc3VtbWFyeS1tYW5hZ2UtYXR0cmlidXRlcydcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50LXRpbWV6b25lJ1xuXG50eXBlIFByb3BzID0ge1xuICByZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxufVxuY29uc3QgVGh1bWJuYWlsSW5wdXQgPSAoe1xuICB2YWx1ZSxcbiAgb25DaGFuZ2UgPSAoKSA9PiB7fSxcbiAgZGlzYWJsZWQgPSBmYWxzZSxcbn06IHtcbiAgdmFsdWU6IHN0cmluZ1xuICBkaXNhYmxlZDogYm9vbGVhblxuICBvbkNoYW5nZT86ICh2YWw6IHN0cmluZykgPT4gdm9pZFxufSkgPT4ge1xuICBjb25zdCBmaWxlUmVmID0gUmVhY3QudXNlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KG51bGwpXG4gIGNvbnN0IGltZ1JlZiA9IFJlYWN0LnVzZVJlZjxIVE1MSW1hZ2VFbGVtZW50PihudWxsKVxuICByZXR1cm4gKFxuICAgIDxHcmlkXG4gICAgICBjb250YWluZXJcbiAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICBhbGlnbkl0ZW1zPVwic3RyZXRjaFwiXG4gICAgICBhbGlnbkNvbnRlbnQ9XCJzdHJldGNoXCJcbiAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgID5cbiAgICAgIDxHcmlkIGl0ZW0gc3R5bGU9e3sgb3ZlcmZsb3c6ICdoaWRkZW4nIH19PlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgcmVmPXtmaWxlUmVmfVxuICAgICAgICAgIHN0eWxlPXt7IGRpc3BsYXk6ICdub25lJyB9fVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGltZ1JlZi5jdXJyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgICAgICAgICAgICBvbkNoYW5nZShldmVudC50YXJnZXQucmVzdWx0KVxuICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCd0aGVyZSBpcyBzb21ldGhpbmcgd3Jvbmcgd2l0aCBmaWxlIHR5cGUnKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWFkZXIub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignZXJyb3InKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZS50YXJnZXQuZmlsZXNbMF0pXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICAgPGltZ1xuICAgICAgICAgIHNyYz17Q29tbW9uLmdldEltYWdlU3JjKHZhbHVlKX1cbiAgICAgICAgICByZWY9e2ltZ1JlZn1cbiAgICAgICAgICBzdHlsZT17eyBtYXhXaWR0aDogJzEwMCUnLCBtYXhIZWlnaHQ6ICc1MHZoJyB9fVxuICAgICAgICAvPlxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHN0eWxlPXt7IGhlaWdodDogJzEwMCUnIH19XG4gICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBmaWxlUmVmLmN1cnJlbnQuY2xpY2soKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8UHVibGlzaEljb24gLz5cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0dyaWQ+XG4gICAgPC9HcmlkPlxuICApXG59XG5lbnVtIE1vZGUge1xuICBOb3JtYWwgPSAnbm9ybWFsJyxcbiAgU2F2aW5nID0gJ3NhdmluZycsXG4gIEJhZElucHV0ID0gJ2JhZC1pbnB1dCcsXG59XG5jb25zdCBoYW5kbGVNZXRhY2FyZFVwZGF0ZSA9ICh7XG4gIGxhenlSZXN1bHQsXG4gIGF0dHJpYnV0ZXMsXG4gIG9uU3VjY2VzcyxcbiAgb25GYWlsdXJlLFxufToge1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbiAgYXR0cmlidXRlczogTWV0YWNhcmRBdHRyaWJ1dGVbXVxuICBvblN1Y2Nlc3M6ICgpID0+IHZvaWRcbiAgb25GYWlsdXJlOiAoKSA9PiB2b2lkXG59KSA9PiB7XG4gIGNvbnN0IHBheWxvYWQgPSBbXG4gICAge1xuICAgICAgaWRzOiBbbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLmlkXSxcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgfSxcbiAgXVxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBgLi9pbnRlcm5hbC9tZXRhY2FyZHM/c3RvcmVJZD0ke2xhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc291cmNlLWlkJ119YCxcbiAgICAgIHR5cGU6ICdQQVRDSCcsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcbiAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSkudGhlbihcbiAgICAgIChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICAgIGxhenlSZXN1bHQucmVmcmVzaEZyb21FZGl0UmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICAgIG9uU3VjY2VzcygpXG4gICAgICB9LFxuICAgICAgKCkgPT4gb25GYWlsdXJlKClcbiAgICApXG4gIH0sIDEwMDApXG59XG5leHBvcnQgY29uc3QgRWRpdG9yID0gKHtcbiAgYXR0cixcbiAgbGF6eVJlc3VsdCxcbiAgb25DYW5jZWwgPSAoKSA9PiB7fSxcbiAgb25TYXZlID0gKCkgPT4ge30sXG4gIGdvQmFjayxcbn06IHtcbiAgYXR0cjogc3RyaW5nXG4gIGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxuICBvbkNhbmNlbD86ICgpID0+IHZvaWRcbiAgb25TYXZlPzogKCkgPT4gdm9pZFxuICBnb0JhY2s/OiAoKSA9PiB2b2lkXG59KSA9PiB7XG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IFJlYWN0LnVzZVN0YXRlKE1vZGUuTm9ybWFsKVxuICBjb25zdCBbdmFsdWVzLCBzZXRWYWx1ZXNdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgQXJyYXkuaXNBcnJheShsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cl0pXG4gICAgICA/IGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyXS5zbGljZSgwKVxuICAgICAgOiBbbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW2F0dHJdXVxuICApXG4gIGNvbnN0IFtkaXJ0eUluZGV4LCBzZXREaXJ0eUluZGV4XSA9IFJlYWN0LnVzZVN0YXRlKC0xKVxuICBjb25zdCB7IGdldEFsaWFzLCBpc011bHRpLCBnZXRUeXBlLCBnZXRFbnVtLCBnZXRSZXF1aXJlZCB9ID1cbiAgICB1c2VNZXRhY2FyZERlZmluaXRpb25zKClcbiAgY29uc3QgbGFiZWwgPSBnZXRBbGlhcyhhdHRyKVxuICBjb25zdCBpc011bHRpVmFsdWVkID0gaXNNdWx0aShhdHRyKVxuICBjb25zdCBhdHRyVHlwZSA9IGdldFR5cGUoYXR0cilcbiAgY29uc3QgZW51bUZvckF0dHIgPSBnZXRFbnVtKGF0dHIpXG4gIGNvbnN0IGFkZFNuYWNrID0gdXNlU25hY2soKVxuICBjb25zdCBpc1JlcXVpcmVkID0gZ2V0UmVxdWlyZWQobGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZFR5cGUsIGF0dHIpXG5cbiAgZnVuY3Rpb24gZ2V0RXJyb3JNZXNzYWdlKCkge1xuICAgIGlmIChpc1JlcXVpcmVkIHx8IGF0dHIgPT09ICd0aXRsZScpIHtcbiAgICAgIGNvbnN0IGludmFsaWRGaWVsZCA9ICF2YWx1ZXMgfHwgdmFsdWVzLmxlbmd0aCA8IDEgfHwgIXZhbHVlc1swXVxuICAgICAgcmV0dXJuIGludmFsaWRGaWVsZCA/IGxhYmVsICsgJyBpcyByZXF1aXJlZC4nIDogJydcbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBjb25zdCBlcnJtc2cgPSBnZXRFcnJvck1lc3NhZ2UoKVxuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtnb0JhY2sgJiYgKFxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgc3RhcnRJY29uPXs8S2V5Ym9hcmRCYWNrc3BhY2VJY29uIC8+fVxuICAgICAgICAgIG9uQ2xpY2s9e2dvQmFja31cbiAgICAgICAgPlxuICAgICAgICAgIENhbmNlbCBhbmQgcmV0dXJuIHRvIG1hbmFnZVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICl9XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtMnhsIHRleHQtY2VudGVyIHB4LTIgcGItMiBwdC00IGZvbnQtbm9ybWFsIHRydW5jYXRlXCI+XG4gICAgICAgIEVkaXRpbmcge2xhYmVsfSBvZiBcIntsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGV9XCJcbiAgICAgIDwvZGl2PlxuICAgICAgPERpdmlkZXIgLz5cbiAgICAgIDxEaWFsb2dDb250ZW50IHN0eWxlPXt7IG1pbkhlaWdodDogJzMwZW0nLCBtaW5XaWR0aDogJzYwdmgnIH19PlxuICAgICAgICB7dmFsdWVzLm1hcCgodmFsOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEdyaWQgY29udGFpbmVyIGRpcmVjdGlvbj1cInJvd1wiIGNsYXNzTmFtZT1cIm15LTJcIj5cbiAgICAgICAgICAgICAge2luZGV4ICE9PSAwID8gPERpdmlkZXIgc3R5bGU9e3sgbWFyZ2luOiAnNXB4IDBweCcgfX0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICA8R3JpZCBpdGVtIG1kPXsxMX0+XG4gICAgICAgICAgICAgICAgeygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoZW51bUZvckF0dHIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxBdXRvY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlID09PSAnc2F2aW5nJ31cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KF9lOiBhbnksIG5ld1ZhbHVlOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IG5ld1ZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zPXtlbnVtRm9yQXR0cn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxUZXh0RmllbGQgey4uLnBhcmFtc30gdmFyaWFudD1cIm91dGxpbmVkXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgc3dpdGNoIChhdHRyVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPERhdGVUaW1lUGlja2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFRleHRGaWVsZFByb3BzPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IG1vZGUgIT09IE1vZGUuTm9ybWFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAnb3V0bGluZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBCUERhdGVQcm9wcz17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBtb2RlICE9PSBNb2RlLk5vcm1hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBjYXNlICdCSU5BUlknOlxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8VGh1bWJuYWlsSW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e21vZGUgIT09IE1vZGUuTm9ybWFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHVwZGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSB1cGRhdGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnQk9PTEVBTic6XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSAhPT0gTW9kZS5Ob3JtYWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IGUudGFyZ2V0LmNoZWNrZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnTE9ORyc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RPVUJMRSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0ZMT0FUJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnSU5URUdFUic6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ1NIT1JUJzpcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSAhPT0gTW9kZS5Ob3JtYWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSBlLnRhcmdldC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm51bWJlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPExvY2F0aW9uSW5wdXRSZWFjdFxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGxvY2F0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24gPT09IG51bGwgfHwgbG9jYXRpb24gPT09ICdJTlZBTElEJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0TW9kZShNb2RlLkJhZElucHV0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRNb2RlKE1vZGUuTm9ybWFsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gbG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3RhdGVEaXJ0eT17ZGlydHlJbmRleCA9PT0gaW5kZXh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SXNTdGF0ZURpcnR5PXsoKSA9PiBzZXREaXJ0eUluZGV4KC0xKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlICE9PSBNb2RlLk5vcm1hbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gZS50YXJnZXQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdoaXRlU3BhY2U6ICdwcmUtbGluZScsIGZsZXhHcm93OiA1MCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlsaW5lPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhSb3dzPXsxMDAwfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcj17ZXJybXNnLmxlbmd0aCAhPSAwfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBoZWxwZXJUZXh0PXtlcnJtc2d9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KSgpfVxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgIHtpc011bHRpVmFsdWVkID8gKFxuICAgICAgICAgICAgICAgIDxHcmlkIGl0ZW0gbWQ9ezF9PlxuICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSA9PT0gTW9kZS5TYXZpbmd9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICAgIHNldERpcnR5SW5kZXgoaW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXNdKVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8RGVsZXRlSWNvbiAvPlxuICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICApXG4gICAgICAgIH0pfVxuICAgICAgICB7aXNNdWx0aVZhbHVlZCAmJiAoXG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgZGlzYWJsZWQ9e21vZGUgPT09IE1vZGUuU2F2aW5nfVxuICAgICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgbGV0IGRlZmF1bHRWYWx1ZSA9ICcnXG4gICAgICAgICAgICAgIHN3aXRjaCAoYXR0clR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlcywgZGVmYXVsdFZhbHVlXSlcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPEJveCBjb2xvcj1cInRleHQucHJpbWFyeVwiPlxuICAgICAgICAgICAgICA8QWRkSWNvbiAvPlxuICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICBBZGQgTmV3IFZhbHVlXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICl9XG4gICAgICA8L0RpYWxvZ0NvbnRlbnQ+XG4gICAgICA8RGl2aWRlciAvPlxuICAgICAgPERpYWxvZ0FjdGlvbnM+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBkaXNhYmxlZD17bW9kZSA9PT0gTW9kZS5TYXZpbmd9XG4gICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIG9uQ2FuY2VsKClcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgQ2FuY2VsXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgZGlzYWJsZWQ9e21vZGUgIT09IE1vZGUuTm9ybWFsfVxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgc2V0TW9kZShNb2RlLlNhdmluZylcblxuICAgICAgICAgICAgaWYgKGlzUmVxdWlyZWQgJiYgKCF2YWx1ZXMgfHwgdmFsdWVzLmxlbmd0aCA8IDEgfHwgIXZhbHVlc1swXSkpIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWRkU25hY2soJ1RoaXMgYXR0cmlidXRlIGlzIHJlcXVpcmVkLicsIHtcbiAgICAgICAgICAgICAgICAgIHN0YXR1czogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9LCAxMDAwKVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkVmFsdWVzXG4gICAgICAgICAgICBpZiAoaXNNdWx0aVZhbHVlZCAmJiB2YWx1ZXMgJiYgdmFsdWVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtZWRWYWx1ZXMgPSB2YWx1ZXMuZmlsdGVyKFxuICAgICAgICAgICAgICAgICh2YWw6IGFueSkgPT4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJ1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFZhbHVlcyA9IHZhbHVlc1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBzd2l0Y2ggKGF0dHJUeXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnQklOQVJZJzpcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkVmFsdWVzID0gdHJhbnNmb3JtZWRWYWx1ZXMubWFwKFxuICAgICAgICAgICAgICAgICAgICAoc3VidmFsOiBhbnkpID0+IHN1YnZhbC5zcGxpdCgnLCcpWzFdXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgJ0RBVEUnOlxuICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRWYWx1ZXMgPSB0cmFuc2Zvcm1lZFZhbHVlcy5tYXAoKHN1YnZhbDogYW55KSA9PlxuICAgICAgICAgICAgICAgICAgICBtb21lbnQoc3VidmFsKS50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkVmFsdWVzID0gdmFsdWVzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgICAgKHZhbDogYW55KSA9PiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnXG4gICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGVzID0gW3sgYXR0cmlidXRlOiBhdHRyLCB2YWx1ZXM6IHRyYW5zZm9ybWVkVmFsdWVzIH1dXG4gICAgICAgICAgICBjb25zdCBvblN1Y2Nlc3MgPSAoKSA9PlxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhZGRTbmFjaygnU3VjY2Vzc2Z1bGx5IHVwZGF0ZWQuJylcbiAgICAgICAgICAgICAgICBvblNhdmUoKVxuICAgICAgICAgICAgICB9LCAxMDAwKVxuICAgICAgICAgICAgY29uc3Qgb25GYWlsdXJlID0gKCkgPT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWRkU25hY2soJ0ZhaWxlZCB0byB1cGRhdGUuJywgeyBzdGF0dXM6ICdlcnJvcicgfSlcbiAgICAgICAgICAgICAgICBvblNhdmUoKVxuICAgICAgICAgICAgICB9LCAxMDAwKVxuICAgICAgICAgICAgaWYgKEV4dGVuc2lvblBvaW50cy5oYW5kbGVNZXRhY2FyZFVwZGF0ZSkge1xuICAgICAgICAgICAgICBFeHRlbnNpb25Qb2ludHMuaGFuZGxlTWV0YWNhcmRVcGRhdGUoe1xuICAgICAgICAgICAgICAgIGxhenlSZXN1bHQsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlc1RvVXBkYXRlOiBhdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICB9KS50aGVuKG9uU3VjY2Vzcywgb25GYWlsdXJlKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaGFuZGxlTWV0YWNhcmRVcGRhdGUoe1xuICAgICAgICAgICAgICAgIGxhenlSZXN1bHQsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgICBvblN1Y2Nlc3MsXG4gICAgICAgICAgICAgICAgb25GYWlsdXJlLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBTYXZlXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9EaWFsb2dBY3Rpb25zPlxuICAgICAge21vZGUgPT09IE1vZGUuU2F2aW5nID8gKFxuICAgICAgICA8TGluZWFyUHJvZ3Jlc3NcbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgIGhlaWdodDogJzEwcHgnLFxuICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgICAgICBsZWZ0OiAnMHB4JyxcbiAgICAgICAgICAgIGJvdHRvbTogJzAlJyxcbiAgICAgICAgICB9fVxuICAgICAgICAgIHZhcmlhbnQ9XCJpbmRldGVybWluYXRlXCJcbiAgICAgICAgLz5cbiAgICAgICkgOiBudWxsfVxuICAgIDwvPlxuICApXG59XG5jb25zdCBBdHRyaWJ1dGVDb21wb25lbnQgPSAoe1xuICBsYXp5UmVzdWx0LFxuICBhdHRyLFxuICBoaWRlRW1wdHksXG4gIHN1bW1hcnlTaG93biA9IFtdLFxuICBkZWNpbWFsUHJlY2lzaW9uID0gdW5kZWZpbmVkLFxuICBmaWx0ZXIgPSAnJyxcbiAgZm9yY2VSZW5kZXIsXG59OiB7XG4gIGF0dHI6IHN0cmluZ1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbiAgaGlkZUVtcHR5OiBib29sZWFuXG4gIHN1bW1hcnlTaG93bj86IHN0cmluZ1tdXG4gIGRlY2ltYWxQcmVjaXNpb246IG51bWJlciB8IHVuZGVmaW5lZFxuICBmaWx0ZXI/OiBzdHJpbmdcbiAgZm9yY2VSZW5kZXI6IGJvb2xlYW5cbn0pID0+IHtcbiAgbGV0IHZhbHVlID0gbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW2F0dHJdXG4gIGlmIChoaWRlRW1wdHkpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgIXZhbHVlLnRyaW0oKSkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICB2YWx1ZSA9IFtdXG4gIH1cbiAgaWYgKHZhbHVlLmNvbnN0cnVjdG9yICE9PSBBcnJheSkge1xuICAgIHZhbHVlID0gW3ZhbHVlXVxuICB9XG4gIGNvbnN0IHsgZ2V0QWxpYXMsIGdldFR5cGUgfSA9IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMoKVxuICBsZXQgbGFiZWwgPSBnZXRBbGlhcyhhdHRyKVxuICBjb25zdCB7IGlzTm90V3JpdGFibGUgfSA9IHVzZUN1c3RvbVJlYWRPbmx5Q2hlY2soKVxuICBjb25zdCBkaWFsb2dDb250ZXh0ID0gdXNlRGlhbG9nKClcbiAgY29uc3QgY29udmVydFRvRm9ybWF0ID0gdXNlQ29vcmRpbmF0ZUZvcm1hdCgpXG4gIGNvbnN0IGNvbnZlcnRUb1ByZWNpc2lvbiA9ICh2YWx1ZTogYW55KSA9PiB7XG4gICAgcmV0dXJuIHZhbHVlICYmIGRlY2ltYWxQcmVjaXNpb25cbiAgICAgID8gTnVtYmVyKHZhbHVlKS50b0ZpeGVkKGRlY2ltYWxQcmVjaXNpb24pXG4gICAgICA6IHZhbHVlXG4gIH1cbiAgY29uc3QgaXNVcmwgPSAodmFsdWU6IGFueSkgPT4ge1xuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBwcm90b2NvbCA9IHZhbHVlLnRvTG93ZXJDYXNlKCkuc3BsaXQoJy8nKVswXVxuICAgICAgcmV0dXJuIHByb3RvY29sICYmIChwcm90b2NvbCA9PT0gJ2h0dHA6JyB8fCBwcm90b2NvbCA9PT0gJ2h0dHBzOicpXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGNvbnN0IGlzRmlsdGVyZWQgPVxuICAgIGZpbHRlciAhPT0gJycgPyAhbGFiZWwudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhmaWx0ZXIudG9Mb3dlckNhc2UoKSkgOiBmYWxzZVxuICBjb25zdCBvbkNhbmNlbCA9ICgpID0+IHtcbiAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgY2hpbGRyZW46IG51bGwsXG4gICAgfSlcbiAgfVxuICBjb25zdCBvblNhdmUgPSAoKSA9PiB7XG4gICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7XG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICAgIGNoaWxkcmVuOiBudWxsLFxuICAgIH0pXG4gIH1cbiAgY29uc3QgQ3VzdG9tQXR0cmlidXRlRWRpdG9yID0gRXh0ZW5zaW9uUG9pbnRzLmF0dHJpYnV0ZUVkaXRvcihcbiAgICBsYXp5UmVzdWx0LFxuICAgIGF0dHJcbiAgKVxuICBjb25zdCBNZW1vSXRlbSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICA8R3JpZFxuICAgICAgICBjb250YWluZXJcbiAgICAgICAgZGlyZWN0aW9uPVwicm93XCJcbiAgICAgICAgd3JhcD17J25vd3JhcCd9XG4gICAgICAgIGNsYXNzTmFtZT1cImdyb3VwIHJlbGF0aXZlXCJcbiAgICAgID5cbiAgICAgICAge2lzTm90V3JpdGFibGUoeyBhdHRyaWJ1dGU6IGF0dHIsIGxhenlSZXN1bHQgfSkgPyBudWxsIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0xIGhpZGRlbiBncm91cC1ob3ZlcjpibG9jayBhYnNvbHV0ZSByaWdodC0wIHRvcC0wXCI+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgICAgICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlRW5mb3JjZUZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IEN1c3RvbUF0dHJpYnV0ZUVkaXRvciA/IChcbiAgICAgICAgICAgICAgICAgICAgPEN1c3RvbUF0dHJpYnV0ZUVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdD17bGF6eVJlc3VsdH1cbiAgICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGU9e2F0dHJ9XG4gICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e29uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZT17b25TYXZlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPEVkaXRvclxuICAgICAgICAgICAgICAgICAgICAgIGF0dHI9e2F0dHJ9XG4gICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17bGF6eVJlc3VsdH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17b25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgICAgb25TYXZlPXtvblNhdmV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxFZGl0SWNvbiAvPlxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAgPEdyaWRcbiAgICAgICAgICBpdGVtXG4gICAgICAgICAgeHM9ezR9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdvcmRCcmVhazogJ2JyZWFrLXdvcmQnLFxuICAgICAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgIH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwicmVsYXRpdmVcIlxuICAgICAgICA+XG4gICAgICAgICAgPFR5cG9ncmFwaHk+e2xhYmVsfTwvVHlwb2dyYXBoeT5cbiAgICAgICAgICA8RGl2aWRlclxuICAgICAgICAgICAgb3JpZW50YXRpb249XCJ2ZXJ0aWNhbFwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC0wIHRvcC0wIHctbWluIGgtZnVsbFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9HcmlkPlxuICAgICAgICA8R3JpZFxuICAgICAgICAgIGl0ZW1cbiAgICAgICAgICBtZD17OH1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd29yZEJyZWFrOiAnYnJlYWstd29yZCcsXG4gICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDxHcmlkIGNvbnRhaW5lciBkaXJlY3Rpb249XCJyb3dcIj5cbiAgICAgICAgICAgIDxHcmlkIGRhdGEtaWQ9e2Ake2F0dHJ9LXZhbHVlYH0gaXRlbT5cbiAgICAgICAgICAgICAge3ZhbHVlLm1hcCgodmFsOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50IGtleT17aW5kZXh9PlxuICAgICAgICAgICAgICAgICAgICB7aW5kZXggIT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPERpdmlkZXIgc3R5bGU9e3sgbWFyZ2luOiAnNXB4IDBweCcgfX0gLz5cbiAgICAgICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgeygoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0ciA9PT0gJ2V4dC5hdWRpby1zbmlwcGV0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtaW1ldHlwZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2V4dC5hdWRpby1zbmlwcGV0LW1pbWV0eXBlJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3JjID0gYGRhdGE6JHttaW1ldHlwZX07YmFzZTY0LCR7dmFsfWBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxhdWRpbyBjb250cm9scyBzcmM9e3NyY30gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZ2V0VHlwZShhdHRyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e1R5cGVkVXNlckluc3RhbmNlLmdldE1vbWVudERhdGUodmFsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3VzZXIuZ2V0VXNlclJlYWRhYmxlRGF0ZVRpbWUodmFsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0JJTkFSWSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtDb21tb24uZ2V0SW1hZ2VTcmModmFsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heEhlaWdodDogJzUwdmgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0JPT0xFQU4nOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeT57dmFsID8gJ3RydWUnIDogJ2ZhbHNlJ308L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdHRU9NRVRSWSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5Pntjb252ZXJ0VG9Gb3JtYXQodmFsKX08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdMT05HJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnRE9VQkxFJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnRkxPQVQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeT57Y29udmVydFRvUHJlY2lzaW9uKHZhbCl9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobGF6eVJlc3VsdC5oaWdobGlnaHRzW2F0dHJdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0ciA9PT0gJ3RpdGxlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL1NwZWNpYWwgY2FzZSwgdGl0bGUgaGlnaGxpZ2h0cyBkb24ndCBnZXQgdHJ1bmNhdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYW5nZXJvdXNseVNldElubmVySFRNTD17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9faHRtbDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQuaGlnaGxpZ2h0c1thdHRyXVswXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaGlnaGxpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzVXJsKHZhbCkgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJoaWdobGlnaHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17dmFsfSB0YXJnZXQ9XCJfYmxhbmtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlIaWdobGlnaHRlZEF0dHJJbkZ1bGwoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LmhpZ2hsaWdodHNbYXR0cl0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNVcmwodmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17dmFsfSB0YXJnZXQ9XCJfYmxhbmtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8VHlwb2dyYXBoeT57dmFsfTwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfSkoKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0dyaWQ+XG4gICAgKVxuICB9LCBbc3VtbWFyeVNob3duLCBmb3JjZVJlbmRlciwgaXNOb3RXcml0YWJsZV0pXG4gIHJldHVybiAoXG4gICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiBpc0ZpbHRlcmVkID8gJ25vbmUnIDogJ2Jsb2NrJyB9fT57TWVtb0l0ZW19PC9kaXY+XG4gIClcbn1cbmxldCBwZXJzaXN0YW50RmlsdGVyID0gJydcbi8qIEhpZGRlbiBhdHRyaWJ1dGVzIGFyZSBzaW1wbHkgdGhlIG9wcG9zaXRlIG9mIGFjdGl2ZSAqL1xuLyogVGhleSBkbyBub3QgY3VycmVudGx5IGV4aXN0IG9uIHRoZSBtZXRhY2FyZCBPUiBhcmUgbm90IHNob3duIGluIHRoZSBzdW1tYXJ5ICovXG5jb25zdCBnZXRIaWRkZW5BdHRyaWJ1dGVzID0gKFxuICBzZWxlY3Rpb246IExhenlRdWVyeVJlc3VsdCxcbiAgYWN0aXZlQXR0cmlidXRlczogc3RyaW5nW11cbikgPT4ge1xuICByZXR1cm4gT2JqZWN0LnZhbHVlcyhcbiAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0TWV0YWNhcmREZWZpbml0aW9uKFxuICAgICAgc2VsZWN0aW9uLnBsYWluLm1ldGFjYXJkVHlwZVxuICAgIClcbiAgKVxuICAgIC5maWx0ZXIoKHZhbCkgPT4ge1xuICAgICAgaWYgKGFjdGl2ZUF0dHJpYnV0ZXMuaW5jbHVkZXModmFsLmlkKSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcbiAgICAuZmlsdGVyKCh2YWwpID0+IHtcbiAgICAgIHJldHVybiAhU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmlzSGlkZGVuQXR0cmlidXRlKHZhbC5pZClcbiAgICB9KVxufVxubGV0IGdsb2JhbEV4cGFuZGVkID0gZmFsc2UgLy8gZ2xvYmFsbHkgdHJhY2sgaWYgdXNlcnMgd2FudCB0aGlzIHNpbmNlIHRoZXkgbWF5IGJlIGNsaWNraW5nIGJldHdlZW4gcmVzdWx0c1xuY29uc3QgU3VtbWFyeSA9ICh7IHJlc3VsdDogc2VsZWN0aW9uIH06IFByb3BzKSA9PiB7XG4gIGNvbnN0IHRoZW1lID0gdXNlVGhlbWUoKVxuICBjb25zdCBbZm9yY2VSZW5kZXIsIHNldEZvcmNlUmVuZGVyXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZXhwYW5kZWQsIHNldEV4cGFuZGVkXSA9IFJlYWN0LnVzZVN0YXRlKGdsb2JhbEV4cGFuZGVkKVxuICAvKiBTcGVjaWFsIGNhc2UgZm9yIHdoZW4gYWxsIHRoZSBhdHRyaWJ1dGVzIGFyZSBkaXNwbGF5ZWQgKi9cbiAgY29uc3QgW2Z1bGx5RXhwYW5kZWQsIHNldEZ1bGx5RXhwYW5kZWRdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtmaWx0ZXIsIHNldEZpbHRlcl0gPSBSZWFjdC51c2VTdGF0ZShwZXJzaXN0YW50RmlsdGVyKVxuICBjb25zdCBbZGVjaW1hbFByZWNpc2lvbiwgc2V0RGVjaW1hbFByZWNpc2lvbl0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBUeXBlZFVzZXJJbnN0YW5jZS5nZXREZWNpbWFsUHJlY2lzaW9uKClcbiAgKVxuICBjb25zdCBbc3VtbWFyeVNob3duLCBzZXRTdW1tYXJ5U2hvd25dID0gUmVhY3QudXNlU3RhdGUoXG4gICAgVHlwZWRVc2VySW5zdGFuY2UuZ2V0UmVzdWx0c0F0dHJpYnV0ZXNTdW1tYXJ5U2hvd24oKVxuICApXG4gIHVzZVJlcmVuZGVyT25CYWNrYm9uZVN5bmMoeyBsYXp5UmVzdWx0OiBzZWxlY3Rpb24gfSlcbiAgY29uc3QgeyBsaXN0ZW5UbyB9ID0gdXNlQmFja2JvbmUoKVxuICBjb25zdCB7IGlzSGlkZGVuQXR0cmlidXRlLCBnZXRNZXRhY2FyZERlZmluaXRpb24gfSA9IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMoKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxpc3RlblRvKFxuICAgICAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJyksXG4gICAgICAnY2hhbmdlOmluc3BlY3Rvci1zdW1tYXJ5U2hvd24gY2hhbmdlOmRhdGVUaW1lRm9ybWF0IGNoYW5nZTp0aW1lWm9uZSBjaGFuZ2U6aW5zcGVjdG9yLWhpZGVFbXB0eScsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHNldFN1bW1hcnlTaG93bihbXG4gICAgICAgICAgLi4uVHlwZWRVc2VySW5zdGFuY2UuZ2V0UmVzdWx0c0F0dHJpYnV0ZXNTdW1tYXJ5U2hvd24oKSxcbiAgICAgICAgXSlcbiAgICAgICAgc2V0Rm9yY2VSZW5kZXIodHJ1ZSlcbiAgICAgIH1cbiAgICApXG4gICAgbGlzdGVuVG8oXG4gICAgICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKSxcbiAgICAgICdjaGFuZ2U6ZGVjaW1hbFByZWNpc2lvbicsXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHNldERlY2ltYWxQcmVjaXNpb24oVHlwZWRVc2VySW5zdGFuY2UuZ2V0RGVjaW1hbFByZWNpc2lvbigpKVxuICAgICAgfVxuICAgIClcbiAgfSwgW10pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNlbGVjdGlvbikge1xuICAgICAgaWYgKGdldEhpZGRlbkF0dHJpYnV0ZXMoc2VsZWN0aW9uLCBzdW1tYXJ5U2hvd24pLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBzZXRGdWxseUV4cGFuZGVkKHRydWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRGdWxseUV4cGFuZGVkKGZhbHNlKVxuICAgICAgfVxuICAgIH1cbiAgfSwgW3N1bW1hcnlTaG93bl0pXG4gIGNvbnN0IGV2ZXJ5dGhpbmdFbHNlID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIHNlbGVjdGlvbiAmJiBleHBhbmRlZFxuICAgICAgPyBPYmplY3Qua2V5cyhzZWxlY3Rpb24ucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcylcbiAgICAgICAgICAuZmlsdGVyKChhdHRyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIWlzSGlkZGVuQXR0cmlidXRlKGF0dHIpXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmlsdGVyKChhdHRyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXN1bW1hcnlTaG93bi5pbmNsdWRlcyhhdHRyKVxuICAgICAgICAgIH0pXG4gICAgICA6IFtdXG4gIH0sIFtleHBhbmRlZCwgc3VtbWFyeVNob3duLCBpc0hpZGRlbkF0dHJpYnV0ZV0pXG4gIGNvbnN0IGJsYW5rRXZlcnl0aGluZ0Vsc2UgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gc2VsZWN0aW9uXG4gICAgICA/IE9iamVjdC52YWx1ZXMoZ2V0TWV0YWNhcmREZWZpbml0aW9uKHNlbGVjdGlvbi5wbGFpbi5tZXRhY2FyZFR5cGUpKVxuICAgICAgICAgIC5maWx0ZXIoKHZhbCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN1bW1hcnlTaG93bi5pbmNsdWRlcyh2YWwuaWQpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2ZXJ5dGhpbmdFbHNlLmluY2x1ZGVzKHZhbC5pZCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbHRlcigodmFsKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIWlzSGlkZGVuQXR0cmlidXRlKHZhbC5pZClcbiAgICAgICAgICB9KVxuICAgICAgOiBbXVxuICB9LCBbZXhwYW5kZWQsIHN1bW1hcnlTaG93biwgaXNIaWRkZW5BdHRyaWJ1dGVdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGdsb2JhbEV4cGFuZGVkID0gZXhwYW5kZWRcbiAgfSwgW2V4cGFuZGVkXSlcbiAgaWYgKCFzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gPGRpdj5ObyByZXN1bHQgc2VsZWN0ZWQ8L2Rpdj5cbiAgfVxuICBjb25zdCBoaWRlRW1wdHk6IGJvb2xlYW4gPSB1c2VyXG4gICAgLmdldCgndXNlcicpXG4gICAgLmdldCgncHJlZmVyZW5jZXMnKVxuICAgIC5nZXQoJ2luc3BlY3Rvci1oaWRlRW1wdHknKVxuICByZXR1cm4gKFxuICAgIDxHcmlkXG4gICAgICBjb250YWluZXJcbiAgICAgIGRpcmVjdGlvbj1cImNvbHVtblwiXG4gICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgIGNsYXNzTmFtZT1cIm92ZXJmbG93LWhpZGRlbiB3LWZ1bGwgaC1mdWxsXCJcbiAgICA+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInNocmluay0wXCI+XG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgY29udGFpbmVyXG4gICAgICAgICAgZGlyZWN0aW9uPVwicm93XCJcbiAgICAgICAgICBhbGlnbkl0ZW1zPVwiY2VudGVyXCJcbiAgICAgICAgICB3cmFwPVwibm93cmFwXCJcbiAgICAgICAgICBqdXN0aWZ5Q29udGVudD1cInNwYWNlLWJldHdlZW5cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cInAtMlwiXG4gICAgICAgID5cbiAgICAgICAgICA8R3JpZCBpdGVtPlxuICAgICAgICAgICAgPFN1bW1hcnlNYW5hZ2VBdHRyaWJ1dGVzIC8+XG4gICAgICAgICAgPC9HcmlkPlxuXG4gICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgZGF0YS1pZD1cInN1bW1hcnktZmlsdGVyLWlucHV0XCJcbiAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICAgICAgbGFiZWw9XCJGaWx0ZXJcIlxuICAgICAgICAgICAgICB2YWx1ZT17ZmlsdGVyfVxuICAgICAgICAgICAgICBpbnB1dFByb3BzPXt7XG4gICAgICAgICAgICAgICAgc3R5bGU6XG4gICAgICAgICAgICAgICAgICBmaWx0ZXIgIT09ICcnXG4gICAgICAgICAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiBgMXB4IHNvbGlkICR7dGhlbWUucGFsZXR0ZS53YXJuaW5nLm1haW59YCxcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIDoge30sXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgIHBlcnNpc3RhbnRGaWx0ZXIgPSBlLnRhcmdldC52YWx1ZVxuICAgICAgICAgICAgICAgIHNldEZpbHRlcihlLnRhcmdldC52YWx1ZSlcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICA8L0dyaWQ+XG4gICAgICA8RGFya0RpdmlkZXIgY2xhc3NOYW1lPVwidy1mdWxsIGgtbWluXCIgLz5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwic2hyaW5rLTEgb3ZlcmZsb3ctYXV0byBwLTJcIj5cbiAgICAgICAgPFBhcGVyIGVsZXZhdGlvbj17RWxldmF0aW9ucy5wYXBlcn0+XG4gICAgICAgICAge3N1bW1hcnlTaG93bi5tYXAoKGF0dHIsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlXCIga2V5PXthdHRyfT5cbiAgICAgICAgICAgICAgICA8QXR0cmlidXRlQ29tcG9uZW50XG4gICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0PXtzZWxlY3Rpb259XG4gICAgICAgICAgICAgICAgICBhdHRyPXthdHRyfVxuICAgICAgICAgICAgICAgICAgaGlkZUVtcHR5PXtoaWRlRW1wdHl9XG4gICAgICAgICAgICAgICAgICBzdW1tYXJ5U2hvd249e3N1bW1hcnlTaG93bn1cbiAgICAgICAgICAgICAgICAgIGRlY2ltYWxQcmVjaXNpb249e2RlY2ltYWxQcmVjaXNpb259XG4gICAgICAgICAgICAgICAgICBmaWx0ZXI9e2ZpbHRlcn1cbiAgICAgICAgICAgICAgICAgIGZvcmNlUmVuZGVyPXtmb3JjZVJlbmRlcn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHtpbmRleCAhPT0gMCA/IChcbiAgICAgICAgICAgICAgICAgIDxEaXZpZGVyXG4gICAgICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uPVwiaG9yaXpvbnRhbFwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC0wIHctZnVsbCBoLW1pblwiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cblxuICAgICAgICAgIHtleHBhbmRlZCA/IChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIHtldmVyeXRoaW5nRWxzZS5tYXAoKGF0dHIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2F0dHJ9IGNsYXNzTmFtZT1cInJlbGF0aXZlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBdHRyaWJ1dGVDb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0PXtzZWxlY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgYXR0cj17YXR0cn1cbiAgICAgICAgICAgICAgICAgICAgICBoaWRlRW1wdHk9e2hpZGVFbXB0eX1cbiAgICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5U2hvd249e3N1bW1hcnlTaG93bn1cbiAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFsUHJlY2lzaW9uPXtkZWNpbWFsUHJlY2lzaW9ufVxuICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcj17ZmlsdGVyfVxuICAgICAgICAgICAgICAgICAgICAgIGZvcmNlUmVuZGVyPXtmb3JjZVJlbmRlcn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPERpdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbj1cImhvcml6b250YWxcIlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC0wIHctZnVsbCBoLW1pblwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICB7YmxhbmtFdmVyeXRoaW5nRWxzZS5tYXAoKGF0dHIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2F0dHIuaWR9IGNsYXNzTmFtZT1cInJlbGF0aXZlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBdHRyaWJ1dGVDb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0PXtzZWxlY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgYXR0cj17YXR0ci5pZH1cbiAgICAgICAgICAgICAgICAgICAgICBoaWRlRW1wdHk9e2hpZGVFbXB0eX1cbiAgICAgICAgICAgICAgICAgICAgICBzdW1tYXJ5U2hvd249e3N1bW1hcnlTaG93bn1cbiAgICAgICAgICAgICAgICAgICAgICBkZWNpbWFsUHJlY2lzaW9uPXtkZWNpbWFsUHJlY2lzaW9ufVxuICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcj17ZmlsdGVyfVxuICAgICAgICAgICAgICAgICAgICAgIGZvcmNlUmVuZGVyPXtmb3JjZVJlbmRlcn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPERpdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbj1cImhvcml6b250YWxcIlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC0wIHctZnVsbCBoLW1pblwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDw+PC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9QYXBlcj5cbiAgICAgIDwvR3JpZD5cbiAgICAgIHsvKiBJZiBoaWRkZW4gYXR0cmlidXRlcyA9PT0gMCwgZG9uJ3Qgc2hvdyB0aGlzIGJ1dHRvbiAqL31cbiAgICAgIHshZnVsbHlFeHBhbmRlZCAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPERhcmtEaXZpZGVyIGNsYXNzTmFtZT1cInctZnVsbCBoLW1pblwiIC8+XG4gICAgICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJzaHJpbmstMCBwLTJcIj5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgZGF0YS1pZD1cInNlZS1hbGwtY29sbGFwc2UtYnV0dG9uXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldEV4cGFuZGVkKCFleHBhbmRlZClcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2V4cGFuZGVkID8gJ0NvbGxhcHNlJyA6ICdTZWUgYWxsJ31cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgPC8+XG4gICAgICApfVxuICAgIDwvR3JpZD5cbiAgKVxufVxuZXhwb3J0IGRlZmF1bHQgaG90KG1vZHVsZSkoU3VtbWFyeSlcbiJdfQ==