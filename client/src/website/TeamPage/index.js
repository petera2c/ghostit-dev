import React, { Component } from "react";

import Page from "../../components/containers/Page";
import GIContainer from "../../components/containers/GIContainer";
import GIText from "../../components/views/GIText";

import { teamMembers } from "./teamMembers";

import { correctOverflow, teamMemberDiv } from "./util";

import { isMobileOrTablet } from "../../util";

import "./style.css";

class TeamPage extends Component {
  render() {
    const firstTeamRow = [];
    const secondTeamRow = [];
    const thirdTeamRow = [];
    const fourthTeamRow = [];

    for (let index in teamMembers) {
      const teamMember = teamMembers[index];

      if (index < 3) {
        firstTeamRow.push(teamMemberDiv(index, teamMember));
      } else if (index < 5) {
        secondTeamRow.push(teamMemberDiv(index, teamMember));
      } else if (index < 8) {
        thirdTeamRow.push(teamMemberDiv(index, teamMember));
      } else {
        fourthTeamRow.push(teamMemberDiv(index, teamMember));
      }
    }
    return (
      <Page
        className="website-page align-center mt32"
        description="Have fun, make money!"
        keywords="ghostit, team"
        title="Team"
      >
        <GIText className="tac full-center pb8 mx32" type="h2">
          Meet the
          <GIText
            className="four-blue tac"
            text="&nbsp;Ghostit Team!"
            type="span"
          />
        </GIText>

        <GIText
          className="tac mb32 mx32"
          text="Have fun, make money!"
          type="h6"
        />

        <GIContainer className="x-wrap x-fill px64">{firstTeamRow}</GIContainer>
        <GIContainer
          className={
            "x-wrap x-fill relative " + (isMobileOrTablet() ? "px64" : "")
          }
        >
          {!isMobileOrTablet() && (
            <GIContainer className="relative">
              <img
                alt=""
                className="container-box y-30vw"
                src={require("../../svgs/team-page-1.png")}
              />
              <img
                alt="blob"
                id="circle-love"
                src={require("../../svgs/circle-love.svg")}
              />
            </GIContainer>
          )}

          {secondTeamRow}
        </GIContainer>
        <GIContainer className="x-wrap x-fill relative px64">
          {thirdTeamRow}
        </GIContainer>
        <GIContainer className="x-wrap x-fill justify-end pl64">
          {fourthTeamRow}
          {!isMobileOrTablet() && (
            <GIContainer className="relative justify-end">
              <img
                alt=""
                className="container-box y-30vw"
                src={require("../../svgs/team-page-2.png")}
              />
              <img
                alt="blob"
                id="circle-likes-2"
                src={require("../../svgs/circle-likes-2.svg")}
              />
            </GIContainer>
          )}
        </GIContainer>
      </Page>
    );
  }
}

export default TeamPage;
