const getFieldNames = require('graphql-list-fields');
const get = require('lodash/get');
const Subscription = require('../../models/Subscription');

module.exports = {
  Query: {
    subscription: (_, { email }, ctx, info) => Subscription.findOne({ email }),
  },
  Mutation: {
    subscribeNewsletter: async (_, { email }, ctx) => {
      // check if subscription exist
      const query = await Subscription.findOne({ email });
      if (query) {
        return query;
      }

      const subscription = new Subscription({ email });

      await subscription.save();
      return subscription;
    },
  },
}
