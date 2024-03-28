import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useHistory } from 'react-router-dom';
import { AsyncTasks } from '../../js/model/AsyncTask/async-task';
import { OpenSearch } from './search';
var Open = function () {
    var history = useHistory();
    return (React.createElement("div", { className: "w-full h-full p-2" },
        React.createElement("div", { className: "text-2xl pb-2" }, "Restore a search"),
        React.createElement(OpenSearch, { archived: true, label: "", constructLink: function (result) {
                var copy = JSON.parse(JSON.stringify(result.plain.metacard.properties));
                delete copy.id;
                delete copy.title;
                delete copy['metacard.deleted.date'];
                delete copy['metacard.deleted.id'];
                delete copy['metacard.deleted.tags'];
                delete copy['metacard.deleted.version'];
                delete copy['metacard-tags'];
                delete copy['metacard-type'];
                var encodedQueryModel = encodeURIComponent(JSON.stringify(copy));
                return {
                    pathname: '/search',
                    search: "?defaultQuery=".concat(encodedQueryModel),
                };
            }, onFinish: function (result) {
                AsyncTasks.restore({ lazyResult: result });
                // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                history.replace({
                    pathname: "/search/".concat(result.plain.metacard.properties['metacard.deleted.id']),
                    search: '',
                });
            }, autocompleteProps: {
                fullWidth: true,
                className: 'w-full',
            } })));
};
export default hot(module)(Open);
//# sourceMappingURL=restore.js.map