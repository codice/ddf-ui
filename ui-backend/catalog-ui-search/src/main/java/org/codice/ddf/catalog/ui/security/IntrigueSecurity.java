package org.codice.ddf.catalog.ui.security;

import ddf.security.common.audit.SecurityLogger;
import ddf.security.service.SecurityManager;
import ddf.security.service.SecurityServiceException;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.AccessController;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.Principal;
import java.security.PrivilegedAction;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Callable;
import javax.annotation.Nullable;
import javax.security.auth.AuthPermission;
import javax.security.auth.Subject;
import org.apache.karaf.jaas.boot.principal.RolePrincipal;
import org.apache.shiro.authc.AuthenticationToken;
import org.osgi.framework.Bundle;
import org.osgi.framework.BundleContext;
import org.osgi.framework.FrameworkUtil;
import org.osgi.framework.ServiceReference;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class IntrigueSecurity {
  private static final Logger LOGGER = LoggerFactory.getLogger(IntrigueSecurity.class);
  private static final String KARAF_LOCAL_ROLE = "karaf.local.roles";
  private static final Subject ADMIN_JAVA_SUBJECT = getAdminJavaSubject();
  private static final IntrigueSecurity INSTANCE = new IntrigueSecurity();
  private static final AuthPermission GET_SYSTEM_SUBJECT_PERMISSION =
      new AuthPermission("getSystemSubject");
  private ddf.security.Subject cachedSystemSubject;

  public static IntrigueSecurity getInstance() {
    return INSTANCE;
  }

  public <T> T runAsSystemForIntrigue(Runnable action) {
    return runAsSystemForIntrigue(
        () -> {
          action.run();
          return null;
        });
  }

  public <T> T runAsSystemForIntrigue(Callable<T> action) {
    return javax.security.auth.Subject.doAs(
            ADMIN_JAVA_SUBJECT,
            (PrivilegedAction<ddf.security.Subject>)
                () -> {
                  SecurityLogger.audit("Attempting to get System Subject");
                  final java.lang.SecurityManager security = System.getSecurityManager();

                  if (security != null) {
                    security.checkPermission(GET_SYSTEM_SUBJECT_PERMISSION);
                  }
                  if (!javaSubjectHasAdminRole()) {
                    SecurityLogger.audit("Unable to retrieve system subject.");
                    return null;
                  }

                  if (cachedSystemSubject != null) {
                    return cachedSystemSubject;
                  }

                  KeyStore keyStore =
                      AccessController.doPrivileged(
                          (PrivilegedAction<KeyStore>) this::getSystemKeyStore);
                  String alias = null;
                  Certificate cert = null;
                  try {
                    if (keyStore != null) {
                      if (keyStore.size() == 1) {
                        alias = keyStore.aliases().nextElement();
                      } else if (keyStore.size() > 1) {
                        alias = getCertificateAlias();
                      }
                      cert = keyStore.getCertificate(alias);
                    }
                  } catch (KeyStoreException e) {
                    LOGGER.warn("Unable to get certificate for alias [{}]", alias, e);
                    return null;
                  }

                  if (cert == null) {
                    LOGGER.warn("Unable to get certificate for alias [{}]", alias);
                    return null;
                  }
                  X509Certificate[] certs = new X509Certificate[] {(X509Certificate) cert};
                  String ip = "127.0.0.1";

                  if (certs == null || certs.length == 0) {
                    return null;
                  }

                  SecurityManager securityManager = getSecurityManager();
                  if (securityManager != null) {
                    try {
                      cachedSystemSubject =
                          securityManager.getSubject(
                              new AuthenticationToken() {
                                @Override
                                public Object getPrincipal() {
                                  return certs[0].getSubjectX500Principal();
                                }

                                @Override
                                public Object getCredentials() {
                                  return certs;
                                }
                              });
                    } catch (SecurityServiceException sse) {
                      LOGGER.warn("Unable to request subject for system user.", sse);
                    }
                  }
                  return cachedSystemSubject;
                })
        .execute(action);
  }

  public ddf.security.Subject getSystemSubject() {
    return javax.security.auth.Subject.doAs(
        ADMIN_JAVA_SUBJECT,
        (PrivilegedAction<ddf.security.Subject>)
            () -> {
              SecurityLogger.audit("Attempting to get System Subject");
              final java.lang.SecurityManager security = System.getSecurityManager();

              if (security != null) {
                security.checkPermission(GET_SYSTEM_SUBJECT_PERMISSION);
              }
              if (!javaSubjectHasAdminRole()) {
                SecurityLogger.audit("Unable to retrieve system subject.");
                return null;
              }

              if (cachedSystemSubject != null) {
                return cachedSystemSubject;
              }

              KeyStore keyStore =
                  AccessController.doPrivileged(
                      (PrivilegedAction<KeyStore>) this::getSystemKeyStore);
              String alias = null;
              Certificate cert = null;
              try {
                if (keyStore != null) {
                  if (keyStore.size() == 1) {
                    alias = keyStore.aliases().nextElement();
                  } else if (keyStore.size() > 1) {
                    alias = getCertificateAlias();
                  }
                  cert = keyStore.getCertificate(alias);
                }
              } catch (KeyStoreException e) {
                LOGGER.warn("Unable to get certificate for alias [{}]", alias, e);
                return null;
              }

              if (cert == null) {
                LOGGER.warn("Unable to get certificate for alias [{}]", alias);
                return null;
              }
              X509Certificate[] certs = new X509Certificate[] {(X509Certificate) cert};
              String ip = "127.0.0.1";

              if (certs == null || certs.length == 0) {
                return null;
              }

              SecurityManager securityManager = getSecurityManager();
              if (securityManager != null) {
                try {
                  cachedSystemSubject =
                      securityManager.getSubject(
                          new AuthenticationToken() {
                            @Override
                            public Object getPrincipal() {
                              return certs[0].getSubjectX500Principal();
                            }

                            @Override
                            public Object getCredentials() {
                              return certs;
                            }
                          });
                } catch (SecurityServiceException sse) {
                  LOGGER.warn("Unable to request subject for system user.", sse);
                }
              }
              return cachedSystemSubject;
            });
  }

  /**
   * Determines if the current Java {@link ddf.security.Subject} has the admin role.
   *
   * @return {@code true} if the Java {@link ddf.security.Subject} exists and has the admin role,
   *     {@code false} otherwise
   * @throws SecurityException if a security manager exists and the {@link
   *     javax.security.auth.AuthPermission AuthPermission("getSubject")} permission is not
   *     authorized
   */
  public final boolean javaSubjectHasAdminRole() {
    javax.security.auth.Subject subject =
        javax.security.auth.Subject.getSubject(AccessController.getContext());
    if (subject != null) {
      String localRoles =
          AccessController.doPrivileged(
              (PrivilegedAction<String>) () -> System.getProperty(KARAF_LOCAL_ROLE, ""));
      Collection<RolePrincipal> principals = new ArrayList<>();
      for (String role : localRoles.split(",")) {
        principals.add(new RolePrincipal(role));
      }
      return subject.getPrincipals().containsAll(principals);
    }
    return false;
  }

  public KeyStore getSystemKeyStore() {
    KeyStore keyStore;

    try {
      keyStore = KeyStore.getInstance(System.getProperty("javax.net.ssl.keyStoreType"));

    } catch (KeyStoreException e) {
      LOGGER.warn(
          "Unable to create keystore instance of type {}",
          System.getProperty("javax.net.ssl.keyStoreType"),
          e);
      return null;
    }

    Path keyStoreFile = new File(System.getProperty("javax.net.ssl.keyStore")).toPath();
    Path ddfHomePath = Paths.get(System.getProperty("ddf.home"));

    if (!keyStoreFile.isAbsolute()) {
      keyStoreFile = Paths.get(ddfHomePath.toString(), keyStoreFile.toString());
    }

    String keyStorePassword = System.getProperty("javax.net.ssl.keyStorePassword");

    if (!Files.isReadable(keyStoreFile)) {
      LOGGER.warn("Unable to read system key/trust store files: [ {} ] ", keyStoreFile);
      return null;
    }

    try (InputStream kfis = Files.newInputStream(keyStoreFile)) {
      keyStore.load(kfis, keyStorePassword.toCharArray());
    } catch (NoSuchAlgorithmException | CertificateException | IOException e) {
      LOGGER.warn("Unable to load system key file.", e);
    }

    return keyStore;
  }

  private String getCertificateAlias() {
    return System.getProperty("org.codice.ddf.system.hostname");
  }

  /**
   * Gets a reference to the {@link SecurityManager}.
   *
   * @return reference to the {@link SecurityManager} or {@code null} if unable to get the {@link
   *     SecurityManager}
   */
  @Nullable
  public SecurityManager getSecurityManager() {
    BundleContext context = getBundleContext();
    if (context != null) {
      ServiceReference securityManagerRef = context.getServiceReference(SecurityManager.class);
      if (securityManagerRef != null) {
        return (SecurityManager) context.getService(securityManagerRef);
      }
    }
    LOGGER.warn(
        "Unable to get Security Manager. Authentication and Authorization mechanisms will not work correctly. A restart of the system may be necessary.");
    return null;
  }

  BundleContext getBundleContext() {
    Bundle bundle = FrameworkUtil.getBundle(IntrigueSecurity.class);
    if (bundle != null) {
      return bundle.getBundleContext();
    }
    return null;
  }

  private static javax.security.auth.Subject getAdminJavaSubject() {
    Set<Principal> principals = new HashSet<>();
    String localRoles =
        AccessController.doPrivileged(
            (PrivilegedAction<String>) () -> System.getProperty(KARAF_LOCAL_ROLE, ""));
    for (String role : localRoles.split(",")) {
      principals.add(new RolePrincipal(role));
    }
    return new javax.security.auth.Subject(true, principals, new HashSet(), new HashSet());
  }
}
