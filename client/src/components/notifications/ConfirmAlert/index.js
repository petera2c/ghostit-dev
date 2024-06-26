import React, { Component } from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setKeyListenerFunction } from "../../../redux/actions/";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons/faQuestionCircle";

import GIContainer from "../../containers/GIContainer";

import "./style.css";

class ConfirmAlert extends Component {
  state = {
    checked: false,
    confirmText: ""
  };
  componentDidMount = () => {
    this._ismounted = true;

    const { getKeyListenerFunction, setKeyListenerFunction } = this.props;

    setKeyListenerFunction([
      event => {
        if (!this._ismounted) return;
        if (event.keyCode === 27) {
          this.props.close(); // escape button pushed
        }
      },
      getKeyListenerFunction[0]
    ]);
  };
  componentWillUnmount = () => {
    this._ismounted = false;
    const { getKeyListenerFunction, setKeyListenerFunction } = this.props;
    setKeyListenerFunction([
      getKeyListenerFunction[1],
      getKeyListenerFunction[0]
    ]);
  };

  render() {
    const { checked, confirmText } = this.state;
    const {
      title,
      message,
      type,
      checkboxMessage,
      extraConfirmationMessage,
      extraConfirmationKey
    } = this.props; // variables
    const { close, callback } = this.props; // functions

    let firstButton = "Delete";
    let secondButton = "Cancel";
    let firstButtonStyle = "confirm-button";
    let secondButtonStyle = "cancel-button";
    if (type) {
      if (type === "modify" || type === "link-account") {
        firstButton = "Modify";
        firstButtonStyle = "cancel-button";
        secondButtonStyle = "confirm-button";
      } else if (type === "change-post") {
        firstButton = "Discard";
      } // else "delete-campaign" or "delete-post" or "delete-calendar"
    }

    if (this.props.firstButton) firstButton = this.props.firstButton;
    if (this.props.secondButton) secondButton = this.props.secondButton;

    return (
      <div className="confirm-alert-background" onClick={close}>
        <div className="confirm-alert" onClick={e => e.stopPropagation()}>
          <div className="confirm-title">{title}</div>
          <div className="confirm-message">{message}</div>
          {this.props.helpTooltip && (
            <div className="help-tooltip" title={this.props.helpTooltip}>
              <FontAwesomeIcon icon={faQuestionCircle} />
            </div>
          )}
          {extraConfirmationMessage && (
            <div className="extra-confirm-container">
              <div className="extra-confirm-message mt8">
                {extraConfirmationMessage}
              </div>
              <input
                type="text"
                className="regular-input x-fill"
                value={confirmText}
                onChange={event =>
                  this.setState({ confirmText: event.target.value })
                }
              />
            </div>
          )}
          <div className="options-container">
            <button
              onClick={() => {
                if (
                  !extraConfirmationKey ||
                  (extraConfirmationKey && extraConfirmationKey === confirmText)
                )
                  callback(true, checked);
                else
                  alert(
                    `You must type ${extraConfirmationKey} in the text box to confirm.`
                  );
              }}
              className={firstButtonStyle}
            >
              {firstButton}
            </button>
            <button
              onClick={() => callback(false, checked)}
              className={secondButtonStyle}
            >
              {secondButton}
            </button>
          </div>
          {checkboxMessage && (
            <GIContainer
              className="flex full-center x-fill clickable"
              onClick={() => {
                this.setState({ checked: !checked });
              }}
            >
              <GIContainer className="round-icon small full-center">
                <input type="checkbox" checked={checked} onChange={() => {}} />
              </GIContainer>
              {checkboxMessage}
            </GIContainer>
          )}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
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
)(ConfirmAlert);
