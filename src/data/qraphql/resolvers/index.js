const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const merge = require('lodash/merge');
const Style = require('../../models/Style');

const Location = require('./Location');
const Post = require('./Post');
const Profile = require('./Profile');
const QA = require('./QA');
const Review = require('./Review');
const Subscription = require('./Subscription');

const root = {
  Query: {
    styles: () => Style.find({}),
  },
  Date: new GraphQLScalarType({
      name: 'Date',
      description: 'Date custom scalar type',
      parseValue(value) {
        return new Date(value); // value from the client
      },
      serialize(value) {
        return value.getTime(); // value sent to the client
      },
      parseLiteral(ast) {
        if (ast.kind === Kind.INT) {
          return parseInt(ast.value, 10); // ast value is always in string format
        }
        return null;
      },
  }),
};

module.exports = merge(root, Location, Post, Profile, QA, Review, Subscription);
