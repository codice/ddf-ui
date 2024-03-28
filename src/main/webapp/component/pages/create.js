import { __read } from "tslib";
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import * as React from 'react';
import { hot } from 'react-hot-loader';
import { useHistory } from 'react-router-dom';
import { AsyncTasks } from '../../js/model/AsyncTask/async-task';
import { useQuery, UserQuery } from '../../js/model/TypedQuery';
import { useMenuState } from '../menu-state/menu-state';
import { Elevations } from '../theme/theme';
import { OpenSearch, SaveForm } from './search';
import SelectionInterfaceModel from '../selection-interface/selection-interface.model';
var selectionInterface = new SelectionInterfaceModel();
var Open = function () {
    var history = useHistory();
    var openMenuState = useMenuState();
    var titleMenuState = useMenuState();
    var fromExistingMenuState = useMenuState();
    var _a = __read(useQuery(), 1), search = _a[0];
    React.useEffect(function () {
        openMenuState.handleClick();
    }, []);
    React.useEffect(function () {
        selectionInterface.setCurrentQuery(search);
    }, []);
    return (React.createElement("div", { className: "w-full h-full p-2" },
        React.createElement(Button, { component: "div", onClick: openMenuState.handleClick, className: "text-2xl pb-2", variant: "contained", color: "primary", ref: openMenuState.anchorRef }, "Create"),
        React.createElement(Popover, { open: titleMenuState.open, anchorEl: titleMenuState.anchorRef.current, onClose: titleMenuState.handleClose, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } },
            React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2" },
                React.createElement(SaveForm, { selectionInterface: selectionInterface, onClose: function () {
                        titleMenuState.handleClose();
                    }, onSave: function (title) {
                        var searchData = UserQuery().toJSON();
                        searchData.title = title;
                        var task = AsyncTasks.createSearch({ data: searchData });
                        history.push({
                            pathname: "/search/".concat(task.data.id),
                            search: '',
                        });
                    } }))),
        React.createElement(Popover, { open: fromExistingMenuState.open, anchorEl: fromExistingMenuState.anchorRef.current, onClose: fromExistingMenuState.handleClose, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } },
            React.createElement(Paper, { elevation: Elevations.overlays, className: "p-2 w-64" },
                React.createElement(OpenSearch, { label: "", constructLink: function (result) {
                        return "/search/".concat(result.plain.id);
                    }, onFinish: function (value) {
                        var copy = JSON.parse(JSON.stringify(value.plain.metacard.properties));
                        delete copy.id;
                        copy.title = "New from '".concat(copy.title, "'");
                        var task = AsyncTasks.createSearch({ data: copy });
                        // replace because technically they get the link in constructLink put into history as well unfortunately, will need to fix this more generally
                        history.replace({
                            pathname: "/search/".concat(task.data.id),
                            search: '',
                        });
                    }, autocompleteProps: {
                        fullWidth: true,
                        className: 'w-full',
                    } }))),
        React.createElement(Popover, { open: openMenuState.open, onClose: openMenuState.handleClose, anchorEl: openMenuState.anchorRef.current, anchorOrigin: { vertical: 'bottom', horizontal: 'left' } },
            React.createElement(MenuItem, { component: "div", ref: titleMenuState.anchorRef, onClick: function () {
                    titleMenuState.handleClick();
                } }, "Search"),
            React.createElement(MenuItem, { component: "div", ref: fromExistingMenuState.anchorRef, onClick: function () {
                    fromExistingMenuState.handleClick();
                } }, "Search from existing"))));
};
export default hot(module)(Open);
//# sourceMappingURL=create.js.map