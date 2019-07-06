require('dotenv').config();

const Style = require('../models/Style');
const Album = require('../models/Album');
const styleData = require('./styles.json');
const albumData = require('./albums.json');
const seedDev = require('./dev');

async function seed() {
  console.log('Seed is running');
  await Style.remove({});
  await Style.create(styleData);
  await Album.remove({});
  await Album.create(albumData);

  if (process.env.NODE_ENV === 'development') {
    console.log('Development Seed is running');
    await seedDev();
  }
}

async function main() {
  try {
    await seed();
    console.log('Seeding is done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(255);
  }
}

main();
