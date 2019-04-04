import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { createStore, applyMiddleware } from "redux";
import { Provider } from "react-redux";
import reducers from "./redux/reducers/";
import { GIProvider } from "./context";

import Routes from "./pages";

import "./theme.css";

require("../public/favicon.ico");

function logger({ getState }) {
  return next => action => {
    const returnValue = next(action);
    return returnValue;
  };
}
const store = createStore(reducers, applyMiddleware(logger));

ReactDOM.render(
  <GIProvider>
    <Provider store={store}>
      <Router>
        <Routes />
      </Router>
    </Provider>
  </GIProvider>,
  document.getElementById("root")
);
