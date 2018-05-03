const yargs = require('yargs');
const axios = require('axios');

require('dotenv').config({ path: 'variables.env' });

const argv = yargs
  .options({
    a: {
      demand: true,
      alias: 'address',
      describe: 'Address of where to fetch weather information',
      string: true
    }
  })
  .help()
  .alias('h', 'help')
  .argv;

let encodedAddress = encodeURIComponent(argv.address);
let geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;

axios.get(geocodeURL).then((response) => {
  if (response.data.status === 'ZERO_RESULTS') {
    throw new Error('Unable to find that address.');
  }
  let lat = response.data.results[0].geometry.location.lat;
  let lng = response.data.results[0].geometry.location.lng;
  let weatherURL = `https://api.darksky.net/forecast/${process.env.KEY}/${lat},${lng}`
  console.log(response.data.results[0].formatted_address);
  return axios.get(weatherURL);
}).then((response) => {
  let temperature = response.data.currently.temperature;
  let apparentTemperature = response.data.currently.apparentTemperature;
  let summary = response.data.currently.summary;
  let rain = response.data.currently.precipProbability;
  console.log(`It's currently ${summary} and ${temperature}℉ but it feels more like ${apparentTemperature}℉. Chance of rain is ${rain}%.`);
}).catch((e) => {
  if (e.code === 'ECONNREFUSED') {
    console.log('Unable to connect to API.');
  } else {
    console.log(e.message);
  }
});
