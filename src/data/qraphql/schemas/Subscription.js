let Subscription;

module.exports = () => [Subscription];

Subscription = `
  # subscribe
  type Subscription {
    _id: ID!
    email: String
    createdAt: Date
  }

  input SubscriptionInput {
    email: String!
  }
`;
