import React, { Component } from "react";

import Page from "../../components/containers/Page";
import GIContainer from "../../components/containers/GIContainer";

import GIText from "../../components/views/GIText";
import PictureTextDescription from "../../components/PictureTextDescription";
import SvgBranches from "../../components/SvgBranches";

import NavigationLayout from "../../components/navigations/NavigationLayout";

import AgencyForm from "../../components/forms/AgencyForm";

import { categories } from "./util.js";

import { mobileAndTabletcheck } from "../../componentFunctions";

class GhostitAgency extends Component {
  state = {
    categories,
    activeAgencyComponent: 0
  };
  render() {
    const { categories, activeAgencyComponent } = this.state;
    return (
      <Page
        title="Agency"
        description="Increase the amount of qualified traffic to your site."
        keywords="content, ghostit, marketing, agency"
        className="website-page align-center"
      >
        <GIText type="h1" text="Content Services" className="tac" />
        <GIText
          type="h4"
          text="Increase the amount of qualified traffic to your site."
          className="tac mb32"
        />
        {!mobileAndTabletcheck() && (
          <NavigationLayout
            className="x-wrap full-center"
            data={categories.map((category, index) => {
              let active = false;
              if (index === activeAgencyComponent) active = true;

              return (
                <GIContainer
                  onClick={() =>
                    this.setState({ activeAgencyComponent: index })
                  }
                  className="column mx16 container-box tinier"
                >
                  <GIContainer>
                    {active && category.active}
                    {!active && category.notActive}
                  </GIContainer>
                  <GIText
                    type="h3"
                    text={category.title1}
                    className="tac ellipsis"
                  />
                  <GIText
                    type="h3"
                    text={category.title2}
                    className="tac ellipsis"
                  />
                </GIContainer>
              );
            })}
          />
        )}
        {!mobileAndTabletcheck() && (
          <GIContainer
            className="py32 px64 mt16 mx64 mb32 br4"
            style={{ backgroundColor: "var(--seven-blue-color)" }}
          >
            <GIText
              text={categories[activeAgencyComponent].description}
              type="p"
              className="white"
            />
          </GIContainer>
        )}

        <GIContainer className="column">
          {!mobileAndTabletcheck() && (
            <GIText
              text="Our content services are focused on one thing. Increasing the amount of qualified traffic to your site."
              type="h3"
              className="tac mb32"
            />
          )}
          <SvgBranches numberOfBranches={3} />
          <GIText
            text="Book a call to go over the details of your content marketing requirements."
            type="h1"
            className="tac"
          />
          <GIContainer className="x-wrap px32">
            <GIContainer className="fill-flex my32">
              <AgencyForm />
            </GIContainer>
            <GIContainer className="pl32 my32">
              <img src={"src/svgs/agency-call.svg"} className="fill-parent" />
            </GIContainer>
          </GIContainer>
        </GIContainer>
      </Page>
    );
  }
}

export default GhostitAgency;
