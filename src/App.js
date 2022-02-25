import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";
import { getDistance } from "geolib";
import { risopData } from "./risopData";
import Globe from "react-globe.gl";

// const getUserLocation = () => {
//   navigator.geolocation.getCurrentPosition(position => {
//     this.setState({ userLatitude: position.coords.latitude, userLongitude: position.coords.longitude })
//   })
// }
const ARC_REL_LEN = 0.4; // relative to whole arc
const FLIGHT_TIME = 30000;
const NUM_RINGS = 5;
const RINGS_MAX_R = 5; // deg
const RING_PROPAGATION_SPEED = 5; // deg/sec

const { useState, useRef, useEffect, useCallback } = React;

const World = () => {
  const [userLatitude, setUserLatitude] = useState(null);
  const [userLongitude, setUserLongitude] = useState(null);
  const [arcsData, setArcsData] = useState([]);
  const [ringsData, setRingsData] = useState([]);
  const [headerMsg, setHeaderMsg] = useState('Choose a location in the United States.');
  const [footerMsg, setFooterMsg] = useState(null);
 

  const prevCoords = useRef({ lat: 70.89, lng: 8.19 });
  const emitArc = useCallback(({ lat: endLat, lng: endLng }) => {
    const { lat: startLat, lng: startLng } = prevCoords.current;
    prevCoords.current = { lat: 70.89, lng: 8.19 }; // prevCoords.current = { lat: endLat, lng: endLng };
    setUserLatitude(endLat);
    setUserLongitude(endLng);
    

    const getClosestLocation = risopData.reduce(
      (acc, curr) => {
        const distance = getDistance(
          {
            latitude: endLat,
            longitude: endLng,
          },
          { latitude: curr.LATITUDE, longitude: curr.LONGITUDE }
        );
        if (distance < acc.distance) {
          return { distance, location: curr };
        }
        return acc;
      },
      { distance: Infinity, location: {} }
    );
    setHeaderMsg(
      `You are ${
        (getClosestLocation.distance * 0.000621).toFixed(1)
      } miles away from a potential target.`
    );
    setFooterMsg(
      `${getClosestLocation.location.NAME}, ${getClosestLocation.location.COUNTY} County, ${getClosestLocation.location.ST} `
    );

    console.log(getClosestLocation);

    // add and remove arc after 1 cycle
    const arc = { startLat, startLng, endLat, endLng };

    setArcsData((curArcsData) => [...curArcsData, arc]);
    setTimeout(
      () => setArcsData((curArcsData) => curArcsData.filter((d) => d !== arc)),
      FLIGHT_TIME * 2
    );

    // add and remove start rings
    const srcRing = { lat: startLat, lng: startLng };
    setRingsData((curRingsData) => [...curRingsData, srcRing]);
    setTimeout(
      () =>
        setRingsData((curRingsData) =>
          curRingsData.filter((r) => r !== srcRing)
        ),
      FLIGHT_TIME * ARC_REL_LEN
    );

    // add and remove target rings
    setTimeout(() => {
      const targetRing = { lat: endLat, lng: endLng };
      setRingsData((curRingsData) => [...curRingsData, targetRing]);
      setTimeout(
        () =>
          setRingsData((curRingsData) =>
            curRingsData.filter((r) => r !== targetRing)
          ),
        FLIGHT_TIME * ARC_REL_LEN
      );
    }, FLIGHT_TIME);
  }, []);
  const globeEl = useRef()
  useEffect(() => {
    // aim at continental US centroid
    globeEl.current.pointOfView({
      lat: 44.34829053934529,
      lng: -97.6,
      altitude: 2,
    })
  }, [])
  return (
    <div>
      Open source RISOP nuclear target finder.
      <br />
      <br />
      Latitude: {userLatitude}
      <br />
      Longitude: {userLongitude}
      <br />
      <br />
      <span>{headerMsg}</span>
      <br />
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor={"#0c1012"}
        onGlobeClick={emitArc}
        arcsData={arcsData}
        arcColor={() => "darkOrange"}
        arcDashLength={ARC_REL_LEN}
        arcDashGap={2}
        arcDashInitialGap={1}
        arcDashAnimateTime={FLIGHT_TIME}
        arcsTransitionDuration={0}
        ref={globeEl}
        ringsData={ringsData}
        ringColor={() => (t) => `rgba(255,100,50,${1 - t})`}
        ringMaxRadius={RINGS_MAX_R}
        ringPropagationSpeed={RING_PROPAGATION_SPEED}
        ringRepeatPeriod={(FLIGHT_TIME * ARC_REL_LEN) / NUM_RINGS}
        showAtmosphere={false}
        // width={
        //   window.innerWidth < 900 ? window.innerWidth : window.innerWidth / 2
        // }
        height={
          window.innerWidth < 900
            ? window.innerHeight / 1.75
            : window.innerHeight / 1.5
        }
      />
      <br />
      {footerMsg}
    </div>
  );
};

// class CoordinatesForm extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       loading: false,
//       msg: null,
//       userLatitude: 35.106766,
//       userLongitude: -106.629181,
//     };

//     this.handleInputChange = this.handleInputChange.bind(this);
//   }

//   handleInputChange(event) {
//     const target = event.target;
//     const value = target.type === "checkbox" ? target.checked : target.value;
//     const name = target.name;
//     event.preventDefault();

//     this.setState({
//       [name]: value,
//     });
//   }

//   handleClickGetDistance = (api) => (e) => {
//     e.preventDefault();
//     const getClosestLocation = risopData.reduce(
//       (acc, curr) => {
//         const distance = getDistance(
//           {
//             latitude: this.state.userLatitude,
//             longitude: this.state.userLongitude,
//           },
//           { latitude: curr.LATITUDE, longitude: curr.LONGITUDE }
//         );
//         if (distance < acc.distance) {
//           return { distance, location: curr };
//         }
//         return acc;
//       },
//       { distance: Infinity, location: {} }
//     );

//     console.log(getClosestLocation);
//     this.setState({
//       loading: false,
//       msg: `You are ${getClosestLocation.distance * 0.000621} miles away from ${
//         getClosestLocation.location.NAME
//       }, a ${getClosestLocation.location.SUBCLASS} in ${
//         getClosestLocation.location.COUNTY
//       }, ${getClosestLocation.location.ST} `,
//     });
//   };

//   render() {
//     const { loading, msg } = this.state;

//     return (
//       <form>
//         <label>
//           Latitude:
//           <input
//             name="userLatitude"
//             type="text"
//             value={this.state.userLatitude}
//             onChange={this.handleInputChange}
//           />
//         </label>
//         <br />
//         <br />
//         <label>
//           Longitude:
//           <input
//             name="userLongitude"
//             type="text"
//             value={this.state.userLongitude}
//             onChange={this.handleInputChange}
//           />
//         </label>
//         <br />
//         <br />
//         <button onClick={this.handleClickGetDistance("getDistance")}>
//           {loading ? "Getting distance..." : "Show me"}
//         </button>
//         <br />
//         <span>{msg}</span>
//       </form>
//     );
//   }
// }

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <World />
          {/* <CoordinatesForm /> */}
        </header>
      </div>
    );
  }
}

export default App;
