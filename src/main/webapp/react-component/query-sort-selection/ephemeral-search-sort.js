import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import SortSelections from './sort-selections';
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import user from '../../component/singletons/user-instance';
var getResultSort = function () {
    return user.get('user').get('preferences').get('resultSort') || [];
};
var PermanentSearchSort = function (_a) {
    var closeDropdown = _a.closeDropdown;
    var _b = __read(React.useState(getResultSort()), 2), sorts = _b[0], setSorts = _b[1];
    var _c = __read(React.useState(sorts.length > 0), 2), hasSort = _c[0], setHasSort = _c[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(user.get('user').get('preferences'), 'change:resultSort', function () {
            var resultSort = getResultSort();
            setHasSort(resultSort !== undefined && resultSort.length > 0);
            setSorts(resultSort);
        });
    }, []);
    var removeSort = function () {
        user.get('user').get('preferences').set('resultSort', '');
        user.get('user').get('preferences').savePreferences();
        closeDropdown();
    };
    var saveSort = function () {
        user
            .get('user')
            .get('preferences')
            .set('resultSort', sorts.length === 0 ? undefined : sorts);
        user.get('user').get('preferences').savePreferences();
        closeDropdown();
        // once again, something is weird with arrays and backbone?
        user.get('user').get('preferences').trigger('change:resultSort');
    };
    return (React.createElement("div", { "data-id": "results-sort-container", className: "min-w-120" },
        React.createElement("div", { className: "pb-2" },
            React.createElement(SortSelections, { value: sorts, onChange: function (newVal) {
                    setSorts(newVal);
                } })),
        React.createElement(Grid, { container: true, direction: "row", alignItems: "center", wrap: "nowrap" },
            hasSort ? (React.createElement(Grid, { item: true, className: "w-full" },
                React.createElement(Button, { "data-id": "remove-all-results-sorts-button", fullWidth: true, onClick: removeSort, variant: "text", color: "secondary" }, "Remove Sort"))) : null,
            React.createElement(Grid, { item: true, className: "w-full" },
                React.createElement(Button, { "data-id": "save-results-sorts-button", fullWidth: true, onClick: saveSort, variant: "contained", color: "primary" }, "Save Sort")))));
};
export default hot(module)(PermanentSearchSort);
//# sourceMappingURL=ephemeral-search-sort.js.map