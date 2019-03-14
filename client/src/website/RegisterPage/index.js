import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";

import axios from "axios";
import ReactGA from "react-ga";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { setUser, setaccounts } from "../../redux/actions/";

import { validateEmail } from "../../componentFunctions";

import Page from "../../components/containers/Page";
import GIContainer from "../../components/containers/GIContainer";
import Notification from "../../components/notifications/Notification/";

import GIText from "../../components/views/GIText";
import GIButton from "../../components/views/GIButton";
import GIInput from "../../components/views/GIInput";

let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

class RegisterPage extends Component {
  state = {
    fullName: "",
    email: "",
    website: "",
    timezone: timezone ? timezone : "America/Vancouver",
    password: "",
    passwordConfirm: "",
    notification: {
      on: false,
      title: "Something went wrong!",
      message: "",
      type: "danger"
    }
  };

  componentDidMount() {
    if (this.props.user) this.props.history.push("/home");
  }
  handleChange = (index, value) => {
    this.setState({ [index]: value });
  };

  activateDemoUserLogin = (user, accounts) => {
    ReactGA.event({
      category: "User",
      action: "Register"
    });
    this.props.setUser(user);
    this.props.setaccounts(accounts);
    this.props.history.push("/subscribe");
  };
  register = event => {
    event.preventDefault();

    const {
      fullName,
      email,
      website,
      timezone,
      password,
      passwordConfirm
    } = this.state;

    if (!validateEmail(email)) {
      alert("Not a real email address!");
      return;
    }

    if (fullName && email && website && timezone && password) {
      if (password !== passwordConfirm) {
        alert("Passwords do not match.");
        return;
      }
      axios
        .post("/api/register", {
          fullName,
          email: email.toLowerCase(),
          website,
          timezone,
          password
        })
        .then(res => {
          const { success, user, message } = res.data;

          if (success && user) this.activateDemoUserLogin(user, []);
          else {
            this.notify({
              message,
              type: "danger",
              title: "Error"
            });
          }
        });
    } else {
      if (!fullName || !email || !website || !password) {
        alert("Please make sure each text field is filled in.");
      } else if (!timezone) {
        alert(
          "Error with timezone. Reload page and try again. If error persists, please contact Ghostit."
        );
      }
    }
  };

  render() {
    const {
      fullName,
      email,
      website,
      password,
      notification,
      passwordConfirm
    } = this.state;
    const { login } = this.state;

    return (
      <Page
        className="login-background simple-container website-page"
        title="Sign Up"
        description="What are you waiting for!? Sign up today!"
        keywords="content, ghostit, marketing"
      >
        <GIText className="pb16 tac" text="Sign up for Ghostit!" type="h1" />

        <div className="basic-box common-shadow pa32 br16 margin-hc">
          <form className="common-container">
            <input
              className="regular-input mb8"
              value={fullName}
              onChange={event =>
                this.handleChange("fullName", event.target.value)
              }
              type="text"
              name="fullName"
              placeholder="Company Name"
              required
            />

            <input
              className="regular-input mb8"
              value={email}
              onChange={event => this.handleChange("email", event.target.value)}
              type="text"
              name="email"
              placeholder="Email"
              required
            />

            <input
              className="regular-input mb8"
              value={website}
              onChange={event =>
                this.handleChange("website", event.target.value)
              }
              type="text"
              name="website"
              placeholder="Website"
              required
            />

            <input
              className="regular-input mb8"
              value={password}
              onChange={event =>
                this.handleChange("password", event.target.value)
              }
              name="password"
              placeholder="Password"
              type="password"
              required
            />

            <input
              className="regular-input mb8"
              value={passwordConfirm}
              onChange={event =>
                this.handleChange("passwordConfirm", event.target.value)
              }
              name="passwordConfirm"
              placeholder="Confirm Password"
              type="password"
              required
            />

            <button
              className="regular-button mb8"
              onClick={this.register}
              type="submit"
            >
              Register
            </button>
            <h4 className="unimportant-text button tac">
              Have an account?
              <Link to="/sign-in">
                <button className="very-important-text ml4">Sign In</button>
              </Link>
            </h4>
          </form>
        </div>

        <GIContainer className="full-center mt16">
          <Link to="/forgot-password">
            <GIButton
              className="underline-button white"
              text="Forgot password?"
            />
          </Link>
        </GIContainer>
        {notification.on && (
          <Notification
            notification={notification}
            callback={notification => this.setState({ notification })}
          />
        )}
      </Page>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setUser,
      setaccounts
    },
    dispatch
  );
}
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(RegisterPage)
);
