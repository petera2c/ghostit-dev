import React from "react";

export const hiddenFormPortion = (
  <div
    style={{ position: "absolute", left: "-5000px" }}
    aria-hidden="true"
    aria-label="Please leave the following three fields empty"
  >
    <label htmlFor="b_name">Name: </label>
    <input
      type="text"
      name="b_name"
      tabIndex="-1"
      value=""
      placeholder="Freddie"
      id="b_name"
      readOnly={true}
    />

    <label htmlFor="b_email">Email: </label>
    <input
      type="email"
      name="b_email"
      tabIndex="-1"
      value=""
      placeholder="youremail@gmail.com"
      id="b_email"
      readOnly={true}
    />

    <label htmlFor="b_comment">Comment: </label>
    <textarea
      name="b_comment"
      tabIndex="-1"
      placeholder="Please comment"
      id="b_comment"
      readOnly={true}
    />
  </div>
);
