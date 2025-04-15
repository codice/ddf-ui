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
package org.codice.ddf.catalog.ui.ws;

import java.util.Dictionary;
import java.util.Hashtable;
import org.eclipse.jetty.http.pathmap.PathSpec;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.websocket.server.WebSocketUpgradeFilter;
import org.eclipse.jetty.websocket.servlet.WebSocketCreator;
import org.osgi.framework.BundleContext;
import org.osgi.service.http.whiteboard.HttpWhiteboardConstants;

public class WebSocketStart {

  private WebSocketCreator webSocketCreator;

  private BundleContext bundleContext;

  public WebSocketStart(BundleContext bundleContext, WebSocketCreator webSocketCreator) {
    this.webSocketCreator = webSocketCreator;
    this.bundleContext = bundleContext;
    try {
      start();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void start() throws Exception {

    ServletContextHandler servletContextHandler =
        new ServletContextHandler(ServletContextHandler.SESSIONS);
    servletContextHandler.setContextPath("/search/catalog/ws");

    ServletContextHandler notesServletContextHandler =
        new ServletContextHandler(ServletContextHandler.SESSIONS);
    servletContextHandler.setContextPath("/search/catalog/notes");

    WebSocketUpgradeFilter filter = WebSocketUpgradeFilter.configureContext(servletContextHandler);
    filter
        .getConfiguration()
        .addMapping(PathSpec.from("/*"), (req, res) -> webSocketCreator.createWebSocket(req, res));
    filter
        .getConfiguration()
        .addMapping(PathSpec.from("/ws"), (req, res) -> webSocketCreator.createWebSocket(req, res));

    WebSocketUpgradeFilter notesFilter =
        WebSocketUpgradeFilter.configureContext(notesServletContextHandler);
    notesFilter
        .getConfiguration()
        .addMapping(PathSpec.from("/*"), (req, res) -> webSocketCreator.createWebSocket(req, res));
    notesFilter
        .getConfiguration()
        .addMapping(PathSpec.from("/ws"), (req, res) -> webSocketCreator.createWebSocket(req, res));

    Dictionary<String, String> properties = new Hashtable<>();
    properties.put(HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_PATH, "/search/catalog/ws");
    properties.put(HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_NAME, "websocketContextHelper");

    Dictionary<String, String> notesProperties = new Hashtable<>();
    notesProperties.put(
        HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_PATH, "/search/catalog/notes");
    notesProperties.put(
        HttpWhiteboardConstants.HTTP_WHITEBOARD_CONTEXT_NAME, "noteWebsocketContextHelper");
    bundleContext.registerService(ServletContextHandler.class, servletContextHandler, properties);

    bundleContext.registerService(
        ServletContextHandler.class, notesServletContextHandler, notesProperties);
  }
}
