package org.codice.ddf.catalog.ui.query.monitor.impl;

import static org.apache.commons.lang3.Validate.notBlank;
import static org.apache.commons.lang3.Validate.notNull;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.codice.ddf.catalog.ui.query.monitor.api.SubscriptionsPersistentStore;
import org.codice.ddf.persistence.PersistenceException;
import org.codice.ddf.persistence.PersistentItem;
import org.codice.ddf.persistence.PersistentStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Associate sets of emails with an ID. This implementation will preserve any other
 * properties stored under the ID.
 */
public class SubscriptionsPersistentStoreImpl extends AbstractSubscriptionsPersistentStore {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(SubscriptionsPersistentStore.class);

    /**
     * The persistent store type.
     */
    private static final String TYPE = PersistentStore.SUBSCRIPTIONS_TYPE;

    private static final String EMAIL_PROPERTY = "email";

    private static final String ID = "id";

    private final PersistentStore persistentStore;

    /**
     * @param persistentStore must be non-null
     */
    public SubscriptionsPersistentStoreImpl(PersistentStore persistentStore) {
        notNull(persistentStore, "persistentStore must be non-null");
        this.persistentStore = persistentStore;
    }

    @SuppressWarnings("unchecked")
    @Override
    public void addEmails(String id, Set<String> emails) {
        notBlank(id, "id must be non-blank");
        notNull(emails, "emails must be non-null");
        emails.forEach(email -> notBlank(email, "emails in set must be non-blank"));

        try {
            List<Map<String, Object>> results = persistentStore.get(TYPE, query(id));

            assert results.size() <= 1;

            if (!results.isEmpty()) {
                PersistentItem item = (PersistentItem) results.get(0);
                if (item.containsKey(EMAIL_PROPERTY + PersistentItem.TEXT_SUFFIX)) {
                    Set<String> newValue = new HashSet<>(emails);
                    Object value = item.get(EMAIL_PROPERTY + PersistentItem.TEXT_SUFFIX);
                    if (value instanceof String) {
                        newValue.add((String) value);
                    } else if (value instanceof Set) {
                        ((Set) value).stream()
                                .filter(String.class::isInstance)
                                .forEach(obj -> newValue.add((String) obj));
                    }
                    item.addProperty(EMAIL_PROPERTY, newValue);
                } else {
                    item.addProperty(EMAIL_PROPERTY, emails);
                }
                persistentStore.add(TYPE, item);
            } else {
                PersistentItem persistentItem = new PersistentItem();
                persistentItem.addIdProperty(id);
                persistentItem.addProperty(EMAIL_PROPERTY, emails);
                persistentStore.add(TYPE, persistentItem);
            }

        } catch (PersistenceException e) {
            LOGGER.warn("unable to add emails to workspace: workspaceId={} emails={}",
                    id,
                    emails,
                    e);
        }

    }

    private String query(String id) {
        return ID + "=" + quote(id);
    }

    @SuppressWarnings("unchecked")
    @Override
    public void removeEmails(String id, Set<String> emails) {
        notBlank(id, "id must be non-blank");

        try {
            List<Map<String, Object>> results = persistentStore.get(TYPE, query(id));

            assert results.size() <= 1;

            results.stream()
                    .map(PersistentItem.class::cast)
                    .map(item -> {
                        Object itemValue = item.get(EMAIL_PROPERTY + PersistentItem.TEXT_SUFFIX);
                        Optional.ofNullable(itemValue)
                                .ifPresent(value -> {
                                    if (value instanceof String) {
                                        String currentEmail = (String) value;
                                        if (emails.contains(currentEmail)) {
                                            item.remove(
                                                    EMAIL_PROPERTY + PersistentItem.TEXT_SUFFIX);
                                        }
                                    } else if (value instanceof Set) {
                                        Set<Object> currentEmails = (Set) value;
                                        currentEmails.removeAll(emails);
                                        if (currentEmails.isEmpty()) {
                                            item.remove(
                                                    EMAIL_PROPERTY + PersistentItem.TEXT_SUFFIX);
                                        }
                                    }
                                });

                        return item;
                    })
                    .forEach(item -> {
                        try {
                            persistentStore.add(TYPE, item);
                        } catch (PersistenceException e) {
                            LOGGER.warn("unable to delete emails from workspace: id={}", id, e);
                        }
                    });

        } catch (PersistenceException e) {
            LOGGER.warn("unable to delete emails from workspace: id={}", id, e);
        }

    }

    private Set<String> merge(Set<String> set1, Set<String> set2) {
        return Stream.of(set1, set2)
                .flatMap(Collection::stream)
                .collect(Collectors.toSet());
    }

    private String quote(String value) {
        return "'" + value + "'";
    }

    private boolean isEmail(Map.Entry<String, Object> entry) {
        return entry.getKey()
                .equals(EMAIL_PROPERTY);
    }

    @SuppressWarnings("unchecked")
    @Override
    public Set<String> getEmails(String id) {
        notBlank(id, "id must be non-blank");

        try {

            List<Map<String, Object>> results = persistentStore.get(TYPE, query(id));

            assert results.size() <= 1;

            List<Object> mapValues = results.stream()
                    .map(PersistentItem::stripSuffixes)
                    .map(Map::entrySet)
                    .flatMap(Collection::stream)
                    .filter(this::isEmail)
                    .map(Map.Entry::getValue)
                    .collect(Collectors.toList());

            Set<String> emailsFromSet = streamToStrings(mapValues.stream()
                    .filter(Set.class::isInstance)
                    .map(Set.class::cast)
                    .flatMap(set -> ((Set<Object>) set).stream()));

            Set<String> emailsFromString = streamToStrings(mapValues.stream());

            return merge(emailsFromSet, emailsFromString);
        } catch (PersistenceException e) {
            LOGGER.warn("unable to get workspace emails: id={}", id, e);
        }

        return Collections.emptySet();
    }

    /**
     * Convert a stream of objects into a set of strings.
     *
     * @param stream stream of objects
     * @return set of strings
     */
    private Set<String> streamToStrings(Stream<Object> stream) {
        return stream.filter(String.class::isInstance)
                .map(String.class::cast)
                .collect(Collectors.toSet());
    }

}
