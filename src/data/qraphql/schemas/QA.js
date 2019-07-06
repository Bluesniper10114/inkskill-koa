//language=GraphQL Schema
const QA = `
  type QA {
    _id: ID
    question: String
    answer: String
  }

  input QAInput {
    _id: ID
    question: String!
    answer: String!
  }
`;

module.exports = QA;
