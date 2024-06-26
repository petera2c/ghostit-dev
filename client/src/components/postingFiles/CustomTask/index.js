import moment from "moment-timezone";
import React, { Component } from "react";
import Textarea from "react-textarea-autosize";

import ConfirmAlert from "../../notifications/ConfirmAlert";
import DateTimePicker from "../../DateTimePicker";
import FileUpload from "../../views/FileUpload/";

import { trySavePost } from "../../../componentFunctions";

class CustomTask extends Component {
  constructor(props) {
    super(props);

    this.state = this.createState(props);
  }
  createState = props => {
    let stateVariable = {
      _id: undefined,
      images: [],
      socialType: props.socialType,
      instructions: "",
      name: "Custom Task",
      sendEmailReminder: true,
      calendarID: props.calendarID,
      color: "var(--seven-purple-color)"
    };
    if (props.post) {
      stateVariable._id = props.post._id ? props.post._id : undefined;
      stateVariable.images = props.post.files ? props.post.files : [];
      stateVariable.socialType = props.post.socialType
        ? props.post.socialType
        : props.socialType;
      stateVariable.instructions = props.post.instructions
        ? props.post.instructions
        : "";
      stateVariable.campaignID = props.post.campaignID
        ? props.post.campaignID
        : undefined;
      stateVariable.name = props.post.name ? props.post.name : "Custom Task";
      stateVariable.sendEmailReminder = props.post.emailReminder ? true : false;
    }

    stateVariable.filesToDelete = [];
    stateVariable.somethingChanged = false;

    stateVariable.date =
      props.post && props.post.postingDate
        ? new moment(props.post.postingDate)
        : props.campaignStartDate
        ? new moment(props.campaignStartDate)
        : new moment(props.clickedCalendarDate);

    return stateVariable;
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.listOfChanges) {
      // this is run when the campaignModal's state changes which results in a re-render of this
      // Post component. this block will make sure all the previous unsaved changes to the Post component are reapplied
      if (Object.keys(nextProps.listOfChanges).length > 0) {
        this.setState({ ...nextProps.listOfChanges, somethingChanged: true });
      } else {
        this.setState({ somethingChanged: false });
      }
    } else {
      // this block is entered when a new post is created within a campaign,
      // or when changing to a different post within a campaign
      // or at the beginning of a new single post creation,
      // or when a post/campaign that already exists is opened from the calendar
      this.setState(this.createState(nextProps));
    }
  }
  componentDidMount() {
    this._ismounted = true;

    let { campaignStartDate, campaignEndDate } = this.props;
    let { date } = this.state;

    if (campaignStartDate && campaignEndDate) {
      if (
        date < new moment(campaignStartDate) ||
        date > new moment(campaignEndDate)
      ) {
        this.setState({ date: new moment(campaignStartDate) });
      }
    }
  }
  componentWillUnmount() {
    this._ismounted = false;
  }

  handleChange = (value, index) => {
    if (this._ismounted)
      this.setState({
        [index]: value,
        somethingChanged: true
      });
    if (this.props.backupChanges) {
      this.props.backupChanges(value, index);
    }
  };

  pushToImageDeleteArray = image => {
    let temp = this.state.filesToDelete;
    temp.push(image);
    if (this._ismounted) this.setState({ filesToDelete: temp });
  };

  modifyCampaignDate = response => {
    if (!response) {
      this.setState({ promptModifyCampaignDates: false });
      return;
    }
    const { date } = this.state;
    this.setState({ promptModifyCampaignDates: false });
    this.setState(trySavePost(this.state, this.props, true));
    this.props.modifyCampaignDates(date);
  };

  render() {
    const {
      _id,
      instructions,
      images,
      filesToDelete,
      somethingChanged,
      promptModifyCampaignDates,
      name,
      sendEmailReminder
    } = this.state;
    let { date } = this.state;

    const { canEditPost } = this.props;

    return (
      <div className="container-box bg-white flex column x-fill y-fill ov-auto">
        <div className="post-instruction-container">
          <div
            className="posting-container light-scrollbar pa16"
            style={{ width: "100%" }}
          >
            <input
              onChange={event => this.handleChange(event.target.value, "name")}
              value={name}
              className="title-input mb8 pa8"
              placeholder="Title"
              readOnly={!canEditPost}
            />
            <Textarea
              style={{ minHeight: "30vh" }}
              className="instruction-textarea pa8"
              placeholder="Describe this task!"
              onChange={event =>
                this.handleChange(event.target.value, "instructions")
              }
              value={instructions}
              readOnly={!canEditPost}
            />
            <div className="wrapping-container-no-center mt8">
              <FileUpload
                canEdit={canEditPost}
                className="pa16"
                currentFiles={images}
                handleParentChange={parentStateChangeObject =>
                  this.setState(parentStateChangeObject)
                }
                fileLimit={4}
                filesToDelete={filesToDelete}
                id="hsh"
                imageClassName="flex image tiny"
                imageOnly={true}
              />

              <div className="checkbox-and-writing-container my8 ml8">
                <div
                  className="checkbox-box flex vc hc mr8"
                  onClick={() =>
                    this.handleChange(!sendEmailReminder, "sendEmailReminder")
                  }
                >
                  <div
                    className="checkbox-check"
                    style={{ display: sendEmailReminder ? undefined : "none" }}
                  />
                </div>
                Send an email reminder 30 minutes before scheduled time
              </div>
            </div>
          </div>
        </div>
        <div className="common-container-center border-top">
          <DateTimePicker
            date={date}
            dateFormat="MMMM Do YYYY hh:mm A"
            handleChange={date => this.handleChange(date, "date")}
            style={{
              bottom: "100%",
              top: "auto"
            }}
            dateLowerBound={new moment()}
            dateUpperBound={undefined}
            className="my8"
          />
          {(somethingChanged || (!this.props.recipeEditing && !_id)) && (
            <button
              className="square-button py8 x-fill"
              onClick={() => this.setState(trySavePost(this.state, this.props))}
            >
              Save Task!
            </button>
          )}
        </div>
        {promptModifyCampaignDates && (
          <ConfirmAlert
            close={() => this.setState({ promptModifyCampaignDates: false })}
            title="Modify Campaign Dates"
            message="Posting date is not within campaign start and end dates. Do you want to adjust campaign dates accordingly?"
            callback={this.modifyCampaignDate}
            type="modify"
          />
        )}
      </div>
    );
  }
}
export default CustomTask;
