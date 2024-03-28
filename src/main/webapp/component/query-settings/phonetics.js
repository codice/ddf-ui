import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
var Phonetics = function (_a) {
    var model = _a.model;
    var _b = __read(React.useState(Boolean(model.get('phonetics'))), 2), phonetics = _b[0], setPhonetics = _b[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(model, 'change:phonetics', function () {
            setPhonetics(model.get('phonetics'));
        });
    }, []);
    return (React.createElement(FormControlLabel, { labelPlacement: "start", control: React.createElement(Checkbox, { color: "default", checked: phonetics, onChange: function (e) {
                model.set('phonetics', e.target.checked);
            } }), label: "Similar word matching" }));
};
export default hot(module)(Phonetics);
//# sourceMappingURL=phonetics.js.map