package org.codice.ddf.catalog.ui.websockets;

import org.eclipse.jetty.websocket.servlet.ServletUpgradeRequest;
import org.eclipse.jetty.websocket.servlet.ServletUpgradeResponse;
import org.eclipse.jetty.websocket.servlet.WebSocketCreator;

public class CustomWebSocketCreator implements WebSocketCreator {

  @Override
  public Object createWebSocket(
      ServletUpgradeRequest servletUpgradeRequest, ServletUpgradeResponse servletUpgradeResponse) {
    return StaticHolder.webSocketCreator.createWebSocket(
        servletUpgradeRequest, servletUpgradeResponse);
  }
}
