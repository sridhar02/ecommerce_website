import React, { Component, Fragment } from "react";
import Router from "next/router";

class Index extends Component {
  componentDidMount() {
    Router.push("/products");
  }
  render() {
    return <div></div>;
  }
}

export default Index;

