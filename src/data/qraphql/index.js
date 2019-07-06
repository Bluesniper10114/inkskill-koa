const { makeExecutableSchema } = require('graphql-tools');
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers,
});
