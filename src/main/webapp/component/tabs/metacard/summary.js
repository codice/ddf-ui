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
    if (!Array.isArray(value)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3VtbWFyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdGFicy9tZXRhY2FyZC9zdW1tYXJ5LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGtCQUFrQixDQUFBO0FBQ3RDLE9BQU8sSUFBSSxNQUFNLG9CQUFvQixDQUFBO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLDBCQUEwQixDQUFBO0FBQ2pELE9BQU8sTUFBTSxNQUFNLHNCQUFzQixDQUFBO0FBQ3pDLE9BQU8sSUFBSSxNQUFNLGdDQUFnQyxDQUFBO0FBQ2pELE9BQU8sWUFBWSxNQUFNLDRCQUE0QixDQUFBO0FBQ3JELE9BQU8sUUFBUSxNQUFNLHdCQUF3QixDQUFBO0FBQzdDLE9BQU8sT0FBTyxNQUFNLHVCQUF1QixDQUFBO0FBQzNDLE9BQU8sVUFBVSxNQUFNLDRCQUE0QixDQUFBO0FBQ25ELE9BQU8sU0FBUyxNQUFNLHlCQUF5QixDQUFBO0FBQy9DLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFDeEMsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxhQUFhLE1BQU0sNkJBQTZCLENBQUE7QUFDdkQsT0FBTyxRQUFRLE1BQU0sc0JBQXNCLENBQUE7QUFDM0MsT0FBTyxjQUFjLE1BQU0sOEJBQThCLENBQUE7QUFDekQsT0FBTyxDQUFDLE1BQU0sUUFBUSxDQUFBO0FBQ3RCLE9BQU8sV0FBVyxNQUFNLDZCQUE2QixDQUFBO0FBQ3JELE9BQU8sS0FBSyxNQUFNLHFCQUFxQixDQUFBO0FBQ3ZDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUUvQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkNBQTJDLENBQUE7QUFDdkUsT0FB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QVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQzNCLENBQ0osQ0FDTixDQUNKLENBQ0ksQ0FDUixDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBQ0QsZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCdcbmltcG9ydCB7IGhvdCB9IGZyb20gJ3JlYWN0LWhvdC1sb2FkZXInXG5pbXBvcnQgR3JpZCBmcm9tICdAbXVpL21hdGVyaWFsL0dyaWQnXG5pbXBvcnQgVHlwb2dyYXBoeSBmcm9tICdAbXVpL21hdGVyaWFsL1R5cG9ncmFwaHknXG5pbXBvcnQgQnV0dG9uIGZyb20gJ0BtdWkvbWF0ZXJpYWwvQnV0dG9uJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IEF1dG9jb21wbGV0ZSBmcm9tICdAbXVpL21hdGVyaWFsL0F1dG9jb21wbGV0ZSdcbmltcG9ydCBDaGVja2JveCBmcm9tICdAbXVpL21hdGVyaWFsL0NoZWNrYm94J1xuaW1wb3J0IERpdmlkZXIgZnJvbSAnQG11aS9tYXRlcmlhbC9EaXZpZGVyJ1xuaW1wb3J0IERlbGV0ZUljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9EZWxldGUnXG5pbXBvcnQgVGV4dEZpZWxkIGZyb20gJ0BtdWkvbWF0ZXJpYWwvVGV4dEZpZWxkJ1xuaW1wb3J0IHsgdXNlRGlhbG9nIH0gZnJvbSAnLi4vLi4vZGlhbG9nJ1xuaW1wb3J0IERpYWxvZ0FjdGlvbnMgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dBY3Rpb25zJ1xuaW1wb3J0IERpYWxvZ0NvbnRlbnQgZnJvbSAnQG11aS9tYXRlcmlhbC9EaWFsb2dDb250ZW50J1xuaW1wb3J0IHVzZVNuYWNrIGZyb20gJy4uLy4uL2hvb2tzL3VzZVNuYWNrJ1xuaW1wb3J0IExpbmVhclByb2dyZXNzIGZyb20gJ0BtdWkvbWF0ZXJpYWwvTGluZWFyUHJvZ3Jlc3MnXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknXG5pbXBvcnQgUHVibGlzaEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9QdWJsaXNoJ1xuaW1wb3J0IFBhcGVyIGZyb20gJ0BtdWkvbWF0ZXJpYWwvUGFwZXInXG5pbXBvcnQgeyB1c2VUaGVtZSB9IGZyb20gJ0BtdWkvbWF0ZXJpYWwvc3R5bGVzJ1xuaW1wb3J0IHsgTGF6eVF1ZXJ5UmVzdWx0IH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L0xhenlRdWVyeVJlc3VsdCdcbmltcG9ydCB7IHVzZUJhY2tib25lIH0gZnJvbSAnLi4vLi4vc2VsZWN0aW9uLWNoZWNrYm94L3VzZUJhY2tib25lLmhvb2snXG5pbXBvcnQgeyB1c2VDdXN0b21SZWFkT25seUNoZWNrIH0gZnJvbSAnLi90cmFuc2Zlci1saXN0J1xuaW1wb3J0IEtleWJvYXJkQmFja3NwYWNlSWNvbiBmcm9tICdAbXVpL2ljb25zLW1hdGVyaWFsL0tleWJvYXJkQmFja3NwYWNlJ1xuaW1wb3J0IEFkZEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9BZGQnXG5pbXBvcnQgRWRpdEljb24gZnJvbSAnQG11aS9pY29ucy1tYXRlcmlhbC9FZGl0J1xuaW1wb3J0IEJveCBmcm9tICdAbXVpL21hdGVyaWFsL0JveCdcbmltcG9ydCB7IEVsZXZhdGlvbnMgfSBmcm9tICcuLi8uLi90aGVtZS90aGVtZSdcbmltcG9ydCB7IERhcmtEaXZpZGVyIH0gZnJvbSAnLi4vLi4vZGFyay1kaXZpZGVyL2RhcmstZGl2aWRlcidcbmltcG9ydCB7IGRpc3BsYXlIaWdobGlnaHRlZEF0dHJJbkZ1bGwgfSBmcm9tICcuL2hpZ2hsaWdodFV0aWwnXG5pbXBvcnQgRGF0ZVRpbWVQaWNrZXIgZnJvbSAnLi4vLi4vZmllbGRzL2RhdGUtdGltZS1waWNrZXInXG5pbXBvcnQgeyB1c2VSZXJlbmRlck9uQmFja2JvbmVTeW5jIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvTGF6eVF1ZXJ5UmVzdWx0L2hvb2tzJ1xuaW1wb3J0IHVzZUNvb3JkaW5hdGVGb3JtYXQgZnJvbSAnLi91c2VDb29yZGluYXRlRm9ybWF0J1xuaW1wb3J0IHsgTWV0YWNhcmRBdHRyaWJ1dGUgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9UeXBlcydcbmltcG9ydCBFeHRlbnNpb25Qb2ludHMgZnJvbSAnLi4vLi4vLi4vZXh0ZW5zaW9uLXBvaW50cydcbmltcG9ydCBMb2NhdGlvbklucHV0UmVhY3QgZnJvbSAnLi4vLi4vbG9jYXRpb24tbmV3L2xvY2F0aW9uLW5ldy52aWV3J1xuaW1wb3J0IHsgVHlwZWRVc2VySW5zdGFuY2UgfSBmcm9tICcuLi8uLi9zaW5nbGV0b25zL1R5cGVkVXNlcidcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5pbXBvcnQgeyB1c2VNZXRhY2FyZERlZmluaXRpb25zIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9tZXRhY2FyZC1kZWZpbml0aW9ucy5ob29rcydcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vLi4vLi4vanMvQ29tbW9uJ1xuaW1wb3J0IFN1bW1hcnlNYW5hZ2VBdHRyaWJ1dGVzIGZyb20gJy4uLy4uLy4uL3JlYWN0LWNvbXBvbmVudC9zdW1tYXJ5LW1hbmFnZS1hdHRyaWJ1dGVzL3N1bW1hcnktbWFuYWdlLWF0dHJpYnV0ZXMnXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudC10aW1lem9uZSdcblxudHlwZSBQcm9wcyA9IHtcbiAgcmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbn1cbmNvbnN0IFRodW1ibmFpbElucHV0ID0gKHtcbiAgdmFsdWUsXG4gIG9uQ2hhbmdlID0gKCkgPT4ge30sXG4gIGRpc2FibGVkID0gZmFsc2UsXG59OiB7XG4gIHZhbHVlOiBzdHJpbmdcbiAgZGlzYWJsZWQ6IGJvb2xlYW5cbiAgb25DaGFuZ2U/OiAodmFsOiBzdHJpbmcpID0+IHZvaWRcbn0pID0+IHtcbiAgY29uc3QgZmlsZVJlZiA9IFJlYWN0LnVzZVJlZjxIVE1MSW5wdXRFbGVtZW50PihudWxsKVxuICBjb25zdCBpbWdSZWYgPSBSZWFjdC51c2VSZWY8SFRNTEltYWdlRWxlbWVudD4obnVsbClcbiAgcmV0dXJuIChcbiAgICA8R3JpZFxuICAgICAgY29udGFpbmVyXG4gICAgICBkaXJlY3Rpb249XCJyb3dcIlxuICAgICAgYWxpZ25JdGVtcz1cInN0cmV0Y2hcIlxuICAgICAgYWxpZ25Db250ZW50PVwic3RyZXRjaFwiXG4gICAgICB3cmFwPVwibm93cmFwXCJcbiAgICA+XG4gICAgICA8R3JpZCBpdGVtIHN0eWxlPXt7IG92ZXJmbG93OiAnaGlkZGVuJyB9fT5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgIHJlZj17ZmlsZVJlZn1cbiAgICAgICAgICBzdHlsZT17eyBkaXNwbGF5OiAnbm9uZScgfX1cbiAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgIGlmIChpbWdSZWYuY3VycmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjUzMSkgRklYTUU6IE9iamVjdCBpcyBwb3NzaWJseSAnbnVsbCcuXG4gICAgICAgICAgICAgICAgb25DaGFuZ2UoZXZlbnQudGFyZ2V0LnJlc3VsdClcbiAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigndGhlcmUgaXMgc29tZXRoaW5nIHdyb25nIHdpdGggZmlsZSB0eXBlJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2Vycm9yJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyNTMxKSBGSVhNRTogT2JqZWN0IGlzIHBvc3NpYmx5ICdudWxsJy5cbiAgICAgICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGUudGFyZ2V0LmZpbGVzWzBdKVxuICAgICAgICAgIH19XG4gICAgICAgIC8+XG4gICAgICAgIDxpbWdcbiAgICAgICAgICBzcmM9e0NvbW1vbi5nZXRJbWFnZVNyYyh2YWx1ZSl9XG4gICAgICAgICAgcmVmPXtpbWdSZWZ9XG4gICAgICAgICAgc3R5bGU9e3sgbWF4V2lkdGg6ICcxMDAlJywgbWF4SGVpZ2h0OiAnNTB2aCcgfX1cbiAgICAgICAgLz5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBzdHlsZT17eyBoZWlnaHQ6ICcxMDAlJyB9fVxuICAgICAgICAgIHZhcmlhbnQ9XCJvdXRsaW5lZFwiXG4gICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIGlmIChmaWxlUmVmLmN1cnJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgZmlsZVJlZi5jdXJyZW50LmNsaWNrKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPFB1Ymxpc2hJY29uIC8+XG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgPC9HcmlkPlxuICAgIDwvR3JpZD5cbiAgKVxufVxuZW51bSBNb2RlIHtcbiAgTm9ybWFsID0gJ25vcm1hbCcsXG4gIFNhdmluZyA9ICdzYXZpbmcnLFxuICBCYWRJbnB1dCA9ICdiYWQtaW5wdXQnLFxufVxuY29uc3QgaGFuZGxlTWV0YWNhcmRVcGRhdGUgPSAoe1xuICBsYXp5UmVzdWx0LFxuICBhdHRyaWJ1dGVzLFxuICBvblN1Y2Nlc3MsXG4gIG9uRmFpbHVyZSxcbn06IHtcbiAgbGF6eVJlc3VsdDogTGF6eVF1ZXJ5UmVzdWx0XG4gIGF0dHJpYnV0ZXM6IE1ldGFjYXJkQXR0cmlidXRlW11cbiAgb25TdWNjZXNzOiAoKSA9PiB2b2lkXG4gIG9uRmFpbHVyZTogKCkgPT4gdm9pZFxufSkgPT4ge1xuICBjb25zdCBwYXlsb2FkID0gW1xuICAgIHtcbiAgICAgIGlkczogW2xhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllcy5pZF0sXG4gICAgICBhdHRyaWJ1dGVzLFxuICAgIH0sXG4gIF1cbiAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgIHVybDogYC4vaW50ZXJuYWwvbWV0YWNhcmRzP3N0b3JlSWQ9JHtsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbJ3NvdXJjZS1pZCddfWAsXG4gICAgICB0eXBlOiAnUEFUQ0gnLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkocGF5bG9hZCksXG4gICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pLnRoZW4oXG4gICAgICAocmVzcG9uc2U6IGFueSkgPT4ge1xuICAgICAgICBsYXp5UmVzdWx0LnJlZnJlc2hGcm9tRWRpdFJlc3BvbnNlKHJlc3BvbnNlKVxuICAgICAgICBvblN1Y2Nlc3MoKVxuICAgICAgfSxcbiAgICAgICgpID0+IG9uRmFpbHVyZSgpXG4gICAgKVxuICB9LCAxMDAwKVxufVxuZXhwb3J0IGNvbnN0IEVkaXRvciA9ICh7XG4gIGF0dHIsXG4gIGxhenlSZXN1bHQsXG4gIG9uQ2FuY2VsID0gKCkgPT4ge30sXG4gIG9uU2F2ZSA9ICgpID0+IHt9LFxuICBnb0JhY2ssXG59OiB7XG4gIGF0dHI6IHN0cmluZ1xuICBsYXp5UmVzdWx0OiBMYXp5UXVlcnlSZXN1bHRcbiAgb25DYW5jZWw/OiAoKSA9PiB2b2lkXG4gIG9uU2F2ZT86ICgpID0+IHZvaWRcbiAgZ29CYWNrPzogKCkgPT4gdm9pZFxufSkgPT4ge1xuICBjb25zdCBbbW9kZSwgc2V0TW9kZV0gPSBSZWFjdC51c2VTdGF0ZShNb2RlLk5vcm1hbClcbiAgY29uc3QgW3ZhbHVlcywgc2V0VmFsdWVzXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIEFycmF5LmlzQXJyYXkobGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzW2F0dHJdKVxuICAgICAgPyBsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cl0uc2xpY2UoMClcbiAgICAgIDogW2xhenlSZXN1bHQucGxhaW4ubWV0YWNhcmQucHJvcGVydGllc1thdHRyXV1cbiAgKVxuICBjb25zdCBbZGlydHlJbmRleCwgc2V0RGlydHlJbmRleF0gPSBSZWFjdC51c2VTdGF0ZSgtMSlcbiAgY29uc3QgeyBnZXRBbGlhcywgaXNNdWx0aSwgZ2V0VHlwZSwgZ2V0RW51bSwgZ2V0UmVxdWlyZWQgfSA9XG4gICAgdXNlTWV0YWNhcmREZWZpbml0aW9ucygpXG4gIGNvbnN0IGxhYmVsID0gZ2V0QWxpYXMoYXR0cilcbiAgY29uc3QgaXNNdWx0aVZhbHVlZCA9IGlzTXVsdGkoYXR0cilcbiAgY29uc3QgYXR0clR5cGUgPSBnZXRUeXBlKGF0dHIpXG4gIGNvbnN0IGVudW1Gb3JBdHRyID0gZ2V0RW51bShhdHRyKVxuICBjb25zdCBhZGRTbmFjayA9IHVzZVNuYWNrKClcbiAgY29uc3QgaXNSZXF1aXJlZCA9IGdldFJlcXVpcmVkKGxhenlSZXN1bHQucGxhaW4ubWV0YWNhcmRUeXBlLCBhdHRyKVxuXG4gIGZ1bmN0aW9uIGdldEVycm9yTWVzc2FnZSgpIHtcbiAgICBpZiAoaXNSZXF1aXJlZCB8fCBhdHRyID09PSAndGl0bGUnKSB7XG4gICAgICBjb25zdCBpbnZhbGlkRmllbGQgPSAhdmFsdWVzIHx8IHZhbHVlcy5sZW5ndGggPCAxIHx8ICF2YWx1ZXNbMF1cbiAgICAgIHJldHVybiBpbnZhbGlkRmllbGQgPyBsYWJlbCArICcgaXMgcmVxdWlyZWQuJyA6ICcnXG4gICAgfVxuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgY29uc3QgZXJybXNnID0gZ2V0RXJyb3JNZXNzYWdlKClcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICB7Z29CYWNrICYmIChcbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgIHN0YXJ0SWNvbj17PEtleWJvYXJkQmFja3NwYWNlSWNvbiAvPn1cbiAgICAgICAgICBvbkNsaWNrPXtnb0JhY2t9XG4gICAgICAgID5cbiAgICAgICAgICBDYW5jZWwgYW5kIHJldHVybiB0byBtYW5hZ2VcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICApfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCB0ZXh0LWNlbnRlciBweC0yIHBiLTIgcHQtNCBmb250LW5vcm1hbCB0cnVuY2F0ZVwiPlxuICAgICAgICBFZGl0aW5nIHtsYWJlbH0gb2YgXCJ7bGF6eVJlc3VsdC5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzLnRpdGxlfVwiXG4gICAgICA8L2Rpdj5cbiAgICAgIDxEaXZpZGVyIC8+XG4gICAgICA8RGlhbG9nQ29udGVudCBzdHlsZT17eyBtaW5IZWlnaHQ6ICczMGVtJywgbWluV2lkdGg6ICc2MHZoJyB9fT5cbiAgICAgICAgPGRpdiBrZXk9e2F0dHJ9IGNsYXNzTmFtZT1cInJlbGF0aXZlXCI+XG4gICAgICAgICAge3ZhbHVlcy5tYXAoKHZhbDogYW55LCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8R3JpZCBjb250YWluZXIgZGlyZWN0aW9uPVwicm93XCIgY2xhc3NOYW1lPVwibXktMlwiPlxuICAgICAgICAgICAgICAgIHtpbmRleCAhPT0gMCA/IDxEaXZpZGVyIHN0eWxlPXt7IG1hcmdpbjogJzVweCAwcHgnIH19IC8+IDogbnVsbH1cbiAgICAgICAgICAgICAgICA8R3JpZCBpdGVtIG1kPXsxMX0+XG4gICAgICAgICAgICAgICAgICB7KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudW1Gb3JBdHRyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSA9PT0gJ3NhdmluZyd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoX2U6IGFueSwgbmV3VmFsdWU6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSBuZXdWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVDbGVhcmFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZT1cInNtYWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucz17ZW51bUZvckF0dHJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlcklucHV0PXsocGFyYW1zKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZCB7Li4ucGFyYW1zfSB2YXJpYW50PVwib3V0bGluZWRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChhdHRyVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RBVEUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPERhdGVUaW1lUGlja2VyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXNbaW5kZXhdID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRleHRGaWVsZFByb3BzPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZDogbW9kZSAhPT0gTW9kZS5Ob3JtYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogbGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXJpYW50OiAnb3V0bGluZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQlBEYXRlUHJvcHM9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiBtb2RlICE9PSBNb2RlLk5vcm1hbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0JJTkFSWSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8VGh1bWJuYWlsSW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSAhPT0gTW9kZS5Ob3JtYWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHVwZGF0ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IHVwZGF0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXNdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQk9PTEVBTic6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8Q2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSAhPT0gTW9kZS5Ob3JtYWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IGUudGFyZ2V0LmNoZWNrZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFZhbHVlcyhbLi4udmFsdWVzXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAnTE9ORyc6XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAnRE9VQkxFJzpcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlICdGTE9BVCc6XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAnSU5URUdFUic6XG4gICAgICAgICAgICAgICAgICAgICAgY2FzZSAnU0hPUlQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXttb2RlICE9PSBNb2RlLk5vcm1hbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IGUudGFyZ2V0LnZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwibnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdWxsV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICBjYXNlICdHRU9NRVRSWSc6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8TG9jYXRpb25JbnB1dFJlYWN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhsb2NhdGlvbjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9jYXRpb24gPT09IG51bGwgfHwgbG9jYXRpb24gPT09ICdJTlZBTElEJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRNb2RlKE1vZGUuQmFkSW5wdXQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRNb2RlKE1vZGUuTm9ybWFsKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzW2luZGV4XSA9IGxvY2F0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc1N0YXRlRGlydHk9e2RpcnR5SW5kZXggPT09IGluZGV4fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc2V0SXNTdGF0ZURpcnR5PXsoKSA9PiBzZXREaXJ0eUluZGV4KC0xKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8VGV4dEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e21vZGUgIT09IE1vZGUuTm9ybWFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlc1tpbmRleF0gPSBlLnRhcmdldC52YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXNdKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgd2hpdGVTcGFjZTogJ3ByZS1saW5lJywgZmxleEdyb3c6IDUwIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFdpZHRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlsaW5lPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFJvd3M9ezEwMDB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I9e2Vycm1zZy5sZW5ndGggIT0gMH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWxwZXJUZXh0PXtlcnJtc2d9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pKCl9XG4gICAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgICAgIHtpc011bHRpVmFsdWVkID8gKFxuICAgICAgICAgICAgICAgICAgPEdyaWQgaXRlbSBtZD17MX0+XG4gICAgICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSA9PT0gTW9kZS5TYXZpbmd9XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVzLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldERpcnR5SW5kZXgoaW5kZXgpXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRWYWx1ZXMoWy4uLnZhbHVlc10pXG4gICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIDxEZWxldGVJY29uIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9HcmlkPlxuICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgICAgICApXG4gICAgICAgICAgfSl9XG4gICAgICAgICAge2lzTXVsdGlWYWx1ZWQgJiYgKFxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBkaXNhYmxlZD17bW9kZSA9PT0gTW9kZS5TYXZpbmd9XG4gICAgICAgICAgICAgIHZhcmlhbnQ9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgY29sb3I9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBkZWZhdWx0VmFsdWUgPSAnJ1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoYXR0clR5cGUpIHtcbiAgICAgICAgICAgICAgICAgIGNhc2UgJ0RBVEUnOlxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWUgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VmFsdWVzKFsuLi52YWx1ZXMsIGRlZmF1bHRWYWx1ZV0pXG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxCb3ggY29sb3I9XCJ0ZXh0LnByaW1hcnlcIj5cbiAgICAgICAgICAgICAgICA8QWRkSWNvbiAvPlxuICAgICAgICAgICAgICA8L0JveD5cbiAgICAgICAgICAgICAgQWRkIE5ldyBWYWx1ZVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L0RpYWxvZ0NvbnRlbnQ+XG4gICAgICA8RGl2aWRlciAvPlxuICAgICAgPERpYWxvZ0FjdGlvbnM+XG4gICAgICAgIDxCdXR0b25cbiAgICAgICAgICBkaXNhYmxlZD17bW9kZSA9PT0gTW9kZS5TYXZpbmd9XG4gICAgICAgICAgdmFyaWFudD1cInRleHRcIlxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgIG9uQ2FuY2VsKClcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgQ2FuY2VsXG4gICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgZGlzYWJsZWQ9e21vZGUgIT09IE1vZGUuTm9ybWFsfVxuICAgICAgICAgIHZhcmlhbnQ9XCJjb250YWluZWRcIlxuICAgICAgICAgIGNvbG9yPVwicHJpbWFyeVwiXG4gICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVycm1zZy5sZW5ndGggIT0gMCkge1xuICAgICAgICAgICAgICBhZGRTbmFjaygnVGhpcyBhdHRyaWJ1dGUgaXMgcmVxdWlyZWQuJywge1xuICAgICAgICAgICAgICAgIHN0YXR1czogJ2Vycm9yJyxcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNldE1vZGUoTW9kZS5TYXZpbmcpXG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWRWYWx1ZXNcbiAgICAgICAgICAgIGlmIChpc011bHRpVmFsdWVkICYmIHZhbHVlcyAmJiB2YWx1ZXMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFZhbHVlcyA9IHZhbHVlcy5maWx0ZXIoXG4gICAgICAgICAgICAgICAgKHZhbDogYW55KSA9PiB2YWwgIT0gbnVsbCAmJiB2YWwgIT09ICcnXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRyYW5zZm9ybWVkVmFsdWVzID0gdmFsdWVzXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoYXR0clR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdCSU5BUlknOlxuICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRWYWx1ZXMgPSB0cmFuc2Zvcm1lZFZhbHVlcy5tYXAoXG4gICAgICAgICAgICAgICAgICAgIChzdWJ2YWw6IGFueSkgPT4gc3VidmFsLnNwbGl0KCcsJylbMV1cbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAnREFURSc6XG4gICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1lZFZhbHVlcyA9IHRyYW5zZm9ybWVkVmFsdWVzLm1hcCgoc3VidmFsOiBhbnkpID0+XG4gICAgICAgICAgICAgICAgICAgIG1vbWVudChzdWJ2YWwpLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgY2FzZSAnR0VPTUVUUlknOlxuICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtZWRWYWx1ZXMgPSB2YWx1ZXMuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgICAodmFsOiBhbnkpID0+IHZhbCAhPSBudWxsICYmIHZhbCAhPT0gJydcbiAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBbeyBhdHRyaWJ1dGU6IGF0dHIsIHZhbHVlczogdHJhbnNmb3JtZWRWYWx1ZXMgfV1cbiAgICAgICAgICAgIGNvbnN0IG9uU3VjY2VzcyA9ICgpID0+XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFkZFNuYWNrKCdTdWNjZXNzZnVsbHkgdXBkYXRlZC4nKVxuICAgICAgICAgICAgICAgIG9uU2F2ZSgpXG4gICAgICAgICAgICAgIH0sIDEwMDApXG4gICAgICAgICAgICBjb25zdCBvbkZhaWx1cmUgPSAoKSA9PlxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBhZGRTbmFjaygnRmFpbGVkIHRvIHVwZGF0ZS4nLCB7IHN0YXR1czogJ2Vycm9yJyB9KVxuICAgICAgICAgICAgICAgIG9uU2F2ZSgpXG4gICAgICAgICAgICAgIH0sIDEwMDApXG4gICAgICAgICAgICBpZiAoRXh0ZW5zaW9uUG9pbnRzLmhhbmRsZU1ldGFjYXJkVXBkYXRlKSB7XG4gICAgICAgICAgICAgIEV4dGVuc2lvblBvaW50cy5oYW5kbGVNZXRhY2FyZFVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgbGF6eVJlc3VsdCxcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzVG9VcGRhdGU6IGF0dHJpYnV0ZXMsXG4gICAgICAgICAgICAgIH0pLnRoZW4ob25TdWNjZXNzLCBvbkZhaWx1cmUpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBoYW5kbGVNZXRhY2FyZFVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgbGF6eVJlc3VsdCxcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLFxuICAgICAgICAgICAgICAgIG9uU3VjY2VzcyxcbiAgICAgICAgICAgICAgICBvbkZhaWx1cmUsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIFNhdmVcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L0RpYWxvZ0FjdGlvbnM+XG4gICAgICB7bW9kZSA9PT0gTW9kZS5TYXZpbmcgPyAoXG4gICAgICAgIDxMaW5lYXJQcm9ncmVzc1xuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxuICAgICAgICAgICAgaGVpZ2h0OiAnMTBweCcsXG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIGxlZnQ6ICcwcHgnLFxuICAgICAgICAgICAgYm90dG9tOiAnMCUnLFxuICAgICAgICAgIH19XG4gICAgICAgICAgdmFyaWFudD1cImluZGV0ZXJtaW5hdGVcIlxuICAgICAgICAvPlxuICAgICAgKSA6IG51bGx9XG4gICAgPC8+XG4gIClcbn1cbmNvbnN0IEF0dHJpYnV0ZUNvbXBvbmVudCA9ICh7XG4gIGxhenlSZXN1bHQsXG4gIGF0dHIsXG4gIGhpZGVFbXB0eSxcbiAgc3VtbWFyeVNob3duID0gW10sXG4gIGRlY2ltYWxQcmVjaXNpb24gPSB1bmRlZmluZWQsXG4gIGZpbHRlciA9ICcnLFxuICBmb3JjZVJlbmRlcixcbn06IHtcbiAgYXR0cjogc3RyaW5nXG4gIGxhenlSZXN1bHQ6IExhenlRdWVyeVJlc3VsdFxuICBoaWRlRW1wdHk6IGJvb2xlYW5cbiAgc3VtbWFyeVNob3duPzogc3RyaW5nW11cbiAgZGVjaW1hbFByZWNpc2lvbjogbnVtYmVyIHwgdW5kZWZpbmVkXG4gIGZpbHRlcj86IHN0cmluZ1xuICBmb3JjZVJlbmRlcjogYm9vbGVhblxufSkgPT4ge1xuICBsZXQgdmFsdWUgPSBsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbYXR0cl1cbiAgaWYgKGhpZGVFbXB0eSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAhdmFsdWUudHJpbSgpKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH1cbiAgfVxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgIHZhbHVlID0gW11cbiAgfVxuICBpZiAoIUFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgdmFsdWUgPSBbdmFsdWVdXG4gIH1cbiAgY29uc3QgeyBnZXRBbGlhcywgZ2V0VHlwZSB9ID0gdXNlTWV0YWNhcmREZWZpbml0aW9ucygpXG4gIGxldCBsYWJlbCA9IGdldEFsaWFzKGF0dHIpXG4gIGNvbnN0IHsgaXNOb3RXcml0YWJsZSB9ID0gdXNlQ3VzdG9tUmVhZE9ubHlDaGVjaygpXG4gIGNvbnN0IGRpYWxvZ0NvbnRleHQgPSB1c2VEaWFsb2coKVxuICBjb25zdCBjb252ZXJ0VG9Gb3JtYXQgPSB1c2VDb29yZGluYXRlRm9ybWF0KClcbiAgY29uc3QgY29udmVydFRvUHJlY2lzaW9uID0gKHZhbHVlOiBhbnkpID0+IHtcbiAgICByZXR1cm4gdmFsdWUgJiYgZGVjaW1hbFByZWNpc2lvblxuICAgICAgPyBOdW1iZXIodmFsdWUpLnRvRml4ZWQoZGVjaW1hbFByZWNpc2lvbilcbiAgICAgIDogdmFsdWVcbiAgfVxuICBjb25zdCBpc1VybCA9ICh2YWx1ZTogYW55KSA9PiB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGNvbnN0IHByb3RvY29sID0gdmFsdWUudG9Mb3dlckNhc2UoKS5zcGxpdCgnLycpWzBdXG4gICAgICByZXR1cm4gcHJvdG9jb2wgJiYgKHByb3RvY29sID09PSAnaHR0cDonIHx8IHByb3RvY29sID09PSAnaHR0cHM6JylcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgY29uc3QgaXNGaWx0ZXJlZCA9XG4gICAgZmlsdGVyICE9PSAnJyA/ICFsYWJlbC50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlci50b0xvd2VyQ2FzZSgpKSA6IGZhbHNlXG4gIGNvbnN0IG9uQ2FuY2VsID0gKCkgPT4ge1xuICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICBjaGlsZHJlbjogbnVsbCxcbiAgICB9KVxuICB9XG4gIGNvbnN0IG9uU2F2ZSA9ICgpID0+IHtcbiAgICBkaWFsb2dDb250ZXh0LnNldFByb3BzKHtcbiAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgY2hpbGRyZW46IG51bGwsXG4gICAgfSlcbiAgfVxuICBjb25zdCBDdXN0b21BdHRyaWJ1dGVFZGl0b3IgPSBFeHRlbnNpb25Qb2ludHMuYXR0cmlidXRlRWRpdG9yKFxuICAgIGxhenlSZXN1bHQsXG4gICAgYXR0clxuICApXG4gIGNvbnN0IE1lbW9JdGVtID0gUmVhY3QudXNlTWVtbygoKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxHcmlkXG4gICAgICAgIGNvbnRhaW5lclxuICAgICAgICBkaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICB3cmFwPXsnbm93cmFwJ31cbiAgICAgICAgY2xhc3NOYW1lPVwiZ3JvdXAgcmVsYXRpdmVcIlxuICAgICAgPlxuICAgICAgICB7aXNOb3RXcml0YWJsZSh7IGF0dHJpYnV0ZTogYXR0ciwgbGF6eVJlc3VsdCB9KSA/IG51bGwgOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTEgaGlkZGVuIGdyb3VwLWhvdmVyOmJsb2NrIGFic29sdXRlIHJpZ2h0LTAgdG9wLTBcIj5cbiAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIGRpYWxvZ0NvbnRleHQuc2V0UHJvcHMoe1xuICAgICAgICAgICAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVFbmZvcmNlRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICBjaGlsZHJlbjogQ3VzdG9tQXR0cmlidXRlRWRpdG9yID8gKFxuICAgICAgICAgICAgICAgICAgICA8Q3VzdG9tQXR0cmlidXRlRWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0PXtsYXp5UmVzdWx0fVxuICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZT17YXR0cn1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17b25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgICAgb25TYXZlPXtvblNhdmV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8RWRpdG9yXG4gICAgICAgICAgICAgICAgICAgICAgYXR0cj17YXR0cn1cbiAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0PXtsYXp5UmVzdWx0fVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXtvbkNhbmNlbH1cbiAgICAgICAgICAgICAgICAgICAgICBvblNhdmU9e29uU2F2ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPEVkaXRJY29uIC8+XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICA8R3JpZFxuICAgICAgICAgIGl0ZW1cbiAgICAgICAgICB4cz17NH1cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgd29yZEJyZWFrOiAnYnJlYWstd29yZCcsXG4gICAgICAgICAgICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcycsXG4gICAgICAgICAgICBvdmVyZmxvdzogJ2hpZGRlbicsXG4gICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXG4gICAgICAgICAgfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiXG4gICAgICAgID5cbiAgICAgICAgICA8VHlwb2dyYXBoeT57bGFiZWx9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgIDxEaXZpZGVyXG4gICAgICAgICAgICBvcmllbnRhdGlvbj1cInZlcnRpY2FsXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIHJpZ2h0LTAgdG9wLTAgdy1taW4gaC1mdWxsXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDxHcmlkXG4gICAgICAgICAgaXRlbVxuICAgICAgICAgIG1kPXs4fVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICB3b3JkQnJlYWs6ICdicmVhay13b3JkJyxcbiAgICAgICAgICAgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJyxcbiAgICAgICAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcbiAgICAgICAgICB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEdyaWQgY29udGFpbmVyIGRpcmVjdGlvbj1cInJvd1wiPlxuICAgICAgICAgICAgPEdyaWQgZGF0YS1pZD17YCR7YXR0cn0tdmFsdWVgfSBpdGVtPlxuICAgICAgICAgICAgICB7dmFsdWUubWFwKCh2YWw6IGFueSwgaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXtpbmRleH0+XG4gICAgICAgICAgICAgICAgICAgIHtpbmRleCAhPT0gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8RGl2aWRlciBzdHlsZT17eyBtYXJnaW46ICc1cHggMHB4JyB9fSAvPlxuICAgICAgICAgICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICB7KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyID09PSAnZXh0LmF1ZGlvLXNuaXBwZXQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1pbWV0eXBlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXp5UmVzdWx0LnBsYWluLm1ldGFjYXJkLnByb3BlcnRpZXNbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZXh0LmF1ZGlvLXNuaXBwZXQtbWltZXR5cGUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzcmMgPSBgZGF0YToke21pbWV0eXBlfTtiYXNlNjQsJHt2YWx9YFxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gPGF1ZGlvIGNvbnRyb2xzIHNyYz17c3JjfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgc3dpdGNoIChnZXRUeXBlKGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0RBVEUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17VHlwZWRVc2VySW5zdGFuY2UuZ2V0TW9tZW50RGF0ZSh2YWwpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlci5nZXRVc2VyUmVhZGFibGVEYXRlVGltZSh2YWwpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQklOQVJZJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzcmM9e0NvbW1vbi5nZXRJbWFnZVNyYyh2YWwpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnMTAwJScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAnNTB2aCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnQk9PTEVBTic6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5Pnt2YWwgPyAndHJ1ZScgOiAnZmFsc2UnfTwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0dFT01FVFJZJzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFR5cG9ncmFwaHk+e2NvbnZlcnRUb0Zvcm1hdCh2YWwpfTwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0xPTkcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdET1VCTEUnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdGTE9BVCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUeXBvZ3JhcGh5Pntjb252ZXJ0VG9QcmVjaXNpb24odmFsKX08L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsYXp5UmVzdWx0LmhpZ2hsaWdodHNbYXR0cl0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhdHRyID09PSAndGl0bGUnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vU3BlY2lhbCBjYXNlLCB0aXRsZSBoaWdobGlnaHRzIGRvbid0IGdldCB0cnVuY2F0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX19odG1sOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF6eVJlc3VsdC5oaWdobGlnaHRzW2F0dHJdWzBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5oaWdobGlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXNVcmwodmFsKSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImhpZ2hsaWdodFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXt2YWx9IHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt2YWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1R5cG9ncmFwaHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheUhpZ2hsaWdodGVkQXR0ckluRnVsbChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQuaGlnaGxpZ2h0c1thdHRyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1VybCh2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPXt2YWx9IHRhcmdldD1cIl9ibGFua1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3ZhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvVHlwb2dyYXBoeT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDxUeXBvZ3JhcGh5Pnt2YWx9PC9UeXBvZ3JhcGh5PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9KSgpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIDwvR3JpZD5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgIDwvR3JpZD5cbiAgICApXG4gIH0sIFtzdW1tYXJ5U2hvd24sIGZvcmNlUmVuZGVyLCBpc05vdFdyaXRhYmxlXSlcbiAgcmV0dXJuIChcbiAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IGlzRmlsdGVyZWQgPyAnbm9uZScgOiAnYmxvY2snIH19PntNZW1vSXRlbX08L2Rpdj5cbiAgKVxufVxubGV0IHBlcnNpc3RhbnRGaWx0ZXIgPSAnJ1xuLyogSGlkZGVuIGF0dHJpYnV0ZXMgYXJlIHNpbXBseSB0aGUgb3Bwb3NpdGUgb2YgYWN0aXZlICovXG4vKiBUaGV5IGRvIG5vdCBjdXJyZW50bHkgZXhpc3Qgb24gdGhlIG1ldGFjYXJkIE9SIGFyZSBub3Qgc2hvd24gaW4gdGhlIHN1bW1hcnkgKi9cbmNvbnN0IGdldEhpZGRlbkF0dHJpYnV0ZXMgPSAoXG4gIHNlbGVjdGlvbjogTGF6eVF1ZXJ5UmVzdWx0LFxuICBhY3RpdmVBdHRyaWJ1dGVzOiBzdHJpbmdbXVxuKSA9PiB7XG4gIHJldHVybiBPYmplY3QudmFsdWVzKFxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRNZXRhY2FyZERlZmluaXRpb24oXG4gICAgICBzZWxlY3Rpb24ucGxhaW4ubWV0YWNhcmRUeXBlXG4gICAgKVxuICApXG4gICAgLmZpbHRlcigodmFsKSA9PiB7XG4gICAgICBpZiAoYWN0aXZlQXR0cmlidXRlcy5pbmNsdWRlcyh2YWwuaWQpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuICAgIC5maWx0ZXIoKHZhbCkgPT4ge1xuICAgICAgcmV0dXJuICFTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuaXNIaWRkZW5BdHRyaWJ1dGUodmFsLmlkKVxuICAgIH0pXG59XG5sZXQgZ2xvYmFsRXhwYW5kZWQgPSBmYWxzZSAvLyBnbG9iYWxseSB0cmFjayBpZiB1c2VycyB3YW50IHRoaXMgc2luY2UgdGhleSBtYXkgYmUgY2xpY2tpbmcgYmV0d2VlbiByZXN1bHRzXG5jb25zdCBTdW1tYXJ5ID0gKHsgcmVzdWx0OiBzZWxlY3Rpb24gfTogUHJvcHMpID0+IHtcbiAgY29uc3QgdGhlbWUgPSB1c2VUaGVtZSgpXG4gIGNvbnN0IFtmb3JjZVJlbmRlciwgc2V0Rm9yY2VSZW5kZXJdID0gUmVhY3QudXNlU3RhdGUoZmFsc2UpXG4gIGNvbnN0IFtleHBhbmRlZCwgc2V0RXhwYW5kZWRdID0gUmVhY3QudXNlU3RhdGUoZ2xvYmFsRXhwYW5kZWQpXG4gIC8qIFNwZWNpYWwgY2FzZSBmb3Igd2hlbiBhbGwgdGhlIGF0dHJpYnV0ZXMgYXJlIGRpc3BsYXllZCAqL1xuICBjb25zdCBbZnVsbHlFeHBhbmRlZCwgc2V0RnVsbHlFeHBhbmRlZF0gPSBSZWFjdC51c2VTdGF0ZShmYWxzZSlcbiAgY29uc3QgW2ZpbHRlciwgc2V0RmlsdGVyXSA9IFJlYWN0LnVzZVN0YXRlKHBlcnNpc3RhbnRGaWx0ZXIpXG4gIGNvbnN0IFtkZWNpbWFsUHJlY2lzaW9uLCBzZXREZWNpbWFsUHJlY2lzaW9uXSA9IFJlYWN0LnVzZVN0YXRlKFxuICAgIFR5cGVkVXNlckluc3RhbmNlLmdldERlY2ltYWxQcmVjaXNpb24oKVxuICApXG4gIGNvbnN0IFtzdW1tYXJ5U2hvd24sIHNldFN1bW1hcnlTaG93bl0gPSBSZWFjdC51c2VTdGF0ZShcbiAgICBUeXBlZFVzZXJJbnN0YW5jZS5nZXRSZXN1bHRzQXR0cmlidXRlc1N1bW1hcnlTaG93bigpXG4gIClcbiAgdXNlUmVyZW5kZXJPbkJhY2tib25lU3luYyh7IGxhenlSZXN1bHQ6IHNlbGVjdGlvbiB9KVxuICBjb25zdCB7IGxpc3RlblRvIH0gPSB1c2VCYWNrYm9uZSgpXG4gIGNvbnN0IHsgaXNIaWRkZW5BdHRyaWJ1dGUsIGdldE1ldGFjYXJkRGVmaW5pdGlvbiB9ID0gdXNlTWV0YWNhcmREZWZpbml0aW9ucygpXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgbGlzdGVuVG8oXG4gICAgICB1c2VyLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKSxcbiAgICAgICdjaGFuZ2U6aW5zcGVjdG9yLXN1bW1hcnlTaG93biBjaGFuZ2U6ZGF0ZVRpbWVGb3JtYXQgY2hhbmdlOnRpbWVab25lIGNoYW5nZTppbnNwZWN0b3ItaGlkZUVtcHR5JyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgc2V0U3VtbWFyeVNob3duKFtcbiAgICAgICAgICAuLi5UeXBlZFVzZXJJbnN0YW5jZS5nZXRSZXN1bHRzQXR0cmlidXRlc1N1bW1hcnlTaG93bigpLFxuICAgICAgICBdKVxuICAgICAgICBzZXRGb3JjZVJlbmRlcih0cnVlKVxuICAgICAgfVxuICAgIClcbiAgICBsaXN0ZW5UbyhcbiAgICAgIHVzZXIuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLFxuICAgICAgJ2NoYW5nZTpkZWNpbWFsUHJlY2lzaW9uJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgc2V0RGVjaW1hbFByZWNpc2lvbihUeXBlZFVzZXJJbnN0YW5jZS5nZXREZWNpbWFsUHJlY2lzaW9uKCkpXG4gICAgICB9XG4gICAgKVxuICB9LCBbXSlcbiAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICBpZiAoZ2V0SGlkZGVuQXR0cmlidXRlcyhzZWxlY3Rpb24sIHN1bW1hcnlTaG93bikubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHNldEZ1bGx5RXhwYW5kZWQodHJ1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEZ1bGx5RXhwYW5kZWQoZmFsc2UpXG4gICAgICB9XG4gICAgfVxuICB9LCBbc3VtbWFyeVNob3duXSlcbiAgY29uc3QgZXZlcnl0aGluZ0Vsc2UgPSBSZWFjdC51c2VNZW1vKCgpID0+IHtcbiAgICByZXR1cm4gc2VsZWN0aW9uICYmIGV4cGFuZGVkXG4gICAgICA/IE9iamVjdC5rZXlzKHNlbGVjdGlvbi5wbGFpbi5tZXRhY2FyZC5wcm9wZXJ0aWVzKVxuICAgICAgICAgIC5maWx0ZXIoKGF0dHIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhaXNIaWRkZW5BdHRyaWJ1dGUoYXR0cilcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maWx0ZXIoKGF0dHIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhc3VtbWFyeVNob3duLmluY2x1ZGVzKGF0dHIpXG4gICAgICAgICAgfSlcbiAgICAgIDogW11cbiAgfSwgW2V4cGFuZGVkLCBzdW1tYXJ5U2hvd24sIGlzSGlkZGVuQXR0cmlidXRlXSlcbiAgY29uc3QgYmxhbmtFdmVyeXRoaW5nRWxzZSA9IFJlYWN0LnVzZU1lbW8oKCkgPT4ge1xuICAgIHJldHVybiBzZWxlY3Rpb25cbiAgICAgID8gT2JqZWN0LnZhbHVlcyhnZXRNZXRhY2FyZERlZmluaXRpb24oc2VsZWN0aW9uLnBsYWluLm1ldGFjYXJkVHlwZSkpXG4gICAgICAgICAgLmZpbHRlcigodmFsKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3VtbWFyeVNob3duLmluY2x1ZGVzKHZhbC5pZCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlcnl0aGluZ0Vsc2UuaW5jbHVkZXModmFsLmlkKSkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmlsdGVyKCh2YWwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhaXNIaWRkZW5BdHRyaWJ1dGUodmFsLmlkKVxuICAgICAgICAgIH0pXG4gICAgICA6IFtdXG4gIH0sIFtleHBhbmRlZCwgc3VtbWFyeVNob3duLCBpc0hpZGRlbkF0dHJpYnV0ZV0pXG4gIFJlYWN0LnVzZUVmZmVjdCgoKSA9PiB7XG4gICAgZ2xvYmFsRXhwYW5kZWQgPSBleHBhbmRlZFxuICB9LCBbZXhwYW5kZWRdKVxuICBpZiAoIXNlbGVjdGlvbikge1xuICAgIHJldHVybiA8ZGl2Pk5vIHJlc3VsdCBzZWxlY3RlZDwvZGl2PlxuICB9XG4gIGNvbnN0IGhpZGVFbXB0eTogYm9vbGVhbiA9IHVzZXJcbiAgICAuZ2V0KCd1c2VyJylcbiAgICAuZ2V0KCdwcmVmZXJlbmNlcycpXG4gICAgLmdldCgnaW5zcGVjdG9yLWhpZGVFbXB0eScpXG4gIHJldHVybiAoXG4gICAgPEdyaWRcbiAgICAgIGNvbnRhaW5lclxuICAgICAgZGlyZWN0aW9uPVwiY29sdW1uXCJcbiAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgY2xhc3NOYW1lPVwib3ZlcmZsb3ctaGlkZGVuIHctZnVsbCBoLWZ1bGxcIlxuICAgID5cbiAgICAgIDxHcmlkIGl0ZW0gY2xhc3NOYW1lPVwic2hyaW5rLTBcIj5cbiAgICAgICAgPEdyaWRcbiAgICAgICAgICBjb250YWluZXJcbiAgICAgICAgICBkaXJlY3Rpb249XCJyb3dcIlxuICAgICAgICAgIGFsaWduSXRlbXM9XCJjZW50ZXJcIlxuICAgICAgICAgIHdyYXA9XCJub3dyYXBcIlxuICAgICAgICAgIGp1c3RpZnlDb250ZW50PVwic3BhY2UtYmV0d2VlblwiXG4gICAgICAgICAgY2xhc3NOYW1lPVwicC0yXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxHcmlkIGl0ZW0+XG4gICAgICAgICAgICA8U3VtbWFyeU1hbmFnZUF0dHJpYnV0ZXMgLz5cbiAgICAgICAgICA8L0dyaWQ+XG5cbiAgICAgICAgICA8R3JpZCBpdGVtPlxuICAgICAgICAgICAgPFRleHRGaWVsZFxuICAgICAgICAgICAgICBkYXRhLWlkPVwic3VtbWFyeS1maWx0ZXItaW5wdXRcIlxuICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICB2YXJpYW50PVwib3V0bGluZWRcIlxuICAgICAgICAgICAgICBsYWJlbD1cIkZpbHRlclwiXG4gICAgICAgICAgICAgIHZhbHVlPXtmaWx0ZXJ9XG4gICAgICAgICAgICAgIGlucHV0UHJvcHM9e3tcbiAgICAgICAgICAgICAgICBzdHlsZTpcbiAgICAgICAgICAgICAgICAgIGZpbHRlciAhPT0gJydcbiAgICAgICAgICAgICAgICAgICAgPyB7XG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206IGAxcHggc29saWQgJHt0aGVtZS5wYWxldHRlLndhcm5pbmcubWFpbn1gLFxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgOiB7fSxcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgcGVyc2lzdGFudEZpbHRlciA9IGUudGFyZ2V0LnZhbHVlXG4gICAgICAgICAgICAgICAgc2V0RmlsdGVyKGUudGFyZ2V0LnZhbHVlKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L0dyaWQ+XG4gICAgICAgIDwvR3JpZD5cbiAgICAgIDwvR3JpZD5cbiAgICAgIDxEYXJrRGl2aWRlciBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1taW5cIiAvPlxuICAgICAgPEdyaWQgaXRlbSBjbGFzc05hbWU9XCJzaHJpbmstMSBvdmVyZmxvdy1hdXRvIHAtMlwiPlxuICAgICAgICA8UGFwZXIgZWxldmF0aW9uPXtFbGV2YXRpb25zLnBhcGVyfT5cbiAgICAgICAgICB7c3VtbWFyeVNob3duLm1hcCgoYXR0ciwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmVcIiBrZXk9e2F0dHJ9PlxuICAgICAgICAgICAgICAgIDxBdHRyaWJ1dGVDb21wb25lbnRcbiAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQ9e3NlbGVjdGlvbn1cbiAgICAgICAgICAgICAgICAgIGF0dHI9e2F0dHJ9XG4gICAgICAgICAgICAgICAgICBoaWRlRW1wdHk9e2hpZGVFbXB0eX1cbiAgICAgICAgICAgICAgICAgIHN1bW1hcnlTaG93bj17c3VtbWFyeVNob3dufVxuICAgICAgICAgICAgICAgICAgZGVjaW1hbFByZWNpc2lvbj17ZGVjaW1hbFByZWNpc2lvbn1cbiAgICAgICAgICAgICAgICAgIGZpbHRlcj17ZmlsdGVyfVxuICAgICAgICAgICAgICAgICAgZm9yY2VSZW5kZXI9e2ZvcmNlUmVuZGVyfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAge2luZGV4ICE9PSAwID8gKFxuICAgICAgICAgICAgICAgICAgPERpdmlkZXJcbiAgICAgICAgICAgICAgICAgICAgb3JpZW50YXRpb249XCJob3Jpem9udGFsXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTAgdy1mdWxsIGgtbWluXCJcbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKVxuICAgICAgICAgIH0pfVxuXG4gICAgICAgICAge2V4cGFuZGVkID8gKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAge2V2ZXJ5dGhpbmdFbHNlLm1hcCgoYXR0cikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17YXR0cn0gY2xhc3NOYW1lPVwicmVsYXRpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgPEF0dHJpYnV0ZUNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQ9e3NlbGVjdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICBhdHRyPXthdHRyfVxuICAgICAgICAgICAgICAgICAgICAgIGhpZGVFbXB0eT17aGlkZUVtcHR5fVxuICAgICAgICAgICAgICAgICAgICAgIHN1bW1hcnlTaG93bj17c3VtbWFyeVNob3dufVxuICAgICAgICAgICAgICAgICAgICAgIGRlY2ltYWxQcmVjaXNpb249e2RlY2ltYWxQcmVjaXNpb259XG4gICAgICAgICAgICAgICAgICAgICAgZmlsdGVyPXtmaWx0ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZm9yY2VSZW5kZXI9e2ZvcmNlUmVuZGVyfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8RGl2aWRlclxuICAgICAgICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uPVwiaG9yaXpvbnRhbFwiXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTAgdy1mdWxsIGgtbWluXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIHtibGFua0V2ZXJ5dGhpbmdFbHNlLm1hcCgoYXR0cikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17YXR0ci5pZH0gY2xhc3NOYW1lPVwicmVsYXRpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgPEF0dHJpYnV0ZUNvbXBvbmVudFxuICAgICAgICAgICAgICAgICAgICAgIGxhenlSZXN1bHQ9e3NlbGVjdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICBhdHRyPXthdHRyLmlkfVxuICAgICAgICAgICAgICAgICAgICAgIGhpZGVFbXB0eT17aGlkZUVtcHR5fVxuICAgICAgICAgICAgICAgICAgICAgIHN1bW1hcnlTaG93bj17c3VtbWFyeVNob3dufVxuICAgICAgICAgICAgICAgICAgICAgIGRlY2ltYWxQcmVjaXNpb249e2RlY2ltYWxQcmVjaXNpb259XG4gICAgICAgICAgICAgICAgICAgICAgZmlsdGVyPXtmaWx0ZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgZm9yY2VSZW5kZXI9e2ZvcmNlUmVuZGVyfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8RGl2aWRlclxuICAgICAgICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uPVwiaG9yaXpvbnRhbFwiXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTAgdy1mdWxsIGgtbWluXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPD48Lz5cbiAgICAgICAgICApfVxuICAgICAgICA8L1BhcGVyPlxuICAgICAgPC9HcmlkPlxuICAgICAgey8qIElmIGhpZGRlbiBhdHRyaWJ1dGVzID09PSAwLCBkb24ndCBzaG93IHRoaXMgYnV0dG9uICovfVxuICAgICAgeyFmdWxseUV4cGFuZGVkICYmIChcbiAgICAgICAgPD5cbiAgICAgICAgICA8RGFya0RpdmlkZXIgY2xhc3NOYW1lPVwidy1mdWxsIGgtbWluXCIgLz5cbiAgICAgICAgICA8R3JpZCBpdGVtIGNsYXNzTmFtZT1cInNocmluay0wIHAtMlwiPlxuICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICBkYXRhLWlkPVwic2VlLWFsbC1jb2xsYXBzZS1idXR0b25cIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0RXhwYW5kZWQoIWV4cGFuZGVkKVxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBzaXplPVwic21hbGxcIlxuICAgICAgICAgICAgICBjb2xvcj1cInByaW1hcnlcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7ZXhwYW5kZWQgPyAnQ29sbGFwc2UnIDogJ1NlZSBhbGwnfVxuICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPC9HcmlkPlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPC9HcmlkPlxuICApXG59XG5leHBvcnQgZGVmYXVsdCBob3QobW9kdWxlKShTdW1tYXJ5KVxuIl19