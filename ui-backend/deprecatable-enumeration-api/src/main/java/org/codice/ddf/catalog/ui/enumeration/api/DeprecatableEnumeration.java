/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.ui.enumeration.api;

import java.util.Set;

public interface DeprecatableEnumeration {

  /** Get an unmodifable set of deprecated values. */
  Set<String> getDeprecatedValues();

  /** The name of the attribute. */
  String getAttribute();
}
