/**
 * Copyright (c) Codice Foundation
 *
 * <p>This is free software: you can redistribute it and/or modify it under the terms of the GNU
 * Lesser General Public License as published by the Free Software Foundation, either version 3 of
 * the License, or any later version.
 *
 * <p>This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details. A copy of the GNU Lesser General Public
 * License is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 */
package org.codice.ddf.catalog.ui.session;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.net.URI;
import javax.servlet.http.HttpServletRequest;
import org.codice.ddf.security.session.management.service.SessionManagementService;
import org.junit.Before;
import org.junit.Test;

public class SessionManagementApplicationTest {

  private SessionManagementService sessionManagement;
  private SessionManagementApplication app;

  @Before
  public void setup() {
    sessionManagement = mock(SessionManagementService.class);
    app = new SessionManagementApplication(sessionManagement);
  }

  @Test
  public void invalidateReturnsLogoutUri() throws Exception {
    URI logoutUri = URI.create("https://localhost/logout?service=https://localhost/search");
    HttpServletRequest request = mock(HttpServletRequest.class);
    when(sessionManagement.getInvalidate(request)).thenReturn(logoutUri);

    String result = app.handleInvalidate(request);

    assertThat(result, is(logoutUri.toString()));
  }
}
