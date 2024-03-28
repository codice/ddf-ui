import React from 'react';
import useSnack from '../hooks/useSnack';
import { useListenTo } from '../selection-checkbox/useBackbone.hook';
import wreqr from '../../js/wreqr';
/**
 *  Would be nice to eventually remove, but for now this is easier than removing announcements from non view areas
 */
export var WreqrSnacks = function () {
    var addSnack = useSnack();
    useListenTo(wreqr.vent, 'snack', function (_a) {
        var message = _a.message, snackProps = _a.snackProps;
        addSnack(message, snackProps);
    });
    return React.createElement(React.Fragment, null);
};
//# sourceMappingURL=wreqr-snacks.js.map