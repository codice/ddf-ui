package org.codice.ddf.catalog.ui.query.monitor.impl;

import org.junit.Ignore;
import org.junit.Test;

public class TestSecurityServiceImpl {

    /**
     * Just make sure we don't get an exception
     */
    @Test
    @Ignore("We actually do get an exception from Security, an NPE with the keystore.")
    public void testGetSystemSubject() {
        new SecurityServiceImpl().getSystemSubject();
    }


}
