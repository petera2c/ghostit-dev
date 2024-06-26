import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/pro-light-svg-icons/faAngleDown";
import { faCheck } from "@fortawesome/pro-solid-svg-icons/faCheck";

import GIContainer from "../../containers/GIContainer";
import GIText from "../GIText";

import { isActiveItem } from "./util";

import "./style.css";

class Dropdown extends Component {
  state = {
    showDropdown: false,
    localStateActiveIndex: undefined,
    localStateActiveItem: undefined
  };

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }
  setWrapperRef = node => {
    this.wrapperRef = node;
  };

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ showDropdown: false });
    }
  };
  render() {
    const {
      localStateActiveIndex,
      localStateActiveItem,
      showDropdown
    } = this.state;
    const {
      activeItem,
      dropdownActiveDisplayClassName,
      className,
      dontShowFaAngleDown,
      dropdownClassName,
      dropdownItems,
      noTopBorder,
      search,
      size,
      testMode,
      title
    } = this.props; // Variables
    const { handleParentChange } = this.props; // Functions

    return (
      <GIContainer
        className={`button ${className}  ${
          showDropdown ? dropdownActiveDisplayClassName : ""
        }`}
        onClick={() => {
          this.setState({ showDropdown: !showDropdown });

          window.setTimeout(() => {
            if (
              document.getElementById(
                localStateActiveIndex + localStateActiveItem
              )
            )
              document
                .getElementById(localStateActiveIndex + localStateActiveItem)
                .scrollIntoView();
          }, 10);
        }}
        forwardedRef={this.setWrapperRef}
        testMode={testMode}
      >
        <GIContainer className="dropdown-title-container align-center">
          {title}
          {!dontShowFaAngleDown && (
            <FontAwesomeIcon
              className="five-blue mr16"
              icon={faAngleDown}
              size={size}
            />
          )}
        </GIContainer>
        {showDropdown && (
          <GIContainer className={`dropdown ${dropdownClassName}`}>
            {dropdownItems.map((item, index) => (
              <GIText
                className={`flex align-center px16 py8 ${
                  noTopBorder && index === 0 ? "" : "border-top"
                } ${isActiveItem(activeItem, index)}`}
                id={index + item}
                key={index}
                onClick={() => {
                  handleParentChange({ item, index });
                  this.setState({
                    localStateActiveItem: item,
                    localStateActiveIndex: index
                  });
                }}
                type="h4"
              >
                {item}
                {isActiveItem(activeItem, index) && (
                  <GIContainer className="flex-fill justify-end">
                    <FontAwesomeIcon
                      className="round-icon-medium round bg-five-blue white pa4"
                      icon={faCheck}
                    />
                  </GIContainer>
                )}
              </GIText>
            ))}
          </GIContainer>
        )}
      </GIContainer>
    );
  }
}

export default Dropdown;
