import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { isMobileOrTablet } from "../../../util";

import Logo from "./Logo";
import GIContainer from "../../containers/GIContainer";
import GIButton from "../../views/GIButton";
import GIText from "../../views/GIText";

import { getPostColor, getPostIconRound } from "../../../componentFunctions";

import "./styles";

class WebsiteHeader extends Component {
  state = {
    showHeader: !isMobileOrTablet(),
  };
  componentDidMount() {
    // This is for header to blend with background when at top of home page
    this._ismounted = true;
  }
  componentWillUnmount() {
    this._ismounted = false;
  }

  changeState = (index, value) => {
    if (this._ismounted) this.setState({ [index]: value });
  };

  isActive = (page) => {
    if ("/" + page === this.props.location.pathname) return " four-blue";
    else return "";
  };
  isRootActive = (page) => {
    if (
      "/" + page ===
      this.props.location.pathname.substring(0, page.length + 1)
    )
      return " four-blue";
    else return "";
  };

  render() {
    const { showHeader } = this.state;
    const { homePage, user } = this.props;

    let trialButtonClassName = "regular-button";

    if (!showHeader) {
      return (
        <FontAwesomeIcon
          icon={faBars}
          id="mobile-open-header-button"
          onClick={() => this.setState({ showHeader: true })}
          size="2x"
        />
      );
    }

    return (
      <GIContainer className="website-header grid-3-column full-center common-transition pt32 pb8">
        {!isMobileOrTablet() && (
          <img
            alt="blob"
            id="blob-under-login"
            src={require("../../../svgs/blob-under-login.svg")}
            style={{ width: "55vw" }}
          />
        )}

        {isMobileOrTablet() && (
          <FontAwesomeIcon
            icon={faTimes}
            size="2x"
            className="close"
            onClick={() => this.setState({ showHeader: false })}
          />
        )}
        <GIContainer className="full-center">
          <Link to="/home">
            <Logo
              id="logo-container"
              onClick={
                isMobileOrTablet()
                  ? () => {
                      this.setState({ showHeader: false });
                    }
                  : () => {}
              }
              style={{ width: "10vw", minWidth: "115px" }}
            />
          </Link>
        </GIContainer>
        <GIContainer
          className={isMobileOrTablet() ? "full-center column" : "full-center"}
        >
          <Link to="/team">
            <button
              className={"fs-18 relative pb8 mx8" + this.isActive("team")}
              onClick={
                isMobileOrTablet()
                  ? () => {
                      this.setState({ showHeader: false });
                    }
                  : () => {}
              }
            >
              {this.isActive("team") && <div className="border-bottom-50" />}
              Our Team
            </button>
          </Link>
          <Link to="/pricing">
            <button
              className={"fs-18 relative pb8 mx8" + this.isActive("pricing")}
              onClick={
                isMobileOrTablet()
                  ? () => {
                      this.setState({ showHeader: false });
                    }
                  : () => {}
              }
            >
              {this.isActive("pricing") && <div className="border-bottom-50" />}
              Pricing
            </button>
          </Link>
          <div className="relative" id="services-hover">
            <Link to="/services">
              <button
                className={
                  "fs-18 relative pb8 mx8" + this.isRootActive("services")
                }
                onClick={
                  isMobileOrTablet()
                    ? () => {
                        this.setState({ showHeader: false });
                      }
                    : () => {}
                }
              >
                {this.isRootActive("services") && (
                  <div className="border-bottom-50" />
                )}
                Services
              </button>
            </Link>
            {!isMobileOrTablet() && (
              <div
                className="pt8"
                id="services-hover-hidden"
                style={{
                  position: "absolute",
                  top: "calc(100% + 0)",
                  right: "50%",
                  transform: "translate(50%)",
                  zIndex: 10,
                }}
              >
                <div className="flex full-center container small column bg-white shadow-3 pa16 br8">
                  <Link to="/services/seo-blog-posts">
                    <button
                      className={
                        "fs-18 relative pb8 mx8 mb8 " +
                        this.isActive("services/seo-blog-posts")
                      }
                      onClick={
                        isMobileOrTablet()
                          ? () => {
                              this.setState({ showHeader: false });
                            }
                          : () => {}
                      }
                    >
                      {this.isActive("services/seo-blog-posts") && (
                        <div className="border-bottom-50" />
                      )}
                      SEO Optimized Blog Posts
                    </button>
                  </Link>

                  <Link to="/services/email-newsletter">
                    <button
                      className={
                        "fs-18 relative pb8 mx8 mb8 " +
                        this.isActive("services/email-newsletter")
                      }
                      onClick={
                        isMobileOrTablet()
                          ? () => {
                              this.setState({ showHeader: false });
                            }
                          : () => {}
                      }
                    >
                      {this.isActive("services/email-newsletter") && (
                        <div className="border-bottom-50" />
                      )}
                      Email Newsletters
                    </button>
                  </Link>

                  <Link to="/services/paid-advertising">
                    <button
                      className={
                        "fs-18 relative pb8 mx8 mb8 " +
                        this.isActive("services/paid-advertising")
                      }
                      onClick={
                        isMobileOrTablet()
                          ? () => {
                              this.setState({ showHeader: false });
                            }
                          : () => {}
                      }
                    >
                      {this.isActive("services/paid-advertising") && (
                        <div className="border-bottom-50" />
                      )}
                      Paid Advertising
                    </button>
                  </Link>

                  <Link to="/services/web-content">
                    <button
                      className={
                        "fs-18 relative pb8 mx8 mb8 " +
                        this.isActive("services/web-content")
                      }
                      onClick={
                        isMobileOrTablet()
                          ? () => {
                              this.setState({ showHeader: false });
                            }
                          : () => {}
                      }
                    >
                      {this.isActive("services/web-content") && (
                        <div className="border-bottom-50" />
                      )}
                      Web Content
                    </button>
                  </Link>

                  <Link to="/services/lead-generation-e-book">
                    <button
                      className={
                        "fs-18 relative pb8 mx8 mb8 " +
                        this.isActive("services/lead-generation-e-book")
                      }
                      onClick={
                        isMobileOrTablet()
                          ? () => {
                              this.setState({ showHeader: false });
                            }
                          : () => {}
                      }
                    >
                      {this.isActive("services/lead-generation-e-book") && (
                        <div className="border-bottom-50" />
                      )}
                      Lead Generation E-Books
                    </button>
                  </Link>

                  <Link to="/services/website-design-and-development">
                    <button
                      className={
                        "fs-18 relative pb8 mx8 mb8 " +
                        this.isActive("services/website-design-and-development")
                      }
                      onClick={
                        isMobileOrTablet()
                          ? () => {
                              this.setState({ showHeader: false });
                            }
                          : () => {}
                      }
                    >
                      {this.isActive(
                        "services/website-design-and-development"
                      ) && <div className="border-bottom-50" />}
                      Website Design & Development{" "}
                    </button>
                  </Link>

                  <Link to="/services/social-media-posts">
                    <button
                      className={
                        "fs-18 relative pb8 mx8 mb8 " +
                        this.isActive("services/social-media-posts")
                      }
                      onClick={
                        isMobileOrTablet()
                          ? () => {
                              this.setState({ showHeader: false });
                            }
                          : () => {}
                      }
                    >
                      {this.isActive("services/social-media-posts") && (
                        <div className="border-bottom-50" />
                      )}
                      Social Media Posts
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link to="/blog">
            <button
              className={"fs-18 relative pb8 mx8" + this.isRootActive("blog")}
              onClick={
                isMobileOrTablet()
                  ? () => {
                      this.setState({ showHeader: false });
                    }
                  : () => {}
              }
            >
              {this.isRootActive("blog") && (
                <div className="border-bottom-50" />
              )}
              Blog
            </button>
          </Link>
          <Link to="/contact-us">
            <button
              className={
                "fs-18 relative pb8 mx8" + this.isRootActive("contact-us")
              }
              onClick={
                isMobileOrTablet()
                  ? () => {
                      this.setState({ showHeader: false });
                    }
                  : () => {}
              }
            >
              {this.isRootActive("contact-us") && (
                <div className="border-bottom-50" />
              )}
              Contact Us
            </button>
          </Link>
        </GIContainer>
        <GIContainer
          className={`justify-end align-center ${
            isMobileOrTablet() ? "column" : "mr32"
          }`}
        >
          <GIContainer className="wrap align-center" style={{ zIndex: 101 }}>
            <a
              href="https://www.facebook.com/ghostitcontent/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FontAwesomeIcon
                className="clickable common-border white round-icon round pa8 ml16"
                icon={getPostIconRound("facebook")}
                style={{
                  backgroundColor: getPostColor("facebook"),
                }}
              />
            </a>

            <a
              href="https://www.linkedin.com/company/ghostit-content/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FontAwesomeIcon
                className="clickable common-border white round-icon round pa8 ml16"
                icon={getPostIconRound("linkedin")}
                style={{
                  backgroundColor: getPostColor("linkedin"),
                }}
              />
            </a>
            <a
              href="https://www.instagram.com/ghostitcontent/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FontAwesomeIcon
                className="clickable common-border white round-icon round pa8 mx16"
                icon={getPostIconRound("instagram")}
                style={{
                  backgroundColor: getPostColor("instagram"),
                }}
              />
            </a>
          </GIContainer>
          <Link
            className="no-bold white bg-orange-fade-2 shadow-orange-3 px32 py16 br32"
            to="/contact-us"
          >
            Book a Call
          </Link>
        </GIContainer>
      </GIContainer>
    );
  }
}

export default withRouter(WebsiteHeader);
