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
package org.codice.ddf.catalog.ui.preferences;

import com.google.common.collect.ImmutableMap;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.codice.ddf.preferences.DefaultPreferencesSupplier;

public class DefaultCatalogUiPreferences implements DefaultPreferencesSupplier {
  @Override
  public Map<String, Object> create() {

    Map<String, Object> defaults = new HashMap<>();

    defaults.put("resultDisplay", "List");
    defaults.put("resultPreview", Collections.singletonList("modified"));
    defaults.put("inspector-hideEmpty", false);
    defaults.put("inspector-summaryShown", Collections.emptyList());
    defaults.put("inspector-summaryOrder", Collections.emptyList());
    defaults.put(
        "inspector-detailsOrder", Arrays.asList("title", "created", "modified", "thumbnail"));
    defaults.put("inspector-detailsHidden", Collections.emptyList());
    defaults.put("results-attributesShownTable", Collections.emptyList());
    defaults.put("results-attributesShownList", Collections.emptyList());
    defaults.put("homeFilter", "Owned by anyone");
    defaults.put("homeSort", "Last modified");
    defaults.put("homeDisplay", "Grid");
    defaults.put("decimalPrecision", 2);
    defaults.put("alertPersistence", true);
    defaults.put("alertExpiration", 2592000000L);
    defaults.put("visualization", "3dmap");
    defaults.put("columnHide", Collections.emptyList());
    defaults.put("columnOrder", Arrays.asList("title", "created", "modified", "thumbnail"));
    defaults.put("columnWidths", Collections.emptyList());
    defaults.put("hasSelectedColumns", false);
    defaults.put("oauth", Collections.emptyList());
    defaults.put("fontSize", 16);
    defaults.put("resultCount", 250);
    defaults.put(
        "dateTimeFormat",
        new ImmutableMap.Builder<>()
            .put("datetimefmt", "YYYY-MM-DD[T]HH:mm:ss.SSSZ")
            .put("timefmt", "HH:mm:ssZ")
            .build());
    defaults.put("timeZone", "Etc/UTC");
    defaults.put("coordinateFormat", "degrees");
    defaults.put("autoPan", true);
    defaults.put("animation", true);
    defaults.put("hoverPreview", true);
    defaults.put("actingRole", "user");
    defaults.put("layoutId", "custom");

    Map<String, Object> params =
        new ImmutableMap.Builder<String, Object>()
            .put("imageSize", Arrays.asList(10800, 5400))
            .build();

    // TODO what about the id field?? The MapLayers in the UI code was providing this id, but I'm
    // not sure what I should set it to here
    defaults.put(
        "mapLayers",
        Collections.singletonList(
            new ImmutableMap.Builder<>()
                .put("type", "SI")
                .put("url", "./images/natural_earth_50m.png")
                .put("parameters", params)
                .put("alpha", 1)
                .put("name", "Default Layer")
                .put("show", true)
                .put("proxyEnabled", true)
                .put("order", 0)
                .put("label", "Type: SI")
                .put("id", "ea47d249-a502-4a08-93c5-2fc53c63532c")
                .build()));
    defaults.put("alerts", Collections.emptyList());
    defaults.put("uploads", Collections.emptyList());
    defaults.put(
        "theme",
        new ImmutableMap.Builder<>().put("palette", "custom").put("theme", "dark").build());
    defaults.put(
        "querySettings",
        new ImmutableMap.Builder<>()
            .put("type", "text")
            .put("sources", Collections.singletonList("all"))
            .put(
                "sorts",
                Collections.singletonList(
                    new ImmutableMap.Builder<>()
                        .put("attribute", "modified")
                        .put("direction", "descending")
                        .build()))
            .put("spellcheck", false)
            .put("phonetics", false)
            .build());

    return defaults;
  }
}
