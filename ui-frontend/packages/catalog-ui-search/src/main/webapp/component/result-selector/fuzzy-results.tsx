import { StartupDataStore } from '../../js/model/Startup/startup'

export const fuzzyResultCount = (resultCount: number) => {
  if (!StartupDataStore.Configuration.getIsFuzzyResultsEnabled()) {
    return resultCount
  }

  if (resultCount < 10) return '< 10'
  else if (resultCount < 100) return '< 100'
  else if (resultCount < 1000) return '< 1000'
  else if (resultCount < 10000) return '< 10,000'
  else if (resultCount < 100000) return '< 100,000'
  else if (resultCount < 1000000) return '< 1,000,000'
  else if (resultCount < 10000000) return '< 10,000,000'
  else return '>= 10,000,000'
}

export const fuzzyHits = (resultCount: number) => {
  return `${fuzzyResultCount(resultCount)} hits`
}
