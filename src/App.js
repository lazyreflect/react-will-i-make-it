import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { getDistance } from "geolib";
import { risopData } from "./risopData";

// const getUserLocation = () => {
//   navigator.geolocation.getCurrentPosition(position => {
//     this.setState({ userLatitude: position.coords.latitude, userLongitude: position.coords.longitude })
//   })
// }
class CoordinatesForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      msg: null,
      userLatitude: 35.106766,
      userLongitude: -106.629181,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    event.preventDefault();

    this.setState({
      [name]: value,
    });
  }

  handleClickGetDistance = (api) => (e) => {
    e.preventDefault();
    const getClosestLocation = risopData.reduce(
      (acc, curr) => {
        const distance = getDistance(
          {
            latitude: this.state.userLatitude,
            longitude: this.state.userLongitude,
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

    console.log(getClosestLocation);
    this.setState({
      loading: false,
      msg: `You are ${getClosestLocation.distance * 0.000621} miles away from ${getClosestLocation.location.NAME}, a ${getClosestLocation.location.SUBCLASS} in ${getClosestLocation.location.COUNTY}, ${getClosestLocation.location.ST} `,
    });
  };

  render() {
    const { loading, msg } = this.state;

    return (
      <form>
        <label>
          Latitude:
          <input
            name="userLatitude"
            type="text"
            value={this.state.userLatitude}
            onChange={this.handleInputChange}
          />
        </label>
        <br />
        <label>
          Longitude:
          <input
            name="userLongitude"
            type="text"
            value={this.state.userLongitude}
            onChange={this.handleInputChange}
          />
        </label>
        <br />
        <br />
        <button onClick={this.handleClickGetDistance("getDistance")}>
          {loading ? "Getting distance..." : "Show me"}
        </button>
        <br />
        <span>{msg}</span>
      </form>
      
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>Nuclear War Target Finder</p>
          <p>Are you far enough away? (U.S. only)</p>
          <CoordinatesForm />
        </header>
      </div>
    );
  }
}

export default App;
