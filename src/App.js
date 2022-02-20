import React, { Component } from "react"
import logo from "./logo.svg"
import "./App.css"

class LambdaDemo extends Component {
  constructor(props) {
    super(props)
    this.state = { loading: false, msg: null }
  }

  handleClick = api => e => {
    e.preventDefault()

    this.setState({ loading: true })
    fetch("/.netlify/functions/" + api)
      .then(response => response.json())
      .then(json => this.setState({ loading: false, msg: json.msg }))
      .catch(json => this.setState({ loading: false, msg: 'API not working' }))
  }

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
