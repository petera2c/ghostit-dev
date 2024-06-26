import React, { Component } from "react";
import axios from "axios";
import moment from "moment-timezone";

import SearchColumn from "../../components/SearchColumn/";
import ObjectEditTable from "../../components/ObjectEditTable/";
import NavigationBar from "../../components/navigations/NavigationBar/";
import { nonEditableUserFields, cantShowUserFields } from "../../constants";

class UsersTable extends Component {
  state = {
    demoUsers: [],
    clientUsers: [],
    managerUsers: [],
    testerUsers: [],
    adminUsers: [],
    activeUsers: [],
    untouchedUsers: [],
    clickedUser: undefined,
    editting: false,
    plans: undefined,
    userCategories: {
      admin: false,
      tester: false,
      manager: false,
      client: true,
      demo: false,
    },
  };

  componentDidMount() {
    this._ismounted = true;

    this.getUsers();
    this.getPlans();
  }
  componentWillUnmount() {
    this._ismounted = false;
  }
  downloadUserData = (users) => {
    const test = [];
    for (let index in users) {
      test.push(users[index].fullName + ",");
      test.push(users[index].email + "\n");
    }
    var a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(new Blob(test, { type: "text/csv" }));
    a.download = "user_data.csv";

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
  };
  getUsers = () => {
    const { userCategories } = this.state;
    axios.get("/api/users").then((res) => {
      let { loggedIn } = res.data;
      if (loggedIn === false) this.props.history.push("/sign-in");

      if (!res) {
        // If res sends back false the user is not an admin and is likely a hacker
        window.location.replace("/calendar");
      } else {
        let users = res.data;

        let demoUsers = [];
        let clientUsers = [];
        let managerUsers = [];
        let testerUsers = [];
        let adminUsers = [];

        for (let index in users) {
          if (users[index].role === "demo") {
            demoUsers.push(users[index]);
          } else if (users[index].role === "client") {
            clientUsers.push(users[index]);
          } else if (users[index].role === "manager") {
            managerUsers.push(users[index]);
          } else if (users[index].role === "tester") {
            testerUsers.push(users[index]);
          } else if (users[index].role === "admin") {
            adminUsers.push(users[index]);
          }
        }
        let activeUsers;
        demoUsers.sort(compare);
        clientUsers.sort(compare);
        managerUsers.sort(compare);
        testerUsers.sort(compare);
        adminUsers.sort(compare);

        if (userCategories["demo"]) {
          activeUsers = demoUsers;
        } else if (userCategories["client"]) {
          activeUsers = clientUsers;
        } else if (userCategories["manager"]) {
          activeUsers = managerUsers;
        } else if (userCategories["tester"]) {
          activeUsers = testerUsers;
        } else if (userCategories["admin"]) {
          activeUsers = adminUsers;
        }
        if (this._ismounted) {
          this.setState({
            demoUsers,
            clientUsers,
            managerUsers,
            testerUsers,
            adminUsers,
            activeUsers,
            untouchedUsers: activeUsers,
          });
        }
      }
    });
  };
  getPlans = () => {
    axios.get("/api/plans").then((res) => {
      let { loggedIn } = res.data;
      if (loggedIn === false) this.props.history.push("/sign-in");

      this.setState({ plans: res.data });
    });
  };
  updateUsers = (event) => {
    // Remove active class from last tab
    let { userCategories } = this.state;
    for (let index in userCategories) {
      userCategories[index] = false;
    }
    userCategories[event.target.id] = true;

    let users;
    if (userCategories["admin"]) {
      users = this.state.adminUsers;
    } else if (userCategories["tester"]) {
      users = this.state.testerUsers;
    } else if (userCategories["manager"]) {
      users = this.state.managerUsers;
    } else if (userCategories["client"]) {
      users = this.state.clientUsers;
    } else if (userCategories["demo"]) {
      users = this.state.demoUsers;
    }

    this.setState({ activeUsers: users, userCategories: userCategories });
  };
  handleClickedUser = (user) => {
    // ID of clicked event is the index of in activeUsers of the clicked user
    this.setState({ clickedUser: user, editting: false });
  };
  saveUser = (user) => {
    axios.post("/api/updateUser", user).then((res) => {
      let { loggedIn } = res.data;
      if (loggedIn === false) this.props.history.push("/sign-in");

      if (res.data) {
        alert("success");
        this.getUsers();
      } else {
        alert(
          "There has been an error! :( Contact your local dev team immediately! If you do not have a local dev team, you can contact me at peterm@ghostit.co!"
        );
      }
    });
  };
  editObject = () => {
    this.setState({ editting: !this.state.editting });
  };
  render() {
    const {
      clickedUser,
      managerUsers,
      plans,
      editting,
      activeUsers,
      userCategories,
    } = this.state;
    let objectArry = [];

    for (let index in clickedUser) {
      let canEdit = true;
      let dropdown = false;
      let dropdownList = [];
      if (nonEditableUserFields.indexOf(index) !== -1) {
        canEdit = false;
      } else if (
        index === "role" ||
        index === "timezone" ||
        index === "writer" ||
        index === "plan"
      ) {
        dropdown = true;

        if (index === "role") {
          dropdownList = ["demo", "client", "manager", "tester", "admin"];
        } else if (index === "timezone") {
          dropdownList = moment.tz.names();
        } else if (index === "writer") {
          for (let j in managerUsers) {
            dropdownList.push({
              id: managerUsers[j]._id,
              value: managerUsers[j].fullName,
            });
          }
        } else if (index === "plan") {
          for (let j in plans) {
            dropdownList.push({
              id: plans[j]._id,
              value: plans[j].name,
            });
          }
        }
      }

      if (cantShowUserFields.indexOf(index) === -1) {
        objectArry.push({
          canEdit,
          value:
            this.state.clickedUser[index] === Object(clickedUser[index])
              ? clickedUser[index].name
                ? clickedUser[index].name
                : clickedUser[index].id
              : clickedUser[index],
          dropdown,
          dropdownList,
          index,
        });
      }
    }
    return (
      <div>
        {activeUsers.length > 0 && (
          <button
            className="regular-button my16 ml8"
            onClick={() => this.downloadUserData(activeUsers)}
          >
            Download User Data
          </button>
        )}
        <NavigationBar
          updateParentState={this.updateUsers}
          categories={userCategories}
        />
        <div className="flex">
          <div className="search-container">
            <SearchColumn
              objectList={activeUsers}
              handleClickedObject={this.handleClickedUser}
              indexSearch="fullName"
              indexSearch2="email"
            />
          </div>
          <div className="flex-fill">
            <ObjectEditTable
              objectArray={objectArry}
              updateList={this.getUsers}
              saveObject={this.saveUser}
              clickedObject={clickedUser}
              editting={editting}
              editObject={this.editObject}
            />
          </div>
        </div>
      </div>
    );
  }
}

function compare(a, b) {
  if (a.fullName < b.fullName) return -1;
  if (a.fullName > b.fullName) return 1;
  return 0;
}
export default UsersTable;
