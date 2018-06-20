import React, { Component } from "react";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faFacebook from "@fortawesome/fontawesome-free-brands/faFacebookSquare";
import faLinkedin from "@fortawesome/fontawesome-free-brands/faLinkedin";
import faTwitter from "@fortawesome/fontawesome-free-brands/faTwitterSquare";
import faTrash from "@fortawesome/fontawesome-free-solid/faTrash";

import "./styles/";

class SelectAccountDiv extends Component {
	render() {
		let accountsListDiv = [];
		const { activePageAccountsArray, activeAccount, setActiveAccount, canEdit } = this.props;
		// To select which account to post to
		for (let index in activePageAccountsArray) {
			let name;
			let account = activePageAccountsArray[index];

			if (account.givenName) name = account.givenName.charAt(0).toUpperCase() + account.givenName.slice(1);
			if (account.familyName) name += " " + account.familyName.charAt(0).toUpperCase() + account.familyName.slice(1);
			if (account.username) name = account.username;

			let className = "account-container";

			if (activeAccount === String(account._id)) {
				className += " common-active";
			}
			// Push div to array
			let icon = faFacebook;
			let color = "#4267b2";
			if (account.socialType === "twitter") {
				icon = faTwitter;
				color = "#1da1f2";
			} else if (account.socialType === "linkedin") {
				icon = faLinkedin;
				color = "#0077b5";
			}
			accountsListDiv.push(
				<div className={className} onClick={event => setActiveAccount(account)} key={index}>
					<span className="account-icon">
						<FontAwesomeIcon icon={icon} size="3x" color={color} />
					</span>
					<div className="account-title-type-container">
						<div className="account-name">{name}</div>
						<div className="account-type">{account.accountType}</div>
					</div>
				</div>
			);
		}
		return (
			<div className="select-accounts-container">
				{canEdit && <h4 className="select-accounts-header">Choose an account to post to!</h4>}
				<div className="accounts-container">{accountsListDiv}</div>
			</div>
		);
	}
}
export default SelectAccountDiv;
