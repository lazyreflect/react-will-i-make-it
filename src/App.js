import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";
import { getDistance } from "geolib";
import { risopData } from "./risopData";
import Globe from "react-globe.gl";
import Autocomplete from "react-google-autocomplete";

// const getUserLocation = () => {
//   navigator.geolocation.getCurrentPosition(position => {
//     this.setState({ userLatitude: position.coords.latitude, userLongitude: position.coords.longitude })
//   })
// }
const ARC_REL_LEN = 0.2; // relative to whole arc
const FLIGHT_TIME = 15000;
const NUM_RINGS = 10;
const RINGS_MAX_R = 0.05; // deg
const RING_PROPAGATION_SPEED = 0.0095; // deg/sec
const NUMBER_OF_LOCATIONS = 12; // number of closest targets to show
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY
console.log(GOOGLE_MAPS_API_KEY)

const { useState, useRef, useEffect, useCallback} = React;

const World = () => {
  const [userLatitude, setUserLatitude] = useState(35.079884);
  const [userLongitude, setUserLongitude] = useState(-106.604624);
  const [userName, setUserName ] = useState("Albuquerque, NM, USA");
  const [arcsData, setArcsData] = useState([]);
  const [ringsData, setRingsData] = useState([]);
  const [headerMsg, setHeaderMsg] = useState([]);
  const [footerMsg, setFooterMsg] = useState(null);
  const [getClosestNumberOfLocations, setGetClosestNumberOfLocations] =
    useState([]);

  const prevCoords = useRef({ lat: 70.89, lng: 8.19 });

  const emitArc = useCallback(() => {
    const { lat: startLat, lng: startLng } = prevCoords.current;
    prevCoords.current = { lat: 70.89, lng: 8.19 }; // prevCoords.current = { lat: endLat, lng: endLng };
    // setUserLatitude(endLat);
    // setUserLongitude(endLng);

    const getClosestLocation = risopData.reduce(
      (acc, curr) => {
        const distance = getDistance(
          {
            latitude: userLatitude,
            longitude: userLongitude,
          },
          { latitude: curr.LATITUDE, longitude: curr.LONGITUDE }
        );
        if (distance < acc.distance) {
          setHeaderMsg(
            `You are ${(
              distance * 0.000621
            ).toFixed(1)} miles away from: ${curr.NAME}`
          );
          setFooterMsg(
            `Target category: ${curr.SUBCLASS} `
          );
          return { distance, location: curr };
        }
        return acc;
      },
      { distance: Infinity, location: {} }
    );

   

    const getClosestNumberOfLocations = risopData
    .sort(
      (a, b) =>
        getDistance(
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: a.LATITUDE, longitude: a.LONGITUDE }
        ) -
        getDistance(
          { latitude: userLatitude, longitude: userLongitude },
          { latitude: b.LATITUDE, longitude: b.LONGITUDE }
        )
    )
    .slice(0, NUMBER_OF_LOCATIONS)
    .map(location => ({ ...location, DISTANCE: getDistance(
      { latitude: userLatitude, longitude: userLongitude },
      { latitude: location.LATITUDE, longitude: location.LONGITUDE }
    )}));
    console.log(getClosestLocation);
    console.log(getClosestNumberOfLocations);
    setGetClosestNumberOfLocations(getClosestNumberOfLocations);
    
    //   `The closest potential target is ${(
    //     distance * 0.000621
    //   ).toFixed(1)} miles away`
    // );
    // setFooterMsg(
    //   `${curr.NAME}, ${curr.SUBCLASS} `
    // );

    // add and remove arc after 1 cycle // const arc = { startLat, startLng, endLat, endLng };
    // setArcsData((curArcsData) => [...curArcsData, arc]);

    // add and remove arcs after 1 cycle
    const arcs = getClosestNumberOfLocations.map((location) => {
      return {
        startLat: startLat,
        startLng: startLng,
        endLat: location.LATITUDE,
        endLng: location.LONGITUDE,
      };
    });

    setArcsData((curArcsData) => [...curArcsData, ...arcs]);

    setTimeout(
      () => setArcsData((curArcsData) => curArcsData.filter((d) => d !== arcs)),
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

    // add and remove multiple target rings using the array from getClosestNumberOfLocations
    setTimeout(() => {
      const targetRings = getClosestNumberOfLocations.map((location) => {
        return { lat: location.LATITUDE, lng: location.LONGITUDE };
      });
      setRingsData((curRingsData) => [...curRingsData, ...targetRings]);
      setTimeout(
        () =>
          setRingsData((curRingsData) =>
            curRingsData.filter((r) => r !== targetRings)
          ),
        FLIGHT_TIME * ARC_REL_LEN
      );
    }, FLIGHT_TIME);
  }, [userLatitude, userLongitude]);
  const globeEl = useRef();
  useEffect(() => {
    // aim at continental US centroid
    globeEl.current.pointOfView({
      lat: userLatitude,
      lng: userLongitude,
      altitude: 0.01,
    });
  }, [userLatitude, userLongitude]);

  const gData = getClosestNumberOfLocations
    .map((location) => {
      return {
        name: `${location.NAME} | ${(
          location.DISTANCE * 0.000621
        ).toFixed(1)} mi`,
        distance: location.DISTANCE,
        lat: location.LATITUDE,
        lng: location.LONGITUDE,
        size: .007,
        color: "darkOrange",
      };
    })
    .concat({
      name: `${userName}`,
      lat: userLatitude,
      lng: userLongitude,
      size: .008,
      color: "green",
    });
  return (
    <div>
      <br />
      Find Nuclear War Targets Near You (U.S. only)
      <br />
      <Autocomplete
        apiKey={GOOGLE_MAPS_API_KEY}
        style={{ width: "50%" }}
        onPlaceSelected={(place) => {
          console.log('place', place, place.geometry.location.lat(), place.geometry.location.lng());
          setUserLatitude(place.geometry.location.lat());
          setUserLongitude(place.geometry.location.lng());
          setUserName(place.formatted_address);        
        }}
        options={{
          types: ["geocode"],
          componentRestrictions: { country: "us" },
        }}
        defaultValue=""
      /><button onClick={emitArc}>Calculate Risk</button>
      <br />
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundColor={"#0c1012"}
        // onGlobeClick={emitArc}
        arcAltitudeAutoScale={3}
        arcsData={arcsData}
        arcColor={() => "darkOrange"}
        arcDashLength={ARC_REL_LEN}
        arcDashGap={2}
        arcDashInitialGap={1}
        arcDashAnimateTime={FLIGHT_TIME}
        arcStroke={0.00125}
        arcsTransitionDuration={0}
        pointsData={gData}
        pointAltitude="size"
        pointColor="color"
        pointRadius={0.00025}
        labelsData={gData}
        labelAltitude="size"
        labelColor="color"
        labelDotOrientation={() => "right"}
        labelDotRadius={0.0005}
        labelText="name"
        labelSize={0.0025}
        // pointsMerge={true}
        ref={globeEl}
        ringsData={ringsData}
        ringColor={() => (t) => `rgba(255,100,50,${1 - t})`}
        ringMaxRadius={RINGS_MAX_R}
        ringPropagationSpeed={RING_PROPAGATION_SPEED}
        ringRepeatPeriod={(FLIGHT_TIME * ARC_REL_LEN) / NUM_RINGS}
        // showAtmosphere={false}
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
      <span>{headerMsg}</span>
      <br />
      <br />
      <span>{footerMsg}</span>
    </div>
  );
};

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <World />
          <br />
         Demo created by <a href="https://visualcustody.com">Visual Custody</a>
          {/* <CoordinatesForm /> */}
        </header>
      </div>
    );
  }
}

export default App;
