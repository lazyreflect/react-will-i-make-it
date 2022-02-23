import { getDistance } from 'geolib'
const userLatitude = 51.5103
const userLongitude = 7.49347


export function handler(event, context, callback) {
    
    const distance = getDistance(
        { latitude: userLatitude, longitude: userLongitude },
        { latitude: "51° 31' N", longitude: "7° 28' E" }
    );
    console.log('queryStringParameters', event.queryStringParameters)
    console.log(distance)
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ msg: `${distance} meters` }),
    })
  }
  