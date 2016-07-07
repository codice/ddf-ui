package org.codice.ddf.catalog.ui.query.monitor.impl;

import java.util.Collections;
import java.util.Set;

public class TrivialSubscriptionsPersistentStore extends AbstractSubscriptionsPersistentStore {

    private final String emailAddress;

    public TrivialSubscriptionsPersistentStore(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    @Override
    public void addEmails(String id, Set<String> emails) {

    }

    @Override
    public void removeEmails(String id, Set<String> emails) {

    }

    @Override
    public Set<String> getEmails(String id) {
        return Collections.singleton(emailAddress);
    }
}
