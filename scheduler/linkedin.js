const Post = require("../models/Post");
const Account = require("../models/Account");
const cloudinary = require("cloudinary");
const keys = require("../config/keys");
const Linkedin = require("node-linkedin")(
	keys.linkedinConsumerKey,
	keys.linkedinConsumerSecret,
	keys.linkedinCallbackURL
);
const request = require("request");
const axios = require("axios");

module.exports = {
	postToProfile: function(post) {
		Account.findOne(
			{
				_id: post.accountID
			},
			async function(err, account) {
				if (account) {
					var LI = Linkedin.init(account.accessToken);
					var linkedinPost = {};
					var linkedinLink = {};
					if (post.content !== "") {
						linkedinPost.comment = post.content;
					}
					if (post.link !== "") {
						linkedinLink["submitted-url"] = post.link;
						linkedinPost.content = linkedinLink;
					}
					if (post.linkImage !== "" && post.link !== "") {
						linkedinLink["submitted-image-url"] =
							"http://testcreative.co.uk/wp-content/uploads/2017/10/Test-Logo-Small-Black-transparent-1.png";

						linkedinPost.content = linkedinLink;
						if (post.images[0]) {
							linkedinLink["submitted-image-url"] = post.images[0].url;
							linkedinPost.content = linkedinLink;
						}
					}
					linkedinPost.visibility = { code: "anyone" };

					LI.people.share(linkedinPost, function(nothing, results) {
						if (!results) {
							return;
						}

						if (!results.updateKey) {
							savePostError(post._id, results);
						} else {
							savePostSuccessfully(post._id, results.updateKey);
						}
					});
				} else {
					savePostError(post._id, "Cannot find your account!");
				}
			}
		);
	},
	postToPage: function(post) {
		Account.findOne(
			{
				_id: post.accountID
			},
			async function(err, account) {
				if (account) {
					var LI = Linkedin.init(account.accessToken);
					var linkedinPost = {};
					var linkedinLink = {};
					if (post.content !== "") {
						linkedinPost.comment = post.content;
					}
					if (post.link !== "") {
						linkedinLink["submitted-url"] = post.link;
						linkedinPost.content = linkedinLink;
					}
					if (post.linkImage !== "" && post.link !== "") {
						linkedinLink["submitted-image-url"] = post.linkImage;
						linkedinPost.content = linkedinLink;
						if (post.images[0]) {
							linkedinLink["submitted-image-url"] = post.images[0].url;
							linkedinPost.content = linkedinLink;
						}
					}

					linkedinPost.visibility = { code: "anyone" };

					LI.companies.share(account.socialID, linkedinPost, function(error, result) {
						if (!result.updateKey) {
							savePostError(post._id, result);
						} else {
							savePostSuccessfully(post._id, result.updateKey);
						}
					});
				} else {
					savePostError(post._id, "Account not found!");
				}
			}
		);
	}
};
function savePostError(postID, error) {
	Post.findOne({ _id: postID }, function(err, post) {
		post.status = "error";
		post.errorMessage = JSON.stringify(error);
		post.save().then(response => {
			return;
		});
	});
}
function savePostSuccessfully(postID, linkedinPostID) {
	Post.findOne({ _id: postID }, function(err, post) {
		post.status = "posted";
		post.socialMediaID = linkedinPostID;
		post.save().then(response => {
			return;
		});
	});
}
