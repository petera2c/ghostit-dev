const nodemailer = require("nodemailer");
const xoauth2 = require("xoauth2");
const User = require("../models/User");
const keys = require("../config/keys");

module.exports = {
	sendPasswordReset: function(req, res) {
		let { email } = req.body;
		User.findOne({ email: email }, function(err, user) {
			if (err) {
				console.log(err);
				res.send({ success: false, errorMessage: err });
				return;
			} else if (user) {
				let transporter = nodemailer.createTransport({
					service: "gmail",
					host: "smtp.gmail.com",
					auth: {
						user: keys.email,
						pass: keys.emailPassword
					}
				});
				let temporaryPassword = Math.random()
					.toString(36)
					.substring(7);
				user.tempPassword = user.generateHash(temporaryPassword);
				user.save();
				console.log(keys.email);
				console.log(keys.emailPassword);
				let mailOptions = {
					from: "Ghostit <" + keys.email + ">",
					to: email,
					subject: "Ghostit Password Reset",
					text:
						"Your temporary password is " +
						temporaryPassword +
						". You will still be able to use your old password until you have logged in with this new password."
				};

				transporter.sendMail(mailOptions, function(err, result) {
					if (err) {
						console.log(err);
						res.send({
							success: false,
							errorMessage: "Could not send email to this address. Please contact us immediately for assistance."
						});
					} else {
						res.send({ success: true });
					}
				});
			} else {
				console.log(err);
				res.send({ success: false, errorMessage: "User not found with this email address!" });
				return;
			}
		});
	}
};
