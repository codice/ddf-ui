package org.codice.ddf.catalog.ui.security;

import ddf.security.service.SecurityServiceException;
import java.lang.reflect.InvocationTargetException;
import java.util.concurrent.Callable;
import org.codice.ddf.security.Security;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class IntrigueSecurity {
  private static final Logger LOGGER = LoggerFactory.getLogger(IntrigueSecurity.class);
  private static final String KARAF_LOCAL_ROLE = "karaf.local.roles";

  private final Security security;

  public IntrigueSecurity(Security security) {
    this.security = security;
  }

  public <T> T runAsSystemForIntrigue(Runnable action) {
    return runAsSystemForIntrigue(
        () -> {
          action.run();
          return null;
        });
  }

  public <T> T runAsSystemForIntrigue(Callable<T> action) {
    try {
      return security.runWithSubjectOrElevate(action);
    } catch (SecurityServiceException | InvocationTargetException e) {
      LOGGER.debug("Could not elevate subject to run action", e);
      throw new RuntimeException(e);
    }
  }

  public ddf.security.Subject getSystemSubject() {
    return security.getSystemSubject();
  }
}
