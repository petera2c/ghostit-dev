const passport = require("passport");
const FB = require("fb");
const s3Proxy = require("s3-proxy");
const multipart = require("connect-multiparty");

const User = require("./models/User");
const Account = require("./models/Account");
const Post = require("./models/Post");

const fileParser = multipart();

const facebookFunctions = require("./services/facebookFunctions");
const linkedinFunctions = require("./services/linkedinFunctions");
const accountFunctions = require("./services/accountFunctions");
const userFunctions = require("./services/userFunctions");
const postFunctions = require("./services/postFunctions");
const campaignFunctions = require("./services/campaignFunctions");
const strategyFunctions = require("./services/strategyFunctions");
const adminFunctions = require("./services/adminFunctions");
const planFunctions = require("./services/planFunctions");
const writersBriefFunctions = require("./services/writersBriefFunctions");
const SendMailFunctions = require("./MailFiles/SendMailFunctions");
const analyticsFunctions = require("./services/analyticsFunctions");
const calendarFunctions = require("./services/calendarFunctions");
const ghostitBlogFunctions = require("./services/ghostitBlogFunctions");

const {
  amazonAccessKeyID,
  amazonSecretAccessKey,
  amazonBucket,
} = require("./config/keys");

module.exports = (app) => {
  const middleware = (req, res, next) => {
    if (!req.user) {
      res.send({ success: false, loggedIn: false });
      return;
    }
    next();
  };

  app.get(
    "/sitemap.xml",
    s3Proxy({
      bucket: amazonBucket,
      accessKeyId: amazonAccessKeyID,
      secretAccessKey: amazonSecretAccessKey,
      overrideCacheControl: "max-age=100000",
      defaultKey: "sitemap.xml",
    })
  );

  // Login user
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local-login", (err, user, message) => {
      let success = true;

      if (err) success = false;
      if (!user) success = false;

      if (success) {
        req.logIn(user, (err) => {
          if (err) {
            success = false;
            message =
              "Could not log you in! :( Please refresh the page and try again :)";
          }
          res.send({ success, user, message });
        });
      } else {
        res.send({ success, message });
      }
    })(req, res, next);
  });
  // Register user
  app.post("/api/register", (req, res, next) => {
    passport.authenticate("local-signup", (notUsed, user, message) => {
      let success = true;
      if (!user) success = false;
      if (success) {
        req.logIn(user, (err) => {
          if (err) {
            success = false;
            message =
              "Could not log you in! :( Please refresh the page and try again :)";
          }
          res.send({ success, user, message });
        });
      } else {
        res.send({ success, message });
      }
    })(req, res, next);
  });
  // Update user account
  app.post("/api/user/:userID", middleware, (req, res) =>
    userFunctions.updateUser(req, res)
  );
  // Get current user
  app.get("/api/user", middleware, (req, res) =>
    userFunctions.currentUser(req, res)
  );

  app.post("/api/book-a-call", SendMailFunctions.bookCall);

  // Get user invoices
  app.get("/api/user/invoices", middleware, (req, res) =>
    userFunctions.userInvoices(req, res)
  );
  // Logout user
  app.get("/api/logout", middleware, (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.send({ success: true });
    });
  });

  // Middleware check
  app.get("/api/isUserSignedIn", middleware, (req, res) => {
    if (req.user) {
      res.send({ success: true, user: req.user });
    } else {
      res.send({ success: false });
    }
  });

  // Save account to database
  app.post("/api/account", middleware, (req, res) =>
    accountFunctions.saveAccount(req, res)
  );
  // Delete account
  app.delete("/api/account/:accountID", middleware, (req, res) =>
    accountFunctions.disconnectAccount(req, res)
  );
  // Get all accounts that a user has connected
  app.get("/api/accounts", middleware, (req, res) =>
    accountFunctions.getAccounts(req, res)
  );
  // Get all accounts that a user has access to through calendars
  app.get("/api/accounts/all", middleware, (req, res) =>
    calendarFunctions.getAllAccounts(req, res)
  );

  // Add Facebook profile
  app.get(
    "/api/facebook",
    passport.authenticate("facebook", {
      scope: [
        "public_profile",
        "email",
        "publish_pages",
        "manage_pages",
        "read_insights",
        "instagram_basic",
        "instagram_manage_insights",
      ],
    })
  );
  app.get(
    "/api/facebook/callback",
    passport.authenticate("facebook", {
      successRedirect: "/social-accounts/connected",
      failureRedirect: "/social-accounts/failed",
    })
  );

  app.get("/api/facebook/post/analytics/:postID", middleware, (req, res) => {
    analyticsFunctions.getPostAnalytics(req, res);
  });

  // Add Twitter account
  app.get("/api/twitter", passport.authenticate("twitter"));
  // Twitter callback
  app.get(
    "/api/twitter/callback",
    passport.authenticate("twitter", {
      successRedirect: "/social-accounts/connected",
      failureRedirect: "/social-accounts/failed",
    })
  );

  // Get Facebook pages of profile accounts
  app.get("/api/facebook/pages", middleware, (req, res) =>
    facebookFunctions.getFacebookPages(req, res)
  );
  // Get Facebook groups of profile accounts
  app.get("/api/facebook/groups", middleware, (req, res) =>
    facebookFunctions.getFacebookGroups(req, res)
  );
  // Get Instagram pages
  app.get("/api/instagram/pages", middleware, (req, res) =>
    facebookFunctions.getInstagramPages(req, res)
  );

  // Add Linkedin account
  app.get("/api/linkedin", middleware, (req, res) =>
    linkedinFunctions.getLinkedinCode(req, res)
  );
  // Linkedin callback
  app.get("/api/linkedin/callback", middleware, (req, res) =>
    linkedinFunctions.getLinkedinAccessToken(req, res)
  );
  // Get Linkedin pages of profile account
  app.get("/api/linkedin/pages", middleware, (req, res) =>
    linkedinFunctions.getLinkedinPages(req, res)
  );

  // Get images from a URL and send back to client
  app.post("/api/link", middleware, (req, res) =>
    postFunctions.getImagesFromUrl(req, res)
  );

  // Save post
  app.post("/api/post", middleware, (req, res) =>
    postFunctions.savePost(req, res)
  );
  // Get post
  app.get("/api/post/:postID", middleware, (req, res) =>
    postFunctions.getPost(req, res)
  );
  // Update post
  app.post("/api/post/update/:postID", middleware, (req, res) =>
    postFunctions.updatePost(req, res)
  );
  // Delete post
  app.delete("/api/post/delete/:postID", middleware, (req, res) =>
    postFunctions.deletePost(req, res)
  );
  // Save post files
  app.post("/api/post/files", fileParser, middleware, async (req, res) =>
    postFunctions.uploadPostFiles(req, res)
  );
  // Delete post files
  app.post("/api/post/delete/files/:postID", middleware, (req, res) =>
    postFunctions.deletePostFiles(req, res)
  );

  // Save campaign as recipe
  app.post("/api/recipe", middleware, (req, res) =>
    campaignFunctions.saveRecipe(req, res)
  );
  // Get all recipes
  app.get("/api/recipes", middleware, (req, res) =>
    campaignFunctions.getRecipes(req, res)
  );
  app.delete("/api/recipe/:recipeID", middleware, (req, res) =>
    campaignFunctions.deleteRecipe(req, res)
  );

  // Delete file in cloudinary using pulbic id
  app.delete("/api/delete/file/:publicID", middleware, (req, res) =>
    postFunctions.deleteFile(req, res)
  );

  // Create or update user's strategy
  app.post("/api/strategy", middleware, (req, res) =>
    strategyFunctions.saveStrategy(req, res)
  );
  app.get("/api/strategy", middleware, (req, res) =>
    strategyFunctions.getStrategy(req, res)
  );

  // Get public plans
  app.get("/api/user/plan", middleware, (req, res) =>
    planFunctions.getUserPlan(req, res)
  );
  // Sign up to plan
  app.post("/api/signUpToPlan", middleware, (req, res) =>
    planFunctions.signUpToPlan(req, res)
  );
  // Sign up to plan
  app.post("/api/planPro", middleware, (req, res) =>
    planFunctions.signUpToPlanPro(req, res)
  );

  // Get proper timezone, either yours or the user you are signed in as
  app.get("/api/timezone", middleware, (req, res) =>
    userFunctions.getTimezone(req, res)
  );

  // Save writers brief
  app.post("/api/writersBrief", middleware, (req, res) =>
    writersBriefFunctions.saveWritersBrief(req, res)
  );
  // Get all placeholder blogs in writers brief
  app.post("/api/blogsInBriefs", middleware, (req, res) =>
    writersBriefFunctions.getBlogsInBriefs(req, res)
  );
  // Get all placeholder newsletters in writers brief
  app.post("/api/newslettersInBriefs", middleware, (req, res) =>
    writersBriefFunctions.getNewslettersInBriefs(req, res)
  );
  // Get all writers briefs
  app.get("/api/writersBriefs", middleware, (req, res) =>
    writersBriefFunctions.getWritersBriefs(req, res)
  );

  // Send email
  app.post("/api/email/reset", (req, res) =>
    SendMailFunctions.sendPasswordReset(req, res)
  );

  app.post("/api/ghostit/blogs", (req, res) =>
    ghostitBlogFunctions.getGhostitBlogs(req, res)
  );
  app.get("/api/ghostit-blogs-team/:authorID", (req, res) =>
    ghostitBlogFunctions.getTeamMemberGhostitBlogs(req, res)
  );

  app.get("/api/ghostit/blog/:url", (req, res) =>
    ghostitBlogFunctions.getGhostitBlog(req, res)
  );
  app.get("/api/ghostit/blog/edit/:id", (req, res) =>
    ghostitBlogFunctions.getGhostitBlogEdit(req, res)
  );
  // Admin routes!!!!!

  app.post("/api/ghostit/blog", (req, res) =>
    ghostitBlogFunctions.saveGhostitBlog(req, res)
  );

  // Get all notifications
  // Currently in dev
  app.get("/api/notifications", middleware, (req, res) =>
    adminFunctions.getNotifications(req, res)
  );
  // Delete notification
  app.delete("/api/notification/:notificationID", middleware, (req, res) =>
    adminFunctions.deleteNotification(req, res)
  );

  // Get all users
  app.get("/api/users", middleware, (req, res) =>
    adminFunctions.getUsers(req, res)
  );
  // Admin update user
  app.post("/api/updateUser", middleware, (req, res) =>
    adminFunctions.updateUser(req, res)
  );
  // Get clients
  app.get("/api/clients", middleware, (req, res) =>
    adminFunctions.getClients(req, res)
  );
  // Sign in as user
  app.post("/api/signInAsUser", middleware, (req, res) =>
    adminFunctions.signInAsUser(req, res)
  );
  // Sign out as user
  app.get("/api/signOutOfUserAccount", middleware, (req, res) =>
    adminFunctions.signOutOfUserAccount(req, res)
  );
  // Create a plan
  app.post("/api/plan", middleware, (req, res) =>
    adminFunctions.createPlan(req, res)
  );
  // Get plans
  app.get("/api/plans", middleware, (req, res) =>
    adminFunctions.getPlans(req, res)
  );

  app.get("/api/analytics/:accountSocialID", middleware, (req, res) => {
    analyticsFunctions.getAllAccountAnalytics(req, res);
  });

  app.get("/api/analytics/posts", middleware, (req, res) => {
    analyticsFunctions.getAllPostAnalytics(req, res);
  });

  app.get("/api/calendars", middleware, (req, res) =>
    calendarFunctions.getCalendars(req, res)
  );

  app.post("/api/calendar/posts/:calendarID", middleware, (req, res) =>
    calendarFunctions.getPosts(req, res)
  );

  app.get("/api/calendar/campaigns/:calendarID", middleware, (req, res) =>
    calendarFunctions.getCampaigns(req, res)
  );

  app.post("/api/calendars/new", middleware, (req, res) =>
    calendarFunctions.createNewCalendar(req, res)
  );

  app.get("/api/calendar/users/:calendarID", middleware, (req, res) =>
    calendarFunctions.getUsers(req, res)
  );

  app.post("/api/calendar/invite", middleware, (req, res) =>
    calendarFunctions.inviteUser(req, res)
  );

  app.get("/api/calendars/invites", middleware, (req, res) =>
    calendarFunctions.getCalendarInvites(req, res)
  );

  app.post("/api/calendars/invites/response", middleware, (req, res) =>
    calendarFunctions.calendarInviteResponse(req, res)
  );

  app.post("/api/calendar/rename", middleware, (req, res) =>
    calendarFunctions.renameCalendar(req, res)
  );

  app.post("/api/calendar/user/remove", middleware, (req, res) =>
    calendarFunctions.removeUserFromCalendar(req, res)
  );

  app.post("/api/calendar/user/promote", middleware, (req, res) =>
    calendarFunctions.promoteUser(req, res)
  );

  app.post("/api/calendar/delete", middleware, (req, res) =>
    calendarFunctions.deleteCalendar(req, res)
  );

  app.post("/api/calendar/setDefault", middleware, (req, res) =>
    calendarFunctions.setDefaultCalendar(req, res)
  );

  app.get("/api/calendar/accounts/:calendarID", middleware, (req, res) =>
    calendarFunctions.getSocialAccounts(req, res)
  );

  app.get("/api/calendar/accounts/extra/:calendarID", middleware, (req, res) =>
    calendarFunctions.getSocialAccountsExtra(req, res)
  );

  app.post("/api/calendar/account", middleware, (req, res) =>
    calendarFunctions.linkSocialAccount(req, res)
  );

  app.post("/api/calendar/account/delete", middleware, (req, res) =>
    calendarFunctions.unlinkSocialAccount(req, res)
  );

  app.post("/api/calendar/leave", middleware, (req, res) =>
    calendarFunctions.leaveCalendar(req, res)
  );

  app.post("/api/calendar/remove/invitation", middleware, (req, res) =>
    calendarFunctions.removePendingEmail(req, res)
  );

  app.post("/api/notifications", middleware, (req, res) =>
    notificationFunctions.getNotifications(req, res)
  );
};
