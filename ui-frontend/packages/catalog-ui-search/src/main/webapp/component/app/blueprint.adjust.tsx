import React from 'react'

let removed = false

type removeStyleProps = {
  ruleIdentifyingFunction: ({ rule }: { rule: CSSStyleRule }) => boolean
}

/**
 * Attempts to find and remove a style, returning true if successful
 */
const removeStyle = ({
  ruleIdentifyingFunction,
}: removeStyleProps): boolean => {
  return Boolean(
    Array.prototype.find.call(document.styleSheets, (sheet: CSSStyleSheet) => {
      return Boolean(
        Array.prototype.find.call(
          sheet.cssRules || sheet.rules,
          (rule: CSSStyleRule, index: number) => {
            if (ruleIdentifyingFunction({ rule })) {
              sheet.deleteRule(index)
              return true
            }
            return false
          }
        )
      )
    })
  )
}

/**
 * The use of removed means this will only ever happen when it needs too.
 */
export const useRemoveFocusStyle = () => {
  React.useEffect(() => {
    if (!removed) {
      removed = removeStyle({
        ruleIdentifyingFunction: ({ rule }) => {
          return (
            rule.style &&
            rule.style.outline === 'rgba(19, 124, 189, 0.6) auto 2px'
          )
        },
      })
    }
  }, [])
}
