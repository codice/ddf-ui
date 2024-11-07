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
            React.createElement("div", { key: attr, className: "relative" },
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
                    "Add New Value")))),
        React.createElement(Divider, null),
        React.createElement(DialogActions, null,
            React.createElement(Button, { disabled: mode === Mode.Saving, variant: "text", onClick: function () {
                    onCancel();
                } }, "Cancel"),
            React.createElement(Button, { disabled: mode !== Mode.Normal, variant: "contained", color: "primary", onClick: function () {
                    if (errmsg.length != 0) {
                        addSnack('This attribute is required.', {
                            status: 'error',
                        });
                        return;
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdGFicy9tZXRhY2FyZC9zdW1tYXJ5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pELE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sUUFBUSxNQUFNLHdCQUF3QixDQUFBO0FBQzdDLE9BQU8sT0FBTyxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLDRCQUE0QixDQUFBO0FBQ25ELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDeEMsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxRQUFRLE1BQU0sc0JBQXNCLENBQUE7QUFDM0MsT0FBTyxjQUFjLE1BQU0sOEJBQThCLENBQUE7QUFDekQsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sV0FBVyxNQUFNLDZCQUE2QixDQUFBO0FBQ3JELE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUUvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkNBQTJDLENBQUE7QUFDdkUsT0FB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QUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FDM0IsQ0FDSixDQUNOLENBQ0osQ0FDSSxDQUNSLENBQUE7QUFDSCxDQUFDLENBQUE7QUFDRCxlQUFlLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFJlYWN0IGZyb20gJ3JlYWN0J1xuaW1wb3J0IHsgaG90IH0gZnJvbSAncmVhY3QtaG90LWxvYWRlcidcbmltcG9ydCBHcmlkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvR3JpZCdcbmltcG9ydCBUeXBvZ3JhcGh5IGZyb20gJ0BtdWkvbWF0ZXJpYWwvVHlwb2dyYXBoeSdcbmltcG9ydCBCdXR0b24gZnJvbSAnQG11aS9tYXRlcmlhbC9CdXR0b24nXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9zaW5nbGV0b25zL3VzZXItaW5zdGFuY2UnXG5pbXBvcnQgQXV0b2NvbXBsZXRlIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQXV0b2NvbXBsZXRlJ1xuaW1wb3J0IENoZWNrYm94IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQ2hlY2tib3gnXG5pbXBvcnQgRGl2aWRlciBmcm9tICdAbXVpL21hdGVyaWFsL0RpdmlkZXInXG5pbXBvcnQgRGVsZXRlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0RlbGV0ZSdcbmltcG9ydCBUZXh0RmllbGQgZnJvbSAnQG11aS9tYXRlcmlhbC9UZXh0RmllbGQnXG5pbXBvcnQgeyB1c2VEaWFsb2cgfSBmcm9tICcuLi8uLi9kaWFsb2cnXG5pbXBvcnQgRGlhbG9nQWN0aW9ucyBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0FjdGlvbnMnXG5pbXBvcnQgRGlhbG9nQ29udGVudCBmcm9tICdAbXVpL21hdGVyaWFsL0RpYWxvZ0NvbnRlbnQnXG5pbXBvcnQgdXNlU25hY2sgZnJvbSAnLi4vLi4vaG9va3MvdXNlU25hY2snXG5pbXBvcnQgTGluZWFyUHJvZ3Jlc3MgZnJvbSAnQG11aS9tYXRlcmlhbC9MaW5lYXJQcm9ncmVzcydcbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCBQdWJsaXNoSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL1B1Ymxpc2gnXG5pbXBvcnQgUGFwZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9QYXBlcidcbmltcG9ydCB7IHVzZVRoZW1lIH0gZnJvbSAnQG11aS9tYXRlcmlhbC9zdHlsZXMnXG5pbXBvcnQgeyBMYXp5UXVlcnlSZXN1bHQgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvTGF6eVF1ZXJ5UmVzdWx0J1xuaW1wb3J0IHsgdXNlQmFja2JvbmUgfSBmcm9tICcuLi8uLi9zZWxlY3Rpb24tY2hlY2tib3gvdXNlQmFja2JvbmUuaG9vaydcbmltcG9ydCB7IHVzZUN1c3RvbVJlYWRPbmx5Q2hlY2sgfSBmcm9tICcuL3RyYW5zZmVyLWxpc3QnXG5pbXBvcnQgS2V5Ym9hcmRCYWNrc3BhY2VJY29uIGZyb20gJ0BtdWkvaWNvbnMtbWF0ZXJpYWwvS2V5Ym9hcmRCYWNrc3BhY2UnXG5pbXBvcnQgQWRkSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0FkZCdcbmltcG9ydCBFZGl0SWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0VkaXQnXG5pbXBvcnQgQm94IGZyb20gJ0BtdWkvbWF0ZXJpYWwvQm94J1xuaW1wb3J0IHsgRWxldmF0aW9ucyB9IGZyb20gJy4uLy4uL3RoZW1lL3RoZW1lJ1xuaW1wb3J0IHsgRGFya0RpdmlkZXIgfSBmcm9tICcuLi8uLi9kYXJrLWRpdmlkZXIvZGFyay1kaXZpZGVyJ1xuaW1wb3J0IHsgZGlzcGxheUhpZ2hsaWdodGVkQXR0ckluRnVsbCB9IGZyb20gJy4vaGlnaGxpZ2h0VXRpbCdcbmltcG9ydCBEYXRlVGltZVBpY2tlciBmcm9tICcuLi8uLi9maWVsZHMvZGF0ZS10aW1lLXBpY2tlcidcbmltcG9ydCB7IHVzZVJlcmVuZGVyT25CYWNrYm9uZVN5bmMgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9MYXp5UXVlcnlSZXN1bHQvaG9va3MnXG5pbXBvcnQgdXNlQ29vcmRpbmF0ZUZvcm1hdCBmcm9tICcuL3VzZUNvb3JkaW5hdGVGb3JtYXQnXG5pbXBvcnQgeyBNZXRhY2FyZEF0dHJpYnV0ZSB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1R5cGVzJ1xuaW1wb3J0IEV4dGVuc2lvblBvaW50cyBmcm9tICcuLi8uLi8uLi9leHRlbnNpb24tcG9pbnRzJ1xuaW1wb3J0IExvY2F0aW9uSW5wdXRSZWFjdCBmcm9tICcuLi8uLi9sb2NhdGlvbi1uZXcvbG9jYXRpb24tbmV3LnZpZXcnXG5pbXBvcnQgeyBUeXBlZFVzZXJJbnN0YW5jZSB9IGZyb20gJy4uLy4uL3NpbmdsZXRvbnMvVHlwZWRVc2VyJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4uLy4uLy4uL2pzL21vZGVsL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCB7IHVzZU1ldGFjYXJkRGVmaW5pdGlvbnMgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL21ldGFjYXJkLWRlZmluaXRpb25zLmhvb2tzJ1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi8uLi8uLi9qcy9Db21tb24nXG5pbXBvcnQgU3VtbWFyeU1hbmFnZUF0dHJpYnV0ZXMgZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3N1bW1hcnktbWFuYWdlLWF0dHJpYnV0ZXMvc3VtbWFyeS1tYW5hZ2UtYXR0cmlidXRlcydcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50LXRpbWV6b25lJ1xuXG50eXBlIFByb3BzID0ge1xuICByZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxufVxuY29uc3QgVGh1bWJuYWlsSW5wdXQgPSAoe1xuICB2YWx1ZSxcbiAgb25DaGFuZ2UgPSAoKSA9PiB7fSxcbiAgZGlzYWJsZWQgPSBmYWxzZSxcbn06IHtcbiAgdmFsdWU6IHN0cmluZ1xuICBkaXNhYmxlZDogYm9vbGVhblxuICBvbkNoYW5nZT86ICh2YWw6IHN0cmluZykgPT4gdm9pZFxufSkgPT4ge1xuICBjb25zdCBmaWxlUmVmID0gUmVhY3QudXNlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KG51bGwpXG4gIGNvbnN0IGltZ1JlZiA9IFJlYWN0LnVzZVJlZjxIVE1MSW1hZ2VFbGVtZW50PihudWxsKVxuICByZXR1cm4gKFxuICAgIDxHcmlkXG4gICAgICBjb250YWluZXJcbiAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICBhbGlnbkl0ZW1zPVwic3RyZXRjaFwiXG4gICAgICBhbGlnbkNvbnRlbnQ9XCJzdHJldGNoXCJcbiAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgID5cbiAgICAgIDxHcmlkIGl0ZW0gc3R5bGU9e3sgb3ZlcmZsb3c6ICdoaWRkZW4nIH19PlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgcmVmPXtmaWxlUmVmfVxuICAgICAgICAgIHN0eWxlPXt7IGRpc3BsYXk6ICdub25lJyB9fVxuICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGltZ1JlZi5jdXJyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgICAgICAgICAgICBvbkNoYW5nZShldmVudC50YXJnZXQucmVzdWx0KVxuICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCd0aGVyZSBpcyBzb21ldGhpbmcgd3Jvbmcgd2l0aCBmaWxlIHR5cGUnKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWFkZXIub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignZXJyb3InKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1MzEpIEZJWE1FOiBPYmplY3QgaXMgcG9zc2libHkgJ251bGwnLlxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZS50YXJnZXQuZmlsZXNbMF0pXG4gICAgICAgICAgfX1cbiAgICAgICAgLz5cbiAgICAgICAgPGltZ1xuICAgICAgICAgIHNyYz17Q29tbW9uLmdldEltYWdlU3JjKHZhbHVlKX1cbiAgICAgICAgICByZWY9e2ltZ1JlZn1cbiAgICAgICAgICBzdHlsZT17eyBtYXhXaWR0aDogJzEwMCUnLCBtYXhIZWlnaHQ6ICc1MHZoJyB9fVxuICAgICAgICAvPlxuICAgICAgPC9HcmlkPlxuICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHN0eWxlPXt7IGhlaWdodDogJzEwMCUnIH19XG4gICAgICAgICAgdmFyaWFudD1cIm91dGxpbmVkXCJcbiAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBmaWxlUmVmLmN1cnJlbnQuY2xpY2soKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8UHVibGlzaEljb24gLz5cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0dyaWQ+XG4gICAgPC9HcmlkPlxuICApXG59XG5lbnVtIE1vZGUge1xuICBOb3JtYWwgPSAnbm9ybWFsJyxcbiAgU2F2aW5nID0gJ3NhdmluZycsXG4gIEJhZElucHV0ID0gJ2JhZC1pbnB1dCcsXG59XG5jb25zdCBoYW5kbGVNZXRhY2FyZFVwZGF0ZSA9ICh7XG4gIGxhenlSZXN1bHQsXG4gIGF0dHJpYnV0ZXMsXG4gIG9uU3VjY2VzcyxcbiAgb25GYWlsdXJlLFxufToge1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbiAgYXR0cmlidXRlczogTWV0YWNhcmRBdHRyaWJ1dGVbXVxuICBvblN1Y2Nlc3M6ICgpID0+IHZvaWRcbiAgb25GYWlsdXJlOiAoKSA9PiB2b2lkXG59KSA9PiB7XG4gIGNvbnN0IHBheWxvYWQgPSBbXG4gICAge1xuICAgICAgaWRzOiBbbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLmlkXSxcbiAgICAgIGF0dHJpYnV0ZXMsXG4gICAgfSxcbiAgXVxuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAkLmFqYXgoe1xuICAgICAgdXJsOiBgLi9pbnRlcm5hbC9tZXRhY2FyZHM/c3RvcmVJZD0ke2xhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1snc291cmNlLWlkJ119YCxcbiAgICAgIHR5cGU6ICdQQVRDSCcsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShwYXlsb2FkKSxcbiAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgfSkudGhlbihcbiAgICAgIChyZXNwb25zZTogYW55KSA9PiB7XG4gICAgICAgIGxhenlSZXN1bHQucmVmcmVzaEZyb21FZGl0UmVzcG9uc2UocmVzcG9uc2UpXG4gICAgICAgIG9uU3VjY2VzcygpXG4gICAgICB9LFxuICAgICAgKCkgPT4gb25GYWlsdXJlKClcbiAgICApXG4gIH0sIDEwMDApXG59XG5leHBvcnQgY29uc3QgRWRpdG9yID0gKHtcbiAgYXR0cixcbiAgbGF6eVJlc3VsdCxcbiAgb25DYW5jZWwgPSAoKSA9PiB7fSxcbiAgb25TYXZlID0gKCkgPT4ge30sXG4gIGdvQmFjayxcbn06IHtcbiAgYXR0cjogc3RyaW5nXG4gIGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxuICBvbkNhbmNlbD86ICgpID0+IHZvaWRcbiAgb25TYXZlPzogKCkgPT4gdm9pZFxuICBnb0JhY2s/OiAoKSA9PiB2b2lkXG59KSA9PiB7XG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IFJlYWN0LnVzZVN0YXRlKE1vZGUuTm9ybWFsKVxuICBjb25zdCBbdmFsdWVzLCBzZXRWYWx1ZXNdID0gUmVhY3QudXNlU3RhdGUoXG4gICAgQXJyYXkuaXNBcnJheShsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cl0pXG4gICAgICA/IGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyXS5zbGljZSgwKVxuICAgICAgOiBbbGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW2F0dHJdXVxuICApXG4gIGNvbnN0IFtkaXJ0eUluZGV4LCBzZXREaXJ0eUluZGV4XSA9IFJlYWN0LnVzZVN0YXRlKC0xKVxuICBjb25zdCB7IGdldEFsaWFzLCBpc011bHRpLCBnZXRUeXBlLCBnZXRFbnVtLCBnZXRSZXF1aXJlZCB9ID1cbiAgICB1c2VNZXRhY2FyZERlZmluaXRpb25zKClcbiAgY29uc3QgbGFiZWwgPSBnZXRBbGlhcyhhdHRyKVxuICBjb25zdCBpc011bHRpVmFsdWVkID0gaXNNdWx0aShhdHRyKVxuICBjb25zdCBhdHRyVHlwZSA9IGdldFR5cGUoYXR0cilcbiAgY29uc3QgZW51bUZvckF0dHIgPSBnZXRFbnVtKGF0dHIpXG4gIGNvbnN0IGFkZFNuYWNrID0gdXNlU25hY2soKVxuICBjb25zdCBpc1JlcXVpcmVkID0gZ2V0UmVxdWlyZWQobGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZFR5cGUsIGF0dHIpXG5cbiAgZnVuY3Rpb24gZ2V0RXJyb3JNZXNzYWdlKCkge1xuICAgIGlmIChpc1JlcXVpcmVkIHx8IGF0dHIgPT09ICd0aXRsZScpIHtcbiAgICAgIGNvbnN0IGludmFsaWRGaWVsZCA9ICF2YWx1ZXMgfHwgdmFsdWVzLmxlbmd0aCA8IDEgfHwgIXZhbHVlc1swXVxuICAgICAgcmV0dXJuIGludmFsaWRGaWVsZCA/IGxhYmVsICsgJyBpcyByZXF1aXJlZC4nIDogJydcbiAgICB9XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBjb25zdCBlcnJtc2cgPSBnZXRFcnJvck1lc3NhZ2UoKVxuXG4gIHJldHVybiAoXG4gICAgPD5cbiAgICAgIHtnb0JhY2sgJiYgKFxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgc3RhcnRJY29uPXs8S2V5Ym9hcmRCYWNrc3BhY2VJY29uIC8+fVxuICAgICAgICAgIG9uQ2xpY2s9e2dvQmFja31cbiAgICAgICAgPlxuICAgICAgICAgIENhbmNlbCBhbmQgcmV0dXJuIHRvIG1hbmFnZVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICl9XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtMnhsIHRleHQtY2VudGVyIHB4LTIgcGItMiBwdC00IGZvbnQtbm9ybWFsIHRydW5jYXRlXCI+XG4gICAgICAgIEVkaXRpbmcge2xhYmVsfSBvZiBcIntsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMudGl0bGV9XCJcbiAgICAgIDwvZGl2PlxuICAgICAgPERpdmlkZXIgLz5cbiAgICAgIDxEaWFsb2dDb250ZW50IHN0eWxlPXt7IG1pbkhlaWdodDogJzMwZW0nLCBtaW5XaWR0aDogJzYwdmgnIH19PlxuICAgICAgICA8ZGl2IGtleT17YXR0cn0gY2xhc3NOYW1lPVwicmVsYXRpdmVcIj5cbiAgICAgICAgICB7dmFsdWVzLm1hcCgodmFsOiBhbnksIGluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxHcmlkIGNvbnRhaW5lciBkaXJlY3Rpb249XCJyb3dcIiBjbGFzc05hbWU9XCJteS0yXCI+XG4gICAgICAgICAgICAgICAge2luZGV4ICE9PSAwID8gPERpdmlkZXIgc3R5bGU9e3sgbWFyZ2luOiAnNXB4IDBweCcgfX0gLz4gOiBudWxsfVxuICAgICAgICAgICAgICAgIDxHcmlkIGl0ZW0gbWQ9ezExfT5cbiAgICAgICAgICAgICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW51bUZvckF0dHIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8QXV0b2NvbXBsZXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlID09PSAnc2F2aW5nJ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhfZTogYW55LCBuZXdWYWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IG5ld1ZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXNdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZUNsZWFyYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zPXtlbnVtRm9yQXR0cn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVySW5wdXQ9eyhwYXJhbXMpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkIHsuLi5wYXJhbXN9IHZhcmlhbnQ9XCJvdXRsaW5lZFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGF0dHJUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8RGF0ZVRpbWVQaWNrZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXNdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVGV4dEZpZWxkUHJvcHM9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBtb2RlICE9PSBNb2RlLk5vcm1hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ6ICdvdXRsaW5lZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBCUERhdGVQcm9wcz17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ6IG1vZGUgIT09IE1vZGUuTm9ybWFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQklOQVJZJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxUaHVtYm5haWxJbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlICE9PSBNb2RlLk5vcm1hbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsodXBkYXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gdXBkYXRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlICdCT09MRUFOJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlICE9PSBNb2RlLk5vcm1hbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gZS50YXJnZXQuY2hlY2tlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXNdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlICdMT05HJzpcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlICdET1VCTEUnOlxuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0ZMT0FUJzpcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlICdJTlRFR0VSJzpcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlICdTSE9SVCc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e21vZGUgIT09IE1vZGUuTm9ybWFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gZS50YXJnZXQudmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bGxXaWR0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxMb2NhdGlvbklucHV0UmVhY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGxvY2F0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2NhdGlvbiA9PT0gbnVsbCB8fCBsb2NhdGlvbiA9PT0gJ0lOVkFMSUQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE1vZGUoTW9kZS5CYWRJbnB1dClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE1vZGUoTW9kZS5Ob3JtYWwpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gbG9jYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU3RhdGVEaXJ0eT17ZGlydHlJbmRleCA9PT0gaW5kZXh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzZXRJc1N0YXRlRGlydHk9eygpID0+IHNldERpcnR5SW5kZXgoLTEpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxUZXh0RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSAhPT0gTW9kZS5Ob3JtYWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IGUudGFyZ2V0LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aGl0ZVNwYWNlOiAncHJlLWxpbmUnLCBmbGV4R3JvdzogNTAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdWx0aWxpbmU9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4Um93cz17MTAwMH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcj17ZXJybXNnLmxlbmd0aCAhPSAwfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlbHBlclRleHQ9e2Vycm1zZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSkoKX1cbiAgICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgICAge2lzTXVsdGlWYWx1ZWQgPyAoXG4gICAgICAgICAgICAgICAgICA8R3JpZCBpdGVtIG1kPXsxfT5cbiAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlID09PSBNb2RlLlNhdmluZ31cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGlydHlJbmRleChpbmRleClcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgPERlbGV0ZUljb24gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KX1cbiAgICAgICAgICB7aXNNdWx0aVZhbHVlZCAmJiAoXG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlID09PSBNb2RlLlNhdmluZ31cbiAgICAgICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGRlZmF1bHRWYWx1ZSA9ICcnXG4gICAgICAgICAgICAgICAgc3dpdGNoIChhdHRyVHlwZSkge1xuICAgICAgICAgICAgICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZSA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlcywgZGVmYXVsdFZhbHVlXSlcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEJveCBjb2xvcj1cInRleHQucHJpbWFyeVwiPlxuICAgICAgICAgICAgICAgIDxBZGRJY29uIC8+XG4gICAgICAgICAgICAgIDwvQm94PlxuICAgICAgICAgICAgICBBZGQgTmV3IFZhbHVlXG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvRGlhbG9nQ29udGVudD5cbiAgICAgIDxEaXZpZGVyIC8+XG4gICAgICA8RGlhbG9nQWN0aW9ucz5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGRpc2FibGVkPXttb2RlID09PSBNb2RlLlNhdmluZ31cbiAgICAgICAgICB2YXJpYW50PVwidGV4dFwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgb25DYW5jZWwoKVxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICBDYW5jZWxcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBkaXNhYmxlZD17bW9kZSAhPT0gTW9kZS5Ob3JtYWx9XG4gICAgICAgICAgdmFyaWFudD1cImNvbnRhaW5lZFwiXG4gICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJybXNnLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgICAgIGFkZFNuYWNrKCdUaGlzIGF0dHJpYnV0ZSBpcyByZXF1aXJlZC4nLCB7XG4gICAgICAgICAgICAgICAgc3RhdHVzOiAnZXJyb3InLFxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0TW9kZShNb2RlLlNhdmluZylcbiAgICAgICAgICAgIGxldCB0cmFuc2Zvcm1lZFZhbHVlc1xuICAgICAgICAgICAgaWYgKGlzTXVsdGlWYWx1ZWQgJiYgdmFsdWVzICYmIHZhbHVlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgIHRyYW5zZm9ybWVkVmFsdWVzID0gdmFsdWVzLmZpbHRlcihcbiAgICAgICAgICAgICAgICAodmFsOiBhbnkpID0+IHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJydcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdHJhbnNmb3JtZWRWYWx1ZXMgPSB2YWx1ZXNcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgc3dpdGNoIChhdHRyVHlwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ0JJTkFSWSc6XG4gICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFZhbHVlcyA9IHRyYW5zZm9ybWVkVmFsdWVzLm1hcChcbiAgICAgICAgICAgICAgICAgICAgKHN1YnZhbDogYW55KSA9PiBzdWJ2YWwuc3BsaXQoJywnKVsxXVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlICdEQVRFJzpcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWVkVmFsdWVzID0gdHJhbnNmb3JtZWRWYWx1ZXMubWFwKChzdWJ2YWw6IGFueSkgPT5cbiAgICAgICAgICAgICAgICAgICAgbW9tZW50KHN1YnZhbCkudG9JU09TdHJpbmcoKVxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBjYXNlICdHRU9NRVRSWSc6XG4gICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFZhbHVlcyA9IHZhbHVlcy5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAgICh2YWw6IGFueSkgPT4gdmFsICE9IG51bGwgJiYgdmFsICE9PSAnJ1xuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlcyA9IFt7IGF0dHJpYnV0ZTogYXR0ciwgdmFsdWVzOiB0cmFuc2Zvcm1lZFZhbHVlcyB9XVxuICAgICAgICAgICAgY29uc3Qgb25TdWNjZXNzID0gKCkgPT5cbiAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgYWRkU25hY2soJ1N1Y2Nlc3NmdWxseSB1cGRhdGVkLicpXG4gICAgICAgICAgICAgICAgb25TYXZlKClcbiAgICAgICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgICAgIGNvbnN0IG9uRmFpbHVyZSA9ICgpID0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFkZFNuYWNrKCdGYWlsZWQgdG8gdXBkYXRlLicsIHsgc3RhdHVzOiAnZXJyb3InIH0pXG4gICAgICAgICAgICAgICAgb25TYXZlKClcbiAgICAgICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgICAgIGlmIChFeHRlbnNpb25Qb2ludHMuaGFuZGxlTWV0YWNhcmRVcGRhdGUpIHtcbiAgICAgICAgICAgICAgRXh0ZW5zaW9uUG9pbnRzLmhhbmRsZU1ldGFjYXJkVXBkYXRlKHtcbiAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXNUb1VwZGF0ZTogYXR0cmlidXRlcyxcbiAgICAgICAgICAgICAgfSkudGhlbihvblN1Y2Nlc3MsIG9uRmFpbHVyZSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGhhbmRsZU1ldGFjYXJkVXBkYXRlKHtcbiAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LFxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgICAgb25TdWNjZXNzLFxuICAgICAgICAgICAgICAgIG9uRmFpbHVyZSxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgU2F2ZVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvRGlhbG9nQWN0aW9ucz5cbiAgICAgIHttb2RlID09PSBNb2RlLlNhdmluZyA/IChcbiAgICAgICAgPExpbmVhclByb2dyZXNzXG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICBoZWlnaHQ6ICcxMHB4JyxcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgbGVmdDogJzBweCcsXG4gICAgICAgICAgICBib3R0b206ICcwJScsXG4gICAgICAgICAgfX1cbiAgICAgICAgICB2YXJpYW50PVwiaW5kZXRlcm1pbmF0ZVwiXG4gICAgICAgIC8+XG4gICAgICApIDogbnVsbH1cbiAgICA8Lz5cbiAgKVxufVxuY29uc3QgQXR0cmlidXRlQ29tcG9uZW50ID0gKHtcbiAgbGF6eVJlc3VsdCxcbiAgYXR0cixcbiAgaGlkZUVtcHR5LFxuICBzdW1tYXJ5U2hvd24gPSBbXSxcbiAgZGVjaW1hbFByZWNpc2lvbiA9IHVuZGVmaW5lZCxcbiAgZmlsdGVyID0gJycsXG4gIGZvcmNlUmVuZGVyLFxufToge1xuICBhdHRyOiBzdHJpbmdcbiAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gIGhpZGVFbXB0eTogYm9vbGVhblxuICBzdW1tYXJ5U2hvd24/OiBzdHJpbmdbXVxuICBkZWNpbWFsUHJlY2lzaW9uOiBudW1iZXIgfCB1bmRlZmluZWRcbiAgZmlsdGVyPzogc3RyaW5nXG4gIGZvcmNlUmVuZGVyOiBib29sZWFuXG59KSA9PiB7XG4gIGxldCB2YWx1ZSA9IGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyXVxuICBpZiAoaGlkZUVtcHR5KSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmICF2YWx1ZS50cmltKCkpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuICB9XG4gIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgdmFsdWUgPSBbXVxuICB9XG4gIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciAhPT0gQXJyYXkpIHtcbiAgICB2YWx1ZSA9IFt2YWx1ZV1cbiAgfVxuICBjb25zdCB7IGdldEFsaWFzLCBnZXRUeXBlIH0gPSB1c2VNZXRhY2FyZERlZmluaXRpb25zKClcbiAgbGV0IGxhYmVsID0gZ2V0QWxpYXMoYXR0cilcbiAgY29uc3QgeyBpc05vdFdyaXRhYmxlIH0gPSB1c2VDdXN0b21SZWFkT25seUNoZWNrKClcbiAgY29uc3QgZGlhbG9nQ29udGV4dCA9IHVzZURpYWxvZygpXG4gIGNvbnN0IGNvbnZlcnRUb0Zvcm1hdCA9IHVzZUNvb3JkaW5hdGVGb3JtYXQoKVxuICBjb25zdCBjb252ZXJ0VG9QcmVjaXNpb24gPSAodmFsdWU6IGFueSkgPT4ge1xuICAgIHJldHVybiB2YWx1ZSAmJiBkZWNpbWFsUHJlY2lzaW9uXG4gICAgICA/IE51bWJlcih2YWx1ZSkudG9GaXhlZChkZWNpbWFsUHJlY2lzaW9uKVxuICAgICAgOiB2YWx1ZVxuICB9XG4gIGNvbnN0IGlzVXJsID0gKHZhbHVlOiBhbnkpID0+IHtcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgcHJvdG9jb2wgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpLnNwbGl0KCcvJylbMF1cbiAgICAgIHJldHVybiBwcm90b2NvbCAmJiAocHJvdG9jb2wgPT09ICdodHRwOicgfHwgcHJvdG9jb2wgPT09ICdodHRwczonKVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBjb25zdCBpc0ZpbHRlcmVkID1cbiAgICBmaWx0ZXIgIT09ICcnID8gIWxhYmVsLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoZmlsdGVyLnRvTG93ZXJDYXNlKCkpIDogZmFsc2VcbiAgY29uc3Qgb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7XG4gICAgICBvcGVuOiBmYWxzZSxcbiAgICAgIGNoaWxkcmVuOiBudWxsLFxuICAgIH0pXG4gIH1cbiAgY29uc3Qgb25TYXZlID0gKCkgPT4ge1xuICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICBjaGlsZHJlbjogbnVsbCxcbiAgICB9KVxuICB9XG4gIGNvbnN0IEN1c3RvbUF0dHJpYnV0ZUVkaXRvciA9IEV4dGVuc2lvblBvaW50cy5hdHRyaWJ1dGVFZGl0b3IoXG4gICAgbGF6eVJlc3VsdCxcbiAgICBhdHRyXG4gIClcbiAgY29uc3QgTWVtb0l0ZW0gPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgPEdyaWRcbiAgICAgICAgY29udGFpbmVyXG4gICAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgIHdyYXA9eydub3dyYXAnfVxuICAgICAgICBjbGFzc05hbWU9XCJncm91cCByZWxhdGl2ZVwiXG4gICAgICA+XG4gICAgICAgIHtpc05vdFdyaXRhYmxlKHsgYXR0cmlidXRlOiBhdHRyLCBsYXp5UmVzdWx0IH0pID8gbnVsbCA6IChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMSBoaWRkZW4gZ3JvdXAtaG92ZXI6YmxvY2sgYWJzb2x1dGUgcmlnaHQtMCB0b3AtMFwiPlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgZGlhbG9nQ29udGV4dC5zZXRQcm9wcyh7XG4gICAgICAgICAgICAgICAgICBvcGVuOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgZGlzYWJsZUVuZm9yY2VGb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBDdXN0b21BdHRyaWJ1dGVFZGl0b3IgPyAoXG4gICAgICAgICAgICAgICAgICAgIDxDdXN0b21BdHRyaWJ1dGVFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICByZXN1bHQ9e2xhenlSZXN1bHR9XG4gICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlPXthdHRyfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXtvbkNhbmNlbH1cbiAgICAgICAgICAgICAgICAgICAgICBvblNhdmU9e29uU2F2ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgIDxFZGl0b3JcbiAgICAgICAgICAgICAgICAgICAgICBhdHRyPXthdHRyfVxuICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQ9e2xhenlSZXN1bHR9XG4gICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e29uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICAgIG9uU2F2ZT17b25TYXZlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8RWRpdEljb24gLz5cbiAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgaXRlbVxuICAgICAgICAgIHhzPXs0fVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3b3JkQnJlYWs6ICdicmVhay13b3JkJyxcbiAgICAgICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyxcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cInJlbGF0aXZlXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxUeXBvZ3JhcGh5PntsYWJlbH08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgPERpdmlkZXJcbiAgICAgICAgICAgIG9yaWVudGF0aW9uPVwidmVydGljYWxcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgcmlnaHQtMCB0b3AtMCB3LW1pbiBoLWZ1bGxcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgICAgPEdyaWRcbiAgICAgICAgICBpdGVtXG4gICAgICAgICAgbWQ9ezh9XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIHdvcmRCcmVhazogJ2JyZWFrLXdvcmQnLFxuICAgICAgICAgICAgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLFxuICAgICAgICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8R3JpZCBjb250YWluZXIgZGlyZWN0aW9uPVwicm93XCI+XG4gICAgICAgICAgICA8R3JpZCBkYXRhLWlkPXtgJHthdHRyfS12YWx1ZWB9IGl0ZW0+XG4gICAgICAgICAgICAgIHt2YWx1ZS5tYXAoKHZhbDogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudCBrZXk9e2luZGV4fT5cbiAgICAgICAgICAgICAgICAgICAge2luZGV4ICE9PSAwID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxEaXZpZGVyIHN0eWxlPXt7IG1hcmdpbjogJzVweCAwcHgnIH19IC8+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHIgPT09ICdleHQuYXVkaW8tc25pcHBldCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWltZXR5cGUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdleHQuYXVkaW8tc25pcHBldC1taW1ldHlwZSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNyYyA9IGBkYXRhOiR7bWltZXR5cGV9O2Jhc2U2NCwke3ZhbH1gXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YXVkaW8gY29udHJvbHMgc3JjPXtzcmN9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGdldFR5cGUoYXR0cikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtUeXBlZFVzZXJJbnN0YW5jZS5nZXRNb21lbnREYXRlKHZhbCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt1c2VyLmdldFVzZXJSZWFkYWJsZURhdGVUaW1lKHZhbCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdCSU5BUlknOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17Q29tbW9uLmdldEltYWdlU3JjKHZhbCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6ICcxMDAlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6ICc1MHZoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdCT09MRUFOJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+e3ZhbCA/ICd0cnVlJyA6ICdmYWxzZSd9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeT57Y29udmVydFRvRm9ybWF0KHZhbCl9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnTE9ORyc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RPVUJMRSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0ZMT0FUJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+e2NvbnZlcnRUb1ByZWNpc2lvbih2YWwpfTwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxhenlSZXN1bHQuaGlnaGxpZ2h0c1thdHRyXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHIgPT09ICd0aXRsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9TcGVjaWFsIGNhc2UsIHRpdGxlIGhpZ2hsaWdodHMgZG9uJ3QgZ2V0IHRydW5jYXRlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfX2h0bWw6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LmhpZ2hsaWdodHNbYXR0cl1bMF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmhpZ2hsaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpc1VybCh2YWwpID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaGlnaGxpZ2h0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e3ZhbH0gdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5SGlnaGxpZ2h0ZWRBdHRySW5GdWxsKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdC5oaWdobGlnaHRzW2F0dHJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzVXJsKHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9e3ZhbH0gdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPFR5cG9ncmFwaHk+e3ZhbH08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH0pKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgPC9HcmlkPlxuICAgICAgPC9HcmlkPlxuICAgIClcbiAgfSwgW3N1bW1hcnlTaG93biwgZm9yY2VSZW5kZXIsIGlzTm90V3JpdGFibGVdKVxuICByZXR1cm4gKFxuICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogaXNGaWx0ZXJlZCA/ICdub25lJyA6ICdibG9jaycgfX0+e01lbW9JdGVtfTwvZGl2PlxuICApXG59XG5sZXQgcGVyc2lzdGFudEZpbHRlciA9ICcnXG4vKiBIaWRkZW4gYXR0cmlidXRlcyBhcmUgc2ltcGx5IHRoZSBvcHBvc2l0ZSBvZiBhY3RpdmUgKi9cbi8qIFRoZXkgZG8gbm90IGN1cnJlbnRseSBleGlzdCBvbiB0aGUgbWV0YWNhcmQgT1IgYXJlIG5vdCBzaG93biBpbiB0aGUgc3VtbWFyeSAqL1xuY29uc3QgZ2V0SGlkZGVuQXR0cmlidXRlcyA9IChcbiAgc2VsZWN0aW9uOiBMYXp5UXVlcnlSZXN1bHQsXG4gIGFjdGl2ZUF0dHJpYnV0ZXM6IHN0cmluZ1tdXG4pID0+IHtcbiAgcmV0dXJuIE9iamVjdC52YWx1ZXMoXG4gICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldE1ldGFjYXJkRGVmaW5pdGlvbihcbiAgICAgIHNlbGVjdGlvbi5wbGFpbi5tZXRhY2FyZFR5cGVcbiAgICApXG4gIClcbiAgICAuZmlsdGVyKCh2YWwpID0+IHtcbiAgICAgIGlmIChhY3RpdmVBdHRyaWJ1dGVzLmluY2x1ZGVzKHZhbC5pZCkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0pXG4gICAgLmZpbHRlcigodmFsKSA9PiB7XG4gICAgICByZXR1cm4gIVN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5pc0hpZGRlbkF0dHJpYnV0ZSh2YWwuaWQpXG4gICAgfSlcbn1cbmxldCBnbG9iYWxFeHBhbmRlZCA9IGZhbHNlIC8vIGdsb2JhbGx5IHRyYWNrIGlmIHVzZXJzIHdhbnQgdGhpcyBzaW5jZSB0aGV5IG1heSBiZSBjbGlja2luZyBiZXR3ZWVuIHJlc3VsdHNcbmNvbnN0IFN1bW1hcnkgPSAoeyByZXN1bHQ6IHNlbGVjdGlvbiB9OiBQcm9wcykgPT4ge1xuICBjb25zdCB0aGVtZSA9IHVzZVRoZW1lKClcbiAgY29uc3QgW2ZvcmNlUmVuZGVyLCBzZXRGb3JjZVJlbmRlcl0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2V4cGFuZGVkLCBzZXRFeHBhbmRlZF0gPSBSZWFjdC51c2VTdGF0ZShnbG9iYWxFeHBhbmRlZClcbiAgLyogU3BlY2lhbCBjYXNlIGZvciB3aGVuIGFsbCB0aGUgYXR0cmlidXRlcyBhcmUgZGlzcGxheWVkICovXG4gIGNvbnN0IFtmdWxseUV4cGFuZGVkLCBzZXRGdWxseUV4cGFuZGVkXSA9IFJlYWN0LnVzZVN0YXRlKGZhbHNlKVxuICBjb25zdCBbZmlsdGVyLCBzZXRGaWx0ZXJdID0gUmVhY3QudXNlU3RhdGUocGVyc2lzdGFudEZpbHRlcilcbiAgY29uc3QgW2RlY2ltYWxQcmVjaXNpb24sIHNldERlY2ltYWxQcmVjaXNpb25dID0gUmVhY3QudXNlU3RhdGUoXG4gICAgVHlwZWRVc2VySW5zdGFuY2UuZ2V0RGVjaW1hbFByZWNpc2lvbigpXG4gIClcbiAgY29uc3QgW3N1bW1hcnlTaG93biwgc2V0U3VtbWFyeVNob3duXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIFR5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzU3VtbWFyeVNob3duKClcbiAgKVxuICB1c2VSZXJlbmRlck9uQmFja2JvbmVTeW5jKHsgbGF6eVJlc3VsdDogc2VsZWN0aW9uIH0pXG4gIGNvbnN0IHsgbGlzdGVuVG8gfSA9IHVzZUJhY2tib25lKClcbiAgY29uc3QgeyBpc0hpZGRlbkF0dHJpYnV0ZSwgZ2V0TWV0YWNhcmREZWZpbml0aW9uIH0gPSB1c2VNZXRhY2FyZERlZmluaXRpb25zKClcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBsaXN0ZW5UbyhcbiAgICAgIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLFxuICAgICAgJ2NoYW5nZTppbnNwZWN0b3Itc3VtbWFyeVNob3duIGNoYW5nZTpkYXRlVGltZUZvcm1hdCBjaGFuZ2U6dGltZVpvbmUgY2hhbmdlOmluc3BlY3Rvci1oaWRlRW1wdHknLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBzZXRTdW1tYXJ5U2hvd24oW1xuICAgICAgICAgIC4uLlR5cGVkVXNlckluc3RhbmNlLmdldFJlc3VsdHNBdHRyaWJ1dGVzU3VtbWFyeVNob3duKCksXG4gICAgICAgIF0pXG4gICAgICAgIHNldEZvcmNlUmVuZGVyKHRydWUpXG4gICAgICB9XG4gICAgKVxuICAgIGxpc3RlblRvKFxuICAgICAgdXNlci5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJyksXG4gICAgICAnY2hhbmdlOmRlY2ltYWxQcmVjaXNpb24nLFxuICAgICAgKCkgPT4ge1xuICAgICAgICBzZXREZWNpbWFsUHJlY2lzaW9uKFR5cGVkVXNlckluc3RhbmNlLmdldERlY2ltYWxQcmVjaXNpb24oKSlcbiAgICAgIH1cbiAgICApXG4gIH0sIFtdKVxuICBSZWFjdC51c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChzZWxlY3Rpb24pIHtcbiAgICAgIGlmIChnZXRIaWRkZW5BdHRyaWJ1dGVzKHNlbGVjdGlvbiwgc3VtbWFyeVNob3duKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgc2V0RnVsbHlFeHBhbmRlZCh0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0RnVsbHlFeHBhbmRlZChmYWxzZSlcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtzdW1tYXJ5U2hvd25dKVxuICBjb25zdCBldmVyeXRoaW5nRWxzZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBzZWxlY3Rpb24gJiYgZXhwYW5kZWRcbiAgICAgID8gT2JqZWN0LmtleXMoc2VsZWN0aW9uLnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXMpXG4gICAgICAgICAgLmZpbHRlcigoYXR0cikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICFpc0hpZGRlbkF0dHJpYnV0ZShhdHRyKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbHRlcigoYXR0cikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICFzdW1tYXJ5U2hvd24uaW5jbHVkZXMoYXR0cilcbiAgICAgICAgICB9KVxuICAgICAgOiBbXVxuICB9LCBbZXhwYW5kZWQsIHN1bW1hcnlTaG93biwgaXNIaWRkZW5BdHRyaWJ1dGVdKVxuICBjb25zdCBibGFua0V2ZXJ5dGhpbmdFbHNlID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIHNlbGVjdGlvblxuICAgICAgPyBPYmplY3QudmFsdWVzKGdldE1ldGFjYXJkRGVmaW5pdGlvbihzZWxlY3Rpb24ucGxhaW4ubWV0YWNhcmRUeXBlKSlcbiAgICAgICAgICAuZmlsdGVyKCh2YWwpID0+IHtcbiAgICAgICAgICAgIGlmIChzdW1tYXJ5U2hvd24uaW5jbHVkZXModmFsLmlkKSkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChldmVyeXRoaW5nRWxzZS5pbmNsdWRlcyh2YWwuaWQpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maWx0ZXIoKHZhbCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICFpc0hpZGRlbkF0dHJpYnV0ZSh2YWwuaWQpXG4gICAgICAgICAgfSlcbiAgICAgIDogW11cbiAgfSwgW2V4cGFuZGVkLCBzdW1tYXJ5U2hvd24sIGlzSGlkZGVuQXR0cmlidXRlXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBnbG9iYWxFeHBhbmRlZCA9IGV4cGFuZGVkXG4gIH0sIFtleHBhbmRlZF0pXG4gIGlmICghc2VsZWN0aW9uKSB7XG4gICAgcmV0dXJuIDxkaXY+Tm8gcmVzdWx0IHNlbGVjdGVkPC9kaXY+XG4gIH1cbiAgY29uc3QgaGlkZUVtcHR5OiBib29sZWFuID0gdXNlclxuICAgIC5nZXQoJ3VzZXInKVxuICAgIC5nZXQoJ3ByZWZlcmVuY2VzJylcbiAgICAuZ2V0KCdpbnNwZWN0b3ItaGlkZUVtcHR5JylcbiAgcmV0dXJuIChcbiAgICA8R3JpZFxuICAgICAgY29udGFpbmVyXG4gICAgICBkaXJlY3Rpb249XCJjb2x1bW5cIlxuICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICBjbGFzc05hbWU9XCJvdmVyZmxvdy1oaWRkZW4gdy1mdWxsIGgtZnVsbFwiXG4gICAgPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJzaHJpbmstMFwiPlxuICAgICAgICA8R3JpZFxuICAgICAgICAgIGNvbnRhaW5lclxuICAgICAgICAgIGRpcmVjdGlvbj1cInJvd1wiXG4gICAgICAgICAgYWxpZ25JdGVtcz1cImNlbnRlclwiXG4gICAgICAgICAgd3JhcD1cIm5vd3JhcFwiXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ9XCJzcGFjZS1iZXR3ZWVuXCJcbiAgICAgICAgICBjbGFzc05hbWU9XCJwLTJcIlxuICAgICAgICA+XG4gICAgICAgICAgPEdyaWQgaXRlbT5cbiAgICAgICAgICAgIDxTdW1tYXJ5TWFuYWdlQXR0cmlidXRlcyAvPlxuICAgICAgICAgIDwvR3JpZD5cblxuICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgIGRhdGEtaWQ9XCJzdW1tYXJ5LWZpbHRlci1pbnB1dFwiXG4gICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgICAgIGxhYmVsPVwiRmlsdGVyXCJcbiAgICAgICAgICAgICAgdmFsdWU9e2ZpbHRlcn1cbiAgICAgICAgICAgICAgaW5wdXRQcm9wcz17e1xuICAgICAgICAgICAgICAgIHN0eWxlOlxuICAgICAgICAgICAgICAgICAgZmlsdGVyICE9PSAnJ1xuICAgICAgICAgICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogYDFweCBzb2xpZCAke3RoZW1lLnBhbGV0dGUud2FybmluZy5tYWlufWAsXG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA6IHt9LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgICBwZXJzaXN0YW50RmlsdGVyID0gZS50YXJnZXQudmFsdWVcbiAgICAgICAgICAgICAgICBzZXRGaWx0ZXIoZS50YXJnZXQudmFsdWUpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgPC9HcmlkPlxuICAgICAgPC9HcmlkPlxuICAgICAgPERhcmtEaXZpZGVyIGNsYXNzTmFtZT1cInctZnVsbCBoLW1pblwiIC8+XG4gICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInNocmluay0xIG92ZXJmbG93LWF1dG8gcC0yXCI+XG4gICAgICAgIDxQYXBlciBlbGV2YXRpb249e0VsZXZhdGlvbnMucGFwZXJ9PlxuICAgICAgICAgIHtzdW1tYXJ5U2hvd24ubWFwKChhdHRyLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiIGtleT17YXR0cn0+XG4gICAgICAgICAgICAgICAgPEF0dHJpYnV0ZUNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17c2VsZWN0aW9ufVxuICAgICAgICAgICAgICAgICAgYXR0cj17YXR0cn1cbiAgICAgICAgICAgICAgICAgIGhpZGVFbXB0eT17aGlkZUVtcHR5fVxuICAgICAgICAgICAgICAgICAgc3VtbWFyeVNob3duPXtzdW1tYXJ5U2hvd259XG4gICAgICAgICAgICAgICAgICBkZWNpbWFsUHJlY2lzaW9uPXtkZWNpbWFsUHJlY2lzaW9ufVxuICAgICAgICAgICAgICAgICAgZmlsdGVyPXtmaWx0ZXJ9XG4gICAgICAgICAgICAgICAgICBmb3JjZVJlbmRlcj17Zm9yY2VSZW5kZXJ9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7aW5kZXggIT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8RGl2aWRlclxuICAgICAgICAgICAgICAgICAgICBvcmllbnRhdGlvbj1cImhvcml6b250YWxcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCB3LWZ1bGwgaC1taW5cIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG5cbiAgICAgICAgICB7ZXhwYW5kZWQgPyAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICB7ZXZlcnl0aGluZ0Vsc2UubWFwKChhdHRyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXthdHRyfSBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8QXR0cmlidXRlQ29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17c2VsZWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIGF0dHI9e2F0dHJ9XG4gICAgICAgICAgICAgICAgICAgICAgaGlkZUVtcHR5PXtoaWRlRW1wdHl9XG4gICAgICAgICAgICAgICAgICAgICAgc3VtbWFyeVNob3duPXtzdW1tYXJ5U2hvd259XG4gICAgICAgICAgICAgICAgICAgICAgZGVjaW1hbFByZWNpc2lvbj17ZGVjaW1hbFByZWNpc2lvbn1cbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXI9e2ZpbHRlcn1cbiAgICAgICAgICAgICAgICAgICAgICBmb3JjZVJlbmRlcj17Zm9yY2VSZW5kZXJ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxEaXZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb249XCJob3Jpem9udGFsXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCB3LWZ1bGwgaC1taW5cIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAge2JsYW5rRXZlcnl0aGluZ0Vsc2UubWFwKChhdHRyKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXthdHRyLmlkfSBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8QXR0cmlidXRlQ29tcG9uZW50XG4gICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdD17c2VsZWN0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgIGF0dHI9e2F0dHIuaWR9XG4gICAgICAgICAgICAgICAgICAgICAgaGlkZUVtcHR5PXtoaWRlRW1wdHl9XG4gICAgICAgICAgICAgICAgICAgICAgc3VtbWFyeVNob3duPXtzdW1tYXJ5U2hvd259XG4gICAgICAgICAgICAgICAgICAgICAgZGVjaW1hbFByZWNpc2lvbj17ZGVjaW1hbFByZWNpc2lvbn1cbiAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXI9e2ZpbHRlcn1cbiAgICAgICAgICAgICAgICAgICAgICBmb3JjZVJlbmRlcj17Zm9yY2VSZW5kZXJ9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxEaXZpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb249XCJob3Jpem9udGFsXCJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCB3LWZ1bGwgaC1taW5cIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PjwvPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvUGFwZXI+XG4gICAgICA8L0dyaWQ+XG4gICAgICB7LyogSWYgaGlkZGVuIGF0dHJpYnV0ZXMgPT09IDAsIGRvbid0IHNob3cgdGhpcyBidXR0b24gKi99XG4gICAgICB7IWZ1bGx5RXhwYW5kZWQgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIDxEYXJrRGl2aWRlciBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1taW5cIiAvPlxuICAgICAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwic2hyaW5rLTAgcC0yXCI+XG4gICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgIGRhdGEtaWQ9XCJzZWUtYWxsLWNvbGxhcHNlLWJ1dHRvblwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRFeHBhbmRlZCghZXhwYW5kZWQpXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHNpemU9XCJzbWFsbFwiXG4gICAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtleHBhbmRlZCA/ICdDb2xsYXBzZScgOiAnU2VlIGFsbCd9XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDwvPlxuICAgICAgKX1cbiAgICA8L0dyaWQ+XG4gIClcbn1cbmV4cG9ydCBkZWZhdWx0IGhvdChtb2R1bGUpKFN1bW1hcnkpXG4iXX0=