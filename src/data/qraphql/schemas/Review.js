let Profile;

module.exports = () => [Profile, Review];

Profile = require('./Profile');

Review = `
  # the type of vote
  enum VoteType {
    UP
    DOWN
    CANCEL
  }

  enum ApproveType {
    APPROVE
    DECLINE
  }

  # review votes log
  type ReviewBallot {
    _id: ID!
    user: Profile
    vote: Int
    createdAt: Date
  }

  # review tags
  type ReviewTag {
    _id: ID!
    tag: String
  }

  # artist reviews
  type Review {
    _id: ID!
    title: String
    description: String
    tags: [ReviewTag]
    stars: Int
    user: Profile
    artist: Profile
    status: String
    createdAt: Date
    thumbUpCount: Int
    thumbDownCount: Int
    ballots: [ReviewBallot]
  }

  input ReviewInput {
    title: String!
    description: String!
    stars: Int
    tags: [ID!]
  }

  input ReviewBallotInput {
    id: ID!
    type: VoteType!
  }

  input ReviewTagInput {
    id: ID!
    tag: String!
  }

  input ReviewApproveInput {
    id: ID!
    type: ApproveType!
  }
`;
