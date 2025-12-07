package org.codice.ddf.catalog.multipart.utils;

import java.util.Dictionary;
import java.util.Hashtable;
import org.osgi.framework.BundleActivator;
import org.osgi.framework.BundleContext;

public class MultipartUtilsActivator implements BundleActivator {

  @Override
  public void start(BundleContext context) throws Exception {
    // Register the static factory functionality as a service indirectly
    Dictionary<String, String> properties = new Hashtable<>();
    properties.put("description", "Static factory for creating multipart bodies");

    // Here you register a real reference to your factory class or service object
    context.registerService(
        AutoCloseableMultipartBodyFactory.class.getName(),
        new AutoCloseableMultipartBodyFactory(),
        properties);

    System.out.println("Registered AutoCloseableMultipartBodyFactory service");
  }

  @Override
  public void stop(BundleContext context) throws Exception {
    System.out.println("Bundle stopped");
    // OSGi handles service cleanup automatically
  }
}
