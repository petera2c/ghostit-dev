import React, { Component } from "react";
import axios from "axios";

import moment from "moment-timezone";
import io from "socket.io-client";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setKeyListenerFunction } from "../../../../redux/actions/";

import {
  trySavePost,
  fillPosts,
  newPost,
  createAppropriateDate
} from "../../../../componentFunctions";

import Post from "../../Post";
import CustomTask from "../../CustomTask";
import ConfirmAlert from "../../../notifications/ConfirmAlert";

import PostTypePicker from "../CommonComponents/PostTypePicker";
import PostList from "../CommonComponents/PostList";
import CampaignRecipeHeader from "../CommonComponents/CampaignRecipeHeader";

import GIContainer from "../../../containers/GIContainer";
import GIText from "../../../views/GIText";

import Consumer, { ExtraContext } from "../../../../context";

import "./style.css";

class Campaign extends Component {
  constructor(props) {
    super(props);
    this.state = this.createStateVariable(this.props);
  }
  componentDidMount() {
    this._ismounted = true;

    const { context } = this;

    if (!this.props.recipeEditing) this.initSocket(context);

    window.addEventListener("beforeunload", () =>
      this.saveChangesOnClose(context)
    );

    this.props.setKeyListenerFunction([
      event => {
        if (!this._ismounted) return;
        if (event.keyCode === 27) {
          this.attemptToCloseModal(); // escape button pushed
        }
      },
      this.props.getKeyListenerFunction[0]
    ]);
  }

  componentWillUnmount() {
    const { context, socket } = this;
    window.removeEventListener(
      "beforeunload",
      this.saveChangesOnClose(context)
    );
    this.saveChangesOnClose(context);
    this._ismounted = false;
    if (socket) this.state.socket.emit("unmounting_socket_component");
  }
  saveChangesOnClose = context => {
    let { campaign, somethingChanged, socket, recipeEditing } = this.state;
    const { updateCampaigns, handleParentChange } = this.props; // Functions
    const { triggerSocketPeers } = this.props;

    handleParentChange({ clickedEvent: undefined });

    if (socket) socket.emit("unmounting_socket_component");

    if (!recipeEditing && somethingChanged && campaign && socket) {
      socket.emit("campaign_editted", campaign);
      socket.on("campaign_saved", emitObject => {
        socket.off("campaign_saved");
        if (!emitObject || !emitObject.campaign) {
          context.notify({
            type: "danger",
            title: "Save Failed",
            message: "Campaign save was unsuccessful."
          });
        } else if (
          !emitObject.campaign.posts ||
          emitObject.campaign.posts.length < 1
        ) {
          if (campaign._id)
            triggerSocketPeers("calendar_campaign_deleted", campaign._id);
        } else {
          const shareCampaignWithPeers = {
            ...emitObject.campaign,
            posts: this.state.posts
          };
          triggerSocketPeers("calendar_campaign_saved", shareCampaignWithPeers);
          context.notify({
            message: "",
            title: "Campaign Saved",
            type: "success"
          });
        }
        socket.emit("close", campaign);

        if (updateCampaigns) updateCampaigns();
      });
    }
  };
  createStateVariable = props => {
    let startDate =
      new moment() > new moment(props.clickedCalendarDate)
        ? new moment()
        : new moment(props.clickedCalendarDate);
    let campaign = props.campaign
      ? props.campaign
      : {
          startDate,
          endDate: new moment(startDate).add(7, "days"),
          name: "",
          description: "",
          userID: props.user.signedInAsUser
            ? props.user.signedInAsUser.id
              ? props.user.signedInAsUser.id
              : props.user._id
            : props.user._id,
          color: "var(--campaign-color3)",
          calendarID: props.calendarID,
          recipeID: undefined
        };

    if (props.campaign && !moment.isMoment(campaign.startDate)) {
      campaign.startDate = new moment(campaign.startDate);
      campaign.endDate = new moment(campaign.endDate);
    }

    if (props.campaign && props.recipeEditing) {
      campaign.recipeID = campaign._id;
    }

    let activePostIndex;
    let posts = [];

    if (campaign.chosenStartDate) {
      // Only defined if made from recipe
      // set hour and minute of startDate
      const hour = campaign.startDate.get("hour");
      const minute = campaign.startDate.get("minute");
      campaign.chosenStartDate.set({ hour, minute });
    }

    let somethingChanged = props.campaign ? false : true;

    if (campaign.posts) {
      if (campaign.posts.length > 0) {
        posts = fillPosts(campaign, props.isRecipe, props.recipeEditing);
        activePostIndex = 0;
      }
      if (props.isRecipe && !props.recipeEditing) {
        // campaign is based off a recipe and the posts haven't been scheduled yet
        // so campaign.posts shouldn't exist as its only for saved posts
        delete campaign.posts;
        somethingChanged = true;
        campaign.userID = props.user.signedInAsUser
          ? props.user.signedInAsUser.id
            ? props.user.signedInAsUser.id
            : props.user._id
          : props.user._id;
      }
    }
    if (campaign.chosenStartDate) {
      // Only defined if made from recipe
      campaign.endDate = createAppropriateDate(
        campaign.chosenStartDate,
        campaign.startDate,
        campaign.endDate
      );
      campaign.startDate = campaign.chosenStartDate;
    }

    return {
      activePostIndex,
      campaign,
      campaignDeletedPrompt: false, // when user is working on a campaign and another user deletes that campaign
      confirmDelete: false,
      deleteIndex: undefined,
      isFromRecipe: props.isRecipe,
      listOfPostChanges: {},
      nextChosenPostIndex: 0,
      pendingPostType: undefined, // when user tries to create a new post, but their current post has unsaved changes
      postDeletedPrompt: false, // ^^ but on delete
      postUpdatedPrompt: false, // when user's active post gets saved by another user, this prompt will let them know
      promptChangeActivePost: false, // when user tries to change posts, if their current post hasn't been saved yet, ask them to save or discard
      promptDeletePost: false,
      promptDiscardPostChanges: false, // when user tries to exit modal while the current post has unsaved changes
      posts,
      recipeEditing: props.recipeEditing,
      showDeletePostPrompt: true, // give user option "Don't ask me again" for post deletion
      somethingChanged,
      userList: [] // list of users connected to the same campaign socket (how many users are currently modifying this campaign)
    };
  };

  initSocket = context => {
    let { campaign, isFromRecipe, recipeEditing } = this.state;
    let socket;

    if (process.env.NODE_ENV === "development")
      socket = io("http://localhost:5000");
    else socket = io();

    let socketConnected = false;

    if (!this.props.campaign || (isFromRecipe && !recipeEditing)) {
      socket.emit("new_campaign", campaign);
      socketConnected = true;

      socket.on("new_campaign_saved", campaignID => {
        socket.off("new_campaign_saved");
        campaign._id = campaignID;

        socket.emit("campaign_connect", {
          campaignID,
          email: this.props.user.email,
          name: this.props.user.fullName
        });

        context.notify({
          type: "info",
          title: "Campaign Created",
          message: "New campaign created."
        });
        context.handleChange({ saving: false });

        this.setState({ campaign });
      });
    } else if (this.props.campaign && this.props.campaign._id) {
      socket.emit("campaign_connect", {
        campaignID: this.props.campaign._id,
        email: this.props.user.email,
        name: this.props.user.fullName
      });
      socketConnected = true;
      context.handleChange({ saving: false });
    } else context.handleChange({ saving: false });

    if (socketConnected) {
      socket.on("campaign_post_saved", post => {
        // update post if it's not active
        // if it is active, give user the option to load new changes or continue their edits.
        if (!post) return;
        const { posts, activePostIndex, listOfPostChanges } = this.state;
        const index = posts.findIndex(
          postObj => postObj._id.toString() === post._id.toString()
        );
        if (index === -1) {
          this.setState(prevState => {
            return { posts: [...prevState.posts, post] };
          });
        } else {
          // post exists already so we need to update it
          if (
            index === activePostIndex &&
            listOfPostChanges &&
            Object.keys(listOfPostChanges).length > 0
          ) {
            // the post that was updated is also the post currently being edited by this user
            // load the new post, but apply all the unsaved changes that this user has made
            // the user can change posts to discard their changes and see the updated post
            // or they can continue with their changes being applied to the updated post
            this.setState({ postUpdatedPrompt: true });
          }
          this.setState(prevState => {
            return {
              posts: [
                ...prevState.posts.slice(0, index),
                post,
                ...prevState.posts.slice(index + 1)
              ]
            };
          });
        }
      });

      socket.on("campaign_post_deleted", postID => {
        // remove post if it's not the active post
        // if it is the active post, notify user but give them the chance to save their edits
        const { posts, activePostIndex, listOfPostChanges } = this.state;
        if (
          posts[activePostIndex]._id.toString() === postID.toString() &&
          listOfPostChanges &&
          Object.keys(listOfPostChanges).length > 0
        ) {
          // post that was deleted is also the post that the user is in the middle of modifying
          this.setState(prevState => {
            return {
              postDeletedPrompt: true,
              posts: [
                ...prevState.posts.slice(0, activePostIndex),
                { ...prevState.posts[activePostIndex], _id: undefined },
                ...prevState.posts.slice(activePostIndex + 1)
              ]
            };
          });
        } else {
          const index = posts.findIndex(
            postObj => postObj._id.toString() === postID.toString()
          );
          if (index === -1) return;
          this.setState(
            prevState => {
              return {
                posts: [
                  ...prevState.posts.slice(0, index),
                  { ...prevState.posts[index], _id: undefined },
                  ...prevState.posts.slice(index + 1)
                ]
              };
            },
            () => this.deletePost(index)
          );
        }
      });

      socket.on("campaign_deleted", campaignID => {
        // give user the opportunity to re-save the campaign to save their work
        const { campaign, posts } = this.state;
        if (campaign._id.toString() !== campaignID.toString()) return;
        let newPosts = [];
        for (let i = 0; i < posts.length; i++) {
          newPosts.push({ ...posts[i], _id: undefined, campaignID: undefined });
        }

        this.setState({
          campaignDeletedPrompt: true,
          posts: newPosts,
          campaign: { ...campaign, _id: undefined }
        });
      });

      socket.on("campaign_modified", campaign => {
        // start/end dates, name, description, colour
        if (campaign._id.toString() !== this.state.campaign._id.toString())
          return;
        this.setState({ campaign });
      });

      socket.on("socket_user_list", reqObj => {
        const { roomID, userList } = reqObj;
        const { campaign } = this.state;

        if (roomID.toString() !== campaign._id.toString()) return;

        this.setState({ userList });
      });
    }

    this.setState({ socket });
  };

  triggerCampaignPeers = (type, extra) => {
    const { socket, campaign } = this.state;
    if (socket && type && campaign) {
      socket.emit("trigger_campaign_peers", {
        campaignID: campaign._id,
        type,
        extra
      });
      this.props.triggerSocketPeers(type, extra, campaign._id);
    }
  };

  restoreCampaign = () => {
    // save campaign to get new campaignID
    // then apply that campaignID to each post
    const { socket, campaign } = this.state;
    socket.emit("new_campaign", { ...campaign, posts: [] });
    socket.on("new_campaign_saved", campaignID => {
      socket.off("new_campaign_saved");
      const { posts } = this.state;
      const newPosts = [];
      for (let i = 0; i < posts.length; i++) {
        newPosts.push({ ...posts[i], campaignID });
      }
      this.setState(prevState => {
        return {
          posts: newPosts,
          campaign: { ...prevState.campaign, _id: campaignID }
        };
      });
    });
  };

  closeChecks = () => {
    const { listOfPostChanges } = this.state;

    if (Object.keys(listOfPostChanges).length > 0) {
      // unsaved post changes
      this.setState({ promptDiscardPostChanges: true });
      return false;
    }

    return true;
  };

  attemptToCloseModal = () => {
    const { handleParentChange } = this.props; // Functions
    // function called when the user tries to close the modal
    // we check to see if there are any unsaved changes on the current post and the recipe
    if (!this.closeChecks()) {
      return;
    }
    handleParentChange({ campaignModal: false });
  };

  deleteCampaign = (response, context) => {
    let { socket, campaign } = this.state;
    const { updateCampaigns, handleParentChange } = this.props;

    if (response) {
      socket.emit("delete", campaign);
      socket.on("campaign_deleted", success => {
        socket.off("campaign_deleted");

        if (success) {
          this.triggerCampaignPeers("campaign_deleted", campaign._id);
          this.props.triggerSocketPeers(
            "calendar_campaign_deleted",
            campaign._id
          );
          context.notify({
            type: "success",
            title: "Campaign Deleted",
            message: "Campaign and all of its posts were successfully deleted."
          });

          handleParentChange({ campaignModal: false });
          updateCampaigns();
        } else {
          context.notify({
            type: "danger",
            title: "Campaign Not Deleted",
            message:
              "At least one of the campaign posts failed to delete. Please try again."
          });
          handleParentChange({ campaignModal: false });
          updateCampaigns();
        }
      });
    }

    this.setState({ confirmDelete: false });
  };

  updatePost = (updatedPost, index) => {
    let { posts, activePostIndex } = this.state;

    let post_index = index === undefined ? activePostIndex : index;

    let new_post = { ...posts[post_index], ...updatedPost };
    if (new_post.postingDate && !moment.isMoment(new_post.postingDate)) {
      new_post.postingDate = new moment(new_post.postingDate);
    }

    if (index === undefined) {
      // index is only defined if updatePost is being called because
      // the post's date is being changed to stay anchored to campaign.startDate.
      // in that case, we want listOfPostChanges to be unaffected, so only
      // reset it if we're saving because the user clicked Schedule Post.
      // also, the posts don't need to be re-sorted if all posts are moving the same amount
      posts = [
        ...posts.slice(0, post_index),
        new_post,
        ...posts.slice(post_index + 1)
      ];
      let returnObject = this.bubbleSortPosts(posts, activePostIndex);
      posts = returnObject.posts;
      this.setState({
        activePostIndex: returnObject.activePostIndex,
        listOfPostChanges: {},
        posts,
        somethingChanged: true
      });
    } else {
      this.setState(prevState => {
        return {
          posts: [
            ...prevState.posts.slice(0, post_index),
            new_post,
            ...prevState.posts.slice(post_index + 1)
          ],
          somethingChanged: true
        };
      });
    }
  };

  savePostChanges = date => {
    // function called when user saves a post as part of a recipe and not part of a campaign
    // post doesn't get saved in DB so we need to store it within this modal's state instead
    const { activePostIndex, listOfPostChanges, posts } = this.state;
    const updated_post = {
      ...posts[activePostIndex],
      ...listOfPostChanges,
      postingDate: date
    };

    let new_posts = [
      ...posts.slice(0, activePostIndex),
      updated_post,
      ...posts.slice(activePostIndex + 1)
    ];

    let new_activePostIndex = activePostIndex;

    let returnObject = this.bubbleSortPosts(new_posts, new_activePostIndex);

    this.setState({
      posts: returnObject.posts,
      activePostIndex: returnObject.activePostIndex,
      listOfPostChanges: {},
      somethingChanged: true
    });
  };

  deletePost = (index, dontAskAgain) => {
    const { posts, socket, campaign } = this.state;

    if (dontAskAgain) {
      this.setState({ showDeletePostPrompt: false });
    }

    let nextActivePost = this.state.activePostIndex;
    if (index === this.state.activePostIndex) {
      // deleting the currently active post so we should make the post above it active
      nextActivePost = index - 1 < 0 ? 0 : index - 1;
    } else if (index < this.state.activePostIndex) {
      // this makes it so the active post stays the same despite the array indexes being adjusted
      nextActivePost = this.state.activePostIndex - 1;
    }

    if (index === -1) {
      console.log("couldn't find post to delete.");
      return;
    } else if (!posts[index]._id) {
      // post hasn't been scheduled yet so don't need to delete it from DB

      this.setState(prevState => {
        return {
          posts: [
            ...prevState.posts.slice(0, index),
            ...prevState.posts.slice(index + 1)
          ],
          somethingChanged: true,
          activePostIndex: nextActivePost,
          firstPostChosen: prevState.posts.length <= 1 ? false : true,
          listOfPostChanges:
            index === prevState.activePostIndex
              ? {}
              : prevState.listOfPostChanges
        };
      });
    } else {
      socket.emit("delete-post", { post: posts[index], campaign });
      socket.on("post-deleted", emitObject => {
        socket.off("post-deleted");
        const { removedPost, removedFromCampaign, newCampaign } = emitObject;
        if (!removedPost) {
          console.log("failed to remove post from db");
        }
        if (!removedFromCampaign) {
          console.log("failed to remove post from campaign in db");
        }
        if (removedPost && removedFromCampaign) {
          if (!newCampaign) {
            console.log(
              "post removed from db and in campaign in db but no newCampaign object???"
            );
          } else {
            this.triggerCampaignPeers(
              "campaign_post_deleted",
              posts[index]._id
            );
            this.setState(prevState => {
              return {
                posts: [
                  ...prevState.posts.slice(0, index),
                  ...prevState.posts.slice(index + 1)
                ],
                campaign: { ...prevState.campaign, posts: newCampaign.posts },
                somethingChanged: true,
                activePostIndex: nextActivePost,
                listOfPostChanges:
                  index === prevState.activePostIndex
                    ? {}
                    : prevState.listOfPostChanges
              };
            });
          }
        }
      });
    }
  };

  changeActivePost = response => {
    if (!response) {
      this.setState({
        promptChangeActivePost: false,
        pendingPostType: undefined
      });
      return;
    }
    const {
      campaign,
      nextChosenPostIndex,
      pendingPostType,
      posts
    } = this.state;

    if (pendingPostType) {
      // this occurs when the user is trying to create a new post and their currently active post has unsaved changes
      this.setState({
        listOfPostChanges: {},
        promptChangeActivePost: false,
        pendingPostType: undefined,
        ...newPost(
          pendingPostType,
          posts,
          campaign,
          this.props.clickedCalendarDate,
          {}
        )
      });
    } else {
      this.setState({
        activePostIndex: nextChosenPostIndex,
        promptChangeActivePost: false,
        listOfPostChanges: {}
      });
    }
  };

  backupPostChanges = (value, index) => {
    // function that gets called by <Post/> function to store all the changes that have happened
    // if the changes are saved, this list gets set back to empty
    // if this component's (campaignModal) state changes which causes a re-render,
    // we send this list of changes into the <Post/> component so it can re-execute those changes
    // otherwise the <Post/> component would lose all unsaved changes everytime a campaign attribute changed
    // say that when typing, this function would receive a series of calls such as:
    // backupPostChanges("t", "content"), backupPostChanges("tw", "content"), backupPostChanges("twi", "content"),
    // backupPostChanges("twit", "content"), etc..
    // we should probably only store one copy of each index ("content") since only the most recent matters
    const { listOfPostChanges, posts, activePostIndex } = this.state;
    const post = posts[activePostIndex];
    if (index === "date" && value.isSame(post.postingDate)) {
      delete listOfPostChanges[index];
    } else if (post[index] === value) {
      // same value that it originally was so no need to save its backup
      delete listOfPostChanges[index];
    } else {
      listOfPostChanges[index] = value;
    }
    this.setState({ listOfPostChanges });
  };

  modifyCampaignDates = postingDate => {
    // function that gets passed to <Post/> as a prop
    // <Post/> will use this function to push the campaign start/end dates in order to fit its posting date
    const { campaign, socket, recipeEditing } = this.state;
    if (campaign.startDate > postingDate) {
      campaign.startDate = new moment(postingDate);
    } else if (campaign.endDate < postingDate) {
      campaign.endDate = new moment(postingDate);
    } else {
      console.log(
        "attempting to modify campaign date so post date fits, but posting date already fits?"
      );
    }
    if (!recipeEditing) socket.emit("campaign_editted", campaign); // make sure this saves in the DB in case the page crashes or reloads
    this.setState({ campaign, somethingChanged: true });
  };

  tryChangingCampaignDates = (
    date,
    date_type,
    setDisplayAndMessage,
    anchorDates = false,
    context
  ) => {
    // function that gets passed to <DateTimePicker/> which lets it modify <Campaign/>'s start and end dates
    // before accepting the modifications, we must check to make sure that the new date doesn't invalidate any posts
    // for example, if you had a campaign from Sept 1 -> Sept 4 and a post on Sept 3,
    // then you tried to change the campaign to Sept 1 -> Sept 2, the post on Sept 3 will no longer be within the campaign dates
    // so we'll want to disallow this modification and let the user know what happened
    // it will be up to the user to either delete that post, or modify its posting date to within the intended campaign scope
    const { campaign, posts, activePostIndex, listOfPostChanges } = this.state;

    if (anchorDates && date_type === "startDate") {
      // modify each posting date and the campaign.endDate so that
      // each date stays the same distance away from startDate after startDate is changed
      const startDateDiff = date.diff(campaign.startDate); // difference in ms
      if (startDateDiff === 0) {
        return;
      }
      this.setState(
        prevState => {
          return {
            campaign: {
              ...prevState.campaign,
              startDate: date,
              endDate: new moment(
                prevState.campaign.endDate.add(startDateDiff, "milliseconds")
              )
            },
            somethingChanged: true
          };
        },
        () =>
          this.triggerCampaignPeers("campaign_modified", this.state.campaign)
      );
      for (let index = 0; index < posts.length; index++) {
        let post = posts[index];
        let new_date = new moment(post.postingDate).add(
          startDateDiff,
          "milliseconds"
        );
        if (
          index === activePostIndex &&
          listOfPostChanges &&
          Object.keys(listOfPostChanges).length > 0
        ) {
          // when the current post has changes, we should make sure that any date changes get
          // overwritten by this new date
          this.setState({
            listOfPostChanges: { ...listOfPostChanges, date: new_date }
          });
        }

        if (post._id) {
          // post is saved in DB so we need to save changes to DB
          // make sure that activePost's date gets changed but if it has other unsaved changes, those aren't discarded
          // date=postingDate, sendEmailReminder=emailReminder
          // postFinishedSavingCallback, setSaving
          let post_state = {
            ...post,
            date: new_date,
            sendEmailReminder: post.emailReminder ? true : false
          };
          let post_props = {
            setSaving: () => {
              context.handleChange({ saving: true });
            },
            postFinishedSavingCallback: savedPost => {
              this.updatePost(savedPost, index);
              this.triggerCampaignPeers("campaign_post_saved", savedPost);
              context.handleChange({ saving: false });
            }
          };
          trySavePost(post_state, post_props, true, true, context);
        } else {
          // post doesn't need to be updated in the DB so just update in this.state.posts
          let new_post = {
            ...post,
            postingDate: new_date
          };
          this.updatePost(new_post, index);
        }
      }
      return;
    }

    const dates = {
      startDate: campaign.startDate,
      endDate: campaign.endDate
    };
    dates[date_type] = date;
    const { startDate, endDate } = dates;

    let count_invalid = 0;

    for (let index in posts) {
      const postingDate = new moment(posts[index].postingDate);
      if (postingDate < startDate || postingDate > endDate) {
        count_invalid++;
      }
    }

    if (count_invalid === 0) {
      setDisplayAndMessage(false, "");
      if (date_type === "endDate") {
        this.handleCampaignChange(date, "endDate");
        if (date <= startDate) {
          this.handleCampaignChange(date, "startDate");
        }
      } else {
        this.handleCampaignChange(date, "startDate");
        if (date >= endDate) {
          this.handleCampaignChange(date, "endDate");
        }
      }
    } else {
      let post_string = count_invalid > 1 ? " posts" : " post";
      post_string =
        "Date/time change rejected due to " +
        count_invalid +
        post_string +
        " being outside the campaign scope.";
      setDisplayAndMessage(true, post_string);
    }
  };

  duplicatePost = post_index => {
    const { posts } = this.state;

    let new_post = {
      ...posts[post_index],
      postingDate: new moment(posts[post_index].postingDate),
      _id: undefined
    };

    this.setState(prevState => {
      return {
        posts: [
          ...prevState.posts.slice(0, post_index + 1),
          new_post,
          ...prevState.posts.slice(post_index + 1)
        ],
        somethingChanged: true
      };
    });
  };

  getActivePost = saveButtons => {
    const {
      activePostIndex,
      campaign,
      clickedCalendarDate,
      listOfPostChanges,
      posts,
      recipeEditing,
      showDeletePostPrompt,
      socket
    } = this.state;
    const { context } = this;
    const { calendarAccounts } = this.props;

    const post_obj = posts[activePostIndex];

    if (activePostIndex === undefined) {
      return (
        <PostList
          activePostIndex={activePostIndex}
          campaign={campaign}
          clickedCalendarDate={clickedCalendarDate}
          deletePost={
            showDeletePostPrompt
              ? index => {
                  this.setState({
                    promptDeletePost: true,
                    deleteIndex: index
                  });
                }
              : index => {
                  this.deletePost(index);
                }
          }
          duplicatePost={index => {
            this.duplicatePost(index);
          }}
          handleChange={this.handleChange}
          listOfPostChanges={listOfPostChanges}
          newPost={(
            socialType,
            posts,
            campaign,
            clickedCalendarDate,
            callback
          ) =>
            this.setState(
              newPost(
                socialType,
                posts,
                campaign,
                clickedCalendarDate,
                listOfPostChanges
              )
            )
          }
          posts={posts}
          recipeEditing={recipeEditing}
          saveButtons={saveButtons}
        />
      );
    } else if (post_obj.socialType === "custom") {
      return (
        <CustomTask
          backupChanges={this.backupPostChanges}
          calendarID={this.props.calendarID}
          campaignEndDate={campaign.endDate}
          campaignStartDate={campaign.startDate}
          canEditPost={true}
          close={() => this.setState({ activePostIndex: undefined })}
          listOfChanges={
            Object.keys(listOfPostChanges).length > 0
              ? listOfPostChanges
              : undefined
          }
          modifyCampaignDates={this.modifyCampaignDates}
          post={post_obj}
          recipeEditing={recipeEditing}
          savePostChanges={this.savePostChanges}
          saveButtons={saveButtons}
          setSaving={() => {
            context.handleChange({ saving: true });
          }}
          socialType={post_obj.socialType}
        />
      );
    } else {
      return (
        <Post
          backupChanges={this.backupPostChanges}
          calendarAccounts={calendarAccounts}
          calendarID={this.props.calendarID}
          campaignEndDate={campaign.endDate}
          campaignStartDate={campaign.startDate}
          canEditPost={true}
          close={() => this.setState({ activePostIndex: undefined })}
          listOfChanges={
            Object.keys(listOfPostChanges).length > 0
              ? listOfPostChanges
              : undefined
          }
          modifyCampaignDates={this.modifyCampaignDates}
          notify={context.notify}
          post={post_obj}
          postFinishedSavingCallback={(savedPost, success, message) => {
            if (success) {
              context.handleChange({ saving: false });
              socket.emit("new_post", { campaign, post: savedPost });
              this.updatePost(savedPost);
              socket.on("post_added", emitObject => {
                socket.off("post_added");
                campaign.posts = emitObject.campaignPosts;
                this.triggerCampaignPeers("campaign_post_saved", savedPost);
                this.setState({ campaign, saving: false });
              });
            } else {
              context.notify({ type: "danger", title: "Save Failed", message });
              context.handleChange({ saving: false });
            }
          }}
          recipeEditing={recipeEditing}
          savePostChanges={this.savePostChanges}
          saveButtons={saveButtons}
          setSaving={() => {
            context.handleChange({ saving: true });
          }}
          socialType={post_obj.socialType}
        />
      );
    }
  };

  createRecipe = (context, campaign, posts) => {
    if (campaign.name === "") {
      context.notify({
        type: "danger",
        title: "Save Cancelled",
        message:
          "To publish this campaign as a template, please give it a name!"
      });
      return;
    } else if (!posts || posts.length < 1) {
      context.notify({
        type: "danger",
        title: "Save Cancelled",
        message: "You cannot save a template with no posts."
      });
      return;
    }

    context.handleChange({ saving: true });

    axios.post("/api/recipe", { campaign, posts }).then(res => {
      const { success } = res.data;

      context.handleChange({ saving: false });

      if (!success) {
        console.log(
          "recipe save unsuccessful. res.data.message then res.data.campaign"
        );
        console.log(res.data.message);
        console.log(res.data.campaign);
        context.notify({
          type: "danger",
          title: "Save Failed",
          message:
            "Template save failed. Try again and if it fails again, please take a screenshot of your template to send to GhostIt to help us fix the problem!"
        });
      }

      context.notify({
        type: "success",
        title: "Template Saved",
        message: "Template has been saved successfully."
      });

      if (res.data.recipe) {
        this.setState(prevState => {
          return {
            campaign: {
              ...prevState.campaign,
              recipeID: res.data.recipe._id
            },
            somethingChanged: true
          };
        });
      }

      if (res.data.campaign) {
        this.setState(prevState => {
          return {
            campaign: {
              ...prevState.campaign,
              recipeID: res.data.campaign.recipeID
            }
          };
        });
      }
    });
  };

  handleChange = (value, index, index2) => {
    if (index2) {
      let object = this.state[index];
      object[index2] = value;

      this.setState({ [index]: object });
    } else {
      this.setState({ [index]: value });
    }
  };

  handleCampaignChange = (value, index) => {
    if (index) {
      let { campaign, socket } = this.state;
      campaign[index] = value;

      this.setState({ campaign, somethingChanged: true });

      socket.emit("campaign_editted", campaign);
      socket.on("campaign_saved", emitObject => {
        socket.off("campaign_saved");
        if (!emitObject || !emitObject.campaign) {
        } else {
          this.triggerCampaignPeers("campaign_modified", campaign);
        }
      });
    }
  };
  bubbleSortPosts = (posts, activePostIndex) => {
    for (let i = 0; i < posts.length; i++) {
      for (var j = 0; j < posts.length - i - 1; j++) {
        if (posts[j].postingDate > posts[j + 1].postingDate) {
          if (j === activePostIndex) activePostIndex += 1;
          else if (j + 1 === activePostIndex) activePostIndex -= 1;
          let tmp = posts[j];
          posts[j] = posts[j + 1];
          posts[j + 1] = tmp;
        }
      }
    }
    return { posts, activePostIndex };
  };

  render() {
    const {
      activePostIndex,
      campaign,
      campaignDeletedPrompt,
      confirmDelete,
      deleteIndex,
      listOfPostChanges,
      posts,
      postDeletedPrompt,
      postUpdatedPrompt,
      promptChangeActivePost,
      promptDeletePost,
      promptDiscardPostChanges,
      recipeEditing,
      showDeletePostPrompt,
      socket,
      userList
    } = this.state;
    const { clickedCalendarDate } = this.props; // Variables
    const { handleParentChange } = this.props; // Functions

    let firstPostChosen = Array.isArray(posts) && posts.length > 0;

    const saveButtons = (
      <GIContainer className="wrap">
        {!recipeEditing && (
          <button
            className="common-border five-blue bg-white px16 py8 mr8 br4"
            title={
              "Save campaign now.\nCampaigns are saved automatically when making any changes or navigating away from the campaign window."
            }
            onClick={() => {
              socket.emit("campaign_editted", campaign);
              socket.on("campaign_saved", emitObject => {
                socket.off("campaign_saved");
                if (!emitObject || !emitObject.campaign) {
                  this.context.notify({
                    type: "danger",
                    title: "Save Failed",
                    message: "Campaign save was unsuccesful."
                  });
                } else {
                  this.props.triggerSocketPeers("calendar_campaign_saved", {
                    ...emitObject.campaign,
                    posts: this.state.posts
                  });
                  this.context.notify({
                    type: "success",
                    title: "Campaign Saved",
                    message: "Campaign was saved!"
                  });
                }
                this.context.handleChange({ saving: false });
              });
            }}
          >
            Save Campaign
          </button>
        )}

        {!recipeEditing && (
          <button
            className="common-border five-blue bg-white px16 py8 mr8 br4"
            title="Save a template based on this campaign."
            onClick={() => this.createRecipe(this.context, campaign, posts)}
          >
            Save as Template
          </button>
        )}
        {!recipeEditing && (
          <button
            className="common-border dark shadow-6 primary-font bg-white px16 py8 mr8 br4"
            onClick={() => this.handleChange(true, "confirmDelete")}
          >
            Delete Campaign
          </button>
        )}
        {recipeEditing && (
          <button
            className="common-border five-blue bg-white px16 py8 mr8 br4"
            title={
              "Save campaign now.\nCampaigns are saved automatically when navigating away from the campaign window."
            }
            onClick={() => {
              //this.context.handleChange({ saving: true });
              socket.emit("campaign_editted", campaign);
              socket.on("campaign_saved", emitObject => {
                socket.off("campaign_saved");
                if (!emitObject) {
                  this.context.notify({
                    type: "danger",
                    title: "Save Failed",
                    message: "Campaign save was unsuccesful."
                  });
                } else {
                  this.context.notify({
                    type: "success",
                    title: "Campaign Saved",
                    message: "Campaign was saved!"
                  });
                }
                this.context.handleChange({ saving: false });
              });
            }}
          >
            Save Campaign
          </button>
        )}
        {recipeEditing && (
          <button
            className="common-border five-blue bg-white px16 py8 mr8 br4"
            title="Save a template based on this campaign."
            onClick={() => this.createRecipe(this.context, campaign, posts)}
          >
            Save as Template
          </button>
        )}
        {recipeEditing && (
          <button
            className="common-border five-blue bg-white px16 py8 mr8 br4"
            title={
              "Click to save template. Unlike campaigns, templates are not saved automatically."
            }
            onClick={() => this.createRecipe(this.context, campaign, posts)}
          >
            Save Template
          </button>
        )}
      </GIContainer>
    );

    return (
      <Consumer>
        {context => (
          <div className="flex column x-fill">
            <CampaignRecipeHeader
              campaign={campaign}
              handleChange={this.handleCampaignChange}
              tryChangingDates={(
                date,
                date_type,
                setDisplayAndMessage,
                anchorDates
              ) =>
                this.tryChangingCampaignDates(
                  date,
                  date_type,
                  setDisplayAndMessage,
                  anchorDates,
                  context
                )
              }
              backToRecipes={() => {
                handleParentChange({
                  campaignModal: false,
                  templatesModal: true
                });
              }}
              userList={userList}
              close={() => this.attemptToCloseModal()}
            />
            {!firstPostChosen && (
              <GIContainer className="column">
                <GIContainer className="column bg-white common-border mx32 mt32 br16">
                  <h4 className="tac my16">
                    How do you want to start off your campaign?
                  </h4>
                  <PostTypePicker
                    newPost={socialType => {
                      this.setState(
                        newPost(
                          socialType,
                          posts,
                          campaign,
                          clickedCalendarDate,
                          listOfPostChanges
                        )
                      );
                    }}
                    deletePost={
                      showDeletePostPrompt
                        ? index => {
                            this.setState({
                              promptDeletePost: true,
                              deleteIndex: index
                            });
                          }
                        : index => {
                            this.deletePost(index);
                          }
                    }
                    handleChange={this.handleChange}
                    recipeEditing={recipeEditing}
                    duplicatePost={index => {
                      this.duplicatePost(index);
                    }}
                  />
                </GIContainer>
                <GIContainer className="py8 px32">{saveButtons}</GIContainer>
              </GIContainer>
            )}
            {firstPostChosen && this.getActivePost(saveButtons)}

            {campaignDeletedPrompt && (
              <ConfirmAlert
                close={() => handleParentChange({ campaignModal: false })}
                title="Campaign Deleted"
                message="Another calendar user just deleted this campaign. To save the campaign, you'll need to click Restore and then save each post separately."
                firstButton="Restore"
                secondButton="Delete"
                callback={response => {
                  if (response) {
                    this.setState({ campaignDeletedPrompt: false });
                    this.restoreCampaign();
                  } else handleParentChange({ campaignModal: false });
                }}
              />
            )}
            {postDeletedPrompt && (
              <ConfirmAlert
                close={() => this.setState({ postDeletedPrompt: false })}
                title="Current Post Deleted"
                message="Another calendar user just deleted the post you are currently working on. If you keep working and save your changes, they will be saved as a new post."
                firstButton="Keep Working"
                secondButton="Delete Now"
                callback={response => {
                  this.setState({ postDeletedPrompt: false });
                  if (!response) this.deletePost(activePostIndex);
                }}
                type="modify"
              />
            )}
            {postUpdatedPrompt && (
              <ConfirmAlert
                close={() => this.setState({ postUpdatedPrompt: false })}
                title="Current Post Updated"
                message="Another calendar user has saved an updated version of this post. Would you like to discard your changes and load the new version?"
                firstButton="Discard"
                callback={response => {
                  this.setState({ postUpdatedPrompt: false });
                  if (response) this.setState({ listOfPostChanges: {} });
                }}
                helpTooltip="We recommend selecting Cancel, screenshotting or copying your changes somewhere else, then switch to a different post and back to this one. This allows you to view the new post changes without completely losing your changes."
              />
            )}
            {confirmDelete && (
              <ConfirmAlert
                close={() => this.setState({ confirmDelete: false })}
                title="Delete Campaign"
                message="Are you sure you want to delete this campaign? Deleting this campaign will also delete all posts in it."
                callback={response => this.deleteCampaign(response, context)}
                type="delete-campaign"
              />
            )}
            {promptDeletePost && (
              <ConfirmAlert
                close={() => this.setState({ promptDeletePost: false })}
                title="Delete Post"
                message="Are you sure you want to delete the post?"
                checkboxMessage="Don't ask me again."
                callback={(response, dontAskAgain) => {
                  this.setState({ promptDeletePost: false });
                  if (!response) {
                    return;
                  }
                  this.deletePost(deleteIndex, dontAskAgain);
                }}
                type="delete-post"
              />
            )}

            {promptDiscardPostChanges && (
              <ConfirmAlert
                close={() => this.setState({ promptDiscardPostChanges: false })}
                title="Discard Unsaved Changes"
                message="Your current post has unsaved changes. Cancel and schedule the post if you'd like to save those changes."
                callback={response => {
                  if (!response) {
                    this.setState({ promptDiscardPostChanges: false });
                    return;
                  }
                  this.setState(
                    {
                      listOfPostChanges: {},
                      promptDiscardPostChanges: false
                    },
                    this.attemptToCloseModal
                  );
                }}
                type="change-post"
              />
            )}

            {promptChangeActivePost && (
              <ConfirmAlert
                close={() => this.setState({ promptChangeActivePost: false })}
                title="Discard Unsaved Changes"
                message="Your current post has unsaved changes. Cancel and schedule the post if you'd like to save those changes."
                callback={this.changeActivePost}
                type="change-post"
              />
            )}
          </div>
        )}
      </Consumer>
    );
  }
}

Campaign.contextType = ExtraContext;

function mapStateToProps(state) {
  return {
    user: state.user,
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
)(Campaign);
