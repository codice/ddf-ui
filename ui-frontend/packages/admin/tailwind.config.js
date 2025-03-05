const upstreamConfig = require('@connexta/kanri/tailwind.config.js')
upstreamConfig.content = upstreamConfig.content.concat([
  './node_modules/@connexta/kanri/src/**/*.{tsx,js,jsx,ts,html}',
])
module.exports = upstreamConfig
