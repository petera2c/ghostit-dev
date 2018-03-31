import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage/";
import Content from "./pages/ContentPage/";
import Profile from "./pages/ProfilePage/";
import Strategy from "./pages/StrategyPage/";
import Manage from "./pages/ManagePage/";
import "./css/theme.css";

class Routes extends Component {
	render() {
		return (
			<BrowserRouter>
				<div>
					<Route path="/" exact={true} component={LoginPage} />
					<Route path="/content" exact={true} component={Content} />
					<Route path="/profile" exact={true} component={Profile} />
					<Route path="/strategy" exact={true} component={Strategy} />
					<Route path="/manage" exact={true} component={Manage} />
				</div>
			</BrowserRouter>
		);
	}
}

export default Routes;
