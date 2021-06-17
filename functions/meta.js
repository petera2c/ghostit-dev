const AWS = require("aws-sdk");
const moment = require("moment-timezone");
const jsdom = require("jsdom");
const GhostitBlog = require("../models/GhostitBlog");
const { teamMembers } = require("../client/src/website/TeamPage/teamMembers");
const htmlToText = require("html-to-text");

const { JSDOM } = jsdom;

const {
  amazonAccessKeyID,
  amazonSecretAccessKey,
  amazonBucket
} = require("../config/keys");

const s3 = new AWS.S3({
  accessKeyId: amazonAccessKeyID,
  secretAccessKey: amazonSecretAccessKey
});
const createSiteMap = () => {
  GhostitBlog.find({}, { title: 1, updatedAt: 1, url: 1 }, (err, blogs) => {
    let siteMapString =
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';
    siteMapString +=
      "<url>\n<loc>https://www.ghostit.co/</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly</changefreq>\n<priority>1</priority>\n</url>\n\n";
    siteMapString +=
      "<url>\n<loc>https://www.ghostit.co/agency</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly</changefreq>\n<priority>0.8</priority>\n</url>\n\n";
    siteMapString +=
      "<url>\n<loc>https://www.ghostit.co/blog</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly</changefreq>\n<priority>0.8</priority>\n</url>\n\n";
    siteMapString +=
      "<url>\n<loc>https://www.ghostit.co/pricing</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly</changefreq>\n<priority>0.8</priority>\n</url>\n\n";
    siteMapString +=
      "<url>\n<loc>https://www.ghostit.co/privacy-policy</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly</changefreq>\n<priority>0</priority>\n</url>\n\n";
    siteMapString +=
      "<url>\n<loc>https://www.ghostit.co/sign-up</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly</changefreq>\n<priority>0.8</priority>\n</url>\n\n";
    siteMapString +=
      "<url>\n<loc>https://www.ghostit.co/sign-in</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly</changefreq>\n<priority>0.8</priority>\n</url>\n\n";
    siteMapString +=
      "<url>\n<loc>https://www.ghostit.co/team</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly</changefreq>\n<priority>0.8</priority>\n</url>\n\n";
    siteMapString +=
      "<url>\n<loc>https://www.ghostit.co/terms-of-service</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly</changefreq>\n<priority>0</priority>\n</url>\n\n";

    for (let index in blogs) {
      const blog = blogs[index];
      siteMapString +=
        "<url>\n<loc>" +
        "https://www.ghostit.co/blog/" +
        blog.url +
        "</loc>\n<lastmod>" +
        new moment(blog.updatedAt).format("YYYY-MM-DD") +
        "</lastmod>\n<changefreq>yearly\n</changefreq>\n</url>\n\n";
    }

    for (let index in teamMembers) {
      const teamMember = teamMembers[index];
      siteMapString +=
        "<url>\n<loc>" +
        "https://www.ghostit.co/team-member/" +
        (
          teamMember.title.replace(/[^a-zA-Z ]/g, "") +
          "/" +
          teamMember.name.replace(/[^a-zA-Z ]/g, "")
        )
          .replace(/ /g, "-")
          .toLowerCase() +
        "/" +
        teamMember._id +
        "</loc>\n<lastmod>2020-02-04</lastmod>\n<changefreq>yearly\n</changefreq>\n</url>\n\n";
    }
    siteMapString += "</urlset>";

    const file = new Buffer.from(siteMapString);
    const params = {
      Bucket: amazonBucket,
      Key: "sitemap.xml",
      Body: siteMapString
    };

    s3.putObject(params, (err, data) => {
      if (err) console.log(err);
    });
  });
};

function capitalizeTheFirstLetterOfEachWord(str) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

const getMetaInformation = (url, callback) => {
  const defaultMetaDescription =
    "We are a Growth-Focused Digital Marketing & Web Development Agency. Come see why our audience-centered data-driven approach works.";
  const defaultMetaImage =
    "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png";
  const defaultMetaTitle =
    "Amplify Your Website Traffic and Turn Visitors Into Paying Customers";
  const defaultObject = {
    metaDescription: defaultMetaDescription,
    metaImage: defaultMetaImage,
    metaTitle: defaultMetaTitle
  };
  if (url.substring(0, 6) === "/blog/") {
    GhostitBlog.find({}, (err, ghostitBlogs) => {
      for (let index in ghostitBlogs) {
        const ghostitBlog = ghostitBlogs[index];
        const { contentArray = [], images = [] } = ghostitBlog;
        if (ghostitBlog.url) {
          if (ghostitBlog.url === url.substring(6, url.length)) {
            let metaTitle = defaultMetaTitle;
            if (contentArray[0] && contentArray[0].html)
              metaTitle = htmlToText
                .fromString(contentArray[0].html, {})
                .toLowerCase();

            let metaDescription = defaultMetaDescription;
            if (contentArray[1] && contentArray[1].html)
              metaDescription = htmlToText
                .fromString(contentArray[1].html, {})
                .substring(0, 200);

            let metaImage = defaultMetaImage;
            if (images[0]) metaImage = images[0].url;

            return callback({
              metaDescription,
              metaImage,
              metaTitle:
                capitalizeTheFirstLetterOfEachWord(metaTitle) + " | Ghostit"
            });
          }
        }
      }

      return callback(defaultObject);
    });
  } else if (url.substring(0, 13) === "/team-member/") {
    const teamMember = teamMembers.find(
      (teamMember, index) => teamMember.id === url[url.length - 1]
    );
    return callback(defaultObject);
  } else
    switch (url) {
      case "/":
        return callback(defaultObject);
      case "/pricing":
        return callback({
          metaDescription:
            "Check out pricing for Ghostit marketing plans that all include dedicated content creators, competitive analysis, keyword research, and much more.",
          metaImage:
            "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png",
          metaTitle: "All-in-One Marketing Solution & Agency Pricing | Ghostit"
        });
      case "/team":
        return callback({
          metaDescription:
            "Bring your marketing concept to life with Ghostit’s team of content creators. From content development to SEO services, we can do it all.",
          metaImage:
            "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png",
          metaTitle: "Content Creation Team | Ghostit"
        });
      case "/blog":
        return callback({
          metaDescription:
            "Ghostit’s marketing blog shares insights into all facets of marketing including social media marketing, content marketing, and marketing automation.",
          metaImage:
            "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png",
          metaTitle: "Ghostit Blog | Sharing the Importance of Marketing"
        });
      case "/agency":
        return callback({
          metaDescription:
            "Our marketing agency focuses on one thing: increasing qualified traffic to your site. Find out how our team can simplify your marketing process.",
          metaImage:
            "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png",
          metaTitle: "Content Creation Marketing Agency | Ghostit"
        });
      case "/sign-in":
        return callback({
          metaDescription:
            "Sign in to the Ghostit platform to access your content calendar, campaigns, and templates.",
          metaImage:
            "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png",
          metaTitle: "Sign In to Ghostit"
        });
      case "/sign-up":
        return callback({
          metaDescription:
            "Ready to simplify your marketing process? Sign up to Ghostit’s all-in-one marketing solution and put a voice to your marketing concept today.",
          metaImage:
            "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png",
          metaTitle: "Sign Up to Ghostit"
        });
      case "/forgot-password":
        return callback({
          metaDescription: "Forgot password.",
          metaImage:
            "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png",
          metaTitle: "Forgot Password | Ghostit"
        });
      case "/terms-of-service":
        return callback({
          metaDescription: "Terms of service.",
          metaImage:
            "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png",
          metaTitle: "Terms of Service | Ghostit"
        });
      case "/privacy-policy":
        return callback({
          metaDescription: "Privacy policy.",
          metaImage:
            "https://res.cloudinary.com/ghostit-co/image/upload/v1573309830/meta.png",
          metaTitle: "Privacy Policy | Ghostit"
        });
      default:
        return callback(defaultObject);
    }
};

module.exports = {
  createSiteMap,
  getMetaInformation
};
