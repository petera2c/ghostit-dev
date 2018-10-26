import React, { Component } from "react";
import moment from "moment-timezone";

import LineChart from "../../../components/LineChart";

class Section3 extends Component {
  state = {
    lines: [[]]
  };
  componentDidMount() {
    this.createRandomChartPlots();
    setInterval(this.createRandomChartPlots, 3000);
  }
  createRandomChartPlots = () => {
    let amountOfLines = 3;
    let amountOfDataPoints = 30;
    let lines = [];
    for (let i = 0; i < amountOfLines; i++) {
      lines[i] = [];
    }

    for (let i = 0; i < amountOfLines; i++) {
      for (let j = 0; j < amountOfDataPoints; j++) {
        lines[i].push(j + ~~(Math.random() * 20));
      }
    }
    this.setState({ lines });

    //212 712
  };
  render() {
    const { lines } = this.state;

    return (
      <div className="section flex hc vc px32">
        <div className="platform-component-showcase fill">
          <LineChart
            {...{
              lines: lines,
              colors: [
                "var(--five-purple-color)",
                "var(--five-primary-color)",
                "var(--seven-purple-color)",
                "var(--seven-primary-color)"
              ]
            }}
          />
        </div>
        <div className="third flex column vc hc">
          <div className="description-box flex column hc">
            <h4 className="title silly-font pb8">Attribution.</h4>
            <p className="body">
              Analytics reporting on all of your marketing campaigns.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Section3;
