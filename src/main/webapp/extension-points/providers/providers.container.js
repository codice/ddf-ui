/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import * as React from 'react';
import { hot } from 'react-hot-loader';
import ThemeContainer from '../../react-component/theme';
import { IntlProvider } from 'react-intl';
import { Provider as ThemeProvider } from '../../component/theme/theme';
import { SnackProvider } from '../../component/snack/snack.provider';
import { DialogProvider } from '../../component/dialog';
import { HashRouter as Router } from 'react-router-dom';
import { useConfiguration } from '../../js/model/Startup/configuration.hooks';
var ProviderContainer = function (props) {
    var getI18n = useConfiguration().getI18n;
    return (React.createElement(React.Fragment, null,
        React.createElement(ThemeContainer, null,
            React.createElement(IntlProvider, { locale: navigator.language, messages: getI18n() },
                React.createElement(ThemeProvider, null,
                    React.createElement(Router, null,
                        React.createElement(SnackProvider, null,
                            React.createElement(DialogProvider, null,
                                React.createElement(React.Fragment, null, props.children)))))))));
};
export default hot(module)(ProviderContainer);
//# sourceMappingURL=providers.container.js.map