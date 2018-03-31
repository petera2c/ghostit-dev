import React, { Component } from "react";

import NonEditableAttribute from "./NonEditableAttribute";
import EditableAttribute from "./EditableAttribute";
import DropdownAttribute from "./DropdownAttribute";

class ObjectEditTable extends Component {
	state = {
		updatedObject: undefined
	};
	constructor(props) {
		super(props);

		this.updateObject = this.updateObject.bind(this);
	}

	updateObject(index, value, id) {
		let object = this.props.clickedObject;
		if (id) {
			object[index].id = id;
			object[index].name = value;
		} else {
			object[index] = value;
		}
		this.setState({ updatedObject: object });
	}

	render() {
		let objectArray = this.props.objectArray;
		let attributes = [];
		for (let index in objectArray) {
			if (objectArray[index].dropdown && !this.props.editting) {
				attributes.push(
					<DropdownAttribute
						key={index}
						label={objectArray[index].index}
						value={objectArray[index].value}
						dropdownList={objectArray[index].dropdownList}
						updateParentState={this.updateObject}
					/>
				);
			} else if (objectArray[index].canEdit && !this.props.editting) {
				attributes.push(
					<EditableAttribute
						key={index}
						label={objectArray[index].index}
						value={objectArray[index].value}
						updateParentState={this.updateObject}
					/>
				);
			} else {
				attributes.push(
					<NonEditableAttribute key={index} label={objectArray[index].index} value={objectArray[index].value} />
				);
			}
		}
		let buttons;
		if (this.props.clickedObject) {
			buttons = (
				<div>
					{this.props.editting && (
						<button
							id="edittingButton"
							onClick={this.props.editObject}
							className="fa fa-edit fa-2x margin-auto center"
						/>
					)}

					{!this.props.editting && (
						<button
							id="saveButton"
							onClick={() => this.props.saveObject(this.state.updatedObject)}
							className="fa fa-check fa-2x margin-auto center"
						/>
					)}
					{!this.props.editting && (
						<button
							id="cancelButton"
							onClick={this.props.editObject}
							className="fa fa-times fa-2x margin-auto center"
						/>
					)}
				</div>
			);
		}

		return (
			<div className="clicked-user-options">
				{attributes}
				{buttons}
			</div>
		);
	}
}
export default ObjectEditTable;
