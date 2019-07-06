const Question = require('../../models/Question');

module.exports = {
  Mutation: {
    saveQuestion: (_, { data }, ctx) => {
      const { id } = ctx.state.user || {};
      return Question.createOrUpdate(data, id);
    },
    saveQuestions: (_, { data }, ctx) => {
      const { id } = ctx.state.user || {};
      const queries = [];

      for (let i = 0; i < data.length; i++) {
        queries.push(Question.createOrUpdate(data[i], id))
      }

      return Promise.all(queries);
    },
  },
};
