const Post = require("../models/Post");
const Account = require("../models/Account");
const { savePostError, savePostSuccessfully } = require("./functions");
const keys = require("../config/keys");

const request = require("request");
const http = require("http");
const fs = require("fs");
const FormData = require("form-data");

const cloudinary = require("cloudinary");
const FBVideoUpload = require("facebook-api-video-upload");
const FB = require("fb");
const axios = require("axios");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const fetch = require("node-fetch");

const { whatFileTypeIsString, isUrlImage, isUrlVideo } = require("../util");
const deletePostFromFacebook = (post, account) => {
  if (post.socialMediaID) {
    FB.setAccessToken(account.accessToken);

    FB.api(post.socialMediaID, "delete", res => {
      if (!res || res.error) {
        console.log(!res ? "error occurred" : res.error);
        return;
      }
      console.log("Post was deleted");
    });
  }
};
module.exports = {
  postToProfileOrPage: post => {
    try {
      Account.findOne(
        {
          socialID: post.accountID
        },
        async (err, account) => {
          if (err) {
            console.log(err);
            savePostError(post._id, err);
            return;
          }
          if (account) {
            // Use facebook profile access token to get account groups

            if (post.files.length !== 0) {
              let facebookPostWithFile = {};
              // Set non-null information to facebook post
              if (post.content !== "") {
                facebookPostWithFile.message = post.content;
              }

              let asyncCounter = 0;
              const facebookPhotoArray = [];
              for (let i = 0; i < post.files.length; i++) {
                if (!post.files[i].url) {
                  asyncCounter--;
                  continue;
                }

                asyncCounter++;

                if (isUrlVideo(post.files[i].url)) {
                  const link = post.files[i].url;

                  const stream = fs.createReadStream(link);

                  const VideoData = {
                    token: account.accessToken,
                    id: account.socialID,
                    stream,
                    title: post.videoTitle,
                    description: post.content
                  };

                  FBVideoUpload(VideoData)
                    .then(res => {
                      asyncCounter--;

                      if (!res || res.error) {
                        savePostError(post._id, res.error);
                      } else {
                        //  facebookPhotoArray.push({ media_fbid: res.video_id });

                        if (!res || res.error) {
                          savePostError(post._id, res.error);
                        } else {
                          savePostSuccessfully(post._id, res.video_id);
                        }
                      }
                    })
                    .catch(e => savePostError(post._id, e));
                  fs.unlinkSync(link);
                } else {
                  FB.setAccessToken(account.accessToken);

                  FB.api(
                    "me/photos",
                    "post",
                    { url: post.files[i].url, published: false },
                    res => {
                      asyncCounter--;

                      facebookPhotoArray.push({ media_fbid: res.id });

                      if (asyncCounter === 0) {
                        facebookPostWithFile.attached_media = facebookPhotoArray;
                        FB.setAccessToken(account.accessToken);
                        FB.api("me/feed", "post", facebookPostWithFile, res => {
                          if (!res || res.error) {
                            savePostError(post._id, res.error);
                          } else {
                            savePostSuccessfully(post._id, res.id);
                          }
                        });
                      }
                    }
                  );
                }
              }
            } else {
              let facebookPostNoFile = {};
              // Set non-null information to facebook post
              if (post.content !== "") {
                facebookPostNoFile.message = post.content;
              }
              if (post.link !== "") {
                facebookPostNoFile.link = post.link;
              }
              FB.setAccessToken(account.accessToken);
              FB.api("me/feed", "post", facebookPostNoFile, res => {
                if (!res || res.error) {
                  savePostError(post._id, res.error);
                } else {
                  savePostSuccessfully(post._id, res.id);
                }
              });
            }
          } else {
            savePostError(post._id, "Account not found!");
          }
        }
      );
    } catch (e) {
      console.log(e);
      savePostError(post._id, e);
    }
  },
  postToGroup: post => {
    Account.findOne(
      {
        socialID: post.accountID
      },
      async (err, account) => {
        if (err) return console.log(err);
        if (account) {
          // Use facebook profile access token to get account groups
          FB.setAccessToken(account.accessToken);

          if (post.files.length !== 0) {
            let facebookPostWithFile = {};
            // Set non-null information to facebook post
            if (post.content !== "") {
              facebookPostWithFile.message = post.content;
            }
            for (let i = 0; i < post.files.length; i++) {
              facebookPostWithFile.link = post.files[i].url;

              FB.api(
                `${account.socialID}/photos`,
                "post",
                { url: post.files[i].url, published: false },
                res => {
                  asyncCounter--;

                  facebookPhotoArray.push({ media_fbid: res.id });

                  if (asyncCounter === 0) {
                    facebookPostWithFile.attached_media = facebookPhotoArray;
                    FB.setAccessToken(account.accessToken);
                    FB.api(
                      `${account.socialID}/feed`,
                      "post",
                      facebookPostWithFile,
                      res => {
                        if (!res || res.error) {
                          savePostError(post._id, res.error);
                        } else {
                          savePostSuccessfully(post._id, res.id);
                        }
                      }
                    );
                  }
                }
              );
            }
          } else {
            let facebookPostNoFile = {};
            // Set non-null information to facebook post
            if (post.content !== "") {
              facebookPostNoFile.message = post.content;
            }
            if (post.link !== "") {
              facebookPostNoFile.link = post.link;
            }
            FB.api(
              "/" + account.socialID + "/feed",
              "post",
              facebookPostNoFile,
              res => {
                if (!res || res.error) {
                  savePostError(post._id, res.error);
                } else {
                  savePostSuccessfully(post._id, res.id);
                }
              }
            );
          }
        } else {
          savePostError(post._id, "Account not found!");
        }
      }
    );
  },
  renewAuthToken: accounts => {
    const account = accounts[0];
    getFbCode(account, accounts, 0, accessTokenCallback);
  },
  renewPageToken: accounts => {
    const account = accounts[0];
    getFbCode(account, accounts, 0, pageTokenCallback);
  }
};
function getFbCode(account, accounts, counter, callback) {
  FB.api(
    "oauth/client_code",
    {
      client_id: keys.fbClientID,
      client_secret: keys.fbClientSecret,
      redirect_uri: keys.fbCallbackUrl,
      access_token: account.accessToken
    },
    codeResult => {
      if (!codeResult.code) {
        console.log(codeResult);
        return;
      }
      tradeCodeForToken(codeResult, account, accounts, counter, callback);
    }
  );
}

function tradeCodeForToken(codeResult, account, accounts, counter, callback) {
  FB.api(
    "oauth/access_token",
    {
      client_id: keys.fbClientID,
      redirect_uri: keys.fbCallbackUrl,
      code: codeResult.code
    },
    function(tokenResult) {
      if (!tokenResult.access_token) {
        counter++;

        if (counter < 10) {
          getFbCode(account, accounts, counter, callback);
        } else {
          console.log(tokenResult);
          console.log("failed");
        }
        return undefined;
      } else {
        callback(tokenResult.access_token, accounts);
        return;
      }
    }
  );
}

function pageTokenCallback(accessToken, accounts) {
  if (accessToken) {
    const account = accounts[0];
    FB.setAccessToken(accessToken);

    FB.api("me/accounts", "get", result => {
      let pages = result.data;

      for (let index in pages) {
        let page = pages[index];
        if (account.socialID === page.id) {
          for (let i = 0; i < accounts.length; i++) {
            accounts[i].accessToken = page.access_token;
            accounts[i].lastRenewed = new Date();
            accounts[i].save().then(res => {
              console.log(res);
              console.log("success");
            });
          }
        }
      }
    });
  }
}
function accessTokenCallback(accessToken, accounts) {
  if (accessToken) {
    for (let i = 0; i < accounts.length; i++) {
      accounts[i].accessToken = accessToken;
      accounts[i].lastRenewed = new Date();
      accounts[i].save().then(res => {
        console.log(res);
        console.log("success");
      });
    }
  }
}
