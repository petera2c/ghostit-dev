import React, { Component } from "react";

import "./style.css";

class Container extends Component {
  render() {
    const { children, onClick, forwardedRef, style, testMode } = this.props; // Variables
    let { className } = this.props;

    if (testMode) className += " test-mode";

    return (
      <div
        className={`main-container light-scrollbar ${className}`}
        style={style}
        onClick={onClick}
        ref={forwardedRef}
      >
        {children}
      </div>
    );
  }
}

export default Container;
