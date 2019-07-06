const getFieldNames = require('graphql-list-fields');
const get = require('lodash/get');
const Review = require('../../models/Review');
const User = require('../../models/User');
const ReviewBallot = require('../../models/ReviewBallot');
const ReviewTag = require('../../models/ReviewTag');

module.exports = {
  Query: {
    review: (_, { id }, ctx, info) => Review.findById(id),
    reviewTags: () => ReviewTag.find({}),
    reviewsAuthored: async(_, args, ctx, info) => {
      // check if user logged in
      if (!ctx.state.user) {
        throw new Error('You must be logged in to continue.');
      }

      const { id } = ctx.state.user || {};
      let filter = { user: id };
      const reviews = await Review.find(filter, '', { createdAt: -1 });
      return reviews;
    }
  },
  Mutation: {
    createReview: async (_, { artist, data }, ctx) => {
      // check if user logged in
      if (!ctx.state.user) {
        throw new Error('You must be logged in to vote.');
      }

      const { user } = ctx.state;

      // cannot create review for self
      if (user.id === artist) {
        throw new Error('You cannot create review for yourself.');
      }

      // check if artist exist
      const query = await User.findById(artist);
      if (!query) {
        throw new Error(`Couldn't find artist with id ${artist}`);
      }

      const review = new Review(Object.assign({}, data, { user: user.id, artist }));

      await review.save();
      return review;
    },
    approveReview: async(_, { data: { id, type } }, ctx) => {
      // check if user logged in
      if (!ctx.state.user) {
        throw new Error('You must be logged in to approve.');
      }

      // check if review exists
      const review = await Review.findById(id);
      if (!review) {
        throw new Error(`Couldn't find review with id ${id}`);
      }

      const { user } = ctx.state;

      // check if owner of review
      if (!review.artist.equals(user.id)) {
        throw new Error('You do not have the privelege to approve the review.');
      }

      // check if already processed
      if (review.status !== 'pending') {
        throw new Error('The review is already processed.');
      }

      const approveValue = {
        APPROVE: 'approved',
        DECLINE: 'declined',
      }[type];

      review.status = approveValue;
      await review.save();
      return review;
    },
    voteReview: async (_, { data: { id, type } }, ctx) => {
      // check if user logged in
      if (!ctx.state.user) {
        throw new Error('You must be logged in to vote.');
      }

      // check if review exist
      let review = await Review.findOne({ _id: id, status: 'approved' });
      if (!review) {
        throw new Error(`Couldn't find review with id ${id}`);
      }

      const { user } = ctx.state;

      const voteValue = {
        UP: 1,
        DOWN: -1,
        CANCEL: 0,
      }[type];

      // fetch vote data
      let ballot = await ReviewBallot.findOne({ user: user.id, review: id });

      if (voteValue !== 0) {  // not cancel
        if (ballot) {
          throw new Error('You have already voted.');
        }
        ballot = new ReviewBallot({
          user: ctx.state.user.id,
          review: id,
          vote: voteValue
        });

        await ballot.save();
      } else { // cancel vote
        if (!ballot) {
          throw new Error('You did not vote');
        }
        await ballot.remove();
      }

      review = await Review.findById(id);
      return review;
    },
    createReviewTag: async (_, { tag }) => {
      const cleanTag = tag.trim().toLowerCase();
      const query = await ReviewTag.findOne({ tag: cleanTag });

      if (query) {
        throw new Error('Tag already exists.');
      }

      const newTag = new ReviewTag({ tag: cleanTag });
      await newTag.save();

      return newTag;
    },
    updateReviewTag: async (_, { data: { id, tag } }) => {
      const cleanTag = tag.trim().toLowerCase();
      const query = await ReviewTag.findOne({ tag: cleanTag, _id: { $ne: id } });
      if (query) {
        throw new Error('Tag already exists.');
      }
      const updatedTag = await ReviewTag.findOneAndUpdate({ _id: id }, { $set: { tag: cleanTag } });
      return updatedTag;
    },
    removeReviewTag: async (_, { id }) => {
      const tag = await ReviewTag.findById(id);
      if (!tag) {
        throw new Error('Tag does not exist.');
      }
      const review = await Review.findOne({ tag: id });
      if (review) {
        throw new Error('You cannot remove a tag in use.');
      }

      await tag.remove();
      return tag;
    }
  },
  Review: {
    user: (review) => User.findById({ _id: review.user }),
    artist: (review) => User.findById({ _id: review.artist }),
    thumbUpCount: (review) => ReviewBallot.count({ review: review._id, vote: 1 }),
    thumbDownCount: (review)  => ReviewBallot.count({ review: review._id, vote: -1 }),
    tags: (review) => ReviewTag.find({ _id: { $in: get(review, 'tags', []) } }),
    ballots: (review) => ReviewBallot.find({ review: review._id }, '', { createdAt: -1 }),
  },
  ReviewBallot: {
    user: (ballot) => User.findById(ballot.user),
  }
}
