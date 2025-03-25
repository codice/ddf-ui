import fetch, { FetchProps } from './base-fetch'
import { ConfigurationType, FeatureType } from '../app-root/app-root.pure'

/**
 * Whenever using a url (fetch or iframe, etc) you should use this as it will
 * ensure that it works under a reverse proxy.
 * @param url
 */
export const handleReverseProxy = (url: string) => {
  if (window.location.pathname === '/') {
    return url // should only happen when running the dev server
  }
  const context = window.location.pathname.split(
    `${__package__json__['context-path']}/`
  )[0] // normally "" unless we're under a reverse proxy
  return `${context}${url}`
}

/**
 * Handy place for all our backend interaction information
 */

export type URL_SHAPES = {
  FACTORY: {
    ADD: undefined
  }
  SERVICES: {
    LIST: {
      SPECIFIC: {
        arguments: [
          /**
           * should be the id of the app to get services for
           */
          string
        ]
      }
      ALL: {
        arguments: []
      }
    }
  }
  CONFIGURATION: {
    EDIT: {
      arguments: [
        /**
         *  should be the id of the config to edit (this is the one with the uuid if a factory!)
         *  if not a factory, just the service.id
         */
        string,
        /**
         * should be the map of properties for the config and their values
         */
        {
          /**
           *  really just service.id, this should be the same as service.pid
           */
          'service.factoryPid'?: string
          /**
           * the service id
           */
          'service.pid': string
          [key: string]:
            | string
            | string[]
            | number
            | number[]
            | boolean
            | boolean[]
            | undefined
        }
      ]
      mbean: 'org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0'
      operation: 'update'
      type: 'EXEC'
    }
  }
}

export const URLS = {
  SESSION: {
    INVALIDATE: '/services/internal/session/invalidate?service=',
    RENEW: '/services/internal/session/renew',
    EXPIRY: '/services/internal/session/expiry',
  },
  TRUSTSTORE: {
    GET: '/admin/jolokia/read/org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore/Truststore',
    DELETE:
      '/admin/jolokia/exec/org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore/deleteTrustedCertificate/',
    POST: {
      url: '/admin/jolokia/exec/org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore',
      operation: 'addTrustedCertificate',
    },
  },
  KEYSTORE: {
    GET: '/admin/jolokia/read/org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore/Keystore',
    DELETE:
      '/admin/jolokia/exec/org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore/deletePrivateKey/',
    POST: {
      url: '/admin/jolokia/exec/org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore',
      operation: 'addPrivateKey',
    },
  },
  URLCERTIFICATE: {
    GET: '/admin/jolokia/exec/org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore/certificateDetails',
    SAVE: '/admin/jolokia/exec/org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore/addTrustedCertificateFromUrl',
  },
  FEATURES: {
    ALL: '/admin/jolokia/read/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/AllFeatures',
    /**
     * Get with the feature name on end to install
     */
    INSTALL:
      '/admin/jolokia/exec/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/installFeature(java.lang.String)/',
    /**
     * Get with the feature name on end to uninstall
     */
    UNINSTALL:
      '/admin/jolokia/exec/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/uninstallFeature(java.lang.String)/',
  },
  FACTORY: {
    /*
        adding a service id to the end and doing a get will create a new configuration and return a unique id as the value
        you can then use that id to send a post that updates the configuration to the values you want
    */
    ADD: '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/createFactoryConfiguration',
  },
  SERVICES: {
    /*
      adding an app to the end and doing a get will list all the app services
    */
    APP: '/admin/jolokia/exec/org.codice.ddf.admin.application.service.ApplicationService:service=application-service/getServices',
    ALL: '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/listServices',
  },
  CONFIGURATION: {
    /*
        sending a post with shape this as the body:
            {
                arguments: [
                    "ddf.catalog.transformer.html.categories.9efff015-a0f9-4009-b356-56b059284676",
                    {
                        service.factoryPid: "ddf.catalog.transformer.html.categories", // only if it's a factory!
                        service.pid: "ddf.catalog.transformer.html.categories",
                        //any other property of the metatype
                    }]
                mbean: "org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0"
                operation: "update"
                type: "EXEC"
            }
        allows you to update any configuration in the system (factory or not), 
        just note that service.factoryPid is left out for non factory
        The response might not be parseable as JSON (use parseJolokiaJSON to get around this)
    */
    EDIT: '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/add',
    /**
     * Add the /id on the end to delete a configuration
     */
    DELETE:
      '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/delete',
    /**
     * Add the /id on the end to disable a configuration
     */
    DISABLE:
      '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/disableConfiguration',
    /**
     * Add the /id on the end to enable a configuration
     */
    ENABLE:
      '/admin/jolokia/exec/org.codice.ddf.ui.admin.api.ConfigurationAdmin:service=ui,version=2.3.0/enableConfiguration',
  },
  SOURCES: {
    // fetch all sources with metatypes and configurations
    ALLSOURCEINFO:
      '/admin/jolokia/exec/org.codice.ddf.catalog.admin.poller.AdminPollerServiceBean:service=admin-source-poller-service/allSourceInfo/',
    // fetch the status of a source -> put configuration.id such as /Wfs_v110_Federated_Source.131c989d-607a-4869-91fe-b0203a1e00c6 on the end
    SOURCESTATUS:
      '/admin/jolokia/exec/org.codice.ddf.catalog.admin.poller.AdminPollerServiceBean:service=admin-source-poller-service/sourceStatus/',
  },
}

type TrustStoreResponseType = {
  request: {
    mbean: string
    attribute: string
    type: string
  }
  value: Certificate[]
  timestamp: number
  status: number
}

type KeyStoreResponseType = {
  request: {
    mbean: string
    attribute: string
    type: string
  }
  value: Certificate[]
  timestamp: number
  status: number
}

export interface Certificate {
  alias: string
  isKey: boolean
  algorithm: string
  type?: string
  format?: string
}

export interface CertificateDetails {
  subjectDn: {
    rFC2253Name: string
    organization: string
    organizationalUnit: string
    country: string
  }
  issuerDn: {
    rFC2253Name: string
    organization: string
    organizationalUnit: string
    country: string
  }
  notAfter: string
  notBefore: string
  type: string
  extendedKeyUsage: string[]
}

export interface CertificateResponseType {
  success: boolean
  error?: string
  value: CertificateDetails[]
}

interface SourceResponseType {
  request: {
    mbean: string
    type: string
    operation: string
  }
  value: ConfigurationType[]
  timestamp: number
  status: number
}

interface SourceStatusResponseType {
  request: {
    arguments: [string]
    mbean: string
    type: string
    operation: string
  }
  timestamp: number
  status: number
  value: boolean
}

// to handle non latin characters
const safeBase64Encode = (str: string): string => {
  // Convert string to UTF-8 bytes, then to base64
  return btoa(unescape(encodeURIComponent(str)))
}

function parseAndTransformConfigurationTypes(data: ConfigurationType[]) {
  data
    .sort((a: ConfigurationType, b: ConfigurationType) => {
      if (a.name < b.name) {
        return -1
      } else {
        return 1
      }
    })
    .forEach((service) => {
      // apache felix declarative service implementation and other high level patches for convenience, also the long standing jolokia bug with serialization being borked
      service.metatype.forEach((meta) => {
        if (meta.optionLabels === null) {
          meta.optionLabels = []
        }
        if (meta.optionValues === null) {
          meta.optionValues = []
        }
        if (meta.cardinality > 0 && meta.defaultValue === null) {
          meta.defaultValue = []
        }
        if (meta.cardinality === 0 && meta.defaultValue === null) {
          meta.defaultValue = ['']
        }
      })
      if (service.configurations) {
        service.configurations.forEach((config) => {
          config.service = service
          service.metatype.forEach((meta) => {
            if (
              config.properties[meta.id] === null ||
              config.properties[meta.id] === undefined
            ) {
              config.properties[meta.id] = meta.defaultValue
            }
            if (
              meta.cardinality > 0 &&
              !(config.properties[meta.id] instanceof Array)
            ) {
              let propval = config.properties[meta.id] as string
              config.properties[meta.id] = [propval]
            }
          })
        })
      }
    })
  return data
}

export const COMMANDS = {
  FETCH: ((url, options) => {
    return fetch(handleReverseProxy(url), options)
  }) as FetchProps,
  SOURCES: {
    ALLSOURCEINFO: (): Promise<SourceResponseType['value']> => {
      return COMMANDS.FETCH(URLS.SOURCES.ALLSOURCEINFO)
        .then((response) => response.json())
        .then((data) => {
          return parseAndTransformConfigurationTypes(data.value)
        })
    },
    SOURCESTATUS: (id: string): Promise<boolean> => {
      return COMMANDS.FETCH(`${URLS.SOURCES.SOURCESTATUS}${id}`)
        .then((response) => response.json())
        .then((data: SourceStatusResponseType) => {
          return data.value
        })
    },
  },
  TRUSTSTORE: {
    GET: (): Promise<TrustStoreResponseType> => {
      return COMMANDS.FETCH(URLS.TRUSTSTORE.GET)
        .then((response) => response.json())
        .then((data) => {
          return data
        })
        .catch((response) => {
          return response
        })
    },
    DELETE: ({ alias }: { alias: string }) => {
      return COMMANDS.FETCH(`${URLS.TRUSTSTORE.DELETE}${alias}`)
    },
    POST: ({
      alias,
      cert,
      fileName,
      keyPassword,
      storePassword,
      type,
    }: {
      alias: string
      cert: string
      fileName?: string
      keyPassword: string
      storePassword: string
      type?: string
    }) => {
      // Use safeBase64Encode instead of btoa
      const base64Cert = safeBase64Encode(cert)

      return COMMANDS.FETCH(URLS.TRUSTSTORE.POST.url, {
        method: 'POST',
        body: JSON.stringify({
          type: 'EXEC',
          mbean:
            'org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore',
          operation: URLS.TRUSTSTORE.POST.operation,
          arguments: [
            alias,
            keyPassword,
            storePassword,
            base64Cert,
            type || 'application/x-pem-file', // FIXED: Set valid type
            fileName || 'certificate.pem',
          ],
        }),
      })
        .then((response) => response.text())
        .then(parseJolokiaJSON)
        .then((response) => ({
          success: response.status === 200,
          error: (response.error as string | undefined) || '',
          error_type: (response.error_type as string | undefined) || '',
          stacktrace: (response.stacktrace as string | undefined) || '',
        }))
    },
  },
  KEYSTORE: {
    GET: (): Promise<KeyStoreResponseType> => {
      return COMMANDS.FETCH(URLS.KEYSTORE.GET)
        .then((response) => response.json())
        .then((data) => {
          return data
        })
    },
    DELETE: ({ alias }: { alias: string }) => {
      return COMMANDS.FETCH(`${URLS.KEYSTORE.DELETE}${alias}`)
    },
    UPLOAD: ({
      file,
      alias,
      keyPassword,
      storePassword,
      type,
      fileName,
    }: {
      file: File
      alias: string
      keyPassword: string
      storePassword: string
      type?: string
      fileName?: string
    }) => {
      return file
        .arrayBuffer()
        .then((buffer) => {
          // Convert the array buffer to base64
          const base64String = btoa(
            new Uint8Array(buffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          )

          return COMMANDS.FETCH(URLS.KEYSTORE.POST.url, {
            method: 'POST',
            body: JSON.stringify({
              type: 'EXEC',
              mbean:
                'org.codice.ddf.security.certificate.keystore.editor.KeystoreEditor:service=keystore',
              operation: URLS.KEYSTORE.POST.operation,
              arguments: [
                alias,
                keyPassword,
                storePassword,
                base64String,
                type || null,
                fileName || file.name,
              ],
            }),
          })
        })
        .then((response) => response.text())
        .then(parseJolokiaJSON)
        .then((response) => ({
          success: response.status === 200,
          error: (response.error as string | undefined) || '',
          error_type: (response.error_type as string | undefined) || '',
          stacktrace: (response.stacktrace as string | undefined) || '',
        }))
    },
  },
  SESSION: {
    RENEW: () => {
      return COMMANDS.FETCH(URLS.SESSION.RENEW)
        .then((response) => response.json())
        .then((data) => {
          return data
        })
        .catch((response) => {
          // see why this is null pointer exception on master
          return response
        })
    },
    EXPIRY: () => {
      return COMMANDS.FETCH(URLS.SESSION.EXPIRY)
        .then((response) => response.json())
        .then((data) => {
          return data as number
        })
    },
  },
  FEATURES: {
    INSTALL: ({ name }: { name: string }) => {
      return COMMANDS.FETCH(URLS.FEATURES.INSTALL + name)
        .then((response) => response.json())
        .then((data) => {
          return data
        })
    },
    UNINSTALL: ({ name }: { name: string }) => {
      return COMMANDS.FETCH(URLS.FEATURES.UNINSTALL + name)
        .then((response) => response.json())
        .then((data) => {
          if (data.status !== 200) {
            return {
              success: false,
              message: data.error,
            }
          }
          return {
            success: true,
          }
        })
    },
    LIST: () => {
      return COMMANDS.FETCH(URLS.FEATURES.ALL)
        .then((response) => response.json())
        .then((data) => {
          const features = data.value as FeatureType[]
          return features.sort((a, b) => {
            if (a.name < b.name) {
              return -1
            } else {
              return 1
            }
          })
        })
    },
  },
  SERVICES: {
    LIST: ({ appName }: { appName?: string }) => {
      let urlToUse = appName
        ? `${URLS.SERVICES.APP}/${appName}`
        : URLS.SERVICES.ALL
      return COMMANDS.FETCH(urlToUse)
        .then((text) => text.text())
        .then(parseJolokiaJSON)
        .then((data) => {
          const servicesData = data.value as ConfigurationType[]
          return parseAndTransformConfigurationTypes(servicesData)
        })
    },
  },
  FACTORY: {
    ADD: ({ serviceId }: { serviceId: string }) => {
      return COMMANDS.FETCH(`${URLS.FACTORY.ADD}/${serviceId}`)
        .then((text) => text.text())
        .then(parseJolokiaJSON)
        .then((response) => {
          return {
            success: response.status === 200,
            id: response.value,
            error: (response.error as string | undefined) || '',
            error_type: (response.error_type as string | undefined) || '',
            stacktrace: (response.stacktrace as string | undefined) || '',
          }
        })
        .catch(() => {
          return {
            success: false,
            id: undefined,
            error: 'Something went wrong',
          }
        })
    },
  },
  CONFIGURATION: {
    DELETE: (id: string) => {
      return COMMANDS.FETCH(`${URLS.CONFIGURATION.DELETE}/${id}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.status !== 200) {
            // warn?
          }
        })
    },
    EDIT: ({ body }: { body: URL_SHAPES['CONFIGURATION']['EDIT'] }) => {
      return COMMANDS.FETCH(URLS.CONFIGURATION.EDIT, {
        method: 'POST',
        body: JSON.stringify(body),
      })
        .then((text) => text.text())
        .then(parseJolokiaJSON)
        .then((response) => {
          return {
            success: response.status === 200,
            error: (response.error as string | undefined) || '',
            error_type: (response.error_type as string | undefined) || '',
            stacktrace: (response.stacktrace as string | undefined) || '',
          }
        })
        .catch(() => {
          return {
            success: false,
            error: 'Something went wrong',
          }
        })
    },
    DISABLE: (id: string) => {
      return COMMANDS.FETCH(`${URLS.CONFIGURATION.DISABLE}/${id}`)
    },
    ENABLE: (id: string) => {
      return COMMANDS.FETCH(`${URLS.CONFIGURATION.ENABLE}/${id}`)
    },
  },
  URLCERTIFICATE: {
    GET: ({ url }: { url: string }): Promise<CertificateResponseType> => {
      const encodedUrl = safeBase64Encode(url)
      return COMMANDS.FETCH(`${URLS.URLCERTIFICATE.GET}/${encodedUrl}`)
        .then((response) => response.text())
        .then(parseJolokiaJSON)
        .then((data) => {
          if (data.error || data.error_type || data.stacktrace) {
            return {
              success: false,
              error: data.error || 'Failed to fetch certificate details',
              value: [],
            }
          }
          return {
            success: true,
            value: data.value,
            error: undefined,
          }
        })
    },
    SAVE: ({ url }: { url: string }) => {
      const encodedUrl = safeBase64Encode(url)
      return COMMANDS.FETCH(`${URLS.URLCERTIFICATE.SAVE}/${encodedUrl}`)
        .then((response) => response.text())
        .then(parseJolokiaJSON)
        .then((response) => {
          const allSuccessful =
            response.value?.every(
              (result: { success: boolean }) => result.success
            ) ?? false
          return {
            success: response.status === 200 && allSuccessful,
            error: (response.error as string | undefined) || '',
            error_type: (response.error_type as string | undefined) || '',
            stacktrace: (response.stacktrace as string | undefined) || '',
          }
        })
    },
  },
}

// https://codice.atlassian.net/browse/DDF-1642
// this works around an issue in json-simple where the .toString() of an array
// is returned in the arguments field of configs with array attributes,
// causing the JSON string from jolokia to be unparseable, so we remove it,
// since we don't care about the arguments for our parsing needs
export const parseJolokiaJSON = (text: string) => {
  try {
    // First attempt to parse as-is
    return JSON.parse(text.toString().trim())
  } catch (e) {
    return cleanAndParseJson(text.toString().trim())
  }
}
function cleanAndParseJson(jsonString: string): any {
  try {
    // Ensure proper escaping of special characters
    jsonString = jsonString
      .replace(/"wildcardChar":\s*\*/, '"wildcardChar": "*"') // Fix wildcard character
      .replace(/"singleChar":\s*\?/, '"singleChar": "?"') // Fix single character
      .replace(/"escapeChar":\s*\\/, '"escapeChar": "\\\\"') // Fix escape character

    // Remove Java-style object references (like [Ljava.lang.String;@195f846d)
    jsonString = jsonString.replace(/\[L[\w.;@]*/g, '""')

    // Parse and return cleaned JSON
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return null
  }
}
