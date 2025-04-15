package org.codice.ddf.catalog.ui.ws;

import javax.servlet.annotation.WebServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServlet;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;

@WebServlet(
  name = "Example WebSocket Servlet",
  urlPatterns = {"/example-websocket "}
)
public class WebsocketExampleServlet extends WebSocketServlet {

  @Override
  public void configure(WebSocketServletFactory factory) {
    factory.register(KarafWebSocket.class);
  }
}
