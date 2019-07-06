let Post;
let Profile;

// This is workaround for circular dependencies
// @see https://github.com/apollographql/apollo-server/issues/126
module.exports = () => [Post, Profile];
Profile = require('./Profile');

//language=GraphQL Schema
Post = `  
  type Style {
    _id: Int,
    name: String
  }
  
  type LikeStats {
    type: Int
    total: Int
    recentPeople: [Profile]
  }

  type PostStats {
    likes: Int
    comments: Int
    likeTypes: [Int]
  }
  
  type PostSource {
    id: String
    type: String
  }
  
  type CommentStats {
    likes: Int
    replies: Int
  }
  
  type Comment {
    _id: String
    comment: String
    user: Profile
    stats: CommentStats
    replies: [Comment]
    createdAt: String
  }

  enum PreviewSize {
    sm
    md
  }
  
  enum RotateDirection {
    left
    right
  }
  
  type Post {
    _id: ID
    post: String
    type: String
    name: String
    desc: String
    url(update: Boolean = false): String
    previewUrl(size: PreviewSize = sm, update: Boolean = false): String
    style: [Style]
    user: Profile
    stats: PostStats
    source: PostSource
    comments: [Comment]
    likeType: Int
    likeStats: [LikeStats]
    likedBy: [Profile]
    createdAt: String
  }

  input ImageInput {
    name: String
    style: [Int]
    imageData: String!
    desc: String
  }

  input VideoInput {
    name: String
    desc: String
    file: String!
    position: Float
  }
`;
