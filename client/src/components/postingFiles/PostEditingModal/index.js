import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setKeyListenerFunction } from "../../../redux/actions/";

import Post from "../Post";
import CustomTask from "../CustomTask";
import ConfirmAlert from "../../notifications/ConfirmAlert";
import Loader from "../../notifications/Loader/";

import Consumer from "../../../context";

import "../style.css";

class PostEdittingModal extends Component {
  state = {
    saving: false,
    confirmDelete: false
  };
  componentDidMount() {
    this._ismounted = true;

    this.props.setKeyListenerFunction([
      event => {
        if (!this._ismounted) return;
        if (event.keyCode === 27) {
          this.props.close(); // escape button pushed
        }
      },
      this.props.getKeyListenerFunction[0]
    ]);
  }
  componentWillUnmount() {
    this._ismounted = false;
  }

  deletePostPopUp = () => {
    this.setState({ confirmDelete: true });
  };
  deletePost = (deletePost, context) => {
    this.setState({ confirmDelete: false, saving: true });
    if (!this.props.clickedEvent._id) {
      alert("Error cannot find post. Please contact our dev team immediately");
      return;
    }
    if (deletePost) {
      axios
        .delete("/api/post/delete/" + this.props.clickedEvent._id)
        .then(res => {
          let { loggedIn, message, success } = res.data;
          if (loggedIn === false) this.props.history.push("/sign-in");

          if (success) {
            this.props.updateCalendarPosts();
            context.notify({ type: "success", title: "Post Deleted", message });
            this.props.triggerSocketPeers("calendar_post_deleted", {
              postID: this.props.clickedEvent._id,
              socialType: this.props.clickedEvent.socialType
            });
            this.props.close();
          } else {
            context.notify({
              type: "danger",
              title: "Post Delete Failed",
              message
            });
          }
        });
    } else {
      this.setState({
        confirmDelete: false,
        saving: false
      });
    }
  };
  setSaving = () => {
    this.setState({ saving: true });
  };
  render() {
    if (this.state.saving) {
      return <Loader />;
    }
    const {
      close,
      savePostCallback,
      clickedEvent,
      accounts,
      timezone
    } = this.props;

    let modalFooter;
    let canEditPost = clickedEvent.status !== "posted";
    if (canEditPost) {
      modalFooter = (
        <div className="modal-footer">
          <div
            className="campaign-footer-option right"
            title="Delete campaign."
          >
            <FontAwesomeIcon
              onClick={this.deletePostPopUp}
              className="delete"
              icon={faTrash}
              size="2x"
            />
          </div>
        </div>
      );
    }
    let maxCharacters;
    if (clickedEvent.socialType === "twitter") {
      maxCharacters = 280;
    } else if (clickedEvent.socialType === "linkedin") {
      maxCharacters = 700;
    }

    return (
      <Consumer>
        {context => (
          <div className="modal" onClick={this.props.close}>
            <div className="large-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <FontAwesomeIcon
                  icon={faTimes}
                  className="close"
                  size="2x"
                  onClick={() => close()}
                />
              </div>
              <div className="modal-body">
                {clickedEvent.socialType === "custom" && (
                  <CustomTask
                    setSaving={this.setSaving}
                    post={clickedEvent}
                    canEditPost={canEditPost}
                    postFinishedSavingCallback={post => {
                      savePostCallback(post);
                      close();
                    }}
                    calendarID={this.props.calendarID}
                    notify={context.notify}
                  />
                )}
                {clickedEvent.socialType !== "custom" && (
                  <Post
                    setSaving={this.setSaving}
                    post={clickedEvent}
                    canEditPost={canEditPost}
                    postFinishedSavingCallback={post => {
                      savePostCallback(post);
                      close();
                    }}
                    accounts={accounts}
                    timezone={timezone}
                    maxCharacters={maxCharacters}
                    calendarID={this.props.calendarID}
                    notify={context.notify}
                  />
                )}
              </div>
              {this.state.confirmDelete && (
                <ConfirmAlert
                  close={() => this.setState({ confirmDelete: false })}
                  title="Delete Post"
                  message="Are you sure you want to delete this post?"
                  callback={deletePost => this.deletePost(deletePost, context)}
                />
              )}

              {modalFooter}
            </div>
          </div>
        )}
      </Consumer>
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
)(PostEdittingModal);
