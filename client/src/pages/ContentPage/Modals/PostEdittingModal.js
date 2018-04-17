import React, { Component } from "react";
import axios from "axios";
import "font-awesome/css/font-awesome.min.css";
import moment from "moment-timezone";

import DatePicker from "../Divs/DatePicker.js";
import TimePicker from "../Divs/TimePicker.js";
import Carousel from "../Carousel";
import ImagesDiv from "../Divs/ImagesDiv.js";

import Notification from "../../../components/Notification";
import ConfirmAlert from "../../../components/ConfirmAlert";

import "../../../css/modal.css";
import { switchDateToUsersTimezoneInUtcForm } from "../../../functions/CommonFunctions";

class EdittingModal extends Component {
	state = {
		postID: "",
		activeTab: "",
		link: "",
		linkImagesArray: [],
		linkImage: "",
		accountType: "",
		postImages: [],
		postingToAccountID: "",
		postingDate: undefined,
		imagesToDelete: [],
		status: "",
		notification: {}
	};

	constructor(props) {
		super(props);

		this.linkPreviewSetState = this.linkPreviewSetState.bind(this);
		this.setPostImages = this.setPostImages.bind(this);
		this.pushToImageDeleteArray = this.pushToImageDeleteArray.bind(this);
	}
	componentDidMount() {
		this.initialize(this.props.clickedCalendarEvent);
	}
	initialize(post) {
		// Initialize textarea text
		if (post.title === "(no content)") {
		} else {
			document.getElementById("edittingTextarea").value = post.title;
		}
		// Get post from database and update state
		axios.get("/api/post/" + post._id).then(res => {
			var post = res.data;
			this.setState({
				postID: post._id,
				postImages: post.images,
				activeTab: post.socialType,
				accountType: post.accountType,
				postingToAccountID: post.accountID,
				link: post.link,
				linkImage: post.linkImage,
				postingDate: post.postingDate,
				status: post.status
			});
			this.refs.carousel.findLink(post.content);
		});
	}

	canShowLinkPreview(socialMedia) {
		if (socialMedia === "facebook") {
			return true;
		} else if (socialMedia === "twitter") {
			return false;
		} else if (socialMedia === "linkedin") {
			return true;
		} else if (socialMedia === "instagram") {
			return false;
		}
	}
	canEditLinkPreview(socialMedia) {
		if (socialMedia === "facebook") {
			return false;
		} else if (socialMedia === "twitter") {
			return false;
		} else if (socialMedia === "linkedin") {
			return true;
		} else if (socialMedia === "instagram") {
			return false;
		}
	}

	savePost() {
		// Get content of post
		var content = document.getElementById("edittingTextarea").value;

		// Get current images
		var currentImages = this.state.postImages;

		// Get date of post
		var datePickerDate = document.getElementById("edittingDatePickerPopUp").getAttribute("getdate");

		// Get time of post
		var timePickerTime = document.getElementById("edittingTimePickerPopUp").getAttribute("gettime");

		// Combine time and date into one date variable
		var postingDate = new Date(datePickerDate);
		var postingTime = new Date(timePickerTime);
		postingDate.setHours(postingTime.getHours());
		postingDate.setMinutes(postingTime.getMinutes());

		// Get carousel html element
		var carousel;
		if (this.canEditLinkPreview(this.state.activeTab)) {
			carousel = document.getElementById("editLinkCarousel");
		}
		// Make sure that the date is not in the past

		var dateToPostInUtcTime = switchDateToUsersTimezoneInUtcForm(postingDate, this.props.usersTimezone);

		var currentUtcDate = moment()
			.utcOffset(0)
			.format();
		// Make sure that the date is not in the past
		if (currentUtcDate > dateToPostInUtcTime) {
			alert("Time travel is not yet possible! Please select a date in the future not in the past!");
			return;
		}
		var link = this.state.link;
		// If link previews are allowed get src of active image from carousel
		var linkPreviewImage = this.state.linkImage;
		if (link !== "") {
			if (carousel) {
				// Get active image from carousel
				linkPreviewImage = document.getElementsByClassName("owl-item active center")[0].children[0].children[0].src;
			}
		}
		// Get account id to post to
		var accountIdToPostTo = this.state.postingToAccountID;

		if (accountIdToPostTo === "") {
			alert("Please select an account to post to!");
			return;
		}

		// Now we have content of post, date (and time), account ID to post to, link preview image src and the link url

		// Check to make sure we have atleast a link, content, or an image
		if (content === "" && link === "" && currentImages === []) {
			alert("You are trying to create an empty post. We will not let you shoot yourself in the foot.");
			return;
		}

		// Everything seems okay, save post to database!
		axios
			.post("/api/post/update/" + this.state.postID, {
				accountID: accountIdToPostTo,
				content: content,
				postingDate: dateToPostInUtcTime,
				link: link,
				linkImage: linkPreviewImage,
				accountType: this.state.accountType,
				socialType: this.state.activeTab
			})
			.then(res => {
				var post = res.data;

				var newImages = [];
				var imagesToDelete = this.state.imagesToDelete;
				for (var i = 0; i < currentImages.length; i++) {
					// If imagePreviewUrl is not undefined this is a new photo and we need to upload it to the server
					if (currentImages[i].imagePreviewUrl !== undefined) {
						newImages.push(currentImages[i].image);
					}
				}
				// We now have two arrays. One with all images we need to add and one with all images we need to delete.
				// Images are saved after post, becuse they are handled so differently in the database
				// Text and images do not go well together

				// First we will delete the necessary images from cloudinary and our database
				if (post._id && imagesToDelete.length !== 0) {
					axios.post("/api/post/delete/images/" + post._id, imagesToDelete).then(res => {
						// After images have been deleted, we will save new images
						// Add all new images
						if (post._id && newImages.length !== 0) {
							// Make sure post actually saved
							// Now we add images

							// Images must be uploaded via forms
							var formData = new FormData();
							formData.append("postID", post._id);

							// Attach all images to formData
							for (i = 0; i < newImages.length; i++) {
								formData.append("file", newImages[i]);
							}
							// Make post request for images
							axios.post("/api/post/images", formData).then(res => {
								this.finishSave();
								return;
							});
						} else {
							this.finishSave();
							return;
						}
					});
				} else if (post._id && newImages.length !== 0) {
					// If there are no images to delete we simply need to add new images
					// Add all new images
					// Make sure post actually saved
					// Now we add images

					// Images must be uploaded via forms
					var formData = new FormData();
					formData.append("postID", post._id);

					// Attach all images to formData
					for (i = 0; i < newImages.length; i++) {
						formData.append("file", newImages[i]);
					}
					// Make post request for images
					axios.post("/api/post/images", formData).then(res => {
						this.finishSave();
						return;
					});
				} else {
					this.finishSave();
					return;
				}
			});
	}
	finishSave() {
		this.props.updateCalendarPosts();
	}
	linkPreviewSetState(link, imagesArray) {
		this.setState({ link: link, linkImagesArray: imagesArray });
	}
	setPostImages(imagesArray) {
		this.setState({ postImages: imagesArray });
	}
	pushToImageDeleteArray(image) {
		var imagesToDeleteArray = this.state.imagesToDelete;
		imagesToDeleteArray.push(image);
		this.setState({ imagesToDelete: imagesToDeleteArray });
	}
	deletePostPopUp = () => {
		this.setState({ deletePost: true });
	};
	deletePost = deletePost => {
		this.setState({ deletePost: false });
		if (!this.state.postID) {
			alert("Error cannot find post. Please contact our dev team immediately");
			return;
		}
		if (deletePost) {
			axios.delete("/api/post/delete/" + this.state.postID).then(res => {
				if (res.data) {
					this.props.updateCalendarPosts();
				} else {
					this.setState({
						notification: { on: true, notificationType: "danger", title: "Something went wrong", message: "" }
					});
				}
			});
		}
	};

	render() {
		// Determine if post can be editted or not
		var canEditLinkPreview;
		var textareaDiv;
		var dateEdittingDisabled;
		if (this.state.status === "pending" || this.state.status === "error") {
			canEditLinkPreview = this.canEditLinkPreview(this.state.activeTab);
			textareaDiv = (
				<textarea
					id="edittingTextarea"
					className="postingTextArea"
					rows={5}
					placeholder="Success doesn't write itself!"
					onChange={event => this.refs.carousel.findLink(event.target.value)}
				/>
			);
			dateEdittingDisabled = false;
		} else {
			canEditLinkPreview = false;
			textareaDiv = (
				<textarea
					id="edittingTextarea"
					className="postingTextArea"
					rows={5}
					placeholder="Success doesn't write itself!"
					onChange={event => this.refs.carousel.findLink(event.target.value)}
					readOnly
				/>
			);
			dateEdittingDisabled = true;
		}

		var carousel = (
			<Carousel
				linkPreviewCanEdit={canEditLinkPreview}
				linkPreviewCanShow={this.canShowLinkPreview(this.state.activeTab)}
				ref="carousel"
				updateParentState={this.linkPreviewSetState}
				id="editLinkCarousel"
			/>
		);

		var modalBody;
		var modalFooter;

		// Don't mess with this date. Javascript dates are messed up and this makes it work.
		// It is complicated and weird. Do not touch it.
		let date;
		if (this.state.postingDate) {
			let test = moment(this.state.postingDate);
			date = new Date(
				test.toDate().getTime() +
					moment()
						.tz(this.props.usersTimezone)
						.utcOffset() *
						60 *
						1000 -
					moment()
						.tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
						.utcOffset() *
						60 *
						1000
			);
		}
		var canDeleteImage = this.state.status === "pending" || this.state.status === "error";
		modalBody = (
			<div className="modal-body">
				{textareaDiv}
				<ImagesDiv
					postImages={this.state.postImages}
					setPostImages={this.setPostImages}
					pushToImageDeleteArray={this.pushToImageDeleteArray}
					canDeleteImage={canDeleteImage}
					imageLimit={4}
					divID={"edittingPostImagesDiv"}
				/>
				{carousel}
				<DatePicker clickedCalendarDate={date} id="edittingDatePickerPopUp" canEdit={dateEdittingDisabled} />
				<TimePicker timeForPost={date} id="edittingTimePickerPopUp" canEdit={dateEdittingDisabled} />
				{this.state.status && <button onClick={() => this.savePost()}>Save Post</button>}
			</div>
		);
		if (this.state.status === "pending" || this.state.status === "error") {
			modalFooter = (
				<div className="modal-footer">
					<button onClick={this.deletePostPopUp} className="fa fa-trash fa-2x delete" />
				</div>
			);
		}

		return (
			<div id="edittingModal" className="modal">
				{this.state.notification.on && (
					<Notification
						notificationType={this.state.notification.notificationType}
						title={this.state.notification.title}
						message={this.state.notification.message}
						callback={this.hideNotification}
					/>
				)}
				{this.state.deletePost && (
					<ConfirmAlert
						title="Delete Post"
						message="Are you sure you want to delete this post?"
						callback={this.deletePost}
					/>
				)}
				<div className="modal-content" style={{ textAlign: "center" }}>
					<div className="modal-header">
						<span className="close-dark" onClick={() => this.props.close("postEdittingModal")}>
							&times;
						</span>
					</div>
					{modalBody}
					{modalFooter}
				</div>
			</div>
		);
	}
}

export default EdittingModal;