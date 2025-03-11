/*
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
package org.codice.ddf.catalog.ui.util;

import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;
import com.google.gson.stream.JsonWriter;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class InstantTypeAdapter extends TypeAdapter<Instant> {
  @Override
  public void write(JsonWriter jsonWriter, Instant value) throws IOException {
    if (value == null) {
      jsonWriter.nullValue();
    } else {
      jsonWriter.value(value.atOffset(ZoneOffset.UTC).format(DateTimeFormatter.ISO_DATE_TIME));
    }
  }

  @Override
  public Instant read(JsonReader jsonReader) throws IOException {
    JsonToken token = jsonReader.peek();
    if (token == JsonToken.NULL) {
      jsonReader.nextNull();
      return null;
    }
    String instantStr = jsonReader.nextString();
    return ZonedDateTime.parse(instantStr, DateTimeFormatter.ISO_DATE_TIME).toInstant();
  }
}
