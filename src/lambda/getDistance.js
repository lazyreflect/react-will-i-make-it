// this uses the callback syntax, however, we encourage you to try the async/await syntax shown in async-dadjoke.js
// import getDistance from 'geolib/es/getDistance'
import { getDistance } from 'geolib'

export function handler(event, context, callback) {
    const distance = getDistance(
        { latitude: 51.5103, longitude: 7.49347 },
        { latitude: "51° 31' N", longitude: "7° 28' E" }
    );
    console.log('queryStringParameters', event.queryStringParameters)
    console.log(distance)
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ msg: distance }),
    })
  }
  