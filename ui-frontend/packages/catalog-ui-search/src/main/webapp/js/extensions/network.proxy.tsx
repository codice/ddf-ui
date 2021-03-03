/**
 * When we're in test environment, patch everything to avoid hitting the network.
 *
 * For now this is a simple voiding of fetch, but we could detect which model is doing the fetch and return mocked responses.
 */
import { Environment } from '../Environment'
import * as Backbone from 'backbone'

if (Environment.isTest()) {
  //@ts-ignore
  Backbone.Model.prototype.fetch = function () {
    // mock response?
  }
}
