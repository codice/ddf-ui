package org.codice.ddf.catalog.ui.query.monitor.impl;

import static org.apache.commons.lang3.Validate.notBlank;

import java.util.Collections;

import org.codice.ddf.catalog.ui.query.monitor.api.SubscriptionsPersistentStore;

public abstract class AbstractSubscriptionsPersistentStore implements SubscriptionsPersistentStore {

    @Override
    public final void addEmail(String id, String email) {
        notBlank(id, "id must be non-blank");
        notBlank(email, "email must be non-blank");

        addEmails(id, Collections.singleton(email));
    }

    @Override
    public final void removeAllEmails(String id) {
        removeEmails(id, getEmails(id));
    }

    @Override
    public final void removeEmail(String id, String email) {
        notBlank(id, "id must be non-blank");
        notBlank(email, "email must be non-blank");

        removeEmails(id, Collections.singleton(email));
    }
}
