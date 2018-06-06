const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const newsletterSchema = new Schema({
	userID: String,
	postingDate: String,
	dueDate: String,
	notes: String,
	eventColor: String,
	wordDoc: {
		url: String,
		publicID: String,
		name: String
	}
});

module.exports = mongoose.model("newsletters", newsletterSchema);
