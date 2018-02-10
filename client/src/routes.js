import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Content from "./pages/ContentPage";

class Routes extends Component {
    render() {
        return (
            <BrowserRouter>
                <div>
                    <Route path="/" exact={true} component={LoginPage} />
                    <Route path="/content" exact={true} component={Content} />
                </div>
            </BrowserRouter>
        );
    }
}

export default Routes;
