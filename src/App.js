import React, { Component } from "react"
import logo from "./logo.svg"
import "./App.css"
import { getDistance } from 'geolib'
import { risopData } from './risopData'

// const getUserLocation = () => {
//   navigator.geolocation.getCurrentPosition(position => {
//     this.setState({ userLatitude: position.coords.latitude, userLongitude: position.coords.longitude })
//   })
// }

class LambdaDemo extends Component {
  constructor(props) {
    super(props)
    this.state = { loading: false, msg: null, userLatitude: 35.106766, userLongitude: -106.629181}
  }

  

  handleClick = api => e => {
    e.preventDefault()
    const getClosestLocation = risopData.reduce((acc, curr) => {
      const distance = getDistance(
          { latitude: this.state.userLatitude, longitude: this.state.userLongitude },
          { latitude: curr.LATITUDE, longitude: curr.LONGITUDE }
      )
      if (distance < acc.distance) {
          return { distance, location: curr }
      }
      return acc
  }, { distance: Infinity, location: {} })
  
  console.log(getClosestLocation)
    this.setState({ loading: false, msg: `${getClosestLocation.distance * 0.000621}` })
   
  }
  //   this.setState({ loading: true })
  //   fetch("/.netlify/functions/" + api)
  //     .then(response => response.json())
  //     .then(json => this.setState({ loading: false, msg: json.msg }))
  //     .catch(json => this.setState({ loading: false, msg: 'API not working' }))
  // }

  render() {
    const { loading, msg } = this.state

    return (
      <p>
        <button onClick={this.handleClick("getDistance")}>{loading ? "Getting distance..." : "Get Distance"}</button>
        <br />
        <span>{msg}</span>
      </p>
    )
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Will you make it?
          </p>
          <LambdaDemo />
        </header>
      </div>
    )
  }
}

export default App
