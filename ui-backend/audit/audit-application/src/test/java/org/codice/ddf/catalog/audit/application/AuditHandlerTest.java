package org.codice.ddf.catalog.audit.application;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.javalin.Context;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.codice.ddf.catalog.audit.api.AuditException;
import org.codice.ddf.catalog.audit.api.AuditService;
import org.codice.junit.DeFinalize;
import org.codice.junit.DeFinalizer;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;

@RunWith(DeFinalizer.class)
@DeFinalize(Context.class)
public class AuditHandlerTest {
  private final String ID = "1";
  private final String ID2 = "2";
  private final String ID3 = "3";
  private final String COMPONENT = "notification";
  private final String ACTION = "clicked";

  private Context context;
  private AuditHandler auditHandler;
  private AuditService auditService;

  @Before
  public void setup() {
    context = mock(Context.class);
    auditService = mock(AuditService.class);
    auditHandler = new AuditHandler(auditService);
  }

  @Test
  public void testNullField() throws AuditException {
    AuditRequestBasic basic = mock(AuditRequestBasic.class);
    when(basic.getAction()).thenReturn(null);
    when(context.bodyAsClass(AuditRequestBasic.class)).thenReturn(basic);
    auditHandler.handle(context);

    verify(auditService, Mockito.times(0)).log(ACTION, COMPONENT, ID);
    verify(context, Mockito.times(1)).status(500);
  }

  @Test
  public void testUninitializedBasic() throws AuditException {
    AuditRequestBasic basic = null;
    when(context.bodyAsClass(AuditRequestBasic.class)).thenReturn(basic);
    auditHandler.handle(context);
    verify(auditService, Mockito.times(0)).log(ACTION, COMPONENT, ID);
    verify(context, Mockito.times(1)).status(500);
  }

  @Test
  public void testHandle() throws AuditException {
    Set<String> ids = new HashSet<>(Arrays.asList(ID));
    AuditRequestBasic basic = new AuditRequestBasic(ids, COMPONENT, ACTION);
    when(context.bodyAsClass(AuditRequestBasic.class)).thenReturn(basic);
    auditHandler.handle(context);
    verify(auditService, Mockito.times(1)).log(ACTION, COMPONENT, ids.toArray(new String[0]));
    verify(context, Mockito.times(1)).status(200);
  }

  @Test
  public void testHandleWithIdSet() throws AuditException {
    Set<String> ids = new HashSet<>(Arrays.asList(ID, ID2, ID3));
    AuditRequestBasic basic = new AuditRequestBasic(ids, COMPONENT, ACTION);
    when(context.bodyAsClass(AuditRequestBasic.class)).thenReturn(basic);
    auditHandler.handle(context);
    verify(auditService, Mockito.times(1)).log(ACTION, COMPONENT, ids.toArray(new String[0]));
    verify(context, Mockito.times(1)).status(200);
  }
}
