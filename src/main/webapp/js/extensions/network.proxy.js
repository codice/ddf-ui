/**
 * When we're in test environment, patch everything to avoid hitting the network.
 *
 * For now this is a simple voiding of fetch, but we could detect which model is doing the fetch and return mocked responses.
 */
import { Environment } from '../Environment';
import * as Backbone from 'backbone';
if (Environment.isTest()) {
    // @ts-expect-error ts-migrate(2322) FIXME: Type '() => void' is not assignable to type '(opti... Remove this comment to see the full error message
    Backbone.Model.prototype.fetch = function () {
        // mock response?
    };
}
//# sourceMappingURL=network.proxy.js.map