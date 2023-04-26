const selectorParser = require('postcss-selector-parser')
const plugin = require('tailwindcss/plugin')

module.exports = plugin(({ theme, addVariant, prefix, e }) => {
  const namedGroups = (theme('namedGroups') || [])
    .map((namedGroup) => `group-${namedGroup}`)
    .concat(['group']) // compatible with named groups plugin

  addVariant(`focus-visible`, ({ modifySelectors, separator }) => {
    return modifySelectors(({ selector }) => {
      return selectorParser((root) => {
        root.walkClasses((node) => {
          // Regular focus visible
          const value = node.value
          node.value = `focus-visible${separator}${value}`
          node.parent.insertAfter(
            selector,
            selectorParser.pseudo({ value: `:focus-visible` })
          )

          // Group focus visible
          namedGroups.forEach((namedGroup) => {
            node.parent.parent.insertAfter(
              node.parent,
              selectorParser().astSync(
                prefix(`.${namedGroup}:focus-visible .`) +
                  e(`${namedGroup}-focus-visible${separator}${value}`)
              )
            )
          })
        })
      }).processSync(selector)
    })
  })
})
