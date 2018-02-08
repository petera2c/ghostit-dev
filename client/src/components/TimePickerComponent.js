import React, { Component } from "react";
import "../css/theme.css";

import TimePicker from "material-ui/TimePicker";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from "material-ui/styles/getMuiTheme";

const muiTheme = getMuiTheme({
    fontFamily: "Open Sans",
    palette: {
        primary1Color: "var(--blue-theme-color)",
        primary2Color: "var(--blue-theme-color)",
        primary3Color: "var(--blue-theme-color)",
        pickerHeaderColor: "var(--blue-theme-color)",
        textColor: "#000",
        borderColor: "#000"
    }
});

class TimePickerComponent extends Component {
    render() {
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <TimePicker hintText="Click here to pick Time!" autoOk={true} />
            </MuiThemeProvider>
        );
    }
}

export default TimePickerComponent;
