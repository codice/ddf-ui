# ddf-ui

Welcome to ddf-ui, the home of Intrigue. 


## Installing in DDF

Inside of a ddf karaf console run the following commands:
`feature:repo-add mvn:org.codice.ddf.search/intrigue-ui-app/3.0.0-SNAPSHOT/xml/features`
`feature:install catalog-ui-app`
This will the add the backend repo and then install the app.

`feature:repo-add mvn:org.codice.ddf.search/ui-frontend/3.0.0-SNAPSHOT/xml/features`
`feature:install ui-frontend`
This will add the frontend repo and then install the app.

Change `3.0.0-SNAPSHOT` to whatever the desired or most recent version of ddf-ui. 
