import { exec } from 'child_process'
let compiling = false
let followOn = false
const chokidar = require('chokidar')
const debounce = require('lodash.debounce')

const recompileTypescript = debounce(() => {
  if (compiling) {
    followOn = true
    return
  }
  console.log('recompiling project')
  compiling = true
  exec('yarn watch:build', function (_error, _stdout, _stderr) {
    compiling = false
    if (followOn) {
      followOn = false
      recompileTypescript()
    } else {
      console.log('distribution up to date')
    }
  })
}, 200)

recompileTypescript()
chokidar.watch('./src/**/*').on('change', () => {
  recompileTypescript()
})
chokidar.watch('./exports/**/*').on('change', () => {
  recompileTypescript()
})
chokidar.watch('./typings/**/*').on('change', () => {
  recompileTypescript()
})
