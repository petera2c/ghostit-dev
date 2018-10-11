import React, { Component } from "react";
import axios from "axios";
import UsersTable from "./UsersTable";
import PlansTable from "./PlansTable";
import "./styles/";

class ManagePage extends Component {
  state = {
    userTable: true
  };

  switchDivs = event => {
    this.setState({ userTable: !this.state.userTable });
  };

  render() {
    return (
      <div>
        <div className="switch">
          {!this.state.userTable && (
            <button
              className="switch-button active-switch"
              onClick={event => this.switchDivs(event)}
            >
              Edit Users
            </button>
          )}
          {this.state.userTable && (
            <button
              className="switch-button active-switch"
              onClick={event => this.switchDivs(event)}
            >
              Edit Plans
            </button>
          )}
        </div>
        {this.state.userTable ? <UsersTable /> : <PlansTable />}
      </div>
    );
  }
}

export default ManagePage;
