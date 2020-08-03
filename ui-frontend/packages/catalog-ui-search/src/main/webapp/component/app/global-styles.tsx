import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  /* Only needed because we import 'bootstrap.less' in catalog-ui-search. */
  legend {
    /* Unset all properties */
    all: unset;

    /* Place back material-ui styling */
    padding: 0 !important;
    text-align: left !important;
    transition: width 200ms cubic-bezier(0, 0, 0.2, 1) 0ms;
    line-height: 11px !important;
  }

  /* So we match Material */
  .navigation-item + .navigation-item {
    margin-left: 10px;
  }
  .navigation-item:not(:last-of-type) {
    border-radius: 25px; 
  }

  .inspector-content {
    transform: none;
  }
  .MuiPickersModal-dialogRootWider {
    min-width: 500px !important;
  }
  .MuiPickersBasePicker-pickerView {
    max-width: none !important;
  }
  .MuiDialog-paperWidthSm {
    max-width: none !important;
  }

  .no-resource {
    *[data-id='Overwrite'] {
      display: none !important;
    }
  }
  .federated {
    *[data-id='Notes'] {
      display: none !important;
    }
  }
`
