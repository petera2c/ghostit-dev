const User = require("../models/User");
const { sendEmail } = require("./sendEmail");

module.exports = {
  sendPasswordReset: async (req, res) => {
    let { email } = req.body;

    let temporaryPassword = Math.random()
      .toString(36)
      .substring(7);

    User.findOne({ email }, (err, user) => {
      if (err) {
        console.log(err);
        res.send({ success: false, errorMessage: err });
      } else if (user) {
        user.tempPassword = user.generateHash(temporaryPassword);
        user.save();
        sendEmail(
          user,
          "Ghostit Password Reset",
          "Your temporary password is " +
            temporaryPassword +
            ". You will still be able to use your old password until you have logged in with this new password.",
          results => {
            res.send(results);
          }
        );
      } else {
        console.log(err);
        res.send({
          success: false,
          errorMessage: "User not found with this email address!"
        });
      }
    });
  }
};
