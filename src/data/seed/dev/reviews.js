const faker = require('faker');
const map = require('lodash/map');
const random = require('lodash/random');
const take = require('lodash/take');
const { Types } = require('../../index');
const Review = require('../../models/Review');
const ReviewBallot = require('../../models/ReviewBallot');
const ReviewTag = require('../../models/ReviewTag');

const artist = '5963250ec8e851adaf576a8f';

const reviewers = [
  '59783323b392bfc34907f74a',
  '597f0e102375828642998407',
  '597f0e102375828642998408',
  '597f0e102375828642998409'
];

const reviewersObj = reviewers.map(Types.ObjectId);

const reviewTags = [
  {
      "_id" : "598023972375828642998408",
      "tag" : "Cheap"
  },
  {
      "_id" : "598023a22375828642998409",
      "tag" : "Creative"
  },
  {
      "_id" : "598023b4237582864299840a",
      "tag" : "Easy work with"
  },
  {
      "_id" : "598023be237582864299840b",
      "tag" : "Fast"
  },
  {
      "_id" : "598023c8237582864299840c",
      "tag" : "Free coffee and whiskey"
  },
  {
      "_id" : "598023d2237582864299840d",
      "tag" : "Modern office"
  },
  {
      "_id" : "598023de237582864299840e",
      "tag" : "Top inks"
  }
];

module.exports = async function () {
  const reviewTagIds = map(reviewTags, "_id");

  await Review.remove({ user: { $in: reviewersObj } });
  await ReviewTag.remove({ _id: { $in: reviewTagIds.map(Types.ObjectId) } });
  await ReviewBallot.remove({ user: { $in: reviewersObj } });

  // create review tags
  await ReviewTag.create(reviewTags);

  // create reviews
  for (let reviewer of reviewers) {
    const count = random(2, 5);
    try {
      let review = new Review({
        title: faker.lorem.sentence(),
        description: faker.lorem.sentences(),
        status: 'approved',
        user: reviewer,
        artist,
        tags: take(reviewTagIds, count),
        stars: faker.random.number({ min: 1, max: 5 }),
        createdAt: faker.date.past(),
      });

      review = await review.save();

      // create review votes
      for (let voter of reviewers) {
        const reviewBallot = new ReviewBallot({
          user: voter,
          review: review._id,
          vote: [-1, 1][random(0, 1)],
        });

        await reviewBallot.save();
      }
    } catch (e) {
      console.log('error', e.message);
    }
  }

  console.log('Seed reviews: done');
};
