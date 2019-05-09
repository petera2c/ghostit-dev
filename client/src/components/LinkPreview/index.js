import React, { Component } from "react";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faLongArrowAltLeft from "@fortawesome/fontawesome-free-solid/faLongArrowAltLeft";
import faLongArrowAltRight from "@fortawesome/fontawesome-free-solid/faLongArrowAltRight";

import ContentEditable from "react-contenteditable";

import GIContainer from "../containers/GIContainer";

import FileUpload from "../views/FileUpload";
import "./style.css";

class LinkPreview extends Component {
  state = { activeImageIndex: 0 };

  componentWillReceiveProps(nextProps) {
    if (nextProps.link !== this.props.link)
      this.setState({ activeImageIndex: 0 });
  }
  changeImage = increment => {
    let { activeImageIndex } = this.state;
    const { linkCustomFiles = [], linkImagesArray = [] } = this.props; // Variables
    const { handleChange } = this.props; // Functions
    activeImageIndex += increment;

    if (activeImageIndex >= linkImagesArray.length + linkCustomFiles.length)
      activeImageIndex = 0;
    else if (activeImageIndex < 0) {
      activeImageIndex = linkImagesArray.length + linkCustomFiles.length - 1;
    }

    handleChange(linkImagesArray[activeImageIndex]);
    this.setState({ activeImageIndex });
  };
  shortenLinkDescriptionIfNeeded = linkDescription => {
    if (linkDescription) {
      if (linkDescription.length > 100)
        return linkDescription.substring(0, 100) + "...";
      else return linkDescription;
    } else return linkDescription;
  };
  render() {
    const { activeImageIndex } = this.state;
    const {
      canAddFilesToLink,
      canEdit,
      className,
      linkCustomFiles = [],
      linkDescription,
      linkImagesArray = [],
      linkPreviewCanEdit,
      linkTitle
    } = this.props; // Variables
    const { handleChange, setCustomImages } = this.props; // Functions

    const linkImagesToDisplay = linkCustomFiles.concat(linkImagesArray);

    const smartLinkDescription = this.shortenLinkDescriptionIfNeeded(
      linkDescription
    );
    let urlImageToDisplay = linkImagesToDisplay[activeImageIndex];
    if (urlImageToDisplay)
      if (urlImageToDisplay.url) urlImageToDisplay = urlImageToDisplay.url;
    return (
      <div className={className}>
        <div
          id="link-preview-container"
          className="common-shadow"
          style={
            linkImagesToDisplay[activeImageIndex]
              ? {
                  backgroundImage: "url(" + urlImageToDisplay + ")"
                }
              : {}
          }
        >
          <GIContainer className="absolute x-fill y-fill column">
            {canAddFilesToLink && (
              <GIContainer className="full-center fill-flex file-upload-on-file">
                <FileUpload
                  canEdit={canEdit}
                  className=""
                  currentFiles={[]}
                  handleParentChange={filesObject => {
                    if (filesObject.files)
                      if (filesObject.files[0]) {
                        linkImagesArray.unshift(filesObject.files[0].file);

                        setCustomImages(linkImagesArray);
                      }
                  }}
                  fileLimit={1}
                  filesToDelete={[]}
                  id="fdhs"
                  imageClassName="flex image tiny"
                  imageOnly={true}
                />
              </GIContainer>
            )}
            {linkPreviewCanEdit && (
              <GIContainer className="px16 bg-grey">
                <FontAwesomeIcon
                  icon={faLongArrowAltLeft}
                  size="2x"
                  className="icon-regular-button"
                  onClick={() => this.changeImage(-1)}
                />
                <div className="fill-flex" />
                <FontAwesomeIcon
                  icon={faLongArrowAltRight}
                  size="2x"
                  className="icon-regular-button"
                  onClick={() => this.changeImage(1)}
                />
              </GIContainer>
            )}
          </GIContainer>
        </div>
        <div className="simple-container py4">
          <ContentEditable
            className="simple-container medium pa4"
            disabled={true}
            html={("<h4>" + linkTitle + "</h4>").toString()}
            innerRef={this.contentEditable}
            onChange={e => handleChange(e.target.value)}
          />

          <ContentEditable
            className="simple-container medium pa4"
            disabled={true}
            html={("<p>" + smartLinkDescription + "</p>").toString()}
            innerRef={this.contentEditable}
            onChange={e => handleChange(e.target.value)}
          />
        </div>
      </div>
    );
  }
}

export default LinkPreview;
