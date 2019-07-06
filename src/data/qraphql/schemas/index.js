const Post = require('./Post');
const Profile = require('./Profile');
const Review = require('./Review');
const Subscription = require('./Subscription');

//language=GraphQL Schema
const root = `
  scalar Date

  input FormMetaInput {
    autoSubmit: Boolean
  }

  # the schema allows the following query:
  type Query {
    styles: [Style]
    latestPosts: [Post]
    post(id: ID!): Post
    profile(username: String!): Profile
    profileById(id: ID!): Profile
    wall(username: String!): [Post]
    searchLocation(query: String!): [Location]
    users: [Profile]
    review(id: ID!): Review
    reviewTags: [ReviewTag]
    reviewsAuthored: [Review]
    subscription(email: String!): Subscription
  }

  type Mutation {
    followProfile (id: ID!, follow: Boolean): Profile
    updateProfile (data: ProfileFormInput): Profile
    updateAvatar (imageData: String!): Profile
    updatePicHero (imageData: String!): Profile
    useAvatar (service: String!): Profile
    completeSignUp (step: String!, data: SignUpCompleteInput): Profile,
    createComment (comment: String!): Post
    createImage (data: ImageInput!): Post
    createVideo (data: VideoInput!): Post
    rotateImage (id: ID!, direction: RotateDirection = right): Post
    youtubeImport (data: [String]!): [Post]
    reportAsset (id: ID!, problem: String!): Post
    addComment (id: ID!, comment: String!): Comment
    likePost (id: ID!, type: Int): Post
    saveQuestion (data: QAInput!): QA
    saveQuestions (data: [QAInput]!): [QA]
    removeUser(id: ID!): Profile
    createReview(artist: ID!, data: ReviewInput!): Review
    approveReview(data: ReviewApproveInput!): Review
    voteReview(data: ReviewBallotInput!): Review
    createReviewTag(tag: String!): ReviewTag
    updateReviewTag(data: ReviewTagInput): ReviewTag
    removeReviewTag(id: ID!): ReviewTag
    subscribeNewsletter(email: String!): Subscription
    updateUserStatus(id: ID!, type: UserStatusType!, value: Boolean): Profile
    addUpdateUser(id: ID, data: EditUserInput): Profile
  }
`;

module.exports = [root, Post, Profile, Review, Subscription];
