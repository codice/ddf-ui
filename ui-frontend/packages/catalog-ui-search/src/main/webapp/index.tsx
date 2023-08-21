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
// check browser before loading the rest of the app
import { isSupportedBrowser } from './check-browser'
//@ts-ignore
import { StartupDataStore } from './js/model/Startup/startup'
;(async () => {
  // check if supported browser
  if (isSupportedBrowser()) {
    console.log('supported')
    // wait for critical data to be fetched
    await (await import('./js/WaitForReady')).waitForReady()
    // render the app
    console.log('config fetched')
    await import('./app')
  }
})()
