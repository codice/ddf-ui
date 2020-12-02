export const fuzzyResultCount = (resultCount: any) => {
  if (resultCount < 10) return '< 10 hits'
  else if (resultCount < 100) return '< 100 hits'
  else if (resultCount < 1000) return '< 1000 hits'
  else if (resultCount < 10000) return '< 10,000 hits'
  else if (resultCount < 100000) return '< 100,000 hits'
  else if (resultCount < 1000000) return '< 1,000,000 hits'
  else if (resultCount < 10000000) return '< 10,000,000 hits'
  else return '>= 10,000,000 hits'
}
