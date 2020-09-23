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
package org.codice.ddf.catalog.audit.logging;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import ddf.security.audit.SecurityLogger;
import java.util.Arrays;
import org.codice.ddf.catalog.audit.api.AuditException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;

@RunWith(MockitoJUnitRunner.class)
public class AuditLoggerTest {

  private final String ACTION = "action";
  private final String COMPONENT = "component";
  private final String ID_1 = "id1";
  private final String ID_2 = "id2";
  private final String EXCEPTION = "exception";
  private final String[] IDS = Arrays.asList(ID_1, ID_2).toArray(new String[0]);
  private Throwable cause;

  private AuditLogger auditLogger;
  @Mock private SecurityLogger securityLogger;

  @Before
  public void setup() {
    auditLogger = new AuditLogger(securityLogger);
    cause = new Throwable();
  }

  @Test
  public void testAuditLogWithId() throws AuditException {
    auditLogger.log(ACTION, COMPONENT, ID_1);
    verify(securityLogger, Mockito.times(1))
        .audit(any(String.class), ArgumentMatchers.<String>any());
  }

  @Test
  public void testAuditLogWithIds() throws AuditException {
    auditLogger.log(ACTION, COMPONENT, IDS);
    verify(securityLogger, Mockito.times(2))
        .audit(any(String.class), ArgumentMatchers.<String>any());
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithNullAction() throws AuditException {
    auditLogger.log(null, COMPONENT, IDS);
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithNullComponent() throws AuditException {
    auditLogger.log(ACTION, null, IDS);
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithNullId() throws AuditException {
    auditLogger.log(ACTION, COMPONENT, Arrays.asList(ID_1, null).toArray(new String[0]));
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithEmptyAction() throws AuditException {
    auditLogger.log("", COMPONENT, IDS);
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithEmptyComponent() throws AuditException {
    auditLogger.log(ACTION, "", IDS);
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithEmptyId() throws AuditException {
    auditLogger.log(ACTION, COMPONENT, "");
  }

  @Test
  public void testAuditLogWithNoIds() throws AuditException {
    auditLogger.log(ACTION, COMPONENT);
    verify(securityLogger, Mockito.times(1))
        .audit(any(String.class), ArgumentMatchers.<String>any());
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithNoIdsNullAction() throws AuditException {
    auditLogger.log(null, COMPONENT);
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithNoIdsNullComponent() throws AuditException {
    auditLogger.log(ACTION, null);
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithNoIdsEmptyAction() throws AuditException {
    auditLogger.log("", COMPONENT);
  }

  @Test(expected = AuditException.class)
  public void testAuditLogWithNoIdsEmptyComponent() throws AuditException {
    auditLogger.log(ACTION, "");
  }

  @Test
  public void testAuditLogError() throws AuditException {
    auditLogger.logError(ACTION, COMPONENT, new AuditException(EXCEPTION));
    verify(securityLogger, Mockito.times(1))
        .audit(any(String.class), ArgumentMatchers.<String>any());
  }

  @Test(expected = AuditException.class)
  public void testAuditLogErrorWithNullAction() throws AuditException {
    auditLogger.logError(null, COMPONENT, new AuditException(EXCEPTION));
  }

  @Test(expected = AuditException.class)
  public void testAuditLogErrorWithNullComponent() throws AuditException {
    auditLogger.logError(ACTION, null, new AuditException(EXCEPTION));
  }

  @Test(expected = AuditException.class)
  public void testAuditLogErrorWithNullThrowable() throws AuditException {
    auditLogger.logError(ACTION, COMPONENT, null);
  }

  @Test(expected = AuditException.class)
  public void testAuditLogErrorWithEmptyAction() throws AuditException {
    auditLogger.logError("", COMPONENT, new AuditException(EXCEPTION));
  }

  @Test(expected = AuditException.class)
  public void testAuditLogErrorWithEmptyComponent() throws AuditException {
    auditLogger.logError(ACTION, "", new AuditException(EXCEPTION));
  }
}
