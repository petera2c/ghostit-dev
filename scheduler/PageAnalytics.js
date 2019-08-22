const Account = require("../models/Account");

const {
  requestAllFacebookPageAnalytics
} = require("../services/analyticsFunctions");

const { fbAccountRequest, instagramAccountRequest } = require("../constants");

module.exports = {
  main: () => {
    Account.find({}, (err, accounts) => {
      if (err || !accounts) {
      }
      const socialIDs = [];
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        if (account.socialID) {
          if (socialIDs.includes(account.socialID)) {
            // don't fetch analytics data twice for the same account
            continue;
          }
          socialIDs.push(account.socialID);
          if (
            account.socialType === "facebook" &&
            account.accountType === "page"
          ) {
            requestAllFacebookPageAnalytics(
              account,
              fbAccountRequest + "last_3d"
            );
          } else if (
            account.socialType === "instagram" &&
            account.accountType === "page"
          ) {
            requestAllFacebookPageAnalytics(account, instagramAccountRequest);
          }
        }
      }
    });
  }
};
