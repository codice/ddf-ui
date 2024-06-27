/// <reference types="react" />
import { IndividualRouteType } from './app';
/**
 * The issue with the original golden layout code for popout is that it will go to the current route and then load gl and all that.
 *
 * However, usually there are things on the route we don't want to run (for performance sometimes, and for other times because they reset prefs or whatnot to clear things)
 *
 * As a result, we have this route that is just for the popout, it doesn't show in the nav, and it doesn't run the other things on the route
 *
 * We have to have an instance of golden layout for the popout to attach to, which this provides, with a query that's blank (just so we can transfer results and what not to it)
 */
export declare const GoldenLayoutPopoutRoute: IndividualRouteType;
declare const _default: () => JSX.Element;
export default _default;
