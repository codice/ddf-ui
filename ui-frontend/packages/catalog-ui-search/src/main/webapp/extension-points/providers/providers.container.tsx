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
import * as React from 'react'
import { hot } from 'react-hot-loader'

import ThemeContainer from '../../react-component/theme'
import { IntlProvider } from 'react-intl'
import { Provider as ThemeProvider } from '../../component/theme/theme'
import { SnackProvider } from '../../component/snack/snack.provider'
import { DialogProvider } from '../../component/dialog'
import { HashRouter as Router } from 'react-router-dom'
import { useConfiguration } from '../../js/model/Startup/configuration.hooks'

export type Props = {
  children: React.ReactNode
}

const ProviderContainer = (props: Props) => {
  const { getI18n } = useConfiguration()
  return (
    <React.Fragment>
      <ThemeContainer>
        <IntlProvider locale={navigator.language} messages={getI18n()}>
          <ThemeProvider>
            <Router>
              <SnackProvider>
                <DialogProvider>
                  <>{props.children}</>
                </DialogProvider>
              </SnackProvider>
            </Router>
          </ThemeProvider>
        </IntlProvider>
      </ThemeContainer>
    </React.Fragment>
  )
}

export default hot(module)(ProviderContainer)
