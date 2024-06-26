import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getPostColor, getPostIconRound } from "../../../componentFunctions";
import { isMobileOrTablet } from "../../../util";

import GIContainer from "../../containers/GIContainer";
import GIText from "../../views/GIText";
import GIButton from "../../views/GIButton";
import EmailForm from "../../forms/EmailForm";
import Logo from "../WebsiteHeader/Logo";
import AgencyForm from "../../forms/AgencyForm";
import CalendlyForm from "../../forms/Calendly";

class WebsiteFooter extends Component {
  isActive = activePage => {
    if ("/" + activePage === this.props.location.pathname) return " active";
    else return "";
  };
  render() {
    const { hideForm = false, user } = this.props;

    return (
      <GIContainer className="column x-fill">
        {!hideForm && <CalendlyForm />}

        <GIContainer
          className={
            "align-center column x-fill bg-almost-black " +
            (isMobileOrTablet() ? "pa32" : "pa64")
          }
        >
          <GIContainer className="wrap">
            <div className="flex column container-box tiny my16">
              <Link to="/home">
                <GIContainer className="mb16" style={{ width: "100px" }}>
                  <Logo
                    className="x-40"
                    displayText={false}
                    style={{ minWidth: "40px" }}
                  />
                </GIContainer>
              </Link>
              <GIText className="white my4" type="h6">
                Phone:
                <GIText
                  className="four-blue"
                  text="&nbsp;250-415-3093"
                  type="span"
                />
              </GIText>
              <GIText className="white my4" type="h6">
                Email:
                <GIText
                  className="four-blue"
                  text="&nbsp;hello@ghostit.co"
                  type="span"
                />
              </GIText>
            </div>
            <div className="flex column container-box tiny my16">
              <GIText className="white mb16" type="h6" text="Resources" />
              <Link to="/home">
                <GIText
                  className={"grey clickable my4" + this.isActive("home")}
                  text="Home"
                  type="p"
                />
              </Link>
              <Link to="/pricing">
                <GIText
                  className={"grey clickable my4" + this.isActive("pricing")}
                  text="Pricing"
                  type="p"
                />
              </Link>
              <Link to="/services">
                <GIText
                  className={"grey clickable my4" + this.isActive("agency")}
                  text="Services"
                  type="p"
                />
              </Link>

              <Link to="/blog">
                <GIText
                  className={"grey clickable my4" + this.isActive("blog")}
                  text="Ghostit Blog"
                  type="p"
                />
              </Link>
              <Link to="/team">
                <GIText
                  className={"grey clickable my4" + this.isActive("team")}
                  text="Ghostit Team"
                  type="p"
                />
              </Link>

              {!user && (
                <Link to="/sign-in">
                  <GIButton
                    className={`common-border br20 px16 py8 mt8 ${
                      isMobileOrTablet() ? "four-blue" : "white"
                    }`}
                    text="Sign In"
                  />
                </Link>
              )}

              {user && (
                <Link to="/dashboard">
                  <GIButton
                    className={`common-border br20 px16 py8 mt8 ${
                      isMobileOrTablet() ? "four-blue" : "white"
                    }`}
                    text="Go to Software"
                  />
                </Link>
              )}
            </div>
            <div className="flex column container-box tiny my16">
              <GIText className="white mb16" type="h6" text="Terms & Privacy" />

              <Link to="/terms-of-service">
                <GIText
                  className={
                    "grey clickable my4" + this.isActive("terms-of-service")
                  }
                  text="Terms & Conditions"
                  type="p"
                />
              </Link>
              <Link to="/privacy-policy">
                <GIText
                  className={
                    "grey clickable my4" + this.isActive("privacy-policy")
                  }
                  text="Privacy Policy"
                  type="p"
                />
              </Link>
            </div>

            <div
              className={
                "flex column container-box tiny my16 " +
                (isMobileOrTablet() ? "" : "pr48")
              }
            >
              <GIText
                className="white mb16"
                type="h6"
                text="Subscribe To Our Newsletter"
              />
              <EmailForm />
              <GIContainer className="wrap align-center mt16">
                <GIText className="white" text="Follow Us:" type="h6" />
                <a
                  href="https://www.facebook.com/ghostitcontent/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FontAwesomeIcon
                    className="clickable ml16 white round-icon round pa8"
                    icon={getPostIconRound("facebook")}
                    style={{ backgroundColor: getPostColor("facebook") }}
                  />
                </a>

                <a
                  href="https://www.linkedin.com/company/ghostit-content/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FontAwesomeIcon
                    className="clickable ml16 white round-icon round pa8"
                    icon={getPostIconRound("linkedin")}
                    style={{ backgroundColor: getPostColor("linkedin") }}
                  />
                </a>
                <a
                  href="https://www.instagram.com/ghostitcontent/"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FontAwesomeIcon
                    className="clickable ml16 white round-icon round pa8"
                    icon={getPostIconRound("instagram")}
                    style={{ backgroundColor: getPostColor("instagram") }}
                  />
                </a>
              </GIContainer>
            </div>
            <div className="flex column container-box tiny my16">
              <a href="https://www.victoriachamber.ca/" target="_blank">
                <img
                  alt=""
                  className="mb16"
                  src={require("../../../images/bus_award.png")}
                  style={{ width: "100px" }}
                />
              </a>
              <a
                href="https://douglasmagazine.com/10-to-watch-2018-ghostit/"
                target="_blank"
              >
                <img
                  alt=""
                  src={require("../../../images/douglas_10.png")}
                  style={{ width: "100px" }}
                />
              </a>
            </div>
          </GIContainer>
        </GIContainer>
      </GIContainer>
    );
  }
}

/*<Link to="/contact-us">
  <GIText
    className={"grey clickable my4" + this.isActive("contact-us")}
    text="Contact Us"
    type="p"
  />
</Link>*/

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

export default withRouter(connect(mapStateToProps)(WebsiteFooter));
