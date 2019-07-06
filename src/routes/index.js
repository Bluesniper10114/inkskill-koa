const Router = require('koa-router');
const { graphqlKoa, graphiqlKoa } = require('graphql-server-koa');
const { addErrorLoggingToSchema } = require('graphql-tools');
const auth = require('./auth');
const proxy = require('./proxy');
const storage = require('./storage');
const mockData = require('../mock-data/routes');
const GraphQLSchema = require('../data/qraphql');
const router = new Router;
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) addErrorLoggingToSchema(GraphQLSchema, console);

router.use('/auth', auth.routes());
router.use('/storage', storage.routes());
router.use('/proxy', proxy.routes());
router.use('/dev', mockData.routes());

if (isDev) router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

router.all('/graphql', graphqlKoa(ctx => ({
  schema: GraphQLSchema,
  context: ctx,
  debug: isDev,
  formatError: error => ({
    message: error.message,
    details: error.originalError && error.originalError.details,
    locations: error.locations,
    path: error.path,
  }),
})));

module.exports = router;
