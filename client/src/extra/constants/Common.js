export const nonEditableUserFields = [
	"_id",
	"__v",
	"password",
	"tempID",
	"stripeCustomerID",
	"stripeSubscriptionID",
	"country",
	"signedInAsUser",
	"dateCreated"
];
export const canShowUserFields = ["__v", "password", "country", "signedInAsUser"];
export const strategyFormFields = [
	"questionnaire",
	"audience",
	"styleAndStructure",
	"brandVoice",
	"content",
	"notes",
	"competitors"
];

export const postingTypes = [
	{ name: "facebook" },
	{ name: "twitter", maxCharacters: 280 },
	{ name: "linkedin", maxCharacters: 700 },
	{ name: "blog" },
	{ name: "newsletter" },
	{ name: "instagram" }
];
