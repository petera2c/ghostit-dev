const User = require("../models/User");
const Calendar = require("../models/Calendar");
const Blog = require("../models/Blog");
const Post = require("../models/Post");
const Newsletter = require("../models/Newsletter");
const Campaign = require("../models/Campaign");

const generalFunctions = require("./generalFunctions");

mongoIdArrayIncludes = (array, id) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i].equals(id)) {
      return true;
    }
  }
  return false;
};

fillCampaignPosts = async (res, campaigns) => {
  let campaignArray = [];

  if (campaigns.length != 0) {
    for (let index in campaigns) {
      let campaign = campaigns[index];
      await Post.find({ _id: { $in: campaign.posts } }, (err, posts) => {
        if (err) generalFunctions.handleError(res, err);
        else {
          campaignArray.push({ campaign, posts });
          if (index == campaigns.length - 1) {
            return res.send({
              success: true,
              campaigns: campaignArray
            });
          }
        }
      });
    }
  } else {
    return res.send({
      success: true,
      campaigns: []
    });
  }
};

module.exports = {
  getCalendars: function(req, res) {
    // get all calendars that the user is subscribed to
    // res.send({ success: true, calendars, defaultCalendarID });
    let userID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
      }
    }
    Calendar.find({ userIDs: userID }, (err, foundCalendars) => {
      if (err || !foundCalendars) {
        res.send({
          success: false,
          err,
          message: `error occurred when trying to fetch calendars associated with user id ${userID}`
        });
      } else {
        if (foundCalendars.length === 0) {
          // this user doesnt have a calendar yet so we need to make them one
          const newCalendar = new Calendar();
          newCalendar.adminID = userID;
          newCalendar.userIDs = [userID];
          newCalendar.personalCalendar = true;
          newCalendar.calendarName = "Personal Calendar";
          // need to set the user's defaultCalendarID
          User.findOne({ _id: userID }, (err, foundUser) => {
            if (err || !foundUser) {
              res.send({
                success: false,
                err,
                message: `error occurred when trying to fetch user with id ${userID} in an attempt to save its first calendar.`
              });
            } else {
              foundUser.defaultCalendarID = newCalendar._id;
              foundUser.save();
              newCalendar.save();
              res.send({
                success: true,
                calendars: [newCalendar],
                defaultCalendarID: newCalendar._id
              });
            }
          });
        } else {
          User.findOne({ _id: userID }, (err, foundUser) => {
            if (err || !foundUser) {
              res.send({
                success: false,
                err,
                message: `error occurred when trying to fetch user with id ${userID} in an attempt to get its defaultCalendarID`
              });
            } else {
              res.send({
                success: true,
                calendars: foundCalendars,
                defaultCalendarID: foundUser.defaultCalendarID
              });
            }
          });
        }
      }
    });
  },
  getPosts: function(req, res) {
    // Get all posts for user
    let userID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
      }
    }

    Calendar.findOne({ _id: req.params.calendarID }, (err, foundCalendar) => {
      if (err || !foundCalendar) {
        res.send({
          success: false,
          err,
          message: `Error occurred when attempting to fetch calendar with id ${
            req.params.calendarID
          }`
        });
      } else {
        if (!mongoIdArrayIncludes(foundCalendar.userIDs, userID)) {
          res.send({
            success: false,
            message: `Calendar with id ${
              req.params.calendarID
            } does not have user id ${userID} as one of its authorized users.`
          });
        } else {
          // calendar is found and associated with correct userID
          // now we fetch all the posts associated with that calendar
          // if the calendar is their Personal calendar, we also fetch all posts with
          // calendarID: undefined, and userID: userID
          // this allows older posts that don't have a calendarID to be associated with their personal calendar
          Post.find(
            { calendarID: req.params.calendarID, campaignID: undefined },
            (err, foundPosts) => {
              if (err || !foundPosts) {
                res.send({
                  success: false,
                  err,
                  message: `Calendar with id ${
                    req.params.calendarID
                  } found and user with id ${userID} is subscribed to it. However, an error occurred when fetching all posts associated with the calendar.`
                });
              } else {
                // foundPosts is all posts associated with the calendar
                if (foundCalendar.personalCalendar) {
                  // this calendar is the user's personal calendar so we need to also fetch all posts
                  // with userID: userID and calendarID: undefined
                  Post.find(
                    {
                      userID: userID,
                      calendarID: undefined,
                      campaignID: undefined
                    },
                    (err, foundUserPosts) => {
                      if (err || !foundUserPosts) {
                        res.send({
                          success: false,
                          err,
                          message: `Error occurred when trying to fetch all posts with user id ${userID} and calendarID: undefined.`
                        });
                      } else {
                        res.send({
                          success: true,
                          posts: [...foundPosts, ...foundUserPosts]
                        });
                      }
                    }
                  );
                } else {
                  res.send({
                    success: true,
                    posts: foundPosts
                  });
                }
              }
            }
          );
        }
      }
    });
  },
  getBlogs: function(req, res) {
    // Get all blogs for user
    let userID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
      }
    }

    Calendar.findOne({ _id: req.params.calendarID }, (err, foundCalendar) => {
      if (err || !foundCalendar) {
        res.send({
          success: false,
          err,
          message: `Error occurred when attempting to fetch calendar with id ${
            req.params.calendarID
          }`
        });
      } else {
        if (!mongoIdArrayIncludes(foundCalendar.userIDs, userID)) {
          res.send({
            success: false,
            message: `Calendar with id ${
              req.params.calendarID
            } does not have user id ${userID} as one of its authorized users.`
          });
        } else {
          Blog.find(
            { calendarID: req.params.calendarID },
            (err, foundBlogs) => {
              if (err || !foundBlogs) {
                res.send({
                  success: false,
                  err,
                  message: `Calendar with id ${
                    req.params.calendarID
                  } found and user with id ${userID} is subscribed to it. However, an error occurred when fetching all blogs associated with the calendar.`
                });
              } else {
                // foundBlogs is all blogs associated with the calendar
                if (foundCalendar.personalCalendar) {
                  // this calendar is the user's personal calendar so we need to also fetch all blogs
                  // with userID: userID and calendarID: undefined
                  Blog.find(
                    { userID: userID, calendarID: undefined },
                    (err, foundUserBlogs) => {
                      if (err || !foundUserBlogs) {
                        res.send({
                          success: false,
                          err,
                          message: `Error occurred when trying to fetch all blogs with user id ${userID} and calendarID: undefined.`
                        });
                      } else {
                        res.send({
                          success: true,
                          blogs: [...foundBlogs, ...foundUserBlogs]
                        });
                      }
                    }
                  );
                } else {
                  res.send({
                    success: true,
                    blogs: foundBlogs
                  });
                }
              }
            }
          );
        }
      }
    });
  },
  getNewsletters: function(req, res) {
    // Get all newsletters for user
    let userID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
      }
    }

    Calendar.findOne({ _id: req.params.calendarID }, (err, foundCalendar) => {
      if (err || !foundCalendar) {
        res.send({
          success: false,
          err,
          message: `Error occurred when attempting to fetch calendar with id ${
            req.params.calendarID
          }`
        });
      } else {
        if (!mongoIdArrayIncludes(foundCalendar.userIDs, userID)) {
          res.send({
            success: false,
            message: `Calendar with id ${
              req.params.calendarID
            } does not have user id ${userID} as one of its authorized users.`
          });
        } else {
          Newsletter.find(
            { calendarID: req.params.calendarID },
            (err, foundNewsletters) => {
              if (err || !foundNewsletters) {
                res.send({
                  success: false,
                  err,
                  message: `Calendar with id ${
                    req.params.calendarID
                  } found and user with id ${userID} is subscribed to it. However, an error occurred when fetching all newsletters associated with the calendar.`
                });
              } else {
                // foundNewsletters is all newsletters associated with the calendar
                if (foundCalendar.personalCalendar) {
                  // this calendar is the user's personal calendar so we need to also fetch all newsletters
                  // with userID: userID and calendarID: undefined
                  Newsletter.find(
                    { userID: userID, calendarID: undefined },
                    (err, foundUserNewsletters) => {
                      if (err || !foundUserNewsletters) {
                        res.send({
                          success: false,
                          err,
                          message: `Error occurred when trying to fetch all newsletters with user id ${userID} and calendarID: undefined.`
                        });
                      } else {
                        res.send({
                          success: true,
                          newsletters: [
                            ...foundNewsletters,
                            ...foundUserNewsletters
                          ]
                        });
                      }
                    }
                  );
                } else {
                  res.send({
                    success: true,
                    newsletters: foundNewsletters
                  });
                }
              }
            }
          );
        }
      }
    });
  },
  getCampaigns: function(req, res) {
    // Get all campaigns for user
    let userID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
      }
    }

    Calendar.findOne({ _id: req.params.calendarID }, (err, foundCalendar) => {
      if (err || !foundCalendar) {
        res.send({
          success: false,
          err,
          message: `Error occurred when attempting to fetch calendar with id ${
            req.params.calendarID
          }`
        });
      } else {
        if (!mongoIdArrayIncludes(foundCalendar.userIDs, userID)) {
          res.send({
            success: false,
            message: `Calendar with id ${
              req.params.calendarID
            } does not have user id ${userID} as one of its authorized users.`
          });
        } else {
          Campaign.find(
            { calendarID: req.params.calendarID },
            (err, foundCampaigns) => {
              if (err || !foundCampaigns) {
                res.send({
                  success: false,
                  err,
                  message: `Calendar with id ${
                    req.params.calendarID
                  } found and user with id ${userID} is subscribed to it. However, an error occurred when fetching all campaigns associated with the calendar.`
                });
              } else {
                // foundCampaigns is all campaigns associated with the calendar
                if (foundCalendar.personalCalendar) {
                  // this calendar is the user's personal calendar so we need to also fetch all campaigns
                  // with userID: userID and calendarID: undefined
                  Campaign.find(
                    { userID: userID, calendarID: undefined },
                    (err, foundUserCampaigns) => {
                      if (err || !foundUserCampaigns) {
                        res.send({
                          success: false,
                          err,
                          message: `Error occurred when trying to fetch all campaigns with user id ${userID} and calendarID: undefined.`
                        });
                      } else {
                        fillCampaignPosts(res, [
                          ...foundCampaigns,
                          ...foundUserCampaigns
                        ]);
                      }
                    }
                  );
                } else {
                  fillCampaignPosts(res, foundCampaigns);
                }
              }
            }
          );
        }
      }
    });
  },
  createNewCalendar: function(req, res) {
    let userID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
      }
    }

    const newCalendar = new Calendar();
    newCalendar.calendarName = req.body.name;
    newCalendar.adminID = userID;
    newCalendar.userIDs = [userID];
    newCalendar.personalCalendar = false;

    newCalendar.save().then(() => {
      res.send({ success: true, newCalendar });
    });
  },
  getUsers: function(req, res) {
    // return a list of the users (including their names and emails) associated with a calendar
    // this function is used for the Manage Calendar modal to display the users of a calendar
    const id = req.params.calendarID;

    Calendar.findOne({ _id: id }, (err, foundCalendar) => {
      if (err || !foundCalendar) {
        res.send({
          success: false,
          err,
          message: `Unable to find calendar with id ${id}.`
        });
      } else {
        // find all users that are in the calendar's userIDs array
        // make an array to be used with the mongodb $or operator
        const userIDList = foundCalendar.userIDs.map(userID => {
          return { _id: userID };
        });
        User.find({ $or: userIDList }, "fullName email", (err, foundUsers) => {
          if (err || !foundUsers) {
            res.send({
              success: false,
              err,
              message: `Unable to find users subscribed to calendar with id ${id}`
            });
          } else {
            res.send({ success: true, users: foundUsers });
          }
        });
      }
    });
  },
  getAccounts: function(req, res) {
    res.send({ success: true });
  },
  inviteUser: function(req, res) {
    const { email, calendarID } = req.body;
    let userID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
      }
    }

    Calendar.findOne({ _id: calendarID }, (err, foundCalendar) => {
      if (err || !foundCalendar) {
        res.send({
          success: false,
          err,
          message: `Unable to find calendar with id ${calendarID}`
        });
      } else {
        if (!mongoIdArrayIncludes(foundCalendar.userIDs, userID)) {
          res.send({
            success: false,
            message: `User attempting to send invitation is not a valid member of the calendar. userID: ${userID}, calendarID: ${calendarID}.`
          });
        } else {
          if (foundCalendar.emailsInvited.includes(email)) {
            res.send({
              success: false,
              message: `${email} has already been invited to this calendar.`
            });
          } else {
            User.findOne({ email }, (err, foundUser) => {
              if (err) {
                res.send({
                  success: false,
                  err,
                  message: `Error while looking for user with email ${email}. Try again.`
                });
              } else {
                if (
                  foundUser &&
                  mongoIdArrayIncludes(foundCalendar.userIDs, foundUser._id)
                ) {
                  res.send({
                    success: false,
                    message: `User with email ${email} is already a member of this calendar.`
                  });
                } else {
                  foundCalendar.emailsInvited.push(email);
                  foundCalendar.save();
                  res.send({
                    success: true,
                    emailsInvited: foundCalendar.emailsInvited
                  });
                }
              }
            });
          }
        }
      }
    });
  },
  getCalendarInvites: function(req, res) {
    let userID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
      }
    }

    User.findOne({ _id: userID }, (err, foundUser) => {
      if (err || !foundUser) {
        res.send({
          success: false,
          err,
          message: `Error while searching for user with ID ${userID}.`
        });
      } else {
        const email = foundUser.email;

        Calendar.find({ emailsInvited: email }, (err, foundCalendars) => {
          if (err || !foundCalendars) {
            res.send({
              success: false,
              err,
              message: `Error while searching for calendars with ${email} invited.`
            });
          } else {
            res.send({ success: true, calendars: foundCalendars });
          }
        });
      }
    });
  },
  calendarInviteResponse: function(req, res) {
    const { calendarID, response } = req.body;
    let userID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
      }
    }

    User.findOne({ _id: userID }, (err, foundUser) => {
      if (err || !foundUser) {
        res.send({
          success: false,
          err,
          message: `Error while searching for user with ID ${userID}.`
        });
      } else {
        const email = foundUser.email;

        Calendar.findOne({ _id: calendarID }, (err, foundCalendar) => {
          if (err || !foundCalendar) {
            res.send({
              success: false,
              err,
              message: `Error while searching for calendar with ID ${calendarID}.`
            });
          } else {
            const inviteIndex = foundCalendar.emailsInvited.indexOf(email);
            if (inviteIndex === -1) {
              res.send({
                success: false,
                message: `Calendar with id ${calendarID} does not have ${email} in its list of invited emails.`
              });
            } else {
              foundCalendar.emailsInvited.splice(inviteIndex, 1); // remove the email from the invited list
              if (response === true) {
                foundCalendar.userIDs.push(foundUser._id); // response is true so add userID to the calendar's userID list
              }
              foundCalendar.save();
              res.send({ success: true, calendar: foundCalendar });
            }
          }
        });
      }
    });
  },
  renameCalendar: function(req, res) {
    const { calendarID, name } = req.body;

    if (!name || name.length < 1) {
      res.send({ success: false, message: "Calendar names cannot be empty." });
    } else {
      Calendar.findOne({ _id: calendarID }, (err, foundCalendar) => {
        if (err || !foundCalendar) {
          res.send({
            success: false,
            err,
            message: `Error while fetching calendar with id ${calendarID}.`
          });
        } else {
          foundCalendar.calendarName = name;
          foundCalendar.save();
          res.send({ success: true, calendar: foundCalendar });
        }
      });
    }
  },
  removeUserFromCalendar: function(req, res) {
    const { userID, calendarID } = req.body;
    let thisUserID = req.user._id;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        thisUserID = req.user.signedInAsUser.id;
      }
    }

    Calendar.findOne({ _id: calendarID }, (err, foundCalendar) => {
      if (err || !foundCalendar) {
        res.send({
          success: false,
          err,
          message: `Failed to find user with id ${userID} in the database. Try again or reload your page.`
        });
      } else {
        if (foundCalendar.adminID.toString() !== thisUserID.toString()) {
          res.send({
            success: false,
            message: `Only admins can remove users from a calendar. Reload your page if you are the admin of this calendar.`
          });
        } else {
          const userIndex = foundCalendar.userIDs.indexOf(userID);
          if (userIndex === -1) {
            res.send({
              success: false,
              message: `Unable to find user in this calendar's user list. Try reloading your page.`
            });
          } else {
            foundCalendar.userIDs.splice(userIndex, 1);
            foundCalendar.save();
            res.send({ success: true });
          }
        }
      }
    });
  }
};
