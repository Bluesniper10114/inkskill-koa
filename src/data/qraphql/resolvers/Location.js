const gMaps = require('../../../utilities/externals/google-maps');
const { getLocationFromArray } = require('../../../utilities/location');

module.exports = {
  Query: {
    searchLocation: async (_, { query }) => {
      const result = await gMaps.autoComplete(query);

      return result.predictions.map((item) => {
        // eslint-disable-next-line prefer-const
        const locationArray = item.terms.map(t => t.value);
        const location = getLocationFromArray(locationArray);

        return Object.assign({ gid: item.place_id }, location)
      });
    }
  },
};
