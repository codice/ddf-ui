import * as React from 'react'

export type DropdownContextType = {
  /**
   * Close the dropdown
   */
  close: () => void
  /**
   * Close the dropdown and refocus on the element that opened it
   */
  closeAndRefocus: () => void
  parent: () => DropdownContextType
  parentOpen: boolean
  /**
   * Close the dropdown and refocus on the element that opened it
   */
  deepCloseAndRefocus: () => void
  /**
   * Close the dropdown and refocus on the element that opened it
   */
  depthCloseAndRefocus: (depth: number) => void
}

export const DropdownContext = React.createContext({
  /**
   * Close the most immediate enclosing dropdown
   */
  close: () => {},
  /**
   * Close the most immediate enclosing dropdown
   * and refocus on the element that opened it
   */
  closeAndRefocus: () => {},
  /**
   * Returns a reference to the enclosing dropdown
   * Returns null if not within a dropdown
   */
  parent: (): DropdownContextType => {
    return null as any
  },
  /**
   * Returns whether or not the enclosing dropdown is open
   */
  parentOpen: true,
  /**
   * Close all the enclosing dropdowns and refocus
   * on the element that opened the dropdowns
   */
  deepCloseAndRefocus: function (this: DropdownContextType) {
    if (this.parent().parent() === null) {
      this.closeAndRefocus()
    } else {
      this.parent().deepCloseAndRefocus()
    }
  },
  /**
   * Close all the number of enclosing dropdowns
   * specified and refocus on the element that opened
   * the dropdown
   */
  depthCloseAndRefocus: function (
    this: DropdownContextType,
    depth: number = 1
  ) {
    if (this.parent().parent() === null || depth <= 1) {
      this.closeAndRefocus()
    } else {
      this.parent().depthCloseAndRefocus(depth - 1)
    }
  },
})
