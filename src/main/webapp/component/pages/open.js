import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useHistory } from 'react-router-dom';
import useSnack from '../hooks/useSnack';
import { OpenSearch } from './search';
var Open = function () {
    var history = useHistory();
    var addSnack = useSnack();
    return (React.createElement("div", { className: "w-full h-full p-2" },
        React.createElement("div", { className: "text-2xl pb-2" }, "Open a search"),
        React.createElement(OpenSearch, { label: "", constructLink: function (result) {
                return "/search/".concat(result.plain.id);
            }, onFinish: function (value) {
                // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                history.replace({
                    pathname: "/search/".concat(value.plain.id),
                    search: '',
                });
                addSnack("Search '".concat(value.plain.metacard.properties.title, "' opened"), {
                    alertProps: { severity: 'info' },
                });
            }, autocompleteProps: {
                fullWidth: true,
                className: 'w-full',
            } })));
};
export default hot(module)(Open);
//# sourceMappingURL=open.js.map