# ddf-ui

Welcome to ddf-ui, the home of Intrigue.

## Building ddf-ui prereqs
This repository depends on Codice and Connexta artifacts available in their GitHub repository packages.
To pull these artifacts, you will need create a [Personal Access Token (PAT) in GitHub](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic)
with `packages:read` permissions, and configure maven's ~/.m2/settings.xml:
```
<servers>
   <server>
       <id>codice</id>
       <username>$USERNAME</username>
       <password>$TOKEN</password>
   </server>
   <server>
       <id>connexta</id>
       <username>$USERNAME</username>
       <password>$TOKEN</password>
   </server>
</servers>
```

## Installing in DDF

Note: Change `<VERSION>` to the desired or most recent version of ddf-ui.

1. To install the backend and frontend features, run the following commands inside a DDF karaf console:
   ```
   feature:repo-add mvn:org.codice.ddf.search/intrigue-ui-app/<VERSION>/xml/features
   feature:install catalog-ui-app
   feature:repo-add mvn:org.codice.ddf.search/ui-frontend/<VERSION>/xml/features
   feature:install ui-frontend
   ```

2. (Optional) To configure the Intrigue configurations to appear under the `Search UI` app in the DDF Admin Console, 
   add the following bundle to `bundleLocations` in `etc/application-definitions/search-ui.json`:
   ```
   "mvn:org.codice.ddf.search/catalog-ui-search/<VERSION>"
   ```
   
3. (Optional) To configure `/search` to redirect to `/search/catalog` (the URI for Intrigue), 
   add a configuration file at `etc/org.codice.ddf.ui.searchui.filter.RedirectServlet.config` with the contents:
   ```
   defaultUri="${org.codice.ddf.external.context}/search/catalog/"
   ```

## Developer Notes

There are multiple workflows setup to assist with develop in downstream projects.

1. The first work flow is one that runs on each pull request. After each commit, the catalog-ui-search dist will be built and pushed to a branch unique to that pull request. This branch is automatically maintained and deleted once the pull request closes (merged or otherwise). An example comment that is posted to each pull request once the branch is built and pushed is below

```
An updated dist branch has been created and pushed to origin.
You can use:
`"catalog-ui-search": "https://github.com/codice/ddf-ui#catalog-ui-search-dist-746"`,
in your package.json to use this version in your project.

Remember to use "yarn install --force" if you want to pick up changes each time you make a change to this branch by committing.
```

2.  There is a similar workflow that maintains a dist for the main branch of the project. So once your changes are merged in, you can point to this branch. Or you can point to it just to verify the next version will work once released. Below is how to reference that snapshot dist.

```
 "catalog-ui-search": "codice/ddf-ui#main-dist-snapshot"
```

Remember that both cases rely on using `yarn install --force` to pick up any changes to the branches.  
(and also remember to wait for the rebuilt dist to be compiled and pushed)
