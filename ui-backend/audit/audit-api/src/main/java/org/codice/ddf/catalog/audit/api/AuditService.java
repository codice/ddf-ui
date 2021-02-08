package org.codice.ddf.catalog.audit.api;
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

import java.util.List;

/**
 * This interface represents a service that will be used to log an event that occurred from a
 * particular user or a set or users.
 */
public interface AuditService {
  /**
   * @param action past tense verb defining the user interaction such as 'clicked' or 'viewed'
   * @param component the UI object that caused the event
   * @param ids the set of metacard id of the object
   */
  void log(String action, String component, String... ids) throws AuditException;

  /**
   * @param action past tense verb defining the user interaction such as 'clicked' or 'viewed'
   * @param component the UI object that caused the event
   * @param items List of objects to log
   */
  void log(String action, String component, List<AuditItemBasic> items) throws AuditException;

  /**
   * @param action future tense verb defining the user interaction such as 'will click' or 'will
   *     view'
   * @param component the UI object that will cause the event
   */
  void log(String action, String component) throws AuditException;

  /**
   * @param action past tense verb defining the user interaction such as 'clicked' or 'viewed'
   * @param component the UI object that caused the event
   * @param cause the reason the interaction failed
   */
  void logError(String action, String component, Throwable cause) throws AuditException;
}
