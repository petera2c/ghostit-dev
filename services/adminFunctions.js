const User = require("../models/User");
const Account = require("../models/Account");
const Plan = require("../models/Plan");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const cloudinary = require("cloudinary");
const generalFunctions = require("./generalFunctions");

module.exports = {
  getUsers: (req, res) => {
    if (req.user.role !== "admin")
      generalFunctions.handleError(res, "HACKER ALERT!!!!");
    else {
      User.find({}, (err, users) => {
        if (err) generalFunctions.handleError(res, err);
        else if (!users) generalFunctions.handleError(res, "Users not found");
        else res.send(users);
      });
    }
  },
  updateUser: (req, res) => {
    if (req.user.role !== "admin")
      generalFunctions.handleError(res, "HACKER ALERT!!!!");
    else {
      let user = req.body;
      if (user.password) user.password = new User().generateHash(user.password);
      User.findOneAndUpdate({ _id: user._id }, user, (err, oldUser) => {
        if (err) generalFunctions.handleError(res, err);
        else res.send(true);
      });
    }
  },
  getClients: (req, res) => {
    if (req.user.role === "admin" || req.user.role === "manager") {
      User.find({ role: "client" }, (err, users) => {
        if (err) generalFunctions.handleError(res, err);
        else if (!users) generalFunctions.handleError(res, "Users not found");
        else res.send({ users, success: true });
      });
    } else {
      /*else if (req.user.role === "manager") {
			User.find({ "writer.id": req.user._id }, function(err, users) {
				if (err) {
					handleError(res, err);
				} else {
					res.send(users);
				}
			});
		} */ generalFunctions.handleError(
        res,
        "HACKER ALERT!!!!"
      );
    }
  },
  signInAsUser: (req, res) => {
    let currentUser = req.user;
    let clientUser = req.body;
    if (currentUser.role === "manager") {
      //if (String(currentUser._id) === clientUser.writer.id) {
      currentUser.signedInAsUser = {
        id: clientUser._id,
        fullName: clientUser.fullName,
      };
      Account.find({ userID: clientUser._id }, (err, accounts) => {
        currentUser
          .save()
          .then((result) =>
            res.send({ success: true, user: result, accounts })
          );
      }); /*} else {
				handleError(res, "User is a manager, but the client is not a client of this manager!");
		}*/
    } else if (currentUser.role === "admin") {
      currentUser.signedInAsUser = {
        id: clientUser._id,
        fullName: clientUser.fullName,
      };
      Account.find({ userID: clientUser._id }, (err, accounts) => {
        currentUser
          .save()
          .then((result) =>
            res.send({ success: true, user: result, accounts })
          );
      });
    } else generalFunctions.handleError(res, "HACKER ALERT!!!!");
  },
  signOutOfUserAccount: (req, res) => {
    let currentUser = req.user;
    currentUser.signedInAsUser = undefined;
    currentUser.save().then((result) => {
      res.send({ success: true, user: result });
    });
  },
  createPlan: (req, res) => {
    if (req.user.role !== "admin")
      generalFunctions.handleError(res, "HACKER ALERT!!!!");
    else {
      const newPlan = req.body;

      // Check if we are editting a plan or creating a new plan!
      if (newPlan._id) {
        Plan.updateOne({ _id: newPlan._id }, { $set: newPlan }).then(
          (result) => {
            res.send({ success: true });
          }
        );
      } else {
        Plan.find({ name: newPlan.name }, (err, plans) => {
          if (err) generalFunctions.handleError(res, err);
          else if (plans.length > 0) {
            // There is already a plan with this name!
            generalFunctions.handleError(res, "Plan already exists");
          } else {
            let plan = new Plan(newPlan);
            plan.createdBy = req.user._id;
            plan.private = true;
            plan.save().then((result) => {
              res.send({ success: true });
            });
          }
        });
      }
    }
  },
  getPlans: (req, res) => {
    if (req.user.role !== "admin")
      generalFunctions.handleError(res, "Hacker ALert");
    else {
      Plan.find({}, (err, plans) => {
        if (err) generalFunctions.handleError(res, err);
        else if (!plans) generalFunctions.handleError(res, "No plans found");
        else res.send(plans);
      });
    }
  },
  getNotifications: (req, res) => {
    Notification.find({ userID: req.user._id }, (err, notifications) => {
      Post.find({ status: "working" }, (err, posts) => {
        res.send({ notifications, posts });
      });
    });
  },
  deleteNotification: (req, res) => {
    Notification.findOne(
      { _id: req.params.notificationID },
      (err, notification) => {
        if (notification)
          notification.remove((err, result) => {
            if (err) res.send({ success: false });
            else res.send({ success: true });
          });
      }
    );
  },
};
