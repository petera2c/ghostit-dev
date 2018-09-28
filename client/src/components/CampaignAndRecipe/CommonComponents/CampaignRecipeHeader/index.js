import React, { Component } from "react";
import moment from "moment-timezone";
import Textarea from "react-textarea-autosize";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faTimes from "@fortawesome/fontawesome-free-solid/faTimes";
import faArrowLeft from "@fortawesome/fontawesome-free-solid/faArrowLeft";
import faAngleUp from "@fortawesome/fontawesome-free-solid/faAngleUp";
import faAngleDown from "@fortawesome/fontawesome-free-solid/faAngleDown";

import DateTimePicker from "../../../DateTimePicker";

import "./styles/";

class CampaignRecipeHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      colors: {
        color1: {
          color: "var(--campaign-color1)"
        },
        color2: {
          color: "var(--campaign-color2)"
        },
        color3: {
          color: "var(--campaign-color3)"
        },
        color4: {
          color: "var(--campaign-color4)"
        }
      },
      showMore: true
    };
  }

  render() {
    const { colors, showMore } = this.state;
    const { campaign, datePickerMessage } = this.props; // variables
    const { handleChange, tryChangingDates } = this.props; // functions

    let colorDivs = [];
    for (let index in colors) {
      let isActive;
      if (colors[index].color == campaign.color) isActive = "active";
      colorDivs.push(
        <div
          className={"color-border mx4 pa4 round button " + isActive}
          onClick={() => {
            handleChange(colors[index].color, "color");
          }}
          key={index}
          style={{ borderColor: colors[index].color }}
        >
          <div
            className="color round"
            style={{
              backgroundColor: colors[index].color
            }}
          />
        </div>
      );
    }

    let display;
    if (!showMore) display = "none";

    return (
      <div
        className="campaign-information-container flex column pb32"
        style={{ borderColor: campaign.color }}
      >
        <div
          className="close-container"
          title={
            "Campaigns are automatically saved when window is closed.\nTemplates are not."
          }
        >
          <FontAwesomeIcon
            className="close-special"
            icon={faTimes}
            size="2x"
            onClick={() => this.props.close()}
          />
        </div>
        <div style={{ display }}>
          <input
            onChange={event => handleChange(event.target.value, "name")}
            value={campaign.name}
            className="campaign-title pa8"
            placeholder="Click here to give a title!"
            readOnly={false}
          />
          <Textarea
            className="campaign-description"
            placeholder="Click here to give a description!"
            onChange={event => handleChange(event.target.value, "description")}
            value={campaign.description}
            readOnly={false}
          />
          <div className="grid-container px16">
            <div className="flex vc hc">
              <div className="label">Start Date: </div>
              <DateTimePicker
                date={new moment(campaign.startDate)}
                dateFormat="MMMM Do YYYY hh:mm A"
                handleChange={(date, setDisplayAndMessage, anchorDates) => {
                  tryChangingDates(
                    date,
                    "startDate",
                    setDisplayAndMessage,
                    anchorDates
                  );
                }}
                dateLowerBound={new moment()}
                anchorDatesOption={true}
              />
            </div>

            <div className="flex vc hc">
              <div className="label">End Date: </div>
              <DateTimePicker
                date={new moment(campaign.endDate)}
                dateFormat="MMMM Do YYYY hh:mm A"
                handleChange={(date, setDisplayAndMessage) => {
                  tryChangingDates(date, "endDate", setDisplayAndMessage);
                }}
                dateLowerBound={new moment()}
              />
            </div>
            <div className="flex hc vc">{colorDivs}</div>
          </div>
        </div>

        <div
          className="show-more center-horizontally bottom"
          onClick={() => this.setState({ showMore: !this.state.showMore })}
        >
          <FontAwesomeIcon icon={showMore ? faAngleUp : faAngleDown} />
        </div>
      </div>
    );
  }
}

export default CampaignRecipeHeader;
