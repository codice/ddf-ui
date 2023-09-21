import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useSelectedResults } from '../../../../js/model/LazyQueryResult/hooks';
var ZoomToSelection = function (_a) {
    var lazyResults = _a.lazyResults, map = _a.map, zoomToHome = _a.zoomToHome;
    var selectedResults = useSelectedResults({ lazyResults: lazyResults });
    React.useEffect(function () {
        var arrayForm = Object.values(selectedResults);
        if (arrayForm.length > 0) {
            setTimeout(function () {
                map.panToResults(Object.values(selectedResults));
            }, 0);
        }
    }, [selectedResults]);
    React.useEffect(function () {
        var arrayForm = Object.values(selectedResults);
        if (arrayForm.length === 0) {
            setTimeout(function () {
                zoomToHome({ map: map });
            }, 0);
        }
    }, []);
    return null;
};
export default hot(module)(ZoomToSelection);
//# sourceMappingURL=zoom-to-selection.js.map