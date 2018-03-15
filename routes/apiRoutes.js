const passport = require("passport");
const User = require("../models/User");
const Account = require("../models/Account");
var FB = require("fb");
const Post = require("../models/Post");

var multipart = require("connect-multiparty");
var fileParser = multipart();

var facebookFunctions = require("../services/facebookFunctions");
var linkedinFunctions = require("../services/linkedinFunctions");
var accountFunctions = require("../services/accountFunctions");
var userFunctions = require("../services/userFunctions");
var postFunctions = require("../services/postFunctions");
var blogFunctions = require("../services/websiteBlogFunctions");

module.exports = app => {
	// Login user
	app.post(
		"/api/auth/login",
		passport.authenticate("local-login", {
			successRedirect: "/content",
			failureRedirect: "/",
			failureFlash: true
		})
	);
	// Register user
	app.post(
		"/api/user",
		passport.authenticate("local-signup", {
			successRedirect: "/content",
			failureRedirect: "/",
			failureFlash: true
		})
	);
	// Update user account
	app.post("/api/user/id", (req, res) => userFunctions.updateUser(req, res));
	// Get current user
	app.get("/api/user", (req, res) => {
		res.send(req.user);
	});
	// Logout user
	app.get("/api/logout", (req, res) => {
		req.session.destroy();
		res.redirect("/");
	});

	// Middleware check
	app.get("/api/isUserSignedIn", (req, res) => {
		res.send(req.isAuthenticated());
	});

	// Save account to database
	app.post("/api/account", (req, res) => accountFunctions.saveAccount(req, res));
	// Delete account
	app.delete("/api/account", (req, res) => accountFunctions.disconnectAccount(req, res));
	// Get all accounts that a user has connected
	app.get("/api/accounts", (req, res) => {
		Account.find({ userID: req.user._id }, function(err, accounts) {
			if (err) return handleError(err);
			res.send(accounts);
		});
	});

	// Add Facebook profile
	app.get(
		"/api/facebook",
		passport.authenticate("facebook", {
			scope: [
				"public_profile",
				"email",
				"user_managed_groups",
				"publish_pages",
				"manage_pages",
				"business_management",
				"publish_actions"
			]
		})
	);
	// Facebook callback
	app.get(
		"/api/facebook/callback",
		passport.authenticate("facebook", {
			successRedirect: "/content",
			failureRedirect: "/"
		})
	);
	// Add Twitter account
	app.get("/api/twitter", passport.authenticate("twitter"));
	// Twitter callback
	app.get(
		"/api/twitter/callback",
		passport.authenticate("twitter", {
			successRedirect: "/content",
			failureRedirect: "/"
		})
	);

	// Get Facebook pages of profile accounts
	app.get("/api/facebook/pages", (req, res) => facebookFunctions.getFacebookPages(req, res));
	// Get Facebook groups of profile accounts
	app.get("/api/facebook/groups", (req, res) => facebookFunctions.getFacebookGroups(req, res));
	// Post to facebook
	app.post("/api/facebook/post", (req, res) => {
		res.redirect("/profile");
	});

	// Add Linkedin account
	app.get("/api/linkedin", (req, res) => linkedinFunctions.getLinkedinCode(req, res));
	// Linkedin callback
	app.get("/api/linkedin/callback", (req, res) => linkedinFunctions.getLinkedinAccessToken(req, res));
	// Get Linkedin pages of profile account
	app.get("/api/linkedin/pages", (req, res) => linkedinFunctions.getLinkedinPages(req, res));

	// Get images from a URL and send back to client
	app.post("/api/link", (req, res) => postFunctions.getImagesFromUrl(req, res));

	// Save post
	app.post("/api/post", (req, res) => postFunctions.savePost(req, res));
	// Get all of user's posts
	app.get("/api/posts", (req, res) => postFunctions.getPosts(req, res));
	// Get post
	app.get("/api/post/:postID", (req, res) => postFunctions.getPost(req, res));
	// update post
	app.post("/api/post/update/:postID", (req, res) => postFunctions.updatePost(req, res));
	// Save post images
	app.post("/api/post/images", fileParser, async (req, res) => postFunctions.uploadPostImages(req, res));
	// Delete post images
	app.post("/api/post/delete/images/:postID", (req, res) => postFunctions.deletePostImages(req, res));

	// Create a blog placeholder
	app.post("/api/blog", fileParser, async (req, res) => blogFunctions.saveBlog(req, res));
};