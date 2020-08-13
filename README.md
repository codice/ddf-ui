# ddf-ui

Welcome to ddf-ui, the home of Intrigue. 

## Installing in DDF
Note: Change `3.7.0-SNAPSHOT` to the desired or most recent version of ddf-ui. 

1. Inside of a DDF karaf console run the following commands:
    ```
    feature:repo-add mvn:org.codice.ddf.search/intrigue-ui-app/3.7.0-SNAPSHOT/xml/features
    ```
    ```
    feature:install catalog-ui-app
    ```
    This will add the backend repo and then install the app.

    ```
    feature:repo-add mvn:org.codice.ddf.search/ui-frontend/3.7.0-SNAPSHOT/xml/features
    ```
    ```
    feature:install ui-frontend
    ```
    This will add the frontend repo and then install the app.
2. (Optional) Add the following bundle to `bundleLocations` in `etc/application-definitions/search-ui.json`:
    ```
    "mvn:org.codice.ddf.search/catalog-ui-search/3.7.0-SNAPSHOT"
    ```
    This configures the Intrigue configurations to appear under the `Search UI` app in the DDF Admin Console.
3. (Optional) Add a configuration file at `etc/org.codice.ddf.ui.searchui.filter.RedirectServlet.config` with the following contents:
    ```
    defaultUri="${org.codice.ddf.external.context}/search/catalog/"
    ```
    This configures `/search` to redirect to `/search/catalog`, which is the URI for Intrigue.