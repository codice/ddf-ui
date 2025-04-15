package org.codice.ddf.catalog.ui.ws;

import org.eclipse.jetty.websocket.server.WebSocketUpgradeFilter;
import org.eclipse.jetty.websocket.servlet.WebSocketCreator;

public class WebsocketUpgradeFilterWrapper extends WebSocketUpgradeFilter {
  public WebsocketUpgradeFilterWrapper(WebSocketCreator webSocketCreator) {

    super();
    //    this.addMapping("/*", webSocketCreator);
  }
}
