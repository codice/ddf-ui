import * as React from 'react';
import { useDialog } from '../dialog';
import { Overridable } from '../../js/model/Base/base-classes';
import { useOverridable } from '../../js/model/Base/base-classes.hooks';
export var normalDownload = function (_a) {
    var result = _a.result;
    var downloadUrl = result.getDownloadUrl();
    downloadUrl && window.open(downloadUrl);
};
// in ddf-ui, we just open the download url and immediately close the dialog, so it should act as before
export var BaseDownload = function (_a) {
    var lazyResults = _a.lazyResults;
    var setProps = useDialog().setProps;
    React.useEffect(function () {
        lazyResults.forEach(function (lazyResult) {
            normalDownload({ result: lazyResult });
        });
        setProps({ open: false });
    }, []);
    return React.createElement(React.Fragment, null);
};
export var OverridableDownload = new Overridable(BaseDownload);
export var useDownloadComponent = function () {
    return useOverridable(OverridableDownload);
};
//# sourceMappingURL=download.js.map