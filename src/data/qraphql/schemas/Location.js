//language=GraphQL Schema
const Location = `
  type Location {
    gid: String
    city: String
    state: String
    country: String
  }

  input LocationInput {
    gid: String
    city: String!
    state: String
    country: String!
  }
`;

module.exports = Location;
