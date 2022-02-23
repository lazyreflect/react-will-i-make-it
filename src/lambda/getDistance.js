// this uses the callback syntax, however, we encourage you to try the async/await syntax shown in async-dadjoke.js
// import getDistance from 'geolib/es/getDistance'
import risopData from './risopData.js'
import { getDistance } from 'geolib'
// const [userLatitude, setUserLatitude] = useState(51.5103)
// const [userLongitude, setUserLongitude] = useState(7.49347)

const userLatitude = 51.5103
const userLongitude = 7.49347

// const getUserLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(position => {
//         setUserLatitude(position.coords.latitude)
//         setUserLongitude(position.coords.longitude)
//       })
//     }
//   }


export function handler(event, context, callback) {
    
    const getClosestLocation = () => {
        const closestLocation = risopData.reduce((acc, curr) => {
          const distance = getDistance(
            { latitude: userLatitude, longitude: userLongitude },
            { latitude: curr.LATITUDE, longitude: curr.LONGITUDE }
          )
          return distance < acc.distance ? { distance, location: curr } : acc
        }, { distance: Infinity, location: {} })
        return closestLocation.location
      };
    console.log('queryStringParameters', event.queryStringParameters)
    
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ msg: getClosestLocation }),
    })
  }
  