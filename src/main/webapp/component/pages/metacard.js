import { __read } from "tslib";
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useParams } from 'react-router-dom';
import { useLazyResultsFromSelectionInterface } from '../selection-interface/hooks';
import { GoldenLayout } from '../golden-layout/golden-layout';
import { DEFAULT_QUERY_OPTIONS, useUserQuery } from '../../js/model/TypedQuery';
import { FilterBuilderClass, FilterClass, } from '../filter-builder/filter.structure';
import { getFilterTreeForId } from './metacard-nav';
import SelectionInterfaceModel from '../selection-interface/selection-interface.model';
import user from '../singletons/user-instance';
import _ from 'underscore';
export var getFilterTreeForUpload = function (_a) {
    var upload = _a.upload;
    return new FilterBuilderClass({
        type: 'OR',
        filters: _.flatten(upload
            .get('uploads')
            .filter(function (file) { return file.id || file.get('children') !== undefined; })
            .map(function (file) {
            if (file.get('children') !== undefined) {
                return file.get('children').map(function (child) {
                    return new FilterClass({
                        type: '=',
                        value: child,
                        property: 'id',
                    });
                });
            }
            else {
                return new FilterClass({
                    type: '=',
                    value: file.id,
                    property: 'id',
                });
            }
        })
            .concat(new FilterClass({
            type: '=',
            value: '-1',
            property: 'id',
        }))),
    });
};
var MetacardRoute = function () {
    var params = useParams();
    var _a = __read(React.useState(params.metacardId || params.id), 2), id = _a[0], setId = _a[1];
    React.useEffect(function () {
        setId(params.metacardId || params.id);
    }, [params.metacardId]);
    var _b = __read(useUserQuery({
        attributes: getFilterTreeForId({ id: id }),
        options: {
            transformDefaults: DEFAULT_QUERY_OPTIONS.transformDefaults,
        },
    }), 1), query = _b[0];
    var _c = __read(React.useState(new SelectionInterfaceModel({
        currentQuery: query,
    })), 1), selectionInterface = _c[0];
    React.useEffect(function () {
        if (id === undefined && params.uploadId) {
            var upload = user
                .get('user')
                .get('preferences')
                .get('uploads')
                .get(params.uploadId);
            if (upload) {
                query.set('filterTree', getFilterTreeForUpload({ upload: upload }));
                query.cancelCurrentSearches();
                query.startSearchFromFirstPage();
            }
        }
    }, [id, params.uploadId]);
    React.useEffect(
    // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
    function () {
        if (id) {
            query.set('filterTree', getFilterTreeForId({ id: id }));
            query.cancelCurrentSearches();
            query.startSearchFromFirstPage();
            return function () {
                query.cancelCurrentSearches();
            };
        }
    }, [id]);
    var lazyResults = useLazyResultsFromSelectionInterface({
        selectionInterface: selectionInterface,
    });
    var filteredResults = Object.values(lazyResults.results);
    filteredResults.forEach(function (result) {
        result.setSelected(true);
    });
    return React.createElement(GoldenLayout, { selectionInterface: selectionInterface });
};
export default hot(module)(MetacardRoute);
//# sourceMappingURL=metacard.js.map