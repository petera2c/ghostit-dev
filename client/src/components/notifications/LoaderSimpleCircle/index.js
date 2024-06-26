import React, { Component } from "react";
import "./style.css";

class Loader extends Component {
	render() {
		return (
			<div className="loader-circle">
				<div className="lds-wedges2">
					<div>
						<div>
							<div />
						</div>
						<div>
							<div />
						</div>
						<div>
							<div />
						</div>
						<div>
							<div />
						</div>
					</div>
				</div>
			</div>
		);
	}
}
export default Loader;
