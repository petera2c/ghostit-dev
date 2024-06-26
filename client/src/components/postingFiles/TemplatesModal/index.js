import React, { Component } from "react";
import axios from "axios";
import moment from "moment-timezone";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setKeyListenerFunction } from "../../../redux/actions/";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEdit}  from "@fortawesome/free-solid-svg-icons/faEdit";
import {faTrash}  from "@fortawesome/free-solid-svg-icons/faTrash";

import LoaderSimpleCircle from "../../notifications/LoaderSimpleCircle";
import DateTimePicker from "../../DateTimePicker";
import ConfirmAlert from "../../notifications/ConfirmAlert";
import Modal0 from "../../containers/Modal0";

import GIContainer from "../../containers/GIContainer";

import { getPostColor, getPostIcon } from "../../../componentFunctions";

import { getRecipes } from "./util";

import "./style.css";

class TemplatesModal extends Component {
  state = {
    usersRecipes: [],
    allRecipes: [],
    activeRecipes: [],
    loading: true,

    clientX: 0,
    clientY: 0,

    startDate: new moment(this.props.clickedCalendarDate),

    chooseRecipeDate: false,

    previewRecipeLocation: undefined,
    activePost: undefined,
    userID: undefined,
    promptDeleteRecipe: false
  };
  componentDidMount() {
    this._ismounted = true;
    const {
      handleParentChange,
      getKeyListenerFunction,
      setKeyListenerFunction
    } = this.props;

    setKeyListenerFunction([
      event => {
        if (!this._ismounted) return;
        if (event.keyCode === 27) {
          handleParentChange({ templatesModal: false }); // escape button pushed
        }
      },
      getKeyListenerFunction[0]
    ]);

    getRecipes(stateObject => {
      if (this._ismounted) this.setState(stateObject);
    });
  }
  componentWillUnmount() {
    this._ismounted = false;
  }

  createRecipeList = activeRecipes => {
    const { activePost, chooseRecipeDate, previewRecipeLocation } = this.state;
    let recipeArray = [];

    let recipeIndex = 0;
    for (
      let recipeRow = 0;
      recipeRow <= Math.floor(activeRecipes.length / 3);
      recipeRow++
    ) {
      let rowArray = [];

      for (let recipeColumn = 0; recipeColumn < 3; recipeColumn++) {
        let recipeIndex2 = recipeIndex;
        let recipe = activeRecipes[recipeIndex2];

        // Preview when a recipe is clicked
        if (previewRecipeLocation === recipeIndex2) {
          recipeArray[recipeArray.length + 1] = this.previewRecipeDiv(
            recipeRow,
            recipeColumn,
            recipe,
            activePost,
            chooseRecipeDate
          );
        }

        // Put in blank divs to account for empty slots in final row
        if (!recipe) {
          recipe = {
            _id: recipeIndex2 + "recipe",
            name: "",
            cursor: "default"
          };
        }
        let opacity;
        if (!recipe.color) opacity = 0;
        rowArray.push(
          <GIContainer
            className="recipe-container pa8 ma8 flex column button"
            key={recipeIndex2 + "recipe"}
            onClick={e => {
              if (!activeRecipes[recipeIndex2]) return;
              e.stopPropagation();
              if (previewRecipeLocation === recipeIndex2) {
                this.setState({
                  previewRecipeLocation: undefined,
                  activePost: undefined
                });
              } else {
                window.setTimeout(() => {
                  if (document.getElementById("current-displayed-recipe"))
                    document
                      .getElementById("current-displayed-recipe")
                      .scrollIntoView();
                }, 10);

                this.setState({
                  previewRecipeLocation: recipeIndex2,
                  activePost: recipe.posts[0]
                });
              }
            }}
            style={{ opacity, cursor: recipe.cursor }}
          >
            <GIContainer className="recipe-name">{recipe.name}</GIContainer>
            <GIContainer className="recipe-description">
              {recipe.description}
            </GIContainer>
            <GIContainer className="recipe-information-container">
              <GIContainer className="recipe-uses">
                Use count:{" "}
                <span className="blue">
                  {recipe.useCount ? recipe.useCount : 0}
                </span>
                <br />
                {recipe.creator && (
                  <span className="italic">{recipe.creator}</span>
                )}
              </GIContainer>
            </GIContainer>
          </GIContainer>
        );
        recipeIndex++;
      }
      if (
        recipeArray[recipeArray.length - 2] ||
        recipeArray.length === 0 ||
        recipeArray.length === 1
      ) {
        recipeArray.push(
          <GIContainer
            className="recipes-container"
            key={recipeRow + "each_row"}
          >
            {rowArray}
          </GIContainer>
        );
      } else {
        recipeArray[recipeArray.length - 2] = (
          <GIContainer
            className="recipes-container"
            key={recipeRow + "each_row"}
          >
            {rowArray}
          </GIContainer>
        );
      }
    }

    return recipeArray;
  };
  deleteRecipe = deleteResponse => {
    if (deleteResponse) {
      const { activeRecipes, previewRecipeLocation } = this.state;
      const recipe = activeRecipes[previewRecipeLocation];
      axios.delete("/api/recipe/" + recipe._id, { recipe }).then(res => {
        getRecipes(stateObject => {
          if (this._ismounted) this.setState(stateObject);
        });
        this.setState({
          promptDeleteRecipe: false,
          previewRecipeLocation: undefined
        });
      });
    } else this.setState({ promptDeleteRecipe: false });
  };

  previewRecipeDiv = (
    recipeRow,
    recipeColumn,
    recipe,
    activePost,
    chooseRecipeDate
  ) => {
    const { handleParentChange } = this.props;
    let lastPostDay;
    let signedInUserID = this.props.user.signedInAsUser
      ? this.props.user.signedInAsUser.id
      : this.props.user._id;
    if (recipe.posts)
      recipe.posts.sort((a, b) => {
        if (new moment(a.postingDate) < new moment(b.postingDate)) return -1;
        else return 1;
      });
    return (
      <GIContainer
        className="preview-recipe"
        key={recipeRow + "preview_recipe" + recipeColumn}
        id="current-displayed-recipe"
      >
        <GIContainer className="recipe-posts-navigation">
          {recipe.posts.map((post_obj, index) => {
            let postDay =
              new moment(post_obj.postingDate).diff(recipe.startDate, "days") +
              1;
            if (postDay === lastPostDay) postDay = undefined;
            else lastPostDay = postDay;

            return (
              <GIContainer key={index + "post-div"}>
                {postDay && (
                  <GIContainer className="post-day">Day {postDay}</GIContainer>
                )}
                <GIContainer
                  className="post-entry"
                  onClick={e => this.setState({ activePost: post_obj })}
                >
                  {getPostIcon(post_obj.socialType) && (
                    <FontAwesomeIcon
                      icon={getPostIcon(post_obj.socialType)}
                      color={getPostColor(post_obj.socialType)}
                      style={{ backgroundColor: "var(--white-theme-color)" }}
                      size="2x"
                    />
                  )}
                  {!getPostIcon(post_obj.socialType) && (
                    <GIContainer
                      className="custom-task-block-color"
                      style={{ backgroundColor: post_obj.color }}
                    />
                  )}

                  <GIContainer className="recipe-post-name">
                    {post_obj.name}
                  </GIContainer>
                </GIContainer>
              </GIContainer>
            );
          })}
        </GIContainer>
        <GIContainer className="recipe-post-and-use-container">
          {activePost && (
            <GIContainer className="post-preview">
              <GIContainer className="column">
                <GIContainer className="title">{recipe.name}</GIContainer>
                <GIContainer className="preview-recipe-description">
                  {recipe.description}
                </GIContainer>
              </GIContainer>
              {signedInUserID === recipe.userID && (
                <GIContainer className="recipe-edit-delete-container">
                  <FontAwesomeIcon
                    icon={faEdit}
                    className="recipe-edit-button"
                    size="2x"
                    onClick={() => {
                      handleParentChange({
                        clickedEvent: recipe,
                        clickedEventIsRecipe: true,
                        recipeEditing: true,
                        templatesModal: false,
                        campaignModal: true
                      });
                    }}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="recipe-delete-button"
                    size="2x"
                    onClick={() => this.setState({ promptDeleteRecipe: true })}
                  />
                </GIContainer>
              )}
            </GIContainer>
          )}
          <GIContainer className="use-recipe-date-container">
            {!chooseRecipeDate && (
              <GIContainer
                className="use-this-recipe"
                onClick={() => this.setState({ chooseRecipeDate: true })}
              >
                Use This Template
              </GIContainer>
            )}

            {chooseRecipeDate && (
              <GIContainer className="label">Choose Start Date: </GIContainer>
            )}
            {chooseRecipeDate && (
              <DateTimePicker
                date={this.props.clickedCalendarDate}
                dateFormat="MMMM Do YYYY"
                handleChange={date => {
                  recipe.chosenStartDate = date;
                  recipe.recipeID = recipe._id;
                  recipe.calendarID = this.props.calendarID;

                  handleParentChange({
                    clickedEvent: recipe,
                    clickedEventIsRecipe: true,
                    recipeEditing: false,
                    templatesModal: false,
                    campaignModal: true
                  });
                }}
                dateLowerBound={new moment()}
                disableTime={true}
                style={{
                  bottom: "100%",
                  top: "auto"
                }}
              />
            )}
          </GIContainer>
        </GIContainer>
      </GIContainer>
    );
  };

  render() {
    const {
      activeRecipes,
      allRecipes,
      loading,
      promptDeleteRecipe,
      usersRecipes
    } = this.state;
    const { handleParentChange } = this.props;

    const recipeArray = this.createRecipeList(activeRecipes);

    return (
      <Modal0
        body={
          <GIContainer className="bg-light-grey x-fill pa32">
            <GIContainer className="bg-white common-border column x-fill relative pa32 br8">
              <GIContainer className="recipe-navigation-container full-center x-fill">
                <GIContainer
                  className={
                    activeRecipes === usersRecipes
                      ? "recipe-navigation-option pa4 button mx8 active"
                      : "recipe-navigation-option pa4 button mx8"
                  }
                  onClick={() => {
                    this.setState({
                      activeRecipes: usersRecipes,
                      previewRecipeLocation: undefined,
                      activePost: undefined
                    });
                  }}
                >
                  Your Templates
                </GIContainer>
                <GIContainer
                  className={
                    activeRecipes === allRecipes
                      ? "recipe-navigation-option pa4 button mx8 active"
                      : "recipe-navigation-option pa4 button mx8"
                  }
                  onClick={() => {
                    this.setState({
                      activeRecipes: allRecipes,
                      previewRecipeLocation: undefined,
                      activePost: undefined
                    });
                  }}
                >
                  All Templates
                </GIContainer>
              </GIContainer>
              <GIContainer className="recipes-container-container">
                {loading && (
                  <GIContainer className="x-fill full-center">
                    <LoaderSimpleCircle />
                  </GIContainer>
                )}
                {recipeArray}
              </GIContainer>

              {promptDeleteRecipe && (
                <ConfirmAlert
                  close={() => this.setState({ promptDeleteRecipe: false })}
                  title="Delete Recipe"
                  message="Are you sure you want to delete this recipe?"
                  callback={this.deleteRecipe}
                />
              )}
            </GIContainer>
          </GIContainer>
        }
        className="modal"
        close={() => handleParentChange({ templatesModal: false })}
      />
    );
  }
}
function mapStateToProps(state) {
  return {
    user: state.user,
    getKeyListenerFunction: state.getKeyListenerFunction
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      setKeyListenerFunction
    },
    dispatch
  );
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TemplatesModal);
