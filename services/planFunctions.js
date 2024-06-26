const User = require("../models/User");
const Plan = require("../models/Plan");
const keys = require("../config/keys");
const generalFunctions = require("./generalFunctions");

var stripe = require("stripe")(keys.stripeSecretKey);

module.exports = {
  getUserPlan: async (req, res) => {
    let user = req.user;
    if (user.signedInAsUser) {
      if (user.signedInAsUser.id) {
        await User.findOne(
          { _id: user.signedInAsUser.id },
          (err, signedInAsUser) => {
            if (err) generalFunctions.handleError(res, err);
            else if (signedInAsUser) user = signedInAsUser;
          }
        );
      }
    }
    if (user.plan) {
      if (user.plan.id && user.plan.id !== "none") {
        Plan.findOne({ _id: user.plan.id }, function(err, plan) {
          if (err) generalFunctions.handleError(res, err);
          else if (plan) res.send(plan);
          else if (err)
            generalFunctions.handleError(res, err, undefined, "Plan not found");
        });
      } else {
        res.send(false);
      }
    } else {
      res.send(false);
    }
  },
  signUpToPlanPro: async (req, res) => {
    let userID = req.user._id;
    let userForPlan = req.user;
    if (userForPlan.signedInAsUser) {
      if (userForPlan.signedInAsUser.id) {
        userID = userForPlan.signedInAsUser.id;
        await User.findOne({ _id: userID }, (err, signedInAsUser) => {
          if (err)
            generalFunctions.handleError(
              res,
              err,
              undefined,
              "Please reload the page and try again!"
            );
          else if (signedInAsUser) userForPlan = signedInAsUser;
        });
      }
    }

    let { annualBilling } = req.body;
    let tax = 0;
    if (req.body.stripeToken.card.country === "CA") {
      tax = 5.0;
    }

    let stripePlan = {
      name: "professionalMonthly",
      id: keys.stripeProfessionalMonthlyID
    };

    if (annualBilling) {
      stripePlan = {
        name: "professionalYearly",
        id: keys.stripeProfessionalYearlyID
      };
    }
    if (userForPlan.stripeCustomerID) {
      createStripeSubscription(userForPlan, stripePlan.id, tax, res);
    } else {
      // First create customer in stripe
      stripe.customers.create(
        {
          source: req.body.stripeToken.id,
          email: userForPlan.email
        },
        (err, customer) => {
          if (err)
            return generalFunctions.handleError(
              res,
              err,
              undefined,
              "Please reload the page and try again!"
            );
          else {
            // After user is created in stripe we want to save that ID to our platform user
            User.findOne({ _id: userForPlan._id }, (err, user) => {
              if (err)
                return generalFunctions.handleError(
                  res,
                  err,
                  undefined,
                  "Please reload the page and try again!"
                );
              else {
                user.plan = {
                  id: stripePlan.id,
                  name: stripePlan.name
                };
                user.stripeCustomerID = customer.id;

                user
                  .save()
                  .then(savedUserWithStripeCustomerID =>
                    createStripeSubscription(
                      savedUserWithStripeCustomerID,
                      stripePlan.id,
                      tax,
                      res
                    )
                  );
              }
            });
          }
        }
      );
    }
  },

  signUpToPlan: async (req, res) => {
    let sixMonthCommitment = req.body.plan.checkbox;
    let currency = "usd";
    let tax = 0;
    if (req.body.stripeToken.card.country === "CA") {
      currency = "cad";
      tax = 5.0;
    }
    let userID = req.user._id;
    let user = req.user;
    if (req.user.signedInAsUser) {
      if (req.user.signedInAsUser.id) {
        userID = req.user.signedInAsUser.id;
        await User.findOne({ _id: userID }, function(err, signedInAsUser) {
          if (err)
            return generalFunctions.handleError(
              res,
              err,
              undefined,
              "Please reload the page and try again!"
            );
          else if (signedInAsUser) user = signedInAsUser;
        });
      }
    }

    let newPlan = new Plan(req.body.plan);
    let unitsOfContent =
      newPlan.websiteBlogPosts +
      newPlan.socialPosts / 15 +
      newPlan.eBooks +
      (newPlan.instagramPosts / 15) * 2 +
      newPlan.emailNewsletters;

    // Recreate plan price because it should not come from client side
    let price;
    if (unitsOfContent > 2) {
      price = (unitsOfContent - 2) * 120 + 2 * 150;
    } else {
      price = unitsOfContent * 150;
    }
    newPlan.currency = currency;
    newPlan.price = price;

    // Check to see if plan exists
    let findPlan;
    if (user.plan) {
      if (user.plan.id && user.plan.id !== "none") {
        findPlan = { _id: String(user.plan.id) };
      } else {
        findPlan = {
          websiteBlogPosts: newPlan.websiteBlogPosts,
          socialPosts: newPlan.socialPosts,
          instagramPosts: newPlan.instagramPosts,
          emailNewsletters: newPlan.emailNewsletters,
          eBooks: newPlan.eBooks,
          currency: newPlan.currency,
          price: newPlan.price
        };
      }
    } else {
      findPlan = {
        websiteBlogPosts: newPlan.websiteBlogPosts,
        socialPosts: newPlan.socialPosts,
        instagramPosts: newPlan.instagramPosts,
        emailNewsletters: newPlan.emailNewsletters,
        eBooks: newPlan.eBooks,
        currency: newPlan.currency,
        price: newPlan.price
      };
    }

    Plan.findOne(findPlan, function(err, plan) {
      if (err)
        return generalFunctions.handleError(
          res,
          err,
          undefined,
          "Please reload the page and try again!"
        );
      else if (plan) {
        // If plan is found simply sign up user to plan
        if (plan.stripePlanID) {
          signUpUserToPlan(
            stripe,
            req.body.stripeToken,
            plan,
            res,
            req,
            sixMonthCommitment,
            user,
            tax
          );
        } else {
          stripe.plans.create(
            {
              id: String(plan._id),
              amount: plan.price * 100,
              interval: "month",
              product: { name: String(plan._id) },
              currency: currency
            },
            function(err, stripePlan) {
              if (err)
                return generalFunctions.handleError(
                  res,
                  err,
                  undefined,
                  "Please reload the page and try again!"
                );
              else {
                // Create customer in stripe
                plan.currency = currency;
                plan.stripePlanID = stripePlan.id;
                plan.save().then(savedPlanWithStripePlanID => {
                  signUpUserToPlan(
                    stripe,
                    req.body.stripeToken,
                    savedPlanWithStripePlanID,
                    res,
                    req,
                    sixMonthCommitment,
                    user,
                    tax
                  );
                });
              }
            }
          );
        }
      } else {
        // If plan is not found then we first need to create the plan in our database
        newPlan.save().then(resultNewPlan => {
          // After created in our database create it in stripe
          stripe.plans.create(
            {
              id: String(resultNewPlan._id),
              amount: resultNewPlan.price * 100,
              interval: "month",
              product: { name: String(resultNewPlan._id) },
              currency: resultNewPlan.currency
            },
            function(err, stripePlan) {
              if (err)
                return generalFunctions.handleError(
                  res,
                  err,
                  undefined,
                  "Please reload the page and try again!"
                );
              else {
                // Create customer in stripe
                resultNewPlan.stripePlanID = stripePlan.id;
                resultNewPlan.save().then(savedPlanWithStripePlanID => {
                  signUpUserToPlan(
                    stripe,
                    req.body.stripeToken,
                    savedPlanWithStripePlanID,
                    res,
                    req,
                    sixMonthCommitment,
                    user,
                    tax
                  );
                });
              }
            }
          );
        });
      }
    });
  }
};
function createStripeSubscription(user, planID, tax, res) {
  // Cancel last plan if it exists
  if (user.stripeSubscriptionID) {
    stripe.subscriptions.update(user.stripeSubscriptionID, {
      cancel_at_period_end: true
    });
  }
  // Now we have saved the customer stripe ID to this user
  // Lets finally subscribe this user to the plan
  stripe.subscriptions.create(
    {
      customer: user.stripeCustomerID,
      items: [
        {
          plan: planID
        }
      ],
      tax_percent: tax
    },
    (err, subscription) => {
      if (err)
        return generalFunctions.handleError(
          res,
          err,
          undefined,
          "Please contact our development team!"
        );
      else {
        user.stripeSubscriptionID = subscription.id;
        user.role = "client";
        user.save((err, finalUserSavedWithSubscription) => {
          res.send({
            success: true,
            message: "Success!",
            user: finalUserSavedWithSubscription
          });
        });
      }
    }
  );
}
function signUpUserToPlan(
  stripe,
  stripeToken,
  stripePlan,
  res,
  req,
  sixMonthCommitment,
  userForPlan,
  tax
) {
  // First create customer in stripe
  stripe.customers.create(
    {
      source: stripeToken.id,
      email: userForPlan.email
    },
    (err, customer) => {
      if (err)
        return generalFunctions.handleError(
          res,
          err,
          undefined,
          "Please reload the page and try again!"
        );
      else {
        let userID = userForPlan._id;

        // After user is created in stripe we want to save that ID to our platform user
        User.findOne({ _id: userID }, (err, user) => {
          if (err)
            return generalFunctions.handleError(
              res,
              err,
              undefined,
              "Please reload the page and try again!"
            );
          else {
            user.plan = { id: stripePlan._id, name: stripePlan.name };
            user.stripeCustomerID = customer.id;
            user.save().then(savedUserWithStripeCustomerID => {
              // Now we have saved the customer stripe ID to this user
              // Lets finally subscribe this user to the plan
              stripe.subscriptions.create(
                {
                  customer: savedUserWithStripeCustomerID.stripeCustomerID,
                  items: [
                    {
                      plan: String(stripePlan._id)
                    }
                  ],
                  tax_percent: tax
                },
                function(err, subscription) {
                  if (err)
                    return generalFunctions.handleError(
                      res,
                      err,
                      undefined,
                      "Please contact our development team!"
                    );
                  else {
                    savedUserWithStripeCustomerID.stripeSubscriptionID =
                      subscription.id;
                    savedUserWithStripeCustomerID.role = "client";
                    savedUserWithStripeCustomerID.save(
                      finalUserSavedWithSubscription => {
                        if (!sixMonthCommitment) {
                          stripe.charges.create(
                            {
                              amount: 20000,
                              currency: stripePlan.currency,
                              customer:
                                savedUserWithStripeCustomerID.stripeCustomerID,
                              description: "Onboarding fee"
                            },
                            function(err, charge) {
                              if (err)
                                return generalFunctions.handleError(
                                  res,
                                  err,
                                  undefined,
                                  "Please contact our development team!"
                                );
                              else {
                                res.send({
                                  success: true,
                                  message: "Success!",
                                  user: savedUserWithStripeCustomerID
                                });
                              }
                            }
                          );
                        } else {
                          res.send({
                            success: true,
                            message: "Success!",
                            user: savedUserWithStripeCustomerID
                          });
                        }
                      }
                    );
                  }
                }
              );
            });
          }
        });
      }
    }
  );
}
