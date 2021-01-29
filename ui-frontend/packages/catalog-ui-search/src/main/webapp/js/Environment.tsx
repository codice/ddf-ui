export const Environment = {
  isTest() {
    //@ts-ignore
    console.log(__ENV__)
    // @ts-ignore
    return __ENV__ === 'test'
  },
}
