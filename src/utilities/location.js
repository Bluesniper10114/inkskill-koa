const getLocationFromArray = ([city, state, country]) => {
  if (!country) {
    country = state;
    state = null;
  }

  return {
    city,
    state,
    country,
  }
};

const parseLocation = (locationString) => {
  if (!locationString) return null;

  const locationArray = locationString.split(',').map(part => part.trim());
  return getLocationFromArray(locationArray);
};


module.exports = {
  parseLocation,
  getLocationFromArray,
};
