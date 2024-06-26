import React, { Component } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faAngleDown} from "@fortawesome/pro-light-svg-icons/faAngleDown";
import {faAngleUp} from "@fortawesome/pro-light-svg-icons/faAngleUp";
import {faEllipsisV} from "@fortawesome/pro-light-svg-icons/faEllipsisV";

import GIContainer from "../../containers/GIContainer";
import GIText from "../GIText";
import Dropdown from "../Dropdown";

class CollapsibleMenu extends Component {
  state = {
    showMenu: true
  };
  render() {
    const { showMenu } = this.state;
    const {
      activeIndex,
      firstButton,
      list,
      listObjKey,
      listOnClick,
      showOptionFunction,
      testMode,
      title,
      titleIcon
    } = this.props; // Variables
    const { options } = this.props; // Functions

    return (
      <GIContainer className="column clickable" testMode={testMode}>
        <GIContainer
          className="x-fill align-center justify-between clickable bg-blue-grey px16 py8"
          onClick={() => {
            this.setState({ showMenu: !showMenu });
          }}
        >
          <GIContainer className="x-85 align-center mr16">
            <FontAwesomeIcon className="white mr8" icon={titleIcon} />
            <GIText
              className="flex-fill white ellipsis"
              style={{ userSelect: "none" }}
              text={title}
              type="h6"
            />
          </GIContainer>
          <FontAwesomeIcon
            className="white"
            icon={showMenu ? faAngleDown : faAngleUp}
            size="2x"
          />
        </GIContainer>
        {showMenu && (
          <GIContainer className="column x-fill">
            {firstButton}
            {list.map((obj, index) => (
              <GIContainer
                className={`${
                  activeIndex === index ? "bg-blue-fade-2 white" : ""
                } x-fill justify-between align-center pl16 py8`}
                key={index}
                onClick={listOnClick ? () => listOnClick(index) : () => {}}
              >
                {listObjKey ? list[index][listObjKey] : list[index]}
                {options && options(index) && (
                  <GIContainer onClick={e => e.stopPropagation()}>
                    <Dropdown
                      className="px16"
                      dontShowFaAngleDown={true}
                      dropdownActiveDisplayClassName=""
                      dropdownClassName="right common-border five-blue br8"
                      dropdownItems={options(index).map(obj => (
                        <GIText
                          className="fs-13"
                          onClick={() => obj.onClick(index)}
                          text={obj.name}
                          type="p"
                        />
                      ))}
                      handleParentChange={dropdownClickedItemObj => {}}
                      noTopBorder={true}
                      title={
                        <FontAwesomeIcon
                          className="silver"
                          icon={faEllipsisV}
                          size="2x"
                        />
                      }
                    />
                  </GIContainer>
                )}
              </GIContainer>
            ))}
          </GIContainer>
        )}
      </GIContainer>
    );
  }
}
export default CollapsibleMenu;
