import React, { Component } from "react";
import "./style.css";

class Loader extends Component {
  render() {
    return (
      <div className="loader-background">
        <div className="lds-wedges">
          <div>
            <div>
              <div />
            </div>
            <div>
              <div />
            </div>
            <div>
              <div />
            </div>
            <div>
              <div />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Loader;
