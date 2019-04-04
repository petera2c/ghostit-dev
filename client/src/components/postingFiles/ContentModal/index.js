import React, { Component } from "react";
import moment from "moment-timezone";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faTimes from "@fortawesome/fontawesome-free-solid/faTimes";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setKeyListenerFunction } from "../../../redux/actions/";

import ContentModalHeader from "./ContentModalHeader";
import Loader from "../../notifications/Loader/";
import Post from "../Post";
import CustomTask from "../CustomTask";

import "../style.css";

class ContentModal extends Component {
  state = {
    saving: false,
    activeTab: { name: "facebook" },
    categories: [
      { name: "facebook" },
      { name: "twitter", maxCharacters: 280 },
      { name: "linkedin", maxCharacters: 700 },
      { name: "custom" }
    ],
    listOfPostChanges: {}
  };
  componentDidMount() {
    this._ismounted = true;

    const {
      close,
      setKeyListenerFunction,
      getKeyListenerFunction
    } = this.props; // Functions

    setKeyListenerFunction([
      event => {
        if (!this._ismounted) return;
        if (event.keyCode === 27) {
          close(); // escape button pushed
        }
      },
      getKeyListenerFunction[0]
    ]);
  }
  componentWillUnmount() {
    this._ismounted = false;
  }

  switchTabState = activeTab => {
    if (activeTab.name === this.state.activeTab.name) return;
    if (this._ismounted)
      this.setState(prevState => {
        return {
          activeTab,
          listOfPostChanges: {
            ...prevState.listOfPostChanges,
            accountID: "",
            accountType: "",
            socialType: activeTab.name
          }
        };
      });
  };

  setSaving = () => {
    if (this._ismounted) this.setState({ saving: true });
  };

  backupPostChanges = (value, index) => {
    // function so that switching between different
    // socialTypes doesn't reset all the changes (date, content, name, instructions, etc.)
    if (index === "accountType" || index === "accountID") {
      // don't save the account chosen
      return;
    }
    if (this._ismounted)
      this.setState(prevState => {
        const newChanges = { ...prevState.listOfPostChanges };
        if (newChanges.accountID === "") {
          delete newChanges.accountID;
          delete newChanges.accountType;
        }
        return {
          listOfPostChanges: {
            ...newChanges,
            [index]: value
          }
        };
      });
  };

  render() {
    const { activeTab, listOfPostChanges } = this.state;
    const { accounts, calendarID, clickedCalendarDate } = this.props; // Variables
    const { close, savePostCallback, notify } = this.props; // Functions

    if (this.state.saving) {
      return <Loader />;
    }

    let modalBody;

    if (activeTab.name === "custom") {
      modalBody = (
        <div className="modal-body">
          <CustomTask
            post={{
              postingDate:
                clickedCalendarDate < new moment()
                  ? new moment().add(5, "minutes")
                  : clickedCalendarDate
            }}
            postFinishedSavingCallback={(post, success, message) => {
              if (this._ismounted) this.setState({ saving: false });
              if (success) savePostCallback(post);
              else notify("danger", "Save Failed", message, 7500);
            }}
            calendarID={calendarID}
            setSaving={this.setSaving}
            socialType={activeTab.name}
            canEditPost={true}
            listOfChanges={
              Object.keys(listOfPostChanges).length > 0
                ? listOfPostChanges
                : undefined
            }
            backupChanges={this.backupPostChanges}
          />
        </div>
      );
    } else {
      modalBody = (
        <Post
          post={{
            postingDate:
              clickedCalendarDate < new moment()
                ? new moment().add(5, "minutes")
                : clickedCalendarDate
          }}
          postFinishedSavingCallback={(post, success, message) => {
            if (this._ismounted) this.setState({ saving: false });
            if (success) {
              savePostCallback(post);
            } else {
              notify("danger", "Save Failed", message, 7500);
            }
          }}
          calendarID={calendarID}
          setSaving={this.setSaving}
          socialType={activeTab.name}
          canEditPost={true}
          maxCharacters={activeTab.maxCharacters}
          listOfChanges={
            Object.keys(listOfPostChanges).length > 0
              ? listOfPostChanges
              : undefined
          }
          backupChanges={this.backupPostChanges}
        />
      );
    }

    return (
      <div className="modal" onClick={() => close()}>
        <div className="post-modal" onClick={e => e.stopPropagation()}>
          <FontAwesomeIcon
            icon={faTimes}
            size="2x"
            className="close"
            onClick={() => close()}
          />

          <ContentModalHeader
            categories={this.state.categories}
            switchTabs={this.switchTabState}
            activeTab={activeTab}
            accounts={accounts}
          />
          <div className="post-modal-body">{modalBody}</div>
        </div>
      </div>
    );
  }
}
function mapStateToProps(state) {
  return {
    accounts: state.accounts,
    getKeyListenerFunction: state.getKeyListenerFunction
  };
}
function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setKeyListenerFunction
    },
    dispatch
  );
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContentModal);
