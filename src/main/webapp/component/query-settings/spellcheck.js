import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useBackbone } from '../selection-checkbox/useBackbone.hook';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
var Spellcheck = function (_a) {
    var model = _a.model;
    var _b = __read(React.useState(Boolean(model.get('spellcheck'))), 2), spellcheck = _b[0], setSpellcheck = _b[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(model, 'change:spellcheck', function () {
            setSpellcheck(model.get('spellcheck'));
        });
    }, []);
    return (React.createElement(FormControlLabel, { labelPlacement: "start", control: React.createElement(Checkbox, { color: "default", checked: spellcheck, onChange: function (e) {
                model.set('spellcheck', e.target.checked);
            } }), label: "Spellcheck" }));
};
export default hot(module)(Spellcheck);
//# sourceMappingURL=spellcheck.js.map