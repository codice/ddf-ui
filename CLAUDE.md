# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

ddf-ui (also called **Intrigue**) is the search and admin frontend for DDF — an enterprise metadata catalog platform. It provides the web UI for searching, viewing, and managing metacards (indexed metadata records) stored in Solr and served through DDF's Karaf/OSGi runtime.

The repo has two independent halves that are built separately but deployed together into Karaf:

```
ddf-ui/
├── ui-backend/     ← Java 17 OSGi bundles (Maven)
└── ui-frontend/    ← Yarn workspace (Node 20)
    └── packages/
        ├── catalog-ui-search   ← main search UI (React 18 + TS 5.7)
        ├── admin (kanri)       ← admin console (React 16)
        ├── logout
        └── cesium-assets       ← static Cesium map assets
```

## How It's Wired Together

**Maven drives both halves.** `mvn install` compiles the Java backend normally, then `frontend-maven-plugin` downloads Node/Yarn, runs `yarn install && yarn build`, and packages the frontend output as an OSGi bundle JAR. Both halves become Karaf features installable via `feature:install`.

**At runtime**, Jetty (inside Karaf) serves the React frontend as static assets from the OSGi bundle and exposes the Java backend REST endpoints under `/search/catalog/`. There is no separate Node server in production — all traffic goes through Karaf.

**Frontend startup sequence:** `index.tsx` → browser check → `WaitForReady` (fetches config, attribute types, and available sources from the backend REST API) → `app.tsx` → React tree. All knowledge of the DDF instance is pulled from the Java backend at boot.

**Frontend state management is split** between legacy Backbone.js models (queries, metacards, user — the pre-React layer) and modern React hooks. `component/` holds old Backbone/Marionette code; `react-component/` holds modern React. Both coexist; new work should go in `react-component/`.

**The Java backend never talks to Solr or Camel directly.** It calls DDF interfaces — `CatalogFramework.query()`, `SecuritySubject`, `Preferences`, etc. — and the OSGi service registry wires in the live DDF implementations at runtime from the `../ddf` codebase.

**Downstream consumers** (e.g. `../aus`) consume `catalog-ui-search` as a source tarball, import the `Entry` function, and pass custom `ExtensionPointsType` overrides to boot the full UI with domain-specific behaviour injected. They never fork the UI source.

## Build Commands

### Full Maven build (backend + frontend)
```bash
mvn clean install
```

### Skip frontend in Maven build
```bash
mvn clean install -pl \!ui-frontend
```

### Development (non-minified) frontend bundles via Maven
```bash
mvn clean install -DwebBuildEnv=dev
```

### Frontend only
```bash
# Install all package deps (run from ui-frontend/)
cd ui-frontend && yarn install

# Build all packages
cd ui-frontend && yarn build

# Build a single package
cd ui-frontend/packages/catalog-ui-search && yarn build
```

### Publish sources to local ~/.m2 (needed by downstream consumers like aus)
```bash
cd ui-frontend && yarn m2
```

## Tests

### Frontend tests (catalog-ui-search only)
```bash
cd ui-frontend && yarn test
# or directly:
cd ui-frontend/packages/catalog-ui-search && yarn test
```

### Browser-based test server (debug specs interactively)
```bash
cd ui-frontend/packages/catalog-ui-search && yarn start:test
# Serves at http://localhost:8080
```

### Backend Java tests
```bash
mvn test
# Single module:
mvn test -pl ui-backend/catalog-ui-search
```

Backend enforces 75% minimum JaCoCo coverage for instructions, branches, and complexity.

## Dev Server

```bash
cd ui-frontend/packages/catalog-ui-search && yarn start
# Admin UI:
cd ui-frontend/packages/admin && yarn start
```

Both proxy to a running DDF instance. If redirected to IDP login, disable it first:
```bash
cd ui-frontend && yarn disable-idp
```

## Formatting

```bash
# Format all packages (Prettier)
cd ui-frontend && yarn fmt

# Check what would change
cd ui-frontend && yarn format

# Java formatting is enforced by fmt-maven-plugin on mvn validate
```

## Architecture

### Maven module structure
| Module | What it is |
|--------|-----------|
| `ui-backend/` | Java 17 OSGi bundles for Karaf: JAX-RS API, OAuth, WebSockets, audit, CQL |
| `ui-frontend/` | Yarn workspace root driving all Node builds |
| `docs/` | Documentation artifacts |
| `software-list/` | Third-party software manifest |

### ui-frontend packages
| Package | Description | React | Entry point |
|---------|-------------|-------|-------------|
| `catalog-ui-search` | Main Intrigue search UI | 18.3.1 + TS 5.7 | `src/main/webapp/index.tsx` |
| `admin` (kanri) | DDF Admin Console UI | 16.13.1 | `src/main/webapp/components/entry/default-entry.tsx` |
| `logout` | Logout page | 19.0.0 | `src/main/webapp/components/index` |
| `cesium-assets` | Static Cesium v1.44 assets | — | — |

Build tool for all packages: `@connexta/ace` (pinned git commit, wraps Webpack + Mocha).

### catalog-ui-search architecture
The app uses a mixed legacy/modern component model:
- `src/main/webapp/component/` — legacy Backbone.js / Marionette components (avoid adding new ones here)
- `src/main/webapp/react-component/` — modern React components (prefer this for new work)
- `src/main/webapp/js/` — Backbone models, CQL utilities, startup data store (`js/model/Startup/startup.ts`)
- `src/main/webapp/extension-points/` — plugin extension API for downstream consumers

Startup sequence: `index.tsx` → browser check → `WaitForReady` (fetches config/enumerations/etc.) → `app.tsx` → `js/Entry.tsx`

State management is split: Backbone models for legacy data (queries, metacards, user), React hooks for modern components.

### Java backend structure (ui-backend/)
OSGi bundles deployed to Karaf. Key modules: `catalog-ui-search` (JAX-RS endpoints), `catalog-ui-search-api` (interfaces), `catalog-ui-oauth`, `catalog-ui-websockets`, `audit/`, `boolean-search`, `javalin-utils`.

## DDF Dependencies (`../ddf`)

ddf-ui only uses a focused slice of DDF. All are resolved at Maven build time via `${ddf.version}`; at runtime they are provided by the Karaf container.

| DDF subsystem | Artifacts used | What ddf-ui uses them for |
|---|---|---|
| `ddf.catalog.core` | `catalog-core-api`, `catalog-core-api-impl`, `catalog-core-commons`, `catalog-core-attachment`, `versioning-api/common` | Core `CatalogFramework`, `Metacard`, `Query`, `Result` types; CQL filter utilities; content attachments; metacard history |
| `ddf.catalog.rest` | `catalog-rest-api` | JAX-RS interface contracts the UI backend implements against |
| `ddf.catalog.transformer` | `catalog-transformer-propertyjson-metacard`, `geojson-metacard-transformer` | JSON/GeoJSON serialization of metacards for API responses and map display |
| `ddf.security.core` | `security-core-api`, `security-core-impl` | `SecuritySubject`, attribute extraction, subject utilities |
| `ddf.security.handler` | `security-handler-impl` | Authentication handler chain |
| `ddf.platform.security` | `security-oidc-bundle`, `session-management-api` | OIDC/OAuth token handling (`catalog-ui-oauth`); session lifecycle |
| `ddf.security.servlet` | `security-servlet-logout-api`, `security-servlet-web-socket-api` | Logout hook; WebSocket auth |
| `ddf.security.storage` | `token-storage-api`, `token-storage-impl` | OAuth token persistence |
| `ddf.platform` | `platform-util`, `util-uuidgenerator-api`, `platform-configuration-service`, `branding-api`, `preferences-api`, `resource-bundle-locator` | General utilities; system config (hostname, context root); UI branding; per-user preference storage; i18n |
| `ddf.platform.email` | `platform-email-api` | Email notifications (alerts feature) |
| `ddf.platform.usng4j` | `platform-usng4j-api` | US National Grid / MGRS coordinate conversion for the map |
| `ddf.action.core` | `action-core-api`, `action-core-impl` | Action provider pattern for pluggable metacard operations (download, transform, etc.) |
| `ddf.persistence.core` | `persistence-core-api` | Key-value store for workspace and saved-query persistence |
| `ddf.mime.core` | `mime-core-api` | MIME type detection |
| `ddf.lib` | `gson-support`, `common-system`, `tlmatcher` | JSON serialization; system property utilities; template matching |
| `org.codice.ddf.spatial` | `spatial-geocoding-api`, `spatial-geocoding-geocoder` | Place-name geocoding (gazetteer/search-by-location in the map) |

DDF subsystems ddf-ui does **not** touch: Solr directly, Camel/CXF routing, Tika transformers, the admin platform, OpenSearch/CSW federation, or the security IdP.

## Extending ddf-ui (Downstream Consumers)

The primary downstream consumer is `../aus` (`ui/packages/intrigue`).

### Frontend extension mechanism

ddf-ui exposes two extension mechanisms:

**1. Extension points** (`src/main/webapp/extension-points/extension-points.tsx`)
The `Entry` function accepts an `ExtensionPointsType` object. Consumers import `Entry` and pass their overrides:
```ts
import Entry from 'catalog-ui-search/src/main/webapp/js/Entry'
Entry(extensions, attemptToStart)
```

Available slots:

| Slot | Purpose |
|---|---|
| `providers` | Wrap the app in additional React context providers |
| `metacardInteractions` | Array of action components shown on metacard menus |
| `customFilterInput` | Replace the filter input UI |
| `resultItemTitleAddOn` / `resultItemRowAddOn` / `resultTitleIconAddOn` | Augment result list items |
| `layoutDropdown` | Customize the Golden Layout panel menu |
| `suggester` | Replace the gazetteer autocomplete |
| `serializeLocation` / `handleFilter` | Custom geo serialization and filter logic |
| `extraRoutes` | Additional React Router routes |
| `locationTypes` | Custom location type definitions |
| `userInformation` | Replace the user info popover |
| `customMapBadge` | Map overlay badge |
| `attributeEditor` | Replace the attribute editing UI |
| `timelineItemAddOn` | Augment timeline items |
| `extraSidebarButtons` | Add buttons to the sidebar |
| `handleMetacardUpdate` | Override the metacard update flow |
| `extraHeader` / `extraFooter` | Additional header/footer content |
| `includeNavigationButtons` | Toggle navigation buttons |
| `customSourcesPage` | Replace the sources configuration page |

**2. Overridable pattern**
`overrides.tsx` in consumers uses an `Overridable` class to patch specific internal behaviours (e.g. file save logic, export column order) without touching extension points.

### Stable exports API
`src/main/webapp/exports/` provides a stable public API surface: `fetch.tsx`, `metacard-interactions.tsx`, `backbone-container.tsx`, `query.tsx`, `security.tsx`, `sharing.tsx`, `theme.tsx`. Prefer these over internal imports in downstream code — aus currently makes ~853 direct imports from internals, which creates fragility when refactoring.

### Java extension points (`catalog-ui-search-api`)
The `catalog-ui-search-api` module exposes interfaces for Java backends to implement:
- `CqlRequest` / `QueryRequestFactory` — build and issue CQL searches
- `Splitter` / `AbstractSplitter` / `StorableResource` — file splitting pipeline
- `DeprecatableEnumeration` — extend the attribute enumeration system with deprecation support
- `Preferences` / `DefaultPreferencesSupplier` — per-user preference storage
- `MetacardHistoryService`, `OperationPropertySupplier`, `QueryAttributes` — metadata and query helpers

Consumers register implementations as OSGi services via blueprint XML and they're picked up by the running Karaf container.

## Sibling Repos

These repos are checked out at `../` (i.e., `/workspace/mark.smith/gits/`):

| Repo | Relationship |
|------|-------------|
| `../aus` | Primary ISR application. Its `ui/packages/intrigue` consumes `catalog-ui-search` as `file:../../target/catalog-ui-search-src.tgz` — run `yarn m2` in `ui-frontend/` to publish a local version |
| `../ddf` | Upstream DDF 2.29.32 (ddf-ui is the frontend for this) |
| `../codice-test` | Shared Java test utilities used by `ui-backend` modules |

## Downstream Distribution

`catalog-ui-search` ships a dist branch for use without building from source:
- Per-PR: `codice/ddf-ui#catalog-ui-search-dist-<PR#>`
- Main branch snapshot: `codice/ddf-ui#main-dist-snapshot`

Use `yarn install --force` to pick up changes from these dist branches.

## Runtime Installation in DDF (Karaf)

```
feature:repo-add mvn:org.codice.ddf.search/intrigue-ui-app/<VERSION>/xml/features
feature:install catalog-ui-app
feature:repo-add mvn:org.codice.ddf.search/ui-frontend/<VERSION>/xml/features
feature:install ui-frontend
```
