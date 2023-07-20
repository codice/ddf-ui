/* Copyright (c) Connexta, LLC */
package org.codice.ddf.catalog.search.javacc;

/**
 * An exception intended to be thrown by the generated JavaCC parser to indicate an error message
 * suitable for displaying to a user. We want to use our own exception class, rather than JavaCC's
 * ParseException, so we can easily distinguish between our exceptions, with 'nice' messages, and
 * JavaCC's, with messages that users wouldn't understand, by catching a different exception instead
 * of parsing the exception message.
 */
public class CustomParseException extends Exception {
  public CustomParseException(String message) {
    super(message);
  }
}
