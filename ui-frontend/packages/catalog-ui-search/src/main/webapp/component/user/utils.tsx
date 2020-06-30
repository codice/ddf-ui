const userInstance = require('catalog-ui-search/src/main/webapp/component/singletons/user-instance')

export const DEFAULT_DATE_TIME_FORMAT = 'DD MMMM YYYY h:mm a Z'

export const getDateTimeFormat = () => {
  try {
    const dateTimeFormat = userInstance
      .get('user')
      .get('preferences')
      .get('dateTimeFormat').datetimefmt

    return dateTimeFormat || DEFAULT_DATE_TIME_FORMAT
  } catch (err) {
    console.log(
      "Unable to retrieve user's prefered datetime format. Retrieving default datetime format.",
      err
    )
    return DEFAULT_DATE_TIME_FORMAT
  }
}
