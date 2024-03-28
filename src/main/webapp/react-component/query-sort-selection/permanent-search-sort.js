import { __read } from "tslib";
import * as React from 'react';
import _cloneDeep from 'lodash.clonedeep';
import { hot } from 'react-hot-loader';
import SortSelections from './sort-selections';
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook';
/**
 * If we don't do this, we might muck with how backbone determines changes.  That's because we might modify the object directly, then update it.
 * So then it would see the set, determine there are no changes, and weird things would be afoot.
 * @param param0
 */
var getCopyOfSortsFromModel = function (_a) {
    var model = _a.model;
    return _cloneDeep(model.get('sorts'));
};
var PermanentSearchSort = function (_a) {
    var model = _a.model;
    var _b = __read(React.useState(getCopyOfSortsFromModel({ model: model })), 2), sorts = _b[0], setSorts = _b[1];
    var listenTo = useBackbone().listenTo;
    React.useEffect(function () {
        listenTo(model, 'change:sorts', function () {
            setSorts(getCopyOfSortsFromModel({ model: model }));
        });
    }, []);
    return (React.createElement(SortSelections, { value: sorts, onChange: function (newVal) {
            model.set('sorts', newVal);
            // something to do with this being an array causes the event not to trigger, I think?
            model.trigger('change:sorts');
        } }));
};
export default hot(module)(PermanentSearchSort);
//# sourceMappingURL=permanent-search-sort.js.map