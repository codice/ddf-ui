export const Environment = {
  isTest() {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__ENV__'.
    console.log(__ENV__)
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__ENV__'.
    return __ENV__ === 'test'
  },
}
