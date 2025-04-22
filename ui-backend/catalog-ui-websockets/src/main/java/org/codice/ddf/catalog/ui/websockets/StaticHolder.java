package org.codice.ddf.catalog.ui.websockets;

import org.eclipse.jetty.websocket.servlet.WebSocketCreator;

public class StaticHolder {
  public static WebSocketCreator webSocketCreator;

  public StaticHolder(WebSocketCreator webSocketCreator) {
    StaticHolder.webSocketCreator = webSocketCreator;
  }
}
