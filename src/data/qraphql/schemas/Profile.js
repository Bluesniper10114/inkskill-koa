let Location;
let Post;
let QA;
let Profile;
let Review;

// This is workaround for circular dependencies
// @see https://github.com/apollographql/apollo-server/issues/126
module.exports = () => [Profile, Location, Post, QA, Review];
Location = require('./Location');
Post = require('./Post');
QA = require('./QA');
Review = require('./Review');

//language=GraphQL Schema
Profile = `
  enum UserStatusType {
    ACTIVATED
    VERIFIED
    POPULAR
    ADMIN
  }

  type ProfileUrls {
    web: String
    fb: String
    tw: String
    gp: String
    ig: String
  }

  type ProfileStats {
    profileId: ID!
    isFollowing: Boolean
    posts: Int
    followers: Int
    following: Int
  }

  type AvatarUrls {
    original: String
    md: String
    sm: String
  }

  type Profile {
    _id: ID!
    name: String
    email: String
    username: String
    wallpaperUrl: String
    avatarUrls: AvatarUrls
    gender: String
    role: String
    bio: String
    urls: ProfileUrls
    location: Location
    isVerified: Boolean
    isActivated: Boolean
    isPopular: Boolean
    isAdmin: Boolean
    createdAt: Date
    step: String
    stats: ProfileStats
    images: [Post]
    videos: [Post]
    questions: [QA]
    reviewsReceived: [Review]
    deleted: Boolean
  }

  input UrlsInput {
    web: String
  }

  input ProfileFormInput {
    name: String
    bio: String
    urls: UrlsInput
    location: LocationInput
  }

  input EditUserInput {
    _id: ID
    name: String
    email: String!
    username: String!
    gender: String!
    role: String!
    urls: UrlsInput
    location: LocationInput!
    isAdmin: Boolean!
    createdAt: Date!
    password: String
  }

  input SignUpCompleteInput {
    avatar: String
    username: String
    name: String
    role: String
    bio: String
    location: LocationInput
    _meta: FormMetaInput
  }
`;
