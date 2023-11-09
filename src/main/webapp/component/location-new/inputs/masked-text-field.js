import { __assign, __extends, __rest } from "tslib";
/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import React from 'react';
import Group from '../../../react-component/group/index';
import MaskedInput from 'react-text-mask';
import TextField from '@mui/material/TextField';
var MaskedTextField = /** @class */ (function (_super) {
    __extends(MaskedTextField, _super);
    function MaskedTextField() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.prevEvent = undefined;
        return _this;
    }
    MaskedTextField.prototype.padEndWithZeros = function (value) {
        // This function is called for each field (east, west, south, north) multiple times.
        // Sometimes the event variable is defined, other times it's undefined.
        // We must capture the event in a variable when it's defined
        // in order to leverage it in checks below even when it's undefined.
        if (event) {
            // @ts-expect-error ts-migrate(2322) FIXME: Type 'Event' is not assignable to type 'undefined'... Remove this comment to see the full error message
            this.prevEvent = event;
        }
        if (value === undefined ||
            !value.includes('.') ||
            (((event && event.type === 'input') ||
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                (this.prevEvent && this.prevEvent.type === 'input')) &&
                // @ts-expect-error ts-migrate(2532) FIXME: Object is possibly 'undefined'.
                this.prevEvent.target.id === this.props.label)) {
            return value;
        }
        var dmsCoordinateParts = value.toString().split("'");
        if (dmsCoordinateParts.length < 2) {
            return value;
        }
        var decimalParts = dmsCoordinateParts[1].toString().split('.');
        if (decimalParts.length < 2) {
            return value;
        }
        var decimal = decimalParts[1].replace('"', '');
        if (!decimal.endsWith('_')) {
            return value;
        }
        var indexOfUnderscore = decimal.indexOf('_');
        var decimalLength = decimal.length;
        decimal = decimal.substring(0, indexOfUnderscore);
        return (dmsCoordinateParts[0] +
            "'" +
            decimalParts[0] +
            '.' +
            decimal.padEnd(decimalLength, '0') +
            '"');
    };
    MaskedTextField.prototype.render = function () {
        var _this = this;
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
        // eslint-disable-next-line no-unused-vars
        var _a = this.props, label = _a.label, addon = _a.addon, onChange = _a.onChange, value = _a.value, args = __rest(_a, ["label", "addon", "onChange", "value"]);
        return (React.createElement("div", { className: "flex-1" },
            React.createElement(Group, null,
                label != null ? (React.createElement("div", { className: "p-2 shrink-0 grow-0", style: {
                        minWidth: '120px',
                    } },
                    label,
                    "\u00A0")) : null,
                React.createElement(MaskedInput, __assign({ className: "inline-block w-full whitespace-nowrap shrink overflow-hidden", value: value, keepCharPositions: true, onChange: function (e) {
                        ;
                        _this.props.onChange(e.target.value);
                    }, pipe: function (value) { return _this.padEndWithZeros(value); }, render: function (setRef, _a) {
                        var defaultValue = _a.defaultValue, props = __rest(_a, ["defaultValue"]);
                        return (React.createElement(TextField, __assign({ size: "small", fullWidth: true, variant: "outlined", id: label, inputRef: function (ref) {
                                setRef(ref);
                                _this.ref = ref;
                            }, value: defaultValue || '' }, props)));
                    } }, args)),
                addon != null ? (React.createElement("label", { className: "p-2 shrink-0 grow-0" }, addon)) : null)));
    };
    return MaskedTextField;
}(React.Component));
export default MaskedTextField;
//# sourceMappingURL=masked-text-field.js.map