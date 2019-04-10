import React, { Component } from "react";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faTimes from "@fortawesome/fontawesome-free-solid/faTimes";

import GIContainer from "../GIContainer";

import "./style.css";

class Modal extends Component {
  render() {
    const { body, className, footer, header } = this.props; // Variables
    const { close } = this.props; // Functions
    return (
      <GIContainer className="modal" onClick={close}>
        <GIContainer
          className={`modal-content ${className}`}
          onClick={e => e.stopPropagation()}
        >
          <FontAwesomeIcon
            icon={faTimes}
            size="2x"
            className="close"
            onClick={close}
          />
          {header && (
            <GIContainer className="modal-header">{header}</GIContainer>
          )}
          <GIContainer className="modal-body">{body}</GIContainer>
          {footer && (
            <GIContainer className="modal-footer">{footer}</GIContainer>
          )}
        </GIContainer>
      </GIContainer>
    );
  }
}

export default Modal;