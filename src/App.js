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
const ARC_REL_LEN = 0.2; // relative to whole arc
const FLIGHT_TIME = 15000;
const NUM_RINGS = 5;
const RINGS_MAX_R = 0.25; // deg
const RING_PROPAGATION_SPEED = 0.075; // deg/sec
const NUMBER_OF_LOCATIONS = 12; // number of closest targets to show

const { useState, useRef, useEffect, useCallback } = React;

const World = () => {
  const [userLatitude, setUserLatitude] = useState(35.106766);
  const [userLongitude, setUserLongitude] = useState(-106.629181);
  const [arcsData, setArcsData] = useState([]);
  const [ringsData, setRingsData] = useState([]);
  const [headerMsg, setHeaderMsg] = useState(
    "Click or tap on a location in the U.S. to determine its blast risk during total nuclear war."
  );
  const [footerMsg, setFooterMsg] = useState(null);
  const [getClosestNumberOfLocations, setGetClosestNumberOfLocations] =
    useState([]);

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
      `The closest potential target is ${(
        getClosestLocation.distance * 0.000621
      ).toFixed(1)} miles away in ${
        getClosestLocation.location.COUNTY
      } COUNTY, ${getClosestLocation.location.ST}:`
    );
    setFooterMsg(
      `${getClosestLocation.location.NAME}, ${getClosestLocation.location.SUBCLASS} `
    );

    const getClosestNumberOfLocations = risopData
      .sort(
        (a, b) =>
          getDistance(
            { latitude: endLat, longitude: endLng },
            { latitude: a.LATITUDE, longitude: a.LONGITUDE }
          ) -
          getDistance(
            { latitude: endLat, longitude: endLng },
            { latitude: b.LATITUDE, longitude: b.LONGITUDE }
          )
      )
      .slice(0, NUMBER_OF_LOCATIONS);
    console.log(getClosestLocation);
    console.log(getClosestNumberOfLocations);
    setGetClosestNumberOfLocations(getClosestNumberOfLocations);

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
  }, []);
  const globeEl = useRef();
  useEffect(() => {
    // aim at continental US centroid
    globeEl.current.pointOfView({
      lat: userLatitude,
      lng: userLongitude,
      altitude: .935,
    });
  }, [userLatitude, userLongitude]);

  const gData = getClosestNumberOfLocations
    .map((location) => {
      return {
        name: `${location.NAME} | ${location.SUBCLASS}`,
        lat: location.LATITUDE,
        lng: location.LONGITUDE,
        size: (Math.random() * (.91 - .9) + .9),
        color: "darkOrange",
      };
    })
    .concat({
      name: `${userLatitude}, ${userLongitude}`,
      lat: userLatitude,
      lng: userLongitude,
      size: .91,
      color: "green",
    });
  return (
    <div>
      <br />
      Potential Nuclear Blast Risk Modeler v0.2 
      <br />
      <br />
      Only hypothetical U.S. based targets from <a href="https://github.com/davidteter/OPEN-RISOP">OPEN-RISOP</a> are shown.
      <br />
      {/* Latitude: {userLatitude}
      <br />
      Longitude: {userLongitude}
      <br /> */}
      <br />
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        backgroundColor={"#0c1012"}
        onGlobeClick={emitArc}
        arcAltitudeAutoScale={3}
        arcsData={arcsData}
        arcColor={() => "darkOrange"}
        arcDashLength={ARC_REL_LEN}
        arcDashGap={2}
        arcDashInitialGap={1}
        arcDashAnimateTime={FLIGHT_TIME}
        arcStroke={0.0125}
        arcsTransitionDuration={0}
        pointsData={gData}
        pointAltitude="size"
        pointColor="color"
        pointRadius={0.00125}
        labelsData={gData}
        labelAltitude="size"
        labelColor="color"
        labelDotOrientation={() => "right"}
        labelDotRadius={0.005}
        labelText="name"
        labelSize={0.025}
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
      {footerMsg}
    </div>
  );
};

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <World />
          <a href="https://visualcustody.com">Visual Custody</a>
          {/* <CoordinatesForm /> */}
        </header>
      </div>
    );
  }
}

export default App;
